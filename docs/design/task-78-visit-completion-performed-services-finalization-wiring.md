# Task 78 - Visit Completion Performed Services Finalization Wiring

## Summary

Task 78 wires the existing Task 76 performed-service finalization helpers into
the Visit Completion `Complete Visit` action.

After clinical visit completion succeeds, the Visit Completion UI now calls
`finalizePerformedServicesForCompletedVisit(...)` for the completed visit. This
keeps clinical completion and services/charges finalization as separate
operations while still making finalization part of the normal completion flow.

## Completion Boundary

Clinical visit completion remains the authoritative clinical operation.

If `completeVisit(...)` fails, the Visit Completion flow stays editable and
shows the existing completion error. If `completeVisit(...)` succeeds but
performed-service finalization fails afterward, the UI does not roll back or
present the visit as clinically incomplete.

The completed state clearly communicates:

- the visit is completed,
- services/charges are finalized, have no rows, are blocked, or need retry,
- retry acts only on performed-service finalization.

## Finalization States

The UI uses the existing finalization state returned by
`finalizePerformedServicesForCompletedVisit(...)`:

- `finalized`: shows `Services & charges finalized.`
- `no_services`: shows that no performed services were recorded and no retry is
  needed.
- `finalization_required`: shows a non-destructive warning and a
  `Retry finalization` action.
- `blocked`: shows a warning based on the service-layer message without trying
  unsafe mutations.

Recoverable finalization exceptions are treated as a completed visit with
services/charges requiring retry.

## Retry

The completed success screen now includes a retry action only when the
performed-services state is pending or failed recoverably.

Retry calls `finalizePerformedServicesForCompletedVisit(...)` with the existing
completed visit ID and patient ID. It does not call `completeVisit(...)` again.
The Task 76 helper remains responsible for idempotence, so repeated retries do
not duplicate performed-service rows or rewrite finalized snapshots.

## Zero-Service Completion

A visit with no performed services still completes normally.

The finalization helper returns `no_services`; the UI shows a neutral
no-services message and does not show retry. No fake performed-service rows are
created.

## Smoke Coverage

The authenticated browser smoke now verifies:

- performed-service draft save/reload still works,
- completing with a service finalizes exactly one performed-service row,
- the completed success screen shows services/charges finalization success,
- zero-service completion shows no retry state,
- a forced one-time finalization failure leaves the visit completed,
- retry finalizes the existing draft row without creating duplicates.

## Deferred Work

This task intentionally does not add patient ledger UI, ledger persistence,
payment collection, invoices, receipts, balances, commission calculations,
material consumption, treatment-plan mutation, or appointment lifecycle changes.

The next product stream should remain the patient ledger foundation unless a
narrow prerequisite defect is discovered.
