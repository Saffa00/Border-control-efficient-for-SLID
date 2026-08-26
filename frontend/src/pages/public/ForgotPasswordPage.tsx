import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const portal = searchParams.get("portal") === "staff" ? "staff" : "applicant";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;

      // 1. Dispatch via SLID backend for official crest logo & branded government layout
      try {
        const res = await fetch("/api/auth/request-password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, redirectUrl }),
        });

        if (res.ok) {
          setSent(true);
          return;
        }
      } catch (backendErr) {
        console.warn("Backend reset endpoint unavailable, using direct Supabase auth fallback:", backendErr);
      }

      // 2. Direct Supabase Auth Fallback
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        throw resetError;
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const backLink = portal === "staff" ? "/staff/login" : "/login";
  const portalTitle = portal === "staff" ? "Official Staff & Officer Portal" : "Applicant & Traveler Portal";

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Official Header */}
        <div className="text-center mb-6">
          <img
            src="/slid-logo.png"
            alt="Sierra Leone Immigration Department"
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <SierraLeoneFlag width={18} height={12} />
            <p className="font-mono text-xs tracking-widest text-primary uppercase font-bold">
              Republic of Sierra Leone
            </p>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Reset Account Password</h1>
          <p className="text-xs text-ink-soft mt-0.5">{portalTitle}</p>
        </div>

        <SecurityPaperPanel className="p-8" showRosette>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-status-approved-bg text-status-approved flex items-center justify-center text-2xl mx-auto shadow-2xs">
                ✉️
              </div>
              <h2 className="font-display text-lg font-bold text-ink">Reset Link Dispatched</h2>
              <p className="text-xs text-ink-soft leading-relaxed">
                We have sent a secure password reset link to:
                <br />
                <span className="font-mono font-bold text-ink mt-1 inline-block bg-canvas px-2.5 py-1 rounded border border-primary-light">
                  {email}
                </span>
              </p>
              <p className="text-[11px] text-ink-soft">
                Please check your inbox (and spam folder). Click the link inside to set a new password.
              </p>

              <div className="pt-4 border-t border-primary-light/60">
                <Link
                  to={backLink}
                  className="w-full inline-block bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-primary-dark transition shadow-xs"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <p className="text-xs text-ink-soft leading-relaxed">
                Enter your registered email address below. We will transmit a secure password recovery link to your inbox.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-md text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition cursor-pointer shadow-xs"
              >
                {loading ? "Sending Reset Link..." : "Send Password Reset Link"}
              </button>

              <div className="text-center pt-2">
                <Link
                  to={backLink}
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  &larr; Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </SecurityPaperPanel>
      </div>
    </div>
  );
}
