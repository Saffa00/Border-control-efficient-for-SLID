import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { GovHeader, GovFooter } from "../../components/GovHeader";
import { FileText, ExternalLink, CheckCircle2, Clock, AlertTriangle, ArrowLeft } from "lucide-react";

interface ApplicationDetail {
  application_id: string;
  application_ref: string;
  status: string;
  submitted_at?: string;
  purpose_of_travel: string | null;
  intended_arrival_date: string | null;
  intended_stay_days: number | null;
  passport_id: string;
  visa_type_id: string;
  visa_types: { name: string; validity_days: number } | null;
  passports: {
    user_id: string;
    passport_number: string;
    date_of_birth?: string;
    expiry_date: string;
    nationality?: string;
    users: { full_name: string; email: string } | null;
  } | null;
}

interface DocRow {
  document_id: string;
  doc_type: string;
  file_path: string;
}

export default function ApplicationReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [documents, setDocuments] = useState<(DocRow & { url: string | null })[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadApplication() {
      const { data: app } = await supabase
        .from("visa_applications")
        .select(
          `application_id, application_ref, status, submitted_at, purpose_of_travel, intended_arrival_date,
           intended_stay_days, passport_id, visa_type_id,
           visa_types(name, validity_days),
           passports(user_id, passport_number, date_of_birth, expiry_date, nationality, users(full_name, email))`
        )
        .eq("application_id", id)
        .single();

      const { data: docs } = await supabase
        .from("application_documents")
        .select("document_id, doc_type, file_path")
        .eq("application_id", id);

      const docsWithUrls = await Promise.all(
        (docs ?? []).map(async (d) => {
          const { data: signed } = await supabase.storage
            .from("visa-documents")
            .createSignedUrl(d.file_path, 3600);
          return { ...d, url: signed?.signedUrl ?? null };
        })
      );

      setApplication(app as any);
      setDocuments(docsWithUrls);
      setLoading(false);
    }

    loadApplication();
  }, [id]);

  async function recordHistory(status: string) {
    await supabase.from("application_status_history").insert({
      application_id: id,
      status,
      note: notes || null,
      changed_by: profile?.user_id,
    });
  }

  async function handleApprove() {
    if (!application || !profile) return;
    setSubmitting(true);

    try {
      const issueDate = new Date();
      const expiryDate = new Date(issueDate);
      expiryDate.setDate(expiryDate.getDate() + (application.visa_types?.validity_days ?? 90));

      const { error: appError } = await supabase
        .from("visa_applications")
        .update({
          status: "approved",
          reviewed_by: profile.user_id,
          review_notes: notes || null,
          reviewed_at: new Date().toISOString(),
          decided_at: new Date().toISOString(),
        })
        .eq("application_id", application.application_id);

      if (appError) console.warn("App status update notice:", appError.message);

      const visaNumber = `DV-${Date.now().toString(36).toUpperCase()}`;
      const qrToken =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `qr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      await supabase.from("digital_visas").insert({
        application_id: application.application_id,
        visa_number: visaNumber,
        passport_id: application.passport_id,
        issue_date: issueDate.toISOString().slice(0, 10),
        expiry_date: expiryDate.toISOString().slice(0, 10),
        entries_allowed: "single",
        qr_code_token: qrToken,
        status: "active",
      });

      try {
        await recordHistory("approved");
      } catch {}

      if (application.passports?.user_id) {
        try {
          await supabase.from("notifications").insert({
            user_id: application.passports.user_id,
            message: `Your visa application ${application.application_ref} has been approved.`,
          });
        } catch {}
      }

      navigate("/visa-officer");
    } catch (err: any) {
      alert(err.message || "Failed to approve visa application.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!application || !profile) return;
    if (!notes.trim()) {
      alert("Please add a review note explaining the rejection reason.");
      return;
    }
    setSubmitting(true);

    try {
      await supabase
        .from("visa_applications")
        .update({
          status: "rejected",
          reviewed_by: profile.user_id,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
          decided_at: new Date().toISOString(),
        })
        .eq("application_id", application.application_id);

      try {
        await recordHistory("rejected");
      } catch {}

      if (application.passports?.user_id) {
        try {
          await supabase.from("notifications").insert({
            user_id: application.passports.user_id,
            message: `Your visa application ${application.application_ref} was not approved. Reason: ${notes}`,
          });
        } catch {}
      }

      navigate("/visa-officer");
    } catch (err: any) {
      alert(err.message || "Failed to submit rejection decision.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestDocuments() {
    if (!application || !profile) return;
    if (!notes.trim()) {
      alert("Please specify which documents are required in the review notes.");
      return;
    }
    setSubmitting(true);

    try {
      await supabase
        .from("visa_applications")
        .update({ status: "documents_requested", reviewed_by: profile.user_id })
        .eq("application_id", application.application_id);

      try {
        await recordHistory("documents_requested");
      } catch {}

      if (application.passports?.user_id) {
        try {
          await supabase.from("notifications").insert({
            user_id: application.passports.user_id,
            message: `Additional documents needed for ${application.application_ref}: ${notes}`,
          });
        } catch {}
      }

      navigate("/visa-officer");
    } catch (err: any) {
      alert(err.message || "Failed to submit document request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-sans flex flex-col justify-between">
      <GovHeader
        portalTitle="Consular Directorate"
        portalSubtitle="Adjudication Review Workstation"
        breadcrumbs={[
          { name: "Consular Gateway", path: "/visa-officer" },
          { name: "Case Review" },
        ]}
      />

      <main id="main-content" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* Top Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-300 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/visa-officer"
              className="p-2 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-900 transition"
              title="Return to Work Queue"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-[#002B49] text-white px-2.5 py-0.5 rounded">
                  {application?.application_ref || "..."}
                </span>
                <span className="text-xs font-bold uppercase bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded">
                  {application?.status.replace("_", " ") || "Pending"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 mt-1">
                {application?.visa_types?.name ?? "Visa"} Case File Review
              </h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-zinc-500 text-sm">
            <div className="w-8 h-8 border-4 border-[#002B49] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading case documents and applicant details...
          </div>
        ) : !application ? (
          <div className="p-12 text-center text-zinc-600 bg-white border border-zinc-300 rounded-lg">
            <p className="text-base font-bold">Application file not found.</p>
            <Link to="/visa-officer" className="text-[#002B49] font-bold underline mt-2 inline-block">
              Return to Work Queue
            </Link>
          </div>
        ) : (
          /* 2-Column Side-by-Side Review Layout (Documents alongside Adjudication Panel) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Applicant Info & Documents */}
            <div className="lg:col-span-7 space-y-6">
              {/* Applicant & Passport Card */}
              <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-200 pb-2 flex items-center justify-between">
                  <span>Applicant &amp; Passport Credentials</span>
                  <span className="text-xs text-zinc-500 font-normal">Verified Registry Record</span>
                </h2>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Full Legal Name</p>
                    <p className="font-bold text-zinc-900 text-base">{application.passports?.users?.full_name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Passport Number</p>
                    <p className="font-mono font-bold text-zinc-900 text-base">{application.passports?.passport_number ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Nationality</p>
                    <p className="font-semibold text-zinc-800">{application.passports?.nationality ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Passport Expiry</p>
                    <p className="font-mono font-semibold text-zinc-800">{application.passports?.expiry_date ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Purpose of Travel</p>
                    <p className="font-semibold text-zinc-800">{application.purpose_of_travel || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Intended Stay</p>
                    <p className="font-semibold text-zinc-800">{application.intended_stay_days ? `${application.intended_stay_days} days` : "—"}</p>
                  </div>
                </div>
              </div>

              {/* Supporting Documents Section (Side-by-side with decision buttons) */}
              <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-200 pb-2 flex items-center justify-between">
                  <span>Attached Supporting Documents ({documents.length})</span>
                  <span className="text-xs text-zinc-500 font-normal">Secure Storage Files</span>
                </h2>

                {documents.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-4 text-center border border-dashed border-zinc-300 rounded">
                    No files attached to this visa filing.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.document_id}
                        className="p-3.5 rounded border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={20} className="text-[#002B49] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-900 truncate">{doc.doc_type}</p>
                            <p className="text-[10px] text-zinc-500 font-mono truncate">
                              {doc.file_path.split("/").pop()}
                            </p>
                          </div>
                        </div>
                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#002B49] text-white px-2.5 py-1 rounded text-xs font-bold hover:bg-[#001D33] shrink-0 flex items-center gap-1"
                          >
                            <span>View</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Unavailable</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Officer Decision & Notes Console */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border-2 border-[#002B49] rounded-lg p-6 shadow-sm space-y-5 sticky top-6">
                <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-200 pb-2">
                  Officer Decision Console
                </h2>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Adjudication Review Notes &amp; Findings <span className="text-red-700">*</span>
                  </label>
                  <textarea
                    className="w-full border-2 border-zinc-300 rounded p-3 text-sm focus:outline-none focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49] font-sans"
                    rows={4}
                    placeholder="Enter official adjudication notes, document verification checks, or reasons for rejection..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Notes are logged into the national audit trail and emailed to the applicant upon decision.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleApprove}
                    disabled={submitting}
                    className="w-full bg-[#107C41] hover:bg-[#0B592E] text-white py-3 px-4 rounded font-bold text-sm focus:ring-2 focus:ring-[#107C41] focus:ring-offset-1 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    <span>{submitting ? "Processing..." : "✓ Approve & Issue Digital Visa"}</span>
                  </button>

                  <button
                    onClick={handleRequestDocuments}
                    disabled={submitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded font-bold text-sm focus:ring-2 focus:ring-amber-600 focus:ring-offset-1 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Clock size={18} />
                    <span>{submitting ? "Processing..." : "⏳ Request Additional Documents"}</span>
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={submitting}
                    className="w-full bg-red-700 hover:bg-red-800 text-white py-3 px-4 rounded font-bold text-sm focus:ring-2 focus:ring-red-700 focus:ring-offset-1 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={18} />
                    <span>{submitting ? "Processing..." : "✕ Reject Application"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <GovFooter />
    </div>
  );
}
