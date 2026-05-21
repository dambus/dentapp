import { useEffect, useMemo, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  InlineNotice,
  LoadingState,
  MetricTile,
} from '../../components/ui'
import { formatPatientDate } from './patientDisplay'
import {
  getPatientTreatmentPlans,
  treatmentPlanItemStatusOptions,
  treatmentPlanStatusOptions,
} from './treatmentPlanService'
import type {
  TreatmentPlan,
  TreatmentPlanItemStatus,
  TreatmentPlanStatus,
} from './treatmentPlanService'

type TreatmentPlansSectionProps = {
  patientId: string
  isPatientArchived: boolean
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

const currencyFormatter = new Intl.NumberFormat('sr-RS', {
  style: 'currency',
  currency: 'RSD',
  maximumFractionDigits: 0,
})

function formatCurrency(value: number | null) {
  return value === null ? 'No total recorded' : currencyFormatter.format(value)
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

function getTreatmentPlanLoadErrorMessage(message: string | null) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (
    normalizedMessage.includes('permission') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('not allowed')
  ) {
    return 'Treatment plans could not be loaded for the current role.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network')
  ) {
    return 'Treatment plans could not be loaded. Check the local Supabase connection and try again.'
  }

  return 'Treatment plans could not be loaded.'
}

function getItemCountLabel(count: number) {
  return `${count} planned item${count === 1 ? '' : 's'}`
}

export function TreatmentPlansSection({
  patientId,
  isPatientArchived,
}: TreatmentPlansSectionProps) {
  const [plans, setPlans] = useState<TreatmentPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const sortedPlans = useMemo(
    () =>
      [...plans].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      ),
    [plans],
  )

  async function loadTreatmentPlans(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    try {
      const loadedPlans = await getPatientTreatmentPlans(patientId)
      setPlans(loadedPlans)
      setLoadError(null)
    } catch (error) {
      setLoadError(
        getTreatmentPlanLoadErrorMessage(
          error instanceof Error ? error.message : null,
        ),
      )

      if (import.meta.env.DEV) {
        console.warn('[TreatmentPlansSection] Treatment plans load failed:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitialTreatmentPlans() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const loadedPlans = await getPatientTreatmentPlans(patientId)

        if (isCurrent) {
          setPlans(loadedPlans)
          setLoadError(null)
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            getTreatmentPlanLoadErrorMessage(
              error instanceof Error ? error.message : null,
            ),
          )
        }

        if (import.meta.env.DEV) {
          console.warn(
            '[TreatmentPlansSection] Treatment plans load failed:',
            error,
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Treatment Plan</CardTitle>
              <Badge variant="neutral">Read-only</Badge>
            </div>
            <CardDescription>
              Clinical planning reference for existing treatment plans and
              planned items.
            </CardDescription>
          </div>
          <Badge variant="info">Planning reference</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5">
        {isPatientArchived ? (
          <InlineNotice variant="warning">
            This patient is archived. Treatment plan information is shown as a
            read-only reference.
          </InlineNotice>
        ) : null}

        {isLoading ? (
          <LoadingState label="Loading treatment plans..." />
        ) : loadError ? (
          <ErrorState
            action={
              <Button onClick={() => void loadTreatmentPlans()}>
                Try again
              </Button>
            }
            title="Failed to load treatment plans"
            description={loadError}
          />
        ) : sortedPlans.length === 0 ? (
          <EmptyState
            title="No treatment plan configured"
            description="Treatment plans and planned items will appear here once they are recorded for this patient."
          />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {sortedPlans.map((plan) => (
              <section
                className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                data-testid="patient-treatment-plan-detail"
                key={plan.id}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-950">
                        {plan.title}
                      </h3>
                      <Badge variant={statusBadgeVariants[plan.status]}>
                        {getPlanStatusLabel(plan.status)}
                      </Badge>
                      <Badge variant="neutral">Read-only</Badge>
                    </div>
                    {plan.description ? (
                      <p className="mt-2 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {plan.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Badge variant="neutral">
                      {getItemCountLabel(plan.items.length)}
                    </Badge>
                    <Badge variant={plan.proposedTotal !== null ? 'info' : 'neutral'}>
                      {formatCurrency(plan.proposedTotal)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricTile
                    label="Planned items"
                    value={String(plan.items.length)}
                    description="Existing treatment plan item count."
                    tone={plan.items.length > 0 ? 'success' : 'warning'}
                  />
                  <MetricTile
                    label="Proposed total"
                    value={formatCurrency(plan.proposedTotal)}
                    description="Recorded proposal amount."
                    tone={plan.proposedTotal !== null ? 'info' : 'default'}
                  />
                  <MetricTile
                    label="Created"
                    value={formatPatientDate(plan.createdAt)}
                    description="Plan record date."
                    tone="default"
                  />
                </div>

                <div className="mt-5">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-950">
                    Planned items
                    <Badge variant="neutral">Read-only list</Badge>
                  </div>
                  {plan.items.length === 0 ? (
                    <div className="mt-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                      Treatment plan exists but has no planned items.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2.5">
                      {plan.items.map((item) => (
                        <article
                          className="rounded-md border border-slate-200 bg-slate-50 p-3 sm:p-3.5"
                          key={item.id}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-950">
                                  {item.title}
                                </h4>
                                <Badge
                                  variant={statusBadgeVariants[item.status]}
                                >
                                  {getItemStatusLabel(item.status)}
                                </Badge>
                                {item.toothNumber ? (
                                  <Badge variant="neutral">
                                    Tooth {item.toothNumber}
                                  </Badge>
                                ) : null}
                                {item.serviceCode ? (
                                  <Badge variant="neutral">
                                    {item.serviceCode}
                                  </Badge>
                                ) : null}
                              </div>
                              {item.description ? (
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                  {item.description}
                                </p>
                              ) : (
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                  No item notes recorded.
                                </p>
                              )}
                            </div>
                            {item.estimatedPrice !== null ? (
                              <div className="text-sm font-semibold text-slate-700">
                                {formatCurrency(item.estimatedPrice)}
                              </div>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
