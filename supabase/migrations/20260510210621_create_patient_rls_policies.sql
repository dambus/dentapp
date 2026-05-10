-- DentApp patient RLS helper functions and initial policies.
-- Policies are intentionally conservative:
-- - every table policy is scoped to the authenticated user's active profile,
-- - patient-related access is limited to the user's own clinic,
-- - write access is role-limited,
-- - no hard delete policies are created.

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles as p
  where p.auth_user_id = auth.uid()
    and p.status = 'active'
  limit 1
$$;

comment on function public.current_profile_id() is
  'Returns the active application profile id for the current Supabase auth user.';

create or replace function public.current_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.clinic_id
  from public.profiles as p
  where p.auth_user_id = auth.uid()
    and p.status = 'active'
  limit 1
$$;

comment on function public.current_clinic_id() is
  'Returns the clinic id for the current active application profile.';

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles as p
  where p.auth_user_id = auth.uid()
    and p.status = 'active'
  limit 1
$$;

comment on function public.current_user_role() is
  'Returns the role for the current active application profile.';

create or replace function public.is_active_profile()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles as p
    where p.auth_user_id = auth.uid()
      and p.status = 'active'
  )
$$;

comment on function public.is_active_profile() is
  'Returns true when the current Supabase auth user has an active application profile.';

create or replace function public.has_role(roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = any(roles)
$$;

comment on function public.has_role(text[]) is
  'Returns true when the current active application profile role is included in the provided role list.';

revoke all on function public.current_profile_id() from public;
revoke all on function public.current_clinic_id() from public;
revoke all on function public.current_user_role() from public;
revoke all on function public.is_active_profile() from public;
revoke all on function public.has_role(text[]) from public;

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_clinic_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_active_profile() to authenticated;
grant execute on function public.has_role(text[]) to authenticated;

create policy "Active users can view own clinic"
on public.clinics
for select
to authenticated
using (
  public.is_active_profile()
  and id = public.current_clinic_id()
);

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
  public.is_active_profile()
  and id = public.current_profile_id()
);

create policy "Owner admins can view clinic profiles"
on public.profiles
for select
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array['owner_admin'])
);

create policy "Clinical and admin roles can view clinic patients"
on public.patients
for select
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant',
    'reception_admin'
  ])
);

create policy "Allowed roles can create clinic patients"
on public.patients
for insert
to authenticated
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'reception_admin'
  ])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Allowed roles can update clinic patients"
on public.patients
for update
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'reception_admin'
  ])
)
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'reception_admin'
  ])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Clinical roles can view clinic medical records"
on public.patient_medical_records
for select
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant'
  ])
);

create policy "Clinical roles can create clinic medical records"
on public.patient_medical_records
for insert
to authenticated
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist'
  ])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Clinical roles can update clinic medical records"
on public.patient_medical_records
for update
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist'
  ])
)
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist'
  ])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Clinical roles can view clinic clinical notes"
on public.clinical_notes
for select
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist'
  ])
);

create policy "Clinical roles can create clinic clinical notes"
on public.clinical_notes
for insert
to authenticated
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist'
  ])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Clinical roles can update clinic clinical notes"
on public.clinical_notes
for update
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist'
  ])
)
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist'
  ])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);
