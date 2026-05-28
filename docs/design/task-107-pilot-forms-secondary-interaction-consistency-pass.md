# Task 107 - Pilot Forms and Secondary Interaction Consistency Pass

## 1. Relationship To Tasks 103-106

Task 103 required the compact clinical design system to apply not only to the
visible Patient Workspace surfaces, but also to the forms and secondary
interactions used in the real pilot workflow.

Task 104 introduced the shared compact button, badge, navigation, notice, and
form-control foundation.

Task 105 shortened Patient Workspace and moved detailed work behind patient
sections.

Task 106 compacted the dedicated `Treatment plan` and `Timeline` sections.
Task 107 completes that sequence by aligning the forms and transient
interactions opened from those sections and from Visit Completion.

## 2. Forms And Secondary Interactions Audited

- `src/features/patients/PatientAppointmentSummary.tsx`
- `src/features/patients/TreatmentPlansSection.tsx`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/features/visits/VisitCompletionSummary.tsx`
- `src/components/ui/FormControls.tsx`
- `src/components/ui/ActionMenu.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

Audited interaction types:

- patient-context scheduling / rebooking expansion and collapse;
- treatment-plan create/edit item flows;
- plan/item archive actions and confirmation treatment;
- Visit Completion step inputs, action bars, and completion confirmation;
- inline success, warning, and error feedback in the pilot path.

## 3. Appointment / Rebooking Form Changes

The patient-context scheduling form keeps the Task 105 summary-first model, but
now uses clearer compact form grouping:

- a dedicated manual-scheduling header with restrained context badges;
- `Schedule details` and `Provider and context` groups instead of one long flat
  field stack;
- shared compact field hints for provider loading and follow-up prefill text;
- one clear primary submit action with a quieter cancel action;
- preserved summary-state collapse after cancel.

No scheduling behavior, payload, provider rules, linkage, or status logic was
changed.

## 4. Treatment Plan Form And Action Changes

The dedicated Treatment Plan workspace keeps the Task 106 hierarchy and aligns
the mutation surfaces with it:

- plan create/edit forms now have compact headings, mode-specific labels, and
  tighter field guidance;
- item create/edit forms now make ownership explicit by naming the parent plan;
- save actions remain primary and cancel actions are quieter tertiary actions;
- plan/item archive actions remain in overflow menus;
- raw browser confirm dialogs were replaced with inline compact confirmation
  panels tied to the owning plan or item row.

No service contract, persisted field, archive semantic, role rule, audit path,
or RLS behavior changed.

## 5. Visit Completion Alignment Changes

Task 101 already provided the correct workflow structure, so Task 107 stays
limited:

- aligned the Back / Save Draft / Next / Complete action hierarchy with the
  shared compact system;
- quieted secondary return and continue-review actions;
- tightened procedure row containers and note / recommendation / next-step form
  surfaces;
- reused shared field hints for explanatory copy instead of larger standalone
  paragraphs.

No workflow step order, draft save behavior, completion behavior, validation,
or persistence changed.

## 6. Shared Primitive Reuse And Narrow Extension

Task 107 reuses Task 104 primitives and adds only a small shared form layer in
`src/components/ui/FormControls.tsx`:

- `FieldHint`
- `FormActions`
- `InlineConfirm`

The existing shared inputs also received compact-state refinements for disabled,
placeholder, and spacing behavior.

## 7. Notice / Confirmation / Menu Handling

- inline success, warning, and error feedback remains on the page and uses the
  shared restrained notice treatment;
- destructive archive actions remain secondary and menu-driven;
- archive confirmation is now a compact inline panel instead of a browser
  confirm dialog;
- overflow-menu ownership stays explicit for plan-level versus item-level
  actions.

## 8. Behavior And Security Boundaries Preserved

Task 107 does not change:

- appointment persistence, provider assignment, lifecycle, or operational-state
  logic;
- treatment-plan service contracts, fields, archive semantics, or role checks;
- Visit Completion persistence, visit-step model, or completion semantics;
- schema, migrations, RLS, RPCs, or internal-settlement freeze behavior;
- finance, payment, settlement, balance, invoice, receipt, or odontogram scope.

## 9. Responsive Manual Verification Results

Actual browser inspection was performed at approximately:

- `390px`
- `768px`
- `1024px`
- `1280px`

Verified:

- scheduling summary stays collapsed by default and the expanded form remains
  readable;
- scheduling button hierarchy is consistent and the form closes cleanly on
  cancel;
- treatment-plan create/edit surfaces remain compact and readable;
- add/edit item controls remain associated with the correct plan row;
- inline archive confirmation stays clearly attached to the owning plan/item
  instead of feeling global;
- Visit Completion action bars remain reachable on mobile and quieter secondary
  actions no longer compete with the main workflow action;
- no horizontal overflow, clipped controls, or finance/settlement UI appeared
  in the inspected states.

## 10. Smoke / Regression Validation

Validation run:

- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\\supabase\\snippets\\testPatientAppointmentBrowserSmoke.mjs`
- `node .\\supabase\\snippets\\testAppointmentOperationalStateRls.mjs`
- `node .\\supabase\\snippets\\testAppointmentProviderAssignmentRls.mjs`
- `node .\\supabase\\snippets\\testVisitCompletionRls.mjs`
- `node .\\supabase\\snippets\\testTreatmentPlanMutationRls.mjs`
- `node .\\supabase\\snippets\\testTreatmentPlanReadRls.mjs`
- `node .\\supabase\\snippets\\testInternalSettlementFreezeRls.mjs`
- `node .\\supabase\\snippets\\testInternalSettlementFeatureAccessRls.mjs`
- `git diff --check`

Browser smoke was updated to cover the new inline treatment-plan archive
confirmation path while preserving the existing appointment, treatment-plan,
Visit Completion, responsive overflow, and finance-freeze assertions.

## 11. Deferred Items

- broader pilot-path visual polish across planner and secondary detail pages;
- any remaining copy harmonization that does not block workflow coherence;
- final whole-path visual balancing for Task 108.

## 12. Finance / Settlement Confirmation

Task 107 adds no finance, settlement, payment, balance, invoice, receipt, or
service-charge behavior and does not reconnect any pilot form to financial
workflow.

## 13. Exact Recommendation For Task 108

- `Task 108 - Pre-Pilot Visual Consistency Walkthrough`

Run the walkthrough against the now-aligned pilot path with emphasis on
cross-surface rhythm, typography, button hierarchy, spacing continuity, and any
remaining outlier feedback states rather than new feature work.
