import { useEffect, type ReactNode } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui'
import { ClinicalNotesSection } from './ClinicalNotesSection'
import { OdontogramSection } from './OdontogramSection'
import {
  formatPatientDate,
  formatPatientDateTime,
  getPatientAge,
  patientStatusLabels,
} from './patientDisplay'
import { PatientVisitTimeline } from './PatientVisitTimeline'
import {
  type PatientWorkspaceSection,
} from './patientWorkspaceSections'
import { TreatmentPlansSection } from './TreatmentPlansSection'
import type { DemoPatient } from './types'

type PatientFullRecordProps = {
  patient: DemoPatient
  patientName: string
  activePlanLabel: string
  activeSection: Exclude<PatientWorkspaceSection, 'overview'>
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
  recordFocus?: 'clinical-notes' | 'medical-record' | null
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

export function PatientFullRecord({
  patient,
  patientName,
  activePlanLabel,
  activeSection,
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
  recordFocus = null,
}: PatientFullRecordProps) {
  const hasMedicalWarnings = patient.medicalWarnings.length > 0

  useEffect(() => {
    if (activeSection !== 'medical-record' || recordFocus !== 'clinical-notes') {
      return
    }

    window.setTimeout(() => {
      document
        .getElementById('patient-record-clinical-notes')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }, [activeSection, recordFocus])

  if (activeSection === 'treatment-plans') {
    if (!canViewTreatmentPlans) {
      return null
    }

    return (
      <section
        className="space-y-4"
        data-testid="patient-full-record-workspace"
        id="patient-treatment-plans-section"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Treatment plan
            </h2>
            <Badge variant="neutral">Detailed section</Badge>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Structured clinical planning for the patient. Plan-level actions
            stay with the plan header, while row actions stay with the relevant
            planned treatment.
          </p>
        </div>
        <TreatmentPlansSection
          patientId={patient.id}
          canManageTreatmentPlans={canManageTreatmentPlans}
          isPatientArchived={isPatientArchived}
        />
      </section>
    )
  }

  if (activeSection === 'timeline') {
    return (
      <section
        className="scroll-mt-6 space-y-4"
        data-testid="patient-full-record-workspace"
        id="patient-timeline-section"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Timeline
            </h2>
            <Badge variant="neutral">Visit history</Badge>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Compact chronological view of completed visits. Open visit detail
            only when the full clinical review is needed.
          </p>
        </div>
        <PatientVisitTimeline
          highlightedVisitId={highlightedVisitId}
          patientId={patient.id}
        />
      </section>
    )
  }

  if (activeSection === 'odontogram') {
    if (!canViewOdontogram) {
      return null
    }

    return (
      <div
        data-testid="patient-full-record-workspace"
        id="patient-odontogram-section"
      >
        <OdontogramSection
          patientId={patient.id}
          canEditOdontogram={canEditOdontogram}
          isPatientArchived={isPatientArchived}
        />
      </div>
    )
  }

  if (activeSection === 'documents') {
    return (
      <Card
        className="scroll-mt-6 border-slate-200"
        data-testid="patient-full-record-workspace"
        id="patient-documents-section"
      >
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Documents</CardTitle>
            <Badge variant="neutral">Placeholder</Badge>
          </div>
          <CardDescription>
            Document storage and upload are future scoped work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-950">
              {patient.documentsCount} demo document references
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No real documents are stored. Document upload, secure storage, and
              file permissions will be implemented later.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className="space-y-6"
      data-testid="patient-full-record-workspace"
      id="patient-medical-record-section"
    >
      <Card className="scroll-mt-6 border-slate-200">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Record</CardTitle>
                <Badge variant="neutral">Clinical detail</Badge>
              </div>
              <CardDescription>
                Detailed patient identity, medical history, clinical context,
                and notes.
              </CardDescription>
            </div>
            {canEditMedicalRecord ? (
              <Button onClick={onEditMedicalRecord} size="sm" variant="secondary">
                Edit medical record
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
              title="Treatment context"
              description="Planning context from the current clinical record."
            >
              <dl className="grid gap-4">
                <DetailItem
                  label="Active treatment plan"
                  value={activePlanLabel}
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
                <div className="space-y-2">
                  {patient.medicalWarnings.map((warning) => (
                    <p
                      className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950"
                      key={warning}
                    >
                      {warning}
                    </p>
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
              description="Clinical planning summary for the patient record."
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={patient.activeTreatmentPlan ? 'info' : 'neutral'}
                >
                  {activePlanLabel}
                </Badge>
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
        </CardContent>
      </Card>

      {canViewClinicalNotes ? (
        <div id="patient-record-clinical-notes">
          <ClinicalNotesSection
            patientId={patient.id}
            canManageNotes={canManageClinicalNotes}
            isPatientArchived={isPatientArchived}
          />
        </div>
      ) : null}
    </div>
  )
}
