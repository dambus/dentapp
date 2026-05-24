# Task 81 - Patient Ledger Service Layer / Idempotent Charge Posting

## Summary

Task 81 adds the controlled service/RPC layer for posting patient-ledger charge
entries from finalized performed services. It does not wire posting into Visit
Completion, patient account UI, payment recording, invoices, receipts, balances,
refunds, discounts, commissions, materials, or treatment-plan conversion.

The implementation keeps the existing domain split:

- `performed_services` remains the visit-linked source for rendered chargeable
  clinical work and preserved service/price/provider snapshots.
- `patient_ledger_entries` remains the accounting movement table introduced in
  Task 80.
- Posting creates downstream ledger `charge` debit entries; it does not mutate
  visits, appointments, or performed-service snapshots.

## Controlled RPC Boundary

Two RPCs were added in
`20260524213000_add_patient_ledger_charge_posting_rpc.sql`:

- `get_patient_ledger_charge_posting_state_for_visit(target_visit_id uuid)`
- `post_finalized_performed_services_to_patient_ledger(target_visit_id uuid)`

Both functions are `security definer` functions with an explicit `search_path`.
They derive clinic, patient, visit, amount, currency, service snapshot, and
performed-service linkage from trusted database rows. The client supplies only a
visit ID.

The posting RPC does not accept client-supplied:

- amount,
- currency,
- patient ID,
- clinic ID,
- provider attribution,
- description snapshot,
- ledger direction,
- ledger status.

This preserves the Task 80 decision that ordinary authenticated clients cannot
insert directly into `patient_ledger_entries`.

## Posting Role Boundary

Read/check state is available to same-clinic roles that may read ledger context:

- `owner_admin`
- `doctor`
- `specialist`
- `reception_admin`

Posting is narrower:

- `owner_admin`: allowed
- `doctor`: allowed
- `specialist`: allowed
- `reception_admin`: blocked for now
- `assistant`: blocked
- `inventory_responsible`: blocked

This keeps charge creation aligned with the clinical performed-service workflow
instead of granting payment/accounting mutation authority broadly. Reception can
read same-clinic ledger rows from Task 80, but converting finalized clinical work
into posted charges remains reserved for owner/admin and clinical provider roles
until a later product decision expands financial operations.

## Result States

The RPC/service result model uses these states:

- `posting_required`: finalized performed services exist and at least one is not
  represented by a posted charge ledger entry.
- `posted`: the current call completed missing charge posting and all eligible
  finalized services now have posted charges.
- `already_posted`: all eligible finalized services already had posted charge
  entries before the current call.
- `no_services`: the completed visit has no finalized performed services, so no
  ledger charge entries are created.
- `blocked`: posting/checking cannot proceed because of role, clinic scope,
  missing visit, or visit status.
- `error`: frontend service fallback for RPC/client failures.

The frontend wrapper in
`src/features/patient-ledger/patientLedgerService.ts` maps RPC JSON into typed
results for future UI wiring:

- `getPatientLedgerChargePostingStateForVisit(...)`
- `postFinalizedPerformedServicesChargesForVisit(...)`

The wrapper performs no UI mutation and no patient-wide balance calculation.

## Charge Posting Semantics

For each eligible finalized performed service, posting creates one ledger entry:

- `entry_type = 'charge'`
- `direction = 'debit'`
- `status = 'posted'`
- `source_type = 'performed_service'`
- `source_id = performed_services.id`
- `performed_service_id = performed_services.id`
- `visit_id = performed_services.visit_id`
- `appointment_id = performed_services.appointment_id`
- `clinic_id` and `patient_id` from the performed service
- `amount = performed_services.final_amount`
- `currency = performed_services.currency`
- `posted_at = performed_services.performed_at` or current timestamp
- `recorded_by` and `created_by` from the authenticated active profile

The description snapshot is generated server-side from the performed-service
service name snapshot, optional tooth/region, and quantity.

Only finalized performed services on completed visits are eligible. Draft/open
performed-service rows are not posted, and open visits are blocked.

## Idempotency And Partial Recovery

Task 80 already prevents duplicate posted service charges through the partial
unique index on posted `charge` entries per `performed_service_id`.

Task 81 uses that constraint as the final duplicate-charge guard and structures
posting as an insert-select with `on conflict do nothing`. This means:

- first posting creates one charge per eligible finalized performed service;
- repeated posting creates no duplicate rows and reports `already_posted`;
- partial prior posting creates only missing charge rows;
- near-concurrent retry attempts converge on one posted charge per performed
  service.

Existing posted charge snapshots are not updated during retry.

## Zero-Service Visits

A completed visit with no finalized performed services returns `no_services`.
Posting creates no fake ledger rows and does not treat this as a failure.

If draft rows exist on an open visit, posting is blocked because ledger charge
posting is only available for completed visits with finalized service sources.

## Failure Boundary

Ledger charge posting is downstream from both clinical completion and
performed-service finalization.

A posting failure must not:

- reopen or change a completed visit;
- change appointment lifecycle or operational state;
- change appointment provider assignment;
- mutate follow-up/next-step fields;
- mutate finalized performed-service snapshots;
- convert treatment-plan items;
- create payment, invoice, receipt, balance, commission, or materials records.

Future Task 82 should surface this as a separate post-completion financial
posting state, not as a failed clinical visit.

## Test Coverage

`supabase/snippets/testPatientLedgerPostingRls.mjs` covers:

- posting state before posting;
- successful posting of one debit `charge` per finalized performed service;
- amount/currency/reference/description/source mapping;
- repeated retry without duplicates or snapshot mutation;
- zero-service completed visits;
- partial prior posting recovery;
- draft/open visit blocking;
- allowed posting roles;
- blocked `reception_admin`, `assistant`, `inventory_responsible`, and
  cross-clinic posting;
- direct insert/update/delete table mutation remains blocked;
- visits, appointments, and performed-service snapshots remain unchanged.

## Deferred Scope

Still deferred:

- Visit Completion ledger posting wiring;
- post-completion ledger posting failure/retry UI;
- patient account or ledger UI;
- completed-visit financial display;
- payment recording;
- discounts, write-offs, refunds, reversals, and adjustment workflows;
- invoices and receipts;
- balance summaries or cached balances;
- commissions;
- materials/inventory accounting;
- treatment-plan mutation/conversion.

## Next Task

Task 82 should wire the safe Task 81 posting helper into the post-completion
workflow while preserving the separate boundaries between clinical completion,
performed-service finalization, and ledger charge posting.
