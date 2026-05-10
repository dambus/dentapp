import { useNavigate } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui'
import { PatientForm } from '../features/patients/PatientForm'
import { routePaths } from '../routes/routePaths'

export function PatientCreatePage() {
  const navigate = useNavigate()

  return (
    <Page>
      <PageHeader
        title="New Patient"
        description="Create form foundation for future patient entry. This screen is frontend-only and does not save data yet."
        actions={<Badge variant="info">Demo only</Badge>}
      />

      <PatientForm
        mode="create"
        onCancel={() => navigate(routePaths.patients)}
      />
    </Page>
  )
}
