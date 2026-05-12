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
  archiveClinicalNote,
  clinicalNoteTypeOptions,
  createClinicalNote,
  getClinicalNotes,
  updateClinicalNote,
} from './clinicalNotesService'
import type {
  ClinicalNote,
  ClinicalNoteInput,
  ClinicalNoteType,
} from './clinicalNotesService'

type ClinicalNotesSectionProps = {
  patientId: string
  canManageNotes: boolean
  isPatientArchived: boolean
}

const emptyFormValues: ClinicalNoteInput = {
  noteType: 'general',
  content: '',
  toothNumber: '',
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatClinicalNoteDate(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

function getNoteTypeLabel(type: ClinicalNoteType) {
  return (
    clinicalNoteTypeOptions.find((option) => option.value === type)?.label ??
    'General'
  )
}

function getClinicalNoteErrorMessage(
  action: 'load' | 'save' | 'archive',
  serviceError: string | undefined,
) {
  const normalizedError = serviceError?.toLowerCase() ?? ''

  if (
    normalizedError.includes('permission') ||
    normalizedError.includes('row-level security') ||
    normalizedError.includes('not allowed')
  ) {
    return 'You do not have permission to edit clinical notes.'
  }

  if (action === 'load') {
    return 'Clinical notes could not be loaded.'
  }

  return action === 'archive'
    ? 'Clinical note could not be archived.'
    : 'Clinical note could not be saved.'
}

export function ClinicalNotesSection({
  patientId,
  canManageNotes,
  isPatientArchived,
}: ClinicalNotesSectionProps) {
  const [notes, setNotes] = useState<ClinicalNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formValues, setFormValues] =
    useState<ClinicalNoteInput>(emptyFormValues)
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const canShowActions = canManageNotes && !isPatientArchived

  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      ),
    [notes],
  )

  async function loadClinicalNotes(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    try {
      const loadedNotes = await getClinicalNotes(patientId)
      setNotes(loadedNotes)
      setLoadError(null)
    } catch (error) {
      setLoadError(getClinicalNoteErrorMessage('load', undefined))

      if (import.meta.env.DEV) {
        console.warn('[ClinicalNotesSection] Clinical notes load failed:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitialClinicalNotes() {
      try {
        const loadedNotes = await getClinicalNotes(patientId)

        if (isCurrent) {
          setNotes(loadedNotes)
          setLoadError(null)
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getClinicalNoteErrorMessage('load', undefined))
        }

        if (import.meta.env.DEV) {
          console.warn('[ClinicalNotesSection] Clinical notes load failed:', error)
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialClinicalNotes()

    return () => {
      isCurrent = false
    }
  }, [patientId])

  function openCreateForm() {
    setEditingNote(null)
    setFormValues(emptyFormValues)
    setSubmitError(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  function openEditForm(note: ClinicalNote) {
    setEditingNote(note)
    setFormValues({
      noteType: note.noteType,
      content: note.content,
      toothNumber: note.toothNumber,
    })
    setSubmitError(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    setEditingNote(null)
    setFormValues(emptyFormValues)
    setSubmitError(null)
    setIsFormOpen(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formValues.content.trim()) {
      setSubmitError('Clinical note content is required.')
      return
    }

    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = editingNote
      ? await updateClinicalNote(patientId, editingNote.id, formValues)
      : await createClinicalNote(patientId, formValues)

    setIsSubmitting(false)

    if (result.reason === 'demo_mode') {
      setSuccessMessage(result.message)
      closeForm()
      return
    }

    if (!result.ok) {
      setSubmitError(getClinicalNoteErrorMessage('save', result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn('[ClinicalNotesSection] Clinical note save failed:', result.error)
      }

      return
    }

    setSuccessMessage(
      result.message ?? 'Clinical note was saved successfully.',
    )
    closeForm()
    await loadClinicalNotes(false)
  }

  async function handleArchive(note: ClinicalNote) {
    const confirmed = window.confirm(
      'Archive this clinical note? It will be hidden from the active notes list.',
    )

    if (!confirmed) {
      return
    }

    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    const result = await archiveClinicalNote(patientId, note.id)

    setIsSubmitting(false)

    if (result.reason === 'demo_mode') {
      setSuccessMessage(result.message)
      return
    }

    if (!result.ok) {
      setSubmitError(getClinicalNoteErrorMessage('archive', result.error))

      if (import.meta.env.DEV && result.error) {
        console.warn(
          '[ClinicalNotesSection] Clinical note archive failed:',
          result.error,
        )
      }

      return
    }

    setSuccessMessage(
      result.message ?? 'Clinical note was archived successfully.',
    )
    await loadClinicalNotes(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Clinical notes</CardTitle>
            <CardDescription>
              Active clinical notes for this patient.
            </CardDescription>
          </div>
          {canShowActions ? (
            <Button onClick={openCreateForm}>Add clinical note</Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {isPatientArchived ? (
          <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
            This patient is archived. Restore the profile before editing
            clinical notes.
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

        {isFormOpen ? (
          <form
            className="mb-5 rounded-md border border-slate-200 bg-slate-50 p-4"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Type
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  value={formValues.noteType}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      noteType: event.target.value as ClinicalNoteType,
                    }))
                  }
                >
                  {clinicalNoteTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Tooth number
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  placeholder="Optional"
                  value={formValues.toothNumber}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      toothNumber: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
              Content
              <textarea
                className="min-h-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                value={formValues.content}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save clinical note'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={closeForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {isLoading ? (
          <LoadingState label="Loading clinical notes..." />
        ) : loadError ? (
          <ErrorState title="Clinical notes unavailable" description={loadError} />
        ) : sortedNotes.length === 0 ? (
          <EmptyState
            title="No active clinical notes"
            description="Clinical notes created in this section will appear here."
          />
        ) : (
          <div className="space-y-3">
            {sortedNotes.map((note) => (
              <div
                className="rounded-md border border-slate-200 bg-white p-4"
                key={note.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info">{getNoteTypeLabel(note.noteType)}</Badge>
                    {note.toothNumber ? (
                      <Badge variant="neutral">Tooth {note.toothNumber}</Badge>
                    ) : null}
                    <span className="text-xs font-medium text-slate-500">
                      {formatClinicalNoteDate(note.createdAt)}
                    </span>
                  </div>
                  {canShowActions ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => openEditForm(note)}
                        disabled={isSubmitting}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void handleArchive(note)}
                        disabled={isSubmitting}
                      >
                        Archive
                      </Button>
                    </div>
                  ) : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
