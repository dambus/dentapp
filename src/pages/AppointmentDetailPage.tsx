import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarX, RotateCcw, UserX } from 'lucide-react'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import {
  ActionMenu,
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
  Select,
  StatusBadge,
} from '../components/ui'
import {
  formatAppointmentTimeRange,
} from '../features/appointments/appointmentDisplay'
import {
  APPOINTMENT_LIFECYCLE_UNAVAILABLE_MESSAGE,
  appointmentOperationalStateLabels,
  canUpdateAppointmentLifecycle,
  canUpdateAppointmentOperationalState,
  fetchAssignableAppointmentProviders,
  fetchAppointmentById,
  getAssignedProviderDisplayName,
  getAppointmentLifecycleSuccessMessage,
  getAppointmentOperationalActionLabel,
  getAppointmentOperationalCorrectionLabel,
  getAppointmentOperationalSuccessMessage,
  getNextAppointmentOperationalState,
  getPreviousAppointmentOperationalState,
  updateAppointmentAssignedProvider,
  updateAppointmentOperationalState,
  updateAppointmentStatus,
  type AppointmentDetail,
  type AppointmentOperationalState,
  type AppointmentProviderSummary,
  type AppointmentStatus,
} from '../features/appointments/appointmentService'
import {
  formatPatientDate,
  formatPatientDateTime,
} from '../features/patients/patientDisplay'
import {
  getPatientDetailPath,
  getPatientFollowUpSchedulingPath,
  getPatientVisitCompletionPath,
  getPatientVisitDetailPath,
  routePaths,
} from '../routes/routePaths'

const nextStepLabels: Record<string, string> = {
  no_follow_up: 'No follow-up needed',
  follow_up_recommended: 'Follow-up recommended',
  schedule_control_visit: 'Schedule control visit',
  continue_treatment_plan: 'Continue treatment plan',
  additional_diagnostics: 'Additional diagnostics',
  referral: 'Referral / specialist consultation',
}

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

  return 'Appointment detail could not be loaded. Try again.'
}

export function AppointmentDetailPage() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusSubmitting, setStatusSubmitting] =
    useState<AppointmentStatus | null>(null)
  const [operationalSubmitting, setOperationalSubmitting] =
    useState<AppointmentOperationalState | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [providerOptions, setProviderOptions] = useState<
    AppointmentProviderSummary[]
  >([])
  const [providerSelection, setProviderSelection] = useState('')
  const [isProviderSaving, setIsProviderSaving] = useState(false)
  const [providerLoadError, setProviderLoadError] = useState<string | null>(null)
  const statusSubmittingRef = useRef(false)
  const operationalSubmittingRef = useRef(false)

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
          setProviderSelection(loadedAppointment?.assigned_provider_id ?? '')
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

  useEffect(() => {
    let isCurrent = true

    async function loadProviders() {
      setProviderLoadError(null)

      try {
        const providers = await fetchAssignableAppointmentProviders()

        if (isCurrent) {
          setProviderOptions(providers)
        }
      } catch {
        if (isCurrent) {
          setProviderOptions([])
          setProviderLoadError('Assigned provider options could not be loaded.')
        }
      }
    }

    void loadProviders()

    return () => {
      isCurrent = false
    }
  }, [])

  function startVisit() {
    if (!appointment) {
      return
    }

    if (appointment.status !== 'scheduled') {
      setActionFeedback('Only scheduled appointments can start a visit.')
      return
    }

    const searchParams = new URLSearchParams({ appointmentId: appointment.id })
    const patientRouteId = appointment.patient?.routeId ?? appointment.patient_id

    navigate(
      `${getPatientVisitCompletionPath(patientRouteId)}?${searchParams}`,
    )
  }

  async function handleStatusUpdate(status: AppointmentStatus) {
    if (
      !appointment ||
      statusSubmitting ||
      statusSubmittingRef.current ||
      !canUpdateAppointmentLifecycle(appointment)
    ) {
      if (appointment && !canUpdateAppointmentLifecycle(appointment)) {
        setActionFeedback(APPOINTMENT_LIFECYCLE_UNAVAILABLE_MESSAGE)
      }
      return
    }

    setActionFeedback(null)
    statusSubmittingRef.current = true
    setStatusSubmitting(status)

    try {
      const result = await updateAppointmentStatus({
        appointmentId: appointment.id,
        status,
      })

      if (!result.ok || !result.appointment) {
        setActionFeedback('Could not update appointment status. Try again.')
        return
      }

      setAppointment({
        ...appointment,
        ...result.appointment,
      })
      setActionFeedback(getAppointmentLifecycleSuccessMessage(status))
    } catch {
      setActionFeedback('Could not update appointment status. Try again.')
    } finally {
      statusSubmittingRef.current = false
      setStatusSubmitting(null)
    }
  }

  async function handleOperationalStateUpdate(state: AppointmentOperationalState) {
    if (
      !appointment ||
      operationalSubmitting ||
      operationalSubmittingRef.current ||
      !canUpdateAppointmentOperationalState(appointment) ||
      (getNextAppointmentOperationalState(appointment) !== state &&
        getPreviousAppointmentOperationalState(appointment) !== state)
    ) {
      setActionFeedback('This appointment cannot be updated for day-of-visit state.')
      return
    }

    setActionFeedback(null)
    operationalSubmittingRef.current = true
    setOperationalSubmitting(state)

    try {
      const result = await updateAppointmentOperationalState({
        appointmentId: appointment.id,
        operationalState: state,
      })

      if (!result.ok || !result.appointment) {
        setActionFeedback(
          result.error ??
            'Could not update appointment day-of-visit state. Try again.',
        )
        return
      }

      setAppointment({
        ...appointment,
        ...result.appointment,
      })
      setActionFeedback(
        result.message ??
          getAppointmentOperationalSuccessMessage(state, {
            correction:
              getPreviousAppointmentOperationalState(appointment) === state,
          }),
      )
    } catch {
      setActionFeedback('Could not update appointment day-of-visit state. Try again.')
    } finally {
      operationalSubmittingRef.current = false
      setOperationalSubmitting(null)
    }
  }

  async function handleProviderUpdate() {
    if (!appointment || isProviderSaving) {
      return
    }

    setActionFeedback(null)
    setIsProviderSaving(true)

    try {
      const result = await updateAppointmentAssignedProvider({
        appointmentId: appointment.id,
        assignedProviderId: providerSelection || null,
      })

      if (!result.ok || !result.appointment) {
        setActionFeedback(
          result.error ?? 'Assigned provider could not be updated.',
        )
        return
      }

      setAppointment({
        ...appointment,
        ...result.appointment,
      })
      setActionFeedback(result.message ?? 'Assigned provider was updated.')
    } catch {
      setActionFeedback('Assigned provider could not be updated.')
    } finally {
      setIsProviderSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Page>
        <LoadingState label="Loading appointment detail..." />
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
          description="The requested appointment could not be found in the current clinic context."
        />
      </Page>
    )
  }

  const patientName = appointment.patient?.fullName ?? 'Unknown patient'
  const providerLabel = getAssignedProviderDisplayName(appointment)
  const patientRouteId = appointment.patient?.routeId ?? appointment.patient_id
  const hasOpenVisit = Boolean(appointment.openVisit)
  const hasCompletedVisit = Boolean(appointment.linkedVisit)
  const canStartVisit = appointment.status === 'scheduled' && !hasCompletedVisit
  const canUpdateLifecycle = canUpdateAppointmentLifecycle(appointment)
  const nextOperationalState = getNextAppointmentOperationalState(appointment)
  const previousOperationalState =
    getPreviousAppointmentOperationalState(appointment)
  const canUpdateOperationalState =
    canUpdateAppointmentOperationalState(appointment) && Boolean(nextOperationalState)
  const canCorrectOperationalState =
    canUpdateAppointmentOperationalState(appointment) &&
    Boolean(previousOperationalState)
  const primaryVisitActionLabel = hasOpenVisit ? 'Continue visit' : 'Start visit'
  const linkedVisitRecommendation =
    appointment.linkedVisit?.recommendation.trim() ?? ''
  const linkedVisitNextStep = appointment.linkedVisit?.nextStep
    ? nextStepLabels[appointment.linkedVisit.nextStep] ??
      appointment.linkedVisit.nextStep
    : ''
  const hasLinkedVisitFollowUp =
    Boolean(linkedVisitRecommendation) || Boolean(linkedVisitNextStep)
  const linkedVisitFollowUpSchedulingReason =
    linkedVisitRecommendation || linkedVisitNextStep

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
              onClick={() => navigate(getPatientDetailPath(patientRouteId))}
              variant="secondary"
            >
              Open patient
            </Button>
            {canStartVisit ? (
              <Button
                disabled={Boolean(statusSubmitting) || Boolean(operationalSubmitting)}
                onClick={startVisit}
              >
                {primaryVisitActionLabel}
              </Button>
            ) : null}
            {canUpdateOperationalState && nextOperationalState ? (
              <Button
                data-testid="appointment-detail-operational-action"
                disabled={Boolean(statusSubmitting) || Boolean(operationalSubmitting)}
                onClick={() =>
                  void handleOperationalStateUpdate(nextOperationalState)
                }
                variant="secondary"
              >
                {operationalSubmitting === nextOperationalState
                  ? 'Updating...'
                  : getAppointmentOperationalActionLabel(nextOperationalState)}
              </Button>
            ) : null}
            {canUpdateLifecycle || canCorrectOperationalState ? (
              <>
                <ActionMenu
                  disabled={Boolean(statusSubmitting) || Boolean(operationalSubmitting)}
                  items={[
                    ...(canCorrectOperationalState && previousOperationalState
                      ? [
                          {
                            disabled: Boolean(operationalSubmitting),
                            icon: RotateCcw,
                            label:
                              operationalSubmitting === previousOperationalState
                                ? 'Updating...'
                                : getAppointmentOperationalCorrectionLabel(
                                    previousOperationalState,
                                  ),
                            onSelect: () =>
                              void handleOperationalStateUpdate(
                                previousOperationalState,
                              ),
                          },
                        ]
                      : []),
                    ...(canUpdateLifecycle
                      ? [
                    {
                      disabled: Boolean(statusSubmitting),
                      icon: CalendarX,
                      label:
                        statusSubmitting === 'cancelled'
                          ? 'Updating...'
                          : 'Cancel appointment',
                      onSelect: () => void handleStatusUpdate('cancelled'),
                      tone: 'danger' as const,
                    },
                    {
                      disabled: Boolean(statusSubmitting),
                      icon: UserX,
                      label:
                        statusSubmitting === 'no_show'
                          ? 'Updating...'
                          : 'Mark no-show',
                      onSelect: () => void handleStatusUpdate('no_show'),
                      tone: 'danger' as const,
                    },
                        ]
                      : []),
                  ]}
                  label="Appointment status actions"
                />
              </>
            ) : null}
            {appointment.linkedVisit ? (
              <Button
                onClick={() =>
                  navigate(
                    getPatientVisitDetailPath(
                      patientRouteId,
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

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-6">
        <Card className="border-cyan-100 bg-cyan-50/30 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{patientName}</CardTitle>
                  <StatusBadge status={appointment.status} />
                  <Badge
                    data-testid="appointment-detail-operational-state"
                    variant={
                      appointment.operational_state === 'ready_for_doctor'
                        ? 'success'
                        : appointment.operational_state === 'arrived'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {appointmentOperationalStateLabels[appointment.operational_state]}
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
          <CardContent className="space-y-4 sm:space-y-5">
            <div className="grid gap-3 md:grid-cols-4">
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
                label="Assigned provider"
                value={
                  <span className="block truncate whitespace-nowrap" title={providerLabel}>
                    {providerLabel}
                  </span>
                }
                description="Planned appointment provider; completed visits record completed-by separately."
                tone={appointment.assignedProvider ? 'success' : 'default'}
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

        {canStartVisit ? (
          <InlineNotice data-testid="appointment-visit-handoff" variant="info">
            {hasOpenVisit
              ? 'A Visit Completion draft is in progress for this appointment. Continue visit to review, save changes, or complete it.'
              : 'Start visit opens Visit Completion with this appointment attached as clinical context. Saving a draft keeps the appointment scheduled; completing the visit marks the appointment completed.'}
          </InlineNotice>
        ) : null}

        <Card className="border-slate-200 shadow-sm" data-testid="appointment-lifecycle-state">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Lifecycle</CardTitle>
              <StatusBadge status={appointment.status} />
              {hasOpenVisit ? (
                <Badge variant="warning">Visit in progress</Badge>
              ) : null}
              {hasCompletedVisit ? (
                <Badge variant="success">Completed visit linked</Badge>
              ) : null}
            </div>
            <CardDescription>
              Current appointment and Visit Completion state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {hasCompletedVisit ? (
              <InlineNotice variant="success">
                This appointment has a completed Visit Completion record.
              </InlineNotice>
            ) : hasOpenVisit ? (
              <InlineNotice variant="warning">
                A Visit Completion draft exists for this appointment. The
                appointment remains scheduled until the visit is completed.
              </InlineNotice>
            ) : appointment.status === 'scheduled' ? (
              <InlineNotice variant="info">
                This appointment is ready to start. No Visit Completion draft is
                linked yet.
              </InlineNotice>
            ) : (
              <InlineNotice variant="neutral">
                No clinical visit action is available for this appointment
                status.
              </InlineNotice>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle>Assigned Provider</CardTitle>
                <CardDescription>
                  Planned appointment assignment. Completed visits keep their
                  own completed-by record.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                data-testid="appointment-detail-provider"
                disabled={isProviderSaving}
                value={providerSelection}
                onChange={(event) => setProviderSelection(event.target.value)}
              >
                <option value="">Not assigned</option>
                {providerOptions.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.fullName} ({provider.role})
                  </option>
                ))}
              </Select>
              {providerLoadError ? (
                <InlineNotice variant="warning">{providerLoadError}</InlineNotice>
              ) : null}
              <Button
                data-testid="appointment-detail-provider-save"
                disabled={
                  isProviderSaving ||
                  providerSelection === (appointment.assigned_provider_id ?? '')
                }
                onClick={() => void handleProviderUpdate()}
                size="sm"
                variant="secondary"
              >
                {isProviderSaving ? 'Saving...' : 'Save provider'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle>Reason</CardTitle>
                <CardDescription>
                  Appointment reason captured on the schedule item.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-700">
                {appointment.reason?.trim() ||
                  'No appointment reason recorded.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Internal scheduling notes, when present.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-700">
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
            <CardContent className="space-y-4 sm:space-y-5">
              <InlineNotice variant="success">
                This appointment produced a completed Visit Completion record.
              </InlineNotice>
              {hasLinkedVisitFollowUp ? (
                <div
                  className="mt-4 rounded-md border border-amber-200 bg-white p-4 sm:p-5"
                  data-testid="appointment-completed-follow-up"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="text-sm font-semibold text-slate-950">
                      Follow-up from completed visit
                    </div>
                    <Button
                      className="min-h-10 w-full sm:w-auto"
                      data-testid="appointment-detail-schedule-follow-up"
                      onClick={() =>
                        navigate(
                          getPatientFollowUpSchedulingPath(
                            patientRouteId,
                            linkedVisitFollowUpSchedulingReason,
                          ),
                        )
                      }
                      size="sm"
                      variant="secondary"
                    >
                      Schedule follow-up
                    </Button>
                  </div>
                  {linkedVisitNextStep ? (
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                      {linkedVisitNextStep}
                    </p>
                  ) : null}
                  {linkedVisitRecommendation ? (
                    <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">
                      {linkedVisitRecommendation}
                    </p>
                  ) : null}
                  <InlineNotice className="mt-3" variant="info">
                    This is clinical follow-up guidance only. No appointment or
                    treatment plan task was created automatically.
                  </InlineNotice>
                </div>
              ) : null}
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
              actionFeedback.startsWith('Could not') ||
              actionFeedback.startsWith('Choose') ||
              actionFeedback.startsWith('This appointment cannot')
                ? 'danger'
                : 'success'
            }
          >
            {actionFeedback}
          </InlineNotice>
        ) : null}
      </div>
    </Page>
  )
}
