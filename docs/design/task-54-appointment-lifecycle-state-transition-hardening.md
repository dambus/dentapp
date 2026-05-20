# Task 54 - Appointment Lifecycle State Transition Hardening

## Purpose

Harden the existing appointment lifecycle transitions after restoring secondary
actions in Task 53. This keeps the lifecycle model small and uses only the
existing appointment statuses and Visit Completion links.

## Supported Transitions and Actions

Supported appointment lifecycle behavior:

- `scheduled` appointment without linked visits -> `cancelled`
- `scheduled` appointment without linked visits -> `no_show`
- `scheduled` appointment -> `Start visit`
- scheduled appointment with linked `draft` or `in_progress` visit ->
  `Continue visit`
- appointment with linked completed visit -> `View visit`
- linked Visit Completion completion marks the appointment `completed`

Unsupported as a direct appointment status-menu action:

- direct manual `completed` appointment status update
- cancelling an appointment with a linked draft/in-progress visit
- marking no-show for an appointment with a linked draft/in-progress visit
- cancelling or marking no-show for an appointment with a completed visit
- any transition from `cancelled` or `no_show`

## Guarded Transitions

`canUpdateAppointmentLifecycle` centralizes UI eligibility:

- appointment status must be `scheduled`;
- no linked open Visit Completion may exist;
- no linked completed Visit Completion may exist.

The same rule is used by:

- Appointment Detail;
- appointment cards in daily/weekly schedule;
- patient appointment summary cards.

`appointmentService.updateAppointmentStatus` also validates server-side before
writing:

- only `cancelled` and `no_show` are accepted through this function;
- the current appointment row must still be `scheduled`;
- no linked `draft`, `in_progress`, or `completed` visit may exist;
- the update is scoped by clinic and current `scheduled` status.

Visit Completion keeps its separate linked appointment completion path.

## UI Behavior After Status Change

After `Cancel appointment`:

- the page/card stays in place;
- status changes to `Cancelled`;
- `Start visit` / `Continue visit` are hidden;
- `Cancel appointment` and `Mark no-show` are hidden;
- success copy reads `Appointment was cancelled.`

After `Mark no-show`:

- the page/card stays in place;
- status changes to `No-show`;
- `Start visit` / `Continue visit` are hidden;
- `Cancel appointment` and `Mark no-show` are hidden;
- success copy reads `Appointment was marked no-show.`

Completed appointments continue to show `View visit` and do not show
`Start visit`, `Cancel appointment`, or `Mark no-show`.

## Smoke Coverage

The authenticated browser smoke verifies:

- scheduled appointment cards expose secondary cancel/no-show actions;
- scheduled appointment detail exposes secondary cancel/no-show actions;
- manual `Complete` is not shown in appointment lifecycle menus;
- cancelling an appointment changes UI status and removes lifecycle actions;
- marking no-show changes UI status and removes lifecycle actions;
- linked draft/in-progress appointments hide destructive lifecycle actions;
- completed appointments hide destructive lifecycle actions and `Start visit`
  while still exposing visit review;
- the existing Visit Completion happy path still passes.

## Unsupported Lifecycle Gaps

Still out of scope and not added:

- new appointment schema;
- new lifecycle states;
- assigned provider;
- arrived/check-in/in-room/ready-for-doctor state;
- autosave;
- billing, payments, materials, or attachments;
- treatment-plan mutation;
- reminders or tasks;
- broad appointment redesign or modal-heavy confirmation flow.
