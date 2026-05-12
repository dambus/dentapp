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
  { role: 'owner_admin', email: 'owner.demo@example.test', canRead: true, canWrite: true },
  { role: 'doctor', email: 'doctor.demo@example.test', canRead: true, canWrite: true },
  { role: 'specialist', email: 'specialist.demo@example.test', canRead: true, canWrite: true },
  { role: 'assistant', email: 'assistant.demo@example.test', canRead: true, canWrite: false },
  { role: 'reception_admin', email: 'reception.demo@example.test', canRead: false, canWrite: false },
  {
    role: 'inventory_responsible',
    email: 'inventory.demo@example.test',
    canRead: false,
    canWrite: false,
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

async function createTestPatient(role) {
  const serviceClient = getServiceClient()
  const marker = `${role}-${Date.now()}`
  const { data, error } = await serviceClient
    .from('patients')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      first_name: 'Odontogram',
      last_name: `Status-${marker}`,
      phone: '+381 60 555 0000',
      email: `odontogram.status.${marker}@example.test`,
      status: 'active',
      important_note: `Demo patient for odontogram CRUD test (${marker}).`,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create test patient.')
  }

  return data.id
}

async function createServiceToothStatus(patientId, role, toothNumber = '18') {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('patient_tooth_statuses')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      tooth_number: toothNumber,
      status: 'watch',
      note: `Service-created demo tooth status for ${role}.`,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create service tooth status.')
  }

  return data.id
}

async function createAudit(
  client,
  action,
  toothStatusId,
  patientId,
  toothNumber,
  oldValues,
  newValues,
) {
  const { data, error } = await client.rpc('create_audit_log', {
    p_action: action,
    p_entity_type: 'patient_tooth_status',
    p_entity_id: toothStatusId,
    p_old_values: oldValues,
    p_new_values: newValues,
    p_metadata: {
      patient_id: patientId,
      tooth_number: toothNumber,
      source: 'testOdontogramCrud.mjs',
    },
  })

  if (error) {
    return { ok: false, error: error.message, id: null }
  }

  return { ok: true, error: null, id: data }
}

async function findAudit(action, toothStatusId) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('audit_logs')
    .select('id')
    .eq('action', action)
    .eq('entity_type', 'patient_tooth_status')
    .eq('entity_id', toothStatusId)
    .limit(1)
    .maybeSingle()

  if (error) {
    return { ok: false, error: error.message, found: false }
  }

  return { ok: true, error: null, found: Boolean(data) }
}

async function countRowsAs(client, patientId) {
  const { count, error } = await client
    .from('patient_tooth_statuses')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', patientId)

  if (error) {
    return { count: 0, error: error.message }
  }

  return { count: count ?? 0, error: null }
}

async function countAuditLogsAs(email) {
  const session = await signIn(email)
  const client = getAuthedClient(session.access_token)
  const { count, error } = await client
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('action', 'odontogram.tooth_status.saved')

  if (error) {
    return 0
  }

  return count ?? 0
}

async function testWriteRole(roleUser, client, patientId) {
  const insert = await client
    .from('patient_tooth_statuses')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      tooth_number: '16',
      status: 'caries',
      note: `Fake odontogram status created by ${roleUser.role}.`,
    })
    .select('id, tooth_number, status, note, deleted_at')
    .single()

  if (insert.error || !insert.data) {
    return {
      createAllowed: false,
      createError: insert.error?.message ?? 'No inserted tooth status returned.',
      updateAllowed: false,
      clearAllowed: false,
      hardDeleteAllowed: false,
      auditSaved: false,
      auditCleared: false,
      softClearPreservedRow: false,
    }
  }

  const toothStatusId = insert.data.id
  const createdAudit = await createAudit(
    client,
    'odontogram.tooth_status.saved',
    toothStatusId,
    patientId,
    '16',
    null,
    insert.data,
  )
  const createdAuditLookup = await findAudit(
    'odontogram.tooth_status.saved',
    toothStatusId,
  )

  const update = await client
    .from('patient_tooth_statuses')
    .update({
      status: 'filled',
      note: `Fake odontogram status updated by ${roleUser.role}.`,
    })
    .eq('id', toothStatusId)
    .select('id, tooth_number, status, note, deleted_at')
    .single()

  const clear = await client
    .from('patient_tooth_statuses')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', toothStatusId)
    .select('id, tooth_number, status, note, deleted_at')
    .single()

  const clearAudit =
    clear.error || !clear.data
      ? { ok: false, error: clear.error?.message ?? 'No cleared row returned.' }
      : await createAudit(
          client,
          'odontogram.tooth_status.cleared',
          toothStatusId,
          patientId,
          '16',
          update.data,
          clear.data,
        )
  const clearAuditLookup = await findAudit(
    'odontogram.tooth_status.cleared',
    toothStatusId,
  )

  const hardDelete = await client
    .from('patient_tooth_statuses')
    .delete()
    .eq('id', toothStatusId)

  const serviceClient = getServiceClient()
  const { data: preservedRow } = await serviceClient
    .from('patient_tooth_statuses')
    .select('id, deleted_at')
    .eq('id', toothStatusId)
    .maybeSingle()

  return {
    createAllowed: true,
    createError: null,
    updateAllowed: !update.error,
    updateError: update.error?.message ?? null,
    clearAllowed: !clear.error,
    clearError: clear.error?.message ?? null,
    hardDeleteAllowed: !hardDelete.error && !preservedRow,
    hardDeleteError: hardDelete.error?.message ?? null,
    auditSaved: createdAudit.ok && createdAuditLookup.found,
    auditSavedError: createdAudit.error ?? createdAuditLookup.error,
    auditCleared: clearAudit.ok && clearAuditLookup.found,
    auditClearedError: clearAudit.error ?? clearAuditLookup.error,
    softClearPreservedRow: Boolean(preservedRow?.deleted_at),
  }
}

async function testDeniedWriteRole(roleUser, client, patientId) {
  const toothStatusId = await createServiceToothStatus(
    patientId,
    roleUser.role,
    '17',
  )

  const insert = await client
    .from('patient_tooth_statuses')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      tooth_number: '26',
      status: 'watch',
      note: `Denied fake odontogram status attempted by ${roleUser.role}.`,
    })
    .select('id')
    .single()

  const update = await client
    .from('patient_tooth_statuses')
    .update({
      status: 'filled',
    })
    .eq('id', toothStatusId)
    .select('id')
    .single()

  const hardDelete = await client
    .from('patient_tooth_statuses')
    .delete()
    .eq('id', toothStatusId)

  const serviceClient = getServiceClient()
  const { data: preservedRow } = await serviceClient
    .from('patient_tooth_statuses')
    .select('id')
    .eq('id', toothStatusId)
    .maybeSingle()

  return {
    createAllowed: !insert.error,
    createError: insert.error?.message ?? null,
    updateAllowed: !update.error,
    updateError: update.error?.message ?? null,
    hardDeleteAllowed: !hardDelete.error && !preservedRow,
    hardDeleteError: hardDelete.error?.message ?? null,
  }
}

async function testRole(roleUser) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)
  const patientId = await createTestPatient(roleUser.role)
  await createServiceToothStatus(patientId, `${roleUser.role}-read`, '18')
  const read = await countRowsAs(client, patientId)
  const write = roleUser.canWrite
    ? await testWriteRole(roleUser, client, patientId)
    : await testDeniedWriteRole(roleUser, client, patientId)

  return {
    role: roleUser.role,
    readCount: read.count,
    readError: read.error,
    ...write,
  }
}

async function main() {
  const results = []
  const failures = []

  for (const roleUser of ROLE_USERS) {
    const result = await testRole(roleUser)
    results.push(result)

    if (roleUser.canRead && result.readCount <= 0) {
      failures.push(`${roleUser.role}: odontogram read was denied`)
    }

    if (!roleUser.canRead && result.readCount > 0) {
      failures.push(`${roleUser.role}: odontogram read unexpectedly allowed`)
    }

    if (roleUser.canWrite) {
      if (!result.createAllowed) {
        failures.push(`${roleUser.role}: tooth status create was denied`)
      }
      if (!result.updateAllowed) {
        failures.push(`${roleUser.role}: tooth status update was denied`)
      }
      if (!result.clearAllowed) {
        failures.push(`${roleUser.role}: tooth status clear was denied`)
      }
      if (!result.auditSaved) {
        failures.push(`${roleUser.role}: saved audit row missing`)
      }
      if (!result.auditCleared) {
        failures.push(`${roleUser.role}: cleared audit row missing`)
      }
      if (!result.softClearPreservedRow) {
        failures.push(`${roleUser.role}: clear did not preserve soft-deleted row`)
      }
      if (result.hardDeleteAllowed) {
        failures.push(`${roleUser.role}: hard delete unexpectedly allowed`)
      }
    } else {
      if (result.createAllowed) {
        failures.push(`${roleUser.role}: tooth status create unexpectedly allowed`)
      }
      if (result.updateAllowed) {
        failures.push(`${roleUser.role}: tooth status update unexpectedly allowed`)
      }
      if (result.hardDeleteAllowed) {
        failures.push(`${roleUser.role}: hard delete unexpectedly allowed`)
      }
    }
  }

  const ownerAuditCount = await countAuditLogsAs('owner.demo@example.test')
  const doctorAuditCount = await countAuditLogsAs('doctor.demo@example.test')

  if (ownerAuditCount <= 0) {
    failures.push('owner_admin cannot read expected odontogram audit logs')
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
