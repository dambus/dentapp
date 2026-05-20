import { useEffect, useState } from 'react'

import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  MetricTile,
} from '../../components/ui'
import { getPatientVisitDetailPath } from '../../routes/routePaths'
import {
  fetchCompletedVisitsForPatient,
  type VisitCompletionDraft,
} from '../visits/visitCompletionService'
import { formatPatientDate, formatPatientDateTime } from './patientDisplay'

type PatientLatestClinicalActivityProps = {
  patientId: string
  onOpenTimeline: () => void
}

function getVisitDisplayDate(visit: VisitCompletionDraft) {
  return visit.completedAt ?? visit.visitDate ?? visit.createdAt
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

function getNoteExcerpt(visit: VisitCompletionDraft) {
  const note = visit.clinicalNote.trim()

  if (!note) {
    return 'No clinical note recorded for this completed visit.'
  }

  return note.length > 180 ? `${note.slice(0, 177).trim()}...` : note
}

function getLatestActivityErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'Latest clinical activity could not be loaded for the current role.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network')
  ) {
    return 'Latest clinical activity could not be loaded. Check the local Supabase connection and try again.'
  }

  return 'Latest clinical activity could not be loaded.'
}

export function PatientLatestClinicalActivity({
  patientId,
  onOpenTimeline,
}: PatientLatestClinicalActivityProps) {
  const [visits, setVisits] = useState<VisitCompletionDraft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadLatestActivity(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    setErrorMessage(null)

    try {
      const completedVisits = await fetchCompletedVisitsForPatient(patientId)
      setVisits(completedVisits)
    } catch (error) {
      setErrorMessage(
        getLatestActivityErrorMessage(
          error instanceof Error ? error.message : null,
        ),
      )
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitialActivity() {
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
            getLatestActivityErrorMessage(
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

    void loadInitialActivity()

    return () => {
      isCurrent = false
    }
  }, [patientId])

  const latestVisit = visits[0] ?? null

  if (isLoading) {
    return <LoadingState label="Loading latest clinical activity..." />
  }

  if (errorMessage) {
    return (
      <ErrorState
        action={
          <Button onClick={() => void loadLatestActivity()}>
            Try again
          </Button>
        }
        description={errorMessage}
        title="Latest clinical activity unavailable"
      />
    )
  }

  if (!latestVisit) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Latest Clinical Activity</CardTitle>
            <Badge variant="neutral">No completed visits</Badge>
          </div>
          <CardDescription>
            The latest completed visit will appear here after Visit Completion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-950">
              No completed visit recorded
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Completed clinical visits are stored in the patient timeline.
            </p>
            <Button
              className="mt-4"
              onClick={onOpenTimeline}
              size="sm"
              variant="secondary"
            >
              Open timeline
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="border-teal-200 bg-white shadow-sm"
      data-testid="patient-latest-clinical-activity"
    >
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Latest Clinical Activity</CardTitle>
              <Badge variant="success">Completed visit</Badge>
            </div>
            <CardDescription>
              Most recent completed visit from patient history.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onOpenTimeline} size="sm" variant="secondary">
              Open timeline
            </Button>
            <ButtonLink
              size="sm"
              to={getPatientVisitDetailPath(patientId, latestVisit.id)}
              variant="secondary"
            >
              View visit detail
            </ButtonLink>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            label="Completed"
            value={formatPatientDate(getVisitDisplayDate(latestVisit))}
            description={formatPatientDateTime(latestVisit.completedAt)}
            tone="success"
          />
          <MetricTile
            label="Status"
            value="Completed"
            description={
              latestVisit.appointmentId
                ? 'Appointment-linked visit.'
                : 'Direct Visit Completion record.'
            }
            tone="success"
          />
          <MetricTile
            label="Procedures"
            value={String(latestVisit.procedures.length)}
            description="Recorded on the completed visit."
            tone={latestVisit.procedures.length > 0 ? 'info' : 'default'}
          />
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-950">
            Procedure summary
          </div>
          <p
            className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700"
            data-testid="patient-latest-clinical-activity-procedures"
          >
            {getProcedureSummary(latestVisit)}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-950">
            Clinical note excerpt
          </div>
          <p
            className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700"
            data-testid="patient-latest-clinical-activity-note"
          >
            {getNoteExcerpt(latestVisit)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
