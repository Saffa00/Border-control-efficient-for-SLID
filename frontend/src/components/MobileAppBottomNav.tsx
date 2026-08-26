import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function MobileAppBottomNav() {
  const { profile } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  interface TabItem {
    name: string;
    path: string;
    icon: string;
    exact?: boolean;
  }

  // 1. Explicitly HIDE mobile bottom navigation on all role onboarding landing pages & auth pages
  const isStandaloneLandingOrAuth = [
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

  if (isStandaloneLandingOrAuth) {
    return null; // No footer dock on onboarding / landing / login screens
  }

  let tabs: TabItem[] = [];

  // 2. Main Public Gateway & 5 Information Pages Context
  const isPublicInfoPage = [
    "/",
    "/about",
    "/services",
    "/borders",
    "/contact",
  ].includes(path);

  if (isPublicInfoPage) {
    tabs = [
      { name: "Home", path: "/", icon: "🏠", exact: true },
      { name: "About", path: "/about", icon: "🏛️" },
      { name: "Services", path: "/services", icon: "📋" },
      { name: "Borders", path: "/borders", icon: "🗺️" },
      { name: "Contact", path: "/contact", icon: "✉️" },
    ];
  }
  // 3. Admin Executive Portal Context (Signed In / Navigating Admin)
  else if (path.startsWith("/admin")) {
    tabs = [
      { name: "Overview", path: "/admin", icon: "📊", exact: true },
      { name: "Users", path: "/admin/users", icon: "👥" },
      { name: "Checkpoints", path: "/admin/checkpoints", icon: "🗺️" },
      { name: "Reports", path: "/admin/reports", icon: "📑" },
      { name: "Audit Log", path: "/admin/audit-log", icon: "🔒" },
    ];
  }
  // 4. Visa Officer Adjudication Console Context
  else if (path.startsWith("/visa-officer")) {
    tabs = [
      { name: "Queue", path: "/visa-officer", icon: "📋", exact: true },
      { name: "Consular", path: "/visa/portal", icon: "🏛️" },
      { name: "Borders", path: "/borders", icon: "🗺️" },
      { name: "Profile", path: "/profile", icon: "👤" },
    ];
  }
  // 5. Border Officer Clearance Desk Context
  else if (
    path === "/border/check-in" ||
    path === "/border/verify-qr" ||
    path === "/border/watchlist" ||
    path === "/border/overstay-report" ||
    path.startsWith("/border-officer")
  ) {
    tabs = [
      { name: "Check-In", path: "/border/check-in", icon: "🛂" },
      { name: "Scan QR", path: "/border/verify-qr", icon: "📷" },
      { name: "Watchlist", path: "/border/watchlist", icon: "🚨" },
      { name: "Overstays", path: "/border/overstay-report", icon: "⏳" },
      { name: "5 Borders", path: "/borders", icon: "🗺️" },
    ];
  }
  // 6. Traveler / Applicant Dashboard & Services (Authenticated)
  else if (
    path.startsWith("/dashboard") ||
    path.startsWith("/passport") ||
    path.startsWith("/visa/new") ||
    path.startsWith("/status") ||
    path.startsWith("/payment") ||
    path.startsWith("/notifications") ||
    path.startsWith("/profile")
  ) {
    tabs = [
      { name: "Dashboard", path: "/dashboard", icon: "📊" },
      { name: "Passport", path: "/passport", icon: "🛂" },
      { name: "Apply e-Visa", path: "/visa/new", icon: "✈️" },
      { name: "Alerts", path: "/notifications", icon: "🔔" },
      { name: "Profile", path: "/profile", icon: "👤" },
    ];
  }
  // 7. Otherwise don't show dock
  else {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Bottom App Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B4F6C]/95 backdrop-blur-xl border-t border-white/15 text-white shadow-2xl px-1.5 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? path === tab.path
            : path === tab.path || (tab.path !== "/" && path.startsWith(tab.path));

          return (
            <Link
              key={tab.name + tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? "text-amber-400 font-bold scale-105 bg-white/10"
                  : "text-slate-300 hover:text-white active:scale-95"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
                {tab.name}
              </span>
              {isActive && (
                <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
