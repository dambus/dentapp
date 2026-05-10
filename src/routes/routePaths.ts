export const routePaths = {
  login: '/login',
  dashboard: '/',
  calendar: '/calendar',
  patients: '/patients',
  patientCreate: '/patients/new',
  patientDetail: '/patients/:patientId',
  patientEdit: '/patients/:patientId/edit',
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
