-- DentApp safe appointment provider read path.
-- Exposes only active same-clinic doctor/specialist display data needed for
-- appointment assignment dropdowns and assigned-provider labels.

create or replace function public.get_assignable_appointment_providers()
returns table (
  id uuid,
  full_name text,
  role text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.role
  from public.profiles as p
  where public.is_active_profile()
    and public.has_role(array[
      'owner_admin',
      'doctor',
      'specialist',
      'assistant',
      'reception_admin'
    ])
    and p.clinic_id = public.current_clinic_id()
    and p.status = 'active'
    and p.role in ('doctor', 'specialist')
  order by p.full_name asc, p.role asc, p.id asc
$$;

comment on function public.get_assignable_appointment_providers() is
  'Returns active same-clinic doctor/specialist profile display rows for appointment assignment. Does not expose broad profile data.';

revoke all on function public.get_assignable_appointment_providers() from public;
grant execute on function public.get_assignable_appointment_providers() to authenticated;
