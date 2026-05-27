import {
  ActionMenu,
  Badge,
  Button,
  StatusBadge,
  TypeBadge,
} from '../../components/ui'
import { classNames } from '../../lib/classNames'
import {
  formatAppointmentClockRange,
  getAppointmentDurationLabel,
} from './appointmentDisplay'
import { detectAppointmentTypeFromReason } from './appointmentTypes'
import {
  appointmentOperationalStateLabels,
  canUpdateAppointmentLifecycle,
  canUpdateAppointmentOperationalState,
  getAssignedProviderDisplayName,
  getAppointmentOperationalActionLabel,
  getAppointmentOperationalCorrectionLabel,
  getNextAppointmentOperationalState,
  getPreviousAppointmentOperationalState,
} from './appointmentService'
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CalendarX,
  Clock3,
  FileText,
  RotateCcw,
  Stethoscope,
  User,
  UserX,
} from 'lucide-react'
import type {
  Appointment,
  AppointmentLinkedVisitSummary,
  AppointmentOperationalState,
  AppointmentOpenVisitSummary,
  AppointmentPatientSummary,
  AppointmentStatus,
} from './appointmentService'

type CardAppointment = Appointment & {
  linkedVisit?: AppointmentLinkedVisitSummary | null
  openVisit?: AppointmentOpenVisitSummary | null
  patient?: AppointmentPatientSummary | null
}

type AppointmentCardProps = {
  appointment: CardAppointment
  className?: string
  isBusy?: boolean
  onOpenDetails: () => void
  onOpenPatient?: () => void
  onOperationalStateChange?: (state: AppointmentOperationalState) => void
  onStartVisit?: () => void
  onStatusChange?: (status: AppointmentStatus) => void
  onViewVisit?: () => void
  operationalStateUpdateStatus?: AppointmentOperationalState | null
  patientName?: string
  statusUpdateStatus?: AppointmentStatus | null
  variant?: 'default' | 'compact'
}

function getAppointmentTypeLabel(appointment: Appointment) {
  const detectedType = detectAppointmentTypeFromReason(appointment.reason)

  return {
    label: detectedType?.label ?? appointment.reason?.trim() ?? 'Appointment',
    variant: detectedType?.badgeVariant ?? 'neutral',
  }
}

const nextStepLabels: Record<string, string> = {
  no_follow_up: 'No follow-up needed',
  follow_up_recommended: 'Follow-up recommended',
  schedule_control_visit: 'Schedule control visit',
  continue_treatment_plan: 'Continue treatment plan',
  additional_diagnostics: 'Additional diagnostics',
  referral: 'Referral / specialist consultation',
}

function getFollowUpLabel(visit: AppointmentLinkedVisitSummary | null | undefined) {
  if (!visit) {
    return null
  }

  const recommendation = visit.recommendation.trim()

  if (recommendation) {
    return recommendation
  }

  return visit.nextStep ? nextStepLabels[visit.nextStep] ?? visit.nextStep : null
}

export function AppointmentCard({
  appointment,
  className,
  isBusy = false,
  onOpenDetails,
  onOpenPatient,
  onOperationalStateChange,
  onStartVisit,
  onStatusChange,
  onViewVisit,
  operationalStateUpdateStatus,
  patientName,
  statusUpdateStatus,
  variant = 'default',
}: AppointmentCardProps) {
  const displayPatientName =
    patientName ?? appointment.patient?.fullName ?? 'Unknown patient'
  const hasOpenVisit = Boolean(appointment.openVisit)
  const canStartOrContinueVisit =
    appointment.status === 'scheduled' && onStartVisit && !appointment.linkedVisit
  const canViewVisit = appointment.linkedVisit && onViewVisit
  const canUpdateLifecycle =
    canUpdateAppointmentLifecycle(appointment) && onStatusChange
  const nextOperationalState = getNextAppointmentOperationalState(appointment)
  const previousOperationalState =
    getPreviousAppointmentOperationalState(appointment)
  const canUpdateOperationalState =
    variant === 'default' &&
    canUpdateAppointmentOperationalState(appointment) &&
    Boolean(nextOperationalState) &&
    onOperationalStateChange
  const canCorrectOperationalState =
    variant === 'default' &&
    canUpdateAppointmentOperationalState(appointment) &&
    Boolean(previousOperationalState) &&
    onOperationalStateChange
  const followUpLabel = getFollowUpLabel(appointment.linkedVisit)
  const durationLabel = getAppointmentDurationLabel(
    appointment.scheduled_start,
    appointment.scheduled_end,
  )
  const typeBadge = getAppointmentTypeLabel(appointment)
  const statusToneClass =
    appointment.status === 'scheduled'
      ? 'border-l-cyan-500'
      : appointment.status === 'completed'
        ? 'border-l-emerald-500'
      : appointment.status === 'no_show'
          ? 'border-l-amber-500'
          : 'border-l-red-400 bg-slate-50'
  const providerLabel = getAssignedProviderDisplayName(appointment)
  const operationalLabel =
    appointmentOperationalStateLabels[appointment.operational_state]
  const operationalBadgeVariant =
    appointment.operational_state === 'ready_for_doctor'
      ? 'success'
      : appointment.operational_state === 'arrived'
        ? 'warning'
        : 'neutral'

  const menuItems = [
    onOpenPatient
      ? {
          disabled: isBusy,
          icon: User,
          label: 'Open patient',
          onSelect: onOpenPatient,
        }
      : null,
    canCorrectOperationalState && previousOperationalState
      ? {
          disabled: isBusy,
          icon: RotateCcw,
          label:
            operationalStateUpdateStatus === previousOperationalState
              ? 'Updating...'
              : getAppointmentOperationalCorrectionLabel(previousOperationalState),
          onSelect: () => onOperationalStateChange(previousOperationalState),
        }
      : null,
    canUpdateLifecycle
      ? {
          disabled: isBusy,
          icon: CalendarX,
          label:
            statusUpdateStatus === 'cancelled'
              ? 'Updating...'
              : 'Cancel',
          onSelect: () => onStatusChange('cancelled'),
          tone: 'danger' as const,
        }
      : null,
    canUpdateLifecycle
      ? {
          disabled: isBusy,
          icon: UserX,
          label:
            statusUpdateStatus === 'no_show' ? 'Updating...' : 'Mark no-show',
          onSelect: () => onStatusChange('no_show'),
          tone: 'danger' as const,
        }
      : null,
  ].filter((item) => item !== null)

  return (
    <article
      className={classNames(
        'group relative min-w-0 max-w-full rounded-lg border border-l-4 border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300',
        statusToneClass,
        variant === 'compact' ? 'p-3 sm:p-4' : 'p-4 sm:p-5',
        className,
      )}
      data-testid="appointment-card"
    >
      {menuItems.length > 0 ? (
        <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
          <ActionMenu
            disabled={isBusy}
            items={menuItems}
            label="Appointment actions"
            menuClassName="max-w-[calc(100vw-2rem)] min-w-48 p-1.5"
            itemClassName="min-h-10 gap-2.5 px-3.5 py-2.5 whitespace-normal font-medium"
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-4">
        <div className="grid min-w-0 max-w-full gap-3 pr-12 sm:grid-cols-[8.5rem_minmax(0,1fr)] lg:grid-cols-[9rem_minmax(0,1fr)_minmax(14rem,auto)] lg:items-start">
          <div
            className="min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
            data-testid="appointment-card-time"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Clock3 aria-hidden className="h-4 w-4 shrink-0 text-cyan-700" />
              Time
            </div>
            <div className="mt-1 text-lg font-semibold leading-6 text-slate-950">
              {formatAppointmentClockRange(
                appointment.scheduled_start,
                appointment.scheduled_end,
              )}
            </div>
            {durationLabel ? (
              <div className="mt-1 text-xs font-medium text-slate-500">
                {durationLabel}
              </div>
            ) : null}
          </div>

          <div className="min-w-0" data-testid="appointment-card-identity">
            {onOpenPatient ? (
              <button
                className="block max-w-full text-left text-lg font-semibold leading-7 text-slate-950 underline-offset-4 hover:text-teal-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:text-xl"
                data-testid="appointment-card-patient"
                disabled={isBusy}
                onClick={onOpenPatient}
                type="button"
              >
                <span className="wrap-break-word">{displayPatientName}</span>
              </button>
            ) : (
              <div
                className="wrap-break-word text-lg font-semibold leading-7 text-slate-950 sm:text-xl"
                data-testid="appointment-card-patient"
              >
                {displayPatientName}
              </div>
            )}

            <div
              className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-600"
              data-testid="appointment-card-context"
            >
              <TypeBadge
                className="max-w-full truncate"
                label={typeBadge.label}
                variant={typeBadge.variant}
              />
              <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md bg-slate-100/80 px-2 py-1">
                <Stethoscope aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
                <span
                  className="min-w-0 max-w-full truncate"
                  data-testid="appointment-card-provider"
                  title={`Assigned provider: ${providerLabel}`}
                >
                  Assigned provider: {providerLabel}
                </span>
              </span>
              {appointment.notes?.trim() ? (
                <span className="hidden min-w-0 max-w-full items-center gap-1 rounded-md bg-white px-2 py-1 text-slate-500 ring-1 ring-slate-200 sm:inline-flex">
                  <FileText
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-slate-400"
                  />
                  <span className="truncate">{appointment.notes.trim()}</span>
                </span>
              ) : null}
            </div>
          </div>

          <div
            className="flex min-w-0 max-w-full flex-wrap items-center gap-2 lg:justify-end"
            data-testid="appointment-card-status-area"
          >
            <Badge
              className="gap-1.5"
              data-testid="appointment-operational-state"
              variant={operationalBadgeVariant}
            >
              <Activity aria-hidden className="h-3.5 w-3.5" />
              {operationalLabel}
            </Badge>
            <StatusBadge status={appointment.status} />
            {hasOpenVisit ? (
              <Badge variant="warning">Visit in progress</Badge>
            ) : null}
            {appointment.linkedVisit ? (
              <Badge variant="success">Visit completed</Badge>
            ) : null}
          </div>
        </div>

        {hasOpenVisit ? (
          <div
            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900"
            data-testid="appointment-open-visit-state"
          >
            Visit Completion draft is in progress. Continue the visit to save
            more changes or complete it.
          </div>
        ) : appointment.linkedVisit ? (
          <div
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
            data-testid="appointment-completed-visit-state"
          >
            Completed visit is linked to this appointment.
          </div>
        ) : appointment.status === 'scheduled' ? (
          <div
            className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-900"
            data-testid="appointment-ready-state"
          >
            Ready to start Visit Completion.
          </div>
        ) : null}

        {followUpLabel ? (
          <div
            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900"
            data-testid="appointment-follow-up-signal"
          >
            Follow-up from completed visit: {followUpLabel}
          </div>
        ) : null}

        <div className="grid gap-3 border-t border-slate-100 pt-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div
            className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
            data-testid="appointment-operational-area"
          >
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-600">
              <CalendarClock aria-hidden className="h-4 w-4 shrink-0" />
              <span className="truncate">Reception state: {operationalLabel}</span>
            </div>
            {canUpdateOperationalState && nextOperationalState ? (
              <Button
                className="min-h-10 w-full gap-1.5 sm:w-auto"
                data-testid="appointment-operational-action"
                disabled={isBusy}
                onClick={() => onOperationalStateChange(nextOperationalState)}
                size="sm"
                variant="secondary"
              >
                {operationalStateUpdateStatus === nextOperationalState ? (
                  'Updating...'
                ) : (
                  <>
                    <ArrowRight aria-hidden className="h-4 w-4" />
                    {getAppointmentOperationalActionLabel(nextOperationalState)}
                  </>
                )}
              </Button>
            ) : null}
          </div>

          <div
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
            data-testid="appointment-card-primary-actions"
          >
            {canStartOrContinueVisit ? (
              <Button
                className="min-h-10 w-full sm:w-auto"
                data-testid="appointment-primary-visit-action"
                disabled={isBusy}
                onClick={onStartVisit}
                size="sm"
              >
                {hasOpenVisit ? 'Continue visit' : 'Start visit'}
              </Button>
            ) : null}
            {canViewVisit ? (
              <Button
                className="min-h-10 w-full sm:w-auto"
                data-testid="appointment-primary-visit-action"
                disabled={isBusy}
                onClick={onViewVisit}
                size="sm"
                variant="secondary"
              >
                View visit
              </Button>
            ) : null}
            <Button
              className="min-h-10 w-full sm:w-auto"
              disabled={isBusy}
              onClick={onOpenDetails}
              size="sm"
              variant="secondary"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
