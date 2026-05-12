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
  { role: 'reception_admin', email: 'reception.demo@example.test', allowed: true },
  { role: 'specialist', email: 'specialist.demo@example.test', allowed: false },
  { role: 'assistant', email: 'assistant.demo@example.test', allowed: false },
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
      first_name: 'Archive',
      last_name: `Restore-${marker}`,
      phone: '+381 60 888 0000',
      email: `archive.restore.${marker}@example.test`,
      status: 'active',
      important_note: `Demo patient for archive/restore test (${marker}).`,
    })
    .select('id, first_name, last_name, status, deleted_at')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create test patient.')
  }

  return data
}

async function createAudit(client, action, patientId, oldValues, newValues) {
  const { data, error } = await client.rpc('create_audit_log', {
    p_action: action,
    p_entity_type: 'patient',
    p_entity_id: patientId,
    p_old_values: oldValues,
    p_new_values: newValues,
    p_metadata: { source: 'testPatientArchiveRestore.mjs' },
  })

  if (error) {
    return { ok: false, error: error.message, id: null }
  }

  return { ok: true, error: null, id: data }
}

async function findAudit(action, patientId) {
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await serviceClient
    .from('audit_logs')
    .select('id')
    .eq('action', action)
    .eq('entity_type', 'patient')
    .eq('entity_id', patientId)
    .limit(1)
    .maybeSingle()

  if (error) {
    return { ok: false, error: error.message, found: false }
  }

  return { ok: true, error: null, found: Boolean(data) }
}

async function countAuditLogsAs(email) {
  const session = await signIn(email)
  const client = getAuthedClient(session.access_token)
  const { count, error } = await client
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('action', 'patient.archived')

  if (error) {
    return 0
  }

  return count ?? 0
}

async function testRole(roleUser) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)
  const patient = await createTestPatient(roleUser.role)

  const archivePayload = {
    status: 'archived',
    deleted_at: new Date().toISOString(),
  }

  const archive = await client
    .from('patients')
    .update(archivePayload)
    .eq('id', patient.id)
    .select('id, first_name, last_name, status, deleted_at')
    .single()

  if (archive.error || !archive.data) {
    return {
      role: roleUser.role,
      archiveAllowed: false,
      archiveError: archive.error?.message ?? 'No archived patient returned.',
      restoreAllowed: false,
      auditArchived: false,
      auditRestored: false,
    }
  }

  const archiveAudit = await createAudit(
    client,
    'patient.archived',
    patient.id,
    patient,
    archive.data,
  )
  const archiveAuditLookup = await findAudit('patient.archived', patient.id)

  const restorePayload = {
    status: 'active',
    deleted_at: null,
  }

  const restore = await client
    .from('patients')
    .update(restorePayload)
    .eq('id', patient.id)
    .select('id, first_name, last_name, status, deleted_at')
    .single()

  const restoreAudit =
    restore.error || !restore.data
      ? { ok: false, error: restore.error?.message ?? 'No restored patient returned.' }
      : await createAudit(
          client,
          'patient.restored',
          patient.id,
          archive.data,
          restore.data,
        )
  const restoreAuditLookup = await findAudit('patient.restored', patient.id)

  return {
    role: roleUser.role,
    archiveAllowed: true,
    archiveError: null,
    restoreAllowed: !restore.error,
    restoreError: restore.error?.message ?? null,
    auditArchived: archiveAudit.ok && archiveAuditLookup.found,
    auditArchivedError: archiveAudit.error ?? archiveAuditLookup.error,
    auditRestored: restoreAudit.ok && restoreAuditLookup.found,
    auditRestoredError: restoreAudit.error ?? restoreAuditLookup.error,
  }
}

async function main() {
  const results = []
  const failures = []

  for (const roleUser of ROLE_USERS) {
    const result = await testRole(roleUser)
    results.push(result)

    if (roleUser.allowed) {
      if (!result.archiveAllowed) {
        failures.push(`${roleUser.role}: archive was denied`)
      }
      if (!result.restoreAllowed) {
        failures.push(`${roleUser.role}: restore was denied`)
      }
      if (!result.auditArchived) {
        failures.push(`${roleUser.role}: patient.archived audit row missing`)
      }
      if (!result.auditRestored) {
        failures.push(`${roleUser.role}: patient.restored audit row missing`)
      }
    } else if (result.archiveAllowed || result.restoreAllowed) {
      failures.push(`${roleUser.role}: archive/restore unexpectedly allowed`)
    }
  }

  const ownerAuditCount = await countAuditLogsAs('owner.demo@example.test')
  const doctorAuditCount = await countAuditLogsAs('doctor.demo@example.test')

  if (ownerAuditCount <= 0) {
    failures.push('owner_admin cannot read expected archive audit logs')
  }

  if (doctorAuditCount !== 0) {
    failures.push('doctor unexpectedly can read audit logs')
  }

  console.log(
    JSON.stringify(
      {
        results,
        auditRead: {
          owner_admin: ownerAuditCount,
          doctor: doctorAuditCount,
        },
      },
      null,
      2,
    ),
  )

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
