import { demoPatients } from './demoPatients'
import type { DemoPatient } from './types'

const clonePatients = (patients: DemoPatient[]) =>
  patients.map((patient) => ({ ...patient }))

const matchesSearch = (patient: DemoPatient, normalizedSearch: string) => {
  if (!normalizedSearch) {
    return true
  }

  return [
    patient.firstName,
    patient.lastName,
    patient.phone,
    patient.email,
  ].some((value) => value.toLowerCase().includes(normalizedSearch))
}

export async function getPatients(): Promise<DemoPatient[]> {
  return clonePatients(demoPatients)
}

export async function getPatientById(
  patientId: string | undefined,
): Promise<DemoPatient | undefined> {
  return demoPatients.find((patient) => patient.id === patientId)
}

export async function searchPatients(query: string): Promise<DemoPatient[]> {
  const normalizedSearch = query.trim().toLowerCase()

  return clonePatients(
    demoPatients.filter((patient) => matchesSearch(patient, normalizedSearch)),
  )
}
