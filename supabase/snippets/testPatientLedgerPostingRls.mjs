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
const ROLE_EMAILS = {
  owner_admin: 'owner.demo@example.test',
  doctor: 'doctor.demo@example.test',
  specialist: 'specialist.demo@example.test',
  assistant: 'assistant.demo@example.test',
  reception_admin: 'reception.demo@example.test',
  inventory_responsible: 'inventory.demo@example.test',
}

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

async function signIn(role) {
  const client = getAnonClient()
  const { data, error } = await client.auth.signInWithPassword({
    email: ROLE_EMAILS[role],
    password: DEMO_PASSWORD,
  })

  if (error || !data.session) {
    throw new Error(error?.message ?? `No session returned for ${role}.`)
  }

  return getAuthedClient(data.session.access_token)
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

async function getPostingState(client, visitId) {
  const { data, error } = await client.rpc(
    'get_patient_ledger_charge_posting_state_for_visit',
    { target_visit_id: visitId },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function postCharges(client, visitId) {
  const { data, error } = await client.rpc(
    'post_finalized_performed_services_to_patient_ledger',
    { target_visit_id: visitId },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function getLedgerChargesForVisit(visitId) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('patient_ledger_entries')
    .select(
      'id, clinic_id, patient_id, entry_type, direction, amount, currency, description_snapshot, performed_service_id, visit_id, appointment_id, status, source_type, source_id, posted_at, recorded_by, created_by',
    )
    .eq('visit_id', visitId)
    .eq('entry_type', 'charge')
    .eq('status', 'posted')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message)
}

function ledgerPayloadForService(fixture, performedService, overrides = {}) {
  return {
    clinic_id: performedService.clinic_id,
    patient_id: performedService.patient_id,
    entry_type: 'charge',
    direction: 'debit',
    amount: performedService.final_amount,
    currency: performedService.currency,
    description_snapshot: `Seeded charge - ${performedService.service_name_snapshot}`,
    performed_service_id: performedService.id,
    visit_id: performedService.visit_id,
    appointment_id: performedService.appointment_id,
    status: 'posted',
    source_type: 'performed_service',
    source_id: performedService.id,
    posted_at: performedService.performed_at,
    recorded_by: fixture.ownerId,
    created_by: fixture.ownerId,
    ...overrides,
  }
}

async function seedExistingLedgerCharge(fixture, performedService) {
  const entry = await insertRow(
    'patient_ledger_entries',
    ledgerPayloadForService(fixture, performedService),
    'id',
  )
  fixture.ledgerEntryIds.push(entry.id)
  return entry
}

async function createPostingFixture({ serviceCount = 1, visitStatus = 'completed' } = {}) {
  const runId = randomUUID()
  const owner = await getProfile('owner_admin')
  const doctor = await getProfile('doctor')

  const appointment = await insertRow('appointments', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    assigned_provider_id: doctor.id,
    scheduled_start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    status: 'scheduled',
    operational_state: 'not_arrived',
    reason: `Patient ledger posting fixture ${runId.slice(0, 8)}.`,
    created_by: owner.id,
    updated_by: owner.id,
  })

  const visit = await insertRow('visits', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    appointment_id: appointment.id,
    status: visitStatus,
    completed_at: visitStatus === 'completed' ? new Date().toISOString() : null,
    completed_by: visitStatus === 'completed' ? doctor.id : null,
    recommendation: 'Patient ledger posting fixture visit.',
    next_step: 'no_follow_up',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const category = await insertRow('service_categories', {
    clinic_id: DEMO_CLINIC_ID,
    name: `Ledger Posting Category ${runId.slice(0, 8)}`,
    description: 'Category fixture for patient ledger posting.',
    created_by: owner.id,
    updated_by: owner.id,
  })

  const service = await insertRow('services', {
    clinic_id: DEMO_CLINIC_ID,
    category_id: category.id,
    name: `Ledger Posting Service ${runId.slice(0, 8)}`,
    code: `LEDGER-POST-${runId.slice(0, 6)}`,
    description: 'Catalog fixture for patient ledger posting.',
    default_price: 2400,
    currency: 'RSD',
    created_by: owner.id,
    updated_by: owner.id,
  })

  const performedServices = []
  for (let index = 0; index < serviceCount; index += 1) {
    const amount = 2400 + index * 700
    const performedService = await insertRow('performed_services', {
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      visit_id: visit.id,
      appointment_id: appointment.id,
      service_id: service.id,
      service_name_snapshot: `Finalized Ledger Posting Service ${index + 1}`,
      service_code_snapshot: `LEDGER-POST-${index + 1}`,
      service_category_name_snapshot: category.name,
      quantity: 1,
      unit_price_amount: amount,
      discount_amount: 0,
      final_amount: amount,
      currency: 'RSD',
      credited_provider_id: doctor.id,
      status: 'finalized',
      performed_at: new Date().toISOString(),
      created_by: doctor.id,
      updated_by: doctor.id,
    })
    performedServices.push(performedService)
  }

  return {
    ownerId: owner.id,
    doctorId: doctor.id,
    appointmentId: appointment.id,
    visitId: visit.id,
    serviceId: service.id,
    categoryId: category.id,
    performedServices,
    ledgerEntryIds: [],
  }
}

async function createDraftFixture() {
  const fixture = await createPostingFixture({ serviceCount: 0, visitStatus: 'draft' })
  const doctor = await getProfile('doctor')

  const draftService = await insertRow('performed_services', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: fixture.visitId,
    appointment_id: fixture.appointmentId,
    service_id: fixture.serviceId,
    service_name_snapshot: 'Draft Ledger Posting Service',
    service_code_snapshot: 'DRAFT-LEDGER-POST',
    service_category_name_snapshot: 'Draft ledger posting category',
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

  fixture.performedServices.push(draftService)
  return fixture
}

async function createOutOfClinicFixture() {
  const runId = randomUUID()
  const outClinicId = randomUUID()

  await insertRow('clinics', {
    id: outClinicId,
    name: `Patient Ledger Posting Out Clinic ${runId.slice(0, 8)}`,
    status: 'active',
  })

  const outDoctor = await insertRow('profiles', {
    clinic_id: outClinicId,
    full_name: `Out Ledger Posting Doctor ${runId.slice(0, 8)}`,
    email: `out.ledger.posting.${runId}@example.test`,
    role: 'doctor',
    status: 'active',
  })

  const outPatient = await insertRow('patients', {
    clinic_id: outClinicId,
    first_name: 'Out',
    last_name: `Ledger Posting ${runId.slice(0, 8)}`,
    phone: '+381600000181',
    email: `out.ledger.posting.patient.${runId}@example.test`,
    status: 'active',
    important_note: 'Out-of-clinic ledger posting fixture.',
  })

  const visit = await insertRow('visits', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    status: 'completed',
    completed_at: new Date().toISOString(),
    completed_by: outDoctor.id,
    recommendation: 'Out-of-clinic ledger posting fixture visit.',
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const category = await insertRow('service_categories', {
    clinic_id: outClinicId,
    name: `Out Ledger Posting Category ${runId.slice(0, 8)}`,
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const service = await insertRow('services', {
    clinic_id: outClinicId,
    category_id: category.id,
    name: `Out Ledger Posting Service ${runId.slice(0, 8)}`,
    code: `OUT-LEDGER-POST-${runId.slice(0, 6)}`,
    default_price: 4500,
    currency: 'RSD',
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const performedService = await insertRow('performed_services', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    visit_id: visit.id,
    service_id: service.id,
    service_name_snapshot: 'Out Ledger Posting Service',
    service_code_snapshot: 'OUT-LEDGER-POST',
    service_category_name_snapshot: category.name,
    quantity: 1,
    unit_price_amount: 4500,
    discount_amount: 0,
    final_amount: 4500,
    currency: 'RSD',
    credited_provider_id: outDoctor.id,
    status: 'finalized',
    performed_at: new Date().toISOString(),
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  return {
    outClinicId,
    outDoctorId: outDoctor.id,
    outPatientId: outPatient.id,
    visitId: visit.id,
    categoryId: category.id,
    serviceId: service.id,
    performedServices: [performedService],
  }
}

async function cleanupFixtures(fixtures) {
  const serviceClient = getServiceClient()
  const ids = {
    ledger: [],
    performedServices: [],
    services: [],
    categories: [],
    visits: [],
    appointments: [],
    patients: [],
    profiles: [],
    clinics: [],
  }

  for (const fixture of fixtures.filter(Boolean)) {
    if (fixture.ledgerEntryIds) ids.ledger.push(...fixture.ledgerEntryIds)
    if (fixture.performedServices) {
      ids.performedServices.push(...fixture.performedServices.map((row) => row.id))
    }
    if (fixture.serviceId) ids.services.push(fixture.serviceId)
    if (fixture.categoryId) ids.categories.push(fixture.categoryId)
    if (fixture.visitId) ids.visits.push(fixture.visitId)
    if (fixture.appointmentId) ids.appointments.push(fixture.appointmentId)
    if (fixture.outPatientId) ids.patients.push(fixture.outPatientId)
    if (fixture.outDoctorId) ids.profiles.push(fixture.outDoctorId)
    if (fixture.outClinicId) ids.clinics.push(fixture.outClinicId)
  }

  if (ids.ledger.length > 0) {
    await serviceClient.from('patient_ledger_entries').delete().in('id', ids.ledger)
  }
  if (ids.visits.length > 0) {
    await serviceClient
      .from('patient_ledger_entries')
      .delete()
      .in('visit_id', ids.visits)
  }
  if (ids.performedServices.length > 0) {
    await serviceClient
      .from('performed_services')
      .delete()
      .in('id', ids.performedServices)
  }
  if (ids.services.length > 0) {
    await serviceClient.from('services').delete().in('id', ids.services)
  }
  if (ids.categories.length > 0) {
    await serviceClient
      .from('service_categories')
      .delete()
      .in('id', ids.categories)
  }
  if (ids.visits.length > 0) {
    await serviceClient.from('visits').delete().in('id', ids.visits)
  }
  if (ids.appointments.length > 0) {
    await serviceClient.from('appointments').delete().in('id', ids.appointments)
  }
  if (ids.patients.length > 0) {
    await serviceClient.from('patients').delete().in('id', ids.patients)
  }
  if (ids.profiles.length > 0) {
    await serviceClient.from('profiles').delete().in('id', ids.profiles)
  }
  if (ids.clinics.length > 0) {
    await serviceClient.from('clinics').delete().in('id', ids.clinics)
  }
}

async function testHappyPathAndRetry(failures) {
  const doctorClient = await signIn('doctor')
  const fixture = await createPostingFixture({ serviceCount: 2 })

  const beforeState = await getPostingState(doctorClient, fixture.visitId)
  const postResult = await postCharges(doctorClient, fixture.visitId)
  const charges = await getLedgerChargesForVisit(fixture.visitId)
  fixture.ledgerEntryIds.push(...charges.map((charge) => charge.id))
  const afterState = await getPostingState(doctorClient, fixture.visitId)
  const beforeRetrySnapshot = charges.map((charge) => ({
    id: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    description_snapshot: charge.description_snapshot,
    performed_service_id: charge.performed_service_id,
  }))
  const retryResult = await postCharges(doctorClient, fixture.visitId)
  const afterRetryCharges = await getLedgerChargesForVisit(fixture.visitId)
  const afterRetrySnapshot = afterRetryCharges.map((charge) => ({
    id: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    description_snapshot: charge.description_snapshot,
    performed_service_id: charge.performed_service_id,
  }))

  assert(beforeState.status === 'posting_required', 'happy: initial state not posting_required', failures)
  assert(beforeState.finalizedServiceCount === 2, 'happy: finalized count mismatch', failures)
  assert(beforeState.missingChargeCount === 2, 'happy: missing count mismatch', failures)
  assert(postResult.status === 'posted', 'happy: post result not posted', failures)
  assert(postResult.createdChargeCount === 2, 'happy: created count mismatch', failures)
  assert(charges.length === 2, 'happy: charge count mismatch', failures)
  assert(afterState.status === 'already_posted', 'happy: final state not already_posted', failures)
  assert(retryResult.status === 'already_posted', 'retry: result not already_posted', failures)
  assert(retryResult.createdChargeCount === 0, 'retry: created duplicate charges', failures)
  assert(afterRetryCharges.length === 2, 'retry: ledger charge count changed', failures)
  assert(
    JSON.stringify(beforeRetrySnapshot) === JSON.stringify(afterRetrySnapshot),
    'retry: posted charge snapshots mutated',
    failures,
  )

  for (const performedService of fixture.performedServices) {
    const charge = charges.find(
      (row) => row.performed_service_id === performedService.id,
    )
    assert(Boolean(charge), 'happy: missing charge for performed service', failures)
    if (!charge) continue
    assert(charge.clinic_id === performedService.clinic_id, 'happy: clinic mismatch', failures)
    assert(charge.patient_id === performedService.patient_id, 'happy: patient mismatch', failures)
    assert(charge.visit_id === performedService.visit_id, 'happy: visit mismatch', failures)
    assert(charge.appointment_id === performedService.appointment_id, 'happy: appointment mismatch', failures)
    assert(charge.entry_type === 'charge', 'happy: entry type mismatch', failures)
    assert(charge.direction === 'debit', 'happy: direction mismatch', failures)
    assert(Number(charge.amount) === Number(performedService.final_amount), 'happy: amount mismatch', failures)
    assert(charge.currency === performedService.currency, 'happy: currency mismatch', failures)
    assert(charge.description_snapshot.includes(performedService.service_name_snapshot), 'happy: description missing service snapshot', failures)
    assert(charge.source_type === 'performed_service', 'happy: source type mismatch', failures)
    assert(charge.source_id === performedService.id, 'happy: source id mismatch', failures)
  }

  return {
    fixture,
    beforeState,
    postResult,
    afterState,
    retryResult,
    chargeCount: charges.length,
  }
}

async function testZeroServices(failures) {
  const ownerClient = await signIn('owner_admin')
  const fixture = await createPostingFixture({ serviceCount: 0 })
  const beforeState = await getPostingState(ownerClient, fixture.visitId)
  const postResult = await postCharges(ownerClient, fixture.visitId)
  const charges = await getLedgerChargesForVisit(fixture.visitId)

  assert(beforeState.status === 'no_services', 'zero: initial state not no_services', failures)
  assert(postResult.status === 'no_services', 'zero: post result not no_services', failures)
  assert(charges.length === 0, 'zero: fake ledger charges created', failures)

  return { fixture, beforeState, postResult, chargeCount: charges.length }
}

async function testPartialPostingRecovery(failures) {
  const specialistClient = await signIn('specialist')
  const fixture = await createPostingFixture({ serviceCount: 2 })
  const existing = await seedExistingLedgerCharge(fixture, fixture.performedServices[0])
  const beforeState = await getPostingState(specialistClient, fixture.visitId)
  const postResult = await postCharges(specialistClient, fixture.visitId)
  const charges = await getLedgerChargesForVisit(fixture.visitId)
  fixture.ledgerEntryIds.push(...charges.map((charge) => charge.id))
  const uniquePerformedServiceIds = new Set(
    charges.map((charge) => charge.performed_service_id),
  )

  assert(Boolean(existing.id), 'partial: seeded charge missing', failures)
  assert(beforeState.status === 'posting_required', 'partial: initial state not posting_required', failures)
  assert(beforeState.postedChargeCount === 1, 'partial: posted-before count mismatch', failures)
  assert(beforeState.missingChargeCount === 1, 'partial: missing-before count mismatch', failures)
  assert(postResult.status === 'posted', 'partial: post result not posted', failures)
  assert(postResult.createdChargeCount === 1, 'partial: created count mismatch', failures)
  assert(charges.length === 2, 'partial: final charge count mismatch', failures)
  assert(uniquePerformedServiceIds.size === 2, 'partial: duplicate performed-service charge found', failures)

  return { fixture, beforeState, postResult, chargeCount: charges.length }
}

async function testDraftOpenNotPosted(failures) {
  const doctorClient = await signIn('doctor')
  const fixture = await createDraftFixture()
  const state = await getPostingState(doctorClient, fixture.visitId)
  const result = await postCharges(doctorClient, fixture.visitId)
  const charges = await getLedgerChargesForVisit(fixture.visitId)

  assert(state.status === 'blocked', 'draft: state not blocked for open visit', failures)
  assert(result.status === 'blocked', 'draft: post result not blocked for open visit', failures)
  assert(charges.length === 0, 'draft: ledger charges created for draft service', failures)

  return { fixture, state, result, chargeCount: charges.length }
}

async function testAuthorization(failures) {
  const results = []
  const allowedRoles = ['owner_admin', 'doctor', 'specialist']
  const blockedRoles = ['reception_admin', 'assistant', 'inventory_responsible']
  const fixtures = []

  for (const role of allowedRoles) {
    const client = await signIn(role)
    const fixture = await createPostingFixture({ serviceCount: 1 })
    fixtures.push(fixture)
    const result = await postCharges(client, fixture.visitId)
    const charges = await getLedgerChargesForVisit(fixture.visitId)
    fixture.ledgerEntryIds.push(...charges.map((charge) => charge.id))

    assert(result.status === 'posted', `${role}: allowed posting did not post`, failures)
    assert(charges.length === 1, `${role}: allowed posting charge count mismatch`, failures)
    results.push({ role, status: result.status, chargeCount: charges.length })
  }

  for (const role of blockedRoles) {
    const client = await signIn(role)
    const fixture = await createPostingFixture({ serviceCount: 1 })
    fixtures.push(fixture)
    const result = await postCharges(client, fixture.visitId)
    const charges = await getLedgerChargesForVisit(fixture.visitId)

    assert(result.status === 'blocked', `${role}: blocked role was not blocked`, failures)
    assert(charges.length === 0, `${role}: blocked role created ledger charges`, failures)
    results.push({ role, status: result.status, chargeCount: charges.length })
  }

  const doctorClient = await signIn('doctor')
  const outFixture = await createOutOfClinicFixture()
  fixtures.push(outFixture)
  const crossClinicResult = await postCharges(doctorClient, outFixture.visitId)
  const crossClinicCharges = await getLedgerChargesForVisit(outFixture.visitId)

  assert(crossClinicResult.status === 'blocked', 'cross-clinic: posting was not blocked', failures)
  assert(crossClinicCharges.length === 0, 'cross-clinic: ledger charges created', failures)
  results.push({
    role: 'doctor_cross_clinic',
    status: crossClinicResult.status,
    chargeCount: crossClinicCharges.length,
  })

  return { fixtures, results }
}

async function testDirectMutationSafety(failures) {
  const ownerClient = await signIn('owner_admin')
  const fixture = await createPostingFixture({ serviceCount: 1 })
  const seededCharge = await seedExistingLedgerCharge(fixture, fixture.performedServices[0])

  const directInsert = await ownerClient
    .from('patient_ledger_entries')
    .insert(
      ledgerPayloadForService(fixture, fixture.performedServices[0], {
        description_snapshot: 'Unauthorized direct insert',
      }),
    )
    .select('id')
    .single()

  const directUpdate = await ownerClient
    .from('patient_ledger_entries')
    .update({ description_snapshot: 'Unauthorized mutation' })
    .eq('id', seededCharge.id)
    .select('id')

  const directDelete = await ownerClient
    .from('patient_ledger_entries')
    .delete()
    .eq('id', seededCharge.id)
    .select('id')

  const serviceClient = getServiceClient()
  const { data: afterMutation, error } = await serviceClient
    .from('patient_ledger_entries')
    .select('id, description_snapshot')
    .eq('id', seededCharge.id)
    .maybeSingle()

  if (error) throw new Error(error.message)

  assert(Boolean(directInsert.error), 'mutation: direct insert was allowed', failures)
  assert(
    Boolean(directUpdate.error) ||
      ((directUpdate.data ?? []).length === 0 &&
        afterMutation?.description_snapshot?.startsWith('Seeded charge -')),
    'mutation: direct update changed a ledger row',
    failures,
  )
  assert(
    Boolean(directDelete.error) ||
      ((directDelete.data ?? []).length === 0 && Boolean(afterMutation)),
    'mutation: direct delete removed a ledger row',
    failures,
  )

  return {
    fixture,
    directInsertBlocked: Boolean(directInsert.error),
    directUpdateBlocked:
      Boolean(directUpdate.error) || (directUpdate.data ?? []).length === 0,
    directDeleteBlocked:
      Boolean(directDelete.error) || (directDelete.data ?? []).length === 0,
  }
}

async function testDomainPreservation(failures) {
  const doctorClient = await signIn('doctor')
  const fixture = await createPostingFixture({ serviceCount: 1 })
  const serviceClient = getServiceClient()

  const { data: beforeVisit } = await serviceClient
    .from('visits')
    .select('id, status, completed_at, completed_by, recommendation, next_step')
    .eq('id', fixture.visitId)
    .single()
  const { data: beforeAppointment } = await serviceClient
    .from('appointments')
    .select('id, status, operational_state, assigned_provider_id')
    .eq('id', fixture.appointmentId)
    .single()
  const { data: beforeService } = await serviceClient
    .from('performed_services')
    .select(
      'id, status, service_name_snapshot, final_amount, currency, credited_provider_id',
    )
    .eq('id', fixture.performedServices[0].id)
    .single()

  await postCharges(doctorClient, fixture.visitId)
  const charges = await getLedgerChargesForVisit(fixture.visitId)
  fixture.ledgerEntryIds.push(...charges.map((charge) => charge.id))

  const { data: afterVisit } = await serviceClient
    .from('visits')
    .select('id, status, completed_at, completed_by, recommendation, next_step')
    .eq('id', fixture.visitId)
    .single()
  const { data: afterAppointment } = await serviceClient
    .from('appointments')
    .select('id, status, operational_state, assigned_provider_id')
    .eq('id', fixture.appointmentId)
    .single()
  const { data: afterService } = await serviceClient
    .from('performed_services')
    .select(
      'id, status, service_name_snapshot, final_amount, currency, credited_provider_id',
    )
    .eq('id', fixture.performedServices[0].id)
    .single()

  assert(JSON.stringify(beforeVisit) === JSON.stringify(afterVisit), 'preservation: visit mutated', failures)
  assert(JSON.stringify(beforeAppointment) === JSON.stringify(afterAppointment), 'preservation: appointment mutated', failures)
  assert(JSON.stringify(beforeService) === JSON.stringify(afterService), 'preservation: performed service mutated', failures)

  return { fixture, chargeCount: charges.length }
}

async function main() {
  const failures = []
  const fixtures = []
  const results = {}

  try {
    const happy = await testHappyPathAndRetry(failures)
    fixtures.push(happy.fixture)
    results.happyPathAndRetry = {
      beforeState: happy.beforeState,
      postResult: happy.postResult,
      afterState: happy.afterState,
      retryResult: happy.retryResult,
      chargeCount: happy.chargeCount,
    }

    const zero = await testZeroServices(failures)
    fixtures.push(zero.fixture)
    results.zeroServices = {
      beforeState: zero.beforeState,
      postResult: zero.postResult,
      chargeCount: zero.chargeCount,
    }

    const partial = await testPartialPostingRecovery(failures)
    fixtures.push(partial.fixture)
    results.partialRecovery = {
      beforeState: partial.beforeState,
      postResult: partial.postResult,
      chargeCount: partial.chargeCount,
    }

    const draft = await testDraftOpenNotPosted(failures)
    fixtures.push(draft.fixture)
    results.draftOpenNotPosted = {
      state: draft.state,
      result: draft.result,
      chargeCount: draft.chargeCount,
    }

    const authorization = await testAuthorization(failures)
    fixtures.push(...authorization.fixtures)
    results.authorization = authorization.results

    const mutation = await testDirectMutationSafety(failures)
    fixtures.push(mutation.fixture)
    results.directMutationSafety = {
      directInsertBlocked: mutation.directInsertBlocked,
      directUpdateBlocked: mutation.directUpdateBlocked,
      directDeleteBlocked: mutation.directDeleteBlocked,
    }

    const preservation = await testDomainPreservation(failures)
    fixtures.push(preservation.fixture)
    results.domainPreservation = {
      chargeCount: preservation.chargeCount,
    }
  } finally {
    await cleanupFixtures(fixtures)
  }

  console.log(JSON.stringify(results, null, 2))

  if (failures.length > 0) {
    console.error('Patient ledger posting smoke failed:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }

  console.log('Patient ledger posting smoke passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
