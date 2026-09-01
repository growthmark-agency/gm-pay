package com.gmpay.listener.network

import android.content.Context
import android.os.BatteryManager
import android.util.Log
import com.gmpay.listener.parser.ParsedTx
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object SyncEngine {
    private const val TAG = "GMPaySyncEngine"

    // Default configuration (Override via MainActivity settings/QR scan)
    var serverUrl: String = "https://your-domain.vercel.app/api/v1/listener/ingest"
    var deviceToken: String = "gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34"
    var receiverSimNumber: String = ""

    fun syncTransaction(context: Context, tx: ParsedTx, onComplete: ((Boolean) -> Unit)? = null) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL(serverUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                conn.setRequestProperty("Authorization", "Bearer $deviceToken")
                conn.setRequestProperty("User-Agent", "GM-Pay-Android-Agent/1.0")
                conn.connectTimeout = 15000
                conn.readTimeout = 15000
                conn.doOutput = true

                val payload = JSONObject().apply {
                    put("sender_or_header", tx.provider)
                    put("message", tx.rawText)
                    put("receiver_number", receiverSimNumber)
                    put("manual_trx_id", tx.trxId)
                    put("manual_amount", tx.amount)
                    put("manual_provider", tx.provider)
                    put("timestamp", SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date()))
                }

                val writer = OutputStreamWriter(conn.outputStream)
                writer.write(payload.toString())
                writer.flush()
                writer.close()

                val responseCode = conn.responseCode
                Log.d(TAG, "Ingestion response code: $responseCode for TrxID: ${tx.trxId}")

                val success = responseCode in 200..299
                onComplete?.invoke(success)

            } catch (e: Exception) {
                Log.e(TAG, "Failed to sync transaction: ${e.message}", e)
                onComplete?.invoke(false)
            }
        }
    }

    fun sendHeartbeat(context: Context) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
                val batLevel = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)

                val heartbeatUrl = serverUrl.replace("/ingest", "/heartbeat")
                val url = URL(heartbeatUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                conn.setRequestProperty("Authorization", "Bearer $deviceToken")
                conn.connectTimeout = 10000
                conn.doOutput = true

                val payload = JSONObject().apply {
                    put("device_id", android.os.Build.MODEL)
                    put("battery_level", batLevel)
                }

                val writer = OutputStreamWriter(conn.outputStream)
                writer.write(payload.toString())
                writer.flush()
                writer.close()

                Log.d(TAG, "Heartbeat sent, code: ${conn.responseCode}")
            } catch (e: Exception) {
                Log.e(TAG, "Heartbeat failed: ${e.message}")
            }
        }
    }
}
