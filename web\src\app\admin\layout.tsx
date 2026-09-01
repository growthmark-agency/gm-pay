"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Wallet,
  Activity,
  Layers,
  Zap,
  BarChart3,
  ExternalLink,
  ArrowLeft,
  Key,
} from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const adminNav = [
    { href: "/admin", label: "Global Overview", icon: BarChart3 },
    { href: "/admin/merchants", label: "Merchants & Clients", icon: Users },
    { href: "/admin/wallets", label: "Global SIM Monitor", icon: Wallet },
    { href: "/admin/fraud", label: "Anti-Fraud & Bans", icon: ShieldAlert },
    { href: "/admin/system", label: "System & Crons", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col md:flex-row">
      {/* Super Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-indigo-950/60 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Brand */}
          <div className="p-5 border-b border-indigo-950/60 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white">GM<span className="text-amber-400">Master</span></span>
                <span className="text-[10px] block text-amber-500/80 font-bold uppercase tracking-wider -mt-1">Super Admin</span>
              </div>
            </Link>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black">
              ROOT
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-600/25 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switcher */}
        <div className="p-4 border-t border-indigo-950/60 space-y-2">
          <Link
            href="/dashboard"
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Merchant Portal
            </span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Supabase Cloud</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">Online</span>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
