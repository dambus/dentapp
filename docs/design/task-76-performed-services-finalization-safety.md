# Task 76 - Performed Services Finalization Safety

This task adds the smallest safe service/data foundation needed before a visible
`Services & Charges` step is wired into Visit Completion. It keeps UI,
ledger, payment, commission, treatment-plan mutation, and material/inventory
behavior out of scope.

## Context

Task 75 identified the key integration risk:

- existing Visit Completion can complete the clinical visit;
- performed-service rows must be finalized only after that clinical completion;
- these are separate client-side service calls for now;
- the app must not silently leave draft chargeable rows unresolved after a
  completed visit.

Task 76 does not make the two operations a single database transaction. Instead
it adds explicit finalization state and retry-safe service behavior that the
future UI can present clearly.

## Implemented Service Helpers

Updated:

`src/features/performed-services/performedServicesService.ts`

### `getPerformedServicesFinalizationStateForVisit(input)`

Loads the visit status and non-archived performed-service rows for the current
clinic/patient/visit context, then returns a structured state.

States:

- `open_visit_drafts`
  - visit is not completed and draft performed-service rows exist;
  - this is expected before clinical completion.
- `finalization_required`
  - visit is completed and one or more draft performed-service rows remain;
  - UI should show retry/recovery messaging.
- `finalized`
  - performed-service rows exist and no draft rows remain.
- `no_services`
  - no performed-service rows exist for the visit;
  - valid MVP state.
- `blocked`
  - rows exist but finalization is not currently valid for the visit state.

The returned state also includes:

- performed-service records;
- draft count;
- finalized count;
- total count;
- `needsRetry`;
- human-readable message.

### `finalizePerformedServicesForCompletedVisit(input)`

Provides retry-safe finalization orchestration for future Visit Completion UI.

Behavior:

- validates patient and visit IDs;
- requires an active profile context;
- loads initial finalization state;
- returns success immediately for:
  - `no_services`;
  - already `finalized`;
- refuses finalization when the visit is not completed;
- finalizes only remaining draft rows for completed visits;
- reloads finalization state after the update;
- returns a structured failure when draft rows remain after finalization.

Idempotency:

- calling the helper again after successful finalization does not create
  duplicate rows;
- it returns the already finalized state.

## Existing Methods Preserved

Existing Task 74 methods remain:

- `fetchActiveServiceCatalog`;
- `fetchPerformedServicesForVisit`;
- `createPerformedService`;
- `replaceDraftPerformedServicesForVisit`;
- `finalizePerformedServicesForVisit`;
- `fetchCreditedProviderOptions`.

`replaceDraftPerformedServicesForVisit` still only archives/replaces draft rows.
It does not touch finalized, corrected, or voided rows.

## Finalization Strategy

Approved flow for the future UI:

1. Save the clinical Visit Completion draft.
2. Save performed-service draft rows for that open visit.
3. On completion, save latest clinical and performed-service draft state.
4. Complete the clinical visit.
5. Call `finalizePerformedServicesForCompletedVisit`.
6. If it returns `no_services` or `finalized`, show successful completion.
7. If it returns `finalization_required` or a failed result, keep the user on a
   recovery-capable completion state and allow retry.

No fake zero-value rows are created for visits with no performed services.

## Failure Semantics For Future UI

If clinical completion fails:

- do not call performed-service finalization;
- draft performed-service rows remain draft.

If clinical completion succeeds but performed-service finalization fails:

- the clinical visit is completed;
- draft performed-service rows may still exist;
- the UI must show a warning and retry path;
- the UI must not imply ledger, payment, invoice, balance, or commission
  changes.

If retry succeeds:

- rows move from `draft` to `finalized`;
- historical service and price snapshots remain unchanged.

## RLS And Role Boundaries

No RLS policies were broadened.

Current boundaries remain:

- owner/admin, doctor, and specialist can create/update/finalize draft
  performed-service rows according to Task 73 policies;
- reception can read performed services but cannot write them;
- assistant and inventory do not get performed-service financial access;
- blocked-role operations may return zero visible/updated rows rather than a
  user-facing database error, so callers must rely on the structured final state
  and not on error text alone.

## Test Coverage

Extended:

`supabase/snippets/testPerformedServicesRls.mjs`

Added finalization-safety coverage for:

- no-service completed visits remaining valid;
- draft rows being rejected when newly inserted against completed visits;
- finalized status being rejected while a visit is still open;
- draft rows becoming finalizable after the linked visit is completed;
- retrying finalization being idempotent and creating no duplicate rows;
- assistant blocked-role behavior leaving unresolved draft rows unchanged;
- draft replacement paths not touching finalized rows;
- snapshot name/price values surviving catalog changes after finalization;
- performed-service finalization not changing appointment lifecycle status,
  appointment operational state, appointment assigned provider, or
  `visits.completed_by`.

Existing performed-services smoke coverage still verifies:

- schema availability;
- catalog visibility;
- performed-service role visibility;
- cross-clinic isolation;
- provider attribution enforcement;
- finalized-row immutability;
- no mutation of existing clinical `visit_procedures`.

## Out Of Scope

Not implemented:

- React `Services & Charges` step;
- catalog selection UI;
- completed visit performed-service display;
- patient ledger;
- payment entry;
- invoices/fiscalization;
- doctor commission calculation;
- treatment-plan mutation;
- material or inventory integration;
- broad RLS redesign.

## Next Task

Task 77 should wire the visible Visit Completion `Services & Charges` step using
the Task 76 helper contract.

The UI should:

- save performed-service drafts only after a visit draft exists;
- call `finalizePerformedServicesForCompletedVisit` after clinical completion;
- treat `no_services` as a valid completion state;
- surface `finalization_required` as retry/recovery, not as silent success.
