# Task 51 - Appointment Creation / Status Polish

Date: 2026-05-15

Status: Completed

## Scope

Task 51 polishes appointment creation, validation, status changes, and user feedback across the existing appointment workflow.

No full calendar, drag/drop scheduling, provider/chair scheduling, conflict detection, appointment editing, appointment deletion, reminders, external calendar sync, billing, or analytics was added.

## Updated Files

- `src/features/appointments/appointmentService.ts`
- `src/features/patients/PatientAppointmentSummary.tsx`
- `src/pages/AppointmentDetailPage.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`

## Creation Validation

Appointment creation now handles:

- missing date,
- missing time,
- invalid duration/end time,
- appointment end before start,
- reason longer than 160 characters,
- notes longer than 500 characters,
- whitespace-only reason/notes through service-side trimming.

The service exposes shared limits:

- `APPOINTMENT_REASON_MAX_LENGTH`
- `APPOINTMENT_NOTES_MAX_LENGTH`

## Creation UX

The patient appointment form now:

- disables fields while saving,
- uses a synchronous submit guard to prevent rapid double-submit duplicates,
- shows short success/failure feedback,
- resets only after successful creation,
- preserves follow-up reason prefill behavior,
- keeps the user in patient context after creation.

## Status UX

Appointment detail now supports polished status actions for scheduled appointments:

- Complete,
- Cancel,
- No-show.

Status actions:

- disable while an update is running,
- prevent duplicate status updates,
- show success/failure feedback,
- refresh local appointment state,
- remove Start visit once the appointment is no longer scheduled.

## Status Rules

The appointment module keeps the same eligibility rules:

- only `scheduled` appointments can start a visit,
- `cancelled`, `completed`, and `no_show` appointments cannot start a visit,
- patient upcoming summary shows only future scheduled appointments,
- completed appointments can still link to a completed visit when available,
- cancelled/no-show appointments do not appear as active next appointments.

## Browser Smoke Coverage

Updated:

- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

The smoke now verifies:

- missing date validation,
- missing time validation,
- valid appointment creation,
- rapid double-submit creates only one appointment,
- cancelled appointment detail hides Start visit,
- scheduled appointment can still start Visit Completion,
- completed linked appointment hides Start visit,
- appointment detail still works.

Existing smoke coverage remains:

- patient appointment empty state,
- follow-up prefill,
- appointment create and refresh,
- Day/Week schedule views,
- appointment detail from schedule,
- appointment-to-visit bridge,
- completed visit detail,
- print action,
- normal Visit Completion without appointment context.

## Validation

Passing checks:

- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`
- `node .\supabase\snippets\testAppointmentService.mjs`
- `node .\supabase\snippets\testAppointmentsRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`

## Known Limitations

- No appointment editing.
- No appointment deletion.
- No schedule-page appointment creation.
- No conflict detection.
- No provider/chair/resource scheduling.
- No recurring appointments.
- No reminders or external calendar sync.
