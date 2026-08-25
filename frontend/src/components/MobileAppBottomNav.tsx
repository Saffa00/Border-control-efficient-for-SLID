import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function MobileAppBottomNav() {
  const { profile } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  // Only show bottom navigation on mobile / tablet screens or in standalone app mode
  // Only display when user is on dashboard / authenticated or portal pages
  const isPublicStandaloneLanding = [
    "/",
    "/about",
    "/services",
    "/borders",
    "/contact",
    "/login",
    "/register",
    "/staff/login",
    "/staff/signup",
    "/staff/request-access",
  ].includes(path);

  // If user is not logged in and on public auth pages, show a simple public onboarding dock
  if (!profile && isPublicStandaloneLanding) {
    return (
      <nav
        aria-label="Public Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B4F6C]/95 backdrop-blur-xl border-t border-white/10 text-white shadow-2xl px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link
            to="/"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              path === "/" ? "text-amber-400 font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            <span className="text-lg">🏛️</span>
            <span className="text-[10px] mt-0.5">Gateway</span>
          </Link>
          <Link
            to="/services"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              path === "/services" ? "text-amber-400 font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            <span className="text-lg">📋</span>
            <span className="text-[10px] mt-0.5">Services</span>
          </Link>
          <Link
            to="/borders"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              path === "/borders" ? "text-amber-400 font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            <span className="text-lg">🗺️</span>
            <span className="text-[10px] mt-0.5">Borders</span>
          </Link>
          <Link
            to="/applicant"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              path === "/applicant" || path === "/login" ? "text-amber-400 font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            <span className="text-lg">✈️</span>
            <span className="text-[10px] mt-0.5">Traveler</span>
          </Link>
          <Link
            to="/staff/login"
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              path === "/staff/login" ? "text-amber-400 font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            <span className="text-lg">🛂</span>
            <span className="text-[10px] mt-0.5">Staff</span>
          </Link>
        </div>
      </nav>
    );
  }

  // If logged in, configure tabs according to the user's specific role
  const role = profile?.role || "applicant";

  let tabs: { name: string; path: string; icon: string; badge?: string }[] = [];

  if (role === "admin") {
    tabs = [
      { name: "Overview", path: "/admin", icon: "📊" },
      { name: "Users", path: "/admin/users", icon: "👥" },
      { name: "Borders", path: "/admin/checkpoints", icon: "🗺️" },
      { name: "Reports", path: "/admin/reports", icon: "📑" },
      { name: "Audit Log", path: "/admin/audit-log", icon: "🔒" },
    ];
  } else if (role === "visa_officer") {
    tabs = [
      { name: "Queue", path: "/visa-officer", icon: "🛂" },
      { name: "Consular", path: "/visa/portal", icon: "🏛️" },
      { name: "Checkpoints", path: "/borders", icon: "🗺️" },
      { name: "Profile", path: "/profile", icon: "👤" },
    ];
  } else if (role === "immigration_officer") {
    tabs = [
      { name: "Check-In", path: "/border/check-in", icon: "🛂" },
      { name: "Scan QR", path: "/border/verify-qr", icon: "📷" },
      { name: "Watchlist", path: "/border/watchlist", icon: "🚨" },
      { name: "Overstays", path: "/border/overstay-report", icon: "⏳" },
    ];
  } else {
    // Applicant / Traveler
    tabs = [
      { name: "Dashboard", path: "/dashboard", icon: "📊" },
      { name: "Passport", path: "/passport", icon: "🛂" },
      { name: "Apply e-Visa", path: "/visa/new", icon: "✈️" },
      { name: "Alerts", path: "/notifications", icon: "🔔" },
      { name: "Profile", path: "/profile", icon: "👤" },
    ];
  }

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B4F6C]/95 backdrop-blur-xl border-t border-white/10 text-white shadow-2xl px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path !== "/" && tab.path !== "/admin" && tab.path !== "/dashboard" && location.pathname.startsWith(tab.path));

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? "text-amber-400 font-bold scale-105 bg-white/10"
                  : "text-slate-300 hover:text-white active:scale-95"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
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
