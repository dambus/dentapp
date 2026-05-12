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
  ErrorState,
  LoadingState,
} from '../../components/ui'
import { classNames } from '../../lib/classNames'
import {
  clearToothStatus,
  getPatientOdontogram,
  permanentToothQuadrants,
  saveToothStatus,
  toothStatusOptions,
} from './odontogramService'
import type {
  ToothStatus,
  ToothStatusInput,
  ToothStatusRecord,
} from './odontogramService'

type OdontogramSectionProps = {
  patientId: string
  canEditOdontogram: boolean
  isPatientArchived: boolean
}

const statusBadgeVariants: Record<
  ToothStatus,
  'success' | 'warning' | 'danger' | 'info' | 'neutral'
> = {
  unknown: 'neutral',
  healthy: 'success',
  missing: 'neutral',
  caries: 'danger',
  filled: 'info',
  crown: 'info',
  implant: 'info',
  root_treated: 'warning',
  extraction_planned: 'warning',
  watch: 'warning',
}

const statusTileClasses: Record<ToothStatus, string> = {
  unknown: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
  healthy: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300',
  missing: 'border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400',
  caries: 'border-red-200 bg-red-50 text-red-900 hover:border-red-300',
  filled: 'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300',
  crown: 'border-violet-200 bg-violet-50 text-violet-900 hover:border-violet-300',
  implant: 'border-teal-200 bg-teal-50 text-teal-900 hover:border-teal-300',
  root_treated: 'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300',
  extraction_planned:
    'border-orange-200 bg-orange-50 text-orange-900 hover:border-orange-300',
  watch:
    'border-yellow-200 bg-yellow-50 text-yellow-900 hover:border-yellow-300',
}

function getStatusLabel(status: ToothStatus) {
  return (
    toothStatusOptions.find((option) => option.value === status)?.label ??
    'Unknown'
  )
}

function getOdontogramErrorMessage(
  action: 'load' | 'save' | 'clear',
  serviceError: string | undefined,
) {
  const normalizedError = serviceError?.toLowerCase() ?? ''

  if (
    normalizedError.includes('permission') ||
    normalizedError.includes('row-level security') ||
    normalizedError.includes('not allowed')
  ) {
    return 'You do not have permission to edit the odontogram.'
  }

  if (action === 'load') {
    return 'Odontogram could not be loaded.'
  }

  return action === 'clear'
    ? 'Tooth status could not be cleared.'
    : 'Tooth status could not be saved.'
}

export function OdontogramSection({
  patientId,
  canEditOdontogram,
  isPatientArchived,
}: OdontogramSectionProps) {
  const [toothStatuses, setToothStatuses] = useState<ToothStatusRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedToothNumber, setSelectedToothNumber] = useState<string | null>(
    null,
  )
  const [formValues, setFormValues] = useState<ToothStatusInput>({
    toothNumber: '',
    status: 'unknown',
    note: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const canShowEditor = canEditOdontogram && !isPatientArchived

  const statusesByTooth = useMemo(() => {
    return new Map(
      toothStatuses.map((toothStatus) => [
        toothStatus.toothNumber,
        toothStatus,
      ]),
    )
  }, [toothStatuses])

  const selectedToothStatus = selectedToothNumber
    ? statusesByTooth.get(selectedToothNumber) ?? null
    : null

  async function loadOdontogram(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    try {
      const loadedToothStatuses = await getPatientOdontogram(patientId)
      setToothStatuses(loadedToothStatuses)
      setLoadError(null)
    } catch (error) {
      setLoadError(getOdontogramErrorMessage('load', undefined))

      if (import.meta.env.DEV) {
        console.warn('[OdontogramSection] Odontogram load failed:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitialOdontogram() {
      try {
        const loadedToothStatuses = await getPatientOdontogram(patientId)

        if (isCurrent) {
          setToothStatuses(loadedToothStatuses)
          setLoadError(null)
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getOdontogramErrorMessage('load', undefined))
        }

        if (import.meta.env.DEV) {
          console.warn('[OdontogramSection] Odontogram load failed:', error)
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialOdontogram()

    return () => {
      isCurrent = false
    }
  }, [patientId])

  function selectTooth(toothNumber: string) {
    if (!canShowEditor) {
      return
    }

    const existingStatus = statusesByTooth.get(toothNumber)

    setSelectedToothNumber(toothNumber)
    setFormValues({
      toothNumber,
      status: existingStatus?.status ?? 'unknown',
      note: existingStatus?.note ?? '',
    })
    setSubmitError(null)
    setSuccessMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedToothNumber) {
      setSubmitError('Select a tooth before saving.')
      return
    }

    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = await saveToothStatus(patientId, formValues)

    setIsSubmitting(false)

    if (result.reason === 'demo_mode') {
      setSuccessMessage(result.message)
      return
    }

    if (!result.ok) {
      setSubmitError(getOdontogramErrorMessage('save', result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn('[OdontogramSection] Tooth status save failed:', result.error)
      }

      return
    }

    setSuccessMessage(result.message ?? 'Tooth status was saved successfully.')
    await loadOdontogram(false)
  }

  async function handleClear() {
    if (!selectedToothNumber) {
      setSubmitError('Select a tooth before clearing.')
      return
    }

    const confirmed = window.confirm(
      `Clear saved status for tooth ${selectedToothNumber}?`,
    )

    if (!confirmed) {
      return
    }

    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = await clearToothStatus(patientId, selectedToothNumber)

    setIsSubmitting(false)

    if (result.reason === 'demo_mode') {
      setSuccessMessage(result.message)
      return
    }

    if (!result.ok) {
      setSubmitError(getOdontogramErrorMessage('clear', result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn(
          '[OdontogramSection] Tooth status clear failed:',
          result.error,
        )
      }

      return
    }

    setSuccessMessage(result.message ?? 'Tooth status was cleared successfully.')
    setFormValues((current) => ({
      ...current,
      status: 'unknown',
      note: '',
    }))
    await loadOdontogram(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Odontogram</CardTitle>
            <CardDescription>
              FDI permanent tooth status foundation.
            </CardDescription>
          </div>
          <Badge variant={canShowEditor ? 'info' : 'neutral'}>
            {canShowEditor ? 'Editable' : 'Read-only'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isPatientArchived ? (
          <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
            This patient is archived. Restore the profile before editing the
            odontogram.
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

        {isLoading ? (
          <LoadingState label="Loading odontogram..." />
        ) : loadError ? (
          <ErrorState title="Odontogram unavailable" description={loadError} />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              {permanentToothQuadrants.map((quadrant) => (
                <section key={quadrant.label}>
                  <div className="mb-2 text-sm font-semibold text-slate-950">
                    {quadrant.label}
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                    {quadrant.teeth.map((toothNumber) => {
                      const toothStatus = statusesByTooth.get(toothNumber)
                      const status = toothStatus?.status ?? 'unknown'
                      const hasNote = Boolean(toothStatus?.note)
                      const isSelected = selectedToothNumber === toothNumber
                      const content = (
                        <>
                          <span className="text-base font-semibold">
                            {toothNumber}
                          </span>
                          <span className="mt-1 text-xs font-medium">
                            {getStatusLabel(status)}
                          </span>
                          {hasNote ? (
                            <span className="mt-1 text-[11px] font-medium">
                              Note
                            </span>
                          ) : null}
                        </>
                      )

                      if (!canShowEditor) {
                        return (
                          <div
                            className={classNames(
                              'flex min-h-20 flex-col items-center justify-center rounded-md border px-2 py-2 text-center',
                              statusTileClasses[status],
                            )}
                            key={toothNumber}
                          >
                            {content}
                          </div>
                        )
                      }

                      return (
                        <button
                          className={classNames(
                            'flex min-h-20 flex-col items-center justify-center rounded-md border px-2 py-2 text-center transition-colors',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
                            statusTileClasses[status],
                            isSelected ? 'ring-2 ring-teal-700 ring-offset-2' : '',
                          )}
                          key={toothNumber}
                          onClick={() => selectTooth(toothNumber)}
                          type="button"
                        >
                          {content}
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              {canShowEditor ? (
                selectedToothNumber ? (
                  <form onSubmit={(event) => void handleSubmit(event)}>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-slate-950">
                        Tooth {selectedToothNumber}
                      </div>
                      <Badge
                        variant={
                          statusBadgeVariants[
                            selectedToothStatus?.status ?? 'unknown'
                          ]
                        }
                      >
                        {getStatusLabel(selectedToothStatus?.status ?? 'unknown')}
                      </Badge>
                    </div>

                    <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
                      Status
                      <select
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                        value={formValues.status}
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            status: event.target.value as ToothStatus,
                          }))
                        }
                      >
                        {toothStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
                      Note
                      <textarea
                        className="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                        placeholder="Optional"
                        value={formValues.note}
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            note: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save status'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSubmitting}
                        onClick={() => void handleClear()}
                      >
                        Clear
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm leading-6 text-slate-600">
                    Select a tooth to edit its MVP status and optional note.
                  </p>
                )
              ) : (
                <p className="text-sm leading-6 text-slate-600">
                  Odontogram editing is available to clinical roles only.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
