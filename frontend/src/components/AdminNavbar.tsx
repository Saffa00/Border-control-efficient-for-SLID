import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileBarChart2,
  ShieldCheck,
  FileCheck2,
  Compass,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SierraLeoneFlag } from "./SierraLeoneFlag";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBellMenu } from "./NotificationBellMenu";

export function AdminNavbar() {
  const { profile } = useAuth();
  const location = useLocation();

  const firstName = profile?.full_name?.split(" ")[0] || "Admin";

  const navLinks = [
    { name: "Executive Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Staff & Users", path: "/admin/users", icon: Users },
    { name: "Border Checkpoints", path: "/admin/checkpoints", icon: MapPin },
    { name: "A4 PDF Reports", path: "/admin/reports", icon: FileBarChart2 },
    { name: "Security Audit Log", path: "/admin/audit-log", icon: ShieldCheck },
  ];

  const portalLinks = [
    { name: "Visa Portal", path: "/visa-officer", icon: FileCheck2 },
    { name: "Border Portal", path: "/border/check-in", icon: Compass },
  ];

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
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          {/* Left: Brand Logo & Welcome Greeting */}
          <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
            <Link to="/admin" className="flex items-center gap-2 group flex-shrink-0">
              <img
                src="/slid-logo.png"
                alt="SLID Crest"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
              />
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <SierraLeoneFlag width={14} height={9} />
                <span className="text-[10px] sm:text-xs font-bold text-ink">
                  Welcome, {firstName}
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-bold bg-purple-100 text-purple-900 border border-purple-300 px-1.5 py-0.2 rounded-full">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-ink-soft hidden sm:block">
                National Central Administration • Executive Console
              </span>
            </div>
          </div>

          {/* Center: Navigation Tabs (Desktop only) */}
          <nav className="hidden lg:flex items-center gap-1 bg-canvas p-1 rounded-xl border border-primary-light/70 shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const IconComp = link.icon;
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
                  <IconComp size={15} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Portals, Notification Bell, Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden xl:flex items-center gap-1 border-r border-primary-light/70 pr-3">
              {portalLinks.map((portal) => {
                const IconComp = portal.icon;
                return (
                  <Link
                    key={portal.path}
                    to={portal.path}
                    className="text-[11px] font-semibold text-primary hover:text-primary-dark px-2 py-1 rounded-lg hover:bg-primary-light/30 transition flex items-center gap-1"
                  >
                    <IconComp size={13} />
                    <span>{portal.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Real Notification Bell Icon */}
            <NotificationBellMenu />

            {/* Profile Dropdown with Upload Photo, Change Password, Settings, Sign Out */}
            <UserProfileMenu roleTheme="admin" />
          </div>
        </div>
      </div>
    </header>
  );
}
