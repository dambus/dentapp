-- DentApp Visit Completion foundation.
-- Adds minimal visit and performed procedure persistence for the focused
-- Visit Completion workflow. Billing, payments, materials, attachments,
-- odontogram mutation, treatment plan mutation, and appointment creation are
-- intentionally deferred.

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  appointment_id uuid,
  status text not null default 'draft' check (
    status in ('draft', 'in_progress', 'completed', 'reopened', 'archived')
  ),
  visit_date date not null default current_date,
  started_at timestamptz,
  completed_at timestamptz,
  completed_by uuid references public.profiles(id) on delete set null,
  clinical_note_id uuid,
  recommendation text,
  next_step text check (
    next_step is null or next_step in (
      'no_follow_up',
      'follow_up_recommended',
      'schedule_control_visit',
      'continue_treatment_plan',
      'additional_diagnostics',
      'referral'
    )
  ),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.visits is
  'MVP clinical visit records for Visit Completion. Appointments, billing, materials, attachments, and treatment plan mutation are deferred.';
comment on column public.visits.appointment_id is
  'Future appointments table reference. No foreign key yet because appointments are not implemented.';
comment on column public.visits.clinical_note_id is
  'Optional primary clinical note reference for the visit. Kept as nullable UUID initially to avoid circular foreign key complexity.';
comment on column public.visits.deleted_at is
  'Soft archive marker. Hard delete is intentionally not exposed by application policy.';

create index visits_clinic_id_idx
  on public.visits (clinic_id);
create index visits_patient_id_idx
  on public.visits (patient_id);
create index visits_status_idx
  on public.visits (clinic_id, status);
create index visits_deleted_at_idx
  on public.visits (deleted_at);
create index visits_clinic_patient_status_idx
  on public.visits (clinic_id, patient_id, status);
create index visits_clinic_patient_visit_date_idx
  on public.visits (clinic_id, patient_id, visit_date desc);

create trigger update_visits_updated_at
before update on public.visits
for each row
execute function public.update_updated_at_column();

create table public.visit_procedures (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  visit_id uuid not null references public.visits(id),
  patient_id uuid not null references public.patients(id),
  procedure_name text not null check (length(trim(procedure_name)) > 0),
  tooth_or_region text,
  quantity_or_duration text,
  note text,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.visit_procedures is
  'MVP performed procedure rows for Visit Completion. No billing codes, prices, materials, commissions, or service catalog linkage yet.';
comment on column public.visit_procedures.tooth_or_region is
  'Optional tooth, region, quadrant, or free-text area for the performed procedure.';
comment on column public.visit_procedures.quantity_or_duration is
  'Optional simple quantity or duration text for the performed procedure.';
comment on column public.visit_procedures.deleted_at is
  'Soft archive marker. Hard delete is intentionally not exposed by application policy.';

create index visit_procedures_clinic_id_idx
  on public.visit_procedures (clinic_id);
create index visit_procedures_patient_id_idx
  on public.visit_procedures (patient_id);
create index visit_procedures_visit_id_idx
  on public.visit_procedures (visit_id);
create index visit_procedures_deleted_at_idx
  on public.visit_procedures (deleted_at);
create index visit_procedures_visit_sort_order_idx
  on public.visit_procedures (visit_id, sort_order);

create trigger update_visit_procedures_updated_at
before update on public.visit_procedures
for each row
execute function public.update_updated_at_column();

alter table public.clinical_notes
  add constraint clinical_notes_visit_id_fkey
  foreign key (visit_id)
  references public.visits(id);

alter table public.visits enable row level security;
alter table public.visit_procedures enable row level security;

create policy "Clinical workflow roles can view clinic visits"
on public.visits
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

create policy "Clinical workflow roles can create clinic visits"
on public.visits
for insert
to authenticated
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant'
  ])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
  and (completed_by is null or completed_by = public.current_profile_id())
);

create policy "Clinical workflow roles can update clinic visits"
on public.visits
for update
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
)
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant'
  ])
  and (updated_by is null or updated_by = public.current_profile_id())
  and (completed_by is null or completed_by = public.current_profile_id())
);

create policy "Clinical workflow roles can view clinic visit procedures"
on public.visit_procedures
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

create policy "Clinical workflow roles can create clinic visit procedures"
on public.visit_procedures
for insert
to authenticated
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant'
  ])
  and (created_by is null or created_by = public.current_profile_id())
  and (updated_by is null or updated_by = public.current_profile_id())
);

create policy "Clinical workflow roles can update clinic visit procedures"
on public.visit_procedures
for update
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
)
with check (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array[
    'owner_admin',
    'doctor',
    'specialist',
    'assistant'
  ])
  and (updated_by is null or updated_by = public.current_profile_id())
);
