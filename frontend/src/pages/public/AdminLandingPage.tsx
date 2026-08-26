import { Link } from "react-router-dom";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { SierraLeoneFlag, SierraLeoneLargeFlag } from "../../components/SierraLeoneFlag";

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-['Tahoma',sans-serif] flex flex-col justify-between">
      {/* 1. National Tri-Color Strip */}
      <div className="h-1.5 w-full grid grid-cols-3">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      {/* 2. Official Executive Directorate Header */}
      <header className="border-b border-purple-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3.5 group">
            <Link to="/" className="flex-shrink-0">
              <img
                src="/slid-logo.png"
                alt="Sierra Leone Immigration Department Emblem"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5">
                <SierraLeoneFlag width={18} height={12} />
                <span className="text-[10px] font-bold text-[#1E8E5A] uppercase tracking-widest leading-none">
                  Republic of Sierra Leone
                </span>
                <span className="text-[9px] uppercase font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full">
                  Directorate Headquarters
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-ink leading-tight">
                National Central Registry &amp; Administration
              </span>
              <span className="text-[10px] text-ink-soft -mt-0.5">
                Department of Immigration (SLID)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/staff/login"
              className="bg-[#4C1D95] hover:bg-[#3B0764] active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <span>🏛️</span>
              <span>Admin Sign In</span>
            </Link>
            <Link
              to="/staff/signup"
              className="border border-[#4C1D95] text-[#4C1D95] hover:bg-purple-50 text-xs font-bold px-3 py-2 rounded-xl transition shadow-2xs"
            >
              Staff Request
            </Link>
          </div>
        </div>

        {/* Sub-Header Navigation Strip with Back Button beneath */}
        <div className="bg-canvas border-t border-purple-200/80 px-4 sm:px-8 py-2 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft hover:text-[#4C1D95] transition bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-2xs active:scale-95"
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
            Executive Directorate Administration &amp; Audits
          </span>
        </div>
      </header>

      {/* 3. Main Directorate Admin Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 space-y-12">
        {/* 1. Mobile App Style Executive Admin Onboarding Screen with Background Image */}
        <section className="relative rounded-3xl overflow-hidden border border-[#7C3AED]/30 shadow-2xl bg-[#130924] text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 filter brightness-110"
              style={{ backgroundImage: "url('/passport-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#130924]/95 via-[#23103D]/90 to-[#0B4F6C]/85" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SierraLeoneFlag width={20} height={14} />
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                  Executive Directorate HQ • National Central Registry
                </span>
              </div>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                🏛️ Top-Secret Clearance Required
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Directorate Headquarters &amp; Central Registry
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Centralized command console for user administration, officer provisioning, station assignments, immutable security audit logging, and national A4 PDF intelligence reporting.
                </p>

                {/* 3-Step Admin Workflow Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">1️⃣ 👥</span>
                    <h4 className="text-xs font-bold text-white">RBAC Provisioning</h4>
                    <p className="text-[10px] text-slate-300">Staff approvals &amp; roles</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">2️⃣ 🗺️</span>
                    <h4 className="text-xs font-bold text-white">5 Checkpoints</h4>
                    <p className="text-[10px] text-slate-300">Air, sea &amp; land stations</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">3️⃣ 📑</span>
                    <h4 className="text-xs font-bold text-white">Executive Reports</h4>
                    <p className="text-[10px] text-slate-300">A4 PDF &amp; Security audits</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    to="/staff/login"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-xl transition shadow-lg flex items-center gap-2"
                  >
                    <span>Access Directorate Console</span>
                    <span>&rarr;</span>
                  </Link>
                  <Link
                    to="/staff/request-access"
                    className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition border border-white/20"
                  >
                    Clearance &amp; Station Review
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
                  <img src="/slid-logo.png" alt="SLID Seal" className="w-20 h-20 mx-auto object-contain mb-3 drop-shadow-md" />
                  <h3 className="text-sm font-bold text-white">Executive Directorate</h3>
                  <p className="text-[11px] text-slate-300 mt-1 mb-4">
                    Gloucester Street Headquarters, Freetown
                  </p>
                  <div className="bg-[#0D0519] p-3 rounded-2xl border border-white/10 text-left text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Audit Trail:</span>
                      <span className="text-emerald-400 font-bold">100% Signed</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Export Format:</span>
                      <span className="text-sky-400 font-bold">Standard A4 PDF</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Auth Method:</span>
                      <span className="text-purple-300 font-bold">Supabase JWT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Administration Core Modules Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: User Management & RBAC */}
          <SecurityPaperPanel className="p-6 border border-primary-light/80" showRosette>
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-2xl mb-4">
              👥
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">
              RBAC &amp; Officer Management
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              Granular access control, automatic credential dispatch via official email, station assignments, and badge verification for all officers.
            </p>
            <ul className="text-xs space-y-1.5 text-ink-soft">
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-purple-600 font-bold">✓</span> Direct Credentials Email Dispatch
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-purple-600 font-bold">✓</span> Station Transfer &amp; Checkpoint Mapping
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-purple-600 font-bold">✓</span> Real-Time Account Suspension Controls
              </li>
            </ul>
          </SecurityPaperPanel>

          {/* Module 2: Immutable Audit & Security Logs */}
          <SecurityPaperPanel className="p-6 border border-primary-light/80" showRosette>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl mb-4">
              🔒
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">
              Cryptographic Audit Trail
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              Immutable forensic logging of every adjudication, border stamping, status change, and payment transaction across Sierra Leone.
            </p>
            <ul className="text-xs space-y-1.5 text-ink-soft">
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-blue-600 font-bold">✓</span> Tamper-Evident Database Records
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-blue-600 font-bold">✓</span> Officer Action &amp; IP Geolocation Logs
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-blue-600 font-bold">✓</span> Statutory Compliance Export
              </li>
            </ul>
          </SecurityPaperPanel>

          {/* Module 3: Sovereign A4 PDF Reporting */}
          <SecurityPaperPanel className="p-6 border border-primary-light/80" showRosette>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">
              Sovereign A4 Intelligence Suite
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              Executive-level centered A4 PDF reports featuring national crests, official security watermarks, border traffic analytics, and revenue summaries.
            </p>
            <ul className="text-xs space-y-1.5 text-ink-soft">
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-amber-600 font-bold">✓</span> Official Centered Header &amp; Crest
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-amber-600 font-bold">✓</span> Border Movement Cross-Tabulation
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-amber-600 font-bold">✓</span> Financial Reconciliation Logs
              </li>
            </ul>
          </SecurityPaperPanel>
        </section>

        {/* National Data Sovereignty Guarantee */}
        <section className="bg-gradient-to-r from-[#1E1E24] to-[#27272A] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-zinc-700/60">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                <span>Government Data Center • Freetown</span>
              </div>
              <h4 className="text-xl font-bold text-white">
                Sovereign National Border Data Security
              </h4>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                All biometric passport registries, visa adjudications, and traveler movement logs are hosted under strict sovereign data security standards with TLS 1.3 encryption and row-level access policies.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/staff/login"
                className="inline-flex items-center gap-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white px-6 py-3 rounded-lg text-xs font-semibold transition shadow-md"
              >
                <span>Access Admin HQ</span>
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
              &copy; {new Date().getFullYear()} Republic of Sierra Leone Department of Immigration (SLID). National Headquarters.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="hover:text-primary font-medium">Gateway</Link>
            <Link to="/applicant" className="hover:text-primary font-medium">Applicant Portal</Link>
            <Link to="/visa/portal" className="hover:text-primary font-medium">Visa Directorate</Link>
            <Link to="/border/portal" className="hover:text-primary font-medium">Border Command</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
