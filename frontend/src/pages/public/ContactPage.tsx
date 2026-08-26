import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { SierraLeoneFlag, SierraLeoneLargeFlag } from "../../components/SierraLeoneFlag";
import { PublicFooter } from "../../components/PublicFooter";

const MAP_LOCATIONS = {
  hq: {
    name: "SLID National Central Headquarters",
    address: "Gloucester Street, Central Freetown, Western Area",
    coordinates: "8.4844° N, 13.2344° W",
    embedUrl:
      "https://maps.google.com/maps?q=Gloucester+Street+Freetown+Sierra+Leone&t=&z=16&ie=UTF8&iwloc=&output=embed",
    directLink:
      "https://www.google.com/maps/search/?api=1&query=Gloucester+Street+Freetown+Sierra+Leone",
  },
  airport: {
    name: "FNA Lungi International Airport Terminal Desk",
    address: "Lungi Airport Peninsula, Port Loko District, North West Province",
    coordinates: "8.6164° N, 13.1955° W",
    embedUrl:
      "https://maps.google.com/maps?q=Lungi+International+Airport+Sierra+Leone&t=&z=15&ie=UTF8&iwloc=&output=embed",
    directLink:
      "https://www.google.com/maps/search/?api=1&query=Lungi+International+Airport+Sierra+Leone",
  },
  quay: {
    name: "Queen Elizabeth II Quay Maritime Command Desk",
    address: "Cline Town, Freetown Deepwater Estuary, Western Area Urban",
    coordinates: "8.4912° N, 13.2127° W",
    embedUrl:
      "https://maps.google.com/maps?q=Queen+Elizabeth+II+Quay+Freetown+Sierra+Leone&t=&z=15&ie=UTF8&iwloc=&output=embed",
    directLink:
      "https://www.google.com/maps/search/?api=1&query=Queen+Elizabeth+II+Quay+Freetown+Sierra+Leone",
  },
};

const CHECKPOINTS_MINI = [
  { name: "FNA Lungi International Airport", code: "FNA-AIR-01", type: "Air Port", icon: "✈️", link: "/borders#lungi" },
  { name: "Queen Elizabeth II Quay Maritime Port", code: "FNA-SEA-02", type: "Sea Port", icon: "🚢", link: "/borders#quay" },
  { name: "Gbalamuya Land Post", code: "KMB-LND-03", type: "Land Post", icon: "🛂", link: "/borders#gbalamuya" },
  { name: "Jendema Border Post", code: "PJH-LND-04", type: "Land Post", icon: "🛂", link: "/borders#jendema" },
  { name: "Koindu International Post", code: "KLH-TRI-05", type: "Tri-Border Post", icon: "🛂", link: "/borders#koindu" },
];

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bordersDropdownOpen, setBordersDropdownOpen] = useState(false);
  const [selectedMap, setSelectedMap] = useState<"hq" | "airport" | "quay">("hq");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "Visa Application Inquiry",
    passportNumber: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBordersDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        subject: "Visa Application Inquiry",
        passportNumber: "",
        message: "",
      });
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0F172A] font-['Tahoma',sans-serif] flex flex-col justify-between selection:bg-[#1E8E5A] selection:text-white relative overflow-x-hidden">
      {/* 1. Background Subtle Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5 scale-105"
          style={{ backgroundImage: "url('/passport-bg.png')" }}
        />
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-[#1E8E5A]/5 rounded-full blur-[150px]" />
        <div className="absolute top-[35%] right-[10%] w-[650px] h-[650px] bg-[#0B4F6C]/5 rounded-full blur-[170px]" />
      </div>

      {/* 2. Top National Ribbon & Ticker */}
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
                Department of Immigration (SLID) • Official Communications Desk
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-zinc-500">
              <span className="text-[#166E46] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1E8E5A] animate-pulse"></span>
                <span>Consular Helpdesk Live</span>
              </span>
              <span className="hidden md:inline text-zinc-300">|</span>
              <span className="hidden md:inline text-zinc-600 font-medium">Gloucester Street HQ, Freetown</span>
            </div>
          </div>
        </div>

        {/* Standard Navigation Bar */}
        <nav className="border-b border-zinc-200/90 bg-white/95 backdrop-blur-md sticky top-0 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            {/* Clean Logo with official writings */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group flex-shrink-0">
              <img
                src="/slid-logo.png"
                alt="Sierra Leone Immigration Department Crest"
                className="w-11 h-11 sm:w-16 sm:h-16 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#1E8E5A] uppercase tracking-wider sm:tracking-widest leading-none mb-0.5 sm:mb-1">
                  Republic of Sierra Leone
                </span>
                <span className="text-sm sm:text-xl font-bold text-[#0F172A] tracking-tight leading-tight group-hover:text-[#1E8E5A] transition">
                  Department of Immigration
                </span>
                <span className="text-[10px] sm:text-[11px] text-zinc-500 font-medium leading-none mt-0.5">
                  Sierra Leone Immigration Department (SLID)
                </span>
              </div>
            </Link>

            {/* Desktop Nav Items */}
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
                className="text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] px-3.5 py-2 rounded-lg hover:bg-zinc-100 transition"
              >
                Services
              </Link>

              {/* Borders Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center">
                  <Link
                    to="/borders"
                    className="text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] pl-3.5 pr-1.5 py-2 rounded-l-lg hover:bg-zinc-100 transition"
                  >
                    Borders &amp; Checkpoints
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBordersDropdownOpen(!bordersDropdownOpen)}
                    className="text-zinc-500 hover:text-zinc-900 pr-2.5 pl-1 py-2 rounded-r-lg hover:bg-zinc-100 transition cursor-pointer"
                    aria-label="Toggle Checkpoints Dropdown"
                  >
                    <span className={`text-[10px] inline-block transition-transform ${bordersDropdownOpen ? "rotate-180 text-[#1E8E5A]" : ""}`}>
                      ▼
                    </span>
                  </button>
                </div>

                {bordersDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-2xl shadow-xl py-2 z-50 animate-fade-in divide-y divide-zinc-100">
                    <div className="px-4 py-2 text-[11px] font-bold text-[#1E8E5A] uppercase tracking-wider bg-zinc-50/80">
                      National Border Checkpoints (5)
                    </div>
                    <div className="py-1">
                      {CHECKPOINTS_MINI.map((cp) => (
                        <Link
                          key={cp.code}
                          to={cp.link}
                          onClick={() => setBordersDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{cp.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#1E8E5A] transition leading-tight">
                                {cp.name}
                              </p>
                              <span className="text-[10px] font-mono text-zinc-500">{cp.code}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                            {cp.type}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/contact"
                className="text-xs font-bold text-[#1E8E5A] bg-[#1E8E5A]/10 border border-[#1E8E5A]/25 px-3.5 py-2 rounded-lg transition"
              >
                Contact
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* 3. Main Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 space-y-10">
        {/* Sovereign Hero Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B4F6C] via-[#093e56] to-[#1E8E5A] p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-amber-300">
              <SierraLeoneFlag width={18} height={12} />
              <span>Republic of Sierra Leone • Consular Communications</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Contact &amp; Directorate Directory
            </h1>

            <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed max-w-2xl">
              Get in touch with the Sierra Leone Immigration Department headquarters, consular visa support units, or emergency border command centers.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-white/15">
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Consular Inquiries</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-white">visa@slid.gov.sl</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Emergency Hotline</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-white">999 / +232 22 222 981</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Public Hours</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-white">Mon – Fri (08:30 – 16:30)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information & Interactive Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Interactive Submission Form */}
          <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-10 shadow-sm">
            <h3 className="text-xl font-bold text-[#0F172A] mb-1.5">Official Citizen &amp; Traveler Inquiry Form</h3>
            <p className="text-xs text-zinc-500 mb-6">
              Fill out this official inquiry form to submit a direct ticket to the Department of Immigration Consular &amp; Border Desk.
            </p>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-3">
                <span className="text-xl">✓</span>
                <span>
                  Your official inquiry has been submitted successfully to the SLID Consular Operations Registry. A response will be transmitted to your email within 24 hours.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your legal full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-zinc-300 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#1E8E5A] focus:ring-1 focus:ring-[#1E8E5A]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. traveler@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-zinc-300 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#1E8E5A] focus:ring-1 focus:ring-[#1E8E5A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1.5">Inquiry Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-zinc-300 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-[#1E8E5A] focus:ring-1 focus:ring-[#1E8E5A]"
                  >
                    <option value="Visa Application Inquiry">Visa Application Inquiry</option>
                    <option value="Biometric Passport Status">Biometric Passport Status</option>
                    <option value="Border Post & Port Clearance">Border Post &amp; Port Clearance</option>
                    <option value="Overstay Fine Settlement">Overstay Fine Settlement</option>
                    <option value="Diplomatic Protocol & Official Transit">Diplomatic Protocol &amp; Official Transit</option>
                    <option value="Other Official Matters">Other Official Matters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1.5">Passport / Application Reference (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. SLE-V-2026-XXXX or P0012345"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-zinc-300 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#1E8E5A] focus:ring-1 focus:ring-[#1E8E5A] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1.5">Message / Detailed Request *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Detail your inquiry or request clearly..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-zinc-300 rounded-xl p-3.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#1E8E5A] focus:ring-1 focus:ring-[#1E8E5A]"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#1E8E5A] hover:bg-[#166E46] text-white font-semibold py-3.5 rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-900/20 disabled:opacity-50"
              >
                {sending ? "Submitting to Consular Registry..." : "Submit Official Inquiry →"}
              </button>
            </form>
          </div>

          {/* Right 1 Column: Directory & Hotlines */}
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <span>📍</span>
                <span>National Headquarters</span>
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Sierra Leone Immigration Department (SLID)<br />
                Gloucester Street, Central Freetown<br />
                Western Area, Republic of Sierra Leone
              </p>
              <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-600 space-y-1">
                <p>📞 Phone: <span className="text-[#0B4F6C] font-mono font-bold">+232 22 222 411</span></p>
                <p>✉️ Email: <span className="text-[#1E8E5A] font-mono font-bold">contact@slid.gov.sl</span></p>
                <p>🕒 Working Hours: Mon - Fri (08:00 - 17:00 GMT)</p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <span>✈️</span>
                <span>Airport Protocol Command</span>
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                FNA Lungi International Airport Terminal<br />
                Visa-on-Arrival &amp; Sovereign Protocol Division<br />
                Port Loko District, North West Province
              </p>
              <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-600 space-y-1">
                <p>📞 Terminal Desk: <span className="text-[#0B4F6C] font-mono font-bold">+232 25 292 100</span></p>
                <p>🕒 Operational: 24/7 Uninterrupted</p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <span>🚨</span>
                <span>24/7 Security Emergency Hotline</span>
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                For urgent border interceptions, anti-trafficking escalations, and emergency diplomatic transit:
              </p>
              <p className="text-base font-bold font-mono text-rose-800 bg-rose-100 p-2.5 rounded-xl border border-rose-300 text-center">
                Hotline: 999 (Immigration Desk)
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* GOOGLE MAPS INTERACTIVE LOCATION SECTION                      */}
        {/* ------------------------------------------------------------- */}
        <section className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1E8E5A]/10 border border-[#1E8E5A]/25 text-[#1E8E5A] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
                <span>📍 Live Satellite &amp; Navigation Map</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                Immigration Command Locations on Google Maps
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Find official government immigration desks, visa adjudication centers, and airport border checkpoints.
              </p>
            </div>

            {/* Location Switcher Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedMap("hq")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedMap === "hq"
                    ? "bg-[#1E8E5A] text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                <span>🏛️</span>
                <span>Freetown HQ</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMap("airport")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedMap === "airport"
                    ? "bg-[#0B4F6C] text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                <span>✈️</span>
                <span>Lungi Airport</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMap("quay")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedMap === "quay"
                    ? "bg-[#D97706] text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                <span>🚢</span>
                <span>QE II Port</span>
              </button>
            </div>
          </div>

          {/* Location Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F8FAFC] p-4 rounded-2xl border border-zinc-200/80">
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-500">Selected Facility</p>
              <p className="font-bold text-[#0F172A] mt-0.5">{MAP_LOCATIONS[selectedMap].name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-500">Address / District</p>
              <p className="text-zinc-600 mt-0.5">{MAP_LOCATIONS[selectedMap].address}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-500">GPS Coordinates</p>
                <p className="font-mono text-[#1E8E5A] font-bold mt-0.5">{MAP_LOCATIONS[selectedMap].coordinates}</p>
              </div>
              <a
                href={MAP_LOCATIONS[selectedMap].directLink}
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold px-3 py-1.5 rounded-xl transition border border-zinc-300 flex items-center gap-1 flex-shrink-0 shadow-2xs"
              >
                <span>Open App</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* Responsive Embedded Google Map Frame */}
          <div className="relative w-full h-80 sm:h-[420px] rounded-2xl overflow-hidden border border-zinc-300 shadow-inner">
            <iframe
              title={`Google Map - ${MAP_LOCATIONS[selectedMap].name}`}
              src={MAP_LOCATIONS[selectedMap].embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </section>
      </main>

      {/* Official Rich Public Footer */}
      <PublicFooter />
    </div>
  );
}
