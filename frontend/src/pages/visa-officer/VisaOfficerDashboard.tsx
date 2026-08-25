import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { OfficerNavbar } from "../../components/OfficerNavbar";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";

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
  { key: "submitted", label: "New Submissions", icon: "📥" },
  { key: "under_review", label: "Under Review", icon: "🔍" },
  { key: "documents_requested", label: "Awaiting Documents", icon: "⏳" },
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
    <div className="min-h-screen bg-[#F8FAFC] text-ink font-['Tahoma',sans-serif]">
      <OfficerNavbar title="Visa Adjudication &amp; Consular Portal" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Consular Sovereign Hero Header */}
        <div className="bg-gradient-to-r from-[#0B4F6C] via-[#093e56] to-[#D97706] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <SierraLeoneFlag width={18} height={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                Republic of Sierra Leone • Consular &amp; Visa Directorate
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Visa Adjudication Queue
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-xl">
              Examine applicant credentials, verify security checklists, review supporting biometric data, and issue electronic visas.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-amber-300">Active Queue Count</p>
              <p className="text-xl font-bold font-mono text-white">{applications.length} cases</p>
            </div>
            <span className="text-2xl">📋</span>
          </div>
        </div>

        {/* 2. Interactive Filter Tabs */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-primary-light/70 shadow-sm w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                filter === f.key
                  ? "bg-[#0B4F6C] text-white shadow-md shadow-sky-950/20"
                  : "text-ink-soft hover:text-ink hover:bg-canvas"
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              {filter === f.key && (
                <span className="bg-white/20 text-white px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ml-1">
                  {applications.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 3. Review Queue List */}
        <SecurityPaperPanel className="p-6 sm:p-8" showRosette>
          {loading ? (
            <div className="p-12 text-center text-ink-soft text-sm">
              <div className="w-8 h-8 border-3 border-[#0B4F6C] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading adjudication cases...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-primary-light/80 rounded-2xl bg-white/50">
              <span className="text-4xl block mb-2">✅</span>
              <p className="text-sm font-bold text-ink">No Applications In This Queue</p>
              <p className="text-xs text-ink-soft mt-1 max-w-sm mx-auto">
                All submitted filings in this category have been processed or moved forward in the review workflow.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-primary-light/60">
              {applications.map((app) => (
                <div
                  key={app.application_id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-canvas/50 px-3 rounded-xl transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B4F6C] bg-sky-100 border border-sky-300 px-2.5 py-0.5 rounded-full">
                        {app.application_ref}
                      </span>
                      <span className="text-xs font-bold text-ink">
                        {app.passports?.users?.full_name || "Applicant Name"}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-ink">
                      {app.visa_types?.name ?? "Visa Application"}
                    </p>

                    <p className="text-xs text-ink-soft">
                      Passport: <span className="font-mono font-semibold text-primary">{app.passports?.passport_number || "N/A"}</span> · Submitted:{" "}
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    to={`/visa-officer/review/${app.application_id}`}
                    className="bg-[#0B4F6C] hover:bg-[#083a50] text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm whitespace-nowrap flex items-center gap-1.5"
                  >
                    <span>Open Case File</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </SecurityPaperPanel>
      </main>
    </div>
  );
}
