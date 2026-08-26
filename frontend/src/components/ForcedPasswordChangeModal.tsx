import { useState } from "react";
import { KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function ForcedPasswordChangeModal() {
  const { isTemporaryPassword, setTemporaryPasswordFlag, profile } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!isTemporaryPassword || dismissed || !profile) {
    return null;
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          temporary_password: false,
        },
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTemporaryPasswordFlag(false);
      setTimeout(() => {
        setDismissed(true);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update permanent password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-['Tahoma',sans-serif] animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-sky-200 relative overflow-hidden">
        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#0284C7] flex items-center justify-center flex-shrink-0 shadow-xs">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">Set Permanent Password</h3>
            <p className="text-xs text-ink-soft">Official Directorate Security Requirement</p>
          </div>
        </div>

        <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl mb-5 text-xs text-sky-900 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-[#0284C7] flex-shrink-0 mt-0.5" />
          <span>
            Welcome, <strong>{profile.full_name}</strong>. You signed in using temporary credentials. Please choose a new permanent password for your official account.
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center space-y-2 animate-fade-in">
            <CheckCircle2 size={42} className="text-[#1E8E5A] mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-ink">Permanent Password Activated!</h4>
            <p className="text-xs text-ink-soft">Your account is now secure. Resuming your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                New Permanent Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  required
                  className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] font-['Tahoma']"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Confirm Permanent Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                required
                className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] font-['Tahoma']"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.98] text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50 touch-manipulation min-h-[44px] flex items-center justify-center gap-1.5"
              >
                <span>{loading ? "Activating Password..." : "Save Permanent Password"}</span>
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="px-4 py-3 rounded-xl border border-primary-light text-xs font-medium text-ink-soft hover:bg-canvas transition cursor-pointer touch-manipulation min-h-[44px]"
              >
                Later
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
