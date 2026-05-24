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

const ALLOWED_ROLE_USERS = [
  { role: 'owner_admin', email: 'owner.demo@example.test' },
  { role: 'reception_admin', email: 'reception.demo@example.test' },
  { role: 'doctor', email: 'doctor.demo@example.test' },
  { role: 'specialist', email: 'specialist.demo@example.test' },
  { role: 'assistant', email: 'assistant.demo@example.test' },
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
    .select('id, role')
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
  const outPatientId = randomUUID()
  const owner = await getProfile('owner_admin')
  const doctor = await getProfile('doctor')

  await insertRow('clinics', {
    id: outClinicId,
    name: `Operational State RLS Clinic ${runId.slice(0, 8)}`,
    status: 'active',
  })

  await insertRow('patients', {
    id: outPatientId,
    clinic_id: outClinicId,
    first_name: 'External',
    last_name: `Patient ${runId.slice(0, 8)}`,
    phone: '+381 60 000 0680',
    status: 'active',
  })

  return {
    runId,
    ownerId: owner.id,
    doctorId: doctor.id,
    outClinicId,
    outPatientId,
    appointmentIds: [],
    visitIds: [],
  }
}

function appointmentPayload(fixture, label, overrides = {}) {
  const scheduledStart = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  const scheduledEnd = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()

  return {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    scheduled_start: scheduledStart,
    scheduled_end: scheduledEnd,
    status: 'scheduled',
    reason: `Appointment operational state RLS ${label}.`,
    notes: 'Appointment operational state RLS smoke fixture.',
    assigned_provider_id: null,
    created_by: fixture.ownerId,
    updated_by: fixture.ownerId,
    ...overrides,
  }
}

async function createServiceAppointment(fixture, label, overrides = {}) {
  const appointment = await insertRow(
    'appointments',
    appointmentPayload(fixture, label, overrides),
    'id, status, operational_state, assigned_provider_id',
  )
  fixture.appointmentIds.push(appointment.id)

  return appointment
}

async function createLinkedVisit(fixture, appointmentId, status = 'completed') {
  const visit = await insertRow(
    'visits',
    {
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      appointment_id: appointmentId,
      status,
      recommendation: 'Operational state RLS linked visit fixture.',
      next_step: 'follow_up_recommended',
      completed_by: fixture.ownerId,
      created_by: fixture.ownerId,
      updated_by: fixture.ownerId,
    },
    'id, completed_by',
  )
  fixture.visitIds.push(visit.id)

  return visit
}

async function updateOperationalStateAs(client, appointmentId, nextState, updatedBy) {
  const { data, error } = await client
    .from('appointments')
    .update({
      operational_state: nextState,
      updated_by: updatedBy,
    })
    .eq('id', appointmentId)
    .select('id, status, operational_state, assigned_provider_id')
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
    .select('id, operational_state')
    .limit(1)

  const helper = await serviceClient.rpc(
    'is_valid_appointment_operational_transition',
    {
      current_lifecycle_status: 'scheduled',
      current_operational_state: 'not_arrived',
      requested_operational_state: 'arrived',
      has_linked_visit: false,
    },
  )

  return {
    operationalStateColumnReadable: !appointments.error,
    operationalStateColumnError: appointments.error?.message ?? null,
    helperAllowsArrival: !helper.error && helper.data === true,
    helperError: helper.error?.message ?? null,
  }
}

async function testDefaultState(fixture) {
  return createServiceAppointment(fixture, 'default state')
}

async function testAllowedRoleTransitions(fixture) {
  const results = []

  for (const roleUser of ALLOWED_ROLE_USERS) {
    const session = await signIn(roleUser.email)
    const client = getAuthedClient(session.access_token)
    const profile = await getProfile(roleUser.role)
    const appointment = await createServiceAppointment(
      fixture,
      `${roleUser.role} arrival`,
      { updated_by: profile.id },
    )
    const arrived = await updateOperationalStateAs(
      client,
      appointment.id,
      'arrived',
      profile.id,
    )

    results.push({
      role: roleUser.role,
      arrived,
    })
  }

  const ownerSession = await signIn('owner.demo@example.test')
  const ownerClient = getAuthedClient(ownerSession.access_token)
  const chainAppointment = await createServiceAppointment(
    fixture,
    'owner ready chain',
  )
  const arrived = await updateOperationalStateAs(
    ownerClient,
    chainAppointment.id,
    'arrived',
    fixture.ownerId,
  )
  const ready = await updateOperationalStateAs(
    ownerClient,
    chainAppointment.id,
    'ready_for_doctor',
    fixture.ownerId,
  )
  const backToArrived = await updateOperationalStateAs(
    ownerClient,
    chainAppointment.id,
    'arrived',
    fixture.ownerId,
  )
  const backToNotArrived = await updateOperationalStateAs(
    ownerClient,
    chainAppointment.id,
    'not_arrived',
    fixture.ownerId,
  )
  const directCorrectionAppointment = await createServiceAppointment(
    fixture,
    'unsupported direct correction',
  )
  await updateOperationalStateAs(
    ownerClient,
    directCorrectionAppointment.id,
    'arrived',
    fixture.ownerId,
  )
  await updateOperationalStateAs(
    ownerClient,
    directCorrectionAppointment.id,
    'ready_for_doctor',
    fixture.ownerId,
  )
  const directReadyToNotArrived = await updateOperationalStateAs(
    ownerClient,
    directCorrectionAppointment.id,
    'not_arrived',
    fixture.ownerId,
  )

  return {
    roleResults: results,
    chain: {
      arrived,
      ready,
      backToArrived,
      backToNotArrived,
      directReadyToNotArrived,
    },
  }
}

async function testDeniedRoleUpdate(fixture) {
  const session = await signIn('inventory.demo@example.test')
  const client = getAuthedClient(session.access_token)
  const profile = await getProfile('inventory_responsible')
  const appointment = await createServiceAppointment(fixture, 'inventory denied')

  return updateOperationalStateAs(client, appointment.id, 'arrived', profile.id)
}

async function testCrossClinicUpdate(fixture) {
  const ownerSession = await signIn('owner.demo@example.test')
  const ownerClient = getAuthedClient(ownerSession.access_token)
  const appointment = await createServiceAppointment(fixture, 'cross clinic', {
    clinic_id: fixture.outClinicId,
    patient_id: fixture.outPatientId,
  })

  return updateOperationalStateAs(ownerClient, appointment.id, 'arrived', fixture.ownerId)
}

async function testInvalidState(fixture) {
  const serviceClient = getServiceClient()
  const appointment = await createServiceAppointment(fixture, 'invalid state')
  const { data, error } = await serviceClient
    .from('appointments')
    .update({
      operational_state: 'waiting_room',
      updated_by: fixture.ownerId,
    })
    .eq('id', appointment.id)
    .select('id, operational_state')
    .single()

  return {
    allowed: !error,
    error: error?.message ?? null,
    data,
  }
}

async function testProgressedStateInsert(fixture) {
  const ownerSession = await signIn('owner.demo@example.test')
  const ownerClient = getAuthedClient(ownerSession.access_token)
  const { data, error } = await ownerClient
    .from('appointments')
    .insert(
      appointmentPayload(fixture, 'progressed insert', {
        operational_state: 'arrived',
      }),
    )
    .select('id, operational_state')
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

async function testSeparationFromLifecycleProviderAndCompletedBy(fixture) {
  const serviceClient = getServiceClient()
  const ownerSession = await signIn('owner.demo@example.test')
  const ownerClient = getAuthedClient(ownerSession.access_token)
  const appointment = await createServiceAppointment(
    fixture,
    'separation',
    {
      assigned_provider_id: fixture.doctorId,
    },
  )
  const update = await updateOperationalStateAs(
    ownerClient,
    appointment.id,
    'arrived',
    fixture.ownerId,
  )
  const correction = await updateOperationalStateAs(
    ownerClient,
    appointment.id,
    'not_arrived',
    fixture.ownerId,
  )
  const refreshedAppointment = await serviceClient
    .from('appointments')
    .select('id, status, operational_state, assigned_provider_id')
    .eq('id', appointment.id)
    .single()

  const linkedAppointment = await createServiceAppointment(
    fixture,
    'completed by separation',
  )
  const visit = await createLinkedVisit(fixture, linkedAppointment.id, 'completed')
  const blockedLinkedUpdate = await updateOperationalStateAs(
    ownerClient,
    linkedAppointment.id,
    'arrived',
    fixture.ownerId,
  )
  const refreshedVisit = await serviceClient
    .from('visits')
    .select('id, completed_by')
    .eq('id', visit.id)
    .single()

  return {
    update,
    correction,
    refreshedAppointmentError: refreshedAppointment.error?.message ?? null,
    lifecycleStatusUnchanged: refreshedAppointment.data?.status === 'scheduled',
    assignedProviderUnchanged:
      refreshedAppointment.data?.assigned_provider_id === fixture.doctorId,
    blockedLinkedUpdate,
    completedByUnchanged: refreshedVisit.data?.completed_by === fixture.ownerId,
    visitReadError: refreshedVisit.error?.message ?? null,
  }
}

async function testCorrectionBlocks(fixture) {
  const serviceClient = getServiceClient()
  const ownerSession = await signIn('owner.demo@example.test')
  const ownerClient = getAuthedClient(ownerSession.access_token)

  async function makeArrivedAppointment(label, overrides = {}) {
    const appointment = await createServiceAppointment(fixture, label, overrides)
    const arrival = await updateOperationalStateAs(
      ownerClient,
      appointment.id,
      'arrived',
      fixture.ownerId,
    )

    if (!arrival.allowed) {
      throw new Error(
        `Could not prepare arrived correction fixture ${label}: ${arrival.error}`,
      )
    }

    return appointment
  }

  const cancelled = await makeArrivedAppointment('cancelled correction block')
  await serviceClient
    .from('appointments')
    .update({ status: 'cancelled', updated_by: fixture.ownerId })
    .eq('id', cancelled.id)

  const noShow = await makeArrivedAppointment('no-show correction block')
  await serviceClient
    .from('appointments')
    .update({ status: 'no_show', updated_by: fixture.ownerId })
    .eq('id', noShow.id)

  const completed = await makeArrivedAppointment('completed correction block')
  await serviceClient
    .from('appointments')
    .update({ status: 'completed', updated_by: fixture.ownerId })
    .eq('id', completed.id)

  const linkedDraft = await makeArrivedAppointment('linked draft correction block')
  await createLinkedVisit(fixture, linkedDraft.id, 'draft')

  const linkedInProgress = await makeArrivedAppointment(
    'linked in-progress correction block',
  )
  await createLinkedVisit(fixture, linkedInProgress.id, 'in_progress')

  const linkedCompleted = await makeArrivedAppointment(
    'linked completed correction block',
  )
  await createLinkedVisit(fixture, linkedCompleted.id, 'completed')

  const results = {
    cancelled: await updateOperationalStateAs(
      ownerClient,
      cancelled.id,
      'not_arrived',
      fixture.ownerId,
    ),
    noShow: await updateOperationalStateAs(
      ownerClient,
      noShow.id,
      'not_arrived',
      fixture.ownerId,
    ),
    completed: await updateOperationalStateAs(
      ownerClient,
      completed.id,
      'not_arrived',
      fixture.ownerId,
    ),
    linkedDraft: await updateOperationalStateAs(
      ownerClient,
      linkedDraft.id,
      'not_arrived',
      fixture.ownerId,
    ),
    linkedInProgress: await updateOperationalStateAs(
      ownerClient,
      linkedInProgress.id,
      'not_arrived',
      fixture.ownerId,
    ),
    linkedCompleted: await updateOperationalStateAs(
      ownerClient,
      linkedCompleted.id,
      'not_arrived',
      fixture.ownerId,
    ),
  }

  const refreshed = await serviceClient
    .from('appointments')
    .select('id, status, operational_state')
    .in('id', [
      cancelled.id,
      noShow.id,
      completed.id,
      linkedDraft.id,
      linkedInProgress.id,
      linkedCompleted.id,
    ])

  return {
    ...results,
    refreshedError: refreshed.error?.message ?? null,
    statesRemainArrived: (refreshed.data ?? []).every(
      (row) => row.operational_state === 'arrived',
    ),
  }
}

async function testTerminalLifecycleBlocks(fixture) {
  const serviceClient = getServiceClient()
  const ownerSession = await signIn('owner.demo@example.test')
  const ownerClient = getAuthedClient(ownerSession.access_token)

  const cancelled = await createServiceAppointment(fixture, 'cancelled block', {
    status: 'cancelled',
  })
  const noShow = await createServiceAppointment(fixture, 'no-show block', {
    status: 'no_show',
  })
  const completed = await createServiceAppointment(fixture, 'completed block', {
    status: 'completed',
  })
  const linkedCompleted = await createServiceAppointment(
    fixture,
    'linked completed block',
  )
  await createLinkedVisit(fixture, linkedCompleted.id, 'completed')

  const results = {
    cancelled: await updateOperationalStateAs(
      ownerClient,
      cancelled.id,
      'arrived',
      fixture.ownerId,
    ),
    noShow: await updateOperationalStateAs(
      ownerClient,
      noShow.id,
      'arrived',
      fixture.ownerId,
    ),
    completed: await updateOperationalStateAs(
      ownerClient,
      completed.id,
      'arrived',
      fixture.ownerId,
    ),
    linkedCompleted: await updateOperationalStateAs(
      ownerClient,
      linkedCompleted.id,
      'arrived',
      fixture.ownerId,
    ),
  }

  const refreshed = await serviceClient
    .from('appointments')
    .select('id, status, operational_state')
    .in('id', [cancelled.id, noShow.id, completed.id, linkedCompleted.id])

  return {
    ...results,
    refreshedError: refreshed.error?.message ?? null,
    statesRemainDefault: (refreshed.data ?? []).every(
      (row) => row.operational_state === 'not_arrived',
    ),
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

  await serviceClient.from('patients').delete().eq('id', fixture.outPatientId)
  await serviceClient.from('clinics').delete().eq('id', fixture.outClinicId)
}

function expectAllowed(failures, label, result, expectedState) {
  if (!result.allowed) {
    failures.push(`${label}: unexpectedly rejected (${result.error})`)
    return
  }

  if (result.data?.operational_state !== expectedState) {
    failures.push(`${label}: operational_state mismatch`)
  }
}

function expectBlocked(failures, label, result) {
  if (result.allowed) {
    failures.push(`${label}: unexpectedly allowed`)
  }
}

async function main() {
  const failures = []
  const fixture = await prepareFixture()

  try {
    const schema = await verifySchemaObjects()
    const defaultState = await testDefaultState(fixture)
    const allowedTransitions = await testAllowedRoleTransitions(fixture)
    const deniedRole = await testDeniedRoleUpdate(fixture)
    const crossClinic = await testCrossClinicUpdate(fixture)
    const invalidState = await testInvalidState(fixture)
    const progressedStateInsert = await testProgressedStateInsert(fixture)
    const separation = await testSeparationFromLifecycleProviderAndCompletedBy(
      fixture,
    )
    const correctionBlocks = await testCorrectionBlocks(fixture)
    const terminalBlocks = await testTerminalLifecycleBlocks(fixture)

    if (!schema.operationalStateColumnReadable) {
      failures.push(
        `schema: operational_state column unreadable (${schema.operationalStateColumnError})`,
      )
    }

    if (!schema.helperAllowsArrival) {
      failures.push(
        `schema: operational transition helper rejected arrival (${schema.helperError})`,
      )
    }

    if (defaultState.operational_state !== 'not_arrived') {
      failures.push('default: new appointment did not default to not_arrived')
    }

    for (const roleResult of allowedTransitions.roleResults) {
      expectAllowed(
        failures,
        `${roleResult.role} not_arrived -> arrived`,
        roleResult.arrived,
        'arrived',
      )
    }

    expectAllowed(
      failures,
      'owner chain not_arrived -> arrived',
      allowedTransitions.chain.arrived,
      'arrived',
    )
    expectAllowed(
      failures,
      'owner chain arrived -> ready_for_doctor',
      allowedTransitions.chain.ready,
      'ready_for_doctor',
    )
    expectAllowed(
      failures,
      'owner correction ready_for_doctor -> arrived',
      allowedTransitions.chain.backToArrived,
      'arrived',
    )
    expectAllowed(
      failures,
      'owner correction arrived -> not_arrived',
      allowedTransitions.chain.backToNotArrived,
      'not_arrived',
    )
    expectBlocked(
      failures,
      'owner unsupported direct correction ready_for_doctor -> not_arrived',
      allowedTransitions.chain.directReadyToNotArrived,
    )

    expectBlocked(failures, 'inventory operational update', deniedRole)
    expectBlocked(failures, 'cross-clinic operational update', crossClinic)
    expectBlocked(failures, 'invalid operational state value', invalidState)
    expectBlocked(
      failures,
      'progressed operational state insert',
      progressedStateInsert,
    )

    expectAllowed(
      failures,
      'separation operational update',
      separation.update,
      'arrived',
    )
    expectAllowed(
      failures,
      'separation operational correction',
      separation.correction,
      'not_arrived',
    )

    if (!separation.lifecycleStatusUnchanged) {
      failures.push('separation: lifecycle status changed unexpectedly')
    }

    if (!separation.assignedProviderUnchanged) {
      failures.push('separation: assigned_provider_id changed unexpectedly')
    }

    expectBlocked(
      failures,
      'linked completed visit operational update',
      separation.blockedLinkedUpdate,
    )

    if (!separation.completedByUnchanged) {
      failures.push('separation: visits.completed_by changed unexpectedly')
    }

    if (separation.refreshedAppointmentError) {
      failures.push(
        `separation: appointment refresh failed (${separation.refreshedAppointmentError})`,
      )
    }

    if (separation.visitReadError) {
      failures.push(`separation: visit refresh failed (${separation.visitReadError})`)
    }

    expectBlocked(failures, 'cancelled appointment operational correction', correctionBlocks.cancelled)
    expectBlocked(failures, 'no-show appointment operational correction', correctionBlocks.noShow)
    expectBlocked(failures, 'completed appointment operational correction', correctionBlocks.completed)
    expectBlocked(
      failures,
      'scheduled appointment with draft visit operational correction',
      correctionBlocks.linkedDraft,
    )
    expectBlocked(
      failures,
      'scheduled appointment with in-progress visit operational correction',
      correctionBlocks.linkedInProgress,
    )
    expectBlocked(
      failures,
      'scheduled appointment with completed visit operational correction',
      correctionBlocks.linkedCompleted,
    )

    if (!correctionBlocks.statesRemainArrived) {
      failures.push('correction blocks: blocked appointment states changed unexpectedly')
    }

    if (correctionBlocks.refreshedError) {
      failures.push(
        `correction blocks: refresh failed (${correctionBlocks.refreshedError})`,
      )
    }

    expectBlocked(failures, 'cancelled appointment operational update', terminalBlocks.cancelled)
    expectBlocked(failures, 'no-show appointment operational update', terminalBlocks.noShow)
    expectBlocked(failures, 'completed appointment operational update', terminalBlocks.completed)
    expectBlocked(
      failures,
      'scheduled appointment with completed visit operational update',
      terminalBlocks.linkedCompleted,
    )

    if (!terminalBlocks.statesRemainDefault) {
      failures.push('terminal blocks: blocked appointment states changed unexpectedly')
    }

    if (terminalBlocks.refreshedError) {
      failures.push(`terminal blocks: refresh failed (${terminalBlocks.refreshedError})`)
    }

    console.log(
      JSON.stringify(
        {
          schema,
          defaultState,
          allowedTransitions,
          deniedRole,
          crossClinic,
          invalidState,
          progressedStateInsert,
          separation,
          correctionBlocks,
          terminalBlocks,
        },
        null,
        2,
      ),
    )
  } finally {
    await cleanupFixture(fixture)
  }

  if (failures.length > 0) {
    console.error('Appointment operational state RLS smoke test failures:')
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
