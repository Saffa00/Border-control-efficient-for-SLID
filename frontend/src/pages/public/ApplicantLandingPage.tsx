import { Link } from "react-router-dom";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { SierraLeoneFlag, SierraLeoneLargeFlag } from "../../components/SierraLeoneFlag";

export default function ApplicantLandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col justify-between">
      {/* National Tri-Color Strip */}
      <div className="h-1.5 w-full grid grid-cols-3">
        <div className="bg-[#1E8E5A]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#0B4F6C]"></div>
      </div>

      {/* Official Sovereign Top Bar */}
      <header className="border-b border-primary-light/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 group">
            <Link to="/">
              <img
                src="/slid-logo.png"
                alt="Sierra Leone Immigration Department"
                className="w-13 h-13 sm:w-14 sm:h-14 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <SierraLeoneFlag width={18} height={12} />
                <span className="text-[10px] font-bold text-[#1E8E5A] uppercase tracking-widest leading-none">
                  Republic of Sierra Leone
                </span>
                <span className="text-[9px] uppercase font-bold bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded-full">
                  Applicant Portal
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-ink leading-tight">
                e-Visa &amp; Biometric Passport Services
              </span>
              <span className="text-[10px] text-ink-soft -mt-0.5">
                Department of Immigration (SLID)
              </span>
            </div>
          </div>

          {/* Top Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark text-xs font-bold px-3 py-2 rounded-xl border border-primary-light bg-white hover:bg-primary-light/30 transition shadow-2xs"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-accent hover:opacity-90 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <span>✍️</span>
              <span>Create Account</span>
            </Link>
          </div>
        </div>

        {/* Sub-Header Navigation Strip with Back Button beneath */}
        <div className="bg-canvas border-t border-primary-light/50 px-4 sm:px-8 py-2 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft hover:text-primary transition bg-white px-3 py-1.5 rounded-lg border border-primary-light/80 shadow-2xs active:scale-95"
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
            Traveler e-Visa &amp; Biometric Records
          </span>
        </div>
      </header>

      {/* Main Sensitization & Applicant Gateway */}
      <main className="max-w-5xl mx-auto px-6 py-12 grid gap-12">
        {/* 1. Mobile App Style Onboarding Hero Screen with Background Image */}
        <section className="relative rounded-3xl overflow-hidden border border-[#0284C7]/30 shadow-2xl bg-[#061826] text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 filter brightness-110"
              style={{ backgroundImage: "url('/passport-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#061826]/95 via-[#0A2E46]/90 to-[#0F4E38]/85" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#0284C7]/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SierraLeoneFlag width={20} height={14} />
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  Official Public Traveler Portal • Republic of Sierra Leone
                </span>
              </div>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                ⚡ 48-Hour Processing
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Apply for Sierra Leone e-Visa &amp; Passports Online
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Submit electronic visa applications, register biometric passport records, complete secure mobile money payments, and receive your cryptographic QR entry certificate.
                </p>

                {/* 3-Step Onboarding Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">1️⃣ 🛂</span>
                    <h4 className="text-xs font-bold text-white">Passport Bio-Data</h4>
                    <p className="text-[10px] text-slate-300">Link passport &amp; ECOWAS profile</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">2️⃣ 💳</span>
                    <h4 className="text-xs font-bold text-white">Instant Payment</h4>
                    <p className="text-[10px] text-slate-300">Orange / AfriMoney / Card</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-1">
                    <span className="text-lg">3️⃣ 📄</span>
                    <h4 className="text-xs font-bold text-white">QR Entry Permit</h4>
                    <p className="text-[10px] text-slate-300">Fast-track airport clearance</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    to="/register"
                    className="bg-[#0284C7] hover:bg-[#0369A1] active:scale-95 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-xl transition shadow-lg flex items-center gap-2"
                  >
                    <span>Start Visa Application</span>
                    <span>&rarr;</span>
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition border border-white/20"
                  >
                    Sign In to Dashboard
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
                  <img src="/slid-logo.png" alt="SLID Emblem" className="w-20 h-20 mx-auto object-contain mb-3 drop-shadow-md" />
                  <h3 className="text-sm font-bold text-white">Digital Border Pass</h3>
                  <p className="text-[11px] text-slate-300 mt-1 mb-4">
                    Authorized under the Sierra Leone Immigration Act
                  </p>
                  <div className="bg-[#04121C] p-3 rounded-2xl border border-white/10 text-left text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>e-Visa Validity:</span>
                      <span className="text-emerald-400 font-bold">30-90 Days</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Approval Speed:</span>
                      <span className="text-sky-400 font-bold">~48 Hours</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Verification:</span>
                      <span className="text-amber-400 font-bold">Live QR Scan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive AI Assistant Consultation Section */}
        <section className="grid gap-6">
          <SecurityPaperPanel className="p-8 border-primary/30 shadow-md" showRosette>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-primary-light pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl shadow-2xs">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-ink">
                      Salone Immigration Virtual Assistant
                    </h2>
                    <span className="bg-primary/10 text-primary font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                      Google Gemini AI ✦
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Ask instant questions regarding visa categories, fees, required documents, or travel rules.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-status-approved font-semibold bg-status-approved-bg px-3 py-1 rounded-full border border-status-approved/30">
                <span className="w-2 h-2 rounded-full bg-status-approved animate-pulse"></span>
                <span>AI Online 24/7</span>
              </div>
            </div>

            {/* Embedded Chat Preview & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <h3 className="font-display text-sm font-bold text-ink mb-3">
                  Frequently Asked Questions:
                </h3>
                <div className="grid gap-2">
                  {[
                    "What are the official e-Visa fees?",
                    "What documents do I need for my biometric passport?",
                    "Do ECOWAS citizens (Nigeria, Ghana, etc.) need a visa?",
                    "How long does standard visa approval take?",
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const event = new CustomEvent("open-ai-chat", { detail: q });
                        window.dispatchEvent(event);
                      }}
                      className="text-left text-xs bg-canvas hover:bg-primary-light/60 border border-primary-light p-3 rounded-lg text-ink font-medium transition cursor-pointer flex items-center justify-between group shadow-2xs"
                    >
                      <span>💬 {q}</span>
                      <span className="text-primary group-hover:translate-x-1 transition font-bold">&rarr;</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-canvas/80 border border-primary-light rounded-xl p-5 text-xs space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span>💡</span>
                  <span>Instant Traveler Guidance</span>
                </div>
                <p className="text-ink-soft leading-relaxed">
                  Our official AI guide is trained on the latest Republic of Sierra Leone immigration statutes, biometric verification standards, and international health protocols.
                </p>
                <div className="pt-3 border-t border-primary-light/60 flex items-center justify-between">
                  <span className="text-[11px] text-ink-soft font-mono">Need full consultation?</span>
                  <button
                    onClick={() => {
                      const event = new CustomEvent("open-ai-chat", { detail: "Hello! What are the requirements to visit Sierra Leone?" });
                      window.dispatchEvent(event);
                    }}
                    className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary-dark transition cursor-pointer shadow-xs"
                  >
                    Open Live AI Chat &rarr;
                  </button>
                </div>
              </div>
            </div>
          </SecurityPaperPanel>
        </section>

        {/* 3. Educational / Sensitization Pillars */}
        <section className="grid gap-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-ink mb-2">
              Essential Immigration &amp; Travel Information
            </h2>
            <p className="text-xs text-ink-soft">
              Please review the national entry requirements before commencing your application or journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <SecurityPaperPanel className="p-6" showRosette>
              <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Who Needs a Visa?</h3>
              <p className="text-xs text-ink-soft leading-relaxed mb-3">
                All foreign nationals traveling to Sierra Leone for tourism, business, study, or family visits require a valid e-Visa prior to embarkation, unless exempt under ECOWAS bilateral treaties.
              </p>
              <ul className="text-[11px] text-ink-soft space-y-1 list-disc list-inside">
                <li>Tourist &amp; Holiday Visas (30–90 days)</li>
                <li>Business &amp; Investment Entry</li>
                <li>ECOWAS Citizens: Visa-free entry</li>
              </ul>
            </SecurityPaperPanel>

            <SecurityPaperPanel className="p-6" showRosette>
              <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Required Bio-Data</h3>
              <p className="text-xs text-ink-soft leading-relaxed mb-3">
                Ensure you have clear digital scans of your original documents before starting the application:
              </p>
              <ul className="text-[11px] text-ink-soft space-y-1 list-disc list-inside">
                <li>Biometric Passport (min. 6 months validity)</li>
                <li>White-background passport photo</li>
                <li>Proof of Yellow Fever Vaccination</li>
                <li>Confirmed travel itinerary</li>
              </ul>
            </SecurityPaperPanel>

            <SecurityPaperPanel className="p-6" showRosette>
              <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Digital Clearance</h3>
              <p className="text-xs text-ink-soft leading-relaxed mb-3">
                Once approved by an immigration adjudication officer, your official Digital Visa Certificate is issued instantly with an encrypted QR code.
              </p>
              <p className="text-[11px] text-primary font-medium">
                ℹ️ Present your digital visa on your phone or printed paper at Lungi Airport or land border checkposts.
              </p>
            </SecurityPaperPanel>
          </div>
        </section>

        {/* 4. Authorized Checkpoints */}
        <section className="text-center py-4">
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            Authorized Republic of Sierra Leone Border Gateways
          </h2>
          <p className="text-xs text-ink-soft mb-6 max-w-xl mx-auto">
            Digital e-Visas issued through this official portal are accepted for entry clearance at all authorized land, sea, and air border posts across Sierra Leone.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3 bg-canvas border border-primary-light/60 rounded-lg">
              <p className="font-bold text-primary">✈️ Lungi Airport (FNA)</p>
              <p className="text-[11px] text-ink-soft mt-0.5">International Flights</p>
            </div>
            <div className="p-3 bg-canvas border border-primary-light/60 rounded-lg">
              <p className="font-bold text-primary">🚢 Freetown Quay</p>
              <p className="text-[11px] text-ink-soft mt-0.5">Maritime / Sea Port</p>
            </div>
            <div className="p-3 bg-canvas border border-primary-light/60 rounded-lg">
              <p className="font-bold text-primary">🛂 Gbalamuya Post</p>
              <p className="text-[11px] text-ink-soft mt-0.5">Kambia — Guinea Border</p>
            </div>
            <div className="p-3 bg-canvas border border-primary-light/60 rounded-lg">
              <p className="font-bold text-primary">🛂 Jendema Post</p>
              <p className="text-[11px] text-ink-soft mt-0.5">Pujehun — Liberia Border</p>
            </div>
            <div className="p-3 bg-canvas border border-primary-light/60 rounded-lg">
              <p className="font-bold text-primary">🛂 Koindu Post</p>
              <p className="text-[11px] text-ink-soft mt-0.5">Kailahun Tri-Border</p>
            </div>
          </div>
        </section>
      </main>

      {/* Official Footer - Hidden on mobile, shown on web */}
      <footer className="hidden sm:block border-t border-primary-light/80 bg-white px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">Republic of Sierra Leone</span>
            <span>•</span>
            <span>Department of Immigration (SLID) — Applicant Portal</span>
            <span>•</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-primary font-semibold text-primary">
              Applicant Sign In
            </Link>
            <span>•</span>
            <Link to="/register" className="hover:text-primary font-medium">
              Create Applicant Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
