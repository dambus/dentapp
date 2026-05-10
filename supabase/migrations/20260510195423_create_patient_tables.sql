-- DentApp patient database foundation.
-- This migration creates the minimal clinic/profile foundation needed for
-- patient tables, then creates the initial patient-related tables.
-- RLS is enabled, but policies are intentionally deferred to a dedicated
-- RLS migration so no unsafe broad access policy is introduced here.

create extension if not exists pgcrypto;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.clinics is
  'Minimal clinic foundation for multi-tenant patient records.';

create trigger update_clinics_updated_at
before update on public.clinics
for each row
execute function public.update_updated_at_column();

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id),
  full_name text not null check (length(trim(full_name)) > 0),
  email text,
  role text not null check (
    role in (
      'owner_admin',
      'doctor',
      'specialist',
      'assistant',
      'reception_admin',
      'inventory_responsible'
    )
  ),
  status text not null default 'active' check (
    status in ('invited', 'active', 'inactive', 'suspended')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Minimal application profile foundation for future auth, RLS, and audit ownership.';

create index profiles_clinic_id_idx on public.profiles (clinic_id);
create index profiles_auth_user_id_idx on public.profiles (auth_user_id);
create index profiles_clinic_role_idx on public.profiles (clinic_id, role);

create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  first_name text not null check (length(trim(first_name)) > 0),
  last_name text not null check (length(trim(last_name)) > 0),
  date_of_birth date check (
    date_of_birth is null or date_of_birth <= current_date
  ),
  gender text,
  phone text not null check (length(trim(phone)) > 0),
  email text check (email is null or position('@' in email) > 1),
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  preferred_contact_method text,
  status text not null default 'active' check (
    status in ('active', 'inactive', 'archived', 'blocked')
  ),
  important_note text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.patients is
  'Patient profile records scoped by clinic. Financial balances and appointments are stored in related domain tables later. RLS is enabled; policies are deferred to a dedicated RLS migration.';
comment on column public.patients.important_note is
  'Basic visible patient note. Full medical warnings belong in patient_medical_records.';
comment on column public.patients.deleted_at is
  'Soft delete marker. Ordinary archival should use status = archived.';

create index patients_clinic_id_idx on public.patients (clinic_id);
create index patients_clinic_status_idx on public.patients (clinic_id, status);
create index patients_clinic_name_idx on public.patients (
  clinic_id,
  last_name,
  first_name
);
create index patients_deleted_at_idx on public.patients (deleted_at);

create trigger update_patients_updated_at
before update on public.patients
for each row
execute function public.update_updated_at_column();

create table public.patient_medical_records (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  anamnesis_summary text,
  allergies text,
  current_medications text,
  medical_warnings text,
  dental_history text,
  risk_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_medical_records_patient_unique unique (clinic_id, patient_id)
);

comment on table public.patient_medical_records is
  'One-row-per-patient MVP medical and dental record summary. More structured sections can be added later. RLS is enabled; policies are deferred to a dedicated RLS migration.';

create index patient_medical_records_patient_id_idx
  on public.patient_medical_records (patient_id);
create index patient_medical_records_clinic_id_idx
  on public.patient_medical_records (clinic_id);

create trigger update_patient_medical_records_updated_at
before update on public.patient_medical_records
for each row
execute function public.update_updated_at_column();

create table public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  visit_id uuid,
  treatment_plan_id uuid,
  treatment_plan_item_id uuid,
  tooth_number text,
  note_type text not null check (length(trim(note_type)) > 0),
  content text not null check (length(trim(content)) > 0),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.clinical_notes is
  'Dated clinical notes for patient records. Future visit and treatment plan references are nullable UUIDs until those tables exist. RLS is enabled; policies are deferred to a dedicated RLS migration.';
comment on column public.clinical_notes.visit_id is
  'Future visits table reference. No foreign key yet because visits are out of scope for this migration.';
comment on column public.clinical_notes.treatment_plan_id is
  'Future treatment_plans table reference. No foreign key yet because treatment plans are out of scope for this migration.';
comment on column public.clinical_notes.treatment_plan_item_id is
  'Future treatment_plan_items table reference. No foreign key yet because treatment plan items are out of scope for this migration.';

create index clinical_notes_patient_id_idx on public.clinical_notes (patient_id);
create index clinical_notes_clinic_id_idx on public.clinical_notes (clinic_id);
create index clinical_notes_created_at_idx on public.clinical_notes (created_at);
create index clinical_notes_clinic_patient_idx
  on public.clinical_notes (clinic_id, patient_id);
create index clinical_notes_deleted_at_idx on public.clinical_notes (deleted_at);

create trigger update_clinical_notes_updated_at
before update on public.clinical_notes
for each row
execute function public.update_updated_at_column();

alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.patient_medical_records enable row level security;
alter table public.clinical_notes enable row level security;
