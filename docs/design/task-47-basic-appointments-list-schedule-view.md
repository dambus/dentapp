# Task 47 - Basic Appointments List / Schedule View

Date: 2026-05-15

Status: Completed

## Scope

Task 47 adds a basic operational appointments list at `/appointments`.

This is intentionally not a full calendar. It provides a focused daily list that supports quick operational actions.

Out of scope remains: month/week calendar grid, drag/drop, provider/chair/resource scheduling, recurring appointments, reminders, external calendar sync, billing, and analytics.

## Updated Files

- `src/features/appointments/appointmentService.ts`
- `src/pages/AppointmentsPage.tsx`
- `src/routes/routePaths.ts`
- `src/routes/routeAccessConfig.ts`
- `src/routes/navigationConfig.ts`
- `src/routes/AppRoutes.tsx`
- `src/layouts/SidebarNav.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`
- `docs/design/task-47-basic-appointments-list-schedule-view.md`

## Route and Navigation

Added route:

- `/appointments`

Route is protected and role-guarded with the same scheduling role set used for calendar access.

Navigation updates:

- Added `Appointments` nav item.
- Added sidebar marker `A` for appointments.
- Entry is available in desktop sidebar and mobile drawer through shared nav config.

## Service Update

Added:

- `fetchAppointmentsForRange(startDate, endDate)`

Behavior:

- accepts date/date-time range boundaries,
- normalizes day boundaries when date-only values are passed,
- returns appointments ordered by `scheduled_start` ascending,
- loads patient summary for each appointment (`id`, `fullName`) via patient lookup,
- returns empty list for invalid ranges,
- follows existing Supabase client and error handling patterns.

## Appointments Page

Created `AppointmentsPage.tsx` with:

- default selected date = today,
- date selector,
- `Today` and `Tomorrow` quick controls,
- refresh action,
- loading/error/empty states,
- appointment cards with:
  - time range,
  - patient name,
  - reason (with fallback for missing reason),
  - status badge,
  - start timestamp,
- actions:
  - `Open patient`,
  - `Start visit` (scheduled appointments only),
  - status actions for scheduled appointments:
    - complete,
    - cancel,
    - no-show.

The layout is responsive and remains usable on mobile/tablet/desktop.

## Browser Smoke Update

Updated `testPatientAppointmentBrowserSmoke.mjs` to include appointments-list checks:

- load `/appointments`,
- verify appointment appears in list,
- open patient from appointment list,
- verify empty state for far-future date,
- verify `Today` returns to populated list,
- start visit from appointments list and continue the existing completion bridge flow.

## Validation

Executed commands:

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- Supabase-dependent scripts are blocked in this environment due to missing required env variables:
  - `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`
  - `node .\supabase\snippets\testAppointmentService.mjs`
  - `node .\supabase\snippets\testAppointmentsRls.mjs`
  - `node .\supabase\snippets\testVisitCompletionRls.mjs`

## Known Limitations

- List-based schedule only.
- No status filter controls beyond current row actions.
- No advanced calendar interactions.
- No reminders or external calendar synchronization.
