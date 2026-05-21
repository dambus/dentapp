# Task 57 - Treatment Plan Data/RLS Smoke Coverage Review

## Schema Findings

Treatment plan schema already existed in
`supabase/migrations/20260512133000_create_treatment_plans.sql`.

`treatment_plans` read-relevant fields:

- `id`
- `clinic_id`
- `patient_id`
- `title`
- `description`
- `status`
- `proposed_total`
- `accepted_at`
- `completed_at`
- `created_at`
- `updated_at`
- `deleted_at`

`treatment_plan_items` read-relevant fields:

- `id`
- `clinic_id`
- `treatment_plan_id`
- `patient_id`
- `tooth_number`
- `title`
- `description`
- `service_code`
- `status`
- `estimated_price`
- `sort_order`
- `created_at`
- `updated_at`
- `deleted_at`

Both tables are clinic scoped and patient scoped. Both use soft archive through
`deleted_at`.

## RLS Findings

Existing treatment plan RLS:

- `treatment_plans` select is limited to active profiles in
  `current_clinic_id()`.
- Treatment plan read roles are:
  - `owner_admin`
  - `doctor`
  - `specialist`
  - `assistant`
  - `reception_admin`
- `inventory_responsible` is not allowed to read treatment plans.
- Create/update policies remain limited to clinical write roles:
  - `owner_admin`
  - `doctor`
  - `specialist`

Item RLS previously used direct item `clinic_id` and role checks. This protected
normal clinic access but did not explicitly require the item row to match the
parent `treatment_plans` row by plan, clinic, and patient.

## Minimal RLS Fix

Added migration:

`supabase/migrations/20260521130000_harden_treatment_plan_item_rls_parent_scope.sql`

The migration recreates treatment plan item select/insert/update policies so an
item is accessible only when a matching non-archived parent treatment plan
exists with the same:

- `treatment_plan_id`
- `clinic_id`
- `patient_id`

This is a minimal RLS hardening change. It does not add schema, UI, or
treatment-plan mutation behavior.

## Service Access Review

`getPatientTreatmentPlans(patientId)`:

- reads treatment plans by `patient_id`,
- relies on RLS for clinic and role enforcement,
- excludes archived plans with `deleted_at is null`,
- fetches items only for the returned plan IDs,
- excludes archived items with `deleted_at is null`,
- maps statuses through known status option sets.

Task 56 added non-UUID demo slug fallback behavior:

- Supabase UUID patient IDs use Supabase + RLS.
- Non-UUID demo slug patient IDs use existing demo context.
- This does not bypass real Supabase authorization for real patient UUIDs.

The read-only UI surfaces use `getPatientTreatmentPlans` only. Patient detail no
longer exposes treatment plan create/edit/archive controls.

## Tests Added

Added:

`supabase/snippets/testTreatmentPlanReadRls.mjs`

The smoke creates temporary service-role fixtures, signs in as demo users, and
verifies:

- `owner_admin` can read in-clinic treatment plans and items,
- `doctor` can read in-clinic treatment plans and items,
- `assistant` can read in-clinic treatment plans and items,
- `reception_admin` can read in-clinic treatment plans and items,
- `inventory_responsible` cannot read treatment plans or items,
- out-of-clinic treatment plans are hidden,
- out-of-clinic treatment plan items are hidden,
- an item whose `clinic_id`/`patient_id` do not match its parent plan is hidden.

Existing broader CRUD/RLS coverage remains in
`supabase/snippets/testTreatmentPlanCrud.mjs`, but Task 57 adds a focused read
smoke so read access can be checked without relying on the larger CRUD script.

## Browser Smoke

Kept the existing treatment-plan summary-to-detail browser smoke coverage and
added stable read-only checks:

- full section includes `Treatment Plan`,
- full section includes `Read-only`,
- no `Create treatment plan` action is visible,
- no `Edit plan` action is visible,
- no `Add item` action is visible,
- section shows either the empty state, no-items state, or existing detail.

## Remaining Gaps

Still out of scope:

- treatment-plan mutation UI,
- automatic conversion from completed visits,
- billing/payments/materials/attachments,
- reminders/tasks,
- provider assignment,
- broad treatment plan filtering or management workflow,
- print/export.
