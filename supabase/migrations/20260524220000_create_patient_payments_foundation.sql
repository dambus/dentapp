-- DentApp patient payment foundation.
-- Adds patient payment records and prepares linked payment-credit ledger rows.
-- No payment recording RPC, UI, balance, invoices, receipts, refunds,
-- allocations, commissions, or Visit Completion behavior is added here.

create table public.patient_payments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  amount numeric not null check (amount > 0),
  currency text not null default 'RSD' check (currency ~ '^[A-Z]{3}$'),
  payment_method text not null check (
    payment_method in ('cash', 'card', 'bank_transfer', 'other')
  ),
  status text not null default 'posted' check (status in ('posted', 'reversed')),
  received_at timestamptz not null default now(),
  reference_number text check (
    reference_number is null or length(trim(reference_number)) > 0
  ),
  notes text,
  ledger_entry_id uuid references public.patient_ledger_entries(id),
  reversed_at timestamptz,
  reversed_by uuid references public.profiles(id) on delete set null,
  reversal_reason text check (
    reversal_reason is null or length(trim(reversal_reason)) > 0
  ),
  reversal_ledger_entry_id uuid references public.patient_ledger_entries(id),
  recorded_by uuid not null references public.profiles(id),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_payments_reversed_metadata_check check (
    (
      status = 'posted'
      and reversed_at is null
      and reversed_by is null
      and reversal_reason is null
      and reversal_ledger_entry_id is null
    )
    or (
      status = 'reversed'
      and reversed_at is not null
      and reversed_by is not null
      and reversal_reason is not null
    )
  )
);

comment on table public.patient_payments is
  'Patient payment records. Each posted payment is intended to have one linked patient ledger payment credit entry created by a controlled workflow.';
comment on column public.patient_payments.amount is
  'Positive received payment amount in the payment currency.';
comment on column public.patient_payments.currency is
  'Three-letter payment currency code. No currency conversion is implemented.';
comment on column public.patient_payments.payment_method is
  'Initial constrained payment methods: cash, card, bank_transfer, other.';
comment on column public.patient_payments.status is
  'Posted by default. Reversed is reserved for future controlled reversal workflows.';
comment on column public.patient_payments.ledger_entry_id is
  'Future linked posted ledger payment credit entry. Created by a controlled payment recording workflow in a later task.';

create index patient_payments_clinic_id_idx
  on public.patient_payments (clinic_id);
create index patient_payments_patient_id_idx
  on public.patient_payments (patient_id);
create index patient_payments_clinic_patient_received_at_idx
  on public.patient_payments (clinic_id, patient_id, received_at desc);
create index patient_payments_status_idx
  on public.patient_payments (clinic_id, status);
create index patient_payments_payment_method_idx
  on public.patient_payments (clinic_id, payment_method);
create index patient_payments_recorded_by_idx
  on public.patient_payments (recorded_by);
create unique index patient_payments_ledger_entry_id_unique_idx
  on public.patient_payments (ledger_entry_id)
  where ledger_entry_id is not null;
create unique index patient_payments_reversal_ledger_entry_id_unique_idx
  on public.patient_payments (reversal_ledger_entry_id)
  where reversal_ledger_entry_id is not null;

create or replace function public.set_patient_payments_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_patient_payments_updated_at() is
  'Maintains updated_at for patient payment metadata/status changes made by controlled workflows.';

revoke all on function public.set_patient_payments_updated_at() from public;

create or replace function public.enforce_patient_payment_context()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_patient record;
  linked_recorded_by record;
  linked_created_by record;
  linked_reversed_by record;
  linked_ledger_entry record;
  linked_reversal_ledger_entry record;
begin
  select id, clinic_id
  into linked_patient
  from public.patients
  where id = new.patient_id
    and deleted_at is null;

  if linked_patient.id is null then
    raise exception 'payment patient must exist' using errcode = '23514';
  end if;

  if linked_patient.clinic_id <> new.clinic_id then
    raise exception
      'payment clinic_id must match the patient clinic'
      using errcode = '23514';
  end if;

  select id, clinic_id, role, status
  into linked_recorded_by
  from public.profiles
  where id = new.recorded_by;

  if linked_recorded_by.id is null
    or linked_recorded_by.clinic_id <> new.clinic_id
    or linked_recorded_by.status <> 'active'
    or linked_recorded_by.role not in ('owner_admin', 'reception_admin') then
    raise exception
      'recorded_by must reference an active same-clinic owner_admin or reception_admin profile'
      using errcode = '23514';
  end if;

  if new.created_by is not null then
    select id, clinic_id, role, status
    into linked_created_by
    from public.profiles
    where id = new.created_by;

    if linked_created_by.id is null
      or linked_created_by.clinic_id <> new.clinic_id
      or linked_created_by.status <> 'active'
      or linked_created_by.role not in ('owner_admin', 'reception_admin') then
      raise exception
        'created_by must reference an active same-clinic owner_admin or reception_admin profile'
        using errcode = '23514';
    end if;
  end if;

  if new.reversed_by is not null then
    select id, clinic_id, role, status
    into linked_reversed_by
    from public.profiles
    where id = new.reversed_by;

    if linked_reversed_by.id is null
      or linked_reversed_by.clinic_id <> new.clinic_id
      or linked_reversed_by.status <> 'active'
      or linked_reversed_by.role not in ('owner_admin', 'reception_admin') then
      raise exception
        'reversed_by must reference an active same-clinic owner_admin or reception_admin profile'
        using errcode = '23514';
    end if;
  end if;

  if new.ledger_entry_id is not null then
    select id, clinic_id, patient_id, entry_type, direction, amount, currency,
      status, patient_payment_id
    into linked_ledger_entry
    from public.patient_ledger_entries
    where id = new.ledger_entry_id;

    if linked_ledger_entry.id is null then
      raise exception 'payment ledger_entry_id must reference an existing ledger entry'
        using errcode = '23514';
    end if;

    if linked_ledger_entry.clinic_id <> new.clinic_id
      or linked_ledger_entry.patient_id <> new.patient_id
      or linked_ledger_entry.entry_type <> 'payment'
      or linked_ledger_entry.direction <> 'credit'
      or linked_ledger_entry.status <> 'posted'
      or linked_ledger_entry.amount <> new.amount
      or linked_ledger_entry.currency <> new.currency
      or linked_ledger_entry.patient_payment_id <> new.id then
      raise exception
        'payment ledger_entry_id must reference a matching posted payment credit ledger entry'
        using errcode = '23514';
    end if;
  end if;

  if new.reversal_ledger_entry_id is not null then
    select id, clinic_id, patient_id, status
    into linked_reversal_ledger_entry
    from public.patient_ledger_entries
    where id = new.reversal_ledger_entry_id;

    if linked_reversal_ledger_entry.id is null then
      raise exception 'payment reversal_ledger_entry_id must reference an existing ledger entry'
        using errcode = '23514';
    end if;

    if linked_reversal_ledger_entry.clinic_id <> new.clinic_id
      or linked_reversal_ledger_entry.patient_id <> new.patient_id then
      raise exception
        'payment reversal_ledger_entry_id must reference a same-clinic same-patient ledger entry'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.enforce_patient_payment_context() is
  'Enforces patient payment clinic/patient/profile and future ledger-link consistency.';

revoke all on function public.enforce_patient_payment_context() from public;

create trigger enforce_patient_payment_context
before insert or update
on public.patient_payments
for each row
execute function public.enforce_patient_payment_context();

create trigger set_patient_payments_updated_at
before update
on public.patient_payments
for each row
execute function public.set_patient_payments_updated_at();

alter table public.patient_ledger_entries
  add column patient_payment_id uuid references public.patient_payments(id);

alter table public.patient_ledger_entries
  add constraint patient_ledger_entries_payment_link_type_check check (
    (
      patient_payment_id is null
      and entry_type <> 'payment'
    )
    or (
      patient_payment_id is not null
      and entry_type = 'payment'
      and direction = 'credit'
      and performed_service_id is null
      and visit_id is null
      and appointment_id is null
    )
  );

comment on column public.patient_ledger_entries.patient_payment_id is
  'Future linked patient payment source for posted payment credit ledger entries.';

create index patient_ledger_entries_patient_payment_id_idx
  on public.patient_ledger_entries (patient_payment_id);

create unique index patient_ledger_entries_one_posted_credit_per_payment_idx
  on public.patient_ledger_entries (clinic_id, patient_payment_id)
  where entry_type = 'payment'
    and direction = 'credit'
    and status = 'posted'
    and patient_payment_id is not null;

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
  linked_payment record;
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

  if new.patient_payment_id is not null then
    select id, clinic_id, patient_id, amount, currency, status
    into linked_payment
    from public.patient_payments
    where id = new.patient_payment_id;

    if linked_payment.id is null then
      raise exception
        'ledger entry patient_payment_id must reference an existing payment'
        using errcode = '23514';
    end if;

    if linked_payment.clinic_id <> new.clinic_id
      or linked_payment.patient_id <> new.patient_id
      or linked_payment.amount <> new.amount
      or linked_payment.currency <> new.currency
      or linked_payment.status <> 'posted'
      or new.entry_type <> 'payment'
      or new.direction <> 'credit'
      or new.status <> 'posted'
      or new.performed_service_id is not null
      or new.visit_id is not null
      or new.appointment_id is not null then
      raise exception
        'ledger payment credit must match the linked posted patient payment'
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

alter table public.patient_payments enable row level security;

grant select on public.patient_payments to authenticated;

create policy "Financial workflow roles can view clinic patient payments"
on public.patient_payments
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
    where patient.id = patient_payments.patient_id
      and patient.clinic_id = patient_payments.clinic_id
      and patient.deleted_at is null
  )
);
