import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SierraLeoneFlag } from "./SierraLeoneFlag";

export function AdminNavbar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: "Executive Overview", path: "/admin", icon: "📊" },
    { name: "Staff & Users", path: "/admin/users", icon: "👥" },
    { name: "Border Checkpoints", path: "/admin/checkpoints", icon: "🗺️" },
    { name: "A4 PDF Reports", path: "/admin/reports", icon: "📑" },
    { name: "Security Audit Log", path: "/admin/audit-log", icon: "🔒" },
  ];

  const portalLinks = [
    { name: "Visa Portal", path: "/visa-officer", icon: "🛂" },
    { name: "Border Portal", path: "/border/check-in", icon: "🛡️" },
  ];

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. National Tri-Color Strip */}
      <div className="h-1.5 w-full grid grid-cols-3 shadow-xs">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      {/* 2. Main Executive Header */}
      <div className="border-b border-purple-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Logo */}
          <Link to="/admin" className="flex items-center gap-3 group">
            <img
              src="/slid-logo.png"
              alt="SLID Crest"
              className="w-11 h-11 sm:w-12 sm:h-12 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <SierraLeoneFlag width={16} height={10} />
                <span className="text-[9px] font-bold text-[#1E8E5A] uppercase tracking-widest leading-none">
                  Republic of Sierra Leone
                </span>
                <span className="text-[9px] uppercase font-bold bg-purple-100 text-purple-900 border border-purple-300 px-1.5 py-0.2 rounded-full">
                  Directorate Headquarters
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-ink leading-tight group-hover:text-purple-900 transition">
                National Central Administration
              </span>
              <span className="text-[10px] text-ink-soft -mt-0.5">
                Department of Immigration • Executive Console
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
                      ? "bg-[#4C1D95] text-white shadow-xs"
                      : "text-ink-soft hover:text-ink hover:bg-white"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Operational Portal Switchers & User Profile */}
          <div className="flex items-center gap-3.5">
            <div className="hidden xl:flex items-center gap-1 border-r border-primary-light/70 pr-3">
              {portalLinks.map((portal) => (
                <Link
                  key={portal.path}
                  to={portal.path}
                  className="text-[11px] font-semibold text-primary hover:text-primary-dark px-2.5 py-1.5 rounded-lg hover:bg-primary-light/30 transition flex items-center gap-1"
                >
                  <span>{portal.icon}</span>
                  <span>{portal.name} &rarr;</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2.5 p-1 rounded-lg border border-purple-200 bg-white shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4C1D95] to-[#7C3AED] text-white flex items-center justify-center text-xs font-bold font-mono shadow-2xs">
                {initials}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-ink leading-tight">
                  {profile?.full_name || "Administrator"}
                </p>
                <p className="text-[9px] uppercase font-bold text-purple-700 font-mono">
                  {profile?.role || "admin"}
                </p>
              </div>
            </div>

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
