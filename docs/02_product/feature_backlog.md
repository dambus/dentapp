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

## Completed Pilot Usability Step

### Task 99 - Planner And Appointment Card Pilot UI/UX Restyling

Completed:

- restyled Appointments daily/weekly views and appointment cards around scan
  clarity, provider/status visibility, reception progression, and primary
  clinical actions;
- preserved existing behavior and smoke guards.

## Completed Pilot Usability Step

### Task 100 - Patient Detail Pilot Workflow Entry Restyling

Completed:

- restyled Patient Detail around patient identity, current workflow, treatment
  plan, rebooking, supporting clinical context, and deeper record access;
- preserved existing appointment, Visit Completion, provider, and
  treatment-plan behavior;
- validated the retained interrupted implementation after recovery, including
  browser smoke, RLS coverage, and responsive manual inspection;
- kept payment and settlement UI absent.

## Completed Pilot Usability Step

### Task 101 - Visit Completion And Completed Visit Pilot Usability Pass

Completed:

- restyled Visit Completion as a clearer clinical workflow shell with preserved
  patient/appointment context, draft state, review, confirmation, and success
  navigation;
- preserved persistence, appointment-linked completion, completed-history, and
  freeze behavior;
- extended browser smoke semantic assertions and completed responsive manual
  inspection;
- kept settlement/payment behavior absent.

## Completed Pilot Readiness Check

### Task 102 - In-Clinic Pilot Workflow Walkthrough / UI Consistency and Blocking Defect Audit

Completed:

- walked the current pilot path from scheduling through reception, Patient
  Detail, Visit Completion, treatment-plan usage, and rebooking;
- confirmed the recent pilot surfaces are coherent enough for guided in-clinic
  testing;
- confirmed no blocking runtime or workflow defect was found;
- confirmed settlement/payment/ledger visibility remains absent.

## Ready Next

### Task 103 - Guided In-Clinic Pilot Session Checklist and Observation Log Setup

Scope:

- prepare the guided first in-clinic pilot run rather than add new product
  modules;
- define a short workflow checklist for staff/doctor use during the pilot;
- define an observation log for blockers, confusion points, and consistency
  feedback found during real guided usage.

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
