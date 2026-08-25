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
  purpose_of_travel: string | null;
  intended_arrival_date: string | null;
  intended_stay_days: number | null;
  passport_id: string;
  visa_type_id: string;
  visa_types: { name: string; validity_days: number } | null;
  passports: {
    user_id: string;
    passport_number: string;
    date_of_birth: string;
    expiry_date: string;
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

    const issueDate = new Date();
    const expiryDate = new Date(issueDate);
    expiryDate.setDate(expiryDate.getDate() + (application.visa_types?.validity_days ?? 90));

    // 1. Update the application
    await supabase
      .from("visa_applications")
      .update({
        status: "approved",
        reviewed_by: profile.user_id,
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        decided_at: new Date().toISOString(),
      })
      .eq("application_id", application.application_id);

    // 2. Issue the digital visa
    const visaNumber = `DV-${Date.now().toString(36).toUpperCase()}`;
    const qrToken = crypto.randomUUID();

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

    // 3. Log history + notify applicant (in-app + real email)
    await recordHistory("approved");
    if (application.passports?.user_id) {
      await supabase.from("notifications").insert({
        user_id: application.passports.user_id,
        message: `Your visa application ${application.application_ref} has been approved.`,
      });
    }
    fetch("/api/notify/visa-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: application.application_id, event: "approved" }),
    }).catch((e) => console.error("Approval email failed to send:", e));

    setSubmitting(false);
    navigate("/visa-officer");
  }

  async function handleReject() {
    if (!application || !profile) return;
    if (!notes) {
      alert("Please add a review note explaining the rejection before submitting.");
      return;
    }
    setSubmitting(true);

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

    await recordHistory("rejected");
    if (application.passports?.user_id) {
      await supabase.from("notifications").insert({
        user_id: application.passports.user_id,
        message: `Your visa application ${application.application_ref} was not approved. See review notes for details.`,
      });
    }
    fetch("/api/notify/visa-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: application.application_id, event: "rejected" }),
    }).catch((e) => console.error("Rejection email failed to send:", e));

    setSubmitting(false);
    navigate("/visa-officer");
  }

  async function handleRequestDocuments() {
    if (!application || !profile) return;
    if (!notes) {
      alert("Please specify which documents are needed.");
      return;
    }
    setSubmitting(true);

    await supabase
      .from("visa_applications")
      .update({ status: "documents_requested", reviewed_by: profile.user_id })
      .eq("application_id", application.application_id);

    await recordHistory("documents_requested");
    if (application.passports?.user_id) {
      await supabase.from("notifications").insert({
        user_id: application.passports.user_id,
        message: `Additional documents are needed for application ${application.application_ref}: ${notes}`,
      });
    }
    fetch("/api/notify/visa-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: application.application_id, event: "documents_requested" }),
    }).catch((e) => console.error("Documents-requested email failed to send:", e));

    setSubmitting(false);
    navigate("/visa-officer");
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
        <Link to="/visa-officer" className="text-primary text-sm underline mt-2 inline-block">
          Return to Queue
        </Link>
      </div>
    </div>
  );

  const applicant = application.passports?.users;

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <OfficerNavbar title="Visa Adjudication & Review Portal" />

      <main className="max-w-4xl mx-auto px-6 py-8 grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/visa-officer" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
              &larr; Back to review queue
            </Link>
            <h1 className="font-display text-2xl font-bold mt-1">Case File: {application.application_ref}</h1>
          </div>
          <span className="font-mono text-xs uppercase tracking-wide text-primary font-bold bg-primary-light px-3 py-1.5 rounded-md border border-primary/20">
            Status: {application.status.replace(/_/g, " ")}
          </span>
        </div>
        {/* Applicant + passport */}
        <SecurityPaperPanel className="p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">Applicant</p>
            <p className="text-sm font-medium">{applicant?.full_name}</p>
            <p className="text-xs text-ink-soft">{applicant?.email}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">Passport</p>
            <p className="font-mono text-sm">{application.passports?.passport_number}</p>
            <p className="text-xs text-ink-soft">
              Expires{" "}
              {application.passports?.expiry_date &&
                new Date(application.passports.expiry_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">Visa type</p>
            <p className="text-sm font-medium">{application.visa_types?.name}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">Arrival / stay</p>
            <p className="text-sm font-mono">
              {application.intended_arrival_date} · {application.intended_stay_days} days
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">Purpose of travel</p>
            <p className="text-sm">{application.purpose_of_travel}</p>
          </div>
        </SecurityPaperPanel>

        {/* Documents */}
        <SecurityPaperPanel className="p-6">
          <h2 className="font-display text-lg mb-4">Submitted documents</h2>
          {documents.length === 0 ? (
            <p className="text-sm text-ink-soft">No documents uploaded.</p>
          ) : (
            <ul className="grid gap-2">
              {documents.map((d) => (
                <li key={d.document_id}>
                  <a
                    href={d.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline underline-offset-4"
                  >
                    {d.doc_type}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </SecurityPaperPanel>

        {/* Decision */}
        <SecurityPaperPanel className="p-6">
          <h2 className="font-display text-lg mb-4">Decision</h2>
          <label className="block text-sm font-medium mb-1.5">Review notes</label>
          <textarea
            className="w-full border border-primary-light rounded-md px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            rows={3}
            placeholder="Required for rejection or document requests"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="bg-status-approved text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-40 transition"
            >
              Approve & issue visa
            </button>
            <button
              onClick={handleRequestDocuments}
              disabled={submitting}
              className="bg-status-pending text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-40 transition"
            >
              Request documents
            </button>
            <button
              onClick={handleReject}
              disabled={submitting}
              className="bg-status-rejected text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-40 transition"
            >
              Reject
            </button>
          </div>
        </SecurityPaperPanel>
      </main>
    </div>
  );
}
