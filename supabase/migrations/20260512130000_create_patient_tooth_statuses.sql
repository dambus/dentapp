-- DentApp odontogram foundation.
-- Stores one active MVP tooth status per patient/tooth using FDI permanent
-- tooth numbers only. Tooth surfaces, procedures, and treatment plan links are
-- intentionally deferred.

create table public.patient_tooth_statuses (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  tooth_number text not null check (
    tooth_number in (
      '18', '17', '16', '15', '14', '13', '12', '11',
      '21', '22', '23', '24', '25', '26', '27', '28',
      '38', '37', '36', '35', '34', '33', '32', '31',
      '41', '42', '43', '44', '45', '46', '47', '48'
    )
  ),
  status text not null check (
    status in (
      'unknown',
      'healthy',
      'missing',
      'caries',
      'filled',
      'crown',
      'implant',
      'root_treated',
      'extraction_planned',
      'watch'
    )
  ),
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.patient_tooth_statuses is
  'MVP odontogram tooth statuses. Stores one active FDI permanent tooth status per patient/tooth. No tooth surfaces or procedures yet.';
comment on column public.patient_tooth_statuses.deleted_at is
  'Soft clear marker. Hard delete is intentionally not exposed by application policy.';

create unique index patient_tooth_statuses_active_unique_idx
  on public.patient_tooth_statuses (patient_id, tooth_number)
  where deleted_at is null;

create index patient_tooth_statuses_clinic_id_idx
  on public.patient_tooth_statuses (clinic_id);
create index patient_tooth_statuses_patient_id_idx
  on public.patient_tooth_statuses (patient_id);
create index patient_tooth_statuses_clinic_patient_idx
  on public.patient_tooth_statuses (clinic_id, patient_id);
create index patient_tooth_statuses_deleted_at_idx
  on public.patient_tooth_statuses (deleted_at);

create trigger update_patient_tooth_statuses_updated_at
before update on public.patient_tooth_statuses
for each row
execute function public.update_updated_at_column();

alter table public.patient_tooth_statuses enable row level security;

create policy "Clinical and assistant roles can view clinic tooth statuses"
on public.patient_tooth_statuses
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

create policy "Clinical roles can create clinic tooth statuses"
on public.patient_tooth_statuses
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

create policy "Clinical roles can update clinic tooth statuses"
on public.patient_tooth_statuses
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
