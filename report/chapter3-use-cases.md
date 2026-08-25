# Chapter 3 (extract): Use Case Analysis

## 3.x System Actors

| Actor | Description |
|---|---|
| **Applicant** | A traveler seeking to enter Sierra Leone who registers, applies for a visa, and tracks their application through the public portal. |
| **Visa Officer** | SLID staff responsible for reviewing and deciding on visa applications and issuing digital visas. |
| **Immigration Officer** | SLID staff stationed at a checkpoint who verifies travelers and logs entry/exit crossings. |
| **Admin** | SLID staff with system-wide oversight: user accounts, checkpoints, reporting, and audit review. |

*(See `use-case-diagram.svg` for the full UML use case diagram.)*

## 3.x Use Case Descriptions

### UC-1: Submit Visa Application
- **Actor:** Applicant
- **Precondition:** Applicant has an account and a registered passport
- **Main flow:** Applicant selects a visa type → enters travel details → uploads supporting documents → submits
- **Postcondition:** Application status becomes `submitted`; a record is created in `application_status_history`
- **Exception:** If no passport is on file, the applicant is prompted to register one first

### UC-2: Review Visa Application
- **Actor:** Visa Officer
- **Precondition:** At least one application has status `submitted` or `under_review`
- **Main flow:** Officer opens the application from the queue, reviews traveler/passport details and uploaded documents
- **Postcondition:** Officer proceeds to UC-3, UC-4, or requests additional documents

### UC-3: Approve Visa Application
- **Actor:** Visa Officer
- **Precondition:** Application is under review
- **Main flow:** Officer approves → system computes visa validity from `visa_types.validity_days` → a `digital_visas` record is created with a unique QR verification token → applicant is notified
- **Postcondition:** Application status becomes `approved`; a usable digital visa exists

### UC-4: Reject Visa Application
- **Actor:** Visa Officer
- **Precondition:** Application is under review
- **Main flow:** Officer enters a mandatory review note explaining the rejection → application status becomes `rejected` → applicant is notified
- **Business rule:** The system enforces that a rejection cannot be submitted without a note

### UC-5: Perform Biometric Verification *(simulated)*
- **Actor:** Immigration Officer
- **Precondition:** Traveler is present at a checkpoint with their passport
- **Main flow:** Officer initiates the check-in → system generates a simulated confidence score → result is classified as pass / manual review / fail
- **Note for examiners:** This project does not use real biometric hardware or a trained facial recognition model. The verification step is a deterministic simulation that demonstrates where such a system would integrate, consistent with the project's stated scope.

### UC-6: View Risk Assessment
- **Actor:** Immigration Officer
- **Precondition:** Biometric verification has completed for the current traveler
- **Main flow:** System evaluates a rules-based score from watchlist status, visa validity, prior overstay history, biometric result, and crossing frequency → returns a score, a risk level, and a breakdown of contributing factors
- **Design note:** The score deliberately excludes nationality or demographic inputs, to avoid embedding discriminatory profiling into an automated system (see Chapter 5, Ethical Considerations)

### UC-7: Log Entry / Exit
- **Actor:** Immigration Officer
- **Precondition:** UC-5 and UC-6 have completed
- **Main flow:** System presents a recommendation (clear / secondary screening); officer confirms or overrides it → decision is written to `border_logs`
- **Business rule:** The officer's confirmed decision is what is recorded — the system's recommendation is advisory only, ensuring a human retains final authority over entry/exit decisions

### UC-8: Check Watchlist
- **Actor:** Immigration Officer, Admin
- **Main flow:** Officer searches the watchlist by passport number or name; matches surface automatically during UC-6
- **Access rule:** Only Admin may add new watchlist entries; officers have read-only access

### UC-9: View Overstay Report
- **Actor:** Immigration Officer, Admin
- **Main flow:** System identifies travelers whose most recent entry has no matching exit and whose visa/pass has expired, computed via the `overstaying_travelers` database view

### UC-10: Manage User Accounts
- **Actor:** Admin
- **Main flow:** Admin invites new staff (email-based invite, since account creation requires elevated privileges the client application does not hold), assigns roles, and can suspend accounts
- **Business rule:** An admin cannot change their own role or suspend their own account, preventing accidental lockout

### UC-11: Generate Reports
- **Actor:** Admin
- **Main flow:** Admin selects a report type (visa issuance, border traffic, overstays), an optional date range, and exports as CSV or PDF

### UC-12: View Audit Log
- **Actor:** Admin
- **Main flow:** Admin reviews a read-only, filterable log of administrative actions (account changes, staff creation)
- **Business rule:** Audit entries cannot be edited or deleted through the application

## 3.x Notes on Scope Boundaries

Consistent with the FYP scope decisions made earlier in this chapter, the following are **explicitly out of scope** for the working implementation and are discussed only as future work:
- Real biometric hardware/ML-based facial or fingerprint matching
- Machine-learning-based (rather than rules-based) risk scoring
- Live camera/scanner integration at checkpoints
