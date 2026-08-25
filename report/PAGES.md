# Page reference — SL Immigration Management System

## Public (no auth required)
| Page | Route | Purpose |
|---|---|---|
| Landing page | `/` | System overview, links to login/register |
| Login | `/login` | Supabase Auth email/password sign-in |
| Register | `/register` | Applicant self-registration (creates `auth.users` + `public.users` row via a Supabase trigger or Edge Function) |
| Unauthorized | `/unauthorized` | Shown when a logged-in user hits a route their role can't access |

## Applicant portal (`role = applicant`)
| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/dashboard` | Summary: passport status, active/pending visa applications, unread notifications |
| Passport | `/passport` | View/register passport details (`passports` table) |
| New visa application | `/visa/new` | Multi-step form: visa type → travel details → document upload (`visa_applications`, `application_documents`) |
| Application status | `/visa/:id/status` | Timeline view built from `application_status_history` |
| Payment | `/visa/:id/payment` | Mobile money payment form (`payment_transactions`) |
| Notifications | `/notifications` | List from `notifications` table, mark-as-read |

## Visa officer portal (`role = visa_officer` or `admin`)
| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/visa-officer` | Queue of `pending`/`under_review` applications, sorted by submission date |
| Application review | `/visa-officer/review/:id` | View documents, approve/reject/request-documents, triggers `digital_visas` creation on approval |

## Border/immigration officer portal (`role = immigration_officer` or `admin`)
| Page | Route | Purpose |
|---|---|---|
| Check-in | `/border/check-in` | Scan/enter passport number → runs the simulated biometric + risk engine (`border-check.ts`) → shows recommendation → officer confirms decision |
| Watchlist | `/border/watchlist` | View/search `watchlist` table |
| Overstay report | `/border/overstays` | Table driven directly by the `overstaying_travelers` view |

## Admin portal (`role = admin`)
| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/admin` | System-wide analytics: applications by status, crossings by checkpoint, risk-level breakdown |
| User management | `/admin/users` | Manage `users` + `staff_profiles`, assign officers to checkpoints |
| Checkpoint management | `/admin/checkpoints` | CRUD on `checkpoints` table |
| Reports | `/admin/reports` | Exportable reports (visa issuance, border traffic, overstays) |
| Audit log | `/admin/audit-log` | Read-only view of `admin_audit_log` |

## Notes for implementation order
Given FYP timeline constraints, build in this order for a working demo:
1. Auth + applicant portal (dashboard, passport, visa application)
2. Visa officer review flow (this is what turns a `visa_applications` row into a `digital_visas` row — needed before border check-in can work)
3. Border officer check-in flow (depends on step 2 existing)
4. Admin portal (can mostly be built last — it's mostly read/reporting views over data the other portals already generate)
