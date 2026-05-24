# Task 67 - Appointment Operational State Planning / Data Model Decision

This task documents the smallest safe path for adding day-of-visit appointment
operational states without changing runtime behavior yet.

## Current-State Findings

Reviewed implementation:

- `supabase/migrations/20260515100000_create_appointments.sql`
- `supabase/migrations/20260521143000_add_appointment_assigned_provider.sql`
- `src/features/appointments/appointmentService.ts`
- `src/pages/AppointmentsPage.tsx`
- `src/pages/AppointmentDetailPage.tsx`
- `src/features/patients/PatientAppointmentSummary.tsx`
- `src/features/appointments/AppointmentCard.tsx`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/features/visits/visitCompletionService.ts`
- appointment/provider/lifecycle RLS and browser smoke snippets

The current appointment status model is intentionally small:

- `scheduled`
- `completed`
- `cancelled`
- `no_show`

The database enforces this through a `status text not null default 'scheduled'`
check constraint on `public.appointments`.

The frontend service mirrors the same model with `AppointmentStatus` and
`appointmentStatuses`. Unknown status values are normalized back to `scheduled`
when rows are mapped.

Direct lifecycle updates are intentionally limited:

- `appointmentService.updateAppointmentStatus()` accepts only `cancelled` and
  `no_show`;
- direct manual `completed` updates are rejected;
- `canUpdateAppointmentLifecycle()` requires a `scheduled` appointment with no
  linked open or completed Visit Completion;
- Visit Completion completion marks a linked appointment `completed` through
  `markLinkedAppointmentCompleted()`.

Provider assignment is already separate:

- `appointments.assigned_provider_id` stores planned provider assignment;
- assignable providers are limited to active same-clinic doctors/specialists;
- `visits.completed_by` remains the actual completion attribution.

There is currently no persisted field for day-of-visit operational progress
such as arrival, check-in, seating, or ready-for-doctor state.

## Decision

Do not add `arrived`, `in_room`, or `ready_for_doctor` to
`appointments.status`.

Operational progression should be modeled separately from appointment
lifecycle status. The existing `status` column should continue to answer:

- is the appointment scheduled;
- was it cancelled;
- was it marked no-show;
- was a linked Visit Completion completed.

Day-of-visit state should answer a different question:

- where is this scheduled patient in the clinic workflow right now.

Recommended MVP data model:

```sql
alter table public.appointments
add column operational_state text not null default 'not_arrived'
check (
  operational_state in ('not_arrived', 'arrived', 'ready_for_doctor')
);
```

Use `text` plus a check constraint, not a Postgres enum, to match the existing
appointment `status` style and keep later state additions simpler.

Do not add an event table for MVP. A related event/history model may be useful
later for waiting-time analytics or detailed audit, but it is not needed for
the first operational workflow.

Use the existing appointment `updated_by` and `updated_at` fields for the first
implementation. If clinics later need a distinct operational audit trail, add
`appointment_operational_events` in a separate analytics/audit task.

## Minimal States

Recommended MVP state set:

- `not_arrived` - default for scheduled appointments; no day-of-visit progress
  recorded.
- `arrived` - front desk or clinic staff has checked the patient in.
- `ready_for_doctor` - staff has indicated the patient is ready for clinical
  handoff.

Do not add `in_room` for MVP. Without a room/chair/resource model, `in_room`
creates ambiguity and invites a workflow commitment the product does not yet
support. It can be added later if chairside workflow proves it is needed.

Recommended display labels:

- `Not arrived`
- `Arrived`
- `Ready for doctor`

## Allowed Transitions

Operational transitions should be allowed only while the appointment lifecycle
status is `scheduled`.

| Current lifecycle | Current operational | Action | Next operational | Allowed | Notes |
| --- | --- | --- | --- | --- | --- |
| `scheduled` | `not_arrived` | Mark arrived | `arrived` | Yes | Normal front-desk check-in. |
| `scheduled` | `arrived` | Mark ready for doctor | `ready_for_doctor` | Yes | Normal clinical handoff. |
| `scheduled` | `ready_for_doctor` | Move back to arrived | `arrived` | Yes | Correction path before Visit Completion is linked. |
| `scheduled` | `arrived` | Move back to not arrived | `not_arrived` | Yes | Correction path before Visit Completion is linked. |
| `scheduled` | any | Cancel appointment | unchanged | Existing lifecycle rule | Only if no linked open/completed visit exists. |
| `scheduled` | any | Mark no-show | unchanged | Existing lifecycle rule | Only if no linked open/completed visit exists. |
| `scheduled` | any | Start visit | unchanged | Yes | Start visit should not require operational readiness for MVP. |
| `scheduled` | any | Continue visit | unchanged | Yes | Existing linked draft/in-progress Visit Completion flow. |
| `completed` | any | Update operational state | unchanged | No | Completed Visit Completion is the source of truth. |
| `cancelled` | any | Update operational state | unchanged | No | Terminal scheduling state. |
| `no_show` | any | Update operational state | unchanged | No | Terminal scheduling state. |

Do not automatically reset operational state when cancelling or marking
no-show. If a patient arrived and the appointment was later cancelled, that
operational value may still be useful context. The terminal lifecycle status
should dominate the UI.

## Visit Completion Interaction

Visit Completion should be allowed to begin before the appointment is marked
`arrived` or `ready_for_doctor`.

Reasoning:

- the current product already allows `Start visit` from any `scheduled`
  appointment;
- emergency, backfilled, or fast-moving clinic workflows may bypass reception
  state updates;
- forcing an operational state would make a new scheduling feature block the
  existing clinical completion workflow.

The first implementation should keep operational state manual and independent.
Starting or completing a visit should not silently change operational state.

Once a linked Visit Completion exists, operational state edits should be
blocked for MVP. This keeps the operational progression from conflicting with
clinical persistence. If a correction workflow is needed later, it should be an
explicit admin/audit feature.

## Role and RLS Implications

Operational state updates should be available to active same-clinic users whose
roles already participate in clinical scheduling:

- `owner_admin`
- `reception_admin`
- `assistant`
- `doctor`
- `specialist`

`inventory_responsible` should not update operational state.

This matches the existing appointment create/update role set and excludes
inventory-only users from day-of-visit workflow mutation.

Recommended RLS/service validation for implementation:

- row must belong to `public.current_clinic_id()`;
- user profile must be active;
- user role must be one of the scheduling/clinical roles above;
- appointment lifecycle `status` must be `scheduled`;
- requested `operational_state` must be in the allowed set;
- transition must be allowed by the service transition table;
- no linked `draft`, `in_progress`, or `completed` Visit Completion may exist
  when changing operational state;
- `updated_by` must be null or `public.current_profile_id()`;
- provider assignment validation must remain unchanged;
- `visits.completed_by` must not be written by operational state updates.

Implementation should add a dedicated service function such as
`updateAppointmentOperationalState()` instead of reusing
`updateAppointmentStatus()`. The separation keeps lifecycle and operational
progression explicit in code.

## UI Impact Map

Future implementation should touch these surfaces:

- Daily schedule cards: show a compact operational chip and lightweight actions
  for `Mark arrived` and `Ready for doctor`.
- Daily schedule filter bar: no new filter is required for MVP unless visual
  QA shows the state chip is hard to scan.
- Weekly schedule: show state read-only only if it remains compact; avoid
  adding operational controls to the weekly list for MVP.
- Appointment detail: show current operational state and allow valid manual
  transitions when eligible.
- Patient appointment summary: show operational state for the next appointment
  as read-only context; keep creation/editing focused on scheduling fields.
- Visit Completion context: show operational state as read-only appointment
  context only. Do not update it from Visit Completion.

Existing provider display wording remains separate:

- `Assigned provider`
- `Not assigned`
- `Provider unavailable`

Existing lifecycle wording remains separate:

- `Scheduled`
- `Completed`
- `Cancelled`
- `No-show`

## Test Plan

RLS/service smoke coverage should verify:

- allowed same-clinic roles can move `not_arrived -> arrived`;
- allowed same-clinic roles can move `arrived -> ready_for_doctor`;
- correction transitions are allowed only while no Visit Completion is linked;
- invalid states are rejected;
- cross-clinic updates are rejected;
- inactive profiles are rejected;
- `inventory_responsible` cannot update operational state;
- terminal lifecycle appointments cannot update operational state;
- appointments with linked draft, in-progress, or completed visits cannot update
  operational state;
- operational updates do not change `assigned_provider_id`;
- operational updates do not change `visits.completed_by`.

Browser smoke coverage should verify:

- daily appointment cards show the operational chip;
- valid state actions update the visible card state;
- cancellation/no-show lifecycle actions remain governed by existing rules;
- `Start visit`, `Continue visit`, and `View visit` still work;
- Visit Completion context displays operational state read-only if implemented;
- responsive overflow checks still pass on appointments, appointment detail,
  and Visit Completion screens.

## Proposed Phased Implementation

1. Schema/RLS foundation
   - Add `appointments.operational_state`.
   - Add check constraint and index only if query patterns require it.
   - Update appointment RLS tests for allowed roles and blocked cases.

2. Service/types foundation
   - Add `AppointmentOperationalState` type.
   - Hydrate `operational_state` through appointment select lists.
   - Add `updateAppointmentOperationalState()` and transition validation.

3. Schedule UI
   - Add compact operational chip to daily appointment cards.
   - Add eligible state actions without changing lifecycle menus.
   - Keep weekly view read-only or minimally labeled.

4. Detail and patient context
   - Add appointment detail state display/update controls.
   - Add read-only state display to patient appointment summary.

5. Visit Completion context and smoke coverage
   - Display operational state as read-only context.
   - Expand browser smoke and RLS scripts.

6. Later, only if needed
   - Add `in_room` or room/chair assignment.
   - Add operational event history.
   - Add waiting-time analytics.
   - Add clinic-configurable workflow enforcement.

## Explicit Non-Goals

This decision does not add runtime behavior and does not implement:

- schema or migrations;
- RLS changes;
- service changes;
- UI changes;
- automatic room assignment;
- waiting-time analytics;
- provider workload or availability;
- reminders or tasks;
- billing, materials, attachments, or payments;
- treatment-plan mutation.
