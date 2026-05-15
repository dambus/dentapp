# Task 44 - Appointment to Visit Workflow Bridge

Date: 2026-05-15

Status: Completed

## Scope

Task 44 adds a lightweight bridge from a scheduled patient appointment into the existing Visit Completion route.

No full calendar, provider/chair scheduling, recurring appointments, reminders, external calendar sync, billing, automatic follow-up handling, treatment plan mutation, visit editing, or appointment conflict detection was added.

## Added Files

- `supabase/migrations/20260515103000_link_visits_to_appointments.sql`
- `docs/design/task-44-appointment-to-visit-workflow-bridge.md`

## Updated Files

- `src/features/patients/PatientAppointmentSummary.tsx`
- `src/pages/VisitCompletionPage.tsx`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/features/visits/visitCompletionService.ts`
- `src/features/appointments/appointmentService.ts`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

## Database

The `visits` table already had a nullable `appointment_id` placeholder.

Added:

- foreign key from `visits.appointment_id` to `appointments.id`,
- `on delete set null`,
- index on `visits.appointment_id`,
- updated column comment for the appointment bridge behavior.

## Start Visit From Appointment

`PatientAppointmentSummary` now shows a `Start visit` action for the next scheduled appointment.

Behavior:

- navigates to the existing patient Visit Completion route,
- passes `appointmentId` as a query parameter,
- keeps the route-based clinical workflow pattern.

## Appointment Context In Visit Completion

`VisitCompletionPage` reads the optional `appointmentId` query parameter and loads the appointment for the current patient.

If appointment context is found, `VisitCompletionFlow` shows a compact appointment context notice with:

- scheduled date/time,
- reason,
- status.

If no `appointmentId` is present, normal ad-hoc Visit Completion remains unchanged.

## Completion Behavior

When a visit is completed with a linked appointment:

- the visit is saved with `appointment_id`,
- the visit is marked `completed`,
- the linked appointment is updated to `completed`,
- the user can return to the patient timeline as before.

If the visit completes but the appointment status update fails, the completed visit is preserved and the UI receives a warning.

## Validation

Updated:

- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

The authenticated browser smoke verifies:

- unauthenticated patient route redirects to login,
- patient with no appointment shows empty appointment state,
- follow-up summary can prefill appointment creation,
- appointment can be created and survives refresh,
- `Start visit` opens Visit Completion with `appointmentId`,
- appointment context notice is visible,
- visit can be completed from the appointment,
- completed visit is linked to the appointment in the database,
- appointment status is `completed`,
- completed appointment is no longer the next upcoming scheduled appointment,
- completed visit appears in the patient timeline,
- normal Visit Completion still works without appointment context.

Passing checks:

- `npx.cmd supabase db reset`
- `npx.cmd supabase db lint`
- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`
- `node .\supabase\snippets\testAppointmentService.mjs`
- `node .\supabase\snippets\testAppointmentsRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`

## Known Limitations

- Only the next upcoming appointment is surfaced in the compact patient summary.
- No calendar view.
- No provider, chair, or resource scheduling.
- No appointment conflict detection.
- No automatic visit creation before the user starts Visit Completion.
- No editing or reopening of completed visits.
- No automatic follow-up handled state.
