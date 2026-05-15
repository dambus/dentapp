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
import {
  formatPatientDate,
  formatPatientDateTime,
} from './patientDisplay'
import type { DemoPatient } from './types'

type PatientTodayPanelProps = {
  patient: DemoPatient
  isArchived: boolean
  canCompleteVisit: boolean
  onCompleteVisit: () => void
}

function getTextOrFallback(value: string | null | undefined, fallback: string) {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : fallback
}

export function PatientTodayPanel({
  patient,
  isArchived,
  canCompleteVisit,
  onCompleteVisit,
}: PatientTodayPanelProps) {
  const activePlanLabel = patient.activeTreatmentPlan ?? 'No active plan'
  const plannedWork = getTextOrFallback(
    patient.activeTreatmentPlanSummary,
    'No specific planned treatment recorded yet.',
  )
  const nextStep = getTextOrFallback(
    patient.nextRecommendedStep,
    'No next step recorded yet.',
  )
  const lastNote = getTextOrFallback(
    patient.lastClinicalNote,
    'No clinical note summary recorded yet.',
  )
  const recentVisitSummary = getTextOrFallback(
    patient.recentVisitSummary,
    'No recent visit summary recorded yet.',
  )
  const warningReminder =
    patient.medicalWarnings.length > 0
      ? patient.medicalWarnings.join(', ')
      : 'No medical warning reminder recorded.'

  return (
    <Card className="overflow-hidden border-cyan-100 bg-cyan-50/40 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-700 text-base font-semibold text-white">
                TD
              </div>
              <CardTitle>Today / Next Step</CardTitle>
              <Badge variant="info">Phase B</Badge>
              <Badge variant="neutral">Scheduling pending</Badge>
            </div>
            <CardDescription>
              Focused encounter context from currently available patient data.
            </CardDescription>
          </div>

          <Button
            className="min-h-10"
            disabled={isArchived || !canCompleteVisit}
            onClick={onCompleteVisit}
            size="sm"
          >
            Complete Visit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="rounded-md border border-cyan-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Next clinical action</Badge>
              {patient.medicalWarnings.length > 0 ? (
                <Badge variant="warning">
                  {patient.medicalWarnings.length} warning
                  {patient.medicalWarnings.length === 1 ? '' : 's'}
                </Badge>
              ) : (
                <Badge variant="success">No warning reminder</Badge>
              )}
            </div>
            <p className="mt-4 text-2xl font-semibold leading-8 text-slate-950">
              {nextStep}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Planned work: {plannedWork}
            </p>
            {isArchived ? (
              <InlineNotice className="mt-4" variant="warning">
                Patient is archived. Restore the profile before routine
                workflow updates.
              </InlineNotice>
            ) : null}
          </div>

          <div className="rounded-md border border-cyan-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
              Appointment context
            </div>
            <div className="mt-3 text-xl font-semibold leading-7 text-slate-950">
              {formatPatientDateTime(patient.nextAppointment)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="neutral">Scheduling pending</Badge>
              <Badge variant={patient.activeTreatmentPlan ? 'info' : 'neutral'}>
                {activePlanLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <MetricTile
            label="Planned work"
            tone="info"
            value={activePlanLabel}
            description={plannedWork}
          />
          <MetricTile
            label="Last clinical note"
            value={lastNote}
            description="Most recent clinical note summary currently available."
          />
          <MetricTile
            label="Recent visit"
            value={formatPatientDate(patient.lastVisit)}
            description={recentVisitSummary}
          />
          <MetricTile
            label="Clinical reminder"
            tone={patient.medicalWarnings.length > 0 ? 'warning' : 'success'}
            value={
              patient.medicalWarnings.length > 0
                ? `${patient.medicalWarnings.length} warning${
                    patient.medicalWarnings.length === 1 ? '' : 's'
                  }`
                : 'No warning reminder'
            }
            description={warningReminder}
          />
          <MetricTile
            label="Visit completion"
            value="Draft and completion active"
            description="Completed visits now appear in the patient timeline. Materials, pricing, payments, and commissions remain future workflow phases."
          />
        </div>

        <InlineNotice className="border-dashed bg-white/70" variant="info">
          Visit completion saves draft and completed visit records. It does not
          create appointments, payments, materials, or ledger entries yet.
        </InlineNotice>
      </CardContent>
    </Card>
  )
}
