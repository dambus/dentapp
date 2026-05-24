# Task 69 - Appointment Operational State Service/UI Wiring

This task exposes the Task 68 operational state foundation in the existing
Appointments UI without changing lifecycle, provider assignment, or Visit
Completion behavior.

## Service Wiring

Updated `src/features/appointments/appointmentService.ts`:

- added `AppointmentOperationalState`;
- hydrated `appointments.operational_state` through the shared appointment
  select fields;
- normalized unknown operational state values to `not_arrived`;
- added operational labels:
  - `Not arrived`;
  - `Arrived`;
  - `Ready for doctor`;
- added `canUpdateAppointmentOperationalState()`;
- added `getNextAppointmentOperationalState()`;
- added `updateAppointmentOperationalState()`.

The update method supports only forward UI transitions:

- `not_arrived -> arrived`;
- `arrived -> ready_for_doctor`.

The database trigger from Task 68 remains the final enforcement layer.

## UI Wiring

Updated `src/features/appointments/AppointmentCard.tsx`:

- shows a compact operational state badge on appointment cards;
- shows `Mark arrived` only for eligible daily cards in `not_arrived`;
- shows `Ready for doctor` only for eligible daily cards in `arrived`;
- hides operational progression when the appointment is ineligible because of
  lifecycle status or linked Visit Completion records;
- keeps the existing upper-right secondary menu anchored and lifecycle-only.

Updated `src/pages/AppointmentsPage.tsx`:

- calls the focused operational state service method;
- refreshes the loaded schedule after successful updates;
- shows concise feedback:
  - `Patient marked as arrived.`;
  - `Patient is ready for doctor.`;
- preserves provider filtering, URL params, Start/Continue/View visit, Cancel,
  and Mark no-show behavior.

Updated `src/pages/AppointmentDetailPage.tsx`:

- shows the current operational state badge;
- exposes the next eligible operational action beside the existing primary
  actions;
- updates the page state after successful transition;
- keeps lifecycle status actions in the existing secondary menu.

Weekly schedule cards remain display-light: they can show the badge but do not
expose operational progression actions.

## Smoke Coverage

Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`:

- verifies a scheduled appointment starts as `Not arrived`;
- verifies the daily schedule card exposes `Mark arrived`;
- verifies clicking `Mark arrived` updates the card to `Arrived`;
- verifies the next action becomes `Ready for doctor`;
- verifies clicking it updates the card to `Ready for doctor`;
- verifies appointment detail reflects `Ready for doctor`;
- verifies cancelled, no-show, completed, and linked Visit Completion
  appointments do not expose operational progression actions;
- preserves existing Start visit, lifecycle, provider filter, responsive
  overflow, and menu geometry coverage.

The manual appointment network observation was tightened to wait for the backing
appointment count to increase before reporting whether CDP captured the request,
avoiding a stale success-message race.

## Boundaries

No schema, migration, RLS, operational filtering, waiting queue, room/chair
assignment, wait-time analytics, provider workload, availability logic,
automatic assignment, billing, materials, payments, attachments,
treatment-plan mutation, reminders, tasks, or broad schedule redesign were
added.

Start visit behavior remains unchanged and does not require arrival or
ready-for-doctor state.
