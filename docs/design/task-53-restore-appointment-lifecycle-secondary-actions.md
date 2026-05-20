# Task 53 - Restore Appointment Lifecycle Secondary Actions

## Purpose

Restore the supported appointment lifecycle secondary actions that became hard
to discover after recent empty/loading and visual polish work. The task uses
the existing appointment status model only.

## Root Cause

The lifecycle behavior was still present in `appointmentService` and the
appointment screens, but Task D1/D2 moved status-changing actions into compact
overflow menus and shortened the labels to `Cancel` and `No-show`. That made the
supported actions appear missing compared with the earlier explicit appointment
actions.

## Restored Actions

The existing status transitions remain backed by `updateAppointmentStatus`:

- `cancelled` through `Cancel appointment`
- `no_show` through `Mark no-show`
- `completed` through the existing status completion action

No new appointment schema, lifecycle status, audit model, or queue state was
added.

## Where Actions Appear

Appointment Detail:

- Scheduled appointments without a linked open/completed Visit Completion expose
  `Cancel appointment` and `Mark no-show` in the secondary status action menu.
- `Start visit` / `Continue visit` stays the visible primary clinical action.
- Completed appointments show `View completed visit` and do not show
  cancel/no-show lifecycle actions.
- Cancelled and no-show appointments show their status and no primary clinical
  Visit Completion action.
- In-progress linked visit appointments keep `Continue visit` visible and do not
  expose destructive lifecycle actions.

Daily and weekly appointment cards:

- Scheduled cards expose `Cancel appointment` and `Mark no-show` in the compact
  appointment action menu.
- The primary card actions remain clinical/navigation actions: `Start visit`,
  `Continue visit`, `View visit`, and `Details`.
- Completed cards keep `View visit` and do not expose status lifecycle actions.

## Smoke Coverage

The browser smoke now verifies:

- scheduled appointment cards expose cancel/no-show in the secondary menu;
- cancel/no-show are not rendered as primary card/detail actions;
- scheduled appointment detail exposes cancel/no-show through the secondary
  status menu;
- in-progress appointment detail hides destructive lifecycle actions;
- completed appointment detail and completed cards do not expose lifecycle
  status actions;
- the existing Visit Completion handoff and completed visit flow still pass.

## Unsupported Lifecycle Gaps

Still out of scope and not added:

- assigned provider field;
- arrived/check-in/in-room/ready-for-doctor states;
- autosave;
- billing, payments, materials, or attachments;
- treatment-plan mutation;
- reminders or tasks;
- lifecycle history/audit UI.
