import { PencilLine, Plus } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'

import {
  ActionMenu,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  FieldError,
  FieldLabel,
  InlineNotice,
  LoadingState,
  RequiredMark,
  Select,
  Textarea,
  TextInput,
} from '../../components/ui'
import { formatPatientDate } from './patientDisplay'
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

type PlanFormProps = {
  initialValue: TreatmentPlanInput
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onCancel?: () => void
  onSubmit: (input: TreatmentPlanInput) => void
}

type ItemFormProps = {
  initialValue: TreatmentPlanItemInput
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onCancel?: () => void
  onSubmit: (input: TreatmentPlanItemInput) => void
}

const planStatusValues: TreatmentPlanStatus[] = [
  'draft',
  'accepted',
  'in_progress',
  'completed',
]

const itemStatusValues: TreatmentPlanItemStatus[] = [
  'planned',
  'in_progress',
  'completed',
  'skipped',
]

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

const emptyPlanInput: TreatmentPlanInput = {
  title: '',
  description: '',
  status: 'draft',
  proposedTotal: '',
}

const emptyItemInput: TreatmentPlanItemInput = {
  toothNumber: '',
  title: '',
  description: '',
  serviceCode: '',
  status: 'planned',
  estimatedPrice: '',
  sortOrder: '0',
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

function getWriteErrorMessage(error: string | undefined) {
  const normalizedError = error?.toLowerCase() ?? ''

  if (
    normalizedError.includes('permission') ||
    normalizedError.includes('row-level security') ||
    normalizedError.includes('not allowed')
  ) {
    return 'You do not have permission to update this treatment plan.'
  }

  if (normalizedError.includes('archived')) {
    return 'This treatment plan record is archived and can no longer be edited.'
  }

  return error ?? 'Treatment plan could not be saved.'
}

function getItemCountLabel(count: number) {
  return `${count} planned item${count === 1 ? '' : 's'}`
}

function getVisiblePlanBadgeLabel(count: number) {
  return count === 1 ? '1 active plan' : `${count} active plans`
}

function getItemOrderLabel(sortOrder: number) {
  return `#${sortOrder + 1}`
}

function getPlanInput(plan: TreatmentPlan): TreatmentPlanInput {
  return {
    title: plan.title,
    description: plan.description,
    status: planStatusValues.includes(plan.status) ? plan.status : 'draft',
    proposedTotal: '',
  }
}

function getItemInput(item: TreatmentPlanItem): TreatmentPlanItemInput {
  return {
    toothNumber: item.toothNumber,
    title: item.title,
    description: item.description,
    serviceCode: '',
    status: itemStatusValues.includes(item.status) ? item.status : 'planned',
    estimatedPrice: '',
    sortOrder: String(item.sortOrder),
  }
}

function getNewItemInput(plan: TreatmentPlan): TreatmentPlanItemInput {
  return {
    ...emptyItemInput,
    sortOrder: String(plan.items.length),
  }
}

function validatePlanForm(input: TreatmentPlanInput) {
  return input.title.trim() ? null : 'Treatment plan title is required.'
}

function validateItemForm(input: TreatmentPlanItemInput) {
  return input.title.trim() ? null : 'Planned item title is required.'
}

function PlanForm({
  initialValue,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
}: PlanFormProps) {
  const [input, setInput] = useState<TreatmentPlanInput>(initialValue)
  const [validationError, setValidationError] = useState<string | null>(null)

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const error = validatePlanForm(input)
    setValidationError(error)

    if (!error) {
      onSubmit({ ...input, proposedTotal: '' })
    }
  }

  return (
    <form
      className="rounded-md border border-slate-200 bg-slate-50 p-4"
      data-testid={
        mode === 'create' ? 'treatment-plan-create-form' : 'treatment-plan-edit-form'
      }
      onSubmit={submitForm}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <label>
          <FieldLabel>
            Title
            <RequiredMark />
          </FieldLabel>
          <TextInput
            data-testid="treatment-plan-title-input"
            disabled={isSubmitting}
            hasError={Boolean(validationError)}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            value={input.title}
          />
          <FieldError message={validationError} />
        </label>
        <label>
          <FieldLabel>Status</FieldLabel>
          <Select
            data-testid="treatment-plan-status-select"
            disabled={isSubmitting}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                status: event.target.value as TreatmentPlanStatus,
              }))
            }
            value={input.status}
          >
            {planStatusValues.map((status) => (
              <option key={status} value={status}>
                {getPlanStatusLabel(status)}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <label className="mt-4 block">
        <FieldLabel>Clinical objective / notes</FieldLabel>
        <Textarea
          data-testid="treatment-plan-description-input"
          disabled={isSubmitting}
          onChange={(event) =>
            setInput((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          value={input.description}
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting
            ? 'Saving...'
            : mode === 'create'
              ? 'Create treatment plan'
              : 'Save plan'}
        </Button>
        {onCancel ? (
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}

function ItemForm({
  initialValue,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
}: ItemFormProps) {
  const [input, setInput] = useState<TreatmentPlanItemInput>(initialValue)
  const [validationError, setValidationError] = useState<string | null>(null)

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const error = validateItemForm(input)
    setValidationError(error)

    if (!error) {
      onSubmit({
        ...input,
        serviceCode: '',
        estimatedPrice: '',
      })
    }
  }

  return (
    <form
      className="rounded-md border border-slate-200 bg-white p-4"
      data-testid={
        mode === 'create'
          ? 'treatment-plan-item-create-form'
          : 'treatment-plan-item-edit-form'
      }
      onSubmit={submitForm}
    >
      <div className="grid gap-4 lg:grid-cols-[160px_1fr_220px]">
        <label>
          <FieldLabel>Tooth / region</FieldLabel>
          <TextInput
            data-testid="treatment-plan-item-tooth-input"
            disabled={isSubmitting}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                toothNumber: event.target.value,
              }))
            }
            value={input.toothNumber}
          />
        </label>
        <label>
          <FieldLabel>
            Planned treatment
            <RequiredMark />
          </FieldLabel>
          <TextInput
            data-testid="treatment-plan-item-title-input"
            disabled={isSubmitting}
            hasError={Boolean(validationError)}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            value={input.title}
          />
          <FieldError message={validationError} />
        </label>
        <label>
          <FieldLabel>Status</FieldLabel>
          <Select
            data-testid="treatment-plan-item-status-select"
            disabled={isSubmitting}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                status: event.target.value as TreatmentPlanItemStatus,
              }))
            }
            value={input.status}
          >
            {itemStatusValues.map((status) => (
              <option key={status} value={status}>
                {getItemStatusLabel(status)}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <label className="mt-4 block">
        <FieldLabel>Clinical notes</FieldLabel>
        <Textarea
          data-testid="treatment-plan-item-description-input"
          disabled={isSubmitting}
          onChange={(event) =>
            setInput((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          value={input.description}
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting
            ? 'Saving...'
            : mode === 'create'
              ? 'Add item'
              : 'Save item'}
        </Button>
        {onCancel ? (
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}

export function TreatmentPlansSection({
  patientId,
  canManageTreatmentPlans,
  isPatientArchived,
}: TreatmentPlansSectionProps) {
  const [plans, setPlans] = useState<TreatmentPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [writeMessage, setWriteMessage] = useState<string | null>(null)
  const [writeError, setWriteError] = useState<string | null>(null)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [addingItemPlanId, setAddingItemPlanId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const canMutate = canManageTreatmentPlans && !isPatientArchived

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

  async function runWrite(
    action: () => Promise<{
      ok: boolean
      message: string | null
      error?: string
      plan?: TreatmentPlan
      item?: TreatmentPlanItem
    }>,
  ) {
    setIsSubmitting(true)
    setWriteError(null)
    setWriteMessage(null)

    const result = await action()

    setIsSubmitting(false)

    if (!result.ok) {
      setWriteError(getWriteErrorMessage(result.error))
      return
    }

    setWriteMessage(result.message ?? 'Treatment plan was updated.')
    const savedPlan = result.plan
    const savedItem = result.item

    if (savedPlan) {
      setPlans((currentPlans) => {
        if (savedPlan.deletedAt) {
          return currentPlans.filter((plan) => plan.id !== savedPlan.id)
        }

        const existingPlan = currentPlans.find(
          (plan) => plan.id === savedPlan.id,
        )
        const nextPlan = {
          ...savedPlan,
          items:
            savedPlan.items.length > 0
              ? savedPlan.items
              : existingPlan?.items ?? [],
        }
        const planExists = currentPlans.some((plan) => plan.id === nextPlan.id)

        return planExists
          ? currentPlans.map((plan) =>
              plan.id === nextPlan.id ? nextPlan : plan,
            )
          : [nextPlan, ...currentPlans]
      })
    }

    if (savedItem) {
      setPlans((currentPlans) =>
        currentPlans.map((plan) => {
          if (plan.id !== savedItem.treatmentPlanId) {
            return plan
          }

          const existingItems = savedItem.deletedAt
            ? plan.items.filter((item) => item.id !== savedItem.id)
            : plan.items.some((item) => item.id === savedItem.id)
              ? plan.items.map((item) =>
                  item.id === savedItem.id ? savedItem : item,
                )
              : [...plan.items, savedItem]

          return {
            ...plan,
            items: [...existingItems].sort(
              (left, right) => left.sortOrder - right.sortOrder,
            ),
          }
        }),
      )
    }

    setIsCreatingPlan(false)
    setEditingPlanId(null)
    setAddingItemPlanId(null)
    setEditingItemId(null)
  }

  async function handleCreatePlan(input: TreatmentPlanInput) {
    await runWrite(() => createTreatmentPlan(patientId, input))
  }

  async function handleUpdatePlan(plan: TreatmentPlan, input: TreatmentPlanInput) {
    await runWrite(() => updateTreatmentPlan(patientId, plan.id, input))
  }

  async function handleArchivePlan(plan: TreatmentPlan) {
    if (!window.confirm(`Archive treatment plan "${plan.title}"?`)) {
      return
    }

    await runWrite(() => archiveTreatmentPlan(patientId, plan.id))
  }

  async function handleCreateItem(plan: TreatmentPlan, input: TreatmentPlanItemInput) {
    await runWrite(() => createTreatmentPlanItem(patientId, plan.id, input))
  }

  async function handleUpdateItem(
    plan: TreatmentPlan,
    item: TreatmentPlanItem,
    input: TreatmentPlanItemInput,
  ) {
    await runWrite(() =>
      updateTreatmentPlanItem(patientId, plan.id, item.id, input),
    )
  }

  async function handleArchiveItem(plan: TreatmentPlan, item: TreatmentPlanItem) {
    if (!window.confirm(`Archive planned item "${item.title}"?`)) {
      return
    }

    await runWrite(() => archiveTreatmentPlanItem(patientId, plan.id, item.id))
  }

  const currentPlan = sortedPlans[0] ?? null
  const showPrimaryAction =
    canMutate &&
    !isCreatingPlan &&
    !editingPlanId &&
    !addingItemPlanId &&
    !editingItemId
  const showCreatePlanAction = showPrimaryAction && currentPlan === null
  const showAddTreatmentAction = showPrimaryAction && currentPlan !== null

  return (
    <Card data-testid="patient-treatment-plan-workspace">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Treatment Plan</CardTitle>
              <Badge variant={canMutate ? 'success' : 'neutral'}>
                {canMutate ? 'Editable' : 'Read-only'}
              </Badge>
              <Badge variant="neutral">
                {getVisiblePlanBadgeLabel(sortedPlans.length)}
              </Badge>
            </div>
            <CardDescription className="max-w-3xl">
              Patient-scoped clinical planning records and planned treatments.
              Use the newest plan first, then open item-level actions only where
              the plan actually needs to change.
            </CardDescription>
          </div>
          {showCreatePlanAction ? (
            <Button
              data-testid="treatment-plan-create-action"
              onClick={() => {
                setIsCreatingPlan(true)
                setEditingPlanId(null)
                setAddingItemPlanId(null)
                setEditingItemId(null)
              }}
              size="sm"
            >
              Create treatment plan
            </Button>
          ) : showAddTreatmentAction ? (
            <Button
              data-testid="treatment-plan-item-add-action"
              onClick={() => {
                setAddingItemPlanId(currentPlan.id)
                setEditingPlanId(null)
                setEditingItemId(null)
                setIsCreatingPlan(false)
              }}
              size="sm"
            >
              <Plus aria-hidden className="h-4 w-4" />
              Add treatment
            </Button>
          ) : (
            <Badge variant="info">Planning workspace</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5">
        {isPatientArchived ? (
          <InlineNotice variant="warning">
            This patient is archived. Treatment plan information is shown as a
            read-only reference.
          </InlineNotice>
        ) : null}
        {writeMessage ? (
          <InlineNotice variant="success">{writeMessage}</InlineNotice>
        ) : null}
        {writeError ? (
          <InlineNotice variant="danger">{writeError}</InlineNotice>
        ) : null}

        {isCreatingPlan && canMutate ? (
          <PlanForm
            initialValue={emptyPlanInput}
            isSubmitting={isSubmitting}
            mode="create"
            onCancel={() => setIsCreatingPlan(false)}
            onSubmit={handleCreatePlan}
          />
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
            description={
              canMutate
                ? 'Create a clinical treatment plan when planned care is agreed for this patient.'
                : 'Treatment plans and planned items will appear here once they are recorded for this patient.'
            }
            action={
              canMutate ? (
                <Button
                  data-testid="treatment-plan-empty-create-action"
                  onClick={() => setIsCreatingPlan(true)}
                >
                  Create treatment plan
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {sortedPlans.map((plan, planIndex) => (
              <article
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                data-testid="patient-treatment-plan-detail"
                key={plan.id}
              >
                {editingPlanId === plan.id && canMutate ? (
                  <PlanForm
                    initialValue={getPlanInput(plan)}
                    isSubmitting={isSubmitting}
                    mode="edit"
                    onCancel={() => setEditingPlanId(null)}
                    onSubmit={(input) => void handleUpdatePlan(plan, input)}
                  />
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="info">
                            {planIndex === 0 ? 'Current plan' : 'Plan record'}
                          </Badge>
                          <Badge variant={statusBadgeVariants[plan.status]}>
                            {getPlanStatusLabel(plan.status)}
                          </Badge>
                          <Badge variant="neutral">
                            {getItemCountLabel(plan.items.length)}
                          </Badge>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                          {plan.title}
                        </h3>
                        {plan.description ? (
                          <p className="mt-2 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {plan.description}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            No clinical objective recorded.
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                          <span>Created {formatPatientDate(plan.createdAt)}</span>
                          <span>{getItemCountLabel(plan.items.length)}</span>
                        </div>
                      </div>
                      {canMutate ? (
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:justify-end">
                          <Button
                            data-testid="treatment-plan-edit-action"
                            onClick={() => {
                              setEditingPlanId(plan.id)
                              setIsCreatingPlan(false)
                              setAddingItemPlanId(null)
                              setEditingItemId(null)
                            }}
                            size="sm"
                            variant="tertiary"
                          >
                            <PencilLine aria-hidden className="h-4 w-4" />
                            Edit plan
                          </Button>
                          <ActionMenu
                            items={[
                              {
                                label: 'Archive plan',
                                onSelect: () => void handleArchivePlan(plan),
                                tone: 'danger',
                              },
                            ]}
                            label="Treatment plan actions"
                            menuClassName="w-48"
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-950">
                            Planned treatments
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Compact clinical list for the current plan. Item
                            actions apply only to the row where they appear.
                          </p>
                        </div>
                        <Badge variant="neutral">
                          {getItemCountLabel(plan.items.length)}
                        </Badge>
                      </div>

                      {addingItemPlanId === plan.id && canMutate ? (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <Badge variant="info">New planned treatment</Badge>
                            <span className="text-sm text-slate-600">
                              Add a clinically scoped treatment row to this plan.
                            </span>
                          </div>
                          <ItemForm
                            initialValue={getNewItemInput(plan)}
                            isSubmitting={isSubmitting}
                            mode="create"
                            onCancel={() => setAddingItemPlanId(null)}
                            onSubmit={(input) => void handleCreateItem(plan, input)}
                          />
                        </div>
                      ) : null}

                      {plan.items.length === 0 ? (
                        <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                          Treatment plan exists but has no planned items.
                        </div>
                      ) : (
                        <ol
                          className="mt-4 space-y-3"
                          data-testid="patient-treatment-plan-item-list"
                        >
                          {plan.items.map((item) => (
                            <li
                              className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                              data-testid="treatment-plan-item-row"
                              key={item.id}
                            >
                              {editingItemId === item.id && canMutate ? (
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                                  <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <Badge variant="info">Edit treatment row</Badge>
                                    <span className="text-sm text-slate-600">
                                      Update only this planned treatment item.
                                    </span>
                                  </div>
                                  <ItemForm
                                    initialValue={getItemInput(item)}
                                    isSubmitting={isSubmitting}
                                    mode="edit"
                                    onCancel={() => setEditingItemId(null)}
                                    onSubmit={(input) =>
                                      void handleUpdateItem(plan, item, input)
                                    }
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {getItemOrderLabel(item.sortOrder)}
                                      </span>
                                      <h4 className="text-sm font-semibold text-slate-950 sm:text-base">
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
                                  {canMutate ? (
                                    <div className="flex shrink-0 flex-wrap items-center gap-1 sm:gap-2">
                                      <Button
                                        data-testid="treatment-plan-item-edit-action"
                                        onClick={() => {
                                          setEditingItemId(item.id)
                                          setAddingItemPlanId(null)
                                          setEditingPlanId(null)
                                          setIsCreatingPlan(false)
                                        }}
                                        size="sm"
                                        variant="tertiary"
                                      >
                                        <PencilLine aria-hidden className="h-4 w-4" />
                                        Edit item
                                      </Button>
                                      <ActionMenu
                                        items={[
                                          {
                                            label: 'Archive item',
                                            onSelect: () =>
                                              void handleArchiveItem(plan, item),
                                            tone: 'danger',
                                          },
                                        ]}
                                        label="Treatment item actions"
                                        menuClassName="w-44"
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
