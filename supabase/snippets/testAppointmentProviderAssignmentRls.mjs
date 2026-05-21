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

async function insertRow(table, values, select = 'id') {
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
  const reception = await getProfile('reception_admin')
  const inventory = await getProfile('inventory_responsible')

  await insertRow('clinics', {
    id: outClinicId,
    name: `Appointment Provider RLS Clinic ${runId.slice(0, 8)}`,
    status: 'active',
  })

  const inactiveDoctor = await insertRow('profiles', {
    clinic_id: DEMO_CLINIC_ID,
    full_name: `Inactive Doctor ${runId.slice(0, 8)}`,
    email: `inactive.doctor.${runId}@example.test`,
    role: 'doctor',
    status: 'inactive',
  })

  const suspendedSpecialist = await insertRow('profiles', {
    clinic_id: DEMO_CLINIC_ID,
    full_name: `Suspended Specialist ${runId.slice(0, 8)}`,
    email: `suspended.specialist.${runId}@example.test`,
    role: 'specialist',
    status: 'suspended',
  })

  const outClinicDoctor = await insertRow('profiles', {
    clinic_id: outClinicId,
    full_name: `External Doctor ${runId.slice(0, 8)}`,
    email: `external.doctor.${runId}@example.test`,
    role: 'doctor',
    status: 'active',
  })

  return {
    runId,
    outClinicId,
    ownerId: owner.id,
    doctorId: doctor.id,
    specialistId: specialist.id,
    assistantId: assistant.id,
    receptionId: reception.id,
    inventoryId: inventory.id,
    inactiveDoctorId: inactiveDoctor.id,
    suspendedSpecialistId: suspendedSpecialist.id,
    outClinicDoctorId: outClinicDoctor.id,
    appointmentIds: [],
    visitIds: [],
    profileIds: [
      inactiveDoctor.id,
      suspendedSpecialist.id,
      outClinicDoctor.id,
    ],
  }
}

function appointmentPayload(fixture, providerId, label) {
  const scheduledStart = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  const scheduledEnd = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()

  return {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    scheduled_start: scheduledStart,
    scheduled_end: scheduledEnd,
    status: 'scheduled',
    reason: `Appointment provider RLS ${label}.`,
    notes: 'Appointment provider assignment RLS smoke fixture.',
    assigned_provider_id: providerId,
    created_by: fixture.ownerId,
    updated_by: fixture.ownerId,
  }
}

async function createAppointmentAs(client, fixture, providerId, label) {
  const { data, error } = await client
    .from('appointments')
    .insert(appointmentPayload(fixture, providerId, label))
    .select('id, assigned_provider_id')
    .single()

  if (data?.id) {
    fixture.appointmentIds.push(data.id)
  }

  return {
    allowed: !error,
    error: error?.message ?? null,
    data,
  }
}

async function createServiceAppointment(fixture, providerId, label) {
  const serviceClient = getServiceClient()
  const result = await createAppointmentAs(serviceClient, fixture, providerId, label)

  if (!result.allowed || !result.data) {
    throw new Error(result.error ?? `Could not create service appointment ${label}.`)
  }

  return result.data.id
}

async function updateAppointmentAs(client, fixture, appointmentId, providerId) {
  const { data, error } = await client
    .from('appointments')
    .update({
      assigned_provider_id: providerId,
      updated_by: fixture.ownerId,
    })
    .eq('id', appointmentId)
    .select('id, assigned_provider_id')
    .single()

  return {
    allowed: !error,
    error: error?.message ?? null,
    data,
  }
}

async function verifySchemaObjects() {
  const serviceClient = getServiceClient()
  const appointments = await serviceClient
    .from('appointments')
    .select('id, assigned_provider_id')
    .limit(1)

  const helper = await serviceClient.rpc('is_valid_appointment_assigned_provider', {
    appointment_clinic_id: DEMO_CLINIC_ID,
    provider_profile_id: null,
  })

  return {
    assignedProviderColumnReadable: !appointments.error,
    assignedProviderColumnError: appointments.error?.message ?? null,
    helperAllowsNull: !helper.error && helper.data === true,
    helperError: helper.error?.message ?? null,
  }
}

async function testOwnerAssignments(fixture) {
  const session = await signIn('owner.demo@example.test')
  const ownerClient = getAuthedClient(session.access_token)

  const allowedDoctorCreate = await createAppointmentAs(
    ownerClient,
    fixture,
    fixture.doctorId,
    'doctor create',
  )
  const allowedSpecialistCreate = await createAppointmentAs(
    ownerClient,
    fixture,
    fixture.specialistId,
    'specialist create',
  )
  const allowedNullCreate = await createAppointmentAs(
    ownerClient,
    fixture,
    null,
    'null create',
  )

  const updateFixtureId = await createServiceAppointment(
    fixture,
    null,
    'update fixture',
  )
  const allowedDoctorUpdate = await updateAppointmentAs(
    ownerClient,
    fixture,
    updateFixtureId,
    fixture.doctorId,
  )
  const allowedSpecialistUpdate = await updateAppointmentAs(
    ownerClient,
    fixture,
    updateFixtureId,
    fixture.specialistId,
  )
  const allowedNullUpdate = await updateAppointmentAs(
    ownerClient,
    fixture,
    updateFixtureId,
    null,
  )

  const blockedCreateCases = {
    crossClinicDoctor: await createAppointmentAs(
      ownerClient,
      fixture,
      fixture.outClinicDoctorId,
      'cross clinic provider create',
    ),
    inactiveDoctor: await createAppointmentAs(
      ownerClient,
      fixture,
      fixture.inactiveDoctorId,
      'inactive doctor create',
    ),
    suspendedSpecialist: await createAppointmentAs(
      ownerClient,
      fixture,
      fixture.suspendedSpecialistId,
      'suspended specialist create',
    ),
    assistant: await createAppointmentAs(
      ownerClient,
      fixture,
      fixture.assistantId,
      'assistant create',
    ),
    reception: await createAppointmentAs(
      ownerClient,
      fixture,
      fixture.receptionId,
      'reception create',
    ),
    inventory: await createAppointmentAs(
      ownerClient,
      fixture,
      fixture.inventoryId,
      'inventory create',
    ),
  }

  const blockedUpdateFixtureId = await createServiceAppointment(
    fixture,
    null,
    'blocked update fixture',
  )
  const blockedUpdateCases = {
    crossClinicDoctor: await updateAppointmentAs(
      ownerClient,
      fixture,
      blockedUpdateFixtureId,
      fixture.outClinicDoctorId,
    ),
    inactiveDoctor: await updateAppointmentAs(
      ownerClient,
      fixture,
      blockedUpdateFixtureId,
      fixture.inactiveDoctorId,
    ),
    suspendedSpecialist: await updateAppointmentAs(
      ownerClient,
      fixture,
      blockedUpdateFixtureId,
      fixture.suspendedSpecialistId,
    ),
    assistant: await updateAppointmentAs(
      ownerClient,
      fixture,
      blockedUpdateFixtureId,
      fixture.assistantId,
    ),
    reception: await updateAppointmentAs(
      ownerClient,
      fixture,
      blockedUpdateFixtureId,
      fixture.receptionId,
    ),
    inventory: await updateAppointmentAs(
      ownerClient,
      fixture,
      blockedUpdateFixtureId,
      fixture.inventoryId,
    ),
  }

  return {
    allowedDoctorCreate,
    allowedSpecialistCreate,
    allowedNullCreate,
    allowedDoctorUpdate,
    allowedSpecialistUpdate,
    allowedNullUpdate,
    blockedCreateCases,
    blockedUpdateCases,
  }
}

async function testDeniedRoleUpdate(fixture) {
  const session = await signIn('inventory.demo@example.test')
  const inventoryClient = getAuthedClient(session.access_token)
  const appointmentId = await createServiceAppointment(
    fixture,
    null,
    'inventory denied update fixture',
  )

  return updateAppointmentAs(
    inventoryClient,
    fixture,
    appointmentId,
    fixture.doctorId,
  )
}

async function testProviderReadPath(fixture) {
  const ownerSession = await signIn('owner.demo@example.test')
  const inventorySession = await signIn('inventory.demo@example.test')
  const ownerClient = getAuthedClient(ownerSession.access_token)
  const inventoryClient = getAuthedClient(inventorySession.access_token)

  const ownerRead = await ownerClient.rpc('get_assignable_appointment_providers')
  const inventoryRead = await inventoryClient.rpc(
    'get_assignable_appointment_providers',
  )
  const ownerRows = ownerRead.data ?? []
  const ownerIds = new Set(ownerRows.map((row) => row.id))

  return {
    ownerReadAllowed: !ownerRead.error,
    ownerReadError: ownerRead.error?.message ?? null,
    ownerRows,
    includesDoctor: ownerIds.has(fixture.doctorId),
    includesSpecialist: ownerIds.has(fixture.specialistId),
    excludesAssistant: !ownerIds.has(fixture.assistantId),
    excludesReception: !ownerIds.has(fixture.receptionId),
    excludesInventory: !ownerIds.has(fixture.inventoryId),
    excludesInactiveDoctor: !ownerIds.has(fixture.inactiveDoctorId),
    excludesSuspendedSpecialist: !ownerIds.has(fixture.suspendedSpecialistId),
    excludesCrossClinicDoctor: !ownerIds.has(fixture.outClinicDoctorId),
    onlyProviderRoles: ownerRows.every((row) =>
      ['doctor', 'specialist'].includes(row.role),
    ),
    inventoryRows: inventoryRead.data ?? [],
    inventoryReadAllowed: !inventoryRead.error,
    inventoryReadError: inventoryRead.error?.message ?? null,
  }
}

async function testCompletedBySeparation(fixture) {
  const serviceClient = getServiceClient()
  const appointmentId = await createServiceAppointment(
    fixture,
    null,
    'completed by separation fixture',
  )
  const visit = await insertRow(
    'visits',
    {
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      appointment_id: appointmentId,
      status: 'completed',
      recommendation: 'Provider assignment RLS completed_by separation fixture.',
      next_step: 'follow_up_recommended',
      completed_by: fixture.ownerId,
      created_by: fixture.ownerId,
      updated_by: fixture.ownerId,
    },
    'id, completed_by',
  )
  fixture.visitIds.push(visit.id)

  const update = await serviceClient
    .from('appointments')
    .update({
      assigned_provider_id: fixture.doctorId,
      updated_by: fixture.ownerId,
    })
    .eq('id', appointmentId)
    .select('id, assigned_provider_id')
    .single()

  const refreshedVisit = await serviceClient
    .from('visits')
    .select('id, completed_by')
    .eq('id', visit.id)
    .single()

  return {
    appointmentProviderUpdated: !update.error,
    appointmentProviderError: update.error?.message ?? null,
    assignedProviderId: update.data?.assigned_provider_id ?? null,
    completedByAfterAssignment: refreshedVisit.data?.completed_by ?? null,
    completedByUnaffected: refreshedVisit.data?.completed_by === fixture.ownerId,
    completedByIsNotAssignedProvider:
      refreshedVisit.data?.completed_by !== fixture.doctorId,
    visitReadError: refreshedVisit.error?.message ?? null,
  }
}

async function cleanupFixture(fixture) {
  const serviceClient = getServiceClient()

  if (fixture.visitIds.length > 0) {
    await serviceClient.from('visits').delete().in('id', fixture.visitIds)
  }

  if (fixture.appointmentIds.length > 0) {
    await serviceClient.from('appointments').delete().in('id', fixture.appointmentIds)
  }

  await serviceClient.from('profiles').delete().in('id', fixture.profileIds)
  await serviceClient.from('clinics').delete().eq('id', fixture.outClinicId)
}

function expectAllowed(failures, label, result, expectedProviderId) {
  if (!result.allowed) {
    failures.push(`${label}: unexpectedly rejected (${result.error})`)
    return
  }

  if ((result.data?.assigned_provider_id ?? null) !== expectedProviderId) {
    failures.push(`${label}: assigned_provider_id mismatch`)
  }
}

function expectBlocked(failures, label, result) {
  if (result.allowed) {
    failures.push(`${label}: unexpectedly allowed`)
  }
}

function verifyBlockedCases(failures, label, cases) {
  for (const [caseName, result] of Object.entries(cases)) {
    expectBlocked(failures, `${label} ${caseName}`, result)
  }
}

async function main() {
  const failures = []
  const fixture = await prepareFixture()

  try {
    const schema = await verifySchemaObjects()
    const providerReadPath = await testProviderReadPath(fixture)
    const ownerAssignments = await testOwnerAssignments(fixture)
    const deniedRoleUpdate = await testDeniedRoleUpdate(fixture)
    const completedBy = await testCompletedBySeparation(fixture)

    if (!schema.assignedProviderColumnReadable) {
      failures.push(
        `schema: assigned_provider_id column unreadable (${schema.assignedProviderColumnError})`,
      )
    }

    if (!schema.helperAllowsNull) {
      failures.push(`schema: provider helper did not allow null (${schema.helperError})`)
    }

    if (!providerReadPath.ownerReadAllowed) {
      failures.push(
        `provider read path: owner read rejected (${providerReadPath.ownerReadError})`,
      )
    }

    if (!providerReadPath.includesDoctor) {
      failures.push('provider read path: active same-clinic doctor missing')
    }

    if (!providerReadPath.includesSpecialist) {
      failures.push('provider read path: active same-clinic specialist missing')
    }

    if (
      !providerReadPath.excludesAssistant ||
      !providerReadPath.excludesReception ||
      !providerReadPath.excludesInventory ||
      !providerReadPath.excludesInactiveDoctor ||
      !providerReadPath.excludesSuspendedSpecialist ||
      !providerReadPath.excludesCrossClinicDoctor
    ) {
      failures.push('provider read path: returned non-assignable provider rows')
    }

    if (!providerReadPath.onlyProviderRoles) {
      failures.push('provider read path: returned roles outside doctor/specialist')
    }

    if (providerReadPath.inventoryRows.length > 0) {
      failures.push('provider read path: inventory received assignable providers')
    }

    expectAllowed(
      failures,
      'owner doctor create',
      ownerAssignments.allowedDoctorCreate,
      fixture.doctorId,
    )
    expectAllowed(
      failures,
      'owner specialist create',
      ownerAssignments.allowedSpecialistCreate,
      fixture.specialistId,
    )
    expectAllowed(
      failures,
      'owner null create',
      ownerAssignments.allowedNullCreate,
      null,
    )
    expectAllowed(
      failures,
      'owner doctor update',
      ownerAssignments.allowedDoctorUpdate,
      fixture.doctorId,
    )
    expectAllowed(
      failures,
      'owner specialist update',
      ownerAssignments.allowedSpecialistUpdate,
      fixture.specialistId,
    )
    expectAllowed(
      failures,
      'owner null update',
      ownerAssignments.allowedNullUpdate,
      null,
    )
    verifyBlockedCases(
      failures,
      'owner blocked create',
      ownerAssignments.blockedCreateCases,
    )
    verifyBlockedCases(
      failures,
      'owner blocked update',
      ownerAssignments.blockedUpdateCases,
    )
    expectBlocked(failures, 'inventory direct provider update', deniedRoleUpdate)

    if (!completedBy.appointmentProviderUpdated) {
      failures.push(
        `completed_by separation: appointment provider update failed (${completedBy.appointmentProviderError})`,
      )
    }

    if (completedBy.assignedProviderId !== fixture.doctorId) {
      failures.push('completed_by separation: appointment assigned provider mismatch')
    }

    if (!completedBy.completedByUnaffected) {
      failures.push('completed_by separation: completed_by changed unexpectedly')
    }

    if (!completedBy.completedByIsNotAssignedProvider) {
      failures.push('completed_by separation: completed_by matched assigned provider')
    }

    console.log(
      JSON.stringify(
        {
          schema,
          providerReadPath,
          ownerAssignments,
          deniedRoleUpdate,
          completedBy,
        },
        null,
        2,
      ),
    )
  } finally {
    await cleanupFixture(fixture)
  }

  if (failures.length > 0) {
    console.error('Appointment provider assignment RLS smoke test failures:')
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
