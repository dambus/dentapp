import { Archive, RotateCcw, SquarePen, Stethoscope } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  ActionMenu,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InlineNotice,
} from '../../components/ui'
import { classNames } from '../../lib/classNames'
import type { AppRole } from '../../types/navigation'
import {
  formatPatientDate,
  getPatientAge,
  getPatientFullName,
  patientStatusBadgeVariants,
  patientStatusLabels,
} from './patientDisplay'
import type { DemoPatient } from './types'

type PatientSnapshotProps = {
  patient: DemoPatient
  role: AppRole | null
  isArchived: boolean
  isLifecycleSubmitting: boolean
  lifecycleError: string | null
  lifecycleSuccess: string | null
  canEditMedicalRecord: boolean
  canArchiveOrRestore: boolean
  dataSourceLabel: string
  backNavigation: ReactNode
  onEditPatient: () => void
  onEditMedicalRecord: () => void
  onArchive: () => void
  onRestore: () => void
}

function SafetyLine({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <div className="rounded-md border border-amber-100 bg-white px-3 py-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">
        {label}
      </div>
      <div className="mt-1 text-sm leading-6 text-amber-950">{children}</div>
    </div>
  )
}

export function PatientSnapshot({
  patient,
  role,
  isArchived,
  isLifecycleSubmitting,
  lifecycleError,
  lifecycleSuccess,
  canEditMedicalRecord,
  canArchiveOrRestore,
  dataSourceLabel,
  backNavigation,
  onEditPatient,
  onEditMedicalRecord,
  onArchive,
  onRestore,
}: PatientSnapshotProps) {
  const patientName = getPatientFullName(patient)
  const age = getPatientAge(patient.dateOfBirth)
  const hasMedicalWarnings = patient.medicalWarnings.length > 0
  const hasAllergies = Boolean(patient.allergies.trim())
  const hasImportantNote = Boolean(patient.importantNote?.trim())
  const hasAnyCriticalContext =
    hasMedicalWarnings || hasAllergies || hasImportantNote
  const statusLabel = patientStatusLabels[patient.status]
  const actions = [
    {
      icon: SquarePen,
      label: 'Edit patient',
      onSelect: onEditPatient,
    },
    canEditMedicalRecord
      ? {
          icon: Stethoscope,
          label: 'Edit medical record',
          onSelect: onEditMedicalRecord,
        }
      : null,
    canArchiveOrRestore && !isArchived
      ? {
          icon: Archive,
          label: isLifecycleSubmitting ? 'Archiving...' : 'Archive patient',
          onSelect: onArchive,
          tone: 'danger' as const,
        }
      : null,
    canArchiveOrRestore && isArchived
      ? {
          icon: RotateCcw,
          label: isLifecycleSubmitting ? 'Restoring...' : 'Restore patient',
          onSelect: onRestore,
        }
      : null,
  ].filter((item) => item !== null)

  return (
    <Card
      className="overflow-hidden border-teal-100 shadow-sm"
      data-testid="patient-workflow-header"
      id="patient-workspace-top"
    >
      <CardHeader className="p-4 pb-4 sm:p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">{backNavigation}</div>
            <div className="flex shrink-0 items-start justify-end gap-2">
              {canEditMedicalRecord ? (
                <div className="hidden xl:block">
                  <Button
                    onClick={onEditMedicalRecord}
                    size="sm"
                    variant="secondary"
                  >
                    Edit medical record
                  </Button>
                </div>
              ) : null}
              <ActionMenu
                disabled={isLifecycleSubmitting}
                items={actions}
                label="Patient actions"
                menuClassName="w-[min(18rem,calc(100vw-2rem))]"
                itemClassName="min-h-10"
              />
            </div>
          </div>

          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-teal-700 text-lg font-semibold text-white shadow-sm sm:h-16 sm:w-16 sm:text-xl">
                {patient.firstName.slice(0, 1)}
                {patient.lastName.slice(0, 1)}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-2xl leading-tight sm:text-3xl">
                    {patientName}
                  </CardTitle>
                  <Badge variant={patientStatusBadgeVariants[patient.status]}>
                    {statusLabel}
                  </Badge>
                  {hasAnyCriticalContext ? (
                    <Badge variant="warning">Safety review</Badge>
                  ) : null}
                </div>
                <CardDescription className="mt-1 text-sm sm:text-base">
                  {age} years old - born {formatPatientDate(patient.dateOfBirth)}
                </CardDescription>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {patient.phone}
                  {patient.email ? ` - ${patient.email}` : ''}
                  {role ? ` - ${role.replaceAll('_', ' ')}` : ''}
                  {dataSourceLabel ? ` - ${dataSourceLabel}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 bg-slate-50/60 p-4 pt-0 sm:p-5 sm:pt-0">
        {lifecycleSuccess ? (
          <InlineNotice variant="success">{lifecycleSuccess}</InlineNotice>
        ) : null}
        {lifecycleError ? (
          <InlineNotice variant="danger">{lifecycleError}</InlineNotice>
        ) : null}

        <div
          className={classNames(
            'rounded-md border bg-white p-4 shadow-sm',
            hasAnyCriticalContext
              ? 'border-amber-200'
              : 'border-emerald-200',
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={classNames(
                    'flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold',
                    hasAnyCriticalContext
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-900',
                  )}
                >
                  {hasAnyCriticalContext ? '!' : 'OK'}
                </div>
                <div className="text-base font-semibold text-slate-950">
                  Safety and priority notes
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review allergies, warnings, and important patient context before
                routine care updates.
              </p>
            </div>

            <Badge variant={hasAnyCriticalContext ? 'warning' : 'success'}>
              {hasAnyCriticalContext ? 'Review before care' : 'No alerts'}
            </Badge>
          </div>

          {hasAnyCriticalContext ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <SafetyLine label="Allergies">
                {hasAllergies ? patient.allergies : 'No allergies recorded.'}
              </SafetyLine>
              <SafetyLine label="Medical warnings">
                {hasMedicalWarnings ? (
                  <div className="space-y-2">
                    {patient.medicalWarnings.map((warning) => (
                      <p
                        className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950"
                        key={warning}
                      >
                        {warning}
                      </p>
                    ))}
                  </div>
                ) : (
                  'No medical warnings recorded.'
                )}
              </SafetyLine>
              <SafetyLine label="Important note">
                {hasImportantNote
                  ? patient.importantNote
                  : 'No important note recorded.'}
              </SafetyLine>
            </div>
          ) : null}
        </div>

        {isArchived ? (
          <InlineNotice className="bg-white" variant="warning">
            This patient is archived. Restore the profile before regular
            workflow updates.
          </InlineNotice>
        ) : null}
      </CardContent>
    </Card>
  )
}
