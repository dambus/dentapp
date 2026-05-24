-- DentApp patient ledger charge posting RPCs.
-- Adds controlled, idempotent posting from finalized performed services to
-- patient ledger charge entries. No Visit Completion/UI wiring is added here.

create or replace function public.get_patient_ledger_charge_posting_state_for_visit(
  target_visit_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile record;
  target_visit record;
  finalized_count integer := 0;
  draft_count integer := 0;
  posted_count integer := 0;
  missing_count integer := 0;
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
      'message', 'Active profile context is required to load ledger posting state.',
      'reason', 'permission',
      'finalizedServiceCount', 0,
      'postedChargeCount', 0,
      'missingChargeCount', 0
    );
  end if;

  if actor_profile.role not in (
    'owner_admin',
    'doctor',
    'specialist',
    'reception_admin'
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'message', 'This role cannot read patient ledger charge posting state.',
      'reason', 'permission',
      'finalizedServiceCount', 0,
      'postedChargeCount', 0,
      'missingChargeCount', 0
    );
  end if;

  select id, clinic_id, patient_id, appointment_id, status
  into target_visit
  from public.visits
  where id = target_visit_id
    and clinic_id = actor_profile.clinic_id
    and deleted_at is null;

  if target_visit.id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'message', 'Visit not found or not available in the current clinic.',
      'reason', 'not_found',
      'finalizedServiceCount', 0,
      'postedChargeCount', 0,
      'missingChargeCount', 0
    );
  end if;

  if target_visit.status <> 'completed' then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'message', 'Ledger charge posting is available only for completed visits.',
      'reason', 'conflict',
      'visitId', target_visit.id,
      'patientId', target_visit.patient_id,
      'finalizedServiceCount', 0,
      'postedChargeCount', 0,
      'missingChargeCount', 0
    );
  end if;

  select
    count(*) filter (where status = 'finalized'),
    count(*) filter (where status = 'draft')
  into finalized_count, draft_count
  from public.performed_services
  where visit_id = target_visit.id
    and clinic_id = target_visit.clinic_id
    and patient_id = target_visit.patient_id
    and deleted_at is null;

  if finalized_count = 0 then
    return jsonb_build_object(
      'ok', true,
      'status', 'no_services',
      'message', case
        when draft_count > 0 then 'No finalized performed services are available for ledger posting.'
        else 'No finalized performed services are recorded for this visit.'
      end,
      'visitId', target_visit.id,
      'patientId', target_visit.patient_id,
      'finalizedServiceCount', finalized_count,
      'postedChargeCount', 0,
      'missingChargeCount', 0,
      'createdChargeCount', 0
    );
  end if;

  select count(*)
  into posted_count
  from public.patient_ledger_entries as ledger
  join public.performed_services as service
    on service.id = ledger.performed_service_id
  where service.visit_id = target_visit.id
    and service.clinic_id = target_visit.clinic_id
    and service.patient_id = target_visit.patient_id
    and service.status = 'finalized'
    and service.deleted_at is null
    and ledger.clinic_id = target_visit.clinic_id
    and ledger.patient_id = target_visit.patient_id
    and ledger.visit_id = target_visit.id
    and ledger.entry_type = 'charge'
    and ledger.status = 'posted';

  missing_count := finalized_count - posted_count;

  return jsonb_build_object(
    'ok', true,
    'status', case
      when missing_count > 0 then 'posting_required'
      else 'already_posted'
    end,
    'message', case
      when missing_count > 0 then 'One or more finalized performed services still need ledger charge posting.'
      else 'All finalized performed services for this visit already have posted ledger charges.'
    end,
    'visitId', target_visit.id,
    'patientId', target_visit.patient_id,
    'finalizedServiceCount', finalized_count,
    'postedChargeCount', posted_count,
    'missingChargeCount', missing_count,
    'createdChargeCount', 0
  );
end;
$$;

comment on function public.get_patient_ledger_charge_posting_state_for_visit(uuid) is
  'Returns ledger charge posting state for finalized performed services on a completed visit without mutating ledger data.';

revoke all on function public.get_patient_ledger_charge_posting_state_for_visit(uuid) from public;
grant execute on function public.get_patient_ledger_charge_posting_state_for_visit(uuid) to authenticated;

create or replace function public.post_finalized_performed_services_to_patient_ledger(
  target_visit_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile record;
  target_visit record;
  before_state jsonb;
  after_state jsonb;
  finalized_count integer := 0;
  posted_before_count integer := 0;
  posted_after_count integer := 0;
  created_count integer := 0;
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
      'message', 'Active profile context is required to post ledger charges.',
      'reason', 'permission',
      'createdChargeCount', 0
    );
  end if;

  if actor_profile.role not in ('owner_admin', 'doctor', 'specialist') then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'message', 'This role cannot post finalized performed services to the patient ledger.',
      'reason', 'permission',
      'createdChargeCount', 0
    );
  end if;

  select id, clinic_id, patient_id, appointment_id, status
  into target_visit
  from public.visits
  where id = target_visit_id
    and clinic_id = actor_profile.clinic_id
    and deleted_at is null;

  if target_visit.id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'message', 'Visit not found or not available in the current clinic.',
      'reason', 'not_found',
      'createdChargeCount', 0
    );
  end if;

  if target_visit.status <> 'completed' then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'message', 'Ledger charge posting is available only for completed visits.',
      'reason', 'conflict',
      'visitId', target_visit.id,
      'patientId', target_visit.patient_id,
      'createdChargeCount', 0
    );
  end if;

  before_state := public.get_patient_ledger_charge_posting_state_for_visit(
    target_visit.id
  );

  if before_state->>'status' = 'no_services' then
    return before_state;
  end if;

  select count(*)
  into finalized_count
  from public.performed_services
  where visit_id = target_visit.id
    and clinic_id = target_visit.clinic_id
    and patient_id = target_visit.patient_id
    and status = 'finalized'
    and deleted_at is null;

  select count(*)
  into posted_before_count
  from public.patient_ledger_entries as ledger
  join public.performed_services as service
    on service.id = ledger.performed_service_id
  where service.visit_id = target_visit.id
    and service.clinic_id = target_visit.clinic_id
    and service.patient_id = target_visit.patient_id
    and service.status = 'finalized'
    and service.deleted_at is null
    and ledger.clinic_id = target_visit.clinic_id
    and ledger.patient_id = target_visit.patient_id
    and ledger.visit_id = target_visit.id
    and ledger.entry_type = 'charge'
    and ledger.status = 'posted';

  insert into public.patient_ledger_entries (
    clinic_id,
    patient_id,
    entry_type,
    direction,
    amount,
    currency,
    description_snapshot,
    performed_service_id,
    visit_id,
    appointment_id,
    status,
    source_type,
    source_id,
    posted_at,
    recorded_by,
    created_by
  )
  select
    service.clinic_id,
    service.patient_id,
    'charge',
    'debit',
    service.final_amount,
    service.currency,
    trim(
      both ' ' from concat_ws(
        ' - ',
        service.service_name_snapshot,
        nullif(service.tooth_or_region, ''),
        'Qty ' || service.quantity::text
      )
    ),
    service.id,
    service.visit_id,
    service.appointment_id,
    'posted',
    'performed_service',
    service.id,
    coalesce(service.performed_at, now()),
    actor_profile.id,
    actor_profile.id
  from public.performed_services as service
  where service.visit_id = target_visit.id
    and service.clinic_id = target_visit.clinic_id
    and service.patient_id = target_visit.patient_id
    and service.status = 'finalized'
    and service.deleted_at is null
  on conflict (clinic_id, performed_service_id)
    where entry_type = 'charge'
      and status = 'posted'
      and performed_service_id is not null
    do nothing;

  select count(*)
  into posted_after_count
  from public.patient_ledger_entries as ledger
  join public.performed_services as service
    on service.id = ledger.performed_service_id
  where service.visit_id = target_visit.id
    and service.clinic_id = target_visit.clinic_id
    and service.patient_id = target_visit.patient_id
    and service.status = 'finalized'
    and service.deleted_at is null
    and ledger.clinic_id = target_visit.clinic_id
    and ledger.patient_id = target_visit.patient_id
    and ledger.visit_id = target_visit.id
    and ledger.entry_type = 'charge'
    and ledger.status = 'posted';

  created_count := greatest(posted_after_count - posted_before_count, 0);
  after_state := public.get_patient_ledger_charge_posting_state_for_visit(
    target_visit.id
  );

  return jsonb_build_object(
    'ok', (after_state->>'ok')::boolean,
    'status', case
      when posted_before_count >= finalized_count and finalized_count > 0 then 'already_posted'
      when after_state->>'status' = 'already_posted' then 'posted'
      else coalesce(after_state->>'status', 'blocked')
    end,
    'message', case
      when finalized_count = 0 then 'No finalized performed services are recorded for this visit.'
      when posted_before_count >= finalized_count then 'All finalized performed services for this visit were already posted to the patient ledger.'
      when after_state->>'status' = 'already_posted' then 'Finalized performed services were posted to the patient ledger.'
      else coalesce(after_state->>'message', 'Ledger charge posting could not be confirmed.')
    end,
    'visitId', target_visit.id,
    'patientId', target_visit.patient_id,
    'finalizedServiceCount', finalized_count,
    'postedChargeCount', posted_after_count,
    'missingChargeCount', greatest(finalized_count - posted_after_count, 0),
    'createdChargeCount', created_count
  );
end;
$$;

comment on function public.post_finalized_performed_services_to_patient_ledger(uuid) is
  'Idempotently posts debit charge ledger entries for finalized performed services on a completed visit using trusted server-side source values.';

revoke all on function public.post_finalized_performed_services_to_patient_ledger(uuid) from public;
grant execute on function public.post_finalized_performed_services_to_patient_ledger(uuid) to authenticated;
