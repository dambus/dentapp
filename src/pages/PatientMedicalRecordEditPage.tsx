import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge, Button, EmptyState, LoadingState } from '../components/ui'
import { getPatientFullName } from '../features/patients/patientDisplay'
import { PatientMedicalRecordForm } from '../features/patients/PatientMedicalRecordForm'
import {
  getPatientMedicalRecord,
  savePatientMedicalRecord,
  type PatientMedicalRecord,
  type PatientMedicalRecordInput,
} from '../features/patients/patientMedicalRecordService'
import { getPatientById } from '../features/patients/patientService'
import type { DemoPatient } from '../features/patients/types'
import { getPatientDetailPath, routePaths } from '../routes/routePaths'

const isSupabasePatientMode =
  import.meta.env.VITE_PATIENT_DATA_SOURCE?.toLowerCase() === 'supabase'

function getSaveErrorMessage(error: string | undefined) {
  const normalizedError = error?.toLowerCase() ?? ''

  if (
    normalizedError.includes('permission') ||
    normalizedError.includes('row-level security') ||
    normalizedError.includes('not allowed')
  ) {
    return 'You do not have permission to edit this medical record.'
  }

  if (normalizedError.includes('not found')) {
    return 'Medical record could not be loaded.'
  }

  if (normalizedError.includes('at least one')) {
    return 'Enter at least one medical record field before creating a record.'
  }

  return 'Medical record could not be saved.'
}

export function PatientMedicalRecordEditPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<DemoPatient | undefined>()
  const [medicalRecord, setMedicalRecord] =
    useState<PatientMedicalRecord | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadRecord() {
      const [loadedPatient, loadedRecord] = await Promise.all([
        getPatientById(patientId),
        getPatientMedicalRecord(patientId),
      ])

      if (isCurrent) {
        setPatient(loadedPatient)
        setMedicalRecord(loadedRecord)
        setHasLoaded(true)
      }
    }

    void loadRecord()

    return () => {
      isCurrent = false
    }
  }, [patientId])

  async function handleSubmit(values: PatientMedicalRecordInput) {
    if (!patientId || !patient) {
      setSubmitError('Medical record could not be loaded.')
      return
    }

    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)

    const result = await savePatientMedicalRecord(patientId, values)

    setIsSubmitting(false)

    if (result.reason === 'demo_mode') {
      setSubmitSuccess(result.message)
      return
    }

    if (!result.ok) {
      setSubmitError(getSaveErrorMessage(result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn(
          '[PatientMedicalRecordEditPage] savePatientMedicalRecord failed:',
          result.error,
        )
      }

      return
    }

    setMedicalRecord(result.record ?? null)
    setSubmitSuccess(result.message ?? 'Medical record was saved successfully.')
    navigate(getPatientDetailPath(patient.id))
  }

  if (!hasLoaded) {
    return (
      <Page>
        <LoadingState label="Loading medical record..." />
      </Page>
    )
  }

  if (!patient || !patientId) {
    return (
      <Page>
        <PageHeader
          title="Edit medical record"
          description="The requested patient profile could not be found."
          actions={
            <Button variant="secondary" onClick={() => navigate(routePaths.patients)}>
              Back to patients
            </Button>
          }
        />
        <EmptyState
          title="Patient not found"
          description="Return to the patient list and choose an available fake or Supabase patient record."
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
        title="Edit medical record"
        description={`Structured medical record for ${getPatientFullName(patient)}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">
              {isSupabasePatientMode ? 'Supabase mode' : 'Demo mode'}
            </Badge>
            <Button
              variant="secondary"
              onClick={() => navigate(getPatientDetailPath(patient.id))}
            >
              Back to patient
            </Button>
          </div>
        }
      />

      <PatientMedicalRecordForm
        initialRecord={medicalRecord}
        isExistingRecord={Boolean(medicalRecord?.id)}
        isSubmitting={isSubmitting}
        modeBadgeLabel={isSupabasePatientMode ? 'Supabase mode' : 'Demo mode'}
        onCancel={() => navigate(getPatientDetailPath(patient.id))}
        onSubmit={handleSubmit}
        submitError={submitError}
        submitSuccess={submitSuccess}
      />
    </Page>
  )
}
