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
import {
  formatDemoCurrency,
  formatPatientDate,
  formatPatientDateTime,
  getPatientAge,
  getPatientFullName,
  patientStatusBadgeVariants,
  patientStatusLabels,
} from '../features/patients/patientDisplay'
import { getPatientById } from '../features/patients/patientService'
import type { DemoPatient, DemoTimelineEvent } from '../features/patients/types'
import { getPatientEditPath, routePaths } from '../routes/routePaths'

const futureModulePlaceholders = [
  'Odontogram',
  'Treatment Plans',
  'Visits',
  'Payments',
  'Documents',
  'Timeline',
]

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
          title="Patient not found"
          description="The requested demo patient profile does not exist in the local fake dataset."
          actions={
            <Button variant="secondary" onClick={() => navigate(routePaths.patients)}>
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

  const patientName = getPatientFullName(patient)
  const importantNoteLabel = patient.importantNote ?? 'No important note recorded.'
  const activePlanLabel = patient.activeTreatmentPlan ?? 'No active plan'
  const hasMedicalWarnings = patient.medicalWarnings.length > 0

  return (
    <Page>
      <PageHeader
        title={patientName}
        description="Patient profile overview. Demo mode remains non-persistent; Supabase mode supports patient create and basic profile updates."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">Fake demo data</Badge>
            <Button onClick={() => navigate(getPatientEditPath(patient.id))}>
              Edit patient
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(routePaths.patients)}
            >
              Back to patients
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={patientStatusBadgeVariants[patient.status]}>
                {patientStatusLabels[patient.status]}
              </Badge>
              {patient.importantNote ? (
                <Badge variant="info">Important note recorded</Badge>
              ) : (
                <Badge variant="neutral">No important note</Badge>
              )}
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              This overview uses only fictional Phase 2 data and is intended to
              validate patient profile structure before real records,
              permissions, and audit behavior are implemented.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <div className="font-medium text-slate-950">
              Demo unpaid balance
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-950">
              {formatDemoCurrency(patient.unpaidBalance)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Important note</CardTitle>
            <CardDescription>Administrative patient-level note.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-700">{importantNoteLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next appointment</CardTitle>
            <CardDescription>Upcoming scheduled context.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-slate-950">
              {formatPatientDateTime(patient.nextAppointment)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active plan</CardTitle>
            <CardDescription>Current treatment planning signal.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={patient.activeTreatmentPlan ? 'info' : 'neutral'}>
              {activePlanLabel}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial summary</CardTitle>
            <CardDescription>Demo value only.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-slate-950">
              {formatDemoCurrency(patient.unpaidBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
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
          description="Demo-safe flags that will later be permission-aware."
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
          description="Placeholder for structured medical history."
        >
          <p className="text-sm leading-6 text-slate-700">
            {patient.anamnesisSummary}
          </p>
        </RecordSection>

        <RecordSection
          title="Dental history"
          description="Placeholder for previous dental context."
        >
          <p className="text-sm leading-6 text-slate-700">
            {patient.dentalHistorySummary}
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
