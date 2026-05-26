#!/usr/bin/env node

import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { DEMO_PASSWORD } from './demoAuthConstants.mjs'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing VITE_SUPABASE_URL/SUPABASE_URL, VITE_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY.',
  )
  process.exit(1)
}

const DEMO_CLINIC_ID = '11111111-1111-1111-1111-111111111111'
const DEMO_PATIENT_ID = '22222222-2222-2222-2222-222222222201'
const OTHER_CLINIC_ID = '11111111-1111-1111-1111-111111111193'
const OTHER_PROFILE_ID = '99999999-9999-9999-9999-999999999193'
const INACTIVE_PROFILE_ID = '99999999-9999-9999-9999-999999999194'

const ROLE_USERS = [
  { role: 'owner_admin', email: 'owner.demo@example.test' },
  { role: 'doctor', email: 'doctor.demo@example.test' },
  { role: 'specialist', email: 'specialist.demo@example.test' },
  { role: 'assistant', email: 'assistant.demo@example.test' },
  { role: 'reception_admin', email: 'reception.demo@example.test' },
  {
    role: 'inventory_responsible',
    email: 'inventory.demo@example.test',
  },
]

const FROZEN_TABLES = [
  'patient_ledger_entries',
  'patient_payments',
  'performed_services',
]

const FROZEN_RPCS = [
  {
    name: 'get_patient_ledger_charge_posting_state_for_visit',
    buildArgs: (fixture) => ({ target_visit_id: fixture.visitId }),
  },
  {
    name: 'post_finalized_performed_services_to_patient_ledger',
    buildArgs: (fixture) => ({ target_visit_id: fixture.visitId }),
  },
  {
    name: 'record_patient_payment',
    buildArgs: () => ({
      target_patient_id: DEMO_PATIENT_ID,
      payment_amount: 100,
      payment_currency: 'RSD',
      payment_method: 'cash',
      payment_received_at: null,
      payment_reference_number: null,
      payment_notes: null,
      payment_idempotency_key: `task93-${randomUUID()}`,
    }),
  },
  {
    name: 'reverse_patient_payment',
    buildArgs: (fixture) => ({
      target_payment_id: fixture.paymentId,
      reversal_reason: 'Task 93 freeze integration check',
    }),
  },
]

function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

function getAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

function getAuthedClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}

async function signIn(email) {
  const client = getAnonClient()
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: DEMO_PASSWORD,
  })

  if (error || !data.session) {
    throw new Error(error?.message ?? `No session returned for ${email}.`)
  }

  return data.session
}

async function getSessionClient(email) {
  const session = await signIn(email)
  return getAuthedClient(session.access_token)
}

async function getProfile(role) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('profiles')
    .select('id, clinic_id, role, status')
    .eq('role', role)
    .eq('clinic_id', DEMO_CLINIC_ID)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    throw new Error(error?.message ?? `Missing profile for role ${role}.`)
  }

  return data
}

async function insertRow(table, values, select = '*') {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from(table)
    .insert(values)
    .select(select)
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? `Could not insert ${table} fixture.`)
  }

  return data
}

async function prepareFrozenFixture() {
  const runId = randomUUID()
  const owner = await getProfile('owner_admin')
  const doctor = await getProfile('doctor')
  const receivedAt = new Date().toISOString()

  const appointment = await insertRow('appointments', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    assigned_provider_id: doctor.id,
    scheduled_start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    operational_state: 'not_arrived',
    reason: `Task 93 freeze fixture ${runId.slice(0, 8)}`,
    created_by: owner.id,
    updated_by: owner.id,
  })

  const visit = await insertRow('visits', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    appointment_id: appointment.id,
    status: 'completed',
    completed_at: receivedAt,
    completed_by: doctor.id,
    recommendation: 'Task 93 freeze integration completed visit fixture.',
    next_step: 'no_follow_up',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const performedService = await insertRow('performed_services', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: visit.id,
    appointment_id: appointment.id,
    service_name_snapshot: 'Task 93 frozen service fixture',
    service_code_snapshot: 'TASK93-FROZEN',
    quantity: 1,
    unit_price_amount: 1200,
    discount_amount: 0,
    final_amount: 1200,
    currency: 'RSD',
    credited_provider_id: doctor.id,
    status: 'finalized',
    performed_at: receivedAt,
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const ledgerEntry = await insertRow('patient_ledger_entries', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: visit.id,
    appointment_id: appointment.id,
    performed_service_id: performedService.id,
    entry_type: 'charge',
    direction: 'debit',
    amount: 1200,
    currency: 'RSD',
    description_snapshot: 'Task 93 frozen ledger fixture',
    status: 'posted',
    source_type: 'performed_service',
    source_id: performedService.id,
    posted_at: receivedAt,
    recorded_by: doctor.id,
    created_by: doctor.id,
  })

  const payment = await insertRow('patient_payments', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    amount: 900,
    currency: 'RSD',
    payment_method: 'cash',
    status: 'posted',
    received_at: receivedAt,
    reference_number: `TASK93-${runId.slice(0, 8)}`,
    notes: 'Task 93 frozen payment fixture.',
    recorded_by: owner.id,
    created_by: owner.id,
  })

  return {
    owner,
    doctor,
    appointmentId: appointment.id,
    visitId: visit.id,
    performedServiceId: performedService.id,
    ledgerEntryId: ledgerEntry.id,
    paymentId: payment.id,
  }
}

async function cleanupFrozenFixture(fixture) {
  if (!fixture) return

  const serviceClient = getServiceClient()
  await serviceClient
    .from('patient_ledger_entries')
    .delete()
    .in('id', [fixture.ledgerEntryId].filter(Boolean))
  await serviceClient
    .from('patient_payments')
    .delete()
    .in('id', [fixture.paymentId].filter(Boolean))
  await serviceClient
    .from('performed_services')
    .delete()
    .in('id', [fixture.performedServiceId].filter(Boolean))
  await serviceClient
    .from('visits')
    .delete()
    .in('id', [fixture.visitId].filter(Boolean))
  await serviceClient
    .from('appointments')
    .delete()
    .in('id', [fixture.appointmentId].filter(Boolean))
}

async function ensureAuxiliaryProfiles() {
  const serviceClient = getServiceClient()
  const clinic = await serviceClient.from('clinics').upsert({
    id: OTHER_CLINIC_ID,
    name: 'DentApp Other RLS Clinic',
    status: 'active',
  })

  if (clinic.error) {
    throw new Error(clinic.error.message)
  }

  const profiles = await serviceClient.from('profiles').upsert(
    [
      {
        id: OTHER_PROFILE_ID,
        auth_user_id: null,
        clinic_id: OTHER_CLINIC_ID,
        full_name: 'Other Clinic Doctor',
        email: 'other-clinic-doctor.demo@example.test',
        role: 'doctor',
        status: 'active',
      },
      {
        id: INACTIVE_PROFILE_ID,
        auth_user_id: null,
        clinic_id: DEMO_CLINIC_ID,
        full_name: 'Inactive Settlement Profile',
        email: 'inactive-settlement.demo@example.test',
        role: 'doctor',
        status: 'inactive',
      },
    ],
    { onConflict: 'id', ignoreDuplicates: false },
  )

  if (profiles.error) {
    throw new Error(profiles.error.message)
  }
}

async function cleanupFoundationRows() {
  const serviceClient = getServiceClient()
  await serviceClient
    .from('clinic_internal_settlement_access_grants')
    .delete()
    .in('clinic_id', [DEMO_CLINIC_ID, OTHER_CLINIC_ID])
  await serviceClient
    .from('clinic_internal_settlement_settings')
    .delete()
    .in('clinic_id', [DEMO_CLINIC_ID, OTHER_CLINIC_ID])
}

async function createOwnerOwnedSetting(isEnabled) {
  const ownerClient = await getSessionClient('owner.demo@example.test')
  const { data, error } = await ownerClient
    .from('clinic_internal_settlement_settings')
    .upsert({
      clinic_id: DEMO_CLINIC_ID,
      is_enabled: isEnabled,
    })
    .select('clinic_id, is_enabled, enabled_at, enabled_by')
    .single()

  return { data, error }
}

async function createGrantFor(role, grant) {
  const ownerClient = await getSessionClient('owner.demo@example.test')
  const profile = await getProfile(role)
  const { data, error } = await ownerClient
    .from('clinic_internal_settlement_access_grants')
    .upsert({
      clinic_id: DEMO_CLINIC_ID,
      profile_id: profile.id,
      can_view: Boolean(grant.can_view),
      can_manage: Boolean(grant.can_manage),
    })
    .select('clinic_id, profile_id, can_view, can_manage, granted_by')
    .single()

  return { data, error, profile }
}

async function getEligibility(email) {
  const client = await getSessionClient(email)
  const enabled = await client.rpc('current_clinic_internal_settlement_enabled')
  const canView = await client.rpc('can_view_internal_settlement_records')
  const canManage = await client.rpc('can_manage_internal_settlement_records')

  return {
    enabled: Boolean(enabled.data),
    enabledError: enabled.error?.message ?? null,
    canView: Boolean(canView.data),
    canViewError: canView.error?.message ?? null,
    canManage: Boolean(canManage.data),
    canManageError: canManage.error?.message ?? null,
  }
}

async function testDisabledByDefault() {
  await cleanupFoundationRows()
  const ownerClient = await getSessionClient('owner.demo@example.test')

  const absent = await getEligibility('doctor.demo@example.test')
  const defaultInsert = await ownerClient
    .from('clinic_internal_settlement_settings')
    .insert({ clinic_id: DEMO_CLINIC_ID })
    .select('is_enabled, enabled_at, enabled_by')
    .single()

  await cleanupFoundationRows()
  const grant = await createGrantFor('doctor', { can_view: true })
  const grantWithoutSetting = await getEligibility('doctor.demo@example.test')

  return {
    absentDisabled: !absent.enabled && !absent.canView && !absent.canManage,
    absent,
    defaultSettingDisabled:
      !defaultInsert.error &&
      defaultInsert.data?.is_enabled === false &&
      defaultInsert.data?.enabled_at === null &&
      defaultInsert.data?.enabled_by === null,
    defaultInsertError: defaultInsert.error?.message ?? null,
    grantInserted: !grant.error,
    grantInsertError: grant.error?.message ?? null,
    grantWithoutSettingDenied:
      !grantWithoutSetting.enabled &&
      !grantWithoutSetting.canView &&
      !grantWithoutSetting.canManage,
    grantWithoutSetting,
  }
}

async function testSettingsManagement() {
  const ownerClient = await getSessionClient('owner.demo@example.test')
  const roleResults = []

  await cleanupFoundationRows()
  const ownSetting = await ownerClient
    .from('clinic_internal_settlement_settings')
    .insert({ clinic_id: DEMO_CLINIC_ID, is_enabled: true })
    .select('clinic_id, is_enabled, enabled_at, enabled_by')
    .single()

  const crossClinicSetting = await ownerClient
    .from('clinic_internal_settlement_settings')
    .insert({ clinic_id: OTHER_CLINIC_ID, is_enabled: true })
    .select('clinic_id')
    .single()

  for (const roleUser of ROLE_USERS.filter((user) => user.role !== 'owner_admin')) {
    await cleanupFoundationRows()
    const client = await getSessionClient(roleUser.email)
    const insert = await client
      .from('clinic_internal_settlement_settings')
      .insert({ clinic_id: DEMO_CLINIC_ID, is_enabled: true })
      .select('clinic_id')
      .single()

    roleResults.push({
      role: roleUser.role,
      insertAllowed: !insert.error,
      insertError: insert.error?.message ?? null,
    })
  }

  return {
    ownerOwnSettingAllowed:
      !ownSetting.error &&
      ownSetting.data?.is_enabled === true &&
      Boolean(ownSetting.data?.enabled_at) &&
      Boolean(ownSetting.data?.enabled_by),
    ownerOwnSettingError: ownSetting.error?.message ?? null,
    ownerCrossClinicRejected: Boolean(crossClinicSetting.error),
    ownerCrossClinicError: crossClinicSetting.error?.message ?? null,
    roleResults,
  }
}

async function testGrantManagement() {
  const ownerClient = await getSessionClient('owner.demo@example.test')
  const doctor = await getProfile('doctor')
  const roleResults = []

  await cleanupFoundationRows()
  const ownerGrant = await createGrantFor('doctor', { can_view: true })
  const revoke = await ownerClient
    .from('clinic_internal_settlement_access_grants')
    .delete()
    .eq('clinic_id', DEMO_CLINIC_ID)
    .eq('profile_id', doctor.id)

  const crossClinicGrant = await ownerClient
    .from('clinic_internal_settlement_access_grants')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      profile_id: OTHER_PROFILE_ID,
      can_view: true,
    })
    .select('clinic_id')
    .single()

  const inactiveGrant = await ownerClient
    .from('clinic_internal_settlement_access_grants')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      profile_id: INACTIVE_PROFILE_ID,
      can_view: true,
    })
    .select('clinic_id')
    .single()

  const emptyGrant = await ownerClient
    .from('clinic_internal_settlement_access_grants')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      profile_id: doctor.id,
      can_view: false,
      can_manage: false,
    })
    .select('clinic_id')
    .single()

  for (const roleUser of ROLE_USERS.filter((user) => user.role !== 'owner_admin')) {
    await cleanupFoundationRows()
    const client = await getSessionClient(roleUser.email)
    const insert = await client
      .from('clinic_internal_settlement_access_grants')
      .insert({
        clinic_id: DEMO_CLINIC_ID,
        profile_id: doctor.id,
        can_view: true,
      })
      .select('clinic_id')
      .single()

    roleResults.push({
      role: roleUser.role,
      insertAllowed: !insert.error,
      insertError: insert.error?.message ?? null,
    })
  }

  return {
    ownerGrantAllowed: !ownerGrant.error,
    ownerGrantError: ownerGrant.error?.message ?? null,
    ownerRevokeAllowed: !revoke.error,
    ownerRevokeError: revoke.error?.message ?? null,
    crossClinicGrantRejected: Boolean(crossClinicGrant.error),
    crossClinicGrantError: crossClinicGrant.error?.message ?? null,
    inactiveGrantRejected: Boolean(inactiveGrant.error),
    inactiveGrantError: inactiveGrant.error?.message ?? null,
    emptyGrantRejected: Boolean(emptyGrant.error),
    emptyGrantError: emptyGrant.error?.message ?? null,
    roleResults,
  }
}

async function testEffectiveCapabilityEvaluation() {
  await cleanupFoundationRows()

  await createOwnerOwnedSetting(true)
  const ownerWithoutGrant = await getEligibility('owner.demo@example.test')
  const doctorWithoutGrant = await getEligibility('doctor.demo@example.test')

  const viewGrant = await createGrantFor('doctor', { can_view: true })
  const doctorViewGrant = await getEligibility('doctor.demo@example.test')

  const manageGrant = await createGrantFor('specialist', { can_manage: true })
  const specialistManageGrant = await getEligibility(
    'specialist.demo@example.test',
  )

  await createOwnerOwnedSetting(false)
  const disabledDoctor = await getEligibility('doctor.demo@example.test')
  const disabledSpecialist = await getEligibility(
    'specialist.demo@example.test',
  )

  await createOwnerOwnedSetting(true)
  const doctor = await getProfile('doctor')
  const ownerClient = await getSessionClient('owner.demo@example.test')
  await ownerClient
    .from('clinic_internal_settlement_access_grants')
    .delete()
    .eq('clinic_id', DEMO_CLINIC_ID)
    .eq('profile_id', doctor.id)
  const doctorAfterRevoke = await getEligibility('doctor.demo@example.test')

  return {
    ownerWithoutGrantDenied:
      ownerWithoutGrant.enabled &&
      !ownerWithoutGrant.canView &&
      !ownerWithoutGrant.canManage,
    ownerWithoutGrant,
    enabledWithoutExplicitGrantDenied:
      doctorWithoutGrant.enabled &&
      !doctorWithoutGrant.canView &&
      !doctorWithoutGrant.canManage,
    doctorWithoutGrant,
    viewGrantInserted: !viewGrant.error,
    viewGrantError: viewGrant.error?.message ?? null,
    viewGrantAllowsViewOnly:
      doctorViewGrant.enabled &&
      doctorViewGrant.canView &&
      !doctorViewGrant.canManage,
    doctorViewGrant,
    manageGrantInserted: !manageGrant.error,
    manageGrantError: manageGrant.error?.message ?? null,
    manageGrantAllowsManageAndView:
      specialistManageGrant.enabled &&
      specialistManageGrant.canView &&
      specialistManageGrant.canManage,
    specialistManageGrant,
    disabledWithGrantDenied:
      !disabledDoctor.enabled &&
      !disabledDoctor.canView &&
      !disabledDoctor.canManage &&
      !disabledSpecialist.enabled &&
      !disabledSpecialist.canView &&
      !disabledSpecialist.canManage,
    disabledDoctor,
    disabledSpecialist,
    revokedGrantDenied:
      doctorAfterRevoke.enabled &&
      !doctorAfterRevoke.canView &&
      !doctorAfterRevoke.canManage,
    doctorAfterRevoke,
  }
}

async function testFrozenTableAccess(client, tableName, id) {
  const serviceProbe = await getServiceClient()
    .from(tableName)
    .select('id')
    .eq('id', id)
    .maybeSingle()

  const read = await client.from(tableName).select('id').eq('id', id)
  const insert = await client.from(tableName).insert({}).select('*').single()
  const update = await client
    .from(tableName)
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
  const deleteAttempt = await client
    .from(tableName)
    .delete()
    .eq('id', id)
    .select('id')

  return {
    table: tableName,
    fixtureExists: !serviceProbe.error && Boolean(serviceProbe.data),
    fixtureError: serviceProbe.error?.message ?? null,
    readAllowed: !read.error && (read.data?.length ?? 0) > 0,
    readError: read.error?.message ?? null,
    insertAllowed: !insert.error,
    insertError: insert.error?.message ?? null,
    updateAllowed: !update.error && (update.data?.length ?? 0) > 0,
    updateError: update.error?.message ?? null,
    deleteAllowed:
      !deleteAttempt.error && (deleteAttempt.data?.length ?? 0) > 0,
    deleteError: deleteAttempt.error?.message ?? null,
  }
}

async function testFrozenRpcAccess(client, rpcCheck, fixture) {
  const rpc = await client.rpc(rpcCheck.name, rpcCheck.buildArgs(fixture))

  return {
    rpc: rpcCheck.name,
    executeAllowed: !rpc.error,
    error: rpc.error?.message ?? null,
  }
}

async function testFreezeStillIntact() {
  await cleanupFoundationRows()
  await createOwnerOwnedSetting(true)
  await createGrantFor('doctor', { can_manage: true })

  const doctorClient = await getSessionClient('doctor.demo@example.test')
  let fixture = null
  const tableResults = []
  const rpcResults = []

  try {
    fixture = await prepareFrozenFixture()
    const tableIds = {
      patient_ledger_entries: fixture.ledgerEntryId,
      patient_payments: fixture.paymentId,
      performed_services: fixture.performedServiceId,
    }

    for (const tableName of FROZEN_TABLES) {
      tableResults.push(
        await testFrozenTableAccess(doctorClient, tableName, tableIds[tableName]),
      )
    }

    for (const rpcCheck of FROZEN_RPCS) {
      rpcResults.push(await testFrozenRpcAccess(doctorClient, rpcCheck, fixture))
    }
  } finally {
    await cleanupFrozenFixture(fixture)
  }

  return {
    tableResults,
    rpcResults,
  }
}

function collectFailures(results) {
  const failures = []

  if (!results.disabled.absentDisabled) {
    failures.push('disabled-by-default: absent setting did not evaluate disabled')
  }
  if (!results.disabled.defaultSettingDisabled) {
    failures.push('disabled-by-default: inserted settings row did not default disabled')
  }
  if (!results.disabled.grantInserted) {
    failures.push('disabled-by-default: owner could not insert setup grant')
  }
  if (!results.disabled.grantWithoutSettingDenied) {
    failures.push('disabled-by-default: grant without enabled setting produced eligibility')
  }

  if (!results.settings.ownerOwnSettingAllowed) {
    failures.push('settings: owner_admin could not configure own clinic setting')
  }
  if (!results.settings.ownerCrossClinicRejected) {
    failures.push('settings: owner_admin configured another clinic setting')
  }
  for (const result of results.settings.roleResults) {
    if (result.insertAllowed) {
      failures.push(`settings: ${result.role} configured the setting`)
    }
  }

  if (!results.grants.ownerGrantAllowed) {
    failures.push('grants: owner_admin could not create same-clinic grant')
  }
  if (!results.grants.ownerRevokeAllowed) {
    failures.push('grants: owner_admin could not revoke grant')
  }
  if (!results.grants.crossClinicGrantRejected) {
    failures.push('grants: cross-clinic grant was allowed')
  }
  if (!results.grants.inactiveGrantRejected) {
    failures.push('grants: inactive profile grant was allowed')
  }
  if (!results.grants.emptyGrantRejected) {
    failures.push('grants: empty false/false grant was allowed')
  }
  for (const result of results.grants.roleResults) {
    if (result.insertAllowed) {
      failures.push(`grants: ${result.role} created a grant`)
    }
  }

  if (!results.effective.ownerWithoutGrantDenied) {
    failures.push('effective: owner_admin received access without explicit grant')
  }
  if (!results.effective.enabledWithoutExplicitGrantDenied) {
    failures.push('effective: enabled clinic produced access without explicit grant')
  }
  if (!results.effective.viewGrantAllowsViewOnly) {
    failures.push('effective: view grant did not produce view-only eligibility')
  }
  if (!results.effective.manageGrantAllowsManageAndView) {
    failures.push('effective: manage grant did not imply manage and view eligibility')
  }
  if (!results.effective.disabledWithGrantDenied) {
    failures.push('effective: disabled feature still produced grant eligibility')
  }
  if (!results.effective.revokedGrantDenied) {
    failures.push('effective: revoked grant still produced eligibility')
  }

  for (const result of results.freeze.tableResults) {
    if (!result.fixtureExists) {
      failures.push(
        `freeze: ${result.table} fixture was missing; Task 92 baseline is not integrated`,
      )
    }
    if (result.readAllowed) {
      failures.push(`freeze: ${result.table} read was allowed`)
    }
    if (result.insertAllowed) {
      failures.push(`freeze: ${result.table} insert was allowed`)
    }
    if (result.updateAllowed) {
      failures.push(`freeze: ${result.table} update was allowed`)
    }
    if (result.deleteAllowed) {
      failures.push(`freeze: ${result.table} delete was allowed`)
    }
  }

  for (const result of results.freeze.rpcResults) {
    if (result.executeAllowed) {
      failures.push(`freeze: ${result.rpc} execute was allowed`)
    }
  }

  return failures
}

async function main() {
  await ensureAuxiliaryProfiles()
  await cleanupFoundationRows()

  const results = {
    disabled: await testDisabledByDefault(),
    settings: await testSettingsManagement(),
    grants: await testGrantManagement(),
    effective: await testEffectiveCapabilityEvaluation(),
    freeze: await testFreezeStillIntact(),
  }

  await cleanupFoundationRows()

  console.log(JSON.stringify(results, null, 2))

  const failures = collectFailures(results)
  if (failures.length > 0) {
    console.error('\nInternal settlement feature access RLS test failures:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
