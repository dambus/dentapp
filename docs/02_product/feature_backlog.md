# DentApp - Feature Backlog

## Purpose

This backlog captures the rebalanced feature order after Checkpoint B. It is not
a full specification. Each item should still become a focused design/task note
before implementation.

## Ready Next

### Task 72 - Performed Services Foundation Planning

Scope:

- review current Visit Completion, treatment-plan, appointment, provider, and
  database schema surfaces;
- decide the first performed-service data model;
- define how service catalog rows, free-text snapshots, prices, providers, and
  treatment-plan item links should work;
- define RLS and smoke-test coverage.

Non-goals:

- payments;
- discounts;
- commissions;
- material usage;
- automatic treatment-plan mutation.

### Task 73 - Service Catalog and Performed Services Schema/RLS

Scope:

- create service categories/services tables if needed;
- create performed services table;
- connect performed services to clinic, patient, visit, provider, optional
  appointment, and optional treatment-plan item;
- preserve snapshot fields for service name and price;
- add focused RLS smoke coverage.

### Task 74 - Performed Services Service Layer

Scope:

- add typed reads/writes for service categories, services, and performed
  services;
- support draft performed-service replacement for open visits;
- support performed-service finalization when a visit is completed;
- keep ledger posting and commission calculation out of scope.

### Task 75 - Visit Completion Performed Services UI Slice

Scope:

- add a small performed-services section to Visit Completion;
- allow adding/removing performed service rows before completion;
- persist performed services with the visit;
- show performed services on completed visit detail and patient timeline.

Non-goals:

- automatic charge creation unless Task 76/77 is complete;
- commission calculation;
- inventory consumption.

## Next Planning Queue

### Task 76 - Patient Ledger Planning

Scope:

- decide ledger entry types for charges, payments, discounts, corrections,
  advances, and installment notes;
- define balance calculation;
- define role visibility;
- define audit requirements;
- decide whether payment allocation is automatic or manual for MVP.

### Task 77 - Patient Ledger Schema/RLS Foundation

Scope:

- create ledger/payment tables and balance-safe read patterns;
- connect performed-service charges to ledger entries;
- enforce role-specific access;
- add RLS/data smoke coverage.

### Task 78 - Patient Ledger UI Slice

Scope:

- show patient balance to allowed roles;
- show patient ledger history;
- add a minimal payment entry flow;
- add no broad accounting/fiscal behavior.

## Later MVP Queue

### Task 79 - Doctor Commission Planning

Scope:

- decide performed-based versus collected-based pilot behavior;
- decide doctor/specialist visibility;
- decide whether discounts or lab costs reduce commission basis;
- keep schema and calculation implementation out until planning is complete.

### Doctor Commission Foundation

Scope:

- commission rules;
- commission entries;
- performed-based and/or collected-based calculation decision;
- owner commission report;
- doctor own report only if enabled;
- strict RLS and audit coverage.

### Treatment Plan Mutation Integration

Scope:

- explicitly link performed services to treatment-plan items;
- update treatment-plan item status only with user intent;
- keep audit history for status changes.

### Inventory and Material Requests

Scope:

- inventory list/detail;
- stock movements;
- low-stock indicators;
- material requests and approvals;
- optional performed-service material usage later.

### Reports and Pilot Stabilization

Scope:

- daily schedule report;
- performed services report;
- patient ledger/debt report;
- commission report;
- low-stock report;
- print/export review;
- audit/RLS review;
- pilot feedback fixes.

## Deferred Backlog

- patient portal;
- online booking;
- external calendar sync;
- automated reminders;
- chair/room resource scheduling;
- waiting-time analytics;
- fiscalization integration;
- native mobile apps;
- multi-location management;
- advanced analytics.
