-- ============================================================
-- Sierra Leone Immigration Management System
-- Postgres / Supabase conversion of sl_immigration_er_diagram.mwb
-- ============================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ============================================================
-- ENUM TYPES  (converted from MySQL enum columns)
-- ============================================================
create type user_role            as enum ('applicant', 'immigration_officer', 'visa_officer', 'admin');
create type sex_type              as enum ('M', 'F');
create type staff_status          as enum ('Active', 'Suspended', 'Expired');
create type visa_entries_allowed  as enum ('single', 'multiple');
create type visa_record_status    as enum ('active', 'used', 'expired', 'revoked');
create type pass_status           as enum ('active', 'used', 'expired');
create type application_status    as enum ('draft', 'submitted', 'under_review', 'documents_requested', 'approved', 'rejected');
create type payment_status_type   as enum ('unpaid', 'paid');
create type payment_provider      as enum ('orange_money', 'afrimoney');
create type transaction_status    as enum ('pending', 'completed', 'failed');
create type movement_type         as enum ('entry', 'exit');
create type border_decision       as enum ('cleared', 'secondary_screening', 'refused');
create type risk_level_type       as enum ('low', 'medium', 'high');
create type message_status        as enum ('sent', 'failed', 'logged_only');
create type checkpoint_type       as enum ('airport', 'land_border', 'seaport');

-- ============================================================
-- 1. USERS  (note: auth handled by Supabase auth.users; this
--    table mirrors it 1:1 via a matching UUID primary key so all
--    the FKs below can reference public.users directly)
-- ============================================================
create table public.users (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  full_name     varchar(150) not null,
  email         varchar(150) not null unique,
  role          user_role not null default 'applicant',
  phone         varchar(30),
  phone_verified boolean not null default false,
  nationality   varchar(80),
  is_active     boolean not null default true,
  mfa_enabled   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 2. STAFF PROFILES (1:1 with officer/admin users)
-- ============================================================
create table public.staff_profiles (
  staff_profile_id  uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references public.users(user_id) on delete cascade,
  staff_id_code     varchar(50) not null unique,
  rank_title        varchar(100) not null,
  department        varchar(100) not null,
  duty_station      varchar(100) not null,
  photo_path        varchar(255),
  issue_date        date not null,
  expiry_date       date not null,
  status            staff_status not null default 'Active',
  created_at        timestamptz not null default now()
);

-- ============================================================
-- 3. PASSPORTS
-- ============================================================
create table public.passports (
  passport_id       uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(user_id) on delete cascade,
  passport_number   varchar(50) not null unique,
  issuing_country   varchar(80) not null,
  date_of_birth     date not null,
  sex               sex_type not null,
  issue_date        date not null,
  expiry_date       date not null,
  photo_path        varchar(255),
  created_at        timestamptz not null default now()
);

create index idx_passports_user on public.passports(user_id);

-- ============================================================
-- 4. VISA TYPES (lookup table)
-- ============================================================
create table public.visa_types (
  visa_type_id          uuid primary key default gen_random_uuid(),
  name                  varchar(100) not null,
  description           varchar(255),
  fee_amount            numeric(10,2) not null,
  validity_days         int not null,
  max_stay_days         int not null,
  available_on_arrival  boolean not null default false
);

-- ============================================================
-- 5. VISA APPLICATIONS
-- ============================================================
create table public.visa_applications (
  application_id          uuid primary key default gen_random_uuid(),
  application_ref         varchar(20) not null unique,
  user_id                 uuid not null references public.users(user_id) on delete cascade,
  passport_id             uuid not null references public.passports(passport_id),
  visa_type_id            uuid not null references public.visa_types(visa_type_id),
  purpose_of_travel       varchar(255),
  intended_arrival_date   date,
  intended_stay_days      int,
  status                  application_status not null default 'draft',
  reviewed_by             uuid references public.users(user_id),
  review_notes            varchar(500),
  payment_status          payment_status_type not null default 'unpaid',
  submitted_at            timestamptz,
  decided_at              timestamptz,
  created_at              timestamptz not null default now()
);

create index idx_visa_apps_user on public.visa_applications(user_id);
create index idx_visa_apps_passport on public.visa_applications(passport_id);
create index idx_visa_apps_type on public.visa_applications(visa_type_id);
create index idx_visa_apps_reviewer on public.visa_applications(reviewed_by);
create index idx_visa_apps_status on public.visa_applications(status);

-- ============================================================
-- 6. APPLICATION DOCUMENTS
-- ============================================================
create table public.application_documents (
  document_id     uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.visa_applications(application_id) on delete cascade,
  doc_type        varchar(80) not null,
  file_path       varchar(255) not null,
  uploaded_at     timestamptz not null default now()
);

create index idx_app_docs_application on public.application_documents(application_id);

-- ============================================================
-- 7. APPLICATION STATUS HISTORY
-- ============================================================
create table public.application_status_history (
  history_id      uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.visa_applications(application_id) on delete cascade,
  status          varchar(50) not null,
  note            varchar(255),
  changed_by      uuid references public.users(user_id),
  changed_at      timestamptz not null default now()
);

create index idx_status_history_application on public.application_status_history(application_id);
create index idx_status_history_changer on public.application_status_history(changed_by);

-- ============================================================
-- 8. DIGITAL VISAS (issued visa record + QR verification)
-- ============================================================
create table public.digital_visas (
  visa_id           uuid primary key default gen_random_uuid(),
  application_id    uuid not null unique references public.visa_applications(application_id) on delete cascade,
  visa_number       varchar(30) not null unique,
  passport_id       uuid not null references public.passports(passport_id),
  issue_date        date not null,
  expiry_date       date not null,
  entries_allowed   visa_entries_allowed not null,
  qr_code_token     varchar(100) not null unique,
  status            visa_record_status not null default 'active'
);

create index idx_digital_visas_passport on public.digital_visas(passport_id);

-- ============================================================
-- 9. ECOWAS ENTRY PASSES
-- ============================================================
create table public.ecowas_entry_passes (
  pass_id               uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(user_id),
  passport_id           uuid not null references public.passports(passport_id),
  pass_number           varchar(30) not null unique,
  issue_date            date not null,
  expiry_date           date not null,
  qr_code_token         varchar(100) not null unique,
  status                pass_status not null default 'active',
  issued_by_officer_id  uuid references public.users(user_id),
  created_at            timestamptz not null default now()
);

create index idx_ecowas_user on public.ecowas_entry_passes(user_id);
create index idx_ecowas_passport on public.ecowas_entry_passes(passport_id);
create index idx_ecowas_issuer on public.ecowas_entry_passes(issued_by_officer_id);

-- ============================================================
-- 9b. CHECKPOINTS  (new — normalizes border_logs.checkpoint,
--     which was a free-text varchar in the original MySQL model)
-- ============================================================
create table public.checkpoints (
  checkpoint_id    uuid primary key default gen_random_uuid(),
  name             varchar(100) not null,      -- e.g. 'Lungi International Airport'
  location         varchar(100) not null,      -- e.g. 'Port Loko District'
  checkpoint_type  checkpoint_type not null,
  created_at       timestamptz not null default now()
);

-- officers are assigned to one checkpoint at a time (nullable — admin/visa
-- officers working from HQ have no checkpoint assignment)
alter table public.staff_profiles
  add column checkpoint_id uuid references public.checkpoints(checkpoint_id);

create index idx_staff_checkpoint on public.staff_profiles(checkpoint_id);

-- ============================================================
-- 9c. BIOMETRIC VERIFICATIONS  (new — SIMULATED for this project.
--     No real fingerprint/facial recognition hardware or ML model is
--     used. confidence_score is generated by a deterministic mock
--     function (see risk_engine.ts) so demos are repeatable. This
--     table exists to show where a real biometric SDK would plug in.
-- ============================================================
create type biometric_method as enum ('facial_simulated', 'fingerprint_simulated');
create type biometric_result as enum ('pass', 'manual_review', 'fail');

create table public.biometric_verifications (
  verification_id  uuid primary key default gen_random_uuid(),
  passport_id      uuid not null references public.passports(passport_id),
  method           biometric_method not null default 'facial_simulated',
  confidence_score numeric(5,2) not null,   -- 0.00-100.00, mock-generated
  result           biometric_result not null,
  officer_id       uuid references public.users(user_id),
  captured_at      timestamptz not null default now()
);

create index idx_biometric_passport on public.biometric_verifications(passport_id);

-- ============================================================
-- 10. BORDER LOGS (entry/exit events at checkpoints)
-- ============================================================
create table public.border_logs (
  log_id                  uuid primary key default gen_random_uuid(),
  passport_id             uuid not null references public.passports(passport_id),
  visa_id                 uuid references public.digital_visas(visa_id),
  movement_type           movement_type not null,
  checkpoint_id           uuid not null references public.checkpoints(checkpoint_id),
  officer_id              uuid not null references public.users(user_id),
  biometric_verification_id uuid references public.biometric_verifications(verification_id),
  risk_score              smallint,
  watchlist_hit           boolean not null default false,
  decision                border_decision not null,
  remarks                 varchar(255),
  logged_at               timestamptz not null default now()
);

create index idx_border_logs_passport on public.border_logs(passport_id);
create index idx_border_logs_visa on public.border_logs(visa_id);
create index idx_border_logs_officer on public.border_logs(officer_id);
create index idx_border_logs_checkpoint on public.border_logs(checkpoint_id);
create index idx_border_logs_logged_at on public.border_logs(logged_at);

-- ============================================================
-- 11. WATCHLIST
-- ============================================================
create table public.watchlist (
  watchlist_id      uuid primary key default gen_random_uuid(),
  passport_number   varchar(50) not null,
  full_name         varchar(150),
  reason            varchar(255) not null,
  risk_level        risk_level_type not null,
  added_by          uuid references public.users(user_id),
  added_at          timestamptz not null default now()
);

create index idx_watchlist_passport_number on public.watchlist(passport_number);

-- ============================================================
-- 12. PAYMENT TRANSACTIONS
-- ============================================================
create table public.payment_transactions (
  transaction_id  uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.visa_applications(application_id) on delete cascade,
  provider        payment_provider not null,
  phone_number    varchar(20) not null,
  amount_usd      numeric(10,2) not null,
  amount_nle      numeric(12,2) not null,
  exchange_rate   numeric(10,4) not null,
  reference       varchar(40) not null unique,
  status          transaction_status not null default 'pending',
  created_at      timestamptz not null default now()
);

create index idx_payments_application on public.payment_transactions(application_id);

-- ============================================================
-- 13. PRE-ARRIVAL DECLARATIONS
-- ============================================================
create table public.pre_arrival_declarations (
  declaration_id        uuid primary key default gen_random_uuid(),
  passport_id           uuid not null references public.passports(passport_id),
  visa_id               uuid references public.digital_visas(visa_id),
  flight_or_travel_no   varchar(50),
  arrival_date          date not null,
  port_of_entry         varchar(100) not null,
  health_declaration    varchar(255),
  submitted_at          timestamptz not null default now()
);

create index idx_declarations_passport on public.pre_arrival_declarations(passport_id);
create index idx_declarations_visa on public.pre_arrival_declarations(visa_id);

-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================
create table public.notifications (
  notification_id  uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(user_id) on delete cascade,
  message          varchar(255) not null,
  is_read          boolean not null default false,
  created_at       timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id);

-- ============================================================
-- 15. EMAIL LOG
-- ============================================================
create table public.email_log (
  email_id       uuid primary key default gen_random_uuid(),
  user_id        uuid references public.users(user_id),
  to_email       varchar(150) not null,
  subject        varchar(200) not null,
  body           text not null,
  status         message_status not null,
  error_message  varchar(255),
  created_at     timestamptz not null default now()
);

create index idx_email_log_user on public.email_log(user_id);

-- ============================================================
-- 16. SMS LOG
-- ============================================================
create table public.sms_log (
  sms_id         uuid primary key default gen_random_uuid(),
  user_id        uuid references public.users(user_id),
  phone_number   varchar(20) not null,
  message        varchar(320) not null,
  status         message_status not null,
  error_message  varchar(255),
  created_at     timestamptz not null default now()
);

create index idx_sms_log_user on public.sms_log(user_id);

-- ============================================================
-- 17. MFA CODES
-- ============================================================
create table public.mfa_codes (
  mfa_code_id  uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(user_id) on delete cascade,
  code         varchar(10) not null,
  expires_at   timestamptz not null,
  used         boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_mfa_codes_user on public.mfa_codes(user_id);

-- ============================================================
-- 17b. PHONE VERIFICATIONS (new — kept separate from mfa_codes,
--      which is scoped to login MFA. This table proves ownership of a
--      phone number before it's trusted as an SMS notification target.)
-- ============================================================
create table public.phone_verifications (
  verification_id uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(user_id) on delete cascade,
  phone_number     varchar(20) not null,
  code             varchar(6) not null,
  expires_at       timestamptz not null,
  verified         boolean not null default false,
  attempts         smallint not null default 0,
  created_at       timestamptz not null default now()
);

create index idx_phone_verifications_user on public.phone_verifications(user_id);

-- ============================================================
-- 18. PASSWORD RESET TOKENS
-- ============================================================
create table public.password_reset_tokens (
  token_id    uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(user_id) on delete cascade,
  token       varchar(64) not null unique,
  expires_at  timestamptz not null,
  used        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_reset_tokens_user on public.password_reset_tokens(user_id);

-- ============================================================
-- 19. LOGIN ATTEMPTS
-- ============================================================
create table public.login_attempts (
  attempt_id  uuid primary key default gen_random_uuid(),
  email       varchar(150) not null,
  ip_address  varchar(45) not null,
  success     boolean not null,
  created_at  timestamptz not null default now()
);

create index idx_login_attempts_email on public.login_attempts(email);

-- ============================================================
-- 20. ADMIN AUDIT LOG
-- ============================================================
create table public.admin_audit_log (
  audit_id       uuid primary key default gen_random_uuid(),
  actor_user_id  uuid not null references public.users(user_id),
  action         varchar(100) not null,
  target_type    varchar(50) not null,
  target_id      uuid,
  details         varchar(500),
  ip_address     varchar(45),
  created_at     timestamptz not null default now()
);

create index idx_audit_log_actor on public.admin_audit_log(actor_user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users                       enable row level security;
alter table public.staff_profiles               enable row level security;
alter table public.checkpoints                   enable row level security;
alter table public.biometric_verifications        enable row level security;
alter table public.passports                     enable row level security;
alter table public.visa_types                    enable row level security;
alter table public.visa_applications             enable row level security;
alter table public.application_documents         enable row level security;
alter table public.application_status_history    enable row level security;
alter table public.digital_visas                 enable row level security;
alter table public.ecowas_entry_passes           enable row level security;
alter table public.border_logs                   enable row level security;
alter table public.watchlist                     enable row level security;
alter table public.payment_transactions          enable row level security;
alter table public.pre_arrival_declarations      enable row level security;
alter table public.notifications                 enable row level security;
alter table public.email_log                     enable row level security;
alter table public.sms_log                       enable row level security;
alter table public.mfa_codes                     enable row level security;
alter table public.phone_verifications            enable row level security;
alter table public.password_reset_tokens         enable row level security;
alter table public.login_attempts                enable row level security;
alter table public.admin_audit_log               enable row level security;

-- Helper: current user's role (security definer avoids recursive RLS checks)
create or replace function public.current_role() returns user_role as $$
  select role from public.users where user_id = auth.uid();
$$ language sql stable security definer;

-- Helper: is the current user staff (any officer or admin)?
create or replace function public.is_staff() returns boolean as $$
  select public.current_role() in ('immigration_officer', 'visa_officer', 'admin');
$$ language sql stable security definer;

-- ---- users ----
create policy "users_select_own_or_staff" on public.users
  for select using (user_id = auth.uid() or public.is_staff());
-- Self-registration: a newly authenticated user may create exactly one
-- matching public.users row for themselves, and only as an applicant —
-- staff accounts are created server-side via admin-users.ts, which uses
-- the service role and bypasses this policy entirely.
create policy "users_insert_self_as_applicant" on public.users
  for insert with check (user_id = auth.uid() and role = 'applicant');
create policy "users_update_own" on public.users
  for update using (user_id = auth.uid());
create policy "users_update_admin" on public.users
  for update using (public.current_role() = 'admin');

-- ---- staff_profiles ----
create policy "staff_profiles_select" on public.staff_profiles
  for select using (user_id = auth.uid() or public.is_staff());
create policy "staff_profiles_insert_admin" on public.staff_profiles
  for insert with check (public.current_role() = 'admin');
create policy "staff_profiles_update_admin" on public.staff_profiles
  for update using (public.current_role() = 'admin');

-- ---- checkpoints (readable by any authenticated user — needed for
--      dropdowns in both the applicant portal and officer border UI) ----
create policy "checkpoints_select_all" on public.checkpoints
  for select using (auth.role() = 'authenticated');
create policy "checkpoints_insert_admin" on public.checkpoints
  for insert with check (public.current_role() = 'admin');

-- ---- biometric_verifications (staff only — this is a border-control
--      operation, applicants never see the raw confidence score) ----
create policy "biometric_select_staff" on public.biometric_verifications
  for select using (public.is_staff());
create policy "biometric_insert_officer" on public.biometric_verifications
  for insert with check (public.current_role() in ('immigration_officer', 'admin'));

-- ---- passports ----
create policy "passports_select" on public.passports
  for select using (user_id = auth.uid() or public.is_staff());
create policy "passports_insert" on public.passports
  for insert with check (user_id = auth.uid() or public.is_staff());

-- ---- visa_types (public lookup table) ----
create policy "visa_types_select_all" on public.visa_types
  for select using (auth.role() = 'authenticated');

-- ---- visa_applications ----
create policy "visa_apps_select" on public.visa_applications
  for select using (user_id = auth.uid() or public.is_staff());
create policy "visa_apps_insert_own" on public.visa_applications
  for insert with check (user_id = auth.uid());
create policy "visa_apps_update_staff" on public.visa_applications
  for update using (public.current_role() in ('visa_officer', 'admin'));

-- ---- application_documents ----
create policy "app_docs_select" on public.application_documents
  for select using (
    application_id in (select application_id from public.visa_applications where user_id = auth.uid())
    or public.is_staff()
  );
create policy "app_docs_insert_own" on public.application_documents
  for insert with check (
    application_id in (select application_id from public.visa_applications where user_id = auth.uid())
  );

-- ---- application_status_history ----
create policy "status_history_select" on public.application_status_history
  for select using (
    application_id in (select application_id from public.visa_applications where user_id = auth.uid())
    or public.is_staff()
  );
create policy "status_history_insert_staff" on public.application_status_history
  for insert with check (public.is_staff());

-- ---- digital_visas ----
create policy "digital_visas_select" on public.digital_visas
  for select using (
    passport_id in (select passport_id from public.passports where user_id = auth.uid())
    or public.is_staff()
  );
create policy "digital_visas_insert_staff" on public.digital_visas
  for insert with check (public.current_role() in ('visa_officer', 'admin'));

-- ---- ecowas_entry_passes ----
create policy "ecowas_passes_select" on public.ecowas_entry_passes
  for select using (user_id = auth.uid() or public.is_staff());
create policy "ecowas_passes_insert_staff" on public.ecowas_entry_passes
  for insert with check (public.is_staff());

-- ---- border_logs (officers/admins only — sensitive operational data) ----
create policy "border_logs_select_staff" on public.border_logs
  for select using (public.is_staff());
create policy "border_logs_insert_officer" on public.border_logs
  for insert with check (public.current_role() in ('immigration_officer', 'admin'));

-- ---- watchlist (admins + immigration officers only) ----
create policy "watchlist_select_staff" on public.watchlist
  for select using (public.current_role() in ('immigration_officer', 'admin'));
create policy "watchlist_insert_admin" on public.watchlist
  for insert with check (public.current_role() = 'admin');

-- ---- payment_transactions ----
create policy "payments_select" on public.payment_transactions
  for select using (
    application_id in (select application_id from public.visa_applications where user_id = auth.uid())
    or public.is_staff()
  );
create policy "payments_insert_own" on public.payment_transactions
  for insert with check (
    application_id in (select application_id from public.visa_applications where user_id = auth.uid())
  );

-- ---- pre_arrival_declarations ----
create policy "declarations_select" on public.pre_arrival_declarations
  for select using (
    passport_id in (select passport_id from public.passports where user_id = auth.uid())
    or public.is_staff()
  );
create policy "declarations_insert_own" on public.pre_arrival_declarations
  for insert with check (
    passport_id in (select passport_id from public.passports where user_id = auth.uid())
  );

-- ---- notifications ----
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());

-- ---- email_log / sms_log / mfa_codes / password_reset_tokens / login_attempts (system tables — admin only) ----
create policy "email_log_admin_only" on public.email_log
  for select using (public.current_role() = 'admin');
create policy "sms_log_admin_only" on public.sms_log
  for select using (public.current_role() = 'admin');
create policy "mfa_codes_own_only" on public.mfa_codes
  for select using (user_id = auth.uid());
create policy "phone_verifications_own_only" on public.phone_verifications
  for select using (user_id = auth.uid());
create policy "reset_tokens_own_only" on public.password_reset_tokens
  for select using (user_id = auth.uid());
create policy "login_attempts_admin_only" on public.login_attempts
  for select using (public.current_role() = 'admin');

-- ---- admin_audit_log (admins only) ----
create policy "audit_log_admin_only" on public.admin_audit_log
  for select using (public.current_role() = 'admin');

-- ============================================================
-- RULES-BASED RISK SCORING FUNCTION
-- Weighted, behavior/document-based only (no nationality or demographic
-- inputs — see design note in project chat). Called by the Node backend
-- at the point of border crossing, after a biometric_verifications row
-- has been created for this passport. Score 0-100, higher = riskier.
-- ============================================================
create or replace function public.calculate_risk_score(p_passport_id uuid)
returns table(score int, risk_level risk_level_type, reasons jsonb)
language plpgsql
stable
security definer
as $$
declare
  v_score int := 0;
  v_reasons jsonb := '[]'::jsonb;
  v_watchlist_hit boolean;
  v_visa_status visa_record_status;
  v_overstay_count int;
  v_last_biometric_result biometric_result;
  v_last_biometric_score numeric;
  v_recent_crossings int;
begin
  -- 1. Watchlist match (heaviest weight — passport number match against watchlist)
  select exists(
    select 1 from public.watchlist w
    join public.passports p on p.passport_number = w.passport_number
    where p.passport_id = p_passport_id
  ) into v_watchlist_hit;

  if v_watchlist_hit then
    v_score := v_score + 50;
    v_reasons := v_reasons || jsonb_build_object('reason', 'watchlist_match', 'points', 50);
  end if;

  -- 2. Current visa status (revoked/expired visa on file = flag)
  select dv.status into v_visa_status
  from public.digital_visas dv
  where dv.passport_id = p_passport_id
  order by dv.issue_date desc limit 1;

  if v_visa_status in ('revoked', 'expired') then
    v_score := v_score + 20;
    v_reasons := v_reasons || jsonb_build_object('reason', 'visa_' || v_visa_status, 'points', 20);
  end if;

  -- 3. Prior overstay history (each past overstay adds risk, capped at 3)
  select count(*) into v_overstay_count
  from public.overstaying_travelers ot
  where ot.passport_id = p_passport_id;

  if v_overstay_count > 0 then
    v_score := v_score + least(v_overstay_count, 3) * 15;
    v_reasons := v_reasons || jsonb_build_object('reason', 'prior_overstay', 'count', v_overstay_count, 'points', least(v_overstay_count, 3) * 15);
  end if;

  -- 4. Most recent biometric verification result
  select bv.result, bv.confidence_score into v_last_biometric_result, v_last_biometric_score
  from public.biometric_verifications bv
  where bv.passport_id = p_passport_id
  order by bv.captured_at desc limit 1;

  if v_last_biometric_result = 'fail' then
    v_score := v_score + 25;
    v_reasons := v_reasons || jsonb_build_object('reason', 'biometric_fail', 'confidence', v_last_biometric_score, 'points', 25);
  elsif v_last_biometric_result = 'manual_review' then
    v_score := v_score + 10;
    v_reasons := v_reasons || jsonb_build_object('reason', 'biometric_manual_review', 'confidence', v_last_biometric_score, 'points', 10);
  end if;

  -- 5. Crossing velocity (3+ crossings in the last 7 days is unusual for a tourist/business visa)
  select count(*) into v_recent_crossings
  from public.border_logs bl
  where bl.passport_id = p_passport_id
    and bl.logged_at > now() - interval '7 days';

  if v_recent_crossings >= 3 then
    v_score := v_score + 10;
    v_reasons := v_reasons || jsonb_build_object('reason', 'high_crossing_velocity', 'count', v_recent_crossings, 'points', 10);
  end if;

  v_score := least(v_score, 100);

  return query select
    v_score,
    case
      when v_score >= 60 then 'high'::risk_level_type
      when v_score >= 30 then 'medium'::risk_level_type
      else 'low'::risk_level_type
    end,
    v_reasons;
end;
$$;


-- Flags any passport whose last logged movement was an ENTRY, on a
-- visa/pass that has since expired, with no matching EXIT logged after
-- that entry. Covers both digital_visas and ecowas_entry_passes.
-- ============================================================
create or replace view public.overstaying_travelers as
with last_entry as (
  select distinct on (bl.passport_id)
    bl.passport_id,
    bl.visa_id,
    bl.checkpoint_id,
    bl.logged_at as entry_at
  from public.border_logs bl
  where bl.movement_type = 'entry'
  order by bl.passport_id, bl.logged_at desc
)
select
  p.passport_id,
  p.passport_number,
  u.full_name,
  le.entry_at,
  cp.name as entry_checkpoint,
  coalesce(dv.expiry_date, ep.expiry_date) as authorization_expiry,
  (current_date - coalesce(dv.expiry_date, ep.expiry_date)) as days_overstayed
from last_entry le
join public.passports p on p.passport_id = le.passport_id
join public.users u on u.user_id = p.user_id
join public.checkpoints cp on cp.checkpoint_id = le.checkpoint_id
left join public.digital_visas dv on dv.visa_id = le.visa_id
left join public.ecowas_entry_passes ep
  on ep.passport_id = le.passport_id and le.visa_id is null
where coalesce(dv.expiry_date, ep.expiry_date) < current_date
  and not exists (
    select 1 from public.border_logs ex
    where ex.passport_id = le.passport_id
      and ex.movement_type = 'exit'
      and ex.logged_at > le.entry_at
  );

-- Overstays are operational/officer-facing data, not applicant-facing
alter view public.overstaying_travelers set (security_invoker = true);
grant select on public.overstaying_travelers to authenticated;
