import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

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
  Select,
  TextInput,
} from '../components/ui'
import { AppointmentCard } from '../features/appointments/AppointmentCard'
import {
  APPOINTMENT_LIFECYCLE_UNAVAILABLE_MESSAGE,
  canUpdateAppointmentLifecycle,
  canUpdateAppointmentOperationalState,
  fetchAppointmentsForRange,
  fetchAssignableAppointmentProviders,
  getAppointmentLifecycleSuccessMessage,
  getAppointmentOperationalSuccessMessage,
  getNextAppointmentOperationalState,
  getPreviousAppointmentOperationalState,
  updateAppointmentOperationalState,
  updateAppointmentStatus,
  type AppointmentOperationalState,
  type AppointmentRangeItem,
  type AppointmentProviderSummary,
  type AppointmentStatus,
} from '../features/appointments/appointmentService'
import { formatPatientDate } from '../features/patients/patientDisplay'
import {
  getAppointmentDetailPath,
  getPatientDetailPath,
  getPatientVisitDetailPath,
  getPatientVisitCompletionPath,
} from '../routes/routePaths'

type StatusUpdateState = {
  appointmentId: string
  status: AppointmentStatus
} | null

type OperationalUpdateState = {
  appointmentId: string
  state: AppointmentOperationalState
} | null

type ActionFeedback = {
  message: string
  variant: 'danger' | 'success' | 'warning'
} | null

type ScheduleViewMode = 'day' | 'week'
type ProviderFilterValue = 'all' | 'unassigned' | string
const defaultProviderFilter: ProviderFilterValue = 'all'

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

  return 'Appointments could not be loaded. Try again.'
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

function filterAppointmentsByProvider(
  appointments: AppointmentRangeItem[],
  providerFilter: ProviderFilterValue,
) {
  if (providerFilter === 'all') {
    return appointments
  }

  if (providerFilter === 'unassigned') {
    return appointments.filter((appointment) => !appointment.assigned_provider_id)
  }

  return appointments.filter(
    (appointment) => appointment.assigned_provider_id === providerFilter,
  )
}

function getProviderFilterEmptyTitle(
  providerFilter: ProviderFilterValue,
  providerOptions: AppointmentProviderSummary[],
) {
  if (providerFilter === 'unassigned') {
    return 'No unassigned appointments'
  }

  const provider = providerOptions.find((option) => option.id === providerFilter)

  return provider
    ? `No appointments for ${provider.fullName}`
    : 'No appointments for this provider'
}

function getProviderSearchParamValue(value: string | null) {
  const normalizedValue = value?.trim() ?? ''

  return normalizedValue || defaultProviderFilter
}

export function AppointmentsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('day')
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateInputValue())
  const [appointments, setAppointments] = useState<AppointmentRangeItem[]>([])
  const [providerOptions, setProviderOptions] = useState<
    AppointmentProviderSummary[]
  >([])
  const [hasLoadedProviderOptions, setHasLoadedProviderOptions] = useState(false)
  const [providerLoadError, setProviderLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [statusUpdateState, setStatusUpdateState] =
    useState<StatusUpdateState>(null)
  const [operationalUpdateState, setOperationalUpdateState] =
    useState<OperationalUpdateState>(null)
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback>(null)
  const statusUpdateRef = useRef(false)
  const operationalUpdateRef = useRef(false)
  const todayDateValue = useMemo(() => getTodayDateInputValue(), [])
  const isTodaySelected = selectedDate === todayDateValue
  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate])
  const weekEnd = useMemo(() => getWeekEnd(selectedDate), [selectedDate])
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])
  const providerFilterParam = getProviderSearchParamValue(
    searchParams.get('provider'),
  )
  const isBuiltInProviderFilter =
    providerFilterParam === 'all' || providerFilterParam === 'unassigned'
  const isKnownProviderFilter = providerOptions.some(
    (provider) => provider.id === providerFilterParam,
  )
  const providerFilter =
    isBuiltInProviderFilter || isKnownProviderFilter || !hasLoadedProviderOptions
      ? providerFilterParam
      : defaultProviderFilter
  const filteredAppointments = useMemo(
    () => filterAppointmentsByProvider(appointments, providerFilter),
    [appointments, providerFilter],
  )
  const hasFilteredOutLoadedAppointments =
    appointments.length > 0 && filteredAppointments.length === 0
  const appointmentsByDay = useMemo(
    () => groupAppointmentsByDay(filteredAppointments),
    [filteredAppointments],
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

  useEffect(() => {
    let isCurrent = true

    async function loadProviders() {
      try {
        const providers = await fetchAssignableAppointmentProviders()

        if (isCurrent) {
          setProviderOptions(providers)
          setHasLoadedProviderOptions(true)
          setProviderLoadError(null)
        }
      } catch {
        if (isCurrent) {
          setHasLoadedProviderOptions(true)
          setProviderLoadError('Provider filter options could not be loaded.')
        }
      }
    }

    void loadProviders()

    return () => {
      isCurrent = false
    }
  }, [])

  function handleProviderFilterChange(nextProviderFilter: ProviderFilterValue) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.set('provider', nextProviderFilter)

      return nextParams
    })
  }

  async function handleStatusUpdate(
    appointment: AppointmentRangeItem,
    status: AppointmentStatus,
  ) {
    if (statusUpdateState || statusUpdateRef.current) {
      return
    }

    if (!canUpdateAppointmentLifecycle(appointment)) {
      setActionFeedback({
        message: APPOINTMENT_LIFECYCLE_UNAVAILABLE_MESSAGE,
        variant: 'warning',
      })
      return
    }

    setActionFeedback(null)
    statusUpdateRef.current = true
    setStatusUpdateState({ appointmentId: appointment.id, status })

    try {
      const result = await updateAppointmentStatus({
        appointmentId: appointment.id,
        status,
      })

      if (!result.ok) {
        setActionFeedback({
          message: 'Could not update appointment status. Try again.',
          variant: 'danger',
        })
        return
      }

      setActionFeedback({
        message: getAppointmentLifecycleSuccessMessage(status),
        variant: 'success',
      })
      await loadAppointments(false)
    } catch {
      setActionFeedback({
        message: 'Could not update appointment status. Try again.',
        variant: 'danger',
      })
    } finally {
      statusUpdateRef.current = false
      setStatusUpdateState(null)
    }
  }

  async function handleOperationalStateUpdate(
    appointment: AppointmentRangeItem,
    state: AppointmentOperationalState,
  ) {
    if (operationalUpdateState || operationalUpdateRef.current) {
      return
    }

    if (
      !canUpdateAppointmentOperationalState(appointment) ||
      (getNextAppointmentOperationalState(appointment) !== state &&
        getPreviousAppointmentOperationalState(appointment) !== state)
    ) {
      setActionFeedback({
        message: 'This appointment cannot be updated for day-of-visit state.',
        variant: 'warning',
      })
      return
    }

    setActionFeedback(null)
    operationalUpdateRef.current = true
    setOperationalUpdateState({ appointmentId: appointment.id, state })

    try {
      const result = await updateAppointmentOperationalState({
        appointmentId: appointment.id,
        operationalState: state,
      })

      if (!result.ok) {
        setActionFeedback({
          message:
            result.error ??
            'Could not update appointment day-of-visit state. Try again.',
          variant: 'danger',
        })
        return
      }

      setActionFeedback({
        message:
          result.message ??
          getAppointmentOperationalSuccessMessage(state, {
            correction:
              getPreviousAppointmentOperationalState(appointment) === state,
          }),
        variant: 'success',
      })
      await loadAppointments(false)
    } catch {
      setActionFeedback({
        message: 'Could not update appointment day-of-visit state. Try again.',
        variant: 'danger',
      })
    } finally {
      operationalUpdateRef.current = false
      setOperationalUpdateState(null)
    }
  }

  function navigateToPatient(appointment: AppointmentRangeItem) {
    navigate(getPatientDetailPath(appointment.patient?.routeId ?? appointment.patient_id))
  }

  function navigateToAppointment(appointment: AppointmentRangeItem) {
    navigate(getAppointmentDetailPath(appointment.id))
  }

  function startVisit(appointment: AppointmentRangeItem) {
    if (appointment.status !== 'scheduled') {
      setActionFeedback({
        message: 'Only scheduled appointments can start a visit.',
        variant: 'warning',
      })
      return
    }

    const searchParams = new URLSearchParams({ appointmentId: appointment.id })
    navigate(
      `${getPatientVisitCompletionPath(
        appointment.patient?.routeId ?? appointment.patient_id,
      )}?${searchParams}`,
    )
  }

  function viewCompletedVisit(appointment: AppointmentRangeItem) {
    if (!appointment.linkedVisit) {
      return
    }

    navigate(
      getPatientVisitDetailPath(
        appointment.patient?.routeId ?? appointment.patient_id,
        appointment.linkedVisit.id,
      ),
    )
  }

  function renderAppointmentCard(
    appointment: AppointmentRangeItem,
    variant: 'default' | 'compact' = 'default',
  ) {
    const isStatusUpdating = statusUpdateState?.appointmentId === appointment.id
    const isOperationalUpdating =
      operationalUpdateState?.appointmentId === appointment.id
    const isBusy =
      isLoading || Boolean(statusUpdateState) || Boolean(operationalUpdateState)

    return (
      <AppointmentCard
        appointment={appointment}
        isBusy={isBusy}
        key={appointment.id}
        onOpenDetails={() => navigateToAppointment(appointment)}
        onOpenPatient={() => navigateToPatient(appointment)}
        onOperationalStateChange={(state) =>
          void handleOperationalStateUpdate(appointment, state)
        }
        onStartVisit={() => startVisit(appointment)}
        onStatusChange={(status) => void handleStatusUpdate(appointment, status)}
        onViewVisit={
          appointment.linkedVisit ? () => viewCompletedVisit(appointment) : undefined
        }
        operationalStateUpdateStatus={
          isOperationalUpdating ? operationalUpdateState?.state : null
        }
        statusUpdateStatus={isStatusUpdating ? statusUpdateState?.status : null}
        variant={variant}
      />
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
      />

      <Card className="min-w-0 max-w-full border-slate-200 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle>{selectedRange.title}</CardTitle>
              <CardDescription>{selectedRange.label}</CardDescription>
            </div>
            <Badge variant="info">
              {filteredAppointments.length}{' '}
              {filteredAppointments.length === 1 ? 'appointment' : 'appointments'}
            </Badge>
          </div>

          <div className="min-w-0 max-w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="grid min-w-0 max-w-full grid-cols-1 gap-2.5 lg:grid-cols-[auto_minmax(0,15rem)_minmax(0,18rem)_minmax(0,1fr)] lg:items-end">
              <div className="min-w-0">
                <FieldLabel>View</FieldLabel>
                <div className="mt-2 flex rounded-md border border-slate-200 bg-white p-1">
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
              </div>

              <label className="min-w-0">
                <FieldLabel>{viewMode === 'day' ? 'Date' : 'Week'}</FieldLabel>
                <TextInput
                  data-testid="appointments-date-input"
                  onChange={(event) => setSelectedDate(event.target.value)}
                  type="date"
                  value={selectedDate}
                />
              </label>

              <label className="min-w-0">
                <FieldLabel>Assigned provider</FieldLabel>
                <Select
                  data-testid="appointments-provider-filter"
                  disabled={isLoading}
                  onChange={(event) =>
                    handleProviderFilterChange(event.target.value)
                  }
                  value={providerFilter}
                >
                  <option value="all">All providers</option>
                  <option value="unassigned">Unassigned</option>
                  {providerOptions.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.fullName} ({provider.role})
                    </option>
                  ))}
                </Select>
              </label>

              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
                {viewMode === 'day' ? (
                  <>
                    <Button
                      className="min-h-10"
                      disabled={isLoading}
                      onClick={() => setSelectedDate(todayDateValue)}
                      size="sm"
                      variant="secondary"
                    >
                      Today
                    </Button>
                    <Button
                      className="min-h-10"
                      disabled={isLoading}
                      onClick={() => setSelectedDate(addDays(todayDateValue, 1))}
                      size="sm"
                      variant="secondary"
                    >
                      Tomorrow
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="min-h-10"
                      disabled={isLoading}
                      onClick={() => setSelectedDate(addDays(weekStart, -7))}
                      size="sm"
                      variant="secondary"
                    >
                      Previous week
                    </Button>
                    <Button
                      className="min-h-10"
                      disabled={isLoading}
                      onClick={() => setSelectedDate(todayDateValue)}
                      size="sm"
                      variant="secondary"
                    >
                      This week
                    </Button>
                    <Button
                      className="min-h-10"
                      disabled={isLoading}
                      onClick={() => setSelectedDate(addDays(weekStart, 7))}
                      size="sm"
                      variant="secondary"
                    >
                      Next week
                    </Button>
                  </>
                )}
                <Button
                  className="min-h-10"
                  disabled={isLoading}
                  onClick={() => void loadAppointments()}
                  size="sm"
                  variant="ghost"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3.5 sm:space-y-4">
          {!loadError && providerLoadError ? (
            <InlineNotice variant="warning">{providerLoadError}</InlineNotice>
          ) : null}

          {isLoading ? (
            <div data-testid="appointments-loading-state">
              <LoadingState label="Loading schedule..." />
            </div>
          ) : null}

          {!isLoading && loadError ? (
            <ErrorState
              action={<Button onClick={() => void loadAppointments()}>Try again</Button>}
              description={loadError}
              title="Schedule unavailable"
            />
          ) : null}

          {!isLoading && !loadError && appointments.length === 0 ? (
            <div data-testid="appointments-empty-state">
              <EmptyState
                action={
                  <Button
                    className="min-h-10"
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
                      ? 'Try tomorrow, or schedule a new appointment from a patient record.'
                      : 'Try today, or schedule a new appointment from a patient record.'
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

          {!isLoading &&
          !loadError &&
          hasFilteredOutLoadedAppointments ? (
            <div data-testid="appointments-filter-empty-state">
              <EmptyState
                description="Switch provider filters or choose another date."
                title={getProviderFilterEmptyTitle(providerFilter, providerOptions)}
              />
            </div>
          ) : null}

          {!isLoading &&
          !loadError &&
          filteredAppointments.length > 0 &&
          viewMode === 'day' ? (
            <div className="min-w-0 max-w-full space-y-3 sm:space-y-4" data-testid="appointments-list">
              {filteredAppointments.map((appointment) =>
                renderAppointmentCard(appointment),
              )}
            </div>
          ) : null}

          {!isLoading &&
          !loadError &&
          !hasFilteredOutLoadedAppointments &&
          viewMode === 'week' ? (
            <div className="min-w-0 max-w-full space-y-3" data-testid="appointments-week-list">
              {weekDays.map((dayValue) => {
                const dayAppointments = appointmentsByDay[dayValue] ?? []

                return (
                  <section
                    className="min-w-0 max-w-full rounded-md border border-slate-200 bg-slate-50 p-3"
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
                          renderAppointmentCard(appointment, 'compact'),
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        No appointments scheduled for this day.
                      </p>
                    )}
                  </section>
                )
              })}
            </div>
          ) : null}

          {actionFeedback ? (
            <InlineNotice variant={actionFeedback.variant}>
              {actionFeedback.message}
            </InlineNotice>
          ) : null}
        </CardContent>
      </Card>
    </Page>
  )
}
