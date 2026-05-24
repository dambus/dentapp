import { useEffect, useMemo, useState } from 'react'

import {
  Badge,
  Button,
  FieldLabel,
  InlineNotice,
  LoadingState,
  MetricTile,
  Select,
  TextInput,
} from '../../components/ui'
import type { Appointment } from '../appointments/appointmentService'
import {
  fetchActiveServiceCatalog,
  fetchCreditedProviderOptions,
  getPerformedServicesWorkflowAccess,
  type ServiceCatalogOption,
} from './performedServicesService'
import {
  createPerformedServiceDraftRow,
  formatPerformedServiceAmount,
  getPerformedServiceDraftLineAmount,
  getPerformedServicesDraftTotal,
  type PerformedServiceDraftRow,
} from './performedServicesDraftModel'

type ProviderOption = {
  id: string
  fullName: string
  role: string
}

type PerformedServicesDraftEditorProps = {
  appointmentContext?: Appointment | null
  disabled?: boolean
  rows: PerformedServiceDraftRow[]
  onRowsChange: (rows: PerformedServiceDraftRow[]) => void
}

const allowedRoles = new Set(['owner_admin', 'doctor', 'specialist'])

function getDefaultProviderId(
  providers: ProviderOption[],
  appointmentContext?: Appointment | null,
) {
  if (
    appointmentContext?.assigned_provider_id &&
    providers.some((provider) => provider.id === appointmentContext.assigned_provider_id)
  ) {
    return appointmentContext.assigned_provider_id
  }

  return providers[0]?.id ?? ''
}

function getServiceOptionLabel(service: ServiceCatalogOption) {
  const parts = [
    service.categoryName,
    service.code ? `${service.name} (${service.code})` : service.name,
  ].filter(Boolean)

  return parts.join(' - ')
}

export function PerformedServicesDraftEditor({
  appointmentContext,
  disabled = false,
  rows,
  onRowsChange,
}: PerformedServicesDraftEditorProps) {
  const [catalog, setCatalog] = useState<ServiceCatalogOption[]>([])
  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [accessRole, setAccessRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const canManagePerformedServices =
    accessRole !== null && allowedRoles.has(accessRole)
  const draftTotal = getPerformedServicesDraftTotal(rows)
  const defaultProviderId = useMemo(
    () => getDefaultProviderId(providers, appointmentContext),
    [appointmentContext, providers],
  )

  useEffect(() => {
    let isCurrent = true

    async function loadEditorData() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const access = await getPerformedServicesWorkflowAccess()

        if (!isCurrent) {
          return
        }

        setAccessRole(access.role)

        if (!access.canManagePerformedServices) {
          setCatalog([])
          setProviders([])
          return
        }

        const [loadedCatalog, loadedProviders] = await Promise.all([
          fetchActiveServiceCatalog(),
          fetchCreditedProviderOptions(),
        ])

        if (!isCurrent) {
          return
        }

        setCatalog(loadedCatalog)
        setProviders(loadedProviders)
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Services and charges could not be loaded.',
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadEditorData()

    return () => {
      isCurrent = false
    }
  }, [])

  function addRow() {
    const firstService = catalog[0] ?? null
    const defaultProvider = providers.find(
      (provider) => provider.id === defaultProviderId,
    )

    onRowsChange([
      ...rows,
      {
        ...createPerformedServiceDraftRow({
          creditedProviderId: defaultProviderId,
          service: firstService,
        }),
        creditedProviderName: defaultProvider?.fullName ?? '',
      },
    ])
  }

  function updateRow(
    rowId: string,
    patch: Partial<PerformedServiceDraftRow>,
  ) {
    onRowsChange(
      rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    )
  }

  function selectService(rowId: string, serviceId: string) {
    const service = catalog.find((item) => item.id === serviceId)

    updateRow(rowId, {
      serviceId,
      serviceNameSnapshot: service?.name ?? '',
      serviceCodeSnapshot: service?.code ?? '',
      serviceCategoryNameSnapshot: service?.categoryName ?? '',
      unitPriceAmount:
        service?.defaultUnitPrice !== null &&
        service?.defaultUnitPrice !== undefined
          ? String(service.defaultUnitPrice)
          : '0',
      currency: service?.currency ?? 'RSD',
    })
  }

  function removeRow(rowId: string) {
    onRowsChange(rows.filter((row) => row.id !== rowId))
  }

  if (isLoading) {
    return <LoadingState label="Loading services and charges..." />
  }

  if (!canManagePerformedServices) {
    return (
      <div data-testid="visit-services-permission-notice">
        <InlineNotice variant="info">
          Services and charge amounts are managed by authorized financial
          clinical roles. Continue the clinical visit without adding chargeable
          services.
        </InlineNotice>
      </div>
    )
  }

  if (loadError) {
    return (
      <InlineNotice data-testid="visit-services-load-error" variant="danger">
        {loadError}
      </InlineNotice>
    )
  }

  return (
    <div className="space-y-4" data-testid="visit-services-step">
      <InlineNotice variant="info">
        Record chargeable services rendered during this visit. This does not
        collect payment, create an invoice, update a balance, or calculate
        commission.
      </InlineNotice>

      {catalog.length === 0 ? (
        <InlineNotice data-testid="visit-services-empty-catalog" variant="neutral">
          No active services are available in the catalog. You can continue the
          clinical visit without chargeable services.
        </InlineNotice>
      ) : null}

      {rows.length === 0 ? (
        <div
          className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5"
          data-testid="visit-services-empty-state"
        >
          <p className="text-sm font-semibold text-slate-950">
            No chargeable services added for this visit.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            This is valid for consults, checks, and no-charge visits.
          </p>
        </div>
      ) : null}

      {rows.map((row, index) => {
        const lineAmount = getPerformedServiceDraftLineAmount(row)

        return (
          <div
            className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-4"
            data-testid="visit-service-row"
            key={row.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">Service {index + 1}</Badge>
                <span className="text-sm font-semibold text-slate-950">
                  {row.serviceNameSnapshot || 'Select service'}
                </span>
              </div>
              <Button
                disabled={disabled}
                onClick={() => removeRow(row.id)}
                size="sm"
                variant="ghost"
              >
                Remove
              </Button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label>
                <FieldLabel>Catalog service</FieldLabel>
                <Select
                  data-testid="visit-service-select"
                  disabled={disabled || catalog.length === 0}
                  value={row.serviceId}
                  onChange={(event) => selectService(row.id, event.target.value)}
                >
                  <option value="">Select service</option>
                  {catalog.map((service) => (
                    <option key={service.id} value={service.id}>
                      {getServiceOptionLabel(service)}
                    </option>
                  ))}
                </Select>
              </label>

              <label>
                <FieldLabel>Credited provider</FieldLabel>
                <Select
                  data-testid="visit-service-provider"
                  disabled={disabled || providers.length === 0}
                  value={row.creditedProviderId}
                  onChange={(event) =>
                    updateRow(row.id, {
                      creditedProviderId: event.target.value,
                      creditedProviderName:
                        providers.find(
                          (provider) => provider.id === event.target.value,
                        )?.fullName ?? '',
                    })
                  }
                >
                  <option value="">Select provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.fullName}
                    </option>
                  ))}
                </Select>
              </label>

              <label>
                <FieldLabel>Quantity</FieldLabel>
                <TextInput
                  data-testid="visit-service-quantity"
                  disabled={disabled}
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  type="number"
                  value={row.quantity}
                  onChange={(event) =>
                    updateRow(row.id, { quantity: event.target.value })
                  }
                />
              </label>

              <label>
                <FieldLabel>Unit price</FieldLabel>
                <TextInput
                  data-testid="visit-service-unit-price"
                  disabled={disabled}
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  type="number"
                  value={row.unitPriceAmount}
                  onChange={(event) =>
                    updateRow(row.id, {
                      unitPriceAmount: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <FieldLabel>Tooth / region</FieldLabel>
                <TextInput
                  data-testid="visit-service-tooth"
                  disabled={disabled}
                  value={row.toothOrRegion}
                  onChange={(event) =>
                    updateRow(row.id, { toothOrRegion: event.target.value })
                  }
                  placeholder="16, upper right, full mouth"
                />
              </label>

              <MetricTile
                data-testid="visit-service-line-amount"
                label="Line amount"
                value={formatPerformedServiceAmount(lineAmount, row.currency)}
                description="Calculated from quantity and unit price. No payment is recorded."
                tone="info"
              />
            </div>
          </div>
        )
      })}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          className="min-h-10"
          data-testid="visit-add-service"
          disabled={disabled || catalog.length === 0}
          onClick={addRow}
          variant="secondary"
        >
          Add service
        </Button>
        <div
          className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm"
          data-testid="visit-services-draft-total"
        >
          <span className="font-semibold text-slate-950">Draft total: </span>
          <span className="font-semibold text-teal-900">
            {formatPerformedServiceAmount(draftTotal, rows[0]?.currency ?? 'RSD')}
          </span>
        </div>
      </div>
    </div>
  )
}
