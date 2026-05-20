# Task 48 - Treatment Plan Read-only Foundation

## Existing Data and Schema

Treatment plan data/schema already exists.

Existing foundation:

- migration: `supabase/migrations/20260512133000_create_treatment_plans.sql`
- tables:
  - `treatment_plans`
  - `treatment_plan_items`
- service: `src/features/patients/treatmentPlanService.ts`
- patient full record section:
  - `src/features/patients/TreatmentPlansSection.tsx`

The existing full record section already has role-gated create/update/archive
behavior for clinical roles. This task did not expand that write behavior.

## Surface Added

Added `PatientTreatmentPlanSummary` to the patient overview clinical area.

The card is read-only and appears for roles that can view treatment plans. It
uses the existing `getPatientTreatmentPlans(patientId)` service read.

It shows:

- primary treatment plan title,
- plan status,
- planned item count,
- proposed total when available,
- created date,
- up to four planned items with status and tooth/region context,
- link into the existing patient treatment plan section.

The primary plan is chosen from existing data in this order:

1. in-progress plan,
2. accepted plan,
3. proposed plan,
4. newest available plan.

## Empty State

If no treatment plan data exists, the card shows a clean read-only empty state:

- `No treatment plan configured`
- explanation that treatment plans and planned items will appear once recorded
  in the treatment plan section.

No fake Supabase treatment plans were created. Existing demo-mode treatment plan
values remain as existing demo data only.

## Quick Actions

Updated patient quick actions:

- changed treatment plan shortcut from `Add Treatment Plan Item` to
  `Treatment Plan`,
- made the shortcut available to treatment-plan read roles,
- button label is `View treatment plan`,
- copy no longer implies creation from the overview.

## Visit Completion Separation

No Visit Completion logic was changed.

Completed visits, procedures, recommendations, and follow-up guidance still do
not mutate treatment plans or treatment plan items.

## Smoke Coverage

The authenticated browser smoke now verifies the patient overview treatment plan
summary is present and read-only, and that an entry point to the full treatment
plan section is available.

## Future Work

Future scoped work may refine:

- treatment plan filtering and grouping,
- patient-friendly print/export,
- versioning/acceptance workflow,
- linking visits/procedures to treatment plan items,
- treatment-plan item status transitions from Visit Completion.

Those remain out of scope here.
