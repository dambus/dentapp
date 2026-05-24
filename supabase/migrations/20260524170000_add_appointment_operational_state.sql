-- DentApp appointment operational state foundation.
-- Keeps day-of-visit clinic progression separate from appointment lifecycle
-- status, provider assignment, and Visit Completion attribution.

alter table public.appointments
add column operational_state text not null default 'not_arrived'
check (
  operational_state in ('not_arrived', 'arrived', 'ready_for_doctor')
);

comment on column public.appointments.operational_state is
  'Day-of-visit operational progression for scheduled appointments. Separate from lifecycle status, assigned provider, and visits.completed_by.';

create index appointments_clinic_operational_state_scheduled_start_idx
  on public.appointments (clinic_id, operational_state, scheduled_start);

create or replace function public.is_valid_appointment_operational_transition(
  current_lifecycle_status text,
  current_operational_state text,
  requested_operational_state text,
  has_linked_visit boolean
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    current_lifecycle_status = 'scheduled'
    and has_linked_visit = false
    and (
      (current_operational_state = 'not_arrived' and requested_operational_state = 'arrived')
      or (current_operational_state = 'arrived' and requested_operational_state = 'ready_for_doctor')
      or (current_operational_state = 'arrived' and requested_operational_state = 'not_arrived')
      or (current_operational_state = 'ready_for_doctor' and requested_operational_state = 'arrived')
    )
$$;

comment on function public.is_valid_appointment_operational_transition(text, text, text, boolean) is
  'Returns true for allowed day-of-visit appointment operational state transitions. Lifecycle status and Visit Completion links remain separate.';

revoke all on function public.is_valid_appointment_operational_transition(text, text, text, boolean) from public;
grant execute on function public.is_valid_appointment_operational_transition(text, text, text, boolean) to authenticated;

create or replace function public.enforce_appointment_operational_state_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_linked_visit boolean;
begin
  if tg_op <> 'UPDATE' or new.operational_state is not distinct from old.operational_state then
    return new;
  end if;

  select exists (
    select 1
    from public.visits as v
    where v.appointment_id = old.id
      and v.status in ('draft', 'in_progress', 'completed')
      and v.deleted_at is null
  )
  into has_linked_visit;

  if not public.is_valid_appointment_operational_transition(
    old.status,
    old.operational_state,
    new.operational_state,
    has_linked_visit
  ) then
    raise exception
      'invalid appointment operational_state transition'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function public.enforce_appointment_operational_state_transition() is
  'Enforces allowed appointment operational_state updates without changing appointment lifecycle or Visit Completion behavior.';

revoke all on function public.enforce_appointment_operational_state_transition() from public;

create trigger enforce_appointment_operational_state_transition
before update of operational_state
on public.appointments
for each row
execute function public.enforce_appointment_operational_state_transition();
