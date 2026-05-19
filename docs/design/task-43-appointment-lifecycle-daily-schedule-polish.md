# Task 43 - Appointment Lifecycle and Daily Schedule Polish

Date: 2026-05-19

Status: Completed

## Scope

Task 43 polished the existing appointment lifecycle UX around the working Visit
Completion flow. The work stayed inside the existing appointments list,
appointment cards, appointment detail page, and small read helpers in the
appointment service.

No autosave, billing, payment handling, material consumption, attachments,
treatment-plan mutation, patient module redesign, appointment schema change, or
admin CRUD conversion was added.

## Changed Files

- `src/features/appointments/appointmentService.ts`
- `src/features/appointments/AppointmentCard.tsx`
- `src/pages/AppointmentsPage.tsx`
- `src/pages/AppointmentDetailPage.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`
- `docs/design/task-43-appointment-lifecycle-daily-schedule-polish.md`

## Supported Lifecycle States From Existing Data

The existing appointment table supports:

- `scheduled`
- `completed`
- `cancelled`
- `no_show`

The existing visits table supports appointment-linked Visit Completion records:

- open visit states: `draft`, `in_progress`
- completed visit state: `completed`

Task 43 uses these existing fields to show:

- ready to start: scheduled appointment with no linked open/completed visit;
- visit in progress: scheduled appointment with a linked `draft` or
  `in_progress` visit;
- completed: completed appointment with a linked completed visit;
- cancelled/no-show: existing appointment status with no primary clinical
  action.

## Daily Schedule Polish

- Daily/weekly appointment cards now receive linked open/completed visit
  summaries.
- Scheduled appointments with no linked visit show `Ready to start Visit
  Completion`.
- Appointment-linked drafts show `Visit in progress` and use `Continue visit`
  as the primary action.
- Completed appointment-linked visits show `Visit completed` and use `View
  visit` as the clinical action.
- Cancelled/no-show appointments keep non-clinical status display and no primary
  Visit Completion action.

## Appointment Detail Polish

- Appointment Detail now has a lifecycle panel with:
  - appointment status;
  - visit-in-progress badge when an open draft exists;
  - completed-visit-linked badge when completion exists;
  - clear next-step messaging.
- The primary Visit Completion action changes from `Start visit` to `Continue
  visit` when a linked draft exists.
- Completed appointments expose `View completed visit` and do not show Start
  visit as a primary action.

## Unsupported Lifecycle Gaps

- No assigned-provider field exists on appointments.
- No check-in, arrived, seated, in-room, or ready-for-doctor lifecycle state
  exists.
- No explicit appointment-to-draft status field exists; draft/in-progress state
  is derived from linked visits.
- No conflict handling for multiple open visits on one appointment beyond using
  the latest updated open visit summary.

## Smoke Test

Command:

```bash
node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs
```

The smoke keeps existing coverage and now also verifies:

- Appointment Detail ready-to-start lifecycle messaging before Start visit;
- daily schedule in-progress card after Save Draft;
- Appointment Detail Continue visit action after Save Draft;
- appointment-scoped draft reload after Continue visit;
- completed daily schedule card with View visit and no Start visit.

## Validation

Commands:

```bash
npm run build
npm run lint
node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs
node .\supabase\snippets\testVisitCompletionRls.mjs
```

Result:

- `npm run build` passed before documentation updates.
- `npm run lint` passed.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passed.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passed.

Local RLS command assumption:

- `.env.local` provides `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- The shell provides `SUPABASE_SERVICE_ROLE_KEY`.
- Local Supabase is running and migrated/seeded.

## Known Limitations

- Existing Vite chunk-size warning remains.
- Appointment records do not have assigned-provider data.
- Richer appointment lifecycle states should be handled in a later lifecycle
  model task.
- No billing, payments, materials, attachments, odontogram mutation,
  treatment-plan mutation, or follow-up appointment creation.
