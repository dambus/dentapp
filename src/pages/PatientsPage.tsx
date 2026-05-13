import { useEffect, useMemo, useState } from 'react'

import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { useCurrentProfile } from '../features/auth/useCurrentProfile'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  EmptyState,
  FieldLabel,
  LoadingState,
  Select,
  TextInput,
} from '../components/ui'
import { classNames } from '../lib/classNames'
import {
  formatDemoCurrency,
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

type PatientCardProps = {
  patient: DemoPatient
}

function PatientMarker({ patient }: PatientCardProps) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-teal-700 text-base font-semibold text-white shadow-sm">
      {patient.firstName.slice(0, 1)}
      {patient.lastName.slice(0, 1)}
    </div>
  )
}

function PatientFact({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'info' | 'warning'
}) {
  return (
    <div
      className={classNames(
        'rounded-md border px-3 py-2',
        tone === 'info'
          ? 'border-cyan-200 bg-cyan-50 text-cyan-950'
          : tone === 'warning'
            ? 'border-amber-200 bg-amber-50 text-amber-950'
            : 'border-slate-200 bg-white text-slate-950',
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold leading-5">{value}</div>
    </div>
  )
}

function PatientListCard({ patient }: PatientCardProps) {
  const activePlanLabel = patient.activeTreatmentPlan ?? 'No active plan'
  const importantNoteLabel = patient.importantNote
    ? patient.importantNote
    : 'No important note recorded.'

  return (
    <Card className="border-slate-200 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <CardContent className="space-y-5 p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <PatientMarker patient={patient} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold leading-7 text-slate-950">
                  {getPatientFullName(patient)}
                </h2>
                <Badge variant={patientStatusBadgeVariants[patient.status]}>
                  {patientStatusLabels[patient.status]}
                </Badge>
              </div>
              <div className="mt-2 flex flex-col gap-1 text-sm leading-5 text-slate-600 sm:flex-row sm:flex-wrap sm:gap-x-4">
                <span>{patient.phone}</span>
                <span>{patient.email}</span>
              </div>
            </div>
          </div>

          <ButtonLink
            className="w-full min-h-11 lg:w-auto"
            to={getPatientDetailPath(patient.id)}
          >
            View profile
          </ButtonLink>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <PatientFact
            label="Next appointment"
            value={formatPatientDateTime(patient.nextAppointment)}
            tone="info"
          />
          <PatientFact label="Active plan" value={activePlanLabel} />
          <PatientFact
            label="Important note"
            value={importantNoteLabel}
            tone={patient.importantNote ? 'warning' : 'default'}
          />
          <PatientFact
            label="Demo balance"
            value={formatDemoCurrency(patient.unpaidBalance)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function PatientsPage() {
  const currentProfile = useCurrentProfile()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [includeArchived, setIncludeArchived] = useState(false)
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

      const loadedPatients = await getPatients({ includeArchived })

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
    includeArchived,
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

  const hasActiveFilters =
    search.trim() !== '' || statusFilter !== 'all' || includeArchived
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
    setIncludeArchived(false)
  }

  return (
    <Page>
      <PageHeader
        title="Patients"
        description="Find a patient, check the current context, and open the clinical profile without switching into a dense admin table."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{dataModeLabel}</Badge>
            <ButtonLink to={routePaths.patientCreate}>
              New patient
            </ButtonLink>
          </div>
        }
      />

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <label className="block">
              <FieldLabel>Search patients</FieldLabel>
              <TextInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, phone, or email"
                type="search"
              />
            </label>

            <label className="block">
              <FieldLabel>Status</FieldLabel>
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </Select>
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <input
              checked={includeArchived}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
              onChange={(event) => setIncludeArchived(event.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">
                Include archived patients
              </span>
              <span className="mt-1 block text-sm leading-5 text-slate-600">
                Archived patients are hidden from the normal list and can be
                restored from their profile page.
              </span>
            </span>
          </label>

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
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <PatientListCard key={patient.id} patient={patient} />
          ))}
        </div>
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
