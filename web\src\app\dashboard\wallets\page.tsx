"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  Battery,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WalletsManagerPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New wallet form
  const [provider, setProvider] = useState<"BKASH" | "NAGAD" | "ROCKET">("BKASH");
  const [walletType, setWalletType] = useState<"PERSONAL" | "MERCHANT">("PERSONAL");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [dailyLimit, setDailyLimit] = useState("25000");
  const [priority, setPriority] = useState("1");
  const [saving, setSaving] = useState(false);

  const fetchWallets = async () => {
    try {
      const res = await fetch("/api/v1/merchant/wallets");
      const data = await res.json();
      if (data.success) setWallets(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/v1/merchant/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_id: id, is_active: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        setWallets((prev) =>
          prev.map((w) => (w.id === id ? { ...w, isActive: !currentActive } : w))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/merchant/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          walletType,
          phone: phoneNumber,
          name: accountName,
          dailyLimit,
          priority,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setPhoneNumber("");
        setAccountName("");
        fetchWallets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Multi-Wallet & SIM Load Balancer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure multiple bKash/Nagad SIMs. Automated auto-failover activates when daily limits breach ৳25,000.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add SIM Wallet
        </button>
      </div>

      {/* Grid: Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => {
          const usedPercent = Math.min(
            100,
            Math.round((wallet.currentDaily / wallet.dailyLimit) * 100)
          );
          const isWarning = usedPercent >= 80;

          return (
            <div
              key={wallet.id}
              className={`glass-card p-6 rounded-3xl space-y-4 border transition-all ${
                wallet.isActive
                  ? "border-slate-800"
                  : "border-slate-900 opacity-60 bg-slate-950/40"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                        wallet.provider === "BKASH"
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          : wallet.provider === "NAGAD"
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      {wallet.provider}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {wallet.walletType}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-2 font-mono">
                    {wallet.phone}
                  </h3>
                  <p className="text-xs text-slate-400">{wallet.name}</p>
                </div>

                <button
                  onClick={() => handleToggle(wallet.id, wallet.isActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                    wallet.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {wallet.isActive ? "Active" : "Paused"}
                </button>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Daily Limit Usage</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(wallet.currentDaily)} / {formatCurrency(wallet.dailyLimit)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isWarning
                        ? "bg-rose-500"
                        : wallet.provider === "BKASH"
                        ? "bg-pink-500"
                        : "bg-orange-500"
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={isWarning ? "text-rose-400 font-bold" : "text-slate-500"}>
                    {usedPercent}% used {isWarning && "⚠️ Switching to Failover"}
                  </span>
                  <span className="text-indigo-400">Priority #{wallet.priority}</span>
                </div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Battery: {wallet.battery}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{wallet.lastSync}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Add New SIM Card / Wallet</h2>

            <form onSubmit={handleAddWallet} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e: any) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                >
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="ROCKET">DBBL Rocket</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Label</label>
                <input
                  type="text"
                  placeholder="e.g. Backup bKash SIM 2"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Limit (৳)</label>
                  <input
                    type="number"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Failover Priority</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
                >
                  {saving ? "Saving..." : "Save SIM Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
