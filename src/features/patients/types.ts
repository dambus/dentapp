export type PatientStatus = 'active' | 'inactive' | 'archived'

export type DemoTimelineEvent = {
  id: string
  label: string
  date: string
  description: string
}

export type DemoPatient = {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  dateOfBirth: string
  status: PatientStatus
  nextAppointment: string | null
  lastVisit: string | null
  activeTreatmentPlan: string | null
  importantNote: string | null
  unpaidBalance: number
  medicalWarnings: string[]
  anamnesisSummary: string
  dentalHistorySummary: string
  lastClinicalNote: string
  activeTreatmentPlanSummary: string
  nextRecommendedStep: string
  recentVisitSummary: string
  documentsCount: number
  timelineEvents: DemoTimelineEvent[]
}
