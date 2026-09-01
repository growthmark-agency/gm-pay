package com.gmpay.listener

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.gmpay.listener.network.SyncEngine
import com.gmpay.listener.parser.ParsedTx
import com.gmpay.listener.service.ForegroundHeartbeatService
import com.gmpay.listener.service.PaymentNotificationListenerService

class MainActivity : AppCompatActivity() {

    private lateinit var etServerUrl: EditText
    private lateinit var etDeviceToken: EditText
    private lateinit var etSimNumber: EditText
    private lateinit var tvStatus: TextView
    private lateinit var btnSave: Button
    private lateinit var btnGrantNotif: Button
    private lateinit var btnDisableBatteryOpt: Button
    private lateinit var btnTestSync: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        loadSavedConfig()
        requestSmsPermissions()
        startHeartbeatService()
    }

    private fun initViews() {
        etServerUrl = findViewById(R.id.etServerUrl)
        etDeviceToken = findViewById(R.id.etDeviceToken)
        etSimNumber = findViewById(R.id.etSimNumber)
        tvStatus = findViewById(R.id.tvStatus)
        btnSave = findViewById(R.id.btnSave)
        btnGrantNotif = findViewById(R.id.btnGrantNotif)
        btnDisableBatteryOpt = findViewById(R.id.btnDisableBatteryOpt)
        btnTestSync = findViewById(R.id.btnTestSync)

        btnSave.setOnClickListener {
            val url = etServerUrl.text.toString().trim()
            val token = etDeviceToken.text.toString().trim()
            val sim = etSimNumber.text.toString().trim()

            if (url.isNotEmpty() && token.isNotEmpty()) {
                GMApplication.prefs.edit()
                    .putString("server_url", url)
                    .putString("device_token", token)
                    .putString("sim_number", sim)
                    .apply()

                SyncEngine.serverUrl = url
                SyncEngine.deviceToken = token
                SyncEngine.receiverSimNumber = sim

                Toast.makeText(this, "Configuration Saved!", Toast.LENGTH_SHORT).show()
                updateStatus()
            }
        }

        btnGrantNotif.setOnClickListener {
            startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"))
        }

        btnDisableBatteryOpt.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:$packageName")
                }
                startActivity(intent)
            }
        }

        btnTestSync.setOnClickListener {
            Toast.makeText(this, "Sending Test bKash Sync...", Toast.LENGTH_SHORT).show()
            val testTx = ParsedTx(
                provider = "BKASH",
                trxId = "TEST" + System.currentTimeMillis().toString().takeLast(6),
                amount = 500.0,
                sender = "01711000000",
                rawText = "You have received Tk 500.00 from 01711000000. TrxID TEST12345"
            )
            SyncEngine.syncTransaction(this, testTx) { success ->
                runOnUiThread {
                    if (success) {
                        Toast.makeText(this, "✅ Test Sync Successful!", Toast.LENGTH_LONG).show()
                    } else {
                        Toast.makeText(this, "❌ Sync Failed. Check Server URL & Token.", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    private fun loadSavedConfig() {
        val url = GMApplication.prefs.getString("server_url", SyncEngine.serverUrl) ?: SyncEngine.serverUrl
        val token = GMApplication.prefs.getString("device_token", SyncEngine.deviceToken) ?: SyncEngine.deviceToken
        val sim = GMApplication.prefs.getString("sim_number", "") ?: ""

        etServerUrl.setText(url)
        etDeviceToken.setText(token)
        etSimNumber.setText(sim)

        SyncEngine.serverUrl = url
        SyncEngine.deviceToken = token
        SyncEngine.receiverSimNumber = sim

        updateStatus()
    }

    private fun updateStatus() {
        val isNotifGranted = isNotificationServiceEnabled()
        tvStatus.text = if (isNotifGranted) {
            "● Status: Listener Active & Running 24/7"
        } else {
            "⚠️ Action Required: Please grant Notification Access"
        }
    }

    private fun isNotificationServiceEnabled(): Boolean {
        val pkgName = packageName
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        return flat?.contains(pkgName) == true
    }

    private fun requestSmsPermissions() {
        val permissions = arrayOf(
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS,
            Manifest.permission.POST_NOTIFICATIONS
        )
        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), 101)
        }
    }

    private fun startHeartbeatService() {
        val serviceIntent = Intent(this, ForegroundHeartbeatService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }
}
