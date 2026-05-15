# Task 43C - Patient Appointment UI + Follow-up Bridge

Date: 2026-05-15

Status: Completed

## Scope

Task 43C adds the first patient-facing appointment UI in the patient record.

No full calendar, drag/drop scheduling, provider/chair scheduling, recurring appointments, reminders, external calendar sync, automatic visit creation, billing, or treatment plan mutation was added.

## Added Files

- `src/features/patients/PatientAppointmentSummary.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

## Updated Files

- `src/features/appointments/appointmentService.ts`
- `src/features/patients/PatientFollowUpSummary.tsx`
- `src/pages/PatientDetailPage.tsx`

## Patient Appointment Summary

Added a compact appointment summary component for the patient record.

The component shows:

- loading state,
- error state with retry,
- empty state when no upcoming appointment exists,
- next upcoming appointment,
- appointment date/time,
- reason,
- notes,
- status badge,
- count of additional upcoming appointments.

The component uses `fetchUpcomingAppointmentsForPatient(patientId)` and stays in patient context.

## Appointment Creation

Added a lightweight appointment creation form in the patient record.

Fields:

- date,
- time,
- duration,
- reason,
- notes.

Creation behavior:

- creates appointments with default status `scheduled`,
- uses `createAppointment(input)`,
- refreshes the appointment summary after save,
- shows success feedback,
- shows user-friendly failure feedback,
- keeps the user on the patient record.

## Follow-up Bridge

Extended `PatientFollowUpSummary` with a `Schedule appointment` action.

Behavior:

- scrolls/focuses the appointment section,
- prefills appointment reason from the latest follow-up recommendation or next-step label,
- does not mark the UI-only follow-up as handled.

## Status Handling

Added basic status actions for the next upcoming appointment:

- Complete,
- Cancel,
- No-show.

These actions use `updateAppointmentStatus(input)` and refresh the upcoming appointment summary.

## Validation

Created:

- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

The authenticated browser smoke verifies:

- unauthenticated access redirects to login,
- patient with no appointments shows a clean empty state,
- follow-up summary can prefill appointment reason,
- appointment can be created,
- created appointment appears in the patient record,
- refresh keeps the appointment visible,
- status update works and removes completed appointment from upcoming summary.

Passing checks:

- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`
- `node .\supabase\snippets\testAppointmentService.mjs`
- `node .\supabase\snippets\testAppointmentsRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`

## Known Limitations

- No full calendar page.
- No provider, chair, or resource scheduling.
- No recurring appointments.
- No reminders or notification workflow.
- No Google/Outlook calendar sync.
- No automatic appointment-to-visit conversion.
- Follow-up bridge only prefills scheduling context; it does not persist a handled follow-up state.
