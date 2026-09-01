import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-api-key");
    const apiKey = authHeader?.replace("Bearer ", "").trim();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "API Key is required in Authorization header." },
        { status: 401 }
      );
    }

    // 1. Authenticate Merchant in Supabase
    const { data: merchant, error: mErr } = await supabaseAdmin
      .from("merchants")
      .select("*")
      .or(`api_key.eq.${apiKey},sandbox_key.eq.${apiKey}`)
      .limit(1)
      .single();

    if (mErr || !merchant) {
      return NextResponse.json(
        { success: false, error: "INVALID_CREDENTIALS", message: "Invalid API key provided." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      amount,
      order_id,
      customer_name,
      customer_phone,
      customer_email,
      provider,
      redirect_url,
      cancel_url,
      currency,
    } = body;

    if (!amount || amount <= 0 || !order_id || !provider) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "amount, order_id, and provider (BKASH/NAGAD/ROCKET) are required." },
        { status: 400 }
      );
    }

    const cleanProvider = provider.toUpperCase();

    // 2. Select Available SIM Wallet with Auto-Failover (Using Stored Procedure or Query)
    const { data: availableWallets } = await supabaseAdmin
      .from("merchant_wallets")
      .select("*")
      .eq("merchant_id", merchant.id)
      .eq("provider", cleanProvider)
      .eq("is_active", true)
      .order("priority", { ascending: true })
      .limit(1);

    const assignedWallet = availableWallets && availableWallets.length > 0 ? availableWallets[0] : null;

    if (!assignedWallet) {
      return NextResponse.json(
        {
          success: false,
          error: "NO_ACTIVE_WALLET",
          message: `No active ${cleanProvider} SIM wallet found. Please configure a wallet in your GM Pay dashboard.`,
        },
        { status: 503 }
      );
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 20 * 60000).toISOString();

    // 3. Create Payment Session in Supabase
    const { data: session, error: sErr } = await supabaseAdmin
      .from("payment_sessions")
      .insert({
        id: sessionId,
        merchant_id: merchant.id,
        assigned_wallet_id: assignedWallet.id,
        order_id: String(order_id),
        customer_name: customer_name || "",
        customer_phone: customer_phone || "",
        customer_email: customer_email || "",
        amount: parseFloat(amount),
        currency: currency || "BDT",
        provider: cleanProvider,
        payment_method: assignedWallet.wallet_type === "MERCHANT" ? "PAYMENT" : "SEND_MONEY",
        status: "PENDING",
        redirect_url: redirect_url || merchant.webhook_url,
        cancel_url: cancel_url || "",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (sErr) throw sErr;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gmpay.growthmark.pro";
    const checkoutUrl = `${baseUrl}/checkout/${sessionId}`;

    return NextResponse.json({
      success: true,
      data: {
        session_id: sessionId,
        checkout_url: checkoutUrl,
        amount: parseFloat(amount),
        currency: currency || "BDT",
        order_id: String(order_id),
        provider: cleanProvider,
        payment_number: assignedWallet.phone_number,
        payment_method: assignedWallet.wallet_type === "MERCHANT" ? "PAYMENT" : "SEND_MONEY",
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
