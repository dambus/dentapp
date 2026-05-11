import type { AppRole } from '../../types/navigation'
import type { AppProfile, ProfileLoadResult } from './types'

type ProfileRow = {
  id: string
  auth_user_id: string
  clinic_id: string
  full_name: string
  email: string | null
  role: string
  status: 'invited' | 'active' | 'inactive' | 'suspended'
}

const validRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
  'reception_admin',
  'inventory_responsible',
]

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn('[profileService] Supabase client unavailable.', error)

    return null
  }
}

function mapRole(role: string): AppRole | null {
  return validRoles.includes(role as AppRole) ? (role as AppRole) : null
}

function mapProfileRowToAppProfile(row: ProfileRow): AppProfile | null {
  const role = mapRole(row.role)

  if (!role) {
    return null
  }

  return {
    id: row.id,
    authUserId: row.auth_user_id,
    clinicId: row.clinic_id,
    fullName: row.full_name,
    email: row.email,
    role,
    status: row.status,
  }
}

export async function getCurrentProfileByAuthUserId(
  authUserId: string,
): Promise<ProfileLoadResult> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      profile: null,
      message:
        'Supabase client is unavailable. Configure local Supabase env values for profile loading.',
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, auth_user_id, clinic_id, full_name, email, role, status')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (error) {
    return {
      profile: null,
      message: error.message,
    }
  }

  if (!data) {
    return {
      profile: null,
      message: 'No profile row exists for the current authenticated user.',
    }
  }

  const profile = mapProfileRowToAppProfile(data as ProfileRow)

  if (!profile) {
    return {
      profile: null,
      message: 'Profile role is invalid for DentApp navigation permissions.',
    }
  }

  return {
    profile,
    message: null,
  }
}
