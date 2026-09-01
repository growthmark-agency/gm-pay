"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("ALL");

  const [transactions, setTransactions] = useState([
    {
      id: "tx-1",
      orderId: "ORD-98213",
      provider: "BKASH",
      trxId: "BL38A7K9Q2",
      amount: 1250,
      customerPhone: "01712345678",
      receiverWallet: "01812345678",
      status: "COMPLETED",
      webhookDelivered: true,
      time: new Date().toISOString(),
    },
    {
      id: "tx-2",
      orderId: "ORD-98210",
      provider: "NAGAD",
      trxId: "72H8G9K1",
      amount: 2400,
      customerPhone: "01698765432",
      receiverWallet: "01612345678",
      status: "COMPLETED",
      webhookDelivered: true,
      time: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: "tx-3",
      orderId: "ORD-98205",
      provider: "BKASH",
      trxId: "BK992817AX",
      amount: 850,
      customerPhone: "01855443322",
      receiverWallet: "01812345678",
      status: "COMPLETED",
      webhookDelivered: true,
      time: new Date(Date.now() - 55 * 60000).toISOString(),
    },
    {
      id: "tx-4",
      orderId: "ORD-98198",
      provider: "ROCKET",
      trxId: "RC7736251",
      amount: 3500,
      customerPhone: "01911223344",
      receiverWallet: "019123456789",
      status: "COMPLETED",
      webhookDelivered: true,
      time: new Date(Date.now() - 110 * 60000).toISOString(),
    },
    {
      id: "tx-5",
      orderId: "ORD-98190",
      provider: "BKASH",
      trxId: "BL11223344",
      amount: 500,
      customerPhone: "01700112233",
      receiverWallet: "01812345678",
      status: "EXPIRED",
      webhookDelivered: false,
      time: new Date(Date.now() - 240 * 60000).toISOString(),
    },
  ]);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customerPhone.includes(searchTerm);
    const matchesProvider = selectedProvider === "ALL" || tx.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Transactions Explorer</h1>
          <p className="text-slate-400 text-sm mt-1">Audit log of all incoming MFS payments and webhook receipts.</p>
        </div>

        <button
          onClick={() => alert("CSV Export downloaded successfully.")}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID, TrxID, or Customer Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 w-full md:w-auto"
          >
            <option value="ALL">All Methods</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="ROCKET">Rocket</option>
            <option value="UPAY">Upay</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 text-xs">
              <tr>
                <th className="p-4">Order & TrxID</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Receiver SIM</th>
                <th className="p-4">Webhook Status</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date / Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-white block">{tx.orderId}</span>
                    <span className="font-mono text-xs text-indigo-400">{tx.trxId}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                        tx.provider === "BKASH"
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          : tx.provider === "NAGAD"
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      {tx.provider}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">{formatCurrency(tx.amount)}</td>
                  <td className="p-4 font-mono text-xs text-slate-300">{tx.customerPhone}</td>
                  <td className="p-4 font-mono text-xs text-slate-400">{tx.receiverWallet}</td>
                  <td className="p-4">
                    {tx.webhookDelivered ? (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="p-4">
                    {tx.status === "COMPLETED" ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                        {tx.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-500">{formatDateTime(tx.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
