# Task 42 - Completed Visit Record and Timeline Clinical Polish

Date: 2026-05-19

Status: Completed

## Scope

Task 42 polished the existing completed visit timeline card and completed visit
detail route so completed Visit Completion records read as usable clinical
records.

No autosave, billing, payment handling, material consumption, attachments,
treatment-plan mutation, schema change, whole patient-record redesign, or admin
CRUD conversion was added.

## Changed Files

- `src/features/patients/PatientVisitTimeline.tsx`
- `src/pages/PatientVisitDetailPage.tsx`
- `src/features/visits/visitCompletionService.ts`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`
- `docs/design/task-42-completed-visit-record-timeline-clinical-polish.md`

## Timeline Polish

- Completed visit cards now use a clearer clinical title:
  `Completed visit - <date>`.
- Cards show:
  - completed status,
  - appointment-linked status when available,
  - completed timestamp,
  - provider/completed-by name when readable,
  - performed work summary,
  - next step,
  - visit source,
  - procedure list,
  - clinical note,
  - recommendation,
  - warnings.
- Visits without procedures now show a practical neutral notice instead of
  silently omitting the procedure section.
- Clinical note missing states now state that no clinical note was recorded for
  the completed visit.

## Detail View Polish

- Completed visit detail overview now shows:
  - completed status,
  - read-only status,
  - appointment-linked status,
  - completed timestamp,
  - patient,
  - visit date,
  - next step,
  - provider/completed-by name when readable.
- Existing linked appointment context remains visible with schedule, status,
  reason, and notes.
- Procedure, clinical note, recommendation, warning, and no-procedure states
  were tightened for clinical readability.

## Loading, Empty, And Error States

- Timeline loading remains a clear `Loading completed visits...` state.
- Empty state now says completed clinical visits will appear after Visit
  Completion is finished.
- Error retry action now reads `Retry loading visit history`.
- Missing procedure and missing clinical note states are user-facing clinical
  states, not debug placeholders.
- If clinical note content cannot be read due to role/RLS, the existing warning
  is surfaced in the card/detail.

## Smoke Test

Command:

```bash
node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs
```

The smoke keeps existing coverage and now also verifies:

- completed visit timeline card title/status;
- performed procedure in the timeline card;
- clinical note in the timeline card;
- appointment-linked/source context in the timeline card;
- completed visit detail overview;
- provider metadata label;
- procedures, clinical note, recommendation, and linked appointment detail
  sections.

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

- Provider display depends on whether the current role can read the completed-by
  profile; otherwise `Provider not recorded` is shown.
- Appointment records still do not have an assigned-provider field.
- No completed visit amend/reopen workflow.
- No billing, payments, materials, attachments, odontogram mutation,
  treatment-plan mutation, or follow-up appointment creation.
