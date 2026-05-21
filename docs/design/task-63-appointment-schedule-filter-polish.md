# Task 63 - Appointment Schedule Filter UI Cleanup / Persistence Polish

This task polishes the Appointments schedule filter area and makes the provider filter URL-shareable.

## UI Scope

`src/pages/AppointmentsPage.tsx`

The schedule controls now live together in one compact filter bar inside the schedule card:

- view mode;
- date/week selector;
- assigned provider filter;
- date/week shortcuts;
- refresh.

The layout uses the existing shared form and button components, stacks naturally on small screens, and avoids horizontal scrolling for the filter group.

## Provider URL State

The provider filter is derived from the `provider` search param:

- `?provider=all`;
- `?provider=unassigned`;
- `?provider=<providerId>`.

Changing the provider select updates the URL with React Router search params and does not reload the page. Opening the Appointments page with a valid provider param restores the selected filter after provider options load.

Invalid provider params safely render as `All providers`. Filtering remains client-side against the loaded schedule range.

## Boundaries

This task does not change:

- appointment lifecycle behavior;
- Visit Completion behavior;
- `appointments.assigned_provider_id` semantics;
- `visits.completed_by` semantics;
- database schema, migrations, or RLS.

No provider workload calendar, availability/conflict checking, automatic assignment, check-in/in-room/ready-for-doctor states, billing/materials/attachments/payments, treatment-plan mutation, reminders/tasks, or broad scheduling redesign was added.

## Testing

`supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` now verifies:

- provider filter selection changes the visible list;
- provider filter selection updates the URL search params;
- opening Appointments with a provider search param restores the filter;
- invalid provider params fall back to `All providers`;
- existing appointment lifecycle checks continue after filter changes.
