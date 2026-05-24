import {
  fetchAssignableAppointmentProviders,
  type AppointmentProviderSummary,
} from '../appointments/appointmentService'
import { getPatientPersistenceId } from '../patients/patientService'

export type PerformedServiceStatus =
  | 'draft'
  | 'finalized'
  | 'corrected'
  | 'voided'

export type ServiceCatalogOption = {
  id: string
  categoryId: string | null
  categoryName: string
  name: string
  code: string
  defaultUnitPrice: number | null
  currency: string
  active: boolean
  deletedAt: string | null
}

export type PerformedServiceRecord = {
  id: string
  patientId: string
  visitId: string
  visitProcedureId: string | null
  appointmentId: string | null
  treatmentPlanItemId: string | null
  serviceId: string | null
  serviceNameSnapshot: string
  serviceCodeSnapshot: string
  serviceCategoryNameSnapshot: string
  toothOrRegion: string
  quantity: number
  unitPriceAmount: number
  discountAmount: number
  finalAmount: number
  currency: string
  creditedProviderId: string
  creditedProvider: AppointmentProviderSummary | null
  status: PerformedServiceStatus
  correctionOfId: string | null
  note: string
  performedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type CreatePerformedServiceInput = {
  patientId: string
  visitId: string
  visitProcedureId?: string | null
  appointmentId?: string | null
  treatmentPlanItemId?: string | null
  serviceId?: string | null
  serviceNameSnapshot: string
  serviceCodeSnapshot?: string | null
  serviceCategoryNameSnapshot?: string | null
  toothOrRegion?: string | null
  quantity: number | string
  unitPriceAmount: number | string
  discountAmount?: number | string | null
  currency?: string | null
  creditedProviderId: string
  note?: string | null
}

export type ReplaceDraftPerformedServicesInput = {
  patientId: string
  visitId: string
  performedServices: CreatePerformedServiceInput[]
}

export type FinalizePerformedServicesForVisitInput = {
  patientId: string
  visitId: string
  performedAt?: string | null
}

export type PerformedServiceWriteResult = {
  ok: boolean
  performedService?: PerformedServiceRecord | null
  performedServices?: PerformedServiceRecord[]
  message: string | null
  error?: string
  reason?: 'validation' | 'permission' | 'not_found' | 'conflict' | 'unknown'
}

export type PerformedServicesFinalizationStatus =
  | 'open_visit_drafts'
  | 'finalization_required'
  | 'finalized'
  | 'no_services'
  | 'blocked'

export type PerformedServicesFinalizationState = {
  status: PerformedServicesFinalizationStatus
  visitStatus: string | null
  performedServices: PerformedServiceRecord[]
  draftCount: number
  finalizedCount: number
  totalCount: number
  needsRetry: boolean
  message: string
}

export type PerformedServicesFinalizationResult = {
  ok: boolean
  state: PerformedServicesFinalizationState | null
  performedServices: PerformedServiceRecord[]
  message: string | null
  error?: string
  reason?: 'validation' | 'permission' | 'not_found' | 'conflict' | 'unknown'
}

export type PerformedServicesWorkflowAccess = {
  role: string | null
  canManagePerformedServices: boolean
  canReadPerformedServices: boolean
}

type SupabaseProfileContextRow = {
  id: string
  auth_user_id: string
  clinic_id: string
  role: string
  status: string
}

type SupabaseServiceCategoryRow = {
  id: string
  name: string
  active: boolean
  deleted_at: string | null
  sort_order: number | null
}

type SupabaseServiceCatalogRow = {
  id: string
  category_id: string | null
  name: string
  code: string | null
  default_price: number | string | null
  currency: string | null
  active: boolean
  deleted_at: string | null
  service_categories: SupabaseServiceCategoryRow | SupabaseServiceCategoryRow[] | null
}

type SupabasePerformedServiceRow = {
  id: string
  patient_id: string
  visit_id: string
  visit_procedure_id: string | null
  appointment_id: string | null
  treatment_plan_item_id: string | null
  service_id: string | null
  service_name_snapshot: string
  service_code_snapshot: string | null
  service_category_name_snapshot: string | null
  tooth_or_region: string | null
  quantity: number | string
  unit_price_amount: number | string
  discount_amount: number | string
  final_amount: number | string
  currency: string | null
  credited_provider_id: string
  status: string
  correction_of_id: string | null
  note: string | null
  performed_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type SupabaseVisitStatusRow = {
  id: string
  patient_id: string
  status: string
}

type NormalizedPerformedServiceInput = {
  patientId: string
  visitId: string
  visitProcedureId: string | null
  appointmentId: string | null
  treatmentPlanItemId: string | null
  serviceId: string | null
  serviceNameSnapshot: string
  serviceCodeSnapshot: string
  serviceCategoryNameSnapshot: string
  toothOrRegion: string
  quantity: number
  unitPriceAmount: number
  discountAmount: number
  finalAmount: number
  currency: string
  creditedProviderId: string
  note: string
}

const performedServiceStatuses = new Set<PerformedServiceStatus>([
  'draft',
  'finalized',
  'corrected',
  'voided',
])

const performedServiceSelectFields = [
  'id',
  'patient_id',
  'visit_id',
  'visit_procedure_id',
  'appointment_id',
  'treatment_plan_item_id',
  'service_id',
  'service_name_snapshot',
  'service_code_snapshot',
  'service_category_name_snapshot',
  'tooth_or_region',
  'quantity',
  'unit_price_amount',
  'discount_amount',
  'final_amount',
  'currency',
  'credited_provider_id',
  'status',
  'correction_of_id',
  'note',
  'performed_at',
  'created_at',
  'updated_at',
  'deleted_at',
].join(', ')

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function normalizeNullableId(value: string | null | undefined) {
  const normalizedValue = normalizeText(value)

  return normalizedValue || null
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function parseRequiredAmount(value: number | string) {
  const parsedValue = typeof value === 'number' ? value : Number(value.trim())

  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN
}

function parseOptionalAmount(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  return parseRequiredAmount(value)
}

function normalizeAmount(value: number) {
  return Math.round(value * 100) / 100
}

function numericOrZero(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function numericOrNull(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return null
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

function normalizePerformedServiceStatus(value: string): PerformedServiceStatus {
  return performedServiceStatuses.has(value as PerformedServiceStatus)
    ? (value as PerformedServiceStatus)
    : 'draft'
}

function classifyPerformedServiceError(errorMessage: string | undefined) {
  const normalizedError = errorMessage?.toLowerCase() ?? ''

  if (
    normalizedError.includes('permission') ||
    normalizedError.includes('row-level security') ||
    normalizedError.includes('not allowed')
  ) {
    return 'permission' as const
  }

  if (
    normalizedError.includes('not found') ||
    normalizedError.includes('no rows')
  ) {
    return 'not_found' as const
  }

  if (
    normalizedError.includes('check constraint') ||
    normalizedError.includes('cannot be silently updated') ||
    normalizedError.includes('must belong') ||
    normalizedError.includes('must match') ||
    normalizedError.includes('must reference') ||
    normalizedError.includes('requires')
  ) {
    return 'validation' as const
  }

  return 'unknown' as const
}

function getPerformedServicesFinalizationState(
  visitStatus: string | null,
  performedServices: PerformedServiceRecord[],
): PerformedServicesFinalizationState {
  const draftCount = performedServices.filter(
    (service) => service.status === 'draft',
  ).length
  const finalizedCount = performedServices.filter(
    (service) => service.status === 'finalized',
  ).length
  const totalCount = performedServices.length

  if (totalCount === 0) {
    return {
      status: 'no_services',
      visitStatus,
      performedServices,
      draftCount,
      finalizedCount,
      totalCount,
      needsRetry: false,
      message:
        'No performed services are recorded for this visit. No finalization is required.',
    }
  }

  if (visitStatus !== 'completed') {
    return {
      status: draftCount > 0 ? 'open_visit_drafts' : 'blocked',
      visitStatus,
      performedServices,
      draftCount,
      finalizedCount,
      totalCount,
      needsRetry: false,
      message:
        'Performed services can be finalized only after the visit is completed.',
    }
  }

  if (draftCount > 0) {
    return {
      status: 'finalization_required',
      visitStatus,
      performedServices,
      draftCount,
      finalizedCount,
      totalCount,
      needsRetry: true,
      message:
        'One or more draft performed services still need finalization for this completed visit.',
    }
  }

  return {
    status: 'finalized',
    visitStatus,
    performedServices,
    draftCount,
    finalizedCount,
    totalCount,
    needsRetry: false,
    message: 'Performed services are finalized for this completed visit.',
  }
}

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn('[performedServicesService] Supabase client unavailable.', error)

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
      '[performedServicesService] Could not load current profile context.',
      profileError,
    )

    return null
  }

  return (profileData as SupabaseProfileContextRow | null) ?? null
}

function getCategoryFromRow(row: SupabaseServiceCatalogRow) {
  const relation = Array.isArray(row.service_categories)
    ? row.service_categories[0]
    : row.service_categories

  return relation ?? null
}

function mapRowToCatalogOption(
  row: SupabaseServiceCatalogRow,
): ServiceCatalogOption {
  const category = getCategoryFromRow(row)

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: category?.name ?? '',
    name: row.name,
    code: row.code ?? '',
    defaultUnitPrice: numericOrNull(row.default_price),
    currency: row.currency ?? 'RSD',
    active: row.active,
    deletedAt: row.deleted_at,
  }
}

function mapRowToPerformedService(
  row: SupabasePerformedServiceRow,
  creditedProvider: AppointmentProviderSummary | null = null,
): PerformedServiceRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    visitId: row.visit_id,
    visitProcedureId: row.visit_procedure_id,
    appointmentId: row.appointment_id,
    treatmentPlanItemId: row.treatment_plan_item_id,
    serviceId: row.service_id,
    serviceNameSnapshot: row.service_name_snapshot,
    serviceCodeSnapshot: row.service_code_snapshot ?? '',
    serviceCategoryNameSnapshot: row.service_category_name_snapshot ?? '',
    toothOrRegion: row.tooth_or_region ?? '',
    quantity: numericOrZero(row.quantity),
    unitPriceAmount: numericOrZero(row.unit_price_amount),
    discountAmount: numericOrZero(row.discount_amount),
    finalAmount: numericOrZero(row.final_amount),
    currency: row.currency ?? 'RSD',
    creditedProviderId: row.credited_provider_id,
    creditedProvider,
    status: normalizePerformedServiceStatus(row.status),
    correctionOfId: row.correction_of_id,
    note: row.note ?? '',
    performedAt: row.performed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function attachCreditedProviders(
  rows: SupabasePerformedServiceRow[],
  providers: AppointmentProviderSummary[],
) {
  const providerById = new Map(providers.map((provider) => [provider.id, provider]))

  return rows.map((row) =>
    mapRowToPerformedService(
      row,
      providerById.get(row.credited_provider_id) ?? null,
    ),
  )
}

async function mapRowsToPerformedServices(rows: SupabasePerformedServiceRow[]) {
  if (rows.length === 0) {
    return []
  }

  try {
    const providers = await fetchAssignableAppointmentProviders()

    return attachCreditedProviders(rows, providers)
  } catch (error) {
    console.warn(
      '[performedServicesService] Credited provider display lookup failed.',
      error,
    )

    return rows.map((row) => mapRowToPerformedService(row))
  }
}

async function fetchVisitStatusForPerformedServices(
  patientId: string,
  visitId: string,
  clinicId: string,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      data: null,
      error: 'Supabase client is not available.',
    }
  }

  const { data, error } = await supabase
    .from('visits')
    .select('id, patient_id, status')
    .eq('id', visitId)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    return {
      data: null,
      error: error.message ?? 'Visit status could not be loaded.',
    }
  }

  return {
    data: (data as unknown as SupabaseVisitStatusRow | null) ?? null,
    error: null,
  }
}

async function fetchPerformedServiceRowsForVisitContext(
  patientId: string,
  visitId: string,
  clinicId: string,
) {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      rows: [],
      error: 'Supabase client is not available.',
    }
  }

  const { data, error } = await supabase
    .from('performed_services')
    .select(performedServiceSelectFields)
    .eq('visit_id', visitId)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    return {
      rows: [],
      error: error.message ?? 'Performed services could not be loaded.',
    }
  }

  return {
    rows: (data as unknown as SupabasePerformedServiceRow[] | null) ?? [],
    error: null,
  }
}

async function buildPerformedServicesFinalizationState(
  patientId: string,
  visitId: string,
  profileContext: SupabaseProfileContextRow,
) {
  const visitResult = await fetchVisitStatusForPerformedServices(
    patientId,
    visitId,
    profileContext.clinic_id,
  )

  if (visitResult.error) {
    return {
      state: null,
      error: visitResult.error,
    }
  }

  if (!visitResult.data) {
    return {
      state: null,
      error: 'Visit not found or you do not have permission to load it.',
    }
  }

  const servicesResult = await fetchPerformedServiceRowsForVisitContext(
    patientId,
    visitId,
    profileContext.clinic_id,
  )

  if (servicesResult.error) {
    return {
      state: null,
      error: servicesResult.error,
    }
  }

  const performedServices = await mapRowsToPerformedServices(servicesResult.rows)

  return {
    state: getPerformedServicesFinalizationState(
      visitResult.data.status,
      performedServices,
    ),
    error: null,
  }
}

function normalizePerformedServiceInput(
  input: CreatePerformedServiceInput,
): { value: NormalizedPerformedServiceInput | null; error: string | null } {
  const patientId = getPatientPersistenceId(input.patientId)
  const visitId = normalizeText(input.visitId)
  const serviceNameSnapshot = normalizeText(input.serviceNameSnapshot)
  const creditedProviderId = normalizeText(input.creditedProviderId)
  const quantity = parseRequiredAmount(input.quantity)
  const unitPriceAmount = parseRequiredAmount(input.unitPriceAmount)
  const discountAmount = parseOptionalAmount(input.discountAmount)
  const currency = normalizeText(input.currency) || 'RSD'

  if (!isUuid(patientId)) {
    return { value: null, error: 'A valid patient ID is required.' }
  }

  if (!isUuid(visitId)) {
    return { value: null, error: 'A valid visit ID is required.' }
  }

  if (!serviceNameSnapshot) {
    return { value: null, error: 'Service name snapshot is required.' }
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { value: null, error: 'Quantity must be greater than zero.' }
  }

  if (!Number.isFinite(unitPriceAmount) || unitPriceAmount < 0) {
    return { value: null, error: 'Unit price must be zero or greater.' }
  }

  if (!Number.isFinite(discountAmount) || discountAmount < 0) {
    return { value: null, error: 'Discount amount must be zero or greater.' }
  }

  const normalizedQuantity = normalizeAmount(quantity)
  const normalizedUnitPriceAmount = normalizeAmount(unitPriceAmount)
  const normalizedDiscountAmount = normalizeAmount(discountAmount)
  const grossAmount = normalizeAmount(
    normalizedQuantity * normalizedUnitPriceAmount,
  )

  if (normalizedDiscountAmount > grossAmount) {
    return {
      value: null,
      error: 'Discount amount cannot exceed the gross performed-service amount.',
    }
  }

  if (!isUuid(creditedProviderId)) {
    return { value: null, error: 'A credited provider is required.' }
  }

  return {
    value: {
      patientId,
      visitId,
      visitProcedureId: normalizeNullableId(input.visitProcedureId),
      appointmentId: normalizeNullableId(input.appointmentId),
      treatmentPlanItemId: normalizeNullableId(input.treatmentPlanItemId),
      serviceId: normalizeNullableId(input.serviceId),
      serviceNameSnapshot,
      serviceCodeSnapshot: normalizeText(input.serviceCodeSnapshot),
      serviceCategoryNameSnapshot: normalizeText(
        input.serviceCategoryNameSnapshot,
      ),
      toothOrRegion: normalizeText(input.toothOrRegion),
      quantity: normalizedQuantity,
      unitPriceAmount: normalizedUnitPriceAmount,
      discountAmount: normalizedDiscountAmount,
      finalAmount: normalizeAmount(grossAmount - normalizedDiscountAmount),
      currency,
      creditedProviderId,
      note: normalizeText(input.note),
    },
    error: null,
  }
}

function buildPerformedServiceInsertValues(
  input: NormalizedPerformedServiceInput,
  profileContext: SupabaseProfileContextRow,
) {
  return {
    clinic_id: profileContext.clinic_id,
    patient_id: input.patientId,
    visit_id: input.visitId,
    visit_procedure_id: input.visitProcedureId,
    appointment_id: input.appointmentId,
    treatment_plan_item_id: input.treatmentPlanItemId,
    service_id: input.serviceId,
    service_name_snapshot: input.serviceNameSnapshot,
    service_code_snapshot: input.serviceCodeSnapshot || null,
    service_category_name_snapshot: input.serviceCategoryNameSnapshot || null,
    tooth_or_region: input.toothOrRegion || null,
    quantity: input.quantity,
    unit_price_amount: input.unitPriceAmount,
    discount_amount: input.discountAmount,
    final_amount: input.finalAmount,
    currency: input.currency,
    credited_provider_id: input.creditedProviderId,
    status: 'draft',
    note: input.note || null,
    created_by: profileContext.id,
    updated_by: profileContext.id,
  }
}

export async function fetchCreditedProviderOptions() {
  return fetchAssignableAppointmentProviders()
}

export async function getPerformedServicesWorkflowAccess(): Promise<
  PerformedServicesWorkflowAccess
> {
  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      role: null,
      canManagePerformedServices: false,
      canReadPerformedServices: false,
    }
  }

  return {
    role: profileContext.role,
    canManagePerformedServices: [
      'owner_admin',
      'doctor',
      'specialist',
    ].includes(profileContext.role),
    canReadPerformedServices: [
      'owner_admin',
      'doctor',
      'specialist',
      'reception_admin',
    ].includes(profileContext.role),
  }
}

export async function fetchActiveServiceCatalog(): Promise<
  ServiceCatalogOption[]
> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    throw new Error('Supabase client is not available.')
  }

  const { data, error } = await supabase
    .from('services')
    .select(
      'id, category_id, name, code, default_price, currency, active, deleted_at, service_categories(id, name, active, deleted_at, sort_order)',
    )
    .eq('active', true)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) {
    console.warn(
      '[performedServicesService] Active service catalog failed to load.',
      error,
    )
    throw new Error(error.message ?? 'Service catalog could not be loaded.')
  }

  return ((data as SupabaseServiceCatalogRow[] | null) ?? [])
    .map(mapRowToCatalogOption)
    .sort((first, second) => {
      const categoryComparison = first.categoryName.localeCompare(
        second.categoryName,
      )

      return categoryComparison || first.name.localeCompare(second.name)
    })
}

export async function fetchPerformedServicesForVisit(
  visitId: string,
): Promise<PerformedServiceRecord[]> {
  const normalizedVisitId = normalizeText(visitId)

  if (!isUuid(normalizedVisitId)) {
    return []
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    throw new Error('Supabase client is not available.')
  }

  const { data, error } = await supabase
    .from('performed_services')
    .select(performedServiceSelectFields)
    .eq('visit_id', normalizedVisitId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    console.warn(
      '[performedServicesService] Performed services failed to load.',
      error,
    )
    throw new Error(error.message ?? 'Performed services could not be loaded.')
  }

  return mapRowsToPerformedServices(
    (data as unknown as SupabasePerformedServiceRow[] | null) ?? [],
  )
}

export async function createPerformedService(
  input: CreatePerformedServiceInput,
): Promise<PerformedServiceWriteResult> {
  const normalizedInput = normalizePerformedServiceInput(input)

  if (!normalizedInput.value) {
    return {
      ok: false,
      message: null,
      error: normalizedInput.error ?? 'Performed service input is invalid.',
      reason: 'validation',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      message: null,
      error: 'Active profile context is required to save performed services.',
      reason: 'permission',
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

  const { data, error } = await supabase
    .from('performed_services')
    .insert(buildPerformedServiceInsertValues(normalizedInput.value, profileContext))
    .select(performedServiceSelectFields)
    .single()

  if (error || !data) {
    const errorMessage =
      error?.message ?? 'Performed service could not be created.'

    return {
      ok: false,
      message: null,
      error: errorMessage,
      reason: classifyPerformedServiceError(errorMessage),
    }
  }

  const [performedService] = await mapRowsToPerformedServices([
    data as unknown as SupabasePerformedServiceRow,
  ])

  return {
    ok: true,
    performedService,
    message: 'Performed service was saved successfully.',
  }
}

export async function replaceDraftPerformedServicesForVisit(
  input: ReplaceDraftPerformedServicesInput,
): Promise<PerformedServiceWriteResult> {
  const patientId = getPatientPersistenceId(input.patientId)
  const visitId = normalizeText(input.visitId)

  if (!isUuid(patientId) || !isUuid(visitId)) {
    return {
      ok: false,
      performedServices: [],
      message: null,
      error: 'A valid patient ID and visit ID are required.',
      reason: 'validation',
    }
  }

  const normalizedInputs = input.performedServices.map((performedService) =>
    normalizePerformedServiceInput({
      ...performedService,
      patientId,
      visitId,
    }),
  )
  const firstInvalidInput = normalizedInputs.find((result) => !result.value)

  if (firstInvalidInput) {
    return {
      ok: false,
      performedServices: [],
      message: null,
      error:
        firstInvalidInput.error ??
        'One or more performed services are invalid.',
      reason: 'validation',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      performedServices: [],
      message: null,
      error: 'Active profile context is required to save performed services.',
      reason: 'permission',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      performedServices: [],
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const now = new Date().toISOString()
  const { error: archiveError } = await supabase
    .from('performed_services')
    .update({
      deleted_at: now,
      updated_by: profileContext.id,
    })
    .eq('visit_id', visitId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .eq('status', 'draft')
    .is('deleted_at', null)

  if (archiveError) {
    const errorMessage =
      archiveError.message ??
      'Existing draft performed services could not be archived.'

    return {
      ok: false,
      performedServices: [],
      message: null,
      error: errorMessage,
      reason: classifyPerformedServiceError(errorMessage),
    }
  }

  const insertValues = normalizedInputs
    .map((result) => result.value)
    .filter((value): value is NormalizedPerformedServiceInput => Boolean(value))
    .map((performedService) =>
      buildPerformedServiceInsertValues(performedService, profileContext),
    )

  if (insertValues.length === 0) {
    return {
      ok: true,
      performedServices: [],
      message: 'Draft performed services were saved successfully.',
    }
  }

  const { data, error } = await supabase
    .from('performed_services')
    .insert(insertValues)
    .select(performedServiceSelectFields)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    const errorMessage =
      error.message ?? 'Draft performed services could not be saved.'

    return {
      ok: false,
      performedServices: [],
      message: null,
      error: errorMessage,
      reason: classifyPerformedServiceError(errorMessage),
    }
  }

  return {
    ok: true,
    performedServices: await mapRowsToPerformedServices(
      (data as unknown as SupabasePerformedServiceRow[] | null) ?? [],
    ),
    message: 'Draft performed services were saved successfully.',
  }
}

export async function finalizePerformedServicesForVisit(
  input: FinalizePerformedServicesForVisitInput,
): Promise<PerformedServiceWriteResult> {
  const patientId = getPatientPersistenceId(input.patientId)
  const visitId = normalizeText(input.visitId)

  if (!isUuid(patientId) || !isUuid(visitId)) {
    return {
      ok: false,
      performedServices: [],
      message: null,
      error: 'A valid patient ID and visit ID are required.',
      reason: 'validation',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      performedServices: [],
      message: null,
      error: 'Active profile context is required to finalize performed services.',
      reason: 'permission',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      performedServices: [],
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const { data, error } = await supabase
    .from('performed_services')
    .update({
      status: 'finalized',
      performed_at: input.performedAt ?? new Date().toISOString(),
      updated_by: profileContext.id,
    })
    .eq('visit_id', visitId)
    .eq('patient_id', patientId)
    .eq('clinic_id', profileContext.clinic_id)
    .eq('status', 'draft')
    .is('deleted_at', null)
    .select(performedServiceSelectFields)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    const errorMessage =
      error.message ?? 'Performed services could not be finalized.'

    return {
      ok: false,
      performedServices: [],
      message: null,
      error: errorMessage,
      reason: classifyPerformedServiceError(errorMessage),
    }
  }

  return {
    ok: true,
    performedServices: await mapRowsToPerformedServices(
      (data as unknown as SupabasePerformedServiceRow[] | null) ?? [],
    ),
    message: 'Performed services were finalized successfully.',
  }
}

export async function getPerformedServicesFinalizationStateForVisit(
  input: FinalizePerformedServicesForVisitInput,
): Promise<PerformedServicesFinalizationResult> {
  const patientId = getPatientPersistenceId(input.patientId)
  const visitId = normalizeText(input.visitId)

  if (!isUuid(patientId) || !isUuid(visitId)) {
    return {
      ok: false,
      state: null,
      performedServices: [],
      message: null,
      error: 'A valid patient ID and visit ID are required.',
      reason: 'validation',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      state: null,
      performedServices: [],
      message: null,
      error:
        'Active profile context is required to load performed-service finalization state.',
      reason: 'permission',
    }
  }

  const stateResult = await buildPerformedServicesFinalizationState(
    patientId,
    visitId,
    profileContext,
  )

  if (!stateResult.state) {
    const errorMessage =
      stateResult.error ??
      'Performed-service finalization state could not be loaded.'

    return {
      ok: false,
      state: null,
      performedServices: [],
      message: null,
      error: errorMessage,
      reason: classifyPerformedServiceError(errorMessage),
    }
  }

  return {
    ok: true,
    state: stateResult.state,
    performedServices: stateResult.state.performedServices,
    message: stateResult.state.message,
  }
}

export async function finalizePerformedServicesForCompletedVisit(
  input: FinalizePerformedServicesForVisitInput,
): Promise<PerformedServicesFinalizationResult> {
  const patientId = getPatientPersistenceId(input.patientId)
  const visitId = normalizeText(input.visitId)

  if (!isUuid(patientId) || !isUuid(visitId)) {
    return {
      ok: false,
      state: null,
      performedServices: [],
      message: null,
      error: 'A valid patient ID and visit ID are required.',
      reason: 'validation',
    }
  }

  const profileContext = await getCurrentSupabaseProfileContext()

  if (!profileContext || profileContext.status !== 'active') {
    return {
      ok: false,
      state: null,
      performedServices: [],
      message: null,
      error: 'Active profile context is required to finalize performed services.',
      reason: 'permission',
    }
  }

  const initialState = await buildPerformedServicesFinalizationState(
    patientId,
    visitId,
    profileContext,
  )

  if (!initialState.state) {
    const errorMessage =
      initialState.error ??
      'Performed-service finalization state could not be loaded.'

    return {
      ok: false,
      state: null,
      performedServices: [],
      message: null,
      error: errorMessage,
      reason: classifyPerformedServiceError(errorMessage),
    }
  }

  if (
    initialState.state.status === 'no_services' ||
    initialState.state.status === 'finalized'
  ) {
    return {
      ok: true,
      state: initialState.state,
      performedServices: initialState.state.performedServices,
      message: initialState.state.message,
    }
  }

  if (initialState.state.visitStatus !== 'completed') {
    return {
      ok: false,
      state: initialState.state,
      performedServices: initialState.state.performedServices,
      message: null,
      error:
        'Performed services can be finalized only after the visit is completed.',
      reason: 'conflict',
    }
  }

  const finalizeResult = await finalizePerformedServicesForVisit({
    patientId,
    visitId,
    performedAt: input.performedAt,
  })

  if (!finalizeResult.ok) {
    const retryState = await buildPerformedServicesFinalizationState(
      patientId,
      visitId,
      profileContext,
    )

    return {
      ok: false,
      state: retryState.state,
      performedServices: retryState.state?.performedServices ?? [],
      message: null,
      error:
        finalizeResult.error ??
        'Performed services could not be finalized. Retry is required.',
      reason: finalizeResult.reason ?? 'unknown',
    }
  }

  const finalState = await buildPerformedServicesFinalizationState(
    patientId,
    visitId,
    profileContext,
  )

  if (!finalState.state) {
    const errorMessage =
      finalState.error ??
      'Performed services were finalized, but finalization state could not be reloaded.'

    return {
      ok: false,
      state: null,
      performedServices: finalizeResult.performedServices ?? [],
      message: null,
      error: errorMessage,
      reason: classifyPerformedServiceError(errorMessage),
    }
  }

  if (finalState.state.needsRetry) {
    return {
      ok: false,
      state: finalState.state,
      performedServices: finalState.state.performedServices,
      message: null,
      error:
        'Some performed services remain draft after finalization. Retry is required.',
      reason: 'conflict',
    }
  }

  return {
    ok: true,
    state: finalState.state,
    performedServices: finalState.state.performedServices,
    message: finalState.state.message,
  }
}
