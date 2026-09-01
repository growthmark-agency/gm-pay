import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { data: logs, error } = await supabaseAdmin
      .from("fraud_logs")
      .select("id, trx_id, ip_address, reason, is_blocked, created_at, merchants(business_name)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = (logs || []).map((l: any) => ({
      id: l.id,
      merchant: l.merchants?.business_name || "GrowthMark Agency",
      trxId: l.trx_id || "N/A",
      ipAddress: l.ip_address || "103.230.106.12",
      reason: l.reason || "Suspicious transaction attempt",
      isBlocked: l.is_blocked,
      time: l.created_at,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { log_id, is_blocked } = body;

    const { data, error } = await supabaseAdmin
      .from("fraud_logs")
      .update({ is_blocked })
      .eq("id", log_id)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
