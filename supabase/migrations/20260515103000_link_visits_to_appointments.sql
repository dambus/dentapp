-- Formalizes the lightweight Appointment -> Visit Completion bridge.
-- The visit table already had a nullable appointment_id placeholder; this
-- migration adds the actual reference and lookup index now that appointments
-- exist.

alter table public.visits
  add constraint visits_appointment_id_fkey
  foreign key (appointment_id)
  references public.appointments(id)
  on delete set null;

create index visits_appointment_id_idx
  on public.visits (appointment_id);

comment on column public.visits.appointment_id is
  'Optional appointment that started this Visit Completion workflow. Completing a linked visit marks the appointment completed.';
