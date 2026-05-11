import { useMemo, useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  signIn,
  signOut,
} from '../features/auth/authService'
import { useAuthSession } from '../features/auth/useAuthSession'
import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
} from '../components/ui'
import { routePaths } from '../routes/routePaths'

export function LoginPage() {
  const navigate = useNavigate()
  const { email: sessionEmail, isConfigured, isLoading, message } = useAuthSession()
  const { profile, isLoading: isProfileLoading, isAuthLoading } = useCurrentProfile()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isSignedIn = Boolean(sessionEmail)
  const hasActiveProfile = profile?.status === 'active'

  // Redirect to dashboard if already signed in with active profile
  useEffect(() => {
    if (!isAuthLoading && !isProfileLoading && isSignedIn && hasActiveProfile) {
      navigate(routePaths.dashboard, { replace: true })
    }
  }, [isAuthLoading, isProfileLoading, isSignedIn, hasActiveProfile, navigate])

  const helperMessage = useMemo(() => {
    if (isLoading) {
      return 'Checking local auth session...'
    }

    if (!isConfigured) {
      return message ?? 'Supabase is not configured for this environment.'
    }

    if (isSignedIn && sessionEmail) {
      return `Signed in as ${sessionEmail}.`
    }

    return 'Local/demo authentication only. Use fake local users for development testing.'
  }, [isConfigured, isLoading, isSignedIn, message, sessionEmail])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage(null)
    setIsSubmitting(true)

    const result = await signIn(email.trim(), password)

    setIsSubmitting(false)

    if (!result.ok) {
      setErrorMessage(result.message)
      return
    }

    navigate(routePaths.dashboard)
  }

  async function handleSignOut() {
    setErrorMessage(null)
    setIsSubmitting(true)

    const result = await signOut()

    setIsSubmitting(false)

    if (!result.ok) {
      setErrorMessage(result.message)
      return
    }
  }

  // Show loading while checking if already signed in
  if (isAuthLoading || isProfileLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <LoadingState label="Checking your session..." />
      </main>
    )
  }

  // If already signed in with active profile, redirect will happen via useEffect
  if (isSignedIn && hasActiveProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <LoadingState label="Redirecting to your dashboard..." />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>DentApp Login</CardTitle>
              <Badge variant="info">Local demo auth</Badge>
            </div>
            <CardDescription>
              Basic Supabase Auth foundation for local development and RLS testing.
              Protected routes require an active DentApp profile.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {helperMessage}
            </p>

            {errorMessage ? (
              <ErrorState
                title="Login failed"
                description={errorMessage}
              />
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="owner.demo@example.test"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter local demo password"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>

                {isSignedIn ? (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isSubmitting}
                      onClick={() => navigate(routePaths.dashboard)}
                    >
                      Open app
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isSubmitting}
                      onClick={handleSignOut}
                    >
                      Sign out
                    </Button>
                  </>
                ) : null}
              </div>
            </form>

            <p className="text-xs text-slate-500">
              This page is development-focused. Use fake local/demo users only.
              Signup and password reset are not implemented in this phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
