import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { SierraLeoneFlag, SierraLeoneLargeFlag } from "../../components/SierraLeoneFlag";
import { PublicFooter } from "../../components/PublicFooter";

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bordersDropdownOpen, setBordersDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBordersDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0F172A] font-['Tahoma',sans-serif] flex flex-col justify-between selection:bg-[#1E8E5A] selection:text-white relative overflow-x-hidden">
      {/* Background Subtle Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5 scale-105"
          style={{ backgroundImage: "url('/passport-bg.png')" }}
        />
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-[#1E8E5A]/5 rounded-full blur-[150px]" />
        <div className="absolute top-[35%] right-[10%] w-[650px] h-[650px] bg-[#0B4F6C]/5 rounded-full blur-[170px]" />
      </div>

      {/* Top National Ribbon & Ticker */}
      <div className="relative z-50">
        <div className="h-1.5 w-full grid grid-cols-3 shadow-xs">
          <div className="bg-[#1E8E5A]"></div>
          <div className="bg-white"></div>
          <div className="bg-[#0B4F6C]"></div>
        </div>

        {/* Top Ticker */}
        <div className="bg-white/95 border-b border-zinc-200/90 px-4 py-1.5 text-[11px] text-zinc-600 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SierraLeoneFlag width={18} height={12} />
              <span className="font-bold text-[#1E8E5A] uppercase tracking-wider">
                Republic of Sierra Leone
              </span>
              <span className="text-zinc-400 hidden sm:inline">•</span>
              <span className="text-zinc-600 hidden sm:inline">
                Department of Immigration (SLID) • Institutional Mandate
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-zinc-500">
              <span className="text-[#166E46] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1E8E5A] animate-pulse"></span>
                <span>Statutory Authority Online</span>
              </span>
              <span className="hidden md:inline text-zinc-300">|</span>
              <span className="hidden md:inline text-zinc-600 font-medium">Gloucester Street HQ, Freetown</span>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="border-b border-zinc-200/90 bg-white/95 backdrop-blur-md sticky top-0 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3.5 group flex-shrink-0">
              <img
                src="/slid-logo.png"
                alt="SLID Crest"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] font-bold text-[#1E8E5A] uppercase tracking-widest leading-none mb-1">
                  Republic of Sierra Leone
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight leading-tight group-hover:text-[#1E8E5A] transition">
                  Department of Immigration
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  Sierra Leone Immigration Department (SLID)
                </span>
              </div>
            </Link>

            {/* Mobile Top Quick Action */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                to="/applicant"
                className="bg-[#0B4F6C] active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
              >
                Traveler Portal
              </Link>
            </div>

            {/* Nav Items */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link
                to="/"
                className="text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] px-3.5 py-2 rounded-lg hover:bg-zinc-100 transition"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-xs font-semibold text-[#1E8E5A] bg-[#1E8E5A]/10 border border-[#1E8E5A]/25 px-3.5 py-2 rounded-lg transition"
              >
                About
              </Link>
              <Link
                to="/services"
                className="text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] px-3.5 py-2 rounded-lg hover:bg-zinc-100 transition"
              >
                Services
              </Link>

              {/* Borders Link */}
              <Link
                to="/borders"
                className="text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] px-3.5 py-2 rounded-lg hover:bg-zinc-100 transition"
              >
                Borders &amp; Checkpoints
              </Link>

              <Link
                to="/contact"
                className="text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] px-3.5 py-2 rounded-lg hover:bg-zinc-100 transition"
              >
                Contact
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 space-y-12">
        {/* Header Hero */}
        <section className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <SierraLeoneLargeFlag width={120} height={80} className="rounded-lg shadow-lg" />
          </div>
          <div className="inline-flex items-center gap-2 bg-[#1E8E5A]/10 border border-[#1E8E5A]/25 text-[#1E8E5A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <SierraLeoneFlag width={18} height={12} />
            <span>Official Institutional Profile</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] mb-4">
            About the Sierra Leone Immigration Department
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mx-auto leading-relaxed">
            The sovereign statutory body charged with securing Sierra Leone&apos;s borders, regulating immigration, administering biometric travel documents, and defending national integrity.
          </p>
        </section>

        {/* Institutional Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-[#1E8E5A] mb-2">Our Mission</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              To deliver efficient, transparent, and biometric-driven immigration services that facilitate legitimate global travel, promote national economic growth, and fiercely protect the sovereignty and territorial integrity of the Republic of Sierra Leone.
            </p>
          </div>

          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-3">👁️</div>
            <h3 className="text-lg font-bold text-[#0284C7] mb-2">Our Vision</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              To stand as an elite, internationally respected, and technologically advanced immigration authority in Africa, renowned for integrity, sub-second biometric border clearance, and seamless consular services.
            </p>
          </div>

          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-3">⚖️</div>
            <h3 className="text-lg font-bold text-[#D97706] mb-2">Core Values</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Uncompromising Integrity, Sovereign Security, Professionalism, Strict Compliance with Statutory Regulations, Technological Innovation, and Equal Justice under the Laws of Sierra Leone.
            </p>
          </div>
        </section>

        {/* History & Statutory Mandate */}
        <section className="bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
            Historical Evolution &amp; Statutory Authority
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            <p>
              The Sierra Leone Immigration Department traces its institutional roots to the pre-independence colonial customs and police border surveillance units. Following national independence on April 27, 1961, the Department was established as an autonomous government agency under the executive oversight of the Ministry of Internal Affairs and the National Security Council.
            </p>
            <p>
              Under the statutory provisions of the <strong>Sierra Leone Immigration Act</strong> and accompanying border control regulations, the Department is vested with sole legal authority to issue passports, grant entry and exit clearance, adjudicate visas, monitor expatriate employment, and maintain national surveillance across all international boundaries.
            </p>
            <p>
              In 2026, SLID completed its digital modernization initiative, transitioning from legacy paper logs to a unified, biometric-enabled e-Visa and Optical Camera Border Management System, providing sub-second traveler verification, instant watchlist cross-matching, and cryptographic audit security.
            </p>
          </div>

          {/* Directorate Organization Grid */}
          <div className="pt-6 border-t border-zinc-200">
            <h3 className="text-lg font-bold text-[#0F172A] mb-4">Departmental Directorates &amp; Divisions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-zinc-200/80">
                <p className="font-bold text-[#D97706] mb-1">🛂 Consular &amp; Visa Division</p>
                <p className="text-zinc-600">Electronic visa adjudication, diplomatic clearances, and consular liaison.</p>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-zinc-200/80">
                <p className="font-bold text-[#1E8E5A] mb-1">🛡️ Border Operations Command</p>
                <p className="text-zinc-600">Frontline air, sea, and land checkpoint clearance, and surveillance patrols.</p>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-zinc-200/80">
                <p className="font-bold text-rose-700 mb-1">🚨 Intelligence &amp; Investigation</p>
                <p className="text-zinc-600">Watchlist enforcement, anti-trafficking operations, and INTERPOL liaison.</p>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-zinc-200/80">
                <p className="font-bold text-[#7C3AED] mb-1">🏛️ National Central Registry (ICT)</p>
                <p className="text-zinc-600">Sovereign database administration, RBAC security, and cryptographic audits.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Official Rich Public Footer */}
      <PublicFooter />
    </div>
  );
}
