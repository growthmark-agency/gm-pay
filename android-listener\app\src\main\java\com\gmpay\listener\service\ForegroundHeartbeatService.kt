package com.gmpay.listener.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.gmpay.listener.network.SyncEngine

class ForegroundHeartbeatService : Service() {

    private val CHANNEL_ID = "GMPayListenerChannel"
    private val handler = Handler(Looper.getMainLooper())
    private val heartbeatInterval = 60000L // 1 minute heartbeat ping

    private val runnable = object : Runnable {
        override fun run() {
            SyncEngine.sendHeartbeat(applicationContext)
            handler.postDelayed(this, heartbeatInterval)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(101, createNotification())
        handler.post(runnable)
    }

    override fun onDestroy() {
        handler.removeCallbacks(runnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("GM Pay Listener Active")
            .setContentText("Listening for bKash, Nagad & Rocket payments 24/7")
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "GM Pay Listener Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}
