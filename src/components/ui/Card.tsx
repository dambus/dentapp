import type { HTMLAttributes } from 'react'

import { classNames } from '../../lib/classNames'

type CardProps = HTMLAttributes<HTMLElement>
type CardHeaderProps = HTMLAttributes<HTMLDivElement>
type CardTitleProps = HTMLAttributes<HTMLHeadingElement>
type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>
type CardContentProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <section
      className={classNames(
        'rounded-lg border border-slate-200 bg-white shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={classNames('p-6 pb-0', className)} {...props} />
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h2
      className={classNames(
        'text-lg font-semibold tracking-tight text-slate-950',
        className,
      )}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={classNames('mt-1 text-sm leading-6 text-slate-600', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={classNames('p-6', className)} {...props} />
}
