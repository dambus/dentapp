# Task 39 - Visit Completion Data Model and Persistence Plan

Status: Completed

## Goal

Prepare persistence for the route-based Visit Completion workflow without
implementing Supabase writes yet. This task documents a minimal data model,
RLS/security expectations, service-layer shape, and Task 40 implementation plan.

No database schema was applied. No Supabase writes were added.

## 1. Current Model Findings

### Existing implemented tables

Current migrations implement:

- `clinics`
- `profiles`
- `patients`
- `patient_medical_records`
- `clinical_notes`
- `audit_logs`
- `patient_tooth_statuses`
- `treatment_plans`
- `treatment_plan_items`

Existing patient-related tables use:

- `clinic_id` for tenant scoping,
- `created_by` and `updated_by` profile references where writes exist,
- `created_at` and `updated_at`,
- soft archive/delete markers where appropriate,
- RLS scoped by active profile, clinic, and role.

### Appointment model

There is no implemented appointment table, appointment service, appointment
route, or appointment seed data yet.

Current appointment-like UI context comes from `DemoPatient.nextAppointment`.
In Supabase mode, `patientService` currently maps `nextAppointment` to `null`
because no appointment table exists.

### Visit model

There is no implemented `visits` table, visit service, visit seed data, or visit
route yet.

The initial `clinical_notes` table already contains a nullable `visit_id` UUID
placeholder, but it has no foreign key because `visits` did not exist when the
patient migration was created.

### Clinical notes

`clinical_notes` already stores patient-scoped note content with:

- `clinic_id`
- `patient_id`
- nullable `visit_id`
- nullable treatment plan references
- `tooth_number`
- `note_type`
- `content`
- `created_by`
- `updated_by`
- timestamps
- `deleted_at`

Clinical note writes currently go through `clinicalNotesService`, enforce demo
mode, validate content, use authenticated Supabase client in Supabase mode, and
call `create_audit_log`.

### Treatment plans and odontogram

Treatment plans and treatment plan items exist but should not be mutated by
Visit Completion persistence yet.

Odontogram tooth statuses exist but should not be changed by Visit Completion
persistence yet.

### Audit and RLS

Audit logging is centralized through `public.create_audit_log(...)`, which
derives clinic and actor from the authenticated profile. Direct client writes to
`audit_logs` are not exposed.

RLS helper functions already exist:

- `current_profile_id()`
- `current_clinic_id()`
- `current_user_role()`
- `is_active_profile()`
- `has_role(text[])`

## 2. Current Visit Completion Local State Fields

`VisitCompletionFlow` currently stores these local-only fields:

- `activeStepIndex`
- `procedures`
  - `id`
  - `name`
  - `toothOrRegion`
  - `quantityOrDuration`
  - `note`
- `clinicalNote`
- `recommendation`
- `nextStep`
- `completionState`
  - `editing`
  - `confirming`
  - `completed`
- `attemptedCompletion`

Derived local values:

- `procedureCount`
- `hasClinicalNote`
- `hasRecommendation`
- `hasNextStep`
- `isReady`
- `nextStepLabel`
- warning list from patient allergies, medical warnings, and important note.

Current readiness rule:

- completion is allowed if at least one performed procedure, clinical note, or
  next step exists.

No local state is persisted to Supabase, localStorage, or demo arrays.

## 3. Existing Tables That Can Be Reused

### `patients`

Use as the required parent entity for patient-scoped visit completion.

### `clinical_notes`

Reuse for the clinical note generated or saved from Visit Completion after a
real `visits.id` exists. The existing `visit_id` placeholder should become a
foreign key to `visits(id)` in the visit migration.

Recommended first use:

- create or update one `clinical_notes` row with `note_type = 'procedure'` or
  `note_type = 'general'`,
- set `visit_id`,
- store only the clinical note text in `content`.

Recommendation/instruction can initially live on `visits.recommendation` to
avoid overloading note content.

### `audit_logs` and `create_audit_log`

Reuse the controlled audit RPC for visit draft save and completion actions.

### `treatment_plans` and `treatment_plan_items`

Do not mutate in Task 40. They can be linked later through nullable
`treatment_plan_id` / `treatment_plan_item_id` columns on visit or procedure
records.

## 4. Missing Tables / Columns

Missing:

- `appointments`
- `visits`
- `visit_procedures`
- foreign key from `clinical_notes.visit_id` to `visits(id)`
- optional appointment completion/status linkage
- optional treatment plan linkage from visits/procedures
- attachment/photo/document linkage
- billing/payment/material/commission records

## 5. Appointment vs Visit

Recommended model:

- appointment = scheduled event,
- visit = clinical record of what happened,
- a visit may originate from an appointment,
- an ad hoc visit may exist without an appointment,
- a completed visit should not be only an appointment status change.

When appointments are implemented, `visits.appointment_id` should be nullable.
Completing a visit may later update an appointment status, but clinical details
must live in visit-related tables.

For Task 40, because no appointments table exists, Visit Completion should
remain patient-scoped and create/find a visit by patient only. It can reserve an
optional `appointment_id` column as nullable UUID with no foreign key until the
appointments table exists, or omit it until appointment persistence is created.

Preferred minimal approach:

- include nullable `appointment_id uuid` with a comment only,
- do not add a foreign key yet,
- keep all Task 40 UI calls patient-scoped.

## 6. Recommended Minimal Persistence Model

### `visits`

Purpose:

Store the clinical visit completion aggregate and draft/completed state.

Recommended columns:

- `id uuid primary key default gen_random_uuid()`
- `clinic_id uuid not null references public.clinics(id)`
- `patient_id uuid not null references public.patients(id)`
- `appointment_id uuid null`
- `status text not null default 'draft'`
  - allowed: `draft`, `in_progress`, `completed`, `reopened`, `archived`
- `visit_date date not null default current_date`
- `started_at timestamptz`
- `completed_at timestamptz`
- `completed_by uuid references public.profiles(id) on delete set null`
- `clinical_note_id uuid null`
- `recommendation text`
- `next_step text`
  - allowed values listed below
- `created_by uuid references public.profiles(id) on delete set null`
- `updated_by uuid references public.profiles(id) on delete set null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

Recommended `next_step` values:

- `no_follow_up`
- `follow_up_recommended`
- `schedule_control_visit`
- `continue_treatment_plan`
- `additional_diagnostics`
- `referral`

Notes:

- `clinical_note_id` should be nullable initially to avoid circular insert
  complexity. Task 40 can create/update the visit, then create/update the
  clinical note and patch `clinical_note_id`.
- `appointment_id` should remain nullable and not FK-constrained until the
  appointment table exists.
- `status = completed` should set `completed_at` and `completed_by`.

### `visit_procedures`

Purpose:

Store simple performed procedure rows from Visit Completion. This is not billing
and not a service catalog.

Recommended columns:

- `id uuid primary key default gen_random_uuid()`
- `clinic_id uuid not null references public.clinics(id)`
- `visit_id uuid not null references public.visits(id)`
- `patient_id uuid not null references public.patients(id)`
- `procedure_name text not null check (length(trim(procedure_name)) > 0)`
- `tooth_or_region text`
- `quantity_or_duration text`
- `note text`
- `sort_order integer not null default 0`
- `created_by uuid references public.profiles(id) on delete set null`
- `updated_by uuid references public.profiles(id) on delete set null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

Notes:

- `patient_id` duplicates what can be reached through `visit_id`, but it keeps
  patient-scoped queries simple and matches existing treatment plan item style.
- `procedure_name` should be required only for rows that are saved. Empty local
  rows should be filtered out before persistence.
- No price, billing code, material, commission, or treatment plan mutation yet.

## 7. Draft vs Completed Behavior

Task 40 should support:

- draft/in-progress visit persistence,
- later resume from the patient visit completion route,
- final completed state if the minimal write path is stable.

Recommended behavior:

- Opening `/patients/:patientId/visit-completion` loads the latest open visit
  draft for that patient if one exists.
- If no draft exists, create a draft lazily only when the user first saves or
  autosaves meaningful data.
- "Save draft" can be explicit in Task 40 before autosave is attempted.
- "Complete Visit" validates the same minimum rule as the prototype:
  - at least one saved performed procedure, clinical note, or next step.
- On completion:
  - set `visits.status = 'completed'`,
  - set `completed_at`,
  - set `completed_by`,
  - persist current clinical note and procedure rows,
  - create audit log action `visit.completed`.

Recommended status progression:

- new local form -> no row yet,
- first meaningful save -> `draft`,
- active editing after draft exists -> keep `draft` or use `in_progress`,
- completion -> `completed`.

For MVP simplicity, Task 40 can use only `draft` and `completed`; `in_progress`
can remain an allowed value for future autosave/session behavior.

## 8. Reopen / Amend Considerations

Do not implement reopen/amend in Task 40 unless explicitly requested.

Plan for later:

- `reopened` status can represent a completed visit reopened for correction.
- Alternative: keep status `completed` and add amendment records.
- Any completed-visit edits should create audit entries and ideally preserve old
  values.
- Clinical note corrections may need explicit amended note history depending on
  compliance requirements.
- Reopening should be limited to clinical roles and possibly owner/admin after a
  time window.

## 9. Audit / History Considerations

Use `create_audit_log` for:

- `visit.draft_created`
- `visit.draft_updated`
- `visit.completed`
- `visit.reopened` later
- `visit.archived` later
- `visit_procedure.created`
- `visit_procedure.updated`
- `visit_procedure.archived`
- `clinical_note.created` or `clinical_note.updated` through the existing note
  service pattern.

For Task 40, a pragmatic minimum is:

- audit visit draft creation/update,
- audit completion,
- audit clinical note save via the clinical note write pattern,
- audit procedure row changes if procedure writes are separate operations.

If Task 40 saves the whole draft as one aggregate, it can create a visit-level
audit row whose `new_values` includes a safe summary of procedure counts and
next step, while detailed row-level procedure audit can follow later.

## 10. RLS / Security Considerations

Follow existing RLS conventions:

- enable RLS on every new table,
- scope access by `clinic_id = public.current_clinic_id()`,
- require `public.is_active_profile()`,
- use role checks through `public.has_role(...)`,
- do not create hard-delete policies,
- use soft archive through `deleted_at`,
- writes use authenticated anon client with RLS, never service role in frontend,
- audit writes go through `create_audit_log`.

Recommended role access:

Visit read:

- `owner_admin`
- `doctor`
- `specialist`
- `assistant`
- maybe `reception_admin` later for scheduling context, but not clinical note
  content by default.

Visit write/draft/complete:

- `owner_admin`
- `doctor`
- `specialist`
- `assistant`

Important nuance:

- Existing `clinical_notes` policies allow only `owner_admin`, `doctor`, and
  `specialist` to read/write clinical notes.
- Visit Completion route currently allows `assistant`.
- For Task 40, either:
  - assistants can save procedure/next-step drafts but cannot create clinical
    notes, or
  - clinical note creation remains disabled for assistant role until RLS is
    intentionally expanded.

Recommended safe Task 40 behavior:

- keep `clinical_notes` RLS unchanged,
- allow assistant visit draft writes only if no clinical note write is attempted,
- show/handle permission messaging if assistant enters clinical note text.

This avoids silently expanding clinical note permissions.

## 11. Migration Proposal

No migration file was created in Task 39.

Recommended reviewed migration for Task 40 or a dedicated Task 40A:

`supabase/migrations/20260514190000_create_visit_completion_tables.sql`

Draft SQL shape:

```sql
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  appointment_id uuid,
  status text not null default 'draft' check (
    status in ('draft', 'in_progress', 'completed', 'reopened', 'archived')
  ),
  visit_date date not null default current_date,
  started_at timestamptz,
  completed_at timestamptz,
  completed_by uuid references public.profiles(id) on delete set null,
  clinical_note_id uuid,
  recommendation text,
  next_step text check (
    next_step is null or next_step in (
      'no_follow_up',
      'follow_up_recommended',
      'schedule_control_visit',
      'continue_treatment_plan',
      'additional_diagnostics',
      'referral'
    )
  ),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.visit_procedures (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  visit_id uuid not null references public.visits(id),
  patient_id uuid not null references public.patients(id),
  procedure_name text not null check (length(trim(procedure_name)) > 0),
  tooth_or_region text,
  quantity_or_duration text,
  note text,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.clinical_notes
  add constraint clinical_notes_visit_id_fkey
  foreign key (visit_id)
  references public.visits(id);
```

The final migration should also add:

- indexes for `clinic_id`, `patient_id`, `visit_id`, status, and `deleted_at`,
- `update_updated_at_column` triggers,
- table and column comments,
- RLS policies,
- no delete policies.

Open migration design question:

- whether to add `visits.clinical_note_id` foreign key to `clinical_notes(id)`.

Recommendation:

- keep `clinical_note_id` as plain nullable UUID in the first migration to avoid
  circular FK complexity, or add the FK in a later migration after write order is
  proven.

## 12. TypeScript / Service-Layer Proposal

Create a new feature module:

- `src/features/visits/visitCompletionService.ts`

Recommended types:

```ts
export type VisitStatus =
  | 'draft'
  | 'in_progress'
  | 'completed'
  | 'reopened'
  | 'archived'

export type VisitNextStep =
  | 'no_follow_up'
  | 'follow_up_recommended'
  | 'schedule_control_visit'
  | 'continue_treatment_plan'
  | 'additional_diagnostics'
  | 'referral'

export type VisitProcedure = {
  id: string
  visitId: string
  patientId: string
  procedureName: string
  toothOrRegion: string
  quantityOrDuration: string
  note: string
  sortOrder: number
  deletedAt: string | null
}

export type VisitCompletionDraft = {
  id: string
  patientId: string
  status: VisitStatus
  visitDate: string
  clinicalNote: string
  recommendation: string
  nextStep: VisitNextStep | ''
  procedures: VisitProcedure[]
  completedAt: string | null
}
```

Recommended functions:

- `fetchVisitCompletionDraft(patientId: string, appointmentId?: string)`
- `createVisitCompletionDraft(patientId: string, appointmentId?: string)`
- `upsertVisitCompletionDraft(input)`
- `completeVisit(input)`
- `listVisitProcedures(visitId: string)`
- `replaceVisitProcedures(visitId: string, procedures)`
- `archiveVisitProcedure(visitId: string, procedureId: string)`

Task 40 can simplify this to aggregate functions:

- `fetchLatestOpenVisitCompletion(patientId)`
- `saveVisitCompletionDraft(patientId, input)`
- `completeVisit(patientId, input)`

Recommended data-source behavior:

- Demo mode remains non-persistent and returns a clear demo-mode result.
- Supabase mode uses authenticated browser client and RLS.
- Service functions should not import or mutate UI state directly.

## 13. Future But Not Now

Do not include in immediate Visit Completion persistence:

- billing,
- payment,
- patient ledger,
- materials,
- inventory movements,
- attachments/photos,
- treatment plan item mutation,
- follow-up appointment creation,
- odontogram integration,
- commission calculation,
- advanced amendment history.

These should connect only after the clinical visit record is stable.

## 14. Recommended Task 40 Implementation Plan

1. Create a reviewed migration for `visits` and `visit_procedures`.
2. Add RLS policies matching existing clinic/role conventions.
3. Add indexes, comments, and updated-at triggers.
4. Add service types and `visitCompletionService.ts`.
5. Implement read path for latest open draft by patient.
6. Implement explicit "Save draft" or route-level draft save.
7. Persist procedures by replacing active procedure rows for the draft visit.
8. Persist clinical note only for roles allowed by existing `clinical_notes`
   RLS, or defer note persistence for assistants.
9. Implement `completeVisit` transition with validation and audit logging.
10. Connect `VisitCompletionFlow` to loaded draft data while preserving current
    local editing ergonomics.
11. Keep demo mode non-persistent with clear messaging.
12. Run build, lint, local Supabase migration validation, and role-based RLS
    scripts after migration is introduced.

Recommended Task 40 scope:

- migration,
- service layer,
- draft load/save,
- complete transition,
- audit rows,
- no billing/payment/material/attachments/treatment plan mutation.

## 15. Acceptance Notes

This plan preserves the current route:

- `/patients/:patientId/visit-completion`

It keeps Visit Completion as a focused route-based workflow and prepares it for
draft persistence without changing current runtime behavior in Task 39.
