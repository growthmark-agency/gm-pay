"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
  RefreshCw,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AdminFraudPage() {
  const [fraudLogs, setFraudLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFraudLogs = async () => {
    try {
      const res = await fetch("/api/v1/admin/fraud");
      const data = await res.json();
      if (data.success) setFraudLogs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudLogs();
  }, []);

  const toggleBan = async (id: string, currentBlocked: boolean) => {
    try {
      const res = await fetch("/api/v1/admin/fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_id: id, is_blocked: !currentBlocked }),
      });
      const data = await res.json();
      if (data.success) {
        setFraudLogs((prev) =>
          prev.map((f) => (f.id === id ? { ...f, isBlocked: !currentBlocked } : f))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Global Anti-Fraud & Security Monitor
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated defense against duplicate TrxID reuse, fake payment attempts, and malicious IP networks.
          </p>
        </div>

        <button
          onClick={fetchFraudLogs}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 text-xs">
              <tr>
                <th className="p-4">Targeted Store</th>
                <th className="p-4">Suspicious TrxID</th>
                <th className="p-4">Attacker IP</th>
                <th className="p-4">Flagged Reason</th>
                <th className="p-4">Action Taken</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">IP Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {fraudLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    ✅ No malicious fraud attempts detected! All systems clean and secured.
                  </td>
                </tr>
              ) : (
                fraudLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white">{log.merchant}</td>
                    <td className="p-4 font-mono text-indigo-400 font-bold">{log.trxId}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">{log.ipAddress}</td>
                    <td className="p-4 text-xs text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{log.reason}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          log.isBlocked
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {log.isBlocked ? "BLOCKED & LOCKED" : "MONITORED"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{formatDateTime(log.time)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleBan(log.id, log.isBlocked)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          log.isBlocked
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                      >
                        {log.isBlocked ? "Unblock IP" : "Ban IP"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
