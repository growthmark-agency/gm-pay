import crypto from "crypto";

/**
 * Generate HMAC-SHA256 signature for webhook payloads
 */
export function generateWebhookSignature(payload: string | object, secret: string): string {
  const data = typeof payload === "string" ? payload : JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Verify incoming webhook signature
 */
export function verifyWebhookSignature(payload: string | object, signature: string, secret: string): boolean {
  try {
    const expectedSignature = generateWebhookSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Generate random API Keys and Secrets
 */
export function generateApiKey(prefix: "gmpay_live_" | "gmpay_test_" | "whsec_"): string {
  return `${prefix}${crypto.randomBytes(16).toString("hex")}`;
}
