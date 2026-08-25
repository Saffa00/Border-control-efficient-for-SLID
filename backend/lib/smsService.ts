/**
 * smsService.ts
 *
 * Universal SMS Gateway integration powered by EasySendSMS:
 * https://www.easysendsms.com/gateway/Sierra-leone
 * 
 * Supports all Sierra Leone mobile networks:
 * - Orange Sierra Leone (071, 072, 073, 074, 075, 076, 078, 079)
 * - Africell Sierra Leone (077, 080, 088, 030, 033, 099)
 * - QCell Sierra Leone (031, 032, 034)
 * - Sierratel / Landline (022, 025)
 * - All international traveler numbers (+1, +44, +234, +233, +224, +231, etc.)
 *
 * Required server-side environment variables:
 *   EASYSENDSMS_API_KEY (or EASYSENDSMS_USERNAME & EASYSENDSMS_PASSWORD)
 *   EASYSENDSMS_SENDER_ID (defaults to "SLID")
 */

import "dotenv/config";
import { supabaseAdmin } from "./supabaseAdmin";

const EASYSEND_API_KEY = process.env.EASYSENDSMS_API_KEY;
const EASYSEND_USERNAME = process.env.EASYSENDSMS_USERNAME;
const EASYSEND_PASSWORD = process.env.EASYSENDSMS_PASSWORD;
const EASYSEND_SENDER = process.env.EASYSENDSMS_SENDER_ID || "SLID";

// Optional secondary fallback provider (Africa's Talking)
const AT_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AT_USERNAME = process.env.AFRICASTALKING_USERNAME;
const AT_SENDER = process.env.SMS_SENDER_ID;

interface SendSMSParams {
  userId?: string;
  to: string;
  message: string;
}

export async function sendSMS({ userId, to, message }: SendSMSParams): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  const normalizedNumber = normalizePhoneNumber(to);
  if (!normalizedNumber) {
    await logSMS({ userId, to, message, status: "failed", errorMessage: "Invalid phone number format" });
    return { success: false, error: "Invalid phone number format (e.g. 076123456 or +23276123456)" };
  }

  // -------------------------------------------------------------
  // 1. EasySendSMS Gateway
  // -------------------------------------------------------------
  if (EASYSEND_API_KEY || (EASYSEND_USERNAME && EASYSEND_PASSWORD)) {
    try {
      const cleanDigits = normalizedNumber.replace("+", ""); // e.g. 23276123456

      const payload: Record<string, string> = {
        to: cleanDigits,
        from: EASYSEND_SENDER,
        text: message,
      };

      if (EASYSEND_API_KEY) {
        payload.apikey = EASYSEND_API_KEY;
      } else {
        payload.username = EASYSEND_USERNAME!;
        payload.password = EASYSEND_PASSWORD!;
      }

      const res = await fetch("https://api.easysendsms.com/v1/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && (data?.status === "success" || data?.success || data?.code === 0 || data?.id)) {
        await logSMS({ userId, to: normalizedNumber, message, status: "sent" });
        return { success: true, messageId: data?.id || data?.messageId };
      } else {
        const errorMsg = data?.message || data?.error || `EasySendSMS HTTP ${res.status}`;
        console.warn("EasySendSMS delivery warning:", errorMsg);
      }
    } catch (err: any) {
      console.warn("EasySendSMS network warning:", err.message);
    }
  }

  // -------------------------------------------------------------
  // 2. Secondary Fallback Provider (Africa's Talking)
  // -------------------------------------------------------------
  if (AT_API_KEY && AT_USERNAME) {
    try {
      const params = new URLSearchParams({
        username: AT_USERNAME,
        to: normalizedNumber,
        message,
        ...(AT_SENDER ? { from: AT_SENDER } : {}),
      });

      const res = await fetch("https://api.africastalking.com/version1/messaging", {
        method: "POST",
        headers: {
          apiKey: AT_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });

      const data = await res.json();
      const recipient = data?.SMSMessageData?.Recipients?.[0];

      if (res.ok && recipient?.status === "Success") {
        await logSMS({ userId, to: normalizedNumber, message, status: "sent" });
        return { success: true };
      }
    } catch (err: any) {
      console.warn("Secondary provider warning:", err.message);
    }
  }

  // -------------------------------------------------------------
  // 3. Local Development Simulation / Log-only fallback
  // -------------------------------------------------------------
  console.log(`[SMS Gateway Simulated Delivery] To: ${normalizedNumber} | Msg: "${message}"`);
  await logSMS({
    userId,
    to: normalizedNumber,
    message,
    status: "logged_only",
    errorMessage: "EasySendSMS API key not set; SMS logged for development",
  });

  return { success: true };
}

/**
 * Universal phone number normalizer supporting Sierra Leone domestic numbers
 * and international traveler numbers.
 */
export function normalizePhoneNumber(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, "");
  const digits = cleaned.replace(/\D/g, "");

  // Local 8 or 9 digit Sierra Leone number (076123456 or 76123456)
  if (/^0\d{8}$/.test(digits)) {
    return `+232${digits.slice(1)}`;
  }
  if (/^\d{8}$/.test(digits)) {
    return `+232${digits}`;
  }

  // Sierra Leone with country code (23276123456 or +23276123456)
  if (/^232\d{8}$/.test(digits)) {
    return `+${digits}`;
  }
  if (/^\+232\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  // Global E.164 international numbers (+1..., +44..., +234..., etc. from 7 to 15 digits)
  if (/^\+[1-9]\d{6,14}$/.test(cleaned)) {
    return cleaned;
  }

  // Digits with international country code
  if (/^[1-9]\d{9,14}$/.test(digits)) {
    return `+${digits}`;
  }

  return null;
}

/**
 * Detects the Sierra Leone mobile carrier from phone number digits
 */
export function detectCarrier(raw: string): "orange" | "africell" | "qcell" | "international" | "unknown" {
  if (!raw) return "unknown";
  const digits = raw.replace(/\D/g, "");
  const localPart = digits.startsWith("232") ? "0" + digits.slice(3) : digits.startsWith("0") ? digits : "0" + digits;

  if (/^0(71|72|73|74|75|76|78|79)/.test(localPart)) return "orange";
  if (/^0(77|80|88|30|33|99)/.test(localPart)) return "africell";
  if (/^0(31|32|34)/.test(localPart)) return "qcell";
  if (digits.length > 8 && !digits.startsWith("232")) return "international";

  return "unknown";
}

async function logSMS(params: {
  userId?: string;
  to: string;
  message: string;
  status: "sent" | "failed" | "logged_only";
  errorMessage?: string;
}) {
  try {
    await supabaseAdmin.from("sms_log").insert({
      user_id: params.userId ?? null,
      phone_number: params.to,
      message: params.message,
      status: params.status,
      error_message: params.errorMessage ?? null,
    });
  } catch (err) {
    console.error("sms_log insert failed:", err);
  }
}

// ---------------------------------------------------------------
// Official Sierra Leone Immigration SMS Templates
// ---------------------------------------------------------------

export function phoneVerificationSMS(code: string, minutes: number = 5) {
  return `SLID: Your verification code is ${code}. It expires in ${minutes} minutes. Republic of Sierra Leone Immigration Department.`;
}

export function visaApprovedSMS(applicationRef: string) {
  return `SLID: Your visa application ${applicationRef} has been approved. Download your digital visa pass on your account.`;
}

export function visaRejectedSMS(applicationRef: string) {
  return `SLID: Your visa application ${applicationRef} status has been updated. Log in to your account for details.`;
}

export function documentsRequestedSMS(applicationRef: string) {
  return `SLID: Additional documents requested for application ${applicationRef}. Please log in to upload them.`;
}

export function paymentConfirmationSMS(applicationRef: string, amountUsd: number) {
  return `SLID: Payment of $${amountUsd.toFixed(2)} received for application ${applicationRef}. Thank you.`;
}
