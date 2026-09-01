import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Smartphone,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Send,
  Code2,
  Lock,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen glow-mesh text-slate-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">GM<span className="text-indigo-400">Pay</span></span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">v1.0 Zero-Cost</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
            <Link href="/checkout/d0000000-0000-0000-0000-000000000001" className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Live Checkout Demo
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              Merchant Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Next-Gen Bangladeshi Payment Gateway with Smart SIM Failover
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Automate Personal & Merchant <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            bKash, Nagad, Rocket & Upay
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
          Verify transactions in under <strong className="text-indigo-400">500ms</strong> using our Android background listener agent. Zero manual delays, auto limit switching, anti-fraud protection, and 100% zero-cost cloud hosting.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:opacity-95 transition-all flex items-center gap-2"
          >
            Launch Merchant Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/checkout/d0000000-0000-0000-0000-000000000001"
            className="px-6 py-3.5 rounded-xl glass-card text-slate-200 font-semibold text-base hover:bg-slate-800/60 transition-all flex items-center gap-2"
          >
            Try Customer Checkout UI
          </Link>
        </div>

        {/* Supported MFS Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400">
          <span className="px-3.5 py-1.5 rounded-lg bg-pink-950/40 border border-pink-700/30 text-pink-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span> bKash (Personal & Merchant)
          </span>
          <span className="px-3.5 py-1.5 rounded-lg bg-orange-950/40 border border-orange-700/30 text-orange-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Nagad (Auto TxnID)
          </span>
          <span className="px-3.5 py-1.5 rounded-lg bg-purple-950/40 border border-purple-700/30 text-purple-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> DBBL Rocket
          </span>
          <span className="px-3.5 py-1.5 rounded-lg bg-teal-950/40 border border-teal-700/30 text-teal-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span> Upay
          </span>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Why GM Pay is Miles Ahead</h2>
          <p className="text-slate-400 mt-2">Engineered specifically for dropshippers, SaaS platforms, and agency funnels.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart SIM Failover & Limits</h3>
            <p className="text-slate-400 text-sm">
              Never get blocked by bKash ৳25,000 daily limits again. GM Pay automatically routes incoming checkouts to your secondary active numbers in real-time.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sub-500ms Instant Match</h3>
            <p className="text-slate-400 text-sm">
              Our dual Android listener captures both SMS and push notifications. Orders are verified in milliseconds and trigger instant WooCommerce order completion.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Atomic Fraud & Replay Lock</h3>
            <p className="text-slate-400 text-sm">
              PostgreSQL row locking prevents fake TrxID reuse. If anyone attempts duplicate submission, their IP is immediately flagged and blocked.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Telegram Rich Alerts</h3>
            <p className="text-slate-400 text-sm">
              Get detailed receipt notifications directly in your private merchant Telegram group the second a customer sends payment.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1-Click WooCommerce Plugin</h3>
            <p className="text-slate-400 text-sm">
              Ready-to-install WordPress plugin with seamless popup modal, dynamic QR generation, and automatic HMAC-SHA256 webhook callback.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero Hosting Costs ($0)</h3>
            <p className="text-slate-400 text-sm">
              Hosted on Vercel Serverless Edge + Supabase Database free tier. Handles 500,000+ monthly requests without paying a dime in infrastructure costs.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">GM Pay vs Traditional Gateways</h2>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Feature</th>
                <th className="p-4 text-indigo-400 font-bold">GM Pay</th>
                <th className="p-4 text-slate-400">UddoktaPay / NagorikPay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-4 font-medium text-white">Monthly Hosting Cost</td>
                <td className="p-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> $0 (Free Forever)
                </td>
                <td className="p-4 text-slate-400">৳500 - ৳2,000 / month</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Smart Multi-SIM Failover</td>
                <td className="p-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Automated on Limit Reach
                </td>
                <td className="p-4 text-rose-400">Manual Switch Required</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Capture Method</td>
                <td className="p-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> SMS + App Push Notification
                </td>
                <td className="p-4 text-slate-400">SMS Only (Fails on delay)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Telegram Alerts</td>
                <td className="p-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Included Free
                </td>
                <td className="p-4 text-slate-400">Limited / Paid Addon</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 text-center text-xs text-slate-500">
        <p>© 2026 GM Pay — High Performance Payment Gateway. Built with Next.js, Supabase & Android Background Engine.</p>
      </footer>
    </div>
  );
}
