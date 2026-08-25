import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if recovery access token is present
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Wait briefly in case onAuthStateChange is processing hash
        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY") {
            setError(null);
          }
        });
        return () => {
          authListener.subscription.unsubscribe();
        };
      }
    });
  }, []);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Your reset link may have expired.");
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="font-display text-2xl font-bold text-ink">Set New Password</h1>
          <p className="text-xs text-ink-soft mt-0.5">Choose a secure password for your account</p>
        </div>

        <SecurityPaperPanel className="p-8" showRosette>
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-status-approved-bg text-status-approved flex items-center justify-center text-2xl mx-auto shadow-2xs">
                ✓
              </div>
              <h2 className="font-display text-lg font-bold text-ink">Password Updated Successfully</h2>
              <p className="text-xs text-ink-soft leading-relaxed">
                Your account password has been changed. You can now sign in using your new credentials.
              </p>

              <div className="pt-4 border-t border-primary-light/60 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full block bg-accent text-white py-2.5 rounded-md text-sm font-semibold hover:opacity-95 transition text-center shadow-xs"
                >
                  Applicant Sign In &rarr;
                </Link>
                <Link
                  to="/staff/login"
                  className="w-full block bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-primary-dark transition text-center shadow-xs"
                >
                  Staff Portal Sign In &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          )}
        </SecurityPaperPanel>
      </div>
    </div>
  );
}
