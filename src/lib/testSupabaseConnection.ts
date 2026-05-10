import { supabase } from './supabaseClient'

type SupabaseConnectionTestResult = {
  status: 'connected' | 'expected_rls_restriction' | 'failed' | 'skipped'
  message: string
}

export const testSupabaseConnection = async (): Promise<SupabaseConnectionTestResult> => {
  if (!import.meta.env.DEV) {
    return {
      status: 'skipped',
      message: 'Supabase connection test is only intended for local development.',
    }
  }

  const { error } = await supabase.from('clinics').select('id').limit(1)

  if (!error) {
    return {
      status: 'connected',
      message: 'Supabase client initialized and completed a read-only local query.',
    }
  }

  if (error.code === '42501' || error.code === 'PGRST301') {
    return {
      status: 'expected_rls_restriction',
      message: 'Supabase client initialized; read-only query was blocked by expected auth/RLS restrictions.',
    }
  }

  return {
    status: 'failed',
    message: error.message,
  }
}
