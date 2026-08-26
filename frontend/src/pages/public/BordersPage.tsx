import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { SierraLeoneFlag, SierraLeoneLargeFlag } from "../../components/SierraLeoneFlag";
import { PublicFooter } from "../../components/PublicFooter";

interface CheckpointDetail {
  id: string;
  name: string;
  code: string;
  type: "Air Port" | "Sea Port" | "Land Post" | "Tri-Border Post";
  icon: string;
  location: string;
  district: string;
  coordinates: string;
  established: string;
  history: string;
  significance: string;
  facilities: string[];
  commander: string;
  operatingHours: string;
}

const CHECKPOINTS_DATA: CheckpointDetail[] = [
  {
    id: "lungi",
    name: "FNA Lungi International Airport",
    code: "FNA-AIR-01",
    type: "Air Port",
    icon: "✈️",
    location: "Lungi Coastal Peninsula, Port Loko District",
    district: "North West Province",
    coordinates: "8.6164° N, 13.1955° W",
    established: "1949 (Converted from Royal Air Force WWII staging base)",
    history:
      "Originally established during World War II by the British Royal Air Force as an Atlantic transit station, Lungi was modernized into Sierra Leone's principal international airport following independence in 1961. In 2023, a state-of-the-art international terminal was inaugurated, expanding biometric e-Gates, dual biometric clearance lanes, and direct transatlantic connectivity.",
    significance:
      "The primary aerial gateway to Sierra Leone, handling over 90% of international scheduled commercial flights, diplomatic delegations, and high-priority VIP transit.",
    facilities: [
      "Biometric e-Gates & ICAO 9303 MRZ Optical Readers",
      "High-Resolution Facial Recognition & Live Camera QR Decoders",
      "Dedicated Consular Visa-on-Arrival Adjudication Booths",
      "INTERPOL I-24/7 Red Notice Integrated Watchlist Gateway",
      "24/7 Diplomatic & VIP Sovereign Protocol Lounge",
    ],
    commander: "Superintendent of Immigration (Airport Command)",
    operatingHours: "24 Hours / 7 Days a week (Uninterrupted)",
  },
  {
    id: "quay",
    name: "Queen Elizabeth II Quay Maritime Port",
    code: "FNA-SEA-02",
    type: "Sea Port",
    icon: "🚢",
    location: "Cline Town, Freetown Deepwater Estuary",
    district: "Western Area Urban",
    coordinates: "8.4912° N, 13.2127° W",
    established: "1953 (Named in honor of Queen Elizabeth II)",
    history:
      "Constructed on the southern bank of the Sierra Leone River, Queen Elizabeth II Quay is situated in the largest natural deepwater harbor in the African continent (and the third-largest in the world). The port has served for centuries as a vital maritime trade crossroads between Europe, the Americas, and West Africa.",
    significance:
      "The sovereign commercial lifeline of Sierra Leone, processing 100% of containerized ocean cargo, international maritime crew manifests, naval vessels, and offshore oil exploration crews.",
    facilities: [
      "Maritime Seafarer & Crew Manifest Automated Stamping",
      "Port Surveillance Radar & AIS Vessel Tracking Integration",
      "Container Terminal Border Clearance & Customs Liaison",
      "Immigration Patrol Launches for Harbor Channel Surveillance",
      "Maritime Overstay & Shore Pass Regulatory Desk",
    ],
    commander: "Chief Inspector of Immigration (Maritime Command)",
    operatingHours: "24 Hours / 7 Days a week",
  },
  {
    id: "gbalamuya",
    name: "Gbalamuya International Border Post",
    code: "KMB-LND-03",
    type: "Land Post",
    icon: "🛂",
    location: "Kambia District (Sierra Leone - Guinea Border)",
    district: "North West Province",
    coordinates: "9.1245° N, 12.9189° W",
    established: "1963 (Formalized border customs & immigration post)",
    history:
      "Situated along the historical Trans-West African Coastal Highway connecting Freetown to Conakry, Gbalamuya is the bustling northern land portal of the Republic. It was upgraded under the ECOWAS Joint Border Post framework with integrated biometric screening desks, bilateral coordination offices, and heavy freight inspection facilities.",
    significance:
      "The vital economic and passenger conduit between Sierra Leone and Guinea, facilitating international passenger buses, cross-border commercial freight, and ECOWAS free-movement protocol travelers.",
    facilities: [
      "Joint ECOWAS Biometric Traveler Screening Kiosks",
      "Heavy Freight Vehicle Cargo & Driver Stamping Bays",
      "Real-Time Guinea Border Cross-Matching Watchlist System",
      "Yellow Fever & Port Health Quarantine Inspection Unit",
      "Rapid Response Land Patrol & Anti-Smuggling Unit",
    ],
    commander: "Senior Immigration Officer (Kambia Border Command)",
    operatingHours: "06:00 AM - 10:00 PM Daily (Emergency 24/7 Transit)",
  },
  {
    id: "jendema",
    name: "Jendema Border Post",
    code: "PJH-LND-04",
    type: "Land Post",
    icon: "🛂",
    location: "Pujehun District (Sierra Leone - Liberia Border / Bo Waterside)",
    district: "Southern Province",
    coordinates: "7.0422° N, 11.4583° W",
    established: "1973 (Mano River Union Joint Crossing Point)",
    history:
      "Located at the historic Mano River bridge crossing opposite Bo Waterside in Liberia, Jendema represents a cornerstone of the Mano River Union (MRU) peace and regional cooperation framework. Modernized with satellite communications to the Freetown Central Data Hub, Jendema provides continuous border security and traveler clearance.",
    significance:
      "The primary southern land artery connecting Sierra Leone and the Republic of Liberia, managing commercial agricultural transit, regional diplomacy, and cross-border community passage.",
    facilities: [
      "Mano River Bridge Biometric Checkpoint Desks",
      "Satellite-Linked Central Immigration Database Terminal",
      "Cross-Border ECOWAS Identity Card & Passport Scanners",
      "Overstay Assessment & Penalty Processing Desk",
      "Community Liaison & Regional Border Surveillance Posts",
    ],
    commander: "Senior Immigration Officer (Pujehun Border Command)",
    operatingHours: "06:00 AM - 08:00 PM Daily",
  },
  {
    id: "koindu",
    name: "Koindu International Post",
    code: "KLH-TRI-05",
    type: "Tri-Border Post",
    icon: "🛂",
    location: "Kailahun District (Tri-Border Junction: SL - Guinea - Liberia)",
    district: "Eastern Province",
    coordinates: "8.4833° N, 10.3500° W",
    established: "1930s (Historical International Trading Fair Hub)",
    history:
      "Koindu is renowned across West Africa as the host of the historic 'Koindu International Market', where merchants from Sierra Leone, Guinea, and Liberia have convened for over a century. The modern immigration post guards the strategic tri-border confluence of the Mano River, providing specialized surveillance and trade facilitation.",
    significance:
      "Strategic tri-border security post securing the eastern frontier, monitoring riverine crossings, and administering legitimate regional commerce across three neighboring nations.",
    facilities: [
      "Tri-Nation Border Manifest Registry & Stamping",
      "Riverine Patrol Boat Surveillance Dock",
      "Biometric Traveler Entry & Exit Validation Desk",
      "National Security Eastern Sector Intelligence Link",
      "Customs & Excise Joint Clearance Pavilion",
    ],
    commander: "Immigration Inspector (Kailahun Tri-Border Command)",
    operatingHours: "06:00 AM - 07:00 PM Daily",
  },
];

export default function BordersPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bordersDropdownOpen, setBordersDropdownOpen] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckpointDetail | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All");
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

  const filteredCheckpoints =
    selectedTypeFilter === "All"
      ? CHECKPOINTS_DATA
      : CHECKPOINTS_DATA.filter((cp) => cp.type === selectedTypeFilter);

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
                National Border Posts &amp; Checkpoints Directory
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-zinc-500">
              <span className="text-[#166E46] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1E8E5A] animate-pulse"></span>
                <span>5 Sovereign Posts Connected</span>
              </span>
              <span className="hidden md:inline text-zinc-300">|</span>
              <span className="hidden md:inline text-zinc-600 font-medium">Biometric Surveillance Grid</span>
            </div>
          </div>
        </div>

        {/* Standard Navigation Bar */}
        <nav className="border-b border-zinc-200/90 bg-white/95 backdrop-blur-md sticky top-0 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            {/* Logo with official writings */}
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

              {/* Borders Dropdown (Active) */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center">
                  <Link
                    to="/borders"
                    className="text-xs font-bold text-[#1E8E5A] bg-[#1E8E5A]/10 border border-[#1E8E5A]/25 pl-3.5 pr-1.5 py-2 rounded-l-lg transition"
                  >
                    Borders &amp; Checkpoints
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBordersDropdownOpen(!bordersDropdownOpen)}
                    className="text-zinc-500 hover:text-zinc-900 pr-2.5 pl-1 py-2 rounded-r-lg bg-[#1E8E5A]/10 border-y border-r border-[#1E8E5A]/25 hover:bg-zinc-100 transition cursor-pointer"
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
                      {CHECKPOINTS_DATA.map((cp) => (
                        <div
                          key={cp.code}
                          onClick={() => {
                            setSelectedCheckpoint(cp);
                            setBordersDropdownOpen(false);
                          }}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 transition group cursor-pointer"
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/contact"
                className="text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] px-3.5 py-2 rounded-lg hover:bg-zinc-100 transition"
              >
                Contact
              </Link>
            </div>

            {/* Quick Action Button & Mobile Toggle */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/applicant"
                className="bg-[#1E8E5A] hover:bg-[#166E46] active:scale-95 text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl transition shadow-sm inline-flex items-center gap-1.5"
              >
                <span>Traveler Portal</span>
                <span className="text-xs">&rarr;</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                aria-label="Toggle Mobile Menu"
              >
                <span className="text-lg">{mobileMenuOpen ? "✕" : "☰"}</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-zinc-200 bg-white/98 px-4 py-4 space-y-2 shadow-lg animate-fade-in">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] p-2 rounded-lg hover:bg-zinc-100"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] p-2 rounded-lg hover:bg-zinc-100"
              >
                About Institutional Mandate
              </Link>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] p-2 rounded-lg hover:bg-zinc-100"
              >
                Statutory Public Services
              </Link>
              <Link
                to="/borders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-[#1E8E5A] bg-[#1E8E5A]/10 p-2 rounded-lg"
              >
                Borders &amp; Checkpoints
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-semibold text-[#0F172A] hover:text-[#1E8E5A] p-2 rounded-lg hover:bg-zinc-100"
              >
                Contact &amp; Directorate Directory
              </Link>
              <div className="pt-2 border-t border-zinc-200 flex gap-2">
                <Link
                  to="/applicant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center bg-[#1E8E5A] text-white text-xs font-bold py-2 rounded-xl"
                >
                  Traveler Portal
                </Link>
                <Link
                  to="/staff/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center bg-[#0B4F6C] text-white text-xs font-bold py-2 rounded-xl"
                >
                  Staff Sign In
                </Link>
              </div>
            </div>
          )}
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
              <span>Republic of Sierra Leone • Frontier Command</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Designated Border Checkpoints
            </h1>

            <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed max-w-2xl">
              The 5 authorized points of entry across air, sea, and land frontiers under the sovereign jurisdiction of the Sierra Leone Immigration Department.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-white/15">
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Air Gateways</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-white">FNA Lungi Intl.</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Maritime Port</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-white">Queen Elizabeth II</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Land &amp; Tri-Borders</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-white">Gbalamuya, Jendema, Koindu</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["All", "Air Port", "Sea Port", "Land Post", "Tri-Border Post"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedTypeFilter === type
                  ? "bg-[#1E8E5A] text-white shadow-xs"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
              }`}
            >
              {type === "All" ? "🌐 All 5 Stations" : type}
            </button>
          ))}
        </div>

        {/* Checkpoint Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCheckpoints.map((cp) => (
            <div
              key={cp.id}
              onClick={() => setSelectedCheckpoint(cp)}
              className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-[#1E8E5A] transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2 rounded-2xl bg-zinc-100 group-hover:scale-110 transition">
                    {cp.icon}
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-[#1E8E5A]/10 text-[#1E8E5A] border border-[#1E8E5A]/25 px-2.5 py-1 rounded-full">
                    {cp.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#1E8E5A] transition mb-1">
                  {cp.name}
                </h3>
                <p className="text-xs text-zinc-600 mb-3">{cp.location}</p>

                <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-zinc-200/80 space-y-1.5 text-xs text-zinc-600 mb-5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">District:</span>
                    <span className="font-semibold text-zinc-800">{cp.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Coordinates:</span>
                    <span className="font-mono text-[#1E8E5A] font-bold">{cp.coordinates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Hours:</span>
                    <span className="font-medium text-zinc-800">{cp.operatingHours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-[#1E8E5A]">
                <span>Station Online</span>
                <span className="group-hover:underline flex items-center gap-1">
                  <span>Inspect Full Dossier</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Intelligence Modal */}
      {selectedCheckpoint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-zinc-900 font-['Tahoma'] max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-3.5">
                <span className="text-4xl p-2 rounded-2xl bg-zinc-100">{selectedCheckpoint.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-[#1E8E5A]/10 text-[#1E8E5A] px-2.5 py-0.5 rounded border border-[#1E8E5A]/20">
                      {selectedCheckpoint.type}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">{selectedCheckpoint.code}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">{selectedCheckpoint.name}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCheckpoint(null)}
                className="text-zinc-400 hover:text-zinc-900 bg-zinc-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Geographical Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-500">Location</p>
                <p className="font-semibold text-zinc-900 mt-0.5">{selectedCheckpoint.location}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-500">District / Province</p>
                <p className="font-semibold text-zinc-900 mt-0.5">{selectedCheckpoint.district}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-500">GPS Coordinates</p>
                <p className="font-mono text-[#1E8E5A] font-bold mt-0.5">{selectedCheckpoint.coordinates}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-500">Station Command</p>
                <p className="font-semibold text-[#0B4F6C] mt-0.5">{selectedCheckpoint.commander}</p>
              </div>
            </div>

            {/* History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                📜 History &amp; Origin ({selectedCheckpoint.established})
              </h4>
              <p className="text-xs text-zinc-700 leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-zinc-200">
                {selectedCheckpoint.history}
              </p>
            </div>

            {/* Significance */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E8E5A]">
                🛡️ Strategic National Significance
              </h4>
              <p className="text-xs text-zinc-700 leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-zinc-200">
                {selectedCheckpoint.significance}
              </p>
            </div>

            {/* Operational Facilities */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                ⚡ Operational Facilities &amp; Biometrics
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-700 bg-[#F8FAFC] p-4 rounded-xl border border-zinc-200">
                {selectedCheckpoint.facilities.map((fac, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-[#1E8E5A] font-bold">✓</span>
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedCheckpoint(null)}
                className="w-full bg-[#1E8E5A] hover:bg-[#166E46] text-white font-semibold py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Close Station Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Rich Public Footer */}
      <PublicFooter />
    </div>
  );
}
