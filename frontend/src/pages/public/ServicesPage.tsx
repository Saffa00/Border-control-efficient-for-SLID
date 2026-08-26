import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { SierraLeoneFlag, SierraLeoneLargeFlag } from "../../components/SierraLeoneFlag";
import { PublicFooter } from "../../components/PublicFooter";

export default function ServicesPage() {
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
                Official Statutory Public Services Directory
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-zinc-500">
              <span className="text-[#166E46] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1E8E5A] animate-pulse"></span>
                <span>e-Visa Issuance Online</span>
              </span>
              <span className="hidden md:inline text-zinc-300">|</span>
              <span className="hidden md:inline text-zinc-600 font-medium">ICAO Doc 9303 Compliant</span>
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
                className="text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] px-3.5 py-2 rounded-lg hover:bg-zinc-100 transition"
              >
                About
              </Link>
              <Link
                to="/services"
                className="text-xs font-semibold text-[#1E8E5A] bg-[#1E8E5A]/10 border border-[#1E8E5A]/25 px-3.5 py-2 rounded-lg transition"
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
            <span>Statutory Immigration Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] mb-4">
            Official Public &amp; Border Services
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive directory of electronic visa adjudications, biometric travel document registries, overstay regulations, and frontline border clearance protocols.
          </p>
        </section>

        {/* 6 Comprehensive Services Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service 1: e-Visa */}
          <div className="bg-white border-2 border-sky-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-[#0284C7] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-sky-50 text-[#0284C7] text-2xl font-bold">
                  ✈️
                </span>
                <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Online Portal
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Electronic Visa (e-Visa)</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Submit digital applications for tourist, business, diplomatic, and transit visas. Fast-track automated vetting with instant PDF issuance and cryptographic QR code stamping.
              </p>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-zinc-200/80 space-y-1.5 text-xs text-zinc-700 mb-6">
                <p>💵 <strong>Tourist Visa:</strong> $80.00 USD (30 Days)</p>
                <p>💼 <strong>Business Visa:</strong> $160.00 USD (90 Days)</p>
                <p>🛫 <strong>Transit Visa:</strong> $40.00 USD (7 Days)</p>
              </div>
            </div>
            <Link
              to="/applicant"
              className="w-full block text-center bg-[#0284C7] hover:bg-[#0369A1] text-white py-2.5 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              Apply for e-Visa Online &rarr;
            </Link>
          </div>

          {/* Service 2: Biometric Passports */}
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-[#1E8E5A] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-emerald-50 text-[#1E8E5A] text-2xl font-bold">
                  🛂
                </span>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ICAO Doc 9303
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Biometric Passport Registry</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Verify compliance of national and foreign passports against the ICAO Doc 9303 international standard with automated 6-month pre-departure expiration audits.
              </p>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-zinc-200/80 space-y-1.5 text-xs text-zinc-700 mb-6">
                <p>🔍 <strong>Bio-Data Extraction:</strong> Optical Machine Readable Zone</p>
                <p>📅 <strong>Validity Rule:</strong> 6-Month Expiration Enforcement</p>
                <p>🌍 <strong>ECOWAS Registry:</strong> Free Movement Verification</p>
              </div>
            </div>
            <Link
              to="/applicant"
              className="w-full block text-center bg-[#1E8E5A] hover:bg-[#166E46] text-white py-2.5 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              Register / Check Passport &rarr;
            </Link>
          </div>

          {/* Service 3: Overstay Management */}
          <div className="bg-white border-2 border-amber-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-[#D97706] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-amber-50 text-[#D97706] text-2xl font-bold">
                  ⏱️
                </span>
                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Statutory Penalty
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Overstay Administration</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Statutory tracking of authorized duration of stay under the Sierra Leone Immigration Act. Automated daily fine calculations with verified payment receipt issuance.
              </p>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-zinc-200/80 space-y-1.5 text-xs text-zinc-700 mb-6">
                <p>⚖️ <strong>Daily Fine:</strong> $50.00 USD per overstay day</p>
                <p>🧾 <strong>Clearance:</strong> Exit Permit Authorization</p>
                <p>🚨 <strong>Enforcement:</strong> Border Gate Interception Protocol</p>
              </div>
            </div>
            <Link
              to="/border/portal"
              className="w-full block text-center bg-[#D97706] hover:bg-[#B45309] text-white py-2.5 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              Check Overstay Status &rarr;
            </Link>
          </div>

          {/* Service 4: Frontline Border Clearance */}
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-[#1E8E5A] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-emerald-50 text-[#1E8E5A] text-2xl font-bold">
                  🛡️
                </span>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  5 Checkpoints
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Port Entry &amp; Exit Clearance</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Sub-second optical camera QR decoding and biometric passenger processing at FNA Lungi International Airport, Queen Elizabeth II Quay, and land posts.
              </p>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-zinc-200/80 space-y-1.5 text-xs text-zinc-700 mb-6">
                <p>📷 <strong>Optical Scanner:</strong> Camera QR Code Validation</p>
                <p>✈️ <strong>Checkpoints:</strong> Lungi, QE II, Gbalamuya, Jendema, Koindu</p>
                <p>⚡ <strong>Latency:</strong> &lt; 1 Second Clearance Speed</p>
              </div>
            </div>
            <Link
              to="/borders"
              className="w-full block text-center bg-[#1E8E5A] hover:bg-[#166E46] text-white py-2.5 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              Inspect 5 National Checkpoints &rarr;
            </Link>
          </div>

          {/* Service 5: Watchlist & National Security */}
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-[#7C3AED] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-purple-50 text-[#7C3AED] text-2xl font-bold">
                  🚨
                </span>
                <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
                  INTERPOL Linked
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Watchlist &amp; Interception</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                National Security Council and INTERPOL I-24/7 real-time cross-matching. Instant red alert alarms for fugitives, expired visas, and restricted entities.
              </p>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-zinc-200/80 space-y-1.5 text-xs text-zinc-700 mb-6">
                <p>🚨 <strong>Red Notice:</strong> Automated Border Halt Alert</p>
                <p>🔒 <strong>Audit Trail:</strong> SHA-256 Cryptographic Log</p>
                <p>🏢 <strong>Command:</strong> Central Intelligence Desk</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="w-full block text-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2.5 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              Contact Security Hotline (999) &rarr;
            </Link>
          </div>

          {/* Service 6: A4 PDF Intelligence Reports */}
          <div className="bg-white border-2 border-sky-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-[#0284C7] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-sky-50 text-[#0284C7] text-2xl font-bold">
                  📑
                </span>
                <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Official A4 Print
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">A4 PDF Intelligence Reports</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Automated generation of official executive A4 reports with national crests, verified digital stamps, checkpoint statistics, and financial audit logs.
              </p>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-zinc-200/80 space-y-1.5 text-xs text-zinc-700 mb-6">
                <p>📄 <strong>Format:</strong> Centered A4 Print-Perfect PDF</p>
                <p>🏛️ <strong>Authenticity:</strong> Sovereign Digital Stamp</p>
                <p>📊 <strong>Scope:</strong> Visa Adjudication &amp; Border Crossings</p>
              </div>
            </div>
            <Link
              to="/admin/portal"
              className="w-full block text-center bg-[#0284C7] hover:bg-[#0369A1] text-white py-2.5 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              Access Executive Reports &rarr;
            </Link>
          </div>
        </section>
      </main>

      {/* Official Rich Public Footer */}
      <PublicFooter />
    </div>
  );
}
