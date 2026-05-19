import {
  getPatientPersistenceId,
  getPatientRouteId,
} from '../patients/patientService'

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
  routeId: string
  phone?: string | null
  email?: string | null
}

export type AppointmentRangeItem = Appointment & {
  linkedVisit: AppointmentLinkedVisitSummary | null
  openVisit: AppointmentOpenVisitSummary | null
  patient: AppointmentPatientSummary | null
}

export type AppointmentLinkedVisitSummary = {
  id: string
  patientId: string
  status: string
  visitDate: string
  completedAt: string | null
  recommendation: string
  nextStep: string | null
  updatedAt: string
}

export type AppointmentOpenVisitSummary = {
  id: string
  patientId: string
  status: 'draft' | 'in_progress'
  visitDate: string
  updatedAt: string
}

export type AppointmentDetail = Appointment & {
  patient: AppointmentPatientSummary | null
  linkedVisit: AppointmentLinkedVisitSummary | null
  openVisit: AppointmentOpenVisitSummary | null
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
  appointment_id: string | null
  patient_id: string
  status: string
  visit_date: string
  completed_at: string | null
  recommendation: string | null
  next_step: string | null
  updated_at: string
}

const appointmentStatuses = new Set<AppointmentStatus>([
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
])

export const APPOINTMENT_REASON_MAX_LENGTH = 160
export const APPOINTMENT_NOTES_MAX_LENGTH = 500

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

function mapLinkedVisit(row: SupabaseLinkedVisitRow): AppointmentLinkedVisitSummary {
  return {
    id: row.id,
    patientId: row.patient_id,
    status: row.status,
    visitDate: row.visit_date,
    completedAt: row.completed_at,
    recommendation: row.recommendation ?? '',
    nextStep: row.next_step,
    updatedAt: row.updated_at,
  }
}

function mapOpenVisit(row: SupabaseLinkedVisitRow): AppointmentOpenVisitSummary | null {
  if (row.status !== 'draft' && row.status !== 'in_progress') {
    return null
  }

  return {
    id: row.id,
    patientId: row.patient_id,
    status: row.status,
    visitDate: row.visit_date,
    updatedAt: row.updated_at,
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
  const reason = input.reason ?? ''
  const notes = input.notes ?? ''
  const normalizedReason = normalizeText(reason)
  const normalizedNotes = normalizeText(notes)

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

  if (reason.length > 0 && !normalizedReason) {
    return 'Reason cannot be only spaces.'
  }

  if (notes.length > 0 && !normalizedNotes) {
    return 'Notes cannot be only spaces.'
  }

  if (normalizedReason.length > APPOINTMENT_REASON_MAX_LENGTH) {
    return `Reason must be ${APPOINTMENT_REASON_MAX_LENGTH} characters or fewer.`
  }

  if (normalizedNotes.length > APPOINTMENT_NOTES_MAX_LENGTH) {
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
  const resolvedPatientId = getPatientPersistenceId(patientId)

  if (!resolvedPatientId) {
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
    .eq('patient_id', resolvedPatientId)
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
  const resolvedPatientId = getPatientPersistenceId(patientId)

  if (!resolvedPatientId) {
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
    .eq('patient_id', resolvedPatientId)
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
  const resolvedPatientId = getPatientPersistenceId(patientId)

  if (!resolvedPatientId || !appointmentId?.trim()) {
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
    .eq('patient_id', resolvedPatientId)
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
    { data: openVisitData, error: openVisitError },
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('id, clinic_id, first_name, last_name, phone, email')
      .eq('id', appointment.patient_id)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase
      .from('visits')
      .select('id, appointment_id, patient_id, status, visit_date, completed_at, recommendation, next_step, updated_at')
      .eq('appointment_id', appointment.id)
      .eq('status', 'completed')
      .is('deleted_at', null)
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('visits')
      .select('id, appointment_id, patient_id, status, visit_date, completed_at, recommendation, next_step, updated_at')
      .eq('appointment_id', appointment.id)
      .in('status', ['draft', 'in_progress'])
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
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

  if (openVisitError) {
    console.warn('[appointmentService] Open visit summary failed to load.', openVisitError)
    throw new Error(openVisitError.message ?? 'Open visit could not be loaded.')
  }

  const patient = patientData as SupabasePatientRow | null
  const linkedVisit = linkedVisitData as SupabaseLinkedVisitRow | null
  const openVisit = openVisitData as SupabaseLinkedVisitRow | null

  return {
    ...appointment,
    patient: patient
      ? {
          id: patient.id,
          fullName: getPatientFullNameFromRow(patient),
          routeId: getPatientRouteId(patient.id),
          phone: patient.phone ?? null,
          email: patient.email ?? null,
        }
      : null,
    linkedVisit: linkedVisit ? mapLinkedVisit(linkedVisit) : null,
    openVisit: openVisit ? mapOpenVisit(openVisit) : null,
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
        routeId: getPatientRouteId(patient.id),
      } satisfies AppointmentPatientSummary,
    ]),
  )

  const appointmentIds = appointmentRows.map((appointment) => appointment.id)
  const { data: visitData, error: visitError } = await supabase
    .from('visits')
    .select('id, appointment_id, patient_id, status, visit_date, completed_at, recommendation, next_step, updated_at')
    .in('appointment_id', appointmentIds)
    .in('status', ['draft', 'in_progress', 'completed'])
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (visitError) {
    console.warn('[appointmentService] Appointment visit summaries failed to load.', visitError)
    throw new Error(visitError.message ?? 'Appointment visit summaries could not be loaded.')
  }

  const completedVisitByAppointmentId = new Map<string, AppointmentLinkedVisitSummary>()
  const openVisitByAppointmentId = new Map<string, AppointmentOpenVisitSummary>()

  ;((visitData as SupabaseLinkedVisitRow[] | null) ?? []).forEach((visit) => {
    if (!visit.appointment_id) {
      return
    }

    if (visit.status === 'completed' && !completedVisitByAppointmentId.has(visit.appointment_id)) {
      completedVisitByAppointmentId.set(visit.appointment_id, mapLinkedVisit(visit))
      return
    }

    const openVisit = mapOpenVisit(visit)

    if (openVisit && !openVisitByAppointmentId.has(visit.appointment_id)) {
      openVisitByAppointmentId.set(visit.appointment_id, openVisit)
    }
  })

  return appointmentRows.map((appointment) => ({
    ...mapRowToAppointment(appointment),
    linkedVisit: completedVisitByAppointmentId.get(appointment.id) ?? null,
    openVisit: openVisitByAppointmentId.get(appointment.id) ?? null,
    patient: patientById.get(appointment.patient_id) ?? null,
  }))
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<AppointmentWriteResult> {
  const resolvedPatientId = getPatientPersistenceId(input.patientId)

  const validationError = validateCreateAppointmentInput({
    ...input,
    patientId: resolvedPatientId,
  })

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
    resolvedPatientId,
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
