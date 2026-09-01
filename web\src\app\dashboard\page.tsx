"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    todayVolume: 12450,
    todayTxnCount: 14,
    monthlyVolume: 185600,
    successRate: 99.4,
    activeWalletsCount: 4,
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: "1",
      orderId: "ORD-98213",
      provider: "BKASH",
      trxId: "BL38A7K9Q2",
      amount: 1250,
      customerPhone: "01712345678",
      status: "COMPLETED",
      time: new Date().toISOString(),
    },
    {
      id: "2",
      orderId: "ORD-98210",
      provider: "NAGAD",
      trxId: "72H8G9K1",
      amount: 2400,
      customerPhone: "01698765432",
      status: "COMPLETED",
      time: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: "3",
      orderId: "ORD-98205",
      provider: "BKASH",
      trxId: "BK992817AX",
      amount: 850,
      customerPhone: "01855443322",
      status: "COMPLETED",
      time: new Date(Date.now() - 55 * 60000).toISOString(),
    },
    {
      id: "4",
      orderId: "ORD-98198",
      provider: "ROCKET",
      trxId: "RC7736251",
      amount: 3500,
      customerPhone: "01911223344",
      status: "COMPLETED",
      time: new Date(Date.now() - 110 * 60000).toISOString(),
    },
  ]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Merchant Overview
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              GrowthMark Agency
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time revenue monitoring & SIM auto-failover engine.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/developer"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Sandbox Simulator
          </Link>
          <Link
            href="/checkout/d0000000-0000-0000-0000-000000000001"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Test Checkout
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Today's Total GMV</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold">+18.4%</span>
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(stats.todayVolume)}</div>
          <p className="text-[11px] text-slate-500 mt-1">{stats.todayTxnCount} successful transactions today</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Monthly Volume</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(stats.monthlyVolume)}</div>
          <p className="text-[11px] text-slate-500 mt-1">This billing cycle (Zero Fees)</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Verification Speed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">420ms avg</div>
          <p className="text-[11px] text-slate-500 mt-1">Sub-second double match rate</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Active SIM Wallets</span>
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">4 / 4 Online</div>
          <p className="text-[11px] text-slate-500 mt-1">Auto-failover enabled</p>
        </div>
      </div>

      {/* Main Grid: Live Transactions + Smart Limit Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Transaction Stream */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Live Transactions Feed</h2>
              <p className="text-xs text-slate-400">Real-time bKash, Nagad & Rocket payments</p>
            </div>
            <Link
              href="/dashboard/transactions"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      tx.provider === "BKASH"
                        ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                        : tx.provider === "NAGAD"
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}
                  >
                    {tx.provider.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{tx.orderId}</span>
                      <span className="text-xs font-mono text-slate-400">{tx.trxId}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{formatDateTime(tx.time)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">+{formatCurrency(tx.amount)}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Auto-Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Smart Wallet Health & Failover Overview */}
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">SIM Limit Health</h2>
            <Link href="/dashboard/wallets" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Manage
            </Link>
          </div>

          {/* SIM 1: Primary bKash */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">bKash Primary (01812345678)</span>
              <span className="text-slate-400 font-mono">৳6,500 / ৳25,000</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full" style={{ width: "26%" }}></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Limit: 26% used</span>
              <span className="text-emerald-400 font-medium">Ready (Priority #1)</span>
            </div>
          </div>

          {/* SIM 2: Backup bKash */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">bKash Backup (01798765432)</span>
              <span className="text-slate-400 font-mono">৳0 / ৳25,000</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: "0%" }}></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Limit: 0% used</span>
              <span className="text-indigo-400 font-medium">Standby (Failover #2)</span>
            </div>
          </div>

          {/* SIM 3: Nagad */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Nagad Primary (01612345678)</span>
              <span className="text-slate-400 font-mono">৳3,400 / ৳50,000</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: "7%" }}></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Limit: 7% used</span>
              <span className="text-emerald-400 font-medium">Ready (Priority #1)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
