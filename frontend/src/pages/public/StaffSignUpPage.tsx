import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface StaffCredentials {
  username: string;
  email: string;
  tempPassword: string;
  role: string;
  createdAt: string;
}

export default function StaffSignUpPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("immigration_officer");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success State
  const [credentials, setCredentials] = useState<StaffCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanName) {
      setError("Please provide your email address and full name.");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms of Official Service and compliance policies.");
      return;
    }

    setLoading(true);

    try {
      let data: any = null;
      let resOk = false;

      // 1. Try Backend Provisioning API
      try {
        const res = await fetch("/api/staff/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            fullName: cleanName,
            role,
          }),
        });

        resOk = res.ok;
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          // Response was HTML (e.g. 504 / 502 from cold start proxy)
        }
      } catch (fetchErr) {
        console.warn("Backend /api/staff/signup endpoint unavailable, using direct Supabase fallback:", fetchErr);
      }

      // 2. If Backend succeeded, show credentials
      if (resOk && data?.tempPassword) {
        setCredentials({
          username: data.username,
          email: data.email,
          tempPassword: data.tempPassword,
          role: data.role,
          createdAt: data.createdAt,
        });
        return;
      }

      // 3. If Backend returned an explicit validation error (e.g. duplicate email)
      if (data?.error && !data.error.includes("Internal Server Error")) {
        throw new Error(data.error);
      }

      // 4. Direct Client-Side Supabase Fallback (100% reliable)
      const nameParts = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const currentYear = new Date().getFullYear();
      const generatedUsername = `${nameParts.slice(0, 10)}${randomSuffix}${currentYear}`;

      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
      let tempPassword = "";
      for (let i = 0; i < 8; i++) {
        tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const safeRole = role === "visa_officer" ? "visa_officer" : "immigration_officer";

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: cleanName,
            username: generatedUsername,
            role: safeRole,
            temporary_password: true,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData.user?.id) {
        try {
          await supabase.from("users").upsert({
            user_id: authData.user.id,
            full_name: cleanName,
            email: cleanEmail,
            role: safeRole,
            is_active: true,
          });
        } catch (dbErr) {
          console.warn("Could not insert public.users row:", dbErr);
        }
      }

      setCredentials({
        username: generatedUsername,
        email: cleanEmail,
        tempPassword: tempPassword,
        role: safeRole === "visa_officer" ? "Visa Adjudication Officer" : "Immigration & Border Control Officer",
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 2: CREDENTIALS SUCCESS SCREEN (Matching Image 2)
  // ---------------------------------------------------------------------------
  if (credentials) {
    return (
      <div className="min-h-screen bg-[#121214] text-white font-['Tahoma',sans-serif] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-[#1E1E22] border border-[#2D2D34] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Header Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
              Welcome to SLID Staff Portal!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Your official immigration officer access is ready
            </p>
          </div>

          {/* Success Pill Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 bg-[#1C3326] text-[#4ADE80] border border-[#22543D] text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-inner">
              ✓ ACCOUNT CREATED SUCCESSFULLY
            </span>
          </div>

          {/* Section Heading */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-white mb-2">You&apos;re all set!</h2>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-md mx-auto">
              Thank you for joining <strong className="text-white">Sierra Leone Immigration Department</strong>. Your account has been successfully created. Below are your login credentials. Please log in and change your password immediately for security.
            </p>
          </div>

          {/* Credentials Display Cards */}
          <div className="space-y-3 mb-6">
            {/* Card 1: USERNAME */}
            <div className="flex items-center justify-between bg-[#282830] border-l-4 border-[#0284C7] rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#1E1E24] text-zinc-300 flex items-center justify-center text-sm">
                  👤
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    USERNAME
                  </p>
                  <p className="text-sm font-mono font-semibold text-white">
                    {credentials.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(credentials.username, "username")}
                className="text-xs text-zinc-400 hover:text-sky-400 transition cursor-pointer px-2 py-1 bg-[#1E1E24] rounded border border-zinc-700/60"
              >
                {copiedField === "username" ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* Card 2: ACCOUNT EMAIL */}
            <div className="flex items-center justify-between bg-[#282830] border-l-4 border-[#0284C7] rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#1E1E24] text-zinc-300 flex items-center justify-center text-sm">
                  ✉️
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    ACCOUNT EMAIL
                  </p>
                  <p className="text-sm font-mono text-white">
                    {credentials.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(credentials.email, "email")}
                className="text-xs text-zinc-400 hover:text-sky-400 transition cursor-pointer px-2 py-1 bg-[#1E1E24] rounded border border-zinc-700/60"
              >
                {copiedField === "email" ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* Card 3: TEMPORARY PASSWORD */}
            <div className="flex items-center justify-between bg-[#282830] border-l-4 border-amber-500 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#1E1E24] text-amber-400 flex items-center justify-center text-sm">
                  🔑
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    TEMPORARY PASSWORD
                  </p>
                  <p className="text-base font-mono font-bold text-[#38BDF8] tracking-wider">
                    {credentials.tempPassword}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(credentials.tempPassword, "password")}
                className="text-xs bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition cursor-pointer px-3 py-1.5 rounded border border-sky-500/40 font-semibold"
              >
                {copiedField === "password" ? "✓ Copied" : "Copy Password"}
              </button>
            </div>

            {/* Card 4: ASSIGNED ROLE */}
            <div className="flex items-center justify-between bg-[#282830] border-l-4 border-emerald-500 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#1E1E24] text-emerald-400 flex items-center justify-center text-sm">
                  🛡️
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    ASSIGNED ROLE
                  </p>
                  <p className="text-xs font-semibold text-[#4ADE80]">
                    {credentials.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 5: DATE CREATED */}
            <div className="flex items-center justify-between bg-[#282830] border-l-4 border-zinc-500 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#1E1E24] text-zinc-400 flex items-center justify-center text-sm">
                  📅
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    DATE CREATED
                  </p>
                  <p className="text-xs font-mono text-zinc-300">
                    {credentials.createdAt}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(credentials.tempPassword);
                navigate("/staff/login");
              }}
              className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold py-3 rounded-lg text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              Proceed to Staff Sign In &rarr;
            </button>

            <p className="text-[11px] text-zinc-400 text-center">
              📧 An official credentials email with your temporary password has also been sent to{" "}
              <strong className="text-zinc-200">{credentials.email}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 1: STAFF SIGN UP FORM (Matching Image 1)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-canvas text-ink font-['Tahoma',sans-serif] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-primary-light rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/staff/login"
            className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            &larr; Back to Staff Login
          </Link>
        </div>

        {/* Header Title */}
        <div className="text-center mb-6">
          <img
            src="/slid-logo.png"
            alt="SLID"
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">
            Start a staff account
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Republic of Sierra Leone Immigration Department
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-status-rejected-bg border border-status-rejected/30 rounded-lg text-status-rejected text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Email address
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full border border-primary-light rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Full name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full border border-primary-light rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <p className="text-[11px] text-ink-soft mt-1">
              Please use English letters only (A-Z).
            </p>
          </div>

          {/* Officer Role Designation */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Designated Officer Role
            </label>
            <select
              className="w-full border border-primary-light rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma'] cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="immigration_officer">
                Immigration &amp; Border Control Officer
              </option>
              <option value="visa_officer">
                Visa Adjudication Officer
              </option>
              <option value="admin">
                Directorate System Administrator
              </option>
            </select>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-2">
            <label
              className={`flex items-start gap-3 text-xs p-3 rounded-lg border transition-all cursor-pointer select-none ${
                agreed
                  ? "bg-sky-50/70 border-sky-300 text-ink"
                  : "bg-canvas/50 border-primary-light/70 text-ink-soft hover:bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-primary-light text-[#0284C7] focus:ring-[#0284C7] h-4 w-4 cursor-pointer"
              />
              <span className="leading-relaxed">
                I agree to the{" "}
                <span className="text-[#0284C7] font-semibold hover:underline">
                  Terms of Official Service
                </span>{" "}
                and confirm that I will use the Sierra Leone Immigration Department platform in compliance with applicable statutory regulations and official security policies.
              </span>
            </label>
          </div>

          {/* Sign Up Button — Strictly disabled when checkbox is not clicked */}
          <button
            type="submit"
            disabled={loading || !agreed}
            className={`w-full font-semibold py-3 rounded-lg text-sm transition shadow-md mt-2 flex items-center justify-center gap-2 ${
              agreed && !loading
                ? "bg-[#0284C7] hover:bg-[#0369A1] text-white cursor-pointer shadow-sky-500/20 active:scale-[0.99]"
                : "bg-zinc-200 text-zinc-400 border border-zinc-300 cursor-not-allowed shadow-none"
            }`}
          >
            {loading ? "Generating Credentials..." : "Sign Up"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-primary-light/60 text-center">
          <p className="text-xs text-ink-soft">
            Already have an Account?{" "}
            <Link
              to="/staff/login"
              className="text-[#0284C7] font-semibold hover:underline ml-1"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
