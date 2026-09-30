import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Plane, Ship, ShieldCheck, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { ApplicantLayout } from "../../components/ApplicantLayout";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";

interface Checkpoint {
  checkpoint_id?: string;
  name: string;
  location: string;
  checkpoint_type: "airport" | "seaport" | "land" | string;
  is_active?: boolean;
}

const DEFAULT_CHECKPOINTS: Checkpoint[] = [
  {
    name: "Freetown-Lungi International Airport (FNA)",
    location: "Lungi, Port Loko District",
    checkpoint_type: "airport",
  },
  {
    name: "Queen Elizabeth II Quay (Deep Water Quay)",
    location: "Cline Town, Freetown",
    checkpoint_type: "seaport",
  },
  {
    name: "Gbalamuya Post",
    location: "Kambia, Guinea border",
    checkpoint_type: "land",
  },
  {
    name: "Jendema Post",
    location: "Pujehun, Liberia border",
    checkpoint_type: "land",
  },
  {
    name: "Koindu Post",
    location: "Kailahun, tri-border area",
    checkpoint_type: "land",
  },
];

export default function BordersPage() {
  const { profile } = useAuth();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCheckpoints() {
      const { data } = await supabase
        .from("checkpoints")
        .select("checkpoint_id, name, location, checkpoint_type, is_active")
        .order("name");

      if (data && data.length > 0) {
        setCheckpoints(data as Checkpoint[]);
      } else {
        setCheckpoints(DEFAULT_CHECKPOINTS);
      }
      setLoading(false);
    }
    loadCheckpoints();
  }, []);

  // Filtered checkpoints
  const filteredCheckpoints = checkpoints.filter((cp) => {
    const typeMatch =
      typeFilter === "All" ||
      cp.checkpoint_type.toLowerCase() === typeFilter.toLowerCase();

    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      !query ||
      cp.name.toLowerCase().includes(query) ||
      cp.location.toLowerCase().includes(query) ||
      cp.checkpoint_type.toLowerCase().includes(query);

    return typeMatch && searchMatch;
  });

  const content = (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-[#002B49] text-white p-6 sm:p-8 rounded-lg shadow-sm border-b-4 border-zinc-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SierraLeoneFlag width={18} height={12} />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
              Department of Immigration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Official Border Checkpoints Directory
          </h1>
          <p className="text-sm text-zinc-200 mt-1 max-w-2xl">
            Explore official ports of entry into Sierra Leone, filtering by airports, seaports, and land border posts.
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2 rounded text-right border border-white/20 shrink-0">
          <p className="text-xs font-bold text-zinc-300 uppercase">Active Entry Posts</p>
          <p className="text-2xl font-mono font-bold text-white">{checkpoints.length}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Box */}
      <div className="bg-white border border-zinc-300 p-4 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-300 rounded focus:outline-none focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49]"
            placeholder="Search by checkpoint name, district, or border location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Airport", "Seaport", "Land"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                typeFilter === t
                  ? "bg-[#002B49] text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Checkpoints Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">
          <div className="w-8 h-8 border-4 border-[#002B49] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading official border checkpoints...
        </div>
      ) : filteredCheckpoints.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm border-2 border-dashed border-zinc-300 rounded bg-white">
          No border checkpoints found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCheckpoints.map((cp, idx) => {
            const isAirport = cp.checkpoint_type.toLowerCase().includes("air");
            const isSeaport = cp.checkpoint_type.toLowerCase().includes("sea");

            return (
              <div
                key={cp.checkpoint_id || idx}
                className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#002B49] transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-zinc-100 text-zinc-800 border-zinc-300">
                        {cp.checkpoint_type.toUpperCase()}
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 mt-2 leading-snug">
                        {cp.name}
                      </h3>
                    </div>
                    <div className="p-2 rounded bg-zinc-100 text-[#002B49] shrink-0">
                      {isAirport ? (
                        <Plane size={20} />
                      ) : isSeaport ? (
                        <Ship size={20} />
                      ) : (
                        <MapPin size={20} />
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Location / District</p>
                    <p className="text-sm font-semibold text-zinc-900 mt-0.5">{cp.location}</p>
                  </div>

                  {/* General "At the Checkpoint" Traveler Expectations Note */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1">
                    <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#002B49]" />
                      <span>At the Checkpoint:</span>
                    </p>
                    <p className="text-zinc-600 leading-relaxed text-[11px]">
                      Present your valid passport and your digital visa QR code to the border control officer at the desk for clearance.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (profile) {
    return <ApplicantLayout>{content}</ApplicantLayout>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-sans flex flex-col justify-between">
      {/* Public Header */}
      <header className="bg-[#002B49] text-white px-4 sm:px-8 py-4 border-b-4 border-zinc-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/slid-logo.png" alt="Sierra Leone Crest" className="w-10 h-10 object-contain" />
            <div>
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Republic of Sierra Leone</p>
              <h1 className="text-lg font-bold text-white">Department of Immigration (SLID)</h1>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-xs font-bold">
            <Link to="/" className="text-zinc-200 hover:text-white">Home</Link>
            <Link to="/login" className="bg-white text-[#002B49] px-3.5 py-1.5 rounded">Sign In</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {content}
      </main>
    </div>
  );
}
