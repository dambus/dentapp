import { useEffect, useMemo, useRef, useState } from 'react'
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
  appointmentStatusBadgeVariants,
  appointmentStatusLabels,
} from '../appointments/appointmentDisplay'
import {
  APPOINTMENT_NOTES_MAX_LENGTH,
  APPOINTMENT_REASON_MAX_LENGTH,
  createAppointment,
  fetchUpcomingAppointmentsForPatient,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from '../appointments/appointmentService'
import { formatPatientDateTime } from './patientDisplay'
import {
  getAppointmentDetailPath,
  getPatientVisitCompletionPath,
} from '../../routes/routePaths'

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

type AppointmentSchedulePreview = {
  error: string | null
  scheduledEnd: string | null
  scheduledStart: string | null
}

const dateInputPattern = /^\d{4}-\d{2}-\d{2}$/
const timeInputPattern = /^\d{2}:\d{2}$/

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
    return 'Appointments could not be loaded. Try again.'
  }

  return 'Appointments could not be loaded. Try again.'
}

function buildSchedule(values: AppointmentFormValues): AppointmentSchedulePreview {
  const reason = values.reason
  const notes = values.notes
  const normalizedReason = reason.trim()
  const normalizedNotes = notes.trim()
  const dateValue = values.date.trim()
  const timeValue = values.time.trim()

  if (!dateValue) {
    return {
      error: 'Choose an appointment date.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  if (!timeValue) {
    return {
      error: 'Choose an appointment time.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  if (!dateInputPattern.test(dateValue) || !timeInputPattern.test(timeValue)) {
    return {
      error: 'Please choose a valid date and time.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  const scheduledStart = new Date(`${dateValue}T${timeValue}:00`)
  const durationMinutes = Number(values.duration)

  if (Number.isNaN(scheduledStart.getTime())) {
    return {
      error: 'Please choose a valid date and time.',
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

  if (reason.length > 0 && !normalizedReason) {
    return {
      error: 'Reason cannot be only spaces.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  if (notes.length > 0 && !normalizedNotes) {
    return {
      error: 'Notes cannot be only spaces.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  if (normalizedReason.length > APPOINTMENT_REASON_MAX_LENGTH) {
    return {
      error: `Reason must be ${APPOINTMENT_REASON_MAX_LENGTH} characters or fewer.`,
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  if (normalizedNotes.length > APPOINTMENT_NOTES_MAX_LENGTH) {
    return {
      error: `Notes must be ${APPOINTMENT_NOTES_MAX_LENGTH} characters or fewer.`,
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  const scheduledEnd = new Date(
    scheduledStart.getTime() + durationMinutes * 60 * 1000,
  )

  if (Number.isNaN(scheduledEnd.getTime()) || scheduledEnd <= scheduledStart) {
    return {
      error: 'Appointment end must be after start.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

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
    return 'Could not create appointment. Check your access and try again.'
  }

  if (normalizedMessage.includes('patient not found')) {
    return 'Patient could not be found for appointment scheduling.'
  }

  if (normalizedMessage.includes('demo mode')) {
    return 'Appointment persistence is not available in demo mode.'
  }

  if (
    normalizedMessage.includes('valid appointment') ||
    normalizedMessage.includes('valid date') ||
    normalizedMessage.includes('duration') ||
    normalizedMessage.includes('reason') ||
    normalizedMessage.includes('notes') ||
    normalizedMessage.includes('after start')
  ) {
    return message ?? 'Appointment details need a quick check.'
  }

  return 'Could not create appointment. Try again.'
}

function logAppointmentCreateDiagnostics({
  error,
  formValues,
  schedulePreview,
  validationErrors,
}: {
  error?: unknown
  formValues: AppointmentFormValues
  schedulePreview: AppointmentSchedulePreview
  validationErrors?: string | null
}) {
  if (!import.meta.env.DEV) {
    return
  }

  console.error('[appointment create]', {
    dateValue: formValues.date,
    timeValue: formValues.time,
    durationValue: formValues.duration,
    scheduledStart: schedulePreview.scheduledStart,
    scheduledEnd: schedulePreview.scheduledEnd,
    validationErrors,
    error:
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : error,
  })
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={appointmentStatusBadgeVariants[status]}>
      {appointmentStatusLabels[status]}
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
  const createSubmittingRef = useRef(false)
  const statusSubmittingRef = useRef(false)

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
    if (isLoading || isSubmitting || createSubmittingRef.current) {
      return
    }

    setFormError(null)
    setSuccessMessage(null)

    if (schedulePreview.error || !schedulePreview.scheduledStart) {
      logAppointmentCreateDiagnostics({
        formValues,
        schedulePreview,
        validationErrors: schedulePreview.error ?? 'Missing scheduled start.',
      })
      setFormError(schedulePreview.error ?? 'Appointment time is required.')
      return
    }

    createSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      const result = await createAppointment({
        patientId,
        scheduledStart: schedulePreview.scheduledStart,
        scheduledEnd: schedulePreview.scheduledEnd,
        reason: formValues.reason.trim(),
        notes: formValues.notes.trim(),
      })

      if (!result.ok) {
        logAppointmentCreateDiagnostics({
          error: result.error ?? result.message,
          formValues,
          schedulePreview,
          validationErrors: result.error ?? result.message,
        })
        setFormError(getCreateErrorMessage(result.error ?? result.message))
        return
      }

      setSuccessMessage(result.message ?? 'Appointment was created successfully.')
      setFormValues(getDefaultAppointmentValues())
      await loadUpcomingAppointments(false)
    } catch (error) {
      logAppointmentCreateDiagnostics({
        error,
        formValues,
        schedulePreview,
      })
      setFormError('Could not create appointment. Try again.')
    } finally {
      createSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  async function handleStatusUpdate(status: AppointmentStatus) {
    if (!nextAppointment || statusSubmitting || statusSubmittingRef.current || isLoading) {
      return
    }

    setFormError(null)
    setSuccessMessage(null)
    statusSubmittingRef.current = true
    setStatusSubmitting(status)

    try {
      const result = await updateAppointmentStatus({
        appointmentId: nextAppointment.id,
        status,
      })

      if (!result.ok) {
        setFormError(
          'Could not update appointment status. Try again.',
        )
        return
      }

      setSuccessMessage(result.message ?? 'Appointment status updated.')
      await loadUpcomingAppointments(false)
    } catch {
      setFormError('Could not update appointment status. Try again.')
    } finally {
      statusSubmittingRef.current = false
      setStatusSubmitting(null)
    }
  }

  function updateFormValue(field: keyof AppointmentFormValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
  }

  function startVisitFromAppointment(appointmentId: string) {
    if (nextAppointment?.status !== 'scheduled') {
      setFormError('Only scheduled appointments can start a visit.')
      setSuccessMessage(null)
      return
    }

    const searchParams = new URLSearchParams({ appointmentId })
    navigate(`${getPatientVisitCompletionPath(patientId)}?${searchParams}`)
  }

  function openAppointmentDetail(appointmentId: string) {
    navigate(getAppointmentDetailPath(appointmentId))
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
                  disabled={Boolean(statusSubmitting) || isLoading}
                  onClick={() => openAppointmentDetail(nextAppointment.id)}
                  size="sm"
                  variant="secondary"
                >
                  Details
                </Button>
                <Button
                  disabled={
                    Boolean(statusSubmitting) ||
                    isLoading ||
                    nextAppointment.status !== 'scheduled'
                  }
                  onClick={() => startVisitFromAppointment(nextAppointment.id)}
                  size="sm"
                >
                  Start visit
                </Button>
                <Button
                  disabled={Boolean(statusSubmitting) || isLoading}
                  onClick={() => void handleStatusUpdate('completed')}
                  size="sm"
                  variant="secondary"
                >
                  {statusSubmitting === 'completed' ? 'Updating...' : 'Complete'}
                </Button>
                <Button
                  disabled={Boolean(statusSubmitting) || isLoading}
                  onClick={() => void handleStatusUpdate('cancelled')}
                  size="sm"
                  variant="ghost"
                >
                  {statusSubmitting === 'cancelled' ? 'Updating...' : 'Cancel'}
                </Button>
                <Button
                  disabled={Boolean(statusSubmitting) || isLoading}
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
            No upcoming appointment is scheduled for this patient. Use the form below to add one.
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
              Creates a scheduled appointment linked to this patient. No visit, reminder, or calendar event is created.
              </p>
            </div>
            {schedulePreview.scheduledStart ? (
              <Badge variant="info">
                {formatPatientDateTime(schedulePreview.scheduledStart)}
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label>
              <FieldLabel>Date</FieldLabel>
              <TextInput
                disabled={isSubmitting}
                data-testid="patient-appointment-date"
                type="date"
                value={formValues.date}
                onChange={(event) => updateFormValue('date', event.target.value)}
              />
            </label>
            <label>
              <FieldLabel>Time</FieldLabel>
              <TextInput
                disabled={isSubmitting}
                data-testid="patient-appointment-time"
                type="time"
                value={formValues.time}
                onChange={(event) => updateFormValue('time', event.target.value)}
              />
            </label>
            <label>
              <FieldLabel>Duration</FieldLabel>
              <Select
                disabled={isSubmitting}
                data-testid="patient-appointment-duration"
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
                data-testid="patient-appointment-reason"
                disabled={isSubmitting}
                maxLength={APPOINTMENT_REASON_MAX_LENGTH}
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
                className="min-h-16"
                data-testid="patient-appointment-notes"
                disabled={isSubmitting}
                maxLength={APPOINTMENT_NOTES_MAX_LENGTH}
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
              data-testid="patient-appointment-submit"
              disabled={isSubmitting || isLoading || Boolean(schedulePreview.error)}
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
