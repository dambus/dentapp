# Task 82 - Visit Completion Ledger Posting Wiring

## Summary

Task 82 wires the Task 81 patient-ledger charge posting helper into the existing
Visit Completion success flow. It keeps clinical completion, performed-services
finalization, and patient-ledger posting as separate downstream stages.

No schema, RLS, migration, payment, invoice, receipt, refund, discount,
write-off, balance, commission, materials, or treatment-plan conversion work was
added.

## Three-Stage Flow

### Stage A - Clinical Completion

The existing `completeVisit(...)` call remains the clinical source of truth.

If clinical completion fails, Visit Completion keeps the user in the editable
flow and does not attempt performed-services finalization or ledger posting.

### Stage B - Performed-Services Finalization

After clinical completion succeeds, Visit Completion still calls
`finalizePerformedServicesForCompletedVisit(...)`.

If finalization returns `finalized`, the flow proceeds to ledger charge posting.
If finalization returns `no_services`, the flow stays in the normal completed
state and does not attempt ledger posting. If finalization requires retry or is
blocked, the UI shows the existing services/charges warning and does not show a
ledger posting success or retry state yet.

### Stage C - Patient-Ledger Charge Posting

After services are finalized, Visit Completion calls
`postFinalizedPerformedServicesChargesForVisit(...)`.

Successful `posted` and `already_posted` states show the completed success state
with:

```text
Charges posted to patient account.
```

`posting_required`, recoverable service errors, or non-permission failures show a
non-destructive warning and `Retry charge posting`. Retry calls only the Task 81
ledger posting helper and does not repeat clinical completion or
performed-services finalization.

Permission-blocked posting shows a manual follow-up warning without presenting
repeated retry as an authorization fix.

## Failure Boundaries

Ledger posting failure does not roll back or downgrade:

- completed visit status;
- finalized performed-service rows;
- appointment lifecycle status;
- appointment operational state;
- assigned provider;
- follow-up / next-step fields.

The completed visit remains completed, and services remain finalized. The UI
communicates only that charge posting to the patient account still needs
attention.

## Retry Separation

Visit Completion now has separate downstream retry paths:

- `Retry finalization` calls only
  `finalizePerformedServicesForCompletedVisit(...)`.
- If that retry succeeds with finalized services, Visit Completion then attempts
  ledger posting.
- `Retry charge posting` calls only
  `postFinalizedPerformedServicesChargesForVisit(...)`.

Both operations rely on the existing idempotent service/RPC behavior, so repeated
retries do not duplicate performed services or ledger charge rows.

## Zero-Service Handling

When no performed services were recorded:

- the completed visit success state remains normal;
- the existing no-services finalization message remains visible;
- no ledger charge rows are posted;
- no charge-posting warning or retry action is shown.

## Role Behavior

Task 81's posting boundary is preserved:

- `owner_admin`, `doctor`, and `specialist` may post eligible same-clinic
  charges;
- `reception_admin` may read/check ledger state but cannot post charges;
- `assistant` and `inventory_responsible` remain blocked.

Task 82 does not add RLS changes or broaden financial mutation permissions.

## Browser Coverage

`supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` now verifies:

- performed-service finalization success is followed by ledger charge posting;
- exactly one posted charge ledger entry exists per finalized performed service;
- zero-service completions do not show ledger posting warnings/retry and do not
  create fake charges;
- forced performed-service finalization failure does not show ledger posting
  state before finalization succeeds;
- finalization retry can then proceed into ledger posting;
- forced ledger posting failure keeps the visit completed and services
  finalized, shows `Retry charge posting`, and retry posts exactly one charge;
- responsive smoke still covers the Visit Completion screen with the new
  completed-state notice/action surface.

## Deferred Scope

Still deferred:

- Patient Overview account/balance UI;
- standalone Patient Account / Ledger UI;
- completed visit read-only financial detail beyond this completion success
  feedback;
- payments;
- invoices and receipts;
- refunds, reversals, discounts, write-offs, and adjustments;
- cached/stored balances;
- commissions;
- materials and inventory accounting;
- treatment-plan mutation/conversion.

## Next Task

Task 83 should make posted charges visible in a read-only completed-visit
financial context before patient-wide balance or payment workflows are added.
