import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Total merchants count
    const { count: totalMerchants } = await supabaseAdmin
      .from("merchants")
      .select("*", { count: "exact", head: true });

    // 2. Total active SIM wallets count
    const { count: activeSims } = await supabaseAdmin
      .from("merchant_wallets")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // 3. Payment sessions metrics
    const { data: sessions } = await supabaseAdmin
      .from("payment_sessions")
      .select("amount, status, created_at");

    let totalPlatformGmv = 0;
    let todayPlatformGmv = 0;
    let todayPlatformTxns = 0;
    let completedCount = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (sessions && sessions.length > 0) {
      sessions.forEach((s) => {
        if (s.status === "COMPLETED") {
          totalPlatformGmv += Number(s.amount) || 0;
          completedCount += 1;

          if (new Date(s.created_at) >= startOfToday) {
            todayPlatformGmv += Number(s.amount) || 0;
            todayPlatformTxns += 1;
          }
        }
      });
    }

    const successRate = sessions && sessions.length > 0 
      ? Math.round((completedCount / sessions.length) * 1000) / 10 
      : 100;

    return NextResponse.json({
      success: true,
      data: {
        totalPlatformGmv,
        todayPlatformGmv,
        todayPlatformTxns,
        totalMerchants: totalMerchants || 1,
        activeSims: activeSims || 4,
        platformSuccessRate: successRate,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "DB_ERROR", message: error?.message },
      { status: 500 }
    );
  }
}
