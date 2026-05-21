# Task 62 - Appointment Provider Filter / Daily Schedule Polish

This task adds a lightweight assigned-provider filter to the Appointments schedule surface.

It reuses the Task 59-61 provider assignment foundation:

- `appointments.assigned_provider_id` remains the planned appointment provider;
- `get_assignable_appointment_providers()` remains the safe provider option read path;
- hydrated `assignedProvider` remains display-only context;
- `visits.completed_by` remains separate actual visit completion identity.

## UI Scope

`src/pages/AppointmentsPage.tsx`

The schedule card now includes an `Assigned provider` select with:

- `All providers`;
- `Unassigned`;
- active same-clinic assignable providers returned by the existing provider RPC.

Filtering is client-side against the currently loaded schedule range. It does not change appointment loading, lifecycle behavior, Visit Completion behavior, schema, migrations, RLS, or provider assignment writes.

The visible schedule count follows the selected filter. If a provider filter removes every loaded appointment, the page shows a clear filter empty state, including `No unassigned appointments` for the unassigned filter.

## Testing

`supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` now covers:

- Appointments page provider filter visibility and options;
- selecting a specific provider hides unassigned appointments;
- selecting `Unassigned` shows only unassigned cards or the clear empty state;
- switching back to `All providers` restores the full loaded schedule;
- existing lifecycle actions remain covered: Start visit, Continue visit, View visit, Cancel, and Mark no-show.

## Out Of Scope

No provider workload calendar, availability/conflict checking, automatic provider assignment, check-in/in-room/ready-for-doctor states, billing/materials/attachments/payments, treatment-plan mutation, reminders/tasks, schema/RLS changes, or broad scheduling redesign was added.
