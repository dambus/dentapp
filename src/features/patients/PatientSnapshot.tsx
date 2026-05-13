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
  formatDemoCurrency,
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

const financialPlaceholderRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'reception_admin',
]

function getFinancialVisibility(role: AppRole | null) {
  return !role || financialPlaceholderRoles.includes(role)
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
  const canViewFinancialPlaceholder = getFinancialVisibility(role)
  const activePlanLabel = patient.activeTreatmentPlan ?? 'No active plan'
  const hasAnyCriticalContext =
    hasMedicalWarnings || hasAllergies || hasImportantNote

  return (
    <Card className="border-teal-100 shadow-md">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl">{patientName}</CardTitle>
              <Badge variant={patientStatusBadgeVariants[patient.status]}>
                {patientStatusLabels[patient.status]}
              </Badge>
              {isArchived ? (
                <Badge variant="warning">Archived profile</Badge>
              ) : null}
              <Badge variant="info">{dataSourceLabel}</Badge>
            </div>
            <CardDescription>
              {age} years old - born {formatPatientDate(patient.dateOfBirth)}
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isArchived ? (
              <Button onClick={onEditPatient} size="sm">
                Edit patient
              </Button>
            ) : null}
            {canEditMedicalRecord ? (
              <Button
                onClick={onEditMedicalRecord}
                size="sm"
                variant="secondary"
              >
                Edit medical record
              </Button>
            ) : null}
            {canArchiveOrRestore && !isArchived ? (
              <Button
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
                disabled={isLifecycleSubmitting}
                onClick={onRestore}
                size="sm"
              >
                {isLifecycleSubmitting ? 'Restoring...' : 'Restore patient'}
              </Button>
            ) : null}
            <Button onClick={onViewFullRecord} size="sm" variant="ghost">
              View full record
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
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

        <div
          className={
            hasAnyCriticalContext
              ? 'rounded-md border border-amber-200 bg-amber-50 p-4'
              : 'rounded-md border border-emerald-200 bg-emerald-50 p-4'
          }
        >
          <div className="text-sm font-semibold text-slate-950">
            Safety and priority notes
          </div>
          {hasAnyCriticalContext ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-normal text-amber-900">
                  Allergies
                </div>
                <p className="mt-1 text-sm leading-6 text-amber-950">
                  {hasAllergies ? patient.allergies : 'No allergies recorded.'}
                </p>
              </div>
              <div>
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
              <div>
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
            <p className="mt-1 text-sm leading-6 text-emerald-900">
              No critical warnings, allergies, or important notes recorded.
            </p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Active plan"
            value={activePlanLabel}
            description={patient.activeTreatmentPlanSummary}
          />
          <MetricTile
            label="Last note"
            value={patient.lastClinicalNote}
            description="Most recent clinical context available in the current model."
          />
          <MetricTile
            label="Next step"
            value={patient.nextRecommendedStep}
            description={`Next appointment: ${formatPatientDateTime(
              patient.nextAppointment,
            )}`}
          />
          {canViewFinancialPlaceholder ? (
            <MetricTile
              label="Financial placeholder"
              value={formatDemoCurrency(patient.unpaidBalance)}
              description="Current demo/unpaid balance placeholder. Real ledger is not implemented yet."
            />
          ) : (
            <MetricTile
              label="Financial context"
              value="Restricted"
              description="Financial data is hidden for this role."
            />
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MetricTile
            label="Last visit"
            value={formatPatientDate(patient.lastVisit)}
            description={patient.recentVisitSummary}
          />
          <MetricTile
            label="Contact"
            value={patient.phone}
            description={patient.email || 'No email recorded.'}
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
