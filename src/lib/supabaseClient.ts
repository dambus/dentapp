import { createClient } from '@supabase/supabase-js'

import { getRequiredPublicEnv } from './env'

const supabaseUrl = getRequiredPublicEnv(
  'VITE_SUPABASE_URL',
  import.meta.env.VITE_SUPABASE_URL,
)

const supabaseAnonKey = getRequiredPublicEnv(
  'VITE_SUPABASE_ANON_KEY',
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
