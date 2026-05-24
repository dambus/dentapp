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
    canReadPayments: true,
  },
  {
    role: 'doctor',
    email: 'doctor.demo@example.test',
    canReadPayments: true,
  },
  {
    role: 'specialist',
    email: 'specialist.demo@example.test',
    canReadPayments: true,
  },
  {
    role: 'assistant',
    email: 'assistant.demo@example.test',
    canReadPayments: false,
  },
  {
    role: 'reception_admin',
    email: 'reception.demo@example.test',
    canReadPayments: true,
  },
  {
    role: 'inventory_responsible',
    email: 'inventory.demo@example.test',
    canReadPayments: false,
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
    data,
    error: error?.message ?? null,
  }
}

function paymentPayload(fixture, overrides = {}) {
  return {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    amount: 4200,
    currency: 'RSD',
    payment_method: 'cash',
    status: 'posted',
    received_at: new Date().toISOString(),
    reference_number: `PAY-${fixture.runId.slice(0, 8)}`,
    notes: 'Patient payment RLS fixture.',
    recorded_by: fixture.ownerId,
    created_by: fixture.ownerId,
    ...overrides,
  }
}

function paymentLedgerPayload(fixture, payment, overrides = {}) {
  return {
    clinic_id: payment.clinic_id,
    patient_id: payment.patient_id,
    entry_type: 'payment',
    direction: 'credit',
    amount: payment.amount,
    currency: payment.currency,
    description_snapshot: `Payment - ${payment.payment_method}`,
    patient_payment_id: payment.id,
    status: 'posted',
    source_type: 'patient_payment',
    source_id: payment.id,
    posted_at: payment.received_at,
    recorded_by: payment.recorded_by,
    created_by: payment.created_by,
    ...overrides,
  }
}

async function tryInsertPayment(fixture, overrides = {}) {
  const result = await tryInsertRow(
    'patient_payments',
    paymentPayload(fixture, overrides),
    'id, clinic_id, patient_id, amount, currency, payment_method, status, received_at, recorded_by, created_by, ledger_entry_id',
  )

  if (result.data?.id) {
    fixture.paymentIds.push(result.data.id)
  }

  return result
}

async function tryInsertPaymentLedger(fixture, payment, overrides = {}) {
  const result = await tryInsertRow(
    'patient_ledger_entries',
    paymentLedgerPayload(fixture, payment, overrides),
    'id, clinic_id, patient_id, entry_type, direction, amount, currency, patient_payment_id, status',
  )

  if (result.data?.id) {
    fixture.ledgerEntryIds.push(result.data.id)
  }

  return result
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
    name: `Patient Payments RLS Clinic ${runId.slice(0, 8)}`,
    status: 'active',
  })

  const outReception = await insertRow('profiles', {
    clinic_id: outClinicId,
    full_name: `External Payment Reception ${runId.slice(0, 8)}`,
    email: `external.payment.reception.${runId}@example.test`,
    role: 'reception_admin',
    status: 'active',
  })

  const outPatient = await insertRow('patients', {
    clinic_id: outClinicId,
    first_name: 'External',
    last_name: `Payment ${runId.slice(0, 8)}`,
    phone: '+381600000184',
    email: `external.payment.patient.${runId}@example.test`,
    status: 'active',
    important_note: 'Out-of-clinic payment fixture.',
  })

  const otherPatient = await insertRow('patients', {
    clinic_id: DEMO_CLINIC_ID,
    first_name: 'Payment',
    last_name: `Other ${runId.slice(0, 8)}`,
    phone: '+381600000085',
    email: `payment.other.${runId}@example.test`,
    status: 'active',
    important_note: 'Same-clinic alternate payment fixture.',
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
    outReceptionId: outReception.id,
    outPatientId: outPatient.id,
    otherPatientId: otherPatient.id,
    patientIds: [outPatient.id, otherPatient.id],
    profileIds: [outReception.id],
    paymentIds: [],
    ledgerEntryIds: [],
  }
}

async function verifySchemaObjects() {
  const serviceClient = getServiceClient()
  const paymentRead = await serviceClient
    .from('patient_payments')
    .select('id')
    .limit(1)
  const ledgerRead = await serviceClient
    .from('patient_ledger_entries')
    .select('id, patient_payment_id')
    .limit(1)

  return {
    paymentsReadable: !paymentRead.error,
    paymentsError: paymentRead.error?.message ?? null,
    ledgerPaymentColumnReadable: !ledgerRead.error,
    ledgerPaymentColumnError: ledgerRead.error?.message ?? null,
  }
}

async function testPaymentIntegrity(fixture) {
  const validOwner = await tryInsertPayment(fixture)
  const validReception = await tryInsertPayment(fixture, {
    amount: 1100,
    reference_number: `PAY-REC-${fixture.runId.slice(0, 8)}`,
    recorded_by: fixture.receptionId,
    created_by: fixture.receptionId,
  })
  const zeroAmount = await tryInsertPayment(fixture, { amount: 0 })
  const negativeAmount = await tryInsertPayment(fixture, { amount: -10 })
  const invalidMethod = await tryInsertPayment(fixture, {
    payment_method: 'crypto',
  })
  const invalidCurrency = await tryInsertPayment(fixture, { currency: 'rsd' })
  const invalidStatus = await tryInsertPayment(fixture, { status: 'draft' })
  const crossClinicPatient = await tryInsertPayment(fixture, {
    patient_id: fixture.outPatientId,
  })
  const crossClinicRecorder = await tryInsertPayment(fixture, {
    recorded_by: fixture.outReceptionId,
    created_by: fixture.outReceptionId,
  })
  const doctorRecorder = await tryInsertPayment(fixture, {
    recorded_by: fixture.doctorId,
    created_by: fixture.doctorId,
  })
  const specialistRecorder = await tryInsertPayment(fixture, {
    recorded_by: fixture.specialistId,
    created_by: fixture.specialistId,
  })
  const assistantRecorder = await tryInsertPayment(fixture, {
    recorded_by: fixture.assistantId,
    created_by: fixture.assistantId,
  })
  const inventoryRecorder = await tryInsertPayment(fixture, {
    recorded_by: fixture.inventoryId,
    created_by: fixture.inventoryId,
  })
  const invalidReversedMissingMetadata = await tryInsertPayment(fixture, {
    status: 'reversed',
  })

  return {
    validOwnerAllowed: validOwner.allowed,
    validOwnerError: validOwner.error,
    validOwnerRow: validOwner.data,
    validReceptionAllowed: validReception.allowed,
    validReceptionError: validReception.error,
    zeroAmountRejected: !zeroAmount.allowed,
    zeroAmountError: zeroAmount.error,
    negativeAmountRejected: !negativeAmount.allowed,
    negativeAmountError: negativeAmount.error,
    invalidMethodRejected: !invalidMethod.allowed,
    invalidMethodError: invalidMethod.error,
    invalidCurrencyRejected: !invalidCurrency.allowed,
    invalidCurrencyError: invalidCurrency.error,
    invalidStatusRejected: !invalidStatus.allowed,
    invalidStatusError: invalidStatus.error,
    crossClinicPatientRejected: !crossClinicPatient.allowed,
    crossClinicPatientError: crossClinicPatient.error,
    crossClinicRecorderRejected: !crossClinicRecorder.allowed,
    crossClinicRecorderError: crossClinicRecorder.error,
    doctorRecorderRejected: !doctorRecorder.allowed,
    doctorRecorderError: doctorRecorder.error,
    specialistRecorderRejected: !specialistRecorder.allowed,
    specialistRecorderError: specialistRecorder.error,
    assistantRecorderRejected: !assistantRecorder.allowed,
    assistantRecorderError: assistantRecorder.error,
    inventoryRecorderRejected: !inventoryRecorder.allowed,
    inventoryRecorderError: inventoryRecorder.error,
    invalidReversedMissingMetadataRejected:
      !invalidReversedMissingMetadata.allowed,
    invalidReversedMissingMetadataError: invalidReversedMissingMetadata.error,
  }
}

async function testLedgerLinkage(fixture, payment) {
  const validCredit = await tryInsertPaymentLedger(fixture, payment)
  const duplicateCredit = await tryInsertPaymentLedger(fixture, payment)
  const wrongAmount = await tryInsertPaymentLedger(fixture, payment, {
    amount: Number(payment.amount) + 100,
  })
  const wrongCurrency = await tryInsertPaymentLedger(fixture, payment, {
    currency: 'EUR',
  })
  const wrongPatient = await tryInsertPaymentLedger(fixture, payment, {
    patient_id: fixture.otherPatientId,
  })
  const wrongClinic = await tryInsertPaymentLedger(fixture, payment, {
    clinic_id: fixture.outClinicId,
    patient_id: fixture.outPatientId,
    recorded_by: fixture.outReceptionId,
    created_by: fixture.outReceptionId,
  })
  const wrongType = await tryInsertPaymentLedger(fixture, payment, {
    entry_type: 'adjustment',
    direction: 'credit',
  })
  const wrongDirection = await tryInsertPaymentLedger(fixture, payment, {
    direction: 'debit',
  })
  const missingPaymentLink = await tryInsertRow(
    'patient_ledger_entries',
    {
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      entry_type: 'payment',
      direction: 'credit',
      amount: payment.amount,
      currency: payment.currency,
      description_snapshot: 'Payment without source payment',
      status: 'posted',
      source_type: 'manual',
      recorded_by: fixture.ownerId,
      created_by: fixture.ownerId,
    },
    'id',
  )

  if (missingPaymentLink.data?.id) {
    fixture.ledgerEntryIds.push(missingPaymentLink.data.id)
  }

  if (validCredit.data?.id) {
    const serviceClient = getServiceClient()
    const updatePayment = await serviceClient
      .from('patient_payments')
      .update({ ledger_entry_id: validCredit.data.id })
      .eq('id', payment.id)
      .select('id, ledger_entry_id')
      .single()

    return {
      validCreditAllowed: validCredit.allowed,
      validCreditError: validCredit.error,
      validCreditRow: validCredit.data,
      paymentLedgerBacklinkAllowed: !updatePayment.error,
      paymentLedgerBacklinkError: updatePayment.error?.message ?? null,
      duplicateCreditRejected: !duplicateCredit.allowed,
      duplicateCreditError: duplicateCredit.error,
      wrongAmountRejected: !wrongAmount.allowed,
      wrongAmountError: wrongAmount.error,
      wrongCurrencyRejected: !wrongCurrency.allowed,
      wrongCurrencyError: wrongCurrency.error,
      wrongPatientRejected: !wrongPatient.allowed,
      wrongPatientError: wrongPatient.error,
      wrongClinicRejected: !wrongClinic.allowed,
      wrongClinicError: wrongClinic.error,
      wrongTypeRejected: !wrongType.allowed,
      wrongTypeError: wrongType.error,
      wrongDirectionRejected: !wrongDirection.allowed,
      wrongDirectionError: wrongDirection.error,
      missingPaymentLinkRejected: !missingPaymentLink.allowed,
      missingPaymentLinkError: missingPaymentLink.error,
    }
  }

  return {
    validCreditAllowed: validCredit.allowed,
    validCreditError: validCredit.error,
    validCreditRow: validCredit.data,
    paymentLedgerBacklinkAllowed: false,
    paymentLedgerBacklinkError: 'valid credit was not created',
    duplicateCreditRejected: !duplicateCredit.allowed,
    duplicateCreditError: duplicateCredit.error,
    wrongAmountRejected: !wrongAmount.allowed,
    wrongAmountError: wrongAmount.error,
    wrongCurrencyRejected: !wrongCurrency.allowed,
    wrongCurrencyError: wrongCurrency.error,
    wrongPatientRejected: !wrongPatient.allowed,
    wrongPatientError: wrongPatient.error,
    wrongClinicRejected: !wrongClinic.allowed,
    wrongClinicError: wrongClinic.error,
    wrongTypeRejected: !wrongType.allowed,
    wrongTypeError: wrongType.error,
    wrongDirectionRejected: !wrongDirection.allowed,
    wrongDirectionError: wrongDirection.error,
    missingPaymentLinkRejected: !missingPaymentLink.allowed,
    missingPaymentLinkError: missingPaymentLink.error,
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

  const paymentRead = await countRowsAs(client, 'patient_payments', {
    id: fixture.readablePaymentId,
  })
  const outPaymentRead = await countRowsAs(client, 'patient_payments', {
    id: fixture.outPaymentId,
  })

  return {
    role: roleUser.role,
    paymentReadAllowed: paymentRead.count === 1,
    paymentReadError: paymentRead.error,
    outPaymentHidden: outPaymentRead.count === 0,
    outPaymentReadError: outPaymentRead.error,
  }
}

async function testMutationSafety(fixture, payment) {
  const ownerSession = await signIn('owner.demo@example.test')
  const ownerClient = getAuthedClient(ownerSession.access_token)
  const receptionSession = await signIn('reception.demo@example.test')
  const receptionClient = getAuthedClient(receptionSession.access_token)

  const ownerInsertPayment = await ownerClient
    .from('patient_payments')
    .insert(paymentPayload(fixture, { reference_number: 'BLOCKED-OWNER' }))
    .select('id')
    .single()
  const receptionInsertPayment = await receptionClient
    .from('patient_payments')
    .insert(
      paymentPayload(fixture, {
        reference_number: 'BLOCKED-RECEPTION',
        recorded_by: fixture.receptionId,
        created_by: fixture.receptionId,
      }),
    )
    .select('id')
    .single()
  const ownerUpdatePayment = await ownerClient
    .from('patient_payments')
    .update({ amount: 9999 })
    .eq('id', payment.id)
    .select('id')
  const ownerDeletePayment = await ownerClient
    .from('patient_payments')
    .delete()
    .eq('id', payment.id)
    .select('id')
  const ownerInsertLedgerCredit = await ownerClient
    .from('patient_ledger_entries')
    .insert(paymentLedgerPayload(fixture, payment, {
      description_snapshot: 'Blocked direct payment ledger credit',
    }))
    .select('id')
    .single()
  const ownerUpdateLedger = await ownerClient
    .from('patient_ledger_entries')
    .update({ description_snapshot: 'Blocked payment ledger mutation' })
    .eq('id', fixture.readableLedgerEntryId)
    .select('id')
  const ownerDeleteLedger = await ownerClient
    .from('patient_ledger_entries')
    .delete()
    .eq('id', fixture.readableLedgerEntryId)
    .select('id')

  return {
    ownerInsertPaymentBlocked: Boolean(ownerInsertPayment.error),
    ownerInsertPaymentError: ownerInsertPayment.error?.message ?? null,
    receptionInsertPaymentBlocked: Boolean(receptionInsertPayment.error),
    receptionInsertPaymentError: receptionInsertPayment.error?.message ?? null,
    ownerUpdatePaymentBlocked:
      Boolean(ownerUpdatePayment.error) ||
      (ownerUpdatePayment.data ?? []).length === 0,
    ownerUpdatePaymentError: ownerUpdatePayment.error?.message ?? null,
    ownerDeletePaymentBlocked:
      Boolean(ownerDeletePayment.error) ||
      (ownerDeletePayment.data ?? []).length === 0,
    ownerDeletePaymentError: ownerDeletePayment.error?.message ?? null,
    ownerInsertLedgerCreditBlocked: Boolean(ownerInsertLedgerCredit.error),
    ownerInsertLedgerCreditError:
      ownerInsertLedgerCredit.error?.message ?? null,
    ownerUpdateLedgerBlocked:
      Boolean(ownerUpdateLedger.error) ||
      (ownerUpdateLedger.data ?? []).length === 0,
    ownerUpdateLedgerError: ownerUpdateLedger.error?.message ?? null,
    ownerDeleteLedgerBlocked:
      Boolean(ownerDeleteLedger.error) ||
      (ownerDeleteLedger.data ?? []).length === 0,
    ownerDeleteLedgerError: ownerDeleteLedger.error?.message ?? null,
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
  await serviceClient.from('patients').delete().in('id', fixture.patientIds)
  await serviceClient.from('profiles').delete().in('id', fixture.profileIds)
  await serviceClient.from('clinics').delete().eq('id', fixture.outClinicId)
}

async function main() {
  const failures = []
  const results = {}
  const schema = await verifySchemaObjects()

  results.schema = schema
  if (!schema.paymentsReadable) failures.push('schema: patient payments unreadable')
  if (!schema.ledgerPaymentColumnReadable) {
    failures.push('schema: patient ledger payment linkage column unreadable')
  }

  const fixture = await prepareFixture()

  try {
    const integrity = await testPaymentIntegrity(fixture)
    results.integrity = integrity
    for (const [key, value] of Object.entries(integrity)) {
      if (key.endsWith('Error') || key.endsWith('Row')) continue
      if (!value) failures.push(`payment integrity failed: ${key}`)
    }

    const outPayment = await tryInsertPayment(fixture, {
      clinic_id: fixture.outClinicId,
      patient_id: fixture.outPatientId,
      recorded_by: fixture.outReceptionId,
      created_by: fixture.outReceptionId,
      reference_number: `OUT-PAY-${fixture.runId.slice(0, 8)}`,
    })

    if (!outPayment.allowed) {
      failures.push(`out-of-clinic payment fixture failed: ${outPayment.error}`)
    }

    fixture.readablePaymentId = integrity.validOwnerRow?.id
    fixture.outPaymentId = outPayment.data?.id

    const ledgerLinkage = await testLedgerLinkage(fixture, integrity.validOwnerRow)
    results.ledgerLinkage = ledgerLinkage
    for (const [key, value] of Object.entries(ledgerLinkage)) {
      if (key.endsWith('Error') || key.endsWith('Row')) continue
      if (!value) failures.push(`ledger linkage failed: ${key}`)
    }
    fixture.readableLedgerEntryId = ledgerLinkage.validCreditRow?.id

    results.visibility = []
    for (const roleUser of ROLE_USERS) {
      const result = await testRoleVisibility(roleUser, fixture)
      results.visibility.push(result)

      if (roleUser.canReadPayments && !result.paymentReadAllowed) {
        failures.push(`${roleUser.role}: payment read was denied`)
      }
      if (!roleUser.canReadPayments && result.paymentReadAllowed) {
        failures.push(`${roleUser.role}: payment read unexpectedly allowed`)
      }
      if (!result.outPaymentHidden) {
        failures.push(`${roleUser.role}: out-of-clinic payment was visible`)
      }
    }

    const mutationSafety = await testMutationSafety(
      fixture,
      integrity.validOwnerRow,
    )
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
    console.error('Patient payments RLS smoke failed:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }

  console.log('Patient payments RLS smoke passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
