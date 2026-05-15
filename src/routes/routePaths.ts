export const routePaths = {
  login: '/login',
  dashboard: '/',
  calendar: '/calendar',
  appointments: '/appointments',
  appointmentDetail: '/appointments/:appointmentId',
  patients: '/patients',
  patientCreate: '/patients/new',
  patientDetail: '/patients/:patientId',
  patientEdit: '/patients/:patientId/edit',
  patientMedicalRecordEdit: '/patients/:patientId/record/edit',
  patientVisitDetail: '/patients/:patientId/visits/:visitId',
  patientVisitCompletion: '/patients/:patientId/visit-completion',
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

export function getAppointmentDetailPath(appointmentId: string) {
  return `/appointments/${appointmentId}`
}

export function getPatientEditPath(patientId: string) {
  return `/patients/${patientId}/edit`
}

export function getPatientMedicalRecordEditPath(patientId: string) {
  return `/patients/${patientId}/record/edit`
}

export function getPatientVisitCompletionPath(patientId: string) {
  return `/patients/${patientId}/visit-completion`
}

export function getPatientVisitDetailPath(patientId: string, visitId: string) {
  return `/patients/${patientId}/visits/${visitId}`
}
