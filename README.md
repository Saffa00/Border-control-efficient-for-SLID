# SL Immigration Management System — Final Year Project

## Folder structure

- **`report/`** — Chapters 1–5 (Markdown), plus the ERD/use-case/sequence/deployment diagrams (SVG). `PAGES.md` is the page-by-page reference used to guide frontend build order.
- **`database/sl_immigration_supabase_schema.sql`** — the complete, current Postgres/Supabase schema: 20+ tables (`checkpoints`, `biometric_verifications`, `phone_verifications`, etc.), RLS policies (including `users_insert_self_as_applicant`, needed for both email and OAuth self-registration), `calculate_risk_score()`, and the `overstaying_travelers` view. Run this in your Supabase SQL editor to set up the database.
- **`backend/lib/`** — service-role Supabase client, real email service (Resend), real SMS service (Africa's Talking).
- **`backend/routes/`** — Express routes requiring the service-role key:
  - `border-check.ts` — biometric simulation + risk engine, split into `/assess` and `/finalize`
  - `admin-users.ts` — staff account creation/management
  - `notifications.ts` — real email + SMS on visa status changes and payment confirmation
  - `phone-verification.ts` — OTP-based phone number verification
- **`frontend/src/`** — the complete React application. **Every route in `App.tsx` now has a verified matching page file** — confirmed by an automated check before this zip was built, which also caught and fixed two pages (`ApplicationStatusPage`, `NotificationsPage`) that had been referenced and linked to but never actually created.
  - `components/SecurityPaperPanel.tsx` — shared panel component recreating a passport page's security-paper texture (wavy guilloché engraving, diamond lattice border, rosette watermark), used as the default panel wrapper across every page.
  - `components/SocialLoginButtons.tsx` + `SocialIcons.tsx` — "Continue with Google / Apple / Microsoft" buttons via Supabase Auth OAuth, used on both Login and Register.
  - `pages/public/AuthCallbackPage.tsx` — OAuth redirect landing page.
  - `context/AuthContext.tsx` — now self-provisions a `public.users` row on first OAuth sign-in, since OAuth has no separate registration step.
  - `tailwind.config.js` — the design token system every page draws from.

## What's NOT included (still to do)

- Actual deployment (Supabase project creation, hosting, environment variables)
- **OAuth provider setup** — Google/Apple/Microsoft sign-in buttons are fully coded but require enabling each provider in the Supabase dashboard (Authentication → Providers) with real client IDs/secrets; without this they redirect to a Supabase error page
- Executed test results/screenshots for the Chapter 4 test cases
- Two bracketed placeholders in Chapter 1 needing SLID-specific detail
- Citation formatting to your department's required style (APA/Harvard/etc.)
- Connective narrative prose around the Chapter 3 diagrams
- A production fix for the RegisterPage email-confirmation edge case (see comment in that file) — a Postgres trigger on `auth.users` would be more robust than the current client-side insert

## Environment variables needed

**Frontend (`.env`):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Backend (`.env`, server-side only — never expose these to the browser):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`, `EMAIL_FROM` — for real email
- `AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME`, `SMS_SENDER_ID` (optional) — for real SMS

## Quick start (once you have a Supabase project)

1. Run `database/sl_immigration_supabase_schema.sql` in the Supabase SQL editor
2. Set up a Vite + React + TypeScript project, copy `frontend/src/` and `frontend/tailwind.config.js` in
3. Install frontend deps: `@supabase/supabase-js`, `react-router-dom`, `recharts`, `jspdf`, `jspdf-autotable`
4. Set up an Express server, copy `backend/` (both `routes/` and `lib/`) in
5. Seed at least one row in `checkpoints` and `visa_types` before testing the applicant/officer flows
6. Create Storage buckets: `visa-documents` and `passport-photos`
7. If using social login: enable Google/Apple/Microsoft providers in Supabase Auth settings
