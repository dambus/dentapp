import { useEffect, useMemo, useState } from 'react'

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
  appointmentOperationalStateLabels,
  fetchAppointmentsForPatient,
  type Appointment,
} from '../appointments/appointmentService'
import {
  fetchCompletedVisitsForPatient,
  fetchLatestOpenVisitCompletion,
  type VisitCompletionDraft,
} from '../visits/visitCompletionService'
import {
  formatPatientDate,
  formatPatientDateTime,
} from './patientDisplay'
import type { DemoPatient } from './types'

type PatientTodayPanelProps = {
  patient: DemoPatient
  isArchived: boolean
  canCompleteVisit: boolean
  onOpenAppointment: (appointmentId: string) => void
  onOpenTimeline: () => void
  onStartVisit: (appointmentId?: string | null) => void
  onViewCompletedVisit: (visitId: string) => void
}

function getTextOrFallback(value: string | null | undefined, fallback: string) {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : fallback
}

function isSameLocalDate(value: string | null | undefined, date: Date) {
  if (!value) {
    return false
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return false
  }

  return parsedDate.toDateString() === date.toDateString()
}

function getVisitDisplayDate(visit: VisitCompletionDraft) {
  return visit.completedAt ?? visit.visitDate ?? visit.createdAt
}

function getProcedureSummary(visit: VisitCompletionDraft | null) {
  if (!visit || visit.procedures.length === 0) {
    return 'No procedures recorded'
  }

  return visit.procedures
    .map((procedure) => procedure.procedureName)
    .filter(Boolean)
    .join(', ')
}

export function PatientTodayPanel({
  patient,
  isArchived,
  canCompleteVisit,
  onOpenAppointment,
  onOpenTimeline,
  onStartVisit,
  onViewCompletedVisit,
}: PatientTodayPanelProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [openVisit, setOpenVisit] = useState<VisitCompletionDraft | null>(null)
  const [completedVisits, setCompletedVisits] = useState<VisitCompletionDraft[]>([])
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(true)
  const [workflowError, setWorkflowError] = useState<string | null>(null)
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
  const today = useMemo(() => new Date(), [])
  const todayAppointment =
    appointments
      .filter((appointment) => isSameLocalDate(appointment.scheduled_start, today))
      .sort(
        (firstAppointment, secondAppointment) =>
          new Date(firstAppointment.scheduled_start).getTime() -
          new Date(secondAppointment.scheduled_start).getTime(),
      )[0] ?? null
  const appointmentScopedOpenVisit = todayAppointment
    ? openVisit?.appointmentId === todayAppointment.id
      ? openVisit
      : null
    : null
  const latestCompletedVisit = completedVisits[0] ?? null
  const completedToday =
    completedVisits.find((visit) => isSameLocalDate(getVisitDisplayDate(visit), today)) ??
    null
  const workflowVisit = completedToday ?? appointmentScopedOpenVisit ?? openVisit
  const workflowStatus = completedToday
    ? 'Completed today'
    : appointmentScopedOpenVisit ?? openVisit
      ? 'Visit in progress'
      : todayAppointment
        ? 'Appointment scheduled today'
        : 'No active visit today'
  const primaryAction = completedToday
    ? {
        label: 'View completed visit',
        onClick: () => onViewCompletedVisit(completedToday.id),
      }
    : appointmentScopedOpenVisit ?? openVisit
      ? {
          label: 'Continue visit',
          onClick: () => onStartVisit((appointmentScopedOpenVisit ?? openVisit)?.appointmentId),
        }
      : todayAppointment
        ? {
            label: 'Start visit',
            onClick: () => onStartVisit(todayAppointment.id),
          }
        : {
            label: 'Start visit',
            onClick: () => onStartVisit(null),
          }

  useEffect(() => {
    let isCurrent = true

    async function loadWorkflowContext() {
      setIsLoadingWorkflow(true)
      setWorkflowError(null)

      try {
        const [patientAppointments, latestOpenVisit, patientCompletedVisits] =
          await Promise.all([
            fetchAppointmentsForPatient(patient.id),
            fetchLatestOpenVisitCompletion(patient.id),
            fetchCompletedVisitsForPatient(patient.id),
          ])

        if (isCurrent) {
          setAppointments(patientAppointments)
          setOpenVisit(latestOpenVisit)
          setCompletedVisits(patientCompletedVisits)
        }
      } catch {
        if (isCurrent) {
          setWorkflowError('Today workflow context could not be loaded.')
        }
      } finally {
        if (isCurrent) {
          setIsLoadingWorkflow(false)
        }
      }
    }

    void loadWorkflowContext()

    return () => {
      isCurrent = false
    }
  }, [patient.id])

  return (
    <Card
      className="overflow-hidden border-cyan-100 bg-cyan-50/40 shadow-sm"
      data-testid="patient-today-panel"
    >
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-700 text-sm font-semibold text-white">
                TD
              </div>
              <CardTitle>Today / Active Workflow</CardTitle>
              <Badge
                variant={
                  completedToday
                    ? 'success'
                    : appointmentScopedOpenVisit ?? openVisit
                      ? 'warning'
                      : todayAppointment
                        ? 'info'
                        : 'neutral'
                }
              >
                {workflowStatus}
              </Badge>
            </div>
            <CardDescription>
              Current appointment and Visit Completion state for this patient.
            </CardDescription>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            {todayAppointment ? (
              <Button
                className="min-h-10 w-full sm:w-auto"
                onClick={() => onOpenAppointment(todayAppointment.id)}
                size="sm"
                variant="secondary"
              >
                View appointment
              </Button>
            ) : null}
            <Button
              className="min-h-10 w-full sm:w-auto"
              disabled={isArchived || !canCompleteVisit}
              onClick={primaryAction.onClick}
              size="sm"
            >
              {primaryAction.label}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-5">
        {workflowError ? (
          <InlineNotice variant="warning">{workflowError}</InlineNotice>
        ) : null}

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="rounded-md border border-cyan-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Active clinical state</Badge>
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
              {isLoadingWorkflow ? 'Loading workflow context...' : workflowStatus}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {completedToday
                ? `Completed visit: ${getProcedureSummary(completedToday)}`
                : appointmentScopedOpenVisit ?? openVisit
                  ? `Open draft: ${getProcedureSummary(workflowVisit)}`
                  : todayAppointment
                    ? todayAppointment.reason?.trim() || 'No appointment reason recorded.'
                    : `Next step: ${nextStep}`}
            </p>
            {isArchived ? (
              <InlineNotice className="mt-4" variant="warning">
                Patient is archived. Restore the profile before routine
                workflow updates.
              </InlineNotice>
            ) : null}
          </div>

          <div className="rounded-md border border-cyan-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
              Today appointment
            </div>
            <div className="mt-3 text-xl font-semibold leading-7 text-slate-950">
              {todayAppointment
                ? formatPatientDateTime(todayAppointment.scheduled_start)
                : 'No appointment today'}
            </div>
            {todayAppointment?.reason ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {todayAppointment.reason}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {todayAppointment ? (
                <Badge
                  variant={
                    todayAppointment.status === 'completed'
                      ? 'success'
                      : todayAppointment.status === 'scheduled'
                        ? 'info'
                        : 'neutral'
                  }
                >
                  {todayAppointment.status.replaceAll('_', ' ')}
                </Badge>
              ) : null}
              {todayAppointment?.status === 'scheduled' ? (
                <Badge
                  data-testid="patient-today-operational-state"
                  variant={
                    todayAppointment.operational_state === 'ready_for_doctor'
                      ? 'success'
                      : todayAppointment.operational_state === 'arrived'
                        ? 'warning'
                        : 'neutral'
                  }
                >
                  {appointmentOperationalStateLabels[
                    todayAppointment.operational_state
                  ]}
                </Badge>
              ) : null}
              <Badge variant={patient.activeTreatmentPlan ? 'info' : 'neutral'}>
                {activePlanLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricTile
            label="Planned work"
            tone="info"
            value={activePlanLabel}
            description={plannedWork}
          />
          <MetricTile
            label="Latest completed visit"
            value={
              latestCompletedVisit
                ? formatPatientDate(getVisitDisplayDate(latestCompletedVisit))
                : formatPatientDate(patient.lastVisit)
            }
            description={
              latestCompletedVisit
                ? getProcedureSummary(latestCompletedVisit)
                : recentVisitSummary
            }
            tone={latestCompletedVisit ? 'success' : 'default'}
          />
          <MetricTile
            label="Last clinical note"
            value={lastNote}
            description="Most recent patient-level note summary currently available."
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
            value={workflowVisit ? workflowStatus : 'Ready when needed'}
            description="Drafts and completed visits use the existing Visit Completion records."
          />
        </div>

        <InlineNotice className="border-dashed bg-white/70" variant="info">
          <button
            className="font-semibold text-cyan-900 underline underline-offset-2"
            onClick={onOpenTimeline}
            type="button"
          >
            Open timeline
          </button>{' '}
          for deeper visit records. Visit completion does not create payments,
          materials, reminders, or ledger entries.
        </InlineNotice>
      </CardContent>
    </Card>
  )
}
