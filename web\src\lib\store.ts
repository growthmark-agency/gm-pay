export interface Merchant {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  apiKey: string;
  apiSecret: string;
  sandboxKey: string;
  webhookUrl: string;
  webhookSecret: string;
  telegramChatId?: string;
  telegramBotToken?: string;
  telegramEnabled: boolean;
  planTier: "FREE" | "BASIC" | "PRO";
  status: "ACTIVE" | "SUSPENDED";
}

export interface MerchantWallet {
  id: string;
  merchantId: string;
  provider: "BKASH" | "NAGAD" | "ROCKET" | "UPAY";
  walletType: "PERSONAL" | "MERCHANT" | "AGENT";
  phoneNumber: string;
  accountName: string;
  qrCodeUrl?: string;
  dailyLimit: number;
  monthlyLimit: number;
  currentDailyTotal: number;
  currentMonthlyTotal: number;
  dailyTxnCount: number;
  maxDailyTxnCount: number;
  priority: number;
  isActive: boolean;
  lastHealthPing?: string;
  batteryLevel?: number;
}

export interface RawTransaction {
  id: string;
  merchantId: string;
  walletId?: string;
  provider: "BKASH" | "NAGAD" | "ROCKET" | "UPAY";
  trxId: string;
  amount: number;
  senderNumber?: string;
  receiverNumber?: string;
  rawMessage: string;
  receivedAt: string;
  isMatched: boolean;
  matchedSessionId?: string;
}

export interface PaymentSession {
  id: string;
  merchantId: string;
  assignedWalletId?: string;
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  provider: "BKASH" | "NAGAD" | "ROCKET" | "UPAY";
  paymentMethod: "SEND_MONEY" | "PAYMENT";
  submittedTrxId?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "EXPIRED" | "FAILED" | "FRAUD_FLAGGED";
  matchedRawId?: string;
  redirectUrl?: string;
  cancelUrl?: string;
  webhookDelivered: boolean;
  webhookAttempts: number;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
}

// Global In-Memory Database for local dev & lightning demo
class GMDataStore {
  public merchants: Merchant[] = [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      businessName: "GrowthMark Agency",
      email: "merchant@growthmark.io",
      phone: "01711000000",
      apiKey: "gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34",
      apiSecret: "gmpay_sec_5b821a9c34e8f192b3a7d9e0123456789abcdef012345678",
      sandboxKey: "gmpay_test_1234567890abcdef12345678",
      webhookUrl: "http://localhost:3000/api/v1/webhooks/test",
      webhookSecret: "whsec_9876543210abcdef9876543210abcdef98765432",
      telegramEnabled: true,
      telegramChatId: "",
      telegramBotToken: "",
      planTier: "PRO",
      status: "ACTIVE",
    },
  ];

  public wallets: MerchantWallet[] = [
    {
      id: "b0000000-0000-0000-0000-000000000001",
      merchantId: "a0000000-0000-0000-0000-000000000001",
      provider: "BKASH",
      walletType: "PERSONAL",
      phoneNumber: "01812345678",
      accountName: "Primary bKash Personal",
      dailyLimit: 25000,
      monthlyLimit: 100000,
      currentDailyTotal: 6500,
      currentMonthlyTotal: 42000,
      dailyTxnCount: 5,
      maxDailyTxnCount: 50,
      priority: 1,
      isActive: true,
      batteryLevel: 94,
      lastHealthPing: new Date().toISOString(),
    },
    {
      id: "b0000000-0000-0000-0000-000000000002",
      merchantId: "a0000000-0000-0000-0000-000000000001",
      provider: "BKASH",
      walletType: "PERSONAL",
      phoneNumber: "01798765432",
      accountName: "Backup bKash Personal (Failover)",
      dailyLimit: 25000,
      monthlyLimit: 100000,
      currentDailyTotal: 0,
      currentMonthlyTotal: 15000,
      dailyTxnCount: 0,
      maxDailyTxnCount: 50,
      priority: 2,
      isActive: true,
      batteryLevel: 88,
      lastHealthPing: new Date().toISOString(),
    },
    {
      id: "b0000000-0000-0000-0000-000000000003",
      merchantId: "a0000000-0000-0000-0000-000000000001",
      provider: "NAGAD",
      walletType: "PERSONAL",
      phoneNumber: "01612345678",
      accountName: "Primary Nagad Wallet",
      dailyLimit: 50000,
      monthlyLimit: 200000,
      currentDailyTotal: 3400,
      currentMonthlyTotal: 28900,
      dailyTxnCount: 3,
      maxDailyTxnCount: 50,
      priority: 1,
      isActive: true,
      batteryLevel: 91,
      lastHealthPing: new Date().toISOString(),
    },
    {
      id: "b0000000-0000-0000-0000-000000000004",
      merchantId: "a0000000-0000-0000-0000-000000000001",
      provider: "ROCKET",
      walletType: "PERSONAL",
      phoneNumber: "019123456789",
      accountName: "Primary Rocket Wallet",
      dailyLimit: 30000,
      monthlyLimit: 150000,
      currentDailyTotal: 0,
      currentMonthlyTotal: 5000,
      dailyTxnCount: 0,
      maxDailyTxnCount: 50,
      priority: 1,
      isActive: true,
      batteryLevel: 95,
      lastHealthPing: new Date().toISOString(),
    },
  ];

  public rawTransactions: RawTransaction[] = [
    {
      id: "c0000000-0000-0000-0000-000000000001",
      merchantId: "a0000000-0000-0000-0000-000000000001",
      walletId: "b0000000-0000-0000-0000-000000000001",
      provider: "BKASH",
      trxId: "BL38A7K9Q2",
      amount: 1250,
      senderNumber: "01712345678",
      receiverNumber: "01812345678",
      rawMessage: "You have received Tk 1,250.00 from 01712345678. Ref: GM-ORDER. Fee Tk 0.00. Balance Tk 14,350.00. TrxID BL38A7K9Q2 at 01/09/2026 18:15",
      receivedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      isMatched: false,
    },
  ];

  public sessions: PaymentSession[] = [
    {
      id: "d0000000-0000-0000-0000-000000000001",
      merchantId: "a0000000-0000-0000-0000-000000000001",
      assignedWalletId: "b0000000-0000-0000-0000-000000000001",
      orderId: "ORD-98213",
      customerName: "Rahim Ahmed",
      customerPhone: "01712345678",
      customerEmail: "rahim@example.com",
      amount: 1250,
      currency: "BDT",
      provider: "BKASH",
      paymentMethod: "SEND_MONEY",
      status: "PENDING",
      webhookDelivered: false,
      webhookAttempts: 0,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  // Helper: Find next available wallet with smart failover
  getAvailableWallet(merchantId: string, provider: "BKASH" | "NAGAD" | "ROCKET" | "UPAY", amount: number): MerchantWallet | null {
    const candidates = this.wallets
      .filter(
        (w) =>
          w.merchantId === merchantId &&
          w.provider === provider &&
          w.isActive &&
          w.currentDailyTotal + amount <= w.dailyLimit &&
          w.currentMonthlyTotal + amount <= w.monthlyLimit &&
          w.dailyTxnCount < w.maxDailyTxnCount
      )
      .sort((a, b) => a.priority - b.priority || a.currentDailyTotal - b.currentDailyTotal);

    return candidates[0] || null;
  }
}

// Singleton reference
const globalForStore = globalThis as unknown as { gmStore: GMDataStore };
export const db = globalForStore.gmStore || new GMDataStore();
if (process.env.NODE_ENV !== "production") globalForStore.gmStore = db;
