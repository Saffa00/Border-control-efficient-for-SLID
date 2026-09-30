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
      {/* Main Executive Header */}
      <div className="border-b border-zinc-200 bg-white/95 backdrop-blur-md">
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
                <span className="text-[10px] sm:text-xs font-bold text-zinc-900">
                  Welcome, Administrator {firstName}
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-bold bg-zinc-100 text-zinc-800 border border-zinc-300 px-1.5 py-0.2 rounded-full">
                  Directorate Admin
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 hidden sm:block">
                Sierra Leone Immigration Department • Command Center
              </span>
            </div>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
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

          {/* Right: Portal Switches & Profile Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-zinc-200">
              {portalLinks.map((pl) => {
                const IconComp = pl.icon;
                return (
                  <Link
                    key={pl.path}
                    to={pl.path}
                    className="text-[11px] font-bold text-zinc-600 hover:text-[#002B49] hover:bg-zinc-100 px-2 py-1 rounded transition flex items-center gap-1"
                    title={`Switch to ${pl.name}`}
                  >
                    <IconComp size={13} />
                    <span>{pl.name}</span>
                  </Link>
                );
              })}
            </div>

            <NotificationBellMenu />
            <UserProfileMenu roleTheme="admin" />
          </div>
        </div>
      </div>
    </header>
  );
}
