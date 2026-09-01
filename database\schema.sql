-- ==============================================================================
-- GM Pay Database Schema (Supabase / PostgreSQL)
-- Multi-Wallet Automated Payment Gateway with Anti-Fraud & Realtime Locking
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Merchants & Store Accounts
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    api_key TEXT UNIQUE NOT NULL DEFAULT ('gmpay_live_' || encode(gen_random_bytes(16), 'hex')),
    api_secret TEXT NOT NULL DEFAULT ('gmpay_sec_' || encode(gen_random_bytes(24), 'hex')),
    sandbox_key TEXT UNIQUE NOT NULL DEFAULT ('gmpay_test_' || encode(gen_random_bytes(16), 'hex')),
    webhook_url TEXT,
    webhook_secret TEXT NOT NULL DEFAULT ('whsec_' || encode(gen_random_bytes(20), 'hex')),
    telegram_chat_id TEXT,
    telegram_bot_token TEXT,
    telegram_enabled BOOLEAN DEFAULT FALSE,
    plan_tier TEXT DEFAULT 'FREE' CHECK (plan_tier IN ('FREE', 'BASIC', 'PRO', 'ENTERPRISE')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Merchant Wallets (SIMs) with Smart Failover & Limit Monitoring
CREATE TABLE IF NOT EXISTS public.merchant_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('BKASH', 'NAGAD', 'ROCKET', 'UPAY')),
    wallet_type TEXT NOT NULL DEFAULT 'PERSONAL' CHECK (wallet_type IN ('PERSONAL', 'MERCHANT', 'AGENT')),
    phone_number TEXT NOT NULL,
    account_name TEXT,
    qr_code_url TEXT,
    daily_limit NUMERIC NOT NULL DEFAULT 25000.00,
    monthly_limit NUMERIC NOT NULL DEFAULT 100000.00,
    current_daily_total NUMERIC NOT NULL DEFAULT 0.00,
    current_monthly_total NUMERIC NOT NULL DEFAULT 0.00,
    daily_txn_count INT NOT NULL DEFAULT 0,
    max_daily_txn_count INT NOT NULL DEFAULT 50,
    priority INT NOT NULL DEFAULT 1, -- 1 = highest priority
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_health_ping TIMESTAMPTZ,
    device_id TEXT,
    battery_level INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_merchant_provider_number UNIQUE (merchant_id, provider, phone_number)
);

-- 3. Raw Ingested Transactions (From Android Listener SMS / Push Notifications)
CREATE TABLE IF NOT EXISTS public.raw_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.merchant_wallets(id) ON DELETE SET NULL,
    provider TEXT NOT NULL CHECK (provider IN ('BKASH', 'NAGAD', 'ROCKET', 'UPAY')),
    trx_id TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    sender_number TEXT,
    receiver_number TEXT,
    raw_message TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_matched BOOLEAN NOT NULL DEFAULT FALSE,
    matched_at TIMESTAMPTZ,
    matched_session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_merchant_trx_provider UNIQUE (merchant_id, provider, trx_id)
);

-- 4. Customer Payment Sessions
CREATE TABLE IF NOT EXISTS public.payment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    assigned_wallet_id UUID REFERENCES public.merchant_wallets(id) ON DELETE SET NULL,
    order_id TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'BDT',
    provider TEXT NOT NULL CHECK (provider IN ('BKASH', 'NAGAD', 'ROCKET', 'UPAY')),
    payment_method TEXT NOT NULL DEFAULT 'SEND_MONEY' CHECK (payment_method IN ('SEND_MONEY', 'PAYMENT', 'CASH_IN')),
    submitted_trx_id TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'EXPIRED', 'FAILED', 'FRAUD_FLAGGED')),
    matched_raw_id UUID REFERENCES public.raw_transactions(id),
    redirect_url TEXT,
    cancel_url TEXT,
    ip_address TEXT,
    user_agent TEXT,
    webhook_delivered BOOLEAN NOT NULL DEFAULT FALSE,
    webhook_attempts INT NOT NULL DEFAULT 0,
    webhook_response_code INT,
    webhook_last_attempt TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '20 minutes'),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Anti-Fraud Logs & Blacklisted IPs / TrxIDs
CREATE TABLE IF NOT EXISTS public.fraud_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.payment_sessions(id) ON DELETE SET NULL,
    trx_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    reason TEXT NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Webhook Delivery Audit Log
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.payment_sessions(id) ON DELETE CASCADE,
    endpoint_url TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_code INT,
    response_body TEXT,
    is_success BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR ULTRA-FAST QUERY PERFORMANCE (< 5ms Lookup)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_raw_tx_lookup ON public.raw_transactions(merchant_id, provider, trx_id, is_matched);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON public.payment_sessions(merchant_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_order ON public.payment_sessions(merchant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_wallets_active ON public.merchant_wallets(merchant_id, provider, is_active, priority);
CREATE INDEX IF NOT EXISTS idx_merchants_api_key ON public.merchants(api_key);
CREATE INDEX IF NOT EXISTS idx_merchants_sandbox_key ON public.merchants(sandbox_key);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Allow merchants to read/update their own data
CREATE POLICY "Merchants own record access" ON public.merchants
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Wallets access for merchant" ON public.merchant_wallets
    FOR ALL USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Sessions access for merchant" ON public.payment_sessions
    FOR ALL USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Raw TX access for merchant" ON public.raw_transactions
    FOR ALL USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- Public can read active checkout session by session_id (Public checkout page)
CREATE POLICY "Public checkout view" ON public.payment_sessions
    FOR SELECT USING (TRUE);
