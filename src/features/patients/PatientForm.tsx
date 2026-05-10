import { useState } from 'react'
import type { FormEvent } from 'react'

import { Badge, Button, Card, CardContent } from '../../components/ui'
import type { PatientFormValues } from './patientFormValues'
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
  const [demoMessageVisible, setDemoMessageVisible] = useState(false)

  function updateField<Field extends keyof PatientFormValues>(
    field: Field,
    value: PatientFormValues[Field],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
                Frontend-only form foundation. These values are not saved yet.
              </p>
            </div>
            <Badge variant="info">Demo only</Badge>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                First name
              </span>
              <input
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) =>
                  updateField('firstName', event.target.value)
                }
                placeholder="Demo first name"
                type="text"
                value={values.firstName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Last name
              </span>
              <input
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) =>
                  updateField('lastName', event.target.value)
                }
                placeholder="Demo last name"
                type="text"
                value={values.lastName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <input
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="+381 60 000 0000"
                type="tel"
                value={values.phone}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="demo.patient@example.test"
                type="email"
                value={values.email}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Date of birth
              </span>
              <input
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) =>
                  updateField('dateOfBirth', event.target.value)
                }
                type="date"
                value={values.dateOfBirth}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) =>
                  updateField('status', event.target.value as PatientStatus)
                }
                value={values.status}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Important warning
            </span>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
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
              className="mt-2 min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
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
            <Button type="submit">
              {mode === 'create' ? 'Preview save' : 'Preview update'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
