import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.')
  process.exit(1)
}

const ROLE_USERS = [
  { role: 'owner_admin', email: 'owner.demo@example.test', password: 'DemoPass!2026' },
  { role: 'doctor', email: 'doctor.demo@example.test', password: 'DemoPass!2026' },
]

async function callAuditRpc(client, role) {
  const marker = `demo.audit.${role}.${Date.now()}`

  const rpc = await client.rpc('create_audit_log', {
    p_action: 'patient.updated',
    p_entity_type: 'patient',
    p_entity_id: null,
    p_old_values: { marker, before: 'old' },
    p_new_values: { marker, after: 'new' },
    p_metadata: { marker, source: 'testAuditInsert.mjs' },
  })

  return {
    ok: !rpc.error,
    id: rpc.data ?? null,
    error: rpc.error?.message ?? null,
    marker,
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

  const auditInsert = await callAuditRpc(client, roleUser.role)

  const readAudit = await client
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })

  await client.auth.signOut()

  return {
    role: roleUser.role,
    email: roleUser.email,
    signInError: null,
    auditInsert,
    auditRead: {
      count: readAudit.count ?? 0,
      error: readAudit.error?.message ?? null,
    },
  }
}

async function testUnauthenticatedCall() {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const rpc = await client.rpc('create_audit_log', {
    p_action: 'patient.updated',
    p_entity_type: 'patient',
    p_entity_id: null,
    p_old_values: null,
    p_new_values: null,
    p_metadata: { source: 'unauthenticated-check' },
  })

  return {
    ok: !rpc.error,
    id: rpc.data ?? null,
    error: rpc.error?.message ?? null,
  }
}

async function main() {
  const results = []

  for (const roleUser of ROLE_USERS) {
    const roleResult = await testRole(roleUser)
    results.push(roleResult)
  }

  const unauthenticated = await testUnauthenticatedCall()

  console.log(
    JSON.stringify(
      {
        roles: results,
        unauthenticated,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
