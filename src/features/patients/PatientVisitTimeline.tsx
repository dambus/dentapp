import { useEffect, useMemo, useState } from 'react'

import {
  Badge,
  Button,
  ButtonLink,
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
} from '../../components/ui'
import { classNames } from '../../lib/classNames'
import { getPatientVisitDetailPath } from '../../routes/routePaths'
import {
  fetchCompletedVisitsForPatient,
  type VisitCompletionDraft,
  type VisitNextStep,
} from '../visits/visitCompletionService'
import { formatPatientDate, formatPatientDateTime } from './patientDisplay'

type PatientVisitTimelineProps = {
  patientId: string
  highlightedVisitId?: string | null
}

const nextStepLabels: Record<VisitNextStep, string> = {
  no_follow_up: 'No follow-up needed',
  follow_up_recommended: 'Follow-up recommended',
  schedule_control_visit: 'Schedule control visit',
  continue_treatment_plan: 'Continue treatment plan',
  additional_diagnostics: 'Additional diagnostics',
  referral: 'Referral / specialist consultation',
}

function getTimelineErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'Completed visits could not be loaded for the current role.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network')
  ) {
    return 'Completed visits could not be loaded. Check the local Supabase connection and try again.'
  }

  return 'Completed visits could not be loaded.'
}

function getProcedureSummary(visit: VisitCompletionDraft) {
  if (visit.procedures.length === 0) {
    return 'No procedures recorded'
  }

  return visit.procedures
    .map((procedure) => {
      const details = [
        procedure.toothOrRegion,
        procedure.quantityOrDuration,
      ].filter(Boolean)

      return details.length > 0
        ? `${procedure.procedureName} (${details.join(', ')})`
        : procedure.procedureName
    })
    .join(', ')
}

function getVisitDisplayDate(visit: VisitCompletionDraft) {
  return visit.completedAt ?? visit.visitDate ?? visit.createdAt
}

function getNextStepLabel(nextStep: VisitCompletionDraft['nextStep']) {
  return nextStep ? nextStepLabels[nextStep] : 'Not selected'
}

function hasFollowUpSignal(visit: VisitCompletionDraft) {
  return (
    Boolean(visit.recommendation.trim()) ||
    Boolean(visit.nextStep && visit.nextStep !== 'no_follow_up')
  )
}

function VisitTimelineItem({
  isHighlighted,
  patientId,
  visit,
}: {
  isHighlighted: boolean
  patientId: string
  visit: VisitCompletionDraft
}) {
  const procedureSummary = getProcedureSummary(visit)
  const hasClinicalNote = Boolean(visit.clinicalNote.trim())
  const hasRecommendation = Boolean(visit.recommendation.trim())
  const hasNextStep = Boolean(visit.nextStep)
  const hasFollowUp = hasFollowUpSignal(visit)

  return (
    <li className="relative scroll-mt-6 pl-5 sm:pl-7" id={`visit-${visit.id}`}>
      <span className="absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-white bg-teal-700 shadow ring-2 ring-teal-100" />
      <Card
        className={classNames(
          'border-slate-200 shadow-sm',
          isHighlighted ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-100' : '',
        )}
      >
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">
                  {formatPatientDate(getVisitDisplayDate(visit))}
                </CardTitle>
                <Badge variant="success">Completed</Badge>
                {hasFollowUp ? (
                  <Badge variant="warning">
                    {hasNextStep ? getNextStepLabel(visit.nextStep) : 'Recommendation recorded'}
                  </Badge>
                ) : null}
              </div>
              <CardDescription>
                Completed {formatPatientDateTime(visit.completedAt)}.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={visit.procedures.length > 0 ? 'info' : 'neutral'}>
                {visit.procedures.length}{' '}
                {visit.procedures.length === 1 ? 'procedure' : 'procedures'}
              </Badge>
              <ButtonLink
                size="sm"
                to={getPatientVisitDetailPath(patientId, visit.id)}
                variant="secondary"
              >
                View details
              </ButtonLink>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <MetricTile
              label="Procedure summary"
              value={procedureSummary}
              description={
                visit.procedures.length > 0
                  ? 'Performed work recorded during visit completion.'
                  : 'This visit was completed from note or next-step context.'
              }
              tone={visit.procedures.length > 0 ? 'info' : 'default'}
            />
            <MetricTile
              label="Next step"
              value={getNextStepLabel(visit.nextStep)}
              description="Captured from the completed visit."
              tone={hasNextStep ? 'success' : 'default'}
            />
          </div>

          {visit.procedures.length > 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">
                Procedures
              </div>
              <ul className="mt-3 space-y-3">
                {visit.procedures.map((procedure) => (
                  <li
                    className="rounded-md border border-slate-200 bg-white px-3 py-2"
                    key={procedure.id}
                  >
                    <div className="text-sm font-semibold text-slate-950">
                      {procedure.procedureName}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                      {procedure.toothOrRegion ? (
                        <span>{procedure.toothOrRegion}</span>
                      ) : null}
                      {procedure.quantityOrDuration ? (
                        <span>{procedure.quantityOrDuration}</span>
                      ) : null}
                    </div>
                    {procedure.note ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {procedure.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-950">
                Clinical note
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {hasClinicalNote ? visit.clinicalNote : 'No clinical note recorded.'}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-950">
                Recommendation
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {hasRecommendation
                  ? visit.recommendation
                  : 'No recommendation recorded.'}
              </p>
            </div>
          </div>

          {visit.warnings.map((warning) => (
            <InlineNotice
              key={`${visit.id}-${warning.code}-${warning.message}`}
              variant={
                warning.code === 'clinical_note_unavailable'
                  ? 'warning'
                  : 'info'
              }
            >
              {warning.message}
            </InlineNotice>
          ))}
        </CardContent>
      </Card>
    </li>
  )
}

export function PatientVisitTimeline({
  highlightedVisitId,
  patientId,
}: PatientVisitTimelineProps) {
  const [visits, setVisits] = useState<VisitCompletionDraft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadCompletedVisits(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    setErrorMessage(null)

    try {
      const completedVisits = await fetchCompletedVisitsForPatient(patientId)
      setVisits(completedVisits)
    } catch (error) {
      setErrorMessage(
        getTimelineErrorMessage(error instanceof Error ? error.message : null),
      )
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitialVisits() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const completedVisits = await fetchCompletedVisitsForPatient(patientId)

        if (isCurrent) {
          setVisits(completedVisits)
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(
            getTimelineErrorMessage(
              error instanceof Error ? error.message : null,
            ),
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialVisits()

    return () => {
      isCurrent = false
    }
  }, [patientId])

  useEffect(() => {
    if (!highlightedVisitId || isLoading || errorMessage) {
      return
    }

    window.setTimeout(() => {
      document
        .getElementById(`visit-${highlightedVisitId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
  }, [errorMessage, highlightedVisitId, isLoading, visits])

  const totalProcedures = useMemo(
    () =>
      visits.reduce((total, visit) => total + visit.procedures.length, 0),
    [visits],
  )

  if (isLoading) {
    return <LoadingState label="Loading completed visits..." />
  }

  if (errorMessage) {
    return (
      <ErrorState
        title="Visit history unavailable"
        description={errorMessage}
        action={
          <Button onClick={() => void loadCompletedVisits()}>
            Try again
          </Button>
        }
      />
    )
  }

  if (visits.length === 0) {
    return (
      <EmptyState
        title="No completed visits yet"
        description="Completed Visit Completion records will appear here after the workflow is completed for this patient."
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricTile
          label="Completed visits"
          value={String(visits.length)}
          description="Newest completed visits are shown first."
          tone="success"
        />
        <MetricTile
          label="Recorded procedures"
          value={String(totalProcedures)}
          description="Total procedures across completed visits."
          tone={totalProcedures > 0 ? 'info' : 'default'}
        />
      </div>

      <ol className="space-y-5 border-l border-slate-200 pl-4 sm:pl-5">
        {visits.map((visit) => (
          <VisitTimelineItem
            isHighlighted={highlightedVisitId === visit.id}
            key={visit.id}
            patientId={patientId}
            visit={visit}
          />
        ))}
      </ol>
    </div>
  )
}
