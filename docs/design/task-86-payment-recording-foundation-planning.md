# Task 86 - Payment Recording Foundation Planning

## Summary

Task 86 is a docs-only architecture decision for future payment recording.

Decision:

- use a dedicated future `patient_payments` table to represent real-world money
  received from a patient;
- recording a payment should create a linked posted patient-ledger credit entry;
- payment recording should be controlled through a trusted service/RPC pathway,
  not direct client ledger inserts;
- MVP payments should be patient-scoped and unallocated to specific charges or
  visits;
- payment corrections should be reversal-based, not destructive edits;
- `owner_admin` and `reception_admin` should be the initial payment-recording
  roles;
- patient balance should remain deferred until charge and payment activity,
  reversal boundaries, currency behavior, and read-only account wording are
  implemented and verified.

No runtime, service, schema, migration, RLS, or test changes are part of this
task.

## Current Financial Boundary After Task 85

Implemented today:

- `performed_services` stores finalized rendered-service snapshots;
- `patient_ledger_entries` stores patient-scoped financial movement rows;
- Visit Completion completes clinical visits, finalizes performed services, and
  posts patient-ledger charge entries in separate stages;
- posted `charge` debit entries are created idempotently from finalized
  performed services;
- completed visit detail shows read-only `Services & charges`;
- patient Full Record has a read-only `Charges` section showing posted charge
  activity;
- posted-charge totals are grouped by currency and labeled as charges recorded
  in DentApp.

Schema capability already exists for these ledger entry types:

- `charge`;
- `payment`;
- `discount`;
- `write_off`;
- `refund`;
- `adjustment`;
- `reversal`.

Normal runtime behavior currently creates only posted `charge` debit entries.
There is no workflow that creates `payment`, `discount`, `write_off`, `refund`,
`adjustment`, or `reversal` ledger entries.

Not implemented today:

- payment recording;
- payment methods;
- payment references;
- cash/card/bank-transfer handling;
- payment allocation to charges or visits;
- payment reversal;
- refunds;
- write-offs;
- discounts;
- invoices;
- receipts;
- patient-wide balance;
- amount due;
- paid/unpaid status;
- cashier workflow;
- daily cash report;
- provider commission accounting.

The fact that `patient_ledger_entries.entry_type` permits `payment` does not
mean DentApp has a payment-recording model or workflow.

## Repository Audit Findings

Ledger schema fields relevant to future payments:

- `clinic_id`;
- `patient_id`;
- `entry_type`;
- `direction`;
- positive `amount`;
- `currency`;
- `description_snapshot`;
- nullable `visit_id` and `appointment_id`;
- nullable `reverses_entry_id`;
- `status` with `posted`, `reversed`, and `voided`;
- `source_type`;
- `source_id`;
- `metadata`;
- `posted_at`;
- `recorded_by`;
- `created_by`;
- `created_at`.

Current ledger constraints already encode:

- `payment`, `discount`, and `write_off` entries are credits;
- `charge` and `refund` entries are debits;
- amounts are positive and direction carries accounting meaning;
- ledger references must stay in the same clinic and patient context;
- ordinary authenticated users have no direct ledger insert/update/delete
  policy.

Tables or workflows not found in the current implementation:

- no `payments` or `patient_payments` table;
- no receipt or invoice table;
- no allocation table;
- no cash transaction table;
- no payment service function;
- no payment RPC;
- no payment-entry UI;
- no payment RLS test.

Existing UI/payment wording:

- `src/pages/PaymentsPage.tsx` is only a placeholder describing a future
  permission-controlled workspace;
- patient overview still contains demo-era financial placeholder wording, not a
  real ledger-backed balance;
- Task 85 browser smoke guards the new `Charges` section against balance,
  payment, invoice, and receipt terminology.

Current ledger read access:

- `owner_admin`;
- `doctor`;
- `specialist`;
- `reception_admin`.

Current service-charge posting authority:

- `owner_admin`;
- `doctor`;
- `specialist`.

Blocked from ledger financial rows or posting:

- `assistant`;
- `inventory_responsible`.

`reception_admin` currently reads ledger rows but cannot post clinical service
charges.

## Payment Model Options

### Option A - Ledger Credit Row Only

In this model, recording payment inserts a `patient_ledger_entries` row with
`entry_type = 'payment'`, `direction = 'credit'`, amount, currency,
description/reference fields, and recorder metadata.

Benefits:

- minimal schema;
- simple balance math;
- fewer entities;
- direct alignment with ledger movements.

Risks:

- weak representation of real-world payment method and collection metadata;
- external references, card/bank/cash details, notes, receipt linkage, and
  cashier reporting become overloaded into generic ledger fields;
- cancellation and correction workflows become awkward;
- future receipt generation has no clear payment document;
- allocation and reconciliation need another model later anyway;
- treating the accounting movement as the entire business document limits audit
  clarity.

This is not recommended.

### Option B - Dedicated Payment Record Plus Ledger Credit Entry

In this model, a payment row represents the real-world collection event. A
linked ledger credit entry represents its accounting movement.

Benefits:

- clearer domain model;
- payment method and operational metadata have a proper home;
- better auditability;
- receipt and reporting workflows have a payment document to reference later;
- ledger remains the single movement history for future account calculations;
- cancellation can preserve the original payment and add a reversal movement;
- future allocation can reference both payment and ledger rows without
  rewriting charge history.

Costs:

- adds schema and a controlled posting workflow;
- payment row and ledger credit entry must be created consistently and
  idempotently;
- requires focused RLS and tests.

This is the recommended model.

### Option C - Invoice-first / Receivable-first Model

In this model, charges become invoice lines or receivables, payments attach to
invoices, and ledger entries are generated from those documents.

Benefits:

- strong fit for invoice-heavy accounting;
- can support formal settlement and receipt workflows later.

Risks:

- invoices are not implemented;
- charge posting already exists independently of invoice documents;
- this would force a broader accounting redesign before DentApp has payment
  recording;
- dental clinic MVP needs patient collection and ledger history before full
  invoice/fiscalization semantics.

This is too broad for the next foundation.

## Selected Model

Use a dedicated payment record plus a linked patient-ledger credit entry.

Target direction:

- future table: `patient_payments`;
- each posted payment creates exactly one posted ledger entry with
  `entry_type = 'payment'` and `direction = 'credit'`;
- ledger entries remain the accounting source for future account activity and
  balance calculation;
- payment rows store operational collection details;
- clients do not supply arbitrary ledger values independent of the trusted
  payment record;
- duplicate ledger credits for the same posted payment are prevented by unique
  linkage/idempotent posting rules.

## Future Payment Entity

Recommended table name:

- `patient_payments`.

The name is explicit that this is patient-account money received, and it avoids
conflict with future vendor payments or payroll/commission concepts.

Recommended conceptual fields:

- `id`: primary key;
- `clinic_id`: same-clinic scope;
- `patient_id`: patient receiving the payment credit;
- `amount`: positive amount;
- `currency`: controlled three-letter currency code;
- `payment_method`: initial constrained values;
- `received_at`: when money was received;
- `reference_number`: nullable external reference, card slip, bank reference, or
  manual reference;
- `notes`: nullable operational note;
- `status`: minimal immutable-friendly status;
- `recorded_by`: active same-clinic profile that recorded payment;
- `created_by`: active same-clinic profile that created the row, likely same as
  `recorded_by` in MVP;
- `created_at`;
- `updated_at`: only for non-financial metadata/status transitions if needed;
- `ledger_entry_id`: nullable until posting completes or set after controlled
  creation, with a unique relationship to the payment ledger entry;
- `reversed_at`: nullable;
- `reversed_by`: nullable active same-clinic profile;
- `reversal_reason`: nullable;
- `reversal_ledger_entry_id`: nullable linked compensating ledger entry.

Future receipt linkage should remain deferred, for example a later
`receipt_id` or separate receipt table after receipt/fiscalization requirements
are known.

### Payment Status

Recommended initial status model:

- `posted`;
- `reversed`.

Avoid draft/unposted payments in the MVP. The safer first workflow is a
controlled record-and-post operation that creates a posted payment and its
ledger credit together. Draft payments create extra lifecycle and cancellation
state without clear current product need.

Do not allow normal users to edit posted amount or currency. Corrections should
use reversal plus a new payment.

## Payment Methods

Recommended initial method values:

- `cash`;
- `card`;
- `bank_transfer`;
- `other`.

Use a constrained set initially rather than a configurable reference table. This
keeps the MVP small, testable, and clear. A configurable payment-method catalog
can be introduced later if clinics need custom processor names, fiscal codes,
or bank accounts.

Deferred:

- payment gateways;
- card processor integrations;
- terminal integrations;
- bank reconciliation;
- fiscal receipt integrations;
- online payments.

## Payment-to-ledger Relationship

Recording a valid payment should create one posted ledger entry:

- `entry_type = 'payment'`;
- `direction = 'credit'`;
- `amount` equals the trusted payment amount;
- `currency` equals the trusted payment currency;
- `clinic_id` and `patient_id` match the payment;
- `description_snapshot` is derived server-side, for example
  `Payment - cash` or `Payment - bank transfer`;
- `source_type = 'patient_payment'`;
- `source_id = patient_payments.id`;
- `posted_at` aligns with `received_at` or controlled posting time;
- `recorded_by` and `created_by` come from the authenticated actor;
- `performed_service_id` remains null;
- `visit_id` and `appointment_id` remain null unless a later allocation or
  visit-scoped collection workflow explicitly justifies them.

Duplicate payment posting should be prevented through a unique linkage, such as
one posted payment ledger entry per `patient_payments.id` via `source_type` /
`source_id` or a dedicated FK relationship.

Ordinary clients should not receive direct insert/update/delete permission on
`patient_ledger_entries`. Payment recording should use a controlled RPC/service
path similar in security posture to Task 81 charge posting:

- accept only the minimum payment input;
- derive clinic, actor, and ledger values server-side;
- validate same-clinic patient access;
- create payment and ledger credit in one transaction;
- return explicit result states;
- remain safe to retry after partial/interrupted attempts.

Posted charge entries remain debits derived from finalized performed services.
Posted payment entries become credits derived from recorded payments.

## Allocation Decision

MVP payment recording should be patient-scoped and unallocated.

### Option A - Unallocated Patient-level Payments First

Benefits:

- significantly simpler;
- supports partial payment naturally;
- supports overpayment/account credit without inventing allocation rules;
- avoids invoice/receivable complexity;
- lets the account activity view show real debit and credit movement history.

Risks:

- no specific completed visit can be labeled paid;
- no invoice settlement;
- no receipt allocation detail;
- future allocation model will still be needed.

This is recommended for MVP.

### Option B - Require Allocation Immediately

Benefits:

- clearer future per-visit settlement;
- can answer which charges a payment covered.

Risks:

- larger scope;
- requires allocation records, partial allocation validation, concurrency rules,
  overpayment handling, reallocation, and reversal behavior;
- risks implying invoice-level accounting that does not exist.

This is deferred.

Consequences of the selected approach:

- no per-visit `Paid` label;
- no paid/unpaid state on completed visits;
- no invoice settlement;
- no allocation table in the first payment schema slice;
- no patient balance display until the product explicitly revisits balance
  wording and completeness.

## Reversal, Correction, and Refund Boundary

Posted financial events must not be destructively edited or deleted by normal
users.

### Payment Reversal

A future payment reversal should:

- preserve the original payment record;
- mark the payment as `reversed` through a controlled pathway;
- record `reversed_at`, `reversed_by`, and reason metadata;
- create a compensating ledger movement with the opposite accounting effect;
- reference the original payment and/or original ledger entry;
- avoid deleting or changing the original credit amount.

Under the existing ledger direction model, a normal payment is a credit.
Reversing that payment should create a compensating debit reversal movement.
That reversal should use the existing `reversal` entry type if it can be
constrained clearly in Task 87/88, with `reverses_entry_id` pointing at the
original payment credit ledger entry.

### Incorrect Payment Details

Incorrect posted amount or currency:

- reverse the original payment;
- record a new correct payment.

Incorrect non-financial notes/reference:

- may be corrected only through a later audited administrative metadata-update
  workflow if needed;
- should not change amount, currency, method, patient, or received time in a
  way that alters accounting meaning.

### Refund Distinction

Reversing an erroneously recorded payment is not the same as refunding money to
a patient.

Refund workflows remain deferred. They need a separate product/accounting
decision because they may represent money returned after a valid payment, not
correction of an invalid payment record.

## Currency and Balance Boundary

Payments must carry currency. A payment ledger credit must use the same currency
as the originating payment.

Currency rules:

- do not combine currencies into one total;
- do not introduce currency conversion;
- charge and payment activity should group amounts by currency;
- any future derived balance must be calculated per currency.

Do not show patient `Balance`, `Amount due`, `Outstanding`, `Paid`, or `Unpaid`
because payment schema is planned.

Balance display should be revisited only after:

- payment schema and controlled recording exist;
- payment reversal behavior is implemented or explicitly bounded;
- read-only charge + payment account activity is verified;
- mixed-currency handling is implemented and tested;
- role/access behavior is tested;
- product wording is approved so users do not confuse recorded activity with
  invoices, receipts, or collections status.

## Role and RLS Decision

Recommended payment recording roles:

- `owner_admin`;
- `reception_admin`.

Rationale:

- `owner_admin` is the administrative authority;
- `reception_admin` already has ledger read access and aligns with typical
  front-desk collection responsibility;
- payment collection is separate from clinical service-charge posting.

Do not automatically grant payment recording to `doctor` or `specialist`.
Those roles can currently read ledger rows and post finalized clinical service
charges, but receiving money from patients is a different operational
responsibility.

Blocked from payment recording:

- `doctor`;
- `specialist`;
- `assistant`;
- `inventory_responsible`.

Future RLS/service principles:

- same-clinic only;
- no direct client insert/update/delete on ledger rows;
- payment mutation only through controlled RPC/service;
- payment rows should be readable by the same ledger financial read roles unless
  a later product decision narrows that;
- destructive delete should be blocked;
- reversal should be controlled and audited.

## Future UI Workflow

Recommended UI sequence:

1. implement schema/RLS and service first;
2. evolve the patient Full Record `Charges` section into `Account activity`
   after payments exist;
3. expose a future `Record payment` action only to `owner_admin` and
   `reception_admin`;
4. keep completed visit detail read-only and avoid making it the first payment
   entry point.

Completed Visit Detail is a clinical record and currently shows visit-scoped
service/charge snapshots. It should not become the primary payment-entry
surface in the first payment slice.

The placeholder `Payments` route can remain a future workspace until real
payment workflows and permissions exist.

## Future Read-only Account Activity

After payments exist, the current patient Full Record `Charges` section can
evolve into `Account activity`.

It may display:

- posted service charges as debits;
- recorded payments as credits;
- reversals after they are implemented;
- per-currency debit and credit totals;
- clear read-only history.

Balance remains a separate decision. Task 89 should decide whether and how to
show balance only after charge and payment activity are both implemented and
verified.

## Recommended Task Sequence

1. Task 87 - Payment Schema/RLS Foundation
   - add `patient_payments`;
   - add method/status constraints;
   - add same-clinic patient/profile integrity;
   - add conservative RLS;
   - do not add payment UI.

2. Task 88 - Payment Service Layer / Controlled Recording and Reversal Boundary
   - add controlled payment recording;
   - create linked posted ledger credit entries idempotently;
   - implement or explicitly bound payment reversal;
   - do not display balance.

3. Task 89 - Patient Account Charges + Payments Read-only Summary / Balance
   Decision
   - evolve `Posted charges` into charge + payment account activity;
   - decide whether balance is honest and useful enough to display;
   - keep totals grouped by currency.

Later deferred tasks:

- payment-entry UI if not included with Task 88;
- payment reversal UI;
- receipts;
- invoices;
- refunds;
- discounts/write-offs;
- allocation to charges/visits;
- cash reports;
- commissions;
- materials/inventory accounting;
- treatment-plan conversion.

## Explicitly Deferred Scope

Task 86 does not implement:

- runtime UI;
- service-layer code;
- Supabase migrations;
- tables;
- RPCs;
- RLS policies;
- tests;
- payment entry;
- payment recording;
- payment reversal;
- allocation behavior;
- balance calculation/display;
- amount due;
- paid/unpaid status;
- invoices;
- receipts;
- refunds;
- discounts;
- write-offs;
- adjustments;
- commissions;
- materials/inventory;
- treatment-plan conversion;
- appointment or Visit Completion behavior.
