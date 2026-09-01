"use client";

import { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Send,
  RefreshCw,
  Terminal,
  ShieldAlert,
} from "lucide-react";

export default function DeveloperPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // Settings state
  const [apiKey] = useState("gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34");
  const [apiSecret] = useState("gmpay_sec_5b821a9c34e8f192b3a7d9e0123456789abcdef012345678");
  const [sandboxKey] = useState("gmpay_test_1234567890abcdef12345678");
  const [webhookUrl, setWebhookUrl] = useState("https://yourstore.com/wp-json/gm-pay/v1/webhook");
  const [webhookSecret] = useState("whsec_9876543210abcdef9876543210abcdef98765432");

  // Simulator state
  const [simSender, setSimSender] = useState("bKash");
  const [simMessage, setSimMessage] = useState(
    "You have received Tk 1,250.00 from 01712345678. Ref: GM-ORDER. Fee Tk 0.00. Balance Tk 14,350.00. TrxID BL38A7K9Q2 at 01/09/2026 18:15"
  );
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateIngestion = async () => {
    setSimLoading(true);
    setSimResult(null);

    try {
      const res = await fetch("/api/v1/listener/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          sender_or_header: simSender,
          message: simMessage,
          receiver_number: "01812345678",
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      setSimResult(data);
    } catch (err: any) {
      setSimResult({ success: false, error: err.message });
    } finally {
      setSimLoading(false);
    }
  };

  const presetMessages = {
    bkash:
      "You have received Tk 1,250.00 from 01712345678. Ref: GM-ORDER. Fee Tk 0.00. Balance Tk 14,350.00. TrxID BL38A7K9Q2 at 01/09/2026 18:15",
    nagad:
      "You have received Tk 2,400.00 from 01698765432. TxnID: 72H8G9K1, Balance: 15,200.00, Time: 01/09/2026 18:20",
    rocket:
      "DBBL Rocket: Tk 3,500.00 received from 01911223344. TxnId: RC7736251. Balance: 18,900.00",
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Developer API & Webhooks</h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect your WooCommerce store, funnel landing pages, or custom app.
        </p>
      </div>

      {/* API Keys Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live API Keys */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Live API Credentials
            </h2>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Production
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Live API Key</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-200">
                <span className="truncate flex-1">{apiKey}</span>
                <button
                  onClick={() => copyText(apiKey, "apiKey")}
                  className="p-1 hover:text-white text-slate-400"
                >
                  {copiedKey === "apiKey" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Live API Secret</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-200">
                <span className="truncate flex-1">
                  {showSecret ? apiSecret : "••••••••••••••••••••••••••••••••••••••••"}
                </span>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-1 hover:text-white text-slate-400"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyText(apiSecret, "apiSecret")}
                  className="p-1 hover:text-white text-slate-400"
                >
                  {copiedKey === "apiSecret" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              Webhook Endpoint (HMAC-SHA256)
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Webhook Callback URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">HMAC Signing Secret</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-200">
                <span className="truncate flex-1">{webhookSecret}</span>
                <button
                  onClick={() => copyText(webhookSecret, "whSecret")}
                  className="p-1 hover:text-white text-slate-400"
                >
                  {copiedKey === "whSecret" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => alert("Webhook settings updated.")}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              Save Webhook Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SMS Parsing & Ingestion Sandbox Simulator */}
      <div className="glass-card p-6 rounded-3xl space-y-5 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Live SMS & Push Ingestion Sandbox Simulator</h2>
              <p className="text-xs text-slate-400">Simulate incoming Android Listener notifications without using real money.</p>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSimSender("bKash");
                setSimMessage(presetMessages.bkash);
              }}
              className="px-2.5 py-1 rounded-lg bg-pink-950/40 border border-pink-700/30 text-pink-400 text-xs font-semibold hover:bg-pink-900/40"
            >
              bKash Preset
            </button>
            <button
              onClick={() => {
                setSimSender("16167");
                setSimMessage(presetMessages.nagad);
              }}
              className="px-2.5 py-1 rounded-lg bg-orange-950/40 border border-orange-700/30 text-orange-400 text-xs font-semibold hover:bg-orange-900/40"
            >
              Nagad Preset
            </button>
            <button
              onClick={() => {
                setSimSender("16216");
                setSimMessage(presetMessages.rocket);
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-700/30 text-purple-400 text-xs font-semibold hover:bg-purple-900/40"
            >
              Rocket Preset
            </button>
          </div>
        </div>

        {/* Simulator Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sender ID / App Header</label>
              <input
                type="text"
                value={simSender}
                onChange={(e) => setSimSender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Raw SMS / Push Notification Text</label>
              <textarea
                rows={4}
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleSimulateIngestion}
              disabled={simLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {simLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Ingestion...
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  Simulate Android Listener Ingest
                </>
              )}
            </button>
          </div>

          {/* Real-time Response View */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 overflow-auto max-h-72">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-800/80 pb-2">
              <span>Execution Output & Auto-Match Status</span>
              {simResult && <span className="text-emerald-400">Response 200 OK</span>}
            </div>

            {simResult ? (
              <pre className="text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(simResult, null, 2)}
              </pre>
            ) : (
              <div className="text-slate-600 text-center py-10">
                Click "Simulate Android Listener Ingest" to see the parser extract TrxID, Amount, and trigger the webhook in real-time.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
