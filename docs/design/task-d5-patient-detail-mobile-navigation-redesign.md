# Task D5 - Patient Detail Mobile Navigation Redesign

## Purpose

Patient detail is becoming a clinical workspace with multiple modules. The previous mobile section navigation used a horizontally scrolling button strip, which made hidden sections easy to miss. Task D5 replaces that mobile pattern with a direct section selector while preserving desktop tabs and existing URL behavior.

## Implemented Pattern

- Mobile uses a labeled section select:
  - label: `Section`
  - test id: `patient-section-selector`
  - sticky near the top of the Full Record card
  - all available sections visible through the native select
- Desktop/tablet keeps the existing button-tab pattern from `sm` upward.
- Section changes still flow through the existing `onSectionChange` handler.
- Existing direct links such as `?section=timeline` continue to initialize the selected section.
- Non-timeline section changes still clear `visitId` as before.

## Current Section Labels

Actual implemented sections only:

- Medical
- Odontogram
- Plans
- Notes
- Documents
- Timeline

Available sections still depend on role permissions.

## Accessibility

- The select has a visible `Section` label.
- The select also has `aria-label="Patient record section"`.
- Keyboard and screen reader behavior rely on the native select.
- No icon-only mobile navigation was introduced.

## Next Recommended Task

Task D6 - Visit Completion Mobile Sticky Progress
