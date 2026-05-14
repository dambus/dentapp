# Task 37 — Visit Completion Prototype

Status: Completed

## Goal

Create the first usable prototype workflow for completing a dental visit. The
workflow is intentionally clinical and guided rather than a generic admin form.
It does not persist visit completion data yet.

## UX Architecture Decision

Visit Completion uses a route-based focused workflow, not a classic modal and
not an all-sections admin module.

The route remains:

- `/patients/:patientId/visit-completion`

The screen should feel like:

> Now you are completing this visit. DentApp will guide you through it.

It should not feel like:

> Here is another admin module with many fields.

Reasons:

- better browser back/refresh behavior,
- easier future draft persistence,
- easier testing,
- better mobile/tablet layout,
- less nested modal complexity,
- better long-term maintainability.

Modal/dialog patterns should be reserved for final confirmation, discard
warning, or small decisions. Complex clinical workflows should use dedicated
routes with compact context, stepper navigation, review, confirmation, and
success states.

## Current Model Findings

### Appointment model / demo data

- There is no implemented appointment table, appointment service, or appointment
  route yet.
- Patient context currently exposes `nextAppointment` on `DemoPatient`.
- `PatientTodayPanel` uses `nextAppointment` as appointment context and clearly
  labels scheduling as pending.
- Calendar remains a placeholder page for future scheduling.

### Visit model

- There is no implemented visits table, visit service, visit route, or visit
  completion status model.
- `clinical_notes.visit_id` exists as a nullable UUID placeholder in the initial
  patient migration, but it has no foreign key because visits are out of scope.
- Technical docs already list future appointments and visits as planned schema
  areas.

### Patient detail page

- `PatientDetailPage` loads a patient through `getPatientById(patientId)`.
- It renders `PatientSnapshot`, `PatientTodayPanel`, `PatientQuickActions`, and
  `PatientFullRecord`.
- Current page behavior includes archive/restore, medical record edit
  navigation, and section switching for clinical notes, odontogram, and
  treatment plans.

### PatientSnapshot

- `PatientSnapshot` is the high-priority clinical context block.
- It shows identity, age/date of birth, status, archived state, allergies,
  medical warnings, important note, active plan, last clinical note, next step,
  last visit, contact, and financial placeholder visibility.
- Task 37 reuses the same data points in a compact visit-specific context
  inside the prototype instead of embedding the full snapshot with lifecycle
  actions.

### PatientTodayPanel

- `PatientTodayPanel` displays the current planned work and next-step context.
- It now links to the Visit Completion prototype when the patient is not
  archived.
- The panel still does not create appointments, visits, payments, materials, or
  clinical entries.

### PatientQuickActions

- `PatientQuickActions` was previously showing Complete Visit as a planned
  disabled action.
- Task 37 changes Complete Visit to an available prototype action for
  `owner_admin`, `doctor`, `specialist`, and `assistant`.
- Archived patients keep the same disabled/restore-first behavior.

### Current routing

- Added patient-scoped prototype route:
  `/patients/:patientId/visit-completion`
- Added helper:
  `getPatientVisitCompletionPath(patientId)`
- Route access is limited to `owner_admin`, `doctor`, `specialist`, and
  `assistant`.

### UI primitives reused

- `Page`
- `PageHeader`
- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Badge`
- `Button`
- `InlineNotice`
- `MetricTile`
- `TextInput`
- `Textarea`
- `Select`
- `FieldLabel`

### Existing clinical components and records

- Clinical notes CRUD exists as an inline patient detail section.
- Odontogram tooth status foundation exists as an inline section.
- Treatment plan foundation exists as an inline section.
- Documents are still placeholders.
- There is no performed procedures table, visit completion model, billing,
  payment, material usage, commission, or attachment storage workflow.

## Real Data vs Prototype State

### Real/current data

- Patient identity and contact data.
- Patient age/date of birth.
- Patient status and archived state.
- Medical warnings, allergies, and important note.
- Last visit summary and last clinical note summary.
- Active treatment plan label and summary.
- Next recommended step.
- `nextAppointment` patient field as appointment context.

### Prototype/local state

- Performed procedure rows.
- Procedure tooth/region, quantity/duration, and procedure note.
- Clinical note text entered on the visit completion page.
- Recommendation / next instruction text.
- Selected next step.
- Follow-up suggestion placeholder behavior.
- Completion readiness.
- Confirmation state.
- Success/completed state.

No prototype state is written to Supabase, localStorage, or the demo patient
array.

## UX Flow

1. Open Visit Completion from patient quick action or Today appointment context.
2. Show compact patient and visit context.
3. Show a clear stepper.
4. Review planned reason/treatment.
5. Add performed procedures.
6. Add clinical notes.
7. Choose next step.
8. Show optional follow-up suggestion placeholder when a follow-up style next
   step is selected.
9. Review completion summary.
10. Confirm completion.
11. Show local success state.

Each step should answer:

- What am I doing now?
- What information do I need right now?
- What is the next safe action?

## Responsive Behavior

### Mobile

- Uses a single-column layout.
- Patient and visit context is compact at the top.
- The current workflow step is the main visible task.
- Back / Next / Complete actions are clear and touch-friendly.
- Confirmation appears as an explicit card before the success state.

### Tablet / Desktop

- Uses a focused centered workflow width.
- Compact context remains visible above the stepper.
- The main card shows one task at a time instead of a dense two-column form.

## Implementation Decisions

- Kept the prototype patient-scoped rather than appointment-scoped because no
  appointment entity exists yet.
- Used local React state for completion details because there is no visit schema
  or service yet.
- Reused current patient fields to build clinical hierarchy without pretending a
  real visit record exists.
- Added a compact patient context rather than full `PatientSnapshot` because the
  full component includes patient lifecycle and record actions that are not part
  of closing a visit.
- Refactored the prototype into a stepper workflow so only one main task is
  visible at a time.
- Kept the workflow route-based for browser navigation, future draft
  persistence, and testing.
- Added a clearly labeled attachments placeholder because file storage is not
  implemented for visit records.
- Added confirmation and success state without backend mutation.

## Validation

Completion is allowed when at least one of these exists:

- one performed procedure row with any entered content,
- a clinical note,
- a selected next step.

If none exists, the page shows an `InlineNotice` explaining what is needed.
The dentist can still complete a simple visit quickly by entering only the
minimum clinically relevant information.

## Backend / Schema Follow-up

Future backend work should include:

- appointments table and appointment status model,
- visits table with visit completion status,
- performed procedures table linked to visit and patient,
- clinical notes linked to visit with real foreign keys,
- treatment plan and treatment plan item linkage,
- follow-up recommendation model,
- appointment follow-up creation workflow,
- attachment/photo/document linkage to visit records,
- audit trail/history for visit completion and edits,
- role and permission rules for draft, complete, reopen, and amend actions,
- optional billing/payment/material/commission integration after the clinical
  completion workflow is stable.

## Files Added or Changed

- `src/pages/VisitCompletionPage.tsx`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/features/visits/VisitCompletionSummary.tsx`
- `src/routes/routePaths.ts`
- `src/routes/AppRoutes.tsx`
- `src/routes/routeAccessConfig.ts`
- `src/pages/PatientDetailPage.tsx`
- `src/features/patients/PatientQuickActions.tsx`
- `src/features/patients/PatientTodayPanel.tsx`
- `docs/design/task-37-visit-completion-prototype.md`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`

## Follow-up

- Persist visit completion data.
- Connect performed procedures to treatment plan items.
- Connect follow-up workflow to appointments.
- Add attachments/photos.
- Add audit/history trail.
