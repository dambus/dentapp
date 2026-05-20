# Task 45 - Patient Overview Clinical Summary Polish

## Scope

Polish the patient detail overview so it functions as a practical clinical
summary before the deeper record sections.

The task reused existing patient, appointment, and Visit Completion data. No
schema changes were added.

## Overview Hierarchy

`PatientDetailPage` now keeps the overview ordered around clinical use:

1. patient identity and snapshot,
2. Today / Active Workflow,
3. latest clinical activity,
4. follow-up / next step,
5. appointment panel,
6. quick actions,
7. full record and timeline.

This keeps identity first, makes active work prominent, and leaves the timeline
lower on the page for deeper review.

## Today / Active Workflow

`PatientTodayPanel` now reads existing appointment and visit data:

- today's patient appointment, when available,
- latest open Visit Completion draft/in-progress visit,
- completed-today visit state,
- latest completed visit summary fallback.

Primary actions are context-aware:

- `Start visit` for a today's appointment or a direct visit,
- `Continue visit` for an open draft/in-progress visit,
- `View completed visit` after a completed-today visit,
- `View appointment` when a today's appointment exists.

Unsupported queue states such as arrived, in-room, chair assignment, provider
assignment, reminders, or tasks were not added.

## Latest Clinical Activity

Added `PatientLatestClinicalActivity` to summarize the newest completed visit:

- completed visit date and status,
- appointment-linked/direct source signal,
- procedure count,
- procedure summary,
- clinical note excerpt,
- links to the completed visit detail and timeline.

The section uses `fetchCompletedVisitsForPatient` and remains read-only.

## Follow-up / Next Step

`PatientFollowUpSummary` was tightened:

- empty no-follow-up placeholder is hidden,
- source visit date label is clearer,
- recommendation copy avoids noisy fallback text,
- display-only notice clarifies that appointments, reminders, and treatment
  plan tasks are not created automatically.

The existing schedule prefill action remains manual and does not create an
appointment by itself.

## Quick Actions

`PatientQuickActions` now avoids unavailable future modules:

- removed planned payment action,
- replaced planned scheduling placeholder with the existing appointment panel,
- added timeline access,
- kept existing role-aware actions for Visit Completion, clinical notes,
  odontogram, treatment plans, and medical record editing.

## Smoke Coverage

`supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` now verifies patient
overview clinical summary behavior after completing a linked visit:

- latest clinical activity section,
- procedure and clinical note excerpt,
- follow-up / next-step summary,
- source visit date,
- link/action access to visit detail and timeline.

## Out of Scope Confirmation

This task did not add autosave, billing, payments, materials, attachments,
treatment-plan mutation, automatic appointment creation, reminders/tasks, new
follow-up schema, or a broad patient module redesign.
