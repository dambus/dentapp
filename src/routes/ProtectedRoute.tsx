import { Navigate } from 'react-router-dom'

import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import { LoadingState } from '../components/ui'
import { routePaths } from './routePaths'
import { ProfileRequiredPage } from '../pages/ProfileRequiredPage'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const {
    session,
    profile,
    isAuthLoading,
    isLoading: isProfileLoading,
  } = useCurrentProfile()

  // Still checking auth session or profile
  if (isAuthLoading || isProfileLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <LoadingState label="Verifying your access..." />
      </main>
    )
  }

  // Not authenticated
  if (!session) {
    return <Navigate to={routePaths.login} replace />
  }

  // Authenticated but no active profile
  if (!profile || profile.status !== 'active') {
    return <ProfileRequiredPage />
  }

  // Authenticated with active profile - allow access
  return <>{children}</>
}
