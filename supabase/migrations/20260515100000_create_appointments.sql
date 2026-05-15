-- DentApp appointments foundation.
-- Adds the first lightweight appointment table for patient scheduling context.
-- UI, calendar views, reminders, external calendar sync, billing, and Visit
-- Completion bridging are intentionally deferred.

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id) on delete cascade,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'completed', 'cancelled', 'no_show')
  ),
  reason text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_end_after_start_check check (
    scheduled_end is null or scheduled_end > scheduled_start
  )
);

comment on table public.appointments is
  'MVP appointment records for patient scheduling context. Calendar UI, reminders, external sync, billing, and visit bridging are deferred.';
comment on column public.appointments.scheduled_start is
  'Planned appointment start time.';
comment on column public.appointments.scheduled_end is
  'Optional planned appointment end time. Must be after scheduled_start when present.';
comment on column public.appointments.status is
  'Lightweight appointment lifecycle status: scheduled, completed, cancelled, or no_show.';

create index appointments_clinic_id_idx
  on public.appointments (clinic_id);
create index appointments_patient_id_idx
  on public.appointments (patient_id);
create index appointments_scheduled_start_idx
  on public.appointments (scheduled_start);
create index appointments_status_idx
  on public.appointments (status);
create index appointments_clinic_status_idx
  on public.appointments (clinic_id, status);
create index appointments_patient_scheduled_start_idx
  on public.appointments (patient_id, scheduled_start);
create index appointments_clinic_scheduled_start_idx
  on public.appointments (clinic_id, scheduled_start);

create trigger update_appointments_updated_at
before update on public.appointments
for each row
execute function public.update_updated_at_column();

alter table public.appointments enable row level security;

create policy "Patient roles can view clinic appointments"
on public.appointments
for select
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and exists (
    select 1
    from public.patients as p
    where p.id = appointments.patient_id
      and p.clinic_id = appointments.clinic_id
  )
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant',
    'reception_admin'
  ])
);

create policy "Scheduling roles can create clinic appointments"
on public.appointments
for insert
to authenticated
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and exists (
    select 1
    from public.patients as p
    where p.id = appointments.patient_id
      and p.clinic_id = appointments.clinic_id
  )
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant',
    'reception_admin'
  ])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Scheduling roles can update clinic appointments"
on public.appointments
for update
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and exists (
    select 1
    from public.patients as p
    where p.id = appointments.patient_id
      and p.clinic_id = appointments.clinic_id
  )
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant',
    'reception_admin'
  ])
)
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and exists (
    select 1
    from public.patients as p
    where p.id = appointments.patient_id
      and p.clinic_id = appointments.clinic_id
  )
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant',
    'reception_admin'
  ])
  and (updated_by is null or updated_by = public.current_profile_id())
);
