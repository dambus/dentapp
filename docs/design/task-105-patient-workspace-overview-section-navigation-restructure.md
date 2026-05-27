# DentApp Task 105 - Patient Workspace Overview and Section Navigation Restructure

## 1. Relationship To Tasks 103-104

Task 103 defined the target patient information architecture: a short Overview,
patient-level section navigation, compact header ownership, reduced shortcut
emphasis, and detail-heavy content moved out of the default workspace view.

Task 104 created the shared compact action/status/navigation primitives and
validated them in a bounded patient-detail slice. Task 105 applies that
foundation to the main Patient Workspace structure without broad form restyling
 or deep Treatment Plan / Timeline redesign.

## 2. Files Changed

- `src/pages/PatientDetailPage.tsx`
- `src/features/patients/PatientSnapshot.tsx`
- `src/features/patients/PatientAppointmentSummary.tsx`
- `src/features/patients/PatientFullRecord.tsx`
- `src/features/patients/patientWorkspaceSections.ts`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/design/task-105-patient-workspace-overview-section-navigation-restructure.md`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`
- `docs/07_execution/implementation_roadmap.md`
- `docs/02_product/feature_backlog.md`

## 3. Final Information Architecture Implemented

Patient Workspace now uses patient-level sections:

- `Overview`
- `Record`
- `Treatment plan`
- `Timeline`
- `Odontogram`
- `Documents`

The default route now lands on `Overview`. Existing query-based deep links for
`section=medical-record`, `section=treatment-plans`, `section=timeline`,
`section=odontogram`, and `section=documents` remain supported. Legacy
`section=clinical-notes` now maps into the `Record` section and scrolls to the
clinical-notes block.

## 4. Header Action-Cluster Decision

The patient header now keeps one stable action ownership area:

- back navigation remains in the header card;
- the overflow trigger stays in the upper-right area across widths;
- the visible `Edit medical record` action remains desktop-only and stays in the
  same cluster as the overflow trigger;
- patient admin actions remain preserved but move into overflow on compact
  widths instead of stacking below the identity block.

This removes the Task 104 drift where actions could visually drop under summary
content at intermediate widths.

## 5. Default Overview Content Map

The default Overview now contains only:

1. compact patient header and safety context;
2. current workflow / today panel;
3. Treatment Plan summary card;
4. next appointment / rebooking summary card;
5. recent clinical activity and follow-up summary.

Removed from default Overview:

- full record detail;
- full Treatment Plan workspace;
- full Timeline;
- detailed odontogram content;
- the large Workflow Shortcuts grid.

## 6. Patient-Level Navigation Implementation

Desktop and tablet use compact `SectionTabs` from Task 104.

Mobile keeps the approved dropdown model through
`[data-testid="patient-section-selector"]`, now placed inside a sticky local
navigation bar so long patient sections can change section without returning to
the top of the workspace.

The section model is centralized in
`src/features/patients/patientWorkspaceSections.ts` so Task 106 and Task 107
can reuse one route/query interpretation layer.

## 7. Mobile Sticky Navigation

Implemented:

- a compact sticky mobile patient section bar below the main patient header;
- the same section selector used for mobile navigation and smoke coverage;
- no duplicate desktop sticky header.

The sticky bar is intentionally minimal and does not add a second set of
competing desktop controls.

## 8. Back-To-Top

Implemented in a bounded way:

- mobile-only floating `Back to top` control;
- appears after meaningful scroll depth;
- uses an explicit accessible label;
- stays separate from the sticky section selector.

This is limited to the patient workspace page and does not alter Visit
Completion or form flows.

## 9. Workflow Shortcuts Removal / Replacement

`PatientQuickActions` is no longer part of the default Overview.

Replacement pattern:

- primary workflow action stays in `PatientTodayPanel`;
- Treatment Plan entry stays in the Treatment Plan summary;
- scheduling/rebooking entry stays in the appointment summary;
- admin and low-frequency patient actions stay in the header overflow.

## 10. Treatment Plan And Rebooking Summary Placement

### Treatment Plan

Overview now shows only the Treatment Plan summary card and routes the user to
the dedicated `Treatment plan` section for detailed create/edit/archive/item
work.

### Rebooking / appointment creation

Overview now shows an appointment summary-first card. The manual scheduling form
is hidden by default and opens only on explicit action or follow-up-prefill
intent. This shortens the default page without changing scheduling logic.

## 11. Behavior Preserved

Preserved:

- patient archive/restore behavior;
- role visibility and permission checks;
- patient medical-record edit behavior;
- current appointment / Start visit / Continue visit / View visit behavior;
- Treatment Plan mutation behavior;
- patient-context appointment creation and rebooking behavior;
- timeline visit highlighting through `visitId`;
- finance/settlement freeze boundaries.

No schema, migration, RLS, RPC, lifecycle, persistence, or service-contract
changes were made.

## 12. Responsive Verification

Automated responsive verification was run through the browser smoke suite across
the patient workspace slice at:

- `390px`
- `768px`
- `1024px`
- `1440px`

Verified:

- stable patient header action cluster;
- mobile section selector reachability;
- Overview shorter than the old stacked patient workspace;
- no horizontal overflow in the responsive patient overview checks;
- no finance/settlement terminology surfaced.

This environment exposed headless browser validation rather than an interactive
GUI browser session, so responsive confirmation was done through the automated
viewport checks rather than separate manual click-through screenshots.

## 13. Browser Smoke Coverage

Updated browser smoke now verifies:

- Patient Overview loads by default;
- patient-level section navigation is reachable;
- mobile section selector updates the `section` query;
- `Record` remains reachable after relocation;
- Workflow Shortcuts are absent from default Overview;
- full record detail is not duplicated inside Overview;
- Treatment Plan mutation flow still works in the dedicated section;
- rebooking and follow-up scheduling remain reachable.

## 14. Deferred To Task 106 And Task 107

### Task 106

- compact detailed Treatment Plan presentation;
- compact detailed Timeline presentation;
- detailed content density inside those dedicated sections.

### Task 107

- appointment creation/rebooking form density;
- Treatment Plan create/edit/item form consistency;
- Visit Completion form/action consistency;
- confirmations, overflow menus, and empty/loading/error consistency across the
  pilot flow.

## 15. Exact Next Recommended Task

Task 106 - Treatment Plan and Timeline Compact Detailed Presentation.
