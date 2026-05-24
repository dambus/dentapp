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
