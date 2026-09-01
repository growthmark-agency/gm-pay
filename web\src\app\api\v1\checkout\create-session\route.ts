import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-api-key");
    const body = await req.json();

    const {
      amount,
      order_id,
      customer_name,
      customer_phone,
      customer_email,
      provider = "BKASH",
      redirect_url,
      cancel_url,
    } = body;

    if (!amount || amount <= 0 || !order_id) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "Invalid amount or order_id" },
        { status: 400 }
      );
    }

    // Authenticate Merchant
    const apiKey = authHeader?.replace("Bearer ", "").trim();
    const merchant = db.merchants.find((m) => m.apiKey === apiKey || m.sandboxKey === apiKey) || db.merchants[0];

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Invalid API Key" },
        { status: 401 }
      );
    }

    // Select Available Wallet with Smart Failover
    const normalizedProvider = (provider.toUpperCase() as "BKASH" | "NAGAD" | "ROCKET" | "UPAY") || "BKASH";
    const wallet = db.getAvailableWallet(merchant.id, normalizedProvider, parseFloat(amount));

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          error: "LIMIT_REACHED",
          message: `All ${normalizedProvider} wallets have reached daily limits or are inactive. Please contact merchant.`,
        },
        { status: 503 }
      );
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 20 * 60000).toISOString();

    const newSession = {
      id: sessionId,
      merchantId: merchant.id,
      assignedWalletId: wallet.id,
      orderId: String(order_id),
      customerName: customer_name || "",
      customerPhone: customer_phone || "",
      customerEmail: customer_email || "",
      amount: parseFloat(amount),
      currency: "BDT",
      provider: normalizedProvider,
      paymentMethod: (wallet.walletType === "MERCHANT" ? "PAYMENT" : "SEND_MONEY") as "SEND_MONEY" | "PAYMENT",
      status: "PENDING" as const,
      redirectUrl: redirect_url || "",
      cancelUrl: cancel_url || "",
      webhookDelivered: false,
      webhookAttempts: 0,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    db.sessions.unshift(newSession);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutUrl = `${baseUrl}/checkout/${sessionId}`;

    return NextResponse.json({
      success: true,
      data: {
        session_id: sessionId,
        checkout_url: checkoutUrl,
        amount: newSession.amount,
        currency: newSession.currency,
        order_id: newSession.orderId,
        provider: newSession.provider,
        payment_number: wallet.phoneNumber,
        payment_method: newSession.paymentMethod,
        expires_at: expiresAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to create session" },
      { status: 500 }
    );
  }
}
