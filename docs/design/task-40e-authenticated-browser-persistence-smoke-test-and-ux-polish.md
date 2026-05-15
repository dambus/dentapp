# Task 40E - Authenticated Browser Persistence Smoke Test and UX Polish

Date: 2026-05-15

Status: Completed

## Scope

Task 40E stabilized the existing route-based Visit Completion workflow after persistence was connected.

No autosave, billing, payments, materials, attachments, treatment-plan mutation, appointment mutation, odontogram mutation, or new large module was added.

## Updated Files

- `src/features/visits/VisitCompletionFlow.tsx`
- `src/pages/VisitCompletionPage.tsx`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`

## UX Polish

- Draft loading now distinguishes:
  - open draft loaded,
  - no open draft found,
  - load error.
- Loaded drafts show the persisted `updated_at` value as the Last saved hint.
- Save Draft uses the returned draft `updatedAt` timestamp instead of a client-only timestamp.
- Save Draft and Complete Visit are guarded with busy-state checks and `try/finally` cleanup.
- Save, complete, navigation, and editable fields are disabled while loading/saving/completing.
- Network/session-style failures are translated into user-facing messages where possible.
- Incomplete procedure rows are called out inline:
  - procedure rows without a procedure name are not counted as performed work,
  - users are prompted to add the name or remove the row before completion.
- Completion success is terminal in the UI:
  - the user can return to the patient record,
  - the completed visit is not reopened for editing from the success state.

## Edge Cases Covered

- No procedure added:
  - completion still requires at least one performed procedure, clinical note, or selected next step.
- Procedure row missing required procedure name:
  - inline warning is shown,
  - incomplete rows are ignored by persistence.
- Clinical note only:
  - still supported for roles that can persist clinical notes.
- Recommendation only:
  - can be saved as draft,
  - does not satisfy completion readiness by itself.
- Next step only:
  - can satisfy completion readiness.
- Refresh after draft save:
  - latest open draft reloads.
- Refresh before draft save:
  - no unsaved local data is persisted, and the route starts from the latest open draft or a clean state.
- Double submit:
  - Save Draft and Complete Visit are guarded by busy flags and disabled button states.
- Save/complete service errors:
  - entered data remains visible and an inline error is shown.

## Authenticated Browser Smoke Test

Environment:

- Local Supabase was running at `http://127.0.0.1:54321`.
- Local Vite app was running at `http://127.0.0.1:5173`.
- Demo users were verified with `supabase/snippets/provisionDemoAuthUsers.mjs`.
- Smoke test used a real headless Chrome browser session with `doctor.demo@example.test`.

Verified:

- Authenticated doctor session opens.
- Visit Completion route is protected by the existing auth/profile/role guards.
- Draft save shows success feedback.
- Browser refresh reloads the saved draft.
- Editing and saving the draft again survives another refresh.
- Complete Visit shows a success state.
- Refresh after completion does not load the completed visit as an open editable draft.
- Browser session persists inside the Chrome profile during the flow.

Smoke result:

```json
{
  "ok": true,
  "report": [
    "authenticated doctor session opened",
    "protected visit completion route opened",
    "draft saved with success feedback",
    "saved draft reloaded after route refresh",
    "edited draft saved and reloaded",
    "visit completed with success state",
    "completed visit did not reload as open editable draft",
    "browser session persisted within the Chrome profile"
  ]
}
```

Additional RLS verification:

- `node .\supabase\snippets\testVisitCompletionRls.mjs` passed.

## Responsive Check

No app shell, sidebar, rail, burger menu, stepper layout, or route structure was redesigned.

The polish only added inline notices, disabled states, and terminal success behavior inside existing responsive containers. The existing mobile sticky footer/header, tablet rail, and desktop sidebar patterns remain in place.

## Known Limitations

- No autosave.
- No draft conflict detection.
- No completed visit amend/reopen workflow.
- No billing, payments, materials, attachments, odontogram mutation, treatment-plan mutation, appointment mutation, or follow-up appointment creation.
- Assistant clinical-note limitations remain governed by existing `clinical_notes` RLS.
- Visit History / Patient Timeline is still needed so completed visits are visible in patient context after completion.
