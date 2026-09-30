import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Plane,
  Bell,
  UserCheck,
  MapPin,
  Menu,
  X,
  Plus,
  Lock,
  Search,
  Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SierraLeoneFlag } from "./SierraLeoneFlag";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBellMenu } from "./NotificationBellMenu";

interface ApplicantLayoutProps {
  children: ReactNode;
}

export function ApplicantLayout({ children }: ApplicantLayoutProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState<"en" | "krio">("en");

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
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-sans flex flex-col justify-between">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#002B49] focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* 1. Official Government Top Banner */}
      <div className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 text-xs px-4 sm:px-8 py-1.5 font-sans">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SierraLeoneFlag width={16} height={10} />
            <span className="font-semibold text-zinc-800">
              An official website of the Republic of Sierra Leone Government
            </span>
            <span className="hidden sm:inline text-zinc-400">•</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-zinc-600">
              <Lock size={12} className="text-zinc-700" />
              <span>Secure HTTPS Encrypted (.gov.sl)</span>
            </span>
          </div>

          <div className="flex items-center gap-3 font-medium text-[11px]">
            <div className="flex items-center gap-1 bg-white border border-zinc-300 rounded px-1.5 py-0.5">
              <Globe size={12} className="text-zinc-500" />
              <button
                onClick={() => setLanguage("en")}
                className={`px-1 rounded cursor-pointer ${
                  language === "en" ? "font-bold text-[#002B49] bg-sky-50" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                English
              </button>
              <span className="text-zinc-300">|</span>
              <button
                onClick={() => setLanguage("krio")}
                className={`px-1 rounded cursor-pointer ${
                  language === "krio" ? "font-bold text-[#002B49] bg-sky-50" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Krio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Executive Header Bar */}
      <header className="bg-[#002B49] text-white border-b-4 border-zinc-700 px-4 sm:px-8 py-3 shadow-md font-sans">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Crest & Title */}
          <Link to="/dashboard" className="flex items-center gap-3.5 group">
            <img
              src="/slid-logo.png"
              alt="Republic of Sierra Leone Arms"
              className="w-11 h-11 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest leading-none mb-0.5">
                Republic of Sierra Leone
              </p>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                Department of Immigration (SLID)
              </h1>
              <p className="text-xs text-zinc-200 font-medium">Applicant &amp; Traveler Portal</p>
            </div>
          </Link>

          {/* Search Box & Quick Apply */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visas, passport, border posts..."
                className="w-full bg-white/10 border border-white/30 focus:border-white rounded px-9 py-1.5 text-xs text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
              />
              <Search size={15} className="absolute left-3 top-2 text-zinc-300" />
            </form>
          </div>

          {/* Right: Notifications & Profile Menu */}
          <div className="flex items-center gap-3">
            <Link
              to="/visa/new"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#002B49] border border-white/30 hover:bg-[#001D33] text-white text-xs font-bold px-3.5 py-2 rounded transition cursor-pointer shadow-xs focus:ring-2 focus:ring-white"
            >
              <Plus size={15} />
              <span>Apply for e-Visa</span>
            </Link>

            <NotificationBellMenu />
            <UserProfileMenu roleTheme="applicant" />

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-white hover:bg-white/10 cursor-pointer"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* 3. Unified Horizontal Top Header Navbar */}
        <nav className="max-w-7xl mx-auto pt-3 border-t border-white/15 mt-3 hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-[#002B49] shadow-xs"
                    : "text-zinc-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={16} className={isActive ? "text-[#002B49]" : "text-zinc-300"} />
                <span>{link.name}</span>
                {link.badge && (
                  <span className="bg-[#002B49] border border-white/30 text-white text-[9px] font-bold uppercase px-1.5 py-0.2 rounded">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pt-3 border-t border-white/15 mt-3 grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-white text-[#002B49]"
                      : "text-zinc-200 hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Content Area — Full Width Top-Down Layout */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Web Footer Removed as Requested */}
    </div>
  );
}
