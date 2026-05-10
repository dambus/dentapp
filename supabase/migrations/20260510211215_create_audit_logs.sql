-- DentApp audit log foundation.
-- Audit logs are intentionally append-only in this initial schema:
-- - no updated_at column,
-- - no deleted_at column,
-- - no update policies,
-- - no delete policies,
-- - direct insert policy deferred until audit write paths are designed.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_auth_user_id uuid references auth.users(id) on delete set null,
  action text not null check (length(trim(action)) > 0),
  entity_type text not null check (length(trim(entity_type)) > 0),
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is
  'Append-only audit log for sensitive DentApp actions. Reads are restricted by RLS; direct client inserts are deferred until a controlled audit write strategy is implemented.';
comment on column public.audit_logs.clinic_id is
  'Clinic scope for multi-tenant audit visibility.';
comment on column public.audit_logs.actor_profile_id is
  'Application profile responsible for the action when available.';
comment on column public.audit_logs.actor_auth_user_id is
  'Supabase auth user responsible for the action when available.';
comment on column public.audit_logs.action is
  'Action identifier such as patient.created, clinical_note.updated, payment.created, role.changed, or document.uploaded.';
comment on column public.audit_logs.entity_type is
  'Logical entity type affected by the action, such as patient, clinical_note, payment, profile, or document.';
comment on column public.audit_logs.entity_id is
  'Affected entity id when the entity has a UUID primary key.';
comment on column public.audit_logs.old_values is
  'Optional JSON snapshot or field subset before the action.';
comment on column public.audit_logs.new_values is
  'Optional JSON snapshot or field subset after the action.';
comment on column public.audit_logs.metadata is
  'Optional non-primary context for the action, avoiding secrets and real patient data in development fixtures.';

create index audit_logs_clinic_id_idx on public.audit_logs (clinic_id);
create index audit_logs_clinic_created_at_idx
  on public.audit_logs (clinic_id, created_at desc);
create index audit_logs_entity_idx
  on public.audit_logs (entity_type, entity_id);
create index audit_logs_actor_profile_id_idx
  on public.audit_logs (actor_profile_id);
create index audit_logs_action_idx on public.audit_logs (action);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

grant select on public.audit_logs to authenticated;

create policy "Owner admins can view clinic audit logs"
on public.audit_logs
for select
to authenticated
using (
  public.is_active_profile()
  and clinic_id = public.current_clinic_id()
  and public.has_role(array['owner_admin'])
);
