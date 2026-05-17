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
