-- DentApp patient ledger foundation.
-- Adds the first immutable patient-scoped accounting entry table.
-- No Visit Completion posting, payments, balance summaries, invoices,
-- receipts, commissions, or UI behavior is added here.

create table public.patient_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  entry_type text not null check (
    entry_type in (
      'charge',
      'payment',
      'discount',
      'write_off',
      'refund',
      'adjustment',
      'reversal'
    )
  ),
  direction text not null check (direction in ('debit', 'credit')),
  amount numeric not null check (amount > 0),
  currency text not null default 'RSD' check (currency ~ '^[A-Z]{3}$'),
  description_snapshot text not null check (length(trim(description_snapshot)) > 0),
  performed_service_id uuid references public.performed_services(id),
  visit_id uuid references public.visits(id),
  appointment_id uuid references public.appointments(id),
  reverses_entry_id uuid references public.patient_ledger_entries(id),
  status text not null default 'posted' check (
    status in ('posted', 'reversed', 'voided')
  ),
  source_type text not null default 'manual' check (length(trim(source_type)) > 0),
  source_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  posted_at timestamptz not null default now(),
  recorded_by uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint patient_ledger_entries_reversal_not_self_check check (
    reverses_entry_id is null or reverses_entry_id <> id
  ),
  constraint patient_ledger_entries_type_direction_check check (
    (entry_type = 'charge' and direction = 'debit')
    or (entry_type = 'payment' and direction = 'credit')
    or (entry_type = 'discount' and direction = 'credit')
    or (entry_type = 'write_off' and direction = 'credit')
    or (entry_type = 'refund' and direction = 'debit')
    or entry_type in ('adjustment', 'reversal')
  ),
  constraint patient_ledger_entries_charge_service_required_check check (
    entry_type <> 'charge' or performed_service_id is not null
  ),
  constraint patient_ledger_entries_service_only_for_charge_check check (
    performed_service_id is null or entry_type = 'charge'
  ),
  constraint patient_ledger_entries_reversal_reference_required_check check (
    entry_type <> 'reversal' or reverses_entry_id is not null
  )
);

comment on table public.patient_ledger_entries is
  'Append-only patient accounting entries. Amounts are positive; debit entries increase patient balance and credit entries reduce it.';
comment on column public.patient_ledger_entries.entry_type is
  'Financial movement type. Workflows for payments, adjustments, refunds, write-offs, and reversals are deferred.';
comment on column public.patient_ledger_entries.direction is
  'Balance direction: debit increases amount owed, credit reduces amount owed.';
comment on column public.patient_ledger_entries.amount is
  'Positive financial amount in the entry currency. Sign is represented by direction, not by negative amounts.';
comment on column public.patient_ledger_entries.performed_service_id is
  'Optional finalized performed-service source for service charge entries. Charge posting is implemented in a later task.';
comment on column public.patient_ledger_entries.reverses_entry_id is
  'Future reversal reference. Full reversal workflows are not implemented in this schema slice.';
comment on column public.patient_ledger_entries.status is
  'Posted by default. Reversed/voided statuses are reserved for future controlled workflows, not direct client edits.';

create index patient_ledger_entries_clinic_id_idx
  on public.patient_ledger_entries (clinic_id);
create index patient_ledger_entries_patient_id_idx
  on public.patient_ledger_entries (patient_id);
create index patient_ledger_entries_clinic_patient_posted_at_idx
  on public.patient_ledger_entries (clinic_id, patient_id, posted_at desc);
create index patient_ledger_entries_entry_type_idx
  on public.patient_ledger_entries (clinic_id, entry_type);
create index patient_ledger_entries_status_idx
  on public.patient_ledger_entries (clinic_id, status);
create index patient_ledger_entries_performed_service_id_idx
  on public.patient_ledger_entries (performed_service_id);
create index patient_ledger_entries_visit_id_idx
  on public.patient_ledger_entries (visit_id);
create index patient_ledger_entries_reverses_entry_id_idx
  on public.patient_ledger_entries (reverses_entry_id);
create index patient_ledger_entries_recorded_by_idx
  on public.patient_ledger_entries (recorded_by);

create unique index patient_ledger_entries_one_posted_charge_per_service_idx
  on public.patient_ledger_entries (clinic_id, performed_service_id)
  where entry_type = 'charge'
    and status = 'posted'
    and performed_service_id is not null;

create or replace function public.enforce_patient_ledger_entry_context()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_patient record;
  linked_visit record;
  linked_performed_service record;
  linked_reversal record;
  linked_recorded_by record;
  linked_created_by record;
begin
  select id, clinic_id
  into linked_patient
  from public.patients
  where id = new.patient_id
    and deleted_at is null;

  if linked_patient.id is null then
    raise exception 'ledger entry patient must exist' using errcode = '23514';
  end if;

  if linked_patient.clinic_id <> new.clinic_id then
    raise exception
      'ledger entry clinic_id must match the patient clinic'
      using errcode = '23514';
  end if;

  if new.visit_id is not null then
    select id, clinic_id, patient_id, appointment_id
    into linked_visit
    from public.visits
    where id = new.visit_id
      and deleted_at is null;

    if linked_visit.id is null then
      raise exception 'ledger entry visit must exist' using errcode = '23514';
    end if;

    if linked_visit.clinic_id <> new.clinic_id
      or linked_visit.patient_id <> new.patient_id then
      raise exception
        'ledger entry visit must belong to the same clinic and patient'
        using errcode = '23514';
    end if;

    if new.appointment_id is not null
      and linked_visit.appointment_id is not null
      and new.appointment_id <> linked_visit.appointment_id then
      raise exception
        'ledger entry appointment_id must match the linked visit appointment when both are provided'
        using errcode = '23514';
    end if;
  end if;

  if new.appointment_id is not null and not exists (
    select 1
    from public.appointments as appointment
    where appointment.id = new.appointment_id
      and appointment.clinic_id = new.clinic_id
      and appointment.patient_id = new.patient_id
  ) then
    raise exception
      'ledger entry appointment_id must belong to the same clinic and patient'
      using errcode = '23514';
  end if;

  if new.performed_service_id is not null then
    select id, clinic_id, patient_id, visit_id, appointment_id, status,
      final_amount, currency
    into linked_performed_service
    from public.performed_services
    where id = new.performed_service_id
      and deleted_at is null;

    if linked_performed_service.id is null then
      raise exception
        'ledger entry performed_service_id must reference an existing performed service'
        using errcode = '23514';
    end if;

    if linked_performed_service.clinic_id <> new.clinic_id
      or linked_performed_service.patient_id <> new.patient_id then
      raise exception
        'ledger entry performed service must belong to the same clinic and patient'
        using errcode = '23514';
    end if;

    if linked_performed_service.status <> 'finalized' then
      raise exception
        'ledger charge entries require a finalized performed service'
        using errcode = '23514';
    end if;

    if new.visit_id is null or new.visit_id <> linked_performed_service.visit_id then
      raise exception
        'ledger charge visit_id must match the finalized performed service visit'
        using errcode = '23514';
    end if;

    if new.appointment_id is not null
      and linked_performed_service.appointment_id is not null
      and new.appointment_id <> linked_performed_service.appointment_id then
      raise exception
        'ledger charge appointment_id must match the performed service appointment when both are provided'
        using errcode = '23514';
    end if;

    if new.amount <> linked_performed_service.final_amount then
      raise exception
        'ledger charge amount must match the finalized performed service amount'
        using errcode = '23514';
    end if;

    if new.currency <> linked_performed_service.currency then
      raise exception
        'ledger charge currency must match the finalized performed service currency'
        using errcode = '23514';
    end if;
  end if;

  if new.reverses_entry_id is not null then
    select id, clinic_id, patient_id
    into linked_reversal
    from public.patient_ledger_entries
    where id = new.reverses_entry_id;

    if linked_reversal.id is null then
      raise exception
        'reverses_entry_id must reference an existing ledger entry'
        using errcode = '23514';
    end if;

    if linked_reversal.clinic_id <> new.clinic_id
      or linked_reversal.patient_id <> new.patient_id then
      raise exception
        'reverses_entry_id must reference a ledger entry for the same clinic and patient'
        using errcode = '23514';
    end if;
  end if;

  if new.recorded_by is not null then
    select id, clinic_id, status
    into linked_recorded_by
    from public.profiles
    where id = new.recorded_by;

    if linked_recorded_by.id is null
      or linked_recorded_by.clinic_id <> new.clinic_id
      or linked_recorded_by.status <> 'active' then
      raise exception
        'recorded_by must reference an active profile in the same clinic'
        using errcode = '23514';
    end if;
  end if;

  if new.created_by is not null then
    select id, clinic_id, status
    into linked_created_by
    from public.profiles
    where id = new.created_by;

    if linked_created_by.id is null
      or linked_created_by.clinic_id <> new.clinic_id
      or linked_created_by.status <> 'active' then
      raise exception
        'created_by must reference an active profile in the same clinic'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.enforce_patient_ledger_entry_context() is
  'Enforces patient ledger clinic/patient/visit/performed-service/profile/reference consistency.';

revoke all on function public.enforce_patient_ledger_entry_context() from public;

create trigger enforce_patient_ledger_entry_context
before insert or update
on public.patient_ledger_entries
for each row
execute function public.enforce_patient_ledger_entry_context();

alter table public.patient_ledger_entries enable row level security;

grant select on public.patient_ledger_entries to authenticated;

create policy "Financial workflow roles can view clinic patient ledger entries"
on public.patient_ledger_entries
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
  and exists (
    select 1
    from public.patients as patient
    where patient.id = patient_ledger_entries.patient_id
      and patient.clinic_id = patient_ledger_entries.clinic_id
      and patient.deleted_at is null
  )
);
