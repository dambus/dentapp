import type { DemoPatient, PatientStatus } from './types'

export type PatientFormValues = {
  firstName: string
  lastName: string
  phone: string
  email: string
  dateOfBirth: string
  status: PatientStatus
  importantWarning: string
  summary: string
}

export function getPatientFormValuesFromDemoPatient(
  patient: DemoPatient,
): PatientFormValues {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    email: patient.email,
    dateOfBirth: patient.dateOfBirth,
    status: patient.status,
    importantWarning: patient.importantWarning ?? '',
    summary: patient.lastClinicalNote,
  }
}
