import { classNames } from '../../lib/classNames'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-teal-700 text-white hover:bg-teal-800 border-transparent',
  secondary: 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent',
  danger: 'bg-red-700 text-white hover:bg-red-800 border-transparent',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
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
    'inline-flex items-center justify-center rounded-md border font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}
