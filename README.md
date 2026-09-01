# GM Pay — Next-Gen Automated Payment Gateway

**GM Pay** is an automated, zero-delay payment gateway platform designed specifically for Bangladeshi dropshippers, SaaS products, and agency funnels. Automate personal and merchant bKash, Nagad, DBBL Rocket, and Upay payments at **$0 hosting cost**.

---

## 📁 Repository Structure
```
GM-Pay/
├── web/                   # Next.js 15 (App Router) Merchant Portal, Dynamic Checkout & API Engine
│   ├── src/app/checkout/  # Ultra-smooth dynamic customer checkout modal
│   ├── src/app/dashboard/ # Merchant portal (Analytics, Wallets, Trx Explorer, API keys, Telegram bot)
│   └── src/app/api/v1/    # Serverless API endpoints for WooCommerce, Android listener & checkout
├── android-listener/      # Native Kotlin background agent (SMS + Push Notification listener)
├── woocommerce-plugin/    # Official WordPress / WooCommerce payment gateway plugin
├── database/              # PostgreSQL schema, atomic functions & seed data for Supabase
└── docs/                  # API Reference, Zero-Cost Deployment Guide & Security Architecture
```

---

## ⚡ Quick Start (Local Development)

### 1. Launch Web & Merchant Dashboard:
```bash
cd web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the Landing Page, or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the Merchant Portal.

### 2. Try the Live Checkout Demo:
Open [http://localhost:3000/checkout/d0000000-0000-0000-0000-000000000001](http://localhost:3000/checkout/d0000000-0000-0000-0000-000000000001).

---

## 🌟 Key Innovations
1. **Smart SIM Failover**: Automatically switches checkout traffic to secondary active SIMs when daily/monthly limits are reached.
2. **Sub-500ms Auto Match**: Dual interception of SMS and Official App Push notifications.
3. **Atomic Fraud Lock**: Prevents duplicate TrxID submissions with Postgres row locks.
4. **Instant Telegram Alerts**: Sends rich payment receipts directly to your merchant Telegram group.
5. **Zero Infrastructure Cost**: 100% free-tier ready on Supabase and Vercel.
