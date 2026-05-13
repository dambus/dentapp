import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  FieldLabel,
  InlineNotice,
  Textarea,
} from '../../components/ui'
import type {
  PatientMedicalRecord,
  PatientMedicalRecordInput,
} from './patientMedicalRecordService'

type PatientMedicalRecordFormProps = {
  initialRecord: PatientMedicalRecord | null
  isExistingRecord: boolean
  isSubmitting: boolean
  modeBadgeLabel: string
  submitError: string | null
  submitSuccess: string | null
  onCancel: () => void
  onSubmit: (values: PatientMedicalRecordInput) => void | Promise<void>
}

type FieldConfig = {
  field: keyof PatientMedicalRecordInput
  label: string
  placeholder: string
}

const fields: FieldConfig[] = [
  {
    field: 'anamnesisSummary',
    label: 'Anamnesis summary',
    placeholder: 'Demo-only medical history summary',
  },
  {
    field: 'allergies',
    label: 'Allergies',
    placeholder: 'Demo-only allergy information',
  },
  {
    field: 'currentMedications',
    label: 'Current medications',
    placeholder: 'Demo-only medication information',
  },
  {
    field: 'medicalWarnings',
    label: 'Medical warnings',
    placeholder: 'Demo-only clinical warning information',
  },
  {
    field: 'dentalHistory',
    label: 'Dental history',
    placeholder: 'Demo-only previous dental context',
  },
  {
    field: 'riskNotes',
    label: 'Risk notes',
    placeholder: 'Demo-only clinical risk notes',
  },
]

const emptyValues: PatientMedicalRecordInput = {
  anamnesisSummary: '',
  allergies: '',
  currentMedications: '',
  medicalWarnings: '',
  dentalHistory: '',
  riskNotes: '',
}

function getInitialValues(
  initialRecord: PatientMedicalRecord | null,
): PatientMedicalRecordInput {
  if (!initialRecord) {
    return emptyValues
  }

  return {
    anamnesisSummary: initialRecord.anamnesisSummary,
    allergies: initialRecord.allergies,
    currentMedications: initialRecord.currentMedications,
    medicalWarnings: initialRecord.medicalWarnings,
    dentalHistory: initialRecord.dentalHistory,
    riskNotes: initialRecord.riskNotes,
  }
}

function hasAnyValue(values: PatientMedicalRecordInput) {
  return Object.values(values).some((value) => value.trim().length > 0)
}

export function PatientMedicalRecordForm({
  initialRecord,
  isExistingRecord,
  isSubmitting,
  modeBadgeLabel,
  submitError,
  submitSuccess,
  onCancel,
  onSubmit,
}: PatientMedicalRecordFormProps) {
  const [values, setValues] = useState<PatientMedicalRecordInput>(() =>
    getInitialValues(initialRecord),
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  function updateField(
    field: keyof PatientMedicalRecordInput,
    value: string,
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setValidationError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isExistingRecord && !hasAnyValue(values)) {
      setValidationError(
        'Enter at least one medical record field before creating a record.',
      )
      return
    }

    await onSubmit(values)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Structured medical record
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                All fields are optional. New records require at least one field
                before saving.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={isExistingRecord ? 'info' : 'neutral'}>
                {isExistingRecord ? 'Existing record' : 'No record yet'}
              </Badge>
              <Badge variant="info">{modeBadgeLabel}</Badge>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {fields.map((fieldConfig) => (
              <label className="block" key={fieldConfig.field}>
                <FieldLabel>
                  {fieldConfig.label}
                </FieldLabel>
                <Textarea
                  onChange={(event) =>
                    updateField(fieldConfig.field, event.target.value)
                  }
                  placeholder={fieldConfig.placeholder}
                  value={values[fieldConfig.field]}
                />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-slate-950">
              Save medical record
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Medical record writes are restricted to clinical roles and are
              audited after persistence.
            </p>
            {validationError ? (
              <InlineNotice className="mt-3" variant="danger">
                {validationError}
              </InlineNotice>
            ) : null}
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
              {isSubmitting ? 'Saving...' : 'Save medical record'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
