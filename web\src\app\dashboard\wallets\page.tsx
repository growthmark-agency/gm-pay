"use client";

import { useState } from "react";
import {
  Wallet,
  Plus,
  Battery,
  ShieldCheck,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WalletsPage() {
  const [wallets, setWallets] = useState([
    {
      id: "1",
      provider: "BKASH",
      walletType: "PERSONAL",
      phone: "01812345678",
      name: "Primary bKash Personal",
      dailyLimit: 25000,
      monthlyLimit: 100000,
      currentDaily: 6500,
      currentMonthly: 42000,
      priority: 1,
      isActive: true,
      battery: 94,
      lastSync: "Just now",
    },
    {
      id: "2",
      provider: "BKASH",
      walletType: "PERSONAL",
      phone: "01798765432",
      name: "Backup bKash Personal (Auto-Failover)",
      dailyLimit: 25000,
      monthlyLimit: 100000,
      currentDaily: 0,
      currentMonthly: 15000,
      priority: 2,
      isActive: true,
      battery: 88,
      lastSync: "2 mins ago",
    },
    {
      id: "3",
      provider: "NAGAD",
      walletType: "PERSONAL",
      phone: "01612345678",
      name: "Primary Nagad Wallet",
      dailyLimit: 50000,
      monthlyLimit: 200000,
      currentDaily: 3400,
      currentMonthly: 28900,
      priority: 1,
      isActive: true,
      battery: 91,
      lastSync: "Just now",
    },
    {
      id: "4",
      provider: "ROCKET",
      walletType: "PERSONAL",
      phone: "019123456789",
      name: "Primary DBBL Rocket",
      dailyLimit: 30000,
      monthlyLimit: 150000,
      currentDaily: 0,
      currentMonthly: 5000,
      priority: 1,
      isActive: true,
      battery: 95,
      lastSync: "5 mins ago",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newWallet, setNewWallet] = useState({
    provider: "BKASH",
    phone: "",
    name: "",
    walletType: "PERSONAL",
    dailyLimit: "25000",
    priority: "1",
  });

  const toggleWallet = (id: string) => {
    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallet.phone || !newWallet.name) return;

    setWallets((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        provider: newWallet.provider as any,
        walletType: newWallet.walletType as any,
        phone: newWallet.phone,
        name: newWallet.name,
        dailyLimit: parseFloat(newWallet.dailyLimit),
        monthlyLimit: parseFloat(newWallet.dailyLimit) * 4,
        currentDaily: 0,
        currentMonthly: 0,
        priority: parseInt(newWallet.priority),
        isActive: true,
        battery: 100,
        lastSync: "Just now",
      },
    ]);

    setShowAddModal(false);
    setNewWallet({
      provider: "BKASH",
      phone: "",
      name: "",
      walletType: "PERSONAL",
      dailyLimit: "25000",
      priority: "1",
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Multi-Wallet & SIM Failover Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Prevent limit blockages by setting up auto-switching secondary numbers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Wallet SIM
        </button>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wallets.map((wallet) => {
          const usedPercent = Math.min(
            100,
            Math.round((wallet.currentDaily / wallet.dailyLimit) * 100)
          );
          const isWarning = usedPercent >= 80;

          return (
            <div
              key={wallet.id}
              className={`glass-card p-6 rounded-3xl space-y-5 border transition-all ${
                wallet.isActive ? "border-slate-800" : "border-slate-800/40 opacity-60"
              }`}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm ${
                      wallet.provider === "BKASH"
                        ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                        : wallet.provider === "NAGAD"
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}
                  >
                    {wallet.provider}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{wallet.name}</h3>
                    <span className="font-mono text-xs text-slate-400">{wallet.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWallet(wallet.id)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {wallet.isActive ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Limit Progress Bar */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Daily Limit Usage</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(wallet.currentDaily)} / {formatCurrency(wallet.dailyLimit)}
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isWarning ? "bg-rose-500" : wallet.provider === "BKASH" ? "bg-pink-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={isWarning ? "text-rose-400 font-semibold" : "text-slate-500"}>
                    {usedPercent}% capacity consumed
                  </span>
                  <span className="text-indigo-400 font-medium">
                    Priority #{wallet.priority} {wallet.priority === 1 ? "(Primary)" : "(Failover)"}
                  </span>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phone Battery: <strong className="text-slate-200">{wallet.battery}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Synced: {wallet.lastSync}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Wallet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add New Wallet SIM</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">MFS Provider</label>
                <select
                  value={newWallet.provider}
                  onChange={(e) => setNewWallet({ ...newWallet, provider: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="ROCKET">DBBL Rocket</option>
                  <option value="UPAY">Upay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Wallet Name / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bKash Backup SIM 2"
                  value={newWallet.name}
                  onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX"
                  value={newWallet.phone}
                  onChange={(e) => setNewWallet({ ...newWallet, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Limit (৳)</label>
                  <input
                    type="number"
                    value={newWallet.dailyLimit}
                    onChange={(e) => setNewWallet({ ...newWallet, dailyLimit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Order</label>
                  <select
                    value={newWallet.priority}
                    onChange={(e) => setNewWallet({ ...newWallet, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="1">1 (Primary)</option>
                    <option value="2">2 (Failover #1)</option>
                    <option value="3">3 (Failover #2)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Save Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
