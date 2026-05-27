import { ChevronLeft } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

import { classNames } from '../../lib/classNames'

type BackLinkBaseProps = {
  className?: string
  label?: string
}

type BackLinkButtonProps = BackLinkBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    to?: undefined
  }

type BackLinkRouteProps = BackLinkBaseProps &
  Omit<LinkProps, 'children'> & {
    to: LinkProps['to']
  }

function getBackLinkClasses(className?: string) {
  return classNames(
    'inline-flex items-center gap-1 rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-slate-950',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
    className,
  )
}

export function BackLink({
  className,
  label = 'Back',
  ...props
}: BackLinkButtonProps | BackLinkRouteProps) {
  const content = (
    <>
      <ChevronLeft aria-hidden className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </>
  )

  if ('to' in props && props.to !== undefined) {
    return (
      <Link className={getBackLinkClasses(className)} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button className={getBackLinkClasses(className)} type="button" {...props}>
      {content}
    </button>
  )
}
