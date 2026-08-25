import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { StatusStamp } from "../../components/StatusStamp";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { ApplicantNavbar } from "../../components/ApplicantNavbar";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";

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
          .limit(3),
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
      <div className="min-h-screen bg-canvas text-ink font-['Tahoma']">
        <ApplicantNavbar />
        <div className="p-16 text-center text-ink-soft text-sm">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading your sovereign applicant dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-ink font-['Tahoma',sans-serif]">
      <ApplicantNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Sovereign Welcome Hero Header */}
        <div className="bg-gradient-to-r from-[#0B4F6C] via-[#083a50] to-[#1E8E5A] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-4 relative z-10">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 text-white flex items-center justify-center font-bold text-xl font-mono shadow-md flex-shrink-0">
                {profile?.full_name
                  ? profile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "AP"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SierraLeoneFlag width={18} height={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  Republic of Sierra Leone • Verified Traveler
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {profile?.full_name}
              </h1>
              <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-xl">
                Manage your ICAO biometric passport profile, submit entry visa applications, and monitor live border clearances.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 relative z-10">
            <Link
              to="/visa/new"
              className="bg-[#1E8E5A] hover:bg-[#166E46] text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition shadow-lg flex items-center gap-2"
            >
              <span>✈️</span>
              <span>+ Apply for e-Visa</span>
            </Link>
            <Link
              to="/passport"
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition backdrop-blur-md"
            >
              🛂 Passport Registry
            </Link>
          </div>
        </div>

        {/* 2. Three Metric Cards (Passport, Visa Queue, Notifications) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Passport Status */}
          <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xl font-bold">
                🛂
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ICAO Biometric
              </span>
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">Registered Passport</h3>
            {passport ? (
              <div className="space-y-2 mt-3 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-ink-soft">Passport No:</span>
                  <span className="font-mono font-bold text-primary">{passport.passport_number}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-soft">Expiration:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {new Date(passport.expiry_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-xs text-ink-soft mb-3">No passport on file yet.</p>
                <Link
                  to="/passport"
                  className="text-xs font-semibold text-[#0B4F6C] hover:underline"
                >
                  Register your passport &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Card 2: Visa Applications Counter */}
          <div className="bg-white border-2 border-sky-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-sky-50 text-sky-700 text-xl font-bold">
                ✈️
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-200">
                e-Visa Applications
              </span>
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">Active Filings</h3>
            <p className="text-2xl font-bold text-[#0B4F6C] mt-2">
              {applications.length}{" "}
              <span className="text-xs font-normal text-ink-soft">total submitted</span>
            </p>
            <Link
              to="/visa/new"
              className="inline-block mt-3 text-xs font-semibold text-sky-700 hover:underline"
            >
              Create new application &rarr;
            </Link>
          </div>

          {/* Card 3: Notifications */}
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 text-xl font-bold">
                🔔
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                Live Updates
              </span>
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">Recent Messages</h3>
            <p className="text-2xl font-bold text-amber-700 mt-2">
              {notifications.filter((n) => !n.is_read).length}{" "}
              <span className="text-xs font-normal text-ink-soft">unread</span>
            </p>
            <Link
              to="/notifications"
              className="inline-block mt-3 text-xs font-semibold text-amber-700 hover:underline"
            >
              View message center &rarr;
            </Link>
          </div>
        </div>

        {/* 3. Visa Applications Table */}
        <SecurityPaperPanel className="p-6 sm:p-8" showRosette>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-light/60">
            <div>
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <span>📋</span>
                <span>Your e-Visa Applications</span>
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Official adjudication status from the Consular &amp; Visa Directorate
              </p>
            </div>
            <Link
              to="/visa/new"
              className="bg-[#1E8E5A] hover:bg-[#166E46] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              + New Application
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-10 bg-canvas/40 rounded-2xl border border-dashed border-primary-light p-6">
              <span className="text-4xl block mb-2">✈️</span>
              <p className="text-sm font-semibold text-ink">No Visa Applications Yet</p>
              <p className="text-xs text-ink-soft mt-1 max-w-sm mx-auto">
                You haven&apos;t started an e-Visa application. Filing takes less than 10 minutes with instant QR verification upon approval.
              </p>
              <Link
                to="/visa/new"
                className="mt-4 inline-block bg-[#0B4F6C] hover:bg-[#083a50] text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Apply for e-Visa Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-primary-light/60">
              {applications.map((app) => (
                <div
                  key={app.application_id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-canvas/50 px-3 rounded-xl transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="scale-[0.4] -ml-8 -my-8">
                      <StatusStamp
                        status={
                          app.status === "documents_requested"
                            ? "pending"
                            : (app.status as any)
                        }
                      />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0B4F6C] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {app.application_ref}
                      </span>
                      <p className="text-sm font-bold text-ink mt-1">
                        {app.visa_types?.name ?? "Visa Application"}
                      </p>
                      <p className="text-xs text-ink-soft capitalize">
                        Status: <strong className="text-primary">{app.status.replace("_", " ")}</strong>
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/visa/${app.application_id}/status`}
                    className="bg-[#0B4F6C] hover:bg-[#083a50] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shadow-xs"
                  >
                    View Status &amp; QR &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </SecurityPaperPanel>

        {/* 4. Notifications Preview */}
        {notifications.length > 0 && (
          <div className="bg-white border border-primary-light/70 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary-light/40">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <span>🔔</span>
                <span>Recent System Alerts</span>
              </h2>
              <Link to="/notifications" className="text-xs font-semibold text-primary hover:underline">
                View all notifications &rarr;
              </Link>
            </div>
            <ul className="space-y-2.5">
              {notifications.map((n) => (
                <li
                  key={n.notification_id}
                  className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-canvas/60 border border-primary-light/40"
                >
                  <span
                    className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                      n.is_read ? "bg-zinc-400" : "bg-[#1E8E5A] animate-pulse"
                    }`}
                  />
                  <div className="flex-1">
                    <p className={n.is_read ? "text-ink-soft" : "text-ink font-semibold"}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-ink-soft mt-0.5">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
