# Task 68 - Appointment Operational State Schema/RLS Foundation

This task implements the database foundation for day-of-visit appointment
operational state without adding visible UI controls.

## Migration

Created migrations:

`supabase/migrations/20260524170000_add_appointment_operational_state.sql`

`supabase/migrations/20260524171000_harden_appointment_operational_state_insert.sql`

The migrations add:

- `public.appointments.operational_state text not null default 'not_arrived'`;
- check constraint limiting values to:
  - `not_arrived`;
  - `arrived`;
  - `ready_for_doctor`;
- column comment clarifying that operational state is separate from:
  - appointment lifecycle `status`;
  - `assigned_provider_id`;
  - `visits.completed_by`;
- index `appointments_clinic_operational_state_scheduled_start_idx`.

Existing appointment rows remain valid because the new column has a
`not_arrived` default.

## Transition Enforcement

The migration adds:

- `public.is_valid_appointment_operational_transition(...)`;
- `public.enforce_appointment_operational_state_transition()`;
- trigger `enforce_appointment_operational_state_transition`.

Allowed updates:

- `not_arrived -> arrived`;
- `arrived -> ready_for_doctor`;
- `arrived -> not_arrived`;
- `ready_for_doctor -> arrived`.

Operational state updates are rejected when:

- a new appointment is inserted with an operational state other than
  `not_arrived`;
- appointment lifecycle status is not `scheduled`;
- a linked `draft`, `in_progress`, or `completed` Visit Completion exists;
- the requested transition is outside the allowed set.

The trigger runs on appointment insert and when `operational_state` changes.
Existing lifecycle, provider assignment, and Visit Completion status updates
are not changed by this task.

## RLS Boundary

No broad appointment access was added.

Operational state updates continue through the existing appointment update
policy, which is scoped by:

- active profile;
- same clinic;
- existing patient context;
- scheduling/clinical roles:
  - `owner_admin`;
  - `doctor`;
  - `specialist`;
  - `assistant`;
  - `reception_admin`;
- `updated_by` matching the current profile when supplied.

`inventory_responsible` remains blocked by existing appointment RLS.

The new trigger adds field-specific operational transition enforcement that
RLS alone cannot express safely.

## Test Coverage

Created:

`supabase/snippets/testAppointmentOperationalStateRls.mjs`

Coverage:

- verifies `operational_state` is readable;
- verifies the transition helper allows `not_arrived -> arrived`;
- verifies new appointment rows default to `not_arrived`;
- verifies allowed same-clinic roles can mark appointments `arrived`;
- verifies owner/admin can move:
  - `not_arrived -> arrived`;
  - `arrived -> ready_for_doctor`;
  - `ready_for_doctor -> arrived`;
  - `arrived -> not_arrived`;
- verifies `inventory_responsible` cannot update operational state;
- verifies a same-clinic user cannot update a cross-clinic appointment;
- verifies invalid operational state values are rejected;
- verifies new appointment inserts cannot start in a progressed operational
  state;
- verifies operational state updates do not change:
  - appointment lifecycle `status`;
  - `assigned_provider_id`;
  - `visits.completed_by`;
- verifies cancelled, no-show, completed, and linked-completed appointments
  cannot advance operational state.

## Boundaries

No visible UI controls, appointment cards, appointment detail controls, patient
summary display, Visit Completion UI, filters, room/chair model, waiting queue,
analytics, provider workload, availability logic, billing, materials,
attachments, payments, treatment-plan mutation, reminders, or tasks were added.

Start visit behavior remains unchanged and does not require
`ready_for_doctor`.
