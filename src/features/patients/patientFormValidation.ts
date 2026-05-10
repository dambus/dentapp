import type { PatientFormValues } from './patientFormValues'

export type PatientFormErrors = Partial<Record<keyof PatientFormValues, string>>

function isFutureDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return date > today
}

export function validatePatientForm(
  values: PatientFormValues,
): PatientFormErrors {
  const errors: PatientFormErrors = {}

  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required.'
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required.'
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.'
  }

  if (values.email.trim() && !values.email.includes('@')) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.dateOfBirth && isFutureDate(values.dateOfBirth)) {
    errors.dateOfBirth = 'Date of birth cannot be in the future.'
  }

  if (!values.status) {
    errors.status = 'Status is required.'
  }

  return errors
}

export function hasPatientFormErrors(errors: PatientFormErrors) {
  return Object.keys(errors).length > 0
}
