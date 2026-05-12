import { useNavigate } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Button, Card, CardContent } from '../components/ui'
import type { AppRole } from '../types/navigation'
import { routePaths } from '../routes/routePaths'

type PermissionDeniedPageProps = {
  role?: AppRole | null
}

export function PermissionDeniedPage({ role }: PermissionDeniedPageProps) {
  const navigate = useNavigate()

  return (
    <Page>
      <PageHeader
        title="Access denied"
        description="You do not have permission to open this page with your current DentApp role."
      />

      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-slate-700">
            Contact your practice administrator if you need access to this route.
          </p>

          {role ? (
            <p className="text-sm text-slate-600">
              Current role: <span className="font-medium text-slate-900">{role}</span>
            </p>
          ) : null}

          <div>
            <Button onClick={() => navigate(routePaths.dashboard)}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}
