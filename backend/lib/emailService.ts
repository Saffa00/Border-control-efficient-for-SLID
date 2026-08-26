/**
 * emailService.ts
 *
 * Email dispatch engine supporting both Resend API and Nodemailer Custom SMTP (Gmail/Brevo/SendGrid/SES).
 * Every send attempt is logged to email_log for full audit trail.
 */

import "dotenv/config";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "./supabaseAdmin";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Sierra Leone Immigration Department <onboarding@resend.dev>";

// Optional Custom SMTP credentials
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : undefined;

let smtpTransporter: nodemailer.Transporter | null = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  smtpTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

interface SendEmailParams {
  userId?: string;
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ userId, to, subject, html }: SendEmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  // 1. Try Custom SMTP first if configured
  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
      });
      await logEmail({ userId, to, subject, status: "sent" });
      return { success: true };
    } catch (smtpErr: any) {
      console.warn("SMTP Transport error, falling back to Resend:", smtpErr.message);
    }
  }

  // 2. Try Resend API
  if (RESEND_API_KEY) {
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

      if (res.ok) {
        await logEmail({ userId, to, subject, status: "sent" });
        return { success: true };
      }

      const body = await res.text();

      // If Resend rejected because recipient is unverified in testing mode,
      // dispatch copy to the admin email so credentials are not lost!
      if (body.includes("validation_error") || body.includes("only send testing emails")) {
        console.warn(`Resend test mode restricted recipient (${to}). Dispatching credentials to admin.`);
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: FROM_ADDRESS,
              to: "saffapetermj@gmail.com",
              subject: `[FORWARDED TO ADMIN] ${subject} (For: ${to})`,
              html: `
                <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 12px; margin-bottom: 16px; border-radius: 8px; font-family: sans-serif; font-size: 13px; color: #92400E;">
                  <strong>⚠️ Sandbox Email Notice:</strong> This message was destined for <strong>${to}</strong>. Delivered to admin because custom domain is not yet verified on Resend.
                </div>
                ${html}
              `,
            }),
          });
        } catch {}
      }

      await logEmail({ userId, to, subject, status: "failed", errorMessage: body });
      return { success: false, error: body };
    } catch (err: any) {
      await logEmail({ userId, to, subject, status: "failed", errorMessage: err.message });
      return { success: false, error: err.message };
    }
  }

  await logEmail({ userId, to, subject, status: "failed", errorMessage: "No active email transport configured" });
  return { success: false, error: "Email service not configured" };
}

// ---------------------------------------------------------------------------
// Audit Logger
// ---------------------------------------------------------------------------
interface LogEmailParams {
  userId?: string;
  to: string;
  subject: string;
  status: "sent" | "failed";
  errorMessage?: string;
}

async function logEmail({ userId, to, subject, status, errorMessage }: LogEmailParams): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("email_log").insert({
      user_id: userId ?? null,
      recipient_email: to,
      subject,
      status,
      error_message: errorMessage ?? null,
    });

    if (error) {
      console.warn("Could not write to email_log:", error.message);
    }
  } catch (err: any) {
    console.warn("logEmail failed:", err?.message);
  }
}

// ---------------------------------------------------------------------------
// HTML Email Templates
// ---------------------------------------------------------------------------

export function staffWelcomeCredentialsEmail(
  fullName: string,
  email: string,
  username: string,
  tempPassword: string,
  role: string,
  loginUrl: string
) {
  const roleLabel =
    role === "visa_officer"
      ? "Visa Adjudication Officer"
      : role === "admin"
      ? "Directorate Administrator"
      : "Immigration & Border Control Officer";

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 540px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
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
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Your official immigration officer account has been approved by the Directorate Administrator. Below are your official access credentials:
        </p>

        <div style="background: #18181B; border-radius: 12px; padding: 20px; margin: 20px 0; color: #FFFFFF; border: 1px solid #27272A;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #27272A;">
              <td style="padding: 10px 0; color: #9CA3AF; text-transform: uppercase; font-size: 11px; font-weight: 600;">Official Username:</td>
              <td style="padding: 10px 0; font-family: monospace; color: #FFFFFF; font-weight: bold; font-size: 14px;">${username}</td>
            </tr>
            <tr style="border-bottom: 1px solid #27272A;">
              <td style="padding: 10px 0; color: #9CA3AF; text-transform: uppercase; font-size: 11px; font-weight: 600;">Account Email:</td>
              <td style="padding: 10px 0; font-family: monospace; color: #FFFFFF; font-weight: 500;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #27272A;">
              <td style="padding: 10px 0; color: #9CA3AF; text-transform: uppercase; font-size: 11px; font-weight: 600;">Temporary Password:</td>
              <td style="padding: 10px 0; font-family: monospace; color: #38BDF8; font-size: 17px; font-weight: bold; letter-spacing: 1.5px;">${tempPassword}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #9CA3AF; text-transform: uppercase; font-size: 11px; font-weight: 600;">Assigned Role:</td>
              <td style="padding: 10px 0; color: #4ADE80; font-weight: bold;">${roleLabel}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginUrl}" style="background-color: #0284C7; color: #FFFFFF; text-decoration: none; padding: 13px 32px; font-size: 14px; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 2px 8px rgba(2,132,199,0.3);">
            Access Official Staff Portal &rarr;
          </a>
        </div>

        <p style="font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 16px; margin-bottom: 0; line-height: 1.5;">
          🔒 <strong>Security Notice:</strong> You can sign in using either your official username or email address. You may change your password anytime via your profile settings.
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
        <p style="font-size: 14px; line-height: 1.5;">
          Your recent request for staff portal access has been reviewed by the Administrator. Unfortunately, the request was not approved at this time.
        </p>
        ${reason ? `<div style="background: #FEF2F2; border-left: 4px solid #B3261E; padding: 12px; font-size: 13px; color: #991B1B;"><strong>Reason:</strong> ${reason}</div>` : ""}
      </div>
    </div>`;
}

export function visaApprovedEmail(fullName: string, applicationRef: string, visaType: string, validityDays: number) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
      <div style="background-color: #1E8E5A; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: bold;">
          SIERRA LEONE IMMIGRATION DEPARTMENT
        </h1>
        <p style="color: #E2F2EB; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">
          Official Electronic Visa Approval Notice
        </p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1E8E5A; font-size: 18px; margin-top: 0;">Visa Application Approved</h2>
        <p style="font-size: 15px;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5;">
          Your application for a <strong>${visaType} Visa</strong> (Ref: <strong>${applicationRef}</strong>) has been approved by the Visa Adjudication Directorate.
        </p>
        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #166534;">
            <strong>Application Reference:</strong> ${applicationRef}<br />
            <strong>Validity:</strong> ${validityDays} days from date of entry
          </p>
        </div>
      </div>
    </div>`;
}

export function visaRejectedEmail(fullName: string, applicationRef: string, reason: string) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
      <div style="background-color: #0B4F6C; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: bold;">
          SIERRA LEONE IMMIGRATION DEPARTMENT
        </h1>
        <p style="color: #BAE6FD; font-size: 12px; margin: 4px 0 0; text-transform: uppercase;">
          Application Status Update
        </p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 15px; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5;">
          Regarding application <strong>${applicationRef}</strong>: your visa application has been refused.
        </p>
        <div style="background-color: #FEF2F2; border-left: 4px solid #B3261E; padding: 12px; margin: 16px 0; font-size: 13px; color: #991B1B;">
          <strong>Reason:</strong> ${reason}
        </div>
      </div>
    </div>`;
}

export function additionalDocumentsEmail(fullName: string, applicationRef: string, notes: string) {
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

export function documentsRequestedEmail(fullName: string, applicationRef: string, notes: string) {
  return additionalDocumentsEmail(fullName, applicationRef, notes);
}

export function passwordResetEmail(fullName: string, resetUrl: string) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; max-width: 540px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #FFFFFF;">
      <div style="background-color: #0B4F6C; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="color: #FFFFFF; font-size: 18px; margin: 0; font-weight: bold;">
          SIERRA LEONE IMMIGRATION DEPARTMENT
        </h1>
        <p style="color: #BAE6FD; font-size: 11px; margin: 4px 0 0; text-transform: uppercase;">
          Password Reset Request
        </p>
      </div>
      <div style="padding: 28px 24px;">
        <p style="font-size: 14px;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5;">
          We received a request to reset the password for your official account. Click the button below to set a new password:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #0284C7; color: #FFFFFF; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">
            Choose New Password &rarr;
          </a>
        </div>
      </div>
    </div>`;
}
