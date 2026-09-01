"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Layers,
  Activity,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function SuperAdminOverview() {
  const [platformStats] = useState({
    totalPlatformGmv: 1845000,
    totalMerchants: 12,
    activeSims: 38,
    todayPlatformGmv: 98500,
    todayPlatformTxns: 114,
    platformSuccessRate: 99.8,
  });

  const [topMerchants] = useState([
    { id: "1", name: "GrowthMark Agency", email: "merchant@growthmark.pro", plan: "PRO", volume: 685000, txnCount: 480, status: "ACTIVE" },
    { id: "2", name: "Dhaka Dropship Hub", email: "admin@dhakadrop.com", plan: "PRO", volume: 430000, txnCount: 310, status: "ACTIVE" },
    { id: "3", name: "GadgetBD Online", email: "support@gadgetbd.xyz", plan: "BASIC", volume: 290000, txnCount: 195, status: "ACTIVE" },
    { id: "4", name: "Trendy Fashion Wear", email: "info@trendybangla.com", plan: "FREE", volume: 125000, txnCount: 94, status: "ACTIVE" },
  ]);

  const [recentGlobalTransactions] = useState([
    { id: "tx-g1", merchant: "GrowthMark Agency", orderId: "ORD-98213", provider: "BKASH", amount: 1250, trxId: "BL38A7K9Q2", time: new Date().toISOString() },
    { id: "tx-g2", merchant: "Dhaka Dropship Hub", orderId: "DHK-1102", provider: "NAGAD", amount: 3400, trxId: "72H8G9K1", time: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: "tx-g3", merchant: "GadgetBD Online", orderId: "GBD-5021", provider: "BKASH", amount: 850, trxId: "BK992817AX", time: new Date(Date.now() - 40 * 60000).toISOString() },
    { id: "tx-g4", merchant: "GrowthMark Agency", orderId: "ORD-98198", provider: "ROCKET", amount: 3500, trxId: "RC7736251", time: new Date(Date.now() - 85 * 60000).toISOString() },
  ]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Master Super Admin
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Agency HQ Control
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global multi-tenant gateway manager, SIM health monitor & anti-fraud center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/merchants"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Manage All Merchants ({platformStats.totalMerchants})
          </Link>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border-amber-500/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Total Platform GMV</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(platformStats.totalPlatformGmv)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across all onboarded merchants</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Today's Platform Volume</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold">+24.2%</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatCurrency(platformStats.todayPlatformGmv)}</div>
          <p className="text-[11px] text-slate-500 mt-1">{platformStats.todayPlatformTxns} transactions today</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Total Active Merchants</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{platformStats.totalMerchants} Stores</div>
          <p className="text-[11px] text-slate-500 mt-1">Zero churn this month</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Connected SIM Wallets</span>
            <Wallet className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-white">{platformStats.activeSims} SIMs</div>
          <p className="text-[11px] text-slate-500 mt-1">Auto-failover enabled</p>
        </div>
      </div>

      {/* Grid: Top Merchants + Global Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Merchants Leaderboard */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Top Performing Merchants</h2>
              <p className="text-xs text-slate-400">Ranked by 30-day transaction volume</p>
            </div>
            <Link
              href="/admin/merchants"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {topMerchants.map((m) => (
              <div key={m.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-white">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{m.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {m.plan}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{m.email}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-white">{formatCurrency(m.volume)}</div>
                  <span className="text-[11px] text-slate-500">{m.txnCount} txns</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Global Live Feed */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Global Stream
          </h2>

          <div className="space-y-3">
            {recentGlobalTransactions.map((tx) => (
              <div key={tx.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{tx.merchant}</span>
                  <span className="font-bold text-emerald-400">+{formatCurrency(tx.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">{tx.orderId} • {tx.provider}</span>
                  <span>{formatDateTime(tx.time).slice(-11)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
