import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  FieldError,
  FieldLabel,
  InlineNotice,
  LoadingState,
  MetricTile,
  Select,
  Textarea,
  TextInput,
} from '../../components/ui'
import {
  createAppointment,
  fetchUpcomingAppointmentsForPatient,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from '../appointments/appointmentService'
import { formatPatientDateTime } from './patientDisplay'
import { getPatientVisitCompletionPath } from '../../routes/routePaths'

type PatientAppointmentSummaryProps = {
  patientId: string
  prefillReason?: string
  prefillRequestId?: number
}

type AppointmentFormValues = {
  date: string
  time: string
  duration: string
  reason: string
  notes: string
}

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

const statusBadgeVariants: Record<
  AppointmentStatus,
  'success' | 'warning' | 'danger' | 'info'
> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'warning',
}

function getDefaultAppointmentValues(): AppointmentFormValues {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)

  return {
    date: nextHour.toISOString().slice(0, 10),
    time: nextHour.toTimeString().slice(0, 5),
    duration: '30',
    reason: '',
    notes: '',
  }
}

function getAppointmentErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'You do not have permission to manage appointments for this patient.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network')
  ) {
    return 'Appointments could not be loaded. Check the local Supabase connection and try again.'
  }

  return message || 'Appointments could not be loaded.'
}

function buildSchedule(values: AppointmentFormValues) {
  const scheduledStart = new Date(`${values.date}T${values.time}`)
  const durationMinutes = Number(values.duration)

  if (Number.isNaN(scheduledStart.getTime())) {
    return {
      error: 'Choose a valid appointment date and time.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return {
      error: 'Choose a valid appointment duration.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  const scheduledEnd = new Date(
    scheduledStart.getTime() + durationMinutes * 60 * 1000,
  )

  return {
    error: null,
    scheduledEnd: scheduledEnd.toISOString(),
    scheduledStart: scheduledStart.toISOString(),
  }
}

function getCreateErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'You do not have permission to create appointments for this patient.'
  }

  if (normalizedMessage.includes('patient not found')) {
    return 'Patient could not be found for appointment scheduling.'
  }

  return message || 'Appointment could not be created.'
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={statusBadgeVariants[status]}>
      {statusLabels[status]}
    </Badge>
  )
}

export function PatientAppointmentSummary({
  patientId,
  prefillReason,
  prefillRequestId,
}: PatientAppointmentSummaryProps) {
  const navigate = useNavigate()
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<AppointmentFormValues>(() =>
    getDefaultAppointmentValues(),
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusSubmitting, setStatusSubmitting] = useState<string | null>(null)

  async function loadUpcomingAppointments(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    setLoadError(null)

    try {
      const appointments = await fetchUpcomingAppointmentsForPatient(patientId)
      setUpcomingAppointments(appointments)
    } catch (error) {
      setLoadError(
        getAppointmentErrorMessage(error instanceof Error ? error.message : null),
      )
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitialAppointments() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const appointments = await fetchUpcomingAppointmentsForPatient(patientId)

        if (isCurrent) {
          setUpcomingAppointments(appointments)
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            getAppointmentErrorMessage(
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

    void loadInitialAppointments()

    return () => {
      isCurrent = false
    }
  }, [patientId])

  useEffect(() => {
    if (!prefillRequestId || !prefillReason?.trim()) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setFormValues((currentValues) => ({
        ...currentValues,
        reason: prefillReason.trim(),
      }))
      setSuccessMessage('Follow-up context copied into appointment reason.')
      setFormError(null)
      document
        .getElementById('patient-appointment-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [prefillReason, prefillRequestId])

  const nextAppointment = upcomingAppointments[0] ?? null
  const additionalAppointmentCount = Math.max(upcomingAppointments.length - 1, 0)
  const schedulePreview = useMemo(() => buildSchedule(formValues), [formValues])

  async function handleCreateAppointment() {
    setFormError(null)
    setSuccessMessage(null)

    if (schedulePreview.error || !schedulePreview.scheduledStart) {
      setFormError(schedulePreview.error ?? 'Appointment time is required.')
      return
    }

    setIsSubmitting(true)

    const result = await createAppointment({
      patientId,
      scheduledStart: schedulePreview.scheduledStart,
      scheduledEnd: schedulePreview.scheduledEnd,
      reason: formValues.reason,
      notes: formValues.notes,
    })

    setIsSubmitting(false)

    if (!result.ok) {
      setFormError(getCreateErrorMessage(result.error ?? result.message))
      return
    }

    setSuccessMessage(result.message ?? 'Appointment was created successfully.')
    setFormValues(getDefaultAppointmentValues())
    await loadUpcomingAppointments(false)
  }

  async function handleStatusUpdate(status: AppointmentStatus) {
    if (!nextAppointment || statusSubmitting) {
      return
    }

    setFormError(null)
    setSuccessMessage(null)
    setStatusSubmitting(status)

    const result = await updateAppointmentStatus({
      appointmentId: nextAppointment.id,
      status,
    })

    setStatusSubmitting(null)

    if (!result.ok) {
      setFormError(
        result.error ?? result.message ?? 'Appointment status could not be updated.',
      )
      return
    }

    setSuccessMessage(
      result.message ?? 'Appointment status was updated successfully.',
    )
    await loadUpcomingAppointments(false)
  }

  function updateFormValue(field: keyof AppointmentFormValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
  }

  function startVisitFromAppointment(appointmentId: string) {
    const searchParams = new URLSearchParams({ appointmentId })
    navigate(`${getPatientVisitCompletionPath(patientId)}?${searchParams}`)
  }

  return (
    <Card
      className="scroll-mt-6 border-cyan-100 bg-cyan-50/30 shadow-sm"
      id="patient-appointments"
    >
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Appointments</CardTitle>
              <Badge variant="info">Patient scheduling</Badge>
            </div>
            <CardDescription>
              Lightweight patient appointment context. Full calendar views are
              not implemented yet.
            </CardDescription>
          </div>
          <Button
            onClick={() => void loadUpcomingAppointments()}
            size="sm"
            variant="secondary"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {isLoading ? (
          <LoadingState label="Loading appointments..." />
        ) : loadError ? (
          <ErrorState
            title="Appointments unavailable"
            description={loadError}
            action={
              <Button onClick={() => void loadUpcomingAppointments()}>
                Try again
              </Button>
            }
          />
        ) : nextAppointment ? (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.55fr)]">
            <MetricTile
              label="Next appointment"
              value={formatPatientDateTime(nextAppointment.scheduled_start)}
              description={
                nextAppointment.reason?.trim() || 'No appointment reason recorded.'
              }
              tone="info"
            />
            <div className="rounded-md border border-cyan-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <AppointmentStatusBadge status={nextAppointment.status} />
                {additionalAppointmentCount > 0 ? (
                  <Badge variant="neutral">
                    +{additionalAppointmentCount} more
                  </Badge>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {nextAppointment.notes?.trim() || 'No appointment notes recorded.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  disabled={Boolean(statusSubmitting)}
                  onClick={() => startVisitFromAppointment(nextAppointment.id)}
                  size="sm"
                >
                  Start visit
                </Button>
                <Button
                  disabled={Boolean(statusSubmitting)}
                  onClick={() => void handleStatusUpdate('completed')}
                  size="sm"
                  variant="secondary"
                >
                  {statusSubmitting === 'completed' ? 'Updating...' : 'Complete'}
                </Button>
                <Button
                  disabled={Boolean(statusSubmitting)}
                  onClick={() => void handleStatusUpdate('cancelled')}
                  size="sm"
                  variant="ghost"
                >
                  {statusSubmitting === 'cancelled' ? 'Updating...' : 'Cancel'}
                </Button>
                <Button
                  disabled={Boolean(statusSubmitting)}
                  onClick={() => void handleStatusUpdate('no_show')}
                  size="sm"
                  variant="ghost"
                >
                  {statusSubmitting === 'no_show' ? 'Updating...' : 'No-show'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <InlineNotice variant="neutral">
            No upcoming appointment is scheduled for this patient.
          </InlineNotice>
        )}

        {successMessage ? (
          <InlineNotice variant="success">{successMessage}</InlineNotice>
        ) : null}
        {formError ? (
          <InlineNotice variant="danger">{formError}</InlineNotice>
        ) : null}

        <div
          className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
          id="patient-appointment-form"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-950">
                Schedule appointment
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Creates a scheduled appointment only. It does not create a visit,
                reminder, or calendar event.
              </p>
            </div>
            {schedulePreview.scheduledStart ? (
              <Badge variant="info">
                {formatPatientDateTime(schedulePreview.scheduledStart)}
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label>
              <FieldLabel>Date</FieldLabel>
              <TextInput
                disabled={isSubmitting}
                type="date"
                value={formValues.date}
                onChange={(event) => updateFormValue('date', event.target.value)}
              />
            </label>
            <label>
              <FieldLabel>Time</FieldLabel>
              <TextInput
                disabled={isSubmitting}
                type="time"
                value={formValues.time}
                onChange={(event) => updateFormValue('time', event.target.value)}
              />
            </label>
            <label>
              <FieldLabel>Duration</FieldLabel>
              <Select
                disabled={isSubmitting}
                value={formValues.duration}
                onChange={(event) =>
                  updateFormValue('duration', event.target.value)
                }
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </Select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label>
              <FieldLabel>Reason</FieldLabel>
              <TextInput
                disabled={isSubmitting}
                placeholder="Control visit, follow-up, consultation"
                value={formValues.reason}
                onChange={(event) =>
                  updateFormValue('reason', event.target.value)
                }
              />
            </label>
            <label>
              <FieldLabel>Notes</FieldLabel>
              <Textarea
                className="min-h-24"
                disabled={isSubmitting}
                placeholder="Optional scheduling notes"
                value={formValues.notes}
                onChange={(event) => updateFormValue('notes', event.target.value)}
              />
            </label>
          </div>

          {schedulePreview.error ? (
            <FieldError message={schedulePreview.error} />
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={isSubmitting || Boolean(schedulePreview.error)}
              onClick={() => void handleCreateAppointment()}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule appointment'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
