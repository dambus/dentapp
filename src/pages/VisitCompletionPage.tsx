import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge, Button, EmptyState, InlineNotice } from '../components/ui'
import {
  fetchAppointmentForPatient,
  type Appointment,
} from '../features/appointments/appointmentService'
import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import { getPatientFullName } from '../features/patients/patientDisplay'
import { getPatientById } from '../features/patients/patientService'
import type { DemoPatient } from '../features/patients/types'
import { VisitCompletionFlow } from '../features/visits/VisitCompletionFlow'
import { getPatientDetailPath, routePaths } from '../routes/routePaths'
import type { AppRole } from '../types/navigation'

const visitCompletionRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
]

export function VisitCompletionPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentProfile = useCurrentProfile()
  const [patient, setPatient] = useState<DemoPatient | undefined>()
  const [hasLoadedPatient, setHasLoadedPatient] = useState(false)
  const [appointmentContext, setAppointmentContext] =
    useState<Appointment | null>(null)
  const [appointmentContextError, setAppointmentContextError] =
    useState<string | null>(null)

  const appointmentId = searchParams.get('appointmentId')?.trim() || null

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

  useEffect(() => {
    let isCurrent = true

    async function loadAppointmentContext() {
      setAppointmentContext(null)
      setAppointmentContextError(null)

      if (!patientId || !appointmentId) {
        return
      }

      try {
        const appointment = await fetchAppointmentForPatient(
          patientId,
          appointmentId,
        )

        if (!isCurrent) {
          return
        }

        if (appointment) {
          setAppointmentContext(appointment)
        } else {
          setAppointmentContextError(
            'The linked appointment could not be found for this patient. Visit completion can continue without appointment linking.',
          )
        }
      } catch (error) {
        if (isCurrent) {
          setAppointmentContextError(
            error instanceof Error
              ? error.message
              : 'Appointment context could not be loaded.',
          )
        }
      }
    }

    void loadAppointmentContext()

    return () => {
      isCurrent = false
    }
  }, [appointmentId, patientId])

  if (!hasLoadedPatient) {
    return null
  }

  if (!patient) {
    return (
      <Page>
        <PageHeader
          title="Visit completion unavailable"
          description="The requested patient does not exist in the current patient source."
          actions={
            <Button
              variant="secondary"
              onClick={() => navigate(routePaths.patients)}
            >
              Back to patients
            </Button>
          }
        />
        <EmptyState
          title="No matching patient"
          description="Open an existing patient before starting the visit completion prototype."
          action={
            <Button onClick={() => navigate(routePaths.patients)}>
              Open patient list
            </Button>
          }
        />
      </Page>
    )
  }

  const patientName = getPatientFullName(patient)
  const isArchived = patient.status === 'archived' || Boolean(patient.deletedAt)
  const currentRole = currentProfile.profile?.role ?? null
  const canUsePrototype = currentRole
    ? visitCompletionRoles.includes(currentRole)
    : false

  return (
    <Page>
      <PageHeader
        title="Visit Completion"
        description={`Guided prototype for closing today's work for ${patientName}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">Prototype only</Badge>
            <Button
              variant="secondary"
              onClick={() => navigate(getPatientDetailPath(patient.id))}
            >
              Back to patient
            </Button>
          </div>
        }
      />

      {!canUsePrototype ? (
        <InlineNotice variant="warning">
          Visit completion is available to clinical workflow roles only in this
          prototype.
        </InlineNotice>
      ) : null}

      {isArchived ? (
        <InlineNotice variant="warning">
          This patient is archived. Restore the profile before completing a
          visit.
        </InlineNotice>
      ) : null}

      {appointmentContextError ? (
        <InlineNotice variant="warning">{appointmentContextError}</InlineNotice>
      ) : null}

      {canUsePrototype && !isArchived ? (
        <VisitCompletionFlow
          appointmentContext={appointmentContext}
          appointmentId={appointmentContext?.id ?? null}
          patient={patient}
          onBackToPatient={() =>
            navigate(`${getPatientDetailPath(patient.id)}?section=timeline`)
          }
        />
      ) : null}
    </Page>
  )
}
