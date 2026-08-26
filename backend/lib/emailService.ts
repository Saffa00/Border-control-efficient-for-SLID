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
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Sierra Leone Immigration Department <onboarding@resend.dev>";

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
  try {
    await supabaseAdmin.from("email_log").insert({
      user_id: params.userId ?? null,
      to_email: params.to,
      subject: params.subject,
      body: "",
      status: params.status,
      error_message: params.errorMessage ?? null,
    });
  } catch (err) {
    console.error("email_log insert failed:", err);
  }
}

// ---------------------------------------------------------------------------
// HTML Email Templates (Branded for Sierra Leone Immigration Department)
// ---------------------------------------------------------------------------

export function passwordResetEmail(resetUrl: string, recipientName?: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; max-width: 540px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; background: #FFFFFF; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="height: 6px; width: 100%; display: table; table-layout: fixed;">
        <div style="display: table-cell; background-color: #1E8E5A; height: 6px;"></div>
        <div style="display: table-cell; background-color: #FFFFFF; height: 6px;"></div>
        <div style="display: table-cell; background-color: #0B4F6C; height: 6px;"></div>
      </div>

      <div style="background-color: #061826; padding: 28px 24px; text-align: center; color: #FFFFFF;">
        <img src="https://border-control-efficient-for-slid.vercel.app/slid-logo.png" alt="SLID Crest" width="68" height="68" style="margin: 0 auto 12px; display: block; border-radius: 50%;" />
        <p style="color: #10B981; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px;">Republic of Sierra Leone</p>
        <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Department of Immigration</h1>
        <p style="color: #94A3B8; font-size: 11px; margin: 4px 0 0;">Sierra Leone Immigration Department (SLID)</p>
      </div>

      <div style="padding: 32px 28px;">
        <h2 style="color: #0F172A; font-size: 18px; font-weight: 700; margin: 0 0 12px;">Reset Your Account Password</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
          ${recipientName ? `Hello <strong>${recipientName}</strong>,` : "Hello,"}
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px;">
          We received an official request to reset the password for your SLID account. Tap the secure button below to choose a new password:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #1E8E5A; color: #FFFFFF; text-decoration: none; padding: 14px 36px; font-size: 14px; font-weight: 700; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(30,142,90,0.35);">
            🔒 Choose New Password &rarr;
          </a>
        </div>

        <p style="font-size: 12px; line-height: 1.5; color: #64748B; margin: 24px 0 0; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px;">
          ⏱️ <strong>Note:</strong> For security, this link will expire in 1 hour. If you did not request a password reset, you can safely ignore this transmission.
        </p>
      </div>

      <div style="background-color: #F1F5F9; border-top: 1px solid #E2E8F0; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748B;">
        <p style="margin: 0 0 4px;">&copy; ${new Date().getFullYear()} Republic of Sierra Leone Department of Immigration</p>
        <p style="margin: 0;">Gloucester Street Headquarters, Freetown, Sierra Leone</p>
      </div>
    </div>`;
}

export function visaApprovedEmail(fullName: string, applicationRef: string, visaNumber: string, expiryDate: string) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
      <div style="background-color: #1E8E5A; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: bold;">
          SIERRA LEONE IMMIGRATION DEPARTMENT
        </h1>
        <p style="color: #E2F2EB; font-size: 12px; margin: 4px 0 0; text-transform: uppercase;">
          Electronic Visa Approved
        </p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 15px; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #4B5563;">
          Your visa application (Ref: <strong>${applicationRef}</strong>) has been approved.
        </p>
        <div style="background-color: #F8F7F4; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 13px;">Visa Number: <strong style="font-family: monospace;">${visaNumber}</strong></p>
          <p style="margin: 0; font-size: 13px;">Valid Until: <strong>${expiryDate}</strong></p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://border-control-efficient-for-slid.vercel.app/dashboard" style="background-color: #1E8E5A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">
            Download Visa &amp; QR Certificate &rarr;
          </a>
        </div>
      </div>
    </div>`;
}

export function visaRejectedEmail(fullName: string, applicationRef: string, reason?: string) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
      <div style="background-color: #B3261E; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: bold;">
          SIERRA LEONE IMMIGRATION DEPARTMENT
        </h1>
        <p style="color: #FEE2E2; font-size: 12px; margin: 4px 0 0; text-transform: uppercase;">
          Visa Application Update
        </p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 15px; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #4B5563;">
          Your visa application (Ref: <strong>${applicationRef}</strong>) could not be approved at this time.
        </p>
        ${reason ? `<div style="background-color: #FEF2F2; border-left: 4px solid #B3261E; padding: 12px; margin: 16px 0; font-size: 13px; color: #991B1B;"><strong>Reason:</strong> ${reason}</div>` : ""}
      </div>
    </div>`;
}

export function documentsRequestedEmail(fullName: string, applicationRef: string, notes?: string) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
      <div style="background-color: #0B4F6C; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: bold;">
          SIERRA LEONE IMMIGRATION DEPARTMENT
        </h1>
        <p style="color: #BAE6FD; font-size: 12px; margin: 4px 0 0; text-transform: uppercase;">
          Additional Documentation Required
        </p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 15px; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #4B5563;">
          Please provide additional documentation for application (Ref: <strong>${applicationRef}</strong>).
        </p>
        ${notes ? `<div style="background-color: #F0F9FF; border-left: 4px solid #0B4F6C; padding: 12px; margin: 16px 0; font-size: 13px; color: #0369A1;"><strong>Instructions:</strong> ${notes}</div>` : ""}
      </div>
    </div>`;
}

export function paymentConfirmationEmail(fullName: string, applicationRef: string, amountUsd: number | string, reference: string) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
      <div style="background-color: #0B4F6C; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: bold;">
          PAYMENT CONFIRMATION
        </h1>
        <p style="color: #BAE6FD; font-size: 12px; margin: 4px 0 0; text-transform: uppercase;">
          Sierra Leone Immigration Department
        </p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 15px; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px;">We have received your statutory fee payment for application <strong>${applicationRef}</strong>.</p>
        <p style="font-size: 16px; font-weight: bold; color: #1E8E5A;">
          Amount Paid: USD $${amountUsd}
        </p>
        <p style="font-size: 13px; color: #6B7280;">
          Payment Ref: <span style="font-family: monospace;">${reference}</span>
        </p>
      </div>
    </div>`;
}

export function staffAccountApprovedEmail(
  fullName: string,
  emailOrRole: string,
  tempPasswordOrLoginUrl?: string,
  role?: string,
  dutyStation?: string,
  loginUrl?: string
) {
  const isDetailed = !!loginUrl;
  const safeLoginUrl = loginUrl || tempPasswordOrLoginUrl || "https://border-control-efficient-for-slid.vercel.app/staff/login";
  const userRole = role || emailOrRole || "immigration_officer";
  const roleLabel =
    userRole === "admin"
      ? "Directorate Administrator"
      : userRole === "visa_officer"
      ? "Visa Adjudication Officer"
      : "Border Clearance Officer";

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 540px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
      <div style="background-color: #1E8E5A; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="color: #FFFFFF; font-size: 18px; margin: 0; font-weight: bold;">
          SIERRA LEONE IMMIGRATION DEPARTMENT
        </h1>
        <p style="color: #E2F2EB; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">
          Official Staff Access Authorization
        </p>
      </div>
      <div style="padding: 28px 24px;">
        <h2 style="color: #1E8E5A; font-size: 16px; margin-top: 0;">Staff Account Approved</h2>
        <p style="font-size: 14px;">Dear ${fullName},</p>
        <p style="font-size: 14px; line-height: 1.5;">
          Your official staff account has been approved by the Directorate Administrator with role: <strong>${roleLabel}</strong>.
          ${dutyStation ? `<br/>Duty Station: <strong>${dutyStation}</strong>` : ""}
        </p>
        ${
          isDetailed && tempPasswordOrLoginUrl
            ? `
          <div style="background: #18181B; border-radius: 8px; padding: 16px; margin: 16px 0; color: #FFFFFF;">
            <p style="margin: 0 0 6px; font-size: 11px; color: #9CA3AF; text-transform: uppercase;">Temporary Password:</p>
            <p style="margin: 0; font-family: monospace; font-size: 16px; color: #38BDF8; font-weight: bold;">${tempPasswordOrLoginUrl}</p>
          </div>
        `
            : ""
        }
        <div style="text-align: center; margin: 24px 0;">
          <a href="${safeLoginUrl}" style="background-color: #1E8E5A; color: #FFFFFF; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">
            Access Official Staff Portal &rarr;
          </a>
        </div>
      </div>
    </div>`;
}

export function staffWelcomeCredentialsEmail(
  fullName: string,
  email: string,
  username: string,
  tempPassword: string,
  role: string,
  loginUrl: string
) {
  const roleLabel = role === "visa_officer" ? "Visa Adjudication Officer" : "Border Clearance Officer";

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 540px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
      <div style="background-color: #061826; padding: 28px 24px; text-align: center; color: #FFFFFF;">
        <h1 style="color: #FFFFFF; font-size: 18px; margin: 0; font-weight: bold; letter-spacing: 0.5px;">
          SIERRA LEONE IMMIGRATION DEPARTMENT
        </h1>
        <p style="color: #10B981; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
          Official Staff Provisioning Credentials
        </p>
      </div>

      <div style="padding: 28px 24px;">
        <p style="font-size: 15px; font-weight: 600; margin-top: 0; color: #0F172A;">
          Official Welcome, Officer ${fullName}
        </p>
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
