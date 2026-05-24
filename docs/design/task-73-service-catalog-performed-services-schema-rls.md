# Task 73 - Service Catalog and Performed Services Schema/RLS Foundation

This task implements the Task 72 data-model decision at the database boundary.
It adds a minimal clinic-scoped service catalog and separate chargeable
`performed_services` records while keeping clinical visit procedures,
treatment-plan items, patient ledger, and doctor commissions separate.

## Scope

Implemented:

- `service_categories`;
- `services`;
- `performed_services`;
- database context/integrity triggers;
- RLS policies;
- focused RLS/data smoke coverage.

Not implemented:

- Visit Completion UI or service-layer wiring;
- completed visit detail or patient timeline changes;
- service catalog administration UI;
- treatment-plan mutation;
- patient ledger, payments, invoices, or fiscalization;
- doctor commission rules/calculation;
- material usage or inventory deduction.

## Schema

Created migration:

`supabase/migrations/20260524190000_create_service_catalog_and_performed_services.sql`

### `service_categories`

Purpose:

Minimal clinic-scoped grouping for service catalog items and future reporting or
commission category rules.

Key fields:

- `clinic_id`;
- `name`;
- optional `description`;
- `active`;
- `sort_order`;
- created/updated metadata;
- `deleted_at` soft archive marker.

### `services`

Purpose:

Clinic-scoped selectable service definitions and default pricing.

Key fields:

- `clinic_id`;
- optional `category_id`;
- `name`;
- optional `code`;
- optional `description`;
- optional `default_price`;
- `currency`, default `RSD`;
- optional `default_duration_minutes`;
- `active`;
- created/updated metadata;
- `deleted_at`.

Important boundary:

`services.default_price` is a mutable default only. Historical charges never
depend on the current catalog price.

### `performed_services`

Purpose:

Authoritative chargeable/commercial record of a service actually rendered.

Key fields:

- `clinic_id`;
- `patient_id`;
- `visit_id`;
- optional `visit_procedure_id`;
- optional `appointment_id`;
- optional `treatment_plan_item_id`;
- optional `service_id`;
- `service_name_snapshot`;
- optional service code/category snapshots;
- optional `tooth_or_region`;
- numeric `quantity`;
- `unit_price_amount`;
- `discount_amount`;
- `final_amount`;
- `currency`, default `RSD`;
- required `credited_provider_id`;
- status: `draft`, `finalized`, `corrected`, `voided`;
- optional `correction_of_id`;
- optional note;
- optional `performed_at`;
- metadata and `deleted_at`.

`final_amount` is constrained to equal:

`quantity * unit_price_amount - discount_amount`

Discounts are represented only as a simple amount field for MVP. No discount or
promotion engine was added.

## Integrity Enforcement

Added:

- `public.enforce_service_catalog_item_context()`;
- `public.is_valid_performed_service_provider(...)`;
- `public.enforce_performed_service_context()`.

Database safeguards:

- service catalog item categories must belong to the same clinic;
- performed service `clinic_id` and `patient_id` must match the linked visit;
- draft performed services require a `draft` or `in_progress` visit;
- finalized/corrected/voided performed services require a completed visit;
- optional `visit_procedure_id` must belong to the same visit, clinic, and
  patient;
- optional `treatment_plan_item_id` must belong to the same clinic and patient
  and to a non-archived parent plan;
- optional `service_id` must point to an active non-archived same-clinic catalog
  item when newly selected;
- optional `appointment_id` must belong to the same clinic and patient;
- if both visit and performed-service appointment references are supplied, they
  must not conflict;
- `credited_provider_id` must be an active same-clinic doctor/specialist;
- finalized/corrected/voided rows cannot be silently updated through ordinary
  update paths.

## RLS Boundary

RLS is enabled on all three new tables.

Catalog read:

- `owner_admin`;
- `doctor`;
- `specialist`;
- `assistant`;
- `reception_admin`.

Catalog create/update:

- `owner_admin` only.

Performed-service read:

- `owner_admin`;
- `doctor`;
- `specialist`;
- `reception_admin`.

Performed-service create/update:

- `owner_admin`;
- `doctor`;
- `specialist`.

Denied by default:

- `assistant` cannot read or write `performed_services` because pricing fields
  are currently row-level, not field-level;
- `inventory_responsible` cannot read or write catalog or performed-service
  financial rows;
- no hard-delete policies were added.

This conservative posture avoids giving assistants unrestricted access to
pricing/financial values before a field-specific service/RPC layer exists.

## Separation Preserved

This task does not alter:

- `visit_procedures`;
- appointment lifecycle status;
- appointment operational state;
- appointment assigned provider;
- `visits.completed_by`;
- treatment-plan item status;
- patient ledger;
- doctor commission records.

`performed_services.credited_provider_id` is intentionally separate from both
planned appointment provider assignment and the profile that completed the visit.

## Smoke Coverage

Added:

`supabase/snippets/testPerformedServicesRls.mjs`

Coverage includes:

- schema/table/helper availability;
- catalog read behavior by role;
- cross-clinic catalog isolation;
- performed-service read/write behavior by role;
- cross-clinic performed-service isolation;
- rejection of invalid cross-clinic catalog references;
- rejection of patient/visit mismatch;
- rejection of invalid visit procedure link;
- rejection of invalid treatment-plan item link;
- rejection of invalid quantity/monetary values;
- provider attribution enforcement;
- service snapshot persistence after catalog price/name changes;
- finalized-row immutability through normal update paths;
- confirmation that performed-service operations do not mutate appointment
  lifecycle, operational state, assigned provider, `visits.completed_by`, or
  existing clinical `visit_procedures`.

## Next Task

Task 74 - Performed Services Service Layer.

Recommended scope:

- add typed catalog and performed-service service functions;
- support draft performed-service replacement for open visits;
- support finalization after Visit Completion completes a visit;
- keep UI, ledger, payment, commission, material, and treatment-plan mutation
  out of scope.
