type PatientDataSource = 'demo' | 'supabase'

export type ToothStatus =
  | 'unknown'
  | 'healthy'
  | 'missing'
  | 'caries'
  | 'filled'
  | 'crown'
  | 'implant'
  | 'root_treated'
  | 'extraction_planned'
  | 'watch'

export type ToothStatusRecord = {
  id: string
  patientId: string
  toothNumber: string
  status: ToothStatus
  note: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ToothStatusInput = {
  toothNumber: string
  status: ToothStatus
  note: string
}

export type ToothStatusWriteResult = {
  ok: boolean
  toothStatus?: ToothStatusRecord
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

type SupabaseToothStatusRow = {
  id: string
  patient_id: string
  tooth_number: string
  status: string
  note: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export const permanentToothQuadrants = [
  {
    label: 'Upper right',
    teeth: ['18', '17', '16', '15', '14', '13', '12', '11'],
  },
  {
    label: 'Upper left',
    teeth: ['21', '22', '23', '24', '25', '26', '27', '28'],
  },
  {
    label: 'Lower left',
    teeth: ['38', '37', '36', '35', '34', '33', '32', '31'],
  },
  {
    label: 'Lower right',
    teeth: ['41', '42', '43', '44', '45', '46', '47', '48'],
  },
] as const

export const permanentToothNumbers = permanentToothQuadrants.flatMap(
  (quadrant) => [...quadrant.teeth],
)

export const toothStatusOptions: Array<{
  value: ToothStatus
  label: string
}> = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'missing', label: 'Missing' },
  { value: 'caries', label: 'Caries' },
  { value: 'filled', label: 'Filled' },
  { value: 'crown', label: 'Crown' },
  { value: 'implant', label: 'Implant' },
  { value: 'root_treated', label: 'Root treated' },
  { value: 'extraction_planned', label: 'Extraction planned' },
  { value: 'watch', label: 'Watch' },
]

const validToothNumbers = new Set<string>(permanentToothNumbers)
const validToothStatuses = new Set<ToothStatus>(
  toothStatusOptions.map((option) => option.value),
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

function normalizeStatus(value: string): ToothStatus {
  return validToothStatuses.has(value as ToothStatus)
    ? (value as ToothStatus)
    : 'unknown'
}

function mapRowToToothStatus(row: SupabaseToothStatusRow): ToothStatusRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    toothNumber: row.tooth_number,
    status: normalizeStatus(row.status),
    note: row.note ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function mapInputToDatabaseValues(input: ToothStatusInput) {
  return {
    tooth_number: input.toothNumber,
    status: input.status,
    note: normalizeText(input.note) || null,
  }
}

function mapToothStatusToAuditValues(toothStatus: ToothStatusRecord) {
  return {
    tooth_number: toothStatus.toothNumber,
    status: toothStatus.status,
    note: toothStatus.note || null,
    deleted_at: toothStatus.deletedAt,
  }
}

function validateToothStatusInput(input: ToothStatusInput): string | null {
  if (!validToothNumbers.has(input.toothNumber)) {
    return 'Select a valid FDI permanent tooth number.'
  }

  if (!validToothStatuses.has(input.status)) {
    return 'Select a valid tooth status.'
  }

  return null
}

function classifyToothStatusError(errorMessage: string | undefined) {
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

function getDemoOdontogram(patientId: string): ToothStatusRecord[] {
  const createdAt = new Date('2026-01-15T10:00:00.000Z').toISOString()

  return [
    {
      id: `demo-tooth-status-${patientId}-16`,
      patientId,
      toothNumber: '16',
      status: 'filled',
      note: 'Demo-only restoration history placeholder.',
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    },
    {
      id: `demo-tooth-status-${patientId}-36`,
      patientId,
      toothNumber: '36',
      status: 'watch',
      note: 'Demo-only monitoring note.',
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    },
  ]
}

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn('[odontogramService] Supabase client unavailable.', error)

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
      '[odontogramService] Could not load current profile context.',
      profileError,
    )

    return null
  }

  return (profileData as SupabaseProfileContextRow | null) ?? null
}

async function getSupabasePatientForOdontogramWrite(
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
    console.warn('[odontogramService] Patient lookup failed.', error)
    return null
  }

  return (data as SupabasePatientRow | null) ?? null
}

async function getExistingToothStatusFromSupabase(
  patientId: string,
  toothNumber: string,
  clinicId: string,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('patient_tooth_statuses')
    .select(
      'id, patient_id, tooth_number, status, note, created_at, updated_at, deleted_at',
    )
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .eq('tooth_number', toothNumber)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.warn('[odontogramService] Tooth status lookup failed.', error)
    return null
  }

  return (data as SupabaseToothStatusRow | null) ?? null
}

async function createToothStatusAuditLog(
  action: 'odontogram.tooth_status.saved' | 'odontogram.tooth_status.cleared',
  toothStatus: ToothStatusRecord,
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
    p_entity_type: 'patient_tooth_status',
    p_entity_id: toothStatus.id,
    p_old_values: oldValues,
    p_new_values: mapToothStatusToAuditValues(toothStatus),
    p_metadata: {
      patient_id: toothStatus.patientId,
      tooth_number: toothStatus.toothNumber,
    },
  })

  if (error) {
    console.warn('[odontogramService] Tooth status audit log failed.', error)

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

export async function getPatientOdontogram(
  patientId: string | undefined,
): Promise<ToothStatusRecord[]> {
  if (!patientId) {
    return []
  }

  if (patientDataSource !== 'supabase') {
    return getDemoOdontogram(patientId)
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('patient_tooth_statuses')
    .select(
      'id, patient_id, tooth_number, status, note, created_at, updated_at, deleted_at',
    )
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('tooth_number', { ascending: true })

  if (error) {
    console.warn('[odontogramService] Odontogram could not be loaded.', error)
    throw new Error('Odontogram could not be loaded.')
  }

  return ((data as SupabaseToothStatusRow[] | null) ?? []).map(
    mapRowToToothStatus,
  )
}

export async function saveToothStatus(
  patientId: string,
  input: ToothStatusInput,
): Promise<ToothStatusWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No odontogram changes were saved.',
      reason: 'demo_mode',
    }
  }

  const validationError = validateToothStatusInput(input)

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
      error: 'Active profile context is required to save odontogram statuses.',
      reason: 'permission',
    }
  }

  const patient = await getSupabasePatientForOdontogramWrite(
    patientId,
    profileContext.clinic_id,
  )

  if (!patient) {
    return {
      ok: false,
      message: null,
      error: 'Patient not found or you do not have permission to edit the odontogram.',
      reason: 'not_found',
    }
  }

  const existingStatus = await getExistingToothStatusFromSupabase(
    patientId,
    input.toothNumber,
    profileContext.clinic_id,
  )

  const databaseValues = mapInputToDatabaseValues(input)
  const writeQuery = existingStatus
    ? supabase
        .from('patient_tooth_statuses')
        .update({
          ...databaseValues,
          updated_by: profileContext.id,
        })
        .eq('id', existingStatus.id)
        .eq('clinic_id', profileContext.clinic_id)
        .select(
          'id, patient_id, tooth_number, status, note, created_at, updated_at, deleted_at',
        )
        .single()
    : supabase
        .from('patient_tooth_statuses')
        .insert({
          ...databaseValues,
          patient_id: patient.id,
          clinic_id: patient.clinic_id,
          created_by: profileContext.id,
          updated_by: profileContext.id,
        })
        .select(
          'id, patient_id, tooth_number, status, note, created_at, updated_at, deleted_at',
        )
        .single()

  const { data, error } = await writeQuery

  if (error || !data) {
    const errorMessage = error?.message ?? 'Tooth status could not be saved.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyToothStatusError(errorMessage),
    }
  }

  const savedToothStatus = mapRowToToothStatus(data as SupabaseToothStatusRow)
  const auditResult = await createToothStatusAuditLog(
    'odontogram.tooth_status.saved',
    savedToothStatus,
    existingStatus
      ? mapToothStatusToAuditValues(mapRowToToothStatus(existingStatus))
      : null,
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      toothStatus: savedToothStatus,
      message: 'Tooth status was saved, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    toothStatus: savedToothStatus,
    message: 'Tooth status was saved successfully.',
  }
}

export async function clearToothStatus(
  patientId: string,
  toothNumber: string,
): Promise<ToothStatusWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No odontogram changes were saved.',
      reason: 'demo_mode',
    }
  }

  if (!patientId?.trim() || !validToothNumbers.has(toothNumber)) {
    return {
      ok: false,
      message: null,
      error: 'Patient ID and a valid tooth number are required.',
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
      error: 'Active profile context is required to clear odontogram statuses.',
      reason: 'permission',
    }
  }

  const existingStatus = await getExistingToothStatusFromSupabase(
    patientId,
    toothNumber,
    profileContext.clinic_id,
  )

  if (!existingStatus) {
    return {
      ok: true,
      message: 'No saved tooth status was found to clear.',
    }
  }

  const { data, error } = await supabase
    .from('patient_tooth_statuses')
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: profileContext.id,
    })
    .eq('id', existingStatus.id)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, patient_id, tooth_number, status, note, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Tooth status could not be cleared.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyToothStatusError(errorMessage),
    }
  }

  const clearedToothStatus = mapRowToToothStatus(data as SupabaseToothStatusRow)
  const auditResult = await createToothStatusAuditLog(
    'odontogram.tooth_status.cleared',
    clearedToothStatus,
    mapToothStatusToAuditValues(mapRowToToothStatus(existingStatus)),
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      toothStatus: clearedToothStatus,
      message: 'Tooth status was cleared, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    toothStatus: clearedToothStatus,
    message: 'Tooth status was cleared successfully.',
  }
}
