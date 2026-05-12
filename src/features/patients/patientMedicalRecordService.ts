import { demoPatients } from './demoPatients'

type PatientDataSource = 'demo' | 'supabase'

export type PatientMedicalRecord = {
  id: string | null
  patientId: string
  anamnesisSummary: string
  allergies: string
  currentMedications: string
  medicalWarnings: string
  dentalHistory: string
  riskNotes: string
}

export type PatientMedicalRecordInput = Omit<
  PatientMedicalRecord,
  'id' | 'patientId'
>

export type PatientMedicalRecordSaveResult = {
  ok: boolean
  record?: PatientMedicalRecord
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

type SupabaseMedicalRecordRow = {
  id: string
  patient_id: string
  anamnesis_summary: string | null
  allergies: string | null
  current_medications: string | null
  medical_warnings: string | null
  dental_history: string | null
  risk_notes: string | null
}

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

function hasAnyRecordValue(input: PatientMedicalRecordInput) {
  return Object.values(input).some((value) => normalizeText(value).length > 0)
}

function mapRowToMedicalRecord(
  row: SupabaseMedicalRecordRow,
): PatientMedicalRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    anamnesisSummary: row.anamnesis_summary ?? '',
    allergies: row.allergies ?? '',
    currentMedications: row.current_medications ?? '',
    medicalWarnings: row.medical_warnings ?? '',
    dentalHistory: row.dental_history ?? '',
    riskNotes: row.risk_notes ?? '',
  }
}

function mapDemoPatientToMedicalRecord(
  patientId: string,
): PatientMedicalRecord | null {
  const patient = demoPatients.find((demoPatient) => demoPatient.id === patientId)

  if (!patient) {
    return null
  }

  return {
    id: null,
    patientId: patient.id,
    anamnesisSummary: patient.anamnesisSummary,
    allergies: patient.allergies,
    currentMedications: patient.currentMedications,
    medicalWarnings: patient.medicalWarnings.join('\n'),
    dentalHistory: patient.dentalHistorySummary,
    riskNotes: patient.riskNotes,
  }
}

function mapInputToDatabaseValues(input: PatientMedicalRecordInput) {
  return {
    anamnesis_summary: normalizeText(input.anamnesisSummary) || null,
    allergies: normalizeText(input.allergies) || null,
    current_medications: normalizeText(input.currentMedications) || null,
    medical_warnings: normalizeText(input.medicalWarnings) || null,
    dental_history: normalizeText(input.dentalHistory) || null,
    risk_notes: normalizeText(input.riskNotes) || null,
  }
}

function mapRecordToAuditValues(record: PatientMedicalRecord) {
  return {
    anamnesis_summary: record.anamnesisSummary || null,
    allergies: record.allergies || null,
    current_medications: record.currentMedications || null,
    medical_warnings: record.medicalWarnings || null,
    dental_history: record.dentalHistory || null,
    risk_notes: record.riskNotes || null,
  }
}

function classifySaveError(errorMessage: string | undefined) {
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
    console.warn('[patientMedicalRecordService] Supabase client unavailable.', error)

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
      '[patientMedicalRecordService] Could not load current profile context.',
      profileError,
    )

    return null
  }

  return (profileData as SupabaseProfileContextRow | null) ?? null
}

async function getSupabasePatientForRecordSave(
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
    console.warn('[patientMedicalRecordService] Patient lookup failed.', error)
    return null
  }

  return (data as SupabasePatientRow | null) ?? null
}

async function getExistingMedicalRecordFromSupabase(patientId: string) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('patient_medical_records')
    .select(
      'id, patient_id, anamnesis_summary, allergies, current_medications, medical_warnings, dental_history, risk_notes',
    )
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) {
    console.warn(
      '[patientMedicalRecordService] Medical record lookup failed.',
      error,
    )
    return null
  }

  return (data as SupabaseMedicalRecordRow | null) ?? null
}

async function createMedicalRecordAuditLog(
  action: 'patient_medical_record.created' | 'patient_medical_record.updated',
  record: PatientMedicalRecord,
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
    p_entity_type: 'patient_medical_record',
    p_entity_id: record.id,
    p_old_values: oldValues,
    p_new_values: mapRecordToAuditValues(record),
    p_metadata: { patient_id: record.patientId },
  })

  if (error) {
    console.warn(
      '[patientMedicalRecordService] Medical record audit log failed.',
      error,
    )

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

export async function getPatientMedicalRecord(
  patientId: string | undefined,
): Promise<PatientMedicalRecord | null> {
  if (!patientId) {
    return null
  }

  if (patientDataSource !== 'supabase') {
    return mapDemoPatientToMedicalRecord(patientId)
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('patient_medical_records')
    .select(
      'id, patient_id, anamnesis_summary, allergies, current_medications, medical_warnings, dental_history, risk_notes',
    )
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) {
    console.warn(
      '[patientMedicalRecordService] Medical record could not be loaded.',
      error,
    )

    return null
  }

  return data ? mapRowToMedicalRecord(data as SupabaseMedicalRecordRow) : null
}

export async function savePatientMedicalRecord(
  patientId: string,
  input: PatientMedicalRecordInput,
): Promise<PatientMedicalRecordSaveResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No medical record changes were saved.',
      reason: 'demo_mode',
    }
  }

  if (!patientId?.trim()) {
    return {
      ok: false,
      message: null,
      error: 'Patient ID is required.',
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
      error: 'Active profile context is required to save medical records.',
      reason: 'permission',
    }
  }

  const patient = await getSupabasePatientForRecordSave(
    patientId,
    profileContext.clinic_id,
  )

  if (!patient) {
    return {
      ok: false,
      message: null,
      error: 'Patient not found or you do not have permission to edit it.',
      reason: 'not_found',
    }
  }

  const existingRecord = await getExistingMedicalRecordFromSupabase(patientId)
  const databaseValues = mapInputToDatabaseValues(input)

  if (!existingRecord && !hasAnyRecordValue(input)) {
    return {
      ok: false,
      message: null,
      error: 'Enter at least one medical record field before creating a record.',
      reason: 'validation',
    }
  }

  if (existingRecord) {
    const { data, error } = await supabase
      .from('patient_medical_records')
      .update({
        ...databaseValues,
        updated_by: profileContext.id,
      })
      .eq('id', existingRecord.id)
      .eq('clinic_id', profileContext.clinic_id)
      .select(
        'id, patient_id, anamnesis_summary, allergies, current_medications, medical_warnings, dental_history, risk_notes',
      )
      .single()

    if (error || !data) {
      const errorMessage = error?.message ?? 'Medical record could not be saved.'

      return {
        ok: false,
        message: null,
        error: errorMessage,
        reason: classifySaveError(errorMessage),
      }
    }

    const savedRecord = mapRowToMedicalRecord(data as SupabaseMedicalRecordRow)
    const auditResult = await createMedicalRecordAuditLog(
      'patient_medical_record.updated',
      savedRecord,
      mapRecordToAuditValues(mapRowToMedicalRecord(existingRecord)),
    )

    if (!auditResult.ok) {
      return {
        ok: false,
        record: savedRecord,
        message: 'Medical record was saved, but audit log could not be recorded.',
        error: auditResult.error ?? 'Audit log could not be recorded.',
        reason: 'audit',
      }
    }

    return {
      ok: true,
      record: savedRecord,
      message: 'Medical record was saved successfully.',
    }
  }

  const { data, error } = await supabase
    .from('patient_medical_records')
    .insert({
      ...databaseValues,
      patient_id: patient.id,
      clinic_id: patient.clinic_id,
      created_by: profileContext.id,
      updated_by: profileContext.id,
    })
    .select(
      'id, patient_id, anamnesis_summary, allergies, current_medications, medical_warnings, dental_history, risk_notes',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Medical record could not be saved.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifySaveError(errorMessage),
    }
  }

  const savedRecord = mapRowToMedicalRecord(data as SupabaseMedicalRecordRow)
  const auditResult = await createMedicalRecordAuditLog(
    'patient_medical_record.created',
    savedRecord,
    null,
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      record: savedRecord,
      message: 'Medical record was saved, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    record: savedRecord,
    message: 'Medical record was saved successfully.',
  }
}
