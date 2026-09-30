import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { ApplicantLayout } from "../../components/ApplicantLayout";
import { ProgressTracker } from "../../components/ProgressTracker";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Plus,
  ShieldCheck,
  ArrowRight,
  Plane,
  Sparkles,
} from "lucide-react";

interface VisaApplication {
  application_id: string;
  application_ref: string;
  status: "draft" | "submitted" | "under_review" | "documents_requested" | "approved" | "rejected";
  payment_status: "unpaid" | "paid";
  submitted_at: string | null;
  review_notes: string | null;
  visa_types: { name: string } | null;
}

interface Passport {
  passport_number: string;
  expiry_date: string;
  issuing_country: string;
}

export default function ApplicantDashboard() {
  const { profile } = useAuth();
  const [passport, setPassport] = useState<Passport | null>(null);
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Masked Passport Toggle
  const [showPassportNum, setShowPassportNum] = useState(false);

  useEffect(() => {
    if (!profile) return;

    async function loadData() {
      const [{ data: p }, { data: apps }, { data: notifs }] = await Promise.all([
        supabase
          .from("passports")
          .select("passport_number, expiry_date, issuing_country")
          .eq("user_id", profile.user_id)
          .maybeSingle(),
        supabase
          .from("visa_applications")
          .select("application_id, application_ref, status, payment_status, submitted_at, review_notes, visa_types(name)")
          .eq("user_id", profile.user_id)
          .order("created_at", { ascending: false }),
        supabase
          .from("notifications")
          .select("notification_id, message, created_at")
          .eq("user_id", profile.user_id)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      setPassport(p);
      setApplications((apps as any) ?? []);
      setNotifications(notifs ?? []);
      setLoading(false);
    }

    loadData();
  }, [profile]);

  if (loading) {
    return (
      <ApplicantLayout>
        <div className="py-16 text-center text-zinc-500 text-sm">
          <div className="w-8 h-8 border-4 border-[#002B49] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-bold">Loading your official applicant records...</p>
        </div>
      </ApplicantLayout>
    );
  }

  // 1. Determine "What you need to do next" callout item
  const actionNeededApp = applications.find(
    (a) => a.status === "documents_requested" || (a.status === "submitted" && a.payment_status === "unpaid")
  );

  // Helper for masking passport number (e.g. SLE••••567)
  function maskPassport(num: string) {
    if (!num) return "—";
    if (num.length <= 4) return "••••";
    const prefix = num.slice(0, 3);
    const suffix = num.slice(-3);
    return `${prefix}••••${suffix}`;
  }

  const latestApp = applications[0];

  return (
    <ApplicantLayout>
      <div className="space-y-8">
        {/* ------------------------------------------------------------- */}
        {/* 1. ACTION NEEDED CALLOUT BANNER                               */}
        {/* ------------------------------------------------------------- */}
        {actionNeededApp ? (
          <div className="bg-[#002B49] text-white rounded-lg p-6 shadow-sm border-l-8 border-amber-400 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-zinc-950 font-bold text-xs uppercase px-2.5 py-0.5 rounded">
                Action Needed
              </span>
              <span className="text-xs text-zinc-200 font-mono">Ref: {actionNeededApp.application_ref}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold">What you need to do next</h2>

            <p className="text-sm text-zinc-200 leading-relaxed max-w-3xl">
              {actionNeededApp.status === "documents_requested"
                ? `The Consular Directorate has requested additional supporting documents: "${
                    actionNeededApp.review_notes || "Please upload updated passport or travel itinerary."
                  }"`
                : "Your e-Visa application has been received. Please complete payment to submit your filing for consular adjudication."}
            </p>

            <div className="pt-2">
              {actionNeededApp.status === "documents_requested" ? (
                <Link
                  to={`/visa/${actionNeededApp.application_id}/status`}
                  className="bg-amber-400 hover:bg-amber-500 text-zinc-950 text-sm font-bold px-5 py-2.5 rounded inline-flex items-center gap-2 focus:ring-2 focus:ring-white transition shadow-sm"
                >
                  <span>Upload Required Documents</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  to={`/visa/${actionNeededApp.application_id}/payment`}
                  className="bg-[#107C41] hover:bg-[#0B592E] text-white text-sm font-bold px-5 py-2.5 rounded inline-flex items-center gap-2 focus:ring-2 focus:ring-white transition shadow-sm"
                >
                  <span>Pay e-Visa Fee &rarr;</span>
                </Link>
              )}
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------------- */}
        {/* 2. WELCOME HERO & PASSPORT STATUS CARD                         */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hero Greeting (2/3 width) */}
          <div className="md:col-span-2 bg-[#002B49] text-white p-6 sm:p-8 rounded-lg shadow-sm border-b-4 border-[#107C41] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <SierraLeoneFlag width={18} height={12} />
                <span className="text-xs font-bold uppercase tracking-widest text-[#107C41] bg-white px-2 py-0.5 rounded">
                  Verified Traveler Portal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {profile?.full_name?.split(" ")[0] || "Traveler"}
              </h1>
              <p className="text-sm text-zinc-200 mt-1 max-w-xl">
                Track your active e-Visa applications, register biometric passports, and access border entry clearances.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/visa/new"
                className="bg-[#107C41] hover:bg-[#0B592E] text-white font-bold text-xs px-4 py-2.5 rounded transition inline-flex items-center gap-2 shadow-xs focus:ring-2 focus:ring-white"
              >
                <Plus size={16} />
                <span>Apply for e-Visa</span>
              </Link>
              <Link
                to="/passport"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs px-4 py-2.5 rounded transition inline-flex items-center gap-2 focus:ring-2 focus:ring-white"
              >
                <BookOpen size={16} />
                <span>Passport Registry</span>
              </Link>
            </div>
          </div>

          {/* Passport Registry Quick Card (1/3 width) */}
          <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <BookOpen size={16} className="text-[#002B49]" />
                <span>Registered Passport</span>
              </span>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
                Active
              </span>
            </div>

            {passport ? (
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase">Passport Number</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xl font-bold text-zinc-900">
                      {showPassportNum ? passport.passport_number : maskPassport(passport.passport_number)}
                    </span>
                    <button
                      onClick={() => setShowPassportNum(!showPassportNum)}
                      className="text-zinc-500 hover:text-zinc-900 transition p-1 cursor-pointer"
                      title={showPassportNum ? "Hide Passport Number" : "Show Passport Number"}
                    >
                      {showPassportNum ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-100">
                  <div>
                    <span className="text-zinc-500 font-medium">Issuing Country:</span>
                    <p className="font-bold text-zinc-900">{passport.issuing_country || "Sierra Leone"}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium">Expires:</span>
                    <p className="font-mono font-bold text-zinc-900">{passport.expiry_date || "—"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <p className="text-xs text-zinc-600 font-medium">No passport registered on file.</p>
                <Link
                  to="/passport"
                  className="text-xs font-bold text-[#002B49] hover:underline inline-block"
                >
                  + Register Passport Details &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. LATEST APPLICATION PROGRESS TRACKER                        */}
        {/* ------------------------------------------------------------- */}
        {latestApp ? (
          <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-3 gap-2">
              <div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Live Application Status
                </span>
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mt-0.5">
                  <span>{latestApp.visa_types?.name ?? "e-Visa Filing"}</span>
                  <span className="font-mono text-sm font-normal text-zinc-500">({latestApp.application_ref})</span>
                </h3>
              </div>
              <Link
                to={`/visa/${latestApp.application_id}/status`}
                className="text-xs font-bold text-[#002B49] hover:underline inline-flex items-center gap-1"
              >
                <span>Full Application Status</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <ProgressTracker status={latestApp.status} paymentStatus={latestApp.payment_status} />
          </div>
        ) : null}

        {/* ------------------------------------------------------------- */}
        {/* 4. MAIN WORKSPACE: APPLICATIONS TABLE & GUIDANCE PANEL         */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Applications Table (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Your Visa Applications</h3>
                  <p className="text-xs text-zinc-600">Recent e-Visa filings &amp; adjudication status</p>
                </div>
                <Link
                  to="/visa/new"
                  className="bg-[#107C41] hover:bg-[#0B592E] text-white text-xs font-bold px-3 py-1.5 rounded transition inline-flex items-center gap-1 cursor-pointer focus:ring-2 focus:ring-[#107C41]"
                >
                  <Plus size={14} />
                  <span>New Application</span>
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="py-12 text-center space-y-3 border-2 border-dashed border-zinc-300 rounded bg-zinc-50">
                  <FileText size={36} className="mx-auto text-zinc-400" />
                  <p className="text-sm font-bold text-zinc-900">No Visa Applications Submitted Yet</p>
                  <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                    Ready to travel to Sierra Leone? Start your official e-Visa application online in minutes.
                  </p>
                  <Link
                    to="/visa/new"
                    className="inline-flex items-center gap-1.5 bg-[#107C41] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#0B592E] transition mt-2 cursor-pointer"
                  >
                    <span>Start Application Now</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-zinc-900 bg-zinc-100 text-zinc-900 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3">Reference</th>
                        <th className="py-3 px-3">Visa Type</th>
                        <th className="py-3 px-3">Status Tag</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {applications.map((app) => {
                        const tag =
                          app.status === "approved"
                            ? { label: "Approved", class: "bg-emerald-100 text-emerald-950 border-emerald-300" }
                            : app.status === "rejected"
                            ? { label: "Refused", class: "bg-red-100 text-red-950 border-red-300" }
                            : app.status === "documents_requested"
                            ? { label: "Action Needed", class: "bg-amber-100 text-amber-950 border-amber-300" }
                            : { label: "Under Review", class: "bg-sky-100 text-sky-950 border-sky-300" };

                        return (
                          <tr key={app.application_id} className="hover:bg-zinc-50 transition">
                            <td className="py-3.5 px-3 font-mono font-bold text-[#002B49]">
                              {app.application_ref}
                            </td>
                            <td className="py-3.5 px-3 text-zinc-800 font-semibold">
                              {app.visa_types?.name ?? "Standard Entry Visa"}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`text-[11px] px-2.5 py-0.5 rounded border font-bold ${tag.class}`}>
                                {tag.label}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <Link
                                to={`/visa/${app.application_id}/status`}
                                className="text-xs font-bold text-[#002B49] hover:underline inline-flex items-center gap-1"
                              >
                                <span>View Details</span>
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
          </div>

          {/* Right Column: Travel Guidance & Support (1/3 width) */}
          <div className="space-y-6">
            {/* Travel Guidance Box */}
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider border-b border-amber-200 pb-2">
                <Sparkles size={16} className="text-amber-700" />
                <span>Humanized Travel Guidance</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                💡 <strong>Important Travel Notice:</strong> Ensure your passport has at least <strong>6 months remaining validity</strong> from your planned arrival date at Freetown Lungi International Airport (FNA).
              </p>
              <div className="pt-2 text-[11px] text-amber-900 space-y-1.5 border-t border-amber-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#107C41]" />
                  <span>e-Visa clearance is scanned at entry checkpoint</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#107C41]" />
                  <span>ECOWAS nationals travel with ECOWAS passport</span>
                </div>
              </div>
            </div>

            {/* Consular Support Panel */}
            <div className="bg-white border border-zinc-300 rounded-lg p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-2 flex items-center justify-between">
                <span>Directorate Support Desk</span>
                <span className="text-[10px] text-zinc-500 font-normal">Official Help</span>
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Need assistance with your visa application or passport details? Consular officers are available Monday – Friday, 08:00 – 17:00 GMT.
              </p>
              <div className="pt-2 border-t border-zinc-200 space-y-1 text-xs">
                <p className="font-bold text-zinc-900">Consular Hotline: +232 76 000 000</p>
                <p className="text-zinc-600">Email: support@immigration.gov.sl</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ApplicantLayout>
  );
}
