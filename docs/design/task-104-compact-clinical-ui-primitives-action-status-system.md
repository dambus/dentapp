# DentApp Task 104 - Compact Clinical UI Primitives / Action and Status System

## 1. Relationship To Task 103

Task 103 selected a denser, summary-first clinical pilot direction for Patient
Workspace and related pilot surfaces. Task 104 does not implement that main
information-architecture restructure. It creates the shared compact action,
status, back-navigation, and local section-navigation foundation that later
tasks can apply across Patient Workspace, Treatment Plan, Timeline,
appointment/rebooking, Visit Completion, and secondary interaction surfaces.

The product-owner clarification is adopted as a hard requirement: this compact
design language must eventually apply to visible and hidden pilot surfaces,
including forms, confirmations, overflow menus, and empty/loading/error states.

## 2. Repository Audit Summary

### Shared primitives inspected

- `src/components/ui/Button.tsx`
- `src/components/ui/ButtonLink.tsx`
- `src/components/ui/IconButton.tsx`
- `src/components/ui/buttonStyles.ts`
- `src/components/ui/Badge.tsx`
- `src/components/ui/StatusBadge.tsx`
- `src/components/ui/TypeBadge.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/InlineNotice.tsx`
- `src/components/ui/FormControls.tsx`
- `src/components/ui/ActionMenu.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/LoadingState.tsx`
- `src/components/ui/ErrorState.tsx`
- `src/components/layout/PageHeader.tsx`

### Pilot surfaces inspected

- `src/pages/AppointmentsPage.tsx`
- `src/features/appointments/AppointmentCard.tsx`
- `src/pages/AppointmentDetailPage.tsx`
- `src/pages/PatientDetailPage.tsx`
- `src/features/patients/PatientSnapshot.tsx`
- `src/features/patients/PatientTodayPanel.tsx`
- `src/features/patients/PatientQuickActions.tsx`
- `src/features/patients/PatientFullRecord.tsx`
- `src/features/patients/TreatmentPlansSection.tsx`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/features/visits/VisitCompletionSummary.tsx`
- `src/pages/VisitCompletionPage.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

### Planning/documentation sources inspected

- `docs/design/task-95-pilot-clinical-flow-ui-ux-restyling-foundation-planning.md`
- `docs/design/task-96-treatment-plan-creation-edit-pilot-workflow-finalization.md`
- `docs/design/task-103-patient-workspace-information-architecture-compact-clinical-design-system-plan.md`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`
- `docs/07_execution/implementation_roadmap.md`
- `docs/02_product/feature_backlog.md`
- `docs/02_product/roadmap.md`

## 3. Button / Action Hierarchy

### Primary action

Use for the single dominant workflow action in a local context.

Examples:

- `Start visit`
- `Continue visit`
- `Complete visit`
- `Save treatment plan`
- `Schedule appointment`

Rules:

- one visibly dominant primary action per local panel/card/form footer;
- not for back navigation;
- not for infrequent admin actions.

### Secondary action

Use for important but non-dominant actions.

Examples:

- `View appointment`
- `View treatment plan`
- `Save draft`
- `Edit medical record`

### Tertiary / text action

Use for lightweight navigation and supporting actions.

Examples:

- `View full record`
- `Open timeline`
- `Cancel` where it is not destructive data removal

### Icon / overflow action

Use for actions that should not compete with clinical workflow.

Examples:

- edit patient demographics;
- archive/restore paths;
- item-level contextual actions;
- secondary appointment lifecycle actions.

Rules:

- icon-only triggers require accessible labels;
- required clinical actions stay visible;
- destructive menu items remain visually distinct.

### Destructive action

Use sparingly and generally through overflow or confirmation paths, not as the
dominant visible action.

## 4. Button Density Decisions

### Shared primitive changes implemented

- tightened shared button padding while keeping `36px`, `40px`, and `44px`
  minimum heights for `sm`, `md`, and `lg`;
- added a dedicated `tertiary` action variant for quiet text-style actions;
- quieted the default overflow trigger treatment;
- added a dedicated `navigation` slot to `PageHeader` so back navigation does
  not compete with page actions.

### Migration guidance

- one primary action per local context;
- demote administrative actions to secondary, tertiary, or overflow;
- avoid equal-weight button stacks unless the mobile workflow genuinely needs them.

## 5. Badge / Status Mapping

### Critical medical / safety alert

Use `InlineNotice` or an alert panel, not casual pills.

Examples:

- allergies;
- medical warnings;
- urgent clinical notes.

### Workflow / action-required status

Use compact emphasis only where scan value is real.

Examples:

- visit in progress;
- ready for doctor;
- needs one entry;
- draft loaded.

### Lifecycle / operational state

Use compact badges only when they improve scanning.

Examples:

- scheduled;
- arrived;
- ready for doctor;
- completed;
- cancelled;
- no-show;
- archived.

### Neutral metadata

Prefer muted text instead of colored pills.

Examples:

- data source mode;
- created date;
- item count;
- role-neutral descriptive context.

### Technical / demo / admin-only metadata

Avoid first-read visual emphasis on ordinary product-facing surfaces. Task 104
does not remove this broadly, but it documents the migration target and applies
it in the bounded patient detail slice.

## 6. Icon Language

Existing icon library remains `lucide-react`.

Approved initial usage:

- `ChevronLeft` for back navigation;
- `MoreHorizontal` for overflow;
- contextual edit/archive/restore icons inside overflow;
- existing schedule/clinical icons where they reinforce a major action.

Rules:

- icons supplement labels;
- critical actions remain label-first;
- avoid decorative icon clutter.

## 7. Back-Navigation Pattern

Task 104 adds a reusable `BackLink` primitive:

- text-style, not boxed;
- left-chevron plus label;
- visible keyboard focus;
- can render as a button or route link.

Validation slice applied now:

- Patient Workspace header uses `BackLink` for `Back to patients`.

## 8. Patient Section Navigation Primitive

Task 104 adds reusable `SectionTabs`:

- compact active/inactive states;
- horizontal overflow support;
- `tablist` / `tab` semantics;
- compatible with the existing state/query-param model.

Validation slice applied now:

- desktop Patient Full Record section switching now uses `SectionTabs`;
- mobile keeps the existing `select` control and stable selector
  `data-testid="patient-section-selector"`.

Task 104 does not move content into the future Task 105 patient-level IA yet.

## 9. Form And Secondary Interaction Migration Rules

These are the explicit target for Tasks 105-107.

### Appointment creation / rebooking

- keep labels visible;
- one primary submit action;
- quiet cancel/back actions;
- compact grouping for common daily-use fields;
- inline validation remains obvious.

### Treatment plan mutation forms

- one primary save action per form;
- `Cancel` stays quieter than save;
- archive actions remain separate from ordinary edit/save paths.

### Visit Completion forms

- keep the main progression action dominant;
- back, save-draft, and review actions remain secondary;
- warning/validation stays in notices, not pills.

### Confirmations and menus

- destructive actions remain in overflow or explicit confirmations;
- required workflow actions should not move into overflow.

### Empty / loading / error states

- keep them compact and direct;
- use a single clear recovery action where relevant;
- avoid large descriptive blocks by default.

## 10. Bounded Runtime Application Completed In Task 104

### Shared foundation completed

- compacted shared button density and added `tertiary` styling;
- compacted shared badge sizing;
- added reusable `BackLink`;
- added reusable `SectionTabs`;
- extended `PageHeader` with a separate navigation slot.

### Runtime consumers updated now

- `src/pages/PatientDetailPage.tsx`
  - uses text-style back navigation in the header;
  - removes the duplicated boxed back action from header actions.
- `src/features/patients/PatientSnapshot.tsx`
  - reduces competing visible actions;
  - keeps `Edit medical record` visible as secondary;
  - moves infrequent patient admin actions into overflow;
  - keeps restore visible for archived patients;
  - demotes data-source metadata to muted text;
  - renders warning details inside the safety panel as alert rows rather than warning pills.
- `src/features/patients/PatientFullRecord.tsx`
  - replaces the desktop section button row with reusable compact section tabs;
  - preserves mobile selector, section state, query-param behavior, and stable selectors.

### Why this bounded rollout was selected

- Patient Detail already contains the key patterns later tasks need:
  back navigation, patient actions, admin overflow, safety alert treatment, and
  local section navigation.
- The slice proves the shared system works without restructuring Overview,
  Timeline, Treatment Plan, or appointment forms yet.

## 11. Deferred Application Scope For Tasks 105-107

### Task 105

- Patient Workspace overview shortening;
- patient-level Overview / Record / Treatment Plan / Timeline / Odontogram /
  Documents navigation;
- compact persistent patient header applied more broadly;
- workflow-shortcuts removal from the default overview.

### Task 106

- compact detailed Treatment Plan presentation;
- compact detailed Timeline presentation;
- reduced repeated badge emphasis in those detailed modules.

### Task 107

- appointment creation and rebooking forms;
- treatment-plan create/edit/item forms;
- Visit Completion forms and action bars;
- confirmations, overflow menus, empty/loading/error states, and other
  secondary actions across the pilot path.

## 12. Validation

### Automated validation

- `npm.cmd run build` passed with the existing Vite large chunk warning.
- `npm.cmd run lint` passed.

### Responsive review target

Task 104 changed patient workspace header/navigation and full-record section
tabs. Responsive verification target remains:

- `390px`
- `768px`
- `1280px`

Checks:

- no horizontal overflow;
- back navigation remains reachable;
- snapshot actions do not crowd the header;
- section navigation remains usable and horizontally scrollable where needed;
- primary clinical actions remain visible.

## 13. Updated Pre-Pilot Sequence

1. Task 104 - Compact Clinical UI Primitives / Action and Status System
2. Task 105 - Patient Workspace Overview and Section Navigation Restructure
3. Task 106 - Treatment Plan and Timeline Compact Detailed Presentation
4. Task 107 - Pilot Forms and Secondary Interaction Consistency Pass
5. Task 108 - Pre-Pilot Visual Consistency Walkthrough
6. Task 109 - Guided In-Clinic Pilot Session Checklist and Observation Log Setup

Do not schedule a guided doctor pilot before Task 108 confirms visual and
interaction consistency, unless the product owner explicitly overrides that
sequence.
