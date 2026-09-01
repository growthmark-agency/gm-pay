package com.gmpay.listener.parser

import java.util.regex.Pattern

data class ParsedTx(
    val provider: String, // BKASH, NAGAD, ROCKET, UPAY
    val trxId: String,
    val amount: Double,
    val sender: String? = null,
    val reference: String? = null,
    val rawText: String
)

object TransactionParser {

    // bKash Regex: "You have received Tk 1,250.00 from 01712345678. Ref: ... TrxID BL38A7K9Q2"
    private val BKASH_TRX_REGEX = Pattern.compile("TrxID\\s+([A-Z0-9]+)", Pattern.CASE_INSENSITIVE)
    private val BKASH_AMOUNT_REGEX = Pattern.compile("(?:Tk|BDT|Tk\\.)\\s*([0-9,]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE)
    private val SENDER_REGEX = Pattern.compile("from\\s+([0-9+]{11,14})", Pattern.CASE_INSENSITIVE)

    // Nagad Regex: "You have received Tk 1,000.00 from 01612345678. TxnID: 72H8G9K1"
    private val NAGAD_TRX_REGEX = Pattern.compile("(?:TxnID|TrxID)\\s*:?\\s*([A-Z0-9]+)", Pattern.CASE_INSENSITIVE)

    // Rocket (DBBL) Regex: "DBBL Rocket: Tk 750.00 received from 01912345678. TxnId: 981726435"
    private val ROCKET_TRX_REGEX = Pattern.compile("(?:TxnId|TrxID|Txn ID)\\s*:?\\s*([0-9A-Z]+)", Pattern.CASE_INSENSITIVE)

    fun parse(senderOrPackage: String, messageText: String): ParsedTx? {
        val cleanMsg = messageText.trim()
        val lowerHeader = senderOrPackage.lowercase()
        val lowerMsg = cleanMsg.lowercase()

        // 1. Check bKash
        if (lowerHeader.contains("bkash") || lowerHeader.contains("16247") || lowerMsg.contains("bkash") ||
            (lowerMsg.contains("you have received tk") && lowerMsg.contains("trxid"))
        ) {
            val trxMatcher = BKASH_TRX_REGEX.matcher(cleanMsg)
            val amtMatcher = BKASH_AMOUNT_REGEX.matcher(cleanMsg)
            val senderMatcher = SENDER_REGEX.matcher(cleanMsg)

            if (trxMatcher.find() && amtMatcher.find()) {
                val trxId = trxMatcher.group(1).trim().uppercase()
                val amountStr = amtMatcher.group(1).replace(",", "")
                val amount = amountStr.toDoubleOrNull() ?: return null
                val sender = if (senderMatcher.find()) senderMatcher.group(1).replace("+88", "").trim() else null

                return ParsedTx(
                    provider = "BKASH",
                    trxId = trxId,
                    amount = amount,
                    sender = sender,
                    rawText = cleanMsg
                )
            }
        }

        // 2. Check Nagad
        if (lowerHeader.contains("nagad") || lowerHeader.contains("16167") || lowerMsg.contains("nagad")) {
            val trxMatcher = NAGAD_TRX_REGEX.matcher(cleanMsg)
            val amtMatcher = BKASH_AMOUNT_REGEX.matcher(cleanMsg)
            val senderMatcher = SENDER_REGEX.matcher(cleanMsg)

            if (trxMatcher.find() && amtMatcher.find()) {
                val trxId = trxMatcher.group(1).trim().uppercase()
                val amountStr = amtMatcher.group(1).replace(",", "")
                val amount = amountStr.toDoubleOrNull() ?: return null
                val sender = if (senderMatcher.find()) senderMatcher.group(1).replace("+88", "").trim() else null

                return ParsedTx(
                    provider = "NAGAD",
                    trxId = trxId,
                    amount = amount,
                    sender = sender,
                    rawText = cleanMsg
                )
            }
        }

        // 3. Check Rocket
        if (lowerHeader.contains("rocket") || lowerHeader.contains("dbbl") || lowerHeader.contains("16216")) {
            val trxMatcher = ROCKET_TRX_REGEX.matcher(cleanMsg)
            val amtMatcher = BKASH_AMOUNT_REGEX.matcher(cleanMsg)
            val senderMatcher = SENDER_REGEX.matcher(cleanMsg)

            if (trxMatcher.find() && amtMatcher.find()) {
                val trxId = trxMatcher.group(1).trim().uppercase()
                val amountStr = amtMatcher.group(1).replace(",", "")
                val amount = amountStr.toDoubleOrNull() ?: return null
                val sender = if (senderMatcher.find()) senderMatcher.group(1).replace("+88", "").trim() else null

                return ParsedTx(
                    provider = "ROCKET",
                    trxId = trxId,
                    amount = amount,
                    sender = sender,
                    rawText = cleanMsg
                )
            }
        }

        // 4. Generic Fallback
        val genTrx = NAGAD_TRX_REGEX.matcher(cleanMsg)
        val genAmt = BKASH_AMOUNT_REGEX.matcher(cleanMsg)
        if (genTrx.find() && genAmt.find()) {
            val trxId = genTrx.group(1).trim().uppercase()
            val amount = genAmt.group(1).replace(",", "").toDoubleOrNull() ?: return null
            return ParsedTx(
                provider = "BKASH",
                trxId = trxId,
                amount = amount,
                rawText = cleanMsg
            )
        }

        return null
    }
}
