import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Info,
  FileText,
  MapPin,
  Phone,
  LayoutDashboard,
  Stamp,
  PlaneTakeoff,
  Bell,
  UserCircle,
  ClipboardList,
  Users,
  Map,
  BarChart2,
  ShieldAlert,
  QrCode,
  Eye,
  Clock,
} from "lucide-react";

interface TabItem {
  name: string;
  path: string;
  Icon: LucideIcon;
  exact?: boolean;
}

export function MobileAppBottomNav() {
  const { profile } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  // 1. Explicitly HIDE mobile bottom navigation on auth & standalone onboarding pages
  const isAuthOrStandaloneLanding = [
    "/applicant",
    "/visa/portal",
    "/border/portal",
    "/admin/portal",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/staff/login",
    "/staff/signup",
    "/staff/request-access",
    "/unauthorized",
  ].includes(path);

  if (isAuthOrStandaloneLanding) {
    return null;
  }

  let tabs: TabItem[] = [];

  // 2. Main Public Gateway & 5 Information Pages Context
  const isPublicInfoPage = ["/", "/about", "/services", "/borders", "/contact"].includes(path);

  if (isPublicInfoPage) {
    tabs = [
      { name: "Home",     path: "/",        Icon: Home,     exact: true },
      { name: "About",    path: "/about",   Icon: Info },
      { name: "Services", path: "/services",Icon: FileText },
      { name: "Borders",  path: "/borders", Icon: MapPin },
      { name: "Contact",  path: "/contact", Icon: Phone },
    ];
  }
  // 3. Admin Executive Portal Context
  else if (path.startsWith("/admin")) {
    tabs = [
      { name: "Overview",  path: "/admin",              Icon: LayoutDashboard, exact: true },
      { name: "Users",     path: "/admin/users",         Icon: Users },
      { name: "Posts",     path: "/admin/checkpoints",   Icon: Map },
      { name: "Reports",   path: "/admin/reports",       Icon: BarChart2 },
      { name: "Audit",     path: "/admin/audit-log",     Icon: ShieldAlert },
    ];
  }
  // 4. Visa Officer Adjudication Console Context
  else if (path.startsWith("/visa-officer")) {
    tabs = [
      { name: "Queue",    path: "/visa-officer", Icon: ClipboardList, exact: true },
      { name: "Consular", path: "/visa/portal",  Icon: Stamp },
      { name: "Borders",  path: "/borders",      Icon: MapPin },
      { name: "Profile",  path: "/profile",      Icon: UserCircle },
    ];
  }
  // 5. Border Officer Clearance Desk Context
  else if (
    path === "/border/check-in" ||
    path === "/border/verify" ||
    path === "/border/verify-qr" ||
    path === "/border/watchlist" ||
    path === "/border/overstays" ||
    path === "/border/overstay-report" ||
    path.startsWith("/border-officer")
  ) {
    tabs = [
      { name: "Check-In",  path: "/border/check-in", Icon: Stamp },
      { name: "Scan QR",   path: "/border/verify",   Icon: QrCode },
      { name: "Watchlist", path: "/border/watchlist", Icon: Eye },
      { name: "Overstays", path: "/border/overstays", Icon: Clock },
      { name: "Borders",   path: "/borders",          Icon: MapPin },
    ];
  }
  // 6. Traveler / Applicant Dashboard & Services (Authenticated)
  else if (
    path.startsWith("/dashboard") ||
    path.startsWith("/passport") ||
    path.startsWith("/visa") ||        // covers /visa/new, /visa/:id/status, /visa/:id/payment
    path.startsWith("/status") ||
    path.startsWith("/payment") ||
    path.startsWith("/notifications") ||
    path.startsWith("/profile")
  ) {
    tabs = [
      { name: "Dashboard", path: "/dashboard",      Icon: LayoutDashboard },
      { name: "Passport",  path: "/passport",        Icon: Stamp },
      { name: "e-Visa",    path: "/visa/new",        Icon: PlaneTakeoff },
      { name: "Alerts",    path: "/notifications",   Icon: Bell },
      { name: "Profile",   path: "/profile",         Icon: UserCircle },
    ];
  }
  // 7. Otherwise don't show dock
  else {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Bottom App Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B4F6C]/97 backdrop-blur-xl border-t border-white/15 text-white shadow-2xl px-1 py-1 pb-[max(0.4rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? path === tab.path
            : path === tab.path || (tab.path !== "/" && path.startsWith(tab.path));
          const IconComp = tab.Icon;

          return (
            <Link
              key={tab.name + tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 relative min-w-[52px] ${
                isActive
                  ? "text-amber-400 font-bold scale-105 bg-white/10"
                  : "text-slate-300/90 hover:text-white active:scale-95"
              }`}
            >
              {/* Active top dot indicator */}
              {isActive && (
                <span className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/60" />
              )}
              <IconComp
                size={isActive ? 22 : 20}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px] leading-none">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
