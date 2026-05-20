# Task 46 - Follow-up Scheduling Entry Point

## Existing Appointment Creation Flow

Appointment creation already exists in the patient detail appointment panel:

- `PatientAppointmentSummary` renders the appointment form.
- `createAppointment` in `appointmentService` performs the explicit create.
- The form supports patient context and reason prefill through component state.

There is no standalone global `new appointment` route. Scheduling still starts
from a patient record.

## Entry Point Added

Added a shared route helper:

- `getPatientFollowUpSchedulingPath(patientId, reason)`

The helper routes to:

`/patients/:patientId?scheduleFollowUp=true&reason=...`

`PatientDetailPage` reads that query, scrolls to the existing appointment panel,
and pre-fills the appointment reason. The user still chooses date/time/type and
submits the existing appointment form manually.

## Surfaces Updated

Added the consistent `Schedule follow-up` action to:

- `PatientFollowUpSummary`,
- completed visit detail `Follow-up Guidance`,
- completed visit timeline follow-up cards,
- completed appointment detail follow-up section.

The patient overview quick action remains the broader appointment/timeline
shortcut because it may appear without a specific follow-up recommendation.

## Mutation Behavior

The new action does not create appointments automatically.

Mutation happens only if the user submits the existing appointment form. No
follow-up status, owner, reminder, task, treatment-plan item, billing item,
material record, attachment, or new schema was added.

## Smoke Coverage

The authenticated browser smoke now verifies:

- the follow-up scheduling action is visible,
- completed visit detail routes to the patient appointment flow,
- the appointment reason is prefilled from the follow-up recommendation,
- patient overview and completed appointment follow-up surfaces still show
  follow-up guidance.

## Future Work

Future scoped work may add:

- standalone appointment creation route,
- follow-up ownership/status,
- reminder/task model,
- provider/chair assignment,
- treatment-plan handoff.

Those are intentionally out of scope for this task.
