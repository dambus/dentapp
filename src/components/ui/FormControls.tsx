import type {
  HTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

import { classNames } from '../../lib/classNames'

type FieldLabelProps = HTMLAttributes<HTMLSpanElement>
type FieldErrorProps = {
  message?: string | null
}

type ControlStateProps = {
  hasError?: boolean
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & ControlStateProps
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & ControlStateProps
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  ControlStateProps

const controlBaseClasses =
  'mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100'

function getControlClasses(hasError: boolean | undefined, className?: string) {
  return classNames(
    controlBaseClasses,
    hasError
      ? 'border-red-300 focus:border-red-600 focus:ring-red-100'
      : 'border-slate-300',
    className,
  )
}

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <span
      className={classNames('text-sm font-medium text-slate-700', className)}
      {...props}
    />
  )
}

export function RequiredMark() {
  return (
    <span className="ml-1 text-red-700" aria-label="required">
      *
    </span>
  )
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null
  }

  return <p className="mt-2 text-sm font-medium text-red-700">{message}</p>
}

export function TextInput({
  'aria-invalid': ariaInvalid,
  className,
  hasError,
  ...props
}: TextInputProps) {
  return (
    <input
      className={getControlClasses(hasError, className)}
      aria-invalid={hasError || ariaInvalid}
      {...props}
    />
  )
}

export function Select({
  'aria-invalid': ariaInvalid,
  className,
  hasError,
  ...props
}: SelectProps) {
  return (
    <select
      className={getControlClasses(hasError, className)}
      aria-invalid={hasError || ariaInvalid}
      {...props}
    />
  )
}

export function Textarea({
  'aria-invalid': ariaInvalid,
  className,
  hasError,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={getControlClasses(hasError, classNames('min-h-28', className))}
      aria-invalid={hasError || ariaInvalid}
      {...props}
    />
  )
}
