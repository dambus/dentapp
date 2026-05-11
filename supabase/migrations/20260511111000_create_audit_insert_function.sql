-- DentApp controlled audit insert RPC.
-- This function is the first approved audit write path.
-- It derives actor and clinic from authenticated profile context and does not
-- accept caller-provided clinic or actor identifiers.

create or replace function public.create_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_old_values jsonb default null,
  p_new_values jsonb default null,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid;
  v_profile_id uuid;
  v_clinic_id uuid;
  v_audit_log_id uuid;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Authenticated session is required for audit log creation.';
  end if;

  if not public.is_active_profile() then
    raise exception 'Active profile is required for audit log creation.';
  end if;

  v_profile_id := public.current_profile_id();
  v_clinic_id := public.current_clinic_id();

  if v_profile_id is null or v_clinic_id is null then
    raise exception 'Current profile context is incomplete for audit log creation.';
  end if;

  if p_action is null or length(trim(p_action)) = 0 then
    raise exception 'Audit action is required.';
  end if;

  if p_entity_type is null or length(trim(p_entity_type)) = 0 then
    raise exception 'Audit entity_type is required.';
  end if;

  insert into public.audit_logs (
    clinic_id,
    actor_profile_id,
    actor_auth_user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  )
  values (
    v_clinic_id,
    v_profile_id,
    v_auth_user_id,
    trim(p_action),
    trim(p_entity_type),
    p_entity_id,
    p_old_values,
    p_new_values,
    p_metadata
  )
  returning id into v_audit_log_id;

  return v_audit_log_id;
end;
$$;

comment on function public.create_audit_log(
  text,
  text,
  uuid,
  jsonb,
  jsonb,
  jsonb
) is
  'Controlled audit insert RPC. Uses authenticated profile context for clinic and actor and blocks unauthenticated/inactive profile calls.';

revoke all on function public.create_audit_log(
  text,
  text,
  uuid,
  jsonb,
  jsonb,
  jsonb
) from public;

grant execute on function public.create_audit_log(
  text,
  text,
  uuid,
  jsonb,
  jsonb,
  jsonb
) to authenticated;
