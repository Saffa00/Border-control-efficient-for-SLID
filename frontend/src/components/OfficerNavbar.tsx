import { Link, useLocation } from "react-router-dom";
import {
  FileCheck2,
  Compass,
  QrCode,
  ShieldAlert,
  Clock,
  Landmark,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SierraLeoneFlag } from "./SierraLeoneFlag";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBellMenu } from "./NotificationBellMenu";

export function OfficerNavbar({ title = "Officer Operational Console" }: { title?: string }) {
  const { profile } = useAuth();
  const location = useLocation();

  const firstName = profile?.full_name?.split(" ")[0] || "Officer";
  const isVisaRole = profile?.role === "visa_officer";

  const isVisaQueue = location.pathname.startsWith("/visa-officer");
  const isBorderCheck = location.pathname.startsWith("/border/check-in");
  const isQRVerify = location.pathname.startsWith("/border/verify");
  const isWatchlist = location.pathname.startsWith("/border/watchlist");
  const isOverstays = location.pathname.startsWith("/border/overstays");

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. National Tri-Color Strip */}
      <div className="h-1.5 w-full grid grid-cols-3 shadow-xs">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      {/* 2. Main Executive Header */}
      <div className="border-b border-primary-light/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          {/* Left: Brand Logo & Welcome Greeting */}
          <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
            <Link
              to={profile?.role === "admin" ? "/admin" : isVisaRole ? "/visa-officer" : "/border/check-in"}
              className="flex items-center gap-2 group flex-shrink-0"
            >
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
                <span
                  className={`text-[8px] sm:text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full border ${
                    isVisaRole
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border-emerald-300"
                  }`}
                >
                  {isVisaRole ? "Visa Desk" : "Border Desk"}
                </span>
              </div>
              <span className="text-[10px] text-ink-soft hidden sm:block">
                {title} • Department of Immigration
              </span>
            </div>
          </div>

          {/* Center: Navigation Tabs (Desktop only) */}
          <nav className="hidden lg:flex items-center gap-1 bg-canvas p-1 rounded-xl border border-primary-light/70 shadow-inner">
            <Link
              to="/visa-officer"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                isVisaQueue
                  ? "bg-[#0B4F6C] text-white shadow-xs"
                  : "text-ink-soft hover:text-ink hover:bg-white"
              }`}
            >
              <FileCheck2 size={15} />
              <span>Visa Queue</span>
            </Link>

            <Link
              to="/border/check-in"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                isBorderCheck
                  ? "bg-[#1E8E5A] text-white shadow-xs"
                  : "text-ink-soft hover:text-ink hover:bg-white"
              }`}
            >
              <Compass size={15} />
              <span>Border Check-in</span>
            </Link>

            <Link
              to="/border/verify"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                isQRVerify
                  ? "bg-primary text-white shadow-xs"
                  : "text-ink-soft hover:text-ink hover:bg-white"
              }`}
            >
              <QrCode size={15} />
              <span>QR Scanner</span>
            </Link>

            <Link
              to="/border/watchlist"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                isWatchlist
                  ? "bg-rose-700 text-white shadow-xs"
                  : "text-ink-soft hover:text-ink hover:bg-white"
              }`}
            >
              <ShieldAlert size={15} />
              <span>Watchlist</span>
            </Link>

            <Link
              to="/border/overstays"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                isOverstays
                  ? "bg-amber-700 text-white shadow-xs"
                  : "text-ink-soft hover:text-ink hover:bg-white"
              }`}
            >
              <Clock size={15} />
              <span>Overstays</span>
            </Link>
          </nav>

          {/* Right: Quick Admin Switcher, Notification Bell & Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {profile?.role === "admin" && (
              <Link
                to="/admin"
                className="hidden xl:inline-flex items-center gap-1.5 text-xs text-purple-700 font-semibold border border-purple-300 bg-purple-50 hover:bg-purple-700 hover:text-white px-2.5 py-1 rounded-lg transition"
              >
                <Landmark size={13} />
                <span>Admin Console</span>
              </Link>
            )}

            <NotificationBellMenu />
            <UserProfileMenu roleTheme={isVisaRole ? "visa" : "border"} />
          </div>
        </div>
      </div>
    </header>
  );
}
