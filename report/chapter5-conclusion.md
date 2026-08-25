# Chapter 5: Limitations, Ethical Considerations, Future Work, and Conclusion

## 5.1 Limitations

This project was deliberately scoped to what a final-year project timeline and a single-developer team can build and defend credibly, rather than attempting to match the infrastructure of the international systems reviewed in Chapter 2. The following limitations are acknowledged directly rather than concealed:

1. **Simulated biometric verification.** The system does not integrate real fingerprint or facial recognition hardware, nor a trained biometric matching model. `simulateBiometricMatch()` produces a deterministic, hash-seeded confidence score so that demonstrations are repeatable, but it does not perform actual identity verification. The `biometric_verifications` table and its integration into the risk engine exist to demonstrate *where* such a system would plug in, not to replace it.

2. **Rules-based, not machine-learning-based, risk scoring.** `calculate_risk_score()` combines five weighted, deterministic factors (watchlist match, visa status, prior overstay count, biometric result, crossing velocity). This was a deliberate design choice, not a shortfall of the project timeline alone — see §5.2 below.

3. **Client-side aggregation for analytics.** The admin dashboard fetches raw rows and aggregates counts in JavaScript rather than using Postgres `GROUP BY` queries or materialized views. This is adequate at demonstration scale but would not scale efficiently to a full production traveler volume.

4. **No database transactions around multi-step writes.** The visa approval flow (update application → insert digital visa → insert history → insert notification) executes as sequential writes rather than a single atomic database transaction. A failure partway through could leave the system in an inconsistent state (e.g., an application marked approved with no corresponding digital visa). A production implementation should wrap this in a Postgres function called via RPC.

5. **Free-text checkpoint field in early design, normalized late.** The initial schema stored `border_logs.checkpoint` as free text; this was normalized into a proper `checkpoints` table during system design (Chapter 3), but it illustrates that the schema evolved iteratively rather than being finalized in a single pass — worth noting honestly rather than presenting the final schema as the only one considered.

6. **No offline/low-connectivity mode.** The system assumes continuous connectivity to Supabase. Land border checkpoints in areas with unreliable network access were not addressed by this project's scope.

7. **Single-passport-authority assumption.** The overstay-detection view assumes a passport's most recent entry log is linked to at most one relevant authorization (a digital visa or an ECOWAS pass); a traveler with both an expired visa and an expired ECOWAS pass on file simultaneously is not fully disambiguated.

## 5.2 Ethical Considerations

### 5.2.1 Exclusion of demographic inputs from risk scoring
A deliberate design decision, made and documented during system design (Chapter 3), was to exclude nationality, ethnicity, or other demographic attributes from the risk-scoring function. Real-world border risk models that weight nationality directly are a documented source of discriminatory profiling. This system's risk factors are limited to behavioral and document-based signals: watchlist status, visa validity, verification confidence, and prior compliance history. This is presented as a design principle worth carrying forward into any future, more sophisticated version of the system, including a possible machine-learning-based one — the exclusion should apply to input features regardless of the modeling technique used.

### 5.2.2 Human authority over automated recommendations
The border check-in workflow is deliberately split into an assessment step (`/api/border/assess`, producing a *recommendation*) and a separate finalization step (`/api/border/finalize`, recording the officer's *actual* decision). No border crossing record can be created without an officer's explicit confirmation, and the recorded decision may differ from the system's recommendation. This reflects a considered position that automated systems in an immigration-enforcement context should support, not replace, human judgment and accountability — consistent with the "AI-assisted, not AI-decided" framing established at the start of this project.

### 5.2.3 Data sensitivity
Passport numbers, biometric confidence scores, and watchlist reasons are treated as sensitive operational data. RLS policies restrict biometric and watchlist read access to staff roles; applicants can never view their own risk score or watchlist status, consistent with standard practice in the reviewed international systems (Chapter 2), where border risk assessments are not disclosed to the traveler being assessed.

### 5.2.4 Explainability
The risk engine returns a structured `reasons` array (each contributing factor and its point value) rather than an opaque score. This was a deliberate choice to keep the system auditable and explainable to the officer using it, in contrast to black-box risk-scoring approaches that have drawn documented criticism in some countries' visa systems.

## 5.3 Recommendations for Future Work

1. **Replace simulated biometric verification with a real SDK integration** (e.g., a commercial facial recognition API or fingerprint scanner hardware), preserving the existing `biometric_verifications` table structure so the risk engine and downstream logic require minimal change.
2. **Evaluate a supervised machine-learning risk model** trained on accumulated `border_logs` and `overstaying_travelers` data, once sufficient real operational data exists — while carrying forward the demographic-exclusion principle from §5.2.1 into feature selection.
3. **Wrap multi-step write operations in Postgres RPC functions** to gain transactional atomicity, addressing limitation §5.1.4.
4. **Move dashboard analytics to server-side aggregation** (materialized views or scheduled summary tables) to remove the client-side aggregation limitation as traveler volume grows.
5. **Investigate offline-capable checkpoint clients** for land border posts with unreliable connectivity, potentially via local caching and background sync.
6. **Extend the ECOWAS pass / digital visa disambiguation logic** in the overstay view to handle travelers with multiple concurrent authorization records.
7. **Pilot the system at a single checkpoint** before any broader rollout, to validate the risk engine's thresholds (currently set at illustrative values: 30/60 for medium/high risk) against real traffic patterns before they inform real officer decisions.

## 5.4 Conclusion

This project designed and implemented a web-based immigration management system for the Sierra Leone Immigration Department, covering traveler registration, passport and visa management, entry/exit monitoring, and administrative oversight across four role-based portals. The system's design was informed by a comparative review of five international immigration systems (Chapter 2), from which specific, individually achievable design principles were drawn rather than attempting to replicate any single system's full scale.

The project's central design commitment — that automated risk assessment should produce transparent, explainable recommendations while human officers retain final decision authority — was carried through consistently from the initial architecture discussion, into the database schema (the assess/finalize separation), the backend implementation, the frontend workflow, and the use case and sequence diagrams documenting it. This consistency between stated principle and actual implementation is, alongside the working software itself, offered as the project's primary contribution.

The system's limitations — simulated rather than real biometric verification, a rules-based rather than learned risk model, and the absence of transactional guarantees around multi-step operations — are acknowledged directly rather than concealed, and are framed throughout this report as a deliberate, defensible scope boundary for a final-year project rather than as unaddressed shortcomings. The recommendations in §5.3 outline a credible path from this working prototype toward a production-grade departmental system.
