# Task 43A - Appointments Data Model and RLS

Date: 2026-05-15

Status: Completed

## Scope

Task 43A adds the database and RLS foundation for appointments.

No UI, service layer, calendar, reminders, external calendar sync, billing, or Visit Completion bridge was added.

## Migration

Created:

- `supabase/migrations/20260515100000_create_appointments.sql`

The migration adds `public.appointments` with:

- `id`
- `clinic_id`
- `patient_id`
- `scheduled_start`
- `scheduled_end`
- `status`
- `reason`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Allowed statuses:

- `scheduled`
- `completed`
- `cancelled`
- `no_show`

Constraints:

- status check constraint,
- `scheduled_end` must be after `scheduled_start` when present,
- `patient_id` references `patients(id)` with cascade delete.

Indexes:

- `clinic_id`
- `patient_id`
- `scheduled_start`
- `status`
- `(clinic_id, status)`
- `(patient_id, scheduled_start)`
- `(clinic_id, scheduled_start)`

Trigger:

- `update_appointments_updated_at`

## RLS

RLS is enabled on `appointments`.

Policies are clinic-scoped and active-profile-scoped.

Read access:

- `owner_admin`
- `doctor`
- `specialist`
- `assistant`
- `reception_admin`

Create/update access:

- `owner_admin`
- `doctor`
- `specialist`
- `assistant`
- `reception_admin`

Denied:

- unauthenticated users,
- `inventory_responsible`.

Policies also require the appointment patient to belong to the same clinic as the appointment record.

No delete policy was added.

## Validation Snippet

Created:

- `supabase/snippets/testAppointmentsRls.mjs`

The snippet checks:

- appointments table access through service role,
- unauthenticated read/insert is blocked,
- allowed roles can read/insert/update appointments,
- inventory role cannot read/insert/update appointments,
- records use the expected patient context,
- `updated_at` changes on update,
- invalid status is rejected,
- invalid end time is rejected,
- invalid patient context is rejected,
- hard delete remains unavailable through RLS.

## Verification

Applied locally with:

```powershell
npx.cmd supabase db reset
```

Then re-provisioned local demo users.

Passing checks:

- `node .\supabase\snippets\provisionDemoAuthUsers.mjs`
- `node .\supabase\snippets\testAppointmentsRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`
- `npx.cmd supabase db lint`
- `npm.cmd run build`
- `npm.cmd run lint`

## Known Limitations

- No appointment UI.
- No appointment service layer.
- No calendar view.
- No reminder/notification model.
- No Google/Outlook sync.
- No link from appointments to visits yet.
- No visit completion bridge.
