import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Plane,
  Bell,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SierraLeoneFlag } from "./SierraLeoneFlag";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBellMenu } from "./NotificationBellMenu";

export function ApplicantNavbar() {
  const { profile } = useAuth();
  const location = useLocation();

  const firstName = profile?.full_name?.split(" ")[0] || "Traveler";

  const navLinks = [
    { name: "My Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Passport", path: "/passport", icon: BookOpen },
    { name: "Apply for Visa", path: "/visa/new", icon: Plane },
    { name: "Border Checkpoints", path: "/borders", icon: BookOpen },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Profile & Security", path: "/profile", icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Main Navigation Bar */}
      <div className="border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          {/* Left: Brand Logo & Welcome Greeting */}
          <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
              <img
                src="/slid-logo.png"
                alt="SLID Emblem"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
              />
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <SierraLeoneFlag width={14} height={9} />
                <span className="text-[10px] sm:text-xs font-bold text-zinc-900">
                  Welcome, {firstName}
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-bold bg-zinc-100 text-zinc-800 border border-zinc-300 px-1.5 py-0.2 rounded-full">
                  Traveler
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 hidden sm:block">
                Department of Immigration • e-Visa Portal
              </span>
            </div>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#002B49] text-white"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <IconComponent size={14} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Notifications & Profile Menu */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <NotificationBellMenu />
            <UserProfileMenu roleTheme="applicant" />
          </div>
        </div>
      </div>
    </header>
  );
}
