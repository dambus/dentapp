import type { Session, SupabaseClient } from '@supabase/supabase-js'

import type {
  AuthActionResult,
  AuthSessionListener,
  AuthSessionResult,
} from './types'

const supabaseUnavailableMessage =
  'Supabase is not configured in this environment. Add local Supabase values to .env.local for development auth testing.'

let cachedSupabaseClient: SupabaseClient | null | undefined

async function getSupabaseClientSafe() {
  if (cachedSupabaseClient !== undefined) {
    return cachedSupabaseClient
  }

  try {
    const supabaseModule = await import('../../lib/supabaseClient')
    cachedSupabaseClient = supabaseModule.supabase
    return cachedSupabaseClient
  } catch (error) {
    console.warn('[authService] Supabase client unavailable.', error)
    cachedSupabaseClient = null
    return null
  }
}

function mapAuthError(error: { message?: string } | null) {
  return error?.message ?? 'Authentication request failed. Please try again.'
}

export async function signIn(email: string, password: string): Promise<AuthActionResult> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return { ok: false, message: supabaseUnavailableMessage }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { ok: false, message: mapAuthError(error) }
  }

  return { ok: true, message: null }
}

export async function signOut(): Promise<AuthActionResult> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return { ok: false, message: supabaseUnavailableMessage }
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { ok: false, message: mapAuthError(error) }
  }

  return { ok: true, message: null }
}

export async function getCurrentSession(): Promise<AuthSessionResult> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      session: null,
      isConfigured: false,
      message: supabaseUnavailableMessage,
    }
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return {
      session: null,
      isConfigured: true,
      message: mapAuthError(error),
    }
  }

  return {
    session: data.session,
    isConfigured: true,
    message: null,
  }
}

export async function subscribeToAuthSession(
  listener: AuthSessionListener,
): Promise<() => void> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return () => {}
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    listener(session)
  })

  return () => {
    data.subscription.unsubscribe()
  }
}

export function getSessionEmail(session: Session | null) {
  return session?.user.email ?? null
}
