import type { Session } from '@supabase/supabase-js'
import type { AppRole } from '../../types/navigation'

export type AuthActionResult = {
  ok: boolean
  message: string | null
}

export type AuthSessionResult = {
  session: Session | null
  isConfigured: boolean
  message: string | null
}

export type AuthSessionListener = (session: Session | null) => void

export type AppProfile = {
  id: string
  authUserId: string
  clinicId: string
  fullName: string
  email: string | null
  role: AppRole
  status: 'invited' | 'active' | 'inactive' | 'suspended'
}

export type ProfileLoadResult = {
  profile: AppProfile | null
  message: string | null
}
