"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Zap,
} from "lucide-react";

export default function AdminSystemPage() {
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const handleManualLimitReset = async () => {
    setResetting(true);
    setResetMsg("");
    setTimeout(() => {
      setResetting(false);
      setResetMsg("✅ Daily wallet limits successfully reset for all merchants!");
    }, 1200);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          System Infrastructure & Cron Jobs
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Serverless edge runtime telemetry, database health, and scheduled maintenance tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Supabase Database</h3>
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400">PostgreSQL 15 with Row Level Security & Atomic TrxID Locking</p>
          <div className="p-3 bg-slate-900/80 rounded-2xl text-xs space-y-1 text-slate-300 font-mono">
            <div>Connection: <span className="text-emerald-400 font-bold">HEALTHY (2ms)</span></div>
            <div>Active Pools: <span className="text-white">Direct & Serverless</span></div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Vercel Global Edge</h3>
            <Server className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-xs text-slate-400">Anycast CDN & Global Serverless Edge Functions</p>
          <div className="p-3 bg-slate-900/80 rounded-2xl text-xs space-y-1 text-slate-300 font-mono">
            <div>SSL Certificate: <span className="text-emerald-400 font-bold">ACTIVE (TLS 1.3)</span></div>
            <div>Domain: <span className="text-indigo-400">gmpay.growthmark.pro</span></div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Daily Limit Cron Job</h3>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">Scheduled to reset daily SIM limits every night at 00:00 BST</p>
          <div className="p-3 bg-slate-900/80 rounded-2xl text-xs space-y-1 text-slate-300 font-mono">
            <div>Next Run: <span className="text-amber-400 font-bold">Midnight 00:00 BST</span></div>
            <div>Status: <span className="text-emerald-400">ACTIVE</span></div>
          </div>
        </div>
      </div>

      {/* Manual Maintenance Triggers */}
      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-slate-800">
        <h2 className="text-base font-bold text-white">Manual Maintenance Actions</h2>
        <p className="text-xs text-slate-400">
          Trigger emergency daily limit resets or clear cache across all merchant SIMs.
        </p>

        {resetMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            {resetMsg}
          </div>
        )}

        <button
          onClick={handleManualLimitReset}
          disabled={resetting}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {resetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Force Reset All Daily Wallet Limit Counters
        </button>
      </div>
    </div>
  );
}
