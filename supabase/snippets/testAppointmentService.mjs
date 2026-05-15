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

const DEMO_PATIENT_ID = '22222222-2222-2222-2222-222222222201'
const DOCTOR_EMAIL = 'doctor.demo@example.test'

function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

async function signIn(email) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: DEMO_PASSWORD,
  })

  if (error || !data.session) {
    throw new Error(error?.message ?? `No session returned for ${email}.`)
  }

  return data.session
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

async function getDoctorProfile() {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('profiles')
    .select('id, clinic_id')
    .eq('role', 'doctor')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    throw new Error(error?.message ?? 'Missing active doctor profile.')
  }

  return data
}

async function main() {
  const failures = []
  const session = await signIn(DOCTOR_EMAIL)
  const client = getAuthedClient(session.access_token)
  const profile = await getDoctorProfile()
  const marker = `appointment service smoke ${Date.now()}`
  const scheduledStart = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  const scheduledEnd = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()

  const createResult = await client
    .from('appointments')
    .insert({
      clinic_id: profile.clinic_id,
      patient_id: DEMO_PATIENT_ID,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      status: 'scheduled',
      reason: marker,
      notes: 'Created by appointment service smoke.',
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select(
      'id, clinic_id, patient_id, scheduled_start, scheduled_end, status, reason, notes, created_by, updated_by, created_at, updated_at',
    )
    .single()

  if (createResult.error || !createResult.data) {
    failures.push(
      `create appointment failed: ${createResult.error?.message ?? 'no data'}`,
    )
  }

  const appointmentId = createResult.data?.id

  const allAppointments = await client
    .from('appointments')
    .select(
      'id, patient_id, scheduled_start, scheduled_end, status, reason, notes',
    )
    .eq('patient_id', DEMO_PATIENT_ID)
    .order('scheduled_start', { ascending: false })

  if (allAppointments.error) {
    failures.push(`fetch appointments failed: ${allAppointments.error.message}`)
  }

  if (
    appointmentId &&
    !allAppointments.data?.some((appointment) => appointment.id === appointmentId)
  ) {
    failures.push('created appointment was not returned by patient fetch')
  }

  const upcomingAppointments = await client
    .from('appointments')
    .select('id, patient_id, scheduled_start, status, reason')
    .eq('patient_id', DEMO_PATIENT_ID)
    .eq('status', 'scheduled')
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true })

  if (upcomingAppointments.error) {
    failures.push(
      `fetch upcoming appointments failed: ${upcomingAppointments.error.message}`,
    )
  }

  if (
    appointmentId &&
    !upcomingAppointments.data?.some(
      (appointment) => appointment.id === appointmentId,
    )
  ) {
    failures.push('created appointment was not returned by upcoming fetch')
  }

  const updateResult = appointmentId
    ? await client
        .from('appointments')
        .update({
          status: 'completed',
          updated_by: profile.id,
        })
        .eq('id', appointmentId)
        .select('id, status, updated_at')
        .single()
    : { data: null, error: { message: 'No appointment id returned.' } }

  if (updateResult.error || updateResult.data?.status !== 'completed') {
    failures.push(
      `update appointment status failed: ${
        updateResult.error?.message ?? 'status was not completed'
      }`,
    )
  }

  console.log(
    JSON.stringify(
      {
        createdAppointmentId: appointmentId ?? null,
        createdAppointmentReturnedByPatientFetch: appointmentId
          ? allAppointments.data?.some(
              (appointment) => appointment.id === appointmentId,
            ) ?? false
          : false,
        createdAppointmentReturnedByUpcomingFetch: appointmentId
          ? upcomingAppointments.data?.some(
              (appointment) => appointment.id === appointmentId,
            ) ?? false
          : false,
        updatedStatus: updateResult.data?.status ?? null,
      },
      null,
      2,
    ),
  )

  if (failures.length > 0) {
    console.error('Appointment service smoke test failures:')
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
