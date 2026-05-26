# DentApp - Product Roadmap

## Purpose

This roadmap reflects the product direction after Checkpoint B, completed after
the patient, treatment-plan read-only, appointment, provider-assignment, Visit
Completion, and appointment operational-state foundations.

The roadmap is intentionally ordered around the daily clinic workflow. Work that
improves clinical and operational readiness should come before reports,
analytics, and automation that depend on stable workflows.

Task 94 updates the near-term direction: optional internal settlement records
are deferred until after MVP. The active MVP stream should not add settlement,
payment, balance, ledger, invoice, receipt, fiscal, or report functionality.

Task 95 adds the pilot priority layer. The first in-clinic test should focus on
appointment scheduling, planner/schedule display, patient reception progression,
clinical visit work, treatment-plan creation/use, and optional next-appointment
scheduling.

## Current Foundation

Completed foundations:

- authenticated role-aware app shell;
- patient list, profile, record sections, archive/restore, medical records, and
  clinical notes;
- odontogram and treatment-plan read-only foundations;
- Visit Completion persistence, draft/completed states, completed visit review,
  patient timeline, and print preparation;
- appointment model, patient appointment entry points, daily/weekly schedule,
  appointment detail, lifecycle hardening, provider assignment, provider
  filtering, and responsive smoke coverage;
- appointment operational state foundation with `not_arrived`, `arrived`, and
  `ready_for_doctor`;
- focused RLS and browser smoke coverage for patients, appointments, provider
  assignment, Visit Completion, treatment-plan reads, and responsive overflow.

Important boundaries:

- appointment lifecycle remains separate from operational state;
- assigned provider remains separate from actual visit completion attribution;
- Visit Completion does not yet create performed services, charges, payments,
  material usage, or commission entries;
- treatment plans are visible as clinical planning context but are not yet
  mutated from Visit Completion.

## Pilot Priority Layer

### Pilot-critical

- treatment-plan schema/RLS hardening before mutation UI exposure;
- treatment-plan creation/editing UI for patient plans and plan items;
- any blocking appointment, reception, or Visit Completion defect found during
  pilot-path validation;
- enough end-to-end validation to confirm the first clinic test can run.

### Pilot usability / restyling

- planner daily/weekly readability;
- appointment-card hierarchy and reception operational actions;
- patient-detail workflow entry points;
- Visit Completion and completed visit clinical usability;
- rebooking / next appointment action clarity;
- responsive checks on desktop, tablet, and supported mobile widths.

### Post-pilot or deferred

- internal settlement records and all payment/ledger/balance/fiscal/invoice or
  receipt work;
- doctor commissions;
- broad reports/analytics;
- advanced reminders, recall automation, external calendar sync, online booking,
  patient portal, room/chair scheduling, and waiting-time analytics;
- broad inventory/material-request work unless a narrow pilot need is approved.

## Rebalanced Sequence

### Stage 1 - Pilot Clinical Workflow Readiness

Goal:

Stabilize the first in-clinic pilot workflow around scheduling, planner use,
reception progression, patient clinical work, treatment-plan creation/use, and
next-appointment scheduling.

Priorities:

- preserve `visit_procedures` as the active clinical procedure record;
- keep Visit Completion clinical-only;
- improve patient/appointment/visit workflow clarity;
- harden treatment-plan write RLS around same-clinic patient ownership;
- implement the missing treatment-plan create/edit pilot workflow;
- identify remaining clinical MVP blockers before pilot;
- keep settlement, payment, ledger, balance, invoice, receipt, and fiscal work
  out of scope.

Reasoning:

Tasks 92-94 deliberately froze finance-like behavior. Task 95 confirms that the
first usable milestone is a focused pilot clinical path, not the whole final
product.

### Stage 2 - Pilot UI/UX Restyling Foundation

Goal:

Improve the validated clinical and operational screens that the pilot will use.

Priorities:

- review existing patient, appointment, schedule, Visit Completion, completed
  visit, and treatment-plan read-only surfaces;
- restyle planner, appointment cards, reception actions, patient detail, Visit
  Completion, treatment-plan surfaces, and rebooking actions in that order where
  dependencies allow;
- standardize layout, navigation, cards, lists, tables, forms, and action
  patterns;
- preserve existing behavior and smoke coverage while improving usability.

Reasoning:

Treatment-plan writes are the main functional blocker. The rest of the pilot
path has enough foundation to benefit from focused usability and visual work
after treatment-plan write hardening and UI wiring are complete.

### Stage 3 - Post-Restyling Clinical Enhancements

Goal:

Extend the clinical MVP only after the restyled validated workflow is stable.

Priorities:

- treatment-plan mutation planning;
- inventory and material request planning;
- print/export review for clinical records;
- pilot feedback fixes.

Reasoning:

New domain behavior should not be layered onto screens that still need a
coherent MVP visual and interaction pass.

### Stage 4 - Treatment Plan Mutation and Clinical Completion Integration

Goal:

Use performed services to update treatment-plan progress where the user
explicitly links performed work to a planned item.

Priorities:

- allow Visit Completion/performed services to reference treatment-plan items;
- support explicit item completion/progress updates;
- preserve manual override and audit history;
- avoid automatic plan mutation without user confirmation.

### Stage 5 - Inventory and Material Requests

Goal:

Track materials after clinical work and service catalog patterns are clearer.

Priorities:

- inventory item list and stock movements;
- low-stock visibility;
- material request workflow;
- optional later link from performed services to material usage.

### Stage 6 - Reports, Print, Audit Review, and Pilot Stabilization

Goal:

Prepare the pilot workflow after the core facts exist.

Priorities:

- daily schedule and completed work reports;
- commission reports;
- low-stock/material request reports;
- print/export review;
- RLS/audit hardening pass;
- pilot feedback fixes.

## Near-Term Recommended Tasks

1. Task 95 - Pilot Clinical Flow Audit and UI/UX Restyling Foundation Planning
2. Task 96 - Treatment Plan Creation/Edit Pilot Workflow Finalization
3. Task 97 - Treatment Plan Mutation Schema/RLS Hardening
4. Task 98 - Patient Treatment Plan Creation/Edit UI
5. Task 99 - Pilot Treatment Plan Smoke and Rebooking Entry-Point Polish
6. Task 100 - Planner and Appointment Card Pilot Restyling
7. Task 101 - Patient Detail Pilot Workflow Entry Restyling
8. Task 102 - Visit Completion and Completed Visit Pilot Usability Pass
9. Task 103 - Pilot Clinical Flow Validation Checkpoint

## Deferred Until After These Stages

- internal settlement records;
- patient ledger/payment/balance UI;
- settlement record model decisions;
- controlled settlement read/write RPCs;
- settlement exports or reports;
- service catalog / financial performed-service revival;
- doctor commission calculation;
- room/chair scheduling;
- provider workload calendar and availability rules;
- waiting-time analytics;
- automatic treatment-plan mutation;
- payment fiscalization;
- invoices and receipts;
- external calendar sync;
- patient portal and online booking;
- reminders and task automation.
