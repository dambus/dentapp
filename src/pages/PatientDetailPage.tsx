import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from '../components/ui'
import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import { ClinicalNotesSection } from '../features/patients/ClinicalNotesSection'
import { OdontogramSection } from '../features/patients/OdontogramSection'
import {
  formatDemoCurrency,
  formatPatientDate,
  formatPatientDateTime,
  getPatientAge,
  getPatientFullName,
  patientStatusLabels,
} from '../features/patients/patientDisplay'
import { PatientQuickActions } from '../features/patients/PatientQuickActions'
import { PatientSnapshot } from '../features/patients/PatientSnapshot'
import { PatientTodayPanel } from '../features/patients/PatientTodayPanel'
import {
  archivePatient,
  getPatientById,
  restorePatient,
} from '../features/patients/patientService'
import { TreatmentPlansSection } from '../features/patients/TreatmentPlansSection'
import type { DemoPatient, DemoTimelineEvent } from '../features/patients/types'
import {
  getPatientEditPath,
  getPatientMedicalRecordEditPath,
  routePaths,
} from '../routes/routePaths'
import type { AppRole } from '../types/navigation'

const futureModulePlaceholders = [
  'Visits',
  'Payments',
  'Documents',
  'Timeline',
]

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

const patientArchiveRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'reception_admin',
]

const isSupabasePatientMode =
  import.meta.env.VITE_PATIENT_DATA_SOURCE?.toLowerCase() === 'supabase'

type DetailItemProps = {
  label: string
  value: string
}

type RecordSectionProps = {
  title: string
  description: string
  children: ReactNode
}

type TimelineEventProps = {
  event: DemoTimelineEvent
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-950">{value}</dd>
    </div>
  )
}

function RecordSection({ title, description, children }: RecordSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function TimelineEventItem({ event }: TimelineEventProps) {
  return (
    <li className="relative pl-6">
      <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-teal-700" />
      <div className="text-sm font-medium text-slate-950">{event.label}</div>
      <div className="mt-1 text-xs text-slate-500">
        {formatPatientDate(event.date)}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {event.description}
      </p>
    </li>
  )
}

export function PatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const currentProfile = useCurrentProfile()
  const [patient, setPatient] = useState<DemoPatient | undefined>()
  const [hasLoadedPatient, setHasLoadedPatient] = useState(false)
  const [isLifecycleSubmitting, setIsLifecycleSubmitting] = useState(false)
  const [lifecycleError, setLifecycleError] = useState<string | null>(null)
  const [lifecycleSuccess, setLifecycleSuccess] = useState<string | null>(null)

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
  const hasMedicalWarnings = loadedPatient.medicalWarnings.length > 0
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
  const canArchiveOrRestore = currentProfile.profile
    ? patientArchiveRoles.includes(currentProfile.profile.role)
    : false
  const dataSourceLabel = isSupabasePatientMode ? 'Supabase mode' : 'Fake demo data'

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

  function scrollToPatientSection(sectionId: string) {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          document
            .getElementById('patient-full-record')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      />

      <PatientTodayPanel patient={patient} isArchived={isArchived} />

      <PatientQuickActions
        role={currentProfile.profile?.role ?? null}
        isArchived={isArchived}
        onEditMedicalRecord={() =>
          navigate(getPatientMedicalRecordEditPath(patient.id))
        }
        onOpenClinicalNotes={() =>
          scrollToPatientSection('patient-clinical-notes-section')
        }
        onOpenOdontogram={() =>
          scrollToPatientSection('patient-odontogram-section')
        }
        onOpenTreatmentPlans={() =>
          scrollToPatientSection('patient-treatment-plans-section')
        }
      />

      <div
        className="grid scroll-mt-6 gap-6 lg:grid-cols-[1fr_1fr]"
        id="patient-full-record"
      >
        <Card>
          <CardHeader>
            <CardTitle>Patient identity</CardTitle>
            <CardDescription>Basic profile and status.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Full name" value={patientName} />
              <DetailItem
                label="Status"
                value={patientStatusLabels[patient.status]}
              />
              <DetailItem
                label="Date of birth"
                value={formatPatientDate(patient.dateOfBirth)}
              />
              <DetailItem
                label="Age"
                value={`${getPatientAge(patient.dateOfBirth)} years`}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact information</CardTitle>
            <CardDescription>Demo contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4">
              <DetailItem label="Phone" value={patient.phone} />
              <DetailItem label="Email" value={patient.email} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment summary</CardTitle>
            <CardDescription>Visit and scheduling context.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4">
              <DetailItem
                label="Next appointment"
                value={formatPatientDateTime(patient.nextAppointment)}
              />
              <DetailItem
                label="Last visit"
                value={formatPatientDate(patient.lastVisit)}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treatment and balance</CardTitle>
            <CardDescription>Foundation-only overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4">
              <DetailItem label="Active treatment plan" value={activePlanLabel} />
              <DetailItem
                label="Demo unpaid balance"
                value={formatDemoCurrency(patient.unpaidBalance)}
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecordSection
          title="Clinical summary"
          description="Read-only clinical overview for the demo profile."
        >
          <p className="text-sm leading-6 text-slate-700">
            {patient.lastClinicalNote}
          </p>
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-950">
              Next recommended step
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {patient.nextRecommendedStep}
            </p>
          </div>
        </RecordSection>

        <RecordSection
          title="Medical warnings"
          description="Clinical warning summary from the patient medical record."
        >
          {hasMedicalWarnings ? (
            <div className="flex flex-wrap gap-2">
              {patient.medicalWarnings.map((warning) => (
                <Badge key={warning} variant="warning">
                  {warning}
                </Badge>
              ))}
            </div>
          ) : (
            <Badge variant="neutral">No demo medical warnings</Badge>
          )}
        </RecordSection>

        <RecordSection
          title="Anamnesis summary"
          description="Structured medical history summary."
        >
          <p className="text-sm leading-6 text-slate-700">
            {patient.anamnesisSummary}
          </p>
        </RecordSection>

        <RecordSection
          title="Allergies"
          description="Allergy information from the medical record."
        >
          <p className="text-sm leading-6 text-slate-700">
            {patient.allergies || 'No allergies recorded.'}
          </p>
        </RecordSection>

        <RecordSection
          title="Current medications"
          description="Medication information from the medical record."
        >
          <p className="text-sm leading-6 text-slate-700">
            {patient.currentMedications || 'No current medications recorded.'}
          </p>
        </RecordSection>

        <RecordSection
          title="Dental history"
          description="Previous dental context from the medical record."
        >
          <p className="text-sm leading-6 text-slate-700">
            {patient.dentalHistorySummary}
          </p>
        </RecordSection>

        <RecordSection
          title="Risk notes"
          description="Clinical risk notes from the medical record."
        >
          <p className="text-sm leading-6 text-slate-700">
            {patient.riskNotes || 'No risk notes recorded.'}
          </p>
        </RecordSection>

        <RecordSection
          title="Active treatment plan summary"
          description="Read-only foundation for future treatment plan modules."
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={patient.activeTreatmentPlan ? 'info' : 'neutral'}>
              {activePlanLabel}
            </Badge>
            <Badge variant="neutral">Demo summary</Badge>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {patient.activeTreatmentPlanSummary}
          </p>
        </RecordSection>

        <RecordSection
          title="Visit summary"
          description="Recent visit context without visit CRUD."
        >
          <dl className="grid gap-4">
            <DetailItem
              label="Last visit"
              value={formatPatientDate(patient.lastVisit)}
            />
            <DetailItem
              label="Recent visit summary"
              value={patient.recentVisitSummary}
            />
          </dl>
        </RecordSection>
      </div>

      {canViewOdontogram ? (
        <div className="scroll-mt-6" id="patient-odontogram-section">
          <OdontogramSection
            patientId={patient.id}
            canEditOdontogram={canEditOdontogram}
            isPatientArchived={isArchived}
          />
        </div>
      ) : null}

      {canViewClinicalNotes ? (
        <div className="scroll-mt-6" id="patient-clinical-notes-section">
          <ClinicalNotesSection
            patientId={patient.id}
            canManageNotes={canViewClinicalNotes}
            isPatientArchived={isArchived}
          />
        </div>
      ) : null}

      {canViewTreatmentPlans ? (
        <div className="scroll-mt-6" id="patient-treatment-plans-section">
          <TreatmentPlansSection
            patientId={patient.id}
            canManageTreatmentPlans={canManageTreatmentPlans}
            isPatientArchived={isArchived}
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <RecordSection
          title="Documents placeholder"
          description="Document storage and upload are future scoped work."
        >
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-950">
              {patient.documentsCount} demo document references
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No real documents are stored. Document upload, secure storage, and
              file permissions will be implemented later.
            </p>
          </div>
        </RecordSection>

        <RecordSection
          title="Timeline placeholder"
          description="Demo events for future patient timeline structure."
        >
          <ol className="space-y-5">
            {patient.timelineEvents.map((event) => (
              <TimelineEventItem event={event} key={event.id} />
            ))}
          </ol>
        </RecordSection>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Future patient workspace</CardTitle>
          <CardDescription>
            Section placeholders for later scoped Phase 2 and clinical modules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {futureModulePlaceholders.map((section) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
                key={section}
              >
                <div className="font-medium text-slate-950">{section}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Read-only placeholder.
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}
