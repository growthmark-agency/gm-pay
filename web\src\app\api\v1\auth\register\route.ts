import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { generateApiKey } from "@/lib/security/hmac";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_name, email, phone, password } = body;

    if (!business_name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "Business name, email, and phone are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = db.merchants.find((m) => m.email === cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "EMAIL_EXISTS", message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const merchantId = crypto.randomUUID();
    const apiKey = generateApiKey("gmpay_live_");
    const apiSecret = "gmpay_sec_" + crypto.randomBytes(24).toString("hex");
    const sandboxKey = generateApiKey("gmpay_test_");
    const webhookSecret = "whsec_" + crypto.randomBytes(20).toString("hex");

    const newMerchant = {
      id: merchantId,
      businessName: business_name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      apiKey,
      apiSecret,
      sandboxKey,
      webhookUrl: "",
      webhookSecret,
      telegramEnabled: false,
      planTier: "FREE" as const,
      status: "ACTIVE" as const,
    };

    db.merchants.push(newMerchant);

    // Auto provision default primary bKash wallet
    const walletId = crypto.randomUUID();
    db.wallets.push({
      id: walletId,
      merchantId: merchantId,
      provider: "BKASH",
      walletType: "PERSONAL",
      phoneNumber: phone.trim(),
      accountName: `${business_name.trim()} bKash`,
      dailyLimit: 25000,
      monthlyLimit: 100000,
      currentDailyTotal: 0,
      currentMonthlyTotal: 0,
      dailyTxnCount: 0,
      maxDailyTxnCount: 50,
      priority: 1,
      isActive: true,
      batteryLevel: 100,
    });

    return NextResponse.json({
      success: true,
      message: "Merchant account successfully registered and provisioned!",
      data: {
        merchant_id: merchantId,
        business_name: newMerchant.businessName,
        email: newMerchant.email,
        api_key: apiKey,
        sandbox_key: sandboxKey,
        webhook_secret: webhookSecret,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: error?.message || "Registration failed" },
      { status: 500 }
    );
  }
}
