import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { GoogleIcon, MicrosoftIcon, PhoneIcon } from "./SocialIcons";

type OAuthProvider = "google" | "azure";

const OAUTH_PROVIDERS: { id: OAuthProvider; label: string; icon: (size?: number) => JSX.Element }[] = [
  { id: "google", label: "Google", icon: (size) => <GoogleIcon size={size} /> },
  { id: "azure", label: "Microsoft", icon: (size) => <MicrosoftIcon size={size} /> },
];

export function SocialLoginButtons({ mode = "login" }: { mode?: "login" | "register" }) {
  const navigate = useNavigate();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Phone OTP state
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  async function handleOAuthLogin(provider: OAuthProvider) {
    setError(null);
    setLoadingProvider(provider);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoadingProvider(null);
    }
  }

  function formatPhoneNumber(num: string): string {
    const clean = num.replace(/\D/g, "");
    if (clean.startsWith("232")) return `+${clean}`;
    if (clean.startsWith("0")) return `+232${clean.slice(1)}`;
    if (clean.length === 8) return `+232${clean}`;
    return clean.startsWith("+") ? clean : `+${clean}`;
  }

  async function handleSendPhoneOtp() {
    setError(null);
    if (!phoneNumber.trim()) {
      setError("Please enter a valid mobile phone number.");
      return;
    }

    const formatted = formatPhoneNumber(phoneNumber);
    setLoadingProvider("phone");

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: formatted,
    });

    if (otpError) {
      setError(otpError.message);
      setLoadingProvider(null);
      return;
    }

    setOtpSent(true);
    setLoadingProvider(null);
  }

  async function handleVerifyPhoneOtp() {
    setError(null);
    if (!otpCode.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    const formatted = formatPhoneNumber(phoneNumber);
    setLoadingProvider("verify");

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otpCode.trim(),
      type: "sms",
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoadingProvider(null);
      return;
    }

    if (data.session) {
      navigate("/dashboard");
    }
  }

  const actionVerb = mode === "register" ? "Sign up with" : "Continue with";

  return (
    <div>
      <div className="grid gap-2.5">
        {/* Google & Microsoft OAuth Buttons */}
        {OAUTH_PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleOAuthLogin(p.id)}
            disabled={loadingProvider !== null}
            className="flex items-center justify-center gap-3 border border-primary-light bg-white text-ink px-4 py-2.5 rounded-md text-sm font-medium hover:border-primary/40 disabled:opacity-50 transition cursor-pointer shadow-2xs"
          >
            {p.icon(18)}
            <span>
              {loadingProvider === p.id
                ? "Connecting..."
                : `${actionVerb} ${p.label}`}
            </span>
            {p.id === "google" && mode === "register" && (
              <span className="text-[10px] text-primary bg-primary-light/50 px-1.5 py-0.5 rounded font-mono ml-auto hidden sm:inline">
                Auto profile
              </span>
            )}
          </button>
        ))}

        {/* Continue / Sign up with Phone Button */}
        {!showPhoneLogin ? (
          <button
            type="button"
            onClick={() => {
              setShowPhoneLogin(true);
              setError(null);
            }}
            disabled={loadingProvider !== null}
            className="flex items-center justify-center gap-3 border border-primary-light bg-white text-ink px-4 py-2.5 rounded-md text-sm font-medium hover:border-primary/40 disabled:opacity-50 transition cursor-pointer shadow-2xs"
          >
            <PhoneIcon size={18} />
            {actionVerb} Phone Number
          </button>
        ) : (
          /* Phone OTP Input Panel */
          <div className="border border-primary/30 rounded-md p-3.5 bg-primary-light/20 grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <PhoneIcon size={14} /> {mode === "register" ? "Phone Registration" : "Phone Authentication"} (SMS OTP)
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowPhoneLogin(false);
                  setOtpSent(false);
                  setError(null);
                }}
                className="text-[11px] text-ink-soft hover:text-ink underline cursor-pointer"
              >
                Close
              </button>
            </div>

            {!otpSent ? (
              <div className="grid gap-2">
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-md border border-r-0 border-primary-light bg-white text-xs font-mono text-ink-soft">
                    🇸🇱 +232
                  </span>
                  <input
                    type="tel"
                    placeholder="076 123456"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 min-w-0 border border-primary-light rounded-r-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendPhoneOtp}
                  disabled={loadingProvider === "phone"}
                  className="bg-primary text-white text-xs font-medium py-2 rounded-md hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
                >
                  {loadingProvider === "phone" ? "Sending SMS code..." : "Send Verification Code"}
                </button>
              </div>
            ) : (
              <div className="grid gap-2">
                <p className="text-[11px] text-ink-soft">
                  Enter the 6-digit code sent to <span className="font-mono font-medium text-ink">{phoneNumber}</span>:
                </p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="border border-primary-light rounded-md px-3 py-1.5 text-sm font-mono text-center tracking-widest bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    disabled={loadingProvider === "verify"}
                    className="flex-1 bg-primary text-white text-xs font-medium py-2 rounded-md hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
                  >
                    {loadingProvider === "verify" ? "Verifying..." : "Verify & Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="border border-primary-light bg-white text-ink text-xs font-medium px-3 py-2 rounded-md hover:bg-canvas transition cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-status-rejected text-xs mt-3 text-center font-medium">{error}</p>}

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-primary-light" />
        <span className="text-xs text-ink-soft uppercase tracking-wide">
          {mode === "register" ? "or register with email" : "or continue with email"}
        </span>
        <div className="flex-1 h-px bg-primary-light" />
      </div>
    </div>
  );
}
