# Task 41 - Appointments to Visit Completion Handoff Polish

Date: 2026-05-19

Status: Completed

## Scope

Task 41 polished the existing route-based handoff from appointment detail and
schedule cards into Visit Completion.

No autosave, billing, payment handling, material consumption, attachments,
treatment-plan mutation, appointment schema changes, or admin-style Visit
Completion CRUD module was added.

## Changed Files

- `src/pages/AppointmentDetailPage.tsx`
- `src/pages/VisitCompletionPage.tsx`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/features/visits/visitCompletionService.ts`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`
- `docs/design/task-41-appointments-visit-completion-handoff-polish.md`

## Handoff Changes

- Appointment Detail now includes a concise handoff notice explaining that
  Start visit opens Visit Completion with appointment context.
- The notice clarifies the lifecycle behavior:
  - Save Draft keeps the appointment scheduled.
  - Complete Visit marks the linked appointment completed.
- Visit Completion waits for appointment context lookup before rendering the
  workflow when an `appointmentId` query parameter is present. This avoids
  briefly loading a patient-level draft before the appointment context resolves.

## Visit Completion Context

When started from an appointment, Visit Completion shows a compact appointment
context card above the sticky mobile progress area and above the desktop/tablet
stepper.

The card includes:

- appointment date/time;
- patient name;
- appointment reason/type when present;
- appointment status;
- provider note.

The current appointment table has no assigned provider field. The UI therefore
shows `Not assigned in appointment record` instead of inventing provider data.

## Draft Behavior

- Appointment-started Visit Completion now looks for an open draft tied to that
  appointment ID.
- If a matching draft exists, the user sees that an existing appointment draft
  was found and loaded.
- If no matching draft exists, the user sees a neutral ready-to-start message.
- Save Draft remains explicit.
- Complete Visit still saves the latest draft data first.

## Appointment Status

The existing appointment model already supports status values:

- `scheduled`
- `completed`
- `cancelled`
- `no_show`

The existing Visit Completion service already marks a linked appointment
`completed` after successful completion. Task 41 did not add schema or new
appointment lifecycle states.

## Navigation After Completion

The completion success state now offers calm secondary actions:

- View patient timeline;
- Return to appointment;
- Daily schedule.

Starting another visit is not presented as the primary action.

## Smoke Test

Command:

```bash
node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs
```

The smoke now verifies:

- authenticated demo doctor login;
- appointment detail Start visit route;
- appointment context card contents in Visit Completion;
- procedure and clinical note entry;
- explicit Save Draft;
- route refresh;
- appointment-scoped draft reload;
- Complete Visit;
- post-completion patient timeline, appointment detail, and schedule actions;
- completed visit appears in patient timeline/detail;
- linked appointment is completed and no longer shows Start visit.

## Validation

Commands:

```bash
npm run build
npm run lint
node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs
node .\supabase\snippets\testVisitCompletionRls.mjs
```

Result:

- `npm run build` passed.
- `npm run lint` passed.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passed.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passed.

Local RLS command assumption:

- `.env.local` provides `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- The shell provides `SUPABASE_SERVICE_ROLE_KEY`.
- Local Supabase is running and migrated/seeded.

## Known Limitations

- No autosave.
- No assigned-provider field exists on appointments yet.
- No completed visit amend/reopen workflow.
- No billing, payments, materials, attachments, odontogram mutation,
  treatment-plan mutation, or follow-up appointment creation.
- Appointment lifecycle remains lightweight; richer check-in/in-room/provider
  assignment states should be a separate lifecycle task if needed.
