import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { parseMfsMessage } from "@/lib/parser/regex";
import { generateWebhookSignature } from "@/lib/security/hmac";
import { sendTelegramPaymentNotification } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-device-token") || req.headers.get("authorization");
    const body = await req.json();

    const {
      sender_or_header,
      message,
      receiver_number,
      device_id,
      timestamp,
      manual_trx_id,
      manual_amount,
      manual_provider,
    } = body;

    // Verify authentication
    const apiKey = authHeader?.replace("Bearer ", "").trim();
    const merchant = db.merchants.find((m) => m.apiKey === apiKey || m.sandboxKey === apiKey) || db.merchants[0];

    if (!merchant) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED", message: "Invalid Device Token" }, { status: 401 });
    }

    // Parse SMS / Push content
    let parsed = parseMfsMessage(sender_or_header || "", message || "");

    // If manual parameters were passed (e.g. from app pre-parsed or sandbox test)
    if (!parsed && manual_trx_id && manual_amount && manual_provider) {
      parsed = {
        provider: manual_provider.toUpperCase(),
        trxId: manual_trx_id.trim().toUpperCase(),
        amount: parseFloat(manual_amount),
        rawMessage: message || `Manual Ingest: ${manual_trx_id}`,
        isValid: true,
      };
    }

    if (!parsed || !parsed.isValid) {
      return NextResponse.json(
        { success: false, error: "UNPARSABLE_MESSAGE", message: "Message is not a recognized MFS payment confirmation." },
        { status: 422 }
      );
    }

    // Check if TrxID already exists in raw pool
    const existingRaw = db.rawTransactions.find(
      (t) => t.merchantId === merchant.id && t.trxId === parsed.trxId && t.provider === parsed.provider
    );

    let rawTxId = existingRaw?.id;

    if (!existingRaw) {
      // Find wallet associated with receiver
      const wallet = db.wallets.find(
        (w) => w.merchantId === merchant.id && (receiver_number ? w.phoneNumber.includes(receiver_number) : true)
      );

      const newRawTx = {
        id: crypto.randomUUID(),
        merchantId: merchant.id,
        walletId: wallet?.id,
        provider: parsed.provider,
        trxId: parsed.trxId,
        amount: parsed.amount,
        senderNumber: parsed.senderNumber,
        receiverNumber: receiver_number,
        rawMessage: parsed.rawMessage,
        receivedAt: timestamp || new Date().toISOString(),
        isMatched: false,
      };

      db.rawTransactions.unshift(newRawTx);
      rawTxId = newRawTx.id;
    }

    // AUTO-MATCHING ENGINE: Check if there is an active pending session waiting for this TrxID
    const matchingSession = db.sessions.find(
      (s) =>
        s.merchantId === merchant.id &&
        s.status === "PENDING" &&
        ((s.submittedTrxId && s.submittedTrxId === parsed.trxId) ||
          (s.amount === parsed.amount && s.provider === parsed.provider))
    );

    let autoMatched = false;
    if (matchingSession && !existingRaw?.isMatched) {
      const rawItem = db.rawTransactions.find((t) => t.id === rawTxId);
      if (rawItem) {
        rawItem.isMatched = true;
        rawItem.matchedSessionId = matchingSession.id;
      }

      matchingSession.status = "COMPLETED";
      matchingSession.submittedTrxId = parsed.trxId;
      matchingSession.matchedRawId = rawTxId;
      matchingSession.completedAt = new Date().toISOString();
      autoMatched = true;

      // Update wallet stats
      if (matchingSession.assignedWalletId) {
        const wallet = db.wallets.find((w) => w.id === matchingSession.assignedWalletId);
        if (wallet) {
          wallet.currentDailyTotal += matchingSession.amount;
          wallet.currentMonthlyTotal += matchingSession.amount;
          wallet.dailyTxnCount += 1;
        }
      }

      // Dispatch Webhook
      if (merchant.webhookUrl) {
        const webhookPayload = {
          event: "payment.completed",
          order_id: matchingSession.orderId,
          session_id: matchingSession.id,
          amount: matchingSession.amount,
          currency: matchingSession.currency,
          provider: matchingSession.provider,
          trx_id: parsed.trxId,
          customer_phone: matchingSession.customerPhone,
          completed_at: matchingSession.completedAt,
        };

        const signature = generateWebhookSignature(webhookPayload, merchant.webhookSecret);
        fetch(merchant.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-GM-Pay-Signature": signature,
          },
          body: JSON.stringify(webhookPayload),
        }).catch(console.error);
      }

      // Dispatch Telegram
      if (merchant.telegramEnabled && merchant.telegramBotToken && merchant.telegramChatId) {
        sendTelegramPaymentNotification({
          botToken: merchant.telegramBotToken,
          chatId: merchant.telegramChatId,
          orderId: matchingSession.orderId,
          amount: matchingSession.amount,
          provider: matchingSession.provider,
          trxId: parsed.trxId,
          customerName: matchingSession.customerName,
          customerPhone: matchingSession.customerPhone,
        }).catch(console.error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        parsed: {
          provider: parsed.provider,
          trx_id: parsed.trxId,
          amount: parsed.amount,
          sender: parsed.senderNumber,
        },
        auto_matched: autoMatched,
        matched_order_id: matchingSession?.orderId || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to ingest message" },
      { status: 500 }
    );
  }
}
