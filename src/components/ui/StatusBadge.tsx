import { Badge, type BadgeVariant } from './Badge'

type StatusBadgeProps = {
  className?: string
  label?: string
  status: string
}

const statusBadgeMap: Record<string, { label: string; variant: BadgeVariant }> =
  {
    cancelled: { label: 'Cancelled', variant: 'danger' },
    completed: { label: 'Completed', variant: 'success' },
    draft: { label: 'Draft', variant: 'neutral' },
    no_show: { label: 'No-show', variant: 'warning' },
    pending: { label: 'Pending', variant: 'warning' },
    scheduled: { label: 'Scheduled', variant: 'info' },
  }

function formatFallbackStatus(status: string) {
  return status
    .split('_')
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ')
}

export function StatusBadge({ className, label, status }: StatusBadgeProps) {
  const badgeConfig = statusBadgeMap[status] ?? {
    label: formatFallbackStatus(status),
    variant: 'neutral' as const,
  }

  return (
    <Badge className={className} variant={badgeConfig.variant}>
      {label ?? badgeConfig.label}
    </Badge>
  )
}
