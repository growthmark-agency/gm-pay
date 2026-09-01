"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Code2,
  Send,
  Smartphone,
  ExternalLink,
  Zap,
  Activity,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/wallets", label: "Wallets & SIM Limits", icon: Wallet },
    { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/dashboard/developer", label: "API & Webhooks", icon: Code2 },
    { href: "/dashboard/telegram", label: "Telegram Bot", icon: Send },
    { href: "/dashboard/listener", label: "Android Agent", icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Brand */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white">GM<span className="text-indigo-400">Pay</span></span>
                <span className="text-[10px] block text-slate-500 font-medium -mt-1">Merchant Portal</span>
              </div>
            </Link>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
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

        {/* Bottom Quick Test */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <Link
            href="/checkout/d0000000-0000-0000-0000-000000000001"
            target="_blank"
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-indigo-400 border border-indigo-500/20 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Live Checkout Demo</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">Core Engine</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">100% OK</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
