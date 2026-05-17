# Task 52 - Appointment Module QA & UX Notes

Date: 2026-05-17

## Scope Reviewed

- Patient appointment summary.
- Appointment creation form.
- Follow-up-to-appointment bridge.
- `/appointments` Day and Week schedule list.
- Appointment detail page.
- Appointment status actions: Complete, Cancel, No-show.
- Start visit from appointment.
- Completed appointment linked to visit.
- Completed visit detail linked appointment context.
- Mobile, tablet, and desktop layout behavior from code and browser smoke coverage.
- Demo route/persistence id handling:
  - `getPatientPersistenceId(...)` for Supabase writes and joins.
  - `getPatientRouteId(...)` for app navigation.

## Functional QA Checklist

Use this as the manual regression pass before broader UI review.

### Appointment Creation

- [x] Patient appointment summary loads upcoming scheduled appointments.
- [x] Empty state appears when no future scheduled appointment exists.
- [x] Date input stores canonical native value (`YYYY-MM-DD`).
- [x] Time input stores canonical native value (`HH:mm`).
- [x] Duration selection creates a valid scheduled end time.
- [x] Reason is optional when empty.
- [x] Notes are optional when empty.
- [x] Follow-up bridge pre-fills the appointment reason.
- [x] Submitting a valid appointment sends a Supabase appointment request.
- [x] Valid appointment creation shows success feedback.
- [x] Valid appointment creation refreshes the patient appointment summary.
- [x] Appointment remains visible after browser refresh.
- [x] Double-submit is guarded and does not create duplicates.

### Validation Errors

- [x] Missing date shows a specific validation message.
- [x] Missing time shows a specific validation message.
- [x] Invalid date/time format shows a specific validation message.
- [x] Invalid duration/end time is blocked.
- [x] Scheduled end before scheduled start is blocked.
- [x] Whitespace-only reason is blocked.
- [x] Whitespace-only notes are blocked.
- [x] Overlong reason is blocked.
- [x] Overlong notes are blocked.
- [x] Technical create failures are logged in development only and not exposed raw to the user.

### Schedule List

- [x] `/appointments` loads a daily schedule by default.
- [x] Day date picker changes the schedule range.
- [x] Today and Tomorrow controls update the schedule.
- [x] Empty day state appears for a date without appointments.
- [x] Week mode renders seven day groups.
- [x] Scheduled, completed, cancelled, and no-show appointments remain visible in range views.
- [x] Appointment cards show time range, patient, reason fallback, and status.
- [x] Appointment cards link to appointment detail.
- [x] Appointment cards link to the patient using route id / demo slug, not raw seeded UUID.
- [x] Start visit from schedule uses route id / demo slug and preserves `appointmentId`.

### Appointment Detail

- [x] Detail page loads from `/appointments/:appointmentId`.
- [x] Detail shows patient name, status, schedule range, reason, notes, created/updated metadata.
- [x] Detail `Open patient` uses route id / demo slug for seeded demo patients.
- [x] Detail `Start visit` uses route id / demo slug and preserves `appointmentId`.
- [x] Completed appointments show `View completed visit` when a linked completed visit exists.
- [x] Completed/cancelled/no-show appointments do not show `Start visit`.
- [x] Appointment detail survives browser refresh.

### Status Actions

- [x] Complete action is available only for scheduled appointments.
- [x] Cancel action is available only for scheduled appointments.
- [x] No-show action is available only for scheduled appointments.
- [x] Status actions disable while an update is running.
- [x] Status actions prevent double-click/race updates.
- [x] Success feedback appears after status update.
- [x] Failure feedback appears after status update failure.
- [x] UI refreshes after status update.
- [x] Cancelled appointment remains visible in schedule/detail where appropriate.
- [x] No-show appointment remains visible in schedule/detail where appropriate.
- [x] Completed appointment remains visible in schedule/detail and can link to completed visit.

### Appointment To Visit

- [x] Only scheduled appointments can start Visit Completion.
- [x] Visit Completion loads appointment context when `appointmentId` is valid and scheduled.
- [x] Visit Completion drops stale non-scheduled appointment context with a warning.
- [x] Completing a linked visit marks the appointment completed.
- [x] Completed visit appears in patient timeline.
- [x] Completed visit detail shows linked appointment context.
- [x] Patient timeline link from completed flow returns to patient context.

### Refresh And Routing

- [x] Patient record refresh preserves created appointment visibility.
- [x] Appointment detail refresh reloads detail state.
- [x] Completed visit detail refresh reloads linked appointment context.
- [x] Appointment screen patient routes use demo slugs for seeded demo patients.
- [x] Appointment persistence still uses Supabase UUIDs for writes, joins, and RLS.

## UX Notes

### Must Fix Before Broader Testing

No blocking UX defects found in this pass.

The core appointment workflows are usable enough for broader manual review:
create appointment, list schedule, inspect detail, update status, start Visit Completion, and review completed visit link.

### Should Fix Soon

- **Action density on appointment cards**
  - Schedule cards can show up to six actions: Details, Open patient, Start visit, Complete, Cancel, No-show.
  - This is functional but visually busy, especially on tablet and mobile.
  - Consider grouping secondary status actions behind a compact action menu later.

- **Status action confidence**
  - Cancel and No-show are single-click actions with no confirmation.
  - This is fast for testing, but risky in a real clinic workflow.
  - A lightweight confirmation for destructive/status-closing actions would reduce accidental clicks.

- **Appointment creation form feedback placement**
  - Validation appears below the input group, while success/failure feedback appears above the form.
  - It works, but users may miss why the submit button is disabled if they focus near the button.
  - Consider moving validation closer to the button or adding per-field errors later.

- **Mobile vertical length**
  - Patient detail pages are already long, and the appointment card plus form adds more vertical scrolling.
  - The layout is acceptable for the current module, but broader testing should watch for lost context after follow-up prefill scrolls to the form.

- **Schedule list readability**
  - Day and Week list cards are clear for low volume.
  - For a busy day, repeated full cards will become heavy.
  - Later improvement: compact row mode or tighter schedule list density.

- **Appointment detail visual hierarchy**
  - Detail page is readable, but reason and notes have similar weight.
  - In real use, reason should likely be more prominent than optional notes.

- **Copy consistency around "schedule" vs "appointment"**
  - Current copy alternates between schedule item, appointment, and patient scheduling.
  - Not a blocker, but a tighter vocabulary pass would make the module feel more finished.

### Nice To Have Later

- **Dedicated status history**
  - Current UI shows the current status and last updated timestamp.
  - Later audit/status history would help explain when and why an appointment was cancelled, no-showed, or completed.

- **Reason/notes counters**
  - Length limits exist, but there is no visible counter.
  - Counters would reduce surprise for long notes.

- **Patient context in schedule filters**
  - Schedule list currently focuses on date/week only.
  - Search/filter by patient name or status would help once volume increases.

- **Appointment detail next/previous navigation**
  - From detail, users return to schedule manually.
  - Later: next/previous appointment in selected day could improve operational review.

- **Better empty state routing**
  - Empty schedule states suggest scheduling from a patient record but do not deep-link to a patient.
  - This is acceptable because schedule-page appointment creation is intentionally out of scope.

- **Mobile action grouping**
  - Full-width buttons are easy to tap, but stacked action groups consume space.
  - Later: use a primary action plus overflow menu for secondary actions.

## Known Limitations

Intentional limitations for the current appointment module:

- No full calendar.
- No weekly/monthly calendar grid.
- No drag/drop scheduling.
- No provider scheduling.
- No chair/resource scheduling.
- No conflict detection.
- No appointment reminders.
- No recurring appointments.
- No external calendar sync.
- No appointment editing.
- No appointment deletion.
- No billing/payment integration.
- No analytics.
- No schedule-page appointment creation.
- Follow-up recommendations are not automatically marked handled after scheduling.
- Appointment status changes are persisted, but status history/audit is not surfaced in the UI.
- Appointment status model is simple: `scheduled`, `completed`, `cancelled`, `no_show`.
- Completed visit detail is read-only.
- Print-ready completed visit review uses browser print only; no generated PDF export.

## Small Fixes Made

No new code fixes were made for Task 52. The review did not find a small, obvious issue that was safer to patch than to document.

## Validation Plan

Run:

```bash
npm.cmd run build
npm.cmd run lint
node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs
node .\supabase\snippets\testAppointmentService.mjs
node .\supabase\snippets\testAppointmentsRls.mjs
node .\supabase\snippets\testVisitCompletionRls.mjs
```
