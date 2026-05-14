# Task 40A - Visit Completion Migration and RLS

Status: Completed

## Goal

Create the database foundation for Visit Completion persistence without
connecting the UI or adding frontend writes.

No VisitCompletionFlow behavior was changed. No visit service was implemented.
No billing, payment, material, attachment, treatment plan mutation, odontogram
mutation, or follow-up appointment creation was added.

## Migration File Created

Created:

- `supabase/migrations/20260514190000_create_visit_completion_tables.sql`

This migration was created for review. It was not applied locally in this task.
No `db reset` was run.

## Tables Added

### `public.visits`

Purpose:

Stores the visit-level clinical record for Visit Completion draft/completed
state.

Columns added:

- `id`
- `clinic_id`
- `patient_id`
- `appointment_id`
- `status`
- `visit_date`
- `started_at`
- `completed_at`
- `completed_by`
- `clinical_note_id`
- `recommendation`
- `next_step`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`
- `deleted_at`

Allowed `status` values:

- `draft`
- `in_progress`
- `completed`
- `reopened`
- `archived`

Allowed `next_step` values:

- `no_follow_up`
- `follow_up_recommended`
- `schedule_control_visit`
- `continue_treatment_plan`
- `additional_diagnostics`
- `referral`

Notes:

- `appointment_id` is nullable UUID without FK because no appointments table
  exists yet.
- `clinical_note_id` remains nullable UUID without FK to avoid circular FK
  complexity in the first implementation.
- `deleted_at` supports soft archive behavior.

### `public.visit_procedures`

Purpose:

Stores simple performed procedure rows for Visit Completion.

Columns added:

- `id`
- `clinic_id`
- `visit_id`
- `patient_id`
- `procedure_name`
- `tooth_or_region`
- `quantity_or_duration`
- `note`
- `sort_order`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`
- `deleted_at`

Notes:

- `procedure_name` is required and trimmed through a check constraint.
- No billing, pricing, material, commission, or service catalog fields were
  added.
- `deleted_at` supports soft archive behavior.

## Constraints Added

- `visits.clinic_id` references `clinics(id)`.
- `visits.patient_id` references `patients(id)`.
- `visits.completed_by` references `profiles(id)` with `on delete set null`.
- `visits.created_by` and `visits.updated_by` reference `profiles(id)` with
  `on delete set null`.
- `visits.status` is constrained to the allowed visit statuses.
- `visits.next_step` is constrained to the allowed next-step values when not
  null.
- `visit_procedures.clinic_id` references `clinics(id)`.
- `visit_procedures.visit_id` references `visits(id)`.
- `visit_procedures.patient_id` references `patients(id)`.
- `visit_procedures.created_by` and `visit_procedures.updated_by` reference
  `profiles(id)` with `on delete set null`.
- `clinical_notes.visit_id` now references `visits(id)`.

## Indexes Added

For `visits`:

- `visits_clinic_id_idx`
- `visits_patient_id_idx`
- `visits_status_idx`
- `visits_deleted_at_idx`
- `visits_clinic_patient_status_idx`
- `visits_clinic_patient_visit_date_idx`

For `visit_procedures`:

- `visit_procedures_clinic_id_idx`
- `visit_procedures_patient_id_idx`
- `visit_procedures_visit_id_idx`
- `visit_procedures_deleted_at_idx`
- `visit_procedures_visit_sort_order_idx`

## updated_at Triggers

The migration reuses the existing project function:

- `public.update_updated_at_column()`

Triggers added:

- `update_visits_updated_at`
- `update_visit_procedures_updated_at`

No duplicate trigger function was created.

## RLS Policies Added

RLS is enabled on:

- `public.visits`
- `public.visit_procedures`

Policies added for `visits`:

- `Clinical workflow roles can view clinic visits`
- `Clinical workflow roles can create clinic visits`
- `Clinical workflow roles can update clinic visits`

Policies added for `visit_procedures`:

- `Clinical workflow roles can view clinic visit procedures`
- `Clinical workflow roles can create clinic visit procedures`
- `Clinical workflow roles can update clinic visit procedures`

Allowed read/write roles:

- `owner_admin`
- `doctor`
- `specialist`
- `assistant`

All policies require:

- active profile,
- `clinic_id = current_clinic_id()`,
- role membership through `has_role(...)`.

Insert/update policies also constrain ownership fields:

- `created_by` must be null or current profile on insert,
- `updated_by` must be null or current profile,
- `completed_by` must be null or current profile for `visits`.

No hard-delete policies were added.

## clinical_notes FK Handling

The existing `clinical_notes.visit_id` column is nullable UUID and compatible
with `visits.id`.

The local seed data does not populate `clinical_notes.visit_id`, so adding the
foreign key is safe for current committed seed/demo data.

The migration adds:

- `clinical_notes_visit_id_fkey`

It does not expand `clinical_notes` RLS. Assistant clinical-note permission
nuance remains for the service/UI integration task.

## Intentionally Not Implemented

- No frontend persistence.
- No `visitCompletionService`.
- No VisitCompletionFlow behavior changes.
- No billing or payment fields.
- No material or inventory fields.
- No attachment or storage linkage.
- No treatment plan mutation.
- No odontogram mutation.
- No follow-up appointment creation.
- No audit triggers.
- No hard delete policies.
- No local database reset/application in this task.

## Audit Notes

This migration does not add audit triggers because the project currently uses
service-layer audit writes through `public.create_audit_log(...)`.

Task 40B/40C should add service-layer audit calls for:

- visit draft creation/update,
- visit completion,
- visit procedure create/update/archive.

## Risks / Open Questions

- `appointment_id` is intentionally unconstrained until appointments exist.
- `clinical_note_id` is intentionally unconstrained initially to avoid circular
  FK complexity.
- Assistant role can write `visits` and `visit_procedures`, but existing
  `clinical_notes` policies still exclude assistants. UI/service integration
  must handle that explicitly.
- The migration does not enforce that `visit_procedures.patient_id` matches the
  parent `visits.patient_id`; service-layer validation should enforce this for
  the MVP, and a future database trigger/check can be considered later.

## Verification

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- SQL was reviewed against current migration conventions.
- The migration was not applied locally and `db reset` was not run.
