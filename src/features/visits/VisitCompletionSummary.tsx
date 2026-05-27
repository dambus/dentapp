import { Badge, Card, CardContent, CardHeader, CardTitle, InlineNotice } from '../../components/ui'

type VisitCompletionSummaryProps = {
  procedureCount: number
  hasClinicalNote: boolean
  selectedNextStepLabel: string
  hasNextStep: boolean
  isReady: boolean
  warnings: string[]
}

export function VisitCompletionSummary({
  procedureCount,
  hasClinicalNote,
  selectedNextStepLabel,
  hasNextStep,
  isReady,
  warnings,
}: VisitCompletionSummaryProps) {
  return (
    <Card
      className="border-teal-100 bg-teal-50/30 shadow-sm"
      data-testid="visit-review-readiness-summary"
    >
      <CardHeader className="p-4 pb-0 sm:p-5 sm:pb-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle>Completion Summary</CardTitle>
          <Badge variant={isReady ? 'success' : 'warning'}>
            {isReady ? 'Ready to complete' : 'Needs one entry'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-white/80 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Procedures
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {procedureCount}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Document only performed clinical work.
            </p>
          </div>
          <div className="rounded-md border border-white/80 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Notes
            </div>
            <div className="mt-2 text-base font-semibold text-slate-950">
              {hasClinicalNote ? 'Present' : 'Missing'}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Clinical note stays separate from final completion.
            </p>
          </div>
          <div className="rounded-md border border-white/80 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Next step
            </div>
            <div className="mt-2 text-base font-semibold text-slate-950">
              {hasNextStep ? selectedNextStepLabel : 'Not selected'}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Follow-up remains clinical guidance only.
            </p>
          </div>
        </div>

        {warnings.length > 0 ? (
          <InlineNotice variant="warning">
            Review before completion: {warnings.join(', ')}
          </InlineNotice>
        ) : (
          <InlineNotice variant="success">
            No patient warning reminder is present in the current context.
          </InlineNotice>
        )}

        {!isReady ? (
          <InlineNotice variant="info">
            Add at least one performed procedure, a clinical note, or a next
            step to complete this prototype visit.
          </InlineNotice>
        ) : null}
      </CardContent>
    </Card>
  )
}
