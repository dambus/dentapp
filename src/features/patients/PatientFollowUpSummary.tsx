import { useEffect, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  InlineNotice,
  LoadingState,
  MetricTile,
} from '../../components/ui'
import {
  fetchCompletedVisitsForPatient,
  type VisitCompletionDraft,
  type VisitNextStep,
} from '../visits/visitCompletionService'
import { formatPatientDate } from './patientDisplay'

type PatientFollowUpSummaryProps = {
  patientId: string
  onOpenTimelineVisit: (visitId: string) => void
  onScheduleAppointment?: (reason: string) => void
}

const nextStepLabels: Record<VisitNextStep, string> = {
  no_follow_up: 'No follow-up needed',
  follow_up_recommended: 'Follow-up recommended',
  schedule_control_visit: 'Schedule control visit',
  continue_treatment_plan: 'Continue treatment plan',
  additional_diagnostics: 'Additional diagnostics',
  referral: 'Referral / specialist consultation',
}

function getFollowUpErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'Follow-up information could not be loaded for the current role.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network')
  ) {
    return 'Follow-up information could not be loaded. Check the local Supabase connection and try again.'
  }

  return 'Follow-up information could not be loaded.'
}

function hasFollowUpSignal(visit: VisitCompletionDraft) {
  return (
    Boolean(visit.recommendation.trim()) ||
    Boolean(visit.nextStep && visit.nextStep !== 'no_follow_up')
  )
}

function getNextStepLabel(nextStep: VisitCompletionDraft['nextStep']) {
  return nextStep ? nextStepLabels[nextStep] : 'Not selected'
}

export function PatientFollowUpSummary({
  patientId,
  onOpenTimelineVisit,
  onScheduleAppointment,
}: PatientFollowUpSummaryProps) {
  const [visits, setVisits] = useState<VisitCompletionDraft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadFollowUps(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    setErrorMessage(null)

    try {
      const completedVisits = await fetchCompletedVisitsForPatient(patientId)
      setVisits(completedVisits)
    } catch (error) {
      setErrorMessage(
        getFollowUpErrorMessage(error instanceof Error ? error.message : null),
      )
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitialFollowUps() {
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
            getFollowUpErrorMessage(
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

    void loadInitialFollowUps()

    return () => {
      isCurrent = false
    }
  }, [patientId])

  const followUpVisits = visits.filter(hasFollowUpSignal)
  const latestFollowUp = followUpVisits[0] ?? null
  const appointmentReason = latestFollowUp
    ? latestFollowUp.recommendation.trim() ||
      getNextStepLabel(latestFollowUp.nextStep)
    : ''

  if (isLoading) {
    return <LoadingState label="Loading follow-up context..." />
  }

  if (errorMessage) {
    return (
      <ErrorState
        title="Follow-up unavailable"
        description={errorMessage}
        action={
          <Button onClick={() => void loadFollowUps()}>
            Try again
          </Button>
        }
      />
    )
  }

  if (!latestFollowUp) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Follow-up / Next Step</CardTitle>
            <Badge variant="neutral">No pending action</Badge>
          </div>
          <CardDescription>
            Completed visits with recommendations or next steps will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InlineNotice variant="neutral">
            No follow-up recommendation is pending for this patient.
          </InlineNotice>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="border-amber-200 bg-amber-50/40 shadow-sm"
      data-testid="patient-follow-up-summary"
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Follow-up / Next Step</CardTitle>
          <Badge variant="warning">Pending next action</Badge>
          {followUpVisits.length > 1 ? (
            <Badge variant="info">{followUpVisits.length} recorded</Badge>
          ) : null}
        </div>
        <CardDescription>
          Latest recommendation from completed visit history.
        </CardDescription>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            className="min-h-10"
            onClick={() => onOpenTimelineVisit(latestFollowUp.id)}
            size="sm"
            variant="secondary"
          >
            View source visit
          </Button>
          {onScheduleAppointment ? (
            <Button
              className="min-h-10"
              onClick={() => onScheduleAppointment(appointmentReason)}
              size="sm"
            >
              Schedule appointment
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            label="Source visit"
            value={formatPatientDate(
              latestFollowUp.completedAt ??
                latestFollowUp.visitDate ??
                latestFollowUp.createdAt,
            )}
            description="Most recent completed visit with follow-up context."
            tone="warning"
          />
          <MetricTile
            label="Next step"
            value={getNextStepLabel(latestFollowUp.nextStep)}
            description="Captured during Visit Completion."
            tone={latestFollowUp.nextStep ? 'success' : 'default'}
          />
          <MetricTile
            label="Procedures"
            value={String(latestFollowUp.procedures.length)}
            description="Recorded on the source visit."
            tone={latestFollowUp.procedures.length > 0 ? 'info' : 'default'}
          />
        </div>

        <div className="rounded-md border border-amber-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-950">
            Recommendation
          </div>
          <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">
            {latestFollowUp.recommendation.trim() ||
              'No written recommendation recorded.'}
          </p>
        </div>

        <InlineNotice variant="info">
          Follow-up is display-only. Appointments and reminders are not created automatically.
        </InlineNotice>
      </CardContent>
    </Card>
  )
}
