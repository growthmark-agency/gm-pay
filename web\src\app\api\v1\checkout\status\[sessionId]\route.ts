import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = db.sessions.find((s) => s.id === sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND", message: "Session not found" },
        { status: 404 }
      );
    }

    const wallet = db.wallets.find((w) => w.id === session.assignedWalletId);

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        order_id: session.orderId,
        amount: session.amount,
        currency: session.currency,
        provider: session.provider,
        payment_method: session.paymentMethod,
        payment_number: wallet ? wallet.phoneNumber : "",
        account_name: wallet ? wallet.accountName : "",
        qr_code_url: wallet?.qrCodeUrl,
        customer_name: session.customerName,
        customer_phone: session.customerPhone,
        status: session.status,
        submitted_trx_id: session.submittedTrxId,
        redirect_url: session.redirectUrl,
        expires_at: session.expiresAt,
        completed_at: session.completedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to fetch status" },
      { status: 500 }
    );
  }
}
