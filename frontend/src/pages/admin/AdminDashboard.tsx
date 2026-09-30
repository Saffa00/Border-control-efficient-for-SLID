import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, UserPlus, FileText, FileCheck2, MapPin, FileBarChart2,
  Clock, ShieldAlert, ShieldCheck, BarChart3, PieChart as PieIcon,
  Compass, ArrowUpRight
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { GovHeader, GovFooter } from "../../components/GovHeader";

const STATUS_COLORS: Record<string, string> = {
  draft: "#64748B",
  submitted: "#0284C7",
  under_review: "#D97706",
  documents_requested: "#EA580C",
  approved: "#107C41",
  rejected: "#DC2626",
};

const RISK_COLORS: Record<string, string> = {
  cleared: "#107C41",
  secondary_screening: "#D97706",
  refused: "#DC2626",
};

interface KPI {
  label: string;
  value: number | string;
  icon: any;
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
          subtext: "e-Visa Filings Registry",
          link: "/visa-officer",
        },
        {
          label: "Border Crossings",
          value: logsRes.data?.length ?? 0,
          icon: ShieldCheck,
          subtext: "Logged at 5 Checkpoints",
          link: "/border/check-in",
        },
        {
          label: "Active Overstays",
          value: overstayRes.count ?? 0,
          icon: Clock,
          subtext: "$50/Day Penalty Ledger",
          link: "/border/overstays",
        },
        {
          label: "Watchlist Hits",
          value: watchlistRes.count ?? 0,
          icon: ShieldAlert,
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
      badge: "User Management",
    },
    {
      title: "Visa Adjudication",
      desc: "Live consular processing queue and decisions",
      icon: FileCheck2,
      path: "/visa-officer",
      badge: "Consular Desk",
    },
    {
      title: "Border Checkpoints",
      desc: "Inspect ports of entry, airports & land borders",
      icon: MapPin,
      path: "/admin/checkpoints",
      badge: "5 Active Stations",
    },
    {
      title: "Executive Reports",
      desc: "Generate official national immigration intelligence",
      icon: FileBarChart2,
      path: "/admin/reports",
      badge: "Official Intelligence",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-sans flex flex-col justify-between">
      <GovHeader
        portalTitle="Directorate Headquarters"
        portalSubtitle="National Command Center & Analytics"
        breadcrumbs={[
          { name: "Executive Directorate", path: "/admin" },
          { name: "Command Center" },
        ]}
      />

      <main id="main-content" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Header Title Section */}
        <div className="bg-[#002B49] text-white p-6 sm:p-8 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-4 border-[#107C41]">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#107C41] bg-white px-2.5 py-1 rounded">
              Republic of Sierra Leone • Directorate Headquarters
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3">
              National Immigration Command Center
            </h1>
            <p className="text-sm text-zinc-200 mt-1 max-w-2xl">
              Real-time executive oversight of border checkpoints, passport registries, visa adjudication queues, and overstay compliance ledgers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Link
              to="/admin/users"
              className="flex-1 sm:flex-initial bg-[#107C41] hover:bg-[#0B592E] text-white px-4 py-2.5 rounded font-bold text-sm transition focus:ring-2 focus:ring-white flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              <span>+ Provision Staff</span>
            </Link>
            <Link
              to="/admin/reports"
              className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white border border-white/40 px-4 py-2.5 rounded font-bold text-sm transition focus:ring-2 focus:ring-white flex items-center justify-center gap-2"
            >
              <FileBarChart2 size={18} />
              <span>Executive Reports</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-500 text-sm font-medium">
            <div className="w-8 h-8 border-4 border-[#002B49] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Synthesizing nationwide immigration intelligence...
          </div>
        ) : (
          <>
            {/* 4 Standard Executive Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi) => {
                const IconComponent = kpi.icon;
                return (
                  <Link
                    to={kpi.link}
                    key={kpi.label}
                    className="bg-white border border-zinc-300 rounded-lg p-5 hover:border-[#002B49] transition shadow-xs focus:ring-2 focus:ring-[#002B49] group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded bg-zinc-100 text-[#002B49] group-hover:bg-[#002B49] group-hover:text-white transition-colors">
                        <IconComponent size={22} />
                      </div>
                      <span className="text-xs font-bold text-zinc-500 flex items-center gap-1 group-hover:text-[#002B49]">
                        <span>View</span>
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-3xl font-bold text-zinc-900">{kpi.value}</p>
                      <p className="text-sm font-bold text-zinc-900 mt-1">{kpi.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{kpi.subtext}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Command Navigation Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((qa) => {
                const IconComponent = qa.icon;
                return (
                  <Link
                    key={qa.path}
                    to={qa.path}
                    className="p-4 rounded-lg border border-zinc-300 bg-white hover:border-[#002B49] transition shadow-xs focus:ring-2 focus:ring-[#002B49] flex items-start gap-3.5 group"
                  >
                    <div className="p-2.5 rounded bg-zinc-100 text-[#002B49] group-hover:bg-[#002B49] group-hover:text-white transition-colors shrink-0">
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className="text-sm font-bold text-zinc-900 truncate">{qa.title}</h3>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {qa.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 line-clamp-2">{qa.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Applications by Status Bar Chart */}
            <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-200">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <BarChart3 size={20} className="text-[#002B49]" />
                    <span>Visa Applications by Adjudication Status</span>
                  </h2>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Real-time distribution across submitted, under review, approved, and rejected filings
                  </p>
                </div>
                <Link
                  to="/visa-officer"
                  className="text-xs font-bold text-[#002B49] hover:underline hidden sm:flex items-center gap-1"
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
                      tick={{ fontSize: 12, fill: "#334155" }}
                      tickFormatter={(v) => v.replace("_", " ")}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#334155" }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#002B49"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-zinc-300 rounded bg-zinc-50">
                  <FileText size={32} className="mx-auto text-zinc-400 mb-2" />
                  <p className="text-sm font-bold text-zinc-900">No Visa Applications Submitted Yet</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    When applicants file via the public portal, real-time statistics will populate here.
                  </p>
                </div>
              )}
            </div>

            {/* Crossings & Decision Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crossings by checkpoint */}
              <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 mb-1 flex items-center gap-2">
                  <Compass size={20} className="text-[#107C41]" />
                  <span>Crossings by Point of Entry</span>
                </h2>
                <p className="text-xs text-zinc-600 mb-6">Traffic volume across all 5 national stations</p>

                {checkpointData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={checkpointData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#334155" }} allowDecimals={false} />
                      <YAxis
                        dataKey="checkpoint"
                        type="category"
                        width={130}
                        tick={{ fontSize: 12, fill: "#334155" }}
                      />
                      <Tooltip />
                      <Bar dataKey="crossings" fill="#107C41" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-zinc-300 rounded bg-zinc-50">
                    <MapPin size={32} className="mx-auto text-zinc-400 mb-2" />
                    <p className="text-sm font-bold text-zinc-900">No Border Crossings Recorded</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Check-in events processed at air, land, and sea checkpoints will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Decision breakdown */}
              <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 mb-1 flex items-center gap-2">
                  <PieIcon size={20} className="text-purple-800" />
                  <span>Border Clearance Decisions</span>
                </h2>
                <p className="text-xs text-zinc-600 mb-6">Cleared vs. secondary screening vs. refused</p>

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
                          <Cell key={entry.decision} fill={RISK_COLORS[entry.decision] ?? "#64748B"} />
                        ))}
                      </Pie>
                      <Legend
                        formatter={(value) => value.replace("_", " ")}
                        wrapperStyle={{ fontSize: 12 }}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-zinc-300 rounded bg-zinc-50">
                    <ShieldCheck size={32} className="mx-auto text-zinc-400 mb-2" />
                    <p className="text-sm font-bold text-zinc-900">No Decision Metrics Available</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Breakdown of cleared, secondary screening, and refused crossings will show here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <GovFooter />
    </div>
  );
}
