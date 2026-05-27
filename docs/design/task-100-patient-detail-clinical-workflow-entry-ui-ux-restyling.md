# Task 100 - Patient Detail Clinical Workflow Entry UI/UX Restyling

## Why This Surface

After Task 99 improved planner and appointment-card scan clarity, the next pilot
usability risk moved to the patient page. Staff can already reach appointment
scheduling, treatment planning, Visit Completion, timeline review, and the Full
Record from Patient Detail, but the page did not clearly answer:

1. who the patient is;
2. what the relevant current workflow is;
3. what the next clinical action should be;
4. where treatment planning lives;
5. where deeper clinical history lives.

Task 100 keeps the existing patient-detail capabilities and reorders emphasis so
the patient page works as a clearer pilot workflow entry surface.

## Files Changed

Retained from the interrupted implementation:

- `src/features/patients/PatientSnapshot.tsx`
- `src/features/patients/PatientTodayPanel.tsx`
- `src/features/patients/PatientQuickActions.tsx`
- `src/features/patients/PatientAppointmentSummary.tsx`
- `src/features/patients/PatientFullRecord.tsx`
- `src/pages/PatientDetailPage.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

Recovery completion changes:

- this design note;
- execution-doc updates recording review, validation, and visual inspection;
- a narrow browser-smoke stabilization in the existing
  `testPatientAppointmentBrowserSmoke.mjs` flow so the retained restyled
  patient-detail assertions and the later normal Visit Completion route checks
  wait for the intended surface before advancing.

No backend, schema, migration, RLS, RPC, service write-path, appointment
lifecycle, provider-assignment, Visit Completion, treatment-plan mutation, or
settlement behavior was changed for Task 100 recovery.

## Retained UI Hierarchy

The retained interrupted UI was kept because it already matched the Task 100
scope and compiled cleanly after review.

The patient page now reads top-to-bottom as:

1. `Patient workspace` page shell with route-level context.
2. `PatientSnapshot` as the patient identity and safety header.
3. `Clinical workflow` section led by `PatientTodayPanel`.
4. treatment-plan and appointment/rebooking entry cards side-by-side on larger
   screens and stacked on smaller screens.
5. `Clinical context` section for recent activity and follow-up guidance.
6. `Workflow Shortcuts` as secondary, role-aware entry points.
7. `Clinical Record` / Full Record as the deeper workspace for medical,
   planning, notes, documents, and timeline review.

This ordering makes the active workflow primary and the deeper record secondary
without removing any existing access path.

## Surface Decisions

### Patient identity and safety

`PatientSnapshot` now prioritizes:

- patient name, age, lifecycle status, and data-source mode;
- direct edit / archive / restore / full-record actions;
- a compact safety and priority block for allergies, warnings, and important
  note;
- compact context tiles for contact, active plan, last visit, and profile
  status.

The restyle intentionally removed broader overview-style metric clutter and did
not add any payment, balance, charge, invoice, receipt, or settlement
placeholders.

### Current workflow and primary clinical action

`PatientTodayPanel` now acts as the main clinical decision surface:

- the card title is `Current Workflow`;
- the top badge reflects completed today, visit in progress, appointment
  scheduled today, or no active visit today;
- the primary CTA remains `Start visit`, `Continue visit`, or
  `View completed visit` based on the existing workflow logic;
- appointment/provider/treatment-plan context stays visible, but secondary to
  the current clinical state and primary CTA.

No eligibility logic changed. The restyle only changes emphasis and wording.

### Treatment plan and rebooking access

The page places `PatientTreatmentPlanSummary` beside
`PatientAppointmentSummary` inside the `Clinical workflow` section so staff can
see planning and next-booking context close to the active workflow.

`PatientAppointmentSummary` keeps the existing scheduling behavior and still
uses the current patient-context appointment form. The card title was clarified
to `Appointments / Rebooking` to make the existing manual scheduling path more
discoverable.

### Secondary shortcuts and full record

`PatientQuickActions` was kept as a secondary navigation aid, renamed visually
to `Workflow Shortcuts`, and narrowed to reuse existing sections or routes. It
does not create a new unsupported workflow.

`PatientFullRecord` was relabeled visually as `Clinical Record` with `Full
Record` retained as the badge so the deeper patient workspace remains
accessible, but visually subordinate to the active workflow area.

## Behavior Preserved

Confirmed preserved:

- appointment lifecycle logic and restrictions;
- appointment operational-state logic;
- assigned-provider visibility and assignment behavior;
- Visit Completion start/continue/view behavior;
- Task 98 treatment-plan create/edit/archive behavior;
- Task 98 treatment-plan role restrictions;
- internal-settlement freeze and feature-access restrictions;
- absence of payment, charge, balance, invoice, receipt, and settlement UI.

## Recovery Review Outcome

The interrupted diff was largely usable.

Recovery review found:

- the changed UI compiled without import/export or broken-structure issues;
- the changed surfaces remained within Task 100 scope;
- the smoke-test additions strengthened patient-detail semantic checks rather
  than weakening Task 98 or Task 99 coverage;
- no additional runtime code correction was required after review.

Recovery therefore kept the interrupted UI changes, completed the missing
documentation, completed manual responsive inspection, and then finalized the
required Supabase-backed validation once the service-role key was available in
the validation shell.

## Manual Responsive Inspection

Manual screenshot inspection was performed against the current local Task 100
workspace at approximately:

- 390 px mobile;
- 768 px tablet;
- 1280 px desktop.

Inspected states:

- patient with a relevant current appointment / primary clinical action;
- patient with treatment-plan summary and mutation controls reachable from the
  existing authorized Full Record treatment-plan section;
- patient with completed visit / timeline history readability;
- limited-content / no-current-appointment workflow state;
- Full Record readability on mobile and tablet;
- mobile and tablet overflow behavior;
- absence of financial or internal-settlement content.

Observed result:

- no horizontal overflow was visible in the inspected patient-detail screens;
- the patient header remains readable on mobile without losing required
  identity/safety context;
- the `Current Workflow` card remains the clearest next-action surface;
- treatment-plan and scheduling cards remain reachable without dominating the
  page;
- Full Record remains readable and clearly secondary;
- no finance, payment, balance, invoice, receipt, or settlement terminology
  appeared on the inspected patient-detail surfaces.

## Validation

Completed during recovery:

- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs`
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`
- `node .\supabase\snippets\testTreatmentPlanMutationRls.mjs`
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs`
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs`
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs`
- `git diff --check`

Validation was executed against the local app at
`DENTAPP_APP_URL=http://127.0.0.1:5173`.

## Deferred Follow-up

Deferred intentionally:

- any broader Visit Completion screen redesign;
- additional patient-detail density reduction inside the deeper Full Record;
- new workflow automation between follow-up guidance, appointments, and
  treatment-plan mutation;
- any finance, settlement, payment, ledger, invoice, receipt, or fiscal work.

## Next Recommended Task

Task 101 - Visit Completion Clinical Flow Pilot UI/UX Restyling.
