-- Harden treatment plan mutation scope before exposing patient-detail write UI.
-- Treatment plans remain clinical planning records only; no pricing,
-- settlement, ledger, visit-procedure conversion, or payment behavior is added.

create or replace function public.enforce_treatment_plan_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if old.deleted_at is not null then
      raise exception 'archived treatment plans cannot be mutated';
    end if;

    if new.clinic_id is distinct from old.clinic_id then
      raise exception 'treatment plan clinic_id cannot be changed';
    end if;

    if new.patient_id is distinct from old.patient_id then
      raise exception 'treatment plan patient_id cannot be changed';
    end if;
  end if;

  if not exists (
    select 1
    from public.patients as p
    where p.id = new.patient_id
      and p.clinic_id = new.clinic_id
      and p.deleted_at is null
  ) then
    raise exception 'treatment plan patient_id must reference an active same-clinic patient';
  end if;

  return new;
end;
$$;

comment on function public.enforce_treatment_plan_scope() is
  'Enforces treatment plan same-clinic patient linkage, prevents patient/clinic reassignment, and blocks further mutation after soft archive.';

revoke all on function public.enforce_treatment_plan_scope() from public;

drop trigger if exists enforce_treatment_plan_scope on public.treatment_plans;

create trigger enforce_treatment_plan_scope
before insert or update of clinic_id, patient_id, deleted_at, status
on public.treatment_plans
for each row
execute function public.enforce_treatment_plan_scope();

create or replace function public.enforce_treatment_plan_item_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if old.deleted_at is not null then
      raise exception 'archived treatment plan items cannot be mutated';
    end if;

    if new.clinic_id is distinct from old.clinic_id then
      raise exception 'treatment plan item clinic_id cannot be changed';
    end if;

    if new.patient_id is distinct from old.patient_id then
      raise exception 'treatment plan item patient_id cannot be changed';
    end if;

    if new.treatment_plan_id is distinct from old.treatment_plan_id then
      raise exception 'treatment plan item parent cannot be changed';
    end if;
  end if;

  if not exists (
    select 1
    from public.treatment_plans as plan
    join public.patients as patient
      on patient.id = plan.patient_id
     and patient.clinic_id = plan.clinic_id
     and patient.deleted_at is null
    where plan.id = new.treatment_plan_id
      and plan.clinic_id = new.clinic_id
      and plan.patient_id = new.patient_id
      and plan.deleted_at is null
  ) then
    raise exception 'treatment plan item must reference an active same-clinic parent plan and patient';
  end if;

  return new;
end;
$$;

comment on function public.enforce_treatment_plan_item_scope() is
  'Enforces treatment plan item alignment with an active same-clinic parent plan and prevents item parent/patient/clinic reassignment.';

revoke all on function public.enforce_treatment_plan_item_scope() from public;

drop trigger if exists enforce_treatment_plan_item_scope on public.treatment_plan_items;

create trigger enforce_treatment_plan_item_scope
before insert or update of clinic_id, patient_id, treatment_plan_id, deleted_at, status
on public.treatment_plan_items
for each row
execute function public.enforce_treatment_plan_item_scope();

drop policy if exists "Clinical roles can create clinic treatment plans"
on public.treatment_plans;

drop policy if exists "Clinical roles can update clinic treatment plans"
on public.treatment_plans;

create policy "Clinical roles can create clinic treatment plans"
on public.treatment_plans
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
    from public.patients as p
    where p.id = treatment_plans.patient_id
      and p.clinic_id = treatment_plans.clinic_id
      and p.deleted_at is null
  )
);

create policy "Clinical roles can update clinic treatment plans"
on public.treatment_plans
for update
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and deleted_at is null
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist'
  ])
  and exists (
    select 1
    from public.patients as p
    where p.id = treatment_plans.patient_id
      and p.clinic_id = treatment_plans.clinic_id
      and p.deleted_at is null
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
    from public.patients as p
    where p.id = treatment_plans.patient_id
      and p.clinic_id = treatment_plans.clinic_id
      and p.deleted_at is null
  )
);
