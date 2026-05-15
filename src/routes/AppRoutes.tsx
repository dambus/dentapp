import type { ReactElement } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AppShell } from '../layouts/AppShell'
import { CalendarPage } from '../pages/CalendarPage'
import { CommissionsPage } from '../pages/CommissionsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { InventoryPage } from '../pages/InventoryPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PatientCreatePage } from '../pages/PatientCreatePage'
import { PatientDetailPage } from '../pages/PatientDetailPage'
import { PatientEditPage } from '../pages/PatientEditPage'
import { PatientMedicalRecordEditPage } from '../pages/PatientMedicalRecordEditPage'
import { PatientVisitDetailPage } from '../pages/PatientVisitDetailPage'
import { PatientsPage } from '../pages/PatientsPage'
import { PaymentsPage } from '../pages/PaymentsPage'
import { ReportsPage } from '../pages/ReportsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { TreatmentPlansPage } from '../pages/TreatmentPlansPage'
import { VisitCompletionPage } from '../pages/VisitCompletionPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { routeAllowedRoles } from './routeAccessConfig'
import { routePaths } from './routePaths'

function withRoleGuard(
  path: Exclude<keyof typeof routePaths, 'login'>,
  element: ReactElement,
) {
  return (
    <RoleGuard allowedRoles={routeAllowedRoles[routePaths[path]]}>
      {element}
    </RoleGuard>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={routePaths.login} element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path={routePaths.dashboard}
          element={withRoleGuard('dashboard', <DashboardPage />)}
        />
        <Route
          path={routePaths.calendar}
          element={withRoleGuard('calendar', <CalendarPage />)}
        />
        <Route
          path={routePaths.patients}
          element={withRoleGuard('patients', <PatientsPage />)}
        />
        <Route
          path={routePaths.patientCreate}
          element={withRoleGuard('patientCreate', <PatientCreatePage />)}
        />
        <Route
          path={routePaths.patientDetail}
          element={withRoleGuard('patientDetail', <PatientDetailPage />)}
        />
        <Route
          path={routePaths.patientEdit}
          element={withRoleGuard('patientEdit', <PatientEditPage />)}
        />
        <Route
          path={routePaths.patientMedicalRecordEdit}
          element={withRoleGuard(
            'patientMedicalRecordEdit',
            <PatientMedicalRecordEditPage />,
          )}
        />
        <Route
          path={routePaths.patientVisitDetail}
          element={withRoleGuard('patientVisitDetail', <PatientVisitDetailPage />)}
        />
        <Route
          path={routePaths.patientVisitCompletion}
          element={withRoleGuard(
            'patientVisitCompletion',
            <VisitCompletionPage />,
          )}
        />
        <Route
          path={routePaths.treatmentPlans}
          element={withRoleGuard('treatmentPlans', <TreatmentPlansPage />)}
        />
        <Route
          path={routePaths.payments}
          element={withRoleGuard('payments', <PaymentsPage />)}
        />
        <Route
          path={routePaths.commissions}
          element={withRoleGuard('commissions', <CommissionsPage />)}
        />
        <Route
          path={routePaths.inventory}
          element={withRoleGuard('inventory', <InventoryPage />)}
        />
        <Route
          path={routePaths.reports}
          element={withRoleGuard('reports', <ReportsPage />)}
        />
        <Route
          path={routePaths.settings}
          element={withRoleGuard('settings', <SettingsPage />)}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
