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
      {/* Main Executive Header */}
      <div className="border-b border-zinc-200 bg-white/95 backdrop-blur-md">
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
                <span className="text-[10px] sm:text-xs font-bold text-zinc-900">
                  Welcome, Officer {firstName}
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full border bg-zinc-100 text-zinc-800 border-zinc-300">
                  {isVisaRole ? "Consular Desk" : "Border Control"}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 hidden sm:block">
                Sierra Leone Immigration Department • {title}
              </span>
            </div>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/visa-officer"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isVisaQueue
                  ? "bg-[#002B49] text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <FileCheck2 size={14} />
              <span>Visa Adjudication Queue</span>
            </Link>

            <Link
              to="/border/check-in"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isBorderCheck
                  ? "bg-[#002B49] text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Compass size={14} />
              <span>Border Check-in</span>
            </Link>

            <Link
              to="/border/verify"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isQRVerify
                  ? "bg-[#002B49] text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <QrCode size={14} />
              <span>QR Verifier</span>
            </Link>

            <Link
              to="/border/watchlist"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isWatchlist
                  ? "bg-[#002B49] text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <ShieldAlert size={14} />
              <span>Watchlist</span>
            </Link>

            <Link
              to="/border/overstays"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isOverstays
                  ? "bg-[#002B49] text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Clock size={14} />
              <span>Overstay Report</span>
            </Link>
          </nav>

          {/* Right: Notifications & Profile Menu */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {profile?.role === "admin" && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold px-2.5 py-1.5 rounded border border-zinc-300 transition"
              >
                <Landmark size={13} />
                <span>Admin Hub</span>
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
