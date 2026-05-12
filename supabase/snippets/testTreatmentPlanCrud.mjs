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
  {
    role: 'owner_admin',
    email: 'owner.demo@example.test',
    canRead: true,
    canWrite: true,
  },
  {
    role: 'doctor',
    email: 'doctor.demo@example.test',
    canRead: true,
    canWrite: true,
  },
  {
    role: 'specialist',
    email: 'specialist.demo@example.test',
    canRead: true,
    canWrite: true,
  },
  {
    role: 'assistant',
    email: 'assistant.demo@example.test',
    canRead: true,
    canWrite: false,
  },
  {
    role: 'reception_admin',
    email: 'reception.demo@example.test',
    canRead: true,
    canWrite: false,
  },
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
      first_name: 'Treatment',
      last_name: `Plan-${marker}`,
      phone: '+381 60 777 0000',
      email: `treatment.plan.${marker}@example.test`,
      status: 'active',
      important_note: `Demo patient for treatment plan CRUD test (${marker}).`,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create test patient.')
  }

  return data.id
}

async function createServicePlan(patientId, role) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('treatment_plans')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      title: `Service-created demo plan for ${role}`,
      description: 'Service-created fixture for read and denied-write checks.',
      status: 'draft',
      proposed_total: 12000,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create service treatment plan.')
  }

  return data.id
}

async function createServiceItem(patientId, planId, role) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('treatment_plan_items')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      treatment_plan_id: planId,
      tooth_number: '16',
      title: `Service-created demo item for ${role}`,
      description: 'Service-created fixture for denied item write checks.',
      service_code: 'DEMO',
      status: 'planned',
      estimated_price: 6000,
      sort_order: 0,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create service treatment item.')
  }

  return data.id
}

async function createAudit(
  client,
  action,
  entityType,
  entityId,
  patientId,
  oldValues,
  newValues,
  metadata,
) {
  const { data, error } = await client.rpc('create_audit_log', {
    p_action: action,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_old_values: oldValues,
    p_new_values: newValues,
    p_metadata: {
      patient_id: patientId,
      source: 'testTreatmentPlanCrud.mjs',
      ...metadata,
    },
  })

  if (error) {
    return { ok: false, error: error.message, id: null }
  }

  return { ok: true, error: null, id: data }
}

async function findAudit(action, entityType, entityId) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('audit_logs')
    .select('id')
    .eq('action', action)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .limit(1)
    .maybeSingle()

  if (error) {
    return { ok: false, error: error.message, found: false }
  }

  return { ok: true, error: null, found: Boolean(data) }
}

async function countRowsAs(client, table, patientId) {
  const { count, error } = await client
    .from(table)
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
    .eq('action', 'treatment_plan.created')

  if (error) {
    return 0
  }

  return count ?? 0
}

async function testWriteRole(roleUser, client, patientId) {
  const planInsert = await client
    .from('treatment_plans')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      title: `Fake treatment plan created by ${roleUser.role}`,
      description: 'Fake treatment plan used by the local RLS test.',
      status: 'draft',
      proposed_total: 25000,
    })
    .select('id, title, description, status, proposed_total, deleted_at')
    .single()

  if (planInsert.error || !planInsert.data) {
    return {
      planCreateAllowed: false,
      planCreateError:
        planInsert.error?.message ?? 'No inserted treatment plan returned.',
      planUpdateAllowed: false,
      planArchiveAllowed: false,
      itemCreateAllowed: false,
      itemUpdateAllowed: false,
      itemArchiveAllowed: false,
      hardDeleteAllowed: false,
      auditPlanCreated: false,
      auditPlanUpdated: false,
      auditPlanArchived: false,
      auditItemCreated: false,
      auditItemUpdated: false,
      auditItemArchived: false,
      softArchivePreservedRows: false,
    }
  }

  const planId = planInsert.data.id
  const planCreatedAudit = await createAudit(
    client,
    'treatment_plan.created',
    'treatment_plan',
    planId,
    patientId,
    null,
    planInsert.data,
    { treatment_plan_id: planId },
  )
  const planCreatedLookup = await findAudit(
    'treatment_plan.created',
    'treatment_plan',
    planId,
  )

  const planUpdate = await client
    .from('treatment_plans')
    .update({
      title: `Fake treatment plan updated by ${roleUser.role}`,
      status: 'proposed',
      proposed_total: 27000,
    })
    .eq('id', planId)
    .select('id, title, description, status, proposed_total, deleted_at')
    .single()

  const planUpdatedAudit =
    planUpdate.error || !planUpdate.data
      ? {
          ok: false,
          error: planUpdate.error?.message ?? 'No updated plan returned.',
        }
      : await createAudit(
          client,
          'treatment_plan.updated',
          'treatment_plan',
          planId,
          patientId,
          planInsert.data,
          planUpdate.data,
          { treatment_plan_id: planId },
        )
  const planUpdatedLookup = await findAudit(
    'treatment_plan.updated',
    'treatment_plan',
    planId,
  )

  const itemInsert = await client
    .from('treatment_plan_items')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      treatment_plan_id: planId,
      tooth_number: '16',
      title: `Fake treatment item created by ${roleUser.role}`,
      description: 'Fake treatment plan item used by the local RLS test.',
      service_code: 'TP-DEMO',
      status: 'planned',
      estimated_price: 8000,
      sort_order: 0,
    })
    .select(
      'id, treatment_plan_id, tooth_number, title, status, estimated_price, deleted_at',
    )
    .single()

  const itemId = itemInsert.data?.id
  const itemCreatedAudit =
    itemInsert.error || !itemInsert.data
      ? {
          ok: false,
          error: itemInsert.error?.message ?? 'No inserted item returned.',
        }
      : await createAudit(
          client,
          'treatment_plan_item.created',
          'treatment_plan_item',
          itemInsert.data.id,
          patientId,
          null,
          itemInsert.data,
          {
            treatment_plan_id: planId,
            treatment_plan_item_id: itemInsert.data.id,
            tooth_number: '16',
          },
        )
  const itemCreatedLookup = itemId
    ? await findAudit(
        'treatment_plan_item.created',
        'treatment_plan_item',
        itemId,
      )
    : { ok: false, error: 'No item ID returned.', found: false }

  const itemUpdate = itemId
    ? await client
        .from('treatment_plan_items')
        .update({
          status: 'accepted',
          estimated_price: 9000,
        })
        .eq('id', itemId)
        .select(
          'id, treatment_plan_id, tooth_number, title, status, estimated_price, deleted_at',
        )
        .single()
    : { error: { message: 'No item ID returned.' }, data: null }

  const itemUpdatedAudit =
    itemUpdate.error || !itemUpdate.data || !itemId
      ? {
          ok: false,
          error: itemUpdate.error?.message ?? 'No updated item returned.',
        }
      : await createAudit(
          client,
          'treatment_plan_item.updated',
          'treatment_plan_item',
          itemId,
          patientId,
          itemInsert.data,
          itemUpdate.data,
          {
            treatment_plan_id: planId,
            treatment_plan_item_id: itemId,
            tooth_number: '16',
          },
        )
  const itemUpdatedLookup = itemId
    ? await findAudit(
        'treatment_plan_item.updated',
        'treatment_plan_item',
        itemId,
      )
    : { ok: false, error: 'No item ID returned.', found: false }

  const archiveTimestamp = new Date().toISOString()
  const itemArchive = itemId
    ? await client
        .from('treatment_plan_items')
        .update({
          status: 'archived',
          deleted_at: archiveTimestamp,
        })
        .eq('id', itemId)
        .select(
          'id, treatment_plan_id, tooth_number, title, status, estimated_price, deleted_at',
        )
        .single()
    : { error: { message: 'No item ID returned.' }, data: null }

  const itemArchivedAudit =
    itemArchive.error || !itemArchive.data || !itemId
      ? {
          ok: false,
          error: itemArchive.error?.message ?? 'No archived item returned.',
        }
      : await createAudit(
          client,
          'treatment_plan_item.archived',
          'treatment_plan_item',
          itemId,
          patientId,
          itemUpdate.data,
          itemArchive.data,
          {
            treatment_plan_id: planId,
            treatment_plan_item_id: itemId,
            tooth_number: '16',
          },
        )
  const itemArchivedLookup = itemId
    ? await findAudit(
        'treatment_plan_item.archived',
        'treatment_plan_item',
        itemId,
      )
    : { ok: false, error: 'No item ID returned.', found: false }

  const planArchive = await client
    .from('treatment_plans')
    .update({
      status: 'archived',
      deleted_at: archiveTimestamp,
    })
    .eq('id', planId)
    .select('id, title, description, status, proposed_total, deleted_at')
    .single()

  const planArchivedAudit =
    planArchive.error || !planArchive.data
      ? {
          ok: false,
          error: planArchive.error?.message ?? 'No archived plan returned.',
        }
      : await createAudit(
          client,
          'treatment_plan.archived',
          'treatment_plan',
          planId,
          patientId,
          planUpdate.data,
          planArchive.data,
          { treatment_plan_id: planId },
        )
  const planArchivedLookup = await findAudit(
    'treatment_plan.archived',
    'treatment_plan',
    planId,
  )

  const hardDeleteItem = itemId
    ? await client.from('treatment_plan_items').delete().eq('id', itemId)
    : { error: { message: 'No item ID returned.' } }
  const hardDeletePlan = await client
    .from('treatment_plans')
    .delete()
    .eq('id', planId)

  const serviceClient = getServiceClient()
  const { data: preservedPlan } = await serviceClient
    .from('treatment_plans')
    .select('id, deleted_at')
    .eq('id', planId)
    .maybeSingle()
  const { data: preservedItem } = itemId
    ? await serviceClient
        .from('treatment_plan_items')
        .select('id, deleted_at')
        .eq('id', itemId)
        .maybeSingle()
    : { data: null }

  return {
    planCreateAllowed: true,
    planCreateError: null,
    planUpdateAllowed: !planUpdate.error,
    planUpdateError: planUpdate.error?.message ?? null,
    planArchiveAllowed: !planArchive.error,
    planArchiveError: planArchive.error?.message ?? null,
    itemCreateAllowed: !itemInsert.error,
    itemCreateError: itemInsert.error?.message ?? null,
    itemUpdateAllowed: !itemUpdate.error,
    itemUpdateError: itemUpdate.error?.message ?? null,
    itemArchiveAllowed: !itemArchive.error,
    itemArchiveError: itemArchive.error?.message ?? null,
    hardDeleteAllowed:
      (!hardDeletePlan.error && !preservedPlan) ||
      (!hardDeleteItem.error && !preservedItem),
    hardDeleteError: hardDeletePlan.error?.message ?? hardDeleteItem.error?.message ?? null,
    auditPlanCreated: planCreatedAudit.ok && planCreatedLookup.found,
    auditPlanCreatedError: planCreatedAudit.error ?? planCreatedLookup.error,
    auditPlanUpdated: planUpdatedAudit.ok && planUpdatedLookup.found,
    auditPlanUpdatedError: planUpdatedAudit.error ?? planUpdatedLookup.error,
    auditPlanArchived: planArchivedAudit.ok && planArchivedLookup.found,
    auditPlanArchivedError: planArchivedAudit.error ?? planArchivedLookup.error,
    auditItemCreated: itemCreatedAudit.ok && itemCreatedLookup.found,
    auditItemCreatedError: itemCreatedAudit.error ?? itemCreatedLookup.error,
    auditItemUpdated: itemUpdatedAudit.ok && itemUpdatedLookup.found,
    auditItemUpdatedError: itemUpdatedAudit.error ?? itemUpdatedLookup.error,
    auditItemArchived: itemArchivedAudit.ok && itemArchivedLookup.found,
    auditItemArchivedError: itemArchivedAudit.error ?? itemArchivedLookup.error,
    softArchivePreservedRows:
      Boolean(preservedPlan?.deleted_at) && Boolean(preservedItem?.deleted_at),
  }
}

async function testDeniedWriteRole(roleUser, client, patientId) {
  const planId = await createServicePlan(patientId, roleUser.role)
  const itemId = await createServiceItem(patientId, planId, roleUser.role)

  const planInsert = await client
    .from('treatment_plans')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      title: `Denied fake plan attempted by ${roleUser.role}`,
      status: 'draft',
    })
    .select('id')
    .single()

  const planUpdate = await client
    .from('treatment_plans')
    .update({
      title: `Denied fake plan update attempted by ${roleUser.role}`,
    })
    .eq('id', planId)
    .select('id')
    .single()

  const itemInsert = await client
    .from('treatment_plan_items')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      treatment_plan_id: planId,
      title: `Denied fake item attempted by ${roleUser.role}`,
      status: 'planned',
    })
    .select('id')
    .single()

  const itemUpdate = await client
    .from('treatment_plan_items')
    .update({
      title: `Denied fake item update attempted by ${roleUser.role}`,
    })
    .eq('id', itemId)
    .select('id')
    .single()

  const hardDeleteItem = await client
    .from('treatment_plan_items')
    .delete()
    .eq('id', itemId)
  const hardDeletePlan = await client.from('treatment_plans').delete().eq('id', planId)

  const serviceClient = getServiceClient()
  const { data: preservedPlan } = await serviceClient
    .from('treatment_plans')
    .select('id')
    .eq('id', planId)
    .maybeSingle()
  const { data: preservedItem } = await serviceClient
    .from('treatment_plan_items')
    .select('id')
    .eq('id', itemId)
    .maybeSingle()

  return {
    planCreateAllowed: !planInsert.error,
    planCreateError: planInsert.error?.message ?? null,
    planUpdateAllowed: !planUpdate.error,
    planUpdateError: planUpdate.error?.message ?? null,
    itemCreateAllowed: !itemInsert.error,
    itemCreateError: itemInsert.error?.message ?? null,
    itemUpdateAllowed: !itemUpdate.error,
    itemUpdateError: itemUpdate.error?.message ?? null,
    hardDeleteAllowed:
      (!hardDeletePlan.error && !preservedPlan) ||
      (!hardDeleteItem.error && !preservedItem),
    hardDeleteError: hardDeletePlan.error?.message ?? hardDeleteItem.error?.message ?? null,
  }
}

async function testRole(roleUser) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)
  const patientId = await createTestPatient(roleUser.role)
  const readPlanId = await createServicePlan(patientId, `${roleUser.role}-read`)
  await createServiceItem(patientId, readPlanId, `${roleUser.role}-read`)

  const planRead = await countRowsAs(client, 'treatment_plans', patientId)
  const itemRead = await countRowsAs(client, 'treatment_plan_items', patientId)
  const write = roleUser.canWrite
    ? await testWriteRole(roleUser, client, patientId)
    : await testDeniedWriteRole(roleUser, client, patientId)

  return {
    role: roleUser.role,
    planReadCount: planRead.count,
    planReadError: planRead.error,
    itemReadCount: itemRead.count,
    itemReadError: itemRead.error,
    ...write,
  }
}

async function main() {
  const results = []
  const failures = []

  for (const roleUser of ROLE_USERS) {
    const result = await testRole(roleUser)
    results.push(result)

    if (roleUser.canRead && result.planReadCount <= 0) {
      failures.push(`${roleUser.role}: treatment plan read was denied`)
    }

    if (roleUser.canRead && result.itemReadCount <= 0) {
      failures.push(`${roleUser.role}: treatment plan item read was denied`)
    }

    if (!roleUser.canRead && result.planReadCount > 0) {
      failures.push(`${roleUser.role}: treatment plan read unexpectedly allowed`)
    }

    if (!roleUser.canRead && result.itemReadCount > 0) {
      failures.push(
        `${roleUser.role}: treatment plan item read unexpectedly allowed`,
      )
    }

    if (roleUser.canWrite) {
      if (!result.planCreateAllowed) {
        failures.push(`${roleUser.role}: treatment plan create was denied`)
      }
      if (!result.planUpdateAllowed) {
        failures.push(`${roleUser.role}: treatment plan update was denied`)
      }
      if (!result.planArchiveAllowed) {
        failures.push(`${roleUser.role}: treatment plan archive was denied`)
      }
      if (!result.itemCreateAllowed) {
        failures.push(`${roleUser.role}: treatment plan item create was denied`)
      }
      if (!result.itemUpdateAllowed) {
        failures.push(`${roleUser.role}: treatment plan item update was denied`)
      }
      if (!result.itemArchiveAllowed) {
        failures.push(`${roleUser.role}: treatment plan item archive was denied`)
      }
      if (!result.auditPlanCreated) {
        failures.push(`${roleUser.role}: treatment_plan.created audit missing`)
      }
      if (!result.auditPlanUpdated) {
        failures.push(`${roleUser.role}: treatment_plan.updated audit missing`)
      }
      if (!result.auditPlanArchived) {
        failures.push(`${roleUser.role}: treatment_plan.archived audit missing`)
      }
      if (!result.auditItemCreated) {
        failures.push(`${roleUser.role}: treatment_plan_item.created audit missing`)
      }
      if (!result.auditItemUpdated) {
        failures.push(`${roleUser.role}: treatment_plan_item.updated audit missing`)
      }
      if (!result.auditItemArchived) {
        failures.push(`${roleUser.role}: treatment_plan_item.archived audit missing`)
      }
      if (!result.softArchivePreservedRows) {
        failures.push(`${roleUser.role}: soft archive did not preserve rows`)
      }
      if (result.hardDeleteAllowed) {
        failures.push(`${roleUser.role}: hard delete unexpectedly allowed`)
      }
    } else {
      if (result.planCreateAllowed) {
        failures.push(`${roleUser.role}: treatment plan create unexpectedly allowed`)
      }
      if (result.planUpdateAllowed) {
        failures.push(`${roleUser.role}: treatment plan update unexpectedly allowed`)
      }
      if (result.itemCreateAllowed) {
        failures.push(
          `${roleUser.role}: treatment plan item create unexpectedly allowed`,
        )
      }
      if (result.itemUpdateAllowed) {
        failures.push(
          `${roleUser.role}: treatment plan item update unexpectedly allowed`,
        )
      }
      if (result.hardDeleteAllowed) {
        failures.push(`${roleUser.role}: hard delete unexpectedly allowed`)
      }
    }
  }

  const ownerAuditCount = await countAuditLogsAs('owner.demo@example.test')
  const doctorAuditCount = await countAuditLogsAs('doctor.demo@example.test')

  if (ownerAuditCount <= 0) {
    failures.push('owner_admin cannot read expected treatment plan audit logs')
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
