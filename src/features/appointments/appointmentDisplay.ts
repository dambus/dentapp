import { formatPatientDateTime } from '../patients/patientDisplay'
import type { AppointmentStatus } from './appointmentService'

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

export const appointmentStatusBadgeVariants: Record<
  AppointmentStatus,
  'success' | 'warning' | 'danger' | 'info'
> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'warning',
}

const appointmentTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
})

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function formatAppointmentTimeRange(
  scheduledStart: string,
  scheduledEnd: string | null,
) {
  const startTime = formatPatientDateTime(scheduledStart)

  if (!scheduledEnd) {
    return startTime
  }

  const startDate = new Date(scheduledStart)
  const endDate = new Date(scheduledEnd)

  if (
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    isSameCalendarDay(startDate, endDate)
  ) {
    return `${startTime} - ${appointmentTimeFormatter.format(endDate)}`
  }

  return `${startTime} - ${formatPatientDateTime(scheduledEnd)}`
}

export function formatAppointmentClockRange(
  scheduledStart: string,
  scheduledEnd: string | null,
) {
  const startDate = new Date(scheduledStart)

  if (Number.isNaN(startDate.getTime())) {
    return formatAppointmentTimeRange(scheduledStart, scheduledEnd)
  }

  if (!scheduledEnd) {
    return appointmentTimeFormatter.format(startDate)
  }

  const endDate = new Date(scheduledEnd)

  if (Number.isNaN(endDate.getTime())) {
    return appointmentTimeFormatter.format(startDate)
  }

  return `${appointmentTimeFormatter.format(startDate)} - ${appointmentTimeFormatter.format(endDate)}`
}

export function getAppointmentDurationLabel(
  scheduledStart: string,
  scheduledEnd: string | null,
) {
  if (!scheduledEnd) {
    return null
  }

  const startDate = new Date(scheduledStart)
  const endDate = new Date(scheduledEnd)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null
  }

  const durationMinutes = Math.round(
    (endDate.getTime() - startDate.getTime()) / 60000,
  )

  return durationMinutes > 0 ? `${durationMinutes} min` : null
}
