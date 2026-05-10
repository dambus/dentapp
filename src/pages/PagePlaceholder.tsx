import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge, Button, Card, CardContent } from '../components/ui'

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

      <Card>
        <CardContent>
          <Badge variant="info">{eyebrow}</Badge>

          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {status}
          </div>

          <div className="mt-5">
            <Button variant="secondary" size="sm" disabled>
              Placeholder only
            </Button>
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}
