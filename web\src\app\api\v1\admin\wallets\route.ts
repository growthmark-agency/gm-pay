import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { data: wallets, error: wErr } = await supabaseAdmin
      .from("merchant_wallets")
      .select("id, merchant_id, provider, wallet_type, phone_number, daily_limit, monthly_limit, current_daily_total, battery_level, priority, is_active, last_health_ping, merchants(business_name)")
      .order("priority", { ascending: true });

    if (wErr) throw wErr;

    const formatted = (wallets || []).map((w: any) => ({
      id: w.id,
      merchant: w.merchants?.business_name || "GrowthMark Agency",
      provider: w.provider,
      type: w.wallet_type,
      phone: w.phone_number,
      dailyLimit: Number(w.daily_limit) || 25000,
      currentDaily: Number(w.current_daily_total) || 0,
      battery: w.battery_level !== null ? w.battery_level : 95,
      priority: w.priority || 1,
      isActive: w.is_active,
      lastPing: w.last_health_ping ? "Active" : "Ready",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
