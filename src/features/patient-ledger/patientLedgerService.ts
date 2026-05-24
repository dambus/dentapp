import { getPatientPersistenceId } from '../patients/patientService'
import {
  fetchPerformedServicesForVisit,
  type PerformedServiceRecord,
} from '../performed-services/performedServicesService'

export type PatientLedgerChargePostingStatus =
  | 'posting_required'
  | 'posted'
  | 'already_posted'
  | 'no_services'
  | 'blocked'
  | 'error'

export type PatientLedgerChargePostingReason =
  | 'permission'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'unknown'

export type PatientLedgerChargePostingState = {
  status: PatientLedgerChargePostingStatus
  visitId: string | null
  patientId: string | null
  finalizedServiceCount: number
  postedChargeCount: number
  missingChargeCount: number
  createdChargeCount: number
  message: string
  needsPosting: boolean
}

export type PatientLedgerChargePostingResult = {
  ok: boolean
  state: PatientLedgerChargePostingState | null
  message: string | null
  error?: string
  reason?: PatientLedgerChargePostingReason
}

export type CompletedVisitFinancialSummaryStatus =
  | 'posted'
  | 'pending'
  | 'no_services'
  | 'blocked'
  | 'error'

export type CompletedVisitLedgerCharge = {
  id: string
  performedServiceId: string
  amount: number
  currency: string
  status: string
}

export type CompletedVisitChargeTotal = {
  currency: string
  amount: number
}

export type CompletedVisitFinancialSummary = {
  status: CompletedVisitFinancialSummaryStatus
  canReadFinancialData: boolean
  finalizedServices: PerformedServiceRecord[]
  postedCharges: CompletedVisitLedgerCharge[]
  postedChargeTotals: CompletedVisitChargeTotal[]
  message: string
}

export type CompletedVisitFinancialSummaryResult = {
  ok: boolean
  summary: CompletedVisitFinancialSummary | null
  error?: string
  reason?: PatientLedgerChargePostingReason
}

export type PatientPostedChargesSummaryStatus =
  | 'available'
  | 'no_charges'
  | 'blocked'
  | 'error'

export type PatientPostedChargeEntry = {
  id: string
  visitId: string | null
  performedServiceId: string | null
  descriptionSnapshot: string
  amount: number
  currency: string
  postedAt: string
}

export type PatientPostedChargesSummary = {
  status: PatientPostedChargesSummaryStatus
  canReadFinancialData: boolean
  charges: PatientPostedChargeEntry[]
  totals: CompletedVisitChargeTotal[]
  message: string
}

export type PatientPostedChargesSummaryResult = {
  ok: boolean
  summary: PatientPostedChargesSummary | null
  error?: string
  reason?: PatientLedgerChargePostingReason
}

type LedgerPostingRpcResponse = {
  ok?: boolean
  status?: string
  message?: string
  reason?: string
  visitId?: string
  patientId?: string
  finalizedServiceCount?: number
  postedChargeCount?: number
  missingChargeCount?: number
  createdChargeCount?: number
}

type LedgerChargeRow = {
  id: string
  performed_service_id: string | null
  amount: number | string
  currency: string | null
  status: string
}

type PatientLedgerChargeActivityRow = LedgerChargeRow & {
  visit_id: string | null
  description_snapshot: string | null
  posted_at: string
}

type ProfileContextRow = {
  role: string
  status: string
}

const financialReadRoles = new Set([
  'owner_admin',
  'doctor',
  'specialist',
  'reception_admin',
])

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function numericOrZero(value: number | null | undefined) {
  return Number.isFinite(value) ? Number(value) : 0
}

function numericValue(value: number | string | null | undefined) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

function normalizeStatus(
  status: string | null | undefined,
): PatientLedgerChargePostingStatus {
  if (
    status === 'posting_required' ||
    status === 'posted' ||
    status === 'already_posted' ||
    status === 'no_services' ||
    status === 'blocked'
  ) {
    return status
  }

  return 'error'
}

function normalizeReason(
  reason: string | null | undefined,
): PatientLedgerChargePostingReason {
  if (
    reason === 'permission' ||
    reason === 'not_found' ||
    reason === 'conflict' ||
    reason === 'validation'
  ) {
    return reason
  }

  return 'unknown'
}

function mapRpcResponseToState(
  response: LedgerPostingRpcResponse,
): PatientLedgerChargePostingState {
  const status = normalizeStatus(response.status)

  return {
    status,
    visitId: response.visitId ?? null,
    patientId: response.patientId ?? null,
    finalizedServiceCount: numericOrZero(response.finalizedServiceCount),
    postedChargeCount: numericOrZero(response.postedChargeCount),
    missingChargeCount: numericOrZero(response.missingChargeCount),
    createdChargeCount: numericOrZero(response.createdChargeCount),
    message:
      normalizeText(response.message) ||
      'Patient ledger charge posting state was loaded.',
    needsPosting: status === 'posting_required',
  }
}

function mapRpcResult(
  response: LedgerPostingRpcResponse | null,
  fallbackMessage: string,
): PatientLedgerChargePostingResult {
  if (!response) {
    return {
      ok: false,
      state: null,
      message: null,
      error: fallbackMessage,
      reason: 'unknown',
    }
  }

  const state = mapRpcResponseToState(response)
  const ok = response.ok === true && state.status !== 'blocked'

  return {
    ok,
    state,
    message: state.message,
    error: ok ? undefined : state.message,
    reason: ok ? undefined : normalizeReason(response.reason),
  }
}

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn('[patientLedgerService] Supabase client unavailable.', error)

    return null
  }
}

async function getCurrentFinancialProfileContext(): Promise<ProfileContextRow | null> {
  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return null
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as ProfileContextRow
}

function mapLedgerChargeRow(row: LedgerChargeRow): CompletedVisitLedgerCharge {
  return {
    id: row.id,
    performedServiceId: row.performed_service_id ?? '',
    amount: numericValue(row.amount),
    currency: row.currency ?? 'RSD',
    status: row.status,
  }
}

function getPostedChargeTotals(charges: CompletedVisitLedgerCharge[]) {
  const totalsByCurrency = new Map<string, number>()

  for (const charge of charges) {
    totalsByCurrency.set(
      charge.currency,
      (totalsByCurrency.get(charge.currency) ?? 0) + charge.amount,
    )
  }

  return Array.from(totalsByCurrency.entries())
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((first, second) => first.currency.localeCompare(second.currency))
}

function getChargeActivityTotals(charges: PatientPostedChargeEntry[]) {
  const totalsByCurrency = new Map<string, number>()

  for (const charge of charges) {
    totalsByCurrency.set(
      charge.currency,
      (totalsByCurrency.get(charge.currency) ?? 0) + charge.amount,
    )
  }

  return Array.from(totalsByCurrency.entries())
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((first, second) => first.currency.localeCompare(second.currency))
}

function mapPatientLedgerChargeActivityRow(
  row: PatientLedgerChargeActivityRow,
): PatientPostedChargeEntry {
  return {
    id: row.id,
    visitId: row.visit_id,
    performedServiceId: row.performed_service_id,
    descriptionSnapshot:
      normalizeText(row.description_snapshot) || 'Posted service charge',
    amount: numericValue(row.amount),
    currency: row.currency ?? 'RSD',
    postedAt: row.posted_at,
  }
}

export async function getPatientLedgerChargePostingStateForVisit(
  visitId: string,
): Promise<PatientLedgerChargePostingResult> {
  const normalizedVisitId = normalizeText(visitId)

  if (!isUuid(normalizedVisitId)) {
    return {
      ok: false,
      state: null,
      message: null,
      error: 'A valid visit ID is required.',
      reason: 'validation',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      state: null,
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const { data, error } = await supabase.rpc(
    'get_patient_ledger_charge_posting_state_for_visit',
    {
      target_visit_id: normalizedVisitId,
    },
  )

  if (error) {
    return {
      ok: false,
      state: null,
      message: null,
      error:
        error.message ??
        'Patient ledger charge posting state could not be loaded.',
      reason: 'unknown',
    }
  }

  return mapRpcResult(
    data as LedgerPostingRpcResponse | null,
    'Patient ledger charge posting state could not be loaded.',
  )
}

export async function postFinalizedPerformedServicesChargesForVisit(
  visitId: string,
): Promise<PatientLedgerChargePostingResult> {
  const normalizedVisitId = normalizeText(visitId)

  if (!isUuid(normalizedVisitId)) {
    return {
      ok: false,
      state: null,
      message: null,
      error: 'A valid visit ID is required.',
      reason: 'validation',
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      state: null,
      message: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const { data, error } = await supabase.rpc(
    'post_finalized_performed_services_to_patient_ledger',
    {
      target_visit_id: normalizedVisitId,
    },
  )

  if (error) {
    return {
      ok: false,
      state: null,
      message: null,
      error:
        error.message ??
        'Finalized performed services could not be posted to the patient ledger.',
      reason: 'unknown',
    }
  }

  return mapRpcResult(
    data as LedgerPostingRpcResponse | null,
    'Finalized performed services could not be posted to the patient ledger.',
  )
}

export async function getCompletedVisitFinancialSummary(
  patientId: string,
  visitId: string,
): Promise<CompletedVisitFinancialSummaryResult> {
  const normalizedVisitId = normalizeText(visitId)
  const normalizedPatientId = getPatientPersistenceId(patientId)

  if (!isUuid(normalizedVisitId) || !isUuid(normalizedPatientId)) {
    return {
      ok: false,
      summary: null,
      error: 'A valid patient ID and visit ID are required.',
      reason: 'validation',
    }
  }

  const profileContext = await getCurrentFinancialProfileContext()

  if (
    !profileContext ||
    profileContext.status !== 'active' ||
    !financialReadRoles.has(profileContext.role)
  ) {
    return {
      ok: true,
      summary: {
        status: 'blocked',
        canReadFinancialData: false,
        finalizedServices: [],
        postedCharges: [],
        postedChargeTotals: [],
        message:
          'Services and charges are not available for the current role.',
      },
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      summary: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  try {
    const performedServices = await fetchPerformedServicesForVisit(
      normalizedVisitId,
    )
    const finalizedServices = performedServices.filter(
      (service) =>
        service.patientId === normalizedPatientId &&
        service.status === 'finalized' &&
        !service.deletedAt,
    )

    if (finalizedServices.length === 0) {
      return {
        ok: true,
        summary: {
          status: 'no_services',
          canReadFinancialData: true,
          finalizedServices: [],
          postedCharges: [],
          postedChargeTotals: [],
          message: 'No performed services were recorded for this visit.',
        },
      }
    }

    const { data, error } = await supabase
      .from('patient_ledger_entries')
      .select('id, performed_service_id, amount, currency, status')
      .eq('patient_id', normalizedPatientId)
      .eq('visit_id', normalizedVisitId)
      .eq('entry_type', 'charge')
      .eq('status', 'posted')

    if (error) {
      return {
        ok: false,
        summary: null,
        error:
          error.message ??
          'Completed visit posted charge visibility could not be loaded.',
        reason: 'unknown',
      }
    }

    const finalizedServiceIds = new Set(
      finalizedServices.map((service) => service.id),
    )
    const postedCharges = ((data as LedgerChargeRow[] | null) ?? [])
      .map(mapLedgerChargeRow)
      .filter((charge) => finalizedServiceIds.has(charge.performedServiceId))
    const postedServiceIds = new Set(
      postedCharges.map((charge) => charge.performedServiceId),
    )
    const allFinalizedServicesPosted = finalizedServices.every((service) =>
      postedServiceIds.has(service.id),
    )

    return {
      ok: true,
      summary: {
        status: allFinalizedServicesPosted ? 'posted' : 'pending',
        canReadFinancialData: true,
        finalizedServices,
        postedCharges,
        postedChargeTotals: getPostedChargeTotals(postedCharges),
        message: allFinalizedServicesPosted
          ? 'Finalized services have posted charge entries for this visit.'
          : 'Charges have not been fully posted to the patient account.',
      },
    }
  } catch (error) {
    return {
      ok: false,
      summary: null,
      error:
        error instanceof Error
          ? error.message
          : 'Completed visit services and charges could not be loaded.',
      reason: 'unknown',
    }
  }
}

export async function getPatientPostedChargesSummary(
  patientId: string,
): Promise<PatientPostedChargesSummaryResult> {
  const normalizedPatientId = getPatientPersistenceId(patientId)

  if (!isUuid(normalizedPatientId)) {
    return {
      ok: false,
      summary: null,
      error: 'A valid patient ID is required.',
      reason: 'validation',
    }
  }

  const profileContext = await getCurrentFinancialProfileContext()

  if (
    !profileContext ||
    profileContext.status !== 'active' ||
    !financialReadRoles.has(profileContext.role)
  ) {
    return {
      ok: true,
      summary: {
        status: 'blocked',
        canReadFinancialData: false,
        charges: [],
        totals: [],
        message: 'Posted charges are not available for the current role.',
      },
    }
  }

  const supabase = await getSupabaseClientSafe()

  if (!supabase) {
    return {
      ok: false,
      summary: null,
      error: 'Supabase client is not available.',
      reason: 'unknown',
    }
  }

  const { data, error } = await supabase
    .from('patient_ledger_entries')
    .select(
      'id, visit_id, performed_service_id, description_snapshot, amount, currency, status, posted_at',
    )
    .eq('patient_id', normalizedPatientId)
    .eq('entry_type', 'charge')
    .eq('direction', 'debit')
    .eq('status', 'posted')
    .order('posted_at', { ascending: false })

  if (error) {
    return {
      ok: false,
      summary: null,
      error:
        error.message ?? 'Patient posted charges could not be loaded.',
      reason: 'unknown',
    }
  }

  const charges = ((data as PatientLedgerChargeActivityRow[] | null) ?? []).map(
    mapPatientLedgerChargeActivityRow,
  )

  if (charges.length === 0) {
    return {
      ok: true,
      summary: {
        status: 'no_charges',
        canReadFinancialData: true,
        charges: [],
        totals: [],
        message: 'No posted charges recorded for this patient.',
      },
    }
  }

  return {
    ok: true,
    summary: {
      status: 'available',
      canReadFinancialData: true,
      charges,
      totals: getChargeActivityTotals(charges),
      message: 'Posted charges recorded in DentApp.',
    },
  }
}
