import { Link } from "react-router-dom";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { SierraLeoneFlag, SierraLeoneLargeFlag } from "../../components/SierraLeoneFlag";

export default function BorderOfficerLandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-['Tahoma',sans-serif] flex flex-col justify-between">
      {/* 1. National Tri-Color Strip */}
      <div className="h-1.5 w-full grid grid-cols-3">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      {/* 2. Official Border Command Header */}
      <header className="border-b border-emerald-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
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
                <span className="text-[9px] uppercase font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Border Operations Command
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-ink leading-tight">
                Immigration &amp; Border Control Command
              </span>
              <span className="text-[10px] text-ink-soft -mt-0.5">
                Department of Immigration (SLID)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/staff/login"
              className="bg-[#1E8E5A] hover:bg-[#166e46] active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <span>🛡️</span>
              <span>Terminal Sign In</span>
            </Link>
            <Link
              to="/staff/signup"
              className="border border-[#1E8E5A] text-[#1E8E5A] hover:bg-emerald-50 text-xs font-bold px-3 py-2 rounded-xl transition shadow-2xs"
            >
              Station Request
            </Link>
          </div>
        </div>

        {/* Sub-Header Navigation Strip with Back Button beneath */}
        <div className="bg-canvas border-t border-emerald-200/80 px-4 sm:px-8 py-2 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft hover:text-[#1E8E5A] transition bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs active:scale-95"
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
            National Frontier Posts &amp; Biometric Surveillance
          </span>
        </div>
      </header>

      {/* 3. Main Border Command Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 space-y-12">
        {/* 1. Mobile App Style Border Tactical Onboarding Screen with Background Image */}
        <section className="relative rounded-3xl overflow-hidden border border-[#1E8E5A]/30 shadow-2xl bg-[#061A14] text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 filter brightness-110"
              style={{ backgroundImage: "url('/passport-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#061A14]/95 via-[#0C2D22]/90 to-[#0B4F6C]/85" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#1E8E5A]/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SierraLeoneFlag width={20} height={14} />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Border Operations Command • Frontline Clearance Desk
                </span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                🛡️ Active Checkpoint Terminal
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Border Control &amp; Port Operations Command
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Frontline intelligence system for biometric passport scanning, live camera QR verification, risk scoring, Interpol red notice watchlist checks, and entry/exit clearance logging.
                </p>

                {/* 3-Step Officer Workflow Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">1️⃣ 📷</span>
                    <h4 className="text-xs font-bold text-white">Camera QR Scanner</h4>
                    <p className="text-[10px] text-slate-300">Instant digital permit scan</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">2️⃣ 🚨</span>
                    <h4 className="text-xs font-bold text-white">Risk Scoring &amp; Alert</h4>
                    <p className="text-[10px] text-slate-300">0-100 score + Watchlist</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">3️⃣ 🛂</span>
                    <h4 className="text-xs font-bold text-white">Entry/Exit Stamp</h4>
                    <p className="text-[10px] text-slate-300">Cryptographic border log</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    to="/staff/login"
                    className="bg-[#1E8E5A] hover:bg-[#166e46] active:scale-95 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-xl transition shadow-lg flex items-center gap-2"
                  >
                    <span>Launch Border Terminal</span>
                    <span>&rarr;</span>
                  </Link>
                  <Link
                    to="/staff/signup"
                    className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition border border-white/20"
                  >
                    Station Request &amp; Access
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
                  <img src="/slid-logo.png" alt="SLID Seal" className="w-20 h-20 mx-auto object-contain mb-3 drop-shadow-md" />
                  <h3 className="text-sm font-bold text-white">Border Tactical Desk</h3>
                  <p className="text-[11px] text-slate-300 mt-1 mb-4">
                    5 Synchronized National Entry Checkpoints
                  </p>
                  <div className="bg-[#03150F] p-3 rounded-2xl border border-white/10 text-left text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Live Watchlist:</span>
                      <span className="text-rose-400 font-bold">Synchronized</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Overstay Engine:</span>
                      <span className="text-amber-400 font-bold">Automated</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Scan Latency:</span>
                      <span className="text-emerald-400 font-bold">&lt; 150ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Border Checkpoints Grid */}
        <section className="bg-white border border-primary-light/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-ink">
                Designated National Points of Entry &amp; Ports
              </h3>
              <p className="text-xs text-ink-soft">
                Biometrically equipped border control stations operating 24/7
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>All 5 Stations Synchronized</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Lungi Airport */}
            <div className="p-4 bg-canvas rounded-xl border border-primary-light/80 hover:border-emerald-500 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">✈️</span>
                <span className="text-[9px] uppercase font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                  Air Port
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink">FNA Lungi Int&apos;l Airport</h4>
              <p className="text-[11px] text-ink-soft mt-1">Freetown Terminal</p>
              <div className="mt-3 pt-2 border-t border-primary-light/40 flex items-center justify-between text-[10px] text-emerald-700 font-semibold">
                <span>Status:</span>
                <span>🟢 Operational</span>
              </div>
            </div>

            {/* QE Quay Seaport */}
            <div className="p-4 bg-canvas rounded-xl border border-primary-light/80 hover:border-emerald-500 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🚢</span>
                <span className="text-[9px] uppercase font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Sea Port
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink">Queen Elizabeth II Quay</h4>
              <p className="text-[11px] text-ink-soft mt-1">Maritime Port Authority</p>
              <div className="mt-3 pt-2 border-t border-primary-light/40 flex items-center justify-between text-[10px] text-emerald-700 font-semibold">
                <span>Status:</span>
                <span>🟢 Operational</span>
              </div>
            </div>

            {/* Gbalamuya Post */}
            <div className="p-4 bg-canvas rounded-xl border border-primary-light/80 hover:border-emerald-500 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🛂</span>
                <span className="text-[9px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Land Post
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink">Gbalamuya Post</h4>
              <p className="text-[11px] text-ink-soft mt-1">Kambia (Guinea Border)</p>
              <div className="mt-3 pt-2 border-t border-primary-light/40 flex items-center justify-between text-[10px] text-emerald-700 font-semibold">
                <span>Status:</span>
                <span>🟢 Operational</span>
              </div>
            </div>

            {/* Jendema Post */}
            <div className="p-4 bg-canvas rounded-xl border border-primary-light/80 hover:border-emerald-500 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🛂</span>
                <span className="text-[9px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Land Post
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink">Jendema Post</h4>
              <p className="text-[11px] text-ink-soft mt-1">Pujehun (Liberia Border)</p>
              <div className="mt-3 pt-2 border-t border-primary-light/40 flex items-center justify-between text-[10px] text-emerald-700 font-semibold">
                <span>Status:</span>
                <span>🟢 Operational</span>
              </div>
            </div>

            {/* Koindu Post */}
            <div className="p-4 bg-canvas rounded-xl border border-primary-light/80 hover:border-emerald-500 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🛂</span>
                <span className="text-[9px] uppercase font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                  Tri-Border
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink">Koindu Post</h4>
              <p className="text-[11px] text-ink-soft mt-1">Kailahun (Mano River)</p>
              <div className="mt-3 pt-2 border-t border-primary-light/40 flex items-center justify-between text-[10px] text-emerald-700 font-semibold">
                <span>Status:</span>
                <span>🟢 Operational</span>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Capabilities Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Capability 1: Optical QR Scanning */}
          <SecurityPaperPanel className="p-6 border border-primary-light/80" showRosette>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mb-4">
              📷
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">
              Optical Camera &amp; QR Terminal
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              Instant hardware camera scanner for traveler e-Visa QR codes with sub-second biometric profile retrieval and entry validation.
            </p>
            <ul className="text-xs space-y-1.5 text-ink-soft">
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-emerald-600 font-bold">✓</span> Live Video Feed QR Decoder
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-emerald-600 font-bold">✓</span> Passport MRZ Cross-Matching
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-emerald-600 font-bold">✓</span> Anti-Fraud Token Verification
              </li>
            </ul>
          </SecurityPaperPanel>

          {/* Capability 2: Watchlist & Interception */}
          <SecurityPaperPanel className="p-6 border border-primary-light/80" showRosette>
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-2xl mb-4">
              🚨
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">
              National Security Watchlist
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              Instant interception against INTERPOL notices, national security flags, court travel bans, and high-risk traveler alert matrices.
            </p>
            <ul className="text-xs space-y-1.5 text-ink-soft">
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-rose-600 font-bold">✓</span> Real-Time Red Alert Interceptions
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-rose-600 font-bold">✓</span> Secondary Screening Escalations
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-rose-600 font-bold">✓</span> Directorate HQ Rapid Notify
              </li>
            </ul>
          </SecurityPaperPanel>

          {/* Capability 3: Overstay Tracking & Fines */}
          <SecurityPaperPanel className="p-6 border border-primary-light/80" showRosette>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl mb-4">
              ⏱️
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">
              Overstay &amp; Departure Clearance
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              Automated length-of-stay tracking, statutory overstay fine calculations ($50/day policy), and digital exit clearance stamping.
            </p>
            <ul className="text-xs space-y-1.5 text-ink-soft">
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-blue-600 font-bold">✓</span> Inward / Outward Movement Stamping
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-blue-600 font-bold">✓</span> Automated Overstay Penalty Ledger
              </li>
              <li className="flex items-center gap-1.5 text-ink font-medium">
                <span className="text-blue-600 font-bold">✓</span> Central Port Manifest Logs
              </li>
            </ul>
          </SecurityPaperPanel>
        </section>
      </main>

      {/* 4. Official Footer - Hidden on mobile, shown on web */}
      <footer className="hidden sm:block border-t border-primary-light/80 bg-white px-8 py-6 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <SierraLeoneFlag width={20} height={14} />
            <span>
              &copy; {new Date().getFullYear()} Republic of Sierra Leone Department of Immigration (SLID). Border Management &amp; Port Operations.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="hover:text-primary font-medium">Gateway</Link>
            <Link to="/applicant" className="hover:text-primary font-medium">Applicant Portal</Link>
            <Link to="/visa/portal" className="hover:text-primary font-medium">Visa Directorate</Link>
            <Link to="/admin/portal" className="hover:text-primary font-medium">Directorate HQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
