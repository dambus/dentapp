-- DentApp appointment provider assignment foundation.
-- Adds nullable appointment provider assignment while keeping it separate from
-- visits.completed_by, which records the actual profile completing a visit.

alter table public.appointments
add column assigned_provider_id uuid;

alter table public.appointments
add constraint appointments_assigned_provider_id_fkey
foreign key (assigned_provider_id)
references public.profiles(id)
on delete set null;

comment on column public.appointments.assigned_provider_id is
  'Optional planned provider assignment for the appointment. This is separate from visits.completed_by, which records the actual completing profile.';

create index appointments_clinic_provider_scheduled_start_idx
  on public.appointments (clinic_id, assigned_provider_id, scheduled_start);

create or replace function public.is_valid_appointment_assigned_provider(
  appointment_clinic_id uuid,
  provider_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    provider_profile_id is null
    or exists (
      select 1
      from public.profiles as p
      where p.id = provider_profile_id
        and p.clinic_id = appointment_clinic_id
        and p.status = 'active'
        and p.role in ('doctor', 'specialist')
    )
$$;

comment on function public.is_valid_appointment_assigned_provider(uuid, uuid) is
  'Returns true when an appointment provider assignment is null or points to an active same-clinic doctor/specialist profile.';

revoke all on function public.is_valid_appointment_assigned_provider(uuid, uuid) from public;
grant execute on function public.is_valid_appointment_assigned_provider(uuid, uuid) to authenticated;

create or replace function public.enforce_appointment_assigned_provider()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_valid_appointment_assigned_provider(
    new.clinic_id,
    new.assigned_provider_id
  ) then
    raise exception
      'assigned_provider_id must reference an active same-clinic doctor or specialist profile'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function public.enforce_appointment_assigned_provider() is
  'Enforces safe appointment assigned provider references before appointment insert/update.';

revoke all on function public.enforce_appointment_assigned_provider() from public;

create trigger enforce_appointment_assigned_provider
before insert or update of clinic_id, assigned_provider_id
on public.appointments
for each row
execute function public.enforce_appointment_assigned_provider();

drop policy if exists "Scheduling roles can create clinic appointments"
on public.appointments;

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
  and public.is_valid_appointment_assigned_provider(
    clinic_id,
    assigned_provider_id
  )
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

drop policy if exists "Scheduling roles can update clinic appointments"
on public.appointments;

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
  and public.is_valid_appointment_assigned_provider(
    clinic_id,
    assigned_provider_id
  )
  and (updated_by is null or updated_by = public.current_profile_id())
);
