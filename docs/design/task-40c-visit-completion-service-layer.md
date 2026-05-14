# Task 40C - Visit Completion Service Layer

Date: 2026-05-14

Status: Completed

## Scope

Task 40C adds the frontend service-layer boundary for Visit Completion persistence. It does not connect the Visit Completion UI to Supabase yet and does not change the local prototype workflow behavior.

No schema changes, Supabase migrations, autosave, billing, payment, material, attachment, treatment-plan mutation, appointment mutation, follow-up appointment creation, or odontogram mutation were added.

## Service File Created

Created:

- `src/features/visits/visitCompletionService.ts`

The service follows existing DentApp feature-service conventions:

- `VITE_PATIENT_DATA_SOURCE=demo` remains non-persistent.
- Supabase mode uses the browser Supabase client.
- Current profile context is resolved from the authenticated session and `profiles`.
- Writes rely on existing RLS.
- Audit writes use the existing `create_audit_log` RPC.
- Soft deletion is used for replaced procedure rows.

## Types Added

The service exports these Visit Completion types:

- `VisitStatus`
- `VisitNextStep`
- `VisitProcedureDraftInput`
- `VisitCompletionDraftInput`
- `VisitProcedureDraft`
- `VisitClinicalNoteDraft`
- `VisitCompletionDraft`
- `VisitCompletionWarningCode`
- `VisitCompletionServiceWarning`
- `VisitCompletionWriteResult`

`VisitProcedureDraftInput` accepts both `procedureName` and `name` so Task 40D can map the current prototype state without forcing an immediate UI rewrite.

## Functions Implemented

### `fetchLatestOpenVisitCompletion(patientId)`

Supabase mode:

- Loads the latest non-deleted `visits` row for the patient with status `draft` or `in_progress`.
- Orders by `updated_at` and `created_at` descending.
- Loads non-deleted `visit_procedures` for the visit.
- Attempts to load the linked visit clinical note.
- Returns `null` if no open draft exists.

Demo mode:

- Returns `null`.
- No demo arrays are mutated.

### `saveVisitCompletionDraft(input)`

Supabase mode:

- Creates a new `visits` draft if `visitId` is missing.
- Updates an existing open `draft` or `in_progress` visit if `visitId` is provided.
- Saves `recommendation` and `next_step`.
- Replaces performed procedure rows through `replaceVisitProcedures`.
- Saves clinical note content only when the current role can write `clinical_notes`.
- Links the saved clinical note back to `visits.clinical_note_id`.
- Creates `visit.draft_created` or `visit.draft_updated` audit entries.

The function returns a normalized `VisitCompletionDraft` plus structured warnings when needed.

### `replaceVisitProcedures(visitId, patientId, procedures)`

Supabase mode:

- Confirms the visit is an open draft/in-progress visit in the current clinic.
- Soft-deletes existing active `visit_procedures` rows by setting `deleted_at`.
- Filters empty procedure rows.
- Does not insert rows without a procedure name.
- Inserts current procedure rows with `sort_order`.
- Does not hard delete records.

### `completeVisit(input)`

Supabase mode:

- Validates the minimum completion rule against persistable data:
  - at least one procedure,
  - or a selected next step,
  - or a clinical note that the current role can persist.
- Saves the latest draft data first.
- Updates the visit to `completed`.
- Sets `completed_at`.
- Sets `completed_by` from the current profile.
- Creates a `visit.completed` audit entry.
- Returns the normalized completed draft.

Reopen/amend behavior remains intentionally out of scope.

## Clinical Note Handling

Clinical note persistence is handled inside `visitCompletionService` so the service can write `clinical_notes.visit_id` and link `visits.clinical_note_id`.

Current behavior:

- `owner_admin`, `doctor`, and `specialist` can persist visit clinical notes.
- `assistant` cannot persist clinical notes because existing `clinical_notes` RLS blocks assistant writes.
- If an assistant enters clinical note text, the service returns a structured `clinical_note_permission_denied` warning.
- The service does not expand `clinical_notes` RLS.

Completion with assistant-entered clinical note text is allowed only if another persistable item exists, such as a procedure or next step. If the note is the only entered content, completion returns a permission-aware validation error instead of silently losing the note.

## Audit Behavior

The service uses the existing `create_audit_log` RPC for:

- `visit.draft_created`
- `visit.draft_updated`
- `visit.completed`

Audit payloads store a summary rather than full clinical note text:

- patient id,
- appointment id,
- status,
- visit date,
- completion fields,
- clinical note presence,
- recommendation presence,
- selected next step,
- procedure count.

Procedure-level audit rows are deferred. The current aggregate visit audit records procedure count.

If audit logging fails after the main write succeeds, the service returns `reason: 'audit'` and includes an `audit_log_failed` warning.

## Demo Mode Behavior

When `VITE_PATIENT_DATA_SOURCE` is not `supabase`:

- `fetchLatestOpenVisitCompletion` returns `null`.
- write functions return `ok: false`.
- responses include `demo_mode_non_persistent` where useful.
- no demo data arrays are mutated.
- no localStorage persistence is introduced.

## Not Connected Yet

Task 40C intentionally does not import the service into:

- `VisitCompletionPage`
- `VisitCompletionFlow`
- `VisitCompletionSummary`
- `PatientQuickActions`
- `PatientTodayPanel`

The existing route-based prototype still uses local state only.

## Task 40D Recommendation

Task 40D should connect the route-based Visit Completion workflow to this service layer in Supabase mode.

Recommended sequence:

1. Load latest open draft on `/patients/:patientId/visit-completion`.
2. Map current local stepper state to `VisitCompletionDraftInput`.
3. Add explicit Save Draft action before autosave.
4. Wire Complete Visit to `completeVisit`.
5. Surface service warnings in the focused workflow, especially assistant clinical-note limitations.
6. Keep demo mode clearly non-persistent.
7. Add local smoke tests or a small browser verification checklist for doctor/specialist/assistant behavior.
