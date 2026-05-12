import type { ReactNode } from 'react'

import { LoadingState } from '../components/ui'
import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import { PermissionDeniedPage } from '../pages/PermissionDeniedPage'
import type { AppRole } from '../types/navigation'

type RoleGuardProps = {
  allowedRoles: AppRole[]
  children: ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { profile, isAuthLoading, isLoading } = useCurrentProfile()

  if (isAuthLoading || isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center px-4">
        <LoadingState label="Checking route permissions..." />
      </main>
    )
  }

  const role = profile?.role

  if (!role || !allowedRoles.includes(role)) {
    return <PermissionDeniedPage role={role} />
  }

  return <>{children}</>
}
