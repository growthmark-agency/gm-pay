"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Smartphone,
  ChevronRight,
  Send,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function DashboardOverview() {
  const [data, setData] = useState({
    businessName: "GrowthMark Agency",
    todayVolume: 0,
    todayTxnCount: 0,
    monthlyVolume: 0,
    successRate: 100,
    activeWalletsCount: 4,
    wallets: [] as any[],
    recentTransactions: [] as any[],
  });

  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/v1/merchant/overview");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Merchant Dashboard
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PRO Plan
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Store: <strong className="text-white">{data.businessName}</strong> • Real-time Supabase sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/wallets"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5 text-indigo-400" />
            Manage SIMs ({data.activeWalletsCount})
          </Link>
          <Link
            href="/dashboard/developer"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Test API Keys
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Today's Total Volume</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Live
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(data.todayVolume)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {data.todayTxnCount} transactions today
          </p>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>This Month's GMV</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(data.monthlyVolume)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">All verified payments</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Success Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {data.successRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Zero TrxID duplicates</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Active SIM Pool</span>
            <Wallet className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {data.activeWalletsCount} Wallets
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Smart limit auto-switch</p>
        </div>
      </div>

      {/* Grid: Wallets Limit Overview + Recent Live Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallets Failover Preview */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-400" />
              SIM Limit Balancer
            </h2>
            <Link
              href="/dashboard/wallets"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.wallets.map((w) => {
              const dailyLimit = Number(w.daily_limit) || 25000;
              const currentDaily = Number(w.current_daily_total) || 0;
              const usedPercent = Math.min(100, Math.round((currentDaily / dailyLimit) * 100));

              return (
                <div
                  key={w.id}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          w.provider === "BKASH"
                            ? "bg-pink-500/20 text-pink-400"
                            : "bg-orange-500/20 text-orange-400"
                        }`}
                      >
                        {w.provider}
                      </span>
                      <span className="font-mono text-slate-200">{w.phone_number}</span>
                    </div>
                    <span className="text-slate-400 font-mono">
                      {formatCurrency(currentDaily)} / {formatCurrency(dailyLimit)}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        w.provider === "BKASH" ? "bg-pink-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${usedPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Transactions Feed */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                Live Ingested Transactions
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time matching from Android listener & push</p>
            </div>
            <Link
              href="/dashboard/transactions"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Waiting for incoming payments. Test a transaction from the checkout or simulator!
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        tx.provider === "BKASH"
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      }`}
                    >
                      {tx.provider === "BKASH" ? "bK" : "Ng"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          {tx.trxId}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {tx.orderId}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{tx.customerPhone}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">
                      +{formatCurrency(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {formatDateTime(tx.time).slice(-11)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
