import { Link, type LinkProps } from 'react-router-dom'

import type { ButtonSize, ButtonVariant } from './buttonStyles'
import { getButtonClasses } from './buttonStyles'

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function ButtonLink({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClasses({ className, variant, size })}
      {...props}
    />
  )
}
