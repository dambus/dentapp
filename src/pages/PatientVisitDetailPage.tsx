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
import {
  appointmentStatusBadgeVariants,
  appointmentStatusLabels,
  formatAppointmentTimeRange,
} from '../features/appointments/appointmentDisplay'
import {
  fetchCompletedVisitById,
  type CompletedVisitDetail,
  type VisitNextStep,
} from '../features/visits/visitCompletionService'
import {
  getPatientDetailPath,
  getPatientFollowUpSchedulingPath,
  routePaths,
} from '../routes/routePaths'

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
  const hasNextStep = Boolean(visit.nextStep)
  const hasFollowUp = hasRecommendation || (hasNextStep && visit.nextStep !== 'no_follow_up')
  const generatedAt = formatPatientDateTime(new Date().toISOString())
  const providerLabel = visit.completedByName ?? 'Provider not recorded'
  const followUpSchedulingReason = hasRecommendation
    ? visit.recommendation
    : getNextStepLabel(visit.nextStep)

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
          <h2 className="text-2xl font-semibold text-slate-950">
            DentApp Visit Review
          </h2>
          <p className="mt-1 text-sm text-slate-700">Generated {generatedAt}</p>
        </section>

        <Card
          className="print-visit-detail-card border-teal-100 bg-teal-50/30 shadow-sm"
          data-testid="completed-visit-detail-overview"
        >
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>
                    Completed visit - {formatPatientDate(visit.visitDate)}
                  </CardTitle>
                  <Badge variant="success">Completed</Badge>
                  <Badge variant="neutral">Read-only</Badge>
                  {visit.linkedAppointment ? (
                    <Badge variant="info">Appointment-linked</Badge>
                  ) : null}
                </div>
                <CardDescription>
                  Completed {formatPatientDateTime(visit.completedAt)} by{' '}
                  {providerLabel}.
                </CardDescription>
              </div>
              <Badge variant={visit.procedures.length > 0 ? 'info' : 'neutral'}>
                {visit.procedures.length}{' '}
                {visit.procedures.length === 1 ? 'procedure' : 'procedures'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              <MetricTile
                label="Provider"
                value={providerLabel}
                description="Completed-by profile when available."
                tone={visit.completedByName ? 'success' : 'default'}
              />
            </div>
          </CardContent>
        </Card>

        {visit.linkedAppointment ? (
          <Card
            className="print-visit-detail-card border-cyan-200 bg-cyan-50/40 shadow-sm"
            data-testid="completed-visit-appointment-context"
          >
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>Linked Appointment</CardTitle>
                    <Badge
                      variant={
                        appointmentStatusBadgeVariants[
                          visit.linkedAppointment.status as keyof typeof appointmentStatusBadgeVariants
                        ] ?? 'info'
                      }
                    >
                      {appointmentStatusLabels[
                        visit.linkedAppointment.status as keyof typeof appointmentStatusLabels
                      ] ?? visit.linkedAppointment.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Scheduled{' '}
                    {formatAppointmentTimeRange(
                      visit.linkedAppointment.scheduledStart,
                      visit.linkedAppointment.scheduledEnd,
                    )}
                    .
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
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

        <Card
          className="print-visit-detail-card border-slate-200 shadow-sm"
          data-testid="completed-visit-detail-procedures"
        >
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle>Procedures</CardTitle>
              <CardDescription>
                Performed work recorded during Visit Completion.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {visit.procedures.length > 0 ? (
              <ol className="space-y-3 sm:space-y-4">
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
                No procedures were recorded for this completed visit. Review
                the clinical note, recommendation, and next step for the
                completed record.
              </InlineNotice>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card
            className="print-visit-detail-card border-slate-200 shadow-sm"
            data-testid="completed-visit-detail-clinical-note"
          >
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle>Clinical Note</CardTitle>
                <CardDescription>Read-only clinical note captured at completion.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-700">
                {hasClinicalNote
                  ? visit.clinicalNote
                  : 'No clinical note recorded for this completed visit.'}
              </p>
            </CardContent>
          </Card>

          <Card
            className="print-visit-detail-card border-slate-200 shadow-sm"
            data-testid="completed-visit-detail-recommendation"
          >
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle>Recommendation</CardTitle>
                <CardDescription>Clinical guidance recorded during Visit Completion.</CardDescription>
              </div>
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

        <Card
          className="print-visit-detail-card border-amber-200 bg-amber-50/40 shadow-sm"
          data-testid="completed-visit-detail-follow-up"
        >
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>Follow-up / Next Step</CardTitle>
                  {hasFollowUp ? (
                    <Badge variant="warning">Review next action</Badge>
                  ) : (
                    <Badge variant="neutral">No follow-up signal</Badge>
                  )}
                </div>
                <CardDescription>
                  Clinical guidance recorded during Visit Completion.
                </CardDescription>
              </div>
              {hasFollowUp ? (
                <Button
                  className="min-h-10 print-hidden"
                  data-testid="completed-visit-detail-schedule-follow-up"
                  onClick={() =>
                    navigate(
                      getPatientFollowUpSchedulingPath(
                        patient.id,
                        followUpSchedulingReason,
                      ),
                    )
                  }
                  size="sm"
                  variant="secondary"
                >
                  Schedule follow-up
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {hasFollowUp ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricTile
                    label="Source visit"
                    value={formatPatientDate(visit.visitDate)}
                    description={
                      visit.linkedAppointment
                        ? 'Recorded from an appointment-linked completed visit.'
                        : 'Recorded from a completed visit.'
                    }
                    tone="warning"
                  />
                  <MetricTile
                    label="Suggested next step"
                    value={getNextStepLabel(visit.nextStep)}
                    description="Captured as clinical guidance, not scheduling."
                    tone={hasNextStep ? 'success' : 'default'}
                  />
                </div>
                {hasRecommendation ? (
                  <div className="rounded-md border border-amber-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-950">
                      Recommendation
                    </div>
                    <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-700">
                      {visit.recommendation}
                    </p>
                  </div>
                ) : null}
                <InlineNotice variant="info">
                  This follow-up guidance does not create an appointment,
                  treatment-plan task, reminder, billing item, or material
                  record.
                </InlineNotice>
              </>
            ) : (
              <div className="rounded-md border border-slate-200 bg-white p-5">
                <p className="text-sm leading-6 text-slate-600">
                  No follow-up guidance was recorded for this completed visit.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {visit.warnings.map((warning) => (
          <InlineNotice
            key={`${warning.code}-${warning.message}`}
            data-testid="completed-visit-detail-warning"
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
