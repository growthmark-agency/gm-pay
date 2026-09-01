# GM Pay Zero-Cost Deployment Guide

Deploy your entire payment gateway infrastructure for **$0 / month** using Supabase Free Tier + Vercel Serverless.

---

## Step 1: Database Setup on Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** (Choose Region: `ap-southeast-1 Singapore` for lowest latency to Bangladesh).
3. Open **SQL Editor** in Supabase:
   - Copy contents of `database/schema.sql` and click **Run**.
   - Copy contents of `database/functions.sql` and click **Run**.
   - (Optional) Copy contents of `database/seed.sql` to populate sample test data.
4. Go to **Project Settings → API**:
   - Copy `Project URL`
   - Copy `anon public` key
   - Copy `service_role secret` key

---

## Step 2: Deploy Web & Core Engine to Vercel (Free Tier)
1. Push this repository to your GitHub account (`https://github.com/your-username/gm-pay`).
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Select the `gm-pay` repo, and set the **Root Directory** to `web`.
4. Configure Environment Variables in Vercel:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=https://your-custom-domain.vercel.app
   LISTENER_INGEST_SECRET=your_custom_secure_secret
   ```
5. Click **Deploy**. Your gateway will be live in 60 seconds with SSL, global CDN, and automatic edge scaling!

---

## Step 3: Install Android Listener on Merchant Phone
1. Install the `gm-pay-listener.apk` on your merchant Android phone.
2. Open the Merchant Portal at `https://your-domain.vercel.app/dashboard/listener`.
3. Open the app on your phone and scan the QR code to pair automatically.
4. Follow the on-screen prompt to grant Notification & SMS permissions and disable Battery Optimization.

---

## Step 4: Install WooCommerce Plugin on Client Stores
1. Download `woocommerce-plugin/gm-pay-gateway.zip`.
2. Install & Activate on your WordPress site.
3. Paste your API Key & Webhook Secret into WooCommerce Settings → Payments → GM Pay.
