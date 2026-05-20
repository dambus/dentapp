# Task 55 - Appointment Lifecycle Service/Test Cleanup

## Purpose

Clean up appointment lifecycle logic and browser smoke structure after Task 53
and Task 54 without changing appointment lifecycle behavior.

## Behavior Intentionally Unchanged

Supported lifecycle behavior remains:

- `scheduled` -> `cancelled`
- `scheduled` -> `no_show`
- `scheduled` -> `Start visit`
- linked `draft` / `in_progress` visit -> `Continue visit`
- linked completed visit -> `View visit`
- cancelled/no-show appointments have no clinical Visit Completion action
- completed appointment status is set by completing linked Visit Completion

No appointment schema, status, RLS, or UI workflow behavior was added.

## Service Cleanup

`appointmentService.ts` now keeps lifecycle UI/service constants next to the
eligibility helper:

- `canUpdateAppointmentLifecycle`
- `APPOINTMENT_LIFECYCLE_UNAVAILABLE_MESSAGE`
- `getAppointmentLifecycleSuccessMessage`

The guarded `updateAppointmentStatus` behavior remains unchanged:

- direct appointment status updates only accept `cancelled` and `no_show`;
- manual `completed` updates remain blocked;
- the appointment must still be scheduled;
- linked `draft`, `in_progress`, and `completed` visits still block updates;
- clinic scoping remains part of the read and write checks.

## Component Cleanup

Appointment surfaces now reuse the same lifecycle copy/helpers:

- Appointment Detail;
- daily/weekly Appointments page;
- Patient Appointment Summary;
- AppointmentCard continues to use the shared eligibility helper.

This removes repeated success and unavailable-message strings while preserving
the same visible labels and action availability.

## Browser Smoke Cleanup

`testPatientAppointmentBrowserSmoke.mjs` keeps the same coverage but centralizes
repeated selectors and card/menu DOM queries:

- appointment card selector constant;
- appointment action menu label constant;
- appointment status menu label constant;
- transition-action list constant;
- shared card snapshot helper;
- shared card-state wait helper;
- shared appointment card menu opener.

Coverage is preserved for:

- scheduled secondary cancel/no-show actions;
- cancel transition cleanup;
- no-show transition cleanup;
- linked draft lifecycle hiding;
- completed appointment hiding plus View visit;
- existing Visit Completion happy path.

## Known Issues

Still known and unchanged:

- PowerShell may require `npm.cmd`;
- Vite chunk-size warning remains;
- no provider assignment;
- no check-in/in-room/ready-for-doctor state;
- no autosave;
- no billing/payments/materials/attachments;
- no treatment-plan mutation;
- no reminders/tasks.
