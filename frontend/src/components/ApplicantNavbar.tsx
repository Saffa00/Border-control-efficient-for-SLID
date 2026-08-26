import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SierraLeoneFlag } from "./SierraLeoneFlag";

export function ApplicantNavbar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: "My Dashboard", path: "/dashboard", icon: "📊" },
    { name: "My Passport", path: "/passport", icon: "🛂" },
    { name: "Apply for Visa", path: "/visa/new", icon: "✈️" },
    { name: "Notifications", path: "/notifications", icon: "🔔" },
    { name: "Profile & Security", path: "/profile", icon: "👤" },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. National Tri-Color Accent Strip */}
      <div className="h-1.5 w-full grid grid-cols-3 shadow-xs">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      {/* 2. Main Executive Navigation Bar */}
      <div className="border-b border-primary-light/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <img
              src="/slid-logo.png"
              alt="SLID Emblem"
              className="w-11 h-11 sm:w-12 sm:h-12 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <SierraLeoneFlag width={16} height={10} />
                <span className="text-[9px] font-bold text-[#1E8E5A] uppercase tracking-widest leading-none">
                  Republic of Sierra Leone
                </span>
                <span className="text-[9px] uppercase font-bold bg-sky-100 text-sky-800 border border-sky-300 px-1.5 py-0.2 rounded-full">
                  Applicant Portal
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-ink leading-tight group-hover:text-primary transition">
                Department of Immigration
              </span>
              <span className="text-[10px] text-ink-soft -mt-0.5">
                e-Visa &amp; Biometric Travel Services
              </span>
            </div>
          </Link>

          {/* Navigation Tabs - Hidden on mobile, shown on desktop (mobile uses bottom footer dock) */}
          <nav className="hidden md:flex items-center gap-1 bg-canvas p-1 rounded-xl border border-primary-light/70 shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "text-ink-soft hover:text-ink hover:bg-white"
                  }`}
                >
                  <span className="text-xs">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card & Sign Out */}
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-canvas transition border border-transparent hover:border-primary-light/60"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-primary/30 shadow-2xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-[#0284C7] text-white flex items-center justify-center text-xs font-bold font-mono shadow-2xs">
                  {profile?.full_name?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-ink leading-tight">
                  {profile?.full_name || "Applicant"}
                </p>
                <p className="text-[10px] text-ink-soft font-mono truncate max-w-[120px]">
                  {profile?.email || "Verified Traveler"}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => signOut()}
              className="border border-status-rejected/30 text-status-rejected hover:bg-status-rejected hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
