# Task 97 - Treatment Plan Mutation Schema/RLS Hardening

## 1. Verified Task 96 Gap

Task 97 rechecked the actual treatment-plan implementation before editing.

Confirmed existing baseline:

- `treatment_plans` and `treatment_plan_items` already exist.
- Both tables are clinic-scoped and patient-scoped.
- Plan and item soft archive fields already exist through `deleted_at`.
- Plan and item create/update policies already restrict mutation to
  `owner_admin`, `doctor`, and `specialist`.
- `assistant` and `reception_admin` already have read-only treatment-plan access.
- `inventory_responsible` has no treatment-plan read/write access.
- `20260521130000_harden_treatment_plan_item_rls_parent_scope.sql` already
  requires items to match their parent plan by clinic and patient.
- `treatmentPlanService.ts` already performs same-clinic patient lookup before
  writes and already contains create/update/archive methods plus audit calls.

Verified remaining gap:

- plan-level insert/update policies checked current clinic and clinical role,
  but did not independently prove that `treatment_plans.patient_id` referenced a
  patient in the same clinic;
- plan-level policy alone did not prevent patient/clinic reassignment;
- archived plan/item mutation needed a database-level guard before exposing
  Patient Detail write UI.

## 2. Policy And Integrity Changes

Added migration:

- `supabase/migrations/20260526100000_harden_treatment_plan_mutation_scope.sql`

The migration adds:

- `public.enforce_treatment_plan_scope()`;
- `enforce_treatment_plan_scope` trigger on `treatment_plans`;
- `public.enforce_treatment_plan_item_scope()`;
- `enforce_treatment_plan_item_scope` trigger on `treatment_plan_items`;
- recreated plan insert/update policies with same-clinic patient existence
  checks.

The plan trigger enforces:

- inserted/updated plan must reference a non-deleted same-clinic patient;
- `clinic_id` cannot be changed after creation;
- `patient_id` cannot be changed after creation;
- already archived plans cannot be mutated again.

The item trigger enforces:

- item must reference a non-deleted parent plan;
- parent plan, item, clinic, and patient must align;
- `clinic_id`, `patient_id`, and `treatment_plan_id` cannot be reassigned after
  creation;
- already archived items cannot be mutated again.

No RPC architecture, service rewrite, UI, pricing, settlement, ledger, or Visit
Completion behavior was added.

## 3. Final Pilot Mutation Authority

Mutation remains limited to active same-clinic clinical writers:

- `owner_admin`;
- `doctor`;
- `specialist`.

Read-only treatment-plan access remains:

- `assistant`;
- `reception_admin`.

No treatment-plan access remains:

- `inventory_responsible`.

Cross-clinic users cannot read or mutate treatment plans.

## 4. Patient/Clinic Integrity Enforcement

Treatment-plan mutation now requires all of the following:

- caller has an active profile;
- caller belongs to the target clinic;
- caller has a clinical write role;
- plan `clinic_id` equals the caller's clinic;
- plan `patient_id` references a non-deleted patient in that same clinic;
- existing plan clinic and patient cannot be reassigned.

This matches the stronger integrity pattern already used by appointment and item
parent-scope policies.

## 5. Plan-Item Parent And Archive Enforcement

Task 57 item parent-scope RLS remains intact.

Task 97 adds database trigger enforcement so item mutation also fails when:

- the parent plan does not exist;
- the parent plan is archived/deleted;
- item `clinic_id` does not match the parent plan;
- item `patient_id` does not match the parent plan;
- item parent/clinic/patient is reassigned after creation;
- the item itself has already been archived.

Plan and item archive remain soft archive operations. Authenticated hard delete
is still unavailable.

## 6. Clinical-Only Boundary

Treatment plans remain clinical planning records only.

This task did not add or expose:

- prices;
- charges;
- payments;
- settlement records;
- balances;
- invoices or receipts;
- fiscalization;
- performed-service financial linkage;
- automatic conversion to `visit_procedures`;
- automatic treatment-plan item completion from Visit Completion.

Tasks 90-94 remain authoritative: internal settlement is post-MVP and inactive.

## 7. Tests Added

Added:

- `supabase/snippets/testTreatmentPlanMutationRls.mjs`

The focused mutation test verifies:

- doctor can create/update/archive a same-clinic plan;
- doctor can create/update/archive same-clinic plan items;
- archived plans cannot be normally updated;
- archived plans cannot accept new items;
- assistant and reception can read but cannot create/update items or plans;
- inventory cannot read or mutate treatment plans;
- clinical writer cannot create a plan for an out-of-clinic patient;
- clinical writer cannot create a plan in another clinic;
- clinical writer cannot reassign plan patient or clinic;
- mismatched item parent/patient scope is blocked;
- item patient reassignment is blocked.

Existing read-only test coverage remains in:

- `supabase/snippets/testTreatmentPlanReadRls.mjs`

## 8. Next UI Task

Next recommended task:

`Task 98 - Patient Detail Treatment Plan Creation/Edit UI`

Task 98 should wire the existing treatment-plan service methods into the Patient
Detail / Full Record treatment-plan section.

Task 98 must not add:

- pricing fields;
- settlement/payment/ledger linkage;
- automatic Visit Completion mutation;
- broad Treatment Plans workspace redesign;
- templates, reports, reminders, materials, invoices, receipts, or fiscal
  behavior.
