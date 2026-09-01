"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Menu,
  X,
  LogOut,
  Bell,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  const [userEmail, setUserEmail] = useState("tstanvir@gmail.com");

  useEffect(() => {
    // Check local auth
    const savedUser = localStorage.getItem("gmpay_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.email) setUserEmail(u.email);
      } catch (e) {}
    }

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
    <div className="h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 flex">
      {/* Sidebar (Fixed & Independent Scrolling) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* Logo & Collapse Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between min-h-[68px]">
            {!collapsed && (
              <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight text-white block truncate">
                    GM<span className="text-indigo-400">Pay</span>
                  </span>
                  <span className="text-[9px] block text-emerald-400 font-bold uppercase tracking-wider -mt-1">
                    Merchant Portal
                  </span>
                </div>
              </Link>
            )}

            {collapsed && (
              <div className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 shrink-0">
                <Zap className="w-4 h-4" />
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
            {navigation.map((item) => {
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
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold shadow-inner"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Switcher & Log Out */}
          <div className="p-3 border-t border-slate-800/80 space-y-2 mt-auto">
            {!collapsed ? (
              <>
                <Link
                  href="/admin"
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-400 border border-amber-500/20 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Super Admin HQ
                  </span>
                  <ExternalLink className="w-3 h-3" />
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
                  href="/admin"
                  title="Super Admin HQ"
                  className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                >
                  <ShieldCheck className="w-4 h-4" />
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
        <header className="h-[68px] border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile Open Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Merchant Account Pill */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-sm text-white hidden sm:inline">Tanveer Sunny</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-bold">
                PRO MERCHANT
              </span>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{timeStr || "BST Clock"}</span>
            </div>

            {/* Profile Dropdown Indicator */}
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                TS
              </div>
              <span className="font-semibold text-slate-200 hidden sm:inline max-w-[120px] truncate">
                {userEmail}
              </span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#070b14] space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
