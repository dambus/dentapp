import { Badge, type BadgeVariant } from './Badge'

type TypeBadgeProps = {
  className?: string
  label: string
  variant?: BadgeVariant
}

export function TypeBadge({
  className,
  label,
  variant = 'neutral',
}: TypeBadgeProps) {
  const normalizedLabel = label.trim()

  if (!normalizedLabel) {
    return null
  }

  return (
    <Badge className={className} variant={variant}>
      {normalizedLabel}
    </Badge>
  )
}
