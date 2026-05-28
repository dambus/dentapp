# Task 106 - Treatment Plan and Timeline Compact Detailed Presentation

## 1. Relationship To Tasks 103-105

Task 103 defined the compact Patient Workspace direction and explicitly split
the detailed `Treatment plan` and `Timeline` work into a follow-up task after
the shorter Overview and shared UI primitives were in place.

Task 104 introduced the compact action, badge, navigation, and overflow
patterns that Task 106 now reuses for dense clinical detail.

Task 105 moved full Treatment Plan and Timeline content out of Overview and
into dedicated patient sections. Task 106 keeps that section architecture
intact and only restructures how the detailed content is presented inside those
sections.

## 2. Files Changed

- `src/features/patients/TreatmentPlansSection.tsx`
- `src/features/patients/PatientVisitTimeline.tsx`
- `src/features/patients/PatientFullRecord.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/design/task-106-treatment-plan-timeline-compact-detailed-presentation.md`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`
- `docs/07_execution/implementation_roadmap.md`
- `docs/02_product/feature_backlog.md`

## 3. Treatment Plan Detailed Hierarchy Implemented

The dedicated `Treatment plan` section now reads as a clinical planning
workspace instead of nested generic cards:

- one section-level introduction explains that this is the detailed planning
  workspace;
- one section-level primary action is shown only when appropriate;
- each plan renders with a compact structured header showing plan identity,
  status, item count, summary text, and light metadata;
- plan content flows into a compact `Planned treatments` list instead of large
  panel-inside-panel blocks;
- no finance, pricing, settlement, or performed-service linkage was added.

## 4. Plan-Level Versus Item-Level Action Presentation

Task 106 clarifies action ownership without changing behavior:

- plan-level actions stay in the plan header;
- archive actions moved behind the shared compact overflow menu pattern instead
  of competing with primary actions;
- item-level actions stay on each planned treatment row;
- authorized clinical write roles still reach create, edit, and archive flows
  for both plans and items;
- read-only roles still see the section without mutation controls.

## 5. Timeline Compact List / Event Presentation Implemented

The dedicated `Timeline` section now uses a compact chronological event list:

- a small summary strip gives completed-visit count, procedure count, and most
  recent event context;
- each completed visit renders as a compact event entry with restrained badges,
  concise metadata, short clinical excerpts, and the existing detail action;
- follow-up, recommendation, and next-step information remains available
  without repeating the full record inline;
- completed visit detail access and follow-up scheduling entry points are
  preserved.

## 6. Form Work Intentionally Deferred To Task 107

Task 106 keeps all existing treatment-plan plan/item forms functional and
reachable, but does not perform a broad field-by-field form redesign.

Only the immediate form containers were tightened where necessary so plan and
item mutation flows remain coherent inside the new compact detailed section.
Cross-form consistency, confirmation treatment, and secondary interaction polish
remain part of Task 107.

## 7. Role And Behavior Preservation

Task 106 does not change:

- treatment-plan service contracts;
- persisted fields or validation semantics;
- schema, migrations, RLS, or RPC behavior;
- completed-visit detail meaning or route behavior;
- patient workspace section query/navigation behavior;
- scheduling/rebooking behavior;
- the finance/settlement/payment freeze.

Clinical write controls remain visible only to the existing authorized roles,
while read-only roles remain read-only.

## 8. Responsive Manual Inspection

Manual browser inspection was performed in the authenticated patient workspace
at approximately:

- `390px`
- `768px`
- `1024px`
- `1280px`

Confirmed during inspection:

- Treatment Plan headers remain readable without horizontal overflow;
- plan-level and item-level actions remain reachable and clearly associated;
- create/edit entry states remain usable inside the dedicated section;
- Timeline entries read as compact chronological history rather than large
  dashboard cards;
- `View details` and follow-up actions remain reachable;
- Overview-to-section transitions remain easy through the patient navigation;
- sticky mobile section navigation and `Back to top` remain functional and do
  not cover critical actions;
- no finance, settlement, payment, or balance UI appears.

## 9. Browser Smoke And Regression Validation

Task 106 updates browser smoke assertions to confirm:

- the dedicated Treatment Plan detailed presentation renders inside its section;
- the compact Timeline presentation renders inside its section;
- authorized plan-level and item-level action entry points remain present;
- completed visit detail access remains reachable;
- Overview does not regain the full detailed Treatment Plan or Timeline content.

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

## 10. Deferred Polish Items

- full cross-surface form styling consistency;
- broader secondary interaction consistency for confirmations and action menus;
- any remaining low-priority copy tightening across pilot forms.

These stay with Task 107 or later pilot polish work unless a functional defect
forces earlier change.

## 11. Finance / Settlement Confirmation

Task 106 adds no finance, settlement, payment, balance, invoice, receipt, or
ledger behavior and does not reconnect treatment plans to performed-service or
financial workflows.

## 12. Next Task Recommendation

- `Task 107 - Pilot Forms and Secondary Interaction Consistency Pass`
