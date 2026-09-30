import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Plane,
  Bell,
  UserCheck,
  MapPin,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Plus,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Phone,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SierraLeoneFlag } from "./SierraLeoneFlag";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBellMenu } from "./NotificationBellMenu";

interface ApplicantLayoutProps {
  children: ReactNode;
}

export function ApplicantLayout({ children }: ApplicantLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const firstName = profile?.full_name?.split(" ")[0] || "Traveler";

  const navLinks = [
    { name: "Dashboard Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Passport Registry", path: "/passport", icon: BookOpen },
    { name: "Apply for e-Visa", path: "/visa/new", icon: Plane, badge: "New" },
    { name: "Border Checkpoints", path: "/borders", icon: MapPin },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Profile & Security", path: "/profile", icon: UserCheck },
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes("visa")) navigate("/visa/new");
    else if (q.includes("passport")) navigate("/passport");
    else if (q.includes("border") || q.includes("map")) navigate("/borders");
    else if (q.includes("profile") || q.includes("password")) navigate("/profile");
    else navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-ink font-['Tahoma',sans-serif] flex flex-col">
      {/* 1. National Tri-Color Accent Bar */}
      <div className="h-1.5 w-full grid grid-cols-3 fixed top-0 left-0 right-0 z-50 shadow-xs">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      <div className="flex flex-1 pt-1.5 min-h-screen">
        {/* ------------------------------------------------------------- */}
        {/* 2. DESKTOP & MOBILE SIDEBAR NAVIGATION PANEL                   */}
        {/* ------------------------------------------------------------- */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#093548] text-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out pt-1.5 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div>
            {/* Sidebar Brand Header */}
            <div className="p-5 border-b border-white/10 bg-[#072a39]">
              <div className="flex items-center gap-3">
                <img
                  src="/slid-logo.png"
                  alt="SLID Emblem"
                  className="w-11 h-11 object-contain filter drop-shadow-md"
                />
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <SierraLeoneFlag width={14} height={9} />
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                      Sierra Leone
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
                    Immigration Directorate
                  </h2>
                  <p className="text-[10px] text-sky-200/80">Applicant Sovereign Portal</p>
                </div>
              </div>
            </div>

            {/* Humanized User Mini Profile Pill */}
            <div className="p-4 mx-3 my-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-400/60 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1E8E5A] text-white flex items-center justify-center font-bold text-sm shadow-xs border border-white/20">
                  {profile?.full_name
                    ? profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "AP"}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{profile?.full_name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[9px] uppercase font-bold text-emerald-300 tracking-wider">
                    Verified Applicant
                  </span>
                </div>
              </div>
            </div>

            {/* Main Nav Links */}
            <nav className="px-3 space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Main Navigation
              </p>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-gradient-to-r from-[#1E8E5A] to-[#146b43] text-white shadow-md shadow-emerald-950/40"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className={isActive ? "text-white" : "text-slate-400"} />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className="bg-amber-400 text-amber-950 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full">
                        {link.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={14} className="text-white/80" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Support Panel */}
          <div className="p-3.5 m-3 bg-[#062432] rounded-2xl border border-white/10 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-[11px]">
              <Phone size={14} />
              <span>Directorate Support</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-snug">
              Need assistance with visa applications or passport processing?
            </p>
            <div className="pt-1 flex items-center justify-between border-t border-white/10">
              <span className="font-mono text-[10px] text-slate-400">+232 76 000 000</span>
              <button
                onClick={() => signOut()}
                className="text-slate-400 hover:text-rose-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition"
              >
                <LogOut size={12} />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop overlay for mobile drawer */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. MAIN DASHBOARD CONTENT AREA & TOP HEADER                   */}
        {/* ------------------------------------------------------------- */}
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          {/* Top Sticky Header */}
          <header className="sticky top-1.5 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs flex items-center justify-between gap-4">
            {/* Left: Mobile Toggle & Page Title/Search */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                title="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search visas, passport, border posts, rules..."
                  className="w-full bg-slate-100/80 border border-slate-200 focus:border-[#1E8E5A] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/20 transition"
                />
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              </form>
            </div>

            {/* Right: Quick Action Button & Profile */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link
                to="/visa/new"
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#1E8E5A] hover:bg-[#166e46] active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
              >
                <Plus size={15} />
                <span>Apply for e-Visa</span>
              </Link>

              <NotificationBellMenu />
              <UserProfileMenu roleTheme="applicant" />
            </div>
          </header>

          {/* Page Content Panel Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 sm:pb-12">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-[11px] text-slate-500">
            <p>
              Republic of Sierra Leone • Directorate of Immigration &amp; Border Control &copy;{" "}
              {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
