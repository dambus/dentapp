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
    <Card className="border-teal-100 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Completion Summary</CardTitle>
          <Badge variant={isReady ? 'success' : 'warning'}>
            {isReady ? 'Ready to complete' : 'Needs one entry'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Procedures
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {procedureCount}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Notes
            </div>
            <div className="mt-2 text-base font-semibold text-slate-950">
              {hasClinicalNote ? 'Present' : 'Missing'}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Next step
            </div>
            <div className="mt-2 text-base font-semibold text-slate-950">
              {hasNextStep ? selectedNextStepLabel : 'Not selected'}
            </div>
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
