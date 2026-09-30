import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SierraLeoneFlag } from "./SierraLeoneFlag";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Lock, Globe, Phone, HelpCircle, LogOut } from "lucide-react";

interface GovHeaderProps {
  portalTitle: string;
  portalSubtitle?: string;
  breadcrumbs?: { name: string; path?: string }[];
}

export function GovHeader({ portalTitle, portalSubtitle, breadcrumbs }: GovHeaderProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [language, setLanguage] = useState<"en" | "krio">("en");
  const [bannerOpen, setBannerOpen] = useState(true);

  const userName = profile?.full_name || "Official User";
  const userRoleLabel =
    profile?.role === "admin"
      ? "Executive Administrator"
      : profile?.role === "visa_officer"
      ? "Visa Adjudication Officer"
      : profile?.role === "immigration_officer"
      ? "Border Control Officer"
      : "Verified Applicant";

  return (
    <header className="bg-white text-slate-900 border-b border-slate-300 font-['Tahoma',sans-serif]">
      {/* 0. Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#0B4F6C] focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* 1. Official Government Banner (GOV.UK / USWDS Standard) */}
      <div className="bg-slate-100 border-b border-slate-200 text-slate-700 text-xs px-4 sm:px-8 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SierraLeoneFlag width={16} height={10} />
            <span className="font-semibold text-slate-800">
              An official website of the Republic of Sierra Leone Government
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-600">
              <Lock size={12} className="text-emerald-700" />
              <span>Secure HTTPS Encrypted (.gov.sl)</span>
            </span>
          </div>

          <div className="flex items-center gap-3 font-medium text-[11px]">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1.5 py-0.5">
              <Globe size={12} className="text-slate-500" />
              <button
                onClick={() => setLanguage("en")}
                className={`px-1 rounded ${
                  language === "en" ? "font-bold text-[#0B4F6C] bg-sky-50" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                English
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setLanguage("krio")}
                className={`px-1 rounded ${
                  language === "krio" ? "font-bold text-[#0B4F6C] bg-sky-50" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Krio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Executive Department Header Bar */}
      <div className="bg-[#0B4F6C] text-white px-4 sm:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Crest & Department Title */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/slid-logo.png"
              alt="Republic of Sierra Leone Arms"
              className="w-12 h-12 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest leading-none mb-0.5">
                Republic of Sierra Leone
              </p>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                Department of Immigration (SLID)
              </h1>
              <p className="text-xs text-sky-200 font-medium">
                {portalTitle} {portalSubtitle && `— ${portalSubtitle}`}
              </p>
            </div>
          </Link>

          {/* Right: Authenticated User Actions & Sign Out */}
          <div className="flex items-center gap-4 text-xs">
            {profile && (
              <div className="hidden md:block text-right">
                <p className="font-bold text-white">{userName}</p>
                <p className="text-[11px] text-sky-200">{userRoleLabel}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Link
                to="/contact"
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-medium transition inline-flex items-center gap-1 border border-white/20"
              >
                <HelpCircle size={14} />
                <span>Help</span>
              </Link>

              {profile && (
                <button
                  onClick={() => signOut()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official National Tri-Color Accent Line (GOV Signature Bar) */}
      <div className="h-2.5 w-full grid grid-cols-3 shadow-xs">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white border-y border-slate-300"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      {/* 4. Text Breadcrumb Trail */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="bg-slate-50 border-b border-slate-200 px-4 sm:px-8 py-2 text-xs text-slate-600">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Link to="/" className="hover:text-[#0B4F6C] hover:underline font-medium">
              Home
            </Link>
            {breadcrumbs.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-400">&gt;</span>
                {b.path ? (
                  <Link to={b.path} className="hover:text-[#0B4F6C] hover:underline font-medium">
                    {b.name}
                  </Link>
                ) : (
                  <span className="font-bold text-slate-900" aria-current="page">
                    {b.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export function GovFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs font-['Tahoma',sans-serif] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          <div>
            <p className="font-bold text-white text-sm mb-2">Government Standards &amp; Support</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Official electronic gateway operated by the Sierra Leone Directorate of Immigration under the Ministry of Internal Affairs.
            </p>
          </div>

          <div>
            <p className="font-bold text-white text-sm mb-2">Consular Assistance &amp; Enquiries</p>
            <p className="text-slate-400 text-xs">
              National Headquarters: Gloucester Street, Freetown<br />
              Telephone: <span className="font-mono text-white font-bold">+232 22 222 411</span><br />
              Operating Hours: Monday – Friday, 08:00 – 17:00 GMT
            </p>
          </div>

          <div>
            <p className="font-bold text-white text-sm mb-2">Help &amp; Official Guidance</p>
            <ul className="space-y-1 text-xs">
              <li>
                <Link to="/contact" className="hover:text-emerald-400 underline">
                  Contact Directorate Desk
                </Link>
              </li>
              <li>
                <Link to="/borders" className="hover:text-emerald-400 underline">
                  5 Designated Checkpoint Status
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 underline">
                  Statutory Mandate &amp; Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <a href="#privacy" className="hover:text-white underline">
              Privacy Notice
            </a>
            <span>•</span>
            <a href="#accessibility" className="hover:text-white underline">
              Accessibility Statement (WCAG 2.1 AA)
            </a>
            <span>•</span>
            <a href="#terms" className="hover:text-white underline">
              Terms of Official Service
            </a>
            <span>•</span>
            <a href="#cookies" className="hover:text-white underline">
              Cookie Preferences
            </a>
          </div>

          <div>
            <span>Page Last Updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <SierraLeoneFlag width={16} height={10} />
          <span>&copy; {new Date().getFullYear()} Government of Sierra Leone • Department of Immigration (SLID)</span>
        </div>
      </div>
    </footer>
  );
}
