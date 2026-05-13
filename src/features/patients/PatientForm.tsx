import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  FieldError,
  FieldLabel,
  InlineNotice,
  RequiredMark,
  Select,
  Textarea,
  TextInput,
} from '../../components/ui'
import type { PatientFormValues } from './patientFormValues'
import {
  hasPatientFormErrors,
  validatePatientForm,
  type PatientFormErrors,
} from './patientFormValidation'
import type { PatientStatus } from './types'

export type PatientFormMode = 'create' | 'edit'

type PatientFormProps = {
  mode: PatientFormMode
  initialValues?: Partial<PatientFormValues>
  onCancel: () => void
  onSubmit: (values: PatientFormValues) => void | Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
  submitError?: string | null
  submitSuccess?: string | null
  modeBadgeLabel?: string
}

const defaultValues: PatientFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  status: 'active',
  importantNote: '',
}

function getInitialValues(patient?: Partial<PatientFormValues>) {
  return {
    ...defaultValues,
    ...patient,
  }
}

export function PatientForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  submitError,
  submitSuccess,
  modeBadgeLabel = 'Demo mode',
}: PatientFormProps) {
  const [values, setValues] = useState<PatientFormValues>(() =>
    getInitialValues(initialValues),
  )
  const [errors, setErrors] = useState<PatientFormErrors>({})

  function updateField<Field extends keyof PatientFormValues>(
    field: Field,
    value: PatientFormValues[Field],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validatePatientForm(values)
    setErrors(validationErrors)

    if (hasPatientFormErrors(validationErrors)) {
      return
    }

    await onSubmit(values)
  }

  const resolvedSubmitLabel =
    submitLabel ?? (mode === 'create' ? 'Create patient' : 'Save changes')

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Basic patient information
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Fields marked with <span className="text-red-700">*</span> are
                required.
              </p>
            </div>
            <Badge variant="info">{modeBadgeLabel}</Badge>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <FieldLabel>
                First name
                <RequiredMark />
              </FieldLabel>
              <TextInput
                hasError={Boolean(errors.firstName)}
                onChange={(event) =>
                  updateField('firstName', event.target.value)
                }
                placeholder="Demo first name"
                type="text"
                value={values.firstName}
              />
              <FieldError message={errors.firstName} />
            </label>

            <label className="block">
              <FieldLabel>
                Last name
                <RequiredMark />
              </FieldLabel>
              <TextInput
                hasError={Boolean(errors.lastName)}
                onChange={(event) =>
                  updateField('lastName', event.target.value)
                }
                placeholder="Demo last name"
                type="text"
                value={values.lastName}
              />
              <FieldError message={errors.lastName} />
            </label>

            <label className="block">
              <FieldLabel>
                Phone
                <RequiredMark />
              </FieldLabel>
              <TextInput
                hasError={Boolean(errors.phone)}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="+381 60 000 0000"
                type="tel"
                value={values.phone}
              />
              <FieldError message={errors.phone} />
            </label>

            <label className="block">
              <FieldLabel>Email</FieldLabel>
              <TextInput
                hasError={Boolean(errors.email)}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="demo.patient@example.test"
                type="text"
                value={values.email}
              />
              <FieldError message={errors.email} />
            </label>

            <label className="block">
              <FieldLabel>
                Date of birth
              </FieldLabel>
              <TextInput
                hasError={Boolean(errors.dateOfBirth)}
                onChange={(event) =>
                  updateField('dateOfBirth', event.target.value)
                }
                type="date"
                value={values.dateOfBirth}
              />
              <FieldError message={errors.dateOfBirth} />
            </label>

            <label className="block">
              <FieldLabel>
                Status
                <RequiredMark />
              </FieldLabel>
              <Select
                hasError={Boolean(errors.status)}
                onChange={(event) =>
                  updateField('status', event.target.value as PatientStatus)
                }
                value={values.status}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </Select>
              <FieldError message={errors.status} />
            </label>
          </div>

          <label className="block">
            <FieldLabel>Important note</FieldLabel>
            <Textarea
              onChange={(event) =>
                updateField('importantNote', event.target.value)
              }
              placeholder="Administrative patient note"
              value={values.importantNote}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-slate-950">
              {mode === 'create' ? 'Create patient' : 'Update patient'}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Submit this form to continue. In demo mode, submit is intentionally
              non-persistent.
            </p>
            {submitSuccess ? (
              <InlineNotice className="mt-3" variant="success">
                {submitSuccess}
              </InlineNotice>
            ) : null}
            {submitError ? (
              <InlineNotice className="mt-3" variant="danger">
                {submitError}
              </InlineNotice>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : resolvedSubmitLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
