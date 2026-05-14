# Task 40B - Visit Completion Migration Validation

Status: Completed

## Goal

Apply and validate the Task 40A Visit Completion migration in local Supabase
before frontend persistence work begins.

No frontend persistence was added. `VisitCompletionFlow` behavior was not
changed.

## Migration Applied Locally

Migration validated:

- `supabase/migrations/20260514190000_create_visit_completion_tables.sql`

Local command used:

```powershell
npx.cmd supabase db reset
```

This reset only the local Supabase development database. The command applied all
existing migrations, including the Visit Completion migration, and reseeded
local demo data from `supabase/seed.sql`.

Result:

- migration applied successfully,
- local seed completed,
- no production or remote database was touched.

## Demo User Provisioning

After reset, local demo auth users and matching profiles were recreated with:

```powershell
node .\supabase\snippets\provisionDemoAuthUsers.mjs
```

Result:

- 6 local demo auth users/profiles created or verified:
  - `owner_admin`
  - `doctor`
  - `specialist`
  - `assistant`
  - `reception_admin`
  - `inventory_responsible`

## Smoke Test Script Added

Created:

- `supabase/snippets/testVisitCompletionRls.mjs`

Purpose:

- verify local Visit Completion table access through existing Supabase auth/RLS
  conventions,
- verify clinical role writes for `visits` and `visit_procedures`,
- verify denied roles remain denied,
- verify clinical note FK behavior,
- verify assistant clinical-note limitation remains unchanged.

Command used:

```powershell
node .\supabase\snippets\testVisitCompletionRls.mjs
```

Result:

- passed.

## Tables Verified

The smoke test verified the tables are reachable after migration:

- `public.visits`
- `public.visit_procedures`

The local migration output also showed:

- `Applying migration 20260514190000_create_visit_completion_tables.sql...`

## FK Verified

The script verified `clinical_notes.visit_id -> visits.id` behavior by:

- inserting a clinical note with a valid visit id for clinical roles,
- attempting a clinical note insert with invalid visit id for clinical roles.

Results:

- valid visit id accepted for `owner_admin`, `doctor`, and `specialist`,
- invalid visit id rejected with:
  - `violates foreign key constraint "clinical_notes_visit_id_fkey"`.

For `assistant`, clinical note writes were rejected by existing
`clinical_notes` RLS before FK validation, which is expected.

## updated_at Trigger Verification

The smoke test updated rows in:

- `visits`
- `visit_procedures`

Results:

- `visits.updated_at` changed after update,
- `visit_procedures.updated_at` changed after update.

This verifies the updated-at trigger behavior through observable row changes.

## RLS Verified

The smoke test checked role behavior using authenticated anon clients.

Allowed for `visits` and `visit_procedures`:

- `owner_admin`
- `doctor`
- `specialist`
- `assistant`

Denied for `visits` and `visit_procedures`:

- `reception_admin`
- `inventory_responsible`

Verified behavior:

- allowed roles can insert/select/update `visits`,
- allowed roles can insert/select/update `visit_procedures`,
- denied roles cannot insert `visits`,
- denied roles cannot insert `visit_procedures`,
- denied roles cannot read visit fixtures,
- hard delete does not remove rows through RLS.

## Assistant / Clinical Notes Nuance

This task intentionally did not expand `clinical_notes` RLS.

Current result:

- assistants can write `visits`,
- assistants can write `visit_procedures`,
- assistants cannot write `clinical_notes`.

Task 40C service-layer behavior should handle this explicitly:

- `owner_admin`, `doctor`, and `specialist` can persist clinical note text,
- assistants can persist procedure and next-step draft data,
- if an assistant enters clinical note text, the service/UI should show a
  permission-aware message or intentionally skip clinical note persistence.

## DB Lint

Command used:

```powershell
npx.cmd supabase db lint
```

Result:

- no schema errors found.

## What Could Not Be Automatically Verified

- Direct catalog-level checks for trigger/policy object names were not available
  through the local PostgREST API because no general SQL execution RPC exists.
- Trigger behavior, FK behavior, and RLS behavior were verified through actual
  authenticated database operations instead.
- Cross-clinic access was not tested because current local seed/provisioning
  contains one demo clinic only.

## Intentionally Not Changed

- No frontend persistence.
- No `visitCompletionService`.
- No VisitCompletionFlow behavior changes.
- No billing, payments, materials, attachments, appointment creation, treatment
  plan mutation, odontogram mutation, or follow-up workflow.
- No `clinical_notes` RLS expansion.

## Verification Summary

- `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `npx.cmd supabase db lint` passes.
- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
