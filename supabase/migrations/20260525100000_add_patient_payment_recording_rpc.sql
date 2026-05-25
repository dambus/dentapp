-- DentApp controlled patient payment recording.
-- Adds trusted RPCs for recording patient payments and reversing erroneous
-- payment records. No payment UI, balance, receipts, invoices, allocations,
-- refunds, or direct table mutation policies are added here.

alter table public.patient_payments
  add column idempotency_key text check (
    idempotency_key is null
    or (
      length(trim(idempotency_key)) > 0
      and length(trim(idempotency_key)) <= 120
    )
  );

comment on column public.patient_payments.idempotency_key is
  'Optional client operation key used by the controlled payment recording RPC to prevent duplicate payment records for the same clinic request.';

create unique index patient_payments_clinic_idempotency_key_unique_idx
  on public.patient_payments (clinic_id, idempotency_key)
  where idempotency_key is not null;

create or replace function public.record_patient_payment(
  target_patient_id uuid,
  payment_amount numeric,
  payment_currency text,
  payment_method text,
  payment_received_at timestamptz default null,
  payment_reference_number text default null,
  payment_notes text default null,
  payment_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile record;
  target_patient record;
  existing_payment record;
  created_payment record;
  created_ledger record;
  normalized_currency text := trim(coalesce(payment_currency, ''));
  normalized_method text := lower(trim(coalesce(payment_method, '')));
  normalized_reference text := nullif(trim(coalesce(payment_reference_number, '')), '');
  normalized_notes text := nullif(trim(coalesce(payment_notes, '')), '');
  normalized_key text := nullif(trim(coalesce(payment_idempotency_key, '')), '');
  effective_received_at timestamptz := coalesce(payment_received_at, now());
begin
  select id, clinic_id, role, status
  into actor_profile
  from public.profiles
  where auth_user_id = auth.uid()
    and status = 'active'
  limit 1;

  if actor_profile.id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'reason', 'permission',
      'message', 'Active profile context is required to record payments.'
    );
  end if;

  if actor_profile.role not in ('owner_admin', 'reception_admin') then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'reason', 'permission',
      'message', 'This role cannot record patient payments.'
    );
  end if;

  if payment_amount is null or payment_amount <= 0 then
    return jsonb_build_object(
      'ok', false,
      'status', 'invalid',
      'reason', 'validation',
      'message', 'Payment amount must be greater than zero.'
    );
  end if;

  if normalized_currency !~ '^[A-Z]{3}$' then
    return jsonb_build_object(
      'ok', false,
      'status', 'invalid',
      'reason', 'validation',
      'message', 'Payment currency must be a three-letter currency code.'
    );
  end if;

  if normalized_method not in ('cash', 'card', 'bank_transfer', 'other') then
    return jsonb_build_object(
      'ok', false,
      'status', 'invalid',
      'reason', 'validation',
      'message', 'Payment method is not supported.'
    );
  end if;

  if normalized_key is not null and length(normalized_key) > 120 then
    return jsonb_build_object(
      'ok', false,
      'status', 'invalid',
      'reason', 'validation',
      'message', 'Payment idempotency key is too long.'
    );
  end if;

  select id, clinic_id
  into target_patient
  from public.patients
  where id = target_patient_id
    and clinic_id = actor_profile.clinic_id
    and deleted_at is null;

  if target_patient.id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'reason', 'not_found',
      'message', 'Patient not found or not available in the current clinic.'
    );
  end if;

  if normalized_key is not null then
    select payment.*, ledger.id as linked_ledger_entry_id
    into existing_payment
    from public.patient_payments as payment
    left join public.patient_ledger_entries as ledger
      on ledger.id = payment.ledger_entry_id
    where payment.clinic_id = actor_profile.clinic_id
      and payment.idempotency_key = normalized_key
    for update of payment;

    if existing_payment.id is not null then
      if existing_payment.patient_id <> target_patient.id
        or existing_payment.amount <> payment_amount
        or existing_payment.currency <> normalized_currency
        or existing_payment.payment_method <> normalized_method
        or coalesce(existing_payment.reference_number, '') <> coalesce(normalized_reference, '')
        or coalesce(existing_payment.notes, '') <> coalesce(normalized_notes, '')
        or (
          payment_received_at is not null
          and existing_payment.received_at <> payment_received_at
        ) then
        return jsonb_build_object(
          'ok', false,
          'status', 'invalid',
          'reason', 'conflict',
          'message', 'Payment idempotency key was already used for a different payment request.'
        );
      end if;

      if existing_payment.ledger_entry_id is null
        or existing_payment.linked_ledger_entry_id is null then
        return jsonb_build_object(
          'ok', false,
          'status', 'blocked',
          'reason', 'conflict',
          'message', 'Existing payment record does not have a confirmed ledger credit.'
        );
      end if;

      return jsonb_build_object(
        'ok', true,
        'status', 'already_recorded',
        'message', 'Payment was already recorded.',
        'paymentId', existing_payment.id,
        'ledgerEntryId', existing_payment.ledger_entry_id,
        'patientId', existing_payment.patient_id,
        'amount', existing_payment.amount,
        'currency', existing_payment.currency,
        'paymentMethod', existing_payment.payment_method,
        'receivedAt', existing_payment.received_at
      );
    end if;
  end if;

  insert into public.patient_payments (
    clinic_id,
    patient_id,
    amount,
    currency,
    payment_method,
    status,
    received_at,
    reference_number,
    notes,
    recorded_by,
    created_by,
    idempotency_key
  )
  values (
    actor_profile.clinic_id,
    target_patient.id,
    payment_amount,
    normalized_currency,
    normalized_method,
    'posted',
    effective_received_at,
    normalized_reference,
    normalized_notes,
    actor_profile.id,
    actor_profile.id,
    normalized_key
  )
  returning *
  into created_payment;

  insert into public.patient_ledger_entries (
    clinic_id,
    patient_id,
    entry_type,
    direction,
    amount,
    currency,
    description_snapshot,
    patient_payment_id,
    status,
    source_type,
    source_id,
    posted_at,
    recorded_by,
    created_by,
    metadata
  )
  values (
    created_payment.clinic_id,
    created_payment.patient_id,
    'payment',
    'credit',
    created_payment.amount,
    created_payment.currency,
    case
      when created_payment.reference_number is null then
        'Patient payment - ' || replace(created_payment.payment_method, '_', ' ')
      else
        'Patient payment - ' || replace(created_payment.payment_method, '_', ' ')
          || ' - ' || created_payment.reference_number
    end,
    created_payment.id,
    'posted',
    'patient_payment',
    created_payment.id,
    created_payment.received_at,
    actor_profile.id,
    actor_profile.id,
    jsonb_build_object('payment_method', created_payment.payment_method)
  )
  returning *
  into created_ledger;

  update public.patient_payments
  set ledger_entry_id = created_ledger.id
  where id = created_payment.id
  returning *
  into created_payment;

  return jsonb_build_object(
    'ok', true,
    'status', 'recorded',
    'message', 'Payment was recorded.',
    'paymentId', created_payment.id,
    'ledgerEntryId', created_ledger.id,
    'patientId', created_payment.patient_id,
    'amount', created_payment.amount,
    'currency', created_payment.currency,
    'paymentMethod', created_payment.payment_method,
    'receivedAt', created_payment.received_at
  );
end;
$$;

comment on function public.record_patient_payment(
  uuid, numeric, text, text, timestamptz, text, text, text
) is
  'Records a patient payment and its linked posted ledger payment credit using trusted server-side values.';

revoke all on function public.record_patient_payment(
  uuid, numeric, text, text, timestamptz, text, text, text
) from public;
grant execute on function public.record_patient_payment(
  uuid, numeric, text, text, timestamptz, text, text, text
) to authenticated;

create or replace function public.reverse_patient_payment(
  target_payment_id uuid,
  reversal_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile record;
  target_payment record;
  original_ledger record;
  reversal_ledger record;
  normalized_reason text := nullif(trim(coalesce(reversal_reason, '')), '');
begin
  select id, clinic_id, role, status
  into actor_profile
  from public.profiles
  where auth_user_id = auth.uid()
    and status = 'active'
  limit 1;

  if actor_profile.id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'reason', 'permission',
      'message', 'Active profile context is required to reverse payments.'
    );
  end if;

  if actor_profile.role not in ('owner_admin', 'reception_admin') then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'reason', 'permission',
      'message', 'This role cannot reverse patient payments.'
    );
  end if;

  if normalized_reason is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'invalid',
      'reason', 'validation',
      'message', 'A reversal reason is required.'
    );
  end if;

  select *
  into target_payment
  from public.patient_payments
  where id = target_payment_id
    and clinic_id = actor_profile.clinic_id
  for update;

  if target_payment.id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'reason', 'not_found',
      'message', 'Payment not found or not available in the current clinic.'
    );
  end if;

  if target_payment.status = 'reversed' then
    return jsonb_build_object(
      'ok', true,
      'status', 'already_reversed',
      'message', 'Payment was already reversed.',
      'paymentId', target_payment.id,
      'ledgerEntryId', target_payment.ledger_entry_id,
      'reversalLedgerEntryId', target_payment.reversal_ledger_entry_id,
      'patientId', target_payment.patient_id,
      'amount', target_payment.amount,
      'currency', target_payment.currency,
      'paymentMethod', target_payment.payment_method,
      'receivedAt', target_payment.received_at,
      'reversedAt', target_payment.reversed_at
    );
  end if;

  if target_payment.status <> 'posted' or target_payment.ledger_entry_id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'reason', 'conflict',
      'message', 'Only posted payments with a linked ledger credit can be reversed.'
    );
  end if;

  select *
  into original_ledger
  from public.patient_ledger_entries
  where id = target_payment.ledger_entry_id
    and clinic_id = target_payment.clinic_id
    and patient_id = target_payment.patient_id
    and patient_payment_id = target_payment.id
    and entry_type = 'payment'
    and direction = 'credit'
    and status = 'posted';

  if original_ledger.id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'reason', 'conflict',
      'message', 'Original payment ledger credit could not be confirmed.'
    );
  end if;

  insert into public.patient_ledger_entries (
    clinic_id,
    patient_id,
    entry_type,
    direction,
    amount,
    currency,
    description_snapshot,
    reverses_entry_id,
    status,
    source_type,
    source_id,
    posted_at,
    recorded_by,
    created_by,
    metadata
  )
  values (
    target_payment.clinic_id,
    target_payment.patient_id,
    'reversal',
    'debit',
    target_payment.amount,
    target_payment.currency,
    'Payment reversal - ' || replace(target_payment.payment_method, '_', ' '),
    original_ledger.id,
    'posted',
    'patient_payment_reversal',
    target_payment.id,
    now(),
    actor_profile.id,
    actor_profile.id,
    jsonb_build_object('payment_id', target_payment.id)
  )
  returning *
  into reversal_ledger;

  update public.patient_payments
  set
    status = 'reversed',
    reversed_at = reversal_ledger.posted_at,
    reversed_by = actor_profile.id,
    reversal_reason = normalized_reason,
    reversal_ledger_entry_id = reversal_ledger.id
  where id = target_payment.id
  returning *
  into target_payment;

  return jsonb_build_object(
    'ok', true,
    'status', 'reversed',
    'message', 'Payment was reversed.',
    'paymentId', target_payment.id,
    'ledgerEntryId', target_payment.ledger_entry_id,
    'reversalLedgerEntryId', target_payment.reversal_ledger_entry_id,
    'patientId', target_payment.patient_id,
    'amount', target_payment.amount,
    'currency', target_payment.currency,
    'paymentMethod', target_payment.payment_method,
    'receivedAt', target_payment.received_at,
    'reversedAt', target_payment.reversed_at
  );
end;
$$;

comment on function public.reverse_patient_payment(uuid, text) is
  'Reverses an erroneous posted patient payment by preserving the original payment and credit, then creating a compensating debit reversal ledger entry.';

revoke all on function public.reverse_patient_payment(uuid, text) from public;
grant execute on function public.reverse_patient_payment(uuid, text) to authenticated;
