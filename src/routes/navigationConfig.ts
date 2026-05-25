import type { AppRole, NavigationItem } from '../types/navigation'
import { routePaths } from './routePaths'
import { routeAllowedRoles } from './routeAccessConfig'

const allRoles: AppRole[] = routeAllowedRoles[routePaths.dashboard]

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
    allowedRoles: routeAllowedRoles[routePaths.calendar],
    description: 'Scheduling workspace',
  },
  {
    label: 'Appointments',
    path: routePaths.appointments,
    allowedRoles: routeAllowedRoles[routePaths.appointments],
    description: 'Operational appointment list',
  },
  {
    label: 'Patients',
    path: routePaths.patients,
    allowedRoles: routeAllowedRoles[routePaths.patients],
    description: 'Patient workspace',
  },
  {
    label: 'Treatment Plans',
    path: routePaths.treatmentPlans,
    allowedRoles: routeAllowedRoles[routePaths.treatmentPlans],
    description: 'Treatment planning workspace',
  },
  {
    label: 'Commissions',
    path: routePaths.commissions,
    allowedRoles: routeAllowedRoles[routePaths.commissions],
    description: 'Restricted commission workspace',
  },
  {
    label: 'Inventory',
    path: routePaths.inventory,
    allowedRoles: routeAllowedRoles[routePaths.inventory],
    description: 'Materials workspace',
  },
  {
    label: 'Reports',
    path: routePaths.reports,
    allowedRoles: routeAllowedRoles[routePaths.reports],
    description: 'Reporting workspace',
  },
  {
    label: 'Settings',
    path: routePaths.settings,
    allowedRoles: routeAllowedRoles[routePaths.settings],
    description: 'Administration workspace',
  },
]

export function getNavigationItemsForRole(role: AppRole) {
  return navigationItems.filter((item) => item.allowedRoles.includes(role))
}
