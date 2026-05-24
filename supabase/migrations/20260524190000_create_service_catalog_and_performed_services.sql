-- DentApp service catalog and performed services foundation.
-- Keeps clinical visit_procedures separate from chargeable performed_services.
-- No Visit Completion UI/service wiring, ledger posting, payment, commission,
-- material consumption, or treatment-plan mutation is added here.

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  name text not null check (length(trim(name)) > 0),
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.service_categories is
  'Clinic-scoped service catalog categories for performed-service selection, reporting, and future commission rules.';
comment on column public.service_categories.deleted_at is
  'Soft archive marker. Historical performed-service snapshots must remain valid when catalog categories are archived.';

create index service_categories_clinic_id_idx
  on public.service_categories (clinic_id);
create index service_categories_clinic_active_idx
  on public.service_categories (clinic_id, active)
  where deleted_at is null;
create index service_categories_deleted_at_idx
  on public.service_categories (deleted_at);

create trigger update_service_categories_updated_at
before update on public.service_categories
for each row
execute function public.update_updated_at_column();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  category_id uuid references public.service_categories(id) on delete set null,
  name text not null check (length(trim(name)) > 0),
  code text,
  description text,
  default_price numeric check (default_price is null or default_price >= 0),
  currency text not null default 'RSD' check (length(trim(currency)) > 0),
  default_duration_minutes integer check (
    default_duration_minutes is null or default_duration_minutes > 0
  ),
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.services is
  'Clinic-scoped service catalog items. Prices are defaults only; performed_services stores immutable service and price snapshots.';
comment on column public.services.default_price is
  'Mutable default price for future service selection. Historical performed services do not recalculate from this value.';
comment on column public.services.deleted_at is
  'Soft archive marker. Archived services should not be newly selected, but historical performed-service snapshots remain valid.';

create index services_clinic_id_idx
  on public.services (clinic_id);
create index services_category_id_idx
  on public.services (category_id);
create index services_clinic_active_idx
  on public.services (clinic_id, active)
  where deleted_at is null;
create index services_deleted_at_idx
  on public.services (deleted_at);

create trigger update_services_updated_at
before update on public.services
for each row
execute function public.update_updated_at_column();

create or replace function public.enforce_service_catalog_item_context()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.category_id is not null and not exists (
    select 1
    from public.service_categories as category
    where category.id = new.category_id
      and category.clinic_id = new.clinic_id
      and category.deleted_at is null
  ) then
    raise exception
      'service category must belong to the same clinic as the service'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function public.enforce_service_catalog_item_context() is
  'Ensures service catalog items cannot reference a category from another clinic.';

revoke all on function public.enforce_service_catalog_item_context() from public;

create trigger enforce_service_catalog_item_context
before insert or update of clinic_id, category_id
on public.services
for each row
execute function public.enforce_service_catalog_item_context();

create table public.performed_services (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  visit_id uuid not null references public.visits(id),
  visit_procedure_id uuid references public.visit_procedures(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  treatment_plan_item_id uuid references public.treatment_plan_items(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  service_name_snapshot text not null check (length(trim(service_name_snapshot)) > 0),
  service_code_snapshot text,
  service_category_name_snapshot text,
  tooth_or_region text,
  quantity numeric not null default 1 check (quantity > 0),
  unit_price_amount numeric not null default 0 check (unit_price_amount >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  final_amount numeric not null,
  currency text not null default 'RSD' check (length(trim(currency)) > 0),
  credited_provider_id uuid not null references public.profiles(id),
  status text not null default 'draft' check (
    status in ('draft', 'finalized', 'corrected', 'voided')
  ),
  correction_of_id uuid references public.performed_services(id),
  note text,
  performed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint performed_services_final_amount_check check (
    final_amount >= 0
    and final_amount = (quantity * unit_price_amount) - discount_amount
  ),
  constraint performed_services_discount_not_above_gross_check check (
    discount_amount <= quantity * unit_price_amount
  ),
  constraint performed_services_correction_not_self_check check (
    correction_of_id is null or correction_of_id <> id
  )
);

comment on table public.performed_services is
  'Chargeable source-of-truth records for rendered services. Separate from clinical visit_procedures, treatment-plan items, ledger entries, and commission calculations.';
comment on column public.performed_services.visit_procedure_id is
  'Optional link to clinical procedure documentation. The procedure remains clinical-only.';
comment on column public.performed_services.treatment_plan_item_id is
  'Optional origin/reference to a planned treatment item. This does not mutate treatment plan status.';
comment on column public.performed_services.service_id is
  'Optional mutable catalog reference. Historical service name/price/category snapshots are stored on this row.';
comment on column public.performed_services.credited_provider_id is
  'Actual provider credited for this performed service. Separate from appointments.assigned_provider_id and visits.completed_by.';
comment on column public.performed_services.status is
  'Chargeable-service workflow status. Finalized/corrected/voided rows are protected from silent mutation by trigger.';

create index performed_services_clinic_id_idx
  on public.performed_services (clinic_id);
create index performed_services_patient_id_idx
  on public.performed_services (patient_id);
create index performed_services_visit_id_idx
  on public.performed_services (visit_id);
create index performed_services_visit_procedure_id_idx
  on public.performed_services (visit_procedure_id);
create index performed_services_treatment_plan_item_id_idx
  on public.performed_services (treatment_plan_item_id);
create index performed_services_service_id_idx
  on public.performed_services (service_id);
create index performed_services_provider_idx
  on public.performed_services (clinic_id, credited_provider_id);
create index performed_services_status_idx
  on public.performed_services (clinic_id, status);
create index performed_services_deleted_at_idx
  on public.performed_services (deleted_at);

create trigger update_performed_services_updated_at
before update on public.performed_services
for each row
execute function public.update_updated_at_column();

create or replace function public.is_valid_performed_service_provider(
  service_clinic_id uuid,
  provider_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles as p
    where p.id = provider_profile_id
      and p.clinic_id = service_clinic_id
      and p.status = 'active'
      and p.role in ('doctor', 'specialist')
  )
$$;

comment on function public.is_valid_performed_service_provider(uuid, uuid) is
  'Returns true when a performed-service credited provider is an active same-clinic doctor/specialist profile.';

revoke all on function public.is_valid_performed_service_provider(uuid, uuid) from public;
grant execute on function public.is_valid_performed_service_provider(uuid, uuid) to authenticated;

create or replace function public.enforce_performed_service_context()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_visit record;
begin
  if tg_op = 'UPDATE' and old.status <> 'draft' then
    raise exception
      'finalized performed service records cannot be silently updated'
      using errcode = '23514';
  end if;

  select id, clinic_id, patient_id, appointment_id, status
  into linked_visit
  from public.visits
  where id = new.visit_id
    and deleted_at is null;

  if linked_visit.id is null then
    raise exception 'performed service visit must exist' using errcode = '23514';
  end if;

  if linked_visit.clinic_id <> new.clinic_id
    or linked_visit.patient_id <> new.patient_id then
    raise exception
      'performed service clinic_id and patient_id must match the linked visit'
      using errcode = '23514';
  end if;

  if new.status = 'draft' and linked_visit.status not in ('draft', 'in_progress') then
    raise exception
      'draft performed services require a draft or in-progress visit'
      using errcode = '23514';
  end if;

  if new.status in ('finalized', 'corrected', 'voided')
    and linked_visit.status <> 'completed' then
    raise exception
      'finalized/corrected/voided performed services require a completed visit'
      using errcode = '23514';
  end if;

  if new.visit_procedure_id is not null and not exists (
    select 1
    from public.visit_procedures as procedure
    where procedure.id = new.visit_procedure_id
      and procedure.visit_id = new.visit_id
      and procedure.clinic_id = new.clinic_id
      and procedure.patient_id = new.patient_id
      and procedure.deleted_at is null
  ) then
    raise exception
      'visit_procedure_id must belong to the same visit, clinic, and patient'
      using errcode = '23514';
  end if;

  if new.treatment_plan_item_id is not null and not exists (
    select 1
    from public.treatment_plan_items as item
    join public.treatment_plans as plan
      on plan.id = item.treatment_plan_id
    where item.id = new.treatment_plan_item_id
      and item.clinic_id = new.clinic_id
      and item.patient_id = new.patient_id
      and item.deleted_at is null
      and plan.clinic_id = item.clinic_id
      and plan.patient_id = item.patient_id
      and plan.deleted_at is null
  ) then
    raise exception
      'treatment_plan_item_id must belong to the same clinic and patient'
      using errcode = '23514';
  end if;

  if new.service_id is not null and (
    tg_op = 'INSERT' or new.service_id is distinct from old.service_id
  ) and not exists (
    select 1
    from public.services as service
    where service.id = new.service_id
      and service.clinic_id = new.clinic_id
      and service.active = true
      and service.deleted_at is null
  ) then
    raise exception
      'service_id must reference an active same-clinic catalog item'
      using errcode = '23514';
  end if;

  if new.appointment_id is not null and not exists (
    select 1
    from public.appointments as appointment
    where appointment.id = new.appointment_id
      and appointment.clinic_id = new.clinic_id
      and appointment.patient_id = new.patient_id
  ) then
    raise exception
      'appointment_id must belong to the same clinic and patient'
      using errcode = '23514';
  end if;

  if linked_visit.appointment_id is not null
    and new.appointment_id is not null
    and new.appointment_id <> linked_visit.appointment_id then
    raise exception
      'appointment_id must match the linked visit appointment when both are provided'
      using errcode = '23514';
  end if;

  if not public.is_valid_performed_service_provider(
    new.clinic_id,
    new.credited_provider_id
  ) then
    raise exception
      'credited_provider_id must reference an active same-clinic doctor or specialist profile'
      using errcode = '23514';
  end if;

  if new.correction_of_id is not null and not exists (
    select 1
    from public.performed_services as original
    where original.id = new.correction_of_id
      and original.clinic_id = new.clinic_id
      and original.patient_id = new.patient_id
      and original.visit_id = new.visit_id
  ) then
    raise exception
      'correction_of_id must reference a performed service in the same visit, clinic, and patient'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function public.enforce_performed_service_context() is
  'Enforces clinic/patient/visit/provider/catalog consistency and protects finalized performed-service rows from silent mutation.';

revoke all on function public.enforce_performed_service_context() from public;

create trigger enforce_performed_service_context
before insert or update
on public.performed_services
for each row
execute function public.enforce_performed_service_context();

alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.performed_services enable row level security;

create policy "Clinical and payment workflow roles can view service categories"
on public.service_categories
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

create policy "Owner admins can create service categories"
on public.service_categories
for insert
to authenticated
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array['owner_admin'])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Owner admins can update service categories"
on public.service_categories
for update
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array['owner_admin'])
)
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array['owner_admin'])
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Clinical and payment workflow roles can view services"
on public.services
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

create policy "Owner admins can create services"
on public.services
for insert
to authenticated
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array['owner_admin'])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Owner admins can update services"
on public.services
for update
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array['owner_admin'])
)
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array['owner_admin'])
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Performed service workflow roles can view clinic performed services"
on public.performed_services
for select
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'reception_admin'
  ])
);

create policy "Clinical provider roles can create performed services"
on public.performed_services
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

create policy "Clinical provider roles can update draft performed services"
on public.performed_services
for update
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and status = 'draft'
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
