"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";

interface SessionData {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  provider: "BKASH" | "NAGAD" | "ROCKET" | "UPAY";
  payment_method: "SEND_MONEY" | "PAYMENT";
  payment_number: string;
  account_name: string;
  status: "PENDING" | "COMPLETED" | "EXPIRED";
  submitted_trx_id?: string;
  redirect_url?: string;
  expires_at: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"instruction" | "qr">("instruction");
  const [trxId, setTrxId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // seconds
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch session data
  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/v1/checkout/status/${sessionId}`);
      const json = await res.json();
      if (json.success) {
        setSession(json.data);
        if (json.data.status === "COMPLETED") {
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.error("Failed to load session", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // Auto-poll status every 3 seconds
    const interval = setInterval(() => {
      if (!isCompleted) fetchSession();
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, isCompleted]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, type: "number" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "number") {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  // Verify TrxID
  const handleVerify = async (overrideTrx?: string) => {
    const idToVerify = overrideTrx || trxId;
    if (!idToVerify.trim()) {
      setErrorMsg("Please enter your Transaction ID (TrxID)");
      return;
    }

    setVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/checkout/verify-trxid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          trx_id: idToVerify.trim(),
          provider: session?.provider,
        }),
      });

      const data = await res.json();

      if (data.success && data.status === "COMPLETED") {
        setIsCompleted(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Redirect after 3 seconds if redirect_url exists
        if (data.data?.redirect_url) {
          setTimeout(() => {
            window.location.href = data.data.redirect_url;
          }, 3000);
        }
      } else {
        setErrorMsg(data.message || "Verification in progress. Please wait a moment.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify transaction");
    } finally {
      setVerifying(false);
    }
  };

  // Provider styles
  const getProviderConfig = (provider?: string) => {
    switch (provider) {
      case "BKASH":
        return {
          name: "bKash",
          bgGradient: "from-pink-600 to-rose-700",
          accentColor: "text-pink-400",
          borderGlow: "border-pink-500/30",
          buttonColor: "bg-pink-600 hover:bg-pink-500",
          badgeBg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        };
      case "NAGAD":
        return {
          name: "Nagad",
          bgGradient: "from-orange-600 to-amber-700",
          accentColor: "text-orange-400",
          borderGlow: "border-orange-500/30",
          buttonColor: "bg-orange-600 hover:bg-orange-500",
          badgeBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        };
      case "ROCKET":
        return {
          name: "Rocket",
          bgGradient: "from-purple-600 to-indigo-800",
          accentColor: "text-purple-400",
          borderGlow: "border-purple-500/30",
          buttonColor: "bg-purple-600 hover:bg-purple-500",
          badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        };
      default:
        return {
          name: "MFS Payment",
          bgGradient: "from-indigo-600 to-slate-800",
          accentColor: "text-indigo-400",
          borderGlow: "border-indigo-500/30",
          buttonColor: "bg-indigo-600 hover:bg-indigo-500",
          badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        };
    }
  };

  const pConfig = getProviderConfig(session?.provider);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Invalid Payment Session</h2>
          <p className="text-slate-400 text-sm mt-2">This payment link has expired or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glow-mesh py-8 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-md glass-card rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 relative">
        {/* Header Ribbon */}
        <div className={`p-5 bg-gradient-to-r ${pConfig.bgGradient} text-white relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-base">
                GM
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">{pConfig.name} Payment</h1>
                <p className="text-xs text-white/80">Order #{session.order_id}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/70 flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5" />
                <span>Expires in</span>
              </div>
              <div className="font-mono font-bold text-sm tracking-wider text-white">
                {formatTimer(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* SUCCESS STATE */}
          {isCompleted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Payment Verified!</h2>
              <p className="text-slate-300 text-sm">
                Thank you, your payment of <strong className="text-emerald-400">৳{session.amount.toLocaleString()}</strong> has been automatically confirmed.
              </p>
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                TrxID: <span className="text-indigo-400 font-semibold">{session.submitted_trx_id || trxId || "VERIFIED"}</span>
              </div>
              <button
                onClick={() => {
                  if (session.redirect_url) window.location.href = session.redirect_url;
                  else router.push("/");
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                Return to Store
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Amount Display */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Payable Amount</span>
                  <div className="text-2xl font-black text-white flex items-center gap-1">
                    ৳{session.amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(String(session.amount), "amount")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAmount ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Step Navigation Tabs */}
              <div className="flex rounded-xl bg-slate-900/60 p-1 border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setSelectedTab("instruction")}
                  className={`flex-1 py-2 rounded-lg transition-all text-center ${
                    selectedTab === "instruction" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  1. Send Money (Manual)
                </button>
                <button
                  onClick={() => setSelectedTab("qr")}
                  className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                    selectedTab === "qr" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  2. Scan QR Code
                </button>
              </div>

              {/* Tab 1: Manual Send Money */}
              {selectedTab === "instruction" ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>{pConfig.name} {session.payment_method === "PAYMENT" ? "Merchant" : "Personal"} Number</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${pConfig.badgeBg}`}>
                        {session.payment_method === "PAYMENT" ? "Make Payment" : "Send Money"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-black text-white tracking-wider">
                        {session.payment_number || "01812345678"}
                      </span>
                      <button
                        onClick={() => copyToClipboard(session.payment_number || "01812345678", "number")}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                      >
                        {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNumber ? "Copied" : "Copy Number"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1.5 pl-1">
                    <p className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      Open {pConfig.name} App or dial USSD (*247# / *167#).
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      Send exact <strong className="text-slate-200">৳{session.amount}</strong> to the number above.
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      Enter the received <strong className="text-indigo-400">TrxID</strong> below to confirm.
                    </p>
                  </div>
                </div>
              ) : (
                /* Tab 2: Dynamic QR Code */
                <div className="text-center py-2 space-y-3">
                  <div className="p-3 bg-white rounded-2xl inline-block shadow-lg">
                    <QRCodeSVG
                      value={`${session.provider.toLowerCase()}://payment?recipient=${session.payment_number}&amount=${session.amount}`}
                      size={160}
                      level="H"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Scan with your <strong>{pConfig.name} App</strong> to pay ৳{session.amount} instantly.
                  </p>
                </div>
              )}

              {/* TrxID Verification Form */}
              <div className="pt-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => {
                      setTrxId(e.target.value.toUpperCase());
                      setErrorMsg("");
                    }}
                    placeholder="e.g. BL38A7K9Q2"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  onClick={() => handleVerify()}
                  disabled={verifying}
                  className={`w-full py-3.5 rounded-xl ${pConfig.buttonColor} text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying with Bank...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify & Complete Payment
                    </>
                  )}
                </button>
              </div>

              {/* Sandbox Quick Simulator Tool for Testing */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sandbox Test Mode</span>
                </div>
                <button
                  onClick={() => {
                    setTrxId("BL38A7K9Q2");
                    handleVerify("BL38A7K9Q2");
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  Auto-Fill Seed TrxID
                </button>
              </div>
            </>
          )}
        </div>

        {/* Secure Footer */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800/80 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured by GM Pay Sub-500ms Realtime Engine</span>
        </div>
      </div>
    </div>
  );
}
