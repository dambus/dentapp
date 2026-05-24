# Checkpoint B - Product Roadmap Re-balance

This checkpoint rebalances DentApp after the appointment and operational-state
work completed through Task 71.

## Current Product State

The strongest implemented path is now:

1. patient lookup and patient context;
2. appointment scheduling and daily/weekly schedule review;
3. provider assignment as planned appointment context;
4. day-of-visit operational state;
5. appointment-to-Visit Completion handoff;
6. Visit Completion draft/completion persistence;
7. completed visit review and patient timeline visibility.

The current foundations are enough to support clinic flow from scheduling to
clinical completion, but completed work is still mostly clinical note data. The
next domain layer should turn completed work into structured performed services.

## Decisions

### 1. Build performed services before ledger and commissions

Performed services should be the next foundation because they connect:

- Visit Completion;
- patient timeline;
- service catalog and prices;
- optional treatment-plan item completion;
- patient ledger charges;
- doctor commission calculation;
- future material usage.

Ledger and commission features should not rely only on appointment reasons or
free-text clinical notes.

### 2. Keep ledger separate from Visit Completion until performed services exist

Visit Completion should not directly create patient debt in the next task. It
should first produce structured performed services. Ledger charge creation can
then be designed explicitly with permissions, audit rules, corrections, and
discount behavior.

### 3. Keep commissions after ledger/payment rules

Commission depends on two pilot decisions that remain open:

- performed-based versus collected-based calculation;
- whether discounts/lab costs reduce the commission base.

The data model should support both directions, but the first UI/reporting slice
should wait until performed services and ledger rules are stable.

### 4. Defer deeper scheduling features

Provider assignment and operational state are now good enough for MVP workflow
continuity. Defer:

- room/chair scheduling;
- availability and conflict enforcement;
- provider workload calendar;
- waiting-time analytics;
- operational event history.

These are useful later but less important than connecting clinical work to
financial and commission outcomes.

## Updated Near-Term Sequence

1. Task 72 - Performed Services Foundation Planning
2. Task 73 - Service Catalog and Performed Services Schema/RLS
3. Task 74 - Performed Services Service Layer
4. Task 75 - Visit Completion Performed Services UI Slice
5. Task 76 - Patient Ledger Planning
6. Task 77 - Patient Ledger Schema/RLS Foundation
7. Task 78 - Patient Ledger UI Slice
8. Task 79 - Doctor Commission Planning
9. Doctor Commission Foundation
10. Treatment Plan Mutation Integration
11. Inventory and Material Requests
12. Reports, Print, Audit Review, and Pilot Stabilization

## Task 72 Recommended Scope

Task 72 should be planning-only.

It should review:

- `src/features/visits/VisitCompletionFlow.tsx`;
- `src/features/visits/visitCompletionService.ts`;
- treatment-plan schema/service surfaces;
- appointment/provider attribution;
- `docs/05_technical/database_schema.md`;
- `docs/03_domain/payment_and_debt_model.md`;
- `docs/03_domain/doctor_commission_model.md`.

It should decide:

- whether performed services are created during draft save, completion only, or
  both;
- whether one Visit Completion can contain multiple performed services;
- required snapshot fields for service name, service code/category, price, and
  provider;
- whether a performed service can start without a service catalog row;
- how performed services link to treatment-plan items;
- which roles can read and write performed services.

It should not implement:

- migrations;
- UI changes;
- ledger charges;
- payment recording;
- discount handling;
- commission entries;
- material consumption.

## Documentation Updates

This checkpoint updates:

- `docs/02_product/roadmap.md`;
- `docs/02_product/feature_backlog.md`;
- `docs/02_product/mvp_scope.md`;
- `docs/07_execution/implementation_roadmap.md`;
- `docs/07_execution/todo.md`;
- `docs/07_execution/progress.md`.

No runtime behavior, schema, RLS policy, service code, UI, or smoke tests are
changed by this checkpoint.
