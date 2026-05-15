import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
  ErrorState,
  InlineNotice,
  LoadingState,
  MetricTile,
} from '../components/ui'
import {
  formatPatientDate,
  formatPatientDateTime,
  getPatientFullName,
} from '../features/patients/patientDisplay'
import { getPatientById } from '../features/patients/patientService'
import type { DemoPatient } from '../features/patients/types'
import { appointmentStatusLabels } from '../features/appointments/appointmentDisplay'
import {
  fetchCompletedVisitById,
  type CompletedVisitDetail,
  type VisitNextStep,
} from '../features/visits/visitCompletionService'
import { getPatientDetailPath, routePaths } from '../routes/routePaths'

const nextStepLabels: Record<VisitNextStep, string> = {
  no_follow_up: 'No follow-up needed',
  follow_up_recommended: 'Follow-up recommended',
  schedule_control_visit: 'Schedule control visit',
  continue_treatment_plan: 'Continue treatment plan',
  additional_diagnostics: 'Additional diagnostics',
  referral: 'Referral / specialist consultation',
}

function getNextStepLabel(nextStep: CompletedVisitDetail['nextStep']) {
  return nextStep ? nextStepLabels[nextStep] : 'Not selected'
}

function getVisitDetailErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'Completed visit detail could not be loaded for the current role.'
  }

  if (normalizedMessage.includes('not completed')) {
    return 'This visit is not completed yet, so read-only review is unavailable.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network')
  ) {
    return 'Completed visit detail could not be loaded. Check the local Supabase connection and try again.'
  }

  return message || 'Completed visit detail could not be loaded.'
}

function getTimelinePath(patientId: string) {
  return `${getPatientDetailPath(patientId)}?section=timeline`
}

export function PatientVisitDetailPage() {
  const { patientId, visitId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<DemoPatient | undefined>()
  const [visit, setVisit] = useState<CompletedVisitDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function loadVisitDetail() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const [loadedPatient, loadedVisit] = await Promise.all([
          getPatientById(patientId),
          patientId && visitId
            ? fetchCompletedVisitById(patientId, visitId)
            : Promise.resolve(null),
        ])

        if (!isCurrent) {
          return
        }

        setPatient(loadedPatient)
        setVisit(loadedVisit)
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(
            getVisitDetailErrorMessage(
              error instanceof Error ? error.message : null,
            ),
          )
        }
      } finally {
        if (isCurrent) {
          setHasLoaded(true)
          setIsLoading(false)
        }
      }
    }

    void loadVisitDetail()

    return () => {
      isCurrent = false
    }
  }, [patientId, visitId])

  if (!hasLoaded || isLoading) {
    return (
      <Page>
        <LoadingState label="Loading completed visit..." />
      </Page>
    )
  }

  if (!patientId || !visitId || !patient) {
    return (
      <Page>
        <PageHeader
          title="Visit detail unavailable"
          description="The requested patient or visit route is incomplete."
          actions={
            <Button
              onClick={() => navigate(routePaths.patients)}
              variant="secondary"
            >
              Back to patients
            </Button>
          }
        />
        <EmptyState
          title="No matching patient"
          description="Open an existing patient before reviewing completed visits."
        />
      </Page>
    )
  }

  const patientName = getPatientFullName(patient)

  if (errorMessage) {
    return (
      <Page>
        <PageHeader
          title="Completed visit review"
          description={patientName}
          actions={
            <Button
              onClick={() => navigate(getTimelinePath(patient.id))}
              variant="secondary"
            >
              Back to timeline
            </Button>
          }
        />
        <ErrorState
          title="Visit detail unavailable"
          description={errorMessage}
        />
      </Page>
    )
  }

  if (!visit) {
    return (
      <Page>
        <PageHeader
          title="Completed visit review"
          description={patientName}
          actions={
            <Button
              onClick={() => navigate(getTimelinePath(patient.id))}
              variant="secondary"
            >
              Back to timeline
            </Button>
          }
        />
        <EmptyState
          title="Completed visit not found"
          description="This completed visit could not be found for the current patient."
        />
      </Page>
    )
  }

  const hasClinicalNote = Boolean(visit.clinicalNote.trim())
  const hasRecommendation = Boolean(visit.recommendation.trim())
  const generatedAt = formatPatientDateTime(new Date().toISOString())

  function handlePrintReview() {
    window.print()
  }

  return (
    <Page>
      <PageHeader
        title="Completed Visit Review"
        description={`Read-only clinical record for ${patientName}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="print-hidden">
              <Button onClick={handlePrintReview} variant="primary">
                Print review
              </Button>
            </div>
            <Button
              onClick={() => navigate(getTimelinePath(patient.id))}
              variant="secondary"
            >
              Back to timeline
            </Button>
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 print-visit-detail">
        <section className="print-only border-b border-slate-300 pb-3">
          <h2 className="text-2xl font-semibold text-slate-950">DentApp Visit Review</h2>
          <p className="mt-1 text-sm text-slate-700">Generated {generatedAt}</p>
        </section>

        <Card className="print-visit-detail-card border-teal-100 bg-teal-50/30 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{formatPatientDate(visit.visitDate)}</CardTitle>
                  <Badge variant="success">Completed</Badge>
                  <Badge variant="neutral">Read-only</Badge>
                </div>
                <CardDescription>
                  Completed {formatPatientDateTime(visit.completedAt)}.
                </CardDescription>
              </div>
              <Badge variant={visit.procedures.length > 0 ? 'info' : 'neutral'}>
                {visit.procedures.length}{' '}
                {visit.procedures.length === 1 ? 'procedure' : 'procedures'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <MetricTile
                label="Patient"
                value={patientName}
                description={patient.phone || 'No phone recorded.'}
                tone="info"
              />
              <MetricTile
                label="Visit date"
                value={formatPatientDate(visit.visitDate)}
                description={`Created ${formatPatientDateTime(visit.createdAt)}.`}
                tone="success"
              />
              <MetricTile
                label="Next step"
                value={getNextStepLabel(visit.nextStep)}
                description="Captured during Visit Completion."
                tone={visit.nextStep ? 'warning' : 'default'}
              />
            </div>
          </CardContent>
        </Card>

        {visit.linkedAppointment ? (
          <Card className="print-visit-detail-card border-cyan-200 bg-cyan-50/40 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Linked Appointment</CardTitle>
                <Badge variant="info">
                  {appointmentStatusLabels[
                    visit.linkedAppointment.status as keyof typeof appointmentStatusLabels
                  ] ?? visit.linkedAppointment.status}
                </Badge>
              </div>
              <CardDescription>
                Scheduled {formatPatientDateTime(visit.linkedAppointment.scheduledStart)}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">
                {visit.linkedAppointment.reason?.trim() ||
                  'No appointment reason recorded.'}
              </p>
              {visit.linkedAppointment.notes?.trim() ? (
                <InlineNotice variant="neutral">
                  {visit.linkedAppointment.notes}
                </InlineNotice>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card className="print-visit-detail-card border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Procedures</CardTitle>
            <CardDescription>
              Performed work recorded during Visit Completion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {visit.procedures.length > 0 ? (
              <ol className="space-y-3">
                {visit.procedures.map((procedure, index) => (
                  <li
                    className="print-procedure-item rounded-md border border-slate-200 bg-slate-50 p-4"
                    key={procedure.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">#{index + 1}</Badge>
                      <div className="font-semibold text-slate-950">
                        {procedure.procedureName}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <MetricTile
                        label="Tooth / region"
                        value={procedure.toothOrRegion || 'Not recorded'}
                        description="Clinical location."
                        tone={procedure.toothOrRegion ? 'info' : 'default'}
                      />
                      <MetricTile
                        label="Quantity / duration"
                        value={procedure.quantityOrDuration || 'Not recorded'}
                        description="Recorded work amount."
                        tone={procedure.quantityOrDuration ? 'info' : 'default'}
                      />
                    </div>
                    {procedure.note ? (
                      <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">
                        {procedure.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <InlineNotice variant="neutral">
                No procedures were recorded for this completed visit.
              </InlineNotice>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="print-visit-detail-card border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Clinical Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-700">
                {hasClinicalNote
                  ? visit.clinicalNote
                  : 'No clinical note recorded.'}
              </p>
            </CardContent>
          </Card>

          <Card className="print-visit-detail-card border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-700">
                {hasRecommendation
                  ? visit.recommendation
                  : 'No recommendation recorded.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {visit.warnings.map((warning) => (
          <InlineNotice
            key={`${warning.code}-${warning.message}`}
            variant={
              warning.code === 'clinical_note_unavailable' ? 'warning' : 'info'
            }
          >
            {warning.message}
          </InlineNotice>
        ))}
      </div>
    </Page>
  )
}
