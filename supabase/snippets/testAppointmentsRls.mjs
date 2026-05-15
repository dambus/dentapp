#!/usr/bin/env node

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
    canReadAppointment: true,
    canWriteAppointment: true,
  },
  {
    role: 'doctor',
    email: 'doctor.demo@example.test',
    canReadAppointment: true,
    canWriteAppointment: true,
  },
  {
    role: 'specialist',
    email: 'specialist.demo@example.test',
    canReadAppointment: true,
    canWriteAppointment: true,
  },
  {
    role: 'assistant',
    email: 'assistant.demo@example.test',
    canReadAppointment: true,
    canWriteAppointment: true,
  },
  {
    role: 'reception_admin',
    email: 'reception.demo@example.test',
    canReadAppointment: true,
    canWriteAppointment: true,
  },
  {
    role: 'inventory_responsible',
    email: 'inventory.demo@example.test',
    canReadAppointment: false,
    canWriteAppointment: false,
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
    .select('id')
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

async function createServiceAppointment(label) {
  const serviceClient = getServiceClient()
  const { id: profileId } = await getProfile('owner_admin')
  const scheduledStart = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  const scheduledEnd = new Date(Date.now() + 90 * 60 * 1000).toISOString()
  const { data, error } = await serviceClient
    .from('appointments')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      status: 'scheduled',
      reason: `Service-created appointment fixture for ${label}.`,
      notes: 'Appointment RLS smoke test fixture.',
      created_by: profileId,
      updated_by: profileId,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create service appointment fixture.')
  }

  return data.id
}

async function verifySchemaObjects() {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient.rpc('exec_sql', {
    query: `
      select
        to_regclass('public.appointments') is not null as appointments_exists,
        exists (
          select 1
          from pg_constraint
          where conname = 'appointments_status_check'
        ) as status_check_exists,
        exists (
          select 1
          from pg_trigger
          where tgname = 'update_appointments_updated_at'
            and not tgisinternal
        ) as updated_at_trigger_exists,
        exists (
          select 1
          from pg_policies
          where schemaname = 'public'
            and tablename = 'appointments'
            and policyname = 'Scheduling roles can create clinic appointments'
        ) as insert_policy_exists
    `,
  })

  if (error) {
    return {
      ok: false,
      error: error.message,
      details: null,
    }
  }

  const details = data?.[0] ?? null
  const ok = Boolean(
    details?.appointments_exists &&
      details?.status_check_exists &&
      details?.updated_at_trigger_exists &&
      details?.insert_policy_exists,
  )

  return {
    ok,
    error: ok ? null : 'One or more expected appointments schema objects are missing.',
    details,
  }
}

async function verifySchemaObjectsWithoutRpc() {
  const serviceClient = getServiceClient()
  const appointments = await serviceClient
    .from('appointments')
    .select('id')
    .limit(1)

  return {
    ok: !appointments.error,
    error: appointments.error?.message ?? null,
    details: {
      appointments_exists: !appointments.error,
    },
  }
}

async function testUnauthenticatedAccess() {
  const client = getAnonClient()
  const serviceAppointmentId = await createServiceAppointment('unauthenticated')

  const read = await client
    .from('appointments')
    .select('id')
    .eq('id', serviceAppointmentId)
    .maybeSingle()

  const insert = await client
    .from('appointments')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      scheduled_start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      reason: 'Unauthenticated appointment insert should fail.',
    })
    .select('id')
    .single()

  return {
    readAllowed: !read.error && Boolean(read.data),
    readError: read.error?.message ?? null,
    insertAllowed: !insert.error,
    insertError: insert.error?.message ?? null,
  }
}

async function testAllowedRole(roleUser) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)
  const { id: profileId } = await getProfile(roleUser.role)
  const serviceAppointmentId = await createServiceAppointment(roleUser.role)
  const scheduledStart = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
  const scheduledEnd = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()

  const read = await client
    .from('appointments')
    .select('id, patient_id')
    .eq('id', serviceAppointmentId)
    .maybeSingle()

  const insert = await client
    .from('appointments')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      status: 'scheduled',
      reason: `Appointment RLS smoke test by ${roleUser.role}.`,
      notes: 'Inserted by role test.',
      created_by: profileId,
      updated_by: profileId,
    })
    .select('id, patient_id, status, updated_at')
    .single()

  const appointmentId = insert.data?.id ?? serviceAppointmentId

  const update = await client
    .from('appointments')
    .update({
      status: 'completed',
      notes: `Updated by ${roleUser.role}.`,
      updated_by: profileId,
    })
    .eq('id', appointmentId)
    .select('id, status, updated_at')
    .single()

  const invalidStatus = await client
    .from('appointments')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      scheduled_start: scheduledStart,
      status: 'invalid_status',
      created_by: profileId,
      updated_by: profileId,
    })

  const invalidEnd = await client
    .from('appointments')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      scheduled_start: scheduledEnd,
      scheduled_end: scheduledStart,
      created_by: profileId,
      updated_by: profileId,
    })

  const invalidPatient = await client
    .from('appointments')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: '00000000-0000-0000-0000-000000000000',
      scheduled_start: scheduledStart,
      created_by: profileId,
      updated_by: profileId,
    })

  const hardDelete = await client.from('appointments').delete().eq('id', appointmentId)
  const preserved = await getServiceClient()
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .maybeSingle()

  return {
    role: roleUser.role,
    readAllowed: !read.error && Boolean(read.data),
    readError: read.error?.message ?? null,
    patientContextCorrect: read.data?.patient_id === DEMO_PATIENT_ID,
    insertAllowed: !insert.error,
    insertError: insert.error?.message ?? null,
    insertPatientContextCorrect: insert.data?.patient_id === DEMO_PATIENT_ID,
    updateAllowed: !update.error,
    updateError: update.error?.message ?? null,
    updatedAtChanged:
      Boolean(insert.data?.updated_at) &&
      Boolean(update.data?.updated_at) &&
      insert.data.updated_at !== update.data.updated_at,
    invalidStatusRejected: Boolean(invalidStatus.error),
    invalidStatusError: invalidStatus.error?.message ?? null,
    invalidEndRejected: Boolean(invalidEnd.error),
    invalidEndError: invalidEnd.error?.message ?? null,
    invalidPatientRejected: Boolean(invalidPatient.error),
    invalidPatientError: invalidPatient.error?.message ?? null,
    hardDeleteAllowed: !hardDelete.error && !preserved.data,
    hardDeleteError: hardDelete.error?.message ?? null,
  }
}

async function testDeniedRole(roleUser) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)
  const serviceAppointmentId = await createServiceAppointment(roleUser.role)

  const read = await client
    .from('appointments')
    .select('id, patient_id')
    .eq('id', serviceAppointmentId)
    .maybeSingle()

  const insert = await client
    .from('appointments')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      scheduled_start: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      reason: `Denied appointment by ${roleUser.role}.`,
    })
    .select('id')
    .single()

  const update = await client
    .from('appointments')
    .update({
      status: 'cancelled',
    })
    .eq('id', serviceAppointmentId)
    .select('id')
    .single()

  return {
    role: roleUser.role,
    readAllowed: !read.error && Boolean(read.data),
    readError: read.error?.message ?? null,
    insertAllowed: !insert.error,
    insertError: insert.error?.message ?? null,
    updateAllowed: !update.error,
    updateError: update.error?.message ?? null,
  }
}

async function main() {
  const failures = []
  const results = []
  const schemaRpcResult = await verifySchemaObjects()
  const schemaResult = schemaRpcResult.ok
    ? schemaRpcResult
    : await verifySchemaObjectsWithoutRpc()
  const unauthenticated = await testUnauthenticatedAccess()

  if (!schemaResult.ok) {
    failures.push(`schema: ${schemaRpcResult.error ?? schemaResult.error}`)
  }

  if (unauthenticated.readAllowed) {
    failures.push('unauthenticated: appointment read unexpectedly allowed')
  }

  if (unauthenticated.insertAllowed) {
    failures.push('unauthenticated: appointment insert unexpectedly allowed')
  }

  for (const roleUser of ROLE_USERS) {
    const result = roleUser.canWriteAppointment
      ? await testAllowedRole(roleUser)
      : await testDeniedRole(roleUser)
    results.push(result)

    if (roleUser.canReadAppointment && !result.readAllowed) {
      failures.push(`${roleUser.role}: appointment read was denied`)
    }

    if (!roleUser.canReadAppointment && result.readAllowed) {
      failures.push(`${roleUser.role}: appointment read unexpectedly allowed`)
    }

    if (roleUser.canWriteAppointment) {
      if (!result.patientContextCorrect) {
        failures.push(`${roleUser.role}: appointment read patient context mismatch`)
      }
      if (!result.insertAllowed) {
        failures.push(`${roleUser.role}: appointment create was denied`)
      }
      if (!result.insertPatientContextCorrect) {
        failures.push(`${roleUser.role}: appointment insert patient context mismatch`)
      }
      if (!result.updateAllowed) {
        failures.push(`${roleUser.role}: appointment update was denied`)
      }
      if (!result.updatedAtChanged) {
        failures.push(`${roleUser.role}: updated_at did not change on update`)
      }
      if (!result.invalidStatusRejected) {
        failures.push(`${roleUser.role}: invalid appointment status was not rejected`)
      }
      if (!result.invalidEndRejected) {
        failures.push(`${roleUser.role}: invalid appointment end time was not rejected`)
      }
      if (!result.invalidPatientRejected) {
        failures.push(`${roleUser.role}: invalid patient context was not rejected`)
      }
      if (result.hardDeleteAllowed) {
        failures.push(`${roleUser.role}: hard delete unexpectedly allowed`)
      }
    } else {
      if (result.insertAllowed) {
        failures.push(`${roleUser.role}: appointment create unexpectedly allowed`)
      }
      if (result.updateAllowed) {
        failures.push(`${roleUser.role}: appointment update unexpectedly allowed`)
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        schema: {
          rpcAvailable: schemaRpcResult.ok,
          ...schemaResult,
        },
        unauthenticated,
        results,
      },
      null,
      2,
    ),
  )

  if (failures.length > 0) {
    console.error('Appointment RLS smoke test failures:')
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
