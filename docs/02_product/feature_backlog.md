# DentApp - Feature Backlog

## Purpose

This backlog captures the active MVP feature order after the Task 90-94 internal-settlement correction sequence. It is not a full specification. Each item should still become a focused design/task note before implementation.

Task 94 supersedes the earlier finance-like backlog order. Internal settlement records, patient ledger/payment/balance UI, invoices, receipts, fiscalization, and settlement reports are deferred until after MVP.

## Pilot Priority Layer

### Pilot-critical

Scope:

- treatment-plan schema/RLS hardening before write UI exposure;
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

### Task 98 - Patient Treatment Plan Creation/Edit UI

Scope:

- wire the existing treatment-plan service methods into Patient Detail /
  TreatmentPlansSection;
- expose patient-scoped create/edit/archive controls to `owner_admin`, `doctor`,
  and `specialist`;
- keep assistant and reception treatment-plan access read-only;
- hide or ignore `proposed_total`, `estimated_price`, and service-code fields;
- preserve settlement/payment/ledger deferral.

Non-goals:

- settlement records;
- payments;
- balances;
- ledger UI;
- invoices or receipts;
- fiscalization;
- commissions;
- material usage;
- automatic treatment-plan mutation from Visit Completion;
- broad visual restyling.

## Next Planning Queue

### Task 99 - Pilot Treatment Plan Smoke And Rebooking Entry-Point Polish

Scope:

- update browser smoke coverage for treatment-plan create/edit/archive behavior;
- verify RLS/read-write boundaries remain intact;
- add only a narrowly justified patient appointment shortcut if needed, routing
  to the existing scheduling form.

### Task 100 - Planner And Appointment Card Pilot Restyling

Scope:

- restyle Appointments daily/weekly views and appointment cards around scan
  clarity, provider/status visibility, reception progression, and primary
  clinical actions;
- preserve existing behavior and smoke guards.

### Task 101 - Patient Detail Pilot Workflow Entry Restyling

Scope:

- refine Patient Today, Quick Actions, Appointments, Treatment Plan, and
  Timeline entry points for the pilot path.

### Task 102 - Visit Completion And Completed Visit Pilot Usability Pass

Scope:

- polish the clinical-only Visit Completion and completed visit review surfaces;
- improve follow-up/rebooking action clarity;
- keep settlement/payment behavior absent.

### Task 103 - Pilot Clinical Flow Validation Checkpoint

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
