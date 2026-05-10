import { useState } from 'react'
import type { FormEvent } from 'react'

import { Badge, Button, Card, CardContent } from '../../components/ui'
import { classNames } from '../../lib/classNames'
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
}

const defaultValues: PatientFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  status: 'active',
  importantWarning: '',
  summary: '',
}

const inputBaseClasses =
  'mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100'

function getInputClasses(hasError: boolean) {
  return classNames(
    inputBaseClasses,
    hasError ? 'border-red-300 focus:border-red-600 focus:ring-red-100' : 'border-slate-300',
  )
}

function RequiredMark() {
  return (
    <span className="ml-1 text-red-700" aria-label="required">
      *
    </span>
  )
}

type FieldErrorProps = {
  message?: string
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null
  }

  return <p className="mt-2 text-sm font-medium text-red-700">{message}</p>
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
}: PatientFormProps) {
  const [values, setValues] = useState<PatientFormValues>(() =>
    getInitialValues(initialValues),
  )
  const [errors, setErrors] = useState<PatientFormErrors>({})
  const [demoMessageVisible, setDemoMessageVisible] = useState(false)

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
    setDemoMessageVisible(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validatePatientForm(values)
    setErrors(validationErrors)

    if (hasPatientFormErrors(validationErrors)) {
      setDemoMessageVisible(false)
      return
    }

    setDemoMessageVisible(true)
  }

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
                required. These values are not saved yet.
              </p>
            </div>
            <Badge variant="info">Demo only</Badge>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                First name
                <RequiredMark />
              </span>
              <input
                aria-invalid={Boolean(errors.firstName)}
                className={getInputClasses(Boolean(errors.firstName))}
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
              <span className="text-sm font-medium text-slate-700">
                Last name
                <RequiredMark />
              </span>
              <input
                aria-invalid={Boolean(errors.lastName)}
                className={getInputClasses(Boolean(errors.lastName))}
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
              <span className="text-sm font-medium text-slate-700">
                Phone
                <RequiredMark />
              </span>
              <input
                aria-invalid={Boolean(errors.phone)}
                className={getInputClasses(Boolean(errors.phone))}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="+381 60 000 0000"
                type="tel"
                value={values.phone}
              />
              <FieldError message={errors.phone} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                aria-invalid={Boolean(errors.email)}
                className={getInputClasses(Boolean(errors.email))}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="demo.patient@example.test"
                type="text"
                value={values.email}
              />
              <FieldError message={errors.email} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Date of birth
              </span>
              <input
                aria-invalid={Boolean(errors.dateOfBirth)}
                className={getInputClasses(Boolean(errors.dateOfBirth))}
                onChange={(event) =>
                  updateField('dateOfBirth', event.target.value)
                }
                type="date"
                value={values.dateOfBirth}
              />
              <FieldError message={errors.dateOfBirth} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Status
                <RequiredMark />
              </span>
              <select
                aria-invalid={Boolean(errors.status)}
                className={getInputClasses(Boolean(errors.status))}
                onChange={(event) =>
                  updateField('status', event.target.value as PatientStatus)
                }
                value={values.status}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
              <FieldError message={errors.status} />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Important warning
            </span>
            <input
              className={getInputClasses(false)}
              onChange={(event) =>
                updateField('importantWarning', event.target.value)
              }
              placeholder="Demo warning only"
              type="text"
              value={values.importantWarning}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Notes or summary
            </span>
            <textarea
              className={classNames(getInputClasses(false), 'min-h-28')}
              onChange={(event) => updateField('summary', event.target.value)}
              placeholder="Demo summary for UI testing only"
              value={values.summary}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-slate-950">
              Saving is not connected yet
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              This {mode === 'create' ? 'new patient' : 'edit'} form is for UI
              foundation only. No data is persisted, and the demo dataset is not
              changed.
            </p>
            {demoMessageVisible ? (
              <p className="mt-3 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800">
                Demo form only. No data was saved.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Submit demo form</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
