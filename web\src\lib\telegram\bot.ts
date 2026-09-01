/**
 * Telegram Notification Dispatcher for GM Pay Merchants
 * Sends formatted instant payment receipts & alerts via Telegram Bot API
 */

export interface TelegramPaymentAlert {
  botToken: string;
  chatId: string;
  orderId: string;
  amount: number;
  provider: string;
  trxId: string;
  customerName?: string;
  customerPhone?: string;
  receiverWallet?: string;
}

export async function sendTelegramPaymentNotification(alert: TelegramPaymentAlert): Promise<boolean> {
  if (!alert.botToken || !alert.chatId) return false;

  const message = `
🚀 *GM Pay — Payment Confirmed!*
━━━━━━━━━━━━━━━━━━━━
💰 *Amount:* ৳${alert.amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
🏷️ *Order ID:* \`${alert.orderId}\`
📱 *Method:* *${alert.provider}*
🔑 *TrxID:* \`${alert.trxId}\`
${alert.customerName ? `👤 *Customer:* ${alert.customerName}` : ""}
${alert.customerPhone ? `📞 *Customer Phone:* ${alert.customerPhone}` : ""}
${alert.receiverWallet ? `📥 *Received on Wallet:* \`${alert.receiverWallet}\`` : ""}
⏰ *Time:* ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })} (BST)
━━━━━━━━━━━━━━━━━━━━
✅ *Status:* Auto-Verified & Completed
`;

  try {
    const url = `https://api.telegram.org/bot${alert.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: alert.chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    return data.ok === true;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}

export async function sendTelegramHealthAlert(botToken: string, chatId: string, walletPhone: string, issue: string): Promise<boolean> {
  if (!botToken || !chatId) return false;

  const message = `
⚠️ *GM Pay Warning Alert!*
━━━━━━━━━━━━━━━━━━━━
📱 *Wallet:* \`${walletPhone}\`
🚨 *Issue:* ${issue}
⏰ *Time:* ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })} (BST)
━━━━━━━━━━━━━━━━━━━━
Please check your Android listener device.
`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    return data.ok === true;
  } catch (error) {
    console.error("Failed to send Telegram health alert:", error);
    return false;
  }
}
