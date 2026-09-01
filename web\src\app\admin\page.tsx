"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
  Layers,
  Activity,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function SuperAdminOverview() {
  const [stats, setStats] = useState({
    totalPlatformGmv: 0,
    todayPlatformGmv: 0,
    todayPlatformTxns: 0,
    totalMerchants: 1,
    activeSims: 4,
    platformSuccessRate: 100,
  });

  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, merchRes] = await Promise.all([
        fetch("/api/v1/admin/stats"),
        fetch("/api/v1/admin/merchants"),
      ]);

      const statsJson = await statsRes.json();
      const merchJson = await merchRes.json();

      if (statsJson.success) setStats(statsJson.data);
      if (merchJson.success) setMerchants(merchJson.data);
    } catch (err) {
      console.error("Failed to load admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const timer = setInterval(fetchAdminData, 10000);
    return () => clearInterval(timer);
  }, []);

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
            Live multi-tenant gateway manager, SIM health monitor & anti-fraud center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/merchants"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Manage All Merchants ({stats.totalMerchants})
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
          <div className="text-2xl font-black text-white">{formatCurrency(stats.totalPlatformGmv)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Live Supabase ledger</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Today's Platform Volume</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold">Live</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatCurrency(stats.todayPlatformGmv)}</div>
          <p className="text-[11px] text-slate-500 mt-1">{stats.todayPlatformTxns} transactions today</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Registered Merchants</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalMerchants} Stores</div>
          <p className="text-[11px] text-slate-500 mt-1">Multi-tenant isolation</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Connected SIM Wallets</span>
            <Wallet className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.activeSims} Active SIMs</div>
          <p className="text-[11px] text-slate-500 mt-1">Auto-failover enabled</p>
        </div>
      </div>

      {/* Grid: Top Merchants + Global Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Merchants Leaderboard */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Active Merchant Directory</h2>
              <p className="text-xs text-slate-400">Live data synced from Supabase</p>
            </div>
            <Link
              href="/admin/merchants"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {merchants.map((m) => (
              <div key={m.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-white">
                    {m.name ? m.name.slice(0, 2).toUpperCase() : "GM"}
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
                  <span className="text-[11px] text-slate-500">{m.walletsCount} SIMs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Platform Health */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Platform Status
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>Database Response</span>
                <span className="text-emerald-400 font-bold">2ms</span>
              </div>
              <div className="text-slate-500 text-[11px]">PostgreSQL 15 (Supabase ap-southeast)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>TrxID Match Engine</span>
                <span className="text-emerald-400 font-bold">420ms</span>
              </div>
              <div className="text-slate-500 text-[11px]">Atomic Row-Level Locking Active</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>Custom Subdomain</span>
                <span className="text-indigo-400 font-bold">gmpay.growthmark.pro</span>
              </div>
              <div className="text-slate-500 text-[11px]">Anycast CDN & Cloudflare SSL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
