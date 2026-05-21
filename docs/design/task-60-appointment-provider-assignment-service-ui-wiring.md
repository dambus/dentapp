# Task 60 - Appointment Provider Assignment Service/UI Wiring

## Scope

This task wires the Task 59 appointment provider assignment foundation into the service layer and appointment-related UI.

It keeps appointment assignment separate from `visits.completed_by`.

Out of scope remained out of scope:

- automatic provider assignment;
- provider workload calendar;
- provider availability conflict checking;
- check-in/in-room/ready-for-doctor states;
- billing, payments, materials, attachments;
- treatment-plan mutation;
- reminders/tasks;
- broad profile RLS opening;
- broad scheduling redesign.

## Provider Read Path

Created migration:

`supabase/migrations/20260521150000_create_assignable_appointment_providers_rpc.sql`

The migration adds `public.get_assignable_appointment_providers()`.

The RPC is `security definer` and returns only:

- `id`;
- `full_name`;
- `role`.

It returns active same-clinic `doctor` and `specialist` profiles only, and only for authenticated active users in appointment scheduling/read roles:

- `owner_admin`;
- `doctor`;
- `specialist`;
- `assistant`;
- `reception_admin`.

It does not broaden general `profiles` table read access and does not expose unnecessary profile fields.

## Appointment Service Changes

Updated `src/features/appointments/appointmentService.ts`.

Service changes:

- added `assigned_provider_id` to appointment reads;
- added `assignedProvider` display summary on mapped appointments;
- added `AppointmentProviderSummary`;
- added `fetchAssignableAppointmentProviders()`;
- added provider hydration for appointment list/detail/patient reads;
- added optional `assignedProviderId` to appointment creation input;
- added `updateAppointmentAssignedProvider()` for provider-only edits;
- added user-friendly provider assignment error messaging.

Assigned provider hydration uses the safe RPC instead of direct broad profile reads. If an assigned provider is no longer returned by the safe read path, the UI can still see the assignment id and show an unavailable-provider fallback.

## Appointment Creation Form

Updated `PatientAppointmentSummary`.

Changes:

- added optional `Assigned provider` dropdown;
- includes `Not assigned`;
- lists active same-clinic doctor/specialist providers from the safe RPC;
- submits `assigned_provider_id` when selected;
- preserves existing date/time/type/duration/reason/notes validation;
- preserves follow-up reason prefill behavior;
- allows appointment creation without a provider if provider options fail to load.

## Appointment Display Surfaces

Updated:

- `AppointmentCard`;
- `AppointmentDetailPage`;
- `AppointmentsPage` indirectly through shared `AppointmentCard`;
- `PatientAppointmentSummary` through shared appointment card display.

Display behavior:

- assigned provider is shown as `Provider: {name}` on appointment cards;
- unassigned appointments show `Provider: Not assigned`;
- unreadable/no-longer-active assigned providers show `Provider unavailable`;
- Appointment Detail shows an `Assigned provider` metric;
- Appointment Detail includes a provider-only edit control and save action.

The provider edit control updates only `assigned_provider_id`; it does not edit appointment time, reason, notes, lifecycle, patient, or visit data.

## Visit Completion Context

Updated `VisitCompletionFlow` appointment context.

The Visit Completion appointment context now shows:

- `Assigned provider`;
- provider name when assigned and readable;
- `Not assigned` when no appointment provider is set;
- `Provider unavailable` when the assignment id exists but the display row is not returned by the safe provider read path.

This is context only. Visit Completion persistence continues to write `visits.completed_by` from the authenticated completing profile.

## Completed-By Separation

No completed visit persistence behavior changed.

`appointments.assigned_provider_id` remains planned schedule context.

`visits.completed_by` remains the actual profile that completed the visit record.

Completed visit timeline/detail surfaces continue to show completed-by context independently.

## Smoke/RLS Coverage

Updated `supabase/snippets/testAppointmentProviderAssignmentRls.mjs`.

Added read-path coverage:

- owner/admin provider RPC includes active same-clinic doctor and specialist;
- provider RPC excludes assistant, reception, inventory, inactive doctor, suspended specialist, and cross-clinic doctor;
- inventory receives no assignable provider rows.

Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`.

Added stable browser coverage:

- appointment creation form shows provider dropdown;
- `Doctor Demo` can be selected;
- created appointment card displays assigned provider;
- provider display survives patient refresh;
- appointment detail displays assigned provider;
- appointment detail provider selector is prefilled;
- Visit Completion appointment context displays the assigned provider.

Existing lifecycle, follow-up, treatment plan, and Visit Completion happy-path coverage remains.

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

## Remaining Gaps

Remaining future work:

- provider availability/conflict checking;
- provider workload calendar;
- broader appointment editing if needed;
- provider filters in schedule views if needed;
- check-in/in-room/ready-for-doctor workflow states.
