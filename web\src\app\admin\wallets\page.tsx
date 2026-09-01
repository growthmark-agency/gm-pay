"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Battery,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminGlobalWalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = async () => {
    try {
      const res = await fetch("/api/v1/admin/wallets");
      const data = await res.json();
      if (data.success) setWallets(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Global SIM & Wallet Telemetry
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Live monitoring of all merchant SIM cards, daily limits, battery health, and failover states.
          </p>
        </div>

        <button
          onClick={fetchWallets}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((w) => {
          const usedPercent = Math.min(100, Math.round((w.currentDaily / w.dailyLimit) * 100));
          const isWarning = usedPercent >= 80;

          return (
            <div key={w.id} className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{w.merchant}</span>
                  <h3 className="font-bold text-white text-base font-mono">{w.phone}</h3>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                    w.provider === "BKASH"
                      ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                      : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  }`}
                >
                  {w.provider}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Limit Usage</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(w.currentDaily)} / {formatCurrency(w.dailyLimit)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isWarning ? "bg-rose-500" : w.provider === "BKASH" ? "bg-pink-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={isWarning ? "text-rose-400 font-bold" : "text-slate-500"}>
                    {usedPercent}% used {isWarning && "⚠️ Failover Active"}
                  </span>
                  <span className="text-indigo-400">Priority #{w.priority}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Battery: {w.battery}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{w.lastPing}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
