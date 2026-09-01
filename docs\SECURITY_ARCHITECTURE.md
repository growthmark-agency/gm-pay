# GM Pay Security Architecture & Anti-Fraud Engine

GM Pay is engineered with banking-grade security principles to prevent replay attacks, fraudulent TrxID recycling, amount spoofing, and timing attacks.

---

## 1. Atomic Transaction Locking (Anti-Replay Attack)
- Traditional gateways match TrxIDs using simple `SELECT ... UPDATE` queries which are vulnerable to race conditions if multiple users submit the same TrxID at the same millisecond.
- GM Pay utilizes PostgreSQL `SELECT ... FOR UPDATE` with atomic Row-Level Locking in `database/functions.sql`.
- When a TrxID is claimed, it is immediately flagged as `is_matched = TRUE` and tied to the specific `session_id`. Any subsequent submission with the same TrxID is rejected and flagged as fraud in `fraud_logs`.

---

## 2. Amount Integrity Verification
- Even if a user guesses a valid TrxID from another transaction, GM Pay checks the exact amount paid in the raw SMS vs the order total:
  ```
  IF raw_tx.amount < session.amount THEN REJECT WITH "INSUFFICIENT_AMOUNT"
  ```
- This prevents a customer who paid ৳50 from claiming an order worth ৳5,000.

---

## 3. Webhook Integrity (HMAC-SHA256 Signatures)
- All webhooks dispatched from GM Pay to WordPress or custom client sites carry an `X-GM-Pay-Signature` header calculated using `HMAC-SHA256(payload, webhook_secret)`.
- The WooCommerce plugin verifies the HMAC signature using constant-time string comparison (`hash_equals`) before updating any order status.

---

## 4. IP & Brute Force Rate Limiting
- Payment sessions expire strictly after 20 minutes (`expires_at < NOW()`).
- Repeated failed TrxID attempts from the same IP address trigger automatic temporary rate-limiting.
