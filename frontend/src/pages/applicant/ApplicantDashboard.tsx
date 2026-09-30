import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { GovHeader, GovFooter } from "../../components/GovHeader";
import { ProgressTracker } from "../../components/ProgressTracker";
import { SierraLeoneFlag } from "../../components/SierraLeoneFlag";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Lock,
  Phone,
  Plus,
  ShieldCheck,
  ArrowRight,
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
  const [loading, setLoading] = useState(true);

  // Masked Passport Toggle
  const [showPassportNum, setShowPassportNum] = useState(false);

  useEffect(() => {
    if (!profile) return;

    async function loadData() {
      const [{ data: p }, { data: apps }] = await Promise.all([
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
      ]);

      setPassport(p);
      setApplications((apps as any) ?? []);
      setLoading(false);
    }

    loadData();
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-['Tahoma',sans-serif] flex flex-col">
        <GovHeader portalTitle="Applicant Portal" />
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-12 text-center text-slate-600">
          <div className="w-8 h-8 border-4 border-[#0B4F6C] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold">Loading your official applicant records...</p>
        </main>
        <GovFooter />
      </div>
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Tahoma',sans-serif] flex flex-col">
      <GovHeader
        portalTitle="Applicant &amp; Traveler Portal"
        portalSubtitle="Official Dashboard"
        breadcrumbs={[{ name: "Applicant Portal", path: "/dashboard" }, { name: "Dashboard" }]}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* ------------------------------------------------------------- */}
        {/* 1. GOV.UK ACTION NEEDED CALLOUT BANNER                        */}
        {/* ------------------------------------------------------------- */}
        {actionNeededApp ? (
          <div className="bg-[#0B4F6C] text-white rounded-xl p-6 shadow-md border-l-8 border-amber-400 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-bold text-xs uppercase px-2.5 py-0.5 rounded">
                Action Needed
              </span>
              <span className="text-xs text-sky-200">Ref: {actionNeededApp.application_ref}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold">What you need to do next</h2>

            <p className="text-sm text-sky-100 leading-relaxed max-w-3xl">
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
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-sm font-bold px-5 py-2.5 rounded-md inline-flex items-center gap-2 focus:ring-2 focus:ring-white focus:outline-none transition shadow-sm"
                >
                  <span>Upload Required Documents</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  to={`/payment/${actionNeededApp.application_id}`}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-md inline-flex items-center gap-2 focus:ring-2 focus:ring-white focus:outline-none transition shadow-sm"
                >
                  <span>Pay e-Visa Fee &rarr;</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-900 text-white rounded-xl p-6 shadow-md border-l-8 border-emerald-400 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                  All Actions Up to Date
                </span>
              </div>
              <h2 className="text-xl font-bold">No Outstanding Tasks Required</h2>
              <p className="text-xs text-emerald-100 mt-1">
                Your filings are up to date. The Directorate will notify you if additional documents are needed.
              </p>
            </div>
            <Link
              to="/visa/new"
              className="bg-white hover:bg-slate-100 text-[#0B4F6C] font-bold text-xs px-4 py-2.5 rounded-md inline-flex items-center gap-1.5 focus:ring-2 focus:ring-white focus:outline-none transition"
            >
              <Plus size={16} />
              <span>Apply for New e-Visa</span>
            </Link>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. PASSPORT & SECURITY CREDENTIALS PANEL                      */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registered Biometric Passport</h3>
              <p className="text-xs text-slate-500">Official document used for e-Visa and border clearance</p>
            </div>
            <Link
              to="/passport"
              className="text-xs font-bold text-[#0B4F6C] hover:underline inline-flex items-center gap-1"
            >
              <BookOpen size={14} />
              <span>Manage Passport Details</span>
            </Link>
          </div>

          {passport ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Passport Number</p>
                <div className="flex items-center gap-2 font-mono font-bold text-base text-slate-900">
                  <span>{showPassportNum ? passport.passport_number : maskPassport(passport.passport_number)}</span>
                  <button
                    onClick={() => setShowPassportNum(!showPassportNum)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    title={showPassportNum ? "Mask Passport Number" : "Show Passport Number"}
                  >
                    {showPassportNum ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Issuing Authority</p>
                <p className="font-semibold text-slate-800">{passport.issuing_country || "Sierra Leone"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Expiry Date</p>
                <p className="font-semibold text-slate-800">{passport.expiry_date}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between gap-4">
              <span>⚠️ No passport record found. Please register your passport to apply for e-Visas.</span>
              <Link to="/passport" className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded hover:bg-amber-700">
                Register Passport
              </Link>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. APPLICATIONS LIST WITH ACCESSIBLE TEXT STATUS TAGS         */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Table Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Your e-Visa Applications</h3>
                <Link
                  to="/visa/new"
                  className="bg-[#0B4F6C] hover:bg-[#083a50] text-white text-xs font-bold px-3 py-2 rounded focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none transition inline-flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>New Application</span>
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No visa applications filed yet. Click "New Application" to begin.
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((app) => {
                    const statusTag =
                      app.status === "approved"
                        ? { label: "Approved", class: "bg-emerald-100 text-emerald-900 border-emerald-300" }
                        : app.status === "rejected"
                        ? { label: "Refused", class: "bg-rose-100 text-rose-900 border-rose-300" }
                        : app.status === "documents_requested"
                        ? { label: "Action Needed", class: "bg-amber-100 text-amber-900 border-amber-300 font-bold" }
                        : { label: "Under Review", class: "bg-sky-100 text-sky-900 border-sky-300" };

                    return (
                      <div
                        key={app.application_id}
                        className="border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition bg-slate-50/50 space-y-3"
                      >
                        {/* Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {app.application_ref}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded border font-semibold ${statusTag.class}`}>
                              {statusTag.label}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString("en-GB") : "Draft"}
                          </span>
                        </div>

                        {/* Detail Key-Value Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1">
                          <div>
                            <span className="text-slate-500">Visa Type: </span>
                            <span className="font-bold text-slate-800">
                              {app.visa_types?.name || "Standard Visitor Visa"}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-500">Payment Status: </span>
                            <span
                              className={`font-semibold ${
                                app.payment_status === "paid" ? "text-emerald-700" : "text-amber-700 font-bold"
                              }`}
                            >
                              {app.payment_status === "paid" ? "Paid" : "Payment Pending"}
                            </span>
                          </div>

                          <Link
                            to={`/visa/${app.application_id}/status`}
                            className="bg-white hover:bg-slate-100 border border-slate-300 text-[#0B4F6C] font-bold px-3 py-1.5 rounded transition text-xs inline-flex items-center gap-1"
                          >
                            <span>Track &amp; View &rarr;</span>
                          </Link>
                        </div>

                        {/* Progress Tracker Bar */}
                        <ProgressTracker status={app.status} paymentStatus={app.payment_status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Consular Help Panel Column (1/3) */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
              <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-[#0B4F6C]" />
                <span>Help &amp; Official Contact</span>
              </h4>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p>
                  Need assistance with your application? The Directorate of Immigration provides official consular support.
                </p>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">Consular Support Hotline:</p>
                  <p className="font-mono text-sm font-bold text-[#0B4F6C]">+232 22 222 411</p>
                  <p className="text-[11px] text-slate-500">Mon – Fri: 08:00 – 17:00 GMT</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">Official Directorate Email:</p>
                  <p className="font-mono text-xs text-emerald-700 font-semibold">support@slid.gov.sl</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <Link
                    to="/contact"
                    className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded text-xs block transition"
                  >
                    View Official FAQs &amp; Help Desk
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
