import { useEffect, useRef, useState } from 'react'
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
  appointmentStatusBadgeVariants,
  appointmentStatusLabels,
  formatAppointmentTimeRange,
} from '../features/appointments/appointmentDisplay'
import {
  fetchAppointmentById,
  updateAppointmentStatus,
  type AppointmentDetail,
  type AppointmentStatus,
} from '../features/appointments/appointmentService'
import {
  formatPatientDate,
  formatPatientDateTime,
} from '../features/patients/patientDisplay'
import {
  getPatientDetailPath,
  getPatientVisitCompletionPath,
  getPatientVisitDetailPath,
  routePaths,
} from '../routes/routePaths'

function getAppointmentDetailErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'Appointment detail could not be loaded for the current role.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network')
  ) {
    return 'Appointment detail could not be loaded. Check the local Supabase connection and try again.'
  }

  return message || 'Appointment detail could not be loaded.'
}

export function AppointmentDetailPage() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusSubmitting, setStatusSubmitting] =
    useState<AppointmentStatus | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const statusSubmittingRef = useRef(false)

  useEffect(() => {
    let isCurrent = true

    async function loadAppointment() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const loadedAppointment = appointmentId
          ? await fetchAppointmentById(appointmentId)
          : null

        if (isCurrent) {
          setAppointment(loadedAppointment)
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(
            getAppointmentDetailErrorMessage(
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

    void loadAppointment()

    return () => {
      isCurrent = false
    }
  }, [appointmentId])

  function startVisit() {
    if (!appointment) {
      return
    }

    if (appointment.status !== 'scheduled') {
      setActionFeedback('Only scheduled appointments can start a visit.')
      return
    }

    const searchParams = new URLSearchParams({ appointmentId: appointment.id })
    navigate(
      `${getPatientVisitCompletionPath(appointment.patient_id)}?${searchParams}`,
    )
  }

  async function handleStatusUpdate(status: AppointmentStatus) {
    if (
      !appointment ||
      statusSubmitting ||
      statusSubmittingRef.current ||
      appointment.status !== 'scheduled'
    ) {
      return
    }

    setActionFeedback(null)
    statusSubmittingRef.current = true
    setStatusSubmitting(status)

    const result = await updateAppointmentStatus({
      appointmentId: appointment.id,
      status,
    })

    statusSubmittingRef.current = false
    setStatusSubmitting(null)

    if (!result.ok || !result.appointment) {
      setActionFeedback('Could not update appointment status. Try again.')
      return
    }

    setAppointment({
      ...appointment,
      ...result.appointment,
    })
    setActionFeedback(result.message ?? 'Appointment status updated.')
  }

  if (isLoading) {
    return (
      <Page>
        <LoadingState label="Loading appointment..." />
      </Page>
    )
  }

  if (errorMessage) {
    return (
      <Page>
        <PageHeader
          title="Appointment Detail"
          description="Read-only schedule item review."
          actions={
            <Button onClick={() => navigate(routePaths.appointments)} variant="secondary">
              Back to schedule
            </Button>
          }
        />
        <ErrorState title="Appointment unavailable" description={errorMessage} />
      </Page>
    )
  }

  if (!appointment) {
    return (
      <Page>
        <PageHeader
          title="Appointment Detail"
          description="Read-only schedule item review."
          actions={
            <Button onClick={() => navigate(routePaths.appointments)} variant="secondary">
              Back to schedule
            </Button>
          }
        />
        <EmptyState
          title="Appointment not found"
          description="The requested appointment could not be found for the current clinic context."
        />
      </Page>
    )
  }

  const patientName = appointment.patient?.fullName ?? 'Unknown patient'
  const canStartVisit = appointment.status === 'scheduled'

  return (
    <Page>
      <PageHeader
        title="Appointment Detail"
        description="Read-only schedule item review."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate(routePaths.appointments)} variant="secondary">
              Back to schedule
            </Button>
            <Button
              onClick={() => navigate(getPatientDetailPath(appointment.patient_id))}
              variant="secondary"
            >
              Open patient
            </Button>
            {canStartVisit ? (
              <>
                <Button
                  disabled={Boolean(statusSubmitting)}
                  onClick={startVisit}
                >
                  Start visit
                </Button>
                <Button
                  disabled={Boolean(statusSubmitting)}
                  onClick={() => void handleStatusUpdate('completed')}
                  variant="secondary"
                >
                  {statusSubmitting === 'completed' ? 'Updating...' : 'Complete'}
                </Button>
                <Button
                  disabled={Boolean(statusSubmitting)}
                  onClick={() => void handleStatusUpdate('cancelled')}
                  variant="ghost"
                >
                  {statusSubmitting === 'cancelled' ? 'Updating...' : 'Cancel'}
                </Button>
                <Button
                  disabled={Boolean(statusSubmitting)}
                  onClick={() => void handleStatusUpdate('no_show')}
                  variant="ghost"
                >
                  {statusSubmitting === 'no_show' ? 'Updating...' : 'No-show'}
                </Button>
              </>
            ) : null}
            {appointment.linkedVisit ? (
              <Button
                onClick={() =>
                  navigate(
                    getPatientVisitDetailPath(
                      appointment.patient_id,
                      appointment.linkedVisit?.id ?? '',
                    ),
                  )
                }
                variant="secondary"
              >
                View completed visit
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <Card className="border-cyan-100 bg-cyan-50/30 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{patientName}</CardTitle>
                  <Badge variant={appointmentStatusBadgeVariants[appointment.status]}>
                    {appointmentStatusLabels[appointment.status]}
                  </Badge>
                </div>
                <CardDescription>
                  {formatAppointmentTimeRange(
                    appointment.scheduled_start,
                    appointment.scheduled_end,
                  )}
                </CardDescription>
              </div>
              <Badge variant="neutral">Read-only</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <MetricTile
                label="Scheduled"
                value={formatPatientDate(appointment.scheduled_start)}
                description={formatAppointmentTimeRange(
                  appointment.scheduled_start,
                  appointment.scheduled_end,
                )}
                tone="info"
              />
              <MetricTile
                label="Patient"
                value={patientName}
                description={appointment.patient?.phone || 'No phone recorded.'}
                tone="success"
              />
              <MetricTile
                label="Last updated"
                value={formatPatientDateTime(appointment.updated_at)}
                description={`Created ${formatPatientDateTime(appointment.created_at)}.`}
                tone="default"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                {appointment.reason?.trim() ||
                  'No appointment reason recorded.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                {appointment.notes?.trim() || 'No appointment notes recorded.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {appointment.linkedVisit ? (
          <Card className="border-emerald-200 bg-emerald-50/40 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Linked Visit</CardTitle>
                <Badge variant="success">Completed</Badge>
              </div>
              <CardDescription>
                Completed {formatPatientDateTime(appointment.linkedVisit.completedAt)}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InlineNotice variant="success">
                This appointment produced a completed Visit Completion record.
              </InlineNotice>
            </CardContent>
          </Card>
        ) : (
          <InlineNotice variant="neutral">
            No completed visit is linked to this appointment yet.
          </InlineNotice>
        )}

        {!canStartVisit && !appointment.linkedVisit ? (
          <InlineNotice variant="info">
            Start visit is only available for scheduled appointments.
          </InlineNotice>
        ) : null}

        {actionFeedback ? (
          <InlineNotice
            variant={
              actionFeedback.startsWith('Could not') ? 'danger' : 'success'
            }
          >
            {actionFeedback}
          </InlineNotice>
        ) : null}
      </div>
    </Page>
  )
}
