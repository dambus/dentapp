# Task 40D - Connect Visit Completion UI to Persistence

Date: 2026-05-14

Status: Completed

## Scope

Task 40D connects the existing route-based Visit Completion workflow to the Task 40C service layer.

No autosave, schema changes, billing, payments, materials, attachments, treatment-plan mutation, appointment creation, appointment status mutation, odontogram mutation, or clinical notes RLS expansion were added.

## UI Connected

Updated:

- `src/features/visits/VisitCompletionFlow.tsx`

The workflow remains a focused route-based clinical flow:

- compact patient/visit context,
- sticky mobile workflow header,
- stepper navigation,
- one main task visible at a time,
- review step,
- final confirmation,
- success state after service success.

## Draft Loading

When `/patients/:patientId/visit-completion` opens, `VisitCompletionFlow` calls:

- `fetchLatestOpenVisitCompletion(patient.id)`

If an open `draft` or `in_progress` visit exists, the UI populates:

- `visitId`,
- procedures,
- clinical note,
- recommendation,
- next step,
- service warnings.

If no open draft exists, the workflow starts with the same empty local state as before.

A small loading notice is shown while the draft load is in progress. If a load error is thrown, the page stays open and displays an `InlineNotice`.

## Save Draft

Added an explicit `Save Draft` action in the workflow footer.

Behavior:

- no autosave,
- enabled only when there is meaningful data,
- calls `saveVisitCompletionDraft`,
- stores the returned `visitId`,
- updates the local state from the normalized service draft,
- shows save success state and timestamp,
- shows service warnings.

The Save Draft action is intentionally secondary to the main workflow action.

## Complete Visit

The existing completion confirmation now calls:

- `completeVisit`

Behavior:

- the existing readiness rule is preserved in the UI,
- confirmation is shown before the service call,
- completing state disables repeated submission,
- success state appears only when the service returns success,
- service errors return the user to the Review step,
- service warnings remain visible.

The service still enforces the stricter persistable-data rule for assistant-entered clinical notes.

## Warning and Error Behavior

Structured service warnings are surfaced through `InlineNotice`.

Handled warnings include:

- `clinical_note_permission_denied`,
- `demo_mode_non_persistent`,
- `clinical_note_unavailable`,
- `audit_log_failed`.

Clinical note permission warnings are shown as warning notices. Demo/non-critical persistence warnings are shown as informational notices.

Errors are shown as danger notices and do not navigate the user away from the workflow.

## Assistant Limitation

The UI does not expand `clinical_notes` RLS.

Current behavior:

- assistants can save procedures and next-step draft data through the visit tables,
- assistants cannot persist `clinical_notes`,
- if an assistant enters clinical note text, the service returns `clinical_note_permission_denied`,
- if that clinical note is the only entered content, completion fails with a permission-aware error,
- if a procedure or next step is also entered, completion may succeed but the warning remains visible.

## Demo Mode

Demo mode remains non-persistent:

- no demo arrays are mutated,
- no localStorage is used,
- Save Draft and Complete Visit call the service and display the returned non-persistent warning/error,
- the route-based workflow remains usable for stepping through the prototype.

## Not Implemented

Still intentionally out of scope:

- autosave,
- draft conflict handling,
- completed visit reopen/amend,
- appointment linkage beyond nullable `appointment_id`,
- appointment status mutation,
- follow-up appointment creation,
- treatment plan item mutation,
- odontogram mutation,
- billing/payment/material persistence,
- attachment/photo storage,
- expanded assistant clinical-note permissions.

## Verification

- `npm.cmd run build` passed.
- `npm.cmd run lint` passed.

Manual browser verification is recommended with local Supabase auth sessions for:

- doctor save draft and route refresh,
- doctor complete visit,
- assistant procedure-only completion,
- assistant clinical-note-only warning/error,
- demo mode non-persistent warning.
