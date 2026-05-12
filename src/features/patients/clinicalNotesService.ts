import { demoPatients } from './demoPatients'

type PatientDataSource = 'demo' | 'supabase'

export type ClinicalNoteType =
  | 'general'
  | 'examination'
  | 'diagnosis'
  | 'procedure'
  | 'follow_up'
  | 'warning'

export type ClinicalNote = {
  id: string
  patientId: string
  noteType: ClinicalNoteType
  content: string
  toothNumber: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ClinicalNoteInput = {
  noteType: ClinicalNoteType
  content: string
  toothNumber: string
}

export type ClinicalNoteWriteResult = {
  ok: boolean
  note?: ClinicalNote
  message: string | null
  error?: string
  reason?: 'demo_mode' | 'validation' | 'permission' | 'not_found' | 'audit' | 'unknown'
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

type SupabaseClinicalNoteRow = {
  id: string
  patient_id: string
  note_type: string
  content: string
  tooth_number: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export const clinicalNoteTypeOptions: Array<{
  value: ClinicalNoteType
  label: string
}> = [
  { value: 'general', label: 'General' },
  { value: 'examination', label: 'Examination' },
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'warning', label: 'Warning' },
]

const validClinicalNoteTypes = new Set<ClinicalNoteType>(
  clinicalNoteTypeOptions.map((option) => option.value),
)

const normalizeDataSource = (
  value: string | undefined,
): PatientDataSource => {
  return value?.toLowerCase() === 'supabase' ? 'supabase' : 'demo'
}

const patientDataSource = normalizeDataSource(
  import.meta.env.VITE_PATIENT_DATA_SOURCE,
)

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function normalizeNoteType(value: string): ClinicalNoteType {
  return validClinicalNoteTypes.has(value as ClinicalNoteType)
    ? (value as ClinicalNoteType)
    : 'general'
}

function mapRowToClinicalNote(row: SupabaseClinicalNoteRow): ClinicalNote {
  return {
    id: row.id,
    patientId: row.patient_id,
    noteType: normalizeNoteType(row.note_type),
    content: row.content,
    toothNumber: row.tooth_number ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function mapDemoPatientToClinicalNotes(patientId: string): ClinicalNote[] {
  const patient = demoPatients.find((demoPatient) => demoPatient.id === patientId)

  if (!patient || !patient.lastClinicalNote.trim()) {
    return []
  }

  const createdAt = patient.lastVisit ?? new Date().toISOString()

  return [
    {
      id: `demo-clinical-note-${patient.id}`,
      patientId: patient.id,
      noteType: 'general',
      content: patient.lastClinicalNote,
      toothNumber: '',
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    },
  ]
}

function mapInputToDatabaseValues(input: ClinicalNoteInput) {
  return {
    note_type: input.noteType,
    content: normalizeText(input.content),
    tooth_number: normalizeText(input.toothNumber) || null,
  }
}

function mapNoteToAuditValues(note: ClinicalNote) {
  return {
    note_type: note.noteType,
    content: note.content,
    tooth_number: note.toothNumber || null,
    deleted_at: note.deletedAt,
  }
}

function validateClinicalNoteInput(input: ClinicalNoteInput): string | null {
  if (!validClinicalNoteTypes.has(input.noteType)) {
    return 'Clinical note type is required.'
  }

  if (!normalizeText(input.content)) {
    return 'Clinical note content is required.'
  }

  return null
}

function classifyClinicalNoteError(errorMessage: string | undefined) {
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

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn('[clinicalNotesService] Supabase client unavailable.', error)

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
      '[clinicalNotesService] Could not load current profile context.',
      profileError,
    )

    return null
  }

  return (profileData as SupabaseProfileContextRow | null) ?? null
}

async function getSupabasePatientForClinicalNoteWrite(
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
    console.warn('[clinicalNotesService] Patient lookup failed.', error)
    return null
  }

  return (data as SupabasePatientRow | null) ?? null
}

async function getExistingClinicalNoteFromSupabase(
  patientId: string,
  noteId: string,
  clinicId: string,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('clinical_notes')
    .select(
      'id, patient_id, note_type, content, tooth_number, created_at, updated_at, deleted_at',
    )
    .eq('id', noteId)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.warn('[clinicalNotesService] Clinical note lookup failed.', error)
    return null
  }

  return (data as SupabaseClinicalNoteRow | null) ?? null
}

async function createClinicalNoteAuditLog(
  action:
    | 'clinical_note.created'
    | 'clinical_note.updated'
    | 'clinical_note.archived',
  note: ClinicalNote,
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
    p_entity_type: 'clinical_note',
    p_entity_id: note.id,
    p_old_values: oldValues,
    p_new_values: mapNoteToAuditValues(note),
    p_metadata: { patient_id: note.patientId },
  })

  if (error) {
    console.warn('[clinicalNotesService] Clinical note audit log failed.', error)

    return {
      ok: false,
      error: error.message ?? 'Audit log could not be recorded.',
    }
  }

  return {
    ok: true,
    error: null,
  }
}

export async function getClinicalNotes(
  patientId: string | undefined,
): Promise<ClinicalNote[]> {
  if (!patientId) {
    return []
  }

  if (patientDataSource !== 'supabase') {
    return mapDemoPatientToClinicalNotes(patientId)
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('clinical_notes')
    .select(
      'id, patient_id, note_type, content, tooth_number, created_at, updated_at, deleted_at',
    )
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('[clinicalNotesService] Clinical notes could not be loaded.', error)
    throw new Error('Clinical notes could not be loaded.')
  }

  return ((data as SupabaseClinicalNoteRow[] | null) ?? []).map(
    mapRowToClinicalNote,
  )
}

export async function getClinicalNoteById(
  patientId: string | undefined,
  noteId: string | undefined,
): Promise<ClinicalNote | null> {
  if (!patientId || !noteId) {
    return null
  }

  if (patientDataSource !== 'supabase') {
    return (
      mapDemoPatientToClinicalNotes(patientId).find((note) => note.id === noteId) ??
      null
    )
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('clinical_notes')
    .select(
      'id, patient_id, note_type, content, tooth_number, created_at, updated_at, deleted_at',
    )
    .eq('patient_id', patientId)
    .eq('id', noteId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.warn('[clinicalNotesService] Clinical note could not be loaded.', error)
    return null
  }

  return data ? mapRowToClinicalNote(data as SupabaseClinicalNoteRow) : null
}

export async function createClinicalNote(
  patientId: string,
  input: ClinicalNoteInput,
): Promise<ClinicalNoteWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No clinical note changes were saved.',
      reason: 'demo_mode',
    }
  }

  const validationError = validateClinicalNoteInput(input)

  if (!patientId?.trim() || validationError) {
    return {
      ok: false,
      message: null,
      error: validationError ?? 'Patient ID is required.',
      reason: 'validation',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      message: null,
      error: 'Active profile context is required to save clinical notes.',
      reason: 'permission',
    }
  }

  const patient = await getSupabasePatientForClinicalNoteWrite(
    patientId,
    profileContext.clinic_id,
  )

  if (!patient) {
    return {
      ok: false,
      message: null,
      error: 'Patient not found or you do not have permission to edit clinical notes.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('clinical_notes')
    .insert({
      ...mapInputToDatabaseValues(input),
      patient_id: patient.id,
      clinic_id: patient.clinic_id,
      created_by: profileContext.id,
      updated_by: profileContext.id,
    })
    .select(
      'id, patient_id, note_type, content, tooth_number, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Clinical note could not be saved.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyClinicalNoteError(errorMessage),
    }
  }

  const savedNote = mapRowToClinicalNote(data as SupabaseClinicalNoteRow)
  const auditResult = await createClinicalNoteAuditLog(
    'clinical_note.created',
    savedNote,
    null,
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      note: savedNote,
      message: 'Clinical note was saved, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    note: savedNote,
    message: 'Clinical note was saved successfully.',
  }
}

export async function updateClinicalNote(
  patientId: string,
  noteId: string,
  input: ClinicalNoteInput,
): Promise<ClinicalNoteWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No clinical note changes were saved.',
      reason: 'demo_mode',
    }
  }

  const validationError = validateClinicalNoteInput(input)

  if (!patientId?.trim() || !noteId?.trim() || validationError) {
    return {
      ok: false,
      message: null,
      error: validationError ?? 'Patient ID and clinical note ID are required.',
      reason: 'validation',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      message: null,
      error: 'Active profile context is required to save clinical notes.',
      reason: 'permission',
    }
  }

  const existingNote = await getExistingClinicalNoteFromSupabase(
    patientId,
    noteId,
    profileContext.clinic_id,
  )

  if (!existingNote) {
    return {
      ok: false,
      message: null,
      error: 'Clinical note not found or you do not have permission to edit it.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('clinical_notes')
    .update({
      ...mapInputToDatabaseValues(input),
      updated_by: profileContext.id,
    })
    .eq('id', noteId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, patient_id, note_type, content, tooth_number, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Clinical note could not be saved.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyClinicalNoteError(errorMessage),
    }
  }

  const savedNote = mapRowToClinicalNote(data as SupabaseClinicalNoteRow)
  const auditResult = await createClinicalNoteAuditLog(
    'clinical_note.updated',
    savedNote,
    mapNoteToAuditValues(mapRowToClinicalNote(existingNote)),
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      note: savedNote,
      message: 'Clinical note was saved, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    note: savedNote,
    message: 'Clinical note was saved successfully.',
  }
}

export async function archiveClinicalNote(
  patientId: string,
  noteId: string,
): Promise<ClinicalNoteWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No clinical note changes were saved.',
      reason: 'demo_mode',
    }
  }

  if (!patientId?.trim() || !noteId?.trim()) {
    return {
      ok: false,
      message: null,
      error: 'Patient ID and clinical note ID are required.',
      reason: 'validation',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      message: null,
      error: 'Active profile context is required to archive clinical notes.',
      reason: 'permission',
    }
  }

  const existingNote = await getExistingClinicalNoteFromSupabase(
    patientId,
    noteId,
    profileContext.clinic_id,
  )

  if (!existingNote) {
    return {
      ok: false,
      message: null,
      error: 'Clinical note not found or you do not have permission to edit it.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('clinical_notes')
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: profileContext.id,
    })
    .eq('id', noteId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, patient_id, note_type, content, tooth_number, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Clinical note could not be archived.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyClinicalNoteError(errorMessage),
    }
  }

  const archivedNote = mapRowToClinicalNote(data as SupabaseClinicalNoteRow)
  const auditResult = await createClinicalNoteAuditLog(
    'clinical_note.archived',
    archivedNote,
    mapNoteToAuditValues(mapRowToClinicalNote(existingNote)),
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      note: archivedNote,
      message: 'Clinical note was archived, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    note: archivedNote,
    message: 'Clinical note was archived successfully.',
  }
}
