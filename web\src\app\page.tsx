"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  ShieldCheck,
  Smartphone,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  Sparkles,
  Bot,
  Activity,
  Send,
  Code2,
  Check,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleSubscribe = async (planName: string, price: number) => {
    setSubscribing(planName);
    try {
      const res = await fetch("/api/v1/pricing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_name: planName,
          price: price,
          customer_name: "Valued Merchant",
          customer_phone: "01711223344",
        }),
      });

      const data = await res.json();
      if (data.success && data.data.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else {
        alert("Could not initialize payment session: " + (data.message || "Please try again"));
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sticky Header */}
      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-white">GM<span className="text-indigo-400">Pay</span></span>
              <span className="text-[10px] block text-slate-400 font-mono -mt-1 font-bold">AUTOMATED GATEWAY</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a>
            <a href="#security" className="hover:text-white transition-colors">Anti-Fraud</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              Open Merchant Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-28 overflow-hidden glow-mesh">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold shadow-inner">
            <Sparkles className="w-4 h-4" />
            <span>0% Merchant Fee • Real-time Multi-SIM Load Balancing • Sub-500ms Webhooks</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Automate <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">bKash, Nagad & Rocket</span> Payments for Your Business
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            Eliminate manual TrxID verification forever. Our Android listener catches mobile alerts in real-time, locks TrxIDs with atomic PostgreSQL concurrency control, and marks WooCommerce & custom store orders paid instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleSubscribe("Basic Growth Plan", 499)}
              disabled={subscribing !== null}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              {subscribing ? "Opening Checkout..." : "Test Live Checkout (৳499)"}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12 border-t border-slate-800/60">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="text-2xl font-black text-white">&lt; 500ms</div>
              <p className="text-xs text-slate-400 mt-1">TrxID Auto-Verify Speed</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="text-2xl font-black text-emerald-400">0%</div>
              <p className="text-xs text-slate-400 mt-1">Transaction Fees</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="text-2xl font-black text-indigo-400">100%</div>
              <p className="text-xs text-slate-400 mt-1">Duplicate TrxID Defense</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="text-2xl font-black text-pink-400">Multi-SIM</div>
              <p className="text-xs text-slate-400 mt-1">Auto-Limit Failover</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white">How GM Pay Works in 3 Steps</h2>
            <p className="text-sm text-slate-400">From customer checkout to instant order fulfillment without lifting a finger.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl space-y-4 border border-slate-800 relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Customer Pays via bKash / Nagad</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customer clicks checkout on your WordPress or custom website. GM Pay displays dynamic QR codes and personal/merchant numbers with smart limit failover.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-4 border border-slate-800 relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Android Listener Catches SMS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your dedicated phone captures the incoming 16247/16167 SMS in real-time, extracts the TrxID & amount, and ingests it into GM Pay Cloud in under 300ms.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-4 border border-slate-800 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Atomic Row Lock & Webhook Dispatch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supabase matches TrxID with PostgreSQL row locks, prevents duplicate reuse, sends instant HMAC Webhook to your store, and triggers Telegram order alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Dynamic Checkout */}
      <section id="pricing" className="py-24 border-t border-slate-800/80 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white">Simple, Transparent Pricing</h2>
            <p className="text-sm text-slate-400">Zero commission on your revenue. Keep 100% of what you earn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Starter</span>
                <h3 className="text-2xl font-black text-white">Free Plan</h3>
                <div className="text-3xl font-black text-white pt-2">৳0<span className="text-xs text-slate-500">/mo</span></div>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1 bKash Personal SIM</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ৳25,000 / Day Limit</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> WooCommerce Gateway Plugin</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant TrxID Verification</li>
              </ul>
              <Link
                href="/register"
                className="w-full block py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-center text-xs font-bold text-white transition-colors"
              >
                Register Free
              </Link>
            </div>

            {/* Basic (৳499) */}
            <div className="glass-card p-8 rounded-3xl space-y-6 border border-indigo-500/40 relative bg-gradient-to-b from-indigo-950/30 to-transparent shadow-2xl shadow-indigo-950/50">
              <span className="absolute -top-3 right-6 text-[10px] font-black px-3 py-1 rounded-full bg-indigo-500 text-white uppercase tracking-wider shadow-lg">
                MOST POPULAR
              </span>
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase">Growth</span>
                <h3 className="text-2xl font-black text-white">Basic Plan</h3>
                <div className="text-3xl font-black text-white pt-2">৳499<span className="text-xs text-slate-500">/mo</span></div>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3 Multi-SIM Wallets</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ৳75,000 Daily Limit Balancer</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto-Failover Switching</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Telegram Instant Order Alerts</li>
              </ul>
              <button
                onClick={() => handleSubscribe("Basic Growth Plan", 499)}
                disabled={subscribing !== null}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {subscribing === "Basic Growth Plan" ? "Opening Checkout..." : "Pay with bKash (৳499)"}
              </button>
            </div>

            {/* Pro (৳999) */}
            <div className="glass-card p-8 rounded-3xl space-y-6 border border-purple-500/30">
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-400 uppercase">Agency</span>
                <h3 className="text-2xl font-black text-white">Pro Enterprise</h3>
                <div className="text-3xl font-black text-white pt-2">৳999<span className="text-xs text-slate-500">/mo</span></div>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Multi-SIM Pool</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Daily Volume</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated Android Sync Daemon</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority 24/7 Phone Support</li>
              </ul>
              <button
                onClick={() => handleSubscribe("Pro Enterprise Plan", 999)}
                disabled={subscribing !== null}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                {subscribing === "Pro Enterprise Plan" ? "Opening Checkout..." : "Pay with bKash (৳999)"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-12 text-center text-xs text-slate-500 bg-[#050811]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">GM Pay Bangladesh</span>
          </div>
          <p>© 2026 GrowthMark Agency. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
