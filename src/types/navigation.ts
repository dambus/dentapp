import type { routePaths } from '../routes/routePaths'

export type AppRole =
  | 'owner_admin'
  | 'doctor'
  | 'specialist'
  | 'assistant'
  | 'reception_admin'
  | 'inventory_responsible'

export type NavigationPath =
  (typeof routePaths)[keyof typeof routePaths]

export type NavigationItem = {
  label: string
  path: NavigationPath
  allowedRoles: AppRole[]
  description?: string
}
