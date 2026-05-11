import { demoPatients } from './demoPatients'
import type { DemoPatient } from './types'

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
}

type SupabaseMedicalRecordRow = {
  anamnesis_summary: string | null
  medical_warnings: string | null
  dental_history: string | null
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
    nextAppointment: null,
    lastVisit: options?.latestClinicalNote?.created_at ?? null,
    activeTreatmentPlan: null,
    importantWarning: patient.important_note,
    unpaidBalance: 0,
    medicalWarnings,
    anamnesisSummary:
      options?.medicalRecord?.anamnesis_summary ??
      'Demo anamnesis summary placeholder for Supabase mode.',
    dentalHistorySummary:
      options?.medicalRecord?.dental_history ??
      'Demo dental history placeholder for Supabase mode.',
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

async function getPatientsFromSupabase(): Promise<DemoPatient[]> {
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

  const { data, error } = await supabase
    .from('patients')
    .select(
      'id, first_name, last_name, date_of_birth, phone, email, status, important_note, clinic_id',
    )
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
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
      'id, first_name, last_name, date_of_birth, phone, email, status, important_note, clinic_id',
    )
    .eq('id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .maybeSingle()

  if (patientError) {
    console.warn(
      '[patientService] Supabase patient detail read failed. Falling back to demo patient data.',
      patientError,
    )

    return demoPatients.find((patient) => patient.id === patientId)
  }

  if (!patientData) {
    return undefined
  }

  const patient = patientData as SupabasePatientRow

  const [{ data: medicalRecordData }, { data: clinicalNoteData }] =
    await Promise.all([
      supabase
        .from('patient_medical_records')
        .select('anamnesis_summary, medical_warnings, dental_history')
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

export async function getPatients(): Promise<DemoPatient[]> {
  if (patientDataSource === 'supabase') {
    return getPatientsFromSupabase()
  }

  return clonePatients(demoPatients)
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
    const patients = await getPatientsFromSupabase()

    return clonePatients(
      patients.filter((patient) => matchesSearch(patient, normalizedSearch)),
    )
  }

  return clonePatients(
    demoPatients.filter((patient) => matchesSearch(patient, normalizedSearch)),
  )
}
