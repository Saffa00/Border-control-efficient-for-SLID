import { Link } from "react-router-dom";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { SierraLeoneFlag, SierraLeoneLargeFlag } from "../../components/SierraLeoneFlag";

export default function VisaOfficerLandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-['Tahoma',sans-serif] flex flex-col justify-between">
      {/* 1. National Tri-Color Accent Strip */}
      <div className="h-1.5 w-full grid grid-cols-3">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      {/* 2. Official Consular Header */}
      <header className="border-b border-amber-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3.5 group">
            <Link to="/">
              <img
                src="/slid-logo.png"
                alt="Sierra Leone Immigration Department Emblem"
                className="w-13 h-13 sm:w-14 sm:h-14 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <SierraLeoneFlag width={18} height={12} />
                <span className="text-[10px] font-bold text-[#1E8E5A] uppercase tracking-widest leading-none">
                  Republic of Sierra Leone
                </span>
                <span className="text-[9px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  Consular Directorate
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-ink leading-tight">
                Visa Adjudication &amp; Consular Affairs
              </span>
              <span className="text-[10px] text-ink-soft -mt-0.5">
                Department of Immigration (SLID)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/staff/login"
              className="bg-[#0B4F6C] hover:bg-[#083a50] active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <span>🛂</span>
              <span>Officer Sign In</span>
            </Link>
            <Link
              to="/staff/signup"
              className="border border-[#0B4F6C] text-[#0B4F6C] hover:bg-sky-50 text-xs font-bold px-3 py-2 rounded-xl transition shadow-2xs"
            >
              Staff Request
            </Link>
          </div>
        </div>

        {/* Sub-Header Navigation Strip with Back Button beneath */}
        <div className="bg-canvas border-t border-amber-200/80 px-4 sm:px-8 py-2 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft hover:text-[#0B4F6C] transition bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Back to Gateway</span>
          </Link>
          <span className="text-[11px] text-ink-soft font-medium hidden sm:inline">
            Consular Affairs &amp; Electronic Visa Adjudication
          </span>
        </div>
      </header>

      {/* 3. Main Consular Hero & Operational Overview */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 space-y-12">
        {/* 1. Mobile App Style Consular Onboarding Screen with Background Image */}
        <section className="relative rounded-3xl overflow-hidden border border-[#D97706]/30 shadow-2xl bg-[#0D1E2D] text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 filter brightness-110"
              style={{ backgroundImage: "url('/passport-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0D1E2D]/95 via-[#1A2E3B]/90 to-[#2A2311]/85" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D97706]/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SierraLeoneFlag width={20} height={14} />
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Consular Directorate • Visa Adjudication Queue
                </span>
              </div>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                🛂 Officer Authorization Required
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Consular &amp; Visa Adjudication Directorate
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Statutory consular console for reviewing application dossiers, cross-checking ICAO 9303 bio-data against security watchlists, adjudicating permits, and generating cryptographic QR entry certificates.
                </p>

                {/* 3-Step Officer Workflow Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">1️⃣ 📋</span>
                    <h4 className="text-xs font-bold text-white">Docket Ingestion</h4>
                    <p className="text-[10px] text-slate-300">Auto-allocated visa queues</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">2️⃣ 🔍</span>
                    <h4 className="text-xs font-bold text-white">Security Vetting</h4>
                    <p className="text-[10px] text-slate-300">Interpol &amp; Watchlist check</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">3️⃣ 🔏</span>
                    <h4 className="text-xs font-bold text-white">Approval &amp; QR Seal</h4>
                    <p className="text-[10px] text-slate-300">Cryptographic certificate issue</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    to="/staff/login"
                    className="bg-[#D97706] hover:bg-[#B45309] active:scale-95 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-xl transition shadow-lg flex items-center gap-2"
                  >
                    <span>Access Adjudication Queue</span>
                    <span>&rarr;</span>
                  </Link>
                  <Link
                    to="/staff/signup"
                    className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition border border-white/20"
                  >
                    Staff Onboarding &amp; Credentials
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
                  <img src="/slid-logo.png" alt="SLID Seal" className="w-20 h-20 mx-auto object-contain mb-3 drop-shadow-md" />
                  <h3 className="text-sm font-bold text-white">Consular Command</h3>
                  <p className="text-[11px] text-slate-300 mt-1 mb-4">
                    Directorate of Consular Affairs &amp; Passports
                  </p>
                  <div className="bg-[#05111B] p-3 rounded-2xl border border-white/10 text-left text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Queue SLA:</span>
                      <span className="text-emerald-400 font-bold">24-48 Hours</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Adjudication:</span>
                      <span className="text-amber-400 font-bold">Two-Tier RBAC</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Audit Trail:</span>
                      <span className="text-sky-400 font-bold">Immutable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Pillars Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Electronic Queue Management */}
          <SecurityPaperPanel className="p-6 border border-primary-light/80" showRosette>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mb-4">
              📑
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">
              Queue Adjudication Pipeline
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              Real-time docket processing with automated risk tiering, document validation, and one-click sovereign approval with cryptographic stamping.
            </p>
            <ul className="text-xs space-y-1.5 text-ink-soft">
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-amber-600 font-bold">✓</span> Tourist, Business &amp; Transit Visas
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-amber-600 font-bold">✓</span> Diplomatic &amp; Official Courtesy Clearances
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-amber-600 font-bold">✓</span> Instant Resend Email Decision Notices
              </li>
            </ul>
          </SecurityPaperPanel>

          {/* Pillar 2: ICAO 9303 Document Inspection */}
          <SecurityPaperPanel className="p-6 border border-primary-light/80" showRosette>
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-2xl mb-4">
              🔍
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">
              Biometric &amp; ICAO Vetting
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              High-resolution passport bio-data page inspection, MRZ checksum calculations, facial photo ratio analysis, and yellow fever compliance.
            </p>
            <ul className="text-xs space-y-1.5 text-ink-soft">
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-sky-600 font-bold">✓</span> Automated MRZ &amp; ICAO Doc 9303 Verification
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-sky-600 font-bold">✓</span> Hotel Booking &amp; Flight Itinerary Check
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-sky-600 font-bold">✓</span> Integrated National Security Watchlist Check
              </li>
            </ul>
          </SecurityPaperPanel>

          {/* Pillar 3: Secure Digital eVisa Generation */}
          <SecurityPaperPanel className="p-6 border border-primary-light/80" showRosette>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mb-4">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">
              Cryptographic QR Certificate
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              Issuance of tamper-proof, high-security digital visa certificates with sovereign seals, watermark guilloches, and border-scannable QR payloads.
            </p>
            <ul className="text-xs space-y-1.5 text-ink-soft">
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-emerald-600 font-bold">✓</span> SHA-256 Digitally Signed Payloads
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-emerald-600 font-bold">✓</span> A4 PDF Certificate with Official Stamp
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-emerald-600 font-bold">✓</span> Immediate Port-of-Entry Sync
              </li>
            </ul>
          </SecurityPaperPanel>
        </section>

        {/* Standard Operating Procedure (SOP) Notice */}
        <section className="bg-white border-2 border-[#0B4F6C]/20 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B4F6C] uppercase tracking-wider">
                <span>📋 Directive SLID-VISA-2026</span>
              </div>
              <h4 className="text-xl font-bold text-ink">
                Official Consular Adjudication Guidelines
              </h4>
              <p className="text-xs text-ink-soft max-w-2xl leading-relaxed">
                All Visa Adjudication Officers are required to verify passport validity (minimum 6 months from entry date), cross-examine invitation letters, and conduct mandatory watchlist screening before granting entry approvals.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/staff/login"
                className="inline-flex items-center gap-2 bg-[#0B4F6C] hover:bg-[#083a50] text-white px-6 py-3 rounded-lg text-xs font-semibold transition shadow-sm"
              >
                <span>Launch Officer Console</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Official Footer - Hidden on mobile, shown on web */}
      <footer className="hidden sm:block border-t border-primary-light/80 bg-white px-8 py-6 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <SierraLeoneFlag width={20} height={14} />
            <span>
              &copy; {new Date().getFullYear()} Republic of Sierra Leone Department of Immigration (SLID). Consular &amp; Visa Directorate.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="hover:text-primary font-medium">Gateway</Link>
            <Link to="/applicant" className="hover:text-primary font-medium">Applicant Portal</Link>
            <Link to="/border/portal" className="hover:text-primary font-medium">Border Control</Link>
            <Link to="/admin/portal" className="hover:text-primary font-medium">Directorate HQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
