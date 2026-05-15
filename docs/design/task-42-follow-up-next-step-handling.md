# Task 42 - Follow-up / Next Step Handling

Date: 2026-05-15

Status: Completed

## Chosen Approach

Task 42 uses Option A: UI-only pending follow-up derived from completed visit data.

No migration, schema change, RLS change, appointment table, task table, or persistent handled/dismissed status was added.

Completed visits are treated as follow-up sources when they have:

- a non-empty `recommendation`, or
- a `next_step` other than `no_follow_up`.

## Scope

This task surfaces the latest relevant next step in the patient record and adds follow-up indicators to completed visits in the timeline.

Out of scope items remain out of scope:

- full appointment scheduling,
- calendar integration,
- SMS/email reminders,
- billing/payments,
- materials,
- attachments,
- treatment-plan mutation,
- recurring reminders,
- staff task assignment,
- analytics,
- advanced filtering/search.

## Updated Files

- `src/features/patients/PatientFollowUpSummary.tsx`
- `src/features/patients/PatientVisitTimeline.tsx`
- `src/features/patients/PatientFullRecord.tsx`
- `src/pages/PatientDetailPage.tsx`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`

## Implementation

Added `PatientFollowUpSummary` below the Today / Next Step panel.

The summary:

- loads completed visits through `fetchCompletedVisitsForPatient(patientId)`,
- finds the newest completed visit with a recommendation or actionable next step,
- shows source visit date,
- shows next step label,
- shows recommendation text,
- shows recorded procedure count,
- shows loading, empty, and error states,
- makes clear that this is a UI-only indicator and does not persist handled state.

Added route-linked source visit navigation:

- `View source visit` opens the Full Record Timeline tab,
- URL uses `?section=timeline&visitId=:visitId`,
- the matching timeline card is highlighted and scrolled into view.

Updated `PatientVisitTimeline`:

- visits with recommendation or actionable next step show a compact warning badge,
- visits without follow-up context stay visually quiet,
- timeline cards can be highlighted from `visitId`.

## Verification

- `npm.cmd run build` passed.
- `npm.cmd run lint` passed.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passed.
- Authenticated headless Chrome smoke passed with `doctor.demo@example.test`.

Smoke result:

```json
{
  "ok": true,
  "report": [
    "authenticated doctor session opened",
    "empty follow-up state shown",
    "visit without follow-up kept empty summary state",
    "first follow-up appeared in summary and timeline",
    "latest follow-up superseded earlier summary while both remained in timeline",
    "follow-up summary route and refresh persisted"
  ]
}
```

## Known Limitations

- Follow-up state is display-only.
- There is no persistent handled/dismissed status.
- There is no appointment or task creation.
- There are no reminders or staff assignment.
- The compact summary shows only the latest relevant follow-up.
- Older follow-up recommendations remain visible in the timeline.
- Demo mode shows no Supabase-backed follow-up history unless completed visits exist in Supabase mode.
