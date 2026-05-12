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

const ROLE_USERS = [
  { role: 'owner_admin', email: 'owner.demo@example.test', allowed: true },
  { role: 'doctor', email: 'doctor.demo@example.test', allowed: true },
  { role: 'specialist', email: 'specialist.demo@example.test', allowed: true },
  { role: 'assistant', email: 'assistant.demo@example.test', allowed: false },
  { role: 'reception_admin', email: 'reception.demo@example.test', allowed: false },
  {
    role: 'inventory_responsible',
    email: 'inventory.demo@example.test',
    allowed: false,
  },
]

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

async function createTestPatient(role) {
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const marker = `${role}-${Date.now()}`
  const { data, error } = await serviceClient
    .from('patients')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      first_name: 'Medical',
      last_name: `Record-${marker}`,
      phone: '+381 60 777 0000',
      email: `medical.record.${marker}@example.test`,
      status: 'active',
      important_note: `Demo patient for medical record write test (${marker}).`,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create test patient.')
  }

  return data.id
}

async function createAudit(client, action, recordId, patientId) {
  const { data, error } = await client.rpc('create_audit_log', {
    p_action: action,
    p_entity_type: 'patient_medical_record',
    p_entity_id: recordId,
    p_old_values: null,
    p_new_values: { marker: action },
    p_metadata: { patient_id: patientId, source: 'testPatientMedicalRecordWrite.mjs' },
  })

  if (error) {
    return { ok: false, error: error.message, id: null }
  }

  return { ok: true, error: null, id: data }
}

async function findAudit(action, recordId) {
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await serviceClient
    .from('audit_logs')
    .select('id')
    .eq('action', action)
    .eq('entity_type', 'patient_medical_record')
    .eq('entity_id', recordId)
    .limit(1)
    .maybeSingle()

  if (error) {
    return { ok: false, error: error.message, found: false }
  }

  return { ok: true, error: null, found: Boolean(data) }
}

async function testRole(roleUser) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)
  const patientId = await createTestPatient(roleUser.role)

  const insert = await client
    .from('patient_medical_records')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      anamnesis_summary: `Demo anamnesis created by ${roleUser.role}.`,
      allergies: 'Demo allergy entry.',
      current_medications: 'Demo medication entry.',
      medical_warnings: 'Demo medical warning.',
      dental_history: 'Demo dental history.',
      risk_notes: 'Demo risk notes.',
    })
    .select('id')
    .single()

  if (insert.error || !insert.data) {
    return {
      role: roleUser.role,
      insertAllowed: false,
      insertError: insert.error?.message ?? 'No inserted record returned.',
      updateAllowed: false,
      auditCreated: false,
      auditUpdated: false,
    }
  }

  const recordId = insert.data.id
  const createdAudit = await createAudit(
    client,
    'patient_medical_record.created',
    recordId,
    patientId,
  )
  const createdAuditLookup = await findAudit(
    'patient_medical_record.created',
    recordId,
  )

  const update = await client
    .from('patient_medical_records')
    .update({
      risk_notes: `Demo risk notes updated by ${roleUser.role}.`,
    })
    .eq('id', recordId)
    .select('id')
    .single()

  const updatedAudit =
    update.error || !update.data
      ? { ok: false, error: update.error?.message ?? 'No updated record returned.' }
      : await createAudit(
          client,
          'patient_medical_record.updated',
          recordId,
          patientId,
        )
  const updatedAuditLookup = await findAudit(
    'patient_medical_record.updated',
    recordId,
  )

  return {
    role: roleUser.role,
    insertAllowed: true,
    insertError: null,
    updateAllowed: !update.error,
    updateError: update.error?.message ?? null,
    auditCreated: createdAudit.ok && createdAuditLookup.found,
    auditCreatedError: createdAudit.error ?? createdAuditLookup.error,
    auditUpdated: updatedAudit.ok && updatedAuditLookup.found,
    auditUpdatedError: updatedAudit.error ?? updatedAuditLookup.error,
  }
}

async function main() {
  const results = []
  const failures = []

  for (const roleUser of ROLE_USERS) {
    const result = await testRole(roleUser)
    results.push(result)

    if (roleUser.allowed) {
      if (!result.insertAllowed) {
        failures.push(`${roleUser.role}: insert was denied`)
      }
      if (!result.updateAllowed) {
        failures.push(`${roleUser.role}: update was denied`)
      }
      if (!result.auditCreated) {
        failures.push(`${roleUser.role}: created audit row missing`)
      }
      if (!result.auditUpdated) {
        failures.push(`${roleUser.role}: updated audit row missing`)
      }
    } else if (result.insertAllowed || result.updateAllowed) {
      failures.push(`${roleUser.role}: medical record write unexpectedly allowed`)
    }
  }

  console.log(JSON.stringify(results, null, 2))

  if (failures.length > 0) {
    console.error('\nFailures:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
