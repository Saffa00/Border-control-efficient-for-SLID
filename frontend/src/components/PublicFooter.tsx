import { Link } from "react-router-dom";
import { SierraLeoneFlag } from "./SierraLeoneFlag";

export function PublicFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#05080F]/98 backdrop-blur-xl text-xs text-zinc-400 font-['Tahoma',sans-serif]">
      {/* 1. National Tri-Color Accent Ribbon */}
      <div className="h-1.5 w-full grid grid-cols-3 shadow-md">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      {/* 2. Top Horizontal Navbar Alignment Sub-Strip */}
      <div className="border-b border-white/10 bg-[#080E1A]/90 px-6 sm:px-10 lg:px-12 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <SierraLeoneFlag width={18} height={12} />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              SLID Institutional Portal
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-emerald-400 hidden sm:inline text-[11px]">
              Official Government Directory
            </span>
          </div>

          {/* Clean Horizontal Navbar Links */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold">
            <Link to="/" className="text-zinc-300 hover:text-emerald-400 transition">
              Home
            </Link>
            <span className="text-zinc-700">•</span>
            <Link to="/about" className="text-zinc-300 hover:text-emerald-400 transition">
              About
            </Link>
            <span className="text-zinc-700">•</span>
            <Link to="/services" className="text-zinc-300 hover:text-emerald-400 transition">
              Services
            </Link>
            <span className="text-zinc-700">•</span>
            <Link to="/borders" className="text-zinc-300 hover:text-emerald-400 transition">
              Borders &amp; Checkpoints
            </Link>
            <span className="text-zinc-700">•</span>
            <Link to="/contact" className="text-zinc-300 hover:text-emerald-400 transition">
              Contact
            </Link>
            <span className="text-zinc-700">•</span>
            <Link to="/staff/login" className="text-amber-400 hover:text-amber-300 transition">
              Staff Portal &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Main 4-Column Structured Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left mb-10">
          {/* Column 1: Institutional Authority & Crest */}
          <div className="space-y-3.5">
            <Link to="/" className="flex items-center gap-3.5 group">
              <img
                src="/slid-logo.png"
                alt="Sierra Leone Immigration Department Crest"
                className="w-14 h-14 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mb-1">
                  Republic of Sierra Leone
                </p>
                <p className="font-bold text-white text-base leading-tight">
                  Department of Immigration
                </p>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                  SLID Executive Gateway
                </p>
              </div>
            </Link>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Statutory authority charged with national border security, ICAO Doc 9303 biometric passport registries, e-Visa adjudications, and territorial sovereignty surveillance.
            </p>

            <div className="pt-1 flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All 5 National Checkpoints Synchronized</span>
            </div>
          </div>

          {/* Column 2: Public Institutional Navigation (Aligned with Navbar) */}
          <div className="space-y-3">
            <p className="font-bold text-white text-xs uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
              <span className="text-emerald-400">🏛️</span>
              <span>Public Navigation</span>
            </p>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link to="/" className="text-zinc-300 hover:text-emerald-400 transition flex items-center gap-2">
                  <span className="text-xs">🏠</span>
                  <span>Home Gateway</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-zinc-300 hover:text-emerald-400 transition flex items-center gap-2">
                  <span className="text-xs">🏛️</span>
                  <span>About the Department</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-zinc-300 hover:text-emerald-400 transition flex items-center gap-2">
                  <span className="text-xs">📑</span>
                  <span>Statutory Public Services</span>
                </Link>
              </li>
              <li>
                <Link to="/borders" className="text-zinc-300 hover:text-emerald-400 transition flex items-center gap-2">
                  <span className="text-xs">🗺️</span>
                  <span>Borders &amp; 5 Checkpoints</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-zinc-300 hover:text-emerald-400 transition flex items-center gap-2">
                  <span className="text-xs">✉️</span>
                  <span>Contact Headquarters</span>
                </Link>
              </li>
              <li>
                <Link to="/applicant" className="text-sky-400 hover:text-sky-300 transition flex items-center gap-2 font-semibold">
                  <span className="text-xs">✈️</span>
                  <span>Apply for e-Visa Online</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Designated Points of Entry (5 Stations) */}
          <div className="space-y-3">
            <p className="font-bold text-white text-xs uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
              <span className="text-sky-400">🛡️</span>
              <span>5 Border Checkpoints</span>
            </p>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link to="/borders" className="text-zinc-300 hover:text-emerald-400 transition flex items-start gap-2">
                  <span className="text-xs">✈️</span>
                  <div>
                    <span className="font-semibold text-white">FNA Lungi International Airport</span>
                    <p className="text-[10px] text-zinc-500">Port Loko Coastal Peninsula</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/borders" className="text-zinc-300 hover:text-emerald-400 transition flex items-start gap-2">
                  <span className="text-xs">🚢</span>
                  <div>
                    <span className="font-semibold text-white">Queen Elizabeth II Quay Port</span>
                    <p className="text-[10px] text-zinc-500">Cline Town, Freetown Harbor</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/borders" className="text-zinc-300 hover:text-emerald-400 transition flex items-start gap-2">
                  <span className="text-xs">🛂</span>
                  <div>
                    <span className="font-semibold text-white">Gbalamuya Land Post</span>
                    <p className="text-[10px] text-zinc-500">Kambia District / Guinea Border</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/borders" className="text-zinc-300 hover:text-emerald-400 transition flex items-start gap-2">
                  <span className="text-xs">🛂</span>
                  <div>
                    <span className="font-semibold text-white">Jendema Border Crossing</span>
                    <p className="text-[10px] text-zinc-500">Pujehun / Liberia Border</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/borders" className="text-zinc-300 hover:text-emerald-400 transition flex items-start gap-2">
                  <span className="text-xs">🛂</span>
                  <div>
                    <span className="font-semibold text-white">Koindu Tri-Border Post</span>
                    <p className="text-[10px] text-zinc-500">Kailahun: SL - Guinea - Liberia</p>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Sovereign Role Portals & National Desks */}
          <div className="space-y-3">
            <p className="font-bold text-white text-xs uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
              <span className="text-purple-400">🏛️</span>
              <span>Sovereign Role Portals</span>
            </p>
            <ul className="space-y-1.5 text-[11px] mb-4">
              <li>
                <Link to="/applicant" className="hover:text-[#38BDF8] transition flex items-center gap-1.5">
                  <span>✈️</span>
                  <span>Traveler &amp; Applicant Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/visa/portal" className="hover:text-[#F59E0B] transition flex items-center gap-1.5">
                  <span>🛂</span>
                  <span>Consular &amp; Visa Directorate</span>
                </Link>
              </li>
              <li>
                <Link to="/border/portal" className="hover:text-[#4ADE80] transition flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>Border Operations Command</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/portal" className="hover:text-[#A78BFA] transition flex items-center gap-1.5">
                  <span>🏛️</span>
                  <span>Executive Directorate HQ</span>
                </Link>
              </li>
            </ul>

            <div className="bg-[#080D18] p-3 rounded-2xl border border-white/5 text-[10px] text-zinc-400 space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-white font-semibold flex items-center gap-1">
                  <span>📱</span>
                  <span>SLID Mobile App</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded text-[9px]">
                  PWA Ready
                </span>
              </div>
              <p className="text-zinc-400">Install directly from your browser with instant offline support.</p>
              <p className="text-white font-semibold pt-1">National Headquarters:</p>
              <p>📍 Gloucester Street, Freetown, SL</p>
              <p>📞 Desk: <span className="text-white font-mono">+232 22 222 411</span></p>
              <p>✉️ Email: <span className="text-emerald-400 font-mono">contact@slid.gov.sl</span></p>
              <p className="text-rose-400 font-bold pt-1 border-t border-white/5">
                🚨 24/7 Hotline: 999
              </p>
            </div>
          </div>
        </div>

        {/* 4. Bottom Legal & National Motto Ribbon */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px]">
            <SierraLeoneFlag width={20} height={13} />
            <span>
              &copy; {new Date().getFullYear()} Republic of Sierra Leone Department of Immigration (SLID). All Rights Reserved.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="text-[#1E8E5A]">Unity</span>
            <span className="text-zinc-600">•</span>
            <span className="text-white">Freedom</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#38BDF8]">Justice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
