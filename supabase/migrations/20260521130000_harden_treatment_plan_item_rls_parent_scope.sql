-- Harden treatment plan item RLS so item access must match the parent plan
-- clinic and patient boundary. No schema or application mutation behavior is
-- added here.

drop policy if exists "Patient roles can view clinic treatment plan items"
on public.treatment_plan_items;

drop policy if exists "Clinical roles can create clinic treatment plan items"
on public.treatment_plan_items;

drop policy if exists "Clinical roles can update clinic treatment plan items"
on public.treatment_plan_items;

create policy "Patient roles can view clinic treatment plan items"
on public.treatment_plan_items
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
  and exists (
    select 1
    from public.treatment_plans
    where treatment_plans.id = treatment_plan_items.treatment_plan_id
      and treatment_plans.clinic_id = treatment_plan_items.clinic_id
      and treatment_plans.patient_id = treatment_plan_items.patient_id
      and treatment_plans.deleted_at is null
  )
);

create policy "Clinical roles can create clinic treatment plan items"
on public.treatment_plan_items
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
  and exists (
    select 1
    from public.treatment_plans
    where treatment_plans.id = treatment_plan_items.treatment_plan_id
      and treatment_plans.clinic_id = treatment_plan_items.clinic_id
      and treatment_plans.patient_id = treatment_plan_items.patient_id
      and treatment_plans.deleted_at is null
  )
);

create policy "Clinical roles can update clinic treatment plan items"
on public.treatment_plan_items
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
  and exists (
    select 1
    from public.treatment_plans
    where treatment_plans.id = treatment_plan_items.treatment_plan_id
      and treatment_plans.clinic_id = treatment_plan_items.clinic_id
      and treatment_plans.patient_id = treatment_plan_items.patient_id
      and treatment_plans.deleted_at is null
  )
)
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist'
  ])
  and (updated_by is null or updated_by = public.current_profile_id())
  and exists (
    select 1
    from public.treatment_plans
    where treatment_plans.id = treatment_plan_items.treatment_plan_id
      and treatment_plans.clinic_id = treatment_plan_items.clinic_id
      and treatment_plans.patient_id = treatment_plan_items.patient_id
      and treatment_plans.deleted_at is null
  )
);
