"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const fetchTxns = async () => {
    try {
      const res = await fetch("/api/v1/merchant/transactions");
      const data = await res.json();
      if (data.success) setTransactions(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxns();
    const interval = setInterval(fetchTxns, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customerPhone.includes(searchTerm);
    const matchesProvider =
      selectedProvider === "ALL" || tx.provider === selectedProvider;
    const matchesStatus =
      selectedStatus === "ALL" || tx.status === selectedStatus;
    return matchesSearch && matchesProvider && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Transaction Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time audit log of all customer payments and TrxID verifications.
          </p>
        </div>

        <button
          onClick={fetchTxns}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search TrxID, Order ID, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Providers</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="ROCKET">Rocket</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FRAUD_FLAGGED">Fraud Flagged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 text-xs">
              <tr>
                <th className="p-4">Transaction / Order</th>
                <th className="p-4">Method & SIM</th>
                <th className="p-4">Customer Phone</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Webhook</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    No transactions found. Completed payments will appear here in real-time.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-white block">{tx.trxId}</span>
                      <span className="font-mono text-[11px] text-slate-500">{tx.orderId}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            tx.provider === "BKASH"
                              ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                              : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          }`}
                        >
                          {tx.provider}
                        </span>
                        <span className="font-mono text-xs text-slate-400">{tx.receiverWallet}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">{tx.customerPhone}</td>
                    <td className="p-4 font-bold text-emerald-400">{formatCurrency(tx.amount)}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          tx.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : tx.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      {tx.webhookDelivered ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sent (200 OK)
                        </span>
                      ) : (
                        <span className="text-slate-500">Queued</span>
                      )}
                    </td>
                    <td className="p-4 text-right text-xs text-slate-400 font-mono">
                      {formatDateTime(tx.time)}
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
