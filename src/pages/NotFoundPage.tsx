import { PagePlaceholder } from './PagePlaceholder'

export function NotFoundPage() {
  return (
    <PagePlaceholder
      title="Page Not Found"
      description="The requested route does not exist in the current DentApp foundation."
      eyebrow="404"
      status="Check the route path and try an existing placeholder page."
    />
  )
}
