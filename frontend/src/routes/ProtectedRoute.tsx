import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Role = "applicant" | "immigration_officer" | "visa_officer" | "admin";

interface ProtectedRouteProps {
  allowedRoles?: Role[]; // omit to allow any authenticated user
}

/**
 * Wraps a set of routes so they:
 * 1. Redirect to /login if no session exists
 * 2. Redirect to /unauthorized if the user's role isn't in allowedRoles
 *
 * This is a UX convenience only — the real security boundary is the
 * Postgres RLS policies. Never rely on this component alone to protect
 * sensitive data; a user could still hit the Supabase API directly.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!profile) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
