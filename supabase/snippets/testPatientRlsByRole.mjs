import { createClient } from '@supabase/supabase-js'
import { DEMO_PASSWORD } from './demoAuthConstants.mjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.')
  process.exit(1)
}

const DEMO_CLINIC_ID = '11111111-1111-1111-1111-111111111111'
const DEMO_PATIENT_ID = '22222222-2222-2222-2222-222222222201'

const ROLE_USERS = [
  { role: 'owner_admin', email: 'owner.demo@example.test', password: DEMO_PASSWORD },
  { role: 'doctor', email: 'doctor.demo@example.test', password: DEMO_PASSWORD },
  { role: 'specialist', email: 'specialist.demo@example.test', password: DEMO_PASSWORD },
  { role: 'assistant', email: 'assistant.demo@example.test', password: DEMO_PASSWORD },
  { role: 'reception_admin', email: 'reception.demo@example.test', password: DEMO_PASSWORD },
  { role: 'inventory_responsible', email: 'inventory.demo@example.test', password: DEMO_PASSWORD },
]

async function getCount(client, tableName) {
  const { count, error } = await client
    .from(tableName)
    .select('*', { count: 'exact', head: true })

  if (error) {
    return { count: null, error: error.message }
  }

  return { count: count ?? 0, error: null }
}

async function testPatientInsertUpdate(client, role) {
  const now = Date.now()
  const marker = `demo-${role}-${now}`

  const insertPayload = {
    clinic_id: DEMO_CLINIC_ID,
    first_name: 'Role',
    last_name: `Tester-${role}`,
    phone: '+381 60 999 0000',
    email: `${role}.patient.${now}@example.test`,
    status: 'active',
    important_note: `Demo patient insert by ${role} for local RLS testing only (${marker}).`,
  }

  const insertResult = await client
    .from('patients')
    .insert(insertPayload)
    .select('id')
    .single()

  const insertAllowed = !insertResult.error
  let updateAllowed = false

  if (insertAllowed && insertResult.data?.id) {
    const patientId = insertResult.data.id
    const updateResult = await client
      .from('patients')
      .update({ important_note: `Demo patient update by ${role} (${marker}).` })
      .eq('id', patientId)
      .select('id')
      .single()

    updateAllowed = !updateResult.error
  }

  return {
    insertAllowed,
    insertError: insertResult.error?.message ?? null,
    updateAllowed,
  }
}

async function testClinicalNoteInsert(client, role) {
  const now = Date.now()
  const content = `Demo clinical note insert by ${role} for local RLS testing only (${now}).`

  const result = await client
    .from('clinical_notes')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      note_type: 'rls_test',
      content,
      tooth_number: '99',
    })
    .select('id')
    .single()

  const insertAllowed = !result.error

  return {
    insertAllowed,
    insertError: result.error?.message ?? null,
  }
}

async function testRole(roleUser) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const signIn = await client.auth.signInWithPassword({
    email: roleUser.email,
    password: roleUser.password,
  })

  if (signIn.error) {
    return {
      role: roleUser.role,
      email: roleUser.email,
      signInError: signIn.error.message,
    }
  }

  const [
    clinics,
    profiles,
    patients,
    medicalRecords,
    clinicalNotes,
    auditLogs,
    patientWrite,
    clinicalWrite,
  ] = await Promise.all([
    getCount(client, 'clinics'),
    getCount(client, 'profiles'),
    getCount(client, 'patients'),
    getCount(client, 'patient_medical_records'),
    getCount(client, 'clinical_notes'),
    getCount(client, 'audit_logs'),
    testPatientInsertUpdate(client, roleUser.role),
    testClinicalNoteInsert(client, roleUser.role),
  ])

  await client.auth.signOut()

  return {
    role: roleUser.role,
    email: roleUser.email,
    signInError: null,
    reads: {
      clinics,
      profiles,
      patients,
      patient_medical_records: medicalRecords,
      clinical_notes: clinicalNotes,
      audit_logs: auditLogs,
    },
    writes: {
      patients: patientWrite,
      clinical_notes: clinicalWrite,
    },
  }
}

async function main() {
  const results = []

  for (const roleUser of ROLE_USERS) {
    // Run per-role serially so output remains easy to inspect.
    const result = await testRole(roleUser)
    results.push(result)
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
