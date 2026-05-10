import type { AppRole } from '../types/navigation'

export const roleLabels: Record<AppRole, string> = {
  owner_admin: 'Owner/Admin',
  doctor: 'Doctor',
  specialist: 'Specialist',
  assistant: 'Assistant',
  reception_admin: 'Reception/Admin',
  inventory_responsible: 'Inventory Responsible',
}

export const DEMO_ROLE: AppRole = 'owner_admin'

export const currentDemoUser = {
  role: DEMO_ROLE,
  roleLabel: roleLabels[DEMO_ROLE],
  authStatusLabel: 'No auth yet',
} as const
