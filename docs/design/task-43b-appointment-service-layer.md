# Task 43B - Appointment Service Layer

Date: 2026-05-15

Status: Completed

## Scope

Task 43B adds the frontend appointment service boundary for the Task 43A appointments table.

No appointment UI, calendar, reminders, appointment-to-visit bridge, follow-up bridge, billing, or treatment plan mutation was added.

## Added Files

- `src/features/appointments/appointmentService.ts`
- `supabase/snippets/testAppointmentService.mjs`

## Service Types

Added:

- `AppointmentStatus`
- `Appointment`
- `CreateAppointmentInput`
- `UpdateAppointmentStatusInput`
- `AppointmentWriteResult`

The exported `Appointment` shape follows the database row naming requested for this task:

- `clinic_id`
- `patient_id`
- `scheduled_start`
- `scheduled_end`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

## Service Functions

Added:

- `fetchAppointmentsForPatient(patientId)`
- `fetchUpcomingAppointmentsForPatient(patientId)`
- `createAppointment(input)`
- `updateAppointmentStatus(input)`

Behavior:

- `fetchAppointmentsForPatient` returns all patient appointments ordered by `scheduled_start` descending.
- `fetchUpcomingAppointmentsForPatient` returns future `scheduled` appointments ordered by `scheduled_start` ascending.
- `createAppointment` creates a `scheduled` appointment and derives `clinic_id`, `created_by`, and `updated_by` from the active profile.
- `updateAppointmentStatus` updates only `status` plus `updated_by`.
- demo mode remains non-persistent.
- Supabase mode relies on active session/profile context and existing RLS.

## Validation

Created:

- `supabase/snippets/testAppointmentService.mjs`

The service smoke verifies through an authenticated doctor demo session:

- appointment creation,
- patient appointment fetch,
- upcoming appointment fetch,
- status update.

Passing checks:

- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\supabase\snippets\testAppointmentService.mjs`
- `node .\supabase\snippets\testAppointmentsRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`
- `npx.cmd supabase db lint`

## Known Limitations

- No appointment UI.
- No calendar view.
- No reminder/notification model.
- No appointment-to-visit bridge.
- No follow-up bridge.
- No recurrence or provider/chair/resource assignment.
