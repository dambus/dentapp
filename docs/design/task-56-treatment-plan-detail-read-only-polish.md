# Task 56 - Treatment Plan Detail Read-only Polish

## Existing Foundation

Treatment plan schema and service already existed before this task:

- `treatment_plans`
- `treatment_plan_items`
- `src/features/patients/treatmentPlanService.ts`
- patient full-record treatment plan section

This task did not add schema, migrations, seed data, or fake treatment plans.

## Surface Polished

Polished the patient full-record `TreatmentPlansSection` as a read-only clinical
planning reference.

The section now shows existing plan data more clearly:

- plan title,
- plan status,
- created date,
- planned item count,
- proposed total when available,
- planned items,
- item status,
- tooth and service code context when present,
- item notes/description when present.

The patient overview `PatientTreatmentPlanSummary` remains the compact entry
point and links to the same full-record treatment plan section.

The treatment plan read service also now treats non-UUID demo patient IDs as
existing demo context, even when patient data source is Supabase. This avoids an
invalid UUID treatment-plan query when the patient page is displaying a demo
slug fallback profile.

## Read-only Behavior

The patient detail treatment plan surface is read-only.

Removed patient-detail mutation controls from this surface:

- create treatment plan,
- edit plan,
- archive plan,
- add item,
- edit item,
- archive item.

The existing treatment plan service was left in place for existing service/RLS
coverage and future scoped treatment plan management work. Visit Completion does
not mutate treatment plans.

## States

Treatment plan states now use user-facing copy:

- loading: `Loading treatment plans...`
- empty: `No treatment plan configured`
- error: `Failed to load treatment plans`
- plan without items: `Treatment plan exists but has no planned items.`

The states are aligned with the overview card so summary and detail do not
contradict each other.

## Summary and Detail Alignment

Aligned wording across the treatment plan surfaces:

- overview card title: `Treatment Plan`
- full-record section title: `Treatment Plan`
- quick action title: `Treatment Plan`
- quick action CTA: `View treatment plan`
- overview CTA: `View treatment plan`

The existing overview-to-detail behavior still updates
`section=treatment-plans` and scrolls to the full record.

## Smoke Coverage

Updated the authenticated browser smoke treatment-plan check to verify:

- summary-to-detail navigation still reaches `section=treatment-plans`,
- the full treatment plan section is visible,
- read-only wording is present,
- either the empty state, no-items state, or existing plan detail is displayed.

The check avoids item-count and currency assertions because local data can vary.

## Remaining Future Work

Future scoped work remains:

- dedicated treatment plan management workflow,
- treatment plan filtering and grouping,
- print/export,
- acceptance/versioning flow,
- linking performed procedures to treatment plan items,
- automatic treatment plan item status transitions from Visit Completion,
- billing/payments/materials/attachments,
- reminders/tasks,
- provider assignment.
