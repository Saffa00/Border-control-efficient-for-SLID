import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { ApplicantLayout } from "../../components/ApplicantLayout";

type Step = "idle" | "code_sent";

/**
 * Detects mobile carrier from phone digits
 */
function getCarrierInfo(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  const local = digits.startsWith("232") ? "0" + digits.slice(3) : digits.startsWith("0") ? digits : "0" + digits;

  if (/^0(71|72|73|74|75|76|78|79)/.test(local)) {
    return { name: "Orange SL", color: "bg-orange-500/10 text-orange-600 border-orange-300", icon: "🟠" };
  }
  if (/^0(77|80|88|30|33|99)/.test(local)) {
    return { name: "Africell SL", color: "bg-purple-500/10 text-purple-600 border-purple-300", icon: "🟣" };
  }
  if (/^0(31|32|34)/.test(local)) {
    return { name: "QCell SL", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300", icon: "🟢" };
  }
  if (/^0(22|25)/.test(local)) {
    return { name: "Sierratel", color: "bg-blue-500/10 text-blue-600 border-blue-300", icon: "🔵" };
  }
  if (digits.length >= 9 && !digits.startsWith("232") && raw.includes("+")) {
    return { name: "International", color: "bg-primary/10 text-primary border-primary/30", icon: "🌍" };
  }

  return { name: "Mobile Network", color: "bg-canvas border-primary-light text-ink-soft", icon: "📱" };
}

export default function ProfilePage() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile details state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    phoneVerified: false,
    nationality: "",
    countryOfResidence: "",
    occupation: "",
    addressLine: "",
    addressCity: "",
    addressCountry: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  // Password update state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Phone OTP state
  const [currentPhone, setCurrentPhone] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [expiresInMinutes, setExpiresInMinutes] = useState(5);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    async function loadUserData() {
      const { data } = await supabase
        .from("users")
        .select(`
          full_name,
          email,
          phone,
          phone_verified,
          nationality,
          country_of_residence,
          occupation,
          address_line,
          address_city,
          address_country,
          emergency_contact_name,
          emergency_contact_phone
        `)
        .eq("user_id", profile?.user_id)
        .single();

      if (data) {
        setFormData({
          fullName: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          phoneVerified: data.phone_verified || false,
          nationality: data.nationality || "",
          countryOfResidence: data.country_of_residence || "",
          occupation: data.occupation || "",
          addressLine: data.address_line || "",
          addressCity: data.address_city || "",
          addressCountry: data.address_country || "",
          emergencyContactName: data.emergency_contact_name || "",
          emergencyContactPhone: data.emergency_contact_phone || "",
        });
        setCurrentPhone(data.phone ?? null);
        setPhoneVerified(data.phone_verified ?? false);
      }
      setLoading(false);
    }
    loadUserData();
  }, [profile]);

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    setSaving(true);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        full_name: formData.fullName.trim(),
        nationality: formData.nationality.trim() || null,
        country_of_residence: formData.countryOfResidence.trim() || null,
        occupation: formData.occupation.trim() || null,
        address_line: formData.addressLine.trim() || null,
        address_city: formData.addressCity.trim() || null,
        address_country: formData.addressCountry.trim() || null,
        emergency_contact_name: formData.emergencyContactName.trim() || null,
        emergency_contact_phone: formData.emergencyContactPhone.trim() || null,
      })
      .eq("user_id", profile?.user_id);

    if (updateError) {
      setSaveError(updateError.message);
    } else {
      setSaveSuccess("Profile & contact details updated successfully.");
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match. Please re-enter.");
      return;
    }

    setUpdatingPassword(true);

    try {
      // 1. Try Supabase client auth update
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (!updateError) {
        setPasswordSuccess("Account password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
        setUpdatingPassword(false);
        return;
      }

      // 2. Fallback to backend service-role API
      if (profile?.user_id) {
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: profile.user_id,
            newPassword: newPassword,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setPasswordSuccess("Account password updated successfully!");
          setNewPassword("");
          setConfirmPassword("");
          setUpdatingPassword(false);
          return;
        } else if (data.error) {
          throw new Error(data.error);
        }
      }

      throw updateError;
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  }

  async function handleSendCode() {
    if (!phoneInput.trim()) return;
    setOtpError(null);
    setOtpSuccess(null);
    setSending(true);

    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneInput.trim(),
          userId: profile?.user_id,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification SMS");
      }

      setVerificationId(data.verificationId);
      if (data.expiresInMinutes) setExpiresInMinutes(data.expiresInMinutes);
      setStep("code_sent");
      setOtpSuccess(`SMS verification code dispatched via EasySendSMS.`);
    } catch (err: any) {
      setOtpError(err.message || "Could not send SMS code.");
    } finally {
      setSending(false);
    }
  }

  async function handleVerifyCode() {
    if (!codeInput.trim() || !verificationId) return;
    setOtpError(null);
    setOtpSuccess(null);
    setVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId,
          code: codeInput.trim(),
          userId: profile?.user_id,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      if (!res.ok || !data.verified) {
        throw new Error(data.error || "Incorrect or expired verification code.");
      }

      setCurrentPhone(data.phone || phoneInput.trim());
      setPhoneVerified(true);
      setStep("idle");
      setCodeInput("");
      setPhoneInput("");
      setOtpSuccess("Mobile phone number verified successfully!");
    } catch (err: any) {
      setOtpError(err.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  }

  function startChangeNumber() {
    setStep("idle");
    setPhoneInput(currentPhone || "");
    setOtpError(null);
    setOtpSuccess(null);
  }

  const carrierInfo = getCarrierInfo(phoneInput);

  if (loading) {
    return (
      <ApplicantLayout>
        <div className="py-16 text-center text-ink-soft text-sm">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading account profile details...
        </div>
      </ApplicantLayout>
    );
  }

  return (
    <ApplicantLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Account Settings &amp; Profile</h1>
          <p className="text-xs text-ink-soft mt-0.5">
            Manage your legal identity details, mobile phone verification, and security credentials.
          </p>
        </div>

        {/* 1. Account Identity Form */}
        <SecurityPaperPanel className="p-6 sm:p-8" showRosette>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary-light pb-1 mb-3">
                1. Account Credentials &amp; Legal Name
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Full Legal Name <span className="text-status-rejected">*</span>
                  </label>
                  <input
                    required
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Registered Email Address
                  </label>
                  <input
                    disabled
                    className="w-full border border-primary-light/60 bg-canvas rounded-md px-3.5 py-2 text-sm font-mono text-ink-soft"
                    value={formData.email}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Nationality
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                    placeholder="e.g. Sierra Leonean / British / American"
                    value={formData.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Country of Residence
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                    placeholder="e.g. United Kingdom"
                    value={formData.countryOfResidence}
                    onChange={(e) => handleChange("countryOfResidence", e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Occupation / Profession
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                    placeholder="e.g. Software Engineer / Consultant / Merchant"
                    value={formData.occupation}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 2. Residential Address */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary-light pb-1 mb-3">
                2. Permanent Residential Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Street Address Line
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                    placeholder="e.g. 15 Wilkinson Road"
                    value={formData.addressLine}
                    onChange={(e) => handleChange("addressLine", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    City / Town
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                    placeholder="e.g. Freetown / Bo / Kenema / London"
                    value={formData.addressCity}
                    onChange={(e) => handleChange("addressCity", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Country
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                    placeholder="e.g. Sierra Leone"
                    value={formData.addressCountry}
                    onChange={(e) => handleChange("addressCountry", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Emergency Contact */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary-light pb-1 mb-3">
                3. Emergency Contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                    placeholder="e.g. Joseph Sesay"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                    placeholder="+232 78 654321"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-status-approved-bg border border-status-approved/30 rounded-md text-status-approved text-xs font-medium">
                ✓ {saveSuccess}
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium">
                {saveError}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white py-2.5 px-6 rounded-md text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </form>
        </SecurityPaperPanel>

        {/* 2. Security & Account Password Panel */}
        <SecurityPaperPanel className="p-6 sm:p-8" showRosette>
          <h2 className="font-display text-lg font-bold text-ink mb-1">
            Security &amp; Account Password
          </h2>
          <p className="text-xs text-ink-soft mb-4">
            Update your account password. Must be at least 8 characters long.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                  New Password <span className="text-status-rejected">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                  Confirm New Password <span className="text-status-rejected">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-status-approved-bg border border-status-approved/30 rounded-md text-status-approved text-xs font-medium">
                ✓ {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium">
                ⚠️ {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={updatingPassword || !newPassword}
              className="bg-[#002B49] text-white py-2.5 px-6 rounded-md text-sm font-semibold hover:bg-[#001D33] disabled:opacity-40 transition cursor-pointer shadow-xs"
            >
              {updatingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </SecurityPaperPanel>

        {/* 3. Phone Number & EasySendSMS Verification Section */}
        <SecurityPaperPanel className="p-6 sm:p-8" showRosette>
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Verified SMS Notification Channel
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Powered by EasySendSMS Gateway for Sierra Leone (Orange, Africell, QCell, &amp; International).
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold border border-primary/20">
              EasySendSMS 🇸🇱
            </span>
          </div>

          {currentPhone && phoneVerified && step === "idle" && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-status-approved-bg border border-status-approved/30 rounded-lg px-4 py-3.5 mb-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-status-approved/20 text-status-approved flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-ink">{currentPhone}</p>
                  <p className="text-xs text-status-approved font-medium">
                    Verified for live SMS clearance alerts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={startChangeNumber}
                className="text-primary text-xs font-semibold underline underline-offset-4 hover:text-primary-dark cursor-pointer"
              >
                Change Number
              </button>
            </div>
          )}

          {(!currentPhone || !phoneVerified) && step === "idle" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wide">
                  Mobile Number (SMS verification)
                </label>
                {carrierInfo && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${carrierInfo.color}`}>
                    {carrierInfo.icon} {carrierInfo.name}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  className="flex-1 border border-primary-light rounded-md px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
                  placeholder="e.g. 076 123456, 077..., or +232..."
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sending || !phoneInput.trim()}
                  className="bg-primary text-white text-xs font-semibold px-5 py-2.5 rounded-md hover:bg-primary-dark disabled:opacity-40 transition cursor-pointer shadow-xs whitespace-nowrap"
                >
                  {sending ? "Sending SMS..." : "Send Verification Code"}
                </button>
              </div>

              <p className="text-[11px] text-ink-soft">
                Supported carriers: <strong>Orange SL</strong> (074-079), <strong>Africell SL</strong> (077, 088, 030), <strong>QCell SL</strong> (031-034), or international roaming numbers.
              </p>
            </div>
          )}

          {step === "code_sent" && (
            <div className="space-y-3 bg-canvas/60 p-4 rounded-lg border border-primary-light">
              <p className="text-xs text-ink-soft">
                Enter the 6-digit code sent via SMS to <strong className="font-mono text-ink">{phoneInput}</strong> (valid for {expiresInMinutes} minutes):
              </p>
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  className="w-40 border border-primary-light rounded-md px-3 py-2 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white font-['Tahoma']"
                  maxLength={6}
                  placeholder="123456"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifying || codeInput.length < 6}
                  className="bg-accent text-white text-xs font-semibold px-5 py-2 rounded-md hover:opacity-90 disabled:opacity-40 transition cursor-pointer shadow-xs"
                >
                  {verifying ? "Verifying..." : "Verify Code"}
                </button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sending}
                  className="border border-primary-light text-ink hover:bg-white text-xs font-medium px-3 py-2 rounded-md transition cursor-pointer"
                >
                  Resend SMS
                </button>
              </div>
            </div>
          )}

          {otpSuccess && (
            <div className="mt-3 p-3 bg-status-approved-bg border border-status-approved/30 rounded-md text-status-approved text-xs font-medium">
              ✓ {otpSuccess}
            </div>
          )}

          {otpError && (
            <div className="mt-3 p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium">
              ⚠️ {otpError}
            </div>
          )}
        </SecurityPaperPanel>
      </div>
    </ApplicantLayout>
  );
}
