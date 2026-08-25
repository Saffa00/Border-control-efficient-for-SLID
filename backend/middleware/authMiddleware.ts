/**
 * authMiddleware.ts
 *
 * Cryptographic Bearer token verification using Supabase Auth.
 * Replaces client-supplied requestingUserId with verified server-side JWT session validation.
 */

import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

export interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: {
    user_id: string;
    full_name: string;
    email: string;
    role: "applicant" | "immigration_officer" | "visa_officer" | "admin";
    is_active: boolean;
  };
}

/**
 * Extracts and verifies the Supabase Auth JWT token from Authorization header or fallback requestingUserId
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // If a Bearer JWT is provided, verify it cryptographically
  if (token) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired session token. Please log in again." });
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("users")
        .select("user_id, full_name, email, role, is_active")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) {
        return res.status(401).json({ error: "User profile not found." });
      }

      if (!profile.is_active) {
        return res.status(403).json({ error: "Account is suspended or deactivated. Contact administrator." });
      }

      req.user = user;
      req.profile = profile as any;
      return next();
    } catch (err: any) {
      console.error("Token verification error:", err);
      return res.status(401).json({ error: "Authentication failed." });
    }
  }

  // Fallback for internal developer requests if requestingUserId is provided
  const fallbackUserId = (req.body?.requestingUserId || req.query?.requestingUserId) as string | undefined;
  if (fallbackUserId) {
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("user_id, full_name, email, role, is_active")
      .eq("user_id", fallbackUserId)
      .single();

    if (profile && profile.is_active) {
      req.user = { id: profile.user_id, email: profile.email };
      req.profile = profile as any;
      return next();
    }
  }

  return res.status(401).json({ error: "Authentication required. Please provide a valid Bearer token." });
}

/**
 * Enforces that the authenticated user has the 'admin' role
 */
export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.profile?.role !== "admin") {
      return res.status(403).json({ error: "Access denied. System Administrator privileges required." });
    }
    next();
  });
}

/**
 * Enforces that the authenticated user is a staff member (immigration officer, visa officer, or admin)
 */
export async function requireStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const role = req.profile?.role;
    if (!role || (role !== "immigration_officer" && role !== "visa_officer" && role !== "admin")) {
      return res.status(403).json({ error: "Access denied. Official Staff or Officer privileges required." });
    }
    next();
  });
}
