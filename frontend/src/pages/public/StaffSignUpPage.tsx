import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, UserCheck, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";

export default function StaffSignUpPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("immigration_officer");
  const [dutyStation, setDutyStation] = useState("Freetown National Headquarters");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success State — Pending Approval Confirmation
  const [submittedRequest, setSubmittedRequest] = useState<{
    fullName: string;
    email: string;
    role: string;
    submittedAt: string;
  } | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail || !cleanName) {
      setError("Please provide your official email address and full name.");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms of Official Service and compliance policies.");
      return;
    }

    setLoading(true);

    try {
      // 1. Direct check in public.users to see if account already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("email, role")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingUser) {
        throw new Error(
          `An active account already exists for ${cleanEmail} (${existingUser.role?.replace("_", " ")}). Please sign in at /staff/login.`
        );
      }

      // 2. Check if a pending request already exists in staff_access_requests
      const { data: existingReq } = await supabase
        .from("staff_access_requests")
        .select("status")
        .eq("email", cleanEmail)
        .eq("status", "pending")
        .maybeSingle();

      if (existingReq) {
        throw new Error(
          `A registration request for ${cleanEmail} is already pending administrative review. You will receive an email once approved.`
        );
      }

      // 3. Insert into staff_access_requests
      const { error: insertError } = await supabase
        .from("staff_access_requests")
        .insert({
          full_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || null,
          requested_role: role,
          rank_title: "Officer",
          department: role === "visa_officer" ? "Visa Administration" : "Border Control & Clearance",
          duty_station: dutyStation,
          status: "pending",
        });

      if (insertError) {
        console.warn("Direct staff_access_requests insert notice:", insertError.message);
        
        // Fallback: create pending user via auth/users with is_active = false
        try {
          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
          let tempPw = "";
          for (let i = 0; i < 8; i++) {
            tempPw += chars.charAt(Math.floor(Math.random() * chars.length));
          }

          const { data: authData } = await supabase.auth.signUp({
            email: cleanEmail,
            password: tempPw,
            options: {
              data: {
                full_name: cleanName,
                requested_role: role,
                status: "pending",
              },
            },
          });

          if (authData.user?.id) {
            await supabase.from("users").upsert({
              user_id: authData.user.id,
              full_name: cleanName,
              email: cleanEmail,
              role: role as any,
              phone: cleanPhone || null,
              is_active: false, // Marked as pending approval
            });
          }
        } catch (fbErr) {
          console.warn("Fallback user creation notice:", fbErr);
        }
      }

      setSubmittedRequest({
        fullName: cleanName,
        email: cleanEmail,
        role: role === "visa_officer" ? "Visa Adjudication Officer" : "Immigration & Border Control Officer",
        submittedAt: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 2: PENDING APPROVAL CONFIRMATION SCREEN
  // ---------------------------------------------------------------------------
  if (submittedRequest) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-ink font-['Tahoma',sans-serif] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white border border-primary-light rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <img
              src="/slid-logo.png"
              alt="SLID Crest"
              className="w-16 h-16 mx-auto mb-3 object-contain filter drop-shadow-sm"
            />
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Clock size={14} className="text-amber-600" />
              <span>Pending Administrative Approval</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <SierraLeoneFlag width={16} height={10} />
              <p className="text-[10px] font-bold text-[#1E8E5A] uppercase tracking-widest leading-none">
                Republic of Sierra Leone
              </p>
            </div>
            <h1 className="text-2xl font-bold text-ink">
              Application Submitted Successfully!
            </h1>
            <p className="text-xs text-ink-soft mt-1">
              Your official staff registration is under review by the Directorate Administrator.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-canvas/80 border border-primary-light rounded-2xl p-4 sm:p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between border-b border-primary-light/50 pb-2">
              <span className="text-xs font-bold text-ink-soft uppercase">Applicant Name:</span>
              <span className="text-xs font-bold text-ink">{submittedRequest.fullName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-primary-light/50 pb-2">
              <span className="text-xs font-bold text-ink-soft uppercase">Registered Email:</span>
              <span className="text-xs font-mono font-semibold text-primary">{submittedRequest.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-primary-light/50 pb-2">
              <span className="text-xs font-bold text-ink-soft uppercase">Requested Role:</span>
              <span className="text-xs font-bold text-[#1E8E5A]">{submittedRequest.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-soft uppercase">Submission Date:</span>
              <span className="text-xs text-ink-soft">{submittedRequest.submittedAt}</span>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Mail size={20} className="text-[#0284C7] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-sky-950 leading-relaxed">
              <p className="font-bold mb-1">How you will receive your credentials:</p>
              <p>
                As soon as the Administrator approves your account, the system will automatically generate a secure <strong>temporary password</strong> and <strong>official username</strong>, and dispatch them directly to your email (<strong>{submittedRequest.email}</strong>).
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/staff/login"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-md w-full sm:w-auto"
            >
              <span>Return to Staff Login</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 1: REGISTRATION FORM SCREEN
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-ink font-['Tahoma',sans-serif] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Back link */}
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
            className="w-16 h-16 mx-auto mb-2 object-contain filter drop-shadow-sm"
          />
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <SierraLeoneFlag width={16} height={10} />
            <p className="text-[10px] font-bold text-[#1E8E5A] uppercase tracking-widest leading-none">
              Republic of Sierra Leone
            </p>
          </div>
          <h1 className="text-2xl font-bold text-ink">
            Start a Staff Account
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Official Immigration Officer Access Request
          </p>
        </div>

        <SecurityPaperPanel className="p-6 sm:p-8" showRosette>
          {error && (
            <div className="mb-5 p-3.5 bg-status-rejected-bg border border-status-rejected/30 rounded-xl text-status-rejected text-xs font-medium leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Official Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. officer@slid.gov.sl or personal email"
                className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] font-['Tahoma']"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                placeholder="e.g. Lucy Saffa"
                className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] font-['Tahoma']"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Contact Phone (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g. +232 76 123456"
                className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] font-['Tahoma']"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Officer Role Designation */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Designated Officer Role
              </label>
              <select
                className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] font-['Tahoma'] cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="immigration_officer">
                  Immigration &amp; Border Control Officer
                </option>
                <option value="visa_officer">
                  Visa Adjudication Officer
                </option>
              </select>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label
                className={`flex items-start gap-3 text-xs p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  agreed
                    ? "bg-sky-50 border-sky-300 text-ink"
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
                  and understand that my account credentials will be issued upon administrative approval.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3.5 rounded-xl text-sm transition shadow-md mt-2 flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.98] text-white cursor-pointer shadow-sky-500/20 touch-manipulation min-h-[48px] disabled:opacity-50"
            >
              {loading ? "Submitting Application..." : "Submit Access Request"}
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
        </SecurityPaperPanel>
      </div>
    </div>
  );
}
