# Task 47 - Appointment Creation Flow Polish

## Scope

Polished the existing patient-level appointment creation form so it works better
as the destination for follow-up scheduling.

No new appointment route, schema, or automatic scheduling behavior was added.

## Form Behavior

`PatientAppointmentSummary` remains the appointment creation surface.

The form now presents appointment creation more clearly:

- `Create appointment` form title,
- date and time fields first,
- appointment type and duration controls,
- editable reason/context field,
- notes field,
- schedule preview badge,
- `Schedule appointment` submit action,
- `Cancel` action to reset local form state,
- mobile-friendly spacing and full-width tap targets where useful.

Validation still runs before submit and keeps the existing messages for missing
date/time, invalid duration, whitespace-only reason/notes, and length limits.

## Follow-up Prefill Behavior

Follow-up scheduling still routes to:

`/patients/:patientId?scheduleFollowUp=true&reason=...`

The patient detail page scrolls to the appointment form and passes the reason
into `PatientAppointmentSummary`.

The form:

- pre-fills the reason from follow-up guidance,
- shows a `Follow-up context` badge and info notice,
- allows the user to edit the reason,
- avoids overwriting a reason that the user has already changed,
- preserves URL/search-param based prefill behavior on refresh.

No local storage was added.

## Post-create Behavior

After a successful manual submit:

- success feedback remains visible,
- the created appointment is kept in component state,
- a `View appointment` action opens the appointment detail page,
- the upcoming appointment list refreshes through the existing
  `fetchUpcomingAppointmentsForPatient` call.

The daily schedule already loads appointments from the persisted appointment
table by date range, so newly created appointments appear there when the
selected schedule date includes the new appointment.

## Smoke Coverage

The authenticated browser smoke now checks:

- follow-up scheduling opens the appointment form,
- follow-up reason is prefilled,
- the user manually submits appointment creation,
- success feedback includes appointment detail access,
- the created appointment survives refresh and appears in existing patient and
  schedule flows.

## Future Work

Still future scoped work:

- standalone global appointment creation route,
- provider/chair assignment,
- check-in/arrived/in-room states,
- reminders/tasks,
- follow-up ownership/status,
- treatment-plan handoff,
- billing/payments/materials/attachments.
