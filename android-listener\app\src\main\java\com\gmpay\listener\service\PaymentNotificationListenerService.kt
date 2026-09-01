package com.gmpay.listener.service

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.gmpay.listener.network.SyncEngine
import com.gmpay.listener.parser.TransactionParser

class PaymentNotificationListenerService : NotificationListenerService() {

    companion object {
        private const val TAG = "GMPayNotifListener"
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName ?: ""
        val extras = sbn.notification.extras
        val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""

        val combinedText = "$title $text $bigText".trim()

        Log.d(TAG, "Captured notification from $packageName: $combinedText")

        // Parse with Regex Engine
        val parsed = TransactionParser.parse(packageName, combinedText)
        if (parsed != null) {
            Log.i(TAG, "🎯 Valid MFS transaction found! Provider: ${parsed.provider}, TrxID: ${parsed.trxId}, Amount: ${parsed.amount}")
            SyncEngine.syncTransaction(applicationContext, parsed)
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "Notification Listener successfully connected and active.")
    }
}
