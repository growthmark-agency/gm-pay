import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { data: merchants, error: mErr } = await supabaseAdmin
      .from("merchants")
      .select("id, business_name, email, phone, api_key, plan_tier, status, created_at")
      .order("created_at", { ascending: false });

    if (mErr) throw mErr;

    // Enrich with wallets count & volume
    const { data: wallets } = await supabaseAdmin
      .from("merchant_wallets")
      .select("merchant_id, current_monthly_total");

    const enriched = (merchants || []).map((m) => {
      const merchantWallets = (wallets || []).filter((w) => w.merchant_id === m.id);
      const totalVolume = merchantWallets.reduce((acc, w) => acc + (Number(w.current_monthly_total) || 0), 0);

      return {
        id: m.id,
        name: m.business_name,
        email: m.email,
        phone: m.phone || "N/A",
        plan: m.plan_tier || "PRO",
        walletsCount: merchantWallets.length,
        volume: totalVolume,
        apiKey: m.api_key,
        status: m.status || "ACTIVE",
        joined: m.created_at ? new Date(m.created_at).toISOString().split("T")[0] : "2026-09-01",
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchant_id, plan_tier, status } = body;

    if (!merchant_id) {
      return NextResponse.json({ success: false, message: "merchant_id required" }, { status: 400 });
    }

    const updates: any = {};
    if (plan_tier) updates.plan_tier = plan_tier;
    if (status) updates.status = status;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("merchants")
      .update(updates)
      .eq("id", merchant_id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
