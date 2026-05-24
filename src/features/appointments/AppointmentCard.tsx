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
        'group relative min-w-0 max-w-full rounded-md border border-l-4 border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300',
        statusToneClass,
        variant === 'compact' ? 'p-3.5 sm:p-4' : 'p-4',
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

      <div className="flex min-w-0 flex-col gap-3.5">
        <div className="grid min-w-0 max-w-full gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,auto)] md:items-start">
          <div className="min-w-0 pr-12">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <div className="flex items-center gap-2 text-base font-semibold leading-6 text-slate-950 sm:text-lg">
                <Clock3 aria-hidden className="h-4 w-4 shrink-0 text-cyan-700" />
                <span>
                  {formatAppointmentClockRange(
                    appointment.scheduled_start,
                    appointment.scheduled_end,
                  )}
                </span>
              </div>
              {durationLabel ? (
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
                  {durationLabel}
                </span>
              ) : null}
            </div>

            {onOpenPatient ? (
              <button
                className="mt-1.5 block max-w-full text-left text-base font-semibold leading-6 text-slate-950 underline-offset-4 hover:text-teal-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:text-lg"
                disabled={isBusy}
                onClick={onOpenPatient}
                type="button"
              >
                <span className="wrap-break-word">{displayPatientName}</span>
              </button>
            ) : (
              <div className="wrap-break-word mt-1.5 text-base font-semibold leading-6 text-slate-950 sm:text-lg">
                {displayPatientName}
              </div>
            )}
          </div>

          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 md:justify-end md:pr-12">
            <StatusBadge status={appointment.status} />
            <Badge
              data-testid="appointment-operational-state"
              variant={operationalBadgeVariant}
            >
              {operationalLabel}
            </Badge>
            {hasOpenVisit ? (
              <Badge variant="warning">Visit in progress</Badge>
            ) : null}
            {appointment.linkedVisit ? (
              <Badge variant="success">Visit completed</Badge>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md bg-slate-100/70 px-2 py-1">
              <Stethoscope aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
              <span
                className="min-w-0 max-w-full truncate"
                data-testid="appointment-card-provider"
                title={`Assigned provider: ${providerLabel}`}
              >
                Assigned provider: {providerLabel}
              </span>
            </span>
            <TypeBadge
              className="max-w-full truncate"
              label={typeBadge.label}
              variant={typeBadge.variant}
            />
          </div>
          {appointment.notes?.trim() ? (
            <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-slate-500 sm:justify-end">
              <FileText aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{appointment.notes.trim()}</span>
            </span>
          ) : null}
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

        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CalendarClock aria-hidden className="h-4 w-4" />
            Clinical schedule item
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            {canUpdateOperationalState && nextOperationalState ? (
              <Button
                className="w-full min-h-10 sm:w-auto"
                data-testid="appointment-operational-action"
                disabled={isBusy}
                onClick={() => onOperationalStateChange(nextOperationalState)}
                size="sm"
                variant="secondary"
              >
                {operationalStateUpdateStatus === nextOperationalState
                  ? 'Updating...'
                  : getAppointmentOperationalActionLabel(nextOperationalState)}
              </Button>
            ) : null}
            {canStartOrContinueVisit ? (
              <Button
                className="w-full min-h-10 sm:w-auto"
                disabled={isBusy}
                onClick={onStartVisit}
                size="sm"
              >
                {hasOpenVisit ? 'Continue visit' : 'Start visit'}
              </Button>
            ) : null}
            {canViewVisit ? (
              <Button
                className="w-full min-h-10 sm:w-auto"
                disabled={isBusy}
                onClick={onViewVisit}
                size="sm"
                variant="secondary"
              >
                View visit
              </Button>
            ) : null}
            <Button
              className="w-full min-h-10 sm:w-auto"
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
