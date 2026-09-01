# GM Pay Official WooCommerce Payment Gateway Plugin

Integrate bKash, Nagad, Rocket, and Upay automated payment verification on your WooCommerce store with zero fees and sub-500ms auto confirmation.

---

## 🚀 1-Click Installation Guide

1. Download or zip the `gm-pay-gateway` folder into `gm-pay-gateway.zip`.
2. In your WordPress Admin Dashboard, navigate to:
   **Plugins → Add New Plugin → Upload Plugin**.
3. Select `gm-pay-gateway.zip` and click **Install Now** → **Activate Plugin**.
4. Navigate to:
   **WooCommerce → Settings → Payments → GM Pay → Manage**.
5. Configure your credentials:
   - **GM Pay Server URL**: `https://your-gmpay.vercel.app` (or your custom domain)
   - **API Key**: Found in your GM Pay Merchant Portal (*Developer API* tab)
   - **API Secret**: Found in your GM Pay Merchant Portal
   - **Webhook Secret**: Your HMAC signing secret
6. Set Webhook URL in your GM Pay Merchant Portal:
   `https://yourwordpresssite.com/wp-json/gm-pay/v1/webhook`
7. Click **Save changes**. You're now live!
