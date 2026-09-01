# GM Pay Android Background Listener Agent

The **GM Pay Android Listener** is a battery-optimized background service that runs on your merchant Android phone. It intercepts incoming SMS (16247, 16167, 16216) and push notifications from official bKash/Nagad/Rocket apps, parses the Transaction ID (TrxID) and Amount, and securely posts them to the GM Pay Core API in under 500ms.

---

## 🛠️ How to Build APK with Android Studio
1. Open **Android Studio** -> Select `Open` -> Browse to `android-listener/`.
2. Wait for Gradle Sync to complete.
3. Click `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`.
4. Transfer the generated `app-debug.apk` to your merchant phone and install it.

---

## ⚙️ Merchant Phone Setup (3 Steps for 24/7 Uptime)
To prevent Android OEM killers (Xiaomi MIUI/HyperOS, Samsung OneUI, Oppo/Vivo ColorOS) from sleeping the app:

1. **Grant Notification Access**:
   - In the GM Pay App, tap **"Grant Notification Access"** -> Toggle ON for GM Pay.
2. **Disable Battery Optimization**:
   - Tap **"Disable Battery Optimization"** -> Select **"No Restrictions"** / Don't optimize.
3. **Enable Autostart (Xiaomi / Vivo / Oppo)**:
   - Go to *Phone Settings -> Apps -> GM Pay Listener -> Autostart* -> Set to **Allowed**.
4. **Enter API Credentials**:
   - Paste your **Server Ingestion URL** and **API Key / Device Token** (or scan the QR code from your GM Pay Merchant Portal).
   - Tap **"Save Configuration"** and **"Test bKash Sync"**.
