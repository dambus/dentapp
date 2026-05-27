import { classNames } from '../../lib/classNames'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-teal-700 text-white hover:bg-teal-800 shadow-sm',
  secondary:
    'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm',
  tertiary:
    'border-transparent bg-transparent text-teal-800 hover:bg-teal-50 hover:text-teal-900',
  ghost:
    'border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-700 text-white hover:bg-red-800 border-transparent',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-2 text-sm',
  md: 'min-h-10 px-3.5 py-2 text-sm',
  lg: 'min-h-11 px-4 py-2.5 text-base',
}

export function getButtonClasses({
  className,
  variant = 'primary',
  size = 'md',
}: {
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  return classNames(
    'inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}
