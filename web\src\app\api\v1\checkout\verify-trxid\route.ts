import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

    // 1. Call atomic database function on Supabase
    const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc("verify_and_lock_trxid", {
      p_session_id: session_id,
      p_trx_id: cleanTrx,
      p_provider: provider || "BKASH",
    });

    if (rpcErr) {
      // Direct Supabase fallback if RPC has any error
      const { data: session } = await supabaseAdmin
        .from("payment_sessions")
        .select("*, merchants(*)")
        .eq("id", session_id)
        .single();

      if (!session) {
        return NextResponse.json({ success: false, error: "NOT_FOUND", message: "Session not found" }, { status: 404 });
      }

      // Check if session is already completed
      if (session.status === "COMPLETED") {
        return NextResponse.json({
          success: true,
          status: "COMPLETED",
          message: "Payment is already completed.",
          data: { session_id: session.id, order_id: session.order_id, amount: session.amount, trx_id: session.submitted_trx_id },
        });
      }

      // Query raw_transactions pool in Supabase
      const { data: rawTx } = await supabaseAdmin
        .from("raw_transactions")
        .select("*")
        .eq("merchant_id", session.merchant_id)
        .eq("trx_id", cleanTrx)
        .limit(1)
        .single();

      if (!rawTx) {
        // Record submitted TrxID
        await supabaseAdmin.from("payment_sessions").update({ submitted_trx_id: cleanTrx, updated_at: new Date().toISOString() }).eq("id", session_id);
        return NextResponse.json({
          success: false,
          error: "PENDING_SMS_INGESTION",
          message: "Transaction ID recorded! Verifying with mobile network SMS...",
          status: "PENDING",
        });
      }

      // Complete session
      await supabaseAdmin.from("payment_sessions").update({
        status: "COMPLETED",
        submitted_trx_id: cleanTrx,
        matched_raw_id: rawTx.id,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", session_id);

      await supabaseAdmin.from("raw_transactions").update({ is_matched: true, matched_at: new Date().toISOString(), matched_session_id: session_id }).eq("id", rawTx.id);

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        message: "Payment successfully verified and locked!",
        data: { session_id: session.id, order_id: session.order_id, amount: session.amount, trx_id: cleanTrx },
      });
    }

    if (rpcResult && rpcResult.success) {
      return NextResponse.json(rpcResult);
    } else {
      return NextResponse.json(rpcResult || { success: false, message: "Verification pending" }, { status: rpcResult?.error === "TRX_ALREADY_USED" ? 409 : 200 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: error?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
