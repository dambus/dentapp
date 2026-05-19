# Task 44 - Follow-up and Next Visit Recommendation Flow

Date: 2026-05-19

Status: Completed

## Scope

Task 44 polished how existing Visit Completion `recommendation` and `next_step`
fields are surfaced after a completed visit.

No autosave, billing, payment handling, material consumption, attachments,
treatment-plan mutation, automatic appointment creation, new follow-up schema,
patient module redesign, or appointments module redesign was added.

## Changed Files

- `src/features/appointments/appointmentService.ts`
- `src/features/appointments/AppointmentCard.tsx`
- `src/pages/AppointmentDetailPage.tsx`
- `src/features/patients/PatientVisitTimeline.tsx`
- `src/features/patients/PatientFollowUpSummary.tsx`
- `src/pages/PatientVisitDetailPage.tsx`
- `src/features/visits/VisitCompletionFlow.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`
- `docs/design/task-44-follow-up-next-visit-recommendation-flow.md`

## Follow-up Surfaces

Follow-up now appears in these existing surfaces:

- completed visit timeline card:
  - concise `Recommended follow-up` section when recommendation or next step
    exists;
  - next-step badge and recommendation text;
  - explicit display-only note.
- completed visit detail:
  - dedicated `Follow-up Guidance` section;
  - source visit/date;
  - suggested next step;
  - recommendation text;
  - explicit note that no appointment, reminder, treatment-plan task, billing
    item, or material record was created.
- patient overview:
  - existing `Follow-up / Next Step` summary continues to surface the latest
    completed visit with follow-up context;
  - a stable test selector was added for smoke coverage.
- completed appointment detail:
  - compact follow-up block when the linked completed visit has recommendation
    or next step.
- daily schedule appointment card:
  - completed appointment cards show a compact follow-up signal when the linked
    completed visit has follow-up context.

## Non-mutating Behavior

- Follow-up display is read-only.
- The existing patient follow-up summary can route context into the existing
  appointment form, but Task 44 did not add automatic appointment creation.
- No treatment-plan records, reminders, billing rows, payment rows, attachment
  records, or material consumption records are created.

## Future Gaps

- No dedicated follow-up status or ownership field exists.
- No automatic scheduling or reminder workflow exists.
- No treatment-plan mutation or task creation exists.
- No conflict resolution exists when multiple completed visits have competing
  recommendations; the current patient summary uses the latest completed visit
  with a follow-up signal.

## Smoke Test

Command:

```bash
node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs
```

The smoke keeps existing coverage and now verifies:

- recommendation and next step entry in Visit Completion;
- recommendation and next step reload after Save Draft and refresh;
- follow-up display on completed visit timeline card;
- follow-up display on completed visit detail;
- follow-up display on completed appointment detail;
- follow-up signal on completed daily schedule card;
- follow-up display on patient overview.

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
- No assigned-provider field exists on appointments.
- No automatic appointment creation.
- No billing, payments, materials, attachments, odontogram mutation,
  treatment-plan mutation, reminder creation, or follow-up task workflow.
