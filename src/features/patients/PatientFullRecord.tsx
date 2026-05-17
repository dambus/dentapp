import type { ReactNode } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FieldLabel,
  Select,
} from '../../components/ui'
import { classNames } from '../../lib/classNames'
import { ClinicalNotesSection } from './ClinicalNotesSection'
import { OdontogramSection } from './OdontogramSection'
import {
  formatDemoCurrency,
  formatPatientDate,
  formatPatientDateTime,
  getPatientAge,
  patientStatusLabels,
} from './patientDisplay'
import { PatientVisitTimeline } from './PatientVisitTimeline'
import { TreatmentPlansSection } from './TreatmentPlansSection'
import type { DemoPatient } from './types'

export type PatientFullRecordSection =
  | 'medical-record'
  | 'odontogram'
  | 'treatment-plans'
  | 'clinical-notes'
  | 'documents'
  | 'timeline'

type PatientFullRecordProps = {
  patient: DemoPatient
  patientName: string
  activePlanLabel: string
  activeSection: PatientFullRecordSection
  onSectionChange: (section: PatientFullRecordSection) => void
  canEditMedicalRecord: boolean
  canViewOdontogram: boolean
  canEditOdontogram: boolean
  canViewClinicalNotes: boolean
  canManageClinicalNotes: boolean
  canViewTreatmentPlans: boolean
  canManageTreatmentPlans: boolean
  highlightedVisitId?: string | null
  isPatientArchived: boolean
  onEditMedicalRecord: () => void
}

type DetailItemProps = {
  label: string
  value: string
}

type RecordSectionProps = {
  title: string
  description: string
  children: ReactNode
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-950">{value}</dd>
    </div>
  )
}

function RecordSection({ title, description, children }: RecordSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function getPatientFullRecordSectionLabel(
  section: PatientFullRecordSection,
) {
  const labels: Record<PatientFullRecordSection, string> = {
    'medical-record': 'Medical',
    odontogram: 'Odontogram',
    'treatment-plans': 'Plans',
    'clinical-notes': 'Notes',
    documents: 'Documents',
    timeline: 'Timeline',
  }

  return labels[section]
}

export function PatientFullRecord({
  patient,
  patientName,
  activePlanLabel,
  activeSection,
  onSectionChange,
  canEditMedicalRecord,
  canViewOdontogram,
  canEditOdontogram,
  canViewClinicalNotes,
  canManageClinicalNotes,
  canViewTreatmentPlans,
  canManageTreatmentPlans,
  highlightedVisitId,
  isPatientArchived,
  onEditMedicalRecord,
}: PatientFullRecordProps) {
  const hasMedicalWarnings = patient.medicalWarnings.length > 0
  const availableSections: PatientFullRecordSection[] = [
    'medical-record',
    ...(canViewOdontogram ? (['odontogram'] as const) : []),
    ...(canViewTreatmentPlans ? (['treatment-plans'] as const) : []),
    ...(canViewClinicalNotes ? (['clinical-notes'] as const) : []),
    'documents',
    'timeline',
  ]
  const selectedSection = availableSections.includes(activeSection)
    ? activeSection
    : 'medical-record'

  return (
    <Card className="scroll-mt-6 border-slate-200" id="patient-full-record">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Full Record</CardTitle>
              <Badge variant="neutral">Detailed modules</Badge>
            </div>
            <CardDescription>
              Detailed patient information and clinical modules.
            </CardDescription>
          </div>
          {isPatientArchived ? (
            <Badge variant="warning">Archived patient</Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="sticky top-0 z-10 -mx-4 border-y border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
          <label>
            <FieldLabel>Section</FieldLabel>
            <Select
              aria-label="Patient record section"
              className="mt-1"
              data-testid="patient-section-selector"
              onChange={(event) =>
                onSectionChange(event.target.value as PatientFullRecordSection)
              }
              value={selectedSection}
            >
              {availableSections.map((section) => (
                <option key={section} value={section}>
                  {getPatientFullRecordSectionLabel(section)}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <div className="hidden sm:block">
          <div className="flex flex-wrap gap-1.5">
            {availableSections.map((section) => {
              const isSelected = selectedSection === section

              return (
                <Button
                  className="shrink-0"
                  key={section}
                  onClick={() => onSectionChange(section)}
                  size="sm"
                  variant={isSelected ? 'primary' : 'secondary'}
                >
                  {getPatientFullRecordSectionLabel(section)}
                </Button>
              )
            })}
          </div>
        </div>

        <div
          className={classNames(
            selectedSection === 'medical-record' ? 'block' : 'hidden',
          )}
          id="patient-medical-record-section"
        >
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-950">
                  Medical record summary
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Patient identity, medical warnings, history, and current
                  planning context.
                </p>
              </div>
              {canEditMedicalRecord ? (
                <Button onClick={onEditMedicalRecord} size="sm">
                  Edit medical record
                </Button>
              ) : null}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <RecordSection
                title="Patient identity"
                description="Basic profile and status."
              >
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Full name" value={patientName} />
                  <DetailItem
                    label="Status"
                    value={patientStatusLabels[patient.status]}
                  />
                  <DetailItem
                    label="Date of birth"
                    value={formatPatientDate(patient.dateOfBirth)}
                  />
                  <DetailItem
                    label="Age"
                    value={`${getPatientAge(patient.dateOfBirth)} years`}
                  />
                </dl>
              </RecordSection>

              <RecordSection
                title="Contact information"
                description="Demo contact details."
              >
                <dl className="grid gap-4">
                  <DetailItem label="Phone" value={patient.phone} />
                  <DetailItem label="Email" value={patient.email} />
                </dl>
              </RecordSection>

              <RecordSection
                title="Appointment summary"
                description="Visit and scheduling context."
              >
                <dl className="grid gap-4">
                  <DetailItem
                    label="Next appointment"
                    value={formatPatientDateTime(patient.nextAppointment)}
                  />
                  <DetailItem
                    label="Last visit"
                    value={formatPatientDate(patient.lastVisit)}
                  />
                </dl>
              </RecordSection>

              <RecordSection
                title="Treatment and balance"
                description="Foundation-only overview."
              >
                <dl className="grid gap-4">
                  <DetailItem
                    label="Active treatment plan"
                    value={activePlanLabel}
                  />
                  <DetailItem
                    label="Demo unpaid balance"
                    value={formatDemoCurrency(patient.unpaidBalance)}
                  />
                </dl>
              </RecordSection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <RecordSection
                title="Clinical summary"
                description="Read-only clinical overview for the demo profile."
              >
                <p className="text-sm leading-6 text-slate-700">
                  {patient.lastClinicalNote}
                </p>
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-medium text-slate-950">
                    Next recommended step
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {patient.nextRecommendedStep}
                  </p>
                </div>
              </RecordSection>

              <RecordSection
                title="Medical warnings"
                description="Clinical warning summary from the patient medical record."
              >
                {hasMedicalWarnings ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalWarnings.map((warning) => (
                      <Badge key={warning} variant="warning">
                        {warning}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge variant="neutral">No demo medical warnings</Badge>
                )}
              </RecordSection>

              <RecordSection
                title="Anamnesis summary"
                description="Structured medical history summary."
              >
                <p className="text-sm leading-6 text-slate-700">
                  {patient.anamnesisSummary}
                </p>
              </RecordSection>

              <RecordSection
                title="Allergies"
                description="Allergy information from the medical record."
              >
                <p className="text-sm leading-6 text-slate-700">
                  {patient.allergies || 'No allergies recorded.'}
                </p>
              </RecordSection>

              <RecordSection
                title="Current medications"
                description="Medication information from the medical record."
              >
                <p className="text-sm leading-6 text-slate-700">
                  {patient.currentMedications || 'No current medications recorded.'}
                </p>
              </RecordSection>

              <RecordSection
                title="Dental history"
                description="Previous dental context from the medical record."
              >
                <p className="text-sm leading-6 text-slate-700">
                  {patient.dentalHistorySummary}
                </p>
              </RecordSection>

              <RecordSection
                title="Risk notes"
                description="Clinical risk notes from the medical record."
              >
                <p className="text-sm leading-6 text-slate-700">
                  {patient.riskNotes || 'No risk notes recorded.'}
                </p>
              </RecordSection>

              <RecordSection
                title="Active treatment plan summary"
                description="Read-only foundation for future treatment plan modules."
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={patient.activeTreatmentPlan ? 'info' : 'neutral'}
                  >
                    {activePlanLabel}
                  </Badge>
                  <Badge variant="neutral">Demo summary</Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {patient.activeTreatmentPlanSummary}
                </p>
              </RecordSection>

              <RecordSection
                title="Visit summary"
                description="Recent visit context without visit CRUD."
              >
                <dl className="grid gap-4">
                  <DetailItem
                    label="Last visit"
                    value={formatPatientDate(patient.lastVisit)}
                  />
                  <DetailItem
                    label="Recent visit summary"
                    value={patient.recentVisitSummary}
                  />
                </dl>
              </RecordSection>
            </div>
          </div>
        </div>

        {canViewOdontogram ? (
          <div
            className={classNames(
              selectedSection === 'odontogram' ? 'block' : 'hidden',
            )}
            id="patient-odontogram-section"
          >
            <OdontogramSection
              patientId={patient.id}
              canEditOdontogram={canEditOdontogram}
              isPatientArchived={isPatientArchived}
            />
          </div>
        ) : null}

        {canViewTreatmentPlans ? (
          <div
            className={classNames(
              selectedSection === 'treatment-plans' ? 'block' : 'hidden',
            )}
            id="patient-treatment-plans-section"
          >
            <TreatmentPlansSection
              patientId={patient.id}
              canManageTreatmentPlans={canManageTreatmentPlans}
              isPatientArchived={isPatientArchived}
            />
          </div>
        ) : null}

        {canViewClinicalNotes ? (
          <div
            className={classNames(
              selectedSection === 'clinical-notes' ? 'block' : 'hidden',
            )}
            id="patient-clinical-notes-section"
          >
            <ClinicalNotesSection
              patientId={patient.id}
              canManageNotes={canManageClinicalNotes}
              isPatientArchived={isPatientArchived}
            />
          </div>
        ) : null}

        <div
          className={classNames(
            selectedSection === 'documents' ? 'block' : 'hidden',
          )}
          id="patient-documents-section"
        >
          <RecordSection
            title="Documents placeholder"
            description="Document storage and upload are future scoped work."
          >
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-950">
                {patient.documentsCount} demo document references
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                No real documents are stored. Document upload, secure storage,
                and file permissions will be implemented later.
              </p>
            </div>
          </RecordSection>
        </div>

        <div
          className={classNames(
            selectedSection === 'timeline' ? 'block' : 'hidden',
          )}
          id="patient-timeline-section"
        >
          <RecordSection
            title="Visit history"
            description="Completed clinical visits for this patient."
          >
            <PatientVisitTimeline
              highlightedVisitId={highlightedVisitId}
              patientId={patient.id}
            />
          </RecordSection>
        </div>
      </CardContent>
    </Card>
  )
}
