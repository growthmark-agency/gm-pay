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
  Zap,
  ExternalLink,
  ShieldCheck,
  Settings,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/wallets", label: "Wallets & SIMs", icon: Wallet },
    { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/dashboard/developer", label: "API & Webhooks", icon: Code2 },
    { href: "/dashboard/telegram", label: "Telegram Bot", icon: Send },
    { href: "/dashboard/listener", label: "Android App", icon: Smartphone },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-black text-xl tracking-tight text-white">GM<span className="text-indigo-400">Pay</span></span>
            </Link>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              LIVE
            </span>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold shadow-inner"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile / Quick Info */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <Link
            href="/admin"
            className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-400 border border-amber-500/20 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin HQ
            </span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Gateway Service</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">100% OK</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
