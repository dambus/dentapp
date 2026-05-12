import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui'
import { PatientForm } from '../features/patients/PatientForm'
import type { PatientFormValues } from '../features/patients/patientFormValues'
import { createPatient } from '../features/patients/patientService'
import { getPatientDetailPath, routePaths } from '../routes/routePaths'

const isSupabasePatientMode =
  import.meta.env.VITE_PATIENT_DATA_SOURCE?.toLowerCase() === 'supabase'

function getCreateSubmitErrorMessage(serviceError: string | undefined) {
  const normalizedError = serviceError?.toLowerCase() ?? ''

  if (
    normalizedError.includes('permission') ||
    normalizedError.includes('row-level security') ||
    normalizedError.includes('not have permission') ||
    normalizedError.includes('not allowed')
  ) {
    return 'You do not have permission to create this patient.'
  }

  if (normalizedError.includes('required')) {
    return 'Please check required fields.'
  }

  return 'Patient could not be saved.'
}

export function PatientCreatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  async function handleSubmit(values: PatientFormValues) {
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!isSupabasePatientMode) {
      setSubmitSuccess('Demo mode only. No data was saved.')
      return
    }

    setIsSubmitting(true)

    const result = await createPatient({
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
      setSubmitError(getCreateSubmitErrorMessage(result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn('[PatientCreatePage] createPatient failed:', result.error)
      }

      return
    }

    if (result.patientId) {
      navigate(getPatientDetailPath(result.patientId))
      return
    }

    setSubmitSuccess('Patient was saved successfully.')
    navigate(routePaths.patients)
  }

  return (
    <Page>
      <PageHeader
        title="New Patient"
        description="Create a patient profile. In demo mode submits are intentionally non-persistent."
        actions={
          <Badge variant="info">
            {isSupabasePatientMode ? 'Supabase mode' : 'Demo mode'}
          </Badge>
        }
      />

      <PatientForm
        mode="create"
        onCancel={() => navigate(routePaths.patients)}
        onSubmit={handleSubmit}
        submitLabel="Create patient"
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
        modeBadgeLabel={isSupabasePatientMode ? 'Supabase mode' : 'Demo mode'}
      />
    </Page>
  )
}
