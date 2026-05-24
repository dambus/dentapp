#!/usr/bin/env node

import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { DEMO_PASSWORD } from './demoAuthConstants.mjs'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing VITE_SUPABASE_URL/SUPABASE_URL, VITE_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY.',
  )
  process.exit(1)
}

const DEMO_CLINIC_ID = '11111111-1111-1111-1111-111111111111'
const DEMO_PATIENT_ID = '22222222-2222-2222-2222-222222222201'

const ROLE_USERS = [
  {
    role: 'owner_admin',
    email: 'owner.demo@example.test',
    canReadLedger: true,
  },
  {
    role: 'doctor',
    email: 'doctor.demo@example.test',
    canReadLedger: true,
  },
  {
    role: 'specialist',
    email: 'specialist.demo@example.test',
    canReadLedger: true,
  },
  {
    role: 'assistant',
    email: 'assistant.demo@example.test',
    canReadLedger: false,
  },
  {
    role: 'reception_admin',
    email: 'reception.demo@example.test',
    canReadLedger: true,
  },
  {
    role: 'inventory_responsible',
    email: 'inventory.demo@example.test',
    canReadLedger: false,
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

async function getProfile(role) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('profiles')
    .select('id, role, status')
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

async function tryInsertRow(table, values, select = '*') {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from(table)
    .insert(values)
    .select(select)
    .single()

  return {
    allowed: !error,
    error: error?.message ?? null,
    data,
  }
}

function ledgerPayload(fixture, overrides = {}) {
  return {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    entry_type: 'charge',
    direction: 'debit',
    amount: 3200,
    currency: 'RSD',
    description_snapshot: 'Ledger RLS finalized service charge',
    performed_service_id: fixture.finalizedPerformedServiceId,
    visit_id: fixture.completedVisitId,
    appointment_id: fixture.appointmentId,
    status: 'posted',
    source_type: 'performed_service',
    recorded_by: fixture.ownerId,
    created_by: fixture.ownerId,
    ...overrides,
  }
}

async function prepareFixture() {
  const runId = randomUUID()
  const outClinicId = randomUUID()
  const owner = await getProfile('owner_admin')
  const doctor = await getProfile('doctor')

  await insertRow('clinics', {
    id: outClinicId,
    name: `Patient Ledger RLS Clinic ${runId.slice(0, 8)}`,
    status: 'active',
  })

  const outDoctor = await insertRow('profiles', {
    clinic_id: outClinicId,
    full_name: `External Ledger Provider ${runId.slice(0, 8)}`,
    email: `external.ledger.${runId}@example.test`,
    role: 'doctor',
    status: 'active',
  })

  const otherDemoPatient = await insertRow('patients', {
    clinic_id: DEMO_CLINIC_ID,
    first_name: 'Ledger',
    last_name: `Mismatch ${runId.slice(0, 8)}`,
    phone: '+381600000080',
    email: `ledger.mismatch.${runId}@example.test`,
    status: 'active',
    important_note: 'Patient ledger mismatch fixture.',
  })

  const outPatient = await insertRow('patients', {
    clinic_id: outClinicId,
    first_name: 'External',
    last_name: `Ledger ${runId.slice(0, 8)}`,
    phone: '+381600000180',
    email: `external.ledger.patient.${runId}@example.test`,
    status: 'active',
    important_note: 'Out-of-clinic patient ledger fixture.',
  })

  const appointment = await insertRow('appointments', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    assigned_provider_id: doctor.id,
    scheduled_start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    status: 'scheduled',
    operational_state: 'not_arrived',
    reason: 'Patient ledger RLS fixture appointment.',
    created_by: owner.id,
    updated_by: owner.id,
  })

  const completedVisit = await insertRow('visits', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    appointment_id: appointment.id,
    status: 'completed',
    completed_at: new Date().toISOString(),
    completed_by: doctor.id,
    recommendation: 'Patient ledger completed visit fixture.',
    next_step: 'no_follow_up',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const draftVisit = await insertRow('visits', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    status: 'draft',
    recommendation: 'Patient ledger draft visit fixture.',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const otherPatientCompletedVisit = await insertRow('visits', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: otherDemoPatient.id,
    status: 'completed',
    completed_at: new Date().toISOString(),
    completed_by: doctor.id,
    recommendation: 'Patient ledger other patient completed visit fixture.',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const outCompletedVisit = await insertRow('visits', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    status: 'completed',
    completed_at: new Date().toISOString(),
    completed_by: outDoctor.id,
    recommendation: 'Out-of-clinic patient ledger completed visit fixture.',
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const category = await insertRow('service_categories', {
    clinic_id: DEMO_CLINIC_ID,
    name: 'Patient Ledger RLS Category',
    description: 'Category fixture for patient ledger RLS.',
    created_by: owner.id,
    updated_by: owner.id,
  })

  const service = await insertRow('services', {
    clinic_id: DEMO_CLINIC_ID,
    category_id: category.id,
    name: 'Patient Ledger RLS Catalog Item',
    code: 'LEDGER-RLS',
    description: 'Catalog fixture for patient ledger RLS.',
    default_price: 3200,
    currency: 'RSD',
    created_by: owner.id,
    updated_by: owner.id,
  })

  const outCategory = await insertRow('service_categories', {
    clinic_id: outClinicId,
    name: 'Out Patient Ledger RLS Category',
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const outService = await insertRow('services', {
    clinic_id: outClinicId,
    category_id: outCategory.id,
    name: 'Out Patient Ledger RLS Catalog Item',
    code: 'OUT-LEDGER-RLS',
    default_price: 4700,
    currency: 'RSD',
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const finalizedPerformedService = await insertRow('performed_services', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: completedVisit.id,
    appointment_id: appointment.id,
    service_id: service.id,
    service_name_snapshot: 'Finalized Ledger Service',
    service_code_snapshot: 'FIN-LEDGER',
    service_category_name_snapshot: category.name,
    quantity: 1,
    unit_price_amount: 3200,
    discount_amount: 0,
    final_amount: 3200,
    currency: 'RSD',
    credited_provider_id: doctor.id,
    status: 'finalized',
    performed_at: new Date().toISOString(),
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const draftPerformedService = await insertRow('performed_services', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: draftVisit.id,
    service_id: service.id,
    service_name_snapshot: 'Draft Ledger Service',
    service_code_snapshot: 'DRAFT-LEDGER',
    service_category_name_snapshot: category.name,
    quantity: 1,
    unit_price_amount: 1900,
    discount_amount: 0,
    final_amount: 1900,
    currency: 'RSD',
    credited_provider_id: doctor.id,
    status: 'draft',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const otherPatientPerformedService = await insertRow('performed_services', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: otherDemoPatient.id,
    visit_id: otherPatientCompletedVisit.id,
    service_id: service.id,
    service_name_snapshot: 'Other Patient Ledger Service',
    service_code_snapshot: 'OTHER-LEDGER',
    service_category_name_snapshot: category.name,
    quantity: 1,
    unit_price_amount: 2600,
    discount_amount: 0,
    final_amount: 2600,
    currency: 'RSD',
    credited_provider_id: doctor.id,
    status: 'finalized',
    performed_at: new Date().toISOString(),
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const outPerformedService = await insertRow('performed_services', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    visit_id: outCompletedVisit.id,
    service_id: outService.id,
    service_name_snapshot: 'Out Ledger Service',
    service_code_snapshot: 'OUT-LEDGER',
    service_category_name_snapshot: outCategory.name,
    quantity: 1,
    unit_price_amount: 4700,
    discount_amount: 0,
    final_amount: 4700,
    currency: 'RSD',
    credited_provider_id: outDoctor.id,
    status: 'finalized',
    performed_at: new Date().toISOString(),
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  return {
    runId,
    outClinicId,
    ownerId: owner.id,
    doctorId: doctor.id,
    outDoctorId: outDoctor.id,
    otherDemoPatientId: otherDemoPatient.id,
    outPatientId: outPatient.id,
    appointmentId: appointment.id,
    completedVisitId: completedVisit.id,
    draftVisitId: draftVisit.id,
    otherPatientCompletedVisitId: otherPatientCompletedVisit.id,
    outCompletedVisitId: outCompletedVisit.id,
    categoryIds: [category.id, outCategory.id],
    serviceIds: [service.id, outService.id],
    performedServiceIds: [
      finalizedPerformedService.id,
      draftPerformedService.id,
      otherPatientPerformedService.id,
      outPerformedService.id,
    ],
    finalizedPerformedServiceId: finalizedPerformedService.id,
    draftPerformedServiceId: draftPerformedService.id,
    otherPatientPerformedServiceId: otherPatientPerformedService.id,
    outPerformedServiceId: outPerformedService.id,
    visitIds: [
      completedVisit.id,
      draftVisit.id,
      otherPatientCompletedVisit.id,
      outCompletedVisit.id,
    ],
    patientIds: [otherDemoPatient.id, outPatient.id],
    profileIds: [outDoctor.id],
    appointmentIds: [appointment.id],
    ledgerEntryIds: [],
  }
}

async function countRowsAs(client, table, filters) {
  let query = client.from(table).select('id', { count: 'exact', head: true })

  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value)
  }

  const { count, error } = await query

  return {
    count: count ?? 0,
    error: error?.message ?? null,
  }
}

async function insertLedgerEntry(fixture, overrides = {}) {
  const result = await tryInsertRow(
    'patient_ledger_entries',
    ledgerPayload(fixture, overrides),
    'id, entry_type, direction, amount, currency, performed_service_id, visit_id, status',
  )

  if (result.data?.id) {
    fixture.ledgerEntryIds.push(result.data.id)
  }

  return result
}

async function verifySchemaObjects() {
  const serviceClient = getServiceClient()
  const ledger = await serviceClient
    .from('patient_ledger_entries')
    .select('id')
    .limit(1)

  return {
    ledgerReadable: !ledger.error,
    ledgerError: ledger.error?.message ?? null,
  }
}

async function testIntegrity(fixture) {
  const validCharge = await insertLedgerEntry(fixture)
  const crossClinicPatient = await insertLedgerEntry(fixture, {
    patient_id: fixture.outPatientId,
  })
  const draftServiceCharge = await insertLedgerEntry(fixture, {
    amount: 1900,
    performed_service_id: fixture.draftPerformedServiceId,
    visit_id: fixture.draftVisitId,
    appointment_id: null,
  })
  const otherPatientService = await insertLedgerEntry(fixture, {
    amount: 2600,
    performed_service_id: fixture.otherPatientPerformedServiceId,
    visit_id: fixture.otherPatientCompletedVisitId,
    appointment_id: null,
  })
  const outClinicService = await insertLedgerEntry(fixture, {
    clinic_id: fixture.outClinicId,
    patient_id: DEMO_PATIENT_ID,
    amount: 4700,
    performed_service_id: fixture.outPerformedServiceId,
    visit_id: fixture.outCompletedVisitId,
    appointment_id: null,
    recorded_by: fixture.outDoctorId,
    created_by: fixture.outDoctorId,
  })
  const inconsistentVisit = await insertLedgerEntry(fixture, {
    visit_id: fixture.draftVisitId,
    appointment_id: null,
  })
  const duplicateCharge = await insertLedgerEntry(fixture)

  const otherPatientManual = await insertLedgerEntry(fixture, {
    patient_id: fixture.otherDemoPatientId,
    entry_type: 'adjustment',
    direction: 'debit',
    amount: 500,
    description_snapshot: 'Other patient manual adjustment',
    performed_service_id: null,
    visit_id: null,
    appointment_id: null,
  })
  const crossPatientReversal = await insertLedgerEntry(fixture, {
    entry_type: 'reversal',
    direction: 'credit',
    amount: 500,
    description_snapshot: 'Invalid cross-patient reversal',
    performed_service_id: null,
    visit_id: null,
    appointment_id: null,
    reverses_entry_id: otherPatientManual.data?.id,
  })

  return {
    validChargeAllowed: validCharge.allowed,
    validChargeError: validCharge.error,
    validChargeRow: validCharge.data,
    crossClinicPatientRejected: !crossClinicPatient.allowed,
    crossClinicPatientError: crossClinicPatient.error,
    draftServiceChargeRejected: !draftServiceCharge.allowed,
    draftServiceChargeError: draftServiceCharge.error,
    otherPatientServiceRejected: !otherPatientService.allowed,
    otherPatientServiceError: otherPatientService.error,
    outClinicServiceRejected: !outClinicService.allowed,
    outClinicServiceError: outClinicService.error,
    inconsistentVisitRejected: !inconsistentVisit.allowed,
    inconsistentVisitError: inconsistentVisit.error,
    duplicateChargeRejected: !duplicateCharge.allowed,
    duplicateChargeError: duplicateCharge.error,
    crossPatientReversalRejected: !crossPatientReversal.allowed,
    crossPatientReversalError: crossPatientReversal.error,
  }
}

async function testRoleVisibility(roleUser, fixture) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)

  const ledgerRead = await countRowsAs(client, 'patient_ledger_entries', {
    id: fixture.readableLedgerEntryId,
  })
  const outLedgerRead = await countRowsAs(client, 'patient_ledger_entries', {
    id: fixture.outLedgerEntryId,
  })

  return {
    role: roleUser.role,
    ledgerReadAllowed: ledgerRead.count === 1,
    ledgerReadError: ledgerRead.error,
    outLedgerHidden: outLedgerRead.count === 0,
    outLedgerReadError: outLedgerRead.error,
  }
}

async function testMutationSafety(fixture) {
  const ownerSession = await signIn('owner.demo@example.test')
  const ownerClient = getAuthedClient(ownerSession.access_token)
  const doctorSession = await signIn('doctor.demo@example.test')
  const doctorClient = getAuthedClient(doctorSession.access_token)
  const receptionSession = await signIn('reception.demo@example.test')
  const receptionClient = getAuthedClient(receptionSession.access_token)

  const ownerInsert = await ownerClient
    .from('patient_ledger_entries')
    .insert(ledgerPayload(fixture, { description_snapshot: 'Blocked owner insert' }))
    .select('id')
    .single()
  const doctorInsert = await doctorClient
    .from('patient_ledger_entries')
    .insert(ledgerPayload(fixture, { description_snapshot: 'Blocked doctor insert' }))
    .select('id')
    .single()
  const receptionInsert = await receptionClient
    .from('patient_ledger_entries')
    .insert(
      ledgerPayload(fixture, { description_snapshot: 'Blocked reception insert' }),
    )
    .select('id')
    .single()
  const ownerUpdate = await ownerClient
    .from('patient_ledger_entries')
    .update({ description_snapshot: 'Mutated ledger entry' })
    .eq('id', fixture.readableLedgerEntryId)
    .select('id')
  const ownerDelete = await ownerClient
    .from('patient_ledger_entries')
    .delete()
    .eq('id', fixture.readableLedgerEntryId)
    .select('id')
  const serviceClient = getServiceClient()
  const afterMutation = await serviceClient
    .from('patient_ledger_entries')
    .select('id, description_snapshot')
    .eq('id', fixture.readableLedgerEntryId)
    .maybeSingle()

  return {
    ownerInsertBlocked: Boolean(ownerInsert.error),
    ownerInsertError: ownerInsert.error?.message ?? null,
    doctorInsertBlocked: Boolean(doctorInsert.error),
    doctorInsertError: doctorInsert.error?.message ?? null,
    receptionInsertBlocked: Boolean(receptionInsert.error),
    receptionInsertError: receptionInsert.error?.message ?? null,
    ownerUpdateBlocked:
      Boolean(ownerUpdate.error) ||
      ((ownerUpdate.data ?? []).length === 0 &&
        afterMutation.data?.description_snapshot ===
          'Ledger RLS finalized service charge'),
    ownerUpdateError: ownerUpdate.error?.message ?? null,
    ownerDeleteBlocked:
      Boolean(ownerDelete.error) ||
      ((ownerDelete.data ?? []).length === 0 && Boolean(afterMutation.data)),
    ownerDeleteError: ownerDelete.error?.message ?? null,
  }
}

async function cleanupFixture(fixture) {
  const serviceClient = getServiceClient()

  if (fixture.ledgerEntryIds.length > 0) {
    await serviceClient
      .from('patient_ledger_entries')
      .delete()
      .in('id', fixture.ledgerEntryIds)
  }
  await serviceClient
    .from('performed_services')
    .delete()
    .in('id', fixture.performedServiceIds)
  await serviceClient.from('services').delete().in('id', fixture.serviceIds)
  await serviceClient
    .from('service_categories')
    .delete()
    .in('id', fixture.categoryIds)
  await serviceClient.from('visits').delete().in('id', fixture.visitIds)
  await serviceClient
    .from('appointments')
    .delete()
    .in('id', fixture.appointmentIds)
  await serviceClient.from('patients').delete().in('id', fixture.patientIds)
  await serviceClient.from('profiles').delete().in('id', fixture.profileIds)
  await serviceClient.from('clinics').delete().eq('id', fixture.outClinicId)
}

async function main() {
  const failures = []
  const results = {}
  const schema = await verifySchemaObjects()

  results.schema = schema
  if (!schema.ledgerReadable) failures.push('schema: patient ledger unreadable')

  const fixture = await prepareFixture()

  try {
    const integrity = await testIntegrity(fixture)
    results.integrity = integrity
    for (const [key, value] of Object.entries(integrity)) {
      if (key.endsWith('Error') || key === 'validChargeRow') continue
      if (!value) failures.push(`integrity failed: ${key}`)
    }

    const outLedger = await insertLedgerEntry(fixture, {
      clinic_id: fixture.outClinicId,
      patient_id: fixture.outPatientId,
      amount: 4700,
      performed_service_id: fixture.outPerformedServiceId,
      visit_id: fixture.outCompletedVisitId,
      appointment_id: null,
      recorded_by: fixture.outDoctorId,
      created_by: fixture.outDoctorId,
    })

    if (!outLedger.allowed) {
      failures.push(`out-of-clinic ledger fixture failed: ${outLedger.error}`)
    }

    fixture.readableLedgerEntryId = integrity.validChargeRow?.id
    fixture.outLedgerEntryId = outLedger.data?.id

    results.visibility = []
    for (const roleUser of ROLE_USERS) {
      const result = await testRoleVisibility(roleUser, fixture)
      results.visibility.push(result)

      if (roleUser.canReadLedger && !result.ledgerReadAllowed) {
        failures.push(`${roleUser.role}: ledger read was denied`)
      }
      if (!roleUser.canReadLedger && result.ledgerReadAllowed) {
        failures.push(`${roleUser.role}: ledger read unexpectedly allowed`)
      }
      if (!result.outLedgerHidden) {
        failures.push(`${roleUser.role}: out-of-clinic ledger was visible`)
      }
    }

    const mutationSafety = await testMutationSafety(fixture)
    results.mutationSafety = mutationSafety
    for (const [key, value] of Object.entries(mutationSafety)) {
      if (key.endsWith('Error')) continue
      if (!value) failures.push(`mutation safety failed: ${key}`)
    }
  } finally {
    await cleanupFixture(fixture)
  }

  console.log(JSON.stringify(results, null, 2))

  if (failures.length > 0) {
    console.error('Patient ledger RLS smoke failed:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }

  console.log('Patient ledger RLS smoke passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
