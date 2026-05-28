import type {
  HTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

import { classNames } from '../../lib/classNames'
import { Button } from './Button'

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
  'mt-2 min-h-10 w-full rounded-lg border bg-white px-3 py-2.5 text-sm leading-6 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100/80 disabled:text-slate-500'

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

export function FieldHint({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={classNames('mt-2 text-xs leading-5 text-slate-500', className)}
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

export function FormActions({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        'mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
      {...props}
    />
  )
}

type InlineConfirmProps = {
  cancelLabel?: string
  confirmLabel?: string
  description: string
  isSubmitting?: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
}

export function InlineConfirm({
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  description,
  isSubmitting = false,
  onCancel,
  onConfirm,
  title,
}: InlineConfirmProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
      <FormActions className="mt-4">
        <Button
          disabled={isSubmitting}
          onClick={onConfirm}
          size="sm"
          type="button"
          variant="danger"
        >
          {confirmLabel}
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          size="sm"
          type="button"
          variant="tertiary"
        >
          {cancelLabel}
        </Button>
      </FormActions>
    </div>
  )
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
