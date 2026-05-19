# Task 40E - Authenticated Browser Persistence Smoke Test and UX Polish

Date: 2026-05-19

Status: Completed

## Scope

Task 40E stabilized the existing route-based Visit Completion workflow after persistence was connected.

No autosave, billing, payments, materials, attachments, treatment-plan mutation, appointment mutation, odontogram mutation, or new large module was added.

## Updated Files

- `src/features/visits/VisitCompletionFlow.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`
- `docs/07_execution/progress.md`
- `docs/07_execution/todo.md`
- `docs/design/task-40e-authenticated-browser-persistence-smoke-test-and-ux-polish.md`

## UX Polish

- Draft loading now distinguishes:
  - open draft loaded,
  - no open draft found,
  - load error.
- Draft reload feedback explicitly tells the user whether a draft was found
  after route load or refresh.
- Loaded drafts show the persisted `updated_at` value as the Last saved hint.
- Save Draft uses the returned draft `updatedAt` timestamp instead of a client-only timestamp.
- Save Draft pending feedback tells the user to keep the page open until
  confirmation appears.
- Save Draft success feedback now states that refresh will reload the saved
  draft until completion.
- Complete Visit pending feedback states that the latest draft data is being
  saved before completion.
- Save Draft and Complete Visit are guarded with busy-state checks and `try/finally` cleanup.
- Save, complete, navigation, and editable fields are disabled while loading/saving/completing.
- Network/session-style failures are translated into user-facing messages where possible.
- Clinical-note permission warnings now include the practical recovery path:
  add a procedure or next step, or ask a role that can write clinical notes.
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
- Appointment-linked Visit Completion starts from a real appointment detail
  route.
- Procedure and clinical note fields are entered through stable test selectors.
- Save Draft shows success feedback and a Last saved timestamp.
- Browser refresh reloads the saved draft.
- Reloaded procedure and clinical note values are verified before completion.
- Complete Visit shows a success state.
- The completed visit appears in the patient timeline and opens in completed
  visit detail.
- Browser session persists inside the Chrome profile during the flow.

Smoke command:

```bash
node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs
```

The command assumes:

- `.env.local` or the shell provides `VITE_SUPABASE_URL`.
- The shell provides `SUPABASE_SERVICE_ROLE_KEY`.
- Local Supabase is running and migrated/seeded.
- Demo auth users have been provisioned with
  `node .\supabase\snippets\provisionDemoAuthUsers.mjs`.
- The local app is running at `http://127.0.0.1:5173`, or
  `DENTAPP_APP_URL` points at the active dev server.
- `CHROME_PATH` points at an installed Chromium browser if Chrome is not at
  the default Windows path.

Smoke result shape:

```json
{
  "authenticatedRedirectVerified": true,
  "startVisitFromAppointmentVerified": true,
  "appointmentContextVerified": true,
  "linkedVisitDraftSaveVerified": true,
  "linkedVisitDraftReloadVerified": true,
  "linkedVisitCompletionVerified": true,
  "completedVisitDetailVerified": true,
  "backToTimelineVerified": true
}
```

Additional RLS verification:

- `node .\supabase\snippets\testVisitCompletionRls.mjs` passed.

Build/lint validation:

- `npm run build` passed.
- `npm run lint` passed.

## Responsive Check

No app shell, sidebar, rail, burger menu, stepper layout, or route structure was redesigned.

The patient context/card remains above the stepper. The existing mobile sticky
progress header remains below that patient context in the document order, so it
only becomes sticky after the patient context has scrolled past. The bottom
action bar remains mobile-first, while tablet and desktop keep the existing
static workflow actions and stepper.

## Known Limitations

- No autosave.
- No draft conflict detection.
- No completed visit amend/reopen workflow.
- No billing, payments, materials, attachments, odontogram mutation, treatment-plan mutation, appointment mutation, or follow-up appointment creation.
- Assistant clinical-note limitations remain governed by existing `clinical_notes` RLS.
- Completed visits appear in the existing Patient Timeline; amend/reopen flows
  remain out of scope.
