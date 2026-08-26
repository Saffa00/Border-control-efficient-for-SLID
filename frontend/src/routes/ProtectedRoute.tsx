import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Role = "applicant" | "immigration_officer" | "visa_officer" | "admin";

interface ProtectedRouteProps {
  allowedRoles?: Role[]; // omit to allow any authenticated user
}

const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  visa_officer: "/visa-officer",
  immigration_officer: "/border/check-in",
  applicant: "/dashboard",
};

/**
 * Enhanced ProtectedRoute:
 * 1. Shows a clean SLID Loading state while session resolves.
 * 2. Redirects unauthenticated staff to /staff/login and travelers to /login.
 * 3. Intelligently routes unauthorized role requests to the user's appropriate portal dashboard.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 text-center animate-pulse">
          <img
            src="/slid-logo.png"
            alt="SLID Emblem"
            className="w-16 h-16 object-contain filter drop-shadow-md"
          />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1E8E5A] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B4F6C]">
              Authenticating Security Clearance...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Determine appropriate login destination based on route intent
  const isStaffRoute =
    location.pathname.startsWith("/border") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/visa-officer") ||
    (allowedRoles && !allowedRoles.includes("applicant"));

  const loginRedirect = isStaffRoute ? "/staff/login" : "/login";

  if (!profile) {
    return <Navigate to={loginRedirect} replace state={{ from: location }} />;
  }

  // If role is not authorized for this specific section, redirect to their proper dashboard
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    const userHome = ROLE_HOME[profile.role] || "/dashboard";
    return <Navigate to={userHome} replace />;
  }

  return <Outlet />;
}
