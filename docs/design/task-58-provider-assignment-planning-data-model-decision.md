# Task 58 - Provider Assignment Planning / Data Model Decision

## Scope

This task reviewed provider assignment support for appointments and clinical workflows. It is a planning and implementation-decision task only.

No schema migration, service behavior, UI behavior, RLS policy, fake provider data, or provider assignment workflow was implemented.

## Current Schema Findings

### Profiles

Provider-like users currently live in `public.profiles`.

Relevant fields:

- `id uuid primary key`;
- `auth_user_id uuid unique references auth.users(id)`;
- `clinic_id uuid not null references public.clinics(id)`;
- `full_name text not null`;
- `email text`;
- `role text not null` with supported roles:
  - `owner_admin`;
  - `doctor`;
  - `specialist`;
  - `assistant`;
  - `reception_admin`;
  - `inventory_responsible`;
- `status text not null default 'active'` with supported statuses:
  - `invited`;
  - `active`;
  - `inactive`;
  - `suspended`.

Existing profile indexes include clinic, auth user, and clinic/role access patterns.

Current profile RLS is intentionally narrow:

- every active user can read their own profile;
- owner/admin users can read profiles in their clinic;
- non-owner appointment readers do not currently have broad clinic-profile read access.

This matters because appointment provider display needs a safe way for doctors, specialists, assistants, and reception users to resolve assigned provider names.

### Appointments

Appointments currently include:

- `clinic_id`;
- `patient_id`;
- `scheduled_start`;
- `scheduled_end`;
- `status`;
- `reason`;
- `notes`;
- `created_by`;
- `updated_by`;
- timestamps.

There is no existing appointment provider, doctor, owner, assignee, or resource field.

Appointment RLS already scopes reads and writes by active profile, current clinic, same-clinic patient, and scheduling/clinical roles. The current appointment write roles are:

- `owner_admin`;
- `doctor`;
- `specialist`;
- `assistant`;
- `reception_admin`.

`inventory_responsible` is outside appointment read/write scope.

### Visits

Completed visit records already track actual completion separately through:

- `visits.completed_by uuid references public.profiles(id)`;
- `created_by`;
- `updated_by`.

`completed_by` is set by Visit Completion persistence to the current authenticated profile completing the visit. It is not a scheduled provider assignment.

Existing visit UI shows completed-by provider context when the profile name is readable. If RLS prevents reading that profile row, the UI falls back to unavailable/recorded-state wording.

### Current UI Reality

Current provider-related UI copy is placeholder/context-only:

- Appointment cards show `Provider TBD`.
- Visit Completion appointment context shows `Not assigned in appointment record`.
- Completed visit timeline/detail surfaces show completed-by context as `Provider` when readable, otherwise `Provider not recorded`.

There is no provider selector in appointment creation, no appointment detail provider field, and no provider filter in the schedule.

Treatment plan read-only surfaces are not provider-aware and do not need changes for the minimal appointment provider assignment model.

## Recommended Decision

Add a nullable appointment assignment field in the next implementation task:

```sql
alter table public.appointments
add column assigned_provider_id uuid null;
```

Recommended field name: `assigned_provider_id`.

Recommended FK target: `public.profiles(id)`.

Recommended delete behavior: `on delete set null`.

## Naming Decision

Use `assigned_provider_id`.

Rationale:

- It clearly describes a planned appointment assignment.
- It does not imply the provider actually completed the visit.
- It avoids confusion with `visits.completed_by`, which records the actual user who completed the clinical record.
- It is broader than `doctor_id`, because specialists can also be appointment providers.
- It is clearer than `provider_id`, which can be ambiguous in clinical and billing contexts.

## Minimal Data Model for Next Task

The next implementation task should add:

- nullable `appointments.assigned_provider_id`;
- FK to `public.profiles(id) on delete set null`;
- same-clinic enforcement between the appointment and assigned provider;
- active provider role enforcement for `doctor` and `specialist`;
- an index for provider/day schedule queries.

Recommended index:

```sql
create index appointments_clinic_provider_scheduled_start_idx
on public.appointments (clinic_id, assigned_provider_id, scheduled_start);
```

Same-clinic and role/status enforcement cannot be handled by a simple single-column FK alone. The implementation should use one of these minimal approaches:

- a composite FK/check helper approach that guarantees the provider profile belongs to the same clinic;
- a trigger or policy helper that verifies `assigned_provider_id` points to an active same-clinic `doctor` or `specialist`.

The selected approach should also account for role/status changes over time. Historical appointments may keep an assigned provider who later becomes inactive, but new assignments should require an active provider.

## RLS and Security Considerations

### Read Access

Appointment readers should be able to read the assigned provider for same-clinic appointments if they can already read the appointment.

Because profile RLS is currently narrow, provider-name display needs an explicit safe read path. Recommended options:

- add a limited profile read policy for active same-clinic provider profiles for appointment read roles;
- or expose assigned provider display data through a secure view/RPC.

The policy/view should expose only the fields needed for scheduling display, such as:

- profile id;
- full name;
- role;
- status.

It should not broaden access to unrelated profile metadata.

### Write Access

Provider assignment should follow the current appointment write role boundary unless a stricter product decision is made:

- `owner_admin`;
- `doctor`;
- `specialist`;
- `assistant`;
- `reception_admin`.

The policy should reject:

- cross-clinic provider assignment;
- inactive or suspended provider assignment for new writes;
- assignment to roles outside `doctor` and `specialist`;
- writes from `inventory_responsible`;
- writes by inactive users.

Null assignment should remain allowed so appointments can be scheduled before a provider is known.

### Completed By Is Separate

`assigned_provider_id` must not replace or auto-populate `visits.completed_by`.

The assignment is planned context. `completed_by` is the authenticated profile that completes the clinical visit record. Visit Completion can display the appointment assignment as context, but the completed visit record must continue to preserve actual completion identity.

## UI Implementation Impact

The implementation task should update:

- appointment creation form: optional assigned provider selector;
- appointment service types and select lists: include assigned provider id and display data;
- appointment cards: replace `Provider TBD` with assigned provider name or a clear unassigned state;
- appointment detail: show assigned provider when present;
- appointments page: keep current schedule view working, with provider filtering deferred unless explicitly scoped;
- patient appointment summary: show assigned provider for upcoming appointments and include selector in creation;
- Visit Completion appointment context: show assigned provider from the linked appointment when present;
- completed visit detail/timeline: keep actual completed-by separate and do not rename it into appointment provider assignment;
- browser smoke fixtures: create or select appointments with a stable provider where needed.

Treatment plan summary/detail surfaces do not need provider assignment changes in the minimal appointment implementation.

## Testing Plan for Implementation

Add or update tests when provider assignment is implemented:

- appointment creation succeeds with a same-clinic active doctor provider;
- appointment creation succeeds with a same-clinic active specialist provider;
- appointment creation succeeds with no provider;
- appointment card/detail/patient summary display assigned provider when present;
- Visit Completion appointment context displays assigned provider when launched from an assigned appointment;
- completed visit detail still displays actual `completed_by` independently;
- cross-clinic provider assignment is blocked;
- inactive/suspended provider assignment is blocked for new writes;
- assignment to assistant/reception/inventory roles is blocked;
- role behavior is verified for `owner_admin`, `doctor`, `specialist`, `assistant`, `reception_admin`, and `inventory_responsible`;
- existing appointment lifecycle and Visit Completion browser smoke tests still pass.

## Implementation Checklist for Next Task

- Add appointment migration with `assigned_provider_id`.
- Add same-clinic and role/status enforcement.
- Add provider schedule index.
- Decide and implement the provider-profile read path.
- Update appointment service types, mappers, and queries.
- Add provider option loading for appointment creation.
- Update appointment creation form.
- Update AppointmentCard, AppointmentDetail, AppointmentsPage surfaces as scoped.
- Update PatientAppointmentSummary.
- Update Visit Completion appointment context.
- Add focused appointment-provider RLS coverage.
- Update browser smoke with stable provider checks.
- Document the completed implementation and remaining gaps.

## Explicit Non-Implementation Note

Task 58 did not implement functional provider assignment. It produced the schema/security/UI/testing decision needed for a follow-up implementation task.

Out-of-scope items remain out of scope:

- check-in/in-room/ready-for-doctor states;
- billing, payments, materials, attachments;
- treatment-plan mutation;
- reminders/tasks;
- provider workload calendar;
- automatic provider assignment;
- fake provider data;
- broad scheduling redesign.
