import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { GovHeader, GovFooter } from "../../components/GovHeader";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";
import { ClipboardList, Filter, ArrowRight, Eye, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

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
  { key: "submitted", label: "New Submissions" },
  { key: "under_review", label: "Under Review" },
  { key: "documents_requested", label: "Awaiting Documents" },
] as const;

export default function VisaOfficerDashboard() {
  const [applications, setApplications] = useState<QueueApplication[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("submitted");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      setLoading(true);
      const { data } = await supabase
        .from("visa_applications")
        .select(
          "application_id, application_ref, status, submitted_at, intended_arrival_date, visa_types(name), passports(passport_number, users(full_name))"
        )
        .eq("status", filter)
        .order("submitted_at", { ascending: true });

      setApplications((data as any) ?? []);
      setLoading(false);
    }

    loadQueue();
  }, [filter]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Tahoma',sans-serif] flex flex-col">
      <GovHeader
        portalTitle="Consular Directorate"
        portalSubtitle="Visa Adjudication Queue"
        breadcrumbs={[
          { name: "Consular Gateway", path: "/visa-officer" },
          { name: "Adjudication Queue" },
        ]}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Header Summary */}
        <div className="bg-[#0B4F6C] text-white p-6 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4 border-l-8 border-amber-400">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SierraLeoneFlag width={18} height={12} />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Visa Adjudication Workstation
              </span>
            </div>
            <h1 className="text-2xl font-bold">Officer Adjudication Queue</h1>
            <p className="text-xs text-sky-100 mt-1">
              Examine applicant credentials, verify security checklists, review supporting document files, and adjudicate entry visas.
            </p>
          </div>

          <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-right">
            <p className="text-[10px] uppercase font-bold text-amber-300">Queue Cases</p>
            <p className="text-2xl font-mono font-bold">{applications.length}</p>
          </div>
        </div>

        {/* GOV Filter Toolbar */}
        <div className="bg-white border border-slate-300 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#0B4F6C]" />
            <span className="text-xs font-bold text-slate-700 uppercase">Filter Queue:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none ${
                  filter === f.key
                    ? "bg-[#0B4F6C] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{f.label}</span>
                {filter === f.key && (
                  <span className="ml-1.5 bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                    {applications.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Adjudication Work Queue Table */}
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            Active Adjudication Work Queue
          </h2>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <div className="w-8 h-8 border-3 border-[#0B4F6C] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading adjudication cases...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-300 rounded-lg">
              No pending applications in this queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Applicant Name</th>
                    <th className="py-2.5 px-3">Visa Type</th>
                    <th className="py-2.5 px-3">Passport</th>
                    <th className="py-2.5 px-3">Status Tag</th>
                    <th className="py-2.5 px-3 text-right">Adjudicate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {applications.map((app) => {
                    const tag =
                      app.status === "documents_requested"
                        ? { label: "Action Needed", class: "bg-amber-100 text-amber-900 border-amber-300" }
                        : app.status === "under_review"
                        ? { label: "Under Review", class: "bg-sky-100 text-sky-900 border-sky-300" }
                        : { label: "Submitted", class: "bg-emerald-100 text-emerald-900 border-emerald-300" };

                    return (
                      <tr key={app.application_id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {app.application_ref}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {app.passports?.users?.full_name || "Applicant Name"}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-semibold">
                          {app.visa_types?.name || "Entry Visa"}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {app.passports?.passport_number || "—"}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded border font-bold ${tag.class}`}>
                            {tag.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/visa-officer/review/${app.application_id}`}
                            className="bg-[#0B4F6C] hover:bg-[#083a50] text-white font-bold px-3 py-1.5 rounded transition text-xs inline-flex items-center gap-1 focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                          >
                            <span>Open Case</span>
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
