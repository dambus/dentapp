import type {
  CreatePerformedServiceInput,
  PerformedServiceRecord,
  ServiceCatalogOption,
} from './performedServicesService'

export type PerformedServiceDraftRow = {
  id: string
  serviceId: string
  serviceNameSnapshot: string
  serviceCodeSnapshot: string
  serviceCategoryNameSnapshot: string
  quantity: string
  unitPriceAmount: string
  currency: string
  creditedProviderId: string
  creditedProviderName: string
  toothOrRegion: string
}

export function createPerformedServiceDraftRow(
  options: {
    creditedProviderId?: string | null
    service?: ServiceCatalogOption | null
  } = {},
): PerformedServiceDraftRow {
  return {
    id: crypto.randomUUID(),
    serviceId: options.service?.id ?? '',
    serviceNameSnapshot: options.service?.name ?? '',
    serviceCodeSnapshot: options.service?.code ?? '',
    serviceCategoryNameSnapshot: options.service?.categoryName ?? '',
    quantity: '1',
    unitPriceAmount:
      options.service?.defaultUnitPrice !== null &&
      options.service?.defaultUnitPrice !== undefined
        ? String(options.service.defaultUnitPrice)
        : '0',
    currency: options.service?.currency ?? 'RSD',
    creditedProviderId: options.creditedProviderId ?? '',
    creditedProviderName: '',
    toothOrRegion: '',
  }
}

export function mapPerformedServiceRecordToDraftRow(
  record: PerformedServiceRecord,
): PerformedServiceDraftRow {
  return {
    id: record.id,
    serviceId: record.serviceId ?? '',
    serviceNameSnapshot: record.serviceNameSnapshot,
    serviceCodeSnapshot: record.serviceCodeSnapshot,
    serviceCategoryNameSnapshot: record.serviceCategoryNameSnapshot,
    quantity: String(record.quantity),
    unitPriceAmount: String(record.unitPriceAmount),
    currency: record.currency,
    creditedProviderId: record.creditedProviderId,
    creditedProviderName: record.creditedProvider?.fullName ?? '',
    toothOrRegion: record.toothOrRegion,
  }
}

export function getPerformedServiceDraftLineAmount(
  row: Pick<PerformedServiceDraftRow, 'quantity' | 'unitPriceAmount'>,
) {
  const quantity = Number(row.quantity)
  const unitPriceAmount = Number(row.unitPriceAmount)

  if (!Number.isFinite(quantity) || !Number.isFinite(unitPriceAmount)) {
    return 0
  }

  return Math.max(0, Math.round(quantity * unitPriceAmount * 100) / 100)
}

export function getPerformedServicesDraftTotal(
  rows: PerformedServiceDraftRow[],
) {
  return rows.reduce(
    (total, row) => total + getPerformedServiceDraftLineAmount(row),
    0,
  )
}

export function formatPerformedServiceAmount(amount: number, currency = 'RSD') {
  return `${amount.toLocaleString('sr-RS', {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })} ${currency}`
}

export function validatePerformedServiceDraftRows(
  rows: PerformedServiceDraftRow[],
) {
  const incompleteRow = rows.find((row) => {
    const quantity = Number(row.quantity)
    const unitPrice = Number(row.unitPriceAmount)

    return (
      !row.serviceId ||
      !row.serviceNameSnapshot.trim() ||
      !row.creditedProviderId ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    )
  })

  return incompleteRow
    ? 'Each service row needs a selected service, quantity greater than zero, unit price zero or greater, and credited provider.'
    : null
}

export function buildPerformedServiceInputs(
  rows: PerformedServiceDraftRow[],
  context: {
    appointmentId?: string | null
    patientId: string
    visitId: string
  },
): CreatePerformedServiceInput[] {
  return rows.map((row) => ({
    patientId: context.patientId,
    visitId: context.visitId,
    appointmentId: context.appointmentId ?? null,
    serviceId: row.serviceId,
    serviceNameSnapshot: row.serviceNameSnapshot,
    serviceCodeSnapshot: row.serviceCodeSnapshot || null,
    serviceCategoryNameSnapshot: row.serviceCategoryNameSnapshot || null,
    toothOrRegion: row.toothOrRegion || null,
    quantity: row.quantity,
    unitPriceAmount: row.unitPriceAmount,
    discountAmount: 0,
    currency: row.currency || 'RSD',
    creditedProviderId: row.creditedProviderId,
  }))
}
