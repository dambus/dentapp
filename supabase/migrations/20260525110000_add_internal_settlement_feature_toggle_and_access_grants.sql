-- DentApp Task 93 internal settlement authorization foundation.
-- Adds disabled-by-default clinic opt-in settings and explicit per-profile
-- grants for a future restricted internal settlement capability.
-- This migration intentionally does not alter or thaw any retained ledger,
-- payment, performed-service, posting, payment-recording, or reversal paths.

create table public.clinic_internal_settlement_settings (
  clinic_id uuid primary key references public.clinics(id) on delete cascade,
  is_enabled boolean not null default false,
  enabled_at timestamptz,
  enabled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinic_internal_settlement_settings_enabled_at_check
    check (
      (is_enabled = true and enabled_at is not null)
      or (is_enabled = false and enabled_at is null)
    )
);

comment on table public.clinic_internal_settlement_settings is
  'Clinic-scoped opt-in setting for a future internal settlement records capability. Absence of a row is treated as disabled.';
comment on column public.clinic_internal_settlement_settings.is_enabled is
  'Disabled by default. Enabling this flag alone does not expose settlement, ledger, payment, or performed-service records.';
comment on column public.clinic_internal_settlement_settings.enabled_by is
  'Profile that enabled the future internal settlement capability when available in authenticated context.';

create trigger update_clinic_internal_settlement_settings_updated_at
before update on public.clinic_internal_settlement_settings
for each row
execute function public.update_updated_at_column();

create table public.clinic_internal_settlement_access_grants (
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  can_view boolean not null default false,
  can_manage boolean not null default false,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (clinic_id, profile_id),
  constraint clinic_internal_settlement_access_grants_non_empty_check
    check (can_view = true or can_manage = true)
);

comment on table public.clinic_internal_settlement_access_grants is
  'Explicit same-clinic per-profile grants for a future internal settlement records capability. Ordinary role membership does not imply access.';
comment on column public.clinic_internal_settlement_access_grants.can_view is
  'Future view eligibility grant. Effective eligibility also requires the clinic feature setting to be enabled and the profile to remain active.';
comment on column public.clinic_internal_settlement_access_grants.can_manage is
  'Future management eligibility grant. Helper functions treat can_manage as also satisfying view eligibility.';

create index clinic_internal_settlement_access_grants_profile_id_idx
  on public.clinic_internal_settlement_access_grants (profile_id);
create index clinic_internal_settlement_access_grants_granted_by_idx
  on public.clinic_internal_settlement_access_grants (granted_by);

create trigger update_clinic_internal_settlement_access_grants_updated_at
before update on public.clinic_internal_settlement_access_grants
for each row
execute function public.update_updated_at_column();

create or replace function public.validate_internal_settlement_setting()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_profile_id uuid;
begin
  if new.is_enabled then
    new.enabled_at := coalesce(new.enabled_at, now());
    v_current_profile_id := public.current_profile_id();

    if new.enabled_by is null and v_current_profile_id is not null then
      new.enabled_by := v_current_profile_id;
    end if;

    if new.enabled_by is not null and not exists (
      select 1
      from public.profiles as p
      where p.id = new.enabled_by
        and p.clinic_id = new.clinic_id
        and p.status = 'active'
    ) then
      raise exception 'enabled_by must reference an active profile in the same clinic';
    end if;
  else
    new.enabled_at := null;
    new.enabled_by := null;
  end if;

  return new;
end;
$$;

comment on function public.validate_internal_settlement_setting() is
  'Maintains enabled timestamp/profile metadata for the internal settlement clinic setting and rejects cross-clinic enabled_by profiles.';

create trigger validate_internal_settlement_setting_before_write
before insert or update on public.clinic_internal_settlement_settings
for each row
execute function public.validate_internal_settlement_setting();

create or replace function public.validate_internal_settlement_access_grant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_profile_id uuid;
begin
  if not exists (
    select 1
    from public.profiles as p
    where p.id = new.profile_id
      and p.clinic_id = new.clinic_id
      and p.status = 'active'
  ) then
    raise exception 'profile_id must reference an active profile in the same clinic';
  end if;

  v_current_profile_id := public.current_profile_id();
  if new.granted_by is null and v_current_profile_id is not null then
    new.granted_by := v_current_profile_id;
  end if;

  if new.granted_by is not null and not exists (
    select 1
    from public.profiles as p
    where p.id = new.granted_by
      and p.clinic_id = new.clinic_id
      and p.status = 'active'
  ) then
    raise exception 'granted_by must reference an active profile in the same clinic';
  end if;

  return new;
end;
$$;

comment on function public.validate_internal_settlement_access_grant() is
  'Rejects internal settlement grants unless the target and grantor profiles are active and scoped to the grant clinic.';

create trigger validate_internal_settlement_access_grant_before_write
before insert or update on public.clinic_internal_settlement_access_grants
for each row
execute function public.validate_internal_settlement_access_grant();

create or replace function public.internal_settlement_enabled_for_clinic(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select s.is_enabled
    from public.clinic_internal_settlement_settings as s
    where s.clinic_id = p_clinic_id
  ), false)
$$;

comment on function public.internal_settlement_enabled_for_clinic(uuid) is
  'Returns whether the future internal settlement capability is enabled for a clinic. Missing settings rows are disabled.';

create or replace function public.current_clinic_internal_settlement_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_active_profile()
    and public.internal_settlement_enabled_for_clinic(public.current_clinic_id())
$$;

comment on function public.current_clinic_internal_settlement_enabled() is
  'Returns whether the current active profile clinic has opted into the future internal settlement capability.';

create or replace function public.can_view_internal_settlement_records()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_clinic_internal_settlement_enabled()
    and exists (
      select 1
      from public.profiles as p
      join public.clinic_internal_settlement_access_grants as g
        on g.clinic_id = p.clinic_id
       and g.profile_id = p.id
      where p.auth_user_id = auth.uid()
        and p.status = 'active'
        and (g.can_view = true or g.can_manage = true)
    )
$$;

comment on function public.can_view_internal_settlement_records() is
  'Future-only helper for internal settlement view eligibility. It requires enabled clinic setting, active current profile, and an explicit view or manage grant.';

create or replace function public.can_manage_internal_settlement_records()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_clinic_internal_settlement_enabled()
    and exists (
      select 1
      from public.profiles as p
      join public.clinic_internal_settlement_access_grants as g
        on g.clinic_id = p.clinic_id
       and g.profile_id = p.id
      where p.auth_user_id = auth.uid()
        and p.status = 'active'
        and g.can_manage = true
    )
$$;

comment on function public.can_manage_internal_settlement_records() is
  'Future-only helper for internal settlement management eligibility. It requires enabled clinic setting, active current profile, and an explicit manage grant.';

revoke all on function public.validate_internal_settlement_setting() from public;
revoke all on function public.validate_internal_settlement_access_grant() from public;
revoke all on function public.internal_settlement_enabled_for_clinic(uuid) from public;
revoke all on function public.current_clinic_internal_settlement_enabled() from public;
revoke all on function public.can_view_internal_settlement_records() from public;
revoke all on function public.can_manage_internal_settlement_records() from public;

grant execute on function public.internal_settlement_enabled_for_clinic(uuid) to authenticated;
grant execute on function public.current_clinic_internal_settlement_enabled() to authenticated;
grant execute on function public.can_view_internal_settlement_records() to authenticated;
grant execute on function public.can_manage_internal_settlement_records() to authenticated;

alter table public.clinic_internal_settlement_settings enable row level security;
alter table public.clinic_internal_settlement_access_grants enable row level security;

grant select, insert, update, delete
  on public.clinic_internal_settlement_settings to authenticated;
grant select, insert, update, delete
  on public.clinic_internal_settlement_access_grants to authenticated;

create policy "Owner admins can view own clinic internal settlement setting"
on public.clinic_internal_settlement_settings
for select
to authenticated
using (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
);

create policy "Owner admins can insert own clinic internal settlement setting"
on public.clinic_internal_settlement_settings
for insert
to authenticated
with check (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
  and (enabled_by is null or enabled_by = public.current_profile_id())
);

create policy "Owner admins can update own clinic internal settlement setting"
on public.clinic_internal_settlement_settings
for update
to authenticated
using (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
)
with check (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
  and (enabled_by is null or enabled_by = public.current_profile_id())
);

create policy "Owner admins can delete own clinic internal settlement setting"
on public.clinic_internal_settlement_settings
for delete
to authenticated
using (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
);

create policy "Owner admins can view own clinic internal settlement grants"
on public.clinic_internal_settlement_access_grants
for select
to authenticated
using (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
);

create policy "Owner admins can insert own clinic internal settlement grants"
on public.clinic_internal_settlement_access_grants
for insert
to authenticated
with check (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
  and (granted_by is null or granted_by = public.current_profile_id())
  and exists (
    select 1
    from public.profiles as p
    where p.id = profile_id
      and p.clinic_id = clinic_id
      and p.status = 'active'
  )
);

create policy "Owner admins can update own clinic internal settlement grants"
on public.clinic_internal_settlement_access_grants
for update
to authenticated
using (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
)
with check (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
  and (granted_by is null or granted_by = public.current_profile_id())
  and exists (
    select 1
    from public.profiles as p
    where p.id = profile_id
      and p.clinic_id = clinic_id
      and p.status = 'active'
  )
);

create policy "Owner admins can delete own clinic internal settlement grants"
on public.clinic_internal_settlement_access_grants
for delete
to authenticated
using (
  public.is_active_profile()
  and public.has_role(array['owner_admin'])
  and clinic_id = public.current_clinic_id()
);
