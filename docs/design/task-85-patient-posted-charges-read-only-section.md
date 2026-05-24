# Task 85 - Patient Posted Charges Read-only Section

## Summary

Task 85 adds a patient-level read-only `Charges` section to the existing patient
Full Record experience. The section displays posted service-charge ledger rows
recorded in DentApp for the selected patient.

This is not a patient balance, payment, invoice, or receipt feature. No
financial mutations were added.

## Patient-level Surface

The new section appears in the existing patient detail Full Record section
navigation:

- tab/select label: `Charges`;
- section heading: `Posted charges`;
- supporting text: `Read-only service charges recorded in DentApp.`

The section is intentionally placed in Full Record rather than Patient Overview.
It is useful for deeper review without turning the overview into a financial
dashboard.

## Data Shown

The section shows posted ledger rows from `patient_ledger_entries` where:

- `patient_id` is the current patient;
- `entry_type = 'charge'`;
- `direction = 'debit'`;
- `status = 'posted'`.

Each row displays:

- ledger `description_snapshot`;
- posted date/time;
- amount and currency;
- `Posted charge` status;
- `View completed visit` when the current role can open completed visit detail.

Rows are sorted by `posted_at` descending, so newest posted charges appear first.

## Totals and Currency

Grouped totals are included as posted-charge totals only:

- the summary label is `Total posted charges`;
- totals are grouped by currency;
- different currencies are never combined;
- no currency conversion is performed.

The UI does not label these totals as balance, amount due, outstanding amount,
or payment state.

## No Balance or Payment State

The section does not display or imply:

- patient balance;
- amount due;
- outstanding amount;
- paid/unpaid status;
- payment status;
- invoices;
- receipts;
- payment actions.

The ledger schema can represent future credits and corrections, but normal
runtime currently creates only posted charge debit entries. Showing balance
before payment/credit workflows exist would be misleading.

## Empty, Loading, Error, and Blocked Roles

Loading:

- the section shows a local loading state while posted charges are read.

Empty:

- authorized users with no posted charge rows see `No posted charges recorded
  for this patient.`

Error:

- unexpected read failures show a calm read-only error with a reload action that
  only re-fetches data.

Blocked roles:

- `assistant` and `inventory_responsible` do not see the Full Record `Charges`
  section.
- Expected permission absence is not shown as a data-loading error.

## Role Boundary

The implementation preserves existing ledger read boundaries:

- `owner_admin`, `doctor`, `specialist`, and `reception_admin` may read
  same-clinic posted charge rows through existing RLS;
- `assistant` and `inventory_responsible` remain blocked;
- `reception_admin` can read posted charges but still cannot post charges.

Completed visit links are exposed only for roles already expected to read
completed visit detail: `owner_admin`, `doctor`, and `specialist`.

## Data Retrieval

No new RPC, migration, or RLS policy was needed.

`getPatientPostedChargesSummary(patientId)` was added to
`src/features/patient-ledger/patientLedgerService.ts`. It:

- normalizes route patient IDs through the existing patient persistence helper;
- checks the active profile role before reading;
- uses existing RLS-protected direct reads from `patient_ledger_entries`;
- maps rows into frontend-friendly read-only activity data;
- groups posted-charge totals by currency.

It does not calculate patient balance and does not mutate ledger rows.

## Pending Posting Boundary

The patient-level section lists posted charge activity only. It does not scan
all completed visits for pending ledger posting and does not expose retry
actions.

Pending/unposted state remains visible at completed visit detail and in Visit
Completion completion-state handling. A future financial reconciliation slice
can add patient-level pending-posting notices if needed.

## Browser Coverage

The authenticated browser smoke test now verifies:

- the patient Full Record `Charges` section renders for an allowed role;
- a posted charge description, amount, and currency are visible;
- grouped posted-charge totals are visible;
- misleading patient-account terms and actions are absent from the section;
- `View completed visit` opens the existing completed visit detail route.

Existing smoke coverage for completed visit financial visibility, Visit
Completion ledger posting/retry, zero-service visits, appointment lifecycle,
operational state, provider assignment, follow-up, treatment-plan read-only
behavior, and responsive overflow is preserved.

## Deferred Scope

Deferred work:

- patient balance;
- amount due/outstanding indicators;
- payment recording;
- payment allocation;
- invoices and receipts;
- refunds, reversals, discounts, write-offs, and adjustments UI;
- financial mutation actions;
- patient-level charge-posting retry;
- commissions;
- materials/inventory accounting;
- treatment-plan conversion.

## Next Task

Recommended next task:

- Task 86 - Payment Recording Foundation Planning / Data Model Decision.
