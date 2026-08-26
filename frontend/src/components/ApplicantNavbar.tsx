import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Plane,
  Bell,
  UserCheck,
} from "lucide-react";
import { SierraLeoneFlag } from "./SierraLeoneFlag";
import { UserProfileMenu } from "./UserProfileMenu";

export function ApplicantNavbar() {
  const location = useLocation();

  const navLinks = [
    { name: "My Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Passport", path: "/passport", icon: BookOpen },
    { name: "Apply for Visa", path: "/visa/new", icon: Plane },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Profile & Security", path: "/profile", icon: UserCheck },
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
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Brand & Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <img
              src="/slid-logo.png"
              alt="SLID Emblem"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="hidden md:flex flex-col">
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

          {/* Navigation Tabs - Hidden on mobile, shown on desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-canvas p-1 rounded-xl border border-primary-light/70 shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const IconComp = link.icon;
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
                  <IconComp size={15} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Menu with Avatar Upload & Sign Out Icon */}
          <UserProfileMenu roleTheme="applicant" />
        </div>
      </div>
    </header>
  );
}
