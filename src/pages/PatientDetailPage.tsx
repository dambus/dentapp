import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge, Button, EmptyState } from '../components/ui'
import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import { PatientAppointmentSummary } from '../features/patients/PatientAppointmentSummary'
import { PatientFullRecord } from '../features/patients/PatientFullRecord'
import type { PatientFullRecordSection } from '../features/patients/PatientFullRecord'
import { PatientFollowUpSummary } from '../features/patients/PatientFollowUpSummary'
import { PatientLatestClinicalActivity } from '../features/patients/PatientLatestClinicalActivity'
import { getPatientFullName } from '../features/patients/patientDisplay'
import { PatientQuickActions } from '../features/patients/PatientQuickActions'
import { PatientSnapshot } from '../features/patients/PatientSnapshot'
import { PatientTodayPanel } from '../features/patients/PatientTodayPanel'
import { PatientTreatmentPlanSummary } from '../features/patients/PatientTreatmentPlanSummary'
import {
  archivePatient,
  getPatientById,
  restorePatient,
} from '../features/patients/patientService'
import type { DemoPatient } from '../features/patients/types'
import {
  getPatientEditPath,
  getPatientMedicalRecordEditPath,
  getAppointmentDetailPath,
  getPatientFollowUpSchedulingPath,
  getPatientVisitCompletionPath,
  getPatientVisitDetailPath,
  routePaths,
} from '../routes/routePaths'
import type { AppRole } from '../types/navigation'

const medicalRecordEditRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
]

const clinicalNoteRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
]

const odontogramViewRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
]

const odontogramEditRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
]

const treatmentPlanReadRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
  'reception_admin',
]

const treatmentPlanWriteRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
]

const visitCompletionRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
]

const patientArchiveRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'reception_admin',
]

const isSupabasePatientMode =
  import.meta.env.VITE_PATIENT_DATA_SOURCE?.toLowerCase() === 'supabase'

const patientFullRecordSections: PatientFullRecordSection[] = [
  'medical-record',
  'odontogram',
  'treatment-plans',
  'clinical-notes',
  'documents',
  'timeline',
]

function getInitialFullRecordSection(
  section: string | null,
): PatientFullRecordSection {
  return patientFullRecordSections.includes(section as PatientFullRecordSection)
    ? (section as PatientFullRecordSection)
    : 'medical-record'
}

export function PatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentProfile = useCurrentProfile()
  const [patient, setPatient] = useState<DemoPatient | undefined>()
  const [hasLoadedPatient, setHasLoadedPatient] = useState(false)
  const [isLifecycleSubmitting, setIsLifecycleSubmitting] = useState(false)
  const [lifecycleError, setLifecycleError] = useState<string | null>(null)
  const [lifecycleSuccess, setLifecycleSuccess] = useState<string | null>(null)
  const [appointmentPrefillReason, setAppointmentPrefillReason] = useState('')
  const [appointmentPrefillRequestId, setAppointmentPrefillRequestId] =
    useState(0)
  const handledFollowUpSchedulingRequestRef = useRef<string | null>(null)
  const [fullRecordSection, setFullRecordSection] =
    useState<PatientFullRecordSection>(() =>
      getInitialFullRecordSection(searchParams.get('section')),
    )

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
    if (!patient || searchParams.get('scheduleFollowUp') !== 'true') {
      return
    }

    const schedulingRequestKey = searchParams.toString()

    if (handledFollowUpSchedulingRequestRef.current === schedulingRequestKey) {
      return
    }

    handledFollowUpSchedulingRequestRef.current = schedulingRequestKey

    const prefillReason =
      searchParams.get('reason')?.trim() || patient.nextRecommendedStep || ''

    setAppointmentPrefillReason(prefillReason)
    setAppointmentPrefillRequestId((currentRequestId) => currentRequestId + 1)

    window.setTimeout(() => {
      document
        .getElementById('patient-appointments')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }, [patient, searchParams])

  if (!hasLoadedPatient) {
    return null
  }

  if (!patient) {
    return (
      <Page>
        <PageHeader
          title="Patient not found"
          description="The requested demo patient profile does not exist in the local fake dataset."
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
          title="No matching demo patient"
          description="Check the patient link or return to the patient list. No Supabase lookup is connected in this phase."
          action={
            <Button onClick={() => navigate(routePaths.patients)}>
              Open patient list
            </Button>
          }
        />
      </Page>
    )
  }

  const loadedPatient = patient
  const patientName = getPatientFullName(loadedPatient)
  const activePlanLabel = loadedPatient.activeTreatmentPlan ?? 'No active plan'
  const isArchived =
    loadedPatient.status === 'archived' || Boolean(loadedPatient.deletedAt)
  const canEditMedicalRecord = currentProfile.profile
    ? medicalRecordEditRoles.includes(currentProfile.profile.role) && !isArchived
    : false
  const canViewClinicalNotes = currentProfile.profile
    ? clinicalNoteRoles.includes(currentProfile.profile.role)
    : false
  const canViewOdontogram = currentProfile.profile
    ? odontogramViewRoles.includes(currentProfile.profile.role)
    : false
  const canEditOdontogram = currentProfile.profile
    ? odontogramEditRoles.includes(currentProfile.profile.role)
    : false
  const canViewTreatmentPlans = currentProfile.profile
    ? treatmentPlanReadRoles.includes(currentProfile.profile.role)
    : false
  const canManageTreatmentPlans = currentProfile.profile
    ? treatmentPlanWriteRoles.includes(currentProfile.profile.role)
    : false
  const canCompleteVisit = currentProfile.profile
    ? visitCompletionRoles.includes(currentProfile.profile.role)
    : false
  const canArchiveOrRestore = currentProfile.profile
    ? patientArchiveRoles.includes(currentProfile.profile.role)
    : false
  const dataSourceLabel = isSupabasePatientMode ? 'Supabase mode' : 'Fake demo data'
  const highlightedVisitId = searchParams.get('visitId')

  async function refreshPatient() {
    const refreshedPatient = await getPatientById(loadedPatient.id)
    setPatient(refreshedPatient)
  }

  function getLifecycleErrorMessage(
    action: 'archive' | 'restore',
    serviceError: string | undefined,
  ) {
    const normalizedError = serviceError?.toLowerCase() ?? ''

    if (
      normalizedError.includes('permission') ||
      normalizedError.includes('row-level security') ||
      normalizedError.includes('not allowed')
    ) {
      return action === 'archive'
        ? 'You do not have permission to archive this patient.'
        : 'You do not have permission to restore this patient.'
    }

    if (normalizedError.includes('not found')) {
      return 'Patient could not be found.'
    }

    return action === 'archive'
      ? 'Patient could not be archived.'
      : 'Patient could not be restored.'
  }

  async function handleLifecycleAction(action: 'archive' | 'restore') {
    const confirmed = window.confirm(
      action === 'archive'
        ? 'Archive this patient? This will hide the patient from the normal patient list.'
        : 'Restore this patient? This will make the patient active again.',
    )

    if (!confirmed) {
      return
    }

    setLifecycleError(null)
    setLifecycleSuccess(null)
    setIsLifecycleSubmitting(true)

    const result =
      action === 'archive'
        ? await archivePatient(loadedPatient.id)
        : await restorePatient(loadedPatient.id)

    setIsLifecycleSubmitting(false)

    if (result.reason === 'demo_mode') {
      setLifecycleSuccess(result.message)
      return
    }

    if (!result.ok) {
      setLifecycleError(getLifecycleErrorMessage(action, result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn(`[PatientDetailPage] ${action}Patient failed:`, result.error)
      }

      return
    }

    setLifecycleSuccess(
      result.message ??
        (action === 'archive'
          ? 'Patient was archived successfully.'
          : 'Patient was restored successfully.'),
    )
    await refreshPatient()
  }

  function openFullRecordSection(section: PatientFullRecordSection) {
    setFullRecordSection(section)
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.set('section', section)
      if (section !== 'timeline') {
        nextParams.delete('visitId')
      }
      return nextParams
    })
    window.setTimeout(() => {
      document
        .getElementById('patient-full-record')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  function handleFullRecordSectionChange(section: PatientFullRecordSection) {
    setFullRecordSection(section)
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.set('section', section)
      if (section !== 'timeline') {
        nextParams.delete('visitId')
      }
      return nextParams
    })
  }

  function openTimelineVisit(visitId: string) {
    setFullRecordSection('timeline')
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.set('section', 'timeline')
      nextParams.set('visitId', visitId)
      return nextParams
    })
    window.setTimeout(() => {
      document
        .getElementById('patient-full-record')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  function openVisitCompletion(appointmentId?: string | null) {
    const basePath = getPatientVisitCompletionPath(loadedPatient.id)

    if (appointmentId) {
      const visitSearchParams = new URLSearchParams({ appointmentId })
      navigate(`${basePath}?${visitSearchParams}`)
      return
    }

    navigate(basePath)
  }

  function openAppointmentForm(reason: string) {
    navigate(getPatientFollowUpSchedulingPath(loadedPatient.id, reason))
  }

  return (
    <Page>
      <PageHeader
        title={patientName}
        description="Patient profile overview. Demo mode remains non-persistent; Supabase mode supports patient create and basic profile updates."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{dataSourceLabel}</Badge>
            <Button
              variant="secondary"
              onClick={() => navigate(routePaths.patients)}
            >
              Back to patients
            </Button>
          </div>
        }
      />

      <PatientSnapshot
        patient={patient}
        role={currentProfile.profile?.role ?? null}
        isArchived={isArchived}
        isLifecycleSubmitting={isLifecycleSubmitting}
        lifecycleError={lifecycleError}
        lifecycleSuccess={lifecycleSuccess}
        canEditMedicalRecord={canEditMedicalRecord}
        canArchiveOrRestore={canArchiveOrRestore}
        dataSourceLabel={dataSourceLabel}
        onEditPatient={() => navigate(getPatientEditPath(patient.id))}
        onEditMedicalRecord={() =>
          navigate(getPatientMedicalRecordEditPath(patient.id))
        }
        onArchive={() => void handleLifecycleAction('archive')}
        onRestore={() => void handleLifecycleAction('restore')}
        onViewFullRecord={() =>
          openFullRecordSection('medical-record')
        }
      />

      <PatientTodayPanel
        patient={patient}
        isArchived={isArchived}
        canCompleteVisit={canCompleteVisit}
        onOpenAppointment={(appointmentId) =>
          navigate(getAppointmentDetailPath(appointmentId))
        }
        onOpenTimeline={() => openFullRecordSection('timeline')}
        onStartVisit={openVisitCompletion}
        onViewCompletedVisit={(visitId) =>
          navigate(getPatientVisitDetailPath(patient.id, visitId))
        }
      />

      <PatientLatestClinicalActivity
        patientId={patient.id}
        onOpenTimeline={() => openFullRecordSection('timeline')}
      />

      <PatientTreatmentPlanSummary
        patientId={patient.id}
        onOpenTreatmentPlans={() => openFullRecordSection('treatment-plans')}
      />

      <PatientFollowUpSummary
        patientId={patient.id}
        onOpenTimelineVisit={openTimelineVisit}
        onScheduleAppointment={openAppointmentForm}
      />

      <PatientAppointmentSummary
        patientId={patient.id}
        prefillReason={appointmentPrefillReason}
        prefillRequestId={appointmentPrefillRequestId}
      />

      <PatientQuickActions
        role={currentProfile.profile?.role ?? null}
        isArchived={isArchived}
        onCompleteVisit={() => openVisitCompletion()}
        onEditMedicalRecord={() =>
          navigate(getPatientMedicalRecordEditPath(patient.id))
        }
        onOpenAppointments={() => {
          document
            .getElementById('patient-appointments')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        onOpenClinicalNotes={() => openFullRecordSection('clinical-notes')}
        onOpenOdontogram={() => openFullRecordSection('odontogram')}
        onOpenTreatmentPlans={() => openFullRecordSection('treatment-plans')}
        onOpenTimeline={() => openFullRecordSection('timeline')}
      />

      <PatientFullRecord
        patient={patient}
        patientName={patientName}
        activePlanLabel={activePlanLabel}
        activeSection={fullRecordSection}
        onSectionChange={handleFullRecordSectionChange}
        canEditMedicalRecord={canEditMedicalRecord}
        canViewOdontogram={canViewOdontogram}
        canEditOdontogram={canEditOdontogram}
        canViewClinicalNotes={canViewClinicalNotes}
        canManageClinicalNotes={canViewClinicalNotes}
        canViewTreatmentPlans={canViewTreatmentPlans}
        canManageTreatmentPlans={canManageTreatmentPlans}
        highlightedVisitId={highlightedVisitId}
        isPatientArchived={isArchived}
        onEditMedicalRecord={() =>
          navigate(getPatientMedicalRecordEditPath(patient.id))
        }
      />
    </Page>
  )
}
