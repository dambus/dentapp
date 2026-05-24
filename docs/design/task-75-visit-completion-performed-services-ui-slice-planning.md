# Task 75 - Visit Completion Performed Services UI Slice Planning

This task reviews the Task 73 schema/RLS foundation, the Task 74 service layer,
and the existing Visit Completion flow to define the smallest safe performed-
services UI integration slice. It does not change runtime behavior.

## Reviewed Sources

- `docs/design/task-72-performed-services-foundation-planning.md`
- `docs/design/task-73-service-catalog-performed-services-schema-rls.md`
- `docs/design/task-74-performed-services-service-layer.md`
- `supabase/migrations/20260524190000_create_service_catalog_and_performed_services.sql`
- `src/features/performed-services/performedServicesService.ts`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/features/visits/visitCompletionService.ts`
- `src/pages/PatientVisitDetailPage.tsx`
- `src/features/patients/PatientVisitTimeline.tsx`
- `supabase/snippets/testPerformedServicesRls.mjs`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

## Task 74 Behavior Review

Task 74 behavior is directionally correct for the intended model:

- draft `performed_services` rows are created by
  `createPerformedService(input)` or by
  `replaceDraftPerformedServicesForVisit(input)`;
- Save Draft should persist performed-service rows only after a visit draft ID
  exists;
- reopening an open visit can reload rows with
  `fetchPerformedServicesForVisit(visitId)`;
- `replace draft` archives only non-archived rows where:
  - `visit_id` matches,
  - `patient_id` matches,
  - `clinic_id` matches the current profile,
  - `status = 'draft'`,
  - `deleted_at is null`;
- replacement does not touch finalized, corrected, voided, or already archived
  performed-service rows;
- completing a visit should finalize draft performed-service rows after the
  clinical visit row has moved to `completed`;
- finalized performed-service rows become protected from normal updates by the
  Task 73 trigger;
- no ledger, payment, commission, treatment-plan mutation, appointment
  lifecycle mutation, operational-state mutation, provider-assignment mutation,
  or `visits.completed_by` mutation happens through performed-services methods.

### Atomicity Finding

The current Task 74 service layer does not make clinical completion and
performed-service finalization atomic. That is expected because Task 74 added
separate service methods, not a database RPC transaction or Visit Completion
orchestrator.

Current safe sequence for the future UI task:

1. save or update the visit draft through existing Visit Completion service;
2. replace draft performed services for the open visit;
3. on completion, call existing `completeVisit(...)`;
4. only after the visit is completed, call
   `finalizePerformedServicesForVisit(...)`.

Failure implications:

- if draft performed-service replacement fails during Save Draft, the UI should
  report that chargeable services were not saved and should not show a saved
  performed-service confirmation;
- if clinical completion fails, performed-service rows should remain draft rows
  linked to the open visit;
- if clinical completion succeeds but performed-service finalization fails, the
  visit is clinically completed while chargeable rows may remain draft. The UI
  must not silently report complete financial finalization in this state;
- if finalization succeeds but the later appointment status update or audit
  write warns, the performed services are already finalized and should be shown
  as finalized.

This is not a Task 74 defect, but the next implementation must make the
sequencing explicit. The smallest safe UI task should keep the user on the
completion result screen with a warning and retry path if service finalization
fails after clinical completion. A later database RPC can make this fully
transactional if the pilot workflow requires it.

No separate pre-UI correction task is required before wiring, provided Task 76
implements this sequencing and failure handling in the UI/service orchestration.

## Placement Decision

Choose a new separate `Services & Charges` step before review.

Rejected placements:

- inside the existing procedures step:
  - too easy to confuse clinical procedures with financial charge rows;
  - assistant can currently edit procedures but cannot access performed-service
    financial rows;
  - procedure rows use free-text quantity/duration, while services require
    numeric quantity and price snapshots.
- review step only:
  - too late for data entry;
  - review should summarize, not become the first place where chargeable rows
    are created.
- completed-visit-only entry:
  - pushes charge entry after the clinical flow and increases the chance that
    charges are forgotten.

Recommended Visit Completion steps after implementation:

1. Plan
2. Done
3. Services & Charges
4. Notes
5. Next
6. Review

The step label should avoid payment wording. Use `Services & Charges`, not
`Billing`, `Payment`, `Invoice`, or `Balance`.

## Minimum Entry Form

Expose only the fields needed to create reliable MVP performed-service rows.

Required visible fields:

- service selection from active catalog;
- quantity;
- unit price;
- credited provider;
- optional tooth/region.

Automatically derived and snapshotted:

- `service_id` from selected catalog item;
- `service_name_snapshot` from selected catalog item;
- `service_code_snapshot` from selected catalog item when present;
- `service_category_name_snapshot` from selected catalog item category when
  present;
- `currency` from catalog item, falling back to `RSD`;
- `discount_amount = 0`;
- `final_amount = quantity * unit_price_amount`.

Editable in MVP:

- quantity;
- unit price amount;
- credited provider;
- tooth/region.

Not exposed in the first slice:

- discount amount;
- manual free-text service name without catalog selection;
- treatment-plan item link;
- explicit visit-procedure link picker;
- correction/void controls;
- payment collection;
- ledger posting;
- commission settings;
- materials or inventory consumption.

Reasoning:

- catalog selection keeps the first UI slice constrained and avoids ad hoc
  service labels before catalog administration exists;
- unit price must be editable for authorized roles because catalog price is only
  a default/reference value;
- the edited unit price becomes the persisted snapshot and historical financial
  truth;
- discount is deferred because field-level pricing authority is not yet
  implemented and discounts need policy;
- treatment-plan links and procedure links are useful later but would add
  mapping complexity before the first chargeable flow is proven.

## MVP User Flow

Recommended flow:

1. User enters clinical procedures in the existing `Done` step.
2. User opens the new `Services & Charges` step.
3. The UI loads active catalog services and credited provider options.
4. User selects a catalog service.
5. The row snapshots service label/code/category and currency from the catalog.
6. The default unit price appears and may be edited by authorized roles.
7. User enters quantity.
8. User chooses credited provider.
9. Optional tooth/region can be entered directly.
10. User adds one or more performed-service rows or leaves the section empty.
11. Save Draft saves the clinical draft, then replaces draft performed-service
    rows for that visit.
12. Reopening the visit loads the clinical draft and existing draft performed
    services.
13. Review shows a read-only chargeable-service summary and total.
14. Complete Visit saves latest clinical and performed-service drafts, completes
    the clinical visit, then finalizes performed services.
15. Completion success copy must say charges were recorded, not that payment was
    received.

Completion should be allowed with no performed services.

Reasons:

- consults, emergency checks, follow-ups, or no-charge visits may be clinically
  valid;
- blocked financial roles should still be able to complete clinical workflows
  according to current Visit Completion policy;
- payment and ledger are not implemented, so a no-service visit should not
  force fake financial data.

## Role Behavior

Use Task 73 RLS as the product boundary.

### `owner_admin`

- Can see the `Services & Charges` step.
- Can load catalog options.
- Can create/replace draft performed-service rows.
- Can finalize performed services on completion.
- Can see charge amounts and totals.

### `doctor`

- Same MVP behavior as `owner_admin`.
- Can select credited provider from active same-clinic doctor/specialist
  options.
- Can edit unit price in MVP.

### `specialist`

- Same MVP behavior as doctor.

### `reception_admin`

- Can read performed services under Task 73 RLS.
- Cannot create or replace draft performed services.
- Current Visit Completion write access is limited, so this role should not get
  performed-service entry controls in Visit Completion.
- Future ledger/payment workflows may use read-only charge display.

### `assistant`

- Can currently participate in clinical Visit Completion but cannot read or
  write performed-service financial rows.
- The `Services & Charges` step should show a compact permission notice, not
  financial rows or prices.
- Assistant should be able to continue clinical Save Draft / Complete Visit
  without performed-service data.
- Do not expose pricing through catalog fallbacks or alternate local state.

### `inventory_responsible`

- Should not access Visit Completion performed-services UI.
- No catalog, price, performed-service, payment, or commission data should be
  exposed.

## Completed Visit Read-Only Visibility

Keep the first implementation slice focused on Visit Completion entry,
draft reload, review, and finalization.

Include in the first slice:

- Visit Completion `Services & Charges` entry step;
- Visit Completion review summary;
- post-completion state showing whether performed services were finalized.

Defer broader read-only display to the next task:

- completed visit detail chargeable-service section;
- patient timeline charge summary;
- patient overview latest chargeable services.

Reasoning:

- completed visit detail and timeline currently display clinical procedures and
  follow-up guidance only;
- adding financial read-only display changes role visibility surfaces and
  browser smoke scope;
- the first UI slice should prove draft/save/finalize behavior before adding
  additional display surfaces.

## Ledger And Payment Boundary

The UI must preserve these statements:

- performed services record chargeable services rendered;
- no payment is collected in Visit Completion;
- no invoice is created;
- no fiscalization occurs;
- no patient balance is calculated;
- no ledger posting is created;
- no doctor commission is calculated.

Recommended wording:

- `Chargeable services`
- `Recorded charges`
- `Service total`
- `No payment recorded in this step`

Avoid:

- `Paid`
- `Payment received`
- `Balance updated`
- `Invoice created`
- `Commission calculated`

## Failure Handling Requirements

Save Draft failure cases:

- if clinical draft save fails, do not attempt performed-service replacement;
- if performed-service replacement fails, keep clinical draft saved but show a
  warning that chargeable services were not saved;
- preserve unsaved service rows in UI state so the user can retry.

Complete Visit failure cases:

- if latest clinical draft save fails, do not finalize performed services;
- if performed-service draft save fails before clinical completion, do not
  complete the visit;
- if clinical completion fails, keep service rows draft;
- if clinical completion succeeds and performed-service finalization fails,
  show a completion warning and a retry finalization action;
- do not navigate away automatically after a finalization failure;
- do not imply payment, ledger, or commission side effects.

## Test Plan For Future UI Implementation

Browser smoke coverage should verify:

- service catalog loads active catalog items in Visit Completion;
- inactive/archived services are not selectable;
- credited provider options load from the existing provider read path;
- adding a service row populates service snapshot defaults;
- quantity and unit price update the calculated total;
- credited provider is required before saving a non-empty service row;
- removing a service row works and does not leave stale draft rows;
- Save Draft persists performed-service rows after the visit draft exists;
- reloading an open visit restores draft performed-service rows;
- catalog price changes after save do not alter displayed draft snapshots;
- Complete Visit finalizes performed-service rows after clinical completion;
- completion with no performed services is allowed;
- assistant can complete clinical visit without seeing pricing or financial
  performed-service rows;
- reception does not get Visit Completion entry controls;
- performed-service finalization failure is surfaced and does not silently
  report full success;
- no payment, ledger, balance, invoice, commission, material, or treatment-plan
  mutation UI appears;
- responsive layout has no horizontal overflow at the existing smoke widths.

RLS/data coverage should remain anchored in
`testPerformedServicesRls.mjs` and should continue to verify:

- same-clinic isolation;
- role read/write boundaries;
- snapshot persistence;
- provider attribution enforcement;
- finalized-row immutability;
- no mutation of appointment lifecycle status, appointment operational state,
  assigned provider, `visits.completed_by`, or `visit_procedures`.

Regression coverage should include:

- existing clinical procedures save/reload/complete behavior;
- appointment lifecycle actions;
- appointment operational-state display and correction behavior;
- provider assignment display;
- treatment-plan read-only entry points;
- completed visit detail and patient timeline clinical surfaces.

## Implementation-Ready Task Split

### Task 76 - Visit Completion Performed Services UI Wiring

Recommended scope:

- add the `Services & Charges` step;
- load active catalog and credited provider options;
- manage performed-service draft rows in Visit Completion local state;
- save performed-service drafts after clinical draft save;
- reload draft performed services for open visits;
- show review summary and total;
- finalize performed services after clinical completion;
- handle partial/finalization failure explicitly;
- keep completed visit detail, patient timeline, patient overview, ledger,
  payments, commissions, treatment-plan mutation, and material usage out of
  scope.

### Task 77 - Completed Visit Performed Services Read-Only Display

Recommended scope:

- show finalized performed services on completed visit detail for allowed roles;
- optionally show concise chargeable-service summary on patient timeline;
- keep patient overview and ledger/balance out unless explicitly reviewed.

### Task 78 - Patient Ledger Planning

Recommended scope:

- decide immutable charge posting timing;
- decide payment allocation and correction behavior;
- decide read visibility and balance wording.

## Decision Summary

- Task 74 service behavior is usable for UI integration.
- No service-layer defect was found that requires a code correction before UI
  work.
- The first UI slice should add a separate `Services & Charges` step in Visit
  Completion.
- MVP entry should require catalog service, quantity, unit price, and credited
  provider, with discount/treatment-plan/procedure linking deferred.
- Completion without performed services should remain allowed.
- Assistant should see no financial performed-service rows or pricing and
  should continue clinical workflow without performed-service entry.
- Clinical completion and performed-service finalization are not currently
  atomic; the next task must handle finalization failure explicitly.
