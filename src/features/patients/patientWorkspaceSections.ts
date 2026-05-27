export type PatientWorkspaceSection =
  | 'overview'
  | 'medical-record'
  | 'treatment-plans'
  | 'timeline'
  | 'odontogram'
  | 'documents'

export type LegacyPatientSection =
  | 'overview'
  | 'medical-record'
  | 'clinical-notes'
  | 'treatment-plans'
  | 'timeline'
  | 'odontogram'
  | 'documents'

export function isPatientWorkspaceSection(
  section: string | null,
): section is PatientWorkspaceSection {
  return (
    section === 'overview' ||
    section === 'medical-record' ||
    section === 'treatment-plans' ||
    section === 'timeline' ||
    section === 'odontogram' ||
    section === 'documents'
  )
}

export function getPatientWorkspaceSection(section: string | null) {
  if (!section) {
    return {
      focus: 'overview' as const,
      section: 'overview' as const,
    }
  }

  if (section === 'clinical-notes') {
    return {
      focus: 'clinical-notes' as const,
      section: 'medical-record' as const,
    }
  }

  if (isPatientWorkspaceSection(section)) {
    return {
      focus: section,
      section,
    }
  }

  return {
    focus: 'overview' as const,
    section: 'overview' as const,
  }
}

export function getPatientWorkspaceSectionLabel(
  section: PatientWorkspaceSection,
) {
  const labels: Record<PatientWorkspaceSection, string> = {
    overview: 'Overview',
    'medical-record': 'Record',
    'treatment-plans': 'Treatment plan',
    timeline: 'Timeline',
    odontogram: 'Odontogram',
    documents: 'Documents',
  }

  return labels[section]
}
