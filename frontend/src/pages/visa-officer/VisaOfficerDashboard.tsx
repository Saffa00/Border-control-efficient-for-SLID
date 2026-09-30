import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { GovHeader, GovFooter } from "../../components/GovHeader";
import { Filter, ArrowRight, Search, ArrowUpDown, Clock } from "lucide-react";

interface QueueApplication {
  application_id: string;
  application_ref: string;
  status: "submitted" | "under_review" | "documents_requested";
  submitted_at: string;
  intended_arrival_date: string | null;
  visa_types: { name: string } | null;
  passports: { passport_number: string; users: { full_name: string } | null } | null;
}

const FILTERS = [
  { key: "all", label: "All Active Queue" },
  { key: "submitted", label: "New Submissions" },
  { key: "under_review", label: "Under Review" },
  { key: "documents_requested", label: "Awaiting Documents" },
] as const;

type SortField = "application_ref" | "full_name" | "submitted_at" | "intended_arrival_date" | "status";

export default function VisaOfficerDashboard() {
  const [applications, setApplications] = useState<QueueApplication[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("submitted_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      setLoading(true);
      let query = supabase
        .from("visa_applications")
        .select(
          "application_id, application_ref, status, submitted_at, intended_arrival_date, visa_types(name), passports(passport_number, users(full_name))"
        )
        .in("status", ["submitted", "under_review", "documents_requested"])
        .order("submitted_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data } = await query;
      setApplications((data as any) ?? []);
      setLoading(false);
    }

    loadQueue();
  }, [filter]);

  // Search & Filter
  const filteredAndSortedApps = useMemo(() => {
    let list = [...applications];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((app) => {
        const ref = app.application_ref.toLowerCase();
        const name = (app.passports?.users?.full_name ?? "").toLowerCase();
        const ppt = (app.passports?.passport_number ?? "").toLowerCase();
        const visa = (app.visa_types?.name ?? "").toLowerCase();
        return ref.includes(q) || name.includes(q) || ppt.includes(q) || visa.includes(q);
      });
    }

    list.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (sortField === "application_ref") {
        valA = a.application_ref;
        valB = b.application_ref;
      } else if (sortField === "full_name") {
        valA = a.passports?.users?.full_name ?? "";
        valB = b.passports?.users?.full_name ?? "";
      } else if (sortField === "submitted_at") {
        valA = new Date(a.submitted_at).getTime();
        valB = new Date(b.submitted_at).getTime();
      } else if (sortField === "intended_arrival_date") {
        valA = a.intended_arrival_date ? new Date(a.intended_arrival_date).getTime() : 0;
        valB = b.intended_arrival_date ? new Date(b.intended_arrival_date).getTime() : 0;
      } else if (sortField === "status") {
        valA = a.status;
        valB = b.status;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [applications, searchQuery, sortField, sortAsc]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  function calculateDaysPending(submittedAt: string) {
    const diff = Date.now() - new Date(submittedAt).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? "Today" : `${days}d ago`;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-sans flex flex-col justify-between">
      <GovHeader
        portalTitle="Consular Directorate"
        portalSubtitle="Visa Adjudication Queue"
        breadcrumbs={[
          { name: "Consular Gateway", path: "/visa-officer" },
          { name: "Adjudication Queue" },
        ]}
      />

      <main id="main-content" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* Header Summary */}
        <div className="bg-[#002B49] text-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-[#107C41]">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#107C41] bg-white px-2.5 py-1 rounded">
              Republic of Sierra Leone • Consular Service
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
              Visa Officer Adjudication Queue
            </h1>
            <p className="text-sm text-zinc-200 mt-1 max-w-2xl">
              Examine applicant filings, verify passport authenticity, review uploaded documents, and issue digital visas.
            </p>
          </div>

          <div className="bg-white/10 px-4 py-2.5 rounded border border-white/20 text-right shrink-0">
            <p className="text-xs uppercase font-bold text-emerald-300">Pending Filings</p>
            <p className="text-3xl font-mono font-bold">{applications.length}</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-zinc-300 p-4 rounded-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-300 rounded focus:outline-none focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49]"
              placeholder="Search by reference, applicant name, passport number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-[#002B49] hidden sm:block" />
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition focus:ring-2 focus:ring-[#002B49] cursor-pointer ${
                  filter === f.key
                    ? "bg-[#002B49] text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Work Queue Table */}
        <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h2 className="text-lg font-bold text-zinc-900">
              Active Application Work Queue ({filteredAndSortedApps.length})
            </h2>
            <span className="text-xs text-zinc-500 font-medium">Click headers to sort</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              <div className="w-8 h-8 border-4 border-[#002B49] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading adjudication cases...
            </div>
          ) : filteredAndSortedApps.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm border-2 border-dashed border-zinc-300 rounded">
              No matching applications found in this queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-900 bg-zinc-100 text-zinc-900 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 cursor-pointer hover:bg-zinc-200" onClick={() => handleSort("application_ref")}>
                      <div className="flex items-center gap-1">
                        <span>Ref #</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-3 cursor-pointer hover:bg-zinc-200" onClick={() => handleSort("full_name")}>
                      <div className="flex items-center gap-1">
                        <span>Applicant Name</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-3">Visa Type</th>
                    <th className="py-3 px-3">Passport #</th>
                    <th className="py-3 px-3 cursor-pointer hover:bg-zinc-200" onClick={() => handleSort("intended_arrival_date")}>
                      <div className="flex items-center gap-1">
                        <span>Arrival Date</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-3 cursor-pointer hover:bg-zinc-200" onClick={() => handleSort("submitted_at")}>
                      <div className="flex items-center gap-1">
                        <span>Age</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-3 cursor-pointer hover:bg-zinc-200" onClick={() => handleSort("status")}>
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredAndSortedApps.map((app) => {
                    const daysText = calculateDaysPending(app.submitted_at);
                    const tag =
                      app.status === "documents_requested"
                        ? { label: "Action Needed", class: "bg-amber-100 text-amber-950 border-amber-300" }
                        : app.status === "under_review"
                        ? { label: "Under Review", class: "bg-sky-100 text-sky-950 border-sky-300" }
                        : { label: "Submitted", class: "bg-emerald-100 text-emerald-950 border-emerald-300" };

                    return (
                      <tr key={app.application_id} className="hover:bg-zinc-50 transition">
                        <td className="py-3.5 px-3 font-mono font-bold text-[#002B49]">
                          {app.application_ref}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-zinc-900">
                          {app.passports?.users?.full_name || "Applicant Name"}
                        </td>
                        <td className="py-3.5 px-3 text-zinc-700 font-medium">
                          {app.visa_types?.name || "Entry Visa"}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-zinc-800 font-semibold">
                          {app.passports?.passport_number || "—"}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-zinc-700">
                          {app.intended_arrival_date || "—"}
                        </td>
                        <td className="py-3.5 px-3 text-zinc-700 font-semibold flex items-center gap-1 mt-1">
                          <Clock size={12} className="text-zinc-500" />
                          <span>{daysText}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded border font-bold ${tag.class}`}>
                            {tag.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Link
                            to={`/visa-officer/review/${app.application_id}`}
                            className="bg-[#002B49] hover:bg-[#001D33] text-white font-bold px-3 py-1.5 rounded transition text-xs inline-flex items-center gap-1.5 focus:ring-2 focus:ring-[#002B49]"
                          >
                            <span>Adjudicate</span>
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
