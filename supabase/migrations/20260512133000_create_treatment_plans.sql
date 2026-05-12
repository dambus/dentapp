-- DentApp treatment plan foundation.
-- MVP only: no visits, performed services, service catalog, payments, or
-- advanced treatment workflow.

create table public.treatment_plans (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  title text not null check (length(trim(title)) > 0),
  description text,
  status text not null default 'draft' check (
    status in (
      'draft',
      'proposed',
      'accepted',
      'in_progress',
      'completed',
      'paused',
      'rejected',
      'archived'
    )
  ),
  proposed_total numeric check (proposed_total is null or proposed_total >= 0),
  accepted_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.treatment_plans is
  'MVP patient treatment plans. Payment, visit, performed service, and service catalog integration are deferred.';
comment on column public.treatment_plans.deleted_at is
  'Soft archive marker. Hard delete is intentionally not exposed by application policy.';

create index treatment_plans_clinic_id_idx
  on public.treatment_plans (clinic_id);
create index treatment_plans_patient_id_idx
  on public.treatment_plans (patient_id);
create index treatment_plans_clinic_patient_idx
  on public.treatment_plans (clinic_id, patient_id);
create index treatment_plans_status_idx
  on public.treatment_plans (clinic_id, status);
create index treatment_plans_deleted_at_idx
  on public.treatment_plans (deleted_at);

create trigger update_treatment_plans_updated_at
before update on public.treatment_plans
for each row
execute function public.update_updated_at_column();

create table public.treatment_plan_items (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  treatment_plan_id uuid not null references public.treatment_plans(id),
  patient_id uuid not null references public.patients(id),
  tooth_number text,
  title text not null check (length(trim(title)) > 0),
  description text,
  service_code text,
  status text not null default 'planned' check (
    status in (
      'planned',
      'accepted',
      'in_progress',
      'completed',
      'skipped',
      'cancelled',
      'archived'
    )
  ),
  estimated_price numeric check (estimated_price is null or estimated_price >= 0),
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.treatment_plan_items is
  'MVP treatment plan items. Optional tooth_number is stored as text and does not require an odontogram row.';
comment on column public.treatment_plan_items.tooth_number is
  'Optional FDI tooth number or simple tooth/region text for MVP. No foreign key to odontogram.';
comment on column public.treatment_plan_items.deleted_at is
  'Soft archive marker. Hard delete is intentionally not exposed by application policy.';

create index treatment_plan_items_clinic_id_idx
  on public.treatment_plan_items (clinic_id);
create index treatment_plan_items_patient_id_idx
  on public.treatment_plan_items (patient_id);
create index treatment_plan_items_plan_id_idx
  on public.treatment_plan_items (treatment_plan_id);
create index treatment_plan_items_clinic_plan_idx
  on public.treatment_plan_items (clinic_id, treatment_plan_id);
create index treatment_plan_items_deleted_at_idx
  on public.treatment_plan_items (deleted_at);

create trigger update_treatment_plan_items_updated_at
before update on public.treatment_plan_items
for each row
execute function public.update_updated_at_column();

alter table public.treatment_plans enable row level security;
alter table public.treatment_plan_items enable row level security;

create policy "Patient roles can view clinic treatment plans"
on public.treatment_plans
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
);

create policy "Clinical roles can update clinic treatment plans"
on public.treatment_plans
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
  and (updated_by is null or updated_by = public.current_profile_id())
);

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
);
