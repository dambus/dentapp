import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui'
import {
  formatPatientDate,
  formatPatientDateTime,
} from './patientDisplay'
import type { DemoPatient } from './types'

type PatientTodayPanelProps = {
  patient: DemoPatient
  isArchived: boolean
}

type TodayContextItemProps = {
  label: string
  value: string
  description?: string
}

function getTextOrFallback(value: string | null | undefined, fallback: string) {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : fallback
}

function TodayContextItem({
  label,
  value,
  description,
}: TodayContextItemProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-slate-950">
        {value}
      </div>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      ) : null}
    </div>
  )
}

export function PatientTodayPanel({
  patient,
  isArchived,
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
    <Card className="border-cyan-100 bg-cyan-50/40">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Today / Next Step</CardTitle>
              <Badge variant="info">Phase B</Badge>
              <Badge variant="neutral">Scheduling pending</Badge>
            </div>
            <CardDescription>
              Focused encounter context from currently available patient data.
            </CardDescription>
          </div>

          <Button disabled size="sm" variant="secondary">
            Complete Visit planned
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md border border-cyan-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
            Main focus
          </div>
          <p className="mt-2 text-base font-semibold leading-7 text-slate-950">
            {nextStep}
          </p>
          {isArchived ? (
            <p className="mt-2 text-sm font-medium text-amber-800">
              Patient is archived. Restore the profile before routine workflow
              updates.
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <TodayContextItem
            label="Appointment context"
            value={formatPatientDateTime(patient.nextAppointment)}
            description="No appointment module connected yet. Today context will be linked to scheduling in a later phase."
          />
          <TodayContextItem
            label="Planned work"
            value={activePlanLabel}
            description={plannedWork}
          />
          <TodayContextItem
            label="Last clinical note"
            value={lastNote}
            description="Most recent clinical note summary currently available."
          />
          <TodayContextItem
            label="Recent visit"
            value={formatPatientDate(patient.lastVisit)}
            description={recentVisitSummary}
          />
          <TodayContextItem
            label="Clinical reminder"
            value={
              patient.medicalWarnings.length > 0
                ? `${patient.medicalWarnings.length} warning${
                    patient.medicalWarnings.length === 1 ? '' : 's'
                  }`
                : 'No warning reminder'
            }
            description={warningReminder}
          />
          <TodayContextItem
            label="Visit completion"
            value="Not implemented yet"
            description="Performed work, generated notes, materials, pricing, payments, and commissions remain future workflow phases."
          />
        </div>

        <div className="rounded-md border border-dashed border-cyan-200 bg-white/70 px-4 py-3">
          <p className="text-sm leading-6 text-slate-600">
            Scheduling and visit completion will be connected in later phases.
            This panel does not create appointments, visits, payments, materials,
            or clinical entries.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
