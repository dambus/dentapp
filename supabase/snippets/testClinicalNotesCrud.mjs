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

function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

async function createTestPatient(role) {
  const serviceClient = getServiceClient()
  const marker = `${role}-${Date.now()}`
  const { data, error } = await serviceClient
    .from('patients')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      first_name: 'Clinical',
      last_name: `Note-${marker}`,
      phone: '+381 60 999 0000',
      email: `clinical.note.${marker}@example.test`,
      status: 'active',
      important_note: `Demo patient for clinical notes CRUD test (${marker}).`,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create test patient.')
  }

  return data.id
}

async function createServiceNote(patientId, role) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('clinical_notes')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      note_type: 'general',
      content: `Service-created demo note for denied ${role} checks.`,
      tooth_number: null,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create service clinical note.')
  }

  return data.id
}

async function createAudit(client, action, noteId, patientId, oldValues, newValues) {
  const { data, error } = await client.rpc('create_audit_log', {
    p_action: action,
    p_entity_type: 'clinical_note',
    p_entity_id: noteId,
    p_old_values: oldValues,
    p_new_values: newValues,
    p_metadata: { patient_id: patientId, source: 'testClinicalNotesCrud.mjs' },
  })

  if (error) {
    return { ok: false, error: error.message, id: null }
  }

  return { ok: true, error: null, id: data }
}

async function findAudit(action, noteId) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('audit_logs')
    .select('id')
    .eq('action', action)
    .eq('entity_type', 'clinical_note')
    .eq('entity_id', noteId)
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
    .eq('action', 'clinical_note.created')

  if (error) {
    return 0
  }

  return count ?? 0
}

async function testAllowedRole(roleUser, client, patientId) {
  const insert = await client
    .from('clinical_notes')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      note_type: 'examination',
      content: `Fake clinical note created by ${roleUser.role}.`,
      tooth_number: '16',
    })
    .select('id, note_type, content, tooth_number, deleted_at')
    .single()

  if (insert.error || !insert.data) {
    return {
      role: roleUser.role,
      createAllowed: false,
      createError: insert.error?.message ?? 'No inserted note returned.',
      updateAllowed: false,
      archiveAllowed: false,
      auditCreated: false,
      auditUpdated: false,
      auditArchived: false,
    }
  }

  const noteId = insert.data.id
  const createdAudit = await createAudit(
    client,
    'clinical_note.created',
    noteId,
    patientId,
    null,
    insert.data,
  )
  const createdAuditLookup = await findAudit('clinical_note.created', noteId)

  const update = await client
    .from('clinical_notes')
    .update({
      content: `Fake clinical note updated by ${roleUser.role}.`,
    })
    .eq('id', noteId)
    .select('id, note_type, content, tooth_number, deleted_at')
    .single()

  const updatedAudit =
    update.error || !update.data
      ? { ok: false, error: update.error?.message ?? 'No updated note returned.' }
      : await createAudit(
          client,
          'clinical_note.updated',
          noteId,
          patientId,
          insert.data,
          update.data,
        )
  const updatedAuditLookup = await findAudit('clinical_note.updated', noteId)

  const archive = await client
    .from('clinical_notes')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select('id, note_type, content, tooth_number, deleted_at')
    .single()

  const archivedAudit =
    archive.error || !archive.data
      ? { ok: false, error: archive.error?.message ?? 'No archived note returned.' }
      : await createAudit(
          client,
          'clinical_note.archived',
          noteId,
          patientId,
          update.data,
          archive.data,
        )
  const archivedAuditLookup = await findAudit('clinical_note.archived', noteId)

  return {
    role: roleUser.role,
    createAllowed: true,
    createError: null,
    updateAllowed: !update.error,
    updateError: update.error?.message ?? null,
    archiveAllowed: !archive.error,
    archiveError: archive.error?.message ?? null,
    auditCreated: createdAudit.ok && createdAuditLookup.found,
    auditCreatedError: createdAudit.error ?? createdAuditLookup.error,
    auditUpdated: updatedAudit.ok && updatedAuditLookup.found,
    auditUpdatedError: updatedAudit.error ?? updatedAuditLookup.error,
    auditArchived: archivedAudit.ok && archivedAuditLookup.found,
    auditArchivedError: archivedAudit.error ?? archivedAuditLookup.error,
  }
}

async function testDeniedRole(roleUser, client, patientId) {
  const serviceNoteId = await createServiceNote(patientId, roleUser.role)

  const insert = await client
    .from('clinical_notes')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      note_type: 'general',
      content: `Denied fake clinical note attempted by ${roleUser.role}.`,
    })
    .select('id')
    .single()

  const update = await client
    .from('clinical_notes')
    .update({
      content: `Denied fake clinical note update attempted by ${roleUser.role}.`,
    })
    .eq('id', serviceNoteId)
    .select('id')
    .single()

  const archive = await client
    .from('clinical_notes')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', serviceNoteId)
    .select('id')
    .single()

  return {
    role: roleUser.role,
    createAllowed: !insert.error,
    createError: insert.error?.message ?? null,
    updateAllowed: !update.error,
    updateError: update.error?.message ?? null,
    archiveAllowed: !archive.error,
    archiveError: archive.error?.message ?? null,
  }
}

async function testRole(roleUser) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)
  const patientId = await createTestPatient(roleUser.role)

  return roleUser.allowed
    ? testAllowedRole(roleUser, client, patientId)
    : testDeniedRole(roleUser, client, patientId)
}

async function main() {
  const results = []
  const failures = []

  for (const roleUser of ROLE_USERS) {
    const result = await testRole(roleUser)
    results.push(result)

    if (roleUser.allowed) {
      if (!result.createAllowed) {
        failures.push(`${roleUser.role}: create was denied`)
      }
      if (!result.updateAllowed) {
        failures.push(`${roleUser.role}: update was denied`)
      }
      if (!result.archiveAllowed) {
        failures.push(`${roleUser.role}: archive was denied`)
      }
      if (!result.auditCreated) {
        failures.push(`${roleUser.role}: clinical_note.created audit row missing`)
      }
      if (!result.auditUpdated) {
        failures.push(`${roleUser.role}: clinical_note.updated audit row missing`)
      }
      if (!result.auditArchived) {
        failures.push(`${roleUser.role}: clinical_note.archived audit row missing`)
      }
    } else {
      if (result.createAllowed) {
        failures.push(`${roleUser.role}: create unexpectedly allowed`)
      }
      if (result.updateAllowed) {
        failures.push(`${roleUser.role}: update unexpectedly allowed`)
      }
      if (result.archiveAllowed) {
        failures.push(`${roleUser.role}: archive unexpectedly allowed`)
      }
    }
  }

  const ownerAuditCount = await countAuditLogsAs('owner.demo@example.test')
  const doctorAuditCount = await countAuditLogsAs('doctor.demo@example.test')

  if (ownerAuditCount <= 0) {
    failures.push('owner_admin cannot read expected clinical note audit logs')
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
