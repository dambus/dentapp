export const routePaths = {
  login: '/login',
  dashboard: '/',
  calendar: '/calendar',
  patients: '/patients',
  patientCreate: '/patients/new',
  patientDetail: '/patients/:patientId',
  patientEdit: '/patients/:patientId/edit',
  patientMedicalRecordEdit: '/patients/:patientId/record/edit',
  treatmentPlans: '/treatment-plans',
  payments: '/payments',
  commissions: '/commissions',
  inventory: '/inventory',
  reports: '/reports',
  settings: '/settings',
} as const

export function getPatientDetailPath(patientId: string) {
  return `/patients/${patientId}`
}

export function getPatientEditPath(patientId: string) {
  return `/patients/${patientId}/edit`
}

export function getPatientMedicalRecordEditPath(patientId: string) {
  return `/patients/${patientId}/record/edit`
}
