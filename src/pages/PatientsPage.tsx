import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import { Badge, Button, Card, CardContent, EmptyState, LoadingState } from '../components/ui'
import {
  formatDemoCurrency,
  formatPatientDate,
  formatPatientDateTime,
  getPatientFullName,
  patientStatusBadgeVariants,
  patientStatusLabels,
} from '../features/patients/patientDisplay'
import { getPatients } from '../features/patients/patientService'
import type {
  DemoPatient,
  PatientStatus,
} from '../features/patients/types'
import { getPatientDetailPath, routePaths } from '../routes/routePaths'

type StatusFilter = PatientStatus | 'all'

export function PatientsPage() {
  const currentProfile = useCurrentProfile()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [patients, setPatients] = useState<DemoPatient[]>([])
  const [isPatientsLoading, setIsPatientsLoading] = useState(true)

  const isSupabasePatientMode =
    import.meta.env.VITE_PATIENT_DATA_SOURCE?.toLowerCase() === 'supabase'

  useEffect(() => {
    let isCurrent = true

    async function loadPatients() {
      if (isSupabasePatientMode && (currentProfile.isAuthLoading || currentProfile.isLoading)) {
        if (isCurrent) {
          setIsPatientsLoading(true)
        }
        return
      }

      if (isCurrent) {
        setIsPatientsLoading(true)
      }

      const loadedPatients = await getPatients()

      if (isCurrent) {
        setPatients(loadedPatients)
        setIsPatientsLoading(false)
      }
    }

    void loadPatients()

    return () => {
      isCurrent = false
    }
  }, [
    currentProfile.isAuthLoading,
    currentProfile.isLoading,
    currentProfile.profile?.id,
    currentProfile.profile?.status,
    currentProfile.session?.user.id,
    isSupabasePatientMode,
  ])

  const normalizedSearch = search.trim().toLowerCase()

  const searchMatchedPatients = useMemo(() => {
    if (!normalizedSearch) {
      return patients
    }

    return patients.filter((patient) => {
      return [
        patient.firstName,
        patient.lastName,
        patient.phone,
        patient.email,
      ].some((value) => value.toLowerCase().includes(normalizedSearch))
    })
  }, [normalizedSearch, patients])

  const filteredPatients = useMemo(() => {
    return searchMatchedPatients.filter((patient) => {
      const statusMatches =
        statusFilter === 'all' || patient.status === statusFilter

      return statusMatches
    })
  }, [searchMatchedPatients, statusFilter])

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all'
  const dataModeLabel = isSupabasePatientMode ? 'Supabase mode' : 'Demo mode'
  const patientLabel = isSupabasePatientMode ? 'patients' : 'demo patients'
  const emptyStateTitle = isSupabasePatientMode
    ? 'No patients found'
    : 'No demo patients found'
  const emptyStateDescription = isSupabasePatientMode
    ? 'Adjust the search term or status filter to show Supabase patient records.'
    : 'Adjust the search term or status filter to show fake demo patient records.'

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
  }

  return (
    <Page>
      <PageHeader
        title="Patients"
        description="Search and review patient records. Demo mode uses non-persistent fake data, while Supabase mode reads persisted records."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{dataModeLabel}</Badge>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
              to={routePaths.patientCreate}
            >
              New patient
            </Link>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Search patients
              </span>
              <input
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, phone, or email"
                type="search"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Status
              </span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            {isPatientsLoading ? (
              <span>Loading patient list...</span>
            ) : (
              <span>
                Showing {filteredPatients.length} of {patients.length} {patientLabel}
              </span>
            )}
            {hasActiveFilters ? (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {isPatientsLoading ? (
        <LoadingState label="Loading patients..." />
      ) : null}

      {!isPatientsLoading && filteredPatients.length > 0 ? (
        <>
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Next appointment</th>
                    <th className="px-5 py-3">Active plan</th>
                    <th className="px-5 py-3">Important note</th>
                    <th className="px-5 py-3 text-right">
                      Demo unpaid balance
                    </th>
                    <th className="px-5 py-3 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="align-top">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-950">
                          {getPatientFullName(patient)}
                        </div>
                        <div className="mt-1 text-slate-600">
                          {patient.phone}
                        </div>
                        <div className="text-slate-500">{patient.email}</div>
                        <div className="mt-2 text-xs text-slate-500">
                          Born {formatPatientDate(patient.dateOfBirth)} - Last
                          visit {formatPatientDate(patient.lastVisit)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={patientStatusBadgeVariants[patient.status]}
                        >
                          {patientStatusLabels[patient.status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {formatPatientDateTime(patient.nextAppointment)}
                      </td>
                      <td className="px-5 py-4">
                        {patient.activeTreatmentPlan ? (
                          <Badge variant="info">
                            {patient.activeTreatmentPlan}
                          </Badge>
                        ) : (
                          <span className="text-slate-500">
                            No active plan
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {patient.importantNote ? (
                          <Badge variant="info">
                            Note recorded
                          </Badge>
                        ) : (
                          <Badge variant="neutral">No note</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-950">
                        {formatDemoCurrency(patient.unpaidBalance)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          className="font-medium text-teal-700 underline-offset-4 hover:text-teal-800 hover:underline"
                          to={getPatientDetailPath(patient.id)}
                        >
                          View profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-4 md:hidden">
            {filteredPatients.map((patient) => (
              <Card key={patient.id}>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        {getPatientFullName(patient)}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {patient.phone}
                      </p>
                      <p className="text-sm text-slate-500">
                        {patient.email}
                      </p>
                    </div>
                    <Badge variant={patientStatusBadgeVariants[patient.status]}>
                      {patientStatusLabels[patient.status]}
                    </Badge>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-700">
                    <div>
                      <span className="font-medium text-slate-950">
                        Next appointment:
                      </span>{' '}
                      {formatPatientDateTime(patient.nextAppointment)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-950">
                        Last visit:
                      </span>{' '}
                      {formatPatientDate(patient.lastVisit)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-950">
                        Active plan:
                      </span>{' '}
                      {patient.activeTreatmentPlan ?? 'No active plan'}
                    </div>
                    <div>
                      <span className="font-medium text-slate-950">
                        Important note:
                      </span>{' '}
                      {patient.importantNote ?? 'No important note recorded.'}
                    </div>
                    <div>
                      <span className="font-medium text-slate-950">
                        Demo unpaid balance:
                      </span>{' '}
                      {formatDemoCurrency(patient.unpaidBalance)}
                    </div>
                  </div>

                  <Link
                    className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                    to={getPatientDetailPath(patient.id)}
                  >
                    View profile
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {!isPatientsLoading && filteredPatients.length === 0 ? (
        <EmptyState
          title={emptyStateTitle}
          description={emptyStateDescription}
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : null}
    </Page>
  )
}
