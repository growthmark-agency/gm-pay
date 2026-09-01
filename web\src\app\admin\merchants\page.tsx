"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Key,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Sparkles,
  Sliders,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminMerchantsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const [merchants, setMerchants] = useState([
    {
      id: "a0000000-0000-0000-0000-000000000001",
      name: "GrowthMark Agency",
      email: "merchant@growthmark.pro",
      phone: "01711000000",
      plan: "PRO",
      walletsCount: 4,
      volume: 685000,
      apiKey: "gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34",
      status: "ACTIVE",
      joined: "2026-09-01",
    },
    {
      id: "m-2",
      name: "Dhaka Dropship Hub",
      email: "admin@dhakadrop.com",
      phone: "01822334455",
      plan: "PRO",
      walletsCount: 6,
      volume: 430000,
      apiKey: "gmpay_live_883a9f1234c9e81b2a9d827f61c55",
      status: "ACTIVE",
      joined: "2026-08-25",
    },
    {
      id: "m-3",
      name: "GadgetBD Online",
      email: "support@gadgetbd.xyz",
      phone: "01933445566",
      plan: "BASIC",
      walletsCount: 2,
      volume: 290000,
      apiKey: "gmpay_live_12341234361a4c9e81b2a9d827f61c99",
      status: "ACTIVE",
      joined: "2026-08-18",
    },
    {
      id: "m-4",
      name: "Trendy Fashion Wear",
      email: "info@trendybangla.com",
      phone: "01655667788",
      plan: "FREE",
      walletsCount: 1,
      volume: 125000,
      apiKey: "gmpay_live_77665544361a4c9e81b2a9d827f61c00",
      status: "ACTIVE",
      joined: "2026-08-10",
    },
  ]);

  const toggleStatus = (id: string) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : m
      )
    );
  };

  const changePlan = (id: string, newPlan: string) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === id ? { ...m, plan: newPlan } : m))
    );
  };

  const filtered = merchants.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Merchant Accounts Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage onboarding, SaaS tier upgrades, API keys, and account suspensions.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by business name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Merchants Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 text-xs">
              <tr>
                <th className="p-4">Merchant Business</th>
                <th className="p-4">Contact</th>
                <th className="p-4">SaaS Tier</th>
                <th className="p-4">Wallets</th>
                <th className="p-4">Total Volume</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-white block">{m.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">{m.id.slice(0, 18)}...</span>
                  </td>
                  <td className="p-4 text-xs">
                    <div className="text-slate-300">{m.email}</div>
                    <div className="font-mono text-slate-500">{m.phone}</div>
                  </td>
                  <td className="p-4">
                    <select
                      value={m.plan}
                      onChange={(e) => changePlan(m.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 focus:outline-none"
                    >
                      <option value="FREE">FREE</option>
                      <option value="BASIC">BASIC (৳499)</option>
                      <option value="PRO">PRO (৳999)</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </td>
                  <td className="p-4 font-bold text-white">{m.walletsCount} SIMs</td>
                  <td className="p-4 font-bold text-emerald-400">{formatCurrency(m.volume)}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        m.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleStatus(m.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        m.status === "ACTIVE"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                      }`}
                    >
                      {m.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
