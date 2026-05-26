# Task 95 - Pilot Clinical Flow Audit and UI/UX Restyling Foundation Planning

## 1. Decision Summary

The first in-clinic testing milestone is the focused pilot clinical flow, not the full final DentApp product.

The active near-term priority is:

1. schedule an appointment;
2. see it clearly in the planner;
3. progress the patient through reception states;
4. open and complete the clinical visit;
5. create and use a treatment plan;
6. schedule the next appointment when needed.

This task adds a priority layer over the existing roadmap:

- `Pilot-critical` - required before realistic clinic testing;
- `Pilot usability / restyling` - implemented behavior that must become clearer and easier to use;
- `Post-pilot or deferred` - valuable backlog that is not needed for the first clinic test.

Internal settlement records remain post-MVP. No settlement, payment, ledger, balance, invoice, receipt, fiscal, or reporting work belongs in the active pilot stream.

## 2. Pilot Testing Goal

The pilot should let clinic staff test one practical patient journey end to end:

- reception or clinical staff find the patient and schedule an appointment;
- staff view the daily or weekly schedule and understand patient, time, provider, lifecycle state, and operational state;
- reception progresses the appointment from `not_arrived` to `arrived` to `ready_for_doctor`;
- the doctor opens the patient or appointment, starts or continues Visit Completion, records clinical work, and completes the visit;
- the completed clinical visit can be reviewed from patient history;
- a treatment plan can be created/updated for the patient;
- staff can schedule the next appointment from existing patient or follow-up context.

The pilot does not require a complete clinic administration suite.

## 3. Core Pilot Workflow

### Appointment Scheduling

Implemented:

- `PatientAppointmentSummary` provides patient-context appointment creation with date, time, type, duration, reason, notes, and optional assigned provider.
- Appointment creation validates date/time, duration, reason, notes, provider selection, and double-submit behavior.
- After creation, the patient appointment context refreshes and exposes a `View appointment` action.
- Follow-up context can prefill the appointment reason while still requiring manual user submit.

Remaining pilot risk:

- scheduling currently lives primarily in patient context, not as a full planner create flow;
- the form copy still describes the calendar as lightweight, which may be acceptable for pilot but should be polished during restyling;
- rebooking is practical through the existing patient appointment panel, but the shortcut hierarchy should be checked during pilot UI work.

### Planner / Schedule View

Implemented:

- `AppointmentsPage` supports daily and weekly views.
- The schedule shows appointment time, patient, appointment reason/type, lifecycle status, assigned provider, operational state, and linked visit state.
- Provider filtering exists with `All providers`, `Unassigned`, and assignable-provider options.
- Appointment cards support opening patient detail, appointment detail, Start/Continue/View Visit actions, lifecycle secondary actions, and operational-state actions.
- Prior work added compact weekly cards, responsive overflow guards, mobile menu anchoring fixes, and provider-filter persistence.

Remaining pilot risk:

- the daily/weekly schedule is functionally useful but still reads like a dense operational card list;
- action hierarchy is powerful but may be too busy for first-time clinic users;
- weekly compact cards suppress some direct operational actions, so daily view is the safer first pilot operating view;
- planner readability should be the first major restyling stream after the treatment-plan blocker is handled.

### Patient Reception / Operational Progression

Implemented:

- Appointment operational state exists independently from lifecycle status.
- Supported operational states are `not_arrived`, `arrived`, and `ready_for_doctor`.
- Daily appointment cards and Appointment Detail expose forward actions.
- Appointment Detail supports safe one-step correction actions where eligible.
- Patient Today and Visit Completion context show operational state as display-only context.
- RLS and browser smoke coverage exist for operational progression and correction.

Remaining pilot risk:

- labels are technically clear, but reception users need stronger visual hierarchy and larger, unmistakable status/action presentation;
- operational state should stay limited to this simple model for the pilot;
- broader check-in, waiting-room analytics, chair/room state, and queue automation are not required.

### Work With The Patient / Clinical Visit

Implemented:

- Appointment cards, Appointment Detail, Patient Today, and Patient Quick Actions provide Start/Continue/View Visit entry points.
- `VisitCompletionFlow` is clinical-only after Task 92: it records planned context, procedures, clinical note, recommendation, next step, and review/complete state.
- Completed clinical visit detail and patient timeline are available.
- The flow does not depend on settlement, payment, ledger, performed-service financial posting, or deferred internal-settlement access.

Remaining pilot risk:

- Visit Completion is usable but visually separate from the rest of the patient workflow;
- the doctor-facing path from schedule to patient context to Visit Completion should be restyled around one clear primary action per state;
- completed visit review should remain clinically focused and should not regain financial wording.

### Treatment Plan

Implemented:

- Treatment-plan schema/RLS and read coverage exist.
- Patient Detail has a Treatment Plan section and summary surfaces.
- `TreatmentPlansSection` and `PatientTreatmentPlanSummary` are explicitly read-only.
- A top-level `TreatmentPlansPage` route exists but is still a placeholder.
- The service layer contains create/update/archive functions for plans and plan items, with validation and audit calls.

Pilot blocker:

- no practical treatment-plan creation/editing UI is currently available.
- Because the pilot workflow explicitly requires creating and using a treatment plan, this is a `Pilot-critical` functional workstream.
- This should precede or run in parallel with planner restyling. It must not include financial linkage, billing, settlement, automatic ledger posting, or payment behavior.

### Rebooking / Next Appointment

Implemented:

- The patient appointment panel can create a next appointment.
- Completed visit follow-up context can route to patient scheduling with prefilled reason/context.
- Appointment Detail and completed visit flows already expose follow-up or scheduling paths where relevant.

Remaining pilot risk:

- the underlying capability is sufficient for first pilot use;
- restyling should make the next-appointment action easier to find after Visit Completion and from completed visit review;
- reminder automation, recall campaigns, recurring appointments, and external calendar sync are post-pilot.

## 4. Current Implemented Capability Audit

Source and documentation reviewed:

- `src/pages/AppointmentsPage.tsx`
- `src/features/appointments/AppointmentCard.tsx`
- `src/pages/AppointmentDetailPage.tsx`
- `src/features/patients/PatientAppointmentSummary.tsx`
- `src/features/patients/PatientTodayPanel.tsx`
- `src/features/patients/PatientQuickActions.tsx`
- `src/features/patients/PatientFullRecord.tsx`
- `src/features/patients/TreatmentPlansSection.tsx`
- `src/features/patients/PatientTreatmentPlanSummary.tsx`
- `src/pages/TreatmentPlansPage.tsx`
- `src/features/patients/treatmentPlanService.ts`
- `src/features/visits/VisitCompletionFlow.tsx`
- `src/pages/PatientVisitDetailPage.tsx`
- route and navigation configuration
- prior appointment, provider, operational-state, Visit Completion, treatment-plan, and settlement-safety task docs.

Audit conclusion:

- appointment scheduling, schedule display, provider assignment/filtering, reception progression, Visit Completion, completed visit review, and next-appointment scheduling have enough functional foundation for pilot planning;
- treatment-plan creation/editing does not yet have an implemented UI and blocks a credible full pilot;
- the most important UI/UX risk is not missing navigation breadth, but unclear hierarchy across planner cards, patient entry points, reception actions, and clinical workflow actions.

## 5. Pilot Blockers And Gaps

### Pilot-critical

- Treatment-plan creation/editing UI for patient plans and plan items.
- A narrow decision on whether the first treatment-plan write UI lives inside Patient Detail or a dedicated treatment-plan page.
- Pilot validation after treatment-plan writes are connected, covering create/edit/archive and patient record visibility.

### Pilot usability / restyling

- Planner daily and weekly readability.
- Appointment-card hierarchy, especially patient/time/provider/status/action separation.
- Reception operational-state visibility and primary action placement.
- Patient Detail workflow entry points: today panel, quick actions, appointments, treatment plan, timeline.
- Visit Completion visual integration with appointment and patient context.
- Completed visit review and rebooking action clarity.
- Responsive manual checks for the pilot path on desktop, tablet, and supported mobile widths.

### Post-pilot or deferred

- Internal settlement records.
- Payment, ledger, balance, fiscal, invoice, receipt, and settlement reporting work.
- Doctor commissions.
- Inventory/material requests, unless pilot feedback makes a narrow clinical material note necessary.
- Advanced calendar/resource scheduling, recurring appointments, provider workload calendar, availability rules, waiting-time analytics.
- Reminder automation, recall campaigns, task automation, patient portal, online booking, and external calendar sync.
- Broad reports and analytics.

## 6. UI/UX Restyling Priorities

### 1. Planner / Appointments Daily And Weekly Schedule

Why it matters:

- this is the operational start of the in-clinic day.

Functional status:

- implemented with day/week modes, provider filter, appointment cards, operational state, and linked visit actions.

Risk:

- card density and action hierarchy may be hard to scan in live clinic use.

Recommended task type:

- UI restyling plus validation/manual testing.

### 2. Appointment Card And Reception Operational Actions

Why it matters:

- reception staff need immediate confidence about arrival state and next action.

Functional status:

- operational state and corrections are implemented.

Risk:

- state/action labels are present but need stronger visual priority and clearer role-specific placement.

Recommended task type:

- UI restyling and regression validation.

### 3. Patient Detail Clinical Workflow Entry

Why it matters:

- doctors and staff need one patient workspace that clearly leads to today's work, treatment plan, timeline, and scheduling.

Functional status:

- Today panel, Quick Actions, appointment summary, treatment-plan summary, full record, and timeline exist.

Risk:

- many panels compete for attention; treatment-plan actions are currently read-only.

Recommended task type:

- UI restyling after or alongside treatment-plan write UI.

### 4. Visit Workflow / Visit Completion

Why it matters:

- this is the main doctor documentation workflow.

Functional status:

- clinical-only draft/completion flow exists and is validated.

Risk:

- the flow needs a cleaner visual bridge from schedule/patient context and should remain free of financial terms.

Recommended task type:

- UI restyling and clinical workflow manual testing.

### 5. Treatment Plan Screens Or Patient Plan Section

Why it matters:

- the pilot explicitly needs treatment-plan creation/use.

Functional status:

- read-only display and service writes exist; implemented write UI is missing.

Risk:

- this is the main functional blocker.

Recommended task type:

- functional implementation first, then focused UI restyling.

### 6. Rebooking / Next Appointment Action

Why it matters:

- next appointment scheduling completes the pilot loop.

Functional status:

- patient appointment creation and follow-up prefill exist.

Risk:

- shortcut placement after visit completion/completed review may not be obvious enough.

Recommended task type:

- UI restyling and manual pilot-path validation.

## 7. Pilot-Critical Versus Deferred Classification

### Pilot-critical Functional Work

- Treatment-plan create/edit/archive UI for plans and items.
- Minimal patient-level plan workflow connected to existing treatment-plan RLS/service behavior.
- Any blocking appointment/reception/visit defects found while validating the pilot path.

### Pilot Usability / Restyling Work

- Planner/schedule visual redesign.
- Appointment-card action hierarchy.
- Reception operational-state clarity.
- Patient Detail workflow entry clarity.
- Visit Completion and completed visit clinical usability polish.
- Rebooking action visibility.
- Responsive checks for the full pilot path.

### Post-pilot Or Deferred Work

- internal settlement, payment, ledger, balance, fiscal, invoice, receipt, and settlement reporting work;
- doctor commissions;
- advanced reports/analytics;
- advanced reminders/recall automation;
- non-critical administration;
- broad inventory/material request workflows;
- patient portal, online booking, and external calendar sync.

## 8. Recommended Next Task Sequence

1. Task 96 - Treatment Plan Creation/Edit Pilot Workflow

   Implement the minimal patient-level treatment-plan write UI needed for pilot testing, using the existing service/schema/RLS foundation. Include plan and plan-item create/edit/archive behavior, patient record visibility, and focused validation. Exclude financial linkage, settlement, billing, materials, and automatic Visit Completion mutation.

2. Task 97 - Planner And Appointment Card Pilot Restyling

   Restyle Appointments daily/weekly views and appointment cards around scan clarity, provider/status visibility, reception progression, and primary clinical actions. Preserve existing behavior and smoke guards.

3. Task 98 - Patient Detail Pilot Workflow Entry Restyling

   Refine Patient Today, Quick Actions, Appointments, Treatment Plan, and Timeline entry points so staff can move through the pilot workflow without hunting through dense panels.

4. Task 99 - Visit Completion And Completed Visit Pilot Usability Pass

   Polish the clinical-only Visit Completion and completed visit review surfaces, including follow-up/rebooking action clarity, without adding settlement or payment behavior.

5. Task 100 - Pilot Clinical Flow Validation Checkpoint

   Run the end-to-end pilot path manually and with existing smoke/RLS guards, document remaining blockers, and decide whether pilot testing can begin.

## 9. Scope Boundaries

Task 95 changed documentation only.

Do not add or restore:

- settlement/payment/ledger/balance UI;
- payment forms;
- performed-service financial posting;
- invoice, receipt, fiscalization, export, or settlement reports;
- automatic treatment-plan mutation from Visit Completion;
- broad calendar/resource scheduling;
- new schema/RLS/RPC changes as part of this planning task.

The Task 92/93 safe baseline remains authoritative: ordinary clinical UI has no settlement/payment/charge/balance visibility, Visit Completion remains clinical-only, and frozen backend artifacts/RPCs remain blocked even if future internal-settlement settings/grants exist.
