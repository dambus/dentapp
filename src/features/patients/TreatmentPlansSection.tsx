import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

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
  LoadingState,
} from '../../components/ui'
import {
  archiveTreatmentPlan,
  archiveTreatmentPlanItem,
  createTreatmentPlan,
  createTreatmentPlanItem,
  getPatientTreatmentPlans,
  treatmentPlanItemStatusOptions,
  treatmentPlanStatusOptions,
  updateTreatmentPlan,
  updateTreatmentPlanItem,
} from './treatmentPlanService'
import type {
  TreatmentPlan,
  TreatmentPlanInput,
  TreatmentPlanItem,
  TreatmentPlanItemInput,
  TreatmentPlanItemStatus,
  TreatmentPlanStatus,
} from './treatmentPlanService'

type TreatmentPlansSectionProps = {
  patientId: string
  canManageTreatmentPlans: boolean
  isPatientArchived: boolean
}

const emptyPlanFormValues: TreatmentPlanInput = {
  title: '',
  description: '',
  status: 'draft',
  proposedTotal: '',
}

const emptyItemFormValues: TreatmentPlanItemInput = {
  toothNumber: '',
  title: '',
  description: '',
  serviceCode: '',
  status: 'planned',
  estimatedPrice: '',
  sortOrder: '0',
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
  return value === null ? 'No total' : currencyFormatter.format(value)
}

function getPlanStatusLabel(status: TreatmentPlanStatus) {
  return (
    treatmentPlanStatusOptions.find((option) => option.value === status)?.label ??
    'Draft'
  )
}

function getItemStatusLabel(status: TreatmentPlanItemStatus) {
  return (
    treatmentPlanItemStatusOptions.find((option) => option.value === status)
      ?.label ?? 'Planned'
  )
}

function getTreatmentPlanErrorMessage(
  action: 'load' | 'planSave' | 'planArchive' | 'itemSave' | 'itemArchive',
  serviceError: string | undefined,
) {
  const normalizedError = serviceError?.toLowerCase() ?? ''

  if (
    normalizedError.includes('permission') ||
    normalizedError.includes('row-level security') ||
    normalizedError.includes('not allowed')
  ) {
    return 'You do not have permission to edit treatment plans.'
  }

  if (action === 'load') {
    return 'Treatment plans could not be loaded.'
  }

  if (action === 'itemSave') {
    return 'Treatment plan item could not be saved.'
  }

  if (action === 'itemArchive') {
    return 'Treatment plan item could not be archived.'
  }

  if (action === 'planArchive') {
    return 'Treatment plan could not be archived.'
  }

  return 'Treatment plan could not be saved.'
}

export function TreatmentPlansSection({
  patientId,
  canManageTreatmentPlans,
  isPatientArchived,
}: TreatmentPlansSectionProps) {
  const [plans, setPlans] = useState<TreatmentPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null)
  const [planFormValues, setPlanFormValues] =
    useState<TreatmentPlanInput>(emptyPlanFormValues)
  const [itemFormPlanId, setItemFormPlanId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<TreatmentPlanItem | null>(null)
  const [itemFormValues, setItemFormValues] =
    useState<TreatmentPlanItemInput>(emptyItemFormValues)

  const canShowActions = canManageTreatmentPlans && !isPatientArchived
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
      setLoadError(getTreatmentPlanErrorMessage('load', undefined))

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
      try {
        const loadedPlans = await getPatientTreatmentPlans(patientId)

        if (isCurrent) {
          setPlans(loadedPlans)
          setLoadError(null)
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getTreatmentPlanErrorMessage('load', undefined))
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

  function openCreatePlanForm() {
    setEditingPlan(null)
    setPlanFormValues(emptyPlanFormValues)
    setSubmitError(null)
    setSuccessMessage(null)
    setIsPlanFormOpen(true)
  }

  function openEditPlanForm(plan: TreatmentPlan) {
    setEditingPlan(plan)
    setPlanFormValues({
      title: plan.title,
      description: plan.description,
      status: plan.status,
      proposedTotal: plan.proposedTotal?.toString() ?? '',
    })
    setSubmitError(null)
    setSuccessMessage(null)
    setIsPlanFormOpen(true)
  }

  function closePlanForm() {
    setEditingPlan(null)
    setPlanFormValues(emptyPlanFormValues)
    setIsPlanFormOpen(false)
  }

  function openCreateItemForm(plan: TreatmentPlan) {
    setItemFormPlanId(plan.id)
    setEditingItem(null)
    setItemFormValues({
      ...emptyItemFormValues,
      sortOrder: plan.items.length.toString(),
    })
    setSubmitError(null)
    setSuccessMessage(null)
  }

  function openEditItemForm(planId: string, item: TreatmentPlanItem) {
    setItemFormPlanId(planId)
    setEditingItem(item)
    setItemFormValues({
      toothNumber: item.toothNumber,
      title: item.title,
      description: item.description,
      serviceCode: item.serviceCode,
      status: item.status,
      estimatedPrice: item.estimatedPrice?.toString() ?? '',
      sortOrder: item.sortOrder.toString(),
    })
    setSubmitError(null)
    setSuccessMessage(null)
  }

  function closeItemForm() {
    setItemFormPlanId(null)
    setEditingItem(null)
    setItemFormValues(emptyItemFormValues)
  }

  async function handlePlanSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!planFormValues.title.trim()) {
      setSubmitError('Treatment plan title is required.')
      return
    }

    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = editingPlan
      ? await updateTreatmentPlan(patientId, editingPlan.id, planFormValues)
      : await createTreatmentPlan(patientId, planFormValues)

    setIsSubmitting(false)

    if (result.reason === 'demo_mode') {
      setSuccessMessage(result.message)
      closePlanForm()
      return
    }

    if (!result.ok) {
      setSubmitError(getTreatmentPlanErrorMessage('planSave', result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn(
          '[TreatmentPlansSection] Treatment plan save failed:',
          result.error,
        )
      }

      return
    }

    setSuccessMessage(result.message ?? 'Treatment plan was saved successfully.')
    closePlanForm()
    await loadTreatmentPlans(false)
  }

  async function handlePlanArchive(plan: TreatmentPlan) {
    const confirmed = window.confirm(
      `Archive treatment plan "${plan.title}"? It will be hidden from the active list.`,
    )

    if (!confirmed) {
      return
    }

    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = await archiveTreatmentPlan(patientId, plan.id)

    setIsSubmitting(false)

    if (result.reason === 'demo_mode') {
      setSuccessMessage(result.message)
      return
    }

    if (!result.ok) {
      setSubmitError(getTreatmentPlanErrorMessage('planArchive', result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn(
          '[TreatmentPlansSection] Treatment plan archive failed:',
          result.error,
        )
      }

      return
    }

    setSuccessMessage(
      result.message ?? 'Treatment plan was archived successfully.',
    )
    await loadTreatmentPlans(false)
  }

  async function handleItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!itemFormPlanId) {
      setSubmitError('Select a treatment plan before saving an item.')
      return
    }

    if (!itemFormValues.title.trim()) {
      setSubmitError('Treatment plan item title is required.')
      return
    }

    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = editingItem
      ? await updateTreatmentPlanItem(
          patientId,
          itemFormPlanId,
          editingItem.id,
          itemFormValues,
        )
      : await createTreatmentPlanItem(patientId, itemFormPlanId, itemFormValues)

    setIsSubmitting(false)

    if (result.reason === 'demo_mode') {
      setSuccessMessage(result.message)
      closeItemForm()
      return
    }

    if (!result.ok) {
      setSubmitError(getTreatmentPlanErrorMessage('itemSave', result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn(
          '[TreatmentPlansSection] Treatment plan item save failed:',
          result.error,
        )
      }

      return
    }

    setSuccessMessage(
      result.message ?? 'Treatment plan item was saved successfully.',
    )
    closeItemForm()
    await loadTreatmentPlans(false)
  }

  async function handleItemArchive(planId: string, item: TreatmentPlanItem) {
    const confirmed = window.confirm(
      `Archive treatment item "${item.title}"? It will be hidden from the active item list.`,
    )

    if (!confirmed) {
      return
    }

    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = await archiveTreatmentPlanItem(patientId, planId, item.id)

    setIsSubmitting(false)

    if (result.reason === 'demo_mode') {
      setSuccessMessage(result.message)
      return
    }

    if (!result.ok) {
      setSubmitError(getTreatmentPlanErrorMessage('itemArchive', result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn(
          '[TreatmentPlansSection] Treatment plan item archive failed:',
          result.error,
        )
      }

      return
    }

    setSuccessMessage(
      result.message ?? 'Treatment plan item was archived successfully.',
    )
    await loadTreatmentPlans(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Treatment plans</CardTitle>
            <CardDescription>
              MVP patient treatment plans and planned items.
            </CardDescription>
          </div>
          {canShowActions ? (
            <Button onClick={openCreatePlanForm}>Create treatment plan</Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {isPatientArchived ? (
          <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
            This patient is archived. Restore the profile before editing
            treatment plans.
          </p>
        ) : null}

        {successMessage ? (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
            {successMessage}
          </p>
        ) : null}

        {submitError ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
            {submitError}
          </p>
        ) : null}

        {isPlanFormOpen ? (
          <form
            className="mb-5 rounded-md border border-slate-200 bg-slate-50 p-4"
            onSubmit={(event) => void handlePlanSubmit(event)}
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Title
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  value={planFormValues.title}
                  onChange={(event) =>
                    setPlanFormValues((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Status
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  value={planFormValues.status}
                  onChange={(event) =>
                    setPlanFormValues((current) => ({
                      ...current,
                      status: event.target.value as TreatmentPlanStatus,
                    }))
                  }
                >
                  {treatmentPlanStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Proposed total
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  min="0"
                  type="number"
                  value={planFormValues.proposedTotal}
                  onChange={(event) =>
                    setPlanFormValues((current) => ({
                      ...current,
                      proposedTotal: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
              Description
              <textarea
                className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                value={planFormValues.description}
                onChange={(event) =>
                  setPlanFormValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save treatment plan'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={closePlanForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {isLoading ? (
          <LoadingState label="Loading treatment plans..." />
        ) : loadError ? (
          <ErrorState
            title="Treatment plans unavailable"
            description={loadError}
          />
        ) : sortedPlans.length === 0 ? (
          <EmptyState
            title="No active treatment plans"
            description="Treatment plans created in this section will appear here."
          />
        ) : (
          <div className="space-y-4">
            {sortedPlans.map((plan) => (
              <section
                className="rounded-md border border-slate-200 bg-white p-4"
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
                      <Badge variant="neutral">
                        {plan.items.length} item{plan.items.length === 1 ? '' : 's'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {formatCurrency(plan.proposedTotal)}
                    </p>
                    {plan.description ? (
                      <p className="mt-2 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {plan.description}
                      </p>
                    ) : null}
                  </div>
                  {canShowActions ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => openEditPlanForm(plan)}
                        disabled={isSubmitting}
                      >
                        Edit plan
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => openCreateItemForm(plan)}
                        disabled={isSubmitting}
                      >
                        Add item
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void handlePlanArchive(plan)}
                        disabled={isSubmitting}
                      >
                        Archive plan
                      </Button>
                    </div>
                  ) : null}
                </div>

                {itemFormPlanId === plan.id ? (
                  <form
                    className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4"
                    onSubmit={(event) => void handleItemSubmit(event)}
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_120px_150px_150px]">
                      <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Item title
                        <input
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                          value={itemFormValues.title}
                          onChange={(event) =>
                            setItemFormValues((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Tooth
                        <input
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                          placeholder="Optional"
                          value={itemFormValues.toothNumber}
                          onChange={(event) =>
                            setItemFormValues((current) => ({
                              ...current,
                              toothNumber: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Status
                        <select
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                          value={itemFormValues.status}
                          onChange={(event) =>
                            setItemFormValues((current) => ({
                              ...current,
                              status: event.target.value as TreatmentPlanItemStatus,
                            }))
                          }
                        >
                          {treatmentPlanItemStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Price
                        <input
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                          min="0"
                          type="number"
                          value={itemFormValues.estimatedPrice}
                          onChange={(event) =>
                            setItemFormValues((current) => ({
                              ...current,
                              estimatedPrice: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr]">
                      <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Service code
                        <input
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                          placeholder="Optional"
                          value={itemFormValues.serviceCode}
                          onChange={(event) =>
                            setItemFormValues((current) => ({
                              ...current,
                              serviceCode: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Sort order
                        <input
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                          type="number"
                          value={itemFormValues.sortOrder}
                          onChange={(event) =>
                            setItemFormValues((current) => ({
                              ...current,
                              sortOrder: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
                      Description
                      <textarea
                        className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                        value={itemFormValues.description}
                        onChange={(event) =>
                          setItemFormValues((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save item'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={closeItemForm}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : null}

                {plan.items.length === 0 ? (
                  <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    No active treatment plan items.
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {plan.items.map((item) => (
                      <div
                        className="rounded-md border border-slate-200 bg-slate-50 p-3"
                        key={item.id}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-semibold text-slate-950">
                                {item.title}
                              </div>
                              <Badge variant={statusBadgeVariants[item.status]}>
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
                            <p className="mt-2 text-sm font-medium text-slate-700">
                              {formatCurrency(item.estimatedPrice)}
                            </p>
                            {item.description ? (
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                          {canShowActions ? (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => openEditItemForm(plan.id, item)}
                                disabled={isSubmitting}
                              >
                                Edit item
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  void handleItemArchive(plan.id, item)
                                }
                                disabled={isSubmitting}
                              >
                                Archive item
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
