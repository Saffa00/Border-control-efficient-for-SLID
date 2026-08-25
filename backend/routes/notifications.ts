/**
 * notifications.ts
 *
 * Sends real email AND SMS for the applicant-facing moments that
 * previously only wrote silent database rows: visa application status
 * changes, and payment confirmation. Called from the frontend AFTER the
 * corresponding database write has already succeeded (visa_applications
 * status update, payment_transactions insert) — these are notifications
 * of a completed action, not the action itself.
 *
 * Email and SMS are sent in parallel via Promise.allSettled: a failure
 * in one channel should never block or fail the other, and neither
 * failure should look like the underlying application action failed —
 * that already succeeded before this route was ever called.
 */

import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import {
  sendEmail,
  visaApprovedEmail,
  visaRejectedEmail,
  documentsRequestedEmail,
  paymentConfirmationEmail,
} from "../lib/emailService";
import {
  sendSMS,
  visaApprovedSMS,
  visaRejectedSMS,
  documentsRequestedSMS,
  paymentConfirmationSMS,
} from "../lib/smsService";

const router = Router();

// ---------------------------------------------------------------
// POST /api/notify/visa-status
// Body: { applicationId, event: 'approved' | 'rejected' | 'documents_requested' }
// ---------------------------------------------------------------
router.post("/api/notify/visa-status", async (req, res) => {
  const { applicationId, event } = req.body;

  if (!applicationId || !event) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data: application, error } = await supabaseAdmin
      .from("visa_applications")
      .select(
        "application_ref, review_notes, passports(user_id, users(full_name, email, phone)), digital_visas(visa_number, expiry_date)"
      )
      .eq("application_id", applicationId)
      .single();

    if (error || !application) throw error ?? new Error("Application not found");

    const applicant = (application.passports as any)?.users;
    const userId = (application.passports as any)?.user_id;

    if (!applicant?.email && !applicant?.phone) {
      return res.status(404).json({ error: "No applicant contact details found" });
    }

    let subject = "";
    let html = "";
    let smsText = "";

    if (event === "approved") {
      const visa = (application.digital_visas as any)?.[0] ?? (application.digital_visas as any);
      subject = `Visa Approved — ${application.application_ref}`;
      html = visaApprovedEmail(
        applicant.full_name,
        application.application_ref,
        visa?.visa_number ?? "—",
        visa?.expiry_date ?? ""
      );
      smsText = visaApprovedSMS(application.application_ref);
    } else if (event === "rejected") {
      subject = `Visa Application Update — ${application.application_ref}`;
      html = visaRejectedEmail(applicant.full_name, application.application_ref, application.review_notes ?? "");
      smsText = visaRejectedSMS(application.application_ref);
    } else if (event === "documents_requested") {
      subject = `Action Required — ${application.application_ref}`;
      html = documentsRequestedEmail(applicant.full_name, application.application_ref, application.review_notes ?? "");
      smsText = documentsRequestedSMS(application.application_ref);
    } else {
      return res.status(400).json({ error: "Unknown event type" });
    }

    const [emailResult, smsResult] = await Promise.allSettled([
      applicant.email
        ? sendEmail({ userId, to: applicant.email, subject, html })
        : Promise.resolve({ success: false, error: "No email on file" }),
      applicant.phone
        ? sendSMS({ userId, to: applicant.phone, message: smsText })
        : Promise.resolve({ success: false, error: "No phone on file" }),
    ]);

    return res.json({
      emailSent: emailResult.status === "fulfilled" && emailResult.value.success,
      smsSent: smsResult.status === "fulfilled" && smsResult.value.success,
    });
  } catch (err: any) {
    console.error("notify/visa-status failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ---------------------------------------------------------------
// POST /api/notify/payment-confirmation
// Body: { applicationId, amountUsd, reference }
// ---------------------------------------------------------------
router.post("/api/notify/payment-confirmation", async (req, res) => {
  const { applicationId, amountUsd, reference } = req.body;

  if (!applicationId || amountUsd === undefined || !reference) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data: application, error } = await supabaseAdmin
      .from("visa_applications")
      .select("application_ref, passports(user_id, users(full_name, email, phone))")
      .eq("application_id", applicationId)
      .single();

    if (error || !application) throw error ?? new Error("Application not found");

    const applicant = (application.passports as any)?.users;
    const userId = (application.passports as any)?.user_id;

    if (!applicant?.email && !applicant?.phone) {
      return res.status(404).json({ error: "No applicant contact details found" });
    }

    const [emailResult, smsResult] = await Promise.allSettled([
      applicant.email
        ? sendEmail({
            userId,
            to: applicant.email,
            subject: `Payment Received — ${application.application_ref}`,
            html: paymentConfirmationEmail(applicant.full_name, application.application_ref, amountUsd, reference),
          })
        : Promise.resolve({ success: false, error: "No email on file" }),
      applicant.phone
        ? sendSMS({
            userId,
            to: applicant.phone,
            message: paymentConfirmationSMS(application.application_ref, amountUsd),
          })
        : Promise.resolve({ success: false, error: "No phone on file" }),
    ]);

    return res.json({
      emailSent: emailResult.status === "fulfilled" && emailResult.value.success,
      smsSent: smsResult.status === "fulfilled" && smsResult.value.success,
    });
  } catch (err: any) {
    console.error("notify/payment-confirmation failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

export default router;
