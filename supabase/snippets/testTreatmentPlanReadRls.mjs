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

const ROLE_USERS = [
  {
    role: 'owner_admin',
    email: 'owner.demo@example.test',
    canReadTreatmentPlans: true,
  },
  {
    role: 'doctor',
    email: 'doctor.demo@example.test',
    canReadTreatmentPlans: true,
  },
  {
    role: 'assistant',
    email: 'assistant.demo@example.test',
    canReadTreatmentPlans: true,
  },
  {
    role: 'reception_admin',
    email: 'reception.demo@example.test',
    canReadTreatmentPlans: true,
  },
  {
    role: 'inventory_responsible',
    email: 'inventory.demo@example.test',
    canReadTreatmentPlans: false,
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
    last_name: `Read-${runId.slice(0, 8)}`,
    phone: '+381 60 700 0000',
    email: `treatment.read.${runId}@example.test`,
    status: 'active',
    important_note: 'Demo treatment plan read RLS fixture.',
  })

  await insertRow('clinics', {
    id: outClinicId,
    name: `Treatment Plan Read RLS Clinic ${runId.slice(0, 8)}`,
    status: 'active',
  })

  const outPatient = await insertRow('patients', {
    clinic_id: outClinicId,
    first_name: 'External',
    last_name: `Treatment-${runId.slice(0, 8)}`,
    phone: '+381 60 700 0001',
    email: `external.treatment.${runId}@example.test`,
    status: 'active',
    important_note: 'Out-of-clinic treatment plan read RLS fixture.',
  })

  const demoPlan = await insertRow('treatment_plans', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: demoPatient.id,
    title: 'Read RLS demo treatment plan',
    description: 'Service-created fixture for treatment plan read RLS checks.',
    status: 'proposed',
    proposed_total: 12000,
  })

  const demoItem = await insertRow('treatment_plan_items', {
    clinic_id: DEMO_CLINIC_ID,
    patient_id: demoPatient.id,
    treatment_plan_id: demoPlan.id,
    tooth_number: '16',
    title: 'Read RLS demo treatment plan item',
    description: 'Service-created item fixture for read RLS checks.',
    service_code: 'READ-RLS',
    status: 'planned',
    estimated_price: 6000,
    sort_order: 0,
  })

  const outPlan = await insertRow('treatment_plans', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    title: 'Out-of-clinic treatment plan',
    description: 'Out-of-clinic fixture for treatment plan read RLS checks.',
    status: 'proposed',
    proposed_total: 22000,
  })

  const outItem = await insertRow('treatment_plan_items', {
    clinic_id: outClinicId,
    patient_id: outPatient.id,
    treatment_plan_id: outPlan.id,
    tooth_number: '26',
    title: 'Out-of-clinic treatment plan item',
    description: 'Out-of-clinic item fixture for read RLS checks.',
    service_code: 'OUT-RLS',
    status: 'planned',
    estimated_price: 11000,
    sort_order: 0,
  })

  const serviceClient = getServiceClient()
  const { data: mismatchedItem, error: mismatchedItemError } =
    await serviceClient
      .from('treatment_plan_items')
      .insert({
        clinic_id: DEMO_CLINIC_ID,
        patient_id: demoPatient.id,
        treatment_plan_id: outPlan.id,
        tooth_number: '36',
        title: 'Mismatched parent treatment plan item',
        description:
          'Service-created mismatch fixture that must be hidden or blocked by item RLS.',
        service_code: 'MISMATCH-RLS',
        status: 'planned',
        estimated_price: 1,
        sort_order: 1,
      })
      .select('id')
      .single()

  return {
    runId,
    outClinicId,
    demoPatientId: demoPatient.id,
    outPatientId: outPatient.id,
    demoPlanId: demoPlan.id,
    demoItemId: demoItem.id,
    outPlanId: outPlan.id,
    outItemId: outItem.id,
    mismatchedItemId: mismatchedItem?.id ?? null,
    mismatchedItemInsertBlocked: Boolean(mismatchedItemError),
    mismatchedItemInsertError: mismatchedItemError?.message ?? null,
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

async function testRole(roleUser, fixture) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)

  const demoPlanRead = await countRowsAs(client, 'treatment_plans', {
    patient_id: fixture.demoPatientId,
  })
  const demoItemRead = await countRowsAs(client, 'treatment_plan_items', {
    patient_id: fixture.demoPatientId,
  })
  const mismatchedItemRead = fixture.mismatchedItemId
    ? await countRowsAs(client, 'treatment_plan_items', {
        id: fixture.mismatchedItemId,
      })
    : { count: 0, error: null }
  const outPlanRead = await countRowsAs(client, 'treatment_plans', {
    patient_id: fixture.outPatientId,
  })
  const outItemRead = await countRowsAs(client, 'treatment_plan_items', {
    patient_id: fixture.outPatientId,
  })

  return {
    role: roleUser.role,
    demoPlanReadCount: demoPlanRead.count,
    demoPlanReadError: demoPlanRead.error,
    demoItemReadCount: demoItemRead.count,
    demoItemReadError: demoItemRead.error,
    mismatchedItemReadCount: mismatchedItemRead.count,
    mismatchedItemReadError: mismatchedItemRead.error,
    outPlanReadCount: outPlanRead.count,
    outPlanReadError: outPlanRead.error,
    outItemReadCount: outItemRead.count,
    outItemReadError: outItemRead.error,
  }
}

async function cleanupFixture(fixture) {
  const serviceClient = getServiceClient()

  await serviceClient
    .from('treatment_plan_items')
    .delete()
    .in('id', [
      fixture.demoItemId,
      fixture.outItemId,
      ...(fixture.mismatchedItemId ? [fixture.mismatchedItemId] : []),
    ])
  await serviceClient
    .from('treatment_plans')
    .delete()
    .in('id', [fixture.demoPlanId, fixture.outPlanId])
  await serviceClient
    .from('patients')
    .delete()
    .in('id', [fixture.demoPatientId, fixture.outPatientId])
  await serviceClient.from('clinics').delete().eq('id', fixture.outClinicId)
}

async function main() {
  const fixture = await prepareFixture()
  const results = []
  const failures = []

  try {
    for (const roleUser of ROLE_USERS) {
      const result = await testRole(roleUser, fixture)
      results.push(result)

      if (roleUser.canReadTreatmentPlans) {
        if (result.demoPlanReadCount !== 1) {
          failures.push(`${roleUser.role}: expected one in-clinic plan`)
        }

        if (result.demoItemReadCount !== 1) {
          failures.push(
            `${roleUser.role}: expected exactly one in-clinic item tied to the readable plan`,
          )
        }
      } else {
        if (result.demoPlanReadCount !== 0) {
          failures.push(`${roleUser.role}: in-clinic plan read unexpectedly allowed`)
        }

        if (result.demoItemReadCount !== 0) {
          failures.push(`${roleUser.role}: in-clinic item read unexpectedly allowed`)
        }
      }

      if (
        !fixture.mismatchedItemInsertBlocked &&
        result.mismatchedItemReadCount !== 0
      ) {
        failures.push(
          `${roleUser.role}: mismatched treatment plan item was readable`,
        )
      }

      if (result.outPlanReadCount !== 0) {
        failures.push(`${roleUser.role}: out-of-clinic plan was readable`)
      }

      if (result.outItemReadCount !== 0) {
        failures.push(`${roleUser.role}: out-of-clinic item was readable`)
      }
    }

    if (!fixture.mismatchedItemInsertBlocked && !fixture.mismatchedItemId) {
      failures.push(
        'mismatched treatment plan item was neither blocked nor created for read assertion',
      )
    }

    console.log(
      JSON.stringify(
        {
          fixture: {
            runId: fixture.runId,
            mismatchedItemInsertBlocked:
              fixture.mismatchedItemInsertBlocked,
            mismatchedItemInsertError: fixture.mismatchedItemInsertError,
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
