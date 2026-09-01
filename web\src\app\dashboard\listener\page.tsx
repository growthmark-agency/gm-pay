"use client";

import { useState } from "react";
import {
  Smartphone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Download,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function AndroidListenerPage() {
  const [apiKey] = useState("gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34");
  const [serverUrl] = useState("https://your-domain.vercel.app/api/v1/listener/ingest");
  const [copied, setCopied] = useState(false);

  const configJson = JSON.stringify({
    serverUrl,
    deviceToken: apiKey,
    syncInterval: 5,
    providers: ["BKASH", "NAGAD", "ROCKET", "UPAY"],
  });

  const copyConfig = () => {
    navigator.clipboard.writeText(configJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          Android Listener Agent (Background Engine)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Install the lightweight background app on your merchant Android phone containing your bKash/Nagad SIMs.
        </p>
      </div>

      {/* QR Code Auto-Pairing Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl text-center space-y-4 border border-slate-800 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-slate-300">1-Click QR Pairing</span>
          <div className="p-3 bg-white rounded-2xl shadow-lg inline-block">
            <QRCodeSVG value={configJson} size={170} level="M" />
          </div>
          <p className="text-[11px] text-slate-500">
            Open the GM Pay Listener App on your phone and tap <strong>"Scan QR Code"</strong> to connect instantly.
          </p>
        </div>

        <div className="md:col-span-2 glass-card p-6 md:p-8 rounded-3xl space-y-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              Manual Connection Credentials
            </h2>
            <button
              onClick={copyConfig}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Server Ingestion URL:</span>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-200">
                {serverUrl}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Device Auth Token (API Key):</span>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-200">
                {apiKey}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Agent Features:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Dual Interception: Intercepts SMS (16247, 16167) & App Push Notifications.</li>
              <li>Offline Queue: If internet drops, messages are cached and retried automatically.</li>
              <li>Auto-Boot: Automatically restarts in background when phone is turned on.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Battery Optimization Step-by-Step Guide */}
      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Critical 24/7 Uptime Optimization (Xiaomi / Samsung / Oppo)
        </h3>

        <p className="text-xs text-slate-400">
          To ensure the Android OS does not kill the listener service in the background, please configure these 3 simple settings on your phone:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">1. Battery Optimization</span>
            <p className="text-slate-400">
              Go to <em>App Settings → Battery Saver</em> → Select <strong>"No Restrictions"</strong> (Don't optimize).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">2. Autostart Permission</span>
            <p className="text-slate-400">
              For Xiaomi/Oppo/Vivo: Enable <strong>"Autostart"</strong> and <strong>"Allow Background Activity"</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">3. Notification Access</span>
            <p className="text-slate-400">
              Grant <strong>"Notification Listener Access"</strong> and <strong>"SMS Read Permission"</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
