import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { OfficerNavbar } from "../../components/OfficerNavbar";

interface Checkpoint {
  checkpoint_id: string;
  name: string;
}

interface AssessResult {
  biometricVerificationId: string;
  biometric: { confidence: number; result: "pass" | "manual_review" | "fail" };
  risk: { score: number; level: "low" | "medium" | "high"; reasons: { reason: string; points: number }[] };
  watchlistHit: boolean;
  visaId: string | null;
  recommendation: "cleared" | "secondary_screening";
  note?: string;
}

const RISK_STYLES = {
  low: "text-status-approved bg-status-approved-bg",
  medium: "text-status-pending bg-status-pending-bg",
  high: "text-status-rejected bg-status-rejected-bg",
};

const BIOMETRIC_STYLES = {
  pass: "text-status-approved bg-status-approved-bg",
  manual_review: "text-status-pending bg-status-pending-bg",
  fail: "text-status-rejected bg-status-rejected-bg",
};

export default function BorderCheckInPage() {
  const { profile } = useAuth();

  const [passportNumber, setPassportNumber] = useState("");
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [checkpointId, setCheckpointId] = useState("");
  const [movementType, setMovementType] = useState<"entry" | "exit">("entry");

  const [passportId, setPassportId] = useState<string | null>(null);
  const [travelerName, setTravelerName] = useState<string | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState<AssessResult | null>(null);
  const [finalDecision, setFinalDecision] = useState<"cleared" | "secondary_screening" | "refused" | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCheckpoints() {
      const { data } = await supabase
        .from("checkpoints")
        .select("checkpoint_id, name")
        .eq("is_active", true)
        .order("name");
      setCheckpoints(data ?? []);
      if (data && data.length > 0) setCheckpointId(data[0].checkpoint_id);
    }
    loadCheckpoints();
  }, []);

  async function getAuthHeaders(): Promise<HeadersInit> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    };
  }

  async function handleLookupAndAssess(e: React.FormEvent) {
    e.preventDefault();
    if (!passportNumber.trim()) return;

    setError(null);
    setAssessing(true);
    setAssessment(null);
    setConfirmed(false);

    // 1. Fetch passport record
    const { data: passport, error: pError } = await supabase
      .from("passports")
      .select("passport_id, status, users(full_name)")
      .eq("passport_number", passportNumber.trim().toUpperCase())
      .single();

    if (pError || !passport) {
      setError("Passport not found in the national registry.");
      setAssessing(false);
      return;
    }

    if (passport.status !== "active") {
      setError(`Passport is ${passport.status} — not eligible for border processing.`);
      setAssessing(false);
      return;
    }

    setPassportId(passport.passport_id);
    setTravelerName((passport.users as any)?.full_name ?? null);

    // 2. Call the backend assess endpoint (runs biometric + risk engine)
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/border/assess", {
        method: "POST",
        headers,
        body: JSON.stringify({ passportId: passport.passport_id, officerId: profile?.user_id }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: text };
        }
      } catch {}

      if (!res.ok) throw new Error(data?.error ?? "Assessment failed");

      setAssessment(data);
      setFinalDecision(data.recommendation); // pre-fill with recommendation, officer can override
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAssessing(false);
    }
  }

  async function confirmDecision() {
    if (!passportId || !assessment || !finalDecision) return;
    setFinalizing(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/border/finalize", {
        method: "POST",
        headers,
        body: JSON.stringify({
          passportId,
          checkpointId,
          movementType,
          officerId: profile?.user_id,
          biometricVerificationId: assessment.biometricVerificationId,
          visaId: assessment.visaId,
          riskScore: assessment.risk.score,
          watchlistHit: assessment.watchlistHit,
          decision: finalDecision,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: text };
        }
      } catch {}

      if (!res.ok) throw new Error(data?.error ?? "Could not record decision");

      setConfirmed(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFinalizing(false);
    }
  }

  function resetForNext() {
    setPassportNumber("");
    setPassportId(null);
    setTravelerName(null);
    setAssessment(null);
    setFinalDecision(null);
    setConfirmed(false);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <OfficerNavbar title="Traveler Border Check-in Console" />

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-36 grid gap-6">
        {/* Lookup form */}
        <SecurityPaperPanel className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-lg font-bold text-ink">1. Scan or enter passport</h2>
            <Link
              to="/border/verify"
              className="bg-[#1E8E5A] hover:bg-[#166E46] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <span>📷 Live Camera QR Scanner</span>
            </Link>
          </div>
          <form onSubmit={handleLookupAndAssess}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Passport number</label>
                <input
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="e.g. SL0123456"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Checkpoint</label>
                <select
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={checkpointId}
                  onChange={(e) => setCheckpointId(e.target.value)}
                >
                  <option value="">Select...</option>
                  {checkpoints.map((c) => (
                    <option key={c.checkpoint_id} value={c.checkpoint_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Direction</label>
                <select
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as "entry" | "exit")}
                >
                  <option value="entry">Entry</option>
                  <option value="exit">Exit</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={assessing}
              className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-40 transition cursor-pointer shadow-xs"
            >
              {assessing ? "Running checks..." : "Run check"}
            </button>
          </form>
          {error && <p className="text-status-rejected text-sm mt-3">{error}</p>}
        </SecurityPaperPanel>

        {/* Assessment results */}
        {assessment && (
          <SecurityPaperPanel className="p-6">
            <h2 className="font-display text-lg mb-1">2. Review assessment</h2>
            {travelerName && <p className="text-sm text-ink-soft mb-5">{travelerName}</p>}

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className={`rounded-md p-4 ${BIOMETRIC_STYLES[assessment.biometric.result]}`}>
                <p className="text-xs uppercase tracking-wide font-medium mb-1">Biometric match</p>
                <p className="font-mono text-lg">{assessment.biometric.confidence}%</p>
                <p className="text-xs mt-1 capitalize">{assessment.biometric.result.replace("_", " ")}</p>
              </div>
              <div className={`rounded-md p-4 ${RISK_STYLES[assessment.risk.level]}`}>
                <p className="text-xs uppercase tracking-wide font-medium mb-1">Risk score</p>
                <p className="font-mono text-lg">{assessment.risk.score}/100</p>
                <p className="text-xs mt-1 capitalize">{assessment.risk.level} risk</p>
              </div>
            </div>

            {assessment.watchlistHit && (
              <div className="bg-status-rejected-bg text-status-rejected text-sm font-medium rounded-md px-4 py-2.5 mb-5">
                ⚠ Watchlist match on this passport
              </div>
            )}

            {assessment.risk.reasons.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-ink-soft uppercase tracking-wide mb-2">Risk factors</p>
                <ul className="text-sm grid gap-1">
                  {assessment.risk.reasons.map((r, i) => (
                    <li key={i} className="flex justify-between border-b border-primary-light/60 pb-1">
                      <span className="capitalize">{r.reason.replace(/_/g, " ")}</span>
                      <span className="font-mono text-ink-soft">+{r.points}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-ink-soft italic mb-5">{assessment.note}</p>
          </SecurityPaperPanel>
        )}

        {/* Officer decision */}
        {assessment && !confirmed && (
          <SecurityPaperPanel className="p-6">
            <h2 className="font-display text-lg mb-4">3. Officer decision</h2>
            <p className="text-sm text-ink-soft mb-4">
              System recommends:{" "}
              <span className="font-medium text-ink">
                {assessment.recommendation.replace("_", " ")}
              </span>
              . You may confirm or override this.
            </p>
            <div className="flex gap-3 mb-6">
              {(["cleared", "secondary_screening", "refused"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setFinalDecision(d)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors capitalize ${
                    finalDecision === d
                      ? "border-primary bg-primary text-white"
                      : "border-primary-light text-ink-soft hover:border-primary/40"
                  }`}
                >
                  {d.replace("_", " ")}
                </button>
              ))}
            </div>
            <button
              onClick={confirmDecision}
              disabled={finalizing || !finalDecision}
              className="bg-accent text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-40 transition"
            >
              {finalizing ? "Recording..." : "Confirm & log decision"}
            </button>
          </SecurityPaperPanel>
        )}

        {/* Confirmation */}
        {confirmed && (
          <SecurityPaperPanel className="p-6 text-center">
            <p className="font-display text-lg text-status-approved mb-2">Decision recorded</p>
            <p className="text-sm text-ink-soft mb-5">
              {movementType === "entry" ? "Entry" : "Exit"} logged as{" "}
              <span className="font-medium capitalize">{finalDecision?.replace("_", " ")}</span>.
            </p>
            <button
              onClick={resetForNext}
              className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark transition"
            >
              Next traveler
            </button>
          </SecurityPaperPanel>
        )}
      </main>
    </div>
  );
}
