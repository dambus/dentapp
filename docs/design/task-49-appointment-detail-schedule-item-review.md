# Task 49 - Appointment Detail / Schedule Item Review

Date: 2026-05-15

Status: Completed

## Scope

Task 49 adds a focused read-only appointment detail page for reviewing one schedule item.

No appointment editing, calendar grid, drag/drop scheduling, recurring appointments, reminders, provider/chair scheduling, conflict detection, billing, payments, or analytics were added.

## Added Files

- `src/pages/AppointmentDetailPage.tsx`
- `docs/design/task-49-appointment-detail-schedule-item-review.md`

## Updated Files

- `src/routes/routePaths.ts`
- `src/routes/routeAccessConfig.ts`
- `src/routes/AppRoutes.tsx`
- `src/features/appointments/appointmentService.ts`
- `src/pages/AppointmentsPage.tsx`
- `src/features/patients/PatientAppointmentSummary.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

## Route

Added:

- `/appointments/:appointmentId`

The route uses the existing scheduling role set:

- owner/admin,
- doctor,
- specialist,
- assistant,
- reception.

## Service

Added:

- `fetchAppointmentById(appointmentId)`

The service loads:

- appointment id,
- patient summary,
- scheduled start/end,
- status,
- reason,
- notes,
- created/updated timestamps,
- latest linked completed visit when present.

It follows the existing Supabase/demo/error handling style and respects RLS.

## Detail UI

The appointment detail page shows:

- patient name/context,
- scheduled date/time,
- status badge,
- reason,
- notes,
- created/updated timestamps,
- linked completed visit status when present.

Actions:

- Back to schedule,
- Open patient,
- Start visit for `scheduled` appointments only,
- View completed visit when a linked completed visit exists.

## Links

Added detail entry points from:

- `/appointments` schedule list cards,
- patient appointment summary.

## Validation

Updated:

- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

The browser smoke now verifies:

- appointment detail opens from the schedule list,
- patient/date/status/reason/empty notes are visible,
- start visit works from appointment detail,
- completed appointment detail shows completed status,
- linked completed visit action is visible,
- completed appointment detail does not show `Start visit`.

Passing checks:

- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`
- `node .\supabase\snippets\testAppointmentService.mjs`
- `node .\supabase\snippets\testAppointmentsRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`

## Known Limitations

- No appointment editing.
- No calendar grid or weekly view.
- No conflict detection.
- No provider/chair/resource scheduling.
- No recurring appointments.
- No reminders or external calendar sync.
- No billing/payment integration.
