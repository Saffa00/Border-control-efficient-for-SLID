import { useState, useRef, useEffect } from "react";
import { Camera, KeyRound, Settings, LogOut, ShieldCheck, X, CheckCircle2, AlertCircle, Eye, EyeOff, Bell, Volume2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

interface UserProfileMenuProps {
  roleTheme?: "admin" | "visa" | "border" | "applicant";
}

export function UserProfileMenu({ roleTheme = "admin" }: UserProfileMenuProps) {
  const { profile, signOut, updateAvatar } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Change Password Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fullName = profile?.full_name || "User";

  const roleLabel =
    profile?.role === "admin"
      ? "Executive Administrator"
      : profile?.role === "visa_officer"
      ? "Visa Adjudication Officer"
      : profile?.role === "immigration_officer"
      ? "Immigration & Border Officer"
      : "Verified Traveler";

  const themeClasses = {
    admin: {
      gradient: "from-[#4C1D95] to-[#7C3AED]",
      badge: "bg-purple-100 text-purple-900 border-purple-300",
    },
    visa: {
      gradient: "from-[#0B4F6C] to-[#0284C7]",
      badge: "bg-sky-100 text-sky-900 border-sky-300",
    },
    border: {
      gradient: "from-[#1E8E5A] to-[#10B981]",
      badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
    applicant: {
      gradient: "from-[#0B4F6C] to-[#1E8E5A]",
      badge: "bg-teal-100 text-teal-900 border-teal-300",
    },
  }[roleTheme];

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compress & Resize image before saving
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
            if (updateAvatar) {
              await updateAvatar(compressedBase64);
            }
          }
          setUploading(false);
          setIsOpen(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setUploading(false);
    }
  }

  function triggerUpload() {
    fileInputRef.current?.click();
  }

  // Handle password update
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2500);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          aria-label="Upload Profile Photo"
        />

        {/* Profile Avatar Button Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2 p-0.5 rounded-full border-2 border-white shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 group"
          title="Click to open profile menu"
          aria-label="Profile Menu"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-tr ${themeClasses.gradient} text-white flex items-center justify-center text-xs font-bold font-mono`}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Online Indicator */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white pointer-events-none"></span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white border border-primary-light rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up font-['Tahoma']">
            {/* User Profile Header Card */}
            <div className="p-4 bg-canvas/80 border-b border-primary-light flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary-light shadow-xs flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-tr ${themeClasses.gradient} text-white flex items-center justify-center text-sm font-bold font-mono`}
                  >
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink truncate">{fullName}</p>
                <p className="text-[11px] text-ink-soft truncate">{profile?.email}</p>
                <span className="inline-block mt-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-white text-primary border border-primary-light shadow-2xs">
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Menu Options */}
            <div className="p-2 space-y-1">
              {/* Option 1: Upload Photo */}
              <button
                type="button"
                onClick={triggerUpload}
                disabled={uploading}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-ink hover:bg-canvas hover:text-primary transition text-left cursor-pointer"
              >
                <Camera size={16} className="text-[#0284C7]" />
                <div className="flex-1">
                  <p>{uploading ? "Uploading photo..." : "Upload Profile Picture"}</p>
                  <p className="text-[10px] text-ink-soft font-normal">JPG, PNG, or Take Photo</p>
                </div>
              </button>

              {/* Option 2: Change Password */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowPasswordModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-ink hover:bg-canvas hover:text-primary transition text-left cursor-pointer"
              >
                <KeyRound size={16} className="text-[#1E8E5A]" />
                <div className="flex-1">
                  <p>Change Password</p>
                  <p className="text-[10px] text-ink-soft font-normal">Set a new permanent password</p>
                </div>
              </button>

              {/* Option 3: System Settings */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowSettingsModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-ink hover:bg-canvas hover:text-primary transition text-left cursor-pointer"
              >
                <Settings size={16} className="text-purple-600" />
                <div className="flex-1">
                  <p>System Settings</p>
                  <p className="text-[10px] text-ink-soft font-normal">Alerts, sound &amp; session</p>
                </div>
              </button>

              {/* Option 4: Sign Out */}
              <div className="pt-1 border-t border-primary-light/60">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 1. CHANGE PASSWORD MODAL                                              */}
      {/* --------------------------------------------------------------------- */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Tahoma'] animate-fade-in">
          <div className="w-full max-w-md bg-white border border-primary-light rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-700 p-1 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 text-[#1E8E5A] rounded-2xl">
                <KeyRound size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Change Your Password</h3>
                <p className="text-xs text-ink-soft">Choose a secure password for your account</p>
              </div>
            </div>

            {passwordSuccess ? (
              <div className="p-4 bg-status-approved-bg border border-status-approved/30 rounded-2xl text-status-approved text-xs font-medium text-center space-y-2 my-4">
                <CheckCircle2 size={32} className="mx-auto" />
                <p className="font-bold text-sm">Password Updated Successfully!</p>
                <p className="text-[11px]">Your new permanent password is active.</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    New Password (min 8 chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordText ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswordText ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7]"
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-xl text-status-rejected text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-primary-light text-xs font-semibold hover:bg-canvas transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 py-2.5 rounded-xl bg-[#1E8E5A] hover:bg-[#166E46] text-white text-xs font-semibold transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Save Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. SYSTEM SETTINGS MODAL                                              */}
      {/* --------------------------------------------------------------------- */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Tahoma'] animate-fade-in">
          <div className="w-full max-w-md bg-white border border-primary-light rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-700 p-1 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">System Settings</h3>
                <p className="text-xs text-ink-soft">Manage security, audio &amp; device notifications</p>
              </div>
            </div>

            <div className="space-y-3 divide-y divide-primary-light/60 text-xs">
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2.5">
                  <Bell size={18} className="text-[#0284C7]" />
                  <div>
                    <p className="font-bold text-ink">Device Push Alerts</p>
                    <p className="text-[10px] text-ink-soft">Real-time alerts on your phone screen</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (typeof window !== "undefined" && "Notification" in window) {
                      await Notification.requestPermission();
                    }
                  }}
                  className="bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                >
                  Configure
                </button>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-[#1E8E5A]" />
                  <div>
                    <p className="font-bold text-ink">Account Security</p>
                    <p className="text-[10px] text-ink-soft">User ID: <span className="font-mono">{profile?.user_id?.slice(0, 8)}...</span></p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#1E8E5A] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Protected (RLS)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold transition cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
