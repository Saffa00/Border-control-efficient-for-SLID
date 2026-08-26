import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { SierraLeoneFlag, SierraLeoneLargeFlag } from "../../components/SierraLeoneFlag";
import { PublicFooter } from "../../components/PublicFooter";

// -----------------------------------------------------------------------------
// Checkpoint Comprehensive Data (Location, History, Operations, Command)
// -----------------------------------------------------------------------------
export interface CheckpointDetail {
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

export const CHECKPOINTS_DATA: CheckpointDetail[] = [
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
      "Originally established during World War II by the British Royal Air Force as an Atlantic staging post, Lungi was modernized into Sierra Leone's principal international airport following national independence in 1961. In 2023, a state-of-the-art international terminal was inaugurated, expanding biometric e-Gates, dual-lane biometric border clearance, and direct transatlantic aviation corridors.",
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
      "Constructed on the southern bank of the Sierra Leone River, Queen Elizabeth II Quay is situated in the largest natural deepwater harbor on the African continent (and the third-largest in the world). The port has served for centuries as a vital maritime trade crossroads between Europe, the Americas, and West Africa.",
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
      "Located at the historic Mano River bridge crossing opposite Bo Waterside in Liberia, Jendema represents a cornerstone of the Mano River Union (MRU) peace and integration framework. Modernized with solar-backed satellite links to the Freetown National Data Hub, Jendema provides continuous border security and traveler clearance.",
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

// -----------------------------------------------------------------------------
// Search Index Data Structure
// -----------------------------------------------------------------------------
interface SearchItem {
  title: string;
  category: "Service" | "Border Checkpoint" | "Visa Type" | "Regulation" | "Portal" | "Contact";
  snippet: string;
  link: string;
  isAnchor?: boolean;
}

const SEARCH_DATABASE: SearchItem[] = [
  {
    title: "Apply for e-Visa (Tourist / Business / Transit)",
    category: "Service",
    snippet: "Submit online visa applications with instant mobile money payment and digital QR clearance.",
    link: "/applicant",
  },
  {
    title: "Tourist e-Visa ($80 USD)",
    category: "Visa Type",
    snippet: "Valid for 30 days single entry. Standard tourist and leisure travel authorization.",
    link: "/applicant",
  },
  {
    title: "Business e-Visa ($160 USD)",
    category: "Visa Type",
    snippet: "Valid for 90 days with single or multiple entry. For corporate, investment, and trade missions.",
    link: "/applicant",
  },
  {
    title: "Transit Visa ($40 USD)",
    category: "Visa Type",
    snippet: "Valid for up to 7 days for travelers with confirmed onward international flight bookings.",
    link: "/applicant",
  },
  {
    title: "FNA Lungi International Airport (FNA-AIR-01)",
    category: "Border Checkpoint",
    snippet: "Main international air terminal with biometric e-Gates and 24/7 border clearance in Port Loko.",
    link: "#borders",
    isAnchor: true,
  },
  {
    title: "Queen Elizabeth II Quay Maritime Port (FNA-SEA-02)",
    category: "Border Checkpoint",
    snippet: "Deepwater maritime seaport processing international cargo, passenger ships, and crew manifests.",
    link: "#borders",
    isAnchor: true,
  },
  {
    title: "Gbalamuya Land Post (KMB-LND-03)",
    category: "Border Checkpoint",
    snippet: "Northern international border crossing with Guinea along the Trans-West African highway in Kambia.",
    link: "#borders",
    isAnchor: true,
  },
  {
    title: "Jendema Border Post (PJH-LND-04)",
    category: "Border Checkpoint",
    snippet: "Southern international crossing point to Liberia across the Mano River bridge in Pujehun.",
    link: "#borders",
    isAnchor: true,
  },
  {
    title: "Koindu International Post (KLH-TRI-05)",
    category: "Border Checkpoint",
    snippet: "Strategic tri-border junction connecting Sierra Leone, Guinea, and Liberia in Kailahun.",
    link: "#borders",
    isAnchor: true,
  },
  {
    title: "Biometric Passport Verification & Registry",
    category: "Service",
    snippet: "ICAO Doc 9303 compliance verification, bio-data validation, and travel document security.",
    link: "/applicant",
  },
  {
    title: "Overstay Regulations & Daily Fines ($50/day)",
    category: "Regulation",
    snippet: "Statutory fine calculation under the Sierra Leone Immigration Act for unapproved overstays.",
    link: "#services",
    isAnchor: true,
  },
  {
    title: "National Headquarters (Gloucester Street, Freetown)",
    category: "Contact",
    snippet: "Central administration desk, passport issuance headquarters, and diplomatic liaison office.",
    link: "/contact",
  },
  {
    title: "24/7 Security Emergency Hotline (999)",
    category: "Contact",
    snippet: "National border surveillance hotline for anti-trafficking and emergency border alerts.",
    link: "/contact",
  },
  {
    title: "Visa Adjudication Directorate (Staff Portal)",
    category: "Portal",
    snippet: "Operational queue for consular officers reviewing visa applications and docket approvals.",
    link: "/visa/portal",
  },
  {
    title: "Border Operations Command (Officer Portal)",
    category: "Portal",
    snippet: "Frontline checkpoint station interface with optical camera QR scanning and watchlist checks.",
    link: "/border/portal",
  },
  {
    title: "Executive Directorate HQ (Admin Console)",
    category: "Portal",
    snippet: "National system management, RBAC user provisioning, audit logging, and centered A4 PDF reports.",
    link: "/admin/portal",
  },
];

export default function PortalGatewayPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bordersDropdownOpen, setBordersDropdownOpen] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckpointDetail | null>(null);
  const [activeOnboardingSlide, setActiveOnboardingSlide] = useState(0);

  // Auto-advance onboarding slides every 6 seconds if not paused
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOnboardingSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Live real-time search logic
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const filtered = SEARCH_DATABASE.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setBordersDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleScrollTo(elementId: string) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  }

  function handleOpenCheckpoint(cp: CheckpointDetail) {
    setSelectedCheckpoint(cp);
    setBordersDropdownOpen(false);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0F172A] font-['Tahoma',sans-serif] flex flex-col justify-between selection:bg-[#1E8E5A] selection:text-white relative overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. Subtle Background Watermark Layer                          */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5 scale-105"
          style={{ backgroundImage: "url('/passport-bg.png')" }}
        />
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-[#1E8E5A]/5 rounded-full blur-[150px]" />
        <div className="absolute top-[35%] right-[10%] w-[650px] h-[650px] bg-[#0B4F6C]/5 rounded-full blur-[170px]" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Top National Tri-Color Strip & Government Top Ticker       */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-50">
        {/* National Ribbon */}
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
                Department of Immigration (SLID) • Official Government Gateway
              </span>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1.5 text-[#166E46] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#1E8E5A] animate-pulse"></span>
                <span>All 5 National Checkpoints Synchronized &amp; Online</span>
              </span>
              <span className="hidden md:inline text-zinc-300">|</span>
              <span className="hidden md:inline text-zinc-600 font-medium">24/7 Sovereign Border Security</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. Classic Executive Navigation Bar                           */}
        {/* ------------------------------------------------------------- */}
        <nav className="border-b border-zinc-200/90 bg-white/95 backdrop-blur-md sticky top-0 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            {/* Clean Logo without artificial background shape */}
            <Link to="/" className="flex items-center gap-3.5 group flex-shrink-0">
              <img
                src="/slid-logo.png"
                alt="Sierra Leone Immigration Department Crest"
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

            {/* Standard Nav Items: Home, About, Services, Borders [Dropdown], Contact */}
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

              {/* BORDERS DROPDOWN */}
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

                {/* Dropdown Menu */}
                {bordersDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in divide-y divide-zinc-100">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#1E8E5A]">
                      National Points of Entry (5 Stations)
                    </div>
                    <div className="py-1 space-y-1">
                      {CHECKPOINTS_DATA.map((cp) => (
                        <button
                          key={cp.id}
                          type="button"
                          onClick={() => handleOpenCheckpoint(cp)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-50 transition cursor-pointer group flex items-start gap-3"
                        >
                          <span className="text-xl p-1 rounded-lg bg-zinc-100 group-hover:scale-110 transition">
                            {cp.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#1E8E5A] transition truncate">
                              {cp.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">
                              {cp.type} • {cp.district}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2 text-center">
                      <Link
                        to="/borders"
                        onClick={() => setBordersDropdownOpen(false)}
                        className="text-[11px] font-semibold text-[#1E8E5A] hover:underline inline-block"
                      >
                        View Full Interactive Borders Map &rarr;
                      </Link>
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
          </div>
        </nav>

        {/* ------------------------------------------------------------- */}
        {/* EXECUTIVE FULL-WIDTH SEARCH STRIP (Directly Beneath Navbar)   */}
        {/* ------------------------------------------------------------- */}
        <div className="border-b border-zinc-200/90 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5">
            {/* Full-Length Search Input */}
            <div className="w-full flex-1 relative" ref={searchContainerRef}>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#1E8E5A] text-base">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search immigration services, visa requirements, border posts, passports, overstay rules (e.g. Lungi Airport, e-Visa, Freetown HQ)..."
                  className="w-full bg-[#F1F5F9]/80 border border-zinc-300 focus:border-[#1E8E5A] rounded-2xl pl-12 pr-28 py-3 text-xs sm:text-sm text-zinc-900 placeholder-zinc-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/20 font-['Tahoma'] transition-all"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-zinc-500 hover:text-zinc-900 text-xs bg-zinc-200 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSearchFocused(true)}
                    className="bg-[#1E8E5A] hover:bg-[#166E46] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs hidden sm:inline-flex items-center gap-1"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Live Search Popup Overlay */}
              {searchFocused && searchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-3 z-50 max-h-80 overflow-y-auto text-left divide-y divide-zinc-100 animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1E8E5A] flex justify-between">
                    <span>Matching System Results ({searchResults.length})</span>
                    <span className="text-zinc-400">Press Esc to close</span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
                      No results found for &ldquo;{searchQuery}&rdquo;. Try searching for &ldquo;visa&rdquo;, &ldquo;lungi&rdquo;, &ldquo;passport&rdquo;, or &ldquo;contact&rdquo;.
                    </div>
                  ) : (
                    <div className="py-1 space-y-1">
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl hover:bg-zinc-50 transition cursor-pointer group"
                          onClick={() => {
                            if (item.isAnchor) {
                              handleScrollTo(item.link.replace("#", ""));
                            }
                            setSearchFocused(false);
                          }}
                        >
                          {item.isAnchor ? (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-zinc-900 group-hover:text-[#1E8E5A] transition">
                                  {item.title}
                                </span>
                                <span className="text-[9px] uppercase font-bold bg-zinc-100 text-[#1E8E5A] px-2 py-0.5 rounded">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 line-clamp-1">{item.snippet}</p>
                            </div>
                          ) : (
                            <Link to={item.link} className="block">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-zinc-900 group-hover:text-[#1E8E5A] transition">
                                  {item.title}
                                </span>
                                <span className="text-[9px] uppercase font-bold bg-zinc-100 text-[#1E8E5A] px-2 py-0.5 rounded">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 line-clamp-1">{item.snippet}</p>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Filter Search Shortcuts */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-600 flex-shrink-0">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Quick:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("e-Visa");
                  setSearchFocused(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition cursor-pointer font-medium"
              >
                ✈️ e-Visa
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("Lungi");
                  setSearchFocused(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition cursor-pointer font-medium"
              >
                🗺️ Lungi
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("Overstay");
                  setSearchFocused(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition cursor-pointer font-medium"
              >
                ⏱️ Overstay
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("Contact");
                  setSearchFocused(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition cursor-pointer font-medium"
              >
                📞 Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Hero Section: Sovereign Branding & Headline                */}
      {/* ------------------------------------------------------------- */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 space-y-16" id="home">
        {/* Clean Hero Header */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Flag Presentation */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative group">
              <SierraLeoneLargeFlag
                width={135}
                height={90}
                className="relative rounded-lg shadow-xl hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Sovereign Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1E8E5A]/10 border border-[#1E8E5A]/25 text-[#1E8E5A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 shadow-2xs">
            <SierraLeoneFlag width={18} height={12} />
            <span>Republic of Sierra Leone • Border &amp; Immigration Gateway</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] mb-5 leading-tight">
            Integrated Immigration &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B4F6C] via-[#0284C7] to-[#1E8E5A]">
              Border Management System
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-zinc-600 leading-relaxed max-w-3xl mx-auto">
            The unified digital infrastructure governing international port clearance, biometric passport registries, e-Visa adjudications, and 24/7 sovereign surveillance across Sierra Leone.
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4b. Interactive Mobile App Onboarding Screen with Background */}
        {/* ------------------------------------------------------------- */}
        <section className="relative rounded-3xl overflow-hidden border border-[#0B4F6C]/20 shadow-2xl bg-[#08131E] text-white">
          {/* High-Impact Background Imagery & Guilloche Watermark */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 filter brightness-110"
              style={{ backgroundImage: "url('/passport-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08131E] via-[#0B3B52]/90 to-[#0F4E38]/85" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E8E5A]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0B4F6C]/30 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[360px]">
            {/* Top Onboarding Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1 shadow-inner">
                  <img src="/slid-logo.png" alt="SLID Crest" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block leading-tight">
                    Interactive System Tour
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    Sierra Leone Immigration Onboarding
                  </h3>
                </div>
              </div>

              {/* Step Navigation Dots */}
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveOnboardingSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeOnboardingSlide === idx ? "w-8 bg-amber-400" : "w-2.5 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Go to Onboarding Step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Active Onboarding Slide Content */}
            <div className="py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                {activeOnboardingSlide === 0 && (
                  <div className="space-y-3 animate-fade-in">
                    <span className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <span>✈️</span>
                      <span>Step 1 of 3 — Digital Identity &amp; Passports</span>
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                      Biometric Traveler Registration &amp; Passport Linking
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                      Securely register your international or ECOWAS passport bio-data with ICAO Doc 9303 compliance. Verify visa-free ECOWAS exemptions and maintain centralized travel clearance in one unified profile.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <Link
                        to="/applicant"
                        className="bg-[#1E8E5A] hover:bg-[#157347] active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-lg flex items-center gap-2"
                      >
                        <span>Start Passport Registration</span>
                        <span>&rarr;</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveOnboardingSlide(1)}
                        className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition cursor-pointer"
                      >
                        Next Step &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {activeOnboardingSlide === 1 && (
                  <div className="space-y-3 animate-fade-in">
                    <span className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <span>🛂</span>
                      <span>Step 2 of 3 — Fast-Track 48-Hour e-Visa Processing</span>
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                      Digital e-Visa Application &amp; Multi-Channel Payments
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                      Apply online for Tourist ($80), Business ($160), or Transit ($40) e-Visas. Pay instantly using Orange Money, AfriMoney, or Debit Cards, and receive an encrypted QR entry permit upon consular approval.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <Link
                        to="/applicant"
                        className="bg-[#D97706] hover:bg-[#B45309] active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-lg flex items-center gap-2"
                      >
                        <span>Apply for e-Visa</span>
                        <span>&rarr;</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveOnboardingSlide(2)}
                        className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition cursor-pointer"
                      >
                        Next Step &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {activeOnboardingSlide === 2 && (
                  <div className="space-y-3 animate-fade-in">
                    <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <span>🛡️</span>
                      <span>Step 3 of 3 — 24/7 Sovereign Border Control</span>
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                      Biometric e-Gates &amp; 5 National Border Stations
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                      Synchronized border clearance across Lungi International Airport, Queen Elizabeth II Quay, Gbalamuya (Guinea), Jendema (Liberia), and Koindu with live watchlist and overstay screening.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <Link
                        to="/borders"
                        className="bg-[#1E8E5A] hover:bg-[#157347] active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-lg flex items-center gap-2"
                      >
                        <span>Explore 5 Checkpoints</span>
                        <span>&rarr;</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveOnboardingSlide(0)}
                        className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition cursor-pointer"
                      >
                        ↺ Replay Tour
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Visual Badge Display */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 max-w-xs w-full text-center space-y-3 shadow-xl">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#1E8E5A] to-[#0B4F6C] p-0.5 shadow-md">
                    <div className="w-full h-full bg-[#081824] rounded-[14px] flex items-center justify-center p-2">
                      <img src="/slid-logo.png" alt="SLID Seal" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Sovereign Gateway
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Republic of Sierra Leone Immigration Department
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-left pt-2 border-t border-white/10">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="text-slate-400 block">Checkpoints</span>
                      <span className="font-bold text-emerald-400">5 Active</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="text-slate-400 block">Turnaround</span>
                      <span className="font-bold text-sky-400">48-72h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 5. The Four Sovereign Role Selection Cards                    */}
        {/* ------------------------------------------------------------- */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Official Role &amp; Gateway Portals
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Select your designated sovereign portal to access specialized services and operational consoles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
            {/* Role 1: Public Traveler & Applicant */}
            <div className="group relative rounded-3xl bg-white border-2 border-sky-100 p-6 shadow-md hover:shadow-xl hover:border-[#0284C7] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284C7] border border-sky-200 flex items-center justify-center text-2xl shadow-xs">
                    ✈️
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-full">
                    Public Portal
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#0284C7] transition">
                  Traveler &amp; Applicant
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                  Apply online for tourist, business, and transit e-Visas, register biometric passports, make mobile money payments, and receive verified QR entry tokens.
                </p>

                <div className="bg-[#F8FAFC] border border-zinc-200/80 rounded-xl p-3 mb-6 space-y-2 text-xs text-zinc-700 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-[#0284C7] font-bold">✓</span>
                    <span>Instant e-Visa Application</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#0284C7] font-bold">✓</span>
                    <span>Orange &amp; AfriMoney Gateway</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#0284C7] font-bold">✓</span>
                    <span>Verified Entry Certificate</span>
                  </div>
                </div>
              </div>

              <Link
                to="/applicant"
                className="w-full block text-center bg-[#0284C7] hover:bg-[#0369A1] text-white py-3 rounded-xl text-xs font-semibold transition shadow-md shadow-sky-900/20 cursor-pointer"
              >
                Enter Traveler Portal &rarr;
              </Link>
            </div>

            {/* Role 2: Visa Adjudication Directorate */}
            <div className="group relative rounded-3xl bg-white border-2 border-amber-100 p-6 shadow-md hover:shadow-xl hover:border-[#D97706] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center text-2xl shadow-xs">
                    🛂
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full">
                    Consular Directorate
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#D97706] transition">
                  Visa Adjudication
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                  Statutory consular queue for reviewing visa dockets, verifying ICAO 9303 bio-data, checking watchlist flags, and issuing cryptographic certificates.
                </p>

                <div className="bg-[#F8FAFC] border border-zinc-200/80 rounded-xl p-3 mb-6 space-y-2 text-xs text-zinc-700 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-[#D97706] font-bold">✓</span>
                    <span>Live Adjudication Queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#D97706] font-bold">✓</span>
                    <span>ICAO Doc 9303 Inspection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#D97706] font-bold">✓</span>
                    <span>Digital Stamping &amp; Resend</span>
                  </div>
                </div>
              </div>

              <Link
                to="/visa/portal"
                className="w-full block text-center bg-[#D97706] hover:bg-[#B45309] text-white py-3 rounded-xl text-xs font-semibold transition shadow-md shadow-amber-900/20 cursor-pointer"
              >
                Visa Directorate Portal &rarr;
              </Link>
            </div>

            {/* Role 3: Border Control & Port Operations */}
            <div className="group relative rounded-3xl bg-white border-2 border-emerald-100 p-6 shadow-md hover:shadow-xl hover:border-[#1E8E5A] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1E8E5A] border border-emerald-200 flex items-center justify-center text-2xl shadow-xs">
                    🛡️
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Border Post
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#1E8E5A] transition">
                  Border Control
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                  Frontline checkpoint surveillance with live camera QR decoding, instant watchlist red alert interceptions, and automated overstay fine enforcement.
                </p>

                <div className="bg-[#F8FAFC] border border-zinc-200/80 rounded-xl p-3 mb-6 space-y-2 text-xs text-zinc-700 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-[#1E8E5A] font-bold">✓</span>
                    <span>Optical Camera QR Scanner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1E8E5A] font-bold">✓</span>
                    <span>Watchlist Interception Desk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1E8E5A] font-bold">✓</span>
                    <span>Overstay Penalty Matrix</span>
                  </div>
                </div>
              </div>

              <Link
                to="/border/portal"
                className="w-full block text-center bg-[#1E8E5A] hover:bg-[#166E46] text-white py-3 rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-900/20 cursor-pointer"
              >
                Border Command Portal &rarr;
              </Link>
            </div>

            {/* Role 4: Directorate Headquarters & Administration */}
            <div className="group relative rounded-3xl bg-white border-2 border-purple-100 p-6 shadow-md hover:shadow-xl hover:border-[#7C3AED] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] border border-purple-200 flex items-center justify-center text-2xl shadow-xs">
                    🏛️
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-full">
                    Directorate HQ
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#7C3AED] transition">
                  Executive Admin
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                  Central registry governance, RBAC officer provisioning, automated email credentials dispatch, cryptographic audit logging, and centered A4 PDF reports.
                </p>

                <div className="bg-[#F8FAFC] border border-zinc-200/80 rounded-xl p-3 mb-6 space-y-2 text-xs text-zinc-700 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-[#7C3AED] font-bold">✓</span>
                    <span>User RBAC &amp; Email Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#7C3AED] font-bold">✓</span>
                    <span>Cryptographic Audit Ledger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#7C3AED] font-bold">✓</span>
                    <span>Centered A4 PDF Intelligence</span>
                  </div>
                </div>
              </div>

              <Link
                to="/admin/portal"
                className="w-full block text-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl text-xs font-semibold transition shadow-md shadow-purple-900/20 cursor-pointer"
              >
                Directorate HQ Portal &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 6. About Section                                              */}
        {/* ------------------------------------------------------------- */}
        <section className="bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8" id="about">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1E8E5A] uppercase tracking-wider">
                <span>🏛️ Statutory Mandate &amp; Institutional Authority</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                About the Sierra Leone Immigration Department (SLID)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                The Sierra Leone Immigration Department is the statutory security and consular agency operating under the executive authority of the Republic of Sierra Leone. SLID is tasked with regulating the entry, residence, and exit of all persons, administering biometric passports, adjudicating visas, and safeguarding national sovereignty across international air, sea, and land frontiers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-zinc-200/80">
                  <h4 className="text-sm font-bold text-[#1E8E5A] mb-1">Our Mission</h4>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    To deliver transparent, secure, and technologically advanced immigration services while fiercely defending national borders.
                  </p>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-zinc-200/80">
                  <h4 className="text-sm font-bold text-[#0284C7] mb-1">Our Vision</h4>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    To establish a world-class, biometric-driven border management infrastructure recognized for integrity and sub-second clearance.
                  </p>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-zinc-200/80">
                  <h4 className="text-sm font-bold text-[#D97706] mb-1">Core Values</h4>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Integrity, Sovereign Security, National Service, Transparency, and Compliance with Statutory Law.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-72 bg-[#F8FAFC] border border-zinc-200/80 rounded-2xl p-6 text-center flex-shrink-0">
              <img
                src="/slid-logo.png"
                alt="SLID Crest"
                className="w-24 h-24 mx-auto mb-3 object-contain filter drop-shadow-sm"
              />
              <p className="text-xs font-bold text-[#0F172A]">Department of Immigration</p>
              <p className="text-[10px] text-[#1E8E5A] font-mono mt-1">Gloucester Street HQ, Freetown</p>
              <div className="mt-4 pt-4 border-t border-zinc-200 text-[10px] text-zinc-500 space-y-1">
                <p>Statutory Act: Immigration Act</p>
                <p>Authority: National Security Council</p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 7. Services Section                                           */}
        {/* ------------------------------------------------------------- */}
        <section className="space-y-8" id="services">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1E8E5A] uppercase tracking-wider mb-2">
              <span>📑 Digital Public Services</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Official Immigration Services
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              End-to-end statutory border clearance, visa issuance, and passport verification services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-zinc-200/90 rounded-3xl hover:border-[#1E8E5A] transition shadow-sm">
              <div className="text-3xl mb-3">✈️</div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Electronic Visa (e-Visa) Issuance</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Fast-track digital visa processing for international travelers, tourists, business delegates, and transit visitors with verified QR codes.
              </p>
              <ul className="text-xs space-y-1.5 text-zinc-600">
                <li className="flex items-center gap-1.5 text-zinc-800">
                  <span className="text-[#1E8E5A] font-bold">✓</span> Single &amp; Multiple Entry Visas
                </li>
                <li className="flex items-center gap-1.5 text-zinc-800">
                  <span className="text-[#1E8E5A] font-bold">✓</span> Automated Mobile Payment Ledgers
                </li>
                <li className="flex items-center gap-1.5 text-zinc-800">
                  <span className="text-[#1E8E5A] font-bold">✓</span> Resend Automated Email Dispatch
                </li>
              </ul>
            </div>

            <div className="p-6 bg-white border border-zinc-200/90 rounded-3xl hover:border-[#0284C7] transition shadow-sm">
              <div className="text-3xl mb-3">🛂</div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Biometric Passport Registry</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Secure registry of Sierra Leonean and international travel documents meeting ICAO Doc 9303 standards with automatic 6-month validity checks.
              </p>
              <ul className="text-xs space-y-1.5 text-zinc-600">
                <li className="flex items-center gap-1.5 text-zinc-800">
                  <span className="text-[#0284C7] font-bold">✓</span> ICAO Doc 9303 Verification
                </li>
                <li className="flex items-center gap-1.5 text-zinc-800">
                  <span className="text-[#0284C7] font-bold">✓</span> 6-Month Expiration Alert Protocol
                </li>
                <li className="flex items-center gap-1.5 text-zinc-800">
                  <span className="text-[#0284C7] font-bold">✓</span> Integrated Bio-Data Cross-Matching
                </li>
              </ul>
            </div>

            <div className="p-6 bg-white border border-zinc-200/90 rounded-3xl hover:border-[#D97706] transition shadow-sm">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Overstay Administration ($50/day)</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Automated duration-of-stay tracking and statutory fine calculations under the Sierra Leone Immigration Act to prevent unauthorized overstays.
              </p>
              <ul className="text-xs space-y-1.5 text-zinc-600">
                <li className="flex items-center gap-1.5 text-zinc-800">
                  <span className="text-[#D97706] font-bold">✓</span> Standard Fine: $50.00 USD per day
                </li>
                <li className="flex items-center gap-1.5 text-zinc-800">
                  <span className="text-[#D97706] font-bold">✓</span> Automated Revenue Audit Trail
                </li>
                <li className="flex items-center gap-1.5 text-zinc-800">
                  <span className="text-[#D97706] font-bold">✓</span> Exit Clearance Authorization Receipt
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 8. Borders Grid Section (5 Stations)                          */}
        {/* ------------------------------------------------------------- */}
        <section className="space-y-8" id="borders">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1E8E5A] uppercase tracking-wider mb-2">
              <span>🗺️ National Surveillance Grid</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Designated National Checkpoints
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Click on any authorized border post to inspect history, district coordinates, facilities, and station commanders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHECKPOINTS_DATA.map((cp) => (
              <div
                key={cp.id}
                onClick={() => handleOpenCheckpoint(cp)}
                className="p-6 bg-white border border-zinc-200/90 rounded-3xl hover:border-[#1E8E5A] transition cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-1.5 rounded-xl bg-zinc-100 group-hover:scale-110 transition">
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

                  <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-zinc-200/80 space-y-1 text-xs text-zinc-500 mb-4">
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="font-mono text-[#1E8E5A] font-semibold">{cp.coordinates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hours:</span>
                      <span className="text-zinc-800 font-medium">{cp.operatingHours}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-[#1E8E5A]">
                  <span>Station Online</span>
                  <span className="group-hover:underline flex items-center gap-1">
                    <span>Inspect Details</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 9. Contact & Headquarters Section                             */}
        {/* ------------------------------------------------------------- */}
        <section className="bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8" id="contact">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1E8E5A] uppercase tracking-wider mb-2">
              <span>✉️ Communications &amp; Inquiries</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Contact Immigration Headquarters
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Official channels for diplomatic inquiries, visa status verification, and emergency consular assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-zinc-200/80 space-y-2">
              <span className="text-2xl">🏛️</span>
              <h4 className="font-bold text-[#0F172A] text-sm">National Headquarters</h4>
              <p className="text-zinc-600 leading-relaxed">
                Gloucester Street, Freetown, Western Area, Republic of Sierra Leone
              </p>
              <p className="text-[#1E8E5A] font-mono font-bold pt-2">contact@slid.gov.sl</p>
            </div>

            <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-zinc-200/80 space-y-2">
              <span className="text-2xl">📞</span>
              <h4 className="font-bold text-[#0F172A] text-sm">Telephone Helpdesk</h4>
              <p className="text-zinc-600 leading-relaxed">
                General inquiries, passport status tracking, and visa appointments
              </p>
              <p className="text-[#0B4F6C] font-mono font-bold pt-2">+232 22 222 411 / +232 22 223 999</p>
            </div>

            <div className="p-6 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
              <span className="text-2xl">🚨</span>
              <h4 className="font-bold text-rose-800 text-sm">24/7 Security Emergency Hotline</h4>
              <p className="text-zinc-600 leading-relaxed">
                Border surveillance interceptions, counter-smuggling, and urgent alerts
              </p>
              <p className="text-rose-700 font-mono font-bold pt-2">Toll-Free Hotline: 999 (SLID Desk)</p>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 10. Checkpoint Detail Intelligence Modal                      */}
      {/* ------------------------------------------------------------- */}
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

      {/* ------------------------------------------------------------- */}
      {/* 11. Official Sovereign Regulatory Footer                      */}
      {/* ------------------------------------------------------------- */}
      <PublicFooter />
    </div>
  );
}
