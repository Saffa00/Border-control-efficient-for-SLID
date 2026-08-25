import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { AdminNavbar } from "../../components/AdminNavbar";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";

const STATUS_COLORS: Record<string, string> = {
  draft: "#94A3B8",
  submitted: "#0284C7",
  under_review: "#D97706",
  documents_requested: "#EA580C",
  approved: "#1E8E5A",
  rejected: "#DC2626",
};

const RISK_COLORS: Record<string, string> = {
  cleared: "#1E8E5A",
  secondary_screening: "#D97706",
  refused: "#DC2626",
};

interface KPI {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  subtext: string;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [statusData, setStatusData] = useState<{ status: string; count: number }[]>([]);
  const [checkpointData, setCheckpointData] = useState<{ checkpoint: string; crossings: number }[]>([]);
  const [decisionData, setDecisionData] = useState<{ decision: string; count: number }[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      const [appsRes, logsRes, overstayRes, watchlistRes] = await Promise.all([
        supabase.from("visa_applications").select("status"),
        supabase.from("border_logs").select("decision, checkpoint_id, checkpoints(name)"),
        supabase.from("overstaying_travelers").select("passport_id", { count: "exact", head: true }),
        supabase.from("watchlist").select("watchlist_id", { count: "exact", head: true }),
      ]);

      // Applications by status
      const statusCounts: Record<string, number> = {};
      (appsRes.data ?? []).forEach((a) => {
        statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
      });
      setStatusData(
        Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
      );

      // Crossings by checkpoint
      const checkpointCounts: Record<string, number> = {};
      (logsRes.data ?? []).forEach((l: any) => {
        const name = l.checkpoints?.name ?? "Unknown";
        checkpointCounts[name] = (checkpointCounts[name] ?? 0) + 1;
      });
      setCheckpointData(
        Object.entries(checkpointCounts).map(([checkpoint, crossings]) => ({ checkpoint, crossings }))
      );

      // Decisions breakdown
      const decisionCounts: Record<string, number> = {};
      (logsRes.data ?? []).forEach((l: any) => {
        decisionCounts[l.decision] = (decisionCounts[l.decision] ?? 0) + 1;
      });
      setDecisionData(
        Object.entries(decisionCounts).map(([decision, count]) => ({ decision, count }))
      );

      setKpis([
        {
          label: "Total Applications",
          value: appsRes.data?.length ?? 0,
          icon: "📑",
          color: "text-[#0B4F6C]",
          borderColor: "border-sky-200",
          bgColor: "bg-sky-50",
          subtext: "e-Visa Filings Registry",
        },
        {
          label: "Border Crossings",
          value: logsRes.data?.length ?? 0,
          icon: "🛂",
          color: "text-[#1E8E5A]",
          borderColor: "border-emerald-200",
          bgColor: "bg-emerald-50",
          subtext: "Logged at 5 Checkpoints",
        },
        {
          label: "Active Overstays",
          value: overstayRes.count ?? 0,
          icon: "⏳",
          color: "text-amber-700",
          borderColor: "border-amber-200",
          bgColor: "bg-amber-50",
          subtext: "$50/Day Penalty Ledger",
        },
        {
          label: "Watchlist Interceptions",
          value: watchlistRes.count ?? 0,
          icon: "🚨",
          color: "text-purple-700",
          borderColor: "border-purple-200",
          bgColor: "bg-purple-50",
          subtext: "INTERPOL & Security Desk",
        },
      ]);

      setLoading(false);
    }

    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-ink font-['Tahoma',sans-serif]">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Executive Directorate Sovereign Header */}
        <div className="bg-gradient-to-r from-[#4C1D95] via-[#3B0764] to-[#1E8E5A] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <SierraLeoneFlag width={18} height={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                Republic of Sierra Leone • Directorate Headquarters
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Command Center &amp; National Analytics
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl">
              Real-time oversight of national border checkpoints, biometric passport records, visa adjudication throughput, and revenue ledgers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 relative z-10">
            <Link
              to="/admin/users"
              className="bg-[#1E8E5A] hover:bg-[#166E46] text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-lg flex items-center gap-1.5"
            >
              <span>👥</span>
              <span>+ Provision Staff</span>
            </Link>
            <Link
              to="/admin/reports"
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition backdrop-blur-md flex items-center gap-1.5"
            >
              <span>📑</span>
              <span>A4 PDF Reports</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-ink-soft text-sm">
            <div className="w-8 h-8 border-3 border-[#4C1D95] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Synthesizing nationwide immigration intelligence...
          </div>
        ) : (
          <>
            {/* 2. 4 Sovereign KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className={`bg-white border-2 ${kpi.borderColor} rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`p-2 rounded-xl ${kpi.bgColor} text-xl`}>
                      {kpi.icon}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                      Live Metric
                    </span>
                  </div>
                  <div>
                    <p className={`font-mono text-3xl font-bold ${kpi.color}`}>
                      {kpi.value}
                    </p>
                    <p className="text-xs font-bold text-ink mt-1">{kpi.label}</p>
                    <p className="text-[10px] text-ink-soft mt-0.5">{kpi.subtext}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Visa Applications by Status */}
            <SecurityPaperPanel className="p-6 sm:p-8" showRosette>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-primary-light/60">
                <div>
                  <h2 className="text-base font-bold text-ink flex items-center gap-2">
                    <span>📊</span>
                    <span>Visa Applications by Adjudication Status</span>
                  </h2>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Real-time distribution across submitted, under review, approved, and rejected filings
                  </p>
                </div>
              </div>

              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      tickFormatter={(v) => v.replace("_", " ")}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#475569" }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {statusData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#0B4F6C"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-primary-light/80 rounded-2xl bg-white/50">
                  <p className="text-sm font-semibold text-ink">No Visa Applications Submitted Yet</p>
                  <p className="text-xs text-ink-soft mt-1">
                    When applicants file via the public portal, real-time statistics will populate here.
                  </p>
                </div>
              )}
            </SecurityPaperPanel>

            {/* 4. Crossings & Decision Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crossings by checkpoint */}
              <SecurityPaperPanel className="p-6 sm:p-8">
                <h2 className="text-base font-bold text-ink mb-1 flex items-center gap-2">
                  <span>🗺️</span>
                  <span>Crossings by Point of Entry</span>
                </h2>
                <p className="text-xs text-ink-soft mb-6">Traffic volume across all 5 national stations</p>

                {checkpointData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={checkpointData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#475569" }} allowDecimals={false} />
                      <YAxis
                        dataKey="checkpoint"
                        type="category"
                        width={130}
                        tick={{ fontSize: 11, fill: "#475569" }}
                      />
                      <Tooltip />
                      <Bar dataKey="crossings" fill="#1E8E5A" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-primary-light/80 rounded-2xl bg-white/50">
                    <p className="text-sm font-semibold text-ink">No Border Crossings Recorded</p>
                    <p className="text-xs text-ink-soft mt-1">
                      Check-in events processed at air, land, and sea checkpoints will appear here.
                    </p>
                  </div>
                )}
              </SecurityPaperPanel>

              {/* Decision breakdown */}
              <SecurityPaperPanel className="p-6 sm:p-8">
                <h2 className="text-base font-bold text-ink mb-1 flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Border Clearance Decisions</span>
                </h2>
                <p className="text-xs text-ink-soft mb-6">Cleared vs. secondary screening vs. refused</p>

                {decisionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={decisionData}
                        dataKey="count"
                        nameKey="decision"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {decisionData.map((entry) => (
                          <Cell key={entry.decision} fill={RISK_COLORS[entry.decision] ?? "#94A3B8"} />
                        ))}
                      </Pie>
                      <Legend
                        formatter={(value) => value.replace("_", " ")}
                        wrapperStyle={{ fontSize: 11 }}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-primary-light/80 rounded-2xl bg-white/50">
                    <p className="text-sm font-semibold text-ink">No Decision Metrics Available</p>
                    <p className="text-xs text-ink-soft mt-1">
                      Breakdown of cleared, secondary screening, and refused crossings will show here.
                    </p>
                  </div>
                )}
              </SecurityPaperPanel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
