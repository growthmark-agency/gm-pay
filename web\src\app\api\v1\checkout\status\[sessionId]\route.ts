import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "sessionId is required" },
        { status: 400 }
      );
    }

    // Fetch session from Supabase
    const { data: session, error: sErr } = await supabaseAdmin
      .from("payment_sessions")
      .select("*, merchant_wallets(*), merchants(business_name)")
      .eq("id", sessionId)
      .limit(1)
      .single();

    if (sErr || !session) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND", message: "Payment session does not exist or has expired." },
        { status: 404 }
      );
    }

    const wallet = session.merchant_wallets;
    const isExpired = new Date(session.expires_at) < new Date() && session.status === "PENDING";

    if (isExpired) {
      await supabaseAdmin
        .from("payment_sessions")
        .update({ status: "EXPIRED", updated_at: new Date().toISOString() })
        .eq("id", session.id);
      session.status = "EXPIRED";
    }

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        order_id: session.order_id,
        merchant_name: session.merchants?.business_name || "GrowthMark Merchant",
        amount: Number(session.amount),
        currency: session.currency || "BDT",
        provider: session.provider,
        payment_method: session.payment_method || "SEND_MONEY",
        payment_number: wallet ? wallet.phone_number : "01812345678",
        account_name: wallet ? wallet.account_name : "Merchant Account",
        qr_code_url: wallet?.qr_code_url,
        customer_name: session.customer_name,
        customer_phone: session.customer_phone,
        status: session.status,
        submitted_trx_id: session.submitted_trx_id,
        redirect_url: session.redirect_url,
        expires_at: session.expires_at,
        completed_at: session.completed_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to fetch status" },
      { status: 500 }
    );
  }
}
