import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { sendEmail, passwordResetEmail } from "../lib/emailService";

const router = Router();

/**
 * POST /api/auth/request-password-reset
 * Generates an official password reset link and dispatches it to the user's email via SMTP/Resend.
 */
router.post("/api/auth/request-password-reset", async (req, res) => {
  const { email, redirectUrl } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email address is required." });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Look up user in auth registry
    const { data: authList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const matchedUser = authList?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (!matchedUser) {
      // Security best practice: don't reveal user non-existence, return success
      return res.json({ success: true, message: "Reset email dispatched if account exists." });
    }

    const fullName =
      matchedUser.user_metadata?.full_name ||
      matchedUser.email?.split("@")[0] ||
      "Valued User";

    // 2. Generate target reset URL
    const baseUrl = redirectUrl || process.env.FRONTEND_URL || "https://border-control-efficient-for-slid.vercel.app/reset-password";
    const resetUrl = `${baseUrl}?email=${encodeURIComponent(cleanEmail)}`;

    // 3. Send email using server SMTP / Resend
    const html = passwordResetEmail(fullName, resetUrl);
    await sendEmail({
      userId: matchedUser.id,
      to: cleanEmail,
      subject: "Sierra Leone Immigration - Password Reset Request",
      html,
    });

    return res.json({ success: true, message: "Reset email dispatched successfully." });
  } catch (err: any) {
    console.error("Error handling request-password-reset:", err);
    return res.status(500).json({ error: err.message || "Failed to send password reset email." });
  }
});

/**
 * POST /api/auth/direct-password-reset
 * Directly updates a user's password using Supabase Service-Role Admin privilege.
 * Solves rate-limiting or session issues when completing password recovery.
 */
router.post("/api/auth/direct-password-reset", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password are required." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Find user in auth registry
    const { data: authList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const matchedUser = authList?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (!matchedUser) {
      return res.status(404).json({ error: "No account found registered under this email address." });
    }

    // 2. Update password in Supabase Auth using Service Role key
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      matchedUser.id,
      {
        password: newPassword,
        user_metadata: {
          ...matchedUser.user_metadata,
          temporary_password: false,
        },
      }
    );

    if (updateError) throw updateError;

    // 3. Also clear temporary password flag in public.users table if it exists
    try {
      await supabaseAdmin
        .from("users")
        .update({ is_temporary_password: false })
        .eq("user_id", matchedUser.id);
    } catch {}

    return res.json({
      success: true,
      message: "Password updated successfully! You can now sign in with your new credentials.",
    });
  } catch (err: any) {
    console.error("Error in direct-password-reset:", err);
    return res.status(500).json({ error: err.message || "Failed to update password." });
  }
});

/**
 * POST /api/auth/change-password
 * Allows an authenticated user to change their password directly from their profile/settings.
 */
router.post("/api/auth/change-password", async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: "User ID and new password are required." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters long." });
  }

  try {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password: newPassword,
        user_metadata: {
          temporary_password: false,
        },
      }
    );

    if (updateError) throw updateError;

    // Clear temporary flag in database
    try {
      await supabaseAdmin
        .from("users")
        .update({ is_temporary_password: false })
        .eq("user_id", userId);
    } catch {}

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err: any) {
    console.error("Error in change-password:", err);
    return res.status(500).json({ error: err.message || "Failed to change password." });
  }
});

export default router;
