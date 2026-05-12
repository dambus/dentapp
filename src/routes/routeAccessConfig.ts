import type { AppRole } from '../types/navigation'
import { routePaths } from './routePaths'

type ProtectedRoutePath = Exclude<
  (typeof routePaths)[keyof typeof routePaths],
  typeof routePaths.login
>

const allRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
  'reception_admin',
  'inventory_responsible',
]

const patientReadRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
  'reception_admin',
]

const patientWriteRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'reception_admin',
]

const patientMedicalRecordWriteRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
]

export const routeAllowedRoles: Record<ProtectedRoutePath, AppRole[]> = {
  [routePaths.dashboard]: allRoles,
  [routePaths.calendar]: [
    'owner_admin',
    'doctor',
    'specialist',
    'assistant',
    'reception_admin',
  ],
  [routePaths.patients]: patientReadRoles,
  [routePaths.patientDetail]: patientReadRoles,
  [routePaths.patientCreate]: patientWriteRoles,
  [routePaths.patientEdit]: patientWriteRoles,
  [routePaths.patientMedicalRecordEdit]: patientMedicalRecordWriteRoles,
  [routePaths.treatmentPlans]: ['owner_admin', 'doctor', 'specialist'],
  [routePaths.payments]: ['owner_admin', 'reception_admin'],
  [routePaths.commissions]: ['owner_admin'],
  [routePaths.inventory]: ['owner_admin', 'assistant', 'inventory_responsible'],
  [routePaths.reports]: [
    'owner_admin',
    'doctor',
    'specialist',
    'reception_admin',
    'inventory_responsible',
  ],
  [routePaths.settings]: ['owner_admin'],
}
