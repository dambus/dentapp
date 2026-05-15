type PatientDataSource = 'demo' | 'supabase'

export type VisitStatus =
  | 'draft'
  | 'in_progress'
  | 'completed'
  | 'reopened'
  | 'archived'

export type VisitNextStep =
  | 'no_follow_up'
  | 'follow_up_recommended'
  | 'schedule_control_visit'
  | 'continue_treatment_plan'
  | 'additional_diagnostics'
  | 'referral'

export type VisitProcedureDraftInput = {
  id?: string
  procedureName?: string
  name?: string
  toothOrRegion?: string
  quantityOrDuration?: string
  note?: string
}

export type VisitCompletionDraftInput = {
  visitId?: string
  patientId: string
  appointmentId?: string | null
  visitDate?: string
  clinicalNote?: string
  recommendation?: string
  nextStep?: VisitNextStep | ''
  procedures?: VisitProcedureDraftInput[]
}

export type VisitProcedureDraft = {
  id: string
  visitId: string
  patientId: string
  procedureName: string
  toothOrRegion: string
  quantityOrDuration: string
  note: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type VisitClinicalNoteDraft = {
  id: string
  patientId: string
  visitId: string | null
  noteType: string
  content: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type VisitCompletionWarningCode =
  | 'clinical_note_permission_denied'
  | 'clinical_note_unavailable'
  | 'appointment_status_update_failed'
  | 'demo_mode_non_persistent'
  | 'audit_log_failed'

export type VisitCompletionServiceWarning = {
  code: VisitCompletionWarningCode
  message: string
}

export type VisitCompletionDraft = {
  id: string
  patientId: string
  appointmentId: string | null
  status: VisitStatus
  visitDate: string
  startedAt: string | null
  completedAt: string | null
  completedBy: string | null
  clinicalNoteId: string | null
  clinicalNote: string
  recommendation: string
  nextStep: VisitNextStep | ''
  procedures: VisitProcedureDraft[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  warnings: VisitCompletionServiceWarning[]
}

export type VisitLinkedAppointment = {
  id: string
  scheduledStart: string
  scheduledEnd: string | null
  status: string
  reason: string | null
  notes: string | null
}

export type CompletedVisitDetail = VisitCompletionDraft & {
  linkedAppointment: VisitLinkedAppointment | null
}

export type VisitCompletionWriteResult = {
  ok: boolean
  draft?: VisitCompletionDraft | null
  procedures?: VisitProcedureDraft[]
  message: string | null
  warnings?: VisitCompletionServiceWarning[]
  error?: string
  reason?:
    | 'demo_mode'
    | 'validation'
    | 'permission'
    | 'not_found'
    | 'audit'
    | 'unknown'
}

type SupabaseProfileContextRow = {
  id: string
  auth_user_id: string
  clinic_id: string
  role: string
  status: string
}

type SupabasePatientRow = {
  id: string
  clinic_id: string
}

type SupabaseVisitRow = {
  id: string
  patient_id: string
  appointment_id: string | null
  status: string
  visit_date: string
  started_at: string | null
  completed_at: string | null
  completed_by: string | null
  clinical_note_id: string | null
  recommendation: string | null
  next_step: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type SupabaseVisitProcedureRow = {
  id: string
  visit_id: string
  patient_id: string
  procedure_name: string
  tooth_or_region: string | null
  quantity_or_duration: string | null
  note: string | null
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type SupabaseClinicalNoteRow = {
  id: string
  patient_id: string
  visit_id: string | null
  note_type: string
  content: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type ClinicalNoteWriteResult = {
  note: VisitClinicalNoteDraft | null
  warning: VisitCompletionServiceWarning | null
  error: string | null
}

type SaveVisitCoreResult = {
  visit: SupabaseVisitRow | null
  created: boolean
  error: string | null
  reason?: VisitCompletionWriteResult['reason']
}

type NormalizedProcedureInput = {
  procedureName: string
  toothOrRegion: string
  quantityOrDuration: string
  note: string
}

type AuditAction =
  | 'visit.draft_created'
  | 'visit.draft_updated'
  | 'visit.completed'

const patientDataSource = normalizeDataSource(
  import.meta.env.VITE_PATIENT_DATA_SOURCE,
)

const validVisitStatuses = new Set<VisitStatus>([
  'draft',
  'in_progress',
  'completed',
  'reopened',
  'archived',
])

const validNextSteps = new Set<VisitNextStep>([
  'no_follow_up',
  'follow_up_recommended',
  'schedule_control_visit',
  'continue_treatment_plan',
  'additional_diagnostics',
  'referral',
])

const clinicalNoteWriteRoles = new Set([
  'owner_admin',
  'doctor',
  'specialist',
])

function normalizeDataSource(value: string | undefined): PatientDataSource {
  return value?.toLowerCase() === 'supabase' ? 'supabase' : 'demo'
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function normalizeVisitStatus(value: string): VisitStatus {
  return validVisitStatuses.has(value as VisitStatus)
    ? (value as VisitStatus)
    : 'draft'
}

function normalizeNextStep(value: string | null | undefined): VisitNextStep | '' {
  if (!value) {
    return ''
  }

  return validNextSteps.has(value as VisitNextStep)
    ? (value as VisitNextStep)
    : ''
}

function classifySupabaseError(errorMessage: string | undefined) {
  const normalizedError = errorMessage?.toLowerCase() ?? ''

  if (
    normalizedError.includes('permission') ||
    normalizedError.includes('row-level security') ||
    normalizedError.includes('not allowed')
  ) {
    return 'permission' as const
  }

  if (normalizedError.includes('not found')) {
    return 'not_found' as const
  }

  return 'unknown' as const
}

function makeClinicalNotePermissionWarning(): VisitCompletionServiceWarning {
  return {
    code: 'clinical_note_permission_denied',
    message:
      'Clinical note text was not saved because the current role cannot write clinical notes.',
  }
}

function makeDemoModeWarning(): VisitCompletionServiceWarning {
  return {
    code: 'demo_mode_non_persistent',
    message: 'Demo mode is non-persistent. No visit completion data was saved.',
  }
}

type SupabaseVisitAppointmentRow = {
  id: string
  scheduled_start: string
  scheduled_end: string | null
  status: string
  reason: string | null
  notes: string | null
}

function makeAppointmentStatusWarning(
  errorMessage: string,
): VisitCompletionServiceWarning {
  return {
    code: 'appointment_status_update_failed',
    message: `Visit was completed, but the linked appointment could not be marked completed: ${errorMessage}`,
  }
}

function normalizeProcedures(
  procedures: VisitProcedureDraftInput[] | undefined,
): NormalizedProcedureInput[] {
  return (procedures ?? [])
    .map((procedure) => ({
      procedureName: normalizeText(
        procedure.procedureName ?? procedure.name,
      ),
      toothOrRegion: normalizeText(procedure.toothOrRegion),
      quantityOrDuration: normalizeText(procedure.quantityOrDuration),
      note: normalizeText(procedure.note),
    }))
    .filter(
      (procedure) =>
        procedure.procedureName ||
        procedure.toothOrRegion ||
        procedure.quantityOrDuration ||
        procedure.note,
    )
    .filter((procedure) => procedure.procedureName)
}

function mapRowToProcedure(
  row: SupabaseVisitProcedureRow,
): VisitProcedureDraft {
  return {
    id: row.id,
    visitId: row.visit_id,
    patientId: row.patient_id,
    procedureName: row.procedure_name,
    toothOrRegion: row.tooth_or_region ?? '',
    quantityOrDuration: row.quantity_or_duration ?? '',
    note: row.note ?? '',
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function mapRowToClinicalNote(
  row: SupabaseClinicalNoteRow,
): VisitClinicalNoteDraft {
  return {
    id: row.id,
    patientId: row.patient_id,
    visitId: row.visit_id,
    noteType: row.note_type,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function mapRowsToDraft(
  visit: SupabaseVisitRow,
  procedures: VisitProcedureDraft[],
  clinicalNote: VisitClinicalNoteDraft | null,
  warnings: VisitCompletionServiceWarning[] = [],
): VisitCompletionDraft {
  return {
    id: visit.id,
    patientId: visit.patient_id,
    appointmentId: visit.appointment_id,
    status: normalizeVisitStatus(visit.status),
    visitDate: visit.visit_date,
    startedAt: visit.started_at,
    completedAt: visit.completed_at,
    completedBy: visit.completed_by,
    clinicalNoteId: visit.clinical_note_id,
    clinicalNote: clinicalNote?.content ?? '',
    recommendation: visit.recommendation ?? '',
    nextStep: normalizeNextStep(visit.next_step),
    procedures,
    createdAt: visit.created_at,
    updatedAt: visit.updated_at,
    deletedAt: visit.deleted_at,
    warnings,
  }
}

function mapDraftToAuditValues(draft: VisitCompletionDraft) {
  return {
    patient_id: draft.patientId,
    appointment_id: draft.appointmentId,
    status: draft.status,
    visit_date: draft.visitDate,
    completed_at: draft.completedAt,
    completed_by: draft.completedBy,
    clinical_note_id: draft.clinicalNoteId,
    recommendation_present: Boolean(draft.recommendation),
    next_step: draft.nextStep || null,
    procedure_count: draft.procedures.length,
    clinical_note_present: Boolean(draft.clinicalNote),
    deleted_at: draft.deletedAt,
  }
}

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn('[visitCompletionService] Supabase client unavailable.', error)

    return null
  }
}

async function getCurrentSupabaseProfileContext() {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()

  if (sessionError || !sessionData.session) {
    return null
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, auth_user_id, clinic_id, role, status')
    .eq('auth_user_id', sessionData.session.user.id)
    .maybeSingle()

  if (profileError) {
    console.warn(
      '[visitCompletionService] Could not load current profile context.',
      profileError,
    )

    return null
  }

  return (profileData as SupabaseProfileContextRow | null) ?? null
}

async function getSupabasePatientForVisitWrite(
  patientId: string,
  clinicId: string,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('patients')
    .select('id, clinic_id')
    .eq('id', patientId)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.warn('[visitCompletionService] Patient lookup failed.', error)
    return null
  }

  return (data as SupabasePatientRow | null) ?? null
}

async function fetchVisitProcedures(visitId: string) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('visit_procedures')
    .select(
      'id, visit_id, patient_id, procedure_name, tooth_or_region, quantity_or_duration, note, sort_order, created_at, updated_at, deleted_at',
    )
    .eq('visit_id', visitId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.warn('[visitCompletionService] Visit procedures could not be loaded.', error)
    return []
  }

  return ((data as SupabaseVisitProcedureRow[] | null) ?? []).map(
    mapRowToProcedure,
  )
}

async function fetchClinicalNoteForVisit(
  visit: SupabaseVisitRow,
): Promise<{
  note: VisitClinicalNoteDraft | null
  warning: VisitCompletionServiceWarning | null
}> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return { note: null, warning: null }
  }

  let query = supabase
    .from('clinical_notes')
    .select(
      'id, patient_id, visit_id, note_type, content, created_at, updated_at, deleted_at',
    )
    .eq('patient_id', visit.patient_id)
    .is('deleted_at', null)

  if (visit.clinical_note_id) {
    query = query.eq('id', visit.clinical_note_id)
  } else {
    query = query.eq('visit_id', visit.id)
  }

  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn(
      '[visitCompletionService] Clinical note for visit could not be loaded.',
      error,
    )

    return {
      note: null,
      warning: {
        code: 'clinical_note_unavailable',
        message:
          'Clinical note content could not be loaded for the current role.',
      },
    }
  }

  return {
    note: data ? mapRowToClinicalNote(data as SupabaseClinicalNoteRow) : null,
    warning: null,
  }
}

async function hydrateVisitDraft(
  visit: SupabaseVisitRow,
  extraWarnings: VisitCompletionServiceWarning[] = [],
) {
  const [procedures, clinicalNoteResult] = await Promise.all([
    fetchVisitProcedures(visit.id),
    fetchClinicalNoteForVisit(visit),
  ])
  const warnings = [...extraWarnings]

  if (clinicalNoteResult.warning) {
    warnings.push(clinicalNoteResult.warning)
  }

  return mapRowsToDraft(visit, procedures, clinicalNoteResult.note, warnings)
}

async function createVisitAuditLog(
  action: AuditAction,
  draft: VisitCompletionDraft,
  oldValues: Record<string, unknown> | null,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase client unavailable for audit logging.',
    }
  }

  const { error } = await supabase.rpc('create_audit_log', {
    p_action: action,
    p_entity_type: 'visit',
    p_entity_id: draft.id,
    p_old_values: oldValues,
    p_new_values: mapDraftToAuditValues(draft),
    p_metadata: {
      patient_id: draft.patientId,
      visit_id: draft.id,
      procedure_count: draft.procedures.length,
    },
  })

  if (error) {
    console.warn('[visitCompletionService] Visit audit log failed.', error)

    return {
      ok: false,
      error: error.message ?? 'Audit log could not be recorded.',
    }
  }

  return { ok: true, error: null }
}

async function markLinkedAppointmentCompleted(
  appointmentId: string | null,
  patientId: string,
  profileContext: SupabaseProfileContextRow,
) {
  if (!appointmentId) {
    return { ok: true, error: null }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase client is not available.',
    }
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'completed',
      updated_by: profileContext.id,
    })
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)

  if (error) {
    console.warn(
      '[visitCompletionService] Linked appointment status update failed.',
      error,
    )

    return {
      ok: false,
      error: error.message ?? 'Appointment status could not be updated.',
    }
  }

  return { ok: true, error: null }
}

async function findExistingVisitForDraft(
  visitId: string,
  patientId: string,
  clinicId: string,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('visits')
    .select(
      'id, patient_id, appointment_id, status, visit_date, started_at, completed_at, completed_by, clinical_note_id, recommendation, next_step, created_at, updated_at, deleted_at',
    )
    .eq('id', visitId)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .in('status', ['draft', 'in_progress'])
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.warn('[visitCompletionService] Existing visit lookup failed.', error)
    return null
  }

  return (data as SupabaseVisitRow | null) ?? null
}

async function saveVisitCore(
  input: VisitCompletionDraftInput,
  profileContext: SupabaseProfileContextRow,
): Promise<SaveVisitCoreResult> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      visit: null,
      created: false,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const patient = await getSupabasePatientForVisitWrite(
    input.patientId,
    profileContext.clinic_id,
  )

  if (!patient) {
    return {
      visit: null,
      created: false,
      error: 'Patient not found or you do not have permission to edit visits.',
      reason: 'not_found',
    }
  }

  const nextStep = normalizeNextStep(input.nextStep)
  const commonValues = {
    appointment_id: input.appointmentId ?? null,
    recommendation: normalizeText(input.recommendation) || null,
    next_step: nextStep || null,
    updated_by: profileContext.id,
  }

  if (input.visitId) {
    const existingVisit = await findExistingVisitForDraft(
      input.visitId,
      input.patientId,
      profileContext.clinic_id,
    )

    if (!existingVisit) {
      return {
        visit: null,
        created: false,
        error:
          'Open visit draft not found or you do not have permission to edit it.',
        reason: 'not_found',
      }
    }

    const { data, error } = await supabase
      .from('visits')
      .update({
        ...commonValues,
        status: existingVisit.status === 'draft' ? 'in_progress' : existingVisit.status,
      })
      .eq('id', existingVisit.id)
      .eq('patient_id', input.patientId)
      .eq('clinic_id', profileContext.clinic_id)
      .is('deleted_at', null)
      .select(
        'id, patient_id, appointment_id, status, visit_date, started_at, completed_at, completed_by, clinical_note_id, recommendation, next_step, created_at, updated_at, deleted_at',
      )
      .single()

    if (error || !data) {
      const errorMessage = error?.message ?? 'Visit draft could not be updated.'

      return {
        visit: null,
        created: false,
        error: errorMessage,
        reason: classifySupabaseError(errorMessage),
      }
    }

    return {
      visit: data as SupabaseVisitRow,
      created: false,
      error: null,
    }
  }

  const { data, error } = await supabase
    .from('visits')
    .insert({
      ...commonValues,
      clinic_id: patient.clinic_id,
      patient_id: patient.id,
      status: 'draft',
      visit_date: input.visitDate ?? new Date().toISOString().slice(0, 10),
      started_at: new Date().toISOString(),
      created_by: profileContext.id,
    })
    .select(
      'id, patient_id, appointment_id, status, visit_date, started_at, completed_at, completed_by, clinical_note_id, recommendation, next_step, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Visit draft could not be created.'

    return {
      visit: null,
      created: true,
      error: errorMessage,
      reason: classifySupabaseError(errorMessage),
    }
  }

  return {
    visit: data as SupabaseVisitRow,
    created: true,
    error: null,
  }
}

async function saveClinicalNoteForVisit(
  visit: SupabaseVisitRow,
  content: string,
  profileContext: SupabaseProfileContextRow,
): Promise<ClinicalNoteWriteResult> {
  const normalizedContent = normalizeText(content)

  if (!normalizedContent) {
    return { note: null, warning: null, error: null }
  }

  if (!clinicalNoteWriteRoles.has(profileContext.role)) {
    return {
      note: null,
      warning: makeClinicalNotePermissionWarning(),
      error: null,
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      note: null,
      warning: null,
      error: 'Supabase client is not available.',
    }
  }

  const existingNote = await fetchClinicalNoteForVisit(visit)
  const noteValues = {
    note_type: 'procedure',
    content: normalizedContent,
    tooth_number: null,
    visit_id: visit.id,
    updated_by: profileContext.id,
  }

  if (existingNote.note) {
    const { data, error } = await supabase
      .from('clinical_notes')
      .update(noteValues)
      .eq('id', existingNote.note.id)
      .eq('patient_id', visit.patient_id)
      .eq('clinic_id', profileContext.clinic_id)
      .is('deleted_at', null)
      .select(
        'id, patient_id, visit_id, note_type, content, created_at, updated_at, deleted_at',
      )
      .single()

    if (error || !data) {
      return {
        note: null,
        warning: null,
        error: error?.message ?? 'Clinical note could not be updated.',
      }
    }

    return {
      note: mapRowToClinicalNote(data as SupabaseClinicalNoteRow),
      warning: null,
      error: null,
    }
  }

  const { data, error } = await supabase
    .from('clinical_notes')
    .insert({
      ...noteValues,
      clinic_id: profileContext.clinic_id,
      patient_id: visit.patient_id,
      created_by: profileContext.id,
    })
    .select(
      'id, patient_id, visit_id, note_type, content, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    return {
      note: null,
      warning: null,
      error: error?.message ?? 'Clinical note could not be saved.',
    }
  }

  return {
    note: mapRowToClinicalNote(data as SupabaseClinicalNoteRow),
    warning: null,
    error: null,
  }
}

async function linkClinicalNoteToVisit(
  visitId: string,
  patientId: string,
  clinicalNoteId: string,
  profileContext: SupabaseProfileContextRow,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('visits')
    .update({
      clinical_note_id: clinicalNoteId,
      updated_by: profileContext.id,
    })
    .eq('id', visitId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, patient_id, appointment_id, status, visit_date, started_at, completed_at, completed_by, clinical_note_id, recommendation, next_step, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    console.warn(
      '[visitCompletionService] Visit clinical note link could not be updated.',
      error,
    )
    return null
  }

  return data as SupabaseVisitRow
}

export async function fetchLatestOpenVisitCompletion(
  patientId: string,
): Promise<VisitCompletionDraft | null> {
  if (!patientId?.trim()) {
    return null
  }

  if (patientDataSource !== 'supabase') {
    return null
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('visits')
    .select(
      'id, patient_id, appointment_id, status, visit_date, started_at, completed_at, completed_by, clinical_note_id, recommendation, next_step, created_at, updated_at, deleted_at',
    )
    .eq('patient_id', patientId)
    .in('status', ['draft', 'in_progress'])
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn(
      '[visitCompletionService] Latest open visit completion could not be loaded.',
      error,
    )
    return null
  }

  if (!data) {
    return null
  }

  return hydrateVisitDraft(data as SupabaseVisitRow)
}

export async function fetchCompletedVisitsForPatient(
  patientId: string,
): Promise<VisitCompletionDraft[]> {
  if (!patientId?.trim()) {
    return []
  }

  if (patientDataSource !== 'supabase') {
    return []
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    throw new Error('Supabase client is not available.')
  }

  const { data, error } = await supabase
    .from('visits')
    .select(
      'id, patient_id, appointment_id, status, visit_date, started_at, completed_at, completed_by, clinical_note_id, recommendation, next_step, created_at, updated_at, deleted_at',
    )
    .eq('patient_id', patientId)
    .eq('status', 'completed')
    .is('deleted_at', null)
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.warn(
      '[visitCompletionService] Completed visits could not be loaded.',
      error,
    )
    throw new Error(error.message ?? 'Completed visits could not be loaded.')
  }

  const visits = (data as SupabaseVisitRow[] | null) ?? []

  return Promise.all(visits.map((visit) => hydrateVisitDraft(visit)))
}

async function fetchLinkedAppointment(
  appointmentId: string | null,
): Promise<VisitLinkedAppointment | null> {
  if (!appointmentId) {
    return null
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    throw new Error('Supabase client is not available.')
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('id, scheduled_start, scheduled_end, status, reason, notes')
    .eq('id', appointmentId)
    .maybeSingle()

  if (error) {
    console.warn(
      '[visitCompletionService] Linked appointment could not be loaded.',
      error,
    )
    throw new Error(error.message ?? 'Linked appointment could not be loaded.')
  }

  const appointment = data as SupabaseVisitAppointmentRow | null

  return appointment
    ? {
        id: appointment.id,
        scheduledStart: appointment.scheduled_start,
        scheduledEnd: appointment.scheduled_end,
        status: appointment.status,
        reason: appointment.reason,
        notes: appointment.notes,
      }
    : null
}

export async function fetchCompletedVisitById(
  patientId: string,
  visitId: string,
): Promise<CompletedVisitDetail | null> {
  if (!patientId?.trim() || !visitId?.trim()) {
    return null
  }

  if (patientDataSource !== 'supabase') {
    return null
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    throw new Error('Supabase client is not available.')
  }

  const { data, error } = await supabase
    .from('visits')
    .select(
      'id, patient_id, appointment_id, status, visit_date, started_at, completed_at, completed_by, clinical_note_id, recommendation, next_step, created_at, updated_at, deleted_at',
    )
    .eq('id', visitId)
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.warn('[visitCompletionService] Completed visit detail failed to load.', error)
    throw new Error(error.message ?? 'Completed visit could not be loaded.')
  }

  if (!data) {
    return null
  }

  const visit = data as SupabaseVisitRow

  if (visit.status !== 'completed') {
    throw new Error('This visit is not completed yet.')
  }

  const [draft, linkedAppointment] = await Promise.all([
    hydrateVisitDraft(visit),
    fetchLinkedAppointment(visit.appointment_id),
  ])

  return {
    ...draft,
    linkedAppointment,
  }
}

export async function replaceVisitProcedures(
  visitId: string,
  patientId: string,
  procedures: VisitProcedureDraftInput[] = [],
): Promise<VisitCompletionWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      procedures: [],
      message: 'Demo mode only. No procedure changes were saved.',
      warnings: [makeDemoModeWarning()],
      reason: 'demo_mode',
    }
  }

  if (!visitId?.trim() || !patientId?.trim()) {
    return {
      ok: false,
      procedures: [],
      message: null,
      error: 'Visit ID and patient ID are required to save procedures.',
      reason: 'validation',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      procedures: [],
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      procedures: [],
      message: null,
      error: 'Active profile context is required to save visit procedures.',
      reason: 'permission',
    }
  }

  const existingVisit = await findExistingVisitForDraft(
    visitId,
    patientId,
    profileContext.clinic_id,
  )

  if (!existingVisit) {
    return {
      ok: false,
      procedures: [],
      message: null,
      error: 'Open visit draft not found or you do not have permission to edit it.',
      reason: 'not_found',
    }
  }

  const now = new Date().toISOString()
  const { error: archiveError } = await supabase
    .from('visit_procedures')
    .update({
      deleted_at: now,
      updated_by: profileContext.id,
    })
    .eq('visit_id', visitId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)

  if (archiveError) {
    return {
      ok: false,
      procedures: [],
      message: null,
      error: archiveError.message ?? 'Existing visit procedures could not be archived.',
      reason: classifySupabaseError(archiveError.message),
    }
  }

  const normalizedProcedures = normalizeProcedures(procedures)

  if (normalizedProcedures.length === 0) {
    return {
      ok: true,
      procedures: [],
      message: 'Visit procedures were saved successfully.',
    }
  }

  const insertRows = normalizedProcedures.map((procedure, index) => ({
    clinic_id: profileContext.clinic_id,
    visit_id: visitId,
    patient_id: patientId,
    procedure_name: procedure.procedureName,
    tooth_or_region: procedure.toothOrRegion || null,
    quantity_or_duration: procedure.quantityOrDuration || null,
    note: procedure.note || null,
    sort_order: index,
    created_by: profileContext.id,
    updated_by: profileContext.id,
  }))

  const { data, error } = await supabase
    .from('visit_procedures')
    .insert(insertRows)
    .select(
      'id, visit_id, patient_id, procedure_name, tooth_or_region, quantity_or_duration, note, sort_order, created_at, updated_at, deleted_at',
    )
    .order('sort_order', { ascending: true })

  if (error) {
    return {
      ok: false,
      procedures: [],
      message: null,
      error: error.message ?? 'Visit procedures could not be saved.',
      reason: classifySupabaseError(error.message),
    }
  }

  return {
    ok: true,
    procedures: ((data as SupabaseVisitProcedureRow[] | null) ?? []).map(
      mapRowToProcedure,
    ),
    message: 'Visit procedures were saved successfully.',
  }
}

export async function saveVisitCompletionDraft(
  input: VisitCompletionDraftInput,
): Promise<VisitCompletionWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      draft: null,
      message: 'Demo mode only. No visit completion changes were saved.',
      warnings: [makeDemoModeWarning()],
      reason: 'demo_mode',
    }
  }

  if (!input.patientId?.trim()) {
    return {
      ok: false,
      draft: null,
      message: null,
      error: 'Patient ID is required to save a visit completion draft.',
      reason: 'validation',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      draft: null,
      message: null,
      error: 'Active profile context is required to save a visit completion draft.',
      reason: 'permission',
    }
  }

  const visitResult = await saveVisitCore(input, profileContext)

  if (visitResult.error || !visitResult.visit) {
    return {
      ok: false,
      draft: null,
      message: null,
      error: visitResult.error ?? 'Visit completion draft could not be saved.',
      reason: visitResult.reason ?? 'unknown',
    }
  }

  const procedureResult = await replaceVisitProcedures(
    visitResult.visit.id,
    input.patientId,
    input.procedures ?? [],
  )

  if (!procedureResult.ok) {
    return {
      ok: false,
      draft: null,
      message: null,
      error: procedureResult.error ?? 'Visit procedures could not be saved.',
      reason: procedureResult.reason ?? 'unknown',
      warnings: procedureResult.warnings,
    }
  }

  const warnings = [...(procedureResult.warnings ?? [])]
  const noteResult = await saveClinicalNoteForVisit(
    visitResult.visit,
    input.clinicalNote ?? '',
    profileContext,
  )

  if (noteResult.warning) {
    warnings.push(noteResult.warning)
  }

  if (noteResult.error) {
    return {
      ok: false,
      draft: null,
      message: null,
      error: noteResult.error,
      reason: classifySupabaseError(noteResult.error),
      warnings,
    }
  }

  const linkedVisit = noteResult.note
    ? await linkClinicalNoteToVisit(
        visitResult.visit.id,
        input.patientId,
        noteResult.note.id,
        profileContext,
      )
    : null

  const draft = await hydrateVisitDraft(
    linkedVisit ?? visitResult.visit,
    warnings,
  )
  const auditAction = visitResult.created
    ? 'visit.draft_created'
    : 'visit.draft_updated'
  const auditResult = await createVisitAuditLog(auditAction, draft, null)

  if (!auditResult.ok) {
    return {
      ok: false,
      draft,
      message: 'Visit draft was saved, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
      warnings: [
        ...warnings,
        {
          code: 'audit_log_failed',
          message: 'Visit draft audit log could not be recorded.',
        },
      ],
    }
  }

  return {
    ok: true,
    draft,
    message: 'Visit draft was saved successfully.',
    warnings,
  }
}

export async function completeVisit(
  input: VisitCompletionDraftInput,
): Promise<VisitCompletionWriteResult> {
  const normalizedProcedures = normalizeProcedures(input.procedures)
  const hasClinicalNote = Boolean(normalizeText(input.clinicalNote))
  const hasNextStep = Boolean(normalizeNextStep(input.nextStep))

  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      draft: null,
      message: 'Demo mode only. No visit completion changes were saved.',
      warnings: [makeDemoModeWarning()],
      reason: 'demo_mode',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()
  const canPersistClinicalNote = profileContext
    ? clinicalNoteWriteRoles.has(profileContext.role)
    : false

  if (
    normalizedProcedures.length === 0 &&
    !hasNextStep &&
    !(hasClinicalNote && canPersistClinicalNote)
  ) {
    const warnings = hasClinicalNote ? [makeClinicalNotePermissionWarning()] : []

    return {
      ok: false,
      draft: null,
      message: null,
      error:
        warnings.length > 0
          ? 'The clinical note cannot be saved by the current role. Add a procedure or next step, or ask a clinical note role to save the note.'
          : 'Add at least one performed procedure, clinical note, or next step before completing the visit.',
      reason: warnings.length > 0 ? 'permission' : 'validation',
      warnings,
    }
  }

  const draftResult = await saveVisitCompletionDraft(input)

  if (!draftResult.ok || !draftResult.draft) {
    return draftResult
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      draft: draftResult.draft,
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
      warnings: draftResult.warnings,
    }
  }

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      draft: draftResult.draft,
      message: null,
      error: 'Active profile context is required to complete a visit.',
      reason: 'permission',
      warnings: draftResult.warnings,
    }
  }

  const { data, error } = await supabase
    .from('visits')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: profileContext.id,
      updated_by: profileContext.id,
    })
    .eq('id', draftResult.draft.id)
    .eq('patient_id', input.patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, patient_id, appointment_id, status, visit_date, started_at, completed_at, completed_by, clinical_note_id, recommendation, next_step, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Visit could not be completed.'

    return {
      ok: false,
      draft: draftResult.draft,
      message: null,
      error: errorMessage,
      reason: classifySupabaseError(errorMessage),
      warnings: draftResult.warnings,
    }
  }

  const completedDraft = await hydrateVisitDraft(
    data as SupabaseVisitRow,
    draftResult.warnings ?? [],
  )
  const completionWarnings = [...(draftResult.warnings ?? [])]
  const appointmentStatusResult = await markLinkedAppointmentCompleted(
    completedDraft.appointmentId,
    input.patientId,
    profileContext,
  )

  if (!appointmentStatusResult.ok) {
    completionWarnings.push(
      makeAppointmentStatusWarning(
        appointmentStatusResult.error ??
          'Appointment status could not be updated.',
      ),
    )
  }

  const auditResult = await createVisitAuditLog(
    'visit.completed',
    completedDraft,
    mapDraftToAuditValues(draftResult.draft),
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      draft: completedDraft,
      message: 'Visit was completed, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
      warnings: [
        ...completionWarnings,
        {
          code: 'audit_log_failed',
          message: 'Visit completion audit log could not be recorded.',
        },
      ],
    }
  }

  return {
    ok: true,
    draft: completedDraft,
    message: appointmentStatusResult.ok
      ? 'Visit was completed successfully.'
      : 'Visit was completed, but the linked appointment status could not be updated.',
    warnings: completionWarnings,
  }
}
