-- ==============================================================================
-- GM PAY PRODUCTION DATABASE SETUP (SUPABASE POSTGRESQL)
-- Multi-Tenant, Multi-Wallet Automated Payment Gateway with Atomic Anti-Fraud Locks
-- ==============================================================================

-- 1. Enable Required Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLES DEFINITION
-- ==============================================================================

-- 1. Merchants Table (Multi-Client / Agency Tenants)
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    plan_tier TEXT DEFAULT 'PRO' CHECK (plan_tier IN ('FREE', 'BASIC', 'PRO', 'ENTERPRISE')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Merchant Wallets (SIM Cards with Smart Limit Failover)
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
    priority INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_health_ping TIMESTAMPTZ,
    device_id TEXT,
    battery_level INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_merchant_provider_number UNIQUE (merchant_id, provider, phone_number)
);

-- 3. Ingested SMS / Push Notification Pool (From Android Listener)
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
    payment_method TEXT NOT NULL DEFAULT 'SEND_MONEY' CHECK (payment_method IN ('SEND_MONEY', 'PAYMENT')),
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

-- 5. Anti-Fraud & Replay Attack Defense Table
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

-- 6. Webhook Audit Logs
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
-- ULTRA-FAST QUERY INDEXES (< 2ms Response Time)
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

-- Allow Service Role full access
CREATE POLICY "Service role full access on merchants" ON public.merchants FOR ALL TO service_role USING (TRUE);
CREATE POLICY "Service role full access on wallets" ON public.merchant_wallets FOR ALL TO service_role USING (TRUE);
CREATE POLICY "Service role full access on raw_transactions" ON public.raw_transactions FOR ALL TO service_role USING (TRUE);
CREATE POLICY "Service role full access on payment_sessions" ON public.payment_sessions FOR ALL TO service_role USING (TRUE);
CREATE POLICY "Service role full access on fraud_logs" ON public.fraud_logs FOR ALL TO service_role USING (TRUE);
CREATE POLICY "Service role full access on webhook_logs" ON public.webhook_logs FOR ALL TO service_role USING (TRUE);

-- Public checkout view access
CREATE POLICY "Public checkout view access" ON public.payment_sessions FOR SELECT TO anon, authenticated USING (TRUE);

-- ==============================================================================
-- ATOMIC STORED PROCEDURES (ANTI-RACE CONDITION & SMART FAILOVER)
-- ==============================================================================

-- 1. Atomic TrxID Verification & Locking Procedure
CREATE OR REPLACE FUNCTION public.verify_and_lock_trxid(
    p_session_id UUID,
    p_trx_id TEXT,
    p_provider TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_raw_tx RECORD;
    v_clean_trx TEXT;
BEGIN
    v_clean_trx := UPPER(TRIM(p_trx_id));

    -- Lock the payment session row
    SELECT * INTO v_session 
    FROM public.payment_sessions 
    WHERE id = p_session_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_NOT_FOUND', 'message', 'Payment session does not exist.');
    END IF;

    IF v_session.status = 'COMPLETED' THEN
        RETURN jsonb_build_object('success', true, 'status', 'COMPLETED', 'message', 'Session is already completed.');
    END IF;

    IF v_session.expires_at < NOW() THEN
        UPDATE public.payment_sessions 
        SET status = 'EXPIRED', updated_at = NOW() 
        WHERE id = p_session_id;
        
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_EXPIRED', 'message', 'Payment session has expired.');
    END IF;

    -- Look for the TrxID in the raw_transactions pool with ROW LOCK
    SELECT * INTO v_raw_tx
    FROM public.raw_transactions
    WHERE merchant_id = v_session.merchant_id
      AND provider = UPPER(p_provider)
      AND trx_id = v_clean_trx
    FOR UPDATE;

    IF NOT FOUND THEN
        UPDATE public.payment_sessions
        SET submitted_trx_id = v_clean_trx,
            updated_at = NOW()
        WHERE id = p_session_id;

        RETURN jsonb_build_object(
            'success', false, 
            'error', 'TRX_NOT_RECEIVED_YET', 
            'message', 'Transaction ID recorded. Waiting for SMS confirmation from operator.'
        );
    END IF;

    IF v_raw_tx.is_matched = TRUE AND v_raw_tx.matched_session_id <> p_session_id THEN
        INSERT INTO public.fraud_logs (merchant_id, session_id, trx_id, reason)
        VALUES (v_session.merchant_id, p_session_id, v_clean_trx, 'Duplicate TrxID submission attempt (Already claimed)');

        RETURN jsonb_build_object(
            'success', false, 
            'error', 'TRX_ALREADY_USED', 
            'message', 'This Transaction ID has already been verified for another transaction.'
        );
    END IF;

    IF v_raw_tx.amount < v_session.amount THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'AMOUNT_MISMATCH', 
            'message', format('Paid amount (৳%s) is less than required order amount (৳%s).', v_raw_tx.amount, v_session.amount)
        );
    END IF;

    -- Success! Lock and Complete
    UPDATE public.raw_transactions
    SET is_matched = TRUE,
        matched_at = NOW(),
        matched_session_id = p_session_id
    WHERE id = v_raw_tx.id;

    UPDATE public.payment_sessions
    SET status = 'COMPLETED',
        submitted_trx_id = v_clean_trx,
        matched_raw_id = v_raw_tx.id,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_session_id;

    IF v_session.assigned_wallet_id IS NOT NULL THEN
        UPDATE public.merchant_wallets
        SET current_daily_total = current_daily_total + v_session.amount,
            current_monthly_total = current_monthly_total + v_session.amount,
            daily_txn_count = daily_txn_count + 1,
            updated_at = NOW()
        WHERE id = v_session.assigned_wallet_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'status', 'COMPLETED', 
        'trx_id', v_clean_trx,
        'amount', v_raw_tx.amount,
        'sender_number', v_raw_tx.sender_number,
        'completed_at', NOW(),
        'message', 'Payment successfully verified and locked!'
    );
END;
$$;


-- 2. Smart SIM Failover Selector
CREATE OR REPLACE FUNCTION public.get_available_wallet(
    p_merchant_id UUID,
    p_provider TEXT,
    p_amount NUMERIC
)
RETURNS TABLE (
    wallet_id UUID,
    phone_number TEXT,
    wallet_type TEXT,
    account_name TEXT,
    qr_code_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.phone_number,
        w.wallet_type,
        w.account_name,
        w.qr_code_url
    FROM public.merchant_wallets w
    WHERE w.merchant_id = p_merchant_id
      AND w.provider = UPPER(p_provider)
      AND w.is_active = TRUE
      AND (w.current_daily_total + p_amount) <= w.daily_limit
      AND (w.current_monthly_total + p_amount) <= w.monthly_limit
      AND w.daily_txn_count < w.max_daily_txn_count
    ORDER BY w.priority ASC, w.current_daily_total ASC
    LIMIT 1;
END;
$$;


-- 3. Reset Daily Limit Counters (Scheduled at 00:00 BST)
CREATE OR REPLACE FUNCTION public.reset_daily_wallet_counters()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.merchant_wallets
    SET current_daily_total = 0,
        daily_txn_count = 0,
        updated_at = NOW();
END;
$$;

-- ==============================================================================
-- INITIAL SEED DATA (PRODUCTION-READY DEFAULT MERCHANT & WALLETS)
-- ==============================================================================

INSERT INTO public.merchants (
    id,
    business_name,
    email,
    phone,
    api_key,
    api_secret,
    sandbox_key,
    webhook_url,
    webhook_secret,
    telegram_enabled,
    plan_tier,
    status
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'GrowthMark Agency',
    'merchant@growthmark.pro',
    '01711000000',
    'gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34',
    'gmpay_sec_5b821a9c34e8f192b3a7d9e0123456789abcdef012345678',
    'gmpay_test_1234567890abcdef12345678',
    'https://growthmark.pro/wp-json/gm-pay/v1/webhook',
    'whsec_9876543210abcdef9876543210abcdef98765432',
    TRUE,
    'PRO',
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.merchant_wallets (
    id,
    merchant_id,
    provider,
    wallet_type,
    phone_number,
    account_name,
    daily_limit,
    monthly_limit,
    current_daily_total,
    current_monthly_total,
    daily_txn_count,
    priority,
    is_active
) VALUES 
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'BKASH',
    'PERSONAL',
    '01812345678',
    'Primary bKash Personal',
    25000.00,
    100000.00,
    6500.00,
    42000.00,
    5,
    1,
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'BKASH',
    'PERSONAL',
    '01798765432',
    'Backup bKash Personal (Auto-Failover)',
    25000.00,
    100000.00,
    0.00,
    15000.00,
    0,
    2,
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'NAGAD',
    'PERSONAL',
    '01612345678',
    'Primary Nagad Wallet',
    50000.00,
    200000.00,
    3400.00,
    28900.00,
    3,
    1,
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'ROCKET',
    'PERSONAL',
    '019123456789',
    'Primary DBBL Rocket',
    30000.00,
    150000.00,
    0.00,
    5000.00,
    0,
    1,
    TRUE
) ON CONFLICT (id) DO NOTHING;
