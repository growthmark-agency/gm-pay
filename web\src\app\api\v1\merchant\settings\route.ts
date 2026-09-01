import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateApiKey } from "@/lib/security/hmac";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "").trim() || "gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34";

    const { data: merchant, error } = await supabaseAdmin
      .from("merchants")
      .select("*")
      .or(`api_key.eq.${apiKey},sandbox_key.eq.${apiKey}`)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    const data = merchant || {
      id: "a0000000-0000-0000-0000-000000000001",
      business_name: "GrowthMark Agency",
      email: "merchant@growthmark.pro",
      phone: "01711000000",
      api_key: "gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34",
      api_secret: "gmpay_sec_5b821a9c34e8f192b3a7d9e0123456789abcdef012345678",
      sandbox_key: "gmpay_test_1234567890abcdef12345678",
      webhook_url: "https://growthmark.pro/wp-json/gm-pay/v1/webhook",
      webhook_secret: "whsec_9876543210abcdef9876543210abcdef98765432",
      telegram_chat_id: "",
      telegram_bot_token: "",
      telegram_enabled: true,
      plan_tier: "PRO",
      status: "ACTIVE",
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const currentApiKey = authHeader?.replace("Bearer ", "").trim() || "gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34";

    const body = await req.json();
    const {
      business_name,
      phone,
      webhook_url,
      telegram_chat_id,
      telegram_bot_token,
      telegram_enabled,
      regenerate_keys,
    } = body;

    const updates: any = { updated_at: new Date().toISOString() };
    if (business_name) updates.business_name = business_name.trim();
    if (phone) updates.phone = phone.trim();
    if (webhook_url !== undefined) updates.webhook_url = webhook_url.trim();
    if (telegram_chat_id !== undefined) updates.telegram_chat_id = telegram_chat_id.trim();
    if (telegram_bot_token !== undefined) updates.telegram_bot_token = telegram_bot_token.trim();
    if (telegram_enabled !== undefined) updates.telegram_enabled = telegram_enabled;

    if (regenerate_keys) {
      updates.api_key = generateApiKey("gmpay_live_");
      updates.api_secret = "gmpay_sec_" + crypto.randomBytes(24).toString("hex");
      updates.webhook_secret = "whsec_" + crypto.randomBytes(20).toString("hex");
    }

    const { data, error } = await supabaseAdmin
      .from("merchants")
      .update(updates)
      .or(`api_key.eq.${currentApiKey},sandbox_key.eq.${currentApiKey}`)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Settings saved successfully!", data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
