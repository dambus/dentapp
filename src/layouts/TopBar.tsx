import { signOut } from '../features/auth/authService'
import { AgentPanel } from '../features/agent/AgentPanel'
import type { CurrentProfileResult } from '../features/auth/useCurrentProfile'
import { currentDemoUser } from '../lib/demoAuth'
import { routePaths } from '../routes/routePaths'
import { Button, ButtonLink } from '../components/ui'

type TopBarProps = {
  currentProfile: CurrentProfileResult
  onOpenMobileMenu: () => void
}

export function TopBar({ currentProfile, onOpenMobileMenu }: TopBarProps) {
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
    <header className="app-shell-topbar border-b border-slate-200 bg-white/95 shadow-sm">
      <div className="flex min-h-20 items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation menu"
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white text-slate-700 md:hidden"
            onClick={onOpenMobileMenu}
            type="button"
          >
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-teal-700">
              DentApp MVP
            </p>
            <p className="truncate text-base font-semibold text-slate-950">
              Clinical workspace
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden rounded-md border border-teal-100 bg-teal-50 px-3 py-2 font-medium text-teal-800 lg:inline-flex">
            {roleLabel}
          </span>
          <span className="hidden max-w-80 truncate rounded-md border border-amber-200 bg-amber-50 px-3 py-2 font-medium text-amber-800 xl:inline-flex">
            {authLabel}
          </span>
          <AgentPanel />
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
            <span className="hidden max-w-48 truncate text-xs text-slate-500 lg:inline">
              {authMessage}
            </span>
          ) : null}
          {profileMessage && isSignedIn ? (
            <span className="hidden max-w-48 truncate text-xs text-slate-500 lg:inline">
              {profileMessage}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
