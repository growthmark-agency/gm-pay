package com.gmpay.listener.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.gmpay.listener.network.SyncEngine
import com.gmpay.listener.parser.TransactionParser

class SmsBroadcastReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "GMPaySmsReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        if (messages.isNullOrEmpty()) return

        val fullBody = StringBuilder()
        var senderAddress = ""

        for (sms in messages) {
            senderAddress = sms.originatingAddress ?: ""
            fullBody.append(sms.messageBody)
        }

        val rawText = fullBody.toString().trim()
        Log.d(TAG, "Incoming SMS from $senderAddress: $rawText")

        // Parse through universal Regex parser
        val parsed = TransactionParser.parse(senderAddress, rawText)
        if (parsed != null) {
            Log.i(TAG, "⚡ Valid SMS Transaction! Provider: ${parsed.provider}, TrxID: ${parsed.trxId}, Amount: ${parsed.amount}")
            SyncEngine.syncTransaction(context.applicationContext, parsed)
        }
    }
}
