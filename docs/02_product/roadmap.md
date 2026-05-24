# DentApp - Product Roadmap

## Purpose

This roadmap reflects the product direction after Checkpoint B, completed after
the patient, treatment-plan read-only, appointment, provider-assignment, Visit
Completion, and appointment operational-state foundations.

The roadmap is intentionally ordered around the daily clinic workflow. Work that
creates clinical or financial facts should come before reports, analytics, and
automation that depend on those facts.

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

## Rebalanced Sequence

### Stage 1 - Performed Services Foundation

Goal:

Turn completed visit context into structured performed work that can later drive
ledger, commissions, reports, and treatment-plan progress.

Priorities:

- define the service catalog and performed-service MVP slice;
- decide whether Visit Completion should record one or many performed services;
- add schema/RLS for service categories, services, and performed services;
- connect performed services to patient, visit, provider, and optional treatment
  plan item;
- keep billing, payments, materials, and commissions out of the first performed
  services slice.

Reasoning:

The next major modules need a stable source of clinical work. Ledger and
commission work should not be built on free-text visit notes alone.

### Stage 2 - Price, Discount, and Patient Ledger

Goal:

Track patient financial status from performed services without becoming a fiscal
or accounting system.

Priorities:

- define charge creation from performed services;
- define patient ledger entries for charges, payments, discounts, corrections,
  advances, and installment notes;
- decide discount permissions and audit requirements;
- show patient balance only to allowed roles;
- add minimal patient ledger UI and smoke/RLS coverage.

Reasoning:

Debt and payment visibility is a core MVP promise, but it depends on knowing
what was actually performed and priced.

### Stage 3 - Doctor Commission Foundation

Goal:

Calculate and review doctor/specialist commission from structured performed work
and, where configured, collected payments.

Priorities:

- decide pilot default: performed-based, collected-based, or both;
- define commission rules per doctor and optionally per service/category;
- define commission entries and payout status;
- keep commission visibility highly restricted;
- add owner report first, doctor own-report only if enabled.

Reasoning:

Commission calculations are sensitive and should be built after performed
services and ledger rules are explicit.

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
- patient ledger and debt reports;
- commission reports;
- low-stock/material request reports;
- print/export review;
- RLS/audit hardening pass;
- pilot feedback fixes.

## Near-Term Recommended Tasks

1. Task 72 - Performed Services Foundation Planning
2. Task 73 - Service Catalog and Performed Services Schema/RLS
3. Task 74 - Performed Services Service Layer
4. Task 75 - Visit Completion Performed Services UI Slice
5. Task 76 - Patient Ledger Planning
6. Task 77 - Patient Ledger Schema/RLS Foundation
7. Task 78 - Patient Ledger UI Slice
8. Task 79 - Doctor Commission Planning

## Deferred Until After These Stages

- room/chair scheduling;
- provider workload calendar and availability rules;
- waiting-time analytics;
- automatic treatment-plan mutation;
- payment fiscalization;
- external calendar sync;
- patient portal and online booking;
- reminders and task automation.
