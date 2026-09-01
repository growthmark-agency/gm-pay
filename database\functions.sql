-- ==============================================================================
-- GM Pay Atomic Database Functions & Stored Procedures
-- High-concurrency TrxID Locking, Anti-Race Condition & Smart Wallet Rotation
-- ==============================================================================

-- 1. Atomic TrxID Verification & Locking Procedure
-- This runs in a single transaction with ROW LOCK to guarantee that no two customers
-- can ever claim the same TrxID simultaneously (Anti-Replay Attack).
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
    v_result JSONB;
    v_clean_trx TEXT;
    v_wallet RECORD;
BEGIN
    -- Standardize TrxID (Trim whitespace & uppercase)
    v_clean_trx := UPPER(TRIM(p_trx_id));

    -- Lock the payment session row
    SELECT * INTO v_session 
    FROM public.payment_sessions 
    WHERE id = p_session_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_NOT_FOUND', 'message', 'Payment session does not exist.');
    END IF;

    -- Check if session is already completed
    IF v_session.status = 'COMPLETED' THEN
        RETURN jsonb_build_object('success', true, 'status', 'COMPLETED', 'message', 'Session is already completed.');
    END IF;

    -- Check if session is expired
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

    -- Case 1: TrxID not found yet in SMS/Push pool
    IF NOT FOUND THEN
        -- Record the attempt in payment_sessions so when the SMS arrives later, we can auto-match
        UPDATE public.payment_sessions
        SET submitted_trx_id = v_clean_trx,
            updated_at = NOW()
        WHERE id = p_session_id;

        RETURN jsonb_build_object(
            'success', false, 
            'error', 'TRX_NOT_RECEIVED_YET', 
            'message', 'Transaction ID received. Waiting for mobile operator SMS confirmation.'
        );
    END IF;

    -- Case 2: TrxID is already used/matched by another order
    IF v_raw_tx.is_matched = TRUE AND v_raw_tx.matched_session_id <> p_session_id THEN
        -- Log fraud attempt
        INSERT INTO public.fraud_logs (merchant_id, session_id, trx_id, reason)
        VALUES (v_session.merchant_id, p_session_id, v_clean_trx, 'Duplicate TrxID submission attempt (Already claimed)');

        RETURN jsonb_build_object(
            'success', false, 
            'error', 'TRX_ALREADY_USED', 
            'message', 'This Transaction ID has already been verified for another order.'
        );
    END IF;

    -- Case 3: Amount mismatch check (allowing small precision tolerance)
    IF v_raw_tx.amount < v_session.amount THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'AMOUNT_MISMATCH', 
            'message', format('Paid amount (৳%s) is less than required order amount (৳%s).', v_raw_tx.amount, v_session.amount)
        );
    END IF;

    -- Case 4: SUCCESS! Match and Atomically Lock
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

    -- Increment wallet daily/monthly statistics
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


-- 2. Smart Wallet Failover Selector
-- Selects the highest priority active wallet for a given merchant and provider
-- that has NOT breached its daily or monthly limit.
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


-- 3. Reset Daily Wallet Limits (Scheduled at midnight 00:00 BST)
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
