# GM Pay Developer API Reference (v1.0)

Base URL: `https://your-domain.vercel.app/api/v1`

---

## 1. Create Payment Session
Initializes a new payment session for checkout.

- **Endpoint:** `POST /api/v1/checkout/create-session`
- **Headers:** `Authorization: Bearer <MERCHANT_API_KEY>`

### Request Body:
```json
{
  "amount": 1250.00,
  "order_id": "ORD-98213",
  "customer_name": "Rahim Ahmed",
  "customer_phone": "01712345678",
  "customer_email": "rahim@example.com",
  "provider": "BKASH",
  "redirect_url": "https://mystore.com/checkout/order-received/98213",
  "cancel_url": "https://mystore.com/cart"
}
```

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "session_id": "d0000000-0000-0000-0000-000000000001",
    "checkout_url": "https://your-domain.vercel.app/checkout/d0000000-0000-0000-0000-000000000001",
    "amount": 1250,
    "currency": "BDT",
    "order_id": "ORD-98213",
    "provider": "BKASH",
    "payment_number": "01812345678",
    "payment_method": "SEND_MONEY",
    "expires_at": "2026-09-01T18:45:00.000Z"
  }
}
```

---

## 2. Verify Transaction ID (TrxID)
Instant sub-500ms matching against received SMS/push notifications.

- **Endpoint:** `POST /api/v1/checkout/verify-trxid`

### Request Body:
```json
{
  "session_id": "d0000000-0000-0000-0000-000000000001",
  "trx_id": "BL38A7K9Q2",
  "provider": "BKASH"
}
```

### Response (200 OK):
```json
{
  "success": true,
  "status": "COMPLETED",
  "message": "Payment successfully verified and locked!",
  "data": {
    "session_id": "d0000000-0000-0000-0000-000000000001",
    "order_id": "ORD-98213",
    "amount": 1250,
    "trx_id": "BL38A7K9Q2",
    "sender_number": "01712345678",
    "redirect_url": "https://mystore.com/checkout/order-received/98213",
    "completed_at": "2026-09-01T18:25:00.000Z"
  }
}
```

---

## 3. Ingest SMS / Push Notification (From Android Agent)
Secure endpoint used by the Android background app to stream incoming payment messages.

- **Endpoint:** `POST /api/v1/listener/ingest`
- **Headers:** `Authorization: Bearer <MERCHANT_DEVICE_TOKEN>`

### Request Body:
```json
{
  "sender_or_header": "bKash",
  "message": "You have received Tk 1,250.00 from 01712345678. Ref: GM-ORDER. Fee Tk 0.00. Balance Tk 14,350.00. TrxID BL38A7K9Q2 at 01/09/2026 18:15",
  "receiver_number": "01812345678",
  "timestamp": "2026-09-01T18:15:30.000Z"
}
```

---

## 4. Webhook Callback Specification
When a transaction is verified, GM Pay sends an HTTP `POST` request to your registered Webhook URL with HMAC-SHA256 signature in the `X-GM-Pay-Signature` header.

### Headers:
- `Content-Type: application/json`
- `X-GM-Pay-Signature: 6e98b...` (HMAC-SHA256 signature generated with your Webhook Secret)

### Webhook Payload:
```json
{
  "event": "payment.completed",
  "order_id": "ORD-98213",
  "session_id": "d0000000-0000-0000-0000-000000000001",
  "amount": 1250.00,
  "currency": "BDT",
  "provider": "BKASH",
  "trx_id": "BL38A7K9Q2",
  "customer_phone": "01712345678",
  "completed_at": "2026-09-01T18:25:00.000Z"
}
```
