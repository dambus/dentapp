import { ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import {
  BackLink,
  Badge,
  Button,
  EmptyState,
  SectionTabs,
  Select,
} from '../components/ui'
import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import { PatientAppointmentSummary } from '../features/patients/PatientAppointmentSummary'
import { PatientFullRecord } from '../features/patients/PatientFullRecord'
import { PatientFollowUpSummary } from '../features/patients/PatientFollowUpSummary'
import { PatientLatestClinicalActivity } from '../features/patients/PatientLatestClinicalActivity'
import { getPatientFullName } from '../features/patients/patientDisplay'
import { PatientSnapshot } from '../features/patients/PatientSnapshot'
import { PatientTodayPanel } from '../features/patients/PatientTodayPanel'
import { PatientTreatmentPlanSummary } from '../features/patients/PatientTreatmentPlanSummary'
import {
  getPatientWorkspaceSection,
  getPatientWorkspaceSectionLabel,
  type PatientWorkspaceSection,
} from '../features/patients/patientWorkspaceSections'
import {
  archivePatient,
  getPatientById,
  restorePatient,
} from '../features/patients/patientService'
import type { DemoPatient } from '../features/patients/types'
import {
  getAppointmentDetailPath,
  getPatientEditPath,
  getPatientFollowUpSchedulingPath,
  getPatientMedicalRecordEditPath,
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

const treatmentPlanManageRoles: AppRole[] = [
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

function scrollPatientSectionIntoView() {
  window.setTimeout(() => {
    document
      .getElementById('patient-section-navigation')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 0)
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
  const [showBackToTop, setShowBackToTop] = useState(false)

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
    function handleScroll() {
      setShowBackToTop(window.scrollY > 900)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.delete('scheduleFollowUp')
      nextParams.set('section', 'overview')
      return nextParams
    })

    scrollPatientSectionIntoView()
  }, [patient, searchParams, setSearchParams])

  if (!hasLoadedPatient) {
    return null
  }

  if (!patient) {
    return (
      <Page>
        <PageHeader
          title="Patient not found"
          description="The requested patient profile could not be found in this environment."
          navigation={
            <BackLink
              label="Back to patients"
              onClick={() => navigate(routePaths.patients)}
            />
          }
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
          title="Patient is not available"
          description="Check the patient link or return to the patient list."
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
    ? treatmentPlanManageRoles.includes(currentProfile.profile.role) && !isArchived
    : false
  const canCompleteVisit = currentProfile.profile
    ? visitCompletionRoles.includes(currentProfile.profile.role)
    : false
  const canArchiveOrRestore = currentProfile.profile
    ? patientArchiveRoles.includes(currentProfile.profile.role)
    : false
  const dataSourceLabel = isSupabasePatientMode ? 'Supabase mode' : 'Fake demo data'
  const highlightedVisitId = searchParams.get('visitId')

  const requestedSection = searchParams.get('section')
  const parsedSection = getPatientWorkspaceSection(requestedSection)
  const availableSections: PatientWorkspaceSection[] = [
    'overview',
    'medical-record',
    ...(canViewTreatmentPlans ? (['treatment-plans'] as const) : []),
    'timeline',
    ...(canViewOdontogram ? (['odontogram'] as const) : []),
    'documents',
  ]
  const activeSection = availableSections.includes(parsedSection.section)
    ? parsedSection.section
    : 'overview'
  const recordFocus =
    parsedSection.focus === 'clinical-notes' ? 'clinical-notes' : null

  const sectionItems = availableSections.map((section) => ({
    id: section,
    label: getPatientWorkspaceSectionLabel(section),
  }))

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

  function updateWorkspaceSection(section: PatientWorkspaceSection | 'clinical-notes') {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      if (section === 'overview') {
        nextParams.delete('section')
      } else {
        nextParams.set('section', section)
      }

      if (section !== 'timeline') {
        nextParams.delete('visitId')
      }

      return nextParams
    })
  }

  function openPatientSection(section: PatientWorkspaceSection | 'clinical-notes') {
    updateWorkspaceSection(section)
    scrollPatientSectionIntoView()
  }

  function openTimelineVisit(visitId: string) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.set('section', 'timeline')
      nextParams.set('visitId', visitId)
      return nextParams
    })
    scrollPatientSectionIntoView()
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
        backNavigation={
          <BackLink
            label="Back to patients"
            onClick={() => navigate(routePaths.patients)}
          />
        }
        onEditPatient={() => navigate(getPatientEditPath(patient.id))}
        onEditMedicalRecord={() =>
          navigate(getPatientMedicalRecordEditPath(patient.id))
        }
        onArchive={() => void handleLifecycleAction('archive')}
        onRestore={() => void handleLifecycleAction('restore')}
      />

      <section
        className="space-y-3"
        data-testid="patient-section-navigation"
        id="patient-section-navigation"
      >
        <div className="hidden sm:block">
          <SectionTabs
            activeId={activeSection}
            ariaLabel="Patient workspace sections"
            items={sectionItems}
            onChange={(section) =>
              openPatientSection(section as PatientWorkspaceSection)
            }
          />
        </div>

        <div
          className="sticky top-0 z-20 -mx-4 border-y border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:hidden"
          data-testid="patient-sticky-navigation"
        >
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Patient section
            </span>
            <Select
              aria-label="Patient record section"
              className="mt-1"
              data-testid="patient-section-selector"
              onChange={(event) =>
                openPatientSection(
                  event.target.value as PatientWorkspaceSection,
                )
              }
              value={activeSection}
            >
              {sectionItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </section>

      <div
        className="space-y-5 sm:min-h-[calc(100dvh-22rem)]"
        data-testid="patient-workspace-section-shell"
      >
        {activeSection === 'overview' ? (
          <div className="space-y-5" data-testid="patient-overview-section">
          <section
            className="space-y-4 sm:space-y-5"
            data-testid="patient-clinical-workflow-entry"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  Current workflow
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Start with the current appointment or visit, then use
                  treatment planning and scheduling as supporting context.
                </p>
              </div>
              <Badge variant="info">Overview</Badge>
            </div>

            <PatientTodayPanel
              patient={patient}
              isArchived={isArchived}
              canCompleteVisit={canCompleteVisit}
              onOpenAppointment={(appointmentId) =>
                navigate(getAppointmentDetailPath(appointmentId))
              }
              onOpenTimeline={() => openPatientSection('timeline')}
              onStartVisit={openVisitCompletion}
              onViewCompletedVisit={(visitId) =>
                navigate(getPatientVisitDetailPath(patient.id, visitId))
              }
            />
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <PatientTreatmentPlanSummary
              patientId={patient.id}
              onOpenTreatmentPlans={() => openPatientSection('treatment-plans')}
            />

            <PatientAppointmentSummary
              patientId={patient.id}
              prefillReason={appointmentPrefillReason}
              prefillRequestId={appointmentPrefillRequestId}
            />
          </div>

          <section
            className="space-y-4 sm:space-y-5"
            data-testid="patient-clinical-context"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Recent clinical context
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Review the latest completed visit and follow-up guidance without
                opening full history by default.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <PatientLatestClinicalActivity
                patientId={patient.id}
                onOpenTimeline={() => openPatientSection('timeline')}
              />

              <PatientFollowUpSummary
                patientId={patient.id}
                onOpenTimelineVisit={openTimelineVisit}
                onScheduleAppointment={openAppointmentForm}
              />
            </div>
          </section>
          </div>
        ) : (
          <PatientFullRecord
            patient={patient}
            patientName={patientName}
            activePlanLabel={activePlanLabel}
            activeSection={activeSection}
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
            recordFocus={recordFocus}
          />
        )}
      </div>

      {showBackToTop ? (
        <Button
          aria-label="Back to top"
          className="fixed bottom-4 right-4 z-20 min-h-10 rounded-full px-3 shadow-lg sm:hidden"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
          }
          size="sm"
          variant="secondary"
        >
          <ChevronUp aria-hidden className="h-4 w-4" />
          Top
        </Button>
      ) : null}
    </Page>
  )
}
