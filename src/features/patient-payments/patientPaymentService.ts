import { getPatientPersistenceId } from '../patients/patientService'

export type PatientPaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'other'

export type PatientPaymentResultStatus =
  | 'recorded'
  | 'already_recorded'
  | 'reversed'
  | 'already_reversed'
  | 'blocked'
  | 'invalid'
  | 'error'

export type PatientPaymentResultReason =
  | 'permission'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'unknown'

export type RecordPatientPaymentInput = {
  patientId: string
  amount: number
  currency: string
  paymentMethod: PatientPaymentMethod
  receivedAt?: string | null
  referenceNumber?: string | null
  notes?: string | null
  idempotencyKey?: string | null
}

export type ReversePatientPaymentInput = {
  paymentId: string
  reason: string
}

export type PatientPaymentOperationState = {
  status: PatientPaymentResultStatus
  paymentId: string | null
  ledgerEntryId: string | null
  reversalLedgerEntryId: string | null
  patientId: string | null
  amount: number
  currency: string | null
  paymentMethod: PatientPaymentMethod | null
  receivedAt: string | null
  reversedAt: string | null
  message: string
}

export type PatientPaymentOperationResult = {
  ok: boolean
  state: PatientPaymentOperationState | null
  message: string | null
  error?: string
  reason?: PatientPaymentResultReason
}

type PaymentRpcResponse = {
  ok?: boolean
  status?: string
  message?: string
  reason?: string
  paymentId?: string
  ledgerEntryId?: string
  reversalLedgerEntryId?: string
  patientId?: string
  amount?: number | string
  currency?: string
  paymentMethod?: string
  receivedAt?: string
  reversedAt?: string
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function normalizeNullableText(value: string | null | undefined) {
  const trimmed = normalizeText(value)

  return trimmed || null
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function numericValue(value: number | string | null | undefined) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

function normalizeMethod(
  value: string | null | undefined,
): PatientPaymentMethod | null {
  if (
    value === 'cash' ||
    value === 'card' ||
    value === 'bank_transfer' ||
    value === 'other'
  ) {
    return value
  }

  return null
}

function normalizeStatus(
  value: string | null | undefined,
): PatientPaymentResultStatus {
  if (
    value === 'recorded' ||
    value === 'already_recorded' ||
    value === 'reversed' ||
    value === 'already_reversed' ||
    value === 'blocked' ||
    value === 'invalid'
  ) {
    return value
  }

  return 'error'
}

function normalizeReason(
  reason: string | null | undefined,
): PatientPaymentResultReason {
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

async function getSupabaseClientSafe() {
  try {
    const supabaseModule = await import('../../lib/supabaseClient')

    return supabaseModule.supabase
  } catch (error) {
    console.warn('[patientPaymentService] Supabase client unavailable.', error)

    return null
  }
}

function mapPaymentRpcResponse(
  response: PaymentRpcResponse | null,
  fallbackMessage: string,
): PatientPaymentOperationResult {
  if (!response) {
    return {
      ok: false,
      state: null,
      message: null,
      error: fallbackMessage,
      reason: 'unknown',
    }
  }

  const status = normalizeStatus(response.status)
  const message = normalizeText(response.message) || fallbackMessage
  const state: PatientPaymentOperationState = {
    status,
    paymentId: response.paymentId ?? null,
    ledgerEntryId: response.ledgerEntryId ?? null,
    reversalLedgerEntryId: response.reversalLedgerEntryId ?? null,
    patientId: response.patientId ?? null,
    amount: numericValue(response.amount),
    currency: response.currency ?? null,
    paymentMethod: normalizeMethod(response.paymentMethod),
    receivedAt: response.receivedAt ?? null,
    reversedAt: response.reversedAt ?? null,
    message,
  }
  const ok =
    response.ok === true &&
    (status === 'recorded' ||
      status === 'already_recorded' ||
      status === 'reversed' ||
      status === 'already_reversed')

  return {
    ok,
    state,
    message,
    error: ok ? undefined : message,
    reason: ok ? undefined : normalizeReason(response.reason),
  }
}

export async function recordPatientPayment(
  input: RecordPatientPaymentInput,
): Promise<PatientPaymentOperationResult> {
  const patientId = getPatientPersistenceId(input.patientId)
  const currency = normalizeText(input.currency).toUpperCase()
  const amount = Number(input.amount)

  if (!isUuid(patientId)) {
    return {
      ok: false,
      state: null,
      message: null,
      error: 'A valid patient ID is required.',
      reason: 'validation',
    }
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      state: null,
      message: null,
      error: 'Payment amount must be greater than zero.',
      reason: 'validation',
    }
  }

  if (!/^[A-Z]{3}$/.test(currency)) {
    return {
      ok: false,
      state: null,
      message: null,
      error: 'Payment currency must be a three-letter currency code.',
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

  const { data, error } = await supabase.rpc('record_patient_payment', {
    target_patient_id: patientId,
    payment_amount: amount,
    payment_currency: currency,
    payment_method: input.paymentMethod,
    payment_received_at: normalizeNullableText(input.receivedAt),
    payment_reference_number: normalizeNullableText(input.referenceNumber),
    payment_notes: normalizeNullableText(input.notes),
    payment_idempotency_key: normalizeNullableText(input.idempotencyKey),
  })

  if (error) {
    return {
      ok: false,
      state: null,
      message: null,
      error: error.message ?? 'Patient payment could not be recorded.',
      reason: 'unknown',
    }
  }

  return mapPaymentRpcResponse(
    data as PaymentRpcResponse | null,
    'Patient payment could not be recorded.',
  )
}

export async function reversePatientPayment(
  input: ReversePatientPaymentInput,
): Promise<PatientPaymentOperationResult> {
  const paymentId = normalizeText(input.paymentId)
  const reason = normalizeText(input.reason)

  if (!isUuid(paymentId)) {
    return {
      ok: false,
      state: null,
      message: null,
      error: 'A valid payment ID is required.',
      reason: 'validation',
    }
  }

  if (!reason) {
    return {
      ok: false,
      state: null,
      message: null,
      error: 'A reversal reason is required.',
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

  const { data, error } = await supabase.rpc('reverse_patient_payment', {
    target_payment_id: paymentId,
    reversal_reason: reason,
  })

  if (error) {
    return {
      ok: false,
      state: null,
      message: null,
      error: error.message ?? 'Patient payment could not be reversed.',
      reason: 'unknown',
    }
  }

  return mapPaymentRpcResponse(
    data as PaymentRpcResponse | null,
    'Patient payment could not be reversed.',
  )
}
