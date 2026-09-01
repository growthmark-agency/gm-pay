"use client";

import { useState } from "react";
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
  const [wallets] = useState([
    {
      id: "w-1",
      merchant: "GrowthMark Agency",
      provider: "BKASH",
      type: "PERSONAL",
      phone: "01812345678",
      dailyLimit: 25000,
      currentDaily: 6500,
      battery: 94,
      priority: 1,
      isActive: true,
      lastPing: "10s ago",
    },
    {
      id: "w-2",
      merchant: "GrowthMark Agency",
      provider: "BKASH",
      type: "PERSONAL",
      phone: "01798765432",
      dailyLimit: 25000,
      currentDaily: 0,
      battery: 88,
      priority: 2,
      isActive: true,
      lastPing: "2m ago",
    },
    {
      id: "w-3",
      merchant: "Dhaka Dropship Hub",
      provider: "BKASH",
      type: "PERSONAL",
      phone: "01755443322",
      dailyLimit: 25000,
      currentDaily: 24200,
      battery: 42,
      priority: 1,
      isActive: true,
      lastPing: "1m ago",
    },
    {
      id: "w-4",
      merchant: "Dhaka Dropship Hub",
      provider: "BKASH",
      type: "PERSONAL",
      phone: "01711223344",
      dailyLimit: 25000,
      currentDaily: 1200,
      battery: 95,
      priority: 2,
      isActive: true,
      lastPing: "1m ago",
    },
    {
      id: "w-5",
      merchant: "GrowthMark Agency",
      provider: "NAGAD",
      type: "PERSONAL",
      phone: "01612345678",
      dailyLimit: 50000,
      currentDaily: 3400,
      battery: 91,
      priority: 1,
      isActive: true,
      lastPing: "30s ago",
    },
  ]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          Global SIM & Wallet Telemetry
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Live monitoring of all merchant SIM cards, daily limits, battery health, and failover states.
        </p>
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
