import { demoPatients } from './demoPatients'
import type { DemoPatient, PatientStatus } from './types'
import type { PatientFormValues } from './patientFormValues'

type PatientDataSource = 'demo' | 'supabase'

type SupabasePatientRow = {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  phone: string
  email: string | null
  status: string
  important_note: string | null
  clinic_id: string
  deleted_at: string | null
}

type SupabaseMedicalRecordRow = {
  anamnesis_summary: string | null
  allergies: string | null
  current_medications: string | null
  medical_warnings: string | null
  dental_history: string | null
  risk_notes: string | null
}

type SupabaseClinicalNoteRow = {
  id: string
  content: string
  created_at: string
}

type SupabaseProfileContextRow = {
  id: string
  auth_user_id: string
  clinic_id: string
  role: string
  status: string
}

const clonePatients = (patients: DemoPatient[]) =>
  patients.map((patient) => ({ ...patient }))

const normalizeDataSource = (
  value: string | undefined,
): PatientDataSource => {
  return value?.toLowerCase() === 'supabase' ? 'supabase' : 'demo'
}

const patientDataSource = normalizeDataSource(
  import.meta.env.VITE_PATIENT_DATA_SOURCE,
)

const demoPatientSupabaseIdsByRouteId: Record<string, string> = {
  'demo-patient-001': '22222222-2222-2222-2222-222222222201',
  'demo-patient-002': '22222222-2222-2222-2222-222222222202',
  'demo-patient-003': '22222222-2222-2222-2222-222222222203',
  'demo-patient-004': '22222222-2222-2222-2222-222222222204',
  'demo-patient-005': '22222222-2222-2222-2222-222222222205',
}

const demoPatientRouteIdsBySupabaseId = Object.fromEntries(
  Object.entries(demoPatientSupabaseIdsByRouteId).map(
    ([routeId, supabaseId]) => [supabaseId, routeId],
  ),
) as Record<string, string>

const matchesSearch = (patient: DemoPatient, normalizedSearch: string) => {
  if (!normalizedSearch) {
    return true
  }

  return [
    patient.firstName,
    patient.lastName,
    patient.phone,
    patient.email,
  ].some((value) => value.toLowerCase().includes(normalizedSearch))
}

const mapPatientStatus = (status: string): DemoPatient['status'] => {
  if (status === 'active' || status === 'inactive' || status === 'archived') {
    return status
  }

  return 'inactive'
}

const normalizeDateOfBirth = (value: string | null) => {
  return value ?? '1970-01-01'
}

export function getPatientRouteId(patientId: string | null | undefined) {
  const normalizedPatientId = patientId?.trim() ?? ''

  if (!normalizedPatientId) {
    return ''
  }

  return (
    demoPatientRouteIdsBySupabaseId[normalizedPatientId] ?? normalizedPatientId
  )
}

export function getPatientPersistenceId(patientId: string | null | undefined) {
  const normalizedPatientId = patientId?.trim() ?? ''

  if (!normalizedPatientId) {
    return ''
  }

  return (
    demoPatientSupabaseIdsByRouteId[normalizedPatientId] ?? normalizedPatientId
  )
}

const mapSupabasePatientToDemoPatient = (
  patient: SupabasePatientRow,
  options?: {
    medicalRecord?: SupabaseMedicalRecordRow | null
    latestClinicalNote?: SupabaseClinicalNoteRow | null
  },
): DemoPatient => {
  const medicalWarnings = options?.medicalRecord?.medical_warnings
    ? [options.medicalRecord.medical_warnings]
    : []

  const timelineEvents = options?.latestClinicalNote
    ? [
        {
          id: `clinical-note-${options.latestClinicalNote.id}`,
          label: 'Demo clinical note recorded',
          date: options.latestClinicalNote.created_at,
          description:
            'Demo timeline event loaded from Supabase clinical note for local testing.',
        },
      ]
    : []

  return {
    id: patient.id,
    firstName: patient.first_name,
    lastName: patient.last_name,
    phone: patient.phone,
    email: patient.email ?? '',
    dateOfBirth: normalizeDateOfBirth(patient.date_of_birth),
    status: mapPatientStatus(patient.status),
    deletedAt: patient.deleted_at,
    nextAppointment: null,
    lastVisit: options?.latestClinicalNote?.created_at ?? null,
    activeTreatmentPlan: null,
    importantNote: patient.important_note,
    unpaidBalance: 0,
    medicalWarnings,
    anamnesisSummary:
      options?.medicalRecord?.anamnesis_summary ??
      'Demo anamnesis summary placeholder for Supabase mode.',
    allergies: options?.medicalRecord?.allergies ?? '',
    currentMedications: options?.medicalRecord?.current_medications ?? '',
    dentalHistorySummary:
      options?.medicalRecord?.dental_history ??
      'Demo dental history placeholder for Supabase mode.',
    riskNotes: options?.medicalRecord?.risk_notes ?? '',
    lastClinicalNote:
      options?.latestClinicalNote?.content ??
      'No demo clinical note found for this patient yet.',
    activeTreatmentPlanSummary: 'No active demo treatment plan in this phase.',
    nextRecommendedStep:
      'Demo next step - patient persistence read path validation only.',
    recentVisitSummary:
      options?.latestClinicalNote?.content ??
      'No recent demo visit summary found for this patient yet.',
    documentsCount: 0,
    timelineEvents,
  }
}

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn(
      '[patientService] Supabase client is unavailable. Falling back to demo patient data.',
      error,
    )

    return null
  }
}

async function hasSupabaseSession() {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return false
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.warn(
      '[patientService] Unable to read Supabase auth session. Falling back to demo patient data.',
      error,
    )

    return false
  }

  if (!data.session) {
    console.info(
      '[patientService] No Supabase auth session found. Using demo patient data in this phase.',
    )

    return false
  }

  return true
}

async function getCurrentSupabaseProfileContext() {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !sessionData.session) {
    return null
  }

  const authUserId = sessionData.session.user.id

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, auth_user_id, clinic_id, role, status')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (profileError) {
    console.warn(
      '[patientService] Could not load current profile context for Supabase read diagnosis.',
      profileError,
    )

    return null
  }

  if (!profileData) {
    console.warn(
      '[patientService] No profile found for authenticated user. Supabase patient reads will fall back to demo data.',
    )

    return null
  }

  return profileData as SupabaseProfileContextRow
}

type GetPatientsOptions = {
  includeArchived?: boolean
}

async function getPatientsFromSupabase(
  options: GetPatientsOptions = {},
): Promise<DemoPatient[]> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return clonePatients(demoPatients)
  }

  const hasSession = await hasSupabaseSession()

  if (!hasSession) {
    return clonePatients(demoPatients)
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext) {
    return clonePatients(demoPatients)
  }

  if (profileContext.status !== 'active') {
    console.warn(
      '[patientService] Profile is not active. Supabase patient reads will fall back to demo data.',
      profileContext,
    )

    return clonePatients(demoPatients)
  }

  console.info(
    '[patientService] Supabase read context:',
    {
      authUserId: profileContext.auth_user_id,
      clinicId: profileContext.clinic_id,
      role: profileContext.role,
      status: profileContext.status,
    },
  )

  let query = supabase
    .from('patients')
    .select(
      'id, first_name, last_name, date_of_birth, phone, email, status, important_note, clinic_id, deleted_at',
    )
    .eq('clinic_id', profileContext.clinic_id)

  if (!options.includeArchived) {
    query = query.is('deleted_at', null).neq('status', 'archived')
  }

  const { data, error } = await query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (error) {
    console.warn(
      '[patientService] Supabase patient list read failed. Falling back to demo patient data.',
      error,
    )

    return clonePatients(demoPatients)
  }

  return (data ?? []).map((patient) =>
    mapSupabasePatientToDemoPatient(patient as SupabasePatientRow),
  )
}

async function getPatientByIdFromSupabase(
  patientId: string,
): Promise<DemoPatient | undefined> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return demoPatients.find((patient) => patient.id === patientId)
  }

  const hasSession = await hasSupabaseSession()

  if (!hasSession) {
    return demoPatients.find((patient) => patient.id === patientId)
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext) {
    return demoPatients.find((patient) => patient.id === patientId)
  }

  if (profileContext.status !== 'active') {
    return demoPatients.find((patient) => patient.id === patientId)
  }

  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select(
      'id, first_name, last_name, date_of_birth, phone, email, status, important_note, clinic_id, deleted_at',
    )
    .eq('id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .maybeSingle()

  if (patientError) {
    console.warn(
      '[patientService] Supabase patient detail read failed. Falling back to demo patient data.',
      patientError,
    )

    return demoPatients.find((patient) => patient.id === patientId)
  }

  if (!patientData) {
    return demoPatients.find((patient) => patient.id === patientId)
  }

  const patient = patientData as SupabasePatientRow

  const [{ data: medicalRecordData }, { data: clinicalNoteData }] =
    await Promise.all([
      supabase
        .from('patient_medical_records')
        .select(
          'anamnesis_summary, allergies, current_medications, medical_warnings, dental_history, risk_notes',
        )
        .eq('clinic_id', patient.clinic_id)
        .eq('patient_id', patient.id)
        .maybeSingle(),
      supabase
        .from('clinical_notes')
        .select('id, content, created_at')
        .eq('clinic_id', patient.clinic_id)
        .eq('patient_id', patient.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  return mapSupabasePatientToDemoPatient(patient, {
    medicalRecord: (medicalRecordData as SupabaseMedicalRecordRow | null) ?? null,
    latestClinicalNote: (clinicalNoteData as SupabaseClinicalNoteRow | null) ?? null,
  })
}

export async function getPatients(
  options: GetPatientsOptions = {},
): Promise<DemoPatient[]> {
  if (patientDataSource === 'supabase') {
    return getPatientsFromSupabase(options)
  }

  const patients = options.includeArchived
    ? demoPatients
    : demoPatients.filter((patient) => patient.status !== 'archived')

  return clonePatients(patients)
}

export async function getPatientById(
  patientId: string | undefined,
): Promise<DemoPatient | undefined> {
  if (!patientId) {
    return undefined
  }

  if (patientDataSource === 'supabase') {
    return getPatientByIdFromSupabase(patientId)
  }

  return demoPatients.find((patient) => patient.id === patientId)
}

export async function searchPatients(query: string): Promise<DemoPatient[]> {
  const normalizedSearch = query.trim().toLowerCase()

  if (patientDataSource === 'supabase') {
    // Keep search simple for local MVP and avoid complex server-side OR query handling.
    const patients = await getPatientsFromSupabase({ includeArchived: true })

    return clonePatients(
      patients.filter((patient) => matchesSearch(patient, normalizedSearch)),
    )
  }

  return clonePatients(
    demoPatients.filter((patient) => matchesSearch(patient, normalizedSearch)),
  )
}

// Patient write service layer and audit integration

type PatientWriteResult = {
  ok: boolean
  patientId?: string
  message: string | null
  error?: string
  reason?: 'demo_mode' | 'permission' | 'not_found' | 'audit' | 'unknown'
}

type AuditWriteResult = {
  ok: boolean
  auditLogId: string | null
  error: string | null
}

type PatientCreateInput = PatientFormValues

type PatientUpdateInput = Partial<PatientCreateInput>

interface PatientInsertRow {
  first_name: string
  last_name: string
  phone: string
  email: string | null
  date_of_birth: string | null
  status: PatientStatus
  important_note: string | null
  clinic_id: string
  created_by: string
  updated_by: string
}

interface PatientUpdateRow {
  first_name?: string
  last_name?: string
  phone?: string
  email?: string | null
  date_of_birth?: string | null
  status?: PatientStatus
  important_note?: string | null
  deleted_at?: string | null
  updated_by: string
}

function validatePatientCreateInput(input: PatientCreateInput): string | null {
  const firstName = input.firstName?.trim()
  const lastName = input.lastName?.trim()
  const phone = input.phone?.trim()
  const status = input.status

  if (!firstName) {
    return 'Patient first name is required.'
  }

  if (!lastName) {
    return 'Patient last name is required.'
  }

  if (!phone) {
    return 'Patient phone number is required.'
  }

  if (!status) {
    return 'Patient status is required.'
  }

  return null
}

function mapFormValuesToDatabaseRow(
  input: PatientCreateInput,
  clinicId: string,
  currentProfileId: string,
): PatientInsertRow {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone,
    email: input.email?.trim() ? input.email : null,
    date_of_birth: input.dateOfBirth ?? null,
    status: input.status,
    important_note: input.importantNote?.trim() ?? null,
    clinic_id: clinicId,
    created_by: currentProfileId,
    updated_by: currentProfileId,
  }
}

function mapFormValuesToUpdateRow(
  input: PatientUpdateInput,
  currentProfileId: string,
): PatientUpdateRow {
  const updateRow: PatientUpdateRow = {
    updated_by: currentProfileId,
  }

  if (input.firstName !== undefined) {
    updateRow.first_name = input.firstName
  }

  if (input.lastName !== undefined) {
    updateRow.last_name = input.lastName
  }

  if (input.phone !== undefined) {
    updateRow.phone = input.phone
  }

  if (input.email !== undefined) {
    updateRow.email = input.email?.trim() ? input.email : null
  }

  if (input.dateOfBirth !== undefined) {
    updateRow.date_of_birth = input.dateOfBirth ?? null
  }

  if (input.status !== undefined) {
    updateRow.status = input.status
  }

  if (input.importantNote !== undefined) {
    updateRow.important_note = input.importantNote?.trim() ?? null
  }

  return updateRow
}

async function createPatientAuditLog(
  patientId: string,
  newValues: Record<string, unknown>,
): Promise<AuditWriteResult> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    console.warn(
      '[patientService] Unable to create audit log: Supabase client unavailable.',
    )

    return {
      ok: false,
      auditLogId: null,
      error: 'Supabase client unavailable for audit logging.',
    }
  }

  const { data, error } = await supabase.rpc('create_audit_log', {
    p_action: 'patient.created',
    p_entity_type: 'patient',
    p_entity_id: patientId,
    p_old_values: null,
    p_new_values: newValues,
    p_metadata: null,
  })

  if (error) {
    console.warn('[patientService] Failed to create audit log for patient create:', error)

    return {
      ok: false,
      auditLogId: null,
      error: error.message ?? 'Failed to create patient.created audit log.',
    }
  }

  console.info('[patientService] Audit log created for patient create:', data)

  return {
    ok: true,
    auditLogId: data,
    error: null,
  }
}

async function updatePatientAuditLog(
  patientId: string,
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown>,
): Promise<AuditWriteResult> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    console.warn(
      '[patientService] Unable to create audit log: Supabase client unavailable.',
    )

    return {
      ok: false,
      auditLogId: null,
      error: 'Supabase client unavailable for audit logging.',
    }
  }

  const { data, error } = await supabase.rpc('create_audit_log', {
    p_action: 'patient.updated',
    p_entity_type: 'patient',
    p_entity_id: patientId,
    p_old_values: oldValues,
    p_new_values: newValues,
    p_metadata: null,
  })

  if (error) {
    console.warn('[patientService] Failed to create audit log for patient update:', error)

    return {
      ok: false,
      auditLogId: null,
      error: error.message ?? 'Failed to create patient.updated audit log.',
    }
  }

  console.info('[patientService] Audit log created for patient update:', data)

  return {
    ok: true,
    auditLogId: data,
    error: null,
  }
}

function mapPatientRowToAuditValues(patient: {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  date_of_birth: string | null
  status: string
  important_note: string | null
  deleted_at: string | null
}) {
  return {
    id: patient.id,
    first_name: patient.first_name,
    last_name: patient.last_name,
    phone: patient.phone,
    email: patient.email,
    date_of_birth: patient.date_of_birth,
    status: patient.status,
    important_note: patient.important_note,
    deleted_at: patient.deleted_at,
  }
}

async function createPatientLifecycleAuditLog(
  action: 'patient.archived' | 'patient.restored',
  patientId: string,
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown>,
): Promise<AuditWriteResult> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      auditLogId: null,
      error: 'Supabase client unavailable for audit logging.',
    }
  }

  const { data, error } = await supabase.rpc('create_audit_log', {
    p_action: action,
    p_entity_type: 'patient',
    p_entity_id: patientId,
    p_old_values: oldValues,
    p_new_values: newValues,
    p_metadata: null,
  })

  if (error) {
    console.warn(`[patientService] Failed to create audit log for ${action}:`, error)

    return {
      ok: false,
      auditLogId: null,
      error: error.message ?? `Failed to create ${action} audit log.`,
    }
  }

  return {
    ok: true,
    auditLogId: data,
    error: null,
  }
}

async function updatePatientArchiveState(
  patientId: string,
  action: 'archive' | 'restore',
): Promise<PatientWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      patientId,
      message: 'Demo mode only. No archive changes were saved.',
      reason: 'demo_mode',
    }
  }

  if (!patientId?.trim()) {
    return {
      ok: false,
      message: null,
      error: 'Patient ID is required.',
      reason: 'unknown',
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
      error: 'Active profile context is required to update patient archive state.',
      reason: 'permission',
    }
  }

  const { data: currentPatient, error: fetchError } = await supabase
    .from('patients')
    .select(
      'id, first_name, last_name, phone, email, date_of_birth, status, important_note, clinic_id, deleted_at',
    )
    .eq('id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .maybeSingle()

  if (fetchError) {
    return {
      ok: false,
      message: null,
      error: 'Patient could not be loaded for archive state update.',
      reason: 'unknown',
    }
  }

  if (!currentPatient) {
    return {
      ok: false,
      message: null,
      error: 'Patient not found or you do not have permission to update it.',
      reason: 'not_found',
    }
  }

  const nextDeletedAt = action === 'archive' ? new Date().toISOString() : null
  const nextStatus: PatientStatus = action === 'archive' ? 'archived' : 'active'

  const { data: updatedPatient, error: updateError } = await supabase
    .from('patients')
    .update({
      status: nextStatus,
      deleted_at: nextDeletedAt,
      updated_by: profileContext.id,
    })
    .eq('id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .select(
      'id, first_name, last_name, phone, email, date_of_birth, status, important_note, deleted_at',
    )
    .single()

  if (updateError || !updatedPatient) {
    const errorMessage = updateError?.message ?? 'Patient archive state could not be updated.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason:
        errorMessage.toLowerCase().includes('row-level security') ||
        errorMessage.toLowerCase().includes('permission')
          ? 'permission'
          : 'unknown',
    }
  }

  const auditAction =
    action === 'archive' ? 'patient.archived' : 'patient.restored'
  const auditResult = await createPatientLifecycleAuditLog(
    auditAction,
    patientId,
    mapPatientRowToAuditValues(currentPatient),
    mapPatientRowToAuditValues(updatedPatient),
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      patientId,
      message:
        action === 'archive'
          ? 'Patient was archived, but audit log could not be recorded.'
          : 'Patient was restored, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    patientId,
    message:
      action === 'archive'
        ? 'Patient was archived successfully.'
        : 'Patient was restored successfully.',
  }
}

export async function createPatient(
  input: PatientCreateInput,
): Promise<PatientWriteResult> {
  // Demo mode check
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: null,
      error: 'Supabase persistence is not enabled in demo mode. Configure VITE_PATIENT_DATA_SOURCE=supabase to enable patient creation.',
    }
  }

  // Input validation
  const validationError = validatePatientCreateInput(input)

  if (validationError) {
    return {
      ok: false,
      message: null,
      error: validationError,
    }
  }

  // Get Supabase client and profile context
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      message: null,
      error: 'Supabase client is not available.',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      message: null,
      error: 'Active profile context is required to create patients.',
    }
  }

  // Map form values to database row
  const insertRow = mapFormValuesToDatabaseRow(
    input,
    profileContext.clinic_id,
    profileContext.id,
  )

  // Insert patient into Supabase
  const { data: insertData, error: insertError } = await supabase
    .from('patients')
    .insert([insertRow])
    .select('id, first_name, last_name, phone, email, date_of_birth, status, important_note')
    .single()

  if (insertError) {
    const errorMessage = insertError.message || 'Failed to create patient.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
    }
  }

  if (!insertData) {
    return {
      ok: false,
      message: null,
      error: 'Patient was created but no data was returned.',
    }
  }

  const patientId = insertData.id as string

  // Create audit log
  const auditValues = {
    id: patientId,
    first_name: insertData.first_name,
    last_name: insertData.last_name,
    phone: insertData.phone,
    email: insertData.email,
    date_of_birth: insertData.date_of_birth,
    status: insertData.status,
    important_note: insertData.important_note,
  }

  const auditResult = await createPatientAuditLog(patientId, auditValues)

  if (!auditResult.ok) {
    return {
      ok: false,
      patientId,
      message: 'Patient was saved, but audit log could not be recorded.',
      error: 'Patient was saved, but audit log could not be recorded.',
    }
  }

  return {
    ok: true,
    patientId,
    message: null,
  }
}

export async function updatePatient(
  patientId: string,
  input: PatientUpdateInput,
): Promise<PatientWriteResult> {
  // Demo mode check
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: null,
      error: 'Supabase persistence is not enabled in demo mode. Configure VITE_PATIENT_DATA_SOURCE=supabase to enable patient updates.',
    }
  }

  // Validate patientId
  if (!patientId?.trim()) {
    return {
      ok: false,
      message: null,
      error: 'Patient ID is required to update a patient.',
    }
  }

  // Get Supabase client and profile context
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      message: null,
      error: 'Supabase client is not available.',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      message: null,
      error: 'Active profile context is required to update patients.',
    }
  }

  // Fetch current patient data for audit old_values
  const { data: currentPatient, error: fetchError } = await supabase
    .from('patients')
    .select(
      'id, first_name, last_name, phone, email, date_of_birth, status, important_note, clinic_id',
    )
    .eq('id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .maybeSingle()

  if (fetchError) {
    return {
      ok: false,
      message: null,
      error: 'Failed to fetch current patient data for update.',
    }
  }

  if (!currentPatient) {
    return {
      ok: false,
      message: null,
      error: 'Patient not found or you do not have permission to update it.',
    }
  }

  // Map form values to update row
  const updateRow = mapFormValuesToUpdateRow(input, profileContext.id)

  // Update patient
  const { data: updateData, error: updateError } = await supabase
    .from('patients')
    .update(updateRow)
    .eq('id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, first_name, last_name, phone, email, date_of_birth, status, important_note',
    )
    .single()

  if (updateError) {
    const errorMessage = updateError.message || 'Failed to update patient.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
    }
  }

  if (!updateData) {
    return {
      ok: false,
      message: null,
      error: 'Patient was updated but no data was returned.',
    }
  }

  // Build old and new values for audit
  const oldAuditValues = {
    first_name: currentPatient.first_name,
    last_name: currentPatient.last_name,
    phone: currentPatient.phone,
    email: currentPatient.email,
    date_of_birth: currentPatient.date_of_birth,
    status: currentPatient.status,
    important_note: currentPatient.important_note,
  }

  const newAuditValues = {
    first_name: updateData.first_name,
    last_name: updateData.last_name,
    phone: updateData.phone,
    email: updateData.email,
    date_of_birth: updateData.date_of_birth,
    status: updateData.status,
    important_note: updateData.important_note,
  }

  // Create audit log
  const auditResult = await updatePatientAuditLog(
    patientId,
    oldAuditValues,
    newAuditValues,
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      patientId,
      message: 'Patient was updated, but audit log could not be recorded.',
      error: 'Patient was updated, but audit log could not be recorded.',
    }
  }

  return {
    ok: true,
    patientId,
    message: null,
  }
}

export async function archivePatient(
  patientId: string,
): Promise<PatientWriteResult> {
  return updatePatientArchiveState(patientId, 'archive')
}

export async function restorePatient(
  patientId: string,
): Promise<PatientWriteResult> {
  return updatePatientArchiveState(patientId, 'restore')
}
