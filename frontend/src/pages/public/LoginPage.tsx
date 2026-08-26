import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { SocialLoginButtons } from "../../components/SocialLoginButtons";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
      return;
    }

    const err = searchParams.get("error");
    const roleParam = searchParams.get("role");
    if (err === "staff_account_detected") {
      setError(
        `Access Denied: This email belongs to an Official ${
          roleParam ? roleParam.replace("_", " ").toUpperCase() : "STAFF"
        } account. You cannot log into the Applicant Portal with staff credentials.`
      );
    }
  }, [searchParams, navigate]);

  async function handleLogin() {
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password. If you just confirmed your email, please wait a moment then try again."
          : signInError.message
      );
      setLoading(false);
      return;
    }

    // Look up role directly in public.users
    let { data: userRow } = await supabase
      .from("users")
      .select("role, is_active, email")
      .eq("user_id", data.user.id)
      .maybeSingle();

    // If profile not found by user_id, try by email
    if (!userRow && data.user.email) {
      const { data: byEmail } = await supabase
        .from("users")
        .select("role, is_active, email")
        .eq("email", data.user.email.trim().toLowerCase())
        .maybeSingle();
      userRow = byEmail;
    }

    // If still no profile — auto-create one (email-confirmed account that missed profile insert)
    if (!userRow) {
      const fullName =
        data.user.user_metadata?.full_name ||
        data.user.email?.split("@")[0] ||
        "Applicant";
      await supabase.from("users").insert({
        user_id: data.user.id,
        full_name: fullName,
        email: data.user.email ?? "",
        role: "applicant",
      });
      setLoading(false);
      navigate("/dashboard");
      return;
    }

    if (userRow && !userRow.is_active) {
      setError("This account has been suspended. Contact SLID for assistance.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // If user is an official staff member, seamlessly navigate to their staff portal
    if (userRow && userRow.role !== "applicant") {
      setLoading(false);
      if (userRow.role === "admin") {
        navigate("/admin");
      } else if (userRow.role === "visa_officer") {
        navigate("/visa-officer");
      } else {
        navigate("/border/check-in");
      }
      return;
    }

    setLoading(false);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img
            src="/slid-logo.png"
            alt="Sierra Leone Immigration Department"
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
          <p className="font-mono text-xs tracking-widest text-primary uppercase font-bold">
            Republic of Sierra Leone
          </p>
          <h1 className="font-display text-2xl font-bold mt-1">Applicant Sign In</h1>
          <p className="text-xs text-ink-soft mt-0.5">Access your visas, passport profile & applications</p>
        </div>

        <SecurityPaperPanel className="p-6" showRosette>
          <SocialLoginButtons mode="login" />

          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
            Email Address
          </label>
          <input
            type="email"
            className="w-full border border-primary-light rounded-md px-3 py-2 text-sm mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="applicant@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wide">
              Password
            </label>
            <Link
              to="/forgot-password?portal=applicant"
              className="text-xs text-primary font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            className="w-full border border-primary-light rounded-md px-3 py-2 text-sm mb-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {error && (
            <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium my-3 leading-relaxed">
              <p className="font-bold mb-1">⚠️ Login Restricted</p>
              <p>{error}</p>
              {error.includes("Staff") && (
                <Link
                  to="/staff/login"
                  className="mt-2 inline-block bg-primary text-white text-[11px] font-semibold px-3 py-1 rounded hover:bg-primary-dark transition"
                >
                  Go to Official Staff Portal &rarr;
                </Link>
              )}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 transition mt-3 cursor-pointer shadow-xs"
          >
            {loading ? "Signing in..." : "Sign In to Applicant Dashboard"}
          </button>
        </SecurityPaperPanel>

        <div className="text-center mt-6 text-xs text-ink-soft">
          <p>
            Don't have an applicant account?{" "}
            <Link to="/register" className="text-primary font-semibold underline underline-offset-4">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
