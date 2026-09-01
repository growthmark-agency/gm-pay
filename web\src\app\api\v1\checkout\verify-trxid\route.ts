import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { generateWebhookSignature } from "@/lib/security/hmac";
import { sendTelegramPaymentNotification } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, trx_id, provider } = body;

    if (!session_id || !trx_id) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "session_id and trx_id are required" },
        { status: 400 }
      );
    }

    const cleanTrx = trx_id.trim().toUpperCase();
    const session = db.sessions.find((s) => s.id === session_id);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "SESSION_NOT_FOUND", message: "Payment session not found" },
        { status: 404 }
      );
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        message: "Payment is already verified and completed.",
        data: {
          session_id: session.id,
          order_id: session.orderId,
          amount: session.amount,
          trx_id: session.submittedTrxId,
          redirect_url: session.redirectUrl,
        },
      });
    }

    if (new Date(session.expiresAt) < new Date()) {
      session.status = "EXPIRED";
      return NextResponse.json(
        { success: false, error: "SESSION_EXPIRED", message: "Payment session has expired." },
        { status: 410 }
      );
    }

    // Lookup TrxID in raw transaction pool
    const rawTx = db.rawTransactions.find(
      (tx) =>
        tx.merchantId === session.merchantId &&
        tx.trxId === cleanTrx &&
        (provider ? tx.provider === provider.toUpperCase() : true)
    );

    // Case 1: SMS not received yet from mobile network
    if (!rawTx) {
      session.submittedTrxId = cleanTrx;
      return NextResponse.json({
        success: false,
        error: "PENDING_SMS_INGESTION",
        message: "Transaction ID recorded! Waiting for SMS confirmation from mobile operator...",
        status: "PENDING",
      });
    }

    // Case 2: Already matched/used for another order (Anti-Fraud / Anti-Replay)
    if (rawTx.isMatched && rawTx.matchedSessionId !== session.id) {
      return NextResponse.json(
        {
          success: false,
          error: "TRX_ALREADY_USED",
          message: "This Transaction ID has already been verified for another transaction.",
        },
        { status: 409 }
      );
    }

    // Case 3: Amount mismatch
    if (rawTx.amount < session.amount) {
      return NextResponse.json(
        {
          success: false,
          error: "INSUFFICIENT_AMOUNT",
          message: `Paid amount (৳${rawTx.amount}) is less than required order amount (৳${session.amount}).`,
        },
        { status: 400 }
      );
    }

    // Case 4: SUCCESS! Lock & Mark Completed
    rawTx.isMatched = true;
    rawTx.matchedSessionId = session.id;

    session.status = "COMPLETED";
    session.submittedTrxId = cleanTrx;
    session.matchedRawId = rawTx.id;
    session.completedAt = new Date().toISOString();

    // Increment wallet statistics
    if (session.assignedWalletId) {
      const wallet = db.wallets.find((w) => w.id === session.assignedWalletId);
      if (wallet) {
        wallet.currentDailyTotal += session.amount;
        wallet.currentMonthlyTotal += session.amount;
        wallet.dailyTxnCount += 1;
      }
    }

    // Merchant details
    const merchant = db.merchants.find((m) => m.id === session.merchantId);

    // 1. Dispatch Asynchronous Webhook with HMAC Signature
    if (merchant && merchant.webhookUrl) {
      const webhookPayload = {
        event: "payment.completed",
        order_id: session.orderId,
        session_id: session.id,
        amount: session.amount,
        currency: session.currency,
        provider: session.provider,
        trx_id: cleanTrx,
        customer_phone: session.customerPhone,
        completed_at: session.completedAt,
      };

      const signature = generateWebhookSignature(webhookPayload, merchant.webhookSecret);

      fetch(merchant.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GM-Pay-Signature": signature,
          "User-Agent": "GM-Pay-Webhook-Engine/1.0",
        },
        body: JSON.stringify(webhookPayload),
      })
        .then((res) => {
          session.webhookDelivered = res.ok;
          session.webhookAttempts += 1;
        })
        .catch((err) => {
          console.error("Webhook dispatch failed:", err);
          session.webhookAttempts += 1;
        });
    }

    // 2. Dispatch Telegram Alert if configured
    if (merchant && merchant.telegramEnabled && merchant.telegramBotToken && merchant.telegramChatId) {
      const wallet = db.wallets.find((w) => w.id === session.assignedWalletId);
      sendTelegramPaymentNotification({
        botToken: merchant.telegramBotToken,
        chatId: merchant.telegramChatId,
        orderId: session.orderId,
        amount: session.amount,
        provider: session.provider,
        trxId: cleanTrx,
        customerName: session.customerName,
        customerPhone: session.customerPhone,
        receiverWallet: wallet?.phoneNumber,
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      status: "COMPLETED",
      message: "Payment successfully verified and completed!",
      data: {
        session_id: session.id,
        order_id: session.orderId,
        amount: session.amount,
        trx_id: cleanTrx,
        sender_number: rawTx.senderNumber,
        redirect_url: session.redirectUrl,
        completed_at: session.completedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: error?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
