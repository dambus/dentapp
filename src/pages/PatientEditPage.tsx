import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge, Button, EmptyState } from '../components/ui'
import { PatientForm } from '../features/patients/PatientForm'
import type { PatientFormValues } from '../features/patients/patientFormValues'
import { getPatientFormValuesFromDemoPatient } from '../features/patients/patientFormValues'
import { getPatientById, updatePatient } from '../features/patients/patientService'
import type { DemoPatient } from '../features/patients/types'
import { getPatientDetailPath, routePaths } from '../routes/routePaths'

const isSupabasePatientMode =
  import.meta.env.VITE_PATIENT_DATA_SOURCE?.toLowerCase() === 'supabase'

function getUpdateSubmitErrorMessage(serviceError: string | undefined) {
  const normalizedError = serviceError?.toLowerCase() ?? ''

  if (
    normalizedError.includes('permission') ||
    normalizedError.includes('row-level security') ||
    normalizedError.includes('not have permission') ||
    normalizedError.includes('not allowed')
  ) {
    return 'You do not have permission to update this patient.'
  }

  if (normalizedError.includes('not found')) {
    return 'Patient could not be found for update.'
  }

  if (normalizedError.includes('required')) {
    return 'Please check required fields.'
  }

  return 'Patient could not be saved.'
}

export function PatientEditPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<DemoPatient | undefined>()
  const [hasLoadedPatient, setHasLoadedPatient] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

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

  async function handleSubmit(values: PatientFormValues) {
    if (!patient) {
      setSubmitError('Patient could not be found for update.')
      return
    }

    setSubmitError(null)
    setSubmitSuccess(null)

    if (!isSupabasePatientMode) {
      setSubmitSuccess('Demo mode only. No data was saved.')
      return
    }

    setIsSubmitting(true)

    const result = await updatePatient(patient.id, {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      email: values.email,
      dateOfBirth: values.dateOfBirth,
      status: values.status,
      importantNote: values.importantNote,
    })

    setIsSubmitting(false)

    if (!result.ok) {
      setSubmitError(getUpdateSubmitErrorMessage(result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn('[PatientEditPage] updatePatient failed:', result.error)
      }

      return
    }

    setSubmitSuccess('Patient was updated successfully.')
    navigate(getPatientDetailPath(result.patientId ?? patient.id))
  }

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
        description="Edit patient profile details. In demo mode submits are intentionally non-persistent."
        actions={
          <Badge variant="info">
            {isSupabasePatientMode ? 'Supabase mode' : 'Demo mode'}
          </Badge>
        }
      />

      <PatientForm
        initialValues={getPatientFormValuesFromDemoPatient(patient)}
        mode="edit"
        onCancel={() => navigate(getPatientDetailPath(patient.id))}
        onSubmit={handleSubmit}
        submitLabel="Save patient changes"
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
        modeBadgeLabel={isSupabasePatientMode ? 'Supabase mode' : 'Demo mode'}
      />
    </Page>
  )
}
