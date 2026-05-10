import { Route, Routes } from 'react-router-dom'

import { CalendarPage } from '../pages/CalendarPage'
import { CommissionsPage } from '../pages/CommissionsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { InventoryPage } from '../pages/InventoryPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PatientsPage } from '../pages/PatientsPage'
import { PaymentsPage } from '../pages/PaymentsPage'
import { ReportsPage } from '../pages/ReportsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { TreatmentPlansPage } from '../pages/TreatmentPlansPage'
import { routePaths } from './routePaths'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={routePaths.dashboard} element={<DashboardPage />} />
      <Route path={routePaths.login} element={<LoginPage />} />
      <Route path={routePaths.calendar} element={<CalendarPage />} />
      <Route path={routePaths.patients} element={<PatientsPage />} />
      <Route
        path={routePaths.treatmentPlans}
        element={<TreatmentPlansPage />}
      />
      <Route path={routePaths.payments} element={<PaymentsPage />} />
      <Route path={routePaths.commissions} element={<CommissionsPage />} />
      <Route path={routePaths.inventory} element={<InventoryPage />} />
      <Route path={routePaths.reports} element={<ReportsPage />} />
      <Route path={routePaths.settings} element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
