import { useEffect, useMemo, useState } from 'react'

import {
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  ErrorState,
  InlineNotice,
  LoadingState,
} from '../../components/ui'
import { classNames } from '../../lib/classNames'
import {
  getPatientFollowUpSchedulingPath,
  getPatientVisitDetailPath,
} from '../../routes/routePaths'
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

function getTextExcerpt(text: string, maxLength = 140) {
  const normalizedText = text.trim()

  if (!normalizedText) {
    return ''
  }

  return normalizedText.length > maxLength
    ? `${normalizedText.slice(0, maxLength - 3).trim()}...`
    : normalizedText
}

function TimelineMetaItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
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
  const providerLabel = visit.completedByName ?? 'Provider not recorded'
  const followUpSchedulingReason = hasRecommendation
    ? visit.recommendation
    : getNextStepLabel(visit.nextStep)
  const noteExcerpt = hasClinicalNote
    ? getTextExcerpt(visit.clinicalNote, 160)
    : 'No clinical note recorded for this completed visit.'
  const recommendationExcerpt = hasRecommendation
    ? getTextExcerpt(visit.recommendation, 160)
    : 'No recommendation recorded.'

  return (
    <li
      className="relative scroll-mt-6 pl-5 sm:pl-7"
      data-testid="completed-visit-card"
      id={`visit-${visit.id}`}
    >
      <span className="absolute left-0 top-4 h-3 w-3 rounded-full border-2 border-white bg-teal-700 shadow ring-2 ring-teal-100" />
      <article
        className={classNames(
          'rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5',
          isHighlighted
            ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-100'
            : '',
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Completed visit
              </span>
              <Badge variant="success">Completed</Badge>
              {visit.appointmentId ? (
                <Badge variant="info">Appointment-linked</Badge>
              ) : null}
              {hasFollowUp ? (
                <Badge variant="warning">
                  {hasNextStep
                    ? getNextStepLabel(visit.nextStep)
                    : 'Recommendation recorded'}
                </Badge>
              ) : null}
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
              {formatPatientDate(getVisitDisplayDate(visit))}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Completed {formatPatientDateTime(visit.completedAt)} by{' '}
              {providerLabel}.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <Badge variant={visit.procedures.length > 0 ? 'info' : 'neutral'}>
              {visit.procedures.length}{' '}
              {visit.procedures.length === 1 ? 'procedure' : 'procedures'}
            </Badge>
            <ButtonLink
              className="min-h-10 w-full sm:w-auto"
              size="sm"
              to={getPatientVisitDetailPath(patientId, visit.id)}
              variant="secondary"
            >
              View details
            </ButtonLink>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <div
              className="text-sm font-semibold text-slate-950"
              data-testid="completed-visit-procedure-summary"
            >
              Performed work
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
              {procedureSummary}
            </p>
            <div
              className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-3"
              data-testid="completed-visit-clinical-note"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Clinical note excerpt
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {noteExcerpt}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <dl className="grid gap-3">
              <TimelineMetaItem label="Provider" value={providerLabel} />
              <TimelineMetaItem
                label="Visit source"
                value={
                  visit.appointmentId
                    ? 'Appointment-linked'
                    : 'Direct visit completion'
                }
              />
              <div data-testid="completed-visit-next-step">
                <TimelineMetaItem
                  label="Next step"
                  value={getNextStepLabel(visit.nextStep)}
                />
              </div>
            </dl>
            <div
              className="rounded-md border border-slate-200 bg-white px-3 py-3"
              data-testid="completed-visit-recommendation"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recommendation
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {recommendationExcerpt}
              </p>
            </div>
          </div>
        </div>

        {hasFollowUp ? (
          <div
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50/40 p-4"
            data-testid="completed-visit-follow-up"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-slate-950">
                    Recommended follow-up
                  </div>
                  {hasNextStep ? (
                    <Badge variant="warning">
                      {getNextStepLabel(visit.nextStep)}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                  {recommendationExcerpt}
                </p>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  Display-only guidance from Visit Completion. No appointment or
                  treatment plan item was created automatically.
                </p>
              </div>
              <ButtonLink
                size="sm"
                to={getPatientFollowUpSchedulingPath(
                  patientId,
                  followUpSchedulingReason,
                )}
                variant="secondary"
              >
                Schedule follow-up
              </ButtonLink>
            </div>
          </div>
        ) : null}

        {visit.warnings.map((warning) => (
          <InlineNotice
            key={`${visit.id}-${warning.code}-${warning.message}`}
            data-testid="completed-visit-warning"
            variant={
              warning.code === 'clinical_note_unavailable'
                ? 'warning'
                : 'info'
            }
          >
            {warning.message}
          </InlineNotice>
        ))}
      </article>
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
    () => visits.reduce((total, visit) => total + visit.procedures.length, 0),
    [visits],
  )

  if (isLoading) {
    return <LoadingState label="Loading visit history..." />
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
        description="Completed clinical visits will appear here after Visit Completion is finished for this patient."
      />
    )
  }

  return (
    <div className="space-y-5">
      <div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        data-testid="patient-timeline-summary"
      >
        <TimelineMetaItem label="Completed visits" value={String(visits.length)} />
        <TimelineMetaItem
          label="Recorded procedures"
          value={String(totalProcedures)}
        />
        <TimelineMetaItem
          label="Most recent event"
          value={formatPatientDate(getVisitDisplayDate(visits[0]))}
        />
      </div>

      <ol
        className="space-y-4 border-l border-slate-200 pl-4 sm:pl-5"
        data-testid="patient-timeline-event-list"
      >
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
