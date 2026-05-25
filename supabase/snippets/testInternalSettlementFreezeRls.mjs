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

const ROLE_USERS = [
  { role: 'owner_admin', email: 'owner.demo@example.test' },
  { role: 'doctor', email: 'doctor.demo@example.test' },
  { role: 'specialist', email: 'specialist.demo@example.test' },
  { role: 'assistant', email: 'assistant.demo@example.test' },
  { role: 'reception_admin', email: 'reception.demo@example.test' },
  { role: 'inventory_responsible', email: 'inventory.demo@example.test' },
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
    reason: `Task 92 freeze fixture ${runId.slice(0, 8)}`,
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
    recommendation: 'Task 92 freeze completed visit fixture.',
    next_step: 'no_follow_up',
    created_by: doctor.id,
    updated_by: doctor.id,
  })

  const performedService = await insertRow('performed_services', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: visit.id,
    appointment_id: appointment.id,
    service_name_snapshot: 'Task 92 frozen service fixture',
    service_code_snapshot: 'TASK92-FROZEN',
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
    description_snapshot: 'Task 92 frozen ledger fixture',
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
    reference_number: `TASK92-${runId.slice(0, 8)}`,
    notes: 'Task 92 frozen payment fixture.',
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

async function cleanupFixture(fixture) {
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

function assertBlockedResult(result, label) {
  if (!result.error && result.count !== 0 && result.data !== null) {
    throw new Error(`${label} unexpectedly returned data.`)
  }
}

async function assertReadBlocked(client, table, id, role) {
  const result = await client
    .from(table)
    .select('id', { count: 'exact' })
    .eq('id', id)

  assertBlockedResult(result, `${role} ${table} read`)
}

async function assertMutationBlocked(client, table, id, role) {
  const updateResult = await client
    .from(table)
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')

  if (!updateResult.error && (updateResult.data?.length ?? 0) > 0) {
    throw new Error(`${role} unexpectedly updated ${table}.`)
  }

  const deleteResult = await client.from(table).delete().eq('id', id).select('id')

  if (!deleteResult.error && (deleteResult.data?.length ?? 0) > 0) {
    throw new Error(`${role} unexpectedly deleted ${table}.`)
  }
}

async function assertInsertBlocked(client, table, values, role) {
  const { data, error } = await client.from(table).insert(values).select('id')

  if (!error && (data?.length ?? 0) > 0) {
    throw new Error(`${role} unexpectedly inserted into ${table}.`)
  }
}

async function assertRpcBlocked(client, functionName, args, role) {
  const { data, error } = await client.rpc(functionName, args)

  if (!error && data) {
    throw new Error(`${role} unexpectedly executed ${functionName}.`)
  }
}

async function main() {
  let fixture

  try {
    fixture = await prepareFixture()

    for (const roleUser of ROLE_USERS) {
      const session = await signIn(roleUser.email)
      const client = getAuthedClient(session.access_token)

      await assertReadBlocked(
        client,
        'patient_ledger_entries',
        fixture.ledgerEntryId,
        roleUser.role,
      )
      await assertReadBlocked(
        client,
        'patient_payments',
        fixture.paymentId,
        roleUser.role,
      )
      await assertReadBlocked(
        client,
        'performed_services',
        fixture.performedServiceId,
        roleUser.role,
      )

      await assertMutationBlocked(
        client,
        'patient_ledger_entries',
        fixture.ledgerEntryId,
        roleUser.role,
      )
      await assertMutationBlocked(
        client,
        'patient_payments',
        fixture.paymentId,
        roleUser.role,
      )
      await assertMutationBlocked(
        client,
        'performed_services',
        fixture.performedServiceId,
        roleUser.role,
      )

      await assertInsertBlocked(
        client,
        'patient_payments',
        {
          clinic_id: DEMO_CLINIC_ID,
          patient_id: DEMO_PATIENT_ID,
          amount: 100,
          currency: 'RSD',
          payment_method: 'cash',
          status: 'posted',
          received_at: new Date().toISOString(),
          recorded_by: fixture.owner.id,
          created_by: fixture.owner.id,
        },
        roleUser.role,
      )
      await assertInsertBlocked(
        client,
        'performed_services',
        {
          clinic_id: DEMO_CLINIC_ID,
          patient_id: DEMO_PATIENT_ID,
          visit_id: fixture.visitId,
          service_name_snapshot: 'Blocked Task 92 insert',
          quantity: 1,
          unit_price_amount: 100,
          discount_amount: 0,
          final_amount: 100,
          currency: 'RSD',
          credited_provider_id: fixture.doctor.id,
          status: 'draft',
          created_by: fixture.doctor.id,
          updated_by: fixture.doctor.id,
        },
        roleUser.role,
      )
      await assertInsertBlocked(
        client,
        'patient_ledger_entries',
        {
          clinic_id: DEMO_CLINIC_ID,
          patient_id: DEMO_PATIENT_ID,
          entry_type: 'payment',
          direction: 'credit',
          amount: 100,
          currency: 'RSD',
          description_snapshot: 'Blocked Task 92 insert',
          patient_payment_id: fixture.paymentId,
          status: 'posted',
          source_type: 'patient_payment',
          source_id: fixture.paymentId,
          posted_at: new Date().toISOString(),
          recorded_by: fixture.owner.id,
          created_by: fixture.owner.id,
        },
        roleUser.role,
      )

      await assertRpcBlocked(
        client,
        'get_patient_ledger_charge_posting_state_for_visit',
        { target_visit_id: fixture.visitId },
        roleUser.role,
      )
      await assertRpcBlocked(
        client,
        'post_finalized_performed_services_to_patient_ledger',
        { target_visit_id: fixture.visitId },
        roleUser.role,
      )
      await assertRpcBlocked(
        client,
        'record_patient_payment',
        {
          target_patient_id: DEMO_PATIENT_ID,
          payment_amount: 100,
          payment_currency: 'RSD',
          payment_method: 'cash',
          payment_received_at: null,
          payment_reference_number: null,
          payment_notes: null,
          payment_idempotency_key: `task92-${roleUser.role}-${randomUUID()}`,
        },
        roleUser.role,
      )
      await assertRpcBlocked(
        client,
        'reverse_patient_payment',
        {
          target_payment_id: fixture.paymentId,
          reversal_reason: 'Task 92 freeze check',
        },
        roleUser.role,
      )
    }

    console.log(
      JSON.stringify(
        {
          checkedRoles: ROLE_USERS.map((roleUser) => roleUser.role),
          patientLedgerEntriesFrozen: true,
          patientPaymentsFrozen: true,
          performedServicesFrozen: true,
          chargePostingRpcsFrozen: true,
          paymentRecordingRpcsFrozen: true,
        },
        null,
        2,
      ),
    )
  } finally {
    await cleanupFixture(fixture)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
