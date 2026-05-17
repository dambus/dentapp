import type { ButtonHTMLAttributes, ReactNode } from 'react'

import type { ButtonSize, ButtonVariant } from './buttonStyles'
import { getButtonClasses } from './buttonStyles'

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> & {
  'aria-label': string
  children: ReactNode
  isLoading?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

const iconButtonSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 w-10 p-0',
  md: 'h-11 w-11 p-0',
  lg: 'h-12 w-12 p-0',
}

export function IconButton({
  'aria-label': ariaLabel,
  children,
  className,
  disabled,
  isLoading = false,
  size = 'sm',
  title,
  type = 'button',
  variant = 'ghost',
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={getButtonClasses({
        className: `${iconButtonSizeClasses[size]} ${className ?? ''}`,
        size,
        variant,
      })}
      disabled={disabled || isLoading}
      title={title ?? ariaLabel}
      type={type}
      {...props}
    >
      {isLoading ? (
        <span aria-hidden="true" className="text-xs font-semibold">
          ...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
