# Task 88 - Payment Service Controlled Recording / Reversal Boundary

## Summary

Task 88 adds the controlled service/RPC layer for recording patient payments.
It does not add payment UI, account summaries, balances, invoices, receipts,
refunds, allocations, commissions, materials accounting, treatment-plan
conversion, Visit Completion changes, or appointment behavior changes.

Implemented:

- controlled payment recording RPC;
- request-level idempotency key support;
- linked ledger `payment` credit creation from trusted payment values;
- controlled payment reversal RPC;
- typed frontend service helpers for future UI use;
- focused payment-operation RLS/data tests.

## Controlled Recording Pathway

Added RPC:

- `record_patient_payment(...)`

Accepted client inputs:

- patient id;
- positive amount;
- three-letter uppercase currency;
- payment method;
- optional received timestamp;
- optional reference number;
- optional notes;
- optional idempotency key.

Server-derived values:

- clinic id;
- recorded/created profile;
- payment status;
- ledger entry type;
- ledger direction;
- ledger status;
- ledger description snapshot;
- ledger source/linkage fields.

The RPC validates an active authenticated profile, same-clinic patient scope,
and the payment-recording role boundary before writing.

## Role Boundary

Allowed to record and reverse payments:

- `owner_admin`;
- `reception_admin`.

Blocked:

- `doctor`;
- `specialist`;
- `assistant`;
- `inventory_responsible`.

Doctors and specialists remain financial readers and clinical charge posters,
but they are not payment recorders.

## Atomic Payment-to-ledger Behavior

A successful recording operation creates:

1. one `patient_payments` row with `status = posted`;
2. one linked `patient_ledger_entries` row with:
   - `entry_type = payment`;
   - `direction = credit`;
   - `status = posted`;
   - matching clinic, patient, amount, and currency;
   - `patient_payment_id` pointing to the payment;
   - `source_type = patient_payment`;
   - `source_id = patient_payments.id`.

The payment row is then linked back through `ledger_entry_id`.

The operation runs inside one server-side RPC transaction. If payment creation,
ledger credit creation, or payment backlinking fails, the operation fails
without leaving a partial client-visible financial operation.

## Idempotency

Task 88 implements request-level idempotency through:

- `patient_payments.idempotency_key`;
- unique partial index on `(clinic_id, idempotency_key)`.

When a caller repeats the same payment request with the same key:

- no second payment row is created;
- no second ledger credit is created;
- the RPC returns `already_recorded` with the original payment and ledger ids.

If the same key is reused for a different patient, amount, currency, method,
reference, notes, or explicit received timestamp, the RPC returns `invalid`
with a conflict reason.

Calls without an idempotency key are still atomic, but separate valid calls can
record separate payments. Future UI should always supply an operation key.

## Reversal Boundary

Added RPC:

- `reverse_patient_payment(...)`

The reversal operation is intentionally narrow:

- only active same-clinic `owner_admin` or `reception_admin` can reverse;
- only posted, non-reversed payments with a confirmed original payment credit
  can be reversed;
- original payment and original ledger credit are preserved;
- payment status is changed to `reversed`;
- reversal metadata is recorded on the payment;
- one compensating ledger `reversal` debit entry is created;
- repeated reversal returns `already_reversed` and does not create another debit.

This is payment correction only. Refunds remain a separate deferred workflow.

## Frontend Service Layer

Added:

- `src/features/patient-payments/patientPaymentService.ts`

Exports:

- `recordPatientPayment(...)`;
- `reversePatientPayment(...)`;
- typed request/result models for future UI integration.

The service maps RPC responses into statuses:

- `recorded`;
- `already_recorded`;
- `reversed`;
- `already_reversed`;
- `blocked`;
- `invalid`;
- `error`.

It does not calculate balance, amount due, paid/unpaid state, invoices,
receipts, or allocations.

## Currency Hardening

The payment recording RPC enforces the same uppercase three-letter currency
representation as the schema. A narrow follow-up migration replaces the first
recording function version so lowercase currency input is rejected rather than
silently normalized.

## Patient-scoped Unallocated MVP

Payments remain patient-scoped and unallocated.

No payment-to-charge, payment-to-visit, payment-to-invoice, paid/unpaid, or
settlement state was added.

## Tests

Added:

- `supabase/snippets/testPatientPaymentRecordingRls.mjs`

Coverage includes:

- owner payment recording happy path;
- reception payment recording happy path;
- linked payment ledger credit creation;
- trusted server-derived clinic/recorder/ledger values;
- request-level idempotency and conflict handling;
- zero/negative amount rejection;
- invalid method and invalid currency rejection;
- blocked doctor/specialist/assistant/inventory recording;
- cross-clinic patient block;
- controlled reversal and repeated reversal idempotency;
- blocked-role reversal;
- direct payment and ledger mutation safety.

## Task 87B Boundary

Task 87B's appointment-list local date boundary fix was not changed. Browser
smoke remains green after Task 88. One deterministic leftover smoke fixture
cleanup was needed for duplicate `TASK77-SVC` service rows from an interrupted
prior run before rerunning the smoke.

## Deferred Scope

Deferred:

- payment-entry React UI;
- patient account charge + payment activity display;
- balance or amount due;
- paid/unpaid states;
- payment allocation;
- invoices;
- receipts;
- refunds;
- discounts/write-offs;
- cash reports;
- commissions;
- materials/inventory accounting;
- treatment-plan conversion.

## Next Task

Recommended next task:

- Task 89 - Patient Account Charges + Payments Read-only Summary / Balance
  Decision.
