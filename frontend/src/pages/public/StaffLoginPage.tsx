import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  visa_officer: "/visa-officer",
  immigration_officer: "/border/check-in",
};

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    if (
      hash.includes("type=invite") ||
      hash.includes("type=recovery") ||
      search.includes("type=invite") ||
      search.includes("type=recovery")
    ) {
      navigate("/reset-password" + window.location.hash);
    }
  }, [navigate]);

  async function handleLogin() {
    setError(null);
    if (!email || !password) {
      setError("Please enter your official email and password.");
      return;
    }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Invalid official email or password."
          : authError.message
      );
      setLoading(false);
      return;
    }

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("role, is_active, full_name")
      .eq("user_id", authData.user.id)
      .single();

    if (userError || !userRow) {
      setError("Staff record not found. Please contact the Directorate Administrator.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (!userRow.is_active) {
      setError("This staff account is currently inactive or suspended. Contact Admin.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (userRow.role === "applicant") {
      setError("Applicant accounts cannot access the Official Staff Portal. Please use the Applicant Portal.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate(ROLE_HOME[userRow.role] ?? "/admin");
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Official Header */}
        <div className="text-center mb-6">
          <img
            src="/slid-logo.png"
            alt="Sierra Leone Immigration Department"
            className="w-20 h-20 mx-auto mb-3 object-contain"
          />
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            🛡️ Official Personnel Only
          </div>
          <p className="font-mono text-xs tracking-widest text-primary uppercase font-bold">
            Republic of Sierra Leone
          </p>
          <h1 className="font-display text-2xl font-bold mt-1">Staff & Officer Portal</h1>
          <p className="text-xs text-ink-soft mt-1">
            Department of Immigration — Authorized Access Terminal
          </p>
        </div>

        <SecurityPaperPanel className="p-8" showRosette>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Official Email Address
              </label>
              <input
                type="email"
                placeholder="officer@slid.gov.sl"
                className="w-full border border-primary-light rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wide">
                  Password
                </label>
                <Link
                  to="/forgot-password?portal=staff"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full border border-primary-light rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && (
              <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-md text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition cursor-pointer shadow-xs mt-2"
            >
              {loading ? "Authenticating Officer..." : "Sign In to Officer Console"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-primary-light/60 text-center">
            <p className="text-xs text-ink-soft mb-3">
              Need staff credentials or new officer onboarding?
            </p>
            <Link
              to="/staff/signup"
              className="inline-flex items-center justify-center w-full bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2.5 rounded-md text-xs font-semibold transition shadow-xs mb-2"
            >
              ✍️ Sign Up for Staff Account (Receive Credentials)
            </Link>
            <Link
              to="/staff/request-access"
              className="inline-flex items-center justify-center w-full border border-primary-light text-ink hover:bg-canvas px-4 py-2 rounded-md text-xs font-medium transition"
            >
              📝 Full Station Transfer &amp; Clearance Request
            </Link>
          </div>
        </SecurityPaperPanel>
      </div>
    </div>
  );
}
