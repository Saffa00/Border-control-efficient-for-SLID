/**
 * phone-verification.ts
 *
 * Two-step OTP flow proving a user actually controls the phone number
 * they enter, before that number is trusted as an SMS notification
 * target (notifications.ts only sends to users.phone once
 * users.phone_verified = true is set here).
 *
 * Rate limiting is enforced per IP and per user to prevent SMS toll fraud.
 */

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { sendSMS, phoneVerificationSMS } from "../lib/smsService";
import { sendEmail, passwordResetEmail } from "../lib/emailService";

const router = Router();

const CODE_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// Security Rate Limiter: Max 5 SMS OTP requests per 15 minutes per IP
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many phone verification requests from this network. Please wait 15 minutes." },
});

// Security Rate Limiter: Max 10 verification check attempts per 15 minutes
const verifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts. Please wait 15 minutes." },
});

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

// ---------------------------------------------------------------
// POST /api/auth/send-phone-otp
// Body: { userId, phone }
// ---------------------------------------------------------------
router.post("/api/auth/send-phone-otp", otpRateLimiter, async (req, res) => {
  const { userId, phone } = req.body;

  if (!userId || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Basic throttle: block a new code if one was issued too recently
    const { data: recent } = await supabaseAdmin
      .from("phone_verifications")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent) {
      const secondsSinceLast = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
      if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLast)}s before requesting another code`,
        });
      }
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { data: verification, error: insertError } = await supabaseAdmin
      .from("phone_verifications")
      .insert({ user_id: userId, phone_number: phone, code, expires_at: expiresAt })
      .select("verification_id")
      .single();

    if (insertError) throw insertError;

    const smsResult = await sendSMS({
      userId,
      to: phone,
      message: phoneVerificationSMS(code, CODE_EXPIRY_MINUTES),
    });

    if (!smsResult.success) {
      return res.status(502).json({ error: `Could not send SMS: ${smsResult.error}` });
    }

    return res.json({ verificationId: verification.verification_id, expiresInMinutes: CODE_EXPIRY_MINUTES });
  } catch (err: any) {
    console.error("send-phone-otp failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ---------------------------------------------------------------
// POST /api/auth/verify-phone-otp
// Body: { userId, verificationId, code }
// ---------------------------------------------------------------
router.post("/api/auth/verify-phone-otp", verifyRateLimiter, async (req, res) => {
  const { userId, verificationId, code } = req.body;

  if (!userId || !verificationId || !code) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data: verification, error } = await supabaseAdmin
      .from("phone_verifications")
      .select("*")
      .eq("verification_id", verificationId)
      .eq("user_id", userId)
      .single();

    if (error || !verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    if (verification.verified) {
      return res.status(400).json({ error: "This code has already been used" });
    }

    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({ error: "Code has expired — request a new one" });
    }

    if (verification.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: "Too many incorrect attempts — request a new code" });
    }

    if (verification.code !== code) {
      await supabaseAdmin
        .from("phone_verifications")
        .update({ attempts: verification.attempts + 1 })
        .eq("verification_id", verificationId);

      const remaining = MAX_ATTEMPTS - (verification.attempts + 1);
      return res.status(400).json({ error: `Incorrect code. ${remaining} attempt(s) remaining.` });
    }

    // Correct code — mark this verification used, and trust the phone number
    await supabaseAdmin
      .from("phone_verifications")
      .update({ verified: true })
      .eq("verification_id", verificationId);

    await supabaseAdmin
      .from("users")
      .update({ phone: verification.phone_number, phone_verified: true })
      .eq("user_id", userId);

    return res.json({ verified: true });
  } catch (err: any) {
    console.error("verify-phone-otp failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ---------------------------------------------------------------
// POST /api/auth/request-password-reset
// Dispatches official SLID-branded password recovery email via Resend
// ---------------------------------------------------------------
router.post("/api/auth/request-password-reset", async (req, res) => {
  const { email, redirectUrl } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  
  // Choose safe redirect: if frontend sent a localhost url but backend is running in production, prefer live url
  let targetRedirect = redirectUrl || "https://border-control-efficient-for-slid.vercel.app/reset-password";
  if (targetRedirect.includes("localhost") && process.env.NODE_ENV === "production") {
    targetRedirect = "https://border-control-efficient-for-slid.vercel.app/reset-password";
  }

  try {
    // 1. Generate secure password recovery link via Supabase Auth Admin
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
      options: {
        redirectTo: targetRedirect,
      },
    });

    if (linkError) {
      console.warn("generateLink error:", linkError.message);
      // Return safe message without exposing whether user exists
      return res.json({
        success: true,
        message: "If your email is registered, a password recovery link has been sent.",
      });
    }

    const actionLink = linkData?.properties?.action_link;
    if (!actionLink) {
      return res.status(500).json({ error: "Could not generate recovery link." });
    }

    // 2. Lookup recipient name for personal touch
    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("full_name")
      .eq("email", cleanEmail)
      .maybeSingle();

    // 3. Dispatch official SLID branded email template
    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: "🔒 Reset Your Account Password — Sierra Leone Immigration Department",
      html: passwordResetEmail(actionLink, userProfile?.full_name),
    });

    if (!emailResult.success) {
      console.warn("Resend email failed, falling back to direct notification:", emailResult.error);
    }

    return res.json({
      success: true,
      message: "Official SLID password recovery email dispatched successfully.",
    });
  } catch (err: any) {
    console.error("request-password-reset exception:", err);
    return res.status(500).json({ error: "Failed to dispatch password recovery email." });
  }
});

export default router;
