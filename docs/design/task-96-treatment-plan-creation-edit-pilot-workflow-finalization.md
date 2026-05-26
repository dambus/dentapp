# Task 96 - Treatment Plan Creation/Edit Pilot Workflow Finalization

## 1. Pilot Requirement And Decision Summary

The first clinic pilot needs treatment plans as clinical planning records.

A doctor must be able to:

- open a patient record during or after clinical work;
- create a patient-scoped treatment plan;
- add planned treatment items;
- edit permitted plan and item details before the work is completed;
- view the plan later from the patient record;
- use the plan as context for future appointments.

Decision:

- treatment plans are clinical planning data, not financial records;
- the first mutation UI should be patient-scoped and live in the existing
  Patient Detail / Full Record treatment-plan section;
- Visit Completion should not become the treatment-plan editor in the pilot;
- the first runtime implementation should not expose prices, totals, payments,
  balances, settlement records, invoices, receipts, materials, or reports;
- a narrow schema/RLS hardening task should precede UI wiring because current
  table-level treatment-plan RLS does not fully prove same-clinic patient
  ownership for plan insert/update;
- the existing treatment-plan service layer already contains create/update/archive
  methods and can be reused after the hardening pass.

The Task 92-95 settlement/payment/ledger deferral remains unchanged.

## 2. Existing Repository Treatment-Plan Baseline

### Schema

Treatment-plan tables already exist in
`supabase/migrations/20260512133000_create_treatment_plans.sql`.

`public.treatment_plans` currently includes:

- `id`;
- `clinic_id`;
- `patient_id`;
- `title`;
- `description`;
- `status`;
- `proposed_total`;
- `accepted_at`;
- `completed_at`;
- `created_by`;
- `updated_by`;
- `created_at`;
- `updated_at`;
- `deleted_at`.

Supported plan statuses are:

- `draft`;
- `proposed`;
- `accepted`;
- `in_progress`;
- `completed`;
- `paused`;
- `rejected`;
- `archived`.

`public.treatment_plan_items` currently includes:

- `id`;
- `clinic_id`;
- `treatment_plan_id`;
- `patient_id`;
- `tooth_number`;
- `title`;
- `description`;
- `service_code`;
- `status`;
- `estimated_price`;
- `sort_order`;
- `created_by`;
- `updated_by`;
- `created_at`;
- `updated_at`;
- `deleted_at`.

Supported item statuses are:

- `planned`;
- `accepted`;
- `in_progress`;
- `completed`;
- `skipped`;
- `cancelled`;
- `archived`.

The schema comments already say payment, visit, performed-service, and service
catalog integration are deferred. Optional tooth/region is stored as text and
does not require an odontogram row.

### RLS

Current RLS allows:

- read access for `owner_admin`, `doctor`, `specialist`, `assistant`, and
  `reception_admin`;
- create/update access for `owner_admin`, `doctor`, and `specialist`;
- no ordinary hard-delete policy.

`20260521130000_harden_treatment_plan_item_rls_parent_scope.sql` hardens item
policies so items must match their parent plan's clinic and patient boundary.

Remaining hardening gap:

- plan-level insert/update RLS checks `clinic_id = current_clinic_id()` and
  clinical write role, but it does not itself require an existing same-clinic
  `patients` row for `patient_id`;
- the service layer checks same-clinic patient ownership before writes, but RLS
  should not rely only on service behavior once mutation UI is exposed.

### Runtime/UI

Current visible treatment-plan surfaces:

- `PatientTreatmentPlanSummary` shows a read-only patient summary and a `View
  treatment plan` action;
- `PatientFullRecord` includes a `treatment-plans` section;
- `TreatmentPlansSection` renders treatment plans and planned items as
  read-only records;
- `PatientQuickActions` exposes `View treatment plan` for treatment-plan read
  roles;
- `TreatmentPlansPage` is a placeholder route;
- browser smoke coverage asserts the patient treatment-plan entry point is
  read-only and that `Create treatment plan` is absent.

Current UI issue for the pilot:

- the read-only treatment-plan section displays `proposed_total` and item
  `estimated_price` if data exists. The pilot direction now requires those
  financial/amount fields to be hidden or ignored in clinic-facing treatment
  plan UI.

### Services And Tests

`src/features/patients/treatmentPlanService.ts` already includes:

- `getPatientTreatmentPlans`;
- `getTreatmentPlanById`;
- `createTreatmentPlan`;
- `updateTreatmentPlan`;
- `archiveTreatmentPlan`;
- `createTreatmentPlanItem`;
- `updateTreatmentPlanItem`;
- `archiveTreatmentPlanItem`;
- validation;
- audit-log calls.

Existing tests/snippets include:

- `supabase/snippets/testTreatmentPlanReadRls.mjs`;
- `supabase/snippets/testTreatmentPlanCrud.mjs`;
- browser smoke read-only checks in
  `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`.

The repository therefore does not need a brand-new treatment-plan table or a
brand-new service layer. It needs targeted hardening plus the missing runtime
UI.

## 3. Current Functional Gap

The pilot blocker is not lack of storage or service methods.

The blocker is:

- no usable treatment-plan creation/editing UI;
- current patient treatment-plan UI is intentionally read-only;
- current top-level treatment-plan route is a placeholder;
- existing read-only treatment-plan UI can show amount fields that are outside
  the corrected pilot product boundary;
- plan-level RLS should be hardened before the UI exposes writes.

## 4. Minimal Pilot Data And Status Model

### Treatment Plan Header

Use the existing table and service fields, but expose only clinical fields:

- patient relationship from the current Patient Detail context;
- title;
- clinical summary/objective using `description`;
- status;
- created/updated metadata as read-only context if useful.

Do not expose in pilot UI:

- `proposed_total`;
- payment state;
- settlement state;
- invoice/receipt fields.

The existing `proposed_total` column can remain in the database for historical
compatibility, but pilot UI should submit it blank/null and should not render it
as a visible amount.

### Treatment Plan Items

Use the existing item model, but expose only clinical fields:

- title / planned treatment description;
- optional tooth/region through `tooth_number`;
- clinical notes through `description`;
- optional sequence/order through `sort_order`, preferably hidden behind simple
  ordering behavior rather than a prominent numeric control;
- item status only where it helps the pilot.

Do not expose in pilot UI:

- `service_code` as a billing/service-catalog concept;
- `estimated_price`;
- material usage;
- performed-service linkage.

Existing `service_code` and `estimated_price` can remain unused/null for the
pilot.

### Minimal Status Behavior

Use the existing status values without expanding the schema.

Recommended pilot status subset:

- plans: `draft`, `accepted` or `in_progress`, `completed`, `archived`;
- items: `planned`, `in_progress`, `completed`, `skipped`, `archived`.

Implementation may display the existing labels if simpler, but should avoid
building an approval/versioning workflow around `proposed`, `rejected`, or
`paused` for the first pilot.

Deletion should remain out of scope. Use archive semantics:

- archive plan by setting `status = 'archived'` and `deleted_at`;
- archive item by setting `status = 'archived'` and `deleted_at`.

Editing should be allowed for non-archived plans and items. Completed item or
plan editing can remain technically possible in the first slice if RLS permits
it, but the UI should make archive/update actions deliberate and auditable.

## 5. Role And RLS Direction

Final pilot role direction:

- `owner_admin`: can read and manage treatment plans under current clinical app
  conventions;
- `doctor`: can read and manage treatment plans;
- `specialist`: can read and manage treatment plans;
- `assistant`: can read treatment plans if current read policy allows, but must
  not create/edit/archive in the pilot;
- `reception_admin`: can read treatment plans if current read policy allows, but
  must not create/edit/archive clinical plans;
- `inventory_responsible`: no treatment-plan clinical access or mutation.

Required next RLS hardening:

- plan insert/update `with check` must require the referenced `patient_id` to
  exist in the same `clinic_id`;
- plan update `using` should also preserve same-clinic patient boundary;
- if `patient_id` should never move between patients in application behavior,
  either block patient changes in service/UI or enforce this in a trigger;
- item policies should remain parent-plan scoped;
- hard delete should remain unavailable to authenticated application users;
- add/extend RLS coverage for cross-clinic patient references at the plan level.

This is a targeted hardening task, not a redesign of the treatment-plan schema.

## 6. Visit, Procedure, And Rebooking Boundaries

Treatment plan items represent intended future clinical work.

`visit_procedures` represent work actually performed during a clinical visit.

Pilot rules:

- do not automatically convert treatment-plan items into `visit_procedures`;
- do not automatically mark treatment-plan items complete from Visit Completion;
- do not connect treatment-plan items to performed-service, charge, ledger,
  payment, or settlement artifacts;
- do not add fulfillment tracking in the first pilot mutation slice;
- patient-scoped treatment plans are sufficient for the pilot without direct
  visit linkage.

Rebooking boundary:

- an active plan or planned item can inform the staff decision to schedule
  another appointment;
- appointment creation remains the existing patient scheduling workflow;
- after treatment-plan mutation exists, a small `Schedule appointment` shortcut
  from the treatment-plan section may be useful, but it should only route to the
  existing patient appointment form with optional context;
- no reminder, recall, task, or automatic appointment creation is required.

## 7. Recommended UI Placement

Use the existing Patient Detail / Full Record treatment-plan section as the
first mutation surface.

Reasoning:

- the pilot workflow is patient-centered;
- the current Patient Detail already has treatment-plan summary and full-record
  section navigation;
- doctors will naturally open the patient record during or after clinical work;
- this avoids turning the global `Treatment Plans` placeholder route into a
  broad planning workspace before the pilot needs it;
- it preserves mobile/tablet context better than bouncing users through a global
  route.

Recommended first UI shape:

- keep `PatientTreatmentPlanSummary` as the compact read-only overview with a
  clear action into the full treatment-plan section;
- add Create/Edit/Archive controls inside `TreatmentPlansSection` for
  `owner_admin`, `doctor`, and `specialist`;
- keep assistant/reception treatment-plan access read-only;
- hide all amount fields from the pilot UI;
- use simple inline forms or a compact local editor inside the section rather
  than a broad new route;
- leave `TreatmentPlansPage` as a placeholder or route it later only after the
  patient-scoped editor is validated.

Visit Completion may later link to or suggest reviewing a plan, but it should
not embed the treatment-plan editor in the completion flow for the pilot.

## 8. Required Implementation Task Sequence

### Task 97 - Treatment Plan Mutation Schema/RLS Hardening

Required because secure write schema/RLS is not fully complete at the plan
level.

Scope:

- harden `treatment_plans` insert/update policies so the referenced patient must
  belong to the same clinic;
- decide whether patient reassignment is blocked by policy, trigger, or service
  scope;
- preserve existing read roles and clinical write roles unless a specific
  policy defect is found;
- keep item parent-plan hardening in place;
- keep hard delete unavailable;
- add/extend RLS tests for cross-clinic patient references, denied non-clinical
  writes, archive behavior, and no price/settlement access changes;
- do not add UI.

### Task 98 - Patient Treatment Plan Creation/Edit UI

Scope:

- wire the existing treatment-plan service methods into Patient Detail /
  `TreatmentPlansSection`;
- expose Create/Edit/Archive for active `owner_admin`, `doctor`, and
  `specialist`;
- keep `assistant` and `reception_admin` read-only;
- keep `inventory_responsible` blocked;
- hide/ignore `proposed_total`, `estimated_price`, and service-code fields;
- support patient-scoped plan and item create/edit/archive;
- show treatment plans later from the patient record;
- preserve the clinical-only Visit Completion and settlement freeze boundaries.

### Task 99 - Pilot Treatment Plan Smoke And Rebooking Entry-Point Polish

Scope:

- update browser smoke coverage from read-only-only assertions to the approved
  create/edit/archive workflow;
- keep RLS tests for read and write boundaries;
- verify treatment plans can inform rebooking without automatic appointment
  creation;
- add only a narrowly justified patient appointment shortcut if needed, routing
  to the existing scheduling form;
- keep reminders, recall, tasks, reports, settlement, and finance out of scope.

After Task 99, planner/card and patient/visit restyling should resume as
pilot-usability work.

## 9. Explicit Out Of Scope

Do not include in the pilot treatment-plan mutation work:

- prices, proposed totals, estimated prices, charge totals, balances, payments,
  settlement records, ledger entries, invoices, receipts, fiscalization,
  insurance, exports, or reports;
- service-catalog billing linkage;
- automatic conversion of planned items into `visit_procedures`;
- automatic completion of plan items from Visit Completion;
- performed-service or ledger posting integration;
- material usage or inventory consumption;
- approval workflows, patient signatures, patient portal sharing, templates,
  advanced versioning, or complex phase management;
- reminder/recall automation;
- broad visual redesign before the pilot-critical mutation path works.
