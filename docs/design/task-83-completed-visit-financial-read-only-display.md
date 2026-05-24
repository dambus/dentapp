# Task 83 - Completed Visit Financial Read-only Display

## Summary

Task 83 adds a read-only `Services & charges` section to the completed visit
detail page. The section shows finalized performed-service snapshots and
visit-scoped posted ledger charge visibility where the current role is allowed
to read financial rows.

No payment, balance, invoice, receipt, refund, discount, write-off, adjustment,
commission, materials, treatment-plan conversion, schema, migration, or RLS
changes were added.

## Primary Surface

The primary surface is the existing completed visit detail route:

```text
/patients/:patientId/visits/:visitId
```

This page already represents one completed clinical encounter, so it is the
right place to show read-only service and charge context without implying a
patient-wide account view.

The section is placed after the clinical `Procedures` card and before clinical
note / recommendation content. It is labeled:

- `Services & charges`
- `Read-only`

## Data Shown

For authorized financial readers, the section displays finalized
`performed_services` rows for the completed visit:

- service name snapshot;
- quantity;
- unit price snapshot;
- finalized line amount;
- currency;
- credited provider display when available;
- tooth / region when recorded.

Rows are display-only. The completed visit detail page does not allow changing
service, amount, provider credit, ledger status, or any finalized snapshot.

## Ledger Charge Visibility

The page also reads visit-scoped posted `patient_ledger_entries` with:

- `entry_type = charge`;
- `status = posted`;
- same patient and visit;
- matching finalized performed-service IDs.

The section then shows:

- `Posted to patient account` when every finalized service has a posted charge;
- `Charge posting pending` when finalized services exist but one or more posted
  charge rows are missing;
- a compact `Charge total` derived only from posted charge entries for this
  visit.

The total is not a patient balance, invoice total, amount due, or payment state.
It is a read-only posted charge total for the completed visit.

## Empty, Pending, Blocked, And Error Behavior

- No performed services: show `No performed services were recorded for this
  visit.` No fake zero total is shown.
- Pending posting: show finalized rendered services plus a read-only warning
  that charges have not been fully posted. No posting/retry action is exposed on
  completed visit detail.
- Blocked role: show a neutral message that services and charges are not
  available for the current role. The completed clinical visit remains visible.
- Error: show a warning in the section without failing the whole completed visit
  detail page.

## Service Layer

Task 83 extends `src/features/patient-ledger/patientLedgerService.ts` with:

```ts
getCompletedVisitFinancialSummary(patientId, visitId)
```

The helper uses existing RLS-protected reads:

- `fetchPerformedServicesForVisit(...)` for finalized performed-service rows;
- direct `patient_ledger_entries` select for posted visit charge rows;
- current profile lookup to avoid presenting financial data to roles known to be
  blocked from ledger/performed-service financial access.

No new read-only RPC was required because the existing table RLS and narrow
visit-scoped client reads already provide the needed boundary.

## Role Boundary

The existing Task 80/81 financial visibility boundary is preserved:

- `owner_admin`, `doctor`, `specialist`, and `reception_admin` may read
  same-clinic financial visibility;
- `assistant` and `inventory_responsible` do not receive ledger amount/detail
  visibility;
- `reception_admin` can see posted charge status but still cannot post charges.

No ledger posting action was added to completed visit detail.

## Browser Coverage

`supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` now verifies:

- posted charges are visible on completed visit detail after Visit Completion
  finalizes services and posts ledger charges;
- the finalized service snapshot and `Charge total` are visible;
- no payment/edit action is introduced in the read-only section;
- zero-service completed visits show a clean empty services/charges state and no
  fake charge total;
- a deterministic completed visit with finalized services but no posted charge
  shows the read-only `Charge posting pending` state without a retry action.

Existing Visit Completion finalization/posting retry, appointment lifecycle,
operational state, provider assignment, follow-up, treatment-plan, and
responsive smoke coverage remains preserved.

## Deferred Scope

Still deferred:

- patient-wide account / ledger view;
- balance summaries;
- payment entry;
- invoices and receipts;
- refunds, reversals, discounts, write-offs, and adjustments;
- commissions;
- materials and inventory accounting;
- treatment-plan mutation/conversion;
- completed visit financial edit actions.

## Next Task

Task 84 should be a planning task for Patient Account read-only ledger and
balance summary before implementing patient-wide totals or payment workflows.
