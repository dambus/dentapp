import { demoPatients } from './demoPatients'

type PatientDataSource = 'demo' | 'supabase'

export type TreatmentPlanStatus =
  | 'draft'
  | 'proposed'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'paused'
  | 'rejected'
  | 'archived'

export type TreatmentPlanItemStatus =
  | 'planned'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'cancelled'
  | 'archived'

export type TreatmentPlanItem = {
  id: string
  treatmentPlanId: string
  patientId: string
  toothNumber: string
  title: string
  description: string
  serviceCode: string
  status: TreatmentPlanItemStatus
  estimatedPrice: number | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type TreatmentPlan = {
  id: string
  patientId: string
  title: string
  description: string
  status: TreatmentPlanStatus
  proposedTotal: number | null
  acceptedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  items: TreatmentPlanItem[]
}

export type TreatmentPlanInput = {
  title: string
  description: string
  status: TreatmentPlanStatus
  proposedTotal: string
}

export type TreatmentPlanItemInput = {
  toothNumber: string
  title: string
  description: string
  serviceCode: string
  status: TreatmentPlanItemStatus
  estimatedPrice: string
  sortOrder: string
}

export type TreatmentPlanWriteResult = {
  ok: boolean
  plan?: TreatmentPlan
  item?: TreatmentPlanItem
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

type SupabaseTreatmentPlanRow = {
  id: string
  patient_id: string
  title: string
  description: string | null
  status: string
  proposed_total: number | string | null
  accepted_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type SupabaseTreatmentPlanItemRow = {
  id: string
  treatment_plan_id: string
  patient_id: string
  tooth_number: string | null
  title: string
  description: string | null
  service_code: string | null
  status: string
  estimated_price: number | string | null
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export const treatmentPlanStatusOptions: Array<{
  value: TreatmentPlanStatus
  label: string
}> = [
  { value: 'draft', label: 'Draft' },
  { value: 'proposed', label: 'Proposed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
]

export const treatmentPlanItemStatusOptions: Array<{
  value: TreatmentPlanItemStatus
  label: string
}> = [
  { value: 'planned', label: 'Planned' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'archived', label: 'Archived' },
]

const validPlanStatuses = new Set<TreatmentPlanStatus>(
  treatmentPlanStatusOptions.map((option) => option.value),
)

const validItemStatuses = new Set<TreatmentPlanItemStatus>(
  treatmentPlanItemStatusOptions.map((option) => option.value),
)

const normalizeDataSource = (
  value: string | undefined,
): PatientDataSource => {
  return value?.toLowerCase() === 'supabase' ? 'supabase' : 'demo'
}

const patientDataSource = normalizeDataSource(
  import.meta.env.VITE_PATIENT_DATA_SOURCE,
)

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function normalizePlanStatus(value: string): TreatmentPlanStatus {
  return validPlanStatuses.has(value as TreatmentPlanStatus)
    ? (value as TreatmentPlanStatus)
    : 'draft'
}

function normalizeItemStatus(value: string): TreatmentPlanItemStatus {
  return validItemStatuses.has(value as TreatmentPlanItemStatus)
    ? (value as TreatmentPlanItemStatus)
    : 'planned'
}

function parseOptionalNumber(value: string) {
  const trimmedValue = normalizeText(value)

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)

  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN
}

function numericOrNull(value: number | string | null) {
  if (value === null) {
    return null
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

function mapRowToTreatmentPlan(
  row: SupabaseTreatmentPlanRow,
  items: TreatmentPlanItem[] = [],
): TreatmentPlan {
  return {
    id: row.id,
    patientId: row.patient_id,
    title: row.title,
    description: row.description ?? '',
    status: normalizePlanStatus(row.status),
    proposedTotal: numericOrNull(row.proposed_total),
    acceptedAt: row.accepted_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    items,
  }
}

function mapRowToTreatmentPlanItem(
  row: SupabaseTreatmentPlanItemRow,
): TreatmentPlanItem {
  return {
    id: row.id,
    treatmentPlanId: row.treatment_plan_id,
    patientId: row.patient_id,
    toothNumber: row.tooth_number ?? '',
    title: row.title,
    description: row.description ?? '',
    serviceCode: row.service_code ?? '',
    status: normalizeItemStatus(row.status),
    estimatedPrice: numericOrNull(row.estimated_price),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function mapPlanInputToDatabaseValues(input: TreatmentPlanInput) {
  return {
    title: normalizeText(input.title),
    description: normalizeText(input.description) || null,
    status: input.status,
    proposed_total: parseOptionalNumber(input.proposedTotal),
  }
}

function mapItemInputToDatabaseValues(input: TreatmentPlanItemInput) {
  const parsedSortOrder = Number(normalizeText(input.sortOrder) || '0')

  return {
    tooth_number: normalizeText(input.toothNumber) || null,
    title: normalizeText(input.title),
    description: normalizeText(input.description) || null,
    service_code: normalizeText(input.serviceCode) || null,
    status: input.status,
    estimated_price: parseOptionalNumber(input.estimatedPrice),
    sort_order: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
  }
}

function mapPlanToAuditValues(plan: TreatmentPlan) {
  return {
    title: plan.title,
    description: plan.description || null,
    status: plan.status,
    proposed_total: plan.proposedTotal,
    accepted_at: plan.acceptedAt,
    completed_at: plan.completedAt,
    deleted_at: plan.deletedAt,
  }
}

function mapItemToAuditValues(item: TreatmentPlanItem) {
  return {
    treatment_plan_id: item.treatmentPlanId,
    tooth_number: item.toothNumber || null,
    title: item.title,
    description: item.description || null,
    service_code: item.serviceCode || null,
    status: item.status,
    estimated_price: item.estimatedPrice,
    sort_order: item.sortOrder,
    deleted_at: item.deletedAt,
  }
}

function validatePlanInput(input: TreatmentPlanInput): string | null {
  if (!normalizeText(input.title)) {
    return 'Treatment plan title is required.'
  }

  if (!validPlanStatuses.has(input.status)) {
    return 'Treatment plan status is required.'
  }

  const proposedTotal = parseOptionalNumber(input.proposedTotal)

  if (Number.isNaN(proposedTotal) || (proposedTotal !== null && proposedTotal < 0)) {
    return 'Proposed total must be a non-negative number.'
  }

  return null
}

function validateItemInput(input: TreatmentPlanItemInput): string | null {
  if (!normalizeText(input.title)) {
    return 'Treatment plan item title is required.'
  }

  if (!validItemStatuses.has(input.status)) {
    return 'Treatment plan item status is required.'
  }

  const estimatedPrice = parseOptionalNumber(input.estimatedPrice)

  if (Number.isNaN(estimatedPrice) || (estimatedPrice !== null && estimatedPrice < 0)) {
    return 'Estimated price must be a non-negative number.'
  }

  const sortOrder = Number(normalizeText(input.sortOrder) || '0')

  if (!Number.isFinite(sortOrder)) {
    return 'Sort order must be a number.'
  }

  return null
}

function classifyTreatmentPlanError(errorMessage: string | undefined) {
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

function getDemoTreatmentPlans(patientId: string): TreatmentPlan[] {
  const patient = demoPatients.find((demoPatient) => demoPatient.id === patientId)

  if (!patient?.activeTreatmentPlan) {
    return []
  }

  const createdAt = new Date('2026-01-20T09:00:00.000Z').toISOString()

  return [
    {
      id: `demo-treatment-plan-${patient.id}`,
      patientId: patient.id,
      title: patient.activeTreatmentPlan,
      description: patient.activeTreatmentPlanSummary,
      status: 'draft',
      proposedTotal: null,
      acceptedAt: null,
      completedAt: null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      items: [
        {
          id: `demo-treatment-plan-item-${patient.id}-1`,
          treatmentPlanId: `demo-treatment-plan-${patient.id}`,
          patientId: patient.id,
          toothNumber: '16',
          title: 'Demo planned item',
          description: 'Demo-only treatment plan item placeholder.',
          serviceCode: '',
          status: 'planned',
          estimatedPrice: null,
          sortOrder: 0,
          createdAt,
          updatedAt: createdAt,
          deletedAt: null,
        },
      ],
    },
  ]
}

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn('[treatmentPlanService] Supabase client unavailable.', error)

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
      '[treatmentPlanService] Could not load current profile context.',
      profileError,
    )

    return null
  }

  return (profileData as SupabaseProfileContextRow | null) ?? null
}

async function getSupabasePatientForTreatmentPlanWrite(
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
    console.warn('[treatmentPlanService] Patient lookup failed.', error)
    return null
  }

  return (data as SupabasePatientRow | null) ?? null
}

async function getExistingTreatmentPlanFromSupabase(
  patientId: string,
  planId: string,
  clinicId: string,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('treatment_plans')
    .select(
      'id, patient_id, title, description, status, proposed_total, accepted_at, completed_at, created_at, updated_at, deleted_at',
    )
    .eq('id', planId)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.warn('[treatmentPlanService] Treatment plan lookup failed.', error)
    return null
  }

  return (data as SupabaseTreatmentPlanRow | null) ?? null
}

async function getExistingTreatmentPlanItemFromSupabase(
  patientId: string,
  planId: string,
  itemId: string,
  clinicId: string,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('treatment_plan_items')
    .select(
      'id, treatment_plan_id, patient_id, tooth_number, title, description, service_code, status, estimated_price, sort_order, created_at, updated_at, deleted_at',
    )
    .eq('id', itemId)
    .eq('treatment_plan_id', planId)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.warn(
      '[treatmentPlanService] Treatment plan item lookup failed.',
      error,
    )
    return null
  }

  return (data as SupabaseTreatmentPlanItemRow | null) ?? null
}

async function createTreatmentPlanAuditLog(
  action:
    | 'treatment_plan.created'
    | 'treatment_plan.updated'
    | 'treatment_plan.archived',
  plan: TreatmentPlan,
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
    p_entity_type: 'treatment_plan',
    p_entity_id: plan.id,
    p_old_values: oldValues,
    p_new_values: mapPlanToAuditValues(plan),
    p_metadata: {
      patient_id: plan.patientId,
      treatment_plan_id: plan.id,
    },
  })

  if (error) {
    console.warn('[treatmentPlanService] Treatment plan audit failed.', error)

    return {
      ok: false,
      error: error.message ?? 'Audit log could not be recorded.',
    }
  }

  return { ok: true, error: null }
}

async function createTreatmentPlanItemAuditLog(
  action:
    | 'treatment_plan_item.created'
    | 'treatment_plan_item.updated'
    | 'treatment_plan_item.archived',
  item: TreatmentPlanItem,
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
    p_entity_type: 'treatment_plan_item',
    p_entity_id: item.id,
    p_old_values: oldValues,
    p_new_values: mapItemToAuditValues(item),
    p_metadata: {
      patient_id: item.patientId,
      treatment_plan_id: item.treatmentPlanId,
      treatment_plan_item_id: item.id,
      tooth_number: item.toothNumber || null,
    },
  })

  if (error) {
    console.warn(
      '[treatmentPlanService] Treatment plan item audit failed.',
      error,
    )

    return {
      ok: false,
      error: error.message ?? 'Audit log could not be recorded.',
    }
  }

  return { ok: true, error: null }
}

async function getItemsForPlansFromSupabase(
  patientId: string,
  planIds: string[],
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase || planIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('treatment_plan_items')
    .select(
      'id, treatment_plan_id, patient_id, tooth_number, title, description, service_code, status, estimated_price, sort_order, created_at, updated_at, deleted_at',
    )
    .eq('patient_id', patientId)
    .in('treatment_plan_id', planIds)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.warn(
      '[treatmentPlanService] Treatment plan items could not be loaded.',
      error,
    )
    throw new Error('Treatment plan items could not be loaded.')
  }

  return ((data as SupabaseTreatmentPlanItemRow[] | null) ?? []).map(
    mapRowToTreatmentPlanItem,
  )
}

export async function getPatientTreatmentPlans(
  patientId: string | undefined,
): Promise<TreatmentPlan[]> {
  if (!patientId) {
    return []
  }

  if (patientDataSource !== 'supabase' || !isUuid(patientId)) {
    return getDemoTreatmentPlans(patientId)
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return []
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    throw new Error('Active profile context is required to load treatment plans.')
  }

  const { data, error } = await supabase
    .from('treatment_plans')
    .select(
      'id, patient_id, title, description, status, proposed_total, accepted_at, completed_at, created_at, updated_at, deleted_at',
    )
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn(
      '[treatmentPlanService] Treatment plans could not be loaded.',
      error,
    )
    throw new Error('Treatment plans could not be loaded.')
  }

  const planRows = (data as SupabaseTreatmentPlanRow[] | null) ?? []
  const items = await getItemsForPlansFromSupabase(
    patientId,
    planRows.map((plan) => plan.id),
  )
  const itemsByPlanId = new Map<string, TreatmentPlanItem[]>()

  for (const item of items) {
    const planItems = itemsByPlanId.get(item.treatmentPlanId) ?? []
    planItems.push(item)
    itemsByPlanId.set(item.treatmentPlanId, planItems)
  }

  return planRows.map((plan) =>
    mapRowToTreatmentPlan(plan, itemsByPlanId.get(plan.id) ?? []),
  )
}

export async function getTreatmentPlanById(
  patientId: string | undefined,
  planId: string | undefined,
): Promise<TreatmentPlan | null> {
  if (!patientId || !planId) {
    return null
  }

  const plans = await getPatientTreatmentPlans(patientId)

  return plans.find((plan) => plan.id === planId) ?? null
}

export async function createTreatmentPlan(
  patientId: string,
  input: TreatmentPlanInput,
): Promise<TreatmentPlanWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No treatment plan changes were saved.',
      reason: 'demo_mode',
    }
  }

  const validationError = validatePlanInput(input)

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
      error: 'Active profile context is required to save treatment plans.',
      reason: 'permission',
    }
  }

  const patient = await getSupabasePatientForTreatmentPlanWrite(
    patientId,
    profileContext.clinic_id,
  )

  if (!patient) {
    return {
      ok: false,
      message: null,
      error: 'Patient not found or you do not have permission to edit treatment plans.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('treatment_plans')
    .insert({
      ...mapPlanInputToDatabaseValues(input),
      patient_id: patient.id,
      clinic_id: patient.clinic_id,
      created_by: profileContext.id,
      updated_by: profileContext.id,
    })
    .select(
      'id, patient_id, title, description, status, proposed_total, accepted_at, completed_at, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Treatment plan could not be saved.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyTreatmentPlanError(errorMessage),
    }
  }

  const savedPlan = mapRowToTreatmentPlan(data as SupabaseTreatmentPlanRow)
  const auditResult = await createTreatmentPlanAuditLog(
    'treatment_plan.created',
    savedPlan,
    null,
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      plan: savedPlan,
      message: 'Treatment plan was saved, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    plan: savedPlan,
    message: 'Treatment plan was saved successfully.',
  }
}

export async function updateTreatmentPlan(
  patientId: string,
  planId: string,
  input: TreatmentPlanInput,
): Promise<TreatmentPlanWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No treatment plan changes were saved.',
      reason: 'demo_mode',
    }
  }

  const validationError = validatePlanInput(input)

  if (!patientId?.trim() || !planId?.trim() || validationError) {
    return {
      ok: false,
      message: null,
      error: validationError ?? 'Patient ID and treatment plan ID are required.',
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
      error: 'Active profile context is required to save treatment plans.',
      reason: 'permission',
    }
  }

  const existingPlan = await getExistingTreatmentPlanFromSupabase(
    patientId,
    planId,
    profileContext.clinic_id,
  )

  if (!existingPlan) {
    return {
      ok: false,
      message: null,
      error: 'Treatment plan not found or you do not have permission to edit it.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('treatment_plans')
    .update({
      ...mapPlanInputToDatabaseValues(input),
      updated_by: profileContext.id,
    })
    .eq('id', planId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, patient_id, title, description, status, proposed_total, accepted_at, completed_at, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Treatment plan could not be saved.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyTreatmentPlanError(errorMessage),
    }
  }

  const savedPlan = mapRowToTreatmentPlan(data as SupabaseTreatmentPlanRow)
  const auditResult = await createTreatmentPlanAuditLog(
    'treatment_plan.updated',
    savedPlan,
    mapPlanToAuditValues(mapRowToTreatmentPlan(existingPlan)),
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      plan: savedPlan,
      message: 'Treatment plan was saved, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    plan: savedPlan,
    message: 'Treatment plan was saved successfully.',
  }
}

export async function archiveTreatmentPlan(
  patientId: string,
  planId: string,
): Promise<TreatmentPlanWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No treatment plan changes were saved.',
      reason: 'demo_mode',
    }
  }

  if (!patientId?.trim() || !planId?.trim()) {
    return {
      ok: false,
      message: null,
      error: 'Patient ID and treatment plan ID are required.',
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
      error: 'Active profile context is required to archive treatment plans.',
      reason: 'permission',
    }
  }

  const existingPlan = await getExistingTreatmentPlanFromSupabase(
    patientId,
    planId,
    profileContext.clinic_id,
  )

  if (!existingPlan) {
    return {
      ok: false,
      message: null,
      error: 'Treatment plan not found or you do not have permission to edit it.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('treatment_plans')
    .update({
      status: 'archived',
      deleted_at: new Date().toISOString(),
      updated_by: profileContext.id,
    })
    .eq('id', planId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, patient_id, title, description, status, proposed_total, accepted_at, completed_at, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Treatment plan could not be archived.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyTreatmentPlanError(errorMessage),
    }
  }

  const archivedPlan = mapRowToTreatmentPlan(data as SupabaseTreatmentPlanRow)
  const auditResult = await createTreatmentPlanAuditLog(
    'treatment_plan.archived',
    archivedPlan,
    mapPlanToAuditValues(mapRowToTreatmentPlan(existingPlan)),
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      plan: archivedPlan,
      message:
        'Treatment plan was archived, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    plan: archivedPlan,
    message: 'Treatment plan was archived successfully.',
  }
}

export async function createTreatmentPlanItem(
  patientId: string,
  planId: string,
  input: TreatmentPlanItemInput,
): Promise<TreatmentPlanWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No treatment plan changes were saved.',
      reason: 'demo_mode',
    }
  }

  const validationError = validateItemInput(input)

  if (!patientId?.trim() || !planId?.trim() || validationError) {
    return {
      ok: false,
      message: null,
      error:
        validationError ?? 'Patient ID and treatment plan ID are required.',
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
      error: 'Active profile context is required to save treatment plan items.',
      reason: 'permission',
    }
  }

  const existingPlan = await getExistingTreatmentPlanFromSupabase(
    patientId,
    planId,
    profileContext.clinic_id,
  )

  if (!existingPlan) {
    return {
      ok: false,
      message: null,
      error: 'Treatment plan not found or you do not have permission to edit it.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('treatment_plan_items')
    .insert({
      ...mapItemInputToDatabaseValues(input),
      treatment_plan_id: existingPlan.id,
      patient_id: existingPlan.patient_id,
      clinic_id: profileContext.clinic_id,
      created_by: profileContext.id,
      updated_by: profileContext.id,
    })
    .select(
      'id, treatment_plan_id, patient_id, tooth_number, title, description, service_code, status, estimated_price, sort_order, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Treatment plan item could not be saved.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyTreatmentPlanError(errorMessage),
    }
  }

  const savedItem = mapRowToTreatmentPlanItem(
    data as SupabaseTreatmentPlanItemRow,
  )
  const auditResult = await createTreatmentPlanItemAuditLog(
    'treatment_plan_item.created',
    savedItem,
    null,
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      item: savedItem,
      message:
        'Treatment plan item was saved, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    item: savedItem,
    message: 'Treatment plan item was saved successfully.',
  }
}

export async function updateTreatmentPlanItem(
  patientId: string,
  planId: string,
  itemId: string,
  input: TreatmentPlanItemInput,
): Promise<TreatmentPlanWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No treatment plan changes were saved.',
      reason: 'demo_mode',
    }
  }

  const validationError = validateItemInput(input)

  if (!patientId?.trim() || !planId?.trim() || !itemId?.trim() || validationError) {
    return {
      ok: false,
      message: null,
      error:
        validationError ??
        'Patient ID, treatment plan ID, and item ID are required.',
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
      error: 'Active profile context is required to save treatment plan items.',
      reason: 'permission',
    }
  }

  const existingItem = await getExistingTreatmentPlanItemFromSupabase(
    patientId,
    planId,
    itemId,
    profileContext.clinic_id,
  )

  if (!existingItem) {
    return {
      ok: false,
      message: null,
      error:
        'Treatment plan item not found or you do not have permission to edit it.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('treatment_plan_items')
    .update({
      ...mapItemInputToDatabaseValues(input),
      updated_by: profileContext.id,
    })
    .eq('id', itemId)
    .eq('treatment_plan_id', planId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, treatment_plan_id, patient_id, tooth_number, title, description, service_code, status, estimated_price, sort_order, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage = error?.message ?? 'Treatment plan item could not be saved.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyTreatmentPlanError(errorMessage),
    }
  }

  const savedItem = mapRowToTreatmentPlanItem(
    data as SupabaseTreatmentPlanItemRow,
  )
  const auditResult = await createTreatmentPlanItemAuditLog(
    'treatment_plan_item.updated',
    savedItem,
    mapItemToAuditValues(mapRowToTreatmentPlanItem(existingItem)),
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      item: savedItem,
      message:
        'Treatment plan item was saved, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    item: savedItem,
    message: 'Treatment plan item was saved successfully.',
  }
}

export async function archiveTreatmentPlanItem(
  patientId: string,
  planId: string,
  itemId: string,
): Promise<TreatmentPlanWriteResult> {
  if (patientDataSource !== 'supabase') {
    return {
      ok: false,
      message: 'Demo mode only. No treatment plan changes were saved.',
      reason: 'demo_mode',
    }
  }

  if (!patientId?.trim() || !planId?.trim() || !itemId?.trim()) {
    return {
      ok: false,
      message: null,
      error: 'Patient ID, treatment plan ID, and item ID are required.',
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
      error: 'Active profile context is required to archive treatment plan items.',
      reason: 'permission',
    }
  }

  const existingItem = await getExistingTreatmentPlanItemFromSupabase(
    patientId,
    planId,
    itemId,
    profileContext.clinic_id,
  )

  if (!existingItem) {
    return {
      ok: false,
      message: null,
      error:
        'Treatment plan item not found or you do not have permission to edit it.',
      reason: 'not_found',
    }
  }

  const { data, error } = await supabase
    .from('treatment_plan_items')
    .update({
      status: 'archived',
      deleted_at: new Date().toISOString(),
      updated_by: profileContext.id,
    })
    .eq('id', itemId)
    .eq('treatment_plan_id', planId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .is('deleted_at', null)
    .select(
      'id, treatment_plan_id, patient_id, tooth_number, title, description, service_code, status, estimated_price, sort_order, created_at, updated_at, deleted_at',
    )
    .single()

  if (error || !data) {
    const errorMessage =
      error?.message ?? 'Treatment plan item could not be archived.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyTreatmentPlanError(errorMessage),
    }
  }

  const archivedItem = mapRowToTreatmentPlanItem(
    data as SupabaseTreatmentPlanItemRow,
  )
  const auditResult = await createTreatmentPlanItemAuditLog(
    'treatment_plan_item.archived',
    archivedItem,
    mapItemToAuditValues(mapRowToTreatmentPlanItem(existingItem)),
  )

  if (!auditResult.ok) {
    return {
      ok: false,
      item: archivedItem,
      message:
        'Treatment plan item was archived, but audit log could not be recorded.',
      error: auditResult.error ?? 'Audit log could not be recorded.',
      reason: 'audit',
    }
  }

  return {
    ok: true,
    item: archivedItem,
    message: 'Treatment plan item was archived successfully.',
  }
}
