import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge, Button, EmptyState } from '../components/ui'
import { PatientForm } from '../features/patients/PatientForm'
import { getPatientFormValuesFromDemoPatient } from '../features/patients/patientFormValues'
import { getPatientById } from '../features/patients/patientService'
import type { DemoPatient } from '../features/patients/types'
import { getPatientDetailPath, routePaths } from '../routes/routePaths'

export function PatientEditPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<DemoPatient | undefined>()
  const [hasLoadedPatient, setHasLoadedPatient] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function loadPatient() {
      const loadedPatient = await getPatientById(patientId)

      if (isCurrent) {
        setPatient(loadedPatient)
        setHasLoadedPatient(true)
      }
    }

    void loadPatient()

    return () => {
      isCurrent = false
    }
  }, [patientId])

  if (!hasLoadedPatient) {
    return null
  }

  if (!patient) {
    return (
      <Page>
        <PageHeader
          title="Edit patient"
          description="The requested demo patient cannot be edited because it does not exist in the local fake dataset."
          actions={
            <Button variant="secondary" onClick={() => navigate(routePaths.patients)}>
              Back to patients
            </Button>
          }
        />
        <EmptyState
          title="No matching demo patient"
          description="Return to the patient list and choose one of the fake demo patient records."
          action={
            <Button onClick={() => navigate(routePaths.patients)}>
              Open patient list
            </Button>
          }
        />
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader
        title="Edit Patient"
        description="Edit form foundation with values loaded from fake demo data. Changes are not persisted yet."
        actions={<Badge variant="info">Demo only</Badge>}
      />

      <PatientForm
        initialValues={getPatientFormValuesFromDemoPatient(patient)}
        mode="edit"
        onCancel={() => navigate(getPatientDetailPath(patient.id))}
      />
    </Page>
  )
}
