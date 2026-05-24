# Task 87 - Payment Schema/RLS Foundation

## Summary

Task 87 introduces the database foundation for future patient payment
recording. It adds `patient_payments`, prepares linked ledger payment-credit
entries, and keeps all payment mutation behind future controlled workflows.

No runtime UI, frontend service, payment recording RPC, balance calculation,
invoice, receipt, refund, allocation, commission, material, treatment-plan, or
Visit Completion behavior was added.

## Schema Introduced

New table:

- `patient_payments`

Key fields:

- `id`;
- `clinic_id`;
- `patient_id`;
- `amount`;
- `currency`;
- `payment_method`;
- `status`;
- `received_at`;
- `reference_number`;
- `notes`;
- `ledger_entry_id`;
- `reversed_at`;
- `reversed_by`;
- `reversal_reason`;
- `reversal_ledger_entry_id`;
- `recorded_by`;
- `created_by`;
- `created_at`;
- `updated_at`.

The table stores real-world payment events. Ledger entries remain the financial
movement history for future account activity and balance decisions.

## Amount, Currency, Method, and Status

Amount:

- must be positive;
- is independent from future allocation/balance logic;
- is not exposed to broad client edits.

Currency:

- uses the same three-letter uppercase currency-code convention as ledger and
  performed-service rows;
- no conversion logic was added.

Payment method:

- `cash`;
- `card`;
- `bank_transfer`;
- `other`.

Status:

- `posted`;
- `reversed`.

`posted` is the MVP valid-recorded state. `reversed` is reserved for a future
controlled reversal workflow. Draft/unposted payment states were intentionally
not introduced.

## Why Payment Is Separate From Ledger

`patient_payments` represents the operational payment event: method, reference,
received time, notes, and recorder.

`patient_ledger_entries` represents accounting movement. A future payment
recording service will create one posted ledger `payment` credit entry for each
valid posted payment.

This preserves:

- operational payment metadata;
- append-only ledger accounting history;
- future receipt/reporting compatibility;
- reversal-based correction instead of destructive payment edits.

## Ledger Payment-credit Linkage

The migration adds:

- `patient_ledger_entries.patient_payment_id`.

Future linked payment credit rows must be:

- `entry_type = 'payment'`;
- `direction = 'credit'`;
- `status = 'posted'`;
- linked to a `patient_payments` row through `patient_payment_id`;
- same clinic and patient as the payment;
- same amount and currency as the payment;
- not combined with performed-service, visit, or appointment charge linkage.

Payment rows also include nullable:

- `ledger_entry_id`;
- `reversal_ledger_entry_id`.

These allow Task 88 to create the payment row, create its ledger credit, then
link the payment back to the created ledger row without forcing unsafe circular
creation.

## Duplicate Payment-credit Prevention

The migration adds a partial unique index:

- `patient_ledger_entries_one_posted_credit_per_payment_idx`

It allows at most one posted payment credit ledger row per
`patient_payment_id`. This prepares Task 88 idempotency and prevents duplicate
credits for the same payment.

The uniqueness applies only to posted payment credit linkage. Future reversal
entries will use their own reversal references and are not treated as duplicate
payment credits.

## Integrity Validation

`enforce_patient_payment_context()` validates:

- payment patient exists and belongs to the payment clinic;
- `recorded_by` is an active same-clinic `owner_admin` or `reception_admin`;
- `created_by`, when provided, follows the same payment-recorder role boundary;
- `reversed_by`, when provided, follows the same payment-recorder role boundary;
- linked `ledger_entry_id`, when present, references a matching posted payment
  credit ledger entry for the same payment, clinic, patient, amount, and
  currency;
- linked reversal ledger entry, when present, is same clinic and patient.

`enforce_patient_ledger_entry_context()` was replaced to also validate
`patient_payment_id` linkage while preserving existing charge/performed-service
ledger validation.

## RLS Boundary

Read access to `patient_payments` follows current financial read visibility:

- `owner_admin`;
- `doctor`;
- `specialist`;
- `reception_admin`.

Blocked:

- `assistant`;
- `inventory_responsible`.

This matches the current ledger financial read boundary. Mutation authority is
separate: doctors and specialists can read financial context, but Task 86 did
not select them as payment recorders.

No insert, update, or delete policy was added for authenticated users.

Future Task 88 should add controlled RPC/service mutation only for:

- `owner_admin`;
- `reception_admin`.

## Direct Mutation Boundary

Ordinary authenticated clients cannot directly:

- insert payment records;
- update payment records;
- delete payment records;
- insert linked payment ledger credit entries;
- update/delete ledger financial history.

Fixture setup in tests uses service-role access, matching the existing RLS test
pattern.

## Reversal, Allocation, and Refund Boundaries

Implemented now:

- status and nullable reversal metadata fields are present;
- destructive payment deletion is blocked for ordinary clients.

Deferred:

- reversal RPC/service;
- reversal UI;
- refund workflows;
- allocation to charges, visits, or invoices;
- paid/unpaid state;
- balance display;
- invoice/receipt generation.

Payment reversal remains distinct from refund. A future reversal should preserve
the original payment and create compensating ledger movement.

## Tests

Added:

- `supabase/snippets/testPatientPaymentsRls.mjs`

Coverage includes:

- schema readability;
- valid owner/reception payment fixtures;
- amount, currency, method, and status constraints;
- clinic/patient consistency;
- recorded-by role validation;
- linked ledger payment credit validation;
- duplicate payment-credit rejection;
- payment read RLS by role and clinic;
- direct mutation blocking for payments and linked ledger credit rows.

Existing ledger, performed-service, Visit Completion, appointment, browser
smoke, and treatment-plan tests remain unchanged.

## Deferred Runtime Scope

Task 87 does not add:

- React UI;
- frontend payment services;
- payment recording RPC;
- payment reversal RPC;
- payment listing in patient Full Record;
- account activity changes;
- balance/amount due/paid status;
- invoices or receipts;
- refunds;
- discounts/write-offs;
- cash reporting;
- commissions;
- materials/inventory accounting;
- treatment-plan conversion.

## Next Task

Recommended next task:

- Task 88 - Payment Service Layer / Controlled Recording and Reversal Boundary.
