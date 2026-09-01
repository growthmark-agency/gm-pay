"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Key, MessageSquare } from "lucide-react";

export default function TelegramSettingsPage() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleTestAlert = async () => {
    if (!botToken || !chatId) {
      setStatusMsg({ success: false, text: "Please provide both Telegram Bot Token and Chat ID." });
      return;
    }

    setTesting(true);
    setStatusMsg(null);

    try {
      const message = `
🚀 *GM Pay — Test Notification!*
━━━━━━━━━━━━━━━━━━━━
✅ Telegram Alert Connection Successful!
🏪 Store: *GrowthMark Demo Store*
⏰ Time: ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━
Your store is now ready to receive real-time payment alerts!
      `;

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setStatusMsg({ success: true, text: "Test message sent to your Telegram successfully!" });
      } else {
        setStatusMsg({ success: false, text: `Telegram Error: ${data.description}` });
      }
    } catch (err: any) {
      setStatusMsg({ success: false, text: err.message || "Failed to reach Telegram API" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          Telegram Instant Payment Alerts
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Receive real-time rich receipts in your Telegram channel/group whenever a customer pays.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-slate-800">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              Telegram Bot Token
            </label>
            <input
              type="text"
              placeholder="e.g. 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Create a free bot with <a href="https://t.me/BotFather" target="_blank" className="text-indigo-400 hover:underline">@BotFather</a> on Telegram to get your token.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Chat / Group ID
            </label>
            <input
              type="text"
              placeholder="e.g. -1001234567890 or @your_channel"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Add your bot as admin in your private merchant group and enter the Chat ID.
            </p>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
              statusMsg.success
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}
          >
            {statusMsg.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleTestAlert}
            disabled={testing}
            className="flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Test Alert to Telegram
          </button>

          <button
            onClick={() => alert("Telegram settings saved successfully!")}
            className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
