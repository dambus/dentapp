# Task 61 - Provider Assignment UX/Test Cleanup

## Scope

This task is a stabilization pass after provider assignment service/UI wiring.

It does not add new provider functionality, schema, RLS, scheduling behavior, workload views, automatic assignment, availability checks, check-in states, billing, materials, treatment-plan mutation, reminders, or tasks.

## Provider Wording Cleanup

Provider assignment wording now consistently uses assigned-provider language for appointment context:

- `Assigned provider`;
- `Not assigned`;
- `Provider unavailable`.

Completed visit metadata remains separate and continues to use completed-by semantics in completed visit surfaces.

The shared appointment provider display fallback is centralized in:

`getAssignedProviderDisplayName()`

This keeps `AppointmentCard`, `AppointmentDetailPage`, and `VisitCompletionFlow` aligned without changing provider behavior.

## Appointment Menu Label Polish

The appointment card secondary action menu now uses the shorter destructive action label:

- `Cancel`

The full meaning remains clear from surrounding appointment card context and existing success/status copy:

- `Appointment was cancelled.`
- appointment detail still has space for `Cancel appointment`.

`Mark no-show` remains unchanged because it is still readable and clear.

No appointment lifecycle behavior changed.

## Smoke Test Cleanup

Updated browser smoke assertions to match the provider wording and card menu label:

- provider card display now expects `Assigned provider: Doctor Demo`;
- lifecycle action constants now expect card menu `Cancel`;
- appointment detail assertions still verify full-detail lifecycle wording where applicable.

Coverage remains in place for:

- provider dropdown;
- provider selection;
- created appointment provider display;
- appointment detail provider display;
- Visit Completion provider context;
- appointment lifecycle cancel/no-show;
- Visit Completion happy path;
- treatment plan read-only checks.

## Validation

Validated locally with:

- `npm.cmd run build`;
- `npm.cmd run lint`;
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs`;
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`;
- `node .\supabase\snippets\testVisitCompletionRls.mjs`;
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs`.

The existing Vite large-chunk warning remains.
