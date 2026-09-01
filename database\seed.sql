-- ==============================================================================
-- GM Pay Seed Data (Sandbox / Testing)
-- ==============================================================================

-- 1. Insert Demo Merchant
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
    'GrowthMark Demo Store',
    'merchant@growthmark.io',
    '01711000000',
    'gmpay_live_9f8382c7361a4c9e81b2a9d827f61c34',
    'gmpay_sec_5b821a9c34e8f192b3a7d9e0123456789abcdef012345678',
    'gmpay_test_1234567890abcdef12345678',
    'https://example.com/wp-json/gm-pay/v1/webhook',
    'whsec_9876543210abcdef9876543210abcdef98765432',
    TRUE,
    'PRO',
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Multi-Wallets with Limit Configuration
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
    'GrowthMark Primary bKash',
    25000.00,
    100000.00,
    4500.00,
    32000.00,
    4,
    1,
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'BKASH',
    'PERSONAL',
    '01798765432',
    'GrowthMark Backup bKash',
    25000.00,
    100000.00,
    0.00,
    12000.00,
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
    'GrowthMark Nagad Wallet',
    50000.00,
    200000.00,
    1200.00,
    18500.00,
    1,
    1,
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'ROCKET',
    'PERSONAL',
    '019123456789',
    'GrowthMark Rocket Wallet',
    30000.00,
    150000.00,
    0.00,
    0.00,
    0,
    1,
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Sample Test Raw Transaction (Simulating Received SMS from Android Listener)
INSERT INTO public.raw_transactions (
    id,
    merchant_id,
    wallet_id,
    provider,
    trx_id,
    amount,
    sender_number,
    receiver_number,
    raw_message,
    is_matched,
    received_at
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'BKASH',
    'BL38A7K9Q2',
    1250.00,
    '01712345678',
    '01812345678',
    'You have received Tk 1,250.00 from 01712345678. Ref: GM-ORDER. Fee Tk 0.00. Balance Tk 14,350.00. TrxID BL38A7K9Q2 at 01/09/2026 18:15',
    FALSE,
    NOW() - INTERVAL '2 minutes'
) ON CONFLICT (id) DO NOTHING;
