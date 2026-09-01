"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Mail,
  Phone,
  Key,
  Lock,
  Send,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Shield,
  CreditCard,
} from "lucide-react";

export default function MerchantSettingsPage() {
  const [profile, setProfile] = useState({
    business_name: "GrowthMark Agency",
    email: "merchant@growthmark.pro",
    phone: "01711000000",
    webhook_url: "https://growthmark.pro/wp-json/gm-pay/v1/webhook",
    telegram_chat_id: "",
    telegram_bot_token: "",
    telegram_enabled: true,
    plan_tier: "PRO",
    api_key: "gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/v1/merchant/settings");
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/merchant/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: profile.business_name,
          phone: profile.phone,
          webhook_url: profile.webhook_url,
          telegram_chat_id: profile.telegram_chat_id,
          telegram_bot_token: profile.telegram_bot_token,
          telegram_enabled: profile.telegram_enabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("✅ Profile and settings updated successfully!");
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateKeys = async () => {
    if (!confirm("Are you sure? Your existing API Keys will be invalidated immediately.")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/merchant/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate_keys: true }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setSuccessMsg("🔑 API Keys successfully regenerated!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          Store Profile & Account Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your business information, security credentials, and webhook endpoints.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Grid: Profile + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Info Card */}
          <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Business Information
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business / Store Name
                </label>
                <input
                  type="text"
                  value={profile.business_name}
                  onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WooCommerce Webhook URL
                </label>
                <input
                  type="url"
                  value={profile.webhook_url || ""}
                  onChange={(e) => setProfile({ ...profile, webhook_url: e.target.value })}
                  placeholder="https://yourstore.com/wp-json/gm-pay/v1/webhook"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 hover:opacity-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving Changes..." : "Save Profile Settings"}
              </button>
            </form>
          </div>

          {/* Password Reset */}
          <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Reset Account Password
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (newPassword && newPassword === confirmPassword) {
                  setSuccessMsg("🔒 Password updated successfully!");
                  setNewPassword("");
                  setConfirmPassword("");
                } else {
                  alert("Passwords do not match");
                }
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Right 1 Col: SaaS Plan & Key Actions */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Plan</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {profile.plan_tier}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">GM Pay Enterprise Pro</h3>
              <p className="text-xs text-slate-400">Unlimited SIM failover & 24/7 priority support.</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl text-xs space-y-1 text-slate-300">
              <div>Next Billing: <span className="font-bold text-white">30 Sep 2026</span></div>
              <div>Daily Limit: <span className="font-bold text-emerald-400">Unlimited</span></div>
            </div>
          </div>

          {/* Regenerate API Keys */}
          <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              API Key Management
            </h3>
            <p className="text-xs text-slate-400">
              Need to rotate your keys? You can regenerate new API credentials instantly.
            </p>

            <button
              onClick={handleRegenerateKeys}
              disabled={saving}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
