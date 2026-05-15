import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  FieldLabel,
  InlineNotice,
  LoadingState,
  TextInput,
} from '../components/ui'
import {
  appointmentStatusBadgeVariants,
  appointmentStatusLabels,
  formatAppointmentTimeRange,
} from '../features/appointments/appointmentDisplay'
import {
  fetchAppointmentsForRange,
  updateAppointmentStatus,
  type AppointmentRangeItem,
  type AppointmentStatus,
} from '../features/appointments/appointmentService'
import { formatPatientDate } from '../features/patients/patientDisplay'
import {
  getAppointmentDetailPath,
  getPatientDetailPath,
  getPatientVisitCompletionPath,
} from '../routes/routePaths'

type StatusUpdateState = {
  appointmentId: string
  status: AppointmentStatus
} | null

type ScheduleViewMode = 'day' | 'week'

function getDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayDateInputValue() {
  return getDateInputValue(new Date())
}

function parseDateInput(value: string) {
  const parsed = new Date(`${value}T00:00:00`)

  return Number.isNaN(parsed.getTime())
    ? new Date(`${getTodayDateInputValue()}T00:00:00`)
    : parsed
}

function addDays(dateValue: string, days: number) {
  const nextDate = parseDateInput(dateValue)
  nextDate.setDate(nextDate.getDate() + days)

  return getDateInputValue(nextDate)
}

function getWeekStart(dateValue: string) {
  const date = parseDateInput(dateValue)
  const day = date.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day

  date.setDate(date.getDate() + mondayOffset)

  return getDateInputValue(date)
}

function getWeekEnd(dateValue: string) {
  return addDays(getWeekStart(dateValue), 6)
}

function getWeekDays(dateValue: string) {
  const start = getWeekStart(dateValue)

  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

function formatWeekRange(dateValue: string) {
  const start = getWeekStart(dateValue)
  const end = getWeekEnd(dateValue)

  return `${formatPatientDate(start)} - ${formatPatientDate(end)}`
}

function getLoadErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'You do not have permission to load appointments in this schedule view.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network')
  ) {
    return 'Appointments could not be loaded. Check the local Supabase connection and try again.'
  }

  return message || 'Appointments could not be loaded.'
}

function groupAppointmentsByDay(appointments: AppointmentRangeItem[]) {
  return appointments.reduce<Record<string, AppointmentRangeItem[]>>(
    (groups, appointment) => {
      const dayKey = getDateInputValue(new Date(appointment.scheduled_start))
      groups[dayKey] = groups[dayKey] ?? []
      groups[dayKey].push(appointment)

      return groups
    },
    {},
  )
}

export function AppointmentsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('day')
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateInputValue())
  const [appointments, setAppointments] = useState<AppointmentRangeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [statusUpdateState, setStatusUpdateState] =
    useState<StatusUpdateState>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const todayDateValue = useMemo(() => getTodayDateInputValue(), [])
  const isTodaySelected = selectedDate === todayDateValue
  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate])
  const weekEnd = useMemo(() => getWeekEnd(selectedDate), [selectedDate])
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])
  const appointmentsByDay = useMemo(
    () => groupAppointmentsByDay(appointments),
    [appointments],
  )

  const selectedRange = useMemo(
    () =>
      viewMode === 'day'
        ? {
            end: selectedDate,
            label: formatPatientDate(selectedDate),
            start: selectedDate,
            title: 'Daily schedule',
          }
        : {
            end: weekEnd,
            label: formatWeekRange(selectedDate),
            start: weekStart,
            title: 'Weekly schedule',
          },
    [selectedDate, viewMode, weekEnd, weekStart],
  )

  async function loadAppointments(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    setLoadError(null)

    try {
      const loadedAppointments = await fetchAppointmentsForRange(
        selectedRange.start,
        selectedRange.end,
      )
      setAppointments(loadedAppointments)
    } catch (error) {
      setLoadError(
        getLoadErrorMessage(error instanceof Error ? error.message : null),
      )
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitial() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const loadedAppointments = await fetchAppointmentsForRange(
          selectedRange.start,
          selectedRange.end,
        )

        if (isCurrent) {
          setAppointments(loadedAppointments)
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            getLoadErrorMessage(error instanceof Error ? error.message : null),
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadInitial()

    return () => {
      isCurrent = false
    }
  }, [selectedRange.end, selectedRange.start])

  async function handleStatusUpdate(
    appointment: AppointmentRangeItem,
    status: AppointmentStatus,
  ) {
    if (statusUpdateState) {
      return
    }

    setActionFeedback(null)
    setStatusUpdateState({ appointmentId: appointment.id, status })

    const result = await updateAppointmentStatus({
      appointmentId: appointment.id,
      status,
    })

    setStatusUpdateState(null)

    if (!result.ok) {
      setActionFeedback('Could not update appointment status. Try again.')
      return
    }

    setActionFeedback(result.message ?? 'Appointment status updated.')
    await loadAppointments(false)
  }

  function navigateToPatient(appointment: AppointmentRangeItem) {
    navigate(getPatientDetailPath(appointment.patient_id))
  }

  function navigateToAppointment(appointment: AppointmentRangeItem) {
    navigate(getAppointmentDetailPath(appointment.id))
  }

  function startVisit(appointment: AppointmentRangeItem) {
    const searchParams = new URLSearchParams({ appointmentId: appointment.id })
    navigate(
      `${getPatientVisitCompletionPath(appointment.patient_id)}?${searchParams}`,
    )
  }

  function renderAppointmentCard(appointment: AppointmentRangeItem) {
    const isStatusUpdating = statusUpdateState?.appointmentId === appointment.id
    const isBusy = isLoading || Boolean(statusUpdateState)

    return (
      <div
        className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
        data-testid="appointment-card"
        key={appointment.id}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-slate-950">
                {formatAppointmentTimeRange(
                  appointment.scheduled_start,
                  appointment.scheduled_end,
                )}
              </div>
              <Badge variant={appointmentStatusBadgeVariants[appointment.status]}>
                {appointmentStatusLabels[appointment.status]}
              </Badge>
            </div>
            <div className="wrap-break-word text-base font-semibold text-slate-950">
              {appointment.patient?.fullName || 'Unknown patient'}
            </div>
            <p className="wrap-break-word text-sm leading-6 text-slate-600">
              {appointment.reason?.trim() || 'No appointment reason recorded.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button
              className="w-full sm:w-auto"
              disabled={isBusy}
              onClick={() => navigateToAppointment(appointment)}
              size="sm"
              variant="secondary"
            >
              Details
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={isBusy}
              onClick={() => navigateToPatient(appointment)}
              size="sm"
              variant="secondary"
            >
              Open patient
            </Button>
            {appointment.status === 'scheduled' ? (
              <>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isBusy}
                  onClick={() => startVisit(appointment)}
                  size="sm"
                >
                  {isBusy ? 'Opening...' : 'Start visit'}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  disabled={Boolean(isStatusUpdating)}
                  onClick={() => void handleStatusUpdate(appointment, 'completed')}
                  size="sm"
                  variant="secondary"
                >
                  {isStatusUpdating && statusUpdateState?.status === 'completed'
                    ? 'Updating...'
                    : 'Complete'}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  disabled={Boolean(isStatusUpdating)}
                  onClick={() => void handleStatusUpdate(appointment, 'cancelled')}
                  size="sm"
                  variant="ghost"
                >
                  {isStatusUpdating && statusUpdateState?.status === 'cancelled'
                    ? 'Updating...'
                    : 'Cancel'}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  disabled={Boolean(isStatusUpdating)}
                  onClick={() => void handleStatusUpdate(appointment, 'no_show')}
                  size="sm"
                  variant="ghost"
                >
                  {isStatusUpdating && statusUpdateState?.status === 'no_show'
                    ? 'Updating...'
                    : 'No-show'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Page>
      <PageHeader
        title="Appointments"
        description={
          viewMode === 'day'
            ? 'Daily operational schedule.'
            : 'Weekly operational schedule.'
        }
        actions={
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex w-full rounded-md border border-slate-200 bg-white p-1 sm:w-auto">
              <Button
                className="flex-1 sm:flex-none"
                onClick={() => setViewMode('day')}
                size="sm"
                variant={viewMode === 'day' ? 'primary' : 'ghost'}
              >
                Day
              </Button>
              <Button
                className="flex-1 sm:flex-none"
                data-testid="appointments-week-mode"
                onClick={() => setViewMode('week')}
                size="sm"
                variant={viewMode === 'week' ? 'primary' : 'ghost'}
              >
                Week
              </Button>
            </div>

            {viewMode === 'day' ? (
              <div className="flex flex-nowrap items-end gap-2 overflow-x-auto pb-0.5">
                <label>
                  <FieldLabel>Date</FieldLabel>
                  <TextInput
                    data-testid="appointments-date-input"
                    onChange={(event) => setSelectedDate(event.target.value)}
                    type="date"
                    value={selectedDate}
                  />
                </label>
                <Button
                  disabled={isLoading}
                  onClick={() => setSelectedDate(todayDateValue)}
                  size="sm"
                  variant="secondary"
                >
                  Today
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={() => setSelectedDate(addDays(todayDateValue, 1))}
                  size="sm"
                  variant="secondary"
                >
                  Tomorrow
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={() => void loadAppointments()}
                  size="sm"
                  variant="ghost"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
                <Button
                  disabled={isLoading}
                  onClick={() => setSelectedDate(addDays(weekStart, -7))}
                  size="sm"
                  variant="secondary"
                >
                  Previous week
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={() => setSelectedDate(todayDateValue)}
                  size="sm"
                  variant="secondary"
                >
                  This week
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={() => setSelectedDate(addDays(weekStart, 7))}
                  size="sm"
                  variant="secondary"
                >
                  Next week
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={() => void loadAppointments()}
                  size="sm"
                  variant="ghost"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            )}
          </div>
        }
      />

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle>{selectedRange.title}</CardTitle>
              <CardDescription>{selectedRange.label}</CardDescription>
            </div>
            <Badge variant="info">
              {appointments.length}{' '}
              {appointments.length === 1 ? 'appointment' : 'appointments'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div data-testid="appointments-loading-state">
              <LoadingState label="Loading appointments..." />
            </div>
          ) : null}

          {!isLoading && loadError ? (
            <ErrorState
              action={<Button onClick={() => void loadAppointments()}>Try again</Button>}
              description={loadError}
              title="Appointments unavailable"
            />
          ) : null}

          {!isLoading && !loadError && appointments.length === 0 ? (
            <div data-testid="appointments-empty-state">
              <EmptyState
                action={
                  <Button
                    onClick={() => setSelectedDate(todayDateValue)}
                    size="sm"
                    variant="secondary"
                  >
                    {viewMode === 'day' ? 'Back to today' : 'Back to this week'}
                  </Button>
                }
                description={
                  viewMode === 'day'
                    ? isTodaySelected
                      ? 'Try Tomorrow, or schedule a new appointment from a patient record.'
                      : 'Try Today, or schedule a new appointment from a patient record.'
                    : 'Try another week, or schedule a new appointment from a patient record.'
                }
                title={
                  viewMode === 'day'
                    ? isTodaySelected
                      ? 'No appointments today'
                      : 'No appointments for selected date'
                    : 'No appointments this week'
                }
              />
            </div>
          ) : null}

          {!isLoading && !loadError && appointments.length > 0 && viewMode === 'day' ? (
            <div className="space-y-4" data-testid="appointments-list">
              {appointments.map((appointment) => renderAppointmentCard(appointment))}
            </div>
          ) : null}

          {!isLoading && !loadError && viewMode === 'week' ? (
            <div className="space-y-3" data-testid="appointments-week-list">
              {weekDays.map((dayValue) => {
                const dayAppointments = appointmentsByDay[dayValue] ?? []

                return (
                  <section
                    className="rounded-md border border-slate-200 bg-slate-50 p-3"
                    data-testid="appointments-week-day"
                    key={dayValue}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-950">
                          {formatPatientDate(dayValue)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {dayAppointments.length}{' '}
                          {dayAppointments.length === 1
                            ? 'appointment'
                            : 'appointments'}
                        </div>
                      </div>
                      {dayAppointments.length === 0 ? (
                        <Badge variant="neutral">Open</Badge>
                      ) : null}
                    </div>

                    {dayAppointments.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        {dayAppointments.map((appointment) =>
                          renderAppointmentCard(appointment),
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        No appointments scheduled.
                      </p>
                    )}
                  </section>
                )
              })}
            </div>
          ) : null}

          {actionFeedback ? (
            <InlineNotice variant="info">{actionFeedback}</InlineNotice>
          ) : null}
        </CardContent>
      </Card>
    </Page>
  )
}
