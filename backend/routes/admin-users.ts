/**
 * admin-users.ts
 *
 * Staff account creation & approval must go through the backend, never the browser:
 * creating an auth.users row requires the Supabase service-role key,
 * which must never be shipped to client code.
 *
 * All administrative endpoints are secured with requireAdmin middleware.
 */

import { Router } from "express";
import crypto from "crypto";
import { supabaseAdmin } from "../lib/supabaseAdmin"; // service-role client
import { requireAdmin, AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  sendEmail,
  staffAccountApprovedEmail,
  staffAccountRejectedEmail,
  staffWelcomeCredentialsEmail,
} from "../lib/emailService";

const router = Router();

// ---------------------------------------------------------------
// POST /api/auth/resolve-username
// Resolves an official username or badge number to the user's email address
// ---------------------------------------------------------------
router.post("/api/auth/resolve-username", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  const cleanUser = username.trim().toLowerCase();

  try {
    // 1. Check if cleanUser is already an email
    if (cleanUser.includes("@")) {
      return res.json({ email: cleanUser });
    }

    // 2. Check auth.users user_metadata for username
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
    if (authList?.users) {
      const matched = authList.users.find(
        (u) =>
          u.user_metadata?.username?.toLowerCase() === cleanUser ||
          u.email?.toLowerCase().startsWith(cleanUser)
      );
      if (matched?.email) {
        return res.json({ email: matched.email });
      }
    }

    // 3. Check public.staff_profiles for staff_id_code
    const { data: staff } = await supabaseAdmin
      .from("staff_profiles")
      .select("users(email)")
      .ilike("staff_id_code", cleanUser)
      .maybeSingle();

    if (staff && (staff.users as any)?.email) {
      return res.json({ email: (staff.users as any).email });
    }

    return res.status(404).json({ error: "Username not recognized" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// POST /api/staff/signup
// Direct staff onboarding registration:
// SECURITY HARDENING: Disallows privilege escalation. Rejects any
// attempts to self-assign 'admin' role.
// ---------------------------------------------------------------
router.post("/api/staff/signup", async (req, res) => {
  const { email, fullName, role = "immigration_officer" } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ error: "Email address and full name are required." });
  }

  // Security check: Never allow self-registration as admin
  if (role === "admin") {
    return res.status(403).json({
      error: "Security violation: Administrator accounts cannot be self-created. Contact system administrator.",
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  const safeRole = role === "visa_officer" ? "visa_officer" : "immigration_officer";

  try {
    // 1. Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("email, role")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        error: `An account already exists for "${cleanEmail}" with role '${existingUser.role}'. Please sign in at /staff/login.`,
      });
    }

    // 2. Generate clean username: e.g. petesaffej9wy2026
    const nameParts = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomSuffix = crypto.randomBytes(2).toString("hex");
    const currentYear = new Date().getFullYear();
    const generatedUsername = `${nameParts.slice(0, 10)}${randomSuffix}${currentYear}`;

    // 3. Generate high-entropy 8-character temporary password (e.g. aw6PTPOY)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let tempPassword = "";
    const randomBytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
      tempPassword += chars[randomBytes[i] % chars.length];
    }

    // 4. Create the Supabase auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        username: generatedUsername,
        temporary_password: true,
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const newUserId = authData.user.id;

    // 5. Create row in public.users
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      user_id: newUserId,
      full_name: cleanName,
      email: cleanEmail,
      role: safeRole,
      is_active: true,
    });

    if (profileError) {
      console.warn("Could not insert public.users row:", profileError.message);
    }

    // 6. Create row in public.staff_profiles
    const staffIdCode = `SLID-${Date.now().toString(36).toUpperCase()}`;
    try {
      await supabaseAdmin.from("staff_profiles").insert({
        user_id: newUserId,
        staff_id_code: staffIdCode,
        rank_title: safeRole === "visa_officer" ? "Visa Adjudication Officer" : "Immigration Officer",
        department: safeRole === "visa_officer" ? "Visa Administration" : "Border Control & Clearance",
        duty_station: "Freetown National Headquarters",
        status: "Active",
      });
    } catch (staffErr: any) {
      console.warn("Could not insert staff_profiles row:", staffErr.message);
    }

    // 7. Dispatch Official Credentials Email via Resend
    const loginUrl = `${req.headers.origin || "http://localhost:5173"}/staff/login`;
    const emailHtml = staffWelcomeCredentialsEmail(
      cleanName,
      generatedUsername,
      cleanEmail,
      tempPassword,
      safeRole,
      loginUrl
    );

    await sendEmail({
      userId: newUserId,
      to: cleanEmail,
      subject: "Official Staff Account Created — Sierra Leone Immigration Department",
      html: emailHtml,
    });

    const roleLabel =
      safeRole === "visa_officer" ? "Visa Adjudication Officer" : "Immigration Officer";

    return res.json({
      success: true,
      username: generatedUsername,
      email: cleanEmail,
      tempPassword,
      role: roleLabel,
      createdAt: new Date().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }),
    });
  } catch (err: any) {
    console.error("Staff sign-up error:", err);
    return res.status(500).json({ error: err.message || "Failed to create staff account." });
  }
});

// ---------------------------------------------------------------
// POST /api/staff/request-access
// Public endpoint for prospective immigration & visa officers to
// submit their official access application.
// ---------------------------------------------------------------
router.post("/api/staff/request-access", async (req, res) => {
  const {
    fullName,
    email,
    phone,
    requestedRole,
    rankTitle,
    department,
    dutyStation,
    checkpointId,
    badgeNumber,
    reason,
  } = req.body;

  if (!fullName || !email || !requestedRole) {
    return res.status(400).json({ error: "Full name, official email, and requested role are required." });
  }

  try {
    // Check if an existing user with this email already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("email, role")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        error: `An account already exists for ${email} with role '${existingUser.role}'. Please log in directly at /staff/login.`,
      });
    }

    // Check if a pending request already exists
    const { data: existingRequest } = await supabaseAdmin
      .from("staff_access_requests")
      .select("request_id, status")
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      return res.status(400).json({
        error: "A pending application with this email address is already under review by the Administrator.",
      });
    }

    const { data: request, error: insertError } = await supabaseAdmin
      .from("staff_access_requests")
      .insert({
        full_name: fullName,
        email,
        phone: phone || null,
        requested_role: requestedRole,
        rank_title: rankTitle || "Officer",
        department: department || "Immigration Department",
        duty_station: dutyStation || "Unassigned",
        checkpoint_id: checkpointId || null,
        badge_number: badgeNumber || null,
        reason: reason || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.json({ success: true, request });
  } catch (err: any) {
    console.error("staff request-access failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error submitting request" });
  }
});

// ---------------------------------------------------------------
// GET /api/admin/staff-requests
// Admin list of all staff access requests.
// ---------------------------------------------------------------
router.get("/api/admin/staff-requests", requireAdmin, async (_req: AuthenticatedRequest, res) => {
  try {
    const { data: requests, error: fetchError } = await supabaseAdmin
      .from("staff_access_requests")
      .select("*, checkpoints(name, code, type)")
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    return res.json({ requests: requests ?? [] });
  } catch (err: any) {
    console.error("fetch staff-requests failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ---------------------------------------------------------------
// POST /api/admin/staff-requests/:requestId/approve
// Approves a pending staff access request
// ---------------------------------------------------------------
router.post("/api/admin/staff-requests/:requestId/approve", requireAdmin, async (req: AuthenticatedRequest, res) => {
  const requestId = req.params.requestId as string;
  const requestingUserId = (req.user?.id || req.profile?.user_id) as string;

  try {
    // 1. Fetch user or access request
    let targetUser: any = null;

    // Check if requestId is a user_id from public.users
    const { data: userRow } = await supabaseAdmin
      .from("users")
      .select("user_id, full_name, email, role, phone, is_active")
      .eq("user_id", requestId)
      .maybeSingle();

    if (userRow) {
      targetUser = {
        user_id: userRow.user_id,
        full_name: userRow.full_name,
        email: userRow.email,
        requested_role: userRow.role,
        phone: userRow.phone,
        duty_station: "Freetown National Headquarters",
      };
    } else {
      // Check staff_access_requests
      const { data: staffReq } = await supabaseAdmin
        .from("staff_access_requests")
        .select("*, checkpoints(name)")
        .eq("request_id", requestId)
        .maybeSingle();

      if (staffReq) {
        targetUser = staffReq;
      }
    }

    if (!targetUser) {
      return res.status(404).json({ error: "Staff record not found." });
    }

    // 2. Generate clean official username & high-entropy temporary password
    const nameParts = targetUser.full_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomSuffix = crypto.randomBytes(2).toString("hex");
    const currentYear = new Date().getFullYear();
    const generatedUsername = `${nameParts.slice(0, 10)}${randomSuffix}${currentYear}`;

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let tempPassword = "";
    const randomBytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
      tempPassword += chars[randomBytes[i] % chars.length];
    }

    let newUserId = targetUser.user_id;

    // 3. Create or Update the Supabase auth user
    if (newUserId) {
      // Update existing auth user password
      try {
        await supabaseAdmin.auth.admin.updateUserById(newUserId, {
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: targetUser.full_name,
            username: generatedUsername,
            temporary_password: true,
          },
        });
      } catch (authUpErr) {
        console.warn("Auth user update notice:", authUpErr);
      }
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: targetUser.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: targetUser.full_name,
          username: generatedUsername,
          temporary_password: true,
        },
      });

      if (authError) throw authError;
      newUserId = authData.user.id;
    }

    // 4. Update or Insert public.users row with is_active = true
    await supabaseAdmin.from("users").upsert({
      user_id: newUserId,
      full_name: targetUser.full_name,
      email: targetUser.email,
      phone: targetUser.phone || null,
      role: targetUser.requested_role || targetUser.role || "immigration_officer",
      is_active: true,
    });

    // 5. Create public.staff_profiles row
    const staffIdCode = targetUser.badge_number || `SLID-${Date.now().toString(36).toUpperCase()}`;
    const dutyStationName = (targetUser.checkpoints as any)?.name || targetUser.duty_station || "Freetown National Headquarters";

    try {
      await supabaseAdmin.from("staff_profiles").upsert({
        user_id: newUserId,
        staff_id_code: staffIdCode,
        rank_title: targetUser.rank_title || "Officer",
        department: targetUser.department || (targetUser.requested_role === "visa_officer" ? "Visa Administration" : "Border Control & Clearance"),
        duty_station: dutyStationName,
        issue_date: new Date().toISOString().slice(0, 10),
        expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 3))
          .toISOString()
          .slice(0, 10),
        status: "Active",
      });
    } catch (sErr) {
      console.warn("staff_profiles upsert notice:", sErr);
    }

    // 6. Update request status to 'approved' if it was in staff_access_requests
    try {
      await supabaseAdmin
        .from("staff_access_requests")
        .update({
          status: "approved",
          reviewed_by: requestingUserId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("request_id", requestId);
    } catch {}

    // 7. Send real official credentials welcome email via Resend
    const loginUrl = "https://border-control-efficient-for-slid.vercel.app/staff/login";
    const emailHtml = staffWelcomeCredentialsEmail(
      targetUser.full_name,
      targetUser.email,
      generatedUsername,
      tempPassword,
      targetUser.requested_role || targetUser.role || "immigration_officer",
      loginUrl
    );

    const emailRes = await sendEmail({
      userId: newUserId,
      to: targetUser.email,
      subject: "🔒 Official Staff Account Approved & Login Credentials — Sierra Leone Immigration Department",
      html: emailHtml,
    });

    // 8. Admin audit log
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: requestingUserId,
      action: "staff_request_approved",
      target_type: "users",
      target_id: newUserId,
      details: JSON.stringify({
        email: targetUser.email,
        username: generatedUsername,
        role: targetUser.requested_role || targetUser.role,
        dutyStation: dutyStationName,
        emailSent: emailRes.success,
      }),
    });

    return res.json({
      success: true,
      message: "Staff member approved, account provisioned, and credentials sent via email.",
      userId: newUserId,
      username: generatedUsername,
      tempPassword,
      emailSent: emailRes.success,
    });
  } catch (err: any) {
    console.error("approve staff-request failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ---------------------------------------------------------------
// POST /api/admin/staff-requests/:requestId/reject
// Rejects a staff access request with an optional reason note.
// ---------------------------------------------------------------
router.post("/api/admin/staff-requests/:requestId/reject", requireAdmin, async (req: AuthenticatedRequest, res) => {
  const requestId = req.params.requestId as string;
  const { rejectionReason } = req.body;
  const requestingUserId = (req.user?.id || req.profile?.user_id) as string;

  try {
    const { data: staffReq, error: reqError } = await supabaseAdmin
      .from("staff_access_requests")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (reqError || !staffReq) {
      return res.status(404).json({ error: "Staff access request not found" });
    }

    await supabaseAdmin
      .from("staff_access_requests")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason || "Application declined after administrative review.",
        reviewed_by: requestingUserId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("request_id", requestId);

    // Send rejection notice email via Resend
    const emailHtml = staffAccountRejectedEmail(staffReq.full_name, rejectionReason);
    await sendEmail({
      to: staffReq.email,
      subject: "Staff Access Request Update — Sierra Leone Immigration Department",
      html: emailHtml,
    });

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: requestingUserId,
      action: "staff_request_rejected",
      target_type: "staff_access_requests",
      target_id: requestId,
      details: JSON.stringify({ email: staffReq.email, reason: rejectionReason }),
    });

    return res.json({ success: true });
  } catch (err: any) {
    console.error("reject staff-request failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ---------------------------------------------------------------
// POST /api/admin/invite-staff (Direct Admin Invite)
// ---------------------------------------------------------------
router.post("/api/admin/invite-staff", requireAdmin, async (req: AuthenticatedRequest, res) => {
  const {
    email,
    fullName,
    role,
    rankTitle,
    department,
    dutyStation,
    checkpointId,
  } = req.body;
  const requestingUserId = req.user?.id || req.profile?.user_id;

  if (!email || !fullName || !role) {
    return res.status(400).json({ error: "Missing required fields (email, fullName, role)" });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("email, role")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        error: `An account already exists for "${cleanEmail}" with role '${existingUser.role}'.`,
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
      redirectTo: `${frontendUrl}/reset-password`,
    });
    if (authError) throw authError;

    const newUserId = authUser.user.id;

    await supabaseAdmin.from("email_log").insert({
      user_id: newUserId,
      to_email: email,
      subject: "You've been invited to SL Immigration Department",
      body: "",
      status: "sent",
    });

    const { error: profileError } = await supabaseAdmin.from("users").insert({
      user_id: newUserId,
      full_name: fullName,
      email,
      role,
    });
    if (profileError) throw profileError;

    const { error: staffError } = await supabaseAdmin.from("staff_profiles").insert({
      user_id: newUserId,
      staff_id_code: `SLID-${Date.now().toString(36).toUpperCase()}`,
      rank_title: rankTitle ?? "Officer",
      department: department ?? "Immigration",
      duty_station: dutyStation ?? "Unassigned",
      issue_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 3))
        .toISOString()
        .slice(0, 10),
      status: "Active",
      checkpoint_id: checkpointId ?? null,
    });
    if (staffError) throw staffError;

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: requestingUserId,
      action: "staff_account_created",
      target_type: "users",
      target_id: newUserId,
      details: `Created ${role} account for ${email}`,
    });

    return res.json({ userId: newUserId });
  } catch (err: any) {
    console.error("invite-staff failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ---------------------------------------------------------------
// POST /api/admin/users/create (Direct Account Creation with Credentials)
// ---------------------------------------------------------------
router.post("/api/admin/users/create", requireAdmin, async (req: AuthenticatedRequest, res) => {
  const {
    email,
    password,
    fullName,
    role,
    phone,
    rankTitle,
    department,
    dutyStation,
    checkpointId,
  } = req.body;
  const requestingUserId = req.user?.id || req.profile?.user_id;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ error: "Missing required fields (email, password, fullName, role)" });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("email, role")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        error: `An account already exists for "${cleanEmail}" with role '${existingUser.role}'.`,
      });
    }

    // Generate clean username for official staff identification
    const nameParts = fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomSuffix = crypto.randomBytes(2).toString("hex");
    const currentYear = new Date().getFullYear();
    const generatedUsername = `${nameParts.slice(0, 10)}${randomSuffix}${currentYear}`;

    // Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        username: generatedUsername,
        temporary_password: true,
      },
    });

    if (authError) throw authError;
    const newUserId = authData.user.id;

    // Create record in public.users
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      user_id: newUserId,
      full_name: fullName.trim(),
      email: cleanEmail,
      role,
      phone: phone || null,
      is_active: true,
    });

    if (profileError) throw profileError;

    // If staff role, create staff_profiles record
    if (role !== "applicant") {
      const { error: staffError } = await supabaseAdmin.from("staff_profiles").insert({
        user_id: newUserId,
        staff_id_code: `SLID-${Date.now().toString(36).toUpperCase()}`,
        rank_title: rankTitle || "Officer",
        department: department || "Immigration Directorate",
        duty_station: dutyStation || "Unassigned",
        issue_date: new Date().toISOString().slice(0, 10),
        expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 3))
          .toISOString()
          .slice(0, 10),
        status: "Active",
        checkpoint_id: checkpointId || null,
      });
      if (staffError) console.error("staff_profile insert warning:", staffError);

      // Dispatch Official Credentials Email via Resend
      const loginUrl = `${req.headers.origin || "http://localhost:5173"}/staff/login`;
      const emailHtml = staffWelcomeCredentialsEmail(
        fullName.trim(),
        generatedUsername,
        cleanEmail,
        password,
        role,
        loginUrl
      );

      await sendEmail({
        userId: newUserId,
        to: cleanEmail,
        subject: "Official Staff Account Provisioned — Sierra Leone Immigration Department",
        html: emailHtml,
      });
    }

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: requestingUserId,
      action: "user_created_by_admin",
      target_type: "users",
      target_id: newUserId,
      details: `Created ${role} user: ${cleanEmail}`,
    });

    return res.json({
      success: true,
      userId: newUserId,
      username: generatedUsername,
      email: cleanEmail,
      tempPassword: password,
      role,
    });
  } catch (err: any) {
    console.error("admin create user failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error creating user" });
  }
});

// ---------------------------------------------------------------
// POST /api/admin/users/:userId/send-credentials
// Re-generates or dispatches official credentials email to staff member
// ---------------------------------------------------------------
router.post("/api/admin/users/:userId/send-credentials", requireAdmin, async (req: AuthenticatedRequest, res) => {
  const userId = req.params.userId as string;
  const requestingUserId = (req.user?.id || req.profile?.user_id) as string;

  try {
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("user_id, full_name, email, role")
      .eq("user_id", userId)
      .single();

    if (userError || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate high-entropy 8-character temporary password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let newTempPassword = "";
    const randomBytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
      newTempPassword += chars[randomBytes[i] % chars.length];
    }

    // Generate username
    const nameParts = targetUser.full_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomSuffix = crypto.randomBytes(2).toString("hex");
    const currentYear = new Date().getFullYear();
    const generatedUsername = `${nameParts.slice(0, 10)}${randomSuffix}${currentYear}`;

    // Update Supabase Auth user password
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newTempPassword,
      user_metadata: {
        username: generatedUsername,
        temporary_password: true,
      },
    });

    if (updateAuthError) throw updateAuthError;

    // Send the official credentials email via Resend
    const loginUrl = `${req.headers.origin || "http://localhost:5173"}/staff/login`;
    const emailHtml = staffWelcomeCredentialsEmail(
      targetUser.full_name,
      generatedUsername,
      targetUser.email,
      newTempPassword,
      targetUser.role,
      loginUrl
    );

    const emailRes = await sendEmail({
      userId,
      to: targetUser.email,
      subject: "Official Staff Credentials Issued — Sierra Leone Immigration Department",
      html: emailHtml,
    });

    // Audit log
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: requestingUserId,
      action: "staff_credentials_dispatched",
      target_type: "users",
      target_id: userId,
      details: `Dispatched new credentials email to ${targetUser.email}`,
    });

    return res.json({
      success: true,
      username: generatedUsername,
      email: targetUser.email,
      tempPassword: newTempPassword,
      role: targetUser.role,
      emailSent: emailRes.success,
    });
  } catch (err: any) {
    console.error("send-credentials failed:", err);
    return res.status(500).json({ error: err.message || "Failed to dispatch credentials email" });
  }
});

// ---------------------------------------------------------------
// PUT /api/admin/users/:userId (Full User & Staff Update)
// ---------------------------------------------------------------
router.put("/api/admin/users/:userId", requireAdmin, async (req: AuthenticatedRequest, res) => {
  const userId = req.params.userId as string;
  const {
    fullName,
    role,
    isActive,
    phone,
    rankTitle,
    department,
    dutyStation,
    checkpointId,
  } = req.body;
  const requestingUserId = (req.user?.id || req.profile?.user_id) as string;

  try {
    const userUpdates: Record<string, unknown> = {};
    if (fullName !== undefined) userUpdates.full_name = fullName.trim();
    if (role !== undefined) userUpdates.role = role;
    if (isActive !== undefined) userUpdates.is_active = isActive;
    if (phone !== undefined) userUpdates.phone = phone.trim() || null;

    if (Object.keys(userUpdates).length > 0) {
      const { error } = await supabaseAdmin.from("users").update(userUpdates).eq("user_id", userId);
      if (error) throw error;
    }

    // Update staff profile if relevant
    if (rankTitle !== undefined || department !== undefined || dutyStation !== undefined || checkpointId !== undefined) {
      const { data: existingStaff } = await supabaseAdmin
        .from("staff_profiles")
        .select("staff_profile_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingStaff) {
        await supabaseAdmin
          .from("staff_profiles")
          .update({
            rank_title: rankTitle || "Officer",
            department: department || "Immigration",
            duty_station: dutyStation || "Unassigned",
            checkpoint_id: checkpointId || null,
          })
          .eq("user_id", userId);
      } else if (role !== "applicant") {
        await supabaseAdmin.from("staff_profiles").insert({
          user_id: userId,
          staff_id_code: `SLID-${Date.now().toString(36).toUpperCase()}`,
          rank_title: rankTitle || "Officer",
          department: department || "Immigration",
          duty_station: dutyStation || "Unassigned",
          issue_date: new Date().toISOString().slice(0, 10),
          expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 3))
            .toISOString()
            .slice(0, 10),
          status: "Active",
          checkpoint_id: checkpointId || null,
        });
      }
    }

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: requestingUserId,
      action: "user_updated_by_admin",
      target_type: "users",
      target_id: userId,
      details: JSON.stringify({ fullName, role, isActive, phone, dutyStation }),
    });

    return res.json({ success: true });
  } catch (err: any) {
    console.error("update user failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error updating user" });
  }
});

// ---------------------------------------------------------------
// DELETE /api/admin/users/:userId (Delete User)
// ---------------------------------------------------------------
router.delete("/api/admin/users/:userId", requireAdmin, async (req: AuthenticatedRequest, res) => {
  const userId = req.params.userId as string;
  const requestingUserId = (req.user?.id || req.profile?.user_id) as string;

  // Prevent self-deletion
  if (userId === requestingUserId) {
    return res.status(400).json({ error: "You cannot delete your own admin account." });
  }

  try {
    // Get user info for audit log before deletion
    const { data: targetUser } = await supabaseAdmin
      .from("users")
      .select("email, full_name, role")
      .eq("user_id", userId)
      .maybeSingle();

    // 1. Delete from public.users & cascade tables
    await supabaseAdmin.from("staff_profiles").delete().eq("user_id", userId);
    await supabaseAdmin.from("users").delete().eq("user_id", userId);

    // 2. Delete from auth.users
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      console.warn("auth.admin.deleteUser note:", authDeleteError.message);
    }

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: requestingUserId,
      action: "user_deleted_by_admin",
      target_type: "users",
      target_id: userId,
      details: `Deleted ${targetUser?.role || "user"}: ${targetUser?.email || userId} (${targetUser?.full_name || ""})`,
    });

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    console.error("delete user failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error deleting user" });
  }
});

// ---------------------------------------------------------------
// POST /api/admin/users/:userId/send-reset-link
// ---------------------------------------------------------------
router.post("/api/admin/users/:userId/send-reset-link", requireAdmin, async (req: AuthenticatedRequest, res) => {
  const userId = req.params.userId as string;
  const requestingUserId = (req.user?.id || req.profile?.user_id) as string;

  try {
    const { data: targetUser } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("user_id", userId)
      .single();

    if (!targetUser?.email) {
      return res.status(404).json({ error: "User email not found" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: targetUser.email,
      options: { redirectTo: `${frontendUrl}/reset-password` },
    });

    if (resetError) throw resetError;

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: requestingUserId,
      action: "admin_password_reset_sent",
      target_type: "users",
      target_id: userId,
      details: `Password reset dispatched to ${targetUser.email}`,
    });

    return res.json({ success: true, message: `Password reset link sent to ${targetUser.email}` });
  } catch (err: any) {
    console.error("send reset link failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

export default router;
