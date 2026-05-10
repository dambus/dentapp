import type { DemoPatient, PatientStatus } from './types'

export const patientStatusLabels: Record<PatientStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
}

export const patientStatusBadgeVariants: Record<
  PatientStatus,
  'success' | 'warning' | 'neutral'
> = {
  active: 'success',
  inactive: 'warning',
  archived: 'neutral',
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const currencyFormatter = new Intl.NumberFormat('sr-RS', {
  style: 'currency',
  currency: 'RSD',
  maximumFractionDigits: 0,
})

export function formatPatientDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : 'No visit recorded'
}

export function formatPatientDateTime(value: string | null) {
  return value
    ? dateTimeFormatter.format(new Date(value))
    : 'No appointment scheduled'
}

export function formatDemoCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function getPatientFullName(patient: DemoPatient) {
  return `${patient.firstName} ${patient.lastName}`
}

export function getPatientAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1
  }

  return age
}
