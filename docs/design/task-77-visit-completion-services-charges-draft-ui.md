# Task 77 - Visit Completion Services & Charges Draft UI

Task 77 adds the first visible performed-services integration to Visit
Completion. It introduces draft charge entry and Review visibility only. It
does not finalize performed services, create ledger postings, collect payments,
calculate balances, calculate commissions, mutate treatment plans, or expose
completed-visit financial display.

## Implemented UI Slice

Updated:

- `src/features/visits/VisitCompletionFlow.tsx`
- `src/features/performed-services/PerformedServicesDraftEditor.tsx`
- `src/features/performed-services/performedServicesDraftModel.ts`
- `src/features/performed-services/performedServicesService.ts`

Visit Completion now includes a separate `Services & Charges` step before
`Review`.

Step order:

1. Plan
2. Done
3. Services & Charges
4. Notes
5. Next Step
6. Review

The new step keeps clinical procedure documentation separate from chargeable
performed-service rows.

## Authorized Role Behavior

Editable performed-service draft entry is available only to roles that the
Task 73/75/76 model allows to manage performed-service financial rows:

- `owner_admin`
- `doctor`
- `specialist`

Blocked roles, including `assistant` and `inventory_responsible`, do not load
catalog pricing or credited-provider options through the editor. They see a
permission notice and can continue the clinical workflow without adding
chargeable services.

`reception_admin` remains a read-oriented financial workflow role for later
ledger/payment surfaces; this UI slice does not give reception an in-visit
performed-service editing path.

## Draft Row Fields

The MVP editor exposes only the Task 75-approved fields:

- active catalog service selection;
- derived service name/code/category snapshot;
- quantity;
- unit price snapshot, defaulted from the selected service and editable;
- calculated line amount;
- credited provider;
- optional tooth/region context.

Deferred fields remain out of scope:

- treatment-plan item link;
- clinical procedure link;
- discount/promotion engine;
- payment data;
- ledger balance;
- commission data.

## Draft Persistence

`Save Draft` now persists performed-service draft rows together with the
existing Visit Completion draft flow.

Behavior:

- if no performed services are entered, draft save remains valid and no fake
  zero-value row is created;
- if rows are entered, they are validated before save;
- the clinical visit draft is saved first to provide the visit ID;
- draft performed services are then saved with
  `replaceDraftPerformedServicesForVisit`;
- reopening the open Visit Completion flow reloads draft performed-service rows
  with their stored snapshot values;
- draft replacement remains limited to eligible open visit context.

If the clinical draft save succeeds but charge draft save fails, the UI reports
that the visit draft was saved but service/charge rows were not saved. The
unsaved rows remain in local state so the user can retry.

During browser validation, the service-layer UUID validator was corrected to
accept the full Postgres UUID text shape used by existing deterministic demo
fixtures. Database constraints and RLS remain the authority for real integrity
checks.

## Review Summary

The Review step now includes a display-only `Services & Charges` summary:

- service name snapshot;
- quantity;
- credited provider;
- line amount;
- draft total;
- empty state when no chargeable services were entered.

The copy intentionally avoids `Paid`, `Balance due`, `Invoice`, and `Payment
received`. The summary reflects draft chargeable services only.

## Completion Boundary

Finalization on `Complete Visit` remains deferred to the next task.

Task 77 performs one small integrity-preserving action before completion:

- when draft rows exist and the user confirms completion, the flow saves the
  latest performed-service draft rows while the visit is still open, because
  draft replacement is intentionally blocked after completion.

The flow still does not call
`finalizePerformedServicesForCompletedVisit`. After this slice, completed visits
with draft performed-service rows still rely on the Task 76 recovery state and
must be finalized by the next orchestration task.

## Browser Smoke Coverage

`supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` now seeds a
deterministic active service catalog item and verifies:

- the new `Services & Charges` step appears in Visit Completion;
- an authorized doctor user can add a catalog-backed service row;
- credited provider selection is available;
- unit price and line total use stored snapshot values;
- `Save Draft` persists performed-service draft rows;
- reopening the open Visit Completion flow reloads the draft row;
- Review shows the service/charge summary and draft total;
- zero-service visits can continue without fake rows;
- responsive overflow smoke reaches the new step.

## Validation

Required validation for this task:

- `npx.cmd supabase migration up`
- `npm.cmd run build`
- `npm.cmd run lint`
- `node supabase/snippets/testPerformedServicesRls.mjs`
- `node supabase/snippets/testAppointmentOperationalStateRls.mjs`
- `node supabase/snippets/testAppointmentProviderAssignmentRls.mjs`
- `node supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `node supabase/snippets/testVisitCompletionRls.mjs`
- `node supabase/snippets/testTreatmentPlanReadRls.mjs`
- `git diff --check`

## Next Task

Task 78 should connect `Complete Visit` to the Task 76 retry-safe
finalization contract and add clear failure/retry handling for the case where
clinical completion succeeds but performed-service finalization remains
required. Completed visit read-only service display should follow after that
finalization wiring is in place.
