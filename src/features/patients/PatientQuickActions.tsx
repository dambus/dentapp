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

type PatientQuickActionsProps = {
  role: AppRole | null
  isArchived: boolean
  onEditMedicalRecord: () => void
  onOpenClinicalNotes: () => void
  onOpenOdontogram: () => void
  onOpenTreatmentPlans: () => void
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

const paymentPlannedRoles: AppRole[] = ['owner_admin', 'reception_admin']

const schedulingPlannedRoles: AppRole[] = [
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

  return (
    <div className="flex min-h-48 flex-col justify-between rounded-md border border-slate-200 bg-white p-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-950">
            {action.title}
          </h3>
          <Badge variant={statusVariants[action.status]}>
            {statusLabels[action.status]}
          </Badge>
          {isArchived && action.status !== 'planned' ? (
            <Badge variant="warning">Archived</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {action.description}
        </p>
      </div>

      <Button
        className="mt-4 w-full sm:w-auto"
        disabled={isDisabled}
        onClick={action.onSelect}
        size="sm"
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
  onEditMedicalRecord,
  onOpenClinicalNotes,
  onOpenOdontogram,
  onOpenTreatmentPlans,
}: PatientQuickActionsProps) {
  const actions: QuickAction[] = []

  if (roleCan(role, visitCompletionPlannedRoles)) {
    actions.push({
      id: 'complete-visit',
      title: 'Complete Visit',
      description:
        "Close today's work and generate note, service, material, payment, and next-step draft.",
      status: 'planned',
      cta: 'Coming soon',
    })
  }

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

  if (roleCan(role, paymentPlannedRoles)) {
    actions.push({
      id: 'add-payment',
      title: 'Add Payment',
      description:
        'Payment and patient ledger workflow is planned for a later phase.',
      status: 'planned',
      cta: 'Coming soon',
    })
  }

  if (roleCan(role, schedulingPlannedRoles)) {
    actions.push({
      id: 'schedule-next-appointment',
      title: 'Schedule Next Appointment',
      description:
        'Scheduling module is planned and will connect to Today context later.',
      status: 'planned',
      cta: 'Coming soon',
    })
  }

  return (
    <Card className="border-slate-200">
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
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
          Available actions reuse existing patient sections. Coming soon actions
          are visible only where the future workflow is relevant, but they do not
          create visits, appointments, payments, materials, or ledger entries.
        </p>
      </CardContent>
    </Card>
  )
}
