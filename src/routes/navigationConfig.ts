import type { AppRole, NavigationItem } from '../types/navigation'
import { routePaths } from './routePaths'

const allRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
  'reception_admin',
  'inventory_responsible',
]

const clinicalRoles: AppRole[] = ['owner_admin', 'doctor', 'specialist']

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: routePaths.dashboard,
    allowedRoles: allRoles,
    description: 'Operational overview',
  },
  {
    label: 'Calendar',
    path: routePaths.calendar,
    allowedRoles: [
      'owner_admin',
      'doctor',
      'specialist',
      'assistant',
      'reception_admin',
    ],
    description: 'Scheduling workspace',
  },
  {
    label: 'Patients',
    path: routePaths.patients,
    allowedRoles: [
      'owner_admin',
      'doctor',
      'specialist',
      'assistant',
      'reception_admin',
    ],
    description: 'Patient workspace',
  },
  {
    label: 'Treatment Plans',
    path: routePaths.treatmentPlans,
    allowedRoles: clinicalRoles,
    description: 'Treatment planning workspace',
  },
  {
    label: 'Payments',
    path: routePaths.payments,
    allowedRoles: ['owner_admin', 'reception_admin'],
    description: 'Financial workspace',
  },
  {
    label: 'Commissions',
    path: routePaths.commissions,
    allowedRoles: ['owner_admin'],
    description: 'Restricted commission workspace',
  },
  {
    label: 'Inventory',
    path: routePaths.inventory,
    allowedRoles: ['owner_admin', 'assistant', 'inventory_responsible'],
    description: 'Materials workspace',
  },
  {
    label: 'Reports',
    path: routePaths.reports,
    allowedRoles: [
      'owner_admin',
      'doctor',
      'specialist',
      'reception_admin',
      'inventory_responsible',
    ],
    description: 'Reporting workspace',
  },
  {
    label: 'Settings',
    path: routePaths.settings,
    allowedRoles: ['owner_admin'],
    description: 'Administration workspace',
  },
]

export function getNavigationItemsForRole(role: AppRole) {
  return navigationItems.filter((item) => item.allowedRoles.includes(role))
}
