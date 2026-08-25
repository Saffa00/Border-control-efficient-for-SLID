# Chapter 4 (extract): Testing Plan and Test Cases

## 4.1 Testing Approach

This system was tested using three levels, consistent with standard software testing practice:

- **Unit testing** — individual functions in isolation (e.g., `calculate_risk_score()`, `simulateBiometricMatch()`, CSV/PDF export utilities)
- **Integration testing** — interaction between the frontend, backend API, and Supabase (e.g., does approving an application actually create a usable digital visa?)
- **User Acceptance Testing (UAT)** — role-based walkthroughs of each portal against the use cases defined in Chapter 3

RLS (Row Level Security) policies are tested separately from application logic, since they are the actual security boundary (Chapter 3, Security Design) — a passing UI test does not confirm the database would reject an unauthorized request made directly against the API.

Each test case below follows the format: **ID | Description | Precondition | Steps | Expected Result**. Actual Result and Pass/Fail columns are left for completion during your test execution phase — this table is the test *design*, not the executed log.

---

## 4.2 Applicant Module

| ID | Description | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-A01 | Register new applicant account | None | Register with valid email/password | Account created; `users` row with `role = applicant` |
| TC-A02 | Register passport | Logged in as applicant, no passport on file | Fill passport form, submit | `passports` row created; dashboard shows passport card |
| TC-A03 | Prevent duplicate passport number | A passport with number X already exists | Attempt to register another passport with number X | Rejected — `passport_number` has a `unique` constraint |
| TC-A04 | Submit visa application (happy path) | Applicant has a registered passport | Complete all 4 wizard steps, submit | `visa_applications` row created with `status = submitted`; documents uploaded to Storage |
| TC-A05 | Block application submission with no passport | Applicant has no passport on file | Attempt to start a new visa application | User is blocked/redirected to passport registration before the wizard proceeds |
| TC-A06 | View own application status only | Applicant A and Applicant B both have applications | Applicant A queries `/visa/:id/status` using Applicant B's application ID | Empty result — RLS policy `visa_select` prevents cross-applicant reads |
| TC-A07 | Notification appears after officer action | Visa officer approves/rejects an application | Applicant checks `/notifications` | New unread notification present with correct message |

## 4.3 Visa Officer Module

| ID | Description | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-V01 | Queue shows only matching status filter | Applications exist in multiple statuses | Select "New" filter | Only `submitted` applications appear, sorted oldest-first |
| TC-V02 | Approve application issues a digital visa | Application status = `submitted` or `under_review` | Click Approve | `visa_applications.status = approved`; new `digital_visas` row with `expiry_date = issue_date + visa_types.validity_days`; notification sent |
| TC-V03 | Reject requires a note | Application under review, no note entered | Click Reject with empty notes field | Submission blocked client-side with a validation message |
| TC-V04 | Reject with note completes | Application under review, note entered | Click Reject | `status = rejected`; `application_status_history` entry recorded; applicant notified |
| TC-V05 | Request documents returns applicant to actionable state | Application under review | Click "Request documents" with a note | `status = documents_requested`; applicant sees the note in their notification |
| TC-V06 | Applicant role cannot access review queue | Logged in as applicant | Navigate directly to `/visa-officer` | Redirected to `/unauthorized` by `ProtectedRoute` |
| TC-V07 | Document links are time-limited | Application has uploaded documents | Open a document link, wait past 1 hour, reload | Signed URL has expired and no longer resolves — confirms documents aren't publicly/permanently exposed |

## 4.4 Border/Immigration Officer Module

| ID | Description | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-B01 | Passport lookup fails gracefully for unknown number | — | Enter a passport number not in the system | Clear error message; no crash |
| TC-B02 | Biometric score is deterministic per passport | A passport has been assessed once | Run `/api/border/assess` again for the same passport | Identical `confidence` value returned both times (hash-seeded, not random) |
| TC-B03 | Watchlist match is flagged in risk reasons | Passport's number exists in `watchlist` | Run assessment | `reasons` includes `watchlist_match`; `watchlistHit = true`; warning banner shown in UI |
| TC-B04 | High risk score triggers secondary-screening recommendation | Risk score ≥ 60 | Run assessment | `recommendation = secondary_screening`, not `cleared` |
| TC-B05 | Officer can override the system recommendation | Assessment complete, recommendation = cleared | Officer selects "Refused" instead | `finalize` records `refused`, not the system's recommendation — confirms officer authority is real, not cosmetic |
| TC-B06 | No border_logs row is written before finalize | Assessment complete, officer has not yet confirmed | Query `border_logs` for this passport | No matching row exists yet — confirms the assess/finalize split behaves as designed |
| TC-B07 | Overstay report matches manual calculation | A traveler entered before their visa's `expiry_date`, no exit logged, `expiry_date` has passed | Query `overstaying_travelers` view | Row appears with correct `days_overstayed` (= today − expiry_date) |
| TC-B08 | Watchlist add is admin-only | Logged in as immigration_officer | Attempt to submit the watchlist add form (should not be visible; also test direct insert) | Form is hidden in UI; direct insert attempt is rejected by RLS policy `watchlist_insert_admin` |

## 4.5 Admin Module

| ID | Description | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-D01 | Analytics KPIs match underlying data | Known number of applications/logs/overstays exist | Compare dashboard KPI cards against direct table counts | Numbers match exactly |
| TC-D02 | Invite staff creates all three linked records | Logged in as admin | Submit invite form for a new immigration officer | `auth.users`, `public.users`, and `staff_profiles` rows all created; invite email sent; `admin_audit_log` entry recorded |
| TC-D03 | Non-admin cannot invite staff | Logged in as visa_officer | Call `/api/admin/invite-staff` directly | Rejected with 403 — backend re-verifies role server-side, not just trusting the client |
| TC-D04 | Admin cannot demote/suspend themselves | Logged in as admin, viewing own row | Attempt to change own role or Active toggle | Controls are disabled for the admin's own row |
| TC-D05 | Checkpoint delete blocked when referenced | A checkpoint has border_logs pointing to it | Attempt to delete that checkpoint | Deletion fails with a foreign-key constraint; UI shows explanatory message, not a raw DB error |
| TC-D06 | Reports export matches on-screen preview | A report has been generated | Export CSV, open it | Row count and values match the preview table |
| TC-D07 | Overstay report ignores date range | Reports page, report type = Overstays | Attempt to change From/To dates | Date fields are disabled; report always reflects current data |
| TC-D08 | Audit log entries cannot be edited | — | Attempt to update an `admin_audit_log` row directly (e.g., via API) | No update policy exists for this table — write-once by design |

## 4.6 Risk Engine Test Matrix

Because `calculate_risk_score()` combines five independent factors, each should be tested in isolation (holding the others constant) before testing combinations, to confirm each factor's point contribution is correct.

| ID | Scenario | Factors present | Expected score contribution |
|---|---|---|---|
| TC-R01 | Clean traveler | None of the below | 0 points, `risk_level = low` |
| TC-R02 | Watchlist match only | Passport number matches `watchlist` | +50 |
| TC-R03 | Expired/revoked visa on file | Latest `digital_visas.status` = `expired` or `revoked` | +20 |
| TC-R04 | One prior overstay | 1 row in `overstaying_travelers` for this passport | +15 |
| TC-R05 | Three or more prior overstays | 3+ rows | +45 (capped at 3 × 15, not uncapped) |
| TC-R06 | Biometric fail | Latest `biometric_verifications.result = fail` | +25 |
| TC-R07 | Biometric manual review | Latest result = `manual_review` | +10 |
| TC-R08 | High crossing velocity | 3+ `border_logs` rows in the last 7 days | +10 |
| TC-R09 | Combined worst case | Watchlist + expired visa + 3 overstays + biometric fail + high velocity | Score capped at 100, not the raw sum (150) |
| TC-R10 | Score bucketing boundaries | Score exactly 30 / exactly 60 | 30 → `medium`; 60 → `high` (confirms boundary is inclusive as coded) |

## 4.7 Security / RLS Test Notes

RLS test cases (TC-A06, TC-V06, TC-B08, TC-D03) should be executed **two ways**:
1. Through the UI, confirming the interface hides or blocks the action
2. Directly against the Supabase API (e.g., via `curl` or the Supabase client in a test script) using a different role's session token

Passing only (1) does not prove the system is secure — it proves the UI is well-behaved. (2) is what actually demonstrates the database itself enforces the access boundary, independent of any frontend code. This distinction is worth stating explicitly in your report's testing methodology section, since it shows examiners you understand where the real security boundary sits (see Chapter 3, RLS design).
