"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Menu,
  X,
  LogOut,
  Clock,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " BST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("gmpay_user");
    router.push("/login");
  };

  const adminNav = [
    { href: "/admin", label: "Global Overview", icon: BarChart3 },
    { href: "/admin/merchants", label: "Merchants & Clients", icon: Users },
    { href: "/admin/wallets", label: "Global SIM Monitor", icon: Wallet },
    { href: "/admin/fraud", label: "Anti-Fraud & Bans", icon: ShieldAlert },
    { href: "/admin/system", label: "System & Crons", icon: Activity },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050811] text-slate-100 flex">
      {/* Super Admin Sidebar (Fixed & Independent Scrolling) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen bg-slate-950/90 backdrop-blur-2xl border-r border-indigo-950/60 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* Logo & Collapse Header */}
          <div className="p-4 border-b border-indigo-950/60 flex items-center justify-between min-h-[68px]">
            {!collapsed && (
              <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight text-white block truncate">
                    GM<span className="text-amber-400">Master</span>
                  </span>
                  <span className="text-[9px] block text-amber-500/80 font-bold uppercase tracking-wider -mt-1">
                    Super Admin HQ
                  </span>
                </div>
              </Link>
            )}

            {collapsed && (
              <div className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
            )}

            {/* Desktop Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="hidden md:flex p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-slate-900 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-600/25 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Switcher & Sign Out */}
          <div className="p-3 border-t border-indigo-950/60 space-y-2 mt-auto">
            {!collapsed ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Merchant Portal
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-xs font-semibold text-slate-400 border border-slate-800 flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/dashboard"
                  title="Merchant Portal"
                  className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="h-[68px] border-b border-indigo-950/60 bg-slate-950/60 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile Open Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Root Admin Pill */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-bold text-sm text-white hidden sm:inline">GrowthMark HQ</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-black uppercase">
                ROOT SUPER ADMIN
              </span>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeStr || "BST Clock"}</span>
            </div>

            {/* Supabase Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">Postgres 100% OK</span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050811] space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
