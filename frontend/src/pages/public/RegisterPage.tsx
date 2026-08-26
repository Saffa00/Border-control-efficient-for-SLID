import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { SocialLoginButtons } from "../../components/SocialLoginButtons";

export default function RegisterPage() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    // Account & Personal
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    nationality: "",
    countryOfResidence: "",
    occupation: "",

    // Residential Address
    addressLine: "",
    addressCity: "",
    addressCountry: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    // Required validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setError("Full Name, Email Address, and Password are required.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const cleanEmail = formData.email.trim().toLowerCase();

    // Check if email already exists in public.users
    const { data: existingUser } = await supabase
      .from("users")
      .select("role, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.role !== "applicant") {
        setError(
          `Restricted: The email "${cleanEmail}" is already registered as an Official ${existingUser.role
            .replace("_", " ")
            .toUpperCase()} account. One email address cannot be used for multiple roles.`
        );
      } else {
        setError(`An account with the email "${cleanEmail}" already exists. Please log in instead.`);
      }
      setLoading(false);
      return;
    }

    // Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: formData.password,
      options: { data: { full_name: formData.fullName.trim() } },
    });

    const userId = data?.user?.id || data?.session?.user?.id;

    // If we have a user ID created in auth.users
    if (userId) {
      // Direct insert/upsert into public.users with is_active: true
      const { error: profileError } = await supabase.from("users").upsert({
        user_id: userId,
        full_name: formData.fullName.trim(),
        email: cleanEmail,
        phone: formData.phone.trim() || null,
        nationality: formData.nationality.trim() || null,
        country_of_residence: formData.countryOfResidence.trim() || null,
        occupation: formData.occupation.trim() || null,
        address_line: formData.addressLine.trim() || null,
        address_city: formData.addressCity.trim() || null,
        address_country: formData.addressCountry.trim() || null,
        emergency_contact_name: formData.emergencyContactName.trim() || null,
        emergency_contact_phone: formData.emergencyContactPhone.trim() || null,
        role: "applicant",
        is_active: true,
      });

      if (profileError) {
        if (!profileError.message.includes("duplicate") && !profileError.message.includes("unique")) {
          console.warn("Profile save warning:", profileError.message);
        }
      }

      // Try automatic immediate sign-in to bypass email confirmation screen if possible
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: formData.password,
      });

      setLoading(false);

      if (signInData?.session || data?.session) {
        navigate("/dashboard");
        return;
      }

      // If auto-login requires manual login step, redirect to login page with success notification
      navigate("/login?registered=true&email=" + encodeURIComponent(cleanEmail));
      return;
    }

    if (signUpError) {
      setError(signUpError.message);
    } else {
      navigate("/login?registered=true&email=" + encodeURIComponent(cleanEmail));
    }
    setLoading(false);
  }

  if (needsEmailConfirmation) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-body flex items-center justify-center px-8">
        <div className="max-w-sm text-center">
          <p className="font-display text-xl mb-2 font-bold">Check your email</p>
          <p className="text-sm text-ink-soft mb-6">
            We've sent a confirmation link to <span className="font-medium text-ink">{formData.email}</span>. Confirm
            your email, then log in to finish setting up your account.
          </p>
          <Link
            to="/login"
            className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-primary-dark transition inline-block"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <img
            src="/slid-logo.png"
            alt="Sierra Leone Immigration Department"
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
          <p className="font-mono text-xs tracking-widest text-primary uppercase font-bold">
            Republic of Sierra Leone
          </p>
          <h1 className="font-display text-2xl font-bold mt-1 text-ink">
            Create Applicant Account
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Register to apply for visas, record biometric passports, and manage travel clearances.
          </p>
        </div>

        <SecurityPaperPanel className="p-8" showRosette>
          <SocialLoginButtons mode="register" />

          <form onSubmit={handleRegister} className="space-y-6">
            {/* 1. Personal & Account Details */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary-light pb-1 mb-3">
                1. Personal &amp; Account Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    required
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="e.g. Mariatu Sesay"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="mariatu@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Phone Number (SMS verified)
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="+232 76 123456"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Password (min 8 characters) *
                  </label>
                  <input
                    required
                    type="password"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Confirm Password *
                  </label>
                  <input
                    required
                    type="password"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Nationality
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="e.g. Sierra Leonean"
                    value={formData.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Country of Residence
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="e.g. Sierra Leone"
                    value={formData.countryOfResidence}
                    onChange={(e) => handleChange("countryOfResidence", e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Occupation
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="e.g. Civil Engineer / Merchant"
                    value={formData.occupation}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 2. Residential Address */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary-light pb-1 mb-3">
                2. Residential Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Address Line
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="e.g. 14 Siaka Stevens Street"
                    value={formData.addressLine}
                    onChange={(e) => handleChange("addressLine", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    City / Town
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="e.g. Freetown"
                    value={formData.addressCity}
                    onChange={(e) => handleChange("addressCity", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Country
                  </label>
                  <input
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="+232 78 654321"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-md text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 transition cursor-pointer shadow-xs mt-2"
            >
              {loading ? "Creating Account..." : "Create Applicant Account"}
            </button>
          </form>
        </SecurityPaperPanel>

        <p className="text-xs text-ink-soft text-center mt-6">
          Already registered?{" "}
          <Link to="/login" className="text-primary font-semibold underline underline-offset-4">
            Sign in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
