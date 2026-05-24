import { useEffect, useMemo, useState } from 'react'

import {
  Badge,
  Button,
  EmptyState,
  InlineNotice,
  LoadingState,
  MetricTile,
} from '../../components/ui'
import { formatPerformedServiceAmount } from '../performed-services/performedServicesDraftModel'
import { formatPatientDateTime } from '../patients/patientDisplay'
import {
  getPatientPostedChargesSummary,
  type PatientPostedChargesSummary,
} from './patientLedgerService'

type PatientPostedChargesSectionProps = {
  canOpenCompletedVisits: boolean
  onOpenCompletedVisit?: (visitId: string) => void
  patientId: string
}

function formatPostedChargeTotals(summary: PatientPostedChargesSummary) {
  return summary.totals
    .map((total) => formatPerformedServiceAmount(total.amount, total.currency))
    .join(' / ')
}

export function PatientPostedChargesSection({
  canOpenCompletedVisits,
  onOpenCompletedVisit,
  patientId,
}: PatientPostedChargesSectionProps) {
  const [summary, setSummary] = useState<PatientPostedChargesSummary | null>(
    null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadPostedCharges() {
    setIsLoading(true)
    setErrorMessage(null)

    const result = await getPatientPostedChargesSummary(patientId)

    if (!result.ok || !result.summary) {
      setSummary(null)
      setErrorMessage(result.error ?? 'Posted charges could not be loaded.')
      setIsLoading(false)
      return
    }

    setSummary(result.summary)
    setIsLoading(false)
  }

  useEffect(() => {
    let isCurrent = true

    void getPatientPostedChargesSummary(patientId).then((result) => {
      if (!isCurrent) {
        return
      }

      if (!result.ok || !result.summary) {
        setSummary(null)
        setErrorMessage(result.error ?? 'Posted charges could not be loaded.')
        setIsLoading(false)
        return
      }

      setSummary(result.summary)
      setIsLoading(false)
    })

    return () => {
      isCurrent = false
    }
  }, [patientId])

  const totalLabel = useMemo(
    () => (summary ? formatPostedChargeTotals(summary) : ''),
    [summary],
  )

  if (isLoading) {
    return <LoadingState label="Loading posted charges..." />
  }

  if (errorMessage) {
    return (
      <div className="space-y-4" data-testid="patient-posted-charges-section">
        <InlineNotice variant="warning">{errorMessage}</InlineNotice>
        <Button onClick={() => void loadPostedCharges()} size="sm" variant="secondary">
          Reload posted charges
        </Button>
      </div>
    )
  }

  if (!summary || summary.status === 'blocked') {
    return (
      <div className="space-y-4" data-testid="patient-posted-charges-section">
        <InlineNotice variant="neutral">
          Posted charges are not available for the current role.
        </InlineNotice>
      </div>
    )
  }

  if (summary.status === 'no_charges') {
    return (
      <div data-testid="patient-posted-charges-section">
        <EmptyState
          title="No posted charges recorded"
          description="No posted charges recorded for this patient."
        />
      </div>
    )
  }

  return (
    <div className="space-y-5" data-testid="patient-posted-charges-section">
      <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-950">
              Posted charges recorded in DentApp
            </div>
            <Badge variant="info">Read-only</Badge>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Newest posted charges appear first.
          </p>
        </div>
        {totalLabel ? (
          <div className="min-w-0 rounded-md border border-slate-200 bg-white px-4 py-3 text-left sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Total posted charges
            </div>
            <div className="mt-1 text-base font-semibold text-slate-950">
              {totalLabel}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricTile
          label="Posted charge entries"
          value={String(summary.charges.length)}
          description="Read-only rows from patient ledger charge activity."
          tone="info"
        />
        {summary.totals.map((total) => (
          <MetricTile
            key={total.currency}
            label={`Posted charges ${total.currency}`}
            value={formatPerformedServiceAmount(total.amount, total.currency)}
            description="Recorded posted charges in this currency."
            tone="success"
          />
        ))}
      </div>

      <div className="space-y-3">
        {summary.charges.map((charge) => (
          <article
            className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
            key={charge.id}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-950">
                    {charge.descriptionSnapshot}
                  </h3>
                  <Badge variant="success">Posted charge</Badge>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Posted {formatPatientDateTime(charge.postedAt)}
                </p>
              </div>
              <div className="text-left lg:text-right">
                <div className="text-lg font-semibold text-slate-950">
                  {formatPerformedServiceAmount(charge.amount, charge.currency)}
                </div>
                <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
                  {charge.currency}
                </div>
              </div>
            </div>

            {charge.visitId && canOpenCompletedVisits && onOpenCompletedVisit ? (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                <Button
                  onClick={() => onOpenCompletedVisit(charge.visitId as string)}
                  size="sm"
                  variant="secondary"
                >
                  View completed visit
                </Button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}
