import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { StatusStamp } from "../../components/StatusStamp";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { ApplicantNavbar } from "../../components/ApplicantNavbar";

interface Application {
  application_id: string;
  application_ref: string;
  status: "draft" | "submitted" | "under_review" | "documents_requested" | "approved" | "rejected";
  payment_status: "unpaid" | "paid";
  submitted_at: string | null;
  visa_types: { name: string } | null;
  digital_visas: { visa_number: string; expiry_date: string }[] | { visa_number: string; expiry_date: string } | null;
}

interface HistoryEntry {
  history_id: string;
  status: string;
  note: string | null;
  changed_at: string;
}

export default function ApplicationStatusPage() {
  const { id } = useParams<{ id: string }>();

  const [application, setApplication] = useState<Application | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const [{ data: app }, { data: hist }] = await Promise.all([
        supabase
          .from("visa_applications")
          .select(
            "application_id, application_ref, status, payment_status, submitted_at, visa_types(name), digital_visas(visa_number, expiry_date)"
          )
          .eq("application_id", id)
          .single(),
        supabase
          .from("application_status_history")
          .select("history_id, status, note, changed_at")
          .eq("application_id", id)
          .order("changed_at", { ascending: true }),
      ]);

      setApplication(app as any);
      setHistory(hist ?? []);
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <ApplicantNavbar />
      <div className="p-10 text-ink-soft text-center">Loading application status...</div>
    </div>
  );

  if (!application) return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <ApplicantNavbar />
      <div className="p-10 text-ink-soft text-center">
        <p className="text-lg font-medium text-ink">Application not found.</p>
        <Link to="/dashboard" className="text-primary text-sm underline mt-2 inline-block">
          Return to dashboard
        </Link>
      </div>
    </div>
  );

  const visa = Array.isArray(application.digital_visas)
    ? application.digital_visas[0]
    : application.digital_visas;

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <ApplicantNavbar />

      <main className="max-w-3xl mx-auto px-6 py-8 pb-24 sm:pb-8 grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
              &larr; Back to my dashboard
            </Link>
            <h1 className="font-display text-2xl font-bold mt-1">Application {application.application_ref}</h1>
          </div>
          {application.payment_status === "unpaid" && application.status !== "rejected" && (
            <Link
              to={`/visa/${application.application_id}/payment`}
              className="bg-accent text-white px-4 py-2 rounded-md text-xs font-medium hover:opacity-90 transition shadow-xs"
            >
              Pay Visa Fee &rarr;
            </Link>
          )}
        </div>

        {/* Status Card */}
        <SecurityPaperPanel className="p-6 flex flex-wrap items-center gap-6" showRosette>
          <div className="scale-90 flex-shrink-0">
            <StatusStamp status={application.status} />
          </div>
          <div>
            <span className="font-mono text-xs text-primary tracking-wider uppercase font-semibold">
              Current Status
            </span>
            <p className="font-display text-2xl font-bold capitalize text-ink">
              {application.status.replace(/_/g, " ")}
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Visa Category: <span className="font-medium text-ink">{application.visa_types?.name ?? "Standard Visa"}</span>
            </p>
            <p className="text-xs text-ink-soft mt-1">
              Payment Status:{" "}
              <span className={`font-semibold uppercase font-mono ${application.payment_status === "paid" ? "text-status-approved" : "text-status-rejected"}`}>
                {application.payment_status}
              </span>
            </p>
          </div>
        </SecurityPaperPanel>

        {/* Digital Visa Card (if approved) */}
        {visa && application.status === "approved" && (
          <SecurityPaperPanel className="p-6 border-status-approved/40">
            <div className="flex items-center justify-between mb-4 border-b border-primary-light pb-2">
              <h2 className="font-display text-lg font-bold text-status-approved">Digital Visa Issued</h2>
              <span className="text-xs font-mono bg-status-approved-bg text-status-approved px-2 py-0.5 rounded font-bold">
                ACTIVE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-ink-soft uppercase tracking-wide mb-1 font-medium">Digital Visa Number</p>
                <p className="font-mono text-base font-bold text-ink">{visa.visa_number}</p>
              </div>
              <div>
                <p className="text-xs text-ink-soft uppercase tracking-wide mb-1 font-medium">Valid Until</p>
                <p className="font-mono text-base text-ink">{new Date(visa.expiry_date).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-xs text-ink-soft mt-4 bg-primary-light/40 p-3 rounded">
              ℹ️ Please present this digital visa reference along with your physical biometric passport upon arrival at any Sierra Leone border checkpoint.
            </p>
          </SecurityPaperPanel>
        )}

        {/* Timeline */}
        <SecurityPaperPanel className="p-6">
          <h2 className="font-display text-lg font-bold mb-5">Application History & Timeline</h2>
          {history.length === 0 ? (
            <div className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
              </div>
              <div>
                <p className="text-sm font-medium capitalize">{application.status.replace(/_/g, " ")}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  {application.submitted_at ? new Date(application.submitted_at).toLocaleString() : "Just now"}
                </p>
                <p className="text-xs text-ink-soft mt-1 italic">Application received by the Department of Immigration.</p>
              </div>
            </div>
          ) : (
            <ul className="grid gap-4">
              {history.map((h, i) => (
                <li key={h.history_id} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
                    {i < history.length - 1 && <span className="w-px flex-1 bg-primary-light mt-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium capitalize">{h.status.replace(/_/g, " ")}</p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {new Date(h.changed_at).toLocaleString()}
                    </p>
                    {h.note && <p className="text-xs text-ink-soft mt-1 italic">{h.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SecurityPaperPanel>
      </main>
    </div>
  );
}
