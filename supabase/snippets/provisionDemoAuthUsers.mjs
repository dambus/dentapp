import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const DEMO_CLINIC_ID = '11111111-1111-1111-1111-111111111111'

const DEMO_USERS = [
  {
    role: 'owner_admin',
    fullName: 'Owner Demo',
    email: 'owner.demo@example.test',
    password: 'DemoPass!2026',
  },
  {
    role: 'doctor',
    fullName: 'Doctor Demo',
    email: 'doctor.demo@example.test',
    password: 'DemoPass!2026',
  },
  {
    role: 'specialist',
    fullName: 'Specialist Demo',
    email: 'specialist.demo@example.test',
    password: 'DemoPass!2026',
  },
  {
    role: 'assistant',
    fullName: 'Assistant Demo',
    email: 'assistant.demo@example.test',
    password: 'DemoPass!2026',
  },
  {
    role: 'reception_admin',
    fullName: 'Reception Demo',
    email: 'reception.demo@example.test',
    password: 'DemoPass!2026',
  },
  {
    role: 'inventory_responsible',
    fullName: 'Inventory Demo',
    email: 'inventory.demo@example.test',
    password: 'DemoPass!2026',
  },
]

async function ensureAuthUser(client, demoUser) {
  const existingUsersResult = await client.auth.admin.listUsers()

  if (existingUsersResult.error) {
    throw new Error(existingUsersResult.error.message)
  }

  const existingUser = existingUsersResult.data.users.find(
    (user) => user.email?.toLowerCase() === demoUser.email.toLowerCase(),
  )

  if (existingUser) {
    return existingUser.id
  }

  const created = await client.auth.admin.createUser({
    email: demoUser.email,
    password: demoUser.password,
    email_confirm: true,
  })

  if (created.error || !created.data.user) {
    throw new Error(created.error?.message ?? `Failed to create user: ${demoUser.email}`)
  }

  return created.data.user.id
}

async function ensureProfile(client, demoUser, authUserId) {
  const upsertResult = await client.from('profiles').upsert(
    {
      auth_user_id: authUserId,
      clinic_id: DEMO_CLINIC_ID,
      full_name: demoUser.fullName,
      email: demoUser.email,
      role: demoUser.role,
      status: 'active',
    },
    {
      onConflict: 'auth_user_id',
      ignoreDuplicates: false,
    },
  )

  if (upsertResult.error) {
    throw new Error(upsertResult.error.message)
  }
}

async function ensureSeedAuditRow(client) {
  const existing = await client
    .from('audit_logs')
    .select('id')
    .eq('action', 'demo.rls.seed')
    .limit(1)

  if (existing.error) {
    throw new Error(existing.error.message)
  }

  if ((existing.data ?? []).length > 0) {
    return
  }

  const ownerProfile = await client
    .from('profiles')
    .select('id, auth_user_id')
    .eq('email', 'owner.demo@example.test')
    .maybeSingle()

  if (ownerProfile.error || !ownerProfile.data) {
    throw new Error(ownerProfile.error?.message ?? 'Missing owner profile for demo seed audit row.')
  }

  const insertResult = await client.from('audit_logs').insert({
    clinic_id: DEMO_CLINIC_ID,
    actor_profile_id: ownerProfile.data.id,
    actor_auth_user_id: ownerProfile.data.auth_user_id,
    action: 'demo.rls.seed',
    entity_type: 'demo',
    entity_id: null,
    old_values: null,
    new_values: { note: 'demo seed audit row' },
    metadata: { source: 'provisionDemoAuthUsers.mjs' },
  })

  if (insertResult.error) {
    throw new Error(insertResult.error.message)
  }
}

async function main() {
  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const output = []

  for (const demoUser of DEMO_USERS) {
    const authUserId = await ensureAuthUser(client, demoUser)
    await ensureProfile(client, demoUser, authUserId)

    output.push({
      email: demoUser.email,
      role: demoUser.role,
      authUserId,
    })
  }

  await ensureSeedAuditRow(client)

  console.log(
    JSON.stringify(
      {
        createdOrVerifiedUsers: output.length,
        users: output,
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
