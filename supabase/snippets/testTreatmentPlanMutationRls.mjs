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
    'Missing VITE_SUPABASE_URL/SUPABASE_URL, VITE_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY.',
  )
  process.exit(1)
}

const DEMO_CLINIC_ID = '11111111-1111-1111-1111-111111111111'

const ROLE_USERS = [
  {
    role: 'doctor',
    email: 'doctor.demo@example.test',
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

async function insertRow(table, values, select = 'id') {
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
  const outClinicId = randomUUID()

  const demoPatient = await insertRow('patients', {
    clinic_id: DEMO_CLINIC_ID,
    first_name: 'Treatment',
    last_name: `Mutation-${runId.slice(0, 8)}`,
    phone: '+381 60 730 0000',
    email: `treatment.mutation.${runId}@example.test`,
    status: 'active',
    important_note: 'Demo treatment plan mutation RLS fixture.',
  })

  await insertRow('clinics', {
    id: outClinicId,
    name: `Treatment Mutation RLS Clinic ${runId.slice(0, 8)}`,
    status: 'active',
  })

  const outPatient = await insertRow('patients', {
    clinic_id: outClinicId,
    first_name: 'External',
    last_name: `Mutation-${runId.slice(0, 8)}`,
    phone: '+381 60 730 0001',
    email: `external.treatment.mutation.${runId}@example.test`,
    status: 'active',
    important_note: 'Out-of-clinic treatment plan mutation RLS fixture.',
  })

  const readablePlan = await insertRow('treatment_plans', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: demoPatient.id,
    title: 'Readable mutation RLS treatment plan',
    description: 'Service-created read fixture.',
    status: 'draft',
  })

  return {
    runId,
    outClinicId,
    demoPatientId: demoPatient.id,
    outPatientId: outPatient.id,
    readablePlanId: readablePlan.id,
    createdPlanIds: [readablePlan.id],
    createdItemIds: [],
  }
}

async function cleanupFixture(fixture) {
  const serviceClient = getServiceClient()

  if (fixture.createdItemIds.length > 0) {
    await serviceClient
      .from('treatment_plan_items')
      .delete()
      .in('id', fixture.createdItemIds)
  }

  if (fixture.createdPlanIds.length > 0) {
    await serviceClient
      .from('treatment_plans')
      .delete()
      .in('id', fixture.createdPlanIds)
  }

  await serviceClient
    .from('patients')
    .delete()
    .in('id', [fixture.demoPatientId, fixture.outPatientId])
  await serviceClient.from('clinics').delete().eq('id', fixture.outClinicId)
}

async function createPlanAs(client, fixture, title) {
  const { data, error } = await client
    .from('treatment_plans')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: fixture.demoPatientId,
      title,
      description: 'Authenticated clinical writer mutation fixture.',
      status: 'draft',
      proposed_total: null,
    })
    .select('id, title, patient_id, clinic_id, deleted_at')
    .single()

  if (data?.id) {
    fixture.createdPlanIds.push(data.id)
  }

  return { data, error }
}

async function createItemAs(client, fixture, planId, title) {
  const { data, error } = await client
    .from('treatment_plan_items')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: fixture.demoPatientId,
      treatment_plan_id: planId,
      tooth_number: '16',
      title,
      description: 'Authenticated clinical writer item fixture.',
      status: 'planned',
      sort_order: 0,
    })
    .select('id, treatment_plan_id, patient_id, clinic_id, deleted_at')
    .single()

  if (data?.id) {
    fixture.createdItemIds.push(data.id)
  }

  return { data, error }
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

async function testAllowedClinicalMutation(client, fixture) {
  const planInsert = await createPlanAs(
    client,
    fixture,
    'Doctor-created treatment plan',
  )
  const planId = planInsert.data?.id

  const planUpdate = planId
    ? await client
        .from('treatment_plans')
        .update({
          title: 'Doctor-updated treatment plan',
          status: 'accepted',
        })
        .eq('id', planId)
        .select('id, title, status')
        .single()
    : { data: null, error: { message: 'Plan insert failed.' } }

  const itemInsert = planId
    ? await createItemAs(
        client,
        fixture,
        planId,
        'Doctor-created treatment plan item',
      )
    : { data: null, error: { message: 'Plan insert failed.' } }
  const itemId = itemInsert.data?.id

  const itemUpdate = itemId
    ? await client
        .from('treatment_plan_items')
        .update({
          title: 'Doctor-updated treatment plan item',
          status: 'in_progress',
        })
        .eq('id', itemId)
        .select('id, title, status')
        .single()
    : { data: null, error: { message: 'Item insert failed.' } }

  const archivedAt = new Date().toISOString()
  const itemArchive = itemId
    ? await client
        .from('treatment_plan_items')
        .update({
          status: 'archived',
          deleted_at: archivedAt,
        })
        .eq('id', itemId)
        .select('id, status, deleted_at')
        .single()
    : { data: null, error: { message: 'Item insert failed.' } }

  const planArchive = planId
    ? await client
        .from('treatment_plans')
        .update({
          status: 'archived',
          deleted_at: archivedAt,
        })
        .eq('id', planId)
        .select('id, status, deleted_at')
        .single()
    : { data: null, error: { message: 'Plan insert failed.' } }

  const archivedPlanUpdate = planId
    ? await client
        .from('treatment_plans')
        .update({
          title: 'Should not update archived plan',
        })
        .eq('id', planId)
        .select('id')
        .single()
    : { data: null, error: { message: 'Plan insert failed.' } }

  const archivedPlanItemInsert = planId
    ? await createItemAs(
        client,
        fixture,
        planId,
        'Should not create item under archived plan',
      )
    : { data: null, error: { message: 'Plan insert failed.' } }

  return {
    planCreateAllowed: !planInsert.error,
    planCreateError: planInsert.error?.message ?? null,
    planUpdateAllowed: !planUpdate.error,
    planUpdateError: planUpdate.error?.message ?? null,
    itemCreateAllowed: !itemInsert.error,
    itemCreateError: itemInsert.error?.message ?? null,
    itemUpdateAllowed: !itemUpdate.error,
    itemUpdateError: itemUpdate.error?.message ?? null,
    itemArchiveAllowed: !itemArchive.error,
    itemArchiveError: itemArchive.error?.message ?? null,
    planArchiveAllowed: !planArchive.error,
    planArchiveError: planArchive.error?.message ?? null,
    archivedPlanUpdateBlocked: Boolean(archivedPlanUpdate.error),
    archivedPlanUpdateError: archivedPlanUpdate.error?.message ?? null,
    archivedPlanItemCreateBlocked: Boolean(archivedPlanItemInsert.error),
    archivedPlanItemCreateError: archivedPlanItemInsert.error?.message ?? null,
  }
}

async function testDeniedRole(roleUser, client, fixture) {
  const planInsert = await createPlanAs(
    client,
    fixture,
    `Denied treatment plan attempted by ${roleUser.role}`,
  )
  const planUpdate = await client
    .from('treatment_plans')
    .update({ title: `Denied update by ${roleUser.role}` })
    .eq('id', fixture.readablePlanId)
    .select('id')
    .single()
  const itemInsert = await createItemAs(
    client,
    fixture,
    fixture.readablePlanId,
    `Denied item attempted by ${roleUser.role}`,
  )
  const readPlan = await countRowsAs(client, 'treatment_plans', {
    id: fixture.readablePlanId,
  })

  return {
    role: roleUser.role,
    readCount: readPlan.count,
    readError: readPlan.error,
    planCreateBlocked: Boolean(planInsert.error),
    planCreateError: planInsert.error?.message ?? null,
    planUpdateBlocked: Boolean(planUpdate.error),
    planUpdateError: planUpdate.error?.message ?? null,
    itemCreateBlocked: Boolean(itemInsert.error),
    itemCreateError: itemInsert.error?.message ?? null,
  }
}

async function testCrossClinicIntegrity(client, fixture) {
  const crossPatientInsert = await client
    .from('treatment_plans')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: fixture.outPatientId,
      title: 'Cross-clinic patient treatment plan should fail',
      status: 'draft',
    })
    .select('id')
    .single()

  const crossClinicInsert = await client
    .from('treatment_plans')
    .insert({
      clinic_id: fixture.outClinicId,
      patient_id: fixture.outPatientId,
      title: 'Cross-clinic treatment plan should fail',
      status: 'draft',
    })
    .select('id')
    .single()

  const mutablePlan = await createPlanAs(
    client,
    fixture,
    'Mutable integrity treatment plan',
  )
  const mutablePlanId = mutablePlan.data?.id

  const patientReassign = mutablePlanId
    ? await client
        .from('treatment_plans')
        .update({ patient_id: fixture.outPatientId })
        .eq('id', mutablePlanId)
        .select('id')
        .single()
    : { data: null, error: { message: 'Plan insert failed.' } }

  const clinicReassign = mutablePlanId
    ? await client
        .from('treatment_plans')
        .update({ clinic_id: fixture.outClinicId })
        .eq('id', mutablePlanId)
        .select('id')
        .single()
    : { data: null, error: { message: 'Plan insert failed.' } }

  const item = mutablePlanId
    ? await createItemAs(client, fixture, mutablePlanId, 'Mutable integrity item')
    : { data: null, error: { message: 'Plan insert failed.' } }
  const itemId = item.data?.id

  const mismatchedItemInsert = mutablePlanId
    ? await client
        .from('treatment_plan_items')
        .insert({
          clinic_id: DEMO_CLINIC_ID,
          patient_id: fixture.outPatientId,
          treatment_plan_id: mutablePlanId,
          title: 'Mismatched patient item should fail',
          status: 'planned',
        })
        .select('id')
        .single()
    : { data: null, error: { message: 'Plan insert failed.' } }

  const itemPatientReassign = itemId
    ? await client
        .from('treatment_plan_items')
        .update({ patient_id: fixture.outPatientId })
        .eq('id', itemId)
        .select('id')
        .single()
    : { data: null, error: { message: 'Item insert failed.' } }

  return {
    crossPatientCreateBlocked: Boolean(crossPatientInsert.error),
    crossPatientCreateError: crossPatientInsert.error?.message ?? null,
    crossClinicCreateBlocked: Boolean(crossClinicInsert.error),
    crossClinicCreateError: crossClinicInsert.error?.message ?? null,
    patientReassignBlocked: Boolean(patientReassign.error),
    patientReassignError: patientReassign.error?.message ?? null,
    clinicReassignBlocked: Boolean(clinicReassign.error),
    clinicReassignError: clinicReassign.error?.message ?? null,
    mismatchedItemInsertBlocked: Boolean(mismatchedItemInsert.error),
    mismatchedItemInsertError: mismatchedItemInsert.error?.message ?? null,
    itemPatientReassignBlocked: Boolean(itemPatientReassign.error),
    itemPatientReassignError: itemPatientReassign.error?.message ?? null,
  }
}

async function main() {
  const fixture = await prepareFixture()
  const results = {}
  const failures = []

  try {
    for (const roleUser of ROLE_USERS) {
      const session = await signIn(roleUser.email)
      const client = getAuthedClient(session.access_token)

      if (roleUser.canWrite) {
        results[roleUser.role] = {
          ...(await testAllowedClinicalMutation(client, fixture)),
          ...(await testCrossClinicIntegrity(client, fixture)),
        }
      } else {
        results[roleUser.role] = await testDeniedRole(roleUser, client, fixture)
      }
    }

    const doctor = results.doctor

    for (const [key, value] of Object.entries({
      planCreateAllowed: doctor.planCreateAllowed,
      planUpdateAllowed: doctor.planUpdateAllowed,
      itemCreateAllowed: doctor.itemCreateAllowed,
      itemUpdateAllowed: doctor.itemUpdateAllowed,
      itemArchiveAllowed: doctor.itemArchiveAllowed,
      planArchiveAllowed: doctor.planArchiveAllowed,
      archivedPlanUpdateBlocked: doctor.archivedPlanUpdateBlocked,
      archivedPlanItemCreateBlocked: doctor.archivedPlanItemCreateBlocked,
      crossPatientCreateBlocked: doctor.crossPatientCreateBlocked,
      crossClinicCreateBlocked: doctor.crossClinicCreateBlocked,
      patientReassignBlocked: doctor.patientReassignBlocked,
      clinicReassignBlocked: doctor.clinicReassignBlocked,
      mismatchedItemInsertBlocked: doctor.mismatchedItemInsertBlocked,
      itemPatientReassignBlocked: doctor.itemPatientReassignBlocked,
    })) {
      if (!value) {
        failures.push(`doctor: expected ${key} to be true`)
      }
    }

    for (const roleUser of ROLE_USERS.filter((roleUser) => !roleUser.canWrite)) {
      const result = results[roleUser.role]

      if (roleUser.canRead && result.readCount !== 1) {
        failures.push(`${roleUser.role}: expected read access to same-clinic plan`)
      }

      if (!roleUser.canRead && result.readCount !== 0) {
        failures.push(`${roleUser.role}: same-clinic plan read unexpectedly allowed`)
      }

      if (!result.planCreateBlocked) {
        failures.push(`${roleUser.role}: plan create unexpectedly allowed`)
      }

      if (!result.planUpdateBlocked) {
        failures.push(`${roleUser.role}: plan update unexpectedly allowed`)
      }

      if (!result.itemCreateBlocked) {
        failures.push(`${roleUser.role}: item create unexpectedly allowed`)
      }
    }

    console.log(
      JSON.stringify(
        {
          fixture: {
            runId: fixture.runId,
          },
          results,
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
  } finally {
    await cleanupFixture(fixture)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
