type PatientDataSource = 'demo' | 'supabase'

export type AppointmentStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type Appointment = {
  id: string
  clinic_id: string
  patient_id: string
  scheduled_start: string
  scheduled_end: string | null
  status: AppointmentStatus
  reason: string | null
  notes: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type AppointmentPatientSummary = {
  id: string
  fullName: string
  phone?: string | null
  email?: string | null
}

export type AppointmentRangeItem = Appointment & {
  patient: AppointmentPatientSummary | null
}

export type AppointmentLinkedVisitSummary = {
  id: string
  patientId: string
  status: string
  visitDate: string
  completedAt: string | null
}

export type AppointmentDetail = Appointment & {
  patient: AppointmentPatientSummary | null
  linkedVisit: AppointmentLinkedVisitSummary | null
}

export type CreateAppointmentInput = {
  patientId: string
  scheduledStart: string
  scheduledEnd?: string | null
  reason?: string | null
  notes?: string | null
}

export type UpdateAppointmentStatusInput = {
  appointmentId: string
  status: AppointmentStatus
}

export type AppointmentWriteResult = {
  ok: boolean
  appointment?: Appointment | null
  message: string | null
  error?: string
  reason?: 'demo_mode' | 'validation' | 'permission' | 'not_found' | 'unknown'
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
  first_name: string | null
  last_name: string | null
  phone?: string | null
  email?: string | null
}

type SupabaseAppointmentRow = Appointment

type SupabaseLinkedVisitRow = {
  id: string
  patient_id: string
  status: string
  visit_date: string
  completed_at: string | null
}

const appointmentStatuses = new Set<AppointmentStatus>([
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
])

export const APPOINTMENT_REASON_MAX_LENGTH = 160
export const APPOINTMENT_NOTES_MAX_LENGTH = 500

const patientDataSource = normalizeDataSource(
  import.meta.env.VITE_PATIENT_DATA_SOURCE,
)

function normalizeDataSource(value: string | undefined): PatientDataSource {
  return value?.toLowerCase() === 'supabase' ? 'supabase' : 'demo'
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function isValidAppointmentStatus(value: string): value is AppointmentStatus {
  return appointmentStatuses.has(value as AppointmentStatus)
}

function mapRowToAppointment(row: SupabaseAppointmentRow): Appointment {
  return {
    id: row.id,
    clinic_id: row.clinic_id,
    patient_id: row.patient_id,
    scheduled_start: row.scheduled_start,
    scheduled_end: row.scheduled_end,
    status: isValidAppointmentStatus(row.status) ? row.status : 'scheduled',
    reason: row.reason,
    notes: row.notes,
    created_by: row.created_by,
    updated_by: row.updated_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function classifyAppointmentError(errorMessage: string | undefined) {
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

function toRangeDateBoundary(value: string, mode: 'start' | 'end') {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/

  if (dateOnlyPattern.test(trimmed)) {
    const daySuffix = mode === 'start' ? 'T00:00:00.000Z' : 'T23:59:59.999Z'
    const parsed = new Date(`${trimmed}${daySuffix}`)

    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(trimmed)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getPatientFullNameFromRow(
  row: Pick<SupabasePatientRow, 'first_name' | 'last_name'>,
) {
  const firstName = normalizeText(row.first_name)
  const lastName = normalizeText(row.last_name)
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || 'Unknown patient'
}

function validateCreateAppointmentInput(
  input: CreateAppointmentInput,
): string | null {
  if (!normalizeText(input.patientId)) {
    return 'Patient ID is required to create an appointment.'
  }

  if (!normalizeText(input.scheduledStart)) {
    return 'Choose appointment date and time.'
  }

  const scheduledStart = new Date(input.scheduledStart)

  if (Number.isNaN(scheduledStart.getTime())) {
    return 'Choose a valid appointment date and time.'
  }

  if (input.scheduledEnd) {
    const scheduledEnd = new Date(input.scheduledEnd)

    if (Number.isNaN(scheduledEnd.getTime())) {
      return 'Choose a valid appointment duration.'
    }

    if (scheduledEnd <= scheduledStart) {
      return 'Appointment end must be after start.'
    }
  }

  if (normalizeText(input.reason).length > APPOINTMENT_REASON_MAX_LENGTH) {
    return `Reason must be ${APPOINTMENT_REASON_MAX_LENGTH} characters or fewer.`
  }

  if (normalizeText(input.notes).length > APPOINTMENT_NOTES_MAX_LENGTH) {
    return `Notes must be ${APPOINTMENT_NOTES_MAX_LENGTH} characters or fewer.`
  }

  return null
}

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn('[appointmentService] Supabase client unavailable.', error)

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
      '[appointmentService] Could not load current profile context.',
      profileError,
    )

    return null
  }

  return (profileData as SupabaseProfileContextRow | null) ?? null
}

async function getSupabasePatientForAppointment(
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
    console.warn('[appointmentService] Patient lookup failed.', error)
    return null
  }

  return (data as SupabasePatientRow | null) ?? null
}

export async function fetchAppointmentsForPatient(
  patientId: string,
): Promise<Appointment[]> {
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
    .from('appointments')
    .select(
      'id, clinic_id, patient_id, scheduled_start, scheduled_end, status, reason, notes, created_by, updated_by, created_at, updated_at',
    )
    .eq('patient_id', patientId)
    .order('scheduled_start', { ascending: false })

  if (error) {
    console.warn('[appointmentService] Patient appointments failed to load.', error)
    throw new Error(error.message ?? 'Patient appointments could not be loaded.')
  }

  return ((data as SupabaseAppointmentRow[] | null) ?? []).map(
    mapRowToAppointment,
  )
}

export async function fetchUpcomingAppointmentsForPatient(
  patientId: string,
): Promise<Appointment[]> {
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
    .from('appointments')
    .select(
      'id, clinic_id, patient_id, scheduled_start, scheduled_end, status, reason, notes, created_by, updated_by, created_at, updated_at',
    )
    .eq('patient_id', patientId)
    .eq('status', 'scheduled')
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true })

  if (error) {
    console.warn(
      '[appointmentService] Upcoming patient appointments failed to load.',
      error,
    )
    throw new Error(error.message ?? 'Upcoming appointments could not be loaded.')
  }

  return ((data as SupabaseAppointmentRow[] | null) ?? []).map(
    mapRowToAppointment,
  )
}

export async function fetchAppointmentForPatient(
  patientId: string,
  appointmentId: string,
): Promise<Appointment | null> {
  if (!patientId?.trim() || !appointmentId?.trim()) {
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
    .from('appointments')
    .select(
      'id, clinic_id, patient_id, scheduled_start, scheduled_end, status, reason, notes, created_by, updated_by, created_at, updated_at',
    )
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) {
    console.warn('[appointmentService] Patient appointment failed to load.', error)
    throw new Error(error.message ?? 'Appointment could not be loaded.')
  }

  return data ? mapRowToAppointment(data as SupabaseAppointmentRow) : null
}

export async function fetchAppointmentById(
  appointmentId: string,
): Promise<AppointmentDetail | null> {
  if (!appointmentId?.trim()) {
    return null
  }

  if (patientDataSource !== 'supabase') {
    return null
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    throw new Error('Supabase client is not available.')
  }

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select(
      'id, clinic_id, patient_id, scheduled_start, scheduled_end, status, reason, notes, created_by, updated_by, created_at, updated_at',
    )
    .eq('id', appointmentId)
    .maybeSingle()

  if (appointmentError) {
    console.warn('[appointmentService] Appointment detail failed to load.', appointmentError)
    throw new Error(appointmentError.message ?? 'Appointment could not be loaded.')
  }

  if (!appointmentData) {
    return null
  }

  const appointment = mapRowToAppointment(appointmentData as SupabaseAppointmentRow)

  const [
    { data: patientData, error: patientError },
    { data: linkedVisitData, error: linkedVisitError },
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('id, clinic_id, first_name, last_name, phone, email')
      .eq('id', appointment.patient_id)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase
      .from('visits')
      .select('id, patient_id, status, visit_date, completed_at')
      .eq('appointment_id', appointment.id)
      .eq('status', 'completed')
      .is('deleted_at', null)
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (patientError) {
    console.warn('[appointmentService] Appointment patient summary failed to load.', patientError)
    throw new Error(patientError.message ?? 'Appointment patient could not be loaded.')
  }

  if (linkedVisitError) {
    console.warn('[appointmentService] Linked visit summary failed to load.', linkedVisitError)
    throw new Error(linkedVisitError.message ?? 'Linked visit could not be loaded.')
  }

  const patient = patientData as SupabasePatientRow | null
  const linkedVisit = linkedVisitData as SupabaseLinkedVisitRow | null

  return {
    ...appointment,
    patient: patient
      ? {
          id: patient.id,
          fullName: getPatientFullNameFromRow(patient),
          phone: patient.phone ?? null,
          email: patient.email ?? null,
        }
      : null,
    linkedVisit: linkedVisit
      ? {
          id: linkedVisit.id,
          patientId: linkedVisit.patient_id,
          status: linkedVisit.status,
          visitDate: linkedVisit.visit_date,
          completedAt: linkedVisit.completed_at,
        }
      : null,
  }
}

export async function fetchAppointmentsForRange(
  startDate: string,
  endDate: string,
): Promise<AppointmentRangeItem[]> {
  const rangeStart = toRangeDateBoundary(startDate, 'start')
  const rangeEnd = toRangeDateBoundary(endDate, 'end')

  if (!rangeStart || !rangeEnd || rangeEnd < rangeStart) {
    return []
  }

  if (patientDataSource !== 'supabase') {
    return []
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    throw new Error('Supabase client is not available.')
  }

  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from('appointments')
    .select(
      'id, clinic_id, patient_id, scheduled_start, scheduled_end, status, reason, notes, created_by, updated_by, created_at, updated_at',
    )
    .gte('scheduled_start', rangeStart.toISOString())
    .lte('scheduled_start', rangeEnd.toISOString())
    .order('scheduled_start', { ascending: true })

  if (appointmentsError) {
    console.warn('[appointmentService] Range appointments failed to load.', appointmentsError)
    throw new Error(appointmentsError.message ?? 'Appointments could not be loaded.')
  }

  const appointmentRows = (appointmentsData as SupabaseAppointmentRow[] | null) ?? []

  if (appointmentRows.length === 0) {
    return []
  }

  const uniquePatientIds = Array.from(
    new Set(appointmentRows.map((appointment) => appointment.patient_id)),
  )

  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('id, clinic_id, first_name, last_name')
    .in('id', uniquePatientIds)
    .is('deleted_at', null)

  if (patientError) {
    console.warn('[appointmentService] Patient summary lookup failed.', patientError)
    throw new Error(patientError.message ?? 'Appointments could not be loaded.')
  }

  const patientById = new Map(
    ((patientData as SupabasePatientRow[] | null) ?? []).map((patient) => [
      patient.id,
      {
        id: patient.id,
        fullName: getPatientFullNameFromRow(patient),
      } satisfies AppointmentPatientSummary,
    ]),
  )

  return appointmentRows.map((appointment) => ({
    ...mapRowToAppointment(appointment),
    patient: patientById.get(appointment.patient_id) ?? null,
  }))
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<AppointmentWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      appointment: null,
      message: 'Demo mode only. Appointment changes were not saved.',
      reason: 'demo_mode',
    }
  }

  const validationError = validateCreateAppointmentInput(input)

  if (validationError) {
    return {
      ok: false,
      appointment: null,
      message: null,
      error: validationError,
      reason: 'validation',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      appointment: null,
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      appointment: null,
      message: null,
      error: 'Active profile context is required to create an appointment.',
      reason: 'permission',
    }
  }

  const patient = await getSupabasePatientForAppointment(
    input.patientId,
    profileContext.clinic_id,
  )

  if (!patient) {
    return {
      ok: false,
      appointment: null,
      message: null,
      error: 'Patient not found or you do not have permission to create appointments for this patient.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: profileContext.clinic_id,
      patient_id: patient.id,
      scheduled_start: input.scheduledStart,
      scheduled_end: input.scheduledEnd ?? null,
      status: 'scheduled',
      reason: normalizeText(input.reason) || null,
      notes: normalizeText(input.notes) || null,
      created_by: profileContext.id,
      updated_by: profileContext.id,
    })
    .select(
      'id, clinic_id, patient_id, scheduled_start, scheduled_end, status, reason, notes, created_by, updated_by, created_at, updated_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Appointment could not be created.'

    return {
      ok: false,
      appointment: null,
      message: null,
      error: errorMessage,
      reason: classifyAppointmentError(errorMessage),
    }
  }

  return {
    ok: true,
    appointment: mapRowToAppointment(data as SupabaseAppointmentRow),
    message: 'Appointment was created successfully.',
  }
}

export async function updateAppointmentStatus(
  input: UpdateAppointmentStatusInput,
): Promise<AppointmentWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      appointment: null,
      message: 'Demo mode only. Appointment changes were not saved.',
      reason: 'demo_mode',
    }
  }

  if (!normalizeText(input.appointmentId)) {
    return {
      ok: false,
      appointment: null,
      message: null,
      error: 'Appointment ID is required to update appointment status.',
      reason: 'validation',
    }
  }

  if (!isValidAppointmentStatus(input.status)) {
    return {
      ok: false,
      appointment: null,
      message: null,
      error: 'Appointment status is invalid.',
      reason: 'validation',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      appointment: null,
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      appointment: null,
      message: null,
      error: 'Active profile context is required to update appointment status.',
      reason: 'permission',
    }
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({
      status: input.status,
      updated_by: profileContext.id,
    })
    .eq('id', input.appointmentId)
    .select(
      'id, clinic_id, patient_id, scheduled_start, scheduled_end, status, reason, notes, created_by, updated_by, created_at, updated_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Appointment status could not be updated.'

    return {
      ok: false,
      appointment: null,
      message: null,
      error: errorMessage,
      reason: classifyAppointmentError(errorMessage),
    }
  }

  return {
    ok: true,
    appointment: mapRowToAppointment(data as SupabaseAppointmentRow),
    message: 'Appointment status was updated successfully.',
  }
}
