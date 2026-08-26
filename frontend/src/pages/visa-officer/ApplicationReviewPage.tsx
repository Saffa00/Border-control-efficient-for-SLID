import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { OfficerNavbar } from "../../components/OfficerNavbar";

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
          `application_id, application_ref, status, purpose_of_travel, intended_arrival_date,
           intended_stay_days, passport_id, visa_type_id,
           visa_types(name, validity_days),
           passports(user_id, passport_number, date_of_birth, expiry_date, users(full_name, email))`
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

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        fetch("/api/notify/visa-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: application.application_id, event: "approved" }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
      } catch {}

      navigate("/visa-officer");
    } catch (err: any) {
      alert(err.message || "Failed to approve visa application.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!application || !profile) return;
    if (!notes) {
      alert("Please add a review note explaining the rejection before submitting.");
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
            message: `Your visa application ${application.application_ref} was not approved. See review notes for details.`,
          });
        } catch {}
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        fetch("/api/notify/visa-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: application.application_id, event: "rejected" }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
      } catch {}

      navigate("/visa-officer");
    } catch (err: any) {
      alert(err.message || "Failed to submit rejection decision.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestDocuments() {
    if (!application || !profile) return;
    if (!notes) {
      alert("Please specify which documents are needed.");
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
            message: `Additional documents are needed for application ${application.application_ref}: ${notes}`,
          });
        } catch {}
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        fetch("/api/notify/visa-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: application.application_id, event: "documents_requested" }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
      } catch {}

      navigate("/visa-officer");
    } catch (err: any) {
      alert(err.message || "Failed to submit document request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <OfficerNavbar title="Visa Adjudication & Review Portal" />
      <div className="p-10 text-ink-soft text-center">Loading application file...</div>
    </div>
  );

  if (!application) return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <OfficerNavbar title="Visa Adjudication & Review Portal" />
      <div className="p-10 text-ink-soft text-center">
        <p className="text-lg font-medium text-ink">Application not found.</p>
        <button
          onClick={() => navigate("/visa-officer")}
          className="mt-3 text-primary text-xs underline cursor-pointer"
        >
          Return to Queue
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <OfficerNavbar title="Visa Adjudication & Review Portal" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-36 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-primary font-bold bg-primary-light px-2.5 py-0.5 rounded">
              {application.application_ref}
            </span>
            <h1 className="font-display text-2xl font-bold mt-1 text-ink">
              {application.visa_types?.name ?? "Visa"} Application
            </h1>
          </div>
          <span className="text-xs font-mono uppercase bg-status-pending-bg text-status-pending px-3 py-1 rounded-full font-bold">
            {application.status.replace("_", " ")}
          </span>
        </div>

        <SecurityPaperPanel className="p-6">
          <h2 className="font-display text-lg mb-4">Applicant & Passport Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-ink-soft text-xs">Full legal name</p>
              <p className="font-medium">{application.passports?.users?.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-ink-soft text-xs">Passport number</p>
              <p className="font-mono font-medium">{application.passports?.passport_number ?? "—"}</p>
            </div>
            <div>
              <p className="text-ink-soft text-xs">Nationality</p>
              <p className="font-medium">{application.passports?.nationality ?? "—"}</p>
            </div>
            <div>
              <p className="text-ink-soft text-xs">Passport expiry</p>
              <p className="font-mono font-medium">{application.passports?.expiry_date ?? "—"}</p>
            </div>
          </div>
        </SecurityPaperPanel>

        <SecurityPaperPanel className="p-6">
          <h2 className="font-display text-lg mb-4">Travel Intentions</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-ink-soft text-xs">Purpose of travel</p>
              <p className="font-medium">{application.purpose_of_travel || "—"}</p>
            </div>
            <div>
              <p className="text-ink-soft text-xs">Intended stay</p>
              <p className="font-medium">{application.intended_stay_days ? `${application.intended_stay_days} days` : "—"}</p>
            </div>
            <div>
              <p className="text-ink-soft text-xs">Arrival date</p>
              <p className="font-medium">{application.intended_arrival_date || "—"}</p>
            </div>
            <div>
              <p className="text-ink-soft text-xs">Submitted on</p>
              <p className="font-mono text-xs">{new Date(application.submitted_at).toLocaleString()}</p>
            </div>
          </div>
        </SecurityPaperPanel>

        <SecurityPaperPanel className="p-6">
          <h2 className="font-display text-lg mb-4">Supporting Documents ({documents.length})</h2>
          {documents.length === 0 ? (
            <p className="text-xs text-ink-soft italic">No files attached to this filing.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.document_id}
                  className="flex items-center justify-between border border-primary-light rounded-xl p-3 bg-white"
                >
                  <div>
                    <p className="text-xs font-semibold">{doc.doc_type}</p>
                    <p className="text-[10px] text-ink-soft truncate max-w-[160px] font-mono">
                      {doc.file_path.split("/").pop()}
                    </p>
                  </div>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      View &rarr;
                    </a>
                  ) : (
                    <span className="text-[10px] text-ink-soft">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </SecurityPaperPanel>

        <SecurityPaperPanel className="p-6">
          <h2 className="font-display text-lg mb-4">Officer Adjudication & Decision</h2>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
            Review Notes & Official Comments
          </label>
          <textarea
            className="w-full border border-primary-light rounded-xl px-3.5 py-2.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-['Tahoma']"
            rows={3}
            placeholder="Required when rejecting or requesting additional documents..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="flex-1 bg-status-approved text-white px-5 py-3 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition cursor-pointer touch-manipulation min-h-[44px] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>{submitting ? "Processing..." : "✓ Approve & Issue Digital Visa"}</span>
            </button>
            <button
              onClick={handleRequestDocuments}
              disabled={submitting}
              className="flex-1 bg-status-pending text-white px-5 py-3 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition cursor-pointer touch-manipulation min-h-[44px] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>{submitting ? "Processing..." : "⏳ Request Documents"}</span>
            </button>
            <button
              onClick={handleReject}
              disabled={submitting}
              className="flex-1 bg-status-rejected text-white px-5 py-3 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition cursor-pointer touch-manipulation min-h-[44px] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>{submitting ? "Processing..." : "✕ Reject Application"}</span>
            </button>
          </div>
        </SecurityPaperPanel>
      </main>
    </div>
  );
}
