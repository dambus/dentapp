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
    canReadCatalog: true,
    canReadPerformedServices: true,
    canWritePerformedServices: true,
  },
  {
    role: 'doctor',
    email: 'doctor.demo@example.test',
    canReadCatalog: true,
    canReadPerformedServices: true,
    canWritePerformedServices: true,
  },
  {
    role: 'specialist',
    email: 'specialist.demo@example.test',
    canReadCatalog: true,
    canReadPerformedServices: true,
    canWritePerformedServices: true,
  },
  {
    role: 'assistant',
    email: 'assistant.demo@example.test',
    canReadCatalog: true,
    canReadPerformedServices: false,
    canWritePerformedServices: false,
  },
  {
    role: 'reception_admin',
    email: 'reception.demo@example.test',
    canReadCatalog: true,
    canReadPerformedServices: true,
    canWritePerformedServices: false,
  },
  {
    role: 'inventory_responsible',
    email: 'inventory.demo@example.test',
    canReadCatalog: false,
    canReadPerformedServices: false,
    canWritePerformedServices: false,
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

async function prepareFixture() {
  const runId = randomUUID()
  const outClinicId = randomUUID()
  const owner = await getProfile('owner_admin')
  const doctor = await getProfile('doctor')
  const specialist = await getProfile('specialist')
  const assistant = await getProfile('assistant')

  await insertRow('clinics', {
    id: outClinicId,
    name: `Performed Services RLS Clinic ${runId.slice(0, 8)}`,
    status: 'active',
  })

  const outDoctor = await insertRow('profiles', {
    clinic_id: outClinicId,
    full_name: `External Provider ${runId.slice(0, 8)}`,
    email: `external.performed.${runId}@example.test`,
    role: 'doctor',
    status: 'active',
  })

  const otherDemoPatient = await insertRow('patients', {
    clinic_id: DEMO_CLINIC_ID,
    first_name: 'Performed',
    last_name: `Mismatch ${runId.slice(0, 8)}`,
    phone: '+381600000073',
    email: `performed.mismatch.${runId}@example.test`,
    status: 'active',
    important_note: 'Performed service RLS mismatch fixture.',
  })

  const outPatient = await insertRow('patients', {
    clinic_id: outClinicId,
    first_name: 'External',
    last_name: `Performed ${runId.slice(0, 8)}`,
    phone: '+381600000173',
    email: `external.performed.patient.${runId}@example.test`,
    status: 'active',
    important_note: 'Out-of-clinic performed service RLS fixture.',
  })

  const appointment = await insertRow('appointments', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    assigned_provider_id: doctor.id,
    scheduled_start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    status: 'scheduled',
    operational_state: 'not_arrived',
    reason: 'Performed service RLS fixture appointment.',
    created_by: owner.id,
    updated_by: owner.id,
  })

  const visit = await insertRow('visits', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    appointment_id: appointment.id,
    status: 'draft',
    recommendation: 'Performed service RLS draft visit.',
    next_step: 'continue_treatment_plan',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const completedVisit = await insertRow('visits', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    appointment_id: appointment.id,
    status: 'completed',
    completed_at: new Date().toISOString(),
    completed_by: doctor.id,
    recommendation: 'Performed service RLS completed visit.',
    next_step: 'follow_up_recommended',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const otherPatientVisit = await insertRow('visits', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: otherDemoPatient.id,
    status: 'draft',
    recommendation: 'Performed service patient mismatch visit.',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const outVisit = await insertRow('visits', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    status: 'draft',
    recommendation: 'Out-of-clinic performed service visit.',
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const procedure = await insertRow('visit_procedures', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: visit.id,
    procedure_name: 'Performed service fixture procedure',
    tooth_or_region: '16',
    quantity_or_duration: '1',
    note: 'Clinical procedure should stay clinical-only.',
    sort_order: 0,
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const otherProcedure = await insertRow('visit_procedures', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: otherDemoPatient.id,
    visit_id: otherPatientVisit.id,
    procedure_name: 'Mismatched performed service fixture procedure',
    tooth_or_region: '26',
    quantity_or_duration: '1',
    note: 'Mismatched clinical procedure fixture.',
    sort_order: 0,
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const plan = await insertRow('treatment_plans', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    title: 'Performed Service RLS Plan',
    description: 'Plan fixture for performed-service optional linking.',
    status: 'accepted',
    proposed_total: 12000,
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const planItem = await insertRow('treatment_plan_items', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    treatment_plan_id: plan.id,
    tooth_number: '16',
    title: 'Performed Service RLS Plan Item',
    description: 'Plan item fixture for performed service link.',
    service_code: 'PS-RLS',
    status: 'accepted',
    estimated_price: 5000,
    sort_order: 0,
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const outPlan = await insertRow('treatment_plans', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    title: 'Out Performed Service Plan',
    status: 'accepted',
    proposed_total: 9000,
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const outPlanItem = await insertRow('treatment_plan_items', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    treatment_plan_id: outPlan.id,
    tooth_number: '36',
    title: 'Out Performed Service Plan Item',
    service_code: 'OUT-PS',
    status: 'accepted',
    estimated_price: 9000,
    sort_order: 0,
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const category = await insertRow('service_categories', {
    clinic_id: DEMO_CLINIC_ID,
    name: 'Performed Service RLS Category',
    description: 'Category fixture for performed services RLS.',
    created_by: owner.id,
    updated_by: owner.id,
  })

  const service = await insertRow('services', {
    clinic_id: DEMO_CLINIC_ID,
    category_id: category.id,
    name: 'Performed Service RLS Catalog Item',
    code: 'PS-RLS',
    description: 'Catalog fixture for performed services RLS.',
    default_price: 1500,
    currency: 'RSD',
    default_duration_minutes: 30,
    created_by: owner.id,
    updated_by: owner.id,
  })

  const outCategory = await insertRow('service_categories', {
    clinic_id: outClinicId,
    name: 'Out Performed Service RLS Category',
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const outService = await insertRow('services', {
    clinic_id: outClinicId,
    category_id: outCategory.id,
    name: 'Out Performed Service RLS Catalog Item',
    code: 'OUT-PS-RLS',
    default_price: 1700,
    currency: 'RSD',
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  const performedService = await insertRow('performed_services', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: visit.id,
    visit_procedure_id: procedure.id,
    appointment_id: appointment.id,
    treatment_plan_item_id: planItem.id,
    service_id: service.id,
    service_name_snapshot: 'Readable Performed Service Fixture',
    service_code_snapshot: 'READ-PS',
    service_category_name_snapshot: category.name,
    tooth_or_region: '16',
    quantity: 1,
    unit_price_amount: 1500,
    discount_amount: 0,
    final_amount: 1500,
    currency: 'RSD',
    credited_provider_id: doctor.id,
    status: 'draft',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const outPerformedService = await insertRow('performed_services', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    visit_id: outVisit.id,
    service_id: outService.id,
    service_name_snapshot: outService.name,
    service_code_snapshot: outService.code,
    quantity: 1,
    unit_price_amount: 1700,
    discount_amount: 0,
    final_amount: 1700,
    currency: 'RSD',
    credited_provider_id: outDoctor.id,
    status: 'draft',
    created_by: outDoctor.id,
    updated_by: outDoctor.id,
  })

  return {
    runId,
    outClinicId,
    ownerId: owner.id,
    doctorId: doctor.id,
    specialistId: specialist.id,
    assistantId: assistant.id,
    outDoctorId: outDoctor.id,
    otherDemoPatientId: otherDemoPatient.id,
    outPatientId: outPatient.id,
    appointmentId: appointment.id,
    visitId: visit.id,
    completedVisitId: completedVisit.id,
    otherPatientVisitId: otherPatientVisit.id,
    outVisitId: outVisit.id,
    procedureId: procedure.id,
    otherProcedureId: otherProcedure.id,
    planId: plan.id,
    planItemId: planItem.id,
    outPlanId: outPlan.id,
    outPlanItemId: outPlanItem.id,
    categoryId: category.id,
    serviceId: service.id,
    outCategoryId: outCategory.id,
    outServiceId: outService.id,
    performedServiceId: performedService.id,
    outPerformedServiceId: outPerformedService.id,
    createdPerformedServiceIds: [performedService.id, outPerformedService.id],
    patientIds: [otherDemoPatient.id, outPatient.id],
    visitIds: [visit.id, completedVisit.id, otherPatientVisit.id, outVisit.id],
    procedureIds: [procedure.id, otherProcedure.id],
    planItemIds: [planItem.id, outPlanItem.id],
    planIds: [plan.id, outPlan.id],
    serviceIds: [service.id, outService.id],
    categoryIds: [category.id, outCategory.id],
    profileIds: [outDoctor.id],
    appointmentIds: [appointment.id],
  }
}

function validPerformedServicePayload(fixture, overrides = {}) {
  return {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: fixture.visitId,
    visit_procedure_id: fixture.procedureId,
    appointment_id: fixture.appointmentId,
    treatment_plan_item_id: fixture.planItemId,
    service_id: fixture.serviceId,
    service_name_snapshot: 'Snapshot Service Name',
    service_code_snapshot: 'SNAP-1',
    service_category_name_snapshot: 'Snapshot Category',
    tooth_or_region: '16',
    quantity: 2,
    unit_price_amount: 1500,
    discount_amount: 500,
    final_amount: 2500,
    currency: 'RSD',
    credited_provider_id: fixture.doctorId,
    status: 'draft',
    note: 'Performed service RLS smoke fixture.',
    created_by: fixture.doctorId,
    updated_by: fixture.doctorId,
    ...overrides,
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

async function testRoleVisibility(roleUser, fixture) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)

  const catalogRead = await countRowsAs(client, 'services', {
    id: fixture.serviceId,
  })
  const outCatalogRead = await countRowsAs(client, 'services', {
    id: fixture.outServiceId,
  })
  const performedServiceRead = await countRowsAs(client, 'performed_services', {
    id: fixture.performedServiceId,
  })
  const outPerformedServiceRead = await countRowsAs(client, 'performed_services', {
    id: fixture.outPerformedServiceId,
  })

  return {
    role: roleUser.role,
    catalogReadAllowed: catalogRead.count === 1,
    catalogReadError: catalogRead.error,
    outCatalogHidden: outCatalogRead.count === 0,
    outCatalogReadError: outCatalogRead.error,
    performedServiceReadAllowed: performedServiceRead.count === 1,
    performedServiceReadError: performedServiceRead.error,
    outPerformedServiceHidden: outPerformedServiceRead.count === 0,
    outPerformedServiceReadError: outPerformedServiceRead.error,
  }
}

async function insertPerformedServiceAs(client, fixture, overrides = {}) {
  const { data, error } = await client
    .from('performed_services')
    .insert(validPerformedServicePayload(fixture, overrides))
    .select(
      'id, service_name_snapshot, unit_price_amount, discount_amount, final_amount, credited_provider_id, status',
    )
    .single()

  if (data?.id) {
    fixture.createdPerformedServiceIds.push(data.id)
  }

  return {
    allowed: !error,
    error: error?.message ?? null,
    data,
  }
}

async function testWritePermissions(fixture) {
  const doctorSession = await signIn('doctor.demo@example.test')
  const doctorClient = getAuthedClient(doctorSession.access_token)
  const assistantSession = await signIn('assistant.demo@example.test')
  const assistantClient = getAuthedClient(assistantSession.access_token)
  const receptionSession = await signIn('reception.demo@example.test')
  const receptionClient = getAuthedClient(receptionSession.access_token)
  const inventorySession = await signIn('inventory.demo@example.test')
  const inventoryClient = getAuthedClient(inventorySession.access_token)

  const doctorInsert = await insertPerformedServiceAs(doctorClient, fixture)
  const assistantInsert = await insertPerformedServiceAs(assistantClient, fixture)
  const receptionInsert = await insertPerformedServiceAs(receptionClient, fixture)
  const inventoryInsert = await insertPerformedServiceAs(inventoryClient, fixture)

  return {
    doctorInsertAllowed: doctorInsert.allowed,
    doctorInsertError: doctorInsert.error,
    doctorRow: doctorInsert.data,
    assistantInsertAllowed: assistantInsert.allowed,
    assistantInsertError: assistantInsert.error,
    receptionInsertAllowed: receptionInsert.allowed,
    receptionInsertError: receptionInsert.error,
    inventoryInsertAllowed: inventoryInsert.allowed,
    inventoryInsertError: inventoryInsert.error,
  }
}

async function testDataSafeguards(fixture) {
  const session = await signIn('doctor.demo@example.test')
  const client = getAuthedClient(session.access_token)
  const serviceClient = getServiceClient()

  const validInsert = await insertPerformedServiceAs(client, fixture, {
    service_name_snapshot: 'Snapshot Persistence Service',
    unit_price_amount: 2000,
    discount_amount: 250,
    final_amount: 3750,
  })

  await serviceClient
    .from('services')
    .update({
      name: 'Catalog Name Changed After Snapshot',
      default_price: 9999,
    })
    .eq('id', fixture.serviceId)

  const snapshotRead = validInsert.data?.id
    ? await serviceClient
        .from('performed_services')
        .select('service_name_snapshot, unit_price_amount, final_amount')
        .eq('id', validInsert.data.id)
        .single()
    : { data: null, error: { message: 'No valid performed service inserted.' } }

  const crossClinicCatalog = await insertPerformedServiceAs(client, fixture, {
    service_id: fixture.outServiceId,
  })

  const crossClinicWrite = await insertPerformedServiceAs(client, fixture, {
    clinic_id: fixture.outClinicId,
    patient_id: fixture.outPatientId,
    visit_id: fixture.outVisitId,
    visit_procedure_id: null,
    appointment_id: null,
    treatment_plan_item_id: null,
    service_id: fixture.outServiceId,
    credited_provider_id: fixture.outDoctorId,
    created_by: fixture.outDoctorId,
    updated_by: fixture.outDoctorId,
  })

  const patientVisitMismatch = await insertPerformedServiceAs(client, fixture, {
    visit_id: fixture.otherPatientVisitId,
  })

  const procedureMismatch = await insertPerformedServiceAs(client, fixture, {
    visit_procedure_id: fixture.otherProcedureId,
  })

  const planItemMismatch = await insertPerformedServiceAs(client, fixture, {
    treatment_plan_item_id: fixture.outPlanItemId,
  })

  const negativeQuantity = await insertPerformedServiceAs(client, fixture, {
    quantity: -1,
    unit_price_amount: 1000,
    discount_amount: 0,
    final_amount: -1000,
  })

  const excessiveDiscount = await insertPerformedServiceAs(client, fixture, {
    quantity: 1,
    unit_price_amount: 1000,
    discount_amount: 1200,
    final_amount: -200,
  })

  const badFinalAmount = await insertPerformedServiceAs(client, fixture, {
    quantity: 2,
    unit_price_amount: 1000,
    discount_amount: 100,
    final_amount: 2000,
  })

  const assistantProvider = await insertPerformedServiceAs(client, fixture, {
    credited_provider_id: fixture.assistantId,
  })

  const outClinicProvider = await insertPerformedServiceAs(client, fixture, {
    credited_provider_id: fixture.outDoctorId,
  })

  const finalizedInvalidVisit = await insertPerformedServiceAs(client, fixture, {
    status: 'finalized',
    performed_at: new Date().toISOString(),
  })

  const finalizedValid = await insertPerformedServiceAs(client, fixture, {
    visit_id: fixture.completedVisitId,
    visit_procedure_id: null,
    status: 'finalized',
    performed_at: new Date().toISOString(),
  })

  const finalizedUpdate = finalizedValid.data?.id
    ? await client
        .from('performed_services')
        .update({
          note: 'Attempted silent finalized update.',
          updated_by: fixture.doctorId,
        })
        .eq('id', finalizedValid.data.id)
        .select('id')
        .single()
    : { error: { message: 'No finalized row inserted.' }, data: null }

  return {
    snapshotPreserved:
      !snapshotRead.error &&
      snapshotRead.data?.service_name_snapshot === 'Snapshot Persistence Service' &&
      Number(snapshotRead.data?.unit_price_amount) === 2000 &&
      Number(snapshotRead.data?.final_amount) === 3750,
    snapshotError: snapshotRead.error?.message ?? null,
    crossClinicCatalogRejected: !crossClinicCatalog.allowed,
    crossClinicCatalogError: crossClinicCatalog.error,
    crossClinicWriteRejected: !crossClinicWrite.allowed,
    crossClinicWriteError: crossClinicWrite.error,
    patientVisitMismatchRejected: !patientVisitMismatch.allowed,
    patientVisitMismatchError: patientVisitMismatch.error,
    procedureMismatchRejected: !procedureMismatch.allowed,
    procedureMismatchError: procedureMismatch.error,
    planItemMismatchRejected: !planItemMismatch.allowed,
    planItemMismatchError: planItemMismatch.error,
    negativeQuantityRejected: !negativeQuantity.allowed,
    negativeQuantityError: negativeQuantity.error,
    excessiveDiscountRejected: !excessiveDiscount.allowed,
    excessiveDiscountError: excessiveDiscount.error,
    badFinalAmountRejected: !badFinalAmount.allowed,
    badFinalAmountError: badFinalAmount.error,
    assistantProviderRejected: !assistantProvider.allowed,
    assistantProviderError: assistantProvider.error,
    outClinicProviderRejected: !outClinicProvider.allowed,
    outClinicProviderError: outClinicProvider.error,
    finalizedInvalidVisitRejected: !finalizedInvalidVisit.allowed,
    finalizedInvalidVisitError: finalizedInvalidVisit.error,
    finalizedValidAllowed: finalizedValid.allowed,
    finalizedValidError: finalizedValid.error,
    finalizedUpdateRejected: Boolean(finalizedUpdate.error),
    finalizedUpdateError: finalizedUpdate.error?.message ?? null,
  }
}

async function testNoUnrelatedMutation(fixture) {
  const serviceClient = getServiceClient()
  const beforeAppointment = await serviceClient
    .from('appointments')
    .select('status, operational_state, assigned_provider_id')
    .eq('id', fixture.appointmentId)
    .single()
  const beforeVisit = await serviceClient
    .from('visits')
    .select('completed_by')
    .eq('id', fixture.completedVisitId)
    .single()
  const beforeProcedure = await serviceClient
    .from('visit_procedures')
    .select('procedure_name, tooth_or_region, quantity_or_duration, note')
    .eq('id', fixture.procedureId)
    .single()

  const performedService = await insertRow('performed_services', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: fixture.visitId,
    visit_procedure_id: fixture.procedureId,
    appointment_id: fixture.appointmentId,
    service_id: fixture.serviceId,
    service_name_snapshot: 'No Mutation Performed Service',
    service_code_snapshot: 'NO-MUT',
    quantity: 1,
    unit_price_amount: 1000,
    discount_amount: 0,
    final_amount: 1000,
    currency: 'RSD',
    credited_provider_id: fixture.specialistId,
    status: 'draft',
    created_by: fixture.specialistId,
    updated_by: fixture.specialistId,
  })
  fixture.createdPerformedServiceIds.push(performedService.id)

  const afterAppointment = await serviceClient
    .from('appointments')
    .select('status, operational_state, assigned_provider_id')
    .eq('id', fixture.appointmentId)
    .single()
  const afterVisit = await serviceClient
    .from('visits')
    .select('completed_by')
    .eq('id', fixture.completedVisitId)
    .single()
  const afterProcedure = await serviceClient
    .from('visit_procedures')
    .select('procedure_name, tooth_or_region, quantity_or_duration, note')
    .eq('id', fixture.procedureId)
    .single()

  return {
    appointmentUnchanged:
      JSON.stringify(beforeAppointment.data) === JSON.stringify(afterAppointment.data),
    appointmentError:
      beforeAppointment.error?.message ?? afterAppointment.error?.message ?? null,
    visitCompletedByUnchanged:
      JSON.stringify(beforeVisit.data) === JSON.stringify(afterVisit.data),
    visitError: beforeVisit.error?.message ?? afterVisit.error?.message ?? null,
    procedureUnchanged:
      JSON.stringify(beforeProcedure.data) === JSON.stringify(afterProcedure.data),
    procedureError:
      beforeProcedure.error?.message ?? afterProcedure.error?.message ?? null,
  }
}

async function verifySchemaObjects() {
  const serviceClient = getServiceClient()
  const categories = await serviceClient
    .from('service_categories')
    .select('id')
    .limit(1)
  const services = await serviceClient.from('services').select('id').limit(1)
  const performedServices = await serviceClient
    .from('performed_services')
    .select('id')
    .limit(1)
  const providerHelper = await serviceClient.rpc(
    'is_valid_performed_service_provider',
    {
      service_clinic_id: DEMO_CLINIC_ID,
      provider_profile_id: (await getProfile('doctor')).id,
    },
  )

  return {
    categoriesReadable: !categories.error,
    categoriesError: categories.error?.message ?? null,
    servicesReadable: !services.error,
    servicesError: services.error?.message ?? null,
    performedServicesReadable: !performedServices.error,
    performedServicesError: performedServices.error?.message ?? null,
    providerHelperWorks: !providerHelper.error && providerHelper.data === true,
    providerHelperError: providerHelper.error?.message ?? null,
  }
}

async function cleanupFixture(fixture) {
  const serviceClient = getServiceClient()

  await serviceClient
    .from('performed_services')
    .delete()
    .in('id', fixture.createdPerformedServiceIds)
  await serviceClient.from('services').delete().in('id', fixture.serviceIds)
  await serviceClient
    .from('service_categories')
    .delete()
    .in('id', fixture.categoryIds)
  await serviceClient
    .from('treatment_plan_items')
    .delete()
    .in('id', fixture.planItemIds)
  await serviceClient.from('treatment_plans').delete().in('id', fixture.planIds)
  await serviceClient
    .from('visit_procedures')
    .delete()
    .in('id', fixture.procedureIds)
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

  if (!schema.categoriesReadable) failures.push('schema: service_categories unreadable')
  if (!schema.servicesReadable) failures.push('schema: services unreadable')
  if (!schema.performedServicesReadable) {
    failures.push('schema: performed_services unreadable')
  }
  if (!schema.providerHelperWorks) {
    failures.push('schema: provider helper failed')
  }

  const fixture = await prepareFixture()

  try {
    results.visibility = []
    for (const roleUser of ROLE_USERS) {
      const result = await testRoleVisibility(roleUser, fixture)
      results.visibility.push(result)

      if (roleUser.canReadCatalog && !result.catalogReadAllowed) {
        failures.push(`${roleUser.role}: catalog read was denied`)
      }
      if (!roleUser.canReadCatalog && result.catalogReadAllowed) {
        failures.push(`${roleUser.role}: catalog read unexpectedly allowed`)
      }
      if (!result.outCatalogHidden) {
        failures.push(`${roleUser.role}: out-of-clinic catalog was visible`)
      }
      if (
        roleUser.canReadPerformedServices &&
        !result.performedServiceReadAllowed
      ) {
        failures.push(`${roleUser.role}: performed-service read was denied`)
      }
      if (
        !roleUser.canReadPerformedServices &&
        result.performedServiceReadAllowed
      ) {
        failures.push(
          `${roleUser.role}: performed-service read unexpectedly allowed`,
        )
      }
      if (!result.outPerformedServiceHidden) {
        failures.push(`${roleUser.role}: out-of-clinic performed service was visible`)
      }
    }

    const writes = await testWritePermissions(fixture)
    results.writes = writes
    if (!writes.doctorInsertAllowed) failures.push('doctor: valid insert denied')
    if (writes.assistantInsertAllowed) {
      failures.push('assistant: performed-service insert unexpectedly allowed')
    }
    if (writes.receptionInsertAllowed) {
      failures.push('reception_admin: performed-service insert unexpectedly allowed')
    }
    if (writes.inventoryInsertAllowed) {
      failures.push(
        'inventory_responsible: performed-service insert unexpectedly allowed',
      )
    }

    const safeguards = await testDataSafeguards(fixture)
    results.safeguards = safeguards
    for (const [key, value] of Object.entries(safeguards)) {
      if (key.endsWith('Error')) continue
      if (!value) failures.push(`safeguard failed: ${key}`)
    }

    const unrelatedMutation = await testNoUnrelatedMutation(fixture)
    results.unrelatedMutation = unrelatedMutation
    if (!unrelatedMutation.appointmentUnchanged) {
      failures.push('performed-service operation mutated appointment state')
    }
    if (!unrelatedMutation.visitCompletedByUnchanged) {
      failures.push('performed-service operation mutated visits.completed_by')
    }
    if (!unrelatedMutation.procedureUnchanged) {
      failures.push('performed-service operation mutated visit_procedures')
    }
  } finally {
    await cleanupFixture(fixture)
  }

  console.log(JSON.stringify(results, null, 2))

  if (failures.length > 0) {
    console.error('Performed services RLS smoke failed:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }

  console.log('Performed services RLS smoke passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
