import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import {
  Badge,
  Button,
  Card,
  CardContent,
  InlineNotice,
} from '../components/ui'

type PagePlaceholderProps = {
  title: string
  description: string
  eyebrow?: string
  status?: string
}

export function PagePlaceholder({
  title,
  description,
  eyebrow = 'Phase 1 placeholder',
  status = 'Routing is configured. This screen is intentionally minimal.',
}: PagePlaceholderProps) {
  return (
    <Page>
      <PageHeader title={title} description={description} />

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="space-y-6 p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-cyan-100 text-base font-semibold text-cyan-900">
                MVP
              </div>
              <div>
                <Badge variant="info">{eyebrow}</Badge>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  Workspace module planned
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  This route is intentionally available now so navigation,
                  permissions, and layout can be tested before the full workflow
                  is implemented.
                </p>
              </div>
            </div>
            <Button className="min-h-10" variant="secondary" size="sm" disabled>
              Placeholder only
            </Button>
          </div>

          <InlineNotice className="px-4 py-3" variant="success">
            {status}
          </InlineNotice>

          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Workflow not implemented yet
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Future tasks will replace this placeholder with a focused,
              role-aware workspace. Current navigation and permissions remain
              active.
            </p>
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}
