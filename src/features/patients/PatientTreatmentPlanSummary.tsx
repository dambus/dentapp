import { useEffect, useMemo, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  MetricTile,
} from '../../components/ui'
import {
  getPatientTreatmentPlans,
  treatmentPlanItemStatusOptions,
  treatmentPlanStatusOptions,
  type TreatmentPlan,
  type TreatmentPlanItemStatus,
  type TreatmentPlanStatus,
} from './treatmentPlanService'
import { formatPatientDate } from './patientDisplay'

type PatientTreatmentPlanSummaryProps = {
  patientId: string
  onOpenTreatmentPlans: () => void
}

const statusBadgeVariants: Record<
  TreatmentPlanStatus | TreatmentPlanItemStatus,
  'success' | 'warning' | 'danger' | 'info' | 'neutral'
> = {
  draft: 'neutral',
  proposed: 'info',
  accepted: 'success',
  in_progress: 'warning',
  completed: 'success',
  paused: 'warning',
  rejected: 'danger',
  archived: 'neutral',
  planned: 'neutral',
  skipped: 'neutral',
  cancelled: 'danger',
}

function getPlanStatusLabel(status: TreatmentPlanStatus) {
  return (
    treatmentPlanStatusOptions.find((option) => option.value === status)
      ?.label ?? 'Draft'
  )
}

function getItemStatusLabel(status: TreatmentPlanItemStatus) {
  return (
    treatmentPlanItemStatusOptions.find((option) => option.value === status)
      ?.label ?? 'Planned'
  )
}

function getSummaryErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'Treatment plan information could not be loaded for the current role.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network')
  ) {
    return 'Treatment plan information could not be loaded. Check the local Supabase connection and try again.'
  }

  return 'Treatment plan information could not be loaded.'
}

function getPrimaryPlan(plans: TreatmentPlan[]) {
  return (
    plans.find((plan) => plan.status === 'in_progress') ??
    plans.find((plan) => plan.status === 'accepted') ??
    plans.find((plan) => plan.status === 'proposed') ??
    plans[0] ??
    null
  )
}

export function PatientTreatmentPlanSummary({
  patientId,
  onOpenTreatmentPlans,
}: PatientTreatmentPlanSummaryProps) {
  const [plans, setPlans] = useState<TreatmentPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadTreatmentPlans(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    setErrorMessage(null)

    try {
      const loadedPlans = await getPatientTreatmentPlans(patientId)
      setPlans(loadedPlans)
    } catch (error) {
      setErrorMessage(
        getSummaryErrorMessage(error instanceof Error ? error.message : null),
      )
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitialTreatmentPlans() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const loadedPlans = await getPatientTreatmentPlans(patientId)

        if (isCurrent) {
          setPlans(loadedPlans)
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(
            getSummaryErrorMessage(
              error instanceof Error ? error.message : null,
            ),
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialTreatmentPlans()

    return () => {
      isCurrent = false
    }
  }, [patientId])

  const primaryPlan = useMemo(() => getPrimaryPlan(plans), [plans])
  const plannedItems = primaryPlan
    ? primaryPlan.items.filter((item) => item.status === 'planned')
    : []
  const activeItems = primaryPlan
    ? primaryPlan.items.filter(
        (item) => item.status === 'accepted' || item.status === 'in_progress',
      )
    : []

  if (isLoading) {
    return <LoadingState label="Loading treatment plan summary..." />
  }

  if (errorMessage) {
    return (
      <ErrorState
        action={
          <Button onClick={() => void loadTreatmentPlans()}>
            Try again
          </Button>
        }
        description={errorMessage}
        title="Treatment plan unavailable"
      />
    )
  }

  if (!primaryPlan) {
    return (
      <Card
        className="border-slate-200 bg-white shadow-sm"
        data-testid="patient-treatment-plan-summary"
      >
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Treatment Plan</CardTitle>
                <Badge variant="neutral">Read-only</Badge>
              </div>
              <CardDescription>
                Treatment plan records and planned items for this patient.
              </CardDescription>
            </div>
            <Button
              className="min-h-10"
              onClick={onOpenTreatmentPlans}
              size="sm"
              variant="secondary"
            >
              View treatment plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 bg-slate-50/70 p-5">
            <div className="text-sm font-semibold text-slate-950">
              No treatment plan configured
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Treatment plans and planned items will appear here once they are
              recorded in the patient treatment plan section.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="border-indigo-200 bg-white shadow-sm"
      data-testid="patient-treatment-plan-summary"
    >
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Treatment Plan</CardTitle>
              <Badge variant={statusBadgeVariants[primaryPlan.status]}>
                {getPlanStatusLabel(primaryPlan.status)}
              </Badge>
              <Badge variant="neutral">Read-only</Badge>
            </div>
            <CardDescription>
              Primary treatment plan context for this patient.
            </CardDescription>
          </div>
          <Button
            className="min-h-10"
            onClick={onOpenTreatmentPlans}
            size="sm"
            variant="secondary"
          >
            View treatment plan
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-5">
        <div className="rounded-md border border-indigo-200 bg-indigo-50/40 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-normal text-indigo-800">
                Primary plan
              </div>
              <p className="mt-1 text-lg font-semibold leading-7 text-slate-950">
                {primaryPlan.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {primaryPlan.description || 'No description recorded.'}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Badge variant={statusBadgeVariants[primaryPlan.status]}>
                {getPlanStatusLabel(primaryPlan.status)}
              </Badge>
              <Badge variant="neutral">
                {primaryPlan.items.length} planned item
                {primaryPlan.items.length === 1 ? '' : 's'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            label="Planned items"
            value={String(primaryPlan.items.length)}
            description={`${plannedItems.length} planned, ${activeItems.length} active.`}
            tone={primaryPlan.items.length > 0 ? 'success' : 'default'}
          />
          <MetricTile
            label="Created"
            value={formatPatientDate(primaryPlan.createdAt)}
            description="Plan record date."
            tone="default"
          />
        </div>

        {primaryPlan.items.length > 0 ? (
          <div
            className="rounded-md border border-slate-200 bg-slate-50 p-4 sm:p-5"
            data-testid="patient-treatment-plan-items"
          >
            <div className="text-sm font-semibold text-slate-950">
              Planned items
            </div>
            <ul className="mt-3 space-y-2.5">
              {primaryPlan.items.slice(0, 4).map((item) => (
                <li
                  className="rounded-md border border-slate-200 bg-white px-3 py-2.5"
                  key={item.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">
                      {item.title}
                    </span>
                    <Badge variant={statusBadgeVariants[item.status]}>
                      {getItemStatusLabel(item.status)}
                    </Badge>
                    {item.toothNumber ? (
                      <Badge variant="neutral">Tooth {item.toothNumber}</Badge>
                    ) : null}
                  </div>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            {primaryPlan.items.length > 4 ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                +{primaryPlan.items.length - 4} more planned item
                {primaryPlan.items.length - 4 === 1 ? '' : 's'} in the full
                treatment plan section.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50/70 p-5 text-sm leading-6 text-slate-600">
            No planned items are recorded for this treatment plan yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
