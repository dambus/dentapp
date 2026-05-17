import type { BadgeVariant } from '../../components/ui/Badge'

export type AppointmentTypeId =
  | 'consultation'
  | 'control'
  | 'filling'
  | 'extraction'
  | 'hygiene'
  | 'prosthetics'
  | 'emergency'
  | 'other'

export type AppointmentTypeConfig = {
  badgeVariant: BadgeVariant
  defaultDurationMinutes: number
  iconName?: string
  id: AppointmentTypeId
  label: string
}

export const appointmentDurationOptions = [15, 30, 45, 60, 75, 90, 120]

export const appointmentTypes: AppointmentTypeConfig[] = [
  {
    badgeVariant: 'info',
    defaultDurationMinutes: 30,
    iconName: 'MessagesSquare',
    id: 'consultation',
    label: 'Consultation',
  },
  {
    badgeVariant: 'success',
    defaultDurationMinutes: 30,
    iconName: 'CalendarCheck',
    id: 'control',
    label: 'Control',
  },
  {
    badgeVariant: 'info',
    defaultDurationMinutes: 45,
    iconName: 'CircleDot',
    id: 'filling',
    label: 'Filling',
  },
  {
    badgeVariant: 'warning',
    defaultDurationMinutes: 45,
    iconName: 'ShieldAlert',
    id: 'extraction',
    label: 'Extraction',
  },
  {
    badgeVariant: 'success',
    defaultDurationMinutes: 45,
    iconName: 'Sparkles',
    id: 'hygiene',
    label: 'Hygiene',
  },
  {
    badgeVariant: 'neutral',
    defaultDurationMinutes: 60,
    iconName: 'PanelTop',
    id: 'prosthetics',
    label: 'Prosthetics',
  },
  {
    badgeVariant: 'danger',
    defaultDurationMinutes: 30,
    iconName: 'Siren',
    id: 'emergency',
    label: 'Emergency',
  },
  {
    badgeVariant: 'neutral',
    defaultDurationMinutes: 30,
    iconName: 'CalendarClock',
    id: 'other',
    label: 'Other',
  },
]

export const defaultAppointmentTypeId: AppointmentTypeId = 'consultation'

const appointmentTypesById = new Map(
  appointmentTypes.map((appointmentType) => [
    appointmentType.id,
    appointmentType,
  ]),
)

export function getAppointmentTypeById(typeId: string | null | undefined) {
  return appointmentTypesById.get(typeId as AppointmentTypeId) ?? null
}

export function getDefaultAppointmentType() {
  return appointmentTypesById.get(defaultAppointmentTypeId) ?? appointmentTypes[0]
}

export function isAppointmentDurationOption(value: number) {
  return appointmentDurationOptions.includes(value)
}

export function detectAppointmentTypeFromReason(
  reason: string | null | undefined,
) {
  const normalizedReason = reason?.trim().toLowerCase() ?? ''

  if (!normalizedReason) {
    return getAppointmentTypeById('other')
  }

  const exactMatch = appointmentTypes.find(
    (appointmentType) =>
      appointmentType.label.toLowerCase() === normalizedReason ||
      appointmentType.id === normalizedReason,
  )

  if (exactMatch) {
    return exactMatch
  }

  if (
    normalizedReason.includes('follow-up') ||
    normalizedReason.includes('follow up') ||
    normalizedReason.includes('control') ||
    normalizedReason.includes('kontrol')
  ) {
    return getAppointmentTypeById('control')
  }

  if (normalizedReason.includes('consult')) {
    return getAppointmentTypeById('consultation')
  }

  if (normalizedReason.includes('filling') || normalizedReason.includes('fill')) {
    return getAppointmentTypeById('filling')
  }

  if (
    normalizedReason.includes('extraction') ||
    normalizedReason.includes('extract')
  ) {
    return getAppointmentTypeById('extraction')
  }

  if (normalizedReason.includes('hygiene') || normalizedReason.includes('clean')) {
    return getAppointmentTypeById('hygiene')
  }

  if (
    normalizedReason.includes('prosthetic') ||
    normalizedReason.includes('prosthetics')
  ) {
    return getAppointmentTypeById('prosthetics')
  }

  if (normalizedReason.includes('emergency') || normalizedReason.includes('urgent')) {
    return getAppointmentTypeById('emergency')
  }

  return null
}
