import { useNavigate } from 'react-router-dom'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState } from '../components/ui'
import { routePaths } from '../routes/routePaths'

export function ProfileRequiredPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Required</CardTitle>
            <CardDescription>
              Your account exists, but no DentApp profile is linked yet.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <ErrorState
              title="Profile Not Configured"
              description="A DentApp profile must be created for your account before you can access the application. Please contact your practice administrator."
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(routePaths.login)}
              >
                Return to Login
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              This is a development/demo screen. In production, profile creation would be managed by the practice administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
