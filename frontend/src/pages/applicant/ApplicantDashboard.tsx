import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { StatusStamp } from "../../components/StatusStamp";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { ApplicantLayout } from "../../components/ApplicantLayout";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";
import {
  BookOpen,
  Plane,
  Clock,
  ShieldCheck,
  Plus,
  ArrowRight,
  MapPin,
  HelpCircle,
  QrCode,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface VisaApplication {
  application_id: string;
  application_ref: string;
  status: "draft" | "submitted" | "under_review" | "documents_requested" | "approved" | "rejected";
  submitted_at: string | null;
  visa_types: { name: string } | null;
}

interface Passport {
  passport_number: string;
  expiry_date: string;
}

interface NotificationRow {
  notification_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function ApplicantDashboard() {
  const { profile } = useAuth();
  const [passport, setPassport] = useState<Passport | null>(null);
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function loadDashboard() {
      const [{ data: p }, { data: apps }, { data: notifs }] = await Promise.all([
        supabase
          .from("passports")
          .select("passport_number, expiry_date")
          .eq("user_id", profile.user_id)
          .maybeSingle(),
        supabase
          .from("visa_applications")
          .select("application_id, application_ref, status, submitted_at, visa_types(name)")
          .eq("user_id", profile.user_id)
          .order("created_at", { ascending: false }),
        supabase
          .from("notifications")
          .select("notification_id, message, created_at, is_read")
          .eq("user_id", profile.user_id)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      setPassport(p);
      setApplications((apps as any) ?? []);
      setNotifications(notifs ?? []);
      setLoading(false);
    }

    loadDashboard();
  }, [profile]);

  if (loading) {
    return (
      <ApplicantLayout>
        <div className="p-16 text-center text-slate-500 text-sm">
          <div className="w-8 h-8 border-3 border-[#1E8E5A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading your sovereign applicant dashboard...
        </div>
      </ApplicantLayout>
    );
  }

  const activeVisasCount = applications.filter((a) => a.status === "approved").length;
  const pendingAppsCount = applications.filter(
    (a) => a.status === "submitted" || a.status === "under_review" || a.status === "documents_requested"
  ).length;

  const firstName = profile?.full_name?.split(" ")[0] || "Traveler";

  return (
    <ApplicantLayout>
      <div className="space-y-6">
        {/* ------------------------------------------------------------- */}
        {/* 1. HUMANIZED EXECUTIVE HERO WELCOME CARD                       */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-[#093548] via-[#0B4F6C] to-[#1E8E5A] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <SierraLeoneFlag width={20} height={13} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-300">
                Republic of Sierra Leone • Directorate of Immigration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Good day, {firstName}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 mt-1.5 leading-relaxed">
              Manage your e-Visa applications, review registered passport credentials, and access official entry services for the Republic of Sierra Leone.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-emerald-200">
                <ShieldCheck size={14} className="text-emerald-300" />
                <span className="font-semibold">Security Clearance: Verified</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-slate-200">
                <Clock size={14} className="text-amber-300" />
                <span>Freetown Local Time (GMT)</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
            <Link
              to="/visa/new"
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs px-5 py-3 rounded-2xl transition cursor-pointer shadow-lg flex items-center justify-center gap-2 text-center"
            >
              <Plus size={16} />
              <span>Apply for New e-Visa</span>
            </Link>
            <Link
              to="/passport"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-5 py-2.5 rounded-2xl border border-white/20 transition cursor-pointer flex items-center justify-center gap-2 text-center"
            >
              <BookOpen size={15} />
              <span>Manage Passport</span>
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. EXECUTIVE METRIC CARDS GRID                                 */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Passport Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Passport Registry
              </span>
              <div className="p-2 rounded-xl bg-sky-50 text-[#0B4F6C]">
                <BookOpen size={18} />
              </div>
            </div>
            {passport ? (
              <div>
                <p className="text-lg font-bold font-mono text-slate-900 truncate">
                  {passport.passport_number}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Expires: {passport.expiry_date}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                    Active
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-amber-700 font-semibold mb-2">No Passport Recorded</p>
                <Link
                  to="/passport"
                  className="text-xs font-bold text-[#1E8E5A] hover:underline flex items-center gap-1"
                >
                  <span>Register Passport &rarr;</span>
                </Link>
              </div>
            )}
          </div>

          {/* Card 2: Active e-Visas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active e-Visas
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-[#1E8E5A]">
                <Plane size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900">{activeVisasCount}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Valid Entry Clearances</span>
              <Link to="/dashboard#applications" className="text-[#1E8E5A] font-bold text-[10px] hover:underline">
                View All
              </Link>
            </div>
          </div>

          {/* Card 3: Pending Applications */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Filings
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900">{pendingAppsCount}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Under Consular Review</span>
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">
                In Progress
              </span>
            </div>
          </div>

          {/* Card 4: Security Clearance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Immigration Status
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={18} />
              </div>
            </div>
            <p className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 mt-1">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Clear Entry Clearance</span>
            </p>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              No watchlist or overstay flags
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. QUICK COMMAND ACTIONS GRID                                  */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/visa/new"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#1E8E5A] hover:shadow-md transition group flex flex-col items-start gap-2"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#1E8E5A] group-hover:scale-110 transition">
              <Plane size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#1E8E5A] transition">
                Apply for e-Visa
              </p>
              <p className="text-[10px] text-slate-500">Submit new visa filing</p>
            </div>
          </Link>

          <Link
            to="/passport"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#0B4F6C] hover:shadow-md transition group flex flex-col items-start gap-2"
          >
            <div className="p-2.5 rounded-xl bg-sky-50 text-[#0B4F6C] group-hover:scale-110 transition">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#0B4F6C] transition">
                Passport Details
              </p>
              <p className="text-[10px] text-slate-500">Update passport info</p>
            </div>
          </Link>

          <Link
            to="/borders"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-600 hover:shadow-md transition group flex flex-col items-start gap-2"
          >
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition">
                Border Map
              </p>
              <p className="text-[10px] text-slate-500">View checkpoints & Lungi</p>
            </div>
          </Link>

          <Link
            to="/contact"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-600 hover:shadow-md transition group flex flex-col items-start gap-2"
          >
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition">
                Consular Support
              </p>
              <p className="text-[10px] text-slate-500">Get officer assistance</p>
            </div>
          </Link>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. MAIN PANEL: APPLICATIONS TABLE & HUMANIZED TRAVEL TIPS      */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="applications">
          {/* Left Column: Recent Applications Table (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <SecurityPaperPanel className="p-6" showRosette>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your Visa Applications</h3>
                  <p className="text-xs text-slate-500">Recent e-Visa filings &amp; status history</p>
                </div>
                <Link
                  to="/visa/new"
                  className="bg-[#1E8E5A] hover:bg-[#166e46] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>New Application</span>
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText size={24} />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No Visa Applications Submitted Yet</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Ready to visit Sierra Leone? Start your official e-Visa application in minutes.
                  </p>
                  <Link
                    to="/visa/new"
                    className="inline-flex items-center gap-1.5 bg-[#1E8E5A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#166e46] transition mt-2"
                  >
                    <span>Start Application Now</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3">Visa Type</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-[#Tahoma]">
                      {applications.map((app) => (
                        <tr key={app.application_id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {app.application_ref}
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">
                            {app.visa_types?.name ?? "Standard Entry Visa"}
                          </td>
                          <td className="py-3 px-3">
                            <StatusStamp status={app.status} />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              to={`/visa/${app.application_id}/status`}
                              className="text-xs font-bold text-[#0B4F6C] hover:text-[#1E8E5A] hover:underline inline-flex items-center gap-1"
                            >
                              <span>View Details</span>
                              <ArrowRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SecurityPaperPanel>
          </div>

          {/* Right Column: Humanized Guidance & Notifications Panel (1/3 width) */}
          <div className="space-y-6">
            {/* Travel Guidance Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles size={16} className="text-amber-600" />
                <span>Humanized Travel Guidance</span>
              </div>
              <p className="text-xs text-amber-950/90 leading-relaxed font-medium">
                💡 <strong>Important Travel Tip:</strong> Always verify that your passport has at least <strong>6 months remaining validity</strong> before booking flights to FNA Lungi International Airport.
              </p>
              <div className="pt-2 border-t border-amber-200/80 text-[11px] text-amber-800 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>e-Visa clearance is scanned at entry</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>ECOWAS nationals travel with ECOWAS Pass</span>
                </div>
              </div>
            </div>

            {/* Portal Activity Timeline */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Portal Announcements &amp; Alerts
                </h4>
                <Link to="/notifications" className="text-[10px] font-bold text-[#1E8E5A] hover:underline">
                  All Notifications
                </Link>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent alerts or announcements.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.notification_id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ApplicantLayout>
  );
}
