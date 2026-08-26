import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

/**
 * Supabase Auth Callback Handler.
 * Handles:
 * 1. Invitation & Password Recovery links (type=invite / type=recovery) -> Redirects to /reset-password
 * 2. Email Confirmation (type=signup) -> Ensures public.users profile exists, then routes to /dashboard
 * 3. Applicant OAuth Social Logins -> Validates role and routes to /dashboard
 * 4. Rejects Staff accounts attempting social applicant login
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuthRedirect() {
      const hash = window.location.hash || "";
      const search = window.location.search || "";

      // 1. Check for Password Recovery or Invitation
      if (
        hash.includes("type=invite") ||
        hash.includes("type=recovery") ||
        search.includes("type=invite") ||
        search.includes("type=recovery")
      ) {
        navigate("/reset-password");
        return;
      }

      // 2. Get the current session (may have been established by the confirmation link)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // No session yet — send them to login
        navigate("/login");
        return;
      }

      const user = session.user;
      const metadata = user.user_metadata ?? {};

      // 3. Check if a profile row already exists in public.users (by user_id or email)
      let { data: existingProfile } = await supabase
        .from("users")
        .select("user_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingProfile && user.email) {
        const { data: byEmail } = await supabase
          .from("users")
          .select("user_id, role")
          .eq("email", user.email)
          .maybeSingle();
        existingProfile = byEmail;
      }

      if (!existingProfile) {
        // Profile doesn't exist — this is an email-confirmed new registration
        // Auto-create the profile so the user can log in immediately
        const fullName =
          metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "Applicant";

        await supabase.from("users").insert({
          user_id: user.id,
          full_name: fullName,
          email: user.email ?? "",
          role: "applicant",
        });

        navigate("/dashboard");
        return;
      }

      // 4. Profile exists — enforce role restrictions for staff attempting social/applicant login
      if (existingProfile.role !== "applicant") {
        await supabase.auth.signOut();
        navigate(`/login?error=staff_account_detected&role=${existingProfile.role}`);
        return;
      }

      // 5. Regular applicant — go to dashboard
      navigate("/dashboard");
    }

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-ink-soft text-sm font-medium">Verifying credentials and security session...</p>
    </div>
  );
}
