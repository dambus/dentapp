# Task 93 - Internal Settlement Feature Toggle and Explicit Permission Foundation

## Safe Baseline

Task 93 adds only an authorization foundation for a possible future capability named internal settlement records / Interna evidencija izmirenja.

The intended baseline inherited from Task 92 remains unchanged:

- ordinary clinical UI must not expose services, charges, posted charges, payments, balances, or posting state;
- Visit Completion remains clinical-only;
- Patient Full Record must not regain Charges or Posted charges;
- payment navigation and route exposure must remain removed in the corrected branch;
- retained financial artifacts and RPCs must remain frozen.

The feature-toggle foundation is integrated after the Task 92 freeze migration and tests. The Task 93 migration does not edit or thaw any retained finance artifact.

## Clinic Opt-In Setting

Migration:

`supabase/migrations/20260525110000_add_internal_settlement_feature_toggle_and_access_grants.sql`

New table:

`public.clinic_internal_settlement_settings`

Shape:

- `clinic_id uuid primary key references public.clinics(id) on delete cascade`
- `is_enabled boolean not null default false`
- `enabled_at timestamptz null`
- `enabled_by uuid null references public.profiles(id) on delete set null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Semantics:

- absence of a row means disabled;
- inserting a row without `is_enabled` creates a disabled setting;
- enabling sets `enabled_at` and, in authenticated context, `enabled_by`;
- disabling clears `enabled_at` and `enabled_by`;
- deleting the row is allowed only to same-clinic active `owner_admin` users and returns the clinic to absent-row-disabled semantics;
- enabling does not create or expose settlement records.

## Explicit Grants

New table:

`public.clinic_internal_settlement_access_grants`

Shape:

- `clinic_id uuid not null references public.clinics(id) on delete cascade`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `can_view boolean not null default false`
- `can_manage boolean not null default false`
- `granted_by uuid null references public.profiles(id) on delete set null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- primary key over `(clinic_id, profile_id)`

Integrity:

- grants are same-clinic only;
- target profile must be active;
- grantor profile, when present, must be active and same-clinic;
- rows with both flags false are rejected;
- `can_manage` implies effective view eligibility through helper semantics, even if `can_view` is false;
- revocation is modeled as deleting the grant row.

## Authority vs Record Access

Only authenticated active same-clinic `owner_admin` users can configure the setting or administer grants.

That configuration authority does not imply future settlement record access. An owner must also have an explicit `can_view` or `can_manage` grant before the future helper functions return eligibility.

Ordinary roles, including `doctor`, `specialist`, `assistant`, `reception_admin`, and `inventory_responsible`, cannot manage settings or grants by role alone.

## Helper Functions

The migration adds future-only helpers:

- `public.internal_settlement_enabled_for_clinic(uuid)`
- `public.current_clinic_internal_settlement_enabled()`
- `public.can_view_internal_settlement_records()`
- `public.can_manage_internal_settlement_records()`

They are `security definer` functions with `set search_path = public` because non-owner users should not read grant rows directly, but future eligibility must still be evaluable without exposing the grant table.

Effective view requires:

- current active profile;
- enabled clinic setting;
- explicit same-clinic grant with `can_view` or `can_manage`.

Effective manage requires:

- current active profile;
- enabled clinic setting;
- explicit same-clinic grant with `can_manage`.

These helpers are not attached to `performed_services`, `patient_ledger_entries`, `patient_payments`, or any posting/payment/reversal RPC.

## RLS

RLS is enabled on both new tables.

Settings policies allow only active same-clinic `owner_admin` users to select, insert, update, or delete their own clinic setting.

Grant policies allow only active same-clinic `owner_admin` users to select, insert, update, or delete grants in their own clinic. Non-owner granted users do not read grant rows directly.

Cross-clinic writes are blocked by RLS and trigger validation. Inactive or invalid target profiles are rejected by trigger validation.

## Frozen Access Confirmation

Task 93 does not relax access to:

- `patient_ledger_entries`;
- `patient_payments`;
- `performed_services`;
- ledger posting RPCs;
- payment recording RPCs;
- payment reversal RPCs.

Even when the clinic setting is enabled and a user has an explicit internal settlement grant, the new helpers only report future eligibility. They do not grant table or RPC access.

## Auditability

The existing project audit foundation is a controlled `create_audit_log` RPC plus protected `audit_logs` reads for owner admins. Task 93 does not add settlement-record auditing because no settlement record model exists yet.

Future implementation should make these actions auditable:

- enable or disable the internal settlement module;
- grant, change, or revoke internal settlement access;
- create, update, void, or correct an internal settlement record.

Future implementation must not silently delete internal settlement history.

## Tests

Added:

`supabase/snippets/testInternalSettlementFeatureAccessRls.mjs`

Coverage:

- absent/default setting evaluates disabled;
- default settings row is disabled;
- grant without enabled setting is ineffective;
- owner can configure own clinic setting;
- owner cannot configure another clinic setting;
- non-owner roles cannot configure settings;
- owner can grant and revoke same-clinic access;
- cross-clinic, inactive-profile, and empty grants are rejected;
- enabled plus view grant gives view eligibility only;
- enabled plus manage grant gives manage and view eligibility;
- disabled plus grant gives no eligibility;
- enabled without explicit grant gives no eligibility;
- owner without explicit grant gives no eligibility;
- frozen ledger/payment/performed-service tables and RPCs are required to exist and remain blocked after a clinic setting and explicit grant are created.

Validation results:

- `npx.cmd supabase migration up` passed.
- `npm.cmd run build` passed with the existing Vite large chunk-size warning.
- `npm.cmd run lint` passed.
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs` passed.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passed.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passed.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passed.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passed against `DENTAPP_APP_URL=http://localhost:5173`.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passed as the available local appointment RLS smoke coverage.
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs` passed in the integrated Task 92 + Task 93 baseline.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passed in the integrated Task 92 + Task 93 baseline.
- `git diff --check` passed with line-ending warnings on edited docs.

## Deferred Decisions

Task 93 intentionally does not add:

- React UI;
- navigation routes;
- settlement pages;
- patient-level settlement display;
- payment forms;
- balance or outstanding indicators;
- automatic ledger posting;
- RPC access for posting, payment recording, or reversal;
- fiscalization, invoice, receipt, export, or report behavior.

Recommended next task:

`Task 94 - Internal Settlement Record Model / Controlled Access Path Decision`

That task should decide whether existing ledger/payment tables can be safely adapted behind the new authorization model or whether a narrower internal-settlement-specific record model is safer.
