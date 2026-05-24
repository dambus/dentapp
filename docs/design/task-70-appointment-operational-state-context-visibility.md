# Task 70 - Appointment Operational State Context Visibility

This task completes display-only operational state visibility across patient and
clinical handoff surfaces.

## Surfaces Updated

### Patient Appointment Summary

`PatientAppointmentSummary` already renders the next appointment through the
shared compact `AppointmentCard`. Because Task 69 added the operational badge
to `AppointmentCard` and hides operational actions in compact mode, the patient
appointment summary now shows:

- `Not arrived`
- `Arrived`
- `Ready for doctor`

No `Mark arrived` or `Ready for doctor` mutation actions were added to this
surface.

### Patient Today / Active Workflow

Updated `src/features/patients/PatientTodayPanel.tsx`:

- shows the operational state badge for the scheduled today appointment;
- keeps the badge display-only;
- avoids showing operational readiness for terminal non-scheduled appointment
  states.

### Visit Completion Context

Updated `src/features/visits/VisitCompletionFlow.tsx`:

- shows `Operational state` in the linked appointment context when the linked
  appointment is still scheduled;
- keeps `Assigned provider` as a separate field;
- does not gate or alter Start, Continue, Save Draft, or Complete Visit
  behavior;
- does not write appointment operational state from Visit Completion.

## Smoke Coverage

Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`:

- preserves Task 69 operational progression coverage;
- verifies patient appointment summary display-only operational state;
- verifies Patient Today / Active Workflow display-only operational state;
- verifies Visit Completion appointment context displays operational state;
- verifies assigned provider remains separate in Visit Completion context;
- verifies operational actions remain hidden for ineligible appointment
  contexts;
- keeps responsive overflow and appointment menu geometry coverage.

The smoke uses a dedicated Task 70 today appointment fixture for the demo-slug
patient so the Today panel assertion is deterministic and does not collide with
cancel/no-show status fixtures.

## Boundaries

No schema, migration, RLS, operational mutation, operational filter, Start visit
readiness gate, reverse/correction UI, waiting queue, room/chair assignment,
analytics, provider workload, availability logic, automatic assignment,
billing, materials, attachments, payments, treatment-plan mutation, reminders,
tasks, or broad redesign were added.
