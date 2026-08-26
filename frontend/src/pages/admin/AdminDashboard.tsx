import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, UserPlus, FileText, FileCheck2, MapPin, FileBarChart2,
  Clock, ShieldAlert, ShieldCheck, BarChart3, PieChart as PieIcon,
  Compass, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle
} from "lucide-react";
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
  icon: any;
  color: string;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  subtext: string;
  link: string;
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
          icon: FileText,
          color: "text-[#0B4F6C]",
          borderColor: "border-sky-200",
          bgColor: "bg-sky-50",
          iconColor: "text-sky-700",
          subtext: "e-Visa Filings Registry",
          link: "/visa-officer",
        },
        {
          label: "Border Crossings",
          value: logsRes.data?.length ?? 0,
          icon: ShieldCheck,
          color: "text-[#1E8E5A]",
          borderColor: "border-emerald-200",
          bgColor: "bg-emerald-50",
          iconColor: "text-emerald-700",
          subtext: "Logged at 5 Checkpoints",
          link: "/border/check-in",
        },
        {
          label: "Active Overstays",
          value: overstayRes.count ?? 0,
          icon: Clock,
          color: "text-amber-700",
          borderColor: "border-amber-200",
          bgColor: "bg-amber-50",
          iconColor: "text-amber-700",
          subtext: "$50/Day Penalty Ledger",
          link: "/border/overstays",
        },
        {
          label: "Watchlist Interceptions",
          value: watchlistRes.count ?? 0,
          icon: ShieldAlert,
          color: "text-purple-700",
          borderColor: "border-purple-200",
          bgColor: "bg-purple-50",
          iconColor: "text-purple-700",
          subtext: "INTERPOL & Security Desk",
          link: "/border/watchlist",
        },
      ]);

      setLoading(false);
    }

    loadAnalytics();
  }, []);

  const quickActions = [
    {
      title: "Staff & Officers",
      desc: "Provision accounts, assign stations & permissions",
      icon: Users,
      path: "/admin/users",
      badge: "Manage Users",
      color: "bg-purple-50 hover:bg-purple-100/80 border-purple-200 text-purple-900",
      iconBg: "bg-purple-100 text-purple-700",
    },
    {
      title: "Visa Adjudication",
      desc: "Live consular processing queue and decisions",
      icon: FileCheck2,
      path: "/visa-officer",
      badge: "Consular Desk",
      color: "bg-sky-50 hover:bg-sky-100/80 border-sky-200 text-sky-900",
      iconBg: "bg-sky-100 text-sky-700",
    },
    {
      title: "Border Checkpoints",
      desc: "Inspect ports of entry, airports & land borders",
      icon: MapPin,
      path: "/admin/checkpoints",
      badge: "5 Stations",
      color: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "A4 PDF Executive Reports",
      desc: "Generate official national immigration intelligence",
      icon: FileBarChart2,
      path: "/admin/reports",
      badge: "Official Intelligence",
      color: "bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-900",
      iconBg: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-ink font-['Tahoma',sans-serif]">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* 1. Executive Directorate Sovereign Header */}
        <div className="bg-gradient-to-r from-[#4C1D95] via-[#3B0764] to-[#1E8E5A] rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <SierraLeoneFlag width={18} height={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                Republic of Sierra Leone • Directorate Headquarters
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Command Center &amp; National Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-2xl leading-relaxed">
              Real-time oversight of national border checkpoints, biometric passport records, visa adjudication throughput, and revenue ledgers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 relative z-10 w-full sm:w-auto">
            <Link
              to="/admin/users"
              className="flex-1 sm:flex-initial bg-[#1E8E5A] hover:bg-[#166E46] active:scale-95 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              <span>+ Provision Staff</span>
            </Link>
            <Link
              to="/admin/reports"
              className="flex-1 sm:flex-initial bg-white/15 hover:bg-white/25 border border-white/30 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition backdrop-blur-md flex items-center justify-center gap-2"
            >
              <FileBarChart2 size={16} />
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {kpis.map((kpi) => {
                const IconComponent = kpi.icon;
                return (
                  <Link
                    to={kpi.link}
                    key={kpi.label}
                    className={`bg-white border-2 ${kpi.borderColor} rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group`}
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className={`p-2.5 rounded-xl ${kpi.bgColor} ${kpi.iconColor} group-hover:scale-110 transition-transform`}>
                        <IconComponent size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-primary group-hover:text-white transition">
                        <span>Live</span>
                        <ArrowUpRight size={12} />
                      </span>
                    </div>
                    <div>
                      <p className={`font-mono text-2xl sm:text-3xl font-bold ${kpi.color}`}>
                        {kpi.value}
                      </p>
                      <p className="text-xs font-bold text-ink mt-0.5 sm:mt-1">{kpi.label}</p>
                      <p className="text-[10px] text-ink-soft mt-0.5">{kpi.subtext}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* 3. Executive Quick Command Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {quickActions.map((qa) => {
                const IconComponent = qa.icon;
                return (
                  <Link
                    key={qa.path}
                    to={qa.path}
                    className={`p-4 rounded-2xl border ${qa.color} transition shadow-2xs hover:shadow-sm flex items-start gap-3.5 group`}
                  >
                    <div className={`p-2.5 rounded-xl ${qa.iconBg} group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className="text-xs font-bold text-ink truncate">{qa.title}</h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/80 text-ink-soft border border-zinc-200">
                          {qa.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft leading-snug line-clamp-2">{qa.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* 4. Visa Applications by Status */}
            <SecurityPaperPanel className="p-5 sm:p-8" showRosette>
              <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-primary-light/60">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#0B4F6C]" />
                    <span>Visa Applications by Adjudication Status</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-ink-soft mt-0.5">
                    Real-time distribution across submitted, under review, approved, and rejected filings
                  </p>
                </div>
                <Link
                  to="/visa-officer"
                  className="text-xs font-semibold text-primary hover:underline hidden sm:flex items-center gap-1"
                >
                  <span>Open Visa Queue</span>
                  <ArrowUpRight size={14} />
                </Link>
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
                  <FileText size={32} className="mx-auto text-zinc-400 mb-2" />
                  <p className="text-sm font-semibold text-ink">No Visa Applications Submitted Yet</p>
                  <p className="text-xs text-ink-soft mt-1">
                    When applicants file via the public portal, real-time statistics will populate here.
                  </p>
                </div>
              )}
            </SecurityPaperPanel>

            {/* 5. Crossings & Decision Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {/* Crossings by checkpoint */}
              <SecurityPaperPanel className="p-5 sm:p-8">
                <h2 className="text-sm sm:text-base font-bold text-ink mb-1 flex items-center gap-2">
                  <Compass size={18} className="text-[#1E8E5A]" />
                  <span>Crossings by Point of Entry</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-ink-soft mb-4 sm:mb-6">Traffic volume across all 5 national stations</p>

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
                    <MapPin size={32} className="mx-auto text-zinc-400 mb-2" />
                    <p className="text-sm font-semibold text-ink">No Border Crossings Recorded</p>
                    <p className="text-xs text-ink-soft mt-1">
                      Check-in events processed at air, land, and sea checkpoints will appear here.
                    </p>
                  </div>
                )}
              </SecurityPaperPanel>

              {/* Decision breakdown */}
              <SecurityPaperPanel className="p-5 sm:p-8">
                <h2 className="text-sm sm:text-base font-bold text-ink mb-1 flex items-center gap-2">
                  <PieIcon size={18} className="text-purple-700" />
                  <span>Border Clearance Decisions</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-ink-soft mb-4 sm:mb-6">Cleared vs. secondary screening vs. refused</p>

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
                    <ShieldCheck size={32} className="mx-auto text-zinc-400 mb-2" />
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
