/**
 * emailService.ts
 *
 * Thin wrapper around the Resend API. Every send attempt — success or
 * failure — is logged to email_log so admins have a full delivery record
 * (Chapter 3 audit/accountability design). This must run server-side
 * only: RESEND_API_KEY must never reach the browser.
 */

import "dotenv/config";
import { supabaseAdmin } from "./supabaseAdmin";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Sierra Leone Immigration Department <noreply@slid.gov.sl>";

interface SendEmailParams {
  userId?: string; // for logging against a known user_id, when available
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ userId, to, subject, html }: SendEmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!RESEND_API_KEY) {
    await logEmail({ userId, to, subject, status: "failed", errorMessage: "RESEND_API_KEY not configured" });
    return { success: false, error: "Email service not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      await logEmail({ userId, to, subject, status: "failed", errorMessage: body });
      return { success: false, error: body };
    }

    await logEmail({ userId, to, subject, status: "sent" });
    return { success: true };
  } catch (err: any) {
    await logEmail({ userId, to, subject, status: "failed", errorMessage: err.message });
    return { success: false, error: err.message };
  }
}

async function logEmail(params: {
  userId?: string;
  to: string;
  subject: string;
  status: "sent" | "failed" | "logged_only";
  errorMessage?: string;
}) {
  // Best-effort logging — a logging failure should never crash the caller
  try {
    await supabaseAdmin.from("email_log").insert({
      user_id: params.userId ?? null,
      to_email: params.to,
      subject: params.subject,
      body: "", // full HTML body intentionally not duplicated into the log row
      status: params.status,
      error_message: params.errorMessage ?? null,
    });
  } catch (err) {
    console.error("email_log insert failed:", err);
  }
}

// ---------------------------------------------------------------
// Email templates — kept simple and inline; a larger system would use
// a templating library, but this keeps the dependency footprint minimal
// for a final-year project.
// ---------------------------------------------------------------

export function visaApprovedEmail(fullName: string, applicationRef: string, visaNumber: string, expiryDate: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1F2937; max-width: 480px;">
      <p style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #0B4F6C;">
        Sierra Leone Immigration Department
      </p>
      <h2 style="color: #1E8E5A;">Your visa has been approved</h2>
      <p>Dear ${fullName},</p>
      <p>Your visa application <strong>${applicationRef}</strong> has been approved.</p>
      <p>Digital visa number: <strong>${visaNumber}</strong><br/>
         Valid until: <strong>${new Date(expiryDate).toLocaleDateString()}</strong></p>
      <p>Please present your passport and this confirmation at your point of entry.</p>
      <p style="color: #4B5563; font-size: 12px; margin-top: 24px;">This is an automated message from SLID. Do not reply.</p>
    </div>`;
}

export function visaRejectedEmail(fullName: string, applicationRef: string, reviewNotes: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1F2937; max-width: 480px;">
      <p style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #0B4F6C;">
        Sierra Leone Immigration Department
      </p>
      <h2 style="color: #B3261E;">Your visa application was not approved</h2>
      <p>Dear ${fullName},</p>
      <p>Your visa application <strong>${applicationRef}</strong> was not approved.</p>
      <p><strong>Reviewer's note:</strong> ${reviewNotes}</p>
      <p>You may submit a new application addressing the note above.</p>
      <p style="color: #4B5563; font-size: 12px; margin-top: 24px;">This is an automated message from SLID. Do not reply.</p>
    </div>`;
}

export function documentsRequestedEmail(fullName: string, applicationRef: string, reviewNotes: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1F2937; max-width: 480px;">
      <p style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #0B4F6C;">
        Sierra Leone Immigration Department
      </p>
      <h2 style="color: #C77B21;">Additional documents needed</h2>
      <p>Dear ${fullName},</p>
      <p>Your visa application <strong>${applicationRef}</strong> requires additional documents before it can proceed.</p>
      <p><strong>Requested:</strong> ${reviewNotes}</p>
      <p>Please log in to your account to upload the requested documents.</p>
      <p style="color: #4B5563; font-size: 12px; margin-top: 24px;">This is an automated message from SLID. Do not reply.</p>
    </div>`;
}

export function paymentConfirmationEmail(fullName: string, applicationRef: string, amountUsd: number, reference: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1F2937; max-width: 480px;">
      <p style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #0B4F6C;">
        Sierra Leone Immigration Department
      </p>
      <h2 style="color: #1E8E5A;">Payment received</h2>
      <p>Dear ${fullName},</p>
      <p>We've received your payment of <strong>$${amountUsd.toFixed(2)}</strong> for application
         <strong>${applicationRef}</strong>.</p>
      <p>Reference: <strong>${reference}</strong></p>
      <p style="color: #4B5563; font-size: 12px; margin-top: 24px;">This is an automated message from SLID. Do not reply.</p>
    </div>`;
}

export function staffAccountApprovedEmail(
  fullName: string,
  email: string,
  tempPassword: string,
  role: string,
  dutyStation: string,
  loginUrl: string
) {
  const roleLabel = role === "visa_officer" ? "Visa Adjudication Officer" : "Border & Immigration Officer";
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 540px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
      <div style="background-color: #0B4F6C; padding: 24px; text-align: center;">
        <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #99D5C9; margin: 0 0 6px 0; font-weight: 600;">
          Republic of Sierra Leone
        </p>
        <h1 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: 700;">
          Immigration Department (SLID)
        </h1>
        <p style="color: #E0F2FE; font-size: 13px; margin: 4px 0 0 0;">
          Official Staff Credential Provisioning Notice
        </p>
      </div>

      <div style="padding: 28px 24px;">
        <h2 style="color: #0B4F6C; font-size: 18px; margin-top: 0;">Officer Account Approved & Provisioned</h2>
        <p style="font-size: 14px; line-height: 1.6;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6;">
          Your request for official access to the Sierra Leone Immigration Management System has been approved by the System Administrator.
        </p>

        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Assigned Role:</td>
              <td style="padding: 6px 0; color: #0B4F6C; font-weight: bold;">${roleLabel}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Duty Station:</td>
              <td style="padding: 6px 0; color: #1E293B; font-weight: 500;">${dutyStation || "Headquarters"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Official Username:</td>
              <td style="padding: 6px 0; font-family: monospace; color: #0F172A; font-weight: bold;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Temporary Password:</td>
              <td style="padding: 6px 0; font-family: monospace; color: #B3261E; font-size: 14px; font-weight: bold;">${tempPassword}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #475569;">
          Please sign in to the official staff portal using your credentials below:
        </p>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${loginUrl}" style="background-color: #0B4F6C; color: #FFFFFF; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">
            Access Staff Portal &rarr;
          </a>
        </div>

        <p style="font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 16px; margin-bottom: 0;">
          🔒 <strong>Security Warning:</strong> This message contains confidential government service credentials. Do not share your password. For security reasons, please change your password upon your initial login.
        </p>
      </div>
    </div>`;
}

export function staffWelcomeCredentialsEmail(
  fullName: string,
  username: string,
  email: string,
  tempPassword: string,
  role: string,
  loginUrl: string
) {
  const roleLabel =
    role === "visa_officer"
      ? "Visa Adjudication Officer"
      : role === "admin"
      ? "System Administrator"
      : "Immigration & Border Officer";

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 560px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
      <div style="background-color: #0B4F6C; padding: 26px; text-align: center;">
        <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #99D5C9; margin: 0 0 6px 0; font-weight: 700;">
          Republic of Sierra Leone
        </p>
        <h1 style="color: #FFFFFF; font-size: 22px; margin: 0; font-weight: 800;">
          Immigration Department (SLID)
        </h1>
        <p style="color: #BAE6FD; font-size: 13px; margin: 6px 0 0 0;">
          Official Staff Credentials & Temporary Password Notice
        </p>
      </div>

      <div style="padding: 28px 24px;">
        <h2 style="color: #0B4F6C; font-size: 18px; margin-top: 0;">Welcome to the SLID Officer Portal</h2>
        <p style="font-size: 14px; line-height: 1.6;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6;">
          Your official staff account has been created. Below are your temporary login credentials. Please log in and change your password immediately for security.
        </p>

        <div style="background: #18181B; border-radius: 8px; padding: 20px; margin: 20px 0; color: #FFFFFF;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #27272A;">
              <td style="padding: 10px 0; color: #9CA3AF; text-transform: uppercase; font-size: 11px; font-weight: 600;">Username:</td>
              <td style="padding: 10px 0; font-family: monospace; color: #FFFFFF; font-weight: bold; font-size: 14px;">${username}</td>
            </tr>
            <tr style="border-bottom: 1px solid #27272A;">
              <td style="padding: 10px 0; color: #9CA3AF; text-transform: uppercase; font-size: 11px; font-weight: 600;">Account Email:</td>
              <td style="padding: 10px 0; font-family: monospace; color: #FFFFFF; font-weight: 500;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #27272A;">
              <td style="padding: 10px 0; color: #9CA3AF; text-transform: uppercase; font-size: 11px; font-weight: 600;">Temporary Password:</td>
              <td style="padding: 10px 0; font-family: monospace; color: #38BDF8; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${tempPassword}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #9CA3AF; text-transform: uppercase; font-size: 11px; font-weight: 600;">Assigned Role:</td>
              <td style="padding: 10px 0; color: #4ADE80; font-weight: bold;">${roleLabel}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginUrl}" style="background-color: #0284C7; color: #FFFFFF; text-decoration: none; padding: 13px 32px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">
            Sign In to Staff Portal &rarr;
          </a>
        </div>

        <p style="font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 16px; margin-bottom: 0;">
          🔒 <strong>Security Warning:</strong> This message contains confidential government credentials. You will be prompted to set your own permanent password after logging in.
        </p>
      </div>
    </div>`;
}

export function staffAccountRejectedEmail(fullName: string, reason?: string) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 500px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
      <div style="background-color: #0B4F6C; padding: 20px; text-align: center;">
        <h1 style="color: #FFFFFF; font-size: 18px; margin: 0;">
          Sierra Leone Immigration Department
        </h1>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #B3261E; font-size: 16px; margin-top: 0;">Staff Access Request Update</h2>
        <p style="font-size: 14px;">Dear ${fullName},</p>
        <p style="font-size: 14px;">
          Your staff account application has been reviewed and was <strong>not approved</strong> at this time.
        </p>
        ${reason ? `<p style="font-size: 13px; background: #FEF2F2; border-left: 3px solid #B3261E; padding: 10px; color: #991B1B;"><strong>Reason:</strong> ${reason}</p>` : ""}
        <p style="font-size: 13px; color: #64748B; margin-top: 20px;">
          If you believe this is an error, please contact your commanding directorate or the SLID IT Administrator.
        </p>
      </div>
    </div>`;
}

