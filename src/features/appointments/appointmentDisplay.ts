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

export function formatAppointmentTimeRange(
  scheduledStart: string,
  scheduledEnd: string | null,
) {
  const startTime = formatPatientDateTime(scheduledStart)

  if (!scheduledEnd) {
    return startTime
  }

  return `${startTime} - ${formatPatientDateTime(scheduledEnd)}`
}
