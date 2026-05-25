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

function assert(condition, message, failures) {
  if (!condition) failures.push(message)
}

async function recordPayment(client, input) {
  const { data, error } = await client.rpc('record_patient_payment', {
    target_patient_id: input.patientId ?? DEMO_PATIENT_ID,
    payment_amount: input.amount ?? 4200,
    payment_currency: input.currency ?? 'RSD',
    payment_method: input.method ?? 'cash',
    payment_received_at: input.receivedAt ?? new Date().toISOString(),
    payment_reference_number: input.referenceNumber ?? null,
    payment_notes: input.notes ?? null,
    payment_idempotency_key: input.idempotencyKey ?? null,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function reversePayment(client, paymentId, reason = 'Entered in error.') {
  const { data, error } = await client.rpc('reverse_patient_payment', {
    target_payment_id: paymentId,
    reversal_reason: reason,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function getPayment(paymentId) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('patient_payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

async function getLedgerEntry(entryId) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('patient_ledger_entries')
    .select('*')
    .eq('id', entryId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

async function getLedgerEntriesForPayment(paymentId) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('patient_ledger_entries')
    .select('*')
    .or(`patient_payment_id.eq.${paymentId},source_id.eq.${paymentId}`)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

async function countPaymentRows(paymentId) {
  const serviceClient = getServiceClient()
  const { count, error } = await serviceClient
    .from('patient_payments')
    .select('id', { count: 'exact', head: true })
    .eq('id', paymentId)

  if (error) throw new Error(error.message)
  return count ?? 0
}

async function prepareFixture() {
  const runId = randomUUID()
  const outClinicId = randomUUID()
  const owner = await getProfile('owner_admin')
  const reception = await getProfile('reception_admin')

  await insertRow('clinics', {
    id: outClinicId,
    name: `Payment Recording Out Clinic ${runId.slice(0, 8)}`,
    status: 'active',
  })

  const outPatient = await insertRow('patients', {
    clinic_id: outClinicId,
    first_name: 'Out',
    last_name: `Payment Recording ${runId.slice(0, 8)}`,
    phone: '+381600000188',
    email: `out.payment.recording.${runId}@example.test`,
    status: 'active',
  })

  return {
    runId,
    ownerId: owner.id,
    receptionId: reception.id,
    outClinicId,
    outPatientId: outPatient.id,
    patientIds: [outPatient.id],
    paymentIds: [],
    ledgerEntryIds: [],
  }
}

async function testHappyPath(fixture, failures) {
  const ownerClient = await signIn('owner_admin')
  const result = await recordPayment(ownerClient, {
    amount: 4200,
    currency: 'RSD',
    method: 'cash',
    referenceNumber: `PAY-OWN-${fixture.runId.slice(0, 8)}`,
    notes: 'Payment recording happy path.',
    idempotencyKey: `owner-${fixture.runId}`,
  })
  fixture.paymentIds.push(result.paymentId)
  fixture.ledgerEntryIds.push(result.ledgerEntryId)

  const payment = await getPayment(result.paymentId)
  const ledger = await getLedgerEntry(result.ledgerEntryId)

  assert(result.status === 'recorded', 'owner: result was not recorded', failures)
  assert(payment.clinic_id === DEMO_CLINIC_ID, 'owner: clinic mismatch', failures)
  assert(payment.patient_id === DEMO_PATIENT_ID, 'owner: patient mismatch', failures)
  assert(Number(payment.amount) === 4200, 'owner: amount mismatch', failures)
  assert(payment.currency === 'RSD', 'owner: currency mismatch', failures)
  assert(payment.payment_method === 'cash', 'owner: method mismatch', failures)
  assert(payment.status === 'posted', 'owner: payment not posted', failures)
  assert(payment.recorded_by === fixture.ownerId, 'owner: recorded_by mismatch', failures)
  assert(payment.ledger_entry_id === ledger.id, 'owner: payment ledger backlink mismatch', failures)
  assert(ledger.entry_type === 'payment', 'owner: ledger type mismatch', failures)
  assert(ledger.direction === 'credit', 'owner: ledger direction mismatch', failures)
  assert(ledger.status === 'posted', 'owner: ledger status mismatch', failures)
  assert(ledger.patient_payment_id === payment.id, 'owner: ledger payment link mismatch', failures)
  assert(Number(ledger.amount) === Number(payment.amount), 'owner: ledger amount mismatch', failures)
  assert(ledger.currency === payment.currency, 'owner: ledger currency mismatch', failures)
  assert(Boolean(ledger.description_snapshot), 'owner: ledger description empty', failures)
  assert(ledger.visit_id === null, 'owner: payment should not allocate visit', failures)
  assert(ledger.performed_service_id === null, 'owner: payment should not link service', failures)

  return { result, payment, ledger }
}

async function testReceptionRecording(fixture, failures) {
  const receptionClient = await signIn('reception_admin')
  const result = await recordPayment(receptionClient, {
    amount: 1800,
    currency: 'RSD',
    method: 'card',
    referenceNumber: `PAY-REC-${fixture.runId.slice(0, 8)}`,
    idempotencyKey: `reception-${fixture.runId}`,
  })
  fixture.paymentIds.push(result.paymentId)
  fixture.ledgerEntryIds.push(result.ledgerEntryId)

  const payment = await getPayment(result.paymentId)
  const ledger = await getLedgerEntry(result.ledgerEntryId)

  assert(result.status === 'recorded', 'reception: result was not recorded', failures)
  assert(payment.recorded_by === fixture.receptionId, 'reception: recorded_by mismatch', failures)
  assert(payment.payment_method === 'card', 'reception: method mismatch', failures)
  assert(ledger.patient_payment_id === payment.id, 'reception: ledger link mismatch', failures)
  assert(ledger.direction === 'credit', 'reception: ledger direction mismatch', failures)

  return { result, payment, ledger }
}

async function testIdempotency(fixture, failures) {
  const ownerClient = await signIn('owner_admin')
  const idempotencyKey = `idempotent-${fixture.runId}`
  const receivedAt = new Date().toISOString()
  const first = await recordPayment(ownerClient, {
    amount: 2500,
    currency: 'RSD',
    method: 'bank_transfer',
    referenceNumber: `PAY-IDEMP-${fixture.runId.slice(0, 8)}`,
    notes: 'Idempotent payment request.',
    receivedAt,
    idempotencyKey,
  })
  const second = await recordPayment(ownerClient, {
    amount: 2500,
    currency: 'RSD',
    method: 'bank_transfer',
    referenceNumber: `PAY-IDEMP-${fixture.runId.slice(0, 8)}`,
    notes: 'Idempotent payment request.',
    receivedAt,
    idempotencyKey,
  })
  const conflict = await recordPayment(ownerClient, {
    amount: 2600,
    currency: 'RSD',
    method: 'bank_transfer',
    referenceNumber: `PAY-IDEMP-${fixture.runId.slice(0, 8)}`,
    notes: 'Idempotent payment request.',
    idempotencyKey,
  })
  fixture.paymentIds.push(first.paymentId)
  fixture.ledgerEntryIds.push(first.ledgerEntryId)

  const entries = await getLedgerEntriesForPayment(first.paymentId)
  const rowCount = await countPaymentRows(first.paymentId)

  assert(first.status === 'recorded', 'idempotency: first result not recorded', failures)
  assert(second.status === 'already_recorded', 'idempotency: retry not already_recorded', failures)
  assert(second.paymentId === first.paymentId, 'idempotency: payment id changed', failures)
  assert(second.ledgerEntryId === first.ledgerEntryId, 'idempotency: ledger id changed', failures)
  assert(conflict.status === 'invalid', 'idempotency: changed replay not invalid', failures)
  assert(entries.filter((entry) => entry.entry_type === 'payment').length === 1, 'idempotency: duplicate payment credits', failures)
  assert(rowCount === 1, 'idempotency: payment row count mismatch', failures)

  return { first, second, conflict, ledgerEntryCount: entries.length }
}

async function testValidationAndAuthorization(fixture, failures) {
  const ownerClient = await signIn('owner_admin')
  const blockedRoles = ['doctor', 'specialist', 'assistant', 'inventory_responsible']
  const blockedResults = []

  const zeroAmount = await recordPayment(ownerClient, { amount: 0 })
  const negativeAmount = await recordPayment(ownerClient, { amount: -25 })
  const invalidMethod = await recordPayment(ownerClient, { method: 'crypto' })
  const invalidCurrency = await recordPayment(ownerClient, { currency: 'rsd' })
  const crossClinic = await recordPayment(ownerClient, {
    patientId: fixture.outPatientId,
    amount: 1200,
    idempotencyKey: `cross-${fixture.runId}`,
  })

  for (const role of blockedRoles) {
    const client = await signIn(role)
    const result = await recordPayment(client, {
      amount: 1300,
      idempotencyKey: `${role}-${fixture.runId}`,
    })
    blockedResults.push({ role, result })
    assert(result.status === 'blocked', `${role}: recording was not blocked`, failures)
  }

  assert(zeroAmount.status === 'invalid', 'validation: zero amount not invalid', failures)
  assert(negativeAmount.status === 'invalid', 'validation: negative amount not invalid', failures)
  assert(invalidMethod.status === 'invalid', 'validation: invalid method not invalid', failures)
  assert(invalidCurrency.status === 'invalid', 'validation: invalid currency not invalid', failures)
  assert(crossClinic.status === 'blocked', 'authorization: cross-clinic patient not blocked', failures)

  return {
    zeroAmount,
    negativeAmount,
    invalidMethod,
    invalidCurrency,
    crossClinic,
    blockedResults,
  }
}

async function testReversal(fixture, failures) {
  const ownerClient = await signIn('owner_admin')
  const receptionClient = await signIn('reception_admin')
  const doctorClient = await signIn('doctor')
  const recorded = await recordPayment(ownerClient, {
    amount: 3100,
    currency: 'RSD',
    method: 'other',
    referenceNumber: `PAY-REV-${fixture.runId.slice(0, 8)}`,
    idempotencyKey: `reverse-${fixture.runId}`,
  })
  fixture.paymentIds.push(recorded.paymentId)
  fixture.ledgerEntryIds.push(recorded.ledgerEntryId)

  const blankReason = await reversePayment(ownerClient, recorded.paymentId, ' ')
  const blockedDoctor = await reversePayment(doctorClient, recorded.paymentId)
  const reversed = await reversePayment(receptionClient, recorded.paymentId)
  fixture.ledgerEntryIds.push(reversed.reversalLedgerEntryId)
  const repeated = await reversePayment(receptionClient, recorded.paymentId)
  const payment = await getPayment(recorded.paymentId)
  const originalLedger = await getLedgerEntry(recorded.ledgerEntryId)
  const reversalLedger = await getLedgerEntry(reversed.reversalLedgerEntryId)
  const entries = await getLedgerEntriesForPayment(recorded.paymentId)

  assert(blankReason.status === 'invalid', 'reversal: blank reason not invalid', failures)
  assert(blockedDoctor.status === 'blocked', 'reversal: doctor was not blocked', failures)
  assert(reversed.status === 'reversed', 'reversal: result not reversed', failures)
  assert(repeated.status === 'already_reversed', 'reversal: repeat not already_reversed', failures)
  assert(payment.status === 'reversed', 'reversal: payment status not reversed', failures)
  assert(payment.ledger_entry_id === originalLedger.id, 'reversal: original ledger link changed', failures)
  assert(payment.reversal_ledger_entry_id === reversalLedger.id, 'reversal: reversal ledger backlink mismatch', failures)
  assert(originalLedger.entry_type === 'payment', 'reversal: original ledger type mutated', failures)
  assert(originalLedger.direction === 'credit', 'reversal: original ledger direction mutated', failures)
  assert(reversalLedger.entry_type === 'reversal', 'reversal: reversal ledger type mismatch', failures)
  assert(reversalLedger.direction === 'debit', 'reversal: reversal ledger direction mismatch', failures)
  assert(reversalLedger.reverses_entry_id === originalLedger.id, 'reversal: reversal reference mismatch', failures)
  assert(Number(reversalLedger.amount) === Number(payment.amount), 'reversal: amount mismatch', failures)
  assert(reversalLedger.currency === payment.currency, 'reversal: currency mismatch', failures)
  assert(entries.filter((entry) => entry.entry_type === 'reversal').length === 1, 'reversal: duplicate reversal entries', failures)

  return {
    recorded,
    blankReason,
    blockedDoctor,
    reversed,
    repeated,
    ledgerEntryCount: entries.length,
  }
}

async function testDirectMutationSafety(fixture, failures) {
  const ownerClient = await signIn('owner_admin')
  const owner = await getProfile('owner_admin')

  const directPaymentInsert = await ownerClient
    .from('patient_payments')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      amount: 900,
      currency: 'RSD',
      payment_method: 'cash',
      status: 'posted',
      recorded_by: owner.id,
      created_by: owner.id,
    })
    .select('id')
    .single()
  const recorded = await recordPayment(ownerClient, {
    amount: 900,
    idempotencyKey: `mutation-${fixture.runId}`,
  })
  fixture.paymentIds.push(recorded.paymentId)
  fixture.ledgerEntryIds.push(recorded.ledgerEntryId)

  const directPaymentUpdate = await ownerClient
    .from('patient_payments')
    .update({ amount: 999 })
    .eq('id', recorded.paymentId)
    .select('id')
  const directPaymentDelete = await ownerClient
    .from('patient_payments')
    .delete()
    .eq('id', recorded.paymentId)
    .select('id')
  const directLedgerInsert = await ownerClient
    .from('patient_ledger_entries')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      entry_type: 'payment',
      direction: 'credit',
      amount: 900,
      currency: 'RSD',
      description_snapshot: 'Blocked direct payment credit',
      patient_payment_id: recorded.paymentId,
      status: 'posted',
      recorded_by: owner.id,
      created_by: owner.id,
    })
    .select('id')
    .single()
  const directLedgerUpdate = await ownerClient
    .from('patient_ledger_entries')
    .update({ description_snapshot: 'Blocked update' })
    .eq('id', recorded.ledgerEntryId)
    .select('id')
  const directLedgerDelete = await ownerClient
    .from('patient_ledger_entries')
    .delete()
    .eq('id', recorded.ledgerEntryId)
    .select('id')

  assert(Boolean(directPaymentInsert.error), 'mutation: direct payment insert allowed', failures)
  assert(Boolean(directLedgerInsert.error), 'mutation: direct ledger insert allowed', failures)
  assert(
    Boolean(directPaymentUpdate.error) || (directPaymentUpdate.data ?? []).length === 0,
    'mutation: direct payment update allowed',
    failures,
  )
  assert(
    Boolean(directPaymentDelete.error) || (directPaymentDelete.data ?? []).length === 0,
    'mutation: direct payment delete allowed',
    failures,
  )
  assert(
    Boolean(directLedgerUpdate.error) || (directLedgerUpdate.data ?? []).length === 0,
    'mutation: direct ledger update allowed',
    failures,
  )
  assert(
    Boolean(directLedgerDelete.error) || (directLedgerDelete.data ?? []).length === 0,
    'mutation: direct ledger delete allowed',
    failures,
  )

  return {
    directPaymentInsertBlocked: Boolean(directPaymentInsert.error),
    directPaymentUpdateBlocked:
      Boolean(directPaymentUpdate.error) || (directPaymentUpdate.data ?? []).length === 0,
    directPaymentDeleteBlocked:
      Boolean(directPaymentDelete.error) || (directPaymentDelete.data ?? []).length === 0,
    directLedgerInsertBlocked: Boolean(directLedgerInsert.error),
    directLedgerUpdateBlocked:
      Boolean(directLedgerUpdate.error) || (directLedgerUpdate.data ?? []).length === 0,
    directLedgerDeleteBlocked:
      Boolean(directLedgerDelete.error) || (directLedgerDelete.data ?? []).length === 0,
  }
}

async function cleanupFixture(fixture) {
  const serviceClient = getServiceClient()

  if (fixture.paymentIds.length > 0) {
    await serviceClient
      .from('patient_payments')
      .update({ ledger_entry_id: null, reversal_ledger_entry_id: null })
      .in('id', fixture.paymentIds)
  }
  if (fixture.ledgerEntryIds.length > 0) {
    await serviceClient
      .from('patient_ledger_entries')
      .delete()
      .in('id', fixture.ledgerEntryIds)
  }
  if (fixture.paymentIds.length > 0) {
    await serviceClient
      .from('patient_payments')
      .delete()
      .in('id', fixture.paymentIds)
  }
  if (fixture.patientIds.length > 0) {
    await serviceClient.from('patients').delete().in('id', fixture.patientIds)
  }
  await serviceClient.from('clinics').delete().eq('id', fixture.outClinicId)
}

async function main() {
  const failures = []
  const fixture = await prepareFixture()
  const results = { fixture: { runId: fixture.runId } }

  try {
    results.happyPath = await testHappyPath(fixture, failures)
    results.receptionRecording = await testReceptionRecording(fixture, failures)
    results.idempotency = await testIdempotency(fixture, failures)
    results.validationAndAuthorization =
      await testValidationAndAuthorization(fixture, failures)
    results.reversal = await testReversal(fixture, failures)
    results.directMutationSafety =
      await testDirectMutationSafety(fixture, failures)
  } finally {
    await cleanupFixture(fixture)
  }

  console.log(JSON.stringify(results, null, 2))

  if (failures.length > 0) {
    console.error('Patient payment recording RLS smoke failed:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }

  console.log('Patient payment recording RLS smoke passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
