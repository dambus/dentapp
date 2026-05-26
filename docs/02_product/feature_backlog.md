# DentApp - Feature Backlog

## Purpose

This backlog captures the active MVP feature order after the Task 90-94 internal-settlement correction sequence. It is not a full specification. Each item should still become a focused design/task note before implementation.

Task 94 supersedes the earlier finance-like backlog order. Internal settlement records, patient ledger/payment/balance UI, invoices, receipts, fiscalization, and settlement reports are deferred until after MVP.

## Pilot Priority Layer

### Pilot-critical

Scope:

- treatment-plan creation/editing UI for patient plans and plan items;
- minimal patient-level plan workflow using the existing treatment-plan service,
  schema, RLS, and audit foundation;
- any blocking appointment, reception, or clinical visit defect found while
  validating the pilot path.

### Pilot usability / restyling

Scope:

- planner and schedule readability;
- appointment-card hierarchy and reception operational actions;
- patient-detail workflow entry points;
- Visit Completion and completed visit clinical usability;
- treatment-plan screens after the write workflow exists;
- rebooking / next appointment action clarity;
- responsive checks for the full pilot path.

### Post-pilot or deferred

Scope:

- internal settlement records;
- payments, balances, ledger UI, fiscalization, invoices, and receipts;
- doctor commissions;
- reports/analytics beyond pilot validation needs;
- advanced reminders, recall automation, external calendar sync, online
  booking, patient portal, room/chair scheduling, and waiting-time analytics.

## Ready Next

### Task 96 - Treatment Plan Creation/Edit Pilot Workflow

Scope:

- implement the minimal patient-level treatment-plan write UI required for the
  first clinic pilot;
- support creating/editing/archiving treatment plans and plan items where the
  existing service/RLS model allows;
- keep treatment plans clinical-only;
- preserve patient record visibility and existing read coverage;
- add focused validation for the new write path.

Non-goals:

- settlement records;
- payments;
- balances;
- ledger UI;
- invoices or receipts;
- fiscalization;
- commissions;
- material usage;
- automatic treatment-plan mutation from Visit Completion.

## Next Planning Queue

### Task 97 - Planner And Appointment Card Pilot Restyling

Scope:

- restyle Appointments daily/weekly views and appointment cards around scan
  clarity, provider/status visibility, reception progression, and primary
  clinical actions;
- preserve existing behavior and smoke guards.

### Task 98 - Patient Detail Pilot Workflow Entry Restyling

Scope:

- refine Patient Today, Quick Actions, Appointments, Treatment Plan, and
  Timeline entry points for the pilot path.

### Task 99 - Visit Completion And Completed Visit Pilot Usability Pass

Scope:

- polish the clinical-only Visit Completion and completed visit review surfaces;
- improve follow-up/rebooking action clarity;
- keep settlement/payment behavior absent.

### Task 100 - Pilot Clinical Flow Validation Checkpoint

Scope:

- manually validate the end-to-end pilot path;
- run the existing smoke/RLS guard set appropriate for pilot readiness;
- document remaining blockers before real in-clinic testing.

## Later MVP Queue

### Treatment Plan Mutation Integration

Scope:

- explicitly link clinical completed work to treatment-plan items only after a separate planning task;
- update treatment-plan item status only with user intent;
- keep audit history for status changes.

### Inventory and Material Requests

Scope:

- inventory list/detail;
- stock movements;
- low-stock indicators;
- material requests and approvals;
- optional clinical material usage later.

### Reports and Pilot Stabilization

Scope:

- daily schedule report;
- low-stock report;
- print/export review for clinical records;
- audit/RLS review;
- pilot feedback fixes.

## Deferred Backlog

- internal settlement records;
- patient ledger/payment/balance UI;
- settlement record model decisions;
- controlled settlement read/write RPCs;
- settlement exports or reports;
- service catalog / financial performed-service revival;
- doctor commission calculation;
- fiscalization integration;
- invoices and receipts;
- patient portal;
- online booking;
- external calendar sync;
- automated reminders;
- chair/room resource scheduling;
- waiting-time analytics;
- native mobile apps;
- multi-location management;
- advanced analytics.
