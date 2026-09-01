import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan_name, price, customer_name, customer_email, customer_phone } = body;

    const cleanPrice = parseFloat(price) || 499;
    const planName = plan_name || "GM Pay SaaS Subscription";

    // 1. Get primary merchant wallet for GrowthMark Agency HQ
    const { data: primaryWallet, error: wErr } = await supabaseAdmin
      .from("merchant_wallets")
      .select("*")
      .eq("merchant_id", "a0000000-0000-0000-0000-000000000001")
      .eq("provider", "BKASH")
      .eq("is_active", true)
      .limit(1)
      .single();

    const sessionId = crypto.randomUUID();
    const orderId = "SUB-" + Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 20 * 60000).toISOString();

    // 2. Insert payment session in Supabase
    const { data: session, error: sErr } = await supabaseAdmin
      .from("payment_sessions")
      .insert({
        id: sessionId,
        merchant_id: "a0000000-0000-0000-0000-000000000001",
        assigned_wallet_id: primaryWallet?.id || "b0000000-0000-0000-0000-000000000001",
        order_id: orderId,
        customer_name: customer_name || "New Merchant",
        customer_email: customer_email || "",
        customer_phone: customer_phone || "",
        amount: cleanPrice,
        currency: "BDT",
        provider: "BKASH",
        payment_method: "SEND_MONEY",
        status: "PENDING",
        redirect_url: "https://gmpay.growthmark.pro/register",
        cancel_url: "https://gmpay.growthmark.pro",
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
        order_id: orderId,
        amount: cleanPrice,
        plan_name: planName,
        payment_number: primaryWallet?.phone_number || "01812345678",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
