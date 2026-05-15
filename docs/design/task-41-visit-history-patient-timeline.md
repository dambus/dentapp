# Task 41 - Visit History / Patient Timeline

Date: 2026-05-15

Status: Completed

## Scope

Task 41 makes completed Visit Completion records visible in the patient record.

No appointment scheduling, billing, payments, materials, attachments, treatment-plan mutation, visit editing, visit deletion, advanced filtering, analytics, or calendar integration was added.

## Updated Files

- `src/features/visits/visitCompletionService.ts`
- `src/features/patients/PatientVisitTimeline.tsx`
- `src/features/patients/PatientFullRecord.tsx`
- `src/features/patients/PatientTodayPanel.tsx`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/pages/PatientDetailPage.tsx`
- `src/pages/VisitCompletionPage.tsx`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`

## Data Access

Added:

- `fetchCompletedVisitsForPatient(patientId)`

The function:

- reads completed `visits` for the patient,
- respects existing Supabase auth and RLS,
- hydrates each visit with active `visit_procedures`,
- loads the linked clinical note when the current role can read it,
- returns newest completed visits first,
- returns an empty list in demo mode.

No schema or RLS change was needed.

## Timeline UI

Added `PatientVisitTimeline` and wired it into the existing Full Record `Timeline` tab.

The timeline shows:

- completed visit date/status,
- completed timestamp,
- procedure count,
- procedure summary,
- procedure details,
- clinical note,
- recommendation,
- next step,
- warnings when clinical note content is unavailable to the current role.

The timeline handles:

- loading state,
- empty state,
- error state,
- completed visits with procedures,
- completed visits with note/recommendation only,
- long notes and multi-procedure visits with wrapping card layouts.

## Completion Link

The Visit Completion success action is now labeled `View visit history`.

On success it routes to:

- `/patients/:patientId?section=timeline`

`PatientDetailPage` reads the `section` query parameter on initial load and opens the Timeline tab when requested.

## Patient Detail Copy

Updated the Today Panel copy so Visit Completion is no longer described as unimplemented or non-persistent.

The copy now reflects that draft and completed visit records exist, while appointments, payments, materials, and ledger entries remain out of scope.

## Verification

- `npm.cmd run build` passed.
- `npm.cmd run lint` passed.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passed.
- Authenticated headless Chrome smoke passed with `doctor.demo@example.test`:
  - completed a new marked visit,
  - returned through `View visit history`,
  - confirmed the completed visit appeared in the patient Timeline,
  - confirmed procedure, clinical note, recommendation, and next step were visible,
  - refreshed the patient record and confirmed the timeline still showed the visit,
  - opened another patient with no completed visits and confirmed the empty state.

Smoke result:

```json
{
  "ok": true,
  "report": [
    "authenticated doctor session opened",
    "completed visit appeared in patient timeline",
    "timeline persisted after patient record refresh",
    "empty state shown for patient without completed visits"
  ]
}
```

## Known Limitations

- Timeline is display-only.
- No visit edit, amend, reopen, or delete workflow.
- No filtering or search.
- No appointment/follow-up creation from next step yet.
- No real-time refresh or subscriptions.
- Demo mode shows an empty completed-visit timeline because completed visits are stored in Supabase only.
- Assistant users may see clinical-note unavailable warnings when RLS prevents note reads.
