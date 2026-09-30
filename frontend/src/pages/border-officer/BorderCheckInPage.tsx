import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { GovHeader, GovFooter } from "../../components/GovHeader";
import { Camera, ShieldAlert, ShieldCheck, ArrowRight, UserCheck, RefreshCw } from "lucide-react";

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

    // 2. Call backend assess endpoint
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
      setFinalDecision(data.recommendation);
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
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-sans flex flex-col justify-between">
      <GovHeader
        portalTitle="Border Control & Security"
        portalSubtitle="Traveler Check-in Terminal"
        breadcrumbs={[
          { name: "Border Operations", path: "/border/check-in" },
          { name: "Traveler Check-in" },
        ]}
      />

      <main id="main-content" className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* Top title area */}
        <div className="border-b-2 border-zinc-900 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Traveler Border Check-in Console
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Verify traveler passports, process automated risk scores, and record entry/exit decisions.
            </p>
          </div>
          <Link
            to="/border/verify"
            className="inline-flex items-center gap-2 bg-[#002B49] text-white px-4 py-2.5 rounded text-sm font-semibold hover:bg-[#001D33] focus:ring-2 focus:ring-[#002B49] focus:ring-offset-2 transition shrink-0"
          >
            <Camera size={18} />
            <span>Live Camera QR Scanner</span>
          </Link>
        </div>

        {/* Step 1: Scan or Lookup */}
        <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#002B49] text-white text-xs font-bold flex items-center justify-center">1</span>
            <span>Scan or Enter Passport Details</span>
          </h2>

          <form onSubmit={handleLookupAndAssess} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-sm font-bold text-zinc-900 mb-1">
                  Passport Number <span className="text-red-700">*</span>
                </label>
                <input
                  className="w-full border-2 border-zinc-400 rounded px-3 py-2 text-base font-mono uppercase font-semibold text-zinc-900 focus:outline-none focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49]"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="e.g. SLE987654"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-1">
                  Checkpoint Location
                </label>
                <select
                  className="w-full border-2 border-zinc-400 rounded px-3 py-2 text-sm text-zinc-900 font-medium focus:outline-none focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49]"
                  value={checkpointId}
                  onChange={(e) => setCheckpointId(e.target.value)}
                >
                  <option value="">Select Station...</option>
                  {checkpoints.map((c) => (
                    <option key={c.checkpoint_id} value={c.checkpoint_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-1">
                  Travel Direction
                </label>
                <select
                  className="w-full border-2 border-zinc-400 rounded px-3 py-2 text-sm text-zinc-900 font-medium focus:outline-none focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49]"
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as "entry" | "exit")}
                >
                  <option value="entry">Entry into Sierra Leone</option>
                  <option value="exit">Exit from Sierra Leone</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-700 p-4 rounded text-sm text-red-900 font-medium flex items-start gap-2">
                <ShieldAlert size={18} className="text-red-700 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={assessing}
              className="bg-[#107C41] text-white px-6 py-2.5 rounded text-sm font-bold hover:bg-[#0B592E] disabled:opacity-50 focus:ring-2 focus:ring-[#107C41] focus:ring-offset-2 transition flex items-center gap-2 cursor-pointer"
            >
              {assessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Checking National Databases...</span>
                </>
              ) : (
                <>
                  <span>Run Passport &amp; Risk Assessment</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Step 2: Assessment Results */}
        {assessment && (
          <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#002B49] text-white text-xs font-bold flex items-center justify-center">2</span>
              <span>Automated Risk &amp; Biometric Assessment</span>
            </h2>

            {travelerName && (
              <div className="bg-zinc-100 p-3 rounded border-l-4 border-[#002B49]">
                <p className="text-xs uppercase font-bold text-zinc-500">Traveler Name</p>
                <p className="text-base font-bold text-zinc-900">{travelerName}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Biometric score */}
              <div className={`p-4 rounded border ${
                assessment.biometric.result === "pass"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : assessment.biometric.result === "manual_review"
                  ? "bg-amber-50 border-amber-300 text-amber-950"
                  : "bg-red-50 border-red-300 text-red-950"
              }`}>
                <p className="text-xs uppercase font-bold tracking-wider mb-1">Biometric Verification</p>
                <p className="font-mono text-3xl font-bold">{assessment.biometric.confidence}% Match</p>
                <p className="text-xs font-semibold mt-1 uppercase tracking-wide">
                  Result: {assessment.biometric.result.replace("_", " ")}
                </p>
              </div>

              {/* Risk score */}
              <div className={`p-4 rounded border ${
                assessment.risk.level === "low"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : assessment.risk.level === "medium"
                  ? "bg-amber-50 border-amber-300 text-amber-950"
                  : "bg-red-50 border-red-300 text-red-950"
              }`}>
                <p className="text-xs uppercase font-bold tracking-wider mb-1">Security Risk Score</p>
                <p className="font-mono text-3xl font-bold">{assessment.risk.score} / 100</p>
                <p className="text-xs font-semibold mt-1 uppercase tracking-wide">
                  Level: {assessment.risk.level} Risk
                </p>
              </div>
            </div>

            {/* Watchlist Hit Warning */}
            {assessment.watchlistHit && (
              <div className="bg-red-700 text-white p-4 rounded text-sm font-bold flex items-center gap-3">
                <ShieldAlert size={24} className="shrink-0 text-amber-300" />
                <div>
                  <p className="text-base uppercase tracking-wider font-extrabold">INTERPOL / Security Watchlist Hit Detected</p>
                  <p className="text-xs font-normal opacity-90 mt-0.5">
                    This traveler requires immediate secondary screening. Notify station command prior to clearance.
                  </p>
                </div>
              </div>
            )}

            {/* Risk factors */}
            {assessment.risk.reasons.length > 0 && (
              <div className="border border-zinc-200 rounded p-4 bg-zinc-50">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Identified Risk Factors</p>
                <ul className="divide-y divide-zinc-200 text-sm">
                  {assessment.risk.reasons.map((r, i) => (
                    <li key={i} className="py-2 flex justify-between items-center">
                      <span className="font-medium text-zinc-900 capitalize">{r.reason.replace(/_/g, " ")}</span>
                      <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs">+{r.points} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.note && (
              <p className="text-xs text-zinc-500 italic bg-zinc-50 p-2.5 rounded border border-zinc-200">
                System Note: {assessment.note}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Officer Decision */}
        {assessment && !confirmed && (
          <div className="bg-white border-2 border-[#002B49] rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#002B49] text-white text-xs font-bold flex items-center justify-center">3</span>
              <span>Officer Border Adjudication</span>
            </h2>

            <p className="text-sm text-zinc-700">
              System Recommendation:{" "}
              <strong className="uppercase bg-zinc-100 px-2 py-0.5 border border-zinc-300 rounded text-zinc-900 font-bold">
                {assessment.recommendation.replace("_", " ")}
              </strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["cleared", "secondary_screening", "refused"] as const).map((d) => {
                const isSelected = finalDecision === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFinalDecision(d)}
                    className={`py-3 px-4 rounded border-2 text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? d === "cleared"
                          ? "border-[#107C41] bg-[#107C41] text-white"
                          : d === "secondary_screening"
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-red-700 bg-red-700 text-white"
                        : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-500"
                    }`}
                  >
                    {d === "cleared" && <UserCheck size={18} />}
                    {d === "secondary_screening" && <ShieldAlert size={18} />}
                    {d === "refused" && <ShieldAlert size={18} />}
                    <span className="capitalize">{d.replace("_", " ")}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={confirmDecision}
              disabled={finalizing || !finalDecision}
              className="w-full bg-[#002B49] text-white py-3 px-6 rounded font-bold text-base hover:bg-[#001D33] focus:ring-2 focus:ring-[#002B49] focus:ring-offset-2 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {finalizing ? "Logging Officer Decision..." : "Confirm & Log Border Decision"}
            </button>
          </div>
        )}

        {/* Step 4: Decision Confirmed */}
        {confirmed && (
          <div className="bg-emerald-50 border-2 border-[#107C41] p-8 rounded-lg text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-[#107C41] text-white rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Border Clearance Recorded</h2>
              <p className="text-sm text-emerald-900 mt-1">
                {movementType === "entry" ? "Entry" : "Exit"} event logged for traveler{" "}
                <strong>{travelerName ?? passportNumber}</strong> as{" "}
                <span className="uppercase font-bold underline">{finalDecision?.replace("_", " ")}</span>.
              </p>
            </div>
            <button
              onClick={resetForNext}
              className="bg-[#002B49] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-[#001D33] focus:ring-2 focus:ring-[#002B49] transition cursor-pointer"
            >
              Process Next Traveler
            </button>
          </div>
        )}
      </main>

      <GovFooter />
    </div>
  );
}
