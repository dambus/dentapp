-- Require new appointments to begin without day-of-visit progression.

create or replace function public.enforce_appointment_operational_state_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_linked_visit boolean;
begin
  if tg_op = 'INSERT' then
    if new.operational_state <> 'not_arrived' then
      raise exception
        'new appointments must start with operational_state not_arrived'
        using errcode = '23514';
    end if;

    return new;
  end if;

  if new.operational_state is not distinct from old.operational_state then
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

drop trigger if exists enforce_appointment_operational_state_transition
on public.appointments;

create trigger enforce_appointment_operational_state_transition
before insert or update of operational_state
on public.appointments
for each row
execute function public.enforce_appointment_operational_state_transition();
