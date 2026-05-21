# Task 59 - Appointment Provider Assignment Schema/RLS Foundation

## Scope

This task implements the minimal data and RLS foundation for appointment provider assignment.

It does not add provider assignment UI, appointment form provider selection, provider display wiring, automatic assignment, provider workload calendars, check-in states, billing, materials, treatment-plan mutation, reminders, or tasks.

## Migration

Created migration:

`supabase/migrations/20260521143000_add_appointment_assigned_provider.sql`

The migration adds:

- nullable `public.appointments.assigned_provider_id uuid`;
- FK `appointments_assigned_provider_id_fkey` to `public.profiles(id)`;
- `on delete set null`;
- column comment clarifying that assignment is separate from `visits.completed_by`;
- index `appointments_clinic_provider_scheduled_start_idx` on:
  - `clinic_id`;
  - `assigned_provider_id`;
  - `scheduled_start`.

No existing appointment rows were backfilled.

## Enforcement Approach

The migration adds `public.is_valid_appointment_assigned_provider(appointment_clinic_id uuid, provider_profile_id uuid)`.

The helper returns true when:

- `provider_profile_id` is null; or
- the profile exists;
- the profile belongs to the same clinic as the appointment;
- the profile status is `active`;
- the profile role is `doctor` or `specialist`.

The migration also adds trigger function `public.enforce_appointment_assigned_provider()` and trigger `enforce_appointment_assigned_provider`.

The trigger runs before appointment insert and before updates to `clinic_id` or `assigned_provider_id`. It rejects unsafe provider references even when a privileged client bypasses RLS.

Appointment insert/update RLS policies were recreated with the same existing clinic, patient, role, created-by, and updated-by checks, plus the new provider validation helper in `with check`.

## Allowed Assignment Rules

Allowed:

- null `assigned_provider_id`;
- active same-clinic `doctor`;
- active same-clinic `specialist`.

Blocked:

- cross-clinic provider profile;
- inactive provider profile;
- suspended provider profile;
- assistant profile;
- reception profile;
- inventory profile;
- any other non-provider role;
- appointment updates from roles that cannot update appointments under existing RLS.

## Completed By Separation

`appointments.assigned_provider_id` is planned appointment context.

`visits.completed_by` remains the actual profile that completed the visit record.

Task 59 does not copy assignment into `completed_by`, does not infer completion identity from assignment, and does not change Visit Completion persistence behavior.

## RLS Test Coverage

Created:

`supabase/snippets/testAppointmentProviderAssignmentRls.mjs`

Coverage:

- verifies the new column is readable by the service client;
- verifies the provider validation helper allows null assignment;
- verifies owner/admin can create appointments assigned to an active same-clinic doctor;
- verifies owner/admin can create appointments assigned to an active same-clinic specialist;
- verifies owner/admin can create appointments with null assignment;
- verifies owner/admin can update assignment to doctor, specialist, and null;
- verifies create/update reject:
  - cross-clinic doctor;
  - inactive doctor;
  - suspended specialist;
  - assistant;
  - reception;
  - inventory;
- verifies inventory cannot update an appointment assignment through existing appointment RLS;
- verifies changing appointment assignment does not change `visits.completed_by`.

The script creates temporary fixture profiles for invalid provider cases and cleans them up after the run.

## Provider Display Read Path

Task 59 intentionally does not broaden profile read access.

Task 60 or the provider UI implementation should add a safe provider display path. Recommended options remain:

- limited same-clinic provider profile read policy exposing only scheduling-safe fields;
- or a secure view/RPC returning provider display data.

The UI should not depend on broad clinic profile read access.

## Remaining Implementation Work

Future provider assignment implementation should update:

- appointment service types and select lists;
- appointment creation form provider selector;
- appointment cards;
- appointment detail;
- patient appointment summary;
- Visit Completion appointment context;
- browser smoke fixtures for provider display.

## Validation

Validated locally with:

- `npx.cmd supabase migration up`;
- `npm.cmd run build`;
- `npm.cmd run lint`;
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs`;
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`;
- `node .\supabase\snippets\testVisitCompletionRls.mjs`;
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs`.

The existing Vite large-chunk warning remains.
