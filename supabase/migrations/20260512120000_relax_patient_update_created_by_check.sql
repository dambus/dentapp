-- Patient lifecycle updates should be clinic-and-role based.
-- The original update policy also required created_by to be null or equal to
-- the current profile, which blocked allowed roles from updating a clinic
-- patient created by another allowed user. Keep updated_by tied to the current
-- profile and continue to rely on role, clinic, and active profile checks.

drop policy if exists "Allowed roles can update clinic patients"
on public.patients;

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
  and (updated_by is null or updated_by = public.current_profile_id())
);
