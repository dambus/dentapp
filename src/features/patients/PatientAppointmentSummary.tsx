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
import { AppointmentCard } from '../appointments/AppointmentCard'
import {
  APPOINTMENT_NOTES_MAX_LENGTH,
  APPOINTMENT_REASON_MAX_LENGTH,
  createAppointment,
  fetchUpcomingAppointmentsForPatient,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from '../appointments/appointmentService'
import {
  appointmentDurationOptions,
  appointmentTypes,
  defaultAppointmentTypeId,
  detectAppointmentTypeFromReason,
  getAppointmentTypeById,
  getDefaultAppointmentType,
  isAppointmentDurationOption,
  type AppointmentTypeId,
} from '../appointments/appointmentTypes'
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
  appointmentTypeId: AppointmentTypeId
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
  const defaultAppointmentType = getDefaultAppointmentType()
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)

  return {
    appointmentTypeId: defaultAppointmentType.id,
    date: nextHour.toISOString().slice(0, 10),
    time: nextHour.toTimeString().slice(0, 5),
    duration: String(defaultAppointmentType.defaultDurationMinutes),
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
  const appointmentType = getAppointmentTypeById(values.appointmentTypeId)

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

  if (!appointmentType) {
    return {
      error: 'Choose an appointment type.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  if (Number.isNaN(scheduledStart.getTime())) {
    return {
      error: 'Please choose a valid date and time.',
      scheduledEnd: null,
      scheduledStart: null,
    }
  }

  if (
    !Number.isFinite(durationMinutes) ||
    !isAppointmentDurationOption(durationMinutes)
  ) {
    return {
      error: 'Choose a valid 15-minute duration.',
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

function buildAppointmentReason(values: AppointmentFormValues) {
  const appointmentType = getAppointmentTypeById(values.appointmentTypeId)
  const normalizedReason = values.reason.trim()

  return normalizedReason || appointmentType?.label || 'Appointment'
}

function getAppointmentTypeForPrefill(reason: string) {
  return detectAppointmentTypeFromReason(reason)?.id ?? 'control'
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
  const [prefillNotice, setPrefillNotice] = useState<string | null>(null)
  const [lastCreatedAppointment, setLastCreatedAppointment] =
    useState<Appointment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusSubmitting, setStatusSubmitting] =
    useState<AppointmentStatus | null>(null)
  const createSubmittingRef = useRef(false)
  const statusSubmittingRef = useRef(false)
  const appliedPrefillReasonRef = useRef('')

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
        appointmentTypeId: getAppointmentTypeForPrefill(prefillReason),
        reason:
          !currentValues.reason.trim() ||
          currentValues.reason === appliedPrefillReasonRef.current
            ? prefillReason.trim()
            : currentValues.reason,
      }))
      appliedPrefillReasonRef.current = prefillReason.trim()
      setPrefillNotice(
        'Follow-up context is ready. Review the reason, choose date and time, then schedule manually.',
      )
      setSuccessMessage(null)
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
    setLastCreatedAppointment(null)

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
        reason: buildAppointmentReason(formValues),
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
      setPrefillNotice(null)
      setLastCreatedAppointment(result.appointment ?? null)
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
    if (field === 'reason') {
      setPrefillNotice(null)
    }
  }

  function updateAppointmentType(value: string) {
    const appointmentType =
      getAppointmentTypeById(value) ?? getAppointmentTypeById(defaultAppointmentTypeId)

    if (!appointmentType) {
      return
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      appointmentTypeId: appointmentType.id,
      duration: String(appointmentType.defaultDurationMinutes),
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

  function resetAppointmentForm() {
    setFormValues(getDefaultAppointmentValues())
    setFormError(null)
    setPrefillNotice(null)
    setSuccessMessage(null)
    setLastCreatedAppointment(null)
    appliedPrefillReasonRef.current = ''
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
              <AppointmentCard
                appointment={nextAppointment}
                className="border-0 p-0 shadow-none hover:border-transparent"
                isBusy={Boolean(statusSubmitting) || isLoading}
                onOpenDetails={() => openAppointmentDetail(nextAppointment.id)}
                onStartVisit={() => startVisitFromAppointment(nextAppointment.id)}
                onStatusChange={(status) => void handleStatusUpdate(status)}
                patientName="Current patient"
                statusUpdateStatus={statusSubmitting}
                variant="compact"
              />
              {additionalAppointmentCount > 0 ? (
                <div className="mt-3">
                  <Badge variant="neutral">
                    +{additionalAppointmentCount} more upcoming
                  </Badge>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <InlineNotice variant="neutral">
            No upcoming appointment is scheduled for this patient. Use the form below to add one.
          </InlineNotice>
        )}

        {successMessage ? (
          <InlineNotice
            data-testid="patient-appointment-success"
            variant="success"
          >
            <span>{successMessage}</span>
            {lastCreatedAppointment ? (
              <Button
                className="ml-0 mt-3 sm:ml-3 sm:mt-0"
                onClick={() => openAppointmentDetail(lastCreatedAppointment.id)}
                size="sm"
                variant="secondary"
              >
                View appointment
              </Button>
            ) : null}
          </InlineNotice>
        ) : null}
        {formError ? (
          <InlineNotice variant="danger">{formError}</InlineNotice>
        ) : null}

        <div
          className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          data-testid="patient-appointment-form"
          id="patient-appointment-form"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-semibold text-slate-950">
                  Create appointment
                </div>
                {prefillNotice ? (
                  <Badge variant="warning">Follow-up context</Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Choose the appointment details and submit manually. No visit,
                reminder, or task is created from this form.
              </p>
            </div>
            {schedulePreview.scheduledStart ? (
              <Badge variant="info">
                {formatPatientDateTime(schedulePreview.scheduledStart)}
              </Badge>
            ) : null}
          </div>

          {prefillNotice ? (
            <InlineNotice className="mt-4" variant="info">
              {prefillNotice}
            </InlineNotice>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <FieldLabel>Type</FieldLabel>
              <Select
                disabled={isSubmitting}
                data-testid="patient-appointment-type"
                value={formValues.appointmentTypeId}
                onChange={(event) => updateAppointmentType(event.target.value)}
              >
                {appointmentTypes.map((appointmentType) => (
                  <option key={appointmentType.id} value={appointmentType.id}>
                    {appointmentType.label}
                  </option>
                ))}
              </Select>
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
                {appointmentDurationOptions.map((durationMinutes) => (
                  <option key={durationMinutes} value={durationMinutes}>
                    {durationMinutes} min
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <label>
              <FieldLabel>Reason / context</FieldLabel>
              <TextInput
                data-testid="patient-appointment-reason"
                disabled={isSubmitting}
                maxLength={APPOINTMENT_REASON_MAX_LENGTH}
                placeholder="Optional context for this appointment"
                value={formValues.reason}
                onChange={(event) =>
                  updateFormValue('reason', event.target.value)
                }
              />
              {prefillNotice ? (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Prefilled from follow-up guidance. You can edit it before
                  scheduling.
                </p>
              ) : null}
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

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              className="min-h-11 sm:w-auto"
              data-testid="patient-appointment-submit"
              disabled={isSubmitting || isLoading || Boolean(schedulePreview.error)}
              onClick={() => void handleCreateAppointment()}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule appointment'}
            </Button>
            <Button
              className="min-h-11 sm:w-auto"
              disabled={isSubmitting}
              onClick={resetAppointmentForm}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
