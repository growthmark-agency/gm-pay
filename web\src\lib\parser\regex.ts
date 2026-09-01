export interface ParsedTransaction {
  provider: "BKASH" | "NAGAD" | "ROCKET" | "UPAY";
  trxId: string;
  amount: number;
  senderNumber?: string;
  receiverNumber?: string;
  reference?: string;
  rawMessage: string;
  isValid: boolean;
}

/**
 * Universal Mobile Financial Service (MFS) SMS & Push Notification Parser for Bangladesh
 * Covers: bKash (16247), Nagad (16167/NAGAD), Rocket (16216/DBBL), Upay (16268)
 */
export function parseMfsMessage(senderOrHeader: string, message: string): ParsedTransaction | null {
  const cleanMsg = message.trim();
  const lowerHeader = senderOrHeader.toLowerCase();
  const lowerMsg = cleanMsg.toLowerCase();

  // 1. bKash Parser
  if (
    lowerHeader.includes("bkash") ||
    lowerHeader.includes("16247") ||
    lowerMsg.includes("trxid") && lowerMsg.includes("bkash") ||
    (lowerMsg.includes("you have received tk") && lowerMsg.includes("trxid"))
  ) {
    const trxMatch = cleanMsg.match(/TrxID\s+([A-Z0-9]+)/i) || cleanMsg.match(/TxnID\s+([A-Z0-9]+)/i);
    const amountMatch = cleanMsg.match(/(?:Tk|BDT|Tk\.)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    const senderMatch = cleanMsg.match(/from\s+([0-9+]{11,14})/i) || cleanMsg.match(/Sender:\s*([0-9+]{11,14})/i);
    const refMatch = cleanMsg.match(/Ref\s*:?\s*([^.\n]+)/i);

    if (trxMatch && amountMatch) {
      const rawAmount = amountMatch[1].replace(/,/g, "");
      return {
        provider: "BKASH",
        trxId: trxMatch[1].trim().toUpperCase(),
        amount: parseFloat(rawAmount),
        senderNumber: senderMatch ? senderMatch[1].replace(/\+88/, "").trim() : undefined,
        reference: refMatch ? refMatch[1].trim() : undefined,
        rawMessage: cleanMsg,
        isValid: true,
      };
    }
  }

  // 2. Nagad Parser
  if (
    lowerHeader.includes("nagad") ||
    lowerHeader.includes("16167") ||
    lowerMsg.includes("nagad") ||
    (lowerMsg.includes("txnid") && lowerMsg.includes("received"))
  ) {
    const trxMatch = cleanMsg.match(/TxnID\s*:?\s*([A-Z0-9]+)/i) || cleanMsg.match(/TrxID\s*:?\s*([A-Z0-9]+)/i);
    const amountMatch = cleanMsg.match(/(?:Tk|BDT|Tk\.)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    const senderMatch = cleanMsg.match(/from\s+([0-9+]{11,14})/i) || cleanMsg.match(/sender\s*:?\s*([0-9+]{11,14})/i);

    if (trxMatch && amountMatch) {
      const rawAmount = amountMatch[1].replace(/,/g, "");
      return {
        provider: "NAGAD",
        trxId: trxMatch[1].trim().toUpperCase(),
        amount: parseFloat(rawAmount),
        senderNumber: senderMatch ? senderMatch[1].replace(/\+88/, "").trim() : undefined,
        rawMessage: cleanMsg,
        isValid: true,
      };
    }
  }

  // 3. Rocket (DBBL) Parser
  if (
    lowerHeader.includes("rocket") ||
    lowerHeader.includes("dbbl") ||
    lowerHeader.includes("16216") ||
    lowerMsg.includes("rocket")
  ) {
    const trxMatch = cleanMsg.match(/(?:TxnId|TrxID|Txn ID)\s*:?\s*([0-9A-Z]+)/i);
    const amountMatch = cleanMsg.match(/(?:Tk|BDT)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    const senderMatch = cleanMsg.match(/from\s+([0-9+]{11,14})/i);

    if (trxMatch && amountMatch) {
      const rawAmount = amountMatch[1].replace(/,/g, "");
      return {
        provider: "ROCKET",
        trxId: trxMatch[1].trim().toUpperCase(),
        amount: parseFloat(rawAmount),
        senderNumber: senderMatch ? senderMatch[1].replace(/\+88/, "").trim() : undefined,
        rawMessage: cleanMsg,
        isValid: true,
      };
    }
  }

  // 4. Upay Parser
  if (
    lowerHeader.includes("upay") ||
    lowerHeader.includes("16268") ||
    lowerMsg.includes("upay")
  ) {
    const trxMatch = cleanMsg.match(/(?:TrxID|TxnID|Txn ID)\s*:?\s*([0-9A-Z]+)/i);
    const amountMatch = cleanMsg.match(/(?:Tk|BDT)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    const senderMatch = cleanMsg.match(/from\s+([0-9+]{11,14})/i);

    if (trxMatch && amountMatch) {
      const rawAmount = amountMatch[1].replace(/,/g, "");
      return {
        provider: "UPAY",
        trxId: trxMatch[1].trim().toUpperCase(),
        amount: parseFloat(rawAmount),
        senderNumber: senderMatch ? senderMatch[1].replace(/\+88/, "").trim() : undefined,
        rawMessage: cleanMsg,
        isValid: true,
      };
    }
  }

  // Generic fallback if TrxID and Amount exist
  const genericTrx = cleanMsg.match(/(?:TrxID|TxnID|Transaction ID|Trans ID)\s*:?\s*([A-Z0-9]+)/i);
  const genericAmount = cleanMsg.match(/(?:Tk|BDT|Tk\.)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (genericTrx && genericAmount) {
    return {
      provider: "BKASH",
      trxId: genericTrx[1].trim().toUpperCase(),
      amount: parseFloat(genericAmount[1].replace(/,/g, "")),
      rawMessage: cleanMsg,
      isValid: true,
    };
  }

  return null;
}
