import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

/**
 * Supabase Auth Callback Handler.
 * Handles:
 * 1. Invitation & Password Recovery links (type=invite / type=recovery) -> Redirects to /reset-password
 * 2. Applicant OAuth Social Logins -> Validates role and routes to /dashboard
 * 3. Rejects Staff accounts attempting social applicant login
 */
export default function AuthCallbackPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuthRedirect() {
      const hash = window.location.hash || "";
      const search = window.location.search || "";

      // 1. Check for Invitation or Password Recovery
      if (
        hash.includes("type=invite") ||
        hash.includes("type=recovery") ||
        search.includes("type=invite") ||
        search.includes("type=recovery")
      ) {
        navigate("/reset-password");
        return;
      }

      if (loading) return;

      if (!profile) {
        navigate("/login");
        return;
      }

      // 2. Strict Role Enforcement for Social Sign-In
      if (profile.role !== "applicant") {
        await supabase.auth.signOut();
        navigate(`/login?error=staff_account_detected&role=${profile.role}`);
        return;
      }

      // 3. Regular applicant landing
      navigate("/dashboard");
    }

    handleAuthRedirect();
  }, [loading, profile, navigate]);

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-ink-soft text-sm font-medium">Verifying credentials and security session...</p>
    </div>
  );
}
