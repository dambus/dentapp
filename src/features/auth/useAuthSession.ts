import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import {
  getCurrentSession,
  getSessionEmail,
  subscribeToAuthSession,
} from './authService'

type AuthSessionState = {
  session: Session | null
  email: string | null
  isConfigured: boolean
  isLoading: boolean
  message: string | null
}

const initialState: AuthSessionState = {
  session: null,
  email: null,
  isConfigured: true,
  isLoading: true,
  message: null,
}

export function useAuthSession() {
  const [state, setState] = useState<AuthSessionState>(initialState)

  useEffect(() => {
    let isCurrent = true
    let unsubscribe = () => {}

    async function initializeSession() {
      const sessionResult = await getCurrentSession()

      if (!isCurrent) {
        return
      }

      setState({
        session: sessionResult.session,
        email: getSessionEmail(sessionResult.session),
        isConfigured: sessionResult.isConfigured,
        isLoading: false,
        message: sessionResult.message,
      })

      unsubscribe = await subscribeToAuthSession((session) => {
        if (!isCurrent) {
          return
        }

        setState((previousState) => ({
          ...previousState,
          session,
          email: getSessionEmail(session),
          message: null,
        }))
      })
    }

    void initializeSession()

    return () => {
      isCurrent = false
      unsubscribe()
    }
  }, [])

  return state
}
