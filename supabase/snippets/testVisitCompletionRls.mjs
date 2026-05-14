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
const DEMO_PATIENT_ID = '22222222-2222-2222-2222-222222222201'

const ROLE_USERS = [
  {
    role: 'owner_admin',
    email: 'owner.demo@example.test',
    canReadVisit: true,
    canWriteVisit: true,
    canWriteClinicalNote: true,
  },
  {
    role: 'doctor',
    email: 'doctor.demo@example.test',
    canReadVisit: true,
    canWriteVisit: true,
    canWriteClinicalNote: true,
  },
  {
    role: 'specialist',
    email: 'specialist.demo@example.test',
    canReadVisit: true,
    canWriteVisit: true,
    canWriteClinicalNote: true,
  },
  {
    role: 'assistant',
    email: 'assistant.demo@example.test',
    canReadVisit: true,
    canWriteVisit: true,
    canWriteClinicalNote: false,
  },
  {
    role: 'reception_admin',
    email: 'reception.demo@example.test',
    canReadVisit: false,
    canWriteVisit: false,
    canWriteClinicalNote: false,
  },
  {
    role: 'inventory_responsible',
    email: 'inventory.demo@example.test',
    canReadVisit: false,
    canWriteVisit: false,
    canWriteClinicalNote: false,
  },
]

function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
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

async function getProfile(role) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('profiles')
    .select('id')
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

async function createServiceVisit(role) {
  const serviceClient = getServiceClient()
  const { id: profileId } = await getProfile('owner_admin')
  const { data, error } = await serviceClient
    .from('visits')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      status: 'draft',
      recommendation: `Service-created visit fixture for ${role}.`,
      next_step: 'follow_up_recommended',
      created_by: profileId,
      updated_by: profileId,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create service visit fixture.')
  }

  return data.id
}

async function verifySchemaObjects() {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient.rpc('exec_sql', {
    query: `
      select
        to_regclass('public.visits') is not null as visits_exists,
        to_regclass('public.visit_procedures') is not null as visit_procedures_exists,
        exists (
          select 1
          from pg_constraint
          where conname = 'clinical_notes_visit_id_fkey'
        ) as clinical_notes_visit_fk_exists,
        exists (
          select 1
          from pg_trigger
          where tgname = 'update_visits_updated_at'
            and not tgisinternal
        ) as visits_updated_at_trigger_exists,
        exists (
          select 1
          from pg_trigger
          where tgname = 'update_visit_procedures_updated_at'
            and not tgisinternal
        ) as visit_procedures_updated_at_trigger_exists,
        exists (
          select 1
          from pg_policies
          where schemaname = 'public'
            and tablename = 'visits'
            and policyname = 'Clinical workflow roles can create clinic visits'
        ) as visits_insert_policy_exists,
        exists (
          select 1
          from pg_policies
          where schemaname = 'public'
            and tablename = 'visit_procedures'
            and policyname = 'Clinical workflow roles can create clinic visit procedures'
        ) as visit_procedures_insert_policy_exists
    `,
  })

  if (error) {
    return {
      ok: false,
      error: error.message,
      details: null,
    }
  }

  const details = data?.[0] ?? null
  const ok = Boolean(
    details?.visits_exists &&
      details?.visit_procedures_exists &&
      details?.clinical_notes_visit_fk_exists &&
      details?.visits_updated_at_trigger_exists &&
      details?.visit_procedures_updated_at_trigger_exists &&
      details?.visits_insert_policy_exists &&
      details?.visit_procedures_insert_policy_exists,
  )

  return {
    ok,
    error: ok ? null : 'One or more expected schema objects are missing.',
    details,
  }
}

async function verifySchemaObjectsWithoutRpc() {
  const serviceClient = getServiceClient()
  const checks = {}

  const visits = await serviceClient.from('visits').select('id').limit(1)
  checks.visits_exists = !visits.error

  const visitProcedures = await serviceClient
    .from('visit_procedures')
    .select('id')
    .limit(1)
  checks.visit_procedures_exists = !visitProcedures.error

  return {
    ok: checks.visits_exists && checks.visit_procedures_exists,
    error:
      checks.visits_exists && checks.visit_procedures_exists
        ? null
        : 'Table existence check failed.',
    details: checks,
  }
}

async function testClinicalWorkflowRole(roleUser) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)
  const { id: profileId } = await getProfile(roleUser.role)
  const serviceVisitId = await createServiceVisit(roleUser.role)

  const visitRead = await client
    .from('visits')
    .select('id')
    .eq('id', serviceVisitId)
    .maybeSingle()

  const visitInsert = await client
    .from('visits')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      status: 'draft',
      recommendation: `Visit RLS smoke test by ${roleUser.role}.`,
      next_step: 'continue_treatment_plan',
      created_by: profileId,
      updated_by: profileId,
    })
    .select('id, status, updated_at')
    .single()

  const visitId = visitInsert.data?.id ?? serviceVisitId

  const visitUpdate = await client
    .from('visits')
    .update({
      status: 'in_progress',
      recommendation: `Updated visit RLS smoke test by ${roleUser.role}.`,
      updated_by: profileId,
    })
    .eq('id', visitId)
    .select('id, status, updated_at')
    .single()

  const procedureInsert = await client
    .from('visit_procedures')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      visit_id: visitId,
      procedure_name: `Demo procedure by ${roleUser.role}`,
      tooth_or_region: '16',
      quantity_or_duration: '1',
      note: 'Visit procedure RLS smoke test.',
      sort_order: 0,
      created_by: profileId,
      updated_by: profileId,
    })
    .select('id, updated_at')
    .single()

  const procedureId = procedureInsert.data?.id

  const procedureRead = await client
    .from('visit_procedures')
    .select('id')
    .eq('visit_id', visitId)
    .limit(1)

  const procedureUpdate = procedureId
    ? await client
        .from('visit_procedures')
        .update({
          note: `Updated procedure by ${roleUser.role}.`,
          updated_by: profileId,
        })
        .eq('id', procedureId)
        .select('id, updated_at')
        .single()
    : { error: { message: 'No procedure ID returned.' }, data: null }

  const clinicalNoteValidFk = await client
    .from('clinical_notes')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      visit_id: visitId,
      note_type: 'procedure',
      content: `Visit-linked clinical note by ${roleUser.role}.`,
      created_by: profileId,
      updated_by: profileId,
    })
    .select('id')
    .single()

  const clinicalNoteInvalidFk = await client.from('clinical_notes').insert({
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: '00000000-0000-0000-0000-000000000000',
    note_type: 'procedure',
    content: `Invalid FK clinical note by ${roleUser.role}.`,
    created_by: profileId,
    updated_by: profileId,
  })

  const visitHardDelete = await client.from('visits').delete().eq('id', visitId)
  const procedureHardDelete = procedureId
    ? await client.from('visit_procedures').delete().eq('id', procedureId)
    : { error: { message: 'No procedure ID returned.' } }

  const serviceClient = getServiceClient()
  const preservedVisit = await serviceClient
    .from('visits')
    .select('id')
    .eq('id', visitId)
    .maybeSingle()
  const preservedProcedure = procedureId
    ? await serviceClient
        .from('visit_procedures')
        .select('id')
        .eq('id', procedureId)
        .maybeSingle()
    : { data: null }

  return {
    role: roleUser.role,
    visitReadAllowed: !visitRead.error && Boolean(visitRead.data),
    visitReadError: visitRead.error?.message ?? null,
    visitCreateAllowed: !visitInsert.error,
    visitCreateError: visitInsert.error?.message ?? null,
    visitUpdateAllowed: !visitUpdate.error,
    visitUpdateError: visitUpdate.error?.message ?? null,
    visitUpdatedAtChanged:
      Boolean(visitInsert.data?.updated_at) &&
      Boolean(visitUpdate.data?.updated_at) &&
      visitInsert.data.updated_at !== visitUpdate.data.updated_at,
    procedureCreateAllowed: !procedureInsert.error,
    procedureCreateError: procedureInsert.error?.message ?? null,
    procedureReadAllowed:
      !procedureRead.error && (procedureRead.data?.length ?? 0) > 0,
    procedureReadError: procedureRead.error?.message ?? null,
    procedureUpdateAllowed: !procedureUpdate.error,
    procedureUpdateError: procedureUpdate.error?.message ?? null,
    procedureUpdatedAtChanged:
      Boolean(procedureInsert.data?.updated_at) &&
      Boolean(procedureUpdate.data?.updated_at) &&
      procedureInsert.data.updated_at !== procedureUpdate.data.updated_at,
    clinicalNoteValidFkAllowed: !clinicalNoteValidFk.error,
    clinicalNoteValidFkError: clinicalNoteValidFk.error?.message ?? null,
    clinicalNoteInvalidFkRejected: Boolean(clinicalNoteInvalidFk.error),
    clinicalNoteInvalidFkError: clinicalNoteInvalidFk.error?.message ?? null,
    hardDeleteAllowed:
      (!visitHardDelete.error && !preservedVisit.data) ||
      (!procedureHardDelete.error && !preservedProcedure.data),
    hardDeleteError:
      visitHardDelete.error?.message ??
      procedureHardDelete.error?.message ??
      null,
  }
}

async function testDeniedRole(roleUser) {
  const session = await signIn(roleUser.email)
  const client = getAuthedClient(session.access_token)
  const { id: ownerProfileId } = await getProfile('owner_admin')
  const serviceVisitId = await createServiceVisit(roleUser.role)

  const visitRead = await client
    .from('visits')
    .select('id')
    .eq('id', serviceVisitId)
    .maybeSingle()

  const visitInsert = await client
    .from('visits')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      status: 'draft',
      recommendation: `Denied visit by ${roleUser.role}.`,
    })
    .select('id')
    .single()

  const procedureInsert = await client
    .from('visit_procedures')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: DEMO_PATIENT_ID,
      visit_id: serviceVisitId,
      procedure_name: `Denied procedure by ${roleUser.role}`,
    })
    .select('id')
    .single()

  const clinicalNote = await client.from('clinical_notes').insert({
    clinic_id: DEMO_CLINIC_ID,
    patient_id: DEMO_PATIENT_ID,
    visit_id: serviceVisitId,
    note_type: 'procedure',
    content: `Denied clinical note by ${roleUser.role}.`,
    created_by: ownerProfileId,
    updated_by: ownerProfileId,
  })

  return {
    role: roleUser.role,
    visitReadAllowed: !visitRead.error && Boolean(visitRead.data),
    visitReadError: visitRead.error?.message ?? null,
    visitCreateAllowed: !visitInsert.error,
    visitCreateError: visitInsert.error?.message ?? null,
    procedureCreateAllowed: !procedureInsert.error,
    procedureCreateError: procedureInsert.error?.message ?? null,
    clinicalNoteCreateAllowed: !clinicalNote.error,
    clinicalNoteCreateError: clinicalNote.error?.message ?? null,
  }
}

async function main() {
  const failures = []
  const results = []
  const schemaRpcResult = await verifySchemaObjects()
  const schemaResult = schemaRpcResult.ok
    ? schemaRpcResult
    : await verifySchemaObjectsWithoutRpc()

  if (!schemaResult.ok) {
    failures.push(`schema: ${schemaRpcResult.error ?? schemaResult.error}`)
  }

  for (const roleUser of ROLE_USERS) {
    const result = roleUser.canWriteVisit
      ? await testClinicalWorkflowRole(roleUser)
      : await testDeniedRole(roleUser)
    results.push(result)

    if (roleUser.canReadVisit && !result.visitReadAllowed) {
      failures.push(`${roleUser.role}: visit read was denied`)
    }

    if (!roleUser.canReadVisit && result.visitReadAllowed) {
      failures.push(`${roleUser.role}: visit read unexpectedly allowed`)
    }

    if (roleUser.canWriteVisit) {
      if (!result.visitCreateAllowed) {
        failures.push(`${roleUser.role}: visit create was denied`)
      }
      if (!result.visitUpdateAllowed) {
        failures.push(`${roleUser.role}: visit update was denied`)
      }
      if (!result.procedureCreateAllowed) {
        failures.push(`${roleUser.role}: visit procedure create was denied`)
      }
      if (!result.procedureReadAllowed) {
        failures.push(`${roleUser.role}: visit procedure read was denied`)
      }
      if (!result.procedureUpdateAllowed) {
        failures.push(`${roleUser.role}: visit procedure update was denied`)
      }
      if (roleUser.canWriteClinicalNote && !result.clinicalNoteValidFkAllowed) {
        failures.push(`${roleUser.role}: clinical note with valid visit FK was denied`)
      }
      if (!roleUser.canWriteClinicalNote && result.clinicalNoteValidFkAllowed) {
        failures.push(`${roleUser.role}: clinical note create unexpectedly allowed`)
      }
      if (
        roleUser.canWriteClinicalNote &&
        !result.clinicalNoteInvalidFkRejected
      ) {
        failures.push(`${roleUser.role}: invalid visit FK was not rejected`)
      }
      if (result.hardDeleteAllowed) {
        failures.push(`${roleUser.role}: hard delete unexpectedly allowed`)
      }
    } else {
      if (result.visitCreateAllowed) {
        failures.push(`${roleUser.role}: visit create unexpectedly allowed`)
      }
      if (result.procedureCreateAllowed) {
        failures.push(
          `${roleUser.role}: visit procedure create unexpectedly allowed`,
        )
      }
      if (result.clinicalNoteCreateAllowed) {
        failures.push(`${roleUser.role}: clinical note create unexpectedly allowed`)
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        schema: {
          rpcAvailable: schemaRpcResult.ok,
          ...schemaResult,
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
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
