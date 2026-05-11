import { useEffect, useState } from 'react'

import { getCurrentProfileByAuthUserId } from './profileService'
import { useAuthSession } from './useAuthSession'
import type { AppProfile } from './types'

type CurrentProfileState = {
  profile: AppProfile | null
  isLoading: boolean
  message: string | null
}

const initialState: CurrentProfileState = {
  profile: null,
  isLoading: true,
  message: null,
}

export function useCurrentProfile() {
  const authSession = useAuthSession()
  const [state, setState] = useState<CurrentProfileState>(initialState)

  useEffect(() => {
    let isCurrent = true

    async function loadProfile() {
      if (authSession.isLoading) {
        if (isCurrent) {
          setState({ profile: null, isLoading: true, message: null })
        }
        return
      }

      const authUserId = authSession.session?.user.id

      if (!authUserId) {
        if (isCurrent) {
          setState({ profile: null, isLoading: false, message: null })
        }
        return
      }

      if (isCurrent) {
        setState((previousState) => ({
          ...previousState,
          isLoading: true,
          message: null,
        }))
      }

      const result = await getCurrentProfileByAuthUserId(authUserId)

      if (!isCurrent) {
        return
      }

      setState({
        profile: result.profile,
        isLoading: false,
        message: result.message,
      })
    }

    void loadProfile()

    return () => {
      isCurrent = false
    }
  }, [authSession.isLoading, authSession.session?.user.id])

  return {
    ...state,
    session: authSession.session,
    email: authSession.email,
    isAuthConfigured: authSession.isConfigured,
    isAuthLoading: authSession.isLoading,
    authMessage: authSession.message,
  }
}

export type CurrentProfileResult = ReturnType<typeof useCurrentProfile>
