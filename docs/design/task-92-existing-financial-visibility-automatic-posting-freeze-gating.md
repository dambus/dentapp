# Task 92 - Existing Financial Visibility and Automatic Posting Freeze / Interim Access Block

## Decision

Task 92 restores the ordinary runtime to a clinical-only baseline while the
future optional internal-settlement module is redesigned behind clinic-level
enablement and explicit feature-specific access.

This is an interim freeze. It does not delete historical rows, rename backend
objects, implement settlement permissions, or add any new settlement UI.

## Runtime Exposure Removed

The following ordinary UI exposure was removed or disabled:

- Visit Completion no longer includes the `Services & Charges` step.
- Visit Completion no longer collects performed-service financial rows through
  the ordinary clinical workflow.
- Visit Completion no longer runs performed-service finalization or patient
  ledger charge posting after clinical completion.
- Visit Completion no longer shows performed-service finalization feedback,
  ledger posting success, ledger posting retry, or charge posting warnings.
- Completed Visit Detail no longer renders the `Services & charges` section,
  charge totals, posted charge state, pending charge state, or related actions.
- Patient Full Record no longer includes the `Charges` / `Posted charges`
  section.
- Patient overview/list demo balance placeholders were removed from ordinary
  patient surfaces.
- The `Payments` navigation item and route exposure were removed from ordinary
  routing.

Clinical visit completion, visit procedures, clinical notes, recommendations,
follow-up guidance, completed visit timeline/detail clinical sections,
appointment-linked completion behavior, appointment lifecycle behavior, and
treatment-plan read-only behavior remain in place.

## Automatic Posting Freeze

The Visit Completion runtime now treats the financial workflow as disabled.
Clinical completion still saves and completes visits, but it does not invoke:

- performed-service draft save from the ordinary UI,
- performed-service finalization,
- `post_finalized_performed_services_to_patient_ledger(...)`,
- ledger posting retry handling.

The existing frontend service helpers and backend RPC implementations remain in
the codebase as frozen technical artifacts for later review. They are no longer
invoked from reachable ordinary UI.

## Interim Database Access Block

Migration
`20260525103000_freeze_internal_settlement_visibility_and_access.sql` applies
the interim blocked posture:

- drops ordinary authenticated read policies on `patient_ledger_entries`;
- revokes authenticated table access on `patient_ledger_entries`;
- drops ordinary authenticated read policies on `patient_payments`;
- revokes authenticated table access on `patient_payments`;
- drops ordinary authenticated read/insert/update policies on
  `performed_services`;
- revokes authenticated table access on `performed_services`;
- revokes authenticated execution of:
  - `get_patient_ledger_charge_posting_state_for_visit(uuid)`;
  - `post_finalized_performed_services_to_patient_ledger(uuid)`;
  - `record_patient_payment(...)`;
  - `reverse_patient_payment(uuid, text)`.

No financial tables, columns, indexes, triggers, or stored rows were deleted.
Service-role/admin maintenance remains possible for migrations and test
fixtures.

## Performed Services Boundary

`performed_services` is frozen because the implemented table stores chargeable
rendered-service snapshots, including amount, currency, provider credit, and
finalization state. It is not required for the clinical record now that
`visit_procedures` remains the ordinary clinical procedure source.

`visit_procedures` was not blocked or removed. It remains the clinical record of
what was done during a visit.

## Tests Updated

Browser smoke coverage was updated to verify the frozen baseline:

- Visit Completion does not expose `Services & Charges`.
- Clinical completion still succeeds.
- Clinical completed visit details remain visible.
- Completed Visit Detail does not expose the former services/charges section.
- Patient Full Record does not expose posted charges.
- Clinical completion creates no performed-service or ledger charge rows.

`supabase/snippets/testInternalSettlementFreezeRls.mjs` was added to verify
ordinary authenticated roles cannot read or mutate the frozen artifacts and
cannot execute the frozen financial RPCs.

Legacy financial-access expectations from Tasks 73-88 are superseded for the
interim freeze period by this blocked-state coverage.

## Deferred Work

Task 92 does not implement:

- clinic feature toggle;
- explicit internal-settlement capabilities;
- settlement UI;
- payment UI;
- account activity;
- balance;
- invoice or receipt behavior;
- fiscal/cash-register integration;
- refunds, allocations, or user-triggered reversals;
- backend renames or destructive data cleanup.

## Next Task

Recommended next task:

**Task 93 - Internal Settlement Feature Toggle and Explicit Permission
Schema/RLS Foundation**

Task 93 should introduce the disabled-by-default clinic enablement model and
explicit view/manage capabilities before any frozen backend records are exposed
again.
