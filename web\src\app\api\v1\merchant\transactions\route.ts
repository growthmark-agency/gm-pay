import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "").trim() || "gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34";

    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("id")
      .or(`api_key.eq.${apiKey},sandbox_key.eq.${apiKey}`)
      .limit(1)
      .single();

    const merchantId = merchant?.id || "a0000000-0000-0000-0000-000000000001";

    const { data: sessions, error } = await supabaseAdmin
      .from("payment_sessions")
      .select("*, merchant_wallets(phone_number)")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = (sessions || []).map((s: any) => ({
      id: s.id,
      orderId: s.order_id,
      provider: s.provider,
      trxId: s.submitted_trx_id || "PENDING",
      amount: Number(s.amount) || 0,
      customerPhone: s.customer_phone || "N/A",
      receiverWallet: s.merchant_wallets?.phone_number || "Primary SIM",
      status: s.status,
      webhookDelivered: s.webhook_delivered,
      time: s.created_at,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
