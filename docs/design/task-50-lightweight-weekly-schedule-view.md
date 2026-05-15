# Task 50 - Lightweight Weekly Schedule View

Date: 2026-05-15

Status: Completed

## Scope

Task 50 extends the existing `/appointments` operational schedule page with a lightweight weekly grouped-list view.

No month calendar, drag/drop scheduling, provider/chair/resource scheduling, recurring appointments, reminders, external calendar sync, conflict detection, analytics, appointment editing, or appointment creation from the weekly grid was added.

## Updated Files

- `src/pages/AppointmentsPage.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`

## View Modes

`/appointments` now supports two simple modes:

- Day
- Week

Day remains the default.

The mode selector is a compact button group that works on mobile and desktop.

## Week Range

Week mode uses the existing `fetchAppointmentsForRange(startDate, endDate)` service function.

Behavior:

- selected week is calculated Monday through Sunday,
- appointments are fetched for the full week range,
- days are rendered Monday to Sunday,
- appointments within each day keep the service ordering by `scheduled_start`.

The week range label uses the existing patient date display helper, for example:

- `11 May 2026 - 17 May 2026`

## Week Navigation

Week mode includes:

- Previous week,
- This week,
- Next week,
- Refresh.

Day mode keeps:

- date input,
- Today,
- Tomorrow,
- Refresh.

## Weekly Appointment Cards

Week mode reuses the same appointment card renderer as Day mode.

Each appointment card includes:

- time range,
- patient name,
- reason,
- status badge,
- Details,
- Open patient,
- Start visit only for `scheduled` appointments,
- existing status actions for scheduled appointments.

Empty days are compact and show a simple open-day marker.

## Validation

Updated:

- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

The browser smoke now verifies:

- Week mode opens,
- weekly schedule label appears,
- the created appointment appears in Week mode,
- seven day groups render,
- appointment details open from a weekly appointment card,
- existing Day mode, appointment detail, appointment-to-visit, completed visit detail, and print smoke coverage still pass.

Passing checks:

- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`
- `node .\supabase\snippets\testAppointmentService.mjs`
- `node .\supabase\snippets\testAppointmentsRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`

## Known Limitations

- No calendar grid.
- No month view.
- No appointment creation from the schedule page.
- No drag/drop scheduling.
- No provider/chair/resource scheduling.
- No recurring appointments.
- No reminders or external calendar sync.
- No conflict detection.
