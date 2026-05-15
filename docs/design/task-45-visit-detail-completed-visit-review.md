# Task 45 - Visit Detail / Completed Visit Review

Date: 2026-05-15

Status: Completed

## Scope

Task 45 adds a focused read-only completed visit review route.

No visit editing, visit deletion, print/PDF export, billing, materials, attachments, treatment plan mutation, appointment calendar, reminders, or audit UI was added.

## Added Files

- `src/pages/PatientVisitDetailPage.tsx`
- `docs/design/task-45-visit-detail-completed-visit-review.md`

## Updated Files

- `src/routes/routePaths.ts`
- `src/routes/routeAccessConfig.ts`
- `src/routes/AppRoutes.tsx`
- `src/features/patients/PatientVisitTimeline.tsx`
- `src/features/visits/visitCompletionService.ts`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

## Route

Added:

- `/patients/:patientId/visits/:visitId`

The route is protected with the same patient-read role set as the patient record.

## Service

Added:

- `fetchCompletedVisitById(patientId, visitId)`

The service loads:

- visit status and dates,
- linked appointment context if present,
- procedures,
- clinical note,
- recommendation,
- next step,
- existing service warnings.

Behavior:

- returns `null` when the visit is not found for the patient,
- throws a user-facing service error when the visit is not completed,
- respects existing Supabase/RLS access patterns.

## Timeline Link

Each completed visit card in `PatientVisitTimeline.tsx` now includes:

- `View details`

The action opens the read-only completed visit review route.

## Detail UI

The completed visit detail page shows:

- patient context/header,
- visit date,
- completed status,
- read-only indicator,
- linked appointment context when present,
- procedure list/details,
- clinical note,
- recommendation,
- next step,
- back link to patient timeline.

States handled:

- loading,
- error,
- not found,
- not completed,
- no procedures,
- long notes/recommendations,
- many procedures.

## Validation

Updated:

- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

The authenticated browser smoke now verifies:

- appointment-to-visit completion still works,
- patient timeline still shows the completed visit,
- `View details` opens completed visit review,
- procedure/note/recommendation are visible,
- linked appointment context is visible,
- refresh on detail route reloads data,
- `Back to timeline` returns to the patient timeline,
- normal Visit Completion still works without appointment context.

Passing checks:

- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`
- `node .\supabase\snippets\testAppointmentService.mjs`
- `node .\supabase\snippets\testAppointmentsRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`

## Known Limitations

- No print/PDF export yet.
- No visit editing or deletion.
- No audit log UI.
- No billing/materials/attachments.
- No treatment plan mutation.
- No appointment calendar context beyond the linked appointment summary.
