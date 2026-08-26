import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  visa_officer: "/visa-officer",
  immigration_officer: "/border/check-in",
};

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setError("Please enter your official email/username and password.");
      return;
    }
    setLoading(true);

    try {
      let targetEmail = cleanIdentifier.toLowerCase();

      // If user typed a username without @ (e.g. lucysaffa89742026), resolve their email
      if (!targetEmail.includes("@")) {
        // 1. Try Backend Username Resolver API with 2s timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const res = await fetch("/api/auth/resolve-username", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: cleanIdentifier }),
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data?.email) targetEmail = data.email.toLowerCase();
          } catch {}
        } catch {}

        // 2. Fallback: Client-side match by full name prefix or email prefix
        if (!targetEmail.includes("@")) {
          const namePrefix = cleanIdentifier.replace(/[0-9]/g, "").slice(0, 4);
          if (namePrefix) {
            const { data: userMatches } = await supabase
              .from("users")
              .select("email, full_name")
              .or(`email.ilike.%${namePrefix}%,full_name.ilike.%${namePrefix}%`)
              .limit(1);

            if (userMatches && userMatches.length > 0) {
              targetEmail = userMatches[0].email.toLowerCase();
            }
          }
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: cleanPassword,
      });

      if (authError) {
        // Check if there is a pending or approved request in staff_access_requests
        const { data: reqData } = await supabase
          .from("staff_access_requests")
          .select("status, full_name")
          .eq("email", targetEmail)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (reqData && reqData.status === "pending") {
          throw new Error(
            `⏳ Application Under Review: The staff request for "${reqData.full_name}" is currently awaiting approval by the Administrator. Once approved in the Admin Console, your official login credentials will be emailed to you.`
          );
        }

        if (authError.message === "Invalid login credentials") {
          throw new Error(
            "Invalid official email/username or temporary password. Please verify spelling, or contact Administrator if your application was just approved."
          );
        }
        if (authError.message.includes("Email not confirmed")) {
          throw new Error(
            "Email address is not yet confirmed. Please check your inbox or request a password reset link."
          );
        }
        throw authError;
      }

      // 1. Fetch public.users record by user_id
      let { data: userRow } = await supabase
        .from("users")
        .select("role, is_active, full_name")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      // 2. Fallback: Lookup by email if user_id was out of sync
      if (!userRow && authData.user.email) {
        const { data: userByEmail } = await supabase
          .from("users")
          .select("role, is_active, full_name")
          .eq("email", authData.user.email)
          .maybeSingle();

        if (userByEmail) {
          userRow = userByEmail;
          // Sync user_id
          await supabase.from("users").update({ user_id: authData.user.id }).eq("email", authData.user.email);
        }
      }

      // 3. Fallback: Auto-heal from user_metadata if record was omitted from public.users
      if (!userRow) {
        const metaRole = authData.user.user_metadata?.role;
        const metaName = authData.user.user_metadata?.full_name || authData.user.email?.split("@")[0] || "Officer";
        const emailLower = authData.user.email?.toLowerCase() || "";

        let deducedRole = metaRole;
        if (!deducedRole) {
          if (emailLower.includes("admin") || emailLower === "saffapetermj@gmail.com") deducedRole = "admin";
          else if (emailLower.includes("visa")) deducedRole = "visa_officer";
          else deducedRole = "immigration_officer";
        }

        const { data: autoCreated } = await supabase
          .from("users")
          .insert({
            user_id: authData.user.id,
            email: authData.user.email,
            full_name: metaName,
            role: deducedRole,
            is_active: true,
          })
          .select("role, is_active, full_name")
          .maybeSingle();

        if (autoCreated) {
          userRow = autoCreated;
        } else {
          userRow = {
            role: deducedRole,
            is_active: true,
            full_name: metaName,
          };
        }
      }

      if (!userRow.is_active) {
        setError("This staff account is currently inactive or suspended. Contact Directorate Admin.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (userRow.role === "applicant") {
        setError("Applicant accounts cannot access the Staff Terminal. Please use the Applicant Portal.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate(ROLE_HOME[userRow.role] ?? "/admin");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-ink font-['Tahoma',sans-serif] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Official Header */}
        <div className="text-center mb-6">
          <img
            src="/slid-logo.png"
            alt="Sierra Leone Immigration Department"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 object-contain filter drop-shadow-sm"
          />
          <div className="inline-flex items-center gap-1.5 bg-[#1E8E5A]/10 border border-[#1E8E5A]/30 text-[#1E8E5A] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} />
            <span>Official Personnel Terminal</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <SierraLeoneFlag width={16} height={10} />
            <p className="text-[10px] font-bold text-[#1E8E5A] uppercase tracking-widest leading-none">
              Republic of Sierra Leone
            </p>
          </div>
          <h1 className="text-2xl font-bold text-ink">Staff &amp; Officer Sign In</h1>
          <p className="text-xs text-ink-soft mt-1">
            Department of Immigration • Authorized Personnel Only
          </p>
        </div>

        <SecurityPaperPanel className="p-6 sm:p-8" showRosette>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Official Email or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. officer@slid.gov.sl or username"
                  className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 pl-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] font-['Tahoma']"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-zinc-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wide">
                  Password
                </label>
                <Link
                  to="/forgot-password?portal=staff"
                  className="text-xs text-[#0284C7] font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter temporary or account password"
                  className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] font-['Tahoma']"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 cursor-pointer p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-xl text-status-rejected text-xs font-medium leading-relaxed">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.99] text-white py-3 rounded-xl text-sm font-semibold transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? "Verifying Credentials..." : "Access Official Terminal"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Registration Link */}
          <div className="mt-6 pt-5 border-t border-primary-light/60 text-center">
            <p className="text-xs text-ink-soft">
              Need a new staff account?{" "}
              <Link
                to="/staff/signup"
                className="text-[#0284C7] font-semibold hover:underline ml-1"
              >
                Start staff account
              </Link>
            </p>
          </div>
        </SecurityPaperPanel>
      </div>
    </div>
  );
}
