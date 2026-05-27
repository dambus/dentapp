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
import { classNames } from '../../lib/classNames'
import type { AppRole } from '../../types/navigation'

type PatientQuickActionsProps = {
  role: AppRole | null
  isArchived: boolean
  onCompleteVisit: () => void
  onEditMedicalRecord: () => void
  onOpenAppointments: () => void
  onOpenClinicalNotes: () => void
  onOpenOdontogram: () => void
  onOpenTreatmentPlans: () => void
  onOpenTimeline: () => void
}

type QuickActionStatus = 'available' | 'planned' | 'readonly'

type QuickAction = {
  id: string
  title: string
  description: string
  status: QuickActionStatus
  cta: string
  onSelect?: () => void
}

const clinicalWriteRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
]

const odontogramEditRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
]

const odontogramContextRoles: AppRole[] = ['assistant']

const treatmentPlanReadRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
  'reception_admin',
]

const medicalRecordEditRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
]

const schedulingRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'assistant',
  'reception_admin',
]

const visitCompletionPlannedRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
  'assistant',
]

const statusLabels: Record<QuickActionStatus, string> = {
  available: 'Available',
  planned: 'Coming soon',
  readonly: 'Context',
}

const statusVariants: Record<
  QuickActionStatus,
  'success' | 'info' | 'neutral'
> = {
  available: 'success',
  planned: 'neutral',
  readonly: 'info',
}

const actionMarkers: Record<string, string> = {
  'complete-visit': 'CV',
  'add-clinical-note': 'N',
  'update-odontogram': 'O',
  'view-odontogram': 'O',
  'view-treatment-plan': 'TP',
  'edit-medical-record': 'MR',
  'schedule-next-appointment': 'S',
  'open-timeline': 'T',
}

function roleCan(role: AppRole | null, roles: AppRole[]) {
  return role ? roles.includes(role) : false
}

function QuickActionCard({
  action,
  isArchived,
}: {
  action: QuickAction
  isArchived: boolean
}) {
  const isPlanned = action.status === 'planned'
  const isDisabled = isArchived || isPlanned || !action.onSelect
  const isInteractive = !isDisabled && action.status === 'available'

  return (
    <div
      className={classNames(
        'flex min-w-0 flex-col gap-3 rounded-md border bg-white p-3 shadow-sm transition sm:p-4',
        isInteractive
          ? 'border-teal-200 hover:shadow-md'
          : 'border-slate-200 opacity-80',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
          <div
            className={classNames(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold',
              isInteractive
                ? 'bg-teal-700 text-white'
                : action.status === 'readonly'
                  ? 'bg-cyan-100 text-cyan-900'
                  : 'bg-slate-100 text-slate-500',
            )}
          >
            {actionMarkers[action.id] ?? 'A'}
          </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-6 text-slate-950">
              {action.title}
            </h3>
            <Badge variant={statusVariants[action.status]}>
              {statusLabels[action.status]}
            </Badge>
            {isArchived && action.status !== 'planned' ? (
              <Badge variant="warning">Archived</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {action.description}
          </p>
        </div>
      </div>

      <Button
        className="min-h-10 w-full sm:w-auto sm:self-start"
        disabled={isDisabled}
        onClick={action.onSelect}
        size="md"
        variant={action.status === 'available' ? 'primary' : 'secondary'}
      >
        {isArchived && action.status !== 'planned'
          ? 'Restore patient first'
          : action.cta}
      </Button>
    </div>
  )
}

export function PatientQuickActions({
  role,
  isArchived,
  onCompleteVisit,
  onEditMedicalRecord,
  onOpenAppointments,
  onOpenClinicalNotes,
  onOpenOdontogram,
  onOpenTreatmentPlans,
  onOpenTimeline,
}: PatientQuickActionsProps) {
  const actions: QuickAction[] = []

  if (roleCan(role, visitCompletionPlannedRoles)) {
    actions.push({
      id: 'complete-visit',
      title: 'Start Visit',
      description:
        'Open Visit Completion for today, or continue from an appointment when one is selected in the workflow.',
      status: 'available',
      cta: 'Open visit workflow',
      onSelect: onCompleteVisit,
    })
  }

  if (roleCan(role, schedulingRoles)) {
    actions.push({
      id: 'schedule-next-appointment',
      title: 'Appointments',
      description:
        'Jump to the patient appointment panel to review the next appointment or schedule a follow-up.',
      status: 'available',
      cta: 'Open appointments',
      onSelect: onOpenAppointments,
    })
  }

  actions.push({
    id: 'open-timeline',
    title: 'Timeline',
    description:
      'Open completed visits and deeper clinical history for this patient.',
    status: 'available',
    cta: 'Open timeline',
    onSelect: onOpenTimeline,
  })

  if (roleCan(role, clinicalWriteRoles)) {
    actions.push({
      id: 'add-clinical-note',
      title: 'Add Clinical Note',
      description:
        'Jump to the existing Clinical Notes section and use the current note form.',
      status: 'available',
      cta: 'Open clinical notes',
      onSelect: onOpenClinicalNotes,
    })
  }

  if (roleCan(role, odontogramEditRoles)) {
    actions.push({
      id: 'update-odontogram',
      title: 'Update Odontogram',
      description:
        'Jump to the existing odontogram editor and select a tooth to update status.',
      status: 'available',
      cta: 'Open odontogram',
      onSelect: onOpenOdontogram,
    })
  } else if (roleCan(role, odontogramContextRoles)) {
    actions.push({
      id: 'view-odontogram',
      title: 'View Odontogram',
      description:
        'Open the read-only odontogram context currently available for assistants.',
      status: 'readonly',
      cta: 'View odontogram',
      onSelect: onOpenOdontogram,
    })
  }

  if (roleCan(role, treatmentPlanReadRoles)) {
    actions.push({
      id: 'view-treatment-plan',
      title: 'Treatment Plan',
      description: 'Open the read-only patient treatment plan section.',
      status: 'available',
      cta: 'View treatment plan',
      onSelect: onOpenTreatmentPlans,
    })
  }

  if (roleCan(role, medicalRecordEditRoles)) {
    actions.push({
      id: 'edit-medical-record',
      title: 'Edit Medical Record',
      description:
        'Open the existing medical record edit route for allergies, warnings, history, and risk notes.',
      status: 'available',
      cta: 'Edit medical record',
      onSelect: onEditMedicalRecord,
    })
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm" data-testid="patient-workflow-shortcuts">
      <CardHeader className="p-4 pb-0 sm:p-5 sm:pb-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Workflow Shortcuts</CardTitle>
              <Badge variant="info">Role shortcuts</Badge>
            </div>
            <CardDescription>
              Secondary paths into patient record sections and scheduling.
            </CardDescription>
          </div>
          {role ? (
            <Badge variant="neutral">{role.replaceAll('_', ' ')}</Badge>
          ) : (
            <Badge variant="warning">Profile unavailable</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:space-y-5 sm:p-5">
        {isArchived ? (
          <InlineNotice variant="warning">
            Patient is archived. Restore the patient before making changes.
          </InlineNotice>
        ) : null}

        {actions.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {actions.map((action) => (
              <QuickActionCard
                action={action}
                isArchived={isArchived}
                key={action.id}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50/70 p-5 text-sm leading-6 text-slate-600">
            No quick actions are available for the current role on this patient.
          </div>
        )}

        <p className="text-xs leading-5 text-slate-500">
          Available actions reuse existing patient sections and appointment or
          visit routes. They do not create materials or reminders.
        </p>
      </CardContent>
    </Card>
  )
}
