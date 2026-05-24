# Task 74 - Performed Services Service Layer

This task adds the application service-layer foundation for the Task 73 service
catalog and `performed_services` schema. It does not add UI, Visit Completion
wiring, ledger posting, payment behavior, commission logic, material usage, or
treatment-plan mutation.

## Scope

Implemented:

- typed service catalog option model;
- typed performed-service record model;
- active service catalog read path;
- visit-scoped performed-service read path;
- typed performed-service create path;
- narrow draft replacement path for open visits;
- narrow finalization path for completed visits;
- credited provider option helper that reuses the existing appointment provider
  read path.

Not implemented:

- service catalog administration UI;
- performed-service entry or display UI;
- Visit Completion integration;
- completed visit detail, patient timeline, or patient overview display;
- patient ledger entries;
- payments or invoices;
- doctor commission entries or calculation;
- unrestricted financial edit/delete/correction paths.

## Service File

Added:

`src/features/performed-services/performedServicesService.ts`

The service follows the existing feature-service pattern:

- lazy-loads the Supabase browser client;
- reads the current profile context from the authenticated session;
- relies on RLS for clinic and role boundaries;
- returns typed write results for create/finalize operations;
- surfaces validation, permission, not-found, and unknown failures for later UI
  handling.

## Types

### `ServiceCatalogOption`

Represents selectable catalog rows from `services`:

- `id`;
- optional `categoryId`;
- `categoryName`;
- `name`;
- `code`;
- `defaultUnitPrice`;
- `currency`;
- `active`;
- `deletedAt`.

Only active, non-archived services are returned for selection. Catalog defaults
remain mutable reference data and are not used as historical financial truth.

### `PerformedServiceRecord`

Represents chargeable performed-service rows:

- patient and visit context;
- optional visit procedure, appointment, treatment-plan item, and catalog
  service references;
- service label/code/category snapshots;
- optional tooth/region snapshot;
- numeric quantity, unit price, discount amount, and final amount;
- currency;
- credited provider ID and optional display summary;
- status and correction reference;
- note and timestamps.

The record uses performed-service snapshots for display and does not derive
historical amounts from current catalog prices.

## Read Methods

### `fetchActiveServiceCatalog()`

Loads active, non-archived catalog services through RLS and sorts them
predictably by category name and service name.

Inactive or archived services are intentionally excluded from selectable
options. Historical performed services remain readable through their stored
snapshots even when a linked catalog service later changes.

### `fetchPerformedServicesForVisit(visitId)`

Loads non-archived performed services for a visit through RLS and sorts them by
creation time and ID.

The read path is visit-scoped only. No patient ledger aggregation or balance
calculation is introduced.

### `fetchCreditedProviderOptions()`

Reuses the existing assignable appointment provider RPC helper. This preserves
the narrow same-clinic active doctor/specialist read path and avoids broad
profile reads.

Credited provider remains separate from:

- `appointments.assigned_provider_id`;
- `visits.completed_by`.

## Write Methods

### `createPerformedService(input)`

Creates one draft performed-service row.

The caller must provide explicit snapshot values:

- service name snapshot;
- optional service code/category snapshots;
- quantity;
- unit price;
- discount amount;
- final amount inputs through deterministic service calculation;
- credited provider.

The service computes and stores `final_amount` from the normalized quantity,
unit price, and discount amount before insert. It does not silently recalculate
from mutable catalog data after creation.

Database triggers and RLS remain authoritative for clinic/patient/visit,
catalog, treatment-plan, procedure, and provider enforcement.

### `replaceDraftPerformedServicesForVisit(input)`

Archives existing non-archived draft performed-service rows for the visit and
inserts the supplied draft rows.

This method is intentionally limited to draft rows. It does not update,
archive, or replace finalized/corrected/voided performed services, and it does
not create ledger or commission records.

### `finalizePerformedServicesForVisit(input)`

Updates draft performed-service rows for the visit to `finalized` and sets
`performed_at`.

The Task 73 trigger requires the linked visit to already be completed before
finalization can succeed. This keeps Visit Completion integration explicit for a
later task and avoids changing existing completion behavior in Task 74.

## Correction Boundary

No unrestricted update, delete, void, or correction method was added.

Task 73 protects finalized/corrected/voided rows from silent mutation. Later
ledger-aware correction work should add explicit void/reversal or correction
records instead of editing historical financial facts.

## Role/RLS Behavior

The service does not work around RLS.

Expected access remains:

- `owner_admin`, `doctor`, and `specialist` can create/update draft performed
  services according to Task 73 policies;
- `owner_admin`, `doctor`, `specialist`, and `reception_admin` can read
  performed-service rows;
- `assistant` can read catalog options but cannot read/write performed-service
  financial rows;
- `inventory_responsible` has no performed-service financial access.

Future UI should handle RLS denial as a normal unavailable/permission state.

## Visit Completion Relationship

Task 74 does not modify Visit Completion.

The next UI/integration task can:

- load active catalog options;
- let eligible roles create draft chargeable services during Visit Completion;
- call draft replacement while a visit remains open;
- complete the visit through the existing Visit Completion service;
- then finalize draft performed services once the visit status is completed.

This sequencing preserves the Task 73 rule that draft performed services belong
to draft/in-progress visits and finalized performed services belong to completed
visits.

## Treatment Plan Relationship

The service accepts an optional `treatmentPlanItemId` because Task 73 supports
that reference.

It does not mutate treatment-plan item status and does not require plan linkage.
Performed services may remain ad hoc and unplanned.

## Future Ledger Handoff

The service stores the data needed for a later ledger charge source:

- finalized performed-service row ID;
- patient and visit references;
- service snapshot;
- quantity and amount snapshots;
- currency;
- credited provider;
- finalized/performed timestamp.

No ledger posting is created here. Later ledger implementation should create
immutable postings that reference finalized performed services.

## Future Commission Handoff

The service requires `creditedProviderId` on create and preserves the final
amount snapshot needed for future commission basis.

No commission percentage, rule, payout, or calculation snapshot is implemented.

## Validation Plan

Task 74 relies on:

- TypeScript build validation for the typed service surface;
- lint validation for project conventions;
- Task 73 RLS/data smoke coverage for database security and integrity;
- existing appointment, provider assignment, Visit Completion, patient browser,
  and treatment-plan smoke scripts to verify no workflow regression.

## Proposed Next Tasks

1. Task 75 - Visit Completion Performed Services UI Slice
   - Add chargeable-service entry to Visit Completion.
   - Use this service layer for catalog options, draft saves, and finalization.
   - Display performed services separately from clinical procedures.

2. Task 76 - Patient Ledger Planning
   - Decide charge posting timing, payment allocation, correction behavior, and
     role visibility.

3. Task 77 - Patient Ledger Schema/RLS Foundation
   - Add immutable ledger/payment foundations after the performed-service UI
     slice exists.
