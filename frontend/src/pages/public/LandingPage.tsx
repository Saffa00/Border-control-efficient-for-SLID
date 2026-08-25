import { Link } from "react-router-dom";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { ThemeToggle } from "../../components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col justify-between">
      {/* Official Top Bar */}
      <header className="border-b border-primary-light/80 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/slid-logo.png"
              alt="Sierra Leone Immigration Department"
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] tracking-widest text-primary uppercase font-bold">
                Republic of Sierra Leone
              </span>
              <span className="font-display text-base font-bold text-ink">
                Department of Immigration (SLID)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark text-xs font-semibold px-3 py-2 transition"
            >
              Sign In (Applicant)
            </Link>
            <Link
              to="/register"
              className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary-dark transition shadow-xs"
            >
              Register Account
            </Link>
            <Link
              to="/staff/login"
              className="border border-primary-light text-primary hover:bg-primary hover:text-white text-xs font-semibold px-3 py-2 rounded-md transition"
            >
              🛡️ Staff & Admin Portal
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Sensitization & Gateway Container */}
      <main className="max-w-5xl mx-auto px-6 py-12 grid gap-12">
        {/* 1. Hero Section */}
        <section className="text-center py-6">
          <img
            src="/slid-logo.png"
            alt="Sierra Leone Immigration Department Official Emblem"
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 object-contain"
          />
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            🇸🇱 Official National e-Visa & Border Clearance Portal
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight mb-4 text-ink max-w-3xl mx-auto">
            Welcome to the Sierra Leone Immigration Management System
          </h1>
          <p className="text-ink-soft text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            The official government platform for international travelers, tourists, business delegates, and returning citizens to apply for electronic visas, record biometric passports, and receive verified digital entry clearance.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-accent text-white px-8 py-3.5 rounded-md text-sm font-semibold hover:opacity-95 transition shadow-sm"
            >
              Apply for e-Visa Now &rarr;
            </Link>
            <Link
              to="/login"
              className="border-2 border-primary text-primary px-8 py-3.5 rounded-md text-sm font-semibold hover:bg-primary-light/40 transition"
            >
              Track Application Status
            </Link>
          </div>
        </section>

        {/* 2. Educational / Sensitization Pillars */}
        <section className="grid gap-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-ink mb-2">
              Essential Immigration & Travel Information
            </h2>
            <p className="text-xs text-ink-soft">
              Please review the national entry requirements before commencing your application or journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <SecurityPaperPanel className="p-6" showRosette>
              <div className="w-8 h-8 rounded-md bg-primary-light text-primary flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Who Needs a Visa?</h3>
              <p className="text-xs text-ink-soft leading-relaxed mb-3">
                All foreign nationals traveling to Sierra Leone for tourism, business, study, or family visits require a valid e-Visa prior to embarkation, unless exempt under ECOWAS bilateral treaties.
              </p>
              <ul className="text-[11px] text-ink-soft space-y-1 list-disc list-inside">
                <li>Tourist & Holiday Visas (30–90 days)</li>
                <li>Business & Investment Entry</li>
                <li>ECOWAS Free Movement Passes</li>
              </ul>
            </SecurityPaperPanel>

            <SecurityPaperPanel className="p-6" showRosette>
              <div className="w-8 h-8 rounded-md bg-primary-light text-primary flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Required Documents</h3>
              <p className="text-xs text-ink-soft leading-relaxed mb-3">
                Ensure you have digital copies of the following mandatory documentation ready before filling out the online questionnaire:
              </p>
              <ul className="text-[11px] text-ink-soft space-y-1 list-disc list-inside">
                <li>Valid passport (at least 6 months validity)</li>
                <li>Recent passport-sized photograph</li>
                <li>Confirmed flight itinerary & accommodation</li>
                <li>Yellow Fever vaccination certificate</li>
              </ul>
            </SecurityPaperPanel>

            <SecurityPaperPanel className="p-6" showRosette>
              <div className="w-8 h-8 rounded-md bg-primary-light text-primary flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Digital Clearance & QR</h3>
              <p className="text-xs text-ink-soft leading-relaxed mb-3">
                Upon adjudication by a Visa Officer, approved travelers receive a cryptographically signed Digital Visa Certificate containing an encrypted QR verification token.
              </p>
              <p className="text-[11px] text-primary font-medium bg-primary-light/40 p-2.5 rounded">
                ℹ️ Present your digital visa on your phone or printed paper at Lungi Airport or land border checkposts.
              </p>
            </SecurityPaperPanel>
          </div>
        </section>

        {/* 3. Official Border Checkpoints in Sierra Leone */}
        <section className="bg-white border border-primary-light/80 rounded-xl p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">
                Official Designated Points of Entry
              </h2>
              <p className="text-xs text-ink-soft">
                Biometric immigration clearance stations across the Republic of Sierra Leone
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-primary text-white px-2.5 py-1 rounded font-bold">
              24/7 Border Security
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-canvas border border-primary-light/60 rounded-lg">
              <p className="font-bold text-primary">✈️ Lungi Airport (FNA)</p>
              <p className="text-[11px] text-ink-soft mt-0.5">International Air Terminal</p>
            </div>
            <div className="p-3 bg-canvas border border-primary-light/60 rounded-lg">
              <p className="font-bold text-primary">🚢 Queen Elizabeth II Quay</p>
              <p className="text-[11px] text-ink-soft mt-0.5">Freetown Maritime Seaport</p>
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

        {/* 4. Dedicated Staff & Admin Sensitization Callout Banner */}
        <section className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-8 sm:p-10 shadow-md border-2 border-accent/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left max-w-xl">
              <span className="inline-block bg-accent text-white font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded mb-3">
                Government Officer Notice
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                Official Staff, Officer & Admin Gateway
              </h2>
              <p className="text-xs sm:text-sm text-primary-light/90 leading-relaxed">
                If you are an Immigration Border Officer, Visa Adjudicator, Checkpoint Supervisor, or System Administrator, please access the dedicated secure government console to review case files, perform border check-ins, or manage system parameters.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link
                to="/staff/login"
                className="w-full sm:w-auto bg-white text-primary hover:bg-canvas text-xs font-bold px-6 py-3.5 rounded-md transition text-center shadow-xs whitespace-nowrap cursor-pointer"
              >
                Access Staff & Admin Portal &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Official Footer */}
      <footer className="border-t border-primary-light/80 px-8 py-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">Republic of Sierra Leone</span>
            <span>•</span>
            <span>Department of Immigration (SLID)</span>
            <span>•</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-primary font-medium">
              Applicant Portal
            </Link>
            <span>•</span>
            <Link to="/staff/login" className="hover:text-primary font-bold text-primary">
              If you're an Admin or Staff, click here &rarr;
            </Link>
            <span>•</span>
            <Link to="/staff/request-access" className="hover:text-primary font-medium">
              Request Officer Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
