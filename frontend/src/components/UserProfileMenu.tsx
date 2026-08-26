import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

interface UserProfileMenuProps {
  roleTheme?: "admin" | "visa" | "border" | "applicant";
  showGreeting?: boolean;
}

export function UserProfileMenu({ roleTheme = "admin", showGreeting = true }: UserProfileMenuProps) {
  const { profile, signOut, updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName = profile?.full_name || "User";
  const firstName = fullName.split(" ")[0];

  const roleLabel =
    profile?.role === "admin"
      ? "Executive Admin"
      : profile?.role === "visa_officer"
      ? "Visa Officer"
      : profile?.role === "immigration_officer"
      ? "Border Officer"
      : "Applicant";

  const themeClasses = {
    admin: {
      gradient: "from-[#4C1D95] to-[#7C3AED]",
      badge: "bg-purple-100 text-purple-900 border-purple-300",
      accent: "text-purple-700",
    },
    visa: {
      gradient: "from-[#0B4F6C] to-[#0284C7]",
      badge: "bg-sky-100 text-sky-900 border-sky-300",
      accent: "text-[#0B4F6C]",
    },
    border: {
      gradient: "from-[#1E8E5A] to-[#10B981]",
      badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
      accent: "text-[#1E8E5A]",
    },
    applicant: {
      gradient: "from-[#0B4F6C] to-[#1E8E5A]",
      badge: "bg-teal-100 text-teal-900 border-teal-300",
      accent: "text-primary",
    },
  }[roleTheme];

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Compress & Resize image before saving to avoid large payloads
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

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload Profile Photo"
      />

      {/* Greeting & Name */}
      {showGreeting && (
        <div className="text-right flex flex-col justify-center">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-ink truncate max-w-[110px] sm:max-w-[160px]">
              Welcome, {firstName}
            </span>
          </div>
          <span className="text-[9px] uppercase font-bold text-ink-soft tracking-wider">
            {roleLabel}
          </span>
        </div>
      )}

      {/* Profile Avatar with Hover/Tap Camera Trigger */}
      <div className="relative group flex-shrink-0">
        <button
          type="button"
          onClick={triggerUpload}
          disabled={uploading}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-md overflow-hidden cursor-pointer active:scale-95 transition group focus:outline-none focus:ring-2 focus:ring-primary/40"
          title="Click to upload/change profile picture"
          aria-label="Change profile photo"
        >
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

          {/* Camera Icon Overlay on Hover/Upload */}
          <div className="absolute inset-0 bg-black/45 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <span className="animate-spin text-[10px]">⏳</span>
            ) : (
              <span className="text-[11px]">📷</span>
            )}
          </div>
        </button>

        {/* Online Green Activity Dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white pointer-events-none"></span>
      </div>

      {/* Sign Out Icon Button */}
      <button
        type="button"
        onClick={() => signOut()}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-2xs group flex-shrink-0"
        title="Sign out of account"
        aria-label="Sign out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:translate-x-0.5 transition-transform"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
