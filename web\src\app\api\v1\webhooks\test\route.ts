import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-gm-pay-signature");
    const body = await req.json();

    console.log("🔔 [SANDBOX TEST WEBHOOK RECEIVED]");
    console.log("Signature:", signature);
    console.log("Payload:", JSON.stringify(body, null, 2));

    return NextResponse.json({
      success: true,
      message: "Webhook successfully received and verified by merchant endpoint simulator!",
      received_payload: body,
      received_signature: signature,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 400 });
  }
}
