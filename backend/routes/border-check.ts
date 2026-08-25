/**
 * border-check.ts
 *
 * SL Immigration System — border crossing check-in flow.
 * Split into two steps so the officer's confirmation is the thing that
 * actually gets written to border_logs, not the system's recommendation:
 *
 *   1. POST /api/border/assess   — runs biometric + risk engine, returns
 *      a recommendation. Nothing in border_logs is written yet.
 *   2. POST /api/border/finalize — takes the officer's chosen decision
 *      (which may differ from the recommendation) and writes the log.
 *
 * All border clearance operations require authenticated staff credentials (requireStaff).
 */

import { Router } from "express";
import crypto from "crypto";
import { supabaseAdmin } from "../lib/supabaseAdmin"; // service-role client, bypasses RLS
import { requireStaff, AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// ---------------------------------------------------------------
// Simulated biometric match
// ---------------------------------------------------------------
function simulateBiometricMatch(passportId: string): {
  confidence: number;
  result: "pass" | "manual_review" | "fail";
} {
  const hash = crypto.createHash("sha256").update(passportId).digest();
  const raw = hash.readUInt16BE(0) / 65535; // 0..1
  const confidence = Math.round((55 + raw * 45) * 100) / 100; // 55.00-100.00

  let result: "pass" | "manual_review" | "fail";
  if (confidence >= 90) result = "pass";
  else if (confidence >= 75) result = "manual_review";
  else result = "fail";

  return { confidence, result };
}

// ---------------------------------------------------------------
// POST /api/border/assess
// Body: { passportId }
// Runs biometric + risk scoring, stores the biometric record, and
// returns a recommendation.
// ---------------------------------------------------------------
router.post("/api/border/assess", requireStaff, async (req: AuthenticatedRequest, res) => {
  const { passportId } = req.body;
  const officerId = req.user?.id || req.profile?.user_id;

  if (!passportId) {
    return res.status(400).json({ error: "Missing required passportId" });
  }

  try {
    const { confidence, result } = simulateBiometricMatch(passportId);

    const { data: biometric, error: bioError } = await supabaseAdmin
      .from("biometric_verifications")
      .insert({
        passport_id: passportId,
        method: "facial_simulated",
        confidence_score: confidence,
        result,
        officer_id: officerId,
      })
      .select()
      .single();

    if (bioError) throw bioError;

    const { data: riskRows, error: riskError } = await supabaseAdmin.rpc(
      "calculate_risk_score",
      { p_passport_id: passportId }
    );
    if (riskError) throw riskError;
    const { score, risk_level, reasons } = riskRows[0];

    const watchlistHit = reasons.some((r: any) => r.reason === "watchlist_match");

    // Recommendation only — the officer chooses the real decision in /finalize
    const recommendation: "cleared" | "secondary_screening" =
      result === "fail" || risk_level === "high" ? "secondary_screening" : "cleared";

    const { data: visa } = await supabaseAdmin
      .from("digital_visas")
      .select("visa_id")
      .eq("passport_id", passportId)
      .eq("status", "active")
      .order("issue_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    return res.json({
      biometricVerificationId: biometric.verification_id,
      biometric: { confidence, result },
      risk: { score, level: risk_level, reasons },
      watchlistHit,
      visaId: visa?.visa_id ?? null,
      recommendation,
      note: "This is a system recommendation. The officer retains final decision authority.",
    });
  } catch (err: any) {
    console.error("border assess failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ---------------------------------------------------------------
// POST /api/border/finalize
// Body: { passportId, checkpointId, movementType,
//         biometricVerificationId, visaId, riskScore, watchlistHit, decision }
// ---------------------------------------------------------------
router.post("/api/border/finalize", requireStaff, async (req: AuthenticatedRequest, res) => {
  const {
    passportId,
    checkpointId,
    movementType,
    biometricVerificationId,
    visaId,
    riskScore,
    watchlistHit,
    decision,
  } = req.body;
  const officerId = req.user?.id || req.profile?.user_id;

  if (!passportId || !checkpointId || !movementType || !decision) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data: log, error: logError } = await supabaseAdmin
      .from("border_logs")
      .insert({
        passport_id: passportId,
        visa_id: visaId ?? null,
        movement_type: movementType,
        checkpoint_id: checkpointId,
        officer_id: officerId,
        biometric_verification_id: biometricVerificationId ?? null,
        risk_score: riskScore ?? null,
        watchlist_hit: watchlistHit ?? false,
        decision,
      })
      .select()
      .single();

    if (logError) throw logError;

    return res.json({ log });
  } catch (err: any) {
    console.error("border finalize failed:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

export default router;
