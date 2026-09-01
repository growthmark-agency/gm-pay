import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-device-token") || req.headers.get("authorization");
    const body = await req.json();
    const { device_id, battery_level, phone_numbers } = body;

    const apiKey = authHeader?.replace("Bearer ", "").trim();
    const merchant = db.merchants.find((m) => m.apiKey === apiKey || m.sandboxKey === apiKey) || db.merchants[0];

    if (!merchant) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    // Update health and battery for merchant's wallets
    db.wallets.forEach((w) => {
      if (w.merchantId === merchant.id) {
        w.lastHealthPing = new Date().toISOString();
        if (battery_level !== undefined) w.batteryLevel = parseInt(battery_level);
        if (device_id) (w as any).deviceId = device_id;
      }
    });

    return NextResponse.json({
      success: true,
      message: "Heartbeat acknowledged",
      server_time: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
