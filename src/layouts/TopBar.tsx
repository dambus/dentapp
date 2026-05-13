import { signOut } from '../features/auth/authService'
import type { CurrentProfileResult } from '../features/auth/useCurrentProfile'
import { currentDemoUser } from '../lib/demoAuth'
import { routePaths } from '../routes/routePaths'
import { Button, ButtonLink } from '../components/ui'

type TopBarProps = {
  currentProfile: CurrentProfileResult
}

export function TopBar({ currentProfile }: TopBarProps) {
  const {
    email: sessionEmail,
    profile,
    isLoading: isProfileLoading,
    message: profileMessage,
    isAuthConfigured,
    isAuthLoading,
    authMessage,
  } = currentProfile

  const isSignedIn = Boolean(sessionEmail)

  async function handleSignOut() {
    const result = await signOut()

    if (!result.ok) {
      console.warn('[TopBar] Sign-out failed:', result.message)
    }
  }

  const authLabel = (() => {
    if (isAuthLoading) {
      return 'Checking auth session...'
    }

    if (!isAuthConfigured) {
      return 'Auth unavailable (local env not configured)'
    }

    if (isSignedIn && sessionEmail) {
      return `Signed in: ${sessionEmail}`
    }

    return 'Signed out (no auth session)'
  })()

  const roleLabel = (() => {
    if (!isSignedIn) {
      return `Demo role: ${currentDemoUser.roleLabel}`
    }

    if (isProfileLoading) {
      return 'Profile role: loading...'
    }

    if (profile) {
      return `Profile role: ${profile.role}`
    }

    return `Profile role unavailable (fallback: ${currentDemoUser.roleLabel})`
  })()

  return (
    <header className="border-b border-slate-200 bg-white/95 shadow-sm">
      <div className="flex min-h-20 flex-col justify-center gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-700 text-sm font-semibold text-white">
            DA
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-teal-700">
              DentApp MVP
            </p>
            <p className="text-base font-semibold text-slate-950">
              Clinical workspace
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm lg:justify-end">
          <span className="rounded-md border border-teal-100 bg-teal-50 px-3 py-2 font-medium text-teal-800">
            {roleLabel}
          </span>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 font-medium text-amber-800">
            {authLabel}
          </span>
          {isSignedIn ? (
            <Button size="sm" variant="ghost" onClick={handleSignOut}>
              Log out
            </Button>
          ) : (
            <ButtonLink to={routePaths.login} size="sm" variant="secondary">
              Log in
            </ButtonLink>
          )}
          {authMessage ? (
            <span className="text-xs text-slate-500">{authMessage}</span>
          ) : null}
          {profileMessage && isSignedIn ? (
            <span className="text-xs text-slate-500">{profileMessage}</span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
