# Task 72 - Performed Services Foundation Planning / Data Model Decision

This task documents the smallest safe path for adding performed services as the
commercial source of truth after Visit Completion. It does not change runtime
behavior, schema, RLS, service code, UI, or tests.

## Current-State Findings

Reviewed implementation:

- `supabase/migrations/20260514190000_create_visit_completion_tables.sql`
- `supabase/migrations/20260515103000_link_visits_to_appointments.sql`
- `supabase/migrations/20260512133000_create_treatment_plans.sql`
- `supabase/migrations/20260521130000_harden_treatment_plan_item_rls_parent_scope.sql`
- `src/features/visits/visitCompletionService.ts`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/pages/PatientVisitDetailPage.tsx`
- `src/features/patients/PatientVisitTimeline.tsx`
- `src/features/patients/treatmentPlanService.ts`
- `supabase/snippets/testVisitCompletionRls.mjs`
- `supabase/snippets/testTreatmentPlanReadRls.mjs`
- Checkpoint B roadmap/backlog/MVP docs

Current completed clinical visit persistence:

- `visits`
  - clinic, patient, optional appointment;
  - status: `draft`, `in_progress`, `completed`, `reopened`, `archived`;
  - visit date, started/completed timestamps;
  - `completed_by`, which records the profile that completed the visit;
  - optional linked clinical note;
  - recommendation and next step;
  - created/updated metadata and soft archive marker.
- `visit_procedures`
  - clinic, visit, patient;
  - `procedure_name`;
  - optional `tooth_or_region`;
  - optional free-text `quantity_or_duration`;
  - optional note;
  - sort order;
  - created/updated metadata and soft archive marker.
- `clinical_notes`
  - can link to visits through `visit_id`.

Current Visit Completion UI collects:

- procedure name;
- tooth/region;
- quantity/duration as free text;
- procedure note;
- clinical note;
- recommendation;
- next step.

Current UI does not collect:

- service catalog selection;
- service code/category;
- numeric quantity;
- unit price;
- discount;
- final charge amount;
- payment;
- material usage;
- credited/performing doctor per procedure;
- treatment-plan item link for a performed procedure.

Current catalog/financial tables:

- No implemented `service_categories` table.
- No implemented `services` table.
- No implemented `performed_services` table.
- No implemented patient ledger, payments, payment allocations, or doctor
  commission tables.
- `docs/05_technical/database_schema.md` contains placeholders for these future
  areas only.

Treatment plan context:

- `treatment_plans` and `treatment_plan_items` exist.
- Treatment plan items store `tooth_number`, title, description, `service_code`,
  status, estimated price, and sort order.
- Treatment plan UI/service can read and mutate treatment plans, but current
  Visit Completion does not link procedures to plan items or mutate plan
  progress.

RLS context:

- Visit and visit procedure read/write is currently limited to active
  same-clinic clinical workflow roles: `owner_admin`, `doctor`, `specialist`,
  and `assistant`.
- `reception_admin` and `inventory_responsible` cannot read/write visits or
  visit procedures today.
- Treatment plan reads are allowed for `owner_admin`, `doctor`, `specialist`,
  `assistant`, and `reception_admin`; `inventory_responsible` is denied.

Gaps preventing financial use today:

- procedure rows have no immutable price snapshot;
- quantity is free text and cannot safely drive totals;
- no service catalog reference or service snapshot exists;
- no per-service credited doctor exists;
- no status separates draft chargeable rows from posted/final rows;
- no correction model exists after visit completion;
- no ledger posting relation exists;
- no commission calculation basis can be reconstructed reliably.

## Modeling Options

### Option A - Extend `visit_procedures`

This option would add chargeability fields directly to existing
`visit_procedures`.

Benefits:

- smallest number of tables;
- direct reuse of current Visit Completion procedure rows;
- less initial UI mapping.

Problems:

- mixes clinical narrative and commercial facts in one row;
- current procedure rows are editable/replaced during draft save by archiving
  existing rows and inserting replacements;
- assistants can currently write procedure rows, which is reasonable for
  clinical context but too broad for pricing authority;
- future price corrections, ledger postings, and commission entries would be
  coupled to a clinical record that may need different correction rules;
- no clean way to distinguish "clinically performed" from "chargeable service"
  when a consult/check has clinical notes but no billable charge, or when one
  clinical procedure maps to multiple chargeable services.

### Option B - Introduce Separate `performed_services`

This option keeps `visit_procedures` clinical-only and adds chargeable
performed-service records linked to visit and optionally to a clinical
procedure and treatment-plan item.

Benefits:

- preserves the distinction between clinical record and commercial source of
  truth;
- supports immutable price snapshots for future ledger/commission correctness;
- allows stricter financial write/correction permissions than procedure notes;
- supports one procedure to one charge, one procedure to many charges, or a
  charge with no detailed procedure when the workflow requires it;
- supports future treatment-plan conversion without mutating plan items in the
  first slice;
- gives future ledger and commission tables a stable FK target.

Costs:

- one additional table and service layer;
- some UI mapping from procedure rows to chargeable service rows;
- need to guard against duplicate rows during draft save/completion.

## Decision

Choose Option B: introduce a separate `performed_services` table.

`visit_procedures` should remain the clinical performed-work record. It should
continue to answer: what was clinically documented during the visit?

`performed_services` should answer: what chargeable service was actually
rendered, at what snapshot price, and credited to which clinician for later
ledger and commission workflows?

For MVP, `performed_services` should be created from the Visit Completion
workflow but remain separate from patient ledger entries and commission entries.

## Minimal MVP Data Model

Recommended new tables for the next implementation stream:

### `service_categories`

Purpose:

Minimal configurable grouping for services and future commission/category
rules.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `clinic_id uuid not null references public.clinics(id)`
- `name text not null`
- `description text`
- `active boolean not null default true`
- `sort_order integer not null default 0`
- `created_by uuid references public.profiles(id) on delete set null`
- `updated_by uuid references public.profiles(id) on delete set null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

Why required:

Service category is not strictly required for a first charge row, but it is a
low-cost foundation for service selection, reporting, and future commission
rules. It should remain optional on a service.

### `services`

Purpose:

Clinic-specific service catalog used for selection and default pricing.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `clinic_id uuid not null references public.clinics(id)`
- `category_id uuid references public.service_categories(id) on delete set null`
- `name text not null`
- `code text`
- `description text`
- `default_price numeric check (default_price is null or default_price >= 0)`
- `default_duration_minutes integer check (...)`
- `active boolean not null default true`
- `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`

Why required:

The catalog gives the UI a safe source for default service names and prices. It
must not be the historical financial record; performed service rows must keep
snapshots because catalog names/prices can change later.

### `performed_services`

Purpose:

Authoritative commercial/financial record of service actually rendered.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `clinic_id uuid not null references public.clinics(id)`
- `patient_id uuid not null references public.patients(id)`
- `visit_id uuid not null references public.visits(id)`
- `visit_procedure_id uuid references public.visit_procedures(id) on delete set null`
- `appointment_id uuid references public.appointments(id) on delete set null`
- `treatment_plan_item_id uuid references public.treatment_plan_items(id) on delete set null`
- `service_id uuid references public.services(id) on delete set null`
- `service_name_snapshot text not null`
- `service_code_snapshot text`
- `service_category_name_snapshot text`
- `tooth_or_region text`
- `quantity numeric not null default 1 check (quantity > 0)`
- `unit_price_amount numeric not null default 0 check (unit_price_amount >= 0)`
- `discount_amount numeric not null default 0 check (discount_amount >= 0)`
- `final_amount numeric not null check (final_amount >= 0)`
- `currency text not null default 'RSD'`
- `credited_provider_id uuid not null references public.profiles(id)`
- `status text not null default 'draft' check (status in ('draft', 'finalized', 'corrected', 'voided'))`
- `correction_of_id uuid references public.performed_services(id)`
- `note text`
- `performed_at timestamptz`
- `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`

Why these fields are required:

- clinic/patient/visit keep tenant and patient scope explicit;
- optional procedure link preserves clinical context without merging records;
- optional treatment-plan item link supports future plan conversion;
- optional service ID supports catalog selection while snapshots preserve
  historical names/prices;
- tooth/region carries the charge context even if no procedure row is linked;
- numeric quantity and unit price allow reliable totals;
- discount amount is included as a simple controlled adjustment placeholder,
  not a promotions engine;
- final amount is stored as a snapshot for later ledger posting and commission
  basis;
- currency defaults to `RSD` for the pilot context and avoids hidden currency
  assumptions;
- credited provider is required because appointment assignment and
  `visits.completed_by` are not reliable per-service commission attribution;
- status and correction link allow safe later correction without silently
  rewriting historical financial facts.

Fields intentionally not included for MVP:

- tax/fiscal fields;
- invoice number;
- payment allocation;
- commission percentage/amount;
- material usage;
- lab cost;
- insurance fields;
- room/chair.

## Visit Completion Integration Decision

Performed services should be recorded in the Visit Completion workflow, first as
draft chargeable rows and finalized only when the visit is completed.

Recommended behavior:

- Draft Visit Completion may save draft `performed_services`.
- Draft rows may be edited/replaced while the visit status is `draft` or
  `in_progress`.
- Completing the visit finalizes the performed-service rows that belong to that
  visit.
- A completed visit should not allow silent edits to finalized performed
  services.
- Corrections after completion should create explicit correction/void rows or
  move the original row to a corrected/voided status with an audit entry,
  depending on the later ledger design.

Important guard:

Do not silently recalculate historical rows from catalog values. If a service
catalog price changes later, existing `performed_services` keep their snapshot
amounts.

First implementation slice:

- add performed-service draft/finalization schema and service methods;
- allow Visit Completion to create rows alongside current procedures;
- do not create ledger entries yet;
- do not calculate commissions yet.

## Treatment Plan Relationship Decision

Performed services may optionally originate from a `treatment_plan_item`.

MVP decisions:

- performed services may exist with no treatment plan;
- linking to a treatment plan item should be optional;
- completing a treatment-plan item should not happen automatically in the first
  performed-services slice;
- treatment-plan mutation should remain a later explicit task.

Reasoning:

Many real visits are ad hoc, emergency, diagnostic, or changed during care.
Forcing a plan link would slow Visit Completion and create bad data. Automatic
plan mutation would also make a financial/clinical completion step silently
change planning records.

Future path:

- show eligible treatment-plan items during performed-service entry;
- allow explicit link;
- later offer an explicit "mark plan item completed" action with audit logging.

## Future Patient Ledger Handoff

Performed services should support ledger charge creation, but Task 72 does not
implement ledger behavior.

Recommended ledger direction:

- ledger entries should be immutable postings, not live calculations directly
  from mutable performed-service rows;
- a finalized performed service can later create a debit ledger entry of type
  `charge`;
- ledger rows should reference `performed_service_id`;
- patient balance should be calculated from ledger postings and payments;
- edits after ledger posting should require adjustment/reversal records rather
  than silently changing original amounts.

Timing decision:

- Do not generate ledger entries in the first performed-services schema/UI
  slice unless the ledger schema exists.
- When ledger is implemented, charge creation can occur when a performed
  service is finalized or through a controlled posting action.

## Future Doctor Commission Handoff

Performed services must capture enough attribution now to avoid reconstruction
later.

Required now:

- `credited_provider_id` per performed service;
- final charge amount snapshot;
- optional service/category snapshot;
- visit and patient references;
- performed/finalized timestamp.

Important distinctions:

- `appointments.assigned_provider_id` is planned appointment context, not
  necessarily the doctor who performed a service.
- `visits.completed_by` is the profile that completed the Visit Completion
  record, not necessarily the commission-credited doctor for each service.
- One visit may include services credited to different doctors/specialists.

Future commission entries should snapshot:

- performed service ID;
- credited provider;
- calculation basis;
- base amount;
- rule used;
- percentage/fixed amount;
- calculated commission;
- status/payout state.

Do not implement commission rules or entries in the performed-services slice.

## Role / RLS Implications

Recommended performed-service access:

- `owner_admin`
  - full read;
  - create/update draft rows;
  - finalize;
  - correct/void finalized rows;
  - view financial amounts.
- `doctor`
  - read clinical and own/clinic performed-service context;
  - create/update draft rows during Visit Completion;
  - finalize when completing visits;
  - view service names and amounts if clinic policy allows;
  - correction should be limited or require owner/admin in MVP.
- `specialist`
  - same baseline as doctor, scoped to clinical workflow;
  - own commission visibility remains future policy.
- `assistant`
  - may create/update clinical service context during draft workflow;
  - should not independently change price, discount, final amount, or credited
    provider after finalization;
  - may need pricing fields hidden or read-only depending on pilot workflow.
- `reception_admin`
  - should be able to read finalized chargeable service totals for later
    payment/ledger workflow;
  - should not edit clinical procedures;
  - may enter/correct pricing only if explicitly allowed by pilot policy.
- `inventory_responsible`
  - no read/write access to performed services by default.

Implementation implication:

RLS may need to separate clinical row mutation from financial field mutation.
Because Postgres RLS is row-level, field-level restrictions should be enforced
through narrow RPCs or service functions if assistants/reception need partial
access.

## UI Impact Map

Future affected surfaces:

- Visit Completion procedure/service step
  - add chargeable service rows or convert procedure rows into linked
    performed-service draft rows.
- Visit Completion review/completion
  - show service names, quantity, price/final amount, credited provider, and
    whether rows will finalize on completion.
- Completed visit detail
  - show clinical procedures separately from chargeable performed services.
- Patient timeline
  - show concise completed work; financial amounts only for allowed roles.
- Patient overview
  - later show latest performed services and financial balance separately.
- Treatment plan detail/reference
  - show performed-service links to plan items, without auto-mutation first.
- Future patient ledger
  - use finalized performed services as charge source.
- Future commission view
  - use credited provider and final amount snapshots.

Recommended first minimal UI slice after schema:

- In Visit Completion, add a "Chargeable services" section near the current
  procedures step.
- Allow selecting/typing a service name, quantity, unit price, and credited
  provider.
- Default credited provider from assigned appointment provider if present, then
  current profile, but require an explicit stored value.
- Keep discount hidden or owner/admin-only at first; default `discount_amount`
  to 0.
- On completion, display that no payment/ledger/commission record is created
  yet.

## Test Plan

Future schema/RLS/data tests should verify:

- `service_categories`, `services`, and `performed_services` exist with RLS
  enabled;
- same-clinic active allowed roles can read appropriate rows;
- cross-clinic rows are isolated;
- `inventory_responsible` cannot read/write performed services;
- draft performed-service rows can be created/updated for open visits;
- finalized rows cannot be silently edited by ordinary draft-save paths;
- price snapshots survive service catalog name/price changes;
- `credited_provider_id` must be active same-clinic doctor/specialist unless a
  deliberate owner/admin exception is designed;
- optional `treatment_plan_item_id` must belong to the same clinic and patient;
- performed services may exist without a treatment-plan item;
- completed/finalized performed services do not mutate appointment lifecycle,
  appointment operational state, appointment assigned provider, or
  `visits.completed_by`;
- correction/void behavior preserves auditability;
- future ledger charge rows can safely reference finalized performed services;
- future commission rows can safely reference finalized performed services.

Future browser smoke coverage should verify:

- Visit Completion can create draft chargeable services;
- draft reload preserves chargeable service rows;
- completing a visit finalizes visible service rows;
- completed visit detail separates procedures from chargeable services;
- patient timeline remains readable;
- treatment-plan link is optional;
- no ledger/payment/commission UI is created before those tasks.

## Proposed Phased Tasks After Task 72

1. Task 73 - Service Catalog and Performed Services Schema/RLS
   - Add minimal catalog and performed-service tables.
   - Add trigger/function enforcement for clinic/patient/visit/provider
     consistency.
   - Add focused RLS smoke coverage.

2. Task 74 - Performed Services Service Layer
   - Add typed service/category/performed-service reads and writes.
   - Add draft replacement/finalization methods scoped to open visits.
   - Keep ledger and commission out.

3. Task 75 - Visit Completion Performed Services UI Slice
   - Add chargeable service entry to Visit Completion.
   - Show finalized performed services on completed visit detail and patient
     timeline.
   - Preserve current procedure/clinical-note behavior.

4. Task 76 - Patient Ledger Planning
   - Decide charge posting timing, payment allocation, discounts, corrections,
     and role visibility.

5. Task 77 - Patient Ledger Schema/RLS Foundation
   - Add ledger/payment tables and posting rules.

6. Task 78 - Patient Ledger UI Slice
   - Show patient ledger history and minimal payment entry after ledger schema
     exists.

7. Task 79 - Doctor Commission Planning
   - Decide performed-based versus collected-based pilot behavior and
     commission visibility.

## Explicit Non-Goals

Task 72 does not implement:

- schema or migrations;
- RLS policies;
- service changes;
- UI changes;
- browser/RLS tests;
- patient ledger;
- payments;
- doctor commissions;
- material consumption;
- inventory deduction;
- treatment-plan mutation;
- invoices/fiscalization;
- discount/promotion engine;
- broad catalog administration.
