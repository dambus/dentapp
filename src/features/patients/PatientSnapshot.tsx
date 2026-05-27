import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InlineNotice,
} from '../../components/ui'
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
  onEditPatient: () => void
  onEditMedicalRecord: () => void
  onArchive: () => void
  onRestore: () => void
  onViewFullRecord: () => void
}

export function PatientSnapshot({
  patient,
  isArchived,
  isLifecycleSubmitting,
  lifecycleError,
  lifecycleSuccess,
  canEditMedicalRecord,
  canArchiveOrRestore,
  dataSourceLabel,
  onEditPatient,
  onEditMedicalRecord,
  onArchive,
  onRestore,
  onViewFullRecord,
}: PatientSnapshotProps) {
  const patientName = getPatientFullName(patient)
  const age = getPatientAge(patient.dateOfBirth)
  const hasMedicalWarnings = patient.medicalWarnings.length > 0
  const hasAllergies = Boolean(patient.allergies.trim())
  const hasImportantNote = Boolean(patient.importantNote?.trim())
  const activePlanLabel = patient.activeTreatmentPlan ?? 'No active plan'
  const hasAnyCriticalContext =
    hasMedicalWarnings || hasAllergies || hasImportantNote

  return (
    <Card
      className="overflow-hidden border-teal-100 shadow-sm"
      data-testid="patient-workflow-header"
    >
      <div className="border-b border-teal-100 bg-white">
        <CardHeader className="p-4 pb-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 gap-4">
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
                    {patientStatusLabels[patient.status]}
                  </Badge>
                  {isArchived ? (
                    <Badge variant="warning">Archived profile</Badge>
                  ) : null}
                  <Badge variant="info">{dataSourceLabel}</Badge>
                </div>
                <CardDescription className="text-sm sm:text-base">
                  {age} years old - born {formatPatientDate(patient.dateOfBirth)}
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
            {!isArchived ? (
              <Button className="min-h-10" onClick={onEditPatient} size="sm">
                Edit patient
              </Button>
            ) : null}
            {canEditMedicalRecord ? (
              <Button
                className="min-h-10"
                onClick={onEditMedicalRecord}
                size="sm"
                variant="secondary"
              >
                Edit medical record
              </Button>
            ) : null}
            {canArchiveOrRestore && !isArchived ? (
              <Button
                className="min-h-10"
                disabled={isLifecycleSubmitting}
                onClick={onArchive}
                size="sm"
                variant="secondary"
              >
                {isLifecycleSubmitting ? 'Archiving...' : 'Archive patient'}
              </Button>
            ) : null}
            {canArchiveOrRestore && isArchived ? (
              <Button
                className="min-h-10"
                disabled={isLifecycleSubmitting}
                onClick={onRestore}
                size="sm"
              >
                {isLifecycleSubmitting ? 'Restoring...' : 'Restore patient'}
              </Button>
            ) : null}
            <Button
              className="min-h-10"
              onClick={onViewFullRecord}
              size="sm"
              variant="ghost"
            >
              View full record
            </Button>
            </div>
          </div>
        </CardHeader>
      </div>

      <CardContent className="space-y-4 bg-slate-50/60 p-4 sm:p-5">
        {lifecycleSuccess ? (
          <InlineNotice variant="success">
            {lifecycleSuccess}
          </InlineNotice>
        ) : null}
        {lifecycleError ? (
          <InlineNotice variant="danger">
            {lifecycleError}
          </InlineNotice>
        ) : null}

        <div className="rounded-md border border-amber-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className={
                  hasAnyCriticalContext
                    ? 'flex h-11 w-11 items-center justify-center rounded-md bg-amber-100 text-lg font-bold text-amber-900'
                    : 'flex h-11 w-11 items-center justify-center rounded-md bg-emerald-100 text-lg font-bold text-emerald-900'
                }
              >
                {hasAnyCriticalContext ? '!' : 'OK'}
              </div>
              <div>
                <div className="text-base font-semibold text-slate-950">
                  Safety and priority notes
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Clinical context to check before routine updates.
                </p>
              </div>
            </div>
            <Badge variant={hasAnyCriticalContext ? 'warning' : 'success'}>
              {hasAnyCriticalContext ? 'Review before care' : 'No alerts'}
            </Badge>
          </div>
          {hasAnyCriticalContext ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-normal text-amber-900">
                  Allergies
                </div>
                <p className="mt-1 text-sm leading-6 text-amber-950">
                  {hasAllergies ? patient.allergies : 'No allergies recorded.'}
                </p>
              </div>
              <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-normal text-amber-900">
                  Medical warnings
                </div>
                {hasMedicalWarnings ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {patient.medicalWarnings.map((warning) => (
                      <Badge key={warning} variant="warning">
                        {warning}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm leading-6 text-amber-950">
                    No medical warnings recorded.
                  </p>
                )}
              </div>
              <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-normal text-amber-900">
                  Important note
                </div>
                <p className="mt-1 text-sm leading-6 text-amber-950">
                  {hasImportantNote
                    ? patient.importantNote
                    : 'No important note recorded.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
              No critical warnings, allergies, or important notes recorded.
            </p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Contact
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-950">
              {patient.phone}
            </div>
            <p className="mt-1 truncate text-sm text-slate-600">
              {patient.email || 'No email recorded.'}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Active plan
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-950">
              {activePlanLabel}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {patient.activeTreatmentPlanSummary}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Last visit
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-950">
              {formatPatientDate(patient.lastVisit)}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {patient.recentVisitSummary}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Profile status
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-950">
              {patientStatusLabels[patient.status]}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Patient lifecycle state.
            </p>
          </div>
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
