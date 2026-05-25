import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InlineNotice,
  MetricTile,
} from '../../components/ui'
import type { AppRole } from '../../types/navigation'
import {
  formatPatientDate,
  formatPatientDateTime,
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
    <Card className="overflow-hidden border-teal-100 shadow-md">
      <div className="border-b border-teal-100 bg-white">
        <CardHeader>
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-teal-700 text-xl font-semibold text-white shadow-sm">
                {patient.firstName.slice(0, 1)}
                {patient.lastName.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-3xl leading-tight">
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
                <CardDescription className="text-base">
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

      <CardContent className="space-y-6 bg-slate-50/60">
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

        <div className="rounded-md border border-amber-200 bg-white p-5 shadow-sm">
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
                <div className="text-lg font-semibold text-slate-950">
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
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
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
          <MetricTile
            className="min-h-36"
            label="Active plan"
            tone={patient.activeTreatmentPlan ? 'info' : 'default'}
            value={activePlanLabel}
            description={patient.activeTreatmentPlanSummary}
          />
          <MetricTile
            className="min-h-36"
            label="Last note"
            value={patient.lastClinicalNote}
            description="Most recent clinical context available in the current model."
          />
          <MetricTile
            className="min-h-36"
            label="Next step"
            tone="info"
            value={patient.nextRecommendedStep}
            description={`Next appointment: ${formatPatientDateTime(
              patient.nextAppointment,
            )}`}
          />
          <MetricTile
            className="min-h-36"
            label="Contact"
            value={patient.phone}
            description={patient.email || 'No email recorded.'}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MetricTile
            label="Last visit"
            tone="success"
            value={formatPatientDate(patient.lastVisit)}
            description={patient.recentVisitSummary}
          />
          <MetricTile
            label="Status"
            tone={patient.status === 'active' ? 'success' : 'warning'}
            value={patientStatusLabels[patient.status]}
            description="Patient profile lifecycle state."
          />
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
