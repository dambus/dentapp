# Task 49 — Appointment Detail / Schedule Item Review

## Context

DentApp now has:
- patient appointment summary;
- follow-up-to-appointment bridge;
- appointment-to-visit bridge;
- `/appointments` operational schedule list;
- completed visit detail;
- print-ready visit review;
- mobile workflow usability pass.

Current limitation:
Appointments are visible in patient summary and schedule list, but there is no focused appointment detail/review screen.

## Goal

Add a read-only appointment detail page for reviewing one scheduled/cancelled/completed/no-show appointment.

Do not build a full calendar.

## Requirements

### 1. Add appointment detail route

Add route, for example:

`/appointments/:appointmentId`

or patient-scoped route if that better matches existing patterns:

`/patients/:patientId/appointments/:appointmentId`

Use existing routing/access conventions.

### 2. Add service function

Extend appointment service with:

`fetchAppointmentById(appointmentId)`

It should load:
- appointment id;
- patient summary;
- scheduled start/end;
- status;
- reason;
- notes;
- created/updated timestamps;
- linked completed visit if available, if easy.

Use existing Supabase error patterns.

### 3. Appointment detail UI

Create appointment detail page.

Show:
- patient name/context;
- scheduled date/time;
- status badge;
- reason;
- notes;
- linked visit status if appointment already produced a completed visit;
- actions:
  - Open patient;
  - Start visit only if status is `scheduled`;
  - View completed visit if linked visit exists;
  - Back to schedule.

Keep it read-only except existing status actions if easy.

### 4. Link from existing UI

Add “View appointment” or “Details” action from:
- `/appointments` list cards;
- PatientAppointmentSummary if useful.

Do not clutter mobile UI.

### 5. States

Handle:
- loading;
- error;
- not found;
- appointment without reason;
- appointment without notes;
- completed appointment with linked visit;
- scheduled appointment without visit.

### 6. Responsive

Make the page readable on:
- mobile;
- tablet;
- desktop.

## Out of scope

Do not implement:
- editing appointment details;
- calendar grid;
- drag/drop;
- recurring appointments;
- reminders;
- provider/chair scheduling;
- conflict detection;
- billing/payments;
- analytics.

## Validation

Run:

npm.cmd run build
npm.cmd run lint
node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs
node .\supabase\snippets\testAppointmentService.mjs
node .\supabase\snippets\testAppointmentsRls.mjs
node .\supabase\snippets\testVisitCompletionRls.mjs

Manual/browser check:
1. Open `/appointments`.
2. Open appointment detail.
3. Confirm patient/date/status/reason/notes are visible.
4. Start visit from scheduled appointment.
5. Complete visit.
6. Return to appointment detail.
7. Confirm appointment is completed and linked visit can be opened.
8. Confirm cancelled/no-show appointments do not show Start visit.
9. Check mobile layout.

## Docs

Update:
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`

Add:
`docs/design/task-49-appointment-detail-schedule-item-review.md`

Next recommended task:
`Task 50 — Lightweight Weekly Schedule View`