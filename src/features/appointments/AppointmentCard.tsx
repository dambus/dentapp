import {
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Clock3,
  FileText,
  Stethoscope,
  User,
  UserX,
} from 'lucide-react'

import {
  ActionMenu,
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
import type {
  Appointment,
  AppointmentLinkedVisitSummary,
  AppointmentPatientSummary,
  AppointmentStatus,
} from './appointmentService'

type CardAppointment = Appointment & {
  linkedVisit?: AppointmentLinkedVisitSummary | null
  patient?: AppointmentPatientSummary | null
}

type AppointmentCardProps = {
  appointment: CardAppointment
  className?: string
  isBusy?: boolean
  onOpenDetails: () => void
  onOpenPatient?: () => void
  onStartVisit?: () => void
  onStatusChange?: (status: AppointmentStatus) => void
  onViewVisit?: () => void
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

export function AppointmentCard({
  appointment,
  className,
  isBusy = false,
  onOpenDetails,
  onOpenPatient,
  onStartVisit,
  onStatusChange,
  onViewVisit,
  patientName,
  statusUpdateStatus,
  variant = 'default',
}: AppointmentCardProps) {
  const displayPatientName =
    patientName ?? appointment.patient?.fullName ?? 'Unknown patient'
  const canStartVisit = appointment.status === 'scheduled' && onStartVisit
  const canViewVisit = appointment.linkedVisit && onViewVisit
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

  const menuItems = [
    onOpenPatient
      ? {
          disabled: isBusy,
          icon: User,
          label: 'Open patient',
          onSelect: onOpenPatient,
        }
      : null,
    appointment.status === 'scheduled' && onStatusChange
      ? {
          disabled: isBusy,
          icon: CheckCircle2,
          label:
            statusUpdateStatus === 'completed' ? 'Updating...' : 'Complete',
          onSelect: () => onStatusChange('completed'),
        }
      : null,
    appointment.status === 'scheduled' && onStatusChange
      ? {
          disabled: isBusy,
          icon: CalendarX,
          label: statusUpdateStatus === 'cancelled' ? 'Updating...' : 'Cancel',
          onSelect: () => onStatusChange('cancelled'),
          tone: 'danger' as const,
        }
      : null,
    appointment.status === 'scheduled' && onStatusChange
      ? {
          disabled: isBusy,
          icon: UserX,
          label: statusUpdateStatus === 'no_show' ? 'Updating...' : 'No-show',
          onSelect: () => onStatusChange('no_show'),
          tone: 'danger' as const,
        }
      : null,
  ].filter((item) => item !== null)

  return (
    <article
      className={classNames(
        'group rounded-md border border-l-4 border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300',
        statusToneClass,
        variant === 'compact' ? 'p-4' : 'p-4 sm:p-5',
        className,
      )}
      data-testid="appointment-card"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-lg font-semibold leading-6 text-slate-950 sm:text-xl">
                <Clock3 aria-hidden className="h-4 w-4 text-cyan-700" />
                <span>
                  {formatAppointmentClockRange(
                    appointment.scheduled_start,
                    appointment.scheduled_end,
                  )}
                </span>
              </div>
              {durationLabel ? (
                <span className="text-xs font-medium text-slate-500">
                  {durationLabel}
                </span>
              ) : null}
            </div>

            {onOpenPatient ? (
              <button
                className="mt-2 block max-w-full text-left text-base font-semibold leading-6 text-slate-950 underline-offset-4 hover:text-teal-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:text-lg"
                disabled={isBusy}
                onClick={onOpenPatient}
                type="button"
              >
                <span className="wrap-break-word">{displayPatientName}</span>
              </button>
            ) : (
              <div className="wrap-break-word mt-2 text-base font-semibold leading-6 text-slate-950 sm:text-lg">
                {displayPatientName}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={appointment.status} />
            {menuItems.length > 0 ? (
              <ActionMenu
                disabled={isBusy}
                items={menuItems}
                label="Appointment actions"
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <TypeBadge
            className="max-w-full truncate"
            label={typeBadge.label}
            variant={typeBadge.variant}
          />
          <span className="inline-flex items-center gap-1">
            <Stethoscope aria-hidden className="h-4 w-4 text-slate-400" />
            Provider TBD
          </span>
          {appointment.notes?.trim() ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <FileText aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{appointment.notes.trim()}</span>
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CalendarClock aria-hidden className="h-4 w-4" />
            Clinical schedule item
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {canStartVisit ? (
              <Button
                className="w-full sm:w-auto"
                disabled={isBusy}
                onClick={onStartVisit}
                size="sm"
              >
                Start visit
              </Button>
            ) : null}
            {canViewVisit ? (
              <Button
                className="w-full sm:w-auto"
                disabled={isBusy}
                onClick={onViewVisit}
                size="sm"
                variant="secondary"
              >
                View visit
              </Button>
            ) : null}
            <Button
              className="w-full sm:w-auto"
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
