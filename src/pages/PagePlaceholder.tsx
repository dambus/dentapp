import { Page } from '../components/layout/Page'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge, Button, Card, CardContent, InlineNotice } from '../components/ui'

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

          <InlineNotice className="mt-5 px-4 py-3" variant="success">
            {status}
          </InlineNotice>

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
