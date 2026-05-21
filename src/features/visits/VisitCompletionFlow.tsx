import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FieldLabel,
  InlineNotice,
  MetricTile,
  Select,
  Textarea,
  TextInput,
} from '../../components/ui'
import { classNames } from '../../lib/classNames'
import {
  appointmentStatusBadgeVariants,
  appointmentStatusLabels,
  formatAppointmentTimeRange,
} from '../appointments/appointmentDisplay'
import type { Appointment } from '../appointments/appointmentService'
import { getAssignedProviderDisplayName } from '../appointments/appointmentService'
import {
  formatPatientDate,
  formatPatientDateTime,
  getPatientAge,
  getPatientFullName,
  patientStatusBadgeVariants,
  patientStatusLabels,
} from '../patients/patientDisplay'
import type { DemoPatient } from '../patients/types'
import { VisitCompletionSummary } from './VisitCompletionSummary'
import {
  completeVisit,
  fetchLatestOpenVisitCompletion,
  saveVisitCompletionDraft,
  type VisitCompletionDraft,
  type VisitCompletionServiceWarning,
  type VisitNextStep,
} from './visitCompletionService'

type VisitCompletionFlowProps = {
  appointmentContext?: Appointment | null
  appointmentId?: string | null
  onBackToAppointment?: () => void
  patient: DemoPatient
  onBackToPatient?: () => void
  onBackToSchedule?: () => void
}

type ProcedureRow = {
  id: string
  name: string
  toothOrRegion: string
  quantityOrDuration: string
  note: string
}

type CompletionState = 'editing' | 'confirming' | 'completed'

type WorkflowStep = {
  id: string
  label: string
  title: string
  description: string
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 'planned',
    label: 'Plan',
    title: 'Review today',
    description: 'Confirm who this is and what was planned before documenting.',
  },
  {
    id: 'procedures',
    label: 'Done',
    title: 'What was done?',
    description: 'Enter the performed work only if there was a procedure.',
  },
  {
    id: 'notes',
    label: 'Notes',
    title: 'What should be recorded?',
    description: 'Capture the clinical note and any patient instruction.',
  },
  {
    id: 'next-step',
    label: 'Next',
    title: 'What happens next?',
    description: 'Choose one safe next step for this patient.',
  },
  {
    id: 'review',
    label: 'Review',
    title: 'Review and complete',
    description: 'Check readiness before confirming completion.',
  },
]

const nextStepOptions = [
  { value: '', label: 'Select next step' },
  { value: 'no_follow_up', label: 'No follow-up needed' },
  { value: 'follow_up_recommended', label: 'Follow-up recommended' },
  { value: 'schedule_control_visit', label: 'Schedule control visit' },
  { value: 'continue_treatment_plan', label: 'Continue treatment plan' },
  { value: 'additional_diagnostics', label: 'Additional diagnostics' },
  { value: 'referral', label: 'Referral / specialist consultation' },
]

function createProcedureRow(): ProcedureRow {
  return {
    id: crypto.randomUUID(),
    name: '',
    toothOrRegion: '',
    quantityOrDuration: '',
    note: '',
  }
}

function getCompletedProcedureCount(procedures: ProcedureRow[]) {
  return procedures.filter((procedure) => procedure.name.trim()).length
}

function getIncompleteProcedureCount(procedures: ProcedureRow[]) {
  return procedures.filter(
    (procedure) =>
      !procedure.name.trim() &&
      (procedure.toothOrRegion.trim() ||
        procedure.quantityOrDuration.trim() ||
        procedure.note.trim()),
  ).length
}

function getNextStepLabel(value: string) {
  return (
    nextStepOptions.find((option) => option.value === value)?.label ??
    'Not selected'
  )
}

function getUserFriendlyServiceError(
  message: string | null | undefined,
  fallback: string,
) {
  if (!message?.trim()) {
    return fallback
  }

  if (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('network')
  ) {
    return 'The visit could not be saved because the connection failed. Check the local Supabase service and try again.'
  }

  if (message.includes('Active profile context')) {
    return 'Your session is signed in, but no active clinical profile is available. Sign in again or switch to an active clinical user.'
  }

  return message
}

export function VisitCompletionFlow({
  appointmentContext,
  appointmentId,
  onBackToAppointment,
  patient,
  onBackToPatient,
  onBackToSchedule,
}: VisitCompletionFlowProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [visitId, setVisitId] = useState<string | undefined>()
  const [linkedAppointmentId, setLinkedAppointmentId] = useState<
    string | null
  >(appointmentId ?? null)
  const [procedures, setProcedures] = useState<ProcedureRow[]>([
    createProcedureRow(),
  ])
  const [clinicalNote, setClinicalNote] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [completionState, setCompletionState] =
    useState<CompletionState>('editing')
  const [attemptedCompletion, setAttemptedCompletion] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(true)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [draftReloadMessage, setDraftReloadMessage] = useState<string | null>(
    null,
  )
  const [serviceWarnings, setServiceWarnings] = useState<
    VisitCompletionServiceWarning[]
  >([])
  const [serviceError, setServiceError] = useState<string | null>(null)
  const [serviceMessage, setServiceMessage] = useState<string | null>(null)

  const patientName = getPatientFullName(patient)
  const procedureCount = getCompletedProcedureCount(procedures)
  const incompleteProcedureCount = getIncompleteProcedureCount(procedures)
  const hasIncompleteProcedureRows = incompleteProcedureCount > 0
  const hasClinicalNote = Boolean(clinicalNote.trim())
  const hasRecommendation = Boolean(recommendation.trim())
  const hasNextStep = Boolean(nextStep)
  const isReady = procedureCount > 0 || hasClinicalNote || hasNextStep
  const hasMeaningfulDraftData =
    procedureCount > 0 || hasClinicalNote || hasRecommendation || hasNextStep
  const nextStepLabel = getNextStepLabel(nextStep)
  const age = getPatientAge(patient.dateOfBirth)
  const activeStep = workflowSteps[activeStepIndex]
  const isBusy = isLoadingDraft || isSavingDraft || isCompleting
  const plannedWork =
    patient.activeTreatmentPlanSummary.trim() ||
    'No planned treatment is recorded in the current patient context.'

  const warnings = useMemo(() => {
    const warningSet = new Set<string>()

    patient.medicalWarnings.forEach((warning) => warningSet.add(warning))

    if (patient.allergies.trim()) {
      warningSet.add(`Allergies: ${patient.allergies}`)
    }

    if (patient.importantNote?.trim()) {
      warningSet.add(patient.importantNote)
    }

    return Array.from(warningSet)
  }, [patient])

  const applyDraft = useCallback(
    (draft: VisitCompletionDraft) => {
      setVisitId(draft.id)
      setLinkedAppointmentId(draft.appointmentId ?? appointmentId ?? null)
      setProcedures(applyDraftToProcedures(draft))
      setClinicalNote(draft.clinicalNote)
      setRecommendation(draft.recommendation)
      setNextStep(draft.nextStep)
    },
    [appointmentId],
  )

  useEffect(() => {
    if (appointmentId) {
      const timeoutId = window.setTimeout(() => {
        setLinkedAppointmentId(appointmentId)
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }
  }, [appointmentId])

  useEffect(() => {
    let isCurrent = true

    async function loadDraft() {
      setIsLoadingDraft(true)
      setServiceError(null)

      try {
        const draft = await fetchLatestOpenVisitCompletion(
          patient.id,
          appointmentId,
        )

        if (!isCurrent) {
          return
        }

        if (draft) {
          applyDraft(draft)
          setServiceWarnings(draft.warnings)
          setLastSavedAt(draft.updatedAt)
          setDraftReloadMessage(
            `${
              appointmentContext
                ? 'Existing draft for this appointment found and loaded.'
                : 'Draft found and loaded.'
            } Last saved ${formatPatientDateTime(
              draft.updatedAt,
            )}.`,
          )
          setServiceMessage(null)
        } else {
          setServiceWarnings([])
          setLastSavedAt(null)
          setDraftReloadMessage(
            appointmentContext
              ? 'No open draft found for this appointment. Visit completion is ready to start. Use Save Draft before leaving or refreshing.'
              : 'No open draft found. New visit completion ready. Use Save Draft before leaving or refreshing.',
          )
          setServiceMessage(null)
        }
      } catch (error) {
        if (isCurrent) {
          setDraftReloadMessage(null)
          setServiceError(
            error instanceof Error
              ? error.message
              : 'Visit draft could not be loaded.',
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoadingDraft(false)
        }
      }
    }

    void loadDraft()

    return () => {
      isCurrent = false
    }
  }, [appointmentContext, appointmentId, applyDraft, patient.id])

  function updateProcedure(
    procedureId: string,
    field: keyof Omit<ProcedureRow, 'id'>,
    value: string,
  ) {
    setProcedures((currentProcedures) =>
      currentProcedures.map((procedure) =>
        procedure.id === procedureId
          ? { ...procedure, [field]: value }
          : procedure,
      ),
    )
  }

  function removeProcedure(procedureId: string) {
    setProcedures((currentProcedures) =>
      currentProcedures.length === 1
        ? [createProcedureRow()]
        : currentProcedures.filter((procedure) => procedure.id !== procedureId),
    )
  }

  function goToPreviousStep() {
    setCompletionState('editing')
    setActiveStepIndex((currentIndex) => Math.max(currentIndex - 1, 0))
  }

  function goToNextStep() {
    setCompletionState('editing')
    setActiveStepIndex((currentIndex) =>
      Math.min(currentIndex + 1, workflowSteps.length - 1),
    )
  }

  function buildDraftInput() {
    return {
      visitId,
      patientId: patient.id,
      appointmentId: linkedAppointmentId,
      clinicalNote,
      recommendation,
      nextStep: nextStep as VisitNextStep | '',
      procedures: procedures.map((procedure) => ({
        id: procedure.id,
        procedureName: procedure.name,
        toothOrRegion: procedure.toothOrRegion,
        quantityOrDuration: procedure.quantityOrDuration,
        note: procedure.note,
      })),
    }
  }

  async function handleSaveDraft() {
    if (!hasMeaningfulDraftData || isSavingDraft || isCompleting) {
      return
    }

    setIsSavingDraft(true)
    setServiceError(null)
    setServiceMessage(null)
    setDraftReloadMessage(null)

    try {
      const result = await saveVisitCompletionDraft(buildDraftInput())

      setServiceWarnings(result.warnings ?? [])

      if (result.ok && result.draft) {
        setVisitId(result.draft.id)
        setLastSavedAt(result.draft.updatedAt)
        setServiceMessage(
          result.message ??
            'Draft saved. These changes will reload after refresh.',
        )
        applyDraft(result.draft)
      } else {
        setServiceError(
          getUserFriendlyServiceError(
            result.error ?? result.message,
            'Visit draft was not saved. Check your connection and try again.',
          ),
        )
      }
    } catch (error) {
      setServiceError(
        getUserFriendlyServiceError(
          error instanceof Error ? error.message : null,
          'Visit draft was not saved. Check your connection and try again.',
        ),
      )
    } finally {
      setIsSavingDraft(false)
    }
  }

  function startCompletion() {
    if (isBusy) {
      return
    }

    setAttemptedCompletion(true)
    setServiceError(null)

    if (!isReady) {
      setCompletionState('editing')
      return
    }

    setCompletionState('confirming')
  }

  async function confirmCompletion() {
    if (isCompleting || isSavingDraft || isLoadingDraft) {
      return
    }

    setIsCompleting(true)
    setServiceError(null)
    setServiceMessage(null)
    setDraftReloadMessage(null)

    try {
      const result = await completeVisit(buildDraftInput())

      setServiceWarnings(result.warnings ?? [])

      if (result.ok && result.draft) {
        setVisitId(result.draft.id)
        setLastSavedAt(result.draft.updatedAt)
        setServiceMessage(result.message ?? 'Visit completed.')
        applyDraft(result.draft)
        setCompletionState('completed')
      } else {
        setServiceError(
          getUserFriendlyServiceError(
            result.error ?? result.message,
            'Visit was not completed. Your entered data is still visible.',
          ),
        )
        setCompletionState('editing')
        setActiveStepIndex(workflowSteps.length - 1)
      }
    } catch (error) {
      setServiceError(
        getUserFriendlyServiceError(
          error instanceof Error ? error.message : null,
          'Visit was not completed. Your entered data is still visible.',
        ),
      )
      setCompletionState('editing')
      setActiveStepIndex(workflowSteps.length - 1)
    } finally {
      setIsCompleting(false)
    }
  }

  if (completionState === 'completed') {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Visit Completed</CardTitle>
            <Badge variant="success">Completed</Badge>
          </div>
          <CardDescription>
            The completion service accepted this visit. Billing, files,
            treatment plan changes, and odontogram changes were not created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ServiceFeedback
            draftReloadMessage={draftReloadMessage}
            isCompleting={isCompleting}
            isSavingDraft={isSavingDraft}
            lastSavedAt={lastSavedAt}
            serviceError={serviceError}
            serviceMessage={serviceMessage}
            serviceWarnings={serviceWarnings}
          />
          <VisitCompletionSummary
            procedureCount={procedureCount}
            hasClinicalNote={hasClinicalNote}
            selectedNextStepLabel={nextStepLabel}
            hasNextStep={hasNextStep}
            isReady={isReady}
            warnings={warnings}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onBackToPatient}
              variant="secondary"
              disabled={!onBackToPatient}
            >
              View patient timeline
            </Button>
            {onBackToAppointment ? (
              <Button onClick={onBackToAppointment} variant="secondary">
                Return to appointment
              </Button>
            ) : null}
            {onBackToSchedule ? (
              <Button onClick={onBackToSchedule} variant="secondary">
                Daily schedule
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-28 sm:gap-6 sm:pb-0">
      {isLoadingDraft ? (
        <InlineNotice variant="info">Loading open visit draft...</InlineNotice>
      ) : null}

      <ServiceFeedback
        draftReloadMessage={draftReloadMessage}
        isCompleting={isCompleting}
        isSavingDraft={isSavingDraft}
        lastSavedAt={lastSavedAt}
        serviceError={serviceError}
        serviceMessage={serviceMessage}
        serviceWarnings={serviceWarnings}
      />

      <CompactVisitContext
        age={age}
        patient={patient}
        patientName={patientName}
        plannedWork={plannedWork}
        warnings={warnings}
      />

      {appointmentContext ? (
        <AppointmentContextNotice
          appointment={appointmentContext}
          patientName={patientName}
        />
      ) : null}

      <MobileWorkflowHeader
        activeStep={activeStep}
        activeStepIndex={activeStepIndex}
        isReady={isReady}
      />

      <Stepper activeStepIndex={activeStepIndex} />

      <Card className="min-w-0 border-teal-100 shadow-md">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">
                  Step {activeStepIndex + 1} of {workflowSteps.length}
                </Badge>
                <Badge variant={isReady ? 'success' : 'neutral'}>
                  {isReady ? 'Minimum met' : 'Needs one entry'}
                </Badge>
              </div>
              <CardTitle className="mt-3 text-2xl">
                {activeStep.title}
              </CardTitle>
              <CardDescription className="text-base">
                {activeStep.description}
              </CardDescription>
            </div>
            <div className="hidden rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 sm:block sm:max-w-sm">
              {getStepPrompt(activeStep.id)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {activeStep.id === 'planned' ? (
            <PlannedStep
              patient={patient}
              plannedWork={plannedWork}
              warnings={warnings}
            />
          ) : null}

          {activeStep.id === 'procedures' ? (
            <ProceduresStep
              disabled={isBusy}
              hasIncompleteProcedureRows={hasIncompleteProcedureRows}
              procedures={procedures}
              onAddProcedure={() =>
                setProcedures((currentProcedures) => [
                  ...currentProcedures,
                  createProcedureRow(),
                ])
              }
              onRemoveProcedure={removeProcedure}
              onUpdateProcedure={updateProcedure}
            />
          ) : null}

          {activeStep.id === 'notes' ? (
            <NotesStep
              clinicalNote={clinicalNote}
              disabled={isBusy}
              recommendation={recommendation}
              onClinicalNoteChange={setClinicalNote}
              onRecommendationChange={setRecommendation}
            />
          ) : null}

          {activeStep.id === 'next-step' ? (
            <NextStep
              disabled={isBusy}
              nextStep={nextStep}
              onNextStepChange={setNextStep}
            />
          ) : null}

          {activeStep.id === 'review' ? (
            <ReviewStep
              attemptedCompletion={attemptedCompletion}
              clinicalNote={clinicalNote}
              hasIncompleteProcedureRows={hasIncompleteProcedureRows}
              hasClinicalNote={hasClinicalNote}
              hasNextStep={hasNextStep}
              hasRecommendation={hasRecommendation}
              isReady={isReady}
              nextStepLabel={nextStepLabel}
              procedureCount={procedureCount}
              recommendation={recommendation}
              warnings={warnings}
            />
          ) : null}
        </CardContent>
      </Card>

      {completionState === 'confirming' ? (
        <Card className="border-amber-200 bg-amber-50/60 shadow-sm sm:mb-0">
          <CardHeader>
            <CardTitle>Confirm Visit Completion</CardTitle>
            <CardDescription>
              This will save the latest draft data and mark the visit as
              completed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VisitCompletionConfirmActions
              isCompleting={isCompleting}
              onConfirm={() => void confirmCompletion()}
              onContinueReview={() => setCompletionState('editing')}
            />
          </CardContent>
        </Card>
      ) : (
        <VisitCompletionEditingActions
          activeStepIndex={activeStepIndex}
          hasMeaningfulDraftData={hasMeaningfulDraftData}
          isBusy={isBusy}
          isCompleting={isCompleting}
          isSavingDraft={isSavingDraft}
          onBack={goToPreviousStep}
          onComplete={startCompletion}
          onNext={goToNextStep}
          onSaveDraft={() => void handleSaveDraft()}
        />
      )}
    </div>
  )
}

function applyDraftToProcedures(draft: VisitCompletionDraft): ProcedureRow[] {
  if (draft.procedures.length === 0) {
    return [createProcedureRow()]
  }

  return draft.procedures.map((procedure) => ({
    id: procedure.id,
    name: procedure.procedureName,
    toothOrRegion: procedure.toothOrRegion,
    quantityOrDuration: procedure.quantityOrDuration,
    note: procedure.note,
  }))
}

function ServiceFeedback({
  draftReloadMessage,
  isCompleting,
  isSavingDraft,
  lastSavedAt,
  serviceError,
  serviceMessage,
  serviceWarnings,
}: {
  draftReloadMessage: string | null
  isCompleting: boolean
  isSavingDraft: boolean
  lastSavedAt: string | null
  serviceError: string | null
  serviceMessage: string | null
  serviceWarnings: VisitCompletionServiceWarning[]
}) {
  return (
    <div className="space-y-2" data-testid="visit-persistence-feedback">
      {draftReloadMessage ? (
        <InlineNotice data-testid="visit-draft-reload-state" variant="info">
          {draftReloadMessage}
        </InlineNotice>
      ) : null}
      {isSavingDraft ? (
        <InlineNotice data-testid="visit-save-pending-state" variant="info">
          Saving draft. Keep this page open until the saved confirmation appears.
        </InlineNotice>
      ) : null}
      {isCompleting ? (
        <InlineNotice data-testid="visit-complete-pending-state" variant="info">
          Completing visit. The latest draft data is being saved first.
        </InlineNotice>
      ) : null}
      {serviceError ? (
        <InlineNotice data-testid="visit-error-state" variant="danger">
          {serviceError}
        </InlineNotice>
      ) : null}
      {serviceWarnings.map((warning) => (
        <InlineNotice
          key={`${warning.code}-${warning.message}`}
          data-testid="visit-warning-state"
          variant={
            warning.code === 'clinical_note_permission_denied' ||
            warning.code === 'appointment_status_update_failed'
              ? 'warning'
              : 'info'
          }
        >
          {warning.code === 'clinical_note_permission_denied'
            ? `${warning.message} Add a procedure or next step before completion, or ask a role that can write clinical notes to save the note.`
            : warning.message}
        </InlineNotice>
      ))}
      {serviceMessage ? (
        <InlineNotice data-testid="visit-success-state" variant="success">
          {serviceMessage}
          {lastSavedAt
            ? ` Last saved ${formatPatientDateTime(
                lastSavedAt,
              )}. Refresh will reload this saved draft until completion.`
            : ''}
        </InlineNotice>
      ) : null}
    </div>
  )
}

function AppointmentContextNotice({
  appointment,
  patientName,
}: {
  appointment: Appointment
  patientName: string
}) {
  const providerLabel = getAssignedProviderDisplayName(appointment)

  return (
    <Card
      className="border-cyan-200 bg-cyan-50/50 shadow-sm"
      data-testid="visit-appointment-context"
    >
      <CardContent className="p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">Appointment context</Badge>
            <Badge variant={appointmentStatusBadgeVariants[appointment.status]}>
              {appointmentStatusLabels[appointment.status] ?? appointment.status}
            </Badge>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
              Scheduled
            </div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">
              {formatAppointmentTimeRange(
                appointment.scheduled_start,
                appointment.scheduled_end,
              )}
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
              Patient
            </div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">
              {patientName}
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
              Reason / type
            </div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950 wrap-break-word">
              {appointment.reason?.trim() || 'No reason recorded'}
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
              Assigned provider
            </div>
            <p
              className="mt-1 text-sm font-semibold leading-6 text-slate-950"
              data-testid="visit-appointment-provider"
            >
              {providerLabel}
            </p>
          </div>
        </div>
        <InlineNotice className="mt-3" variant="info">
          Completing this visit saves the latest draft first and marks the linked
          appointment completed.
        </InlineNotice>
      </CardContent>
    </Card>
  )
}

function MobileWorkflowHeader({
  activeStep,
  activeStepIndex,
  isReady,
}: {
  activeStep: WorkflowStep
  activeStepIndex: number
  isReady: boolean
}) {
  const progressPercent = ((activeStepIndex + 1) / workflowSteps.length) * 100

  return (
    <div
      className="sticky top-0 z-40 -mx-4 self-stretch border-y border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:hidden"
      data-testid="visit-mobile-progress-header"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-normal text-teal-700">
            Visit Completion
          </div>
          <div className="truncate text-sm font-semibold text-slate-950">
            Step {activeStepIndex + 1} of {workflowSteps.length} -{' '}
            {activeStep.label}
          </div>
          <div className="truncate text-base font-semibold text-slate-950">
            {activeStep.title}
          </div>
        </div>
        <Badge variant={isReady ? 'success' : 'neutral'}>
          {isReady ? 'Ready' : `${activeStepIndex + 1}/${workflowSteps.length}`}
        </Badge>
      </div>
      <div
        aria-label={`Visit Completion progress: step ${activeStepIndex + 1} of ${workflowSteps.length}`}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemax={workflowSteps.length}
        aria-valuemin={1}
        aria-valuenow={activeStepIndex + 1}
      >
        <div
          className="h-full rounded-full bg-teal-700 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

function VisitCompletionEditingActions({
  activeStepIndex,
  hasMeaningfulDraftData,
  isBusy,
  isCompleting,
  isSavingDraft,
  onBack,
  onComplete,
  onNext,
  onSaveDraft,
}: {
  activeStepIndex: number
  hasMeaningfulDraftData: boolean
  isBusy: boolean
  isCompleting: boolean
  isSavingDraft: boolean
  onBack: () => void
  onComplete: () => void
  onNext: () => void
  onSaveDraft: () => void
}) {
  const isFinalStep = activeStepIndex >= workflowSteps.length - 1

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
      data-testid="visit-mobile-action-bar"
    >
      <div className="mx-auto grid max-w-5xl gap-2 sm:flex sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            className="min-h-11"
            disabled={activeStepIndex === 0 || isBusy}
            onClick={onBack}
            variant="secondary"
          >
            Back
          </Button>
          <Button
            className="min-h-11"
            disabled={!hasMeaningfulDraftData || isBusy}
            onClick={onSaveDraft}
            variant="secondary"
          >
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
        {isFinalStep ? (
          <Button
            className="min-h-11 w-full sm:w-auto"
            disabled={isBusy}
            onClick={onComplete}
          >
            {isCompleting ? 'Completing...' : 'Complete Visit'}
          </Button>
        ) : (
          <Button
            className="min-h-11 w-full sm:w-auto"
            disabled={isBusy}
            onClick={onNext}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

function VisitCompletionConfirmActions({
  isCompleting,
  onConfirm,
  onContinueReview,
}: {
  isCompleting: boolean
  onConfirm: () => void
  onContinueReview: () => void
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
      data-testid="visit-mobile-confirm-action-bar"
    >
      <div className="mx-auto grid max-w-5xl gap-2 sm:flex">
        <Button
          className="min-h-11"
          disabled={isCompleting}
          onClick={onConfirm}
        >
          {isCompleting ? 'Completing...' : 'Confirm completion'}
        </Button>
        <Button
          className="min-h-11"
          disabled={isCompleting}
          onClick={onContinueReview}
          variant="secondary"
        >
          Continue review
        </Button>
      </div>
    </div>
  )
}

function CompactVisitContext({
  age,
  patient,
  patientName,
  plannedWork,
  warnings,
}: {
  age: number
  patient: DemoPatient
  patientName: string
  plannedWork: string
  warnings: string[]
}) {
  return (
    <Card className="min-w-0 border-cyan-100 bg-cyan-50/40 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.6fr)]">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-teal-700 font-semibold text-white">
              {patient.firstName.slice(0, 1)}
              {patient.lastName.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold leading-7 text-slate-950">
                  {patientName}
                </h2>
                <Badge variant={patientStatusBadgeVariants[patient.status]}>
                  {patientStatusLabels[patient.status]}
                </Badge>
                {warnings.length > 0 ? (
                  <Badge variant="warning">{warnings.length} warning</Badge>
                ) : (
                  <Badge variant="success">No alerts</Badge>
                )}
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {age} years old - appointment:{' '}
                {formatPatientDateTime(patient.nextAppointment)}
              </p>
            </div>
          </div>

          <div className="hidden sm:block rounded-md border border-cyan-200 bg-white px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
              Planned today
            </div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">
              {patient.activeTreatmentPlan ?? 'No active plan'}
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              {plannedWork}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Stepper({ activeStepIndex }: { activeStepIndex: number }) {
  return (
    <div className="hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:block">
      <ol className="grid gap-2 sm:grid-cols-5">
        {workflowSteps.map((step, index) => {
          const isActive = index === activeStepIndex
          const isComplete = index < activeStepIndex

          return (
            <li key={step.id}>
              <div
                className={classNames(
                  'flex min-h-14 items-center gap-3 rounded-md border px-3 py-2',
                  isActive
                    ? 'border-teal-300 bg-teal-50 text-teal-950'
                    : isComplete
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-600',
                )}
              >
                <span
                  className={classNames(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-semibold',
                    isActive
                      ? 'bg-teal-700 text-white'
                      : isComplete
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white text-slate-600',
                  )}
                >
                  {index + 1}
                </span>
                <span className="text-sm font-semibold">{step.label}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function PlannedStep({
  patient,
  plannedWork,
  warnings,
}: {
  patient: DemoPatient
  plannedWork: string
  warnings: string[]
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricTile
        label="Planned reason / treatment"
        value={patient.activeTreatmentPlan ?? 'No active plan'}
        description={plannedWork}
        tone={patient.activeTreatmentPlan ? 'info' : 'default'}
      />
      <MetricTile
        label="Last visit"
        value={formatPatientDate(patient.lastVisit)}
        description={patient.recentVisitSummary}
        tone="success"
      />
      <MetricTile
        label="Last clinical note"
        value={patient.lastClinicalNote}
        description="Use only as context. This prototype does not update it."
      />
      <MetricTile
        label="Current visit status"
        value="Open visit completion"
        description="Open drafts save to the visit completion tables."
      />
      <div className="md:col-span-2">
        {warnings.length > 0 ? (
          <InlineNotice variant="warning">
            Safety context to review: {warnings.join(', ')}
          </InlineNotice>
        ) : (
          <InlineNotice variant="success">
            No medical warning reminder is present in current patient context.
          </InlineNotice>
        )}
      </div>
    </div>
  )
}

function ProceduresStep({
  disabled,
  hasIncompleteProcedureRows,
  procedures,
  onAddProcedure,
  onRemoveProcedure,
  onUpdateProcedure,
}: {
  disabled: boolean
  hasIncompleteProcedureRows: boolean
  procedures: ProcedureRow[]
  onAddProcedure: () => void
  onRemoveProcedure: (procedureId: string) => void
  onUpdateProcedure: (
    procedureId: string,
    field: keyof Omit<ProcedureRow, 'id'>,
    value: string,
  ) => void
}) {
  return (
    <div className="space-y-4">
      <InlineNotice variant="info">
        If this was only a consult or check, you can skip procedures and record
        the visit in Notes or Next Step.
      </InlineNotice>
      {hasIncompleteProcedureRows ? (
        <InlineNotice variant="warning">
          Procedure rows need a procedure name before they can be saved as
          performed work. Rows without a name are ignored by persistence.
        </InlineNotice>
      ) : null}

      {procedures.map((procedure, index) => (
        <div
          className="rounded-md border border-slate-200 bg-slate-50 p-4"
          key={procedure.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-semibold text-slate-950">
              Procedure {index + 1}
            </div>
            <Button
              disabled={disabled}
              onClick={() => onRemoveProcedure(procedure.id)}
              size="sm"
              variant="ghost"
            >
              Remove
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label>
              <FieldLabel>Procedure name</FieldLabel>
              <TextInput
                data-testid="visit-procedure-name"
                disabled={disabled}
                value={procedure.name}
                onChange={(event) =>
                  onUpdateProcedure(procedure.id, 'name', event.target.value)
                }
                placeholder="Composite filling"
              />
            </label>
            <label>
              <FieldLabel>Tooth / region</FieldLabel>
              <TextInput
                data-testid="visit-procedure-tooth"
                disabled={disabled}
                value={procedure.toothOrRegion}
                onChange={(event) =>
                  onUpdateProcedure(
                    procedure.id,
                    'toothOrRegion',
                    event.target.value,
                  )
                }
                placeholder="16, upper right, full mouth"
              />
            </label>
            <label>
              <FieldLabel>Quantity / duration</FieldLabel>
              <TextInput
                data-testid="visit-procedure-quantity"
                disabled={disabled}
                value={procedure.quantityOrDuration}
                onChange={(event) =>
                  onUpdateProcedure(
                    procedure.id,
                    'quantityOrDuration',
                    event.target.value,
                  )
                }
                placeholder="1 surface, 30 min"
              />
            </label>
            <label>
              <FieldLabel>Procedure note</FieldLabel>
              <TextInput
                data-testid="visit-procedure-note"
                disabled={disabled}
                value={procedure.note}
                onChange={(event) =>
                  onUpdateProcedure(procedure.id, 'note', event.target.value)
                }
                placeholder="Optional short note"
              />
            </label>
          </div>
        </div>
      ))}

      <Button
        className="min-h-10"
        disabled={disabled}
        onClick={onAddProcedure}
        variant="secondary"
      >
        Add another procedure
      </Button>
    </div>
  )
}

function NotesStep({
  clinicalNote,
  disabled,
  recommendation,
  onClinicalNoteChange,
  onRecommendationChange,
}: {
  clinicalNote: string
  disabled: boolean
  recommendation: string
  onClinicalNoteChange: (value: string) => void
  onRecommendationChange: (value: string) => void
}) {
  return (
    <div className="grid gap-4">
      <label>
        <FieldLabel>Clinical note</FieldLabel>
        <Textarea
          data-testid="visit-clinical-note"
          disabled={disabled}
          value={clinicalNote}
          onChange={(event) => onClinicalNoteChange(event.target.value)}
          placeholder="What was observed and completed today?"
        />
      </label>
      <label>
        <FieldLabel>Recommendation / next instruction</FieldLabel>
        <Textarea
          data-testid="visit-recommendation"
          disabled={disabled}
          value={recommendation}
          onChange={(event) => onRecommendationChange(event.target.value)}
          placeholder="Home care, warning signs, control visit timing, or plan instructions."
        />
      </label>
    </div>
  )
}

function NextStep({
  disabled,
  nextStep,
  onNextStepChange,
}: {
  disabled: boolean
  nextStep: string
  onNextStepChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <label>
        <FieldLabel>Next step</FieldLabel>
        <Select
          data-testid="visit-next-step"
          disabled={disabled}
          value={nextStep}
          onChange={(event) => onNextStepChange(event.target.value)}
        >
          {nextStepOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>

      {nextStep && nextStep !== 'no_follow_up' ? (
        <InlineNotice variant="info">
          Follow-up creation is a placeholder. This prototype does not create
          appointments or treatment plan tasks.
        </InlineNotice>
      ) : null}

      <Card className="border-dashed border-slate-300 bg-slate-50 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Attachments</CardTitle>
            <Badge variant="neutral">Future functionality</Badge>
          </div>
          <CardDescription>
            Photos, scans, and documents will be linked when storage and visit
            records are implemented.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InlineNotice variant="neutral">
            Attachment upload is intentionally disabled in this prototype. No
            files are selected, uploaded, or stored.
          </InlineNotice>
        </CardContent>
      </Card>
    </div>
  )
}

function ReviewStep({
  attemptedCompletion,
  clinicalNote,
  hasIncompleteProcedureRows,
  hasClinicalNote,
  hasNextStep,
  hasRecommendation,
  isReady,
  nextStepLabel,
  procedureCount,
  recommendation,
  warnings,
}: {
  attemptedCompletion: boolean
  clinicalNote: string
  hasIncompleteProcedureRows: boolean
  hasClinicalNote: boolean
  hasNextStep: boolean
  hasRecommendation: boolean
  isReady: boolean
  nextStepLabel: string
  procedureCount: number
  recommendation: string
  warnings: string[]
}) {
  return (
    <div className="space-y-4">
      <VisitCompletionSummary
        procedureCount={procedureCount}
        hasClinicalNote={hasClinicalNote}
        selectedNextStepLabel={nextStepLabel}
        hasNextStep={hasNextStep}
        isReady={isReady}
        warnings={warnings}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <MetricTile
          label="Clinical note preview"
          value={hasClinicalNote ? clinicalNote : 'No note entered'}
          description="Saved with the visit when the current role can write clinical notes."
        />
        <MetricTile
          label="Instruction preview"
          value={hasRecommendation ? recommendation : 'No instruction entered'}
          description="Saved with the visit draft and completion record."
        />
      </div>

      {attemptedCompletion && !isReady ? (
        <InlineNotice variant="warning">
          Add at least one procedure, clinical note, or next step before
          completing this visit.
        </InlineNotice>
      ) : null}
      {hasIncompleteProcedureRows ? (
        <InlineNotice variant="warning">
          One or more procedure rows are missing a procedure name. Add the name
          or remove the row before completing.
        </InlineNotice>
      ) : null}
    </div>
  )
}

function getStepPrompt(stepId: string) {
  if (stepId === 'planned') {
    return 'You are checking the patient and today context.'
  }

  if (stepId === 'procedures') {
    return 'Record only what was actually performed.'
  }

  if (stepId === 'notes') {
    return 'Write the clinical record needed for this visit.'
  }

  if (stepId === 'next-step') {
    return 'Choose the safest follow-up direction.'
  }

  return 'Confirm the summary before completing.'
}
