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

const treatmentPlanWriteRoles: AppRole[] = [
  'owner_admin',
  'doctor',
  'specialist',
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
  'add-treatment-plan-item': 'TP',
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
        'flex min-h-64 flex-col justify-between rounded-md border bg-white p-5 shadow-sm transition',
        isInteractive
          ? 'border-teal-200 hover:-translate-y-0.5 hover:shadow-md'
          : 'border-slate-200 opacity-80',
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div
            className={classNames(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-base font-semibold',
              isInteractive
                ? 'bg-teal-700 text-white'
                : action.status === 'readonly'
                  ? 'bg-cyan-100 text-cyan-900'
                  : 'bg-slate-100 text-slate-500',
            )}
          >
            {actionMarkers[action.id] ?? 'A'}
          </div>
          <Badge variant={statusVariants[action.status]}>
            {statusLabels[action.status]}
          </Badge>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold leading-6 text-slate-950">
            {action.title}
          </h3>
          {isArchived && action.status !== 'planned' ? (
            <Badge variant="warning">Archived</Badge>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {action.description}
        </p>
      </div>

      <Button
        className="mt-5 min-h-11 w-full"
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

  if (roleCan(role, treatmentPlanWriteRoles)) {
    actions.push({
      id: 'add-treatment-plan-item',
      title: 'Add Treatment Plan Item',
      description:
        'Jump to Treatment Plans. Select a plan there before adding a planned item.',
      status: 'available',
      cta: 'Open treatment plans',
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
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Quick Actions</CardTitle>
              <Badge variant="info">Phase C</Badge>
            </div>
            <CardDescription>
              Role-aware shortcuts into common patient workflows.
            </CardDescription>
          </div>
          {role ? (
            <Badge variant="neutral">{role.replaceAll('_', ' ')}</Badge>
          ) : (
            <Badge variant="warning">Profile unavailable</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isArchived ? (
          <InlineNotice variant="warning">
            Patient is archived. Restore the patient before making changes.
          </InlineNotice>
        ) : null}

        {actions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => (
              <QuickActionCard
                action={action}
                isArchived={isArchived}
                key={action.id}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            No quick actions are available for the current role on this patient.
          </div>
        )}

        <p className="text-xs leading-5 text-slate-500">
          Available actions reuse existing patient sections and appointment or
          visit routes. They do not create payments, materials, reminders, or
          ledger entries.
        </p>
      </CardContent>
    </Card>
  )
}
