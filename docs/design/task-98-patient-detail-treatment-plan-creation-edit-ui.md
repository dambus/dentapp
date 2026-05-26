# Task 98 - Patient Detail Treatment Plan Creation/Edit UI

## Summary

Task 98 exposes the existing secured treatment-plan write foundation inside the patient-scoped Full Record experience. Authorized clinical users can now create and update treatment plans and planned treatment items directly from the patient's record.

This remains a clinical planning feature only. No settlement, payment, charge, balance, invoice, receipt, fiscal, performed-service, material, report, or automatic conversion behavior was added.

## Placement

The existing Patient Detail / Full Record treatment-plan section was evolved in place. This keeps treatment planning close to the patient context and avoids adding a separate top-level planning workflow for the pilot.

The section remains reachable through the existing patient record section navigation. It does not add a new route, navigation module, dashboard card, or appointment/Visit Completion entry point.

## Interaction Implemented

Authorized users can:

- create a treatment plan for the current patient;
- edit allowed treatment-plan header fields;
- add planned treatment items under the displayed plan;
- edit allowed item fields;
- soft archive plans and items using the existing archive service methods.

The UI uses only the existing clinical fields needed for the pilot:

- plan title;
- plan clinical objective / notes;
- plan status;
- item tooth / region;
- item planned treatment title;
- item clinical notes;
- item status.

The patient and clinic are derived from the current patient/profile context and are never editable in the UI.

## Archive Behavior

Plan and item archive actions are exposed because the existing schema and service layer already support soft archive behavior and Task 97 hardened further mutation after archive.

Archive is presented as a secondary action and requires confirmation. Archived records are removed from the normal active list by the existing read path, and backend rejection is surfaced as an inline error if a stale UI attempts a blocked mutation.

## Roles

Mutation controls are visible only for:

- `owner_admin`;
- `doctor`;
- `specialist`.

Read-only visibility is preserved for:

- `assistant`;
- `reception_admin`.

Blocked-role behavior remains governed by the existing RLS/read path:

- `inventory_responsible` does not receive treatment-plan data or mutation controls.

The UI is not the security boundary. Task 97 database constraints and RLS remain authoritative, and mutation failures are displayed inline.

## Layout

The implementation keeps the existing card/list style used in Patient Full Record:

- compact header with editable/read-only badge;
- inline create/edit forms;
- wrapped action rows for mobile and tablet;
- card/list treatment-plan items rather than a dense table;
- loading, empty, error, and inline notice states using existing UI primitives.

The section avoids horizontal table layouts and does not redesign Patient Detail broadly.

## Service Reuse

Task 98 reuses the existing `treatmentPlanService` write methods:

- `createTreatmentPlan`;
- `updateTreatmentPlan`;
- `archiveTreatmentPlan`;
- `createTreatmentPlanItem`;
- `updateTreatmentPlanItem`;
- `archiveTreatmentPlanItem`;
- `getPatientTreatmentPlans`.

The UI intentionally submits empty values for the legacy amount/service-code inputs so no pricing or charge fields are exposed.

No service, RPC, RLS, or schema changes were required for the UI.

## Browser Coverage

The authenticated browser smoke test now covers the authorized clinical flow:

- opens the patient Treatment Plan section;
- verifies the create action is available for the clinical demo role;
- creates a treatment plan;
- adds a planned item;
- verifies plan/item persistence after revisiting the patient page;
- edits the plan;
- edits the item;
- verifies the treatment-plan section does not expose settlement/payment/charge/balance/invoice/receipt terminology.

Focused RLS scripts continue to cover read-only and blocked-role enforcement.

## Deferred Scope

Deferred explicitly:

- treatment-plan to Visit Completion conversion;
- treatment-plan to appointment conversion;
- automatic item status updates from completed visits;
- prices, charges, service totals, performed services, settlement records, payment UI, balances, invoices, receipts, fiscal behavior, materials, reports, and reminders;
- broad Patient Detail or planner redesign.

## Next Task

Recommended next task:

- Task 99 - Planner and Appointment Card Pilot UI/UX Restyling.

Treatment-plan creation/editing is no longer the primary pilot blocker once Task 98 validation is green.
