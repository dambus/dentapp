# Task 71 - Appointment Operational State Correction

This task adds a narrow correction path for accidental day-of-visit operational
state changes.

## Data Boundary

Task 68 already allowed the required one-step reverse transitions at the
database boundary:

- `arrived` -> `not_arrived`
- `ready_for_doctor` -> `arrived`

No new migration was needed. Existing protections remain in place:

- new appointments must start at `not_arrived`;
- cancelled, no-show, and completed appointments cannot update operational
  state;
- appointments linked to draft, in-progress, or completed Visit Completion
  records cannot update operational state;
- same-clinic role/RLS boundaries remain unchanged;
- `inventory_responsible` remains blocked.

The unsupported direct jump `ready_for_doctor` -> `not_arrived` remains blocked.

## Service/UI Behavior

Forward progression remains the primary visible workflow:

- `Not arrived` shows `Mark arrived`;
- `Arrived` shows `Ready for doctor`;
- `Ready for doctor` has no forward progression action.

Correction is exposed as a secondary action only on eligible active
appointments:

- `Arrived` exposes `Undo arrival`;
- `Ready for doctor` exposes `Move back to arrived`.

Correction actions are available on:

- daily appointment cards, inside the existing secondary appointment action
  menu;
- Appointment Detail, inside the existing secondary appointment action menu.

Correction actions are not added to:

- Patient Today / Active Workflow;
- patient appointment summary;
- Visit Completion context.

Those surfaces remain display-only.

## Feedback

The correction feedback is intentionally distinct from lifecycle wording:

- `Arrival status was corrected.`
- `Appointment moved back to arrived.`

No copy implies cancellation, no-show, visit completion reversal, or provider
assignment changes.

## Test Coverage

`supabase/snippets/testAppointmentOperationalStateRls.mjs` now verifies:

- allowed one-step corrections;
- blocked direct `ready_for_doctor` -> `not_arrived`;
- blocked correction for cancelled, no-show, completed, and Visit
  Completion-linked appointments;
- inventory and cross-clinic blocking remains intact;
- corrections do not alter lifecycle status, assigned provider, or
  `visits.completed_by`.

`supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` now verifies:

- `Mark arrived` -> `Undo arrival` -> `Mark arrived`;
- `Ready for doctor` -> `Move back to arrived` -> `Ready for doctor`;
- correction menu opening does not introduce horizontal overflow at a narrow
  viewport;
- ineligible terminal and Visit Completion-linked appointments do not expose
  correction actions;
- existing Visit Completion and display-only context behavior remains intact.

## Boundaries

No operational state filters, Start visit readiness gates, operational history
timeline, waiting-room dashboard, room/chair assignment, analytics, provider
workload/availability, billing, materials, attachments, payments,
treatment-plan mutation, reminders, tasks, schema changes, or broad UI redesign
were added.
