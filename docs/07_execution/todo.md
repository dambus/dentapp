# DentApp — Todo

This file tracks active and upcoming project tasks.

Status legend:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked / needs decision

---

## 1. Project Foundation

- [x] Create Vite React TypeScript project
- [x] Create documentation folder structure
- [x] Create initial empty documentation files
- [x] Fill product vision document
- [x] Fill project charter document
- [x] Fill decisions log
- [x] Fill open questions log
- [ ] Create glossary

---

## 2. Codex/Cursor Setup

- [x] Create `docs/08_codex/codex_project_context.md`
- [x] Create `docs/08_codex/codex_rules.md`
- [x] Create `docs/08_codex/codex_task_template.md`
- [x] Create `docs/08_codex/codex_review_checklist.md`
- [ ] Create `docs/08_codex/codex_prompt_library.md`

---

## 3. Product Discovery

- [x] Create discovery interview checklist
- [x] Create clinic workflow observation template
- [ ] Define pilot observation process
- [ ] Define interview questions for owner
- [ ] Define interview questions for doctors
- [ ] Define interview questions for assistants
- [ ] Define interview questions for reception/admin
- [ ] Define interview questions for inventory responsible person
- [ ] Create pilot feedback log structure

---

## 4. Product Definition

- [x] Define MVP scope
- [ ] Define out-of-scope list
- [x] Define product roadmap
- [x] Define feature backlog
- [x] Define user roles
- [x] Define permissions matrix
- [x] Define key user workflows

---

## 5. Domain Modeling

- [x] Define dental terminology glossary
- [x] Define patient record model
- [x] Define odontogram model
- [x] Define treatment plan model
- [x] Define payment and debt model
- [x] Define doctor commission model
- [x] Define inventory model
- [ ] Define material request model

---

## 6. UX/UI Planning

- [x] Define UX principles
- [x] Define information architecture
- [x] Define screen map
- [x] Define main user flows
- [x] Define design system direction
- [x] Define component inventory
- [x] Define dental workflow model
- [x] Define Patient Detail refactor plan
- [x] Define Visit Completion flow
- [x] Create Patient UX refactor checklist

---

## 7. Technical Planning

- [ ] Define technical architecture
- [ ] Define database schema v1
- [ ] Define Supabase storage strategy
- [ ] Define auth and roles model
- [x] Define RLS policy approach
- [ ] Define API/service layer approach
- [x] Define deployment strategy
- [x] Define backup and recovery strategy

---

## 8. Compliance Planning

- [ ] Research Serbian dental/medical record requirements
- [ ] Define data protection principles
- [ ] Define audit log policy
- [ ] Define retention policy
- [ ] Define print/export requirements
- [ ] Define consent template requirements

---

## 9. Implementation Phases

- [x] Phase 1: App foundation
  - [x] Task 1: Install and configure Tailwind CSS
  - [x] Task 2: Create source folder structure and continue app foundation cleanup
  - [x] Task 3: Install and configure React Router
  - [x] Task 4: Create AppShell, SidebarNav, TopBar, Page, and PageHeader
  - [x] Task 5: Create basic shared UI components
  - [x] Task 6: Add role-aware navigation placeholder
  - [x] Task 7: Run build and cleanup
- [~] Phase 2: Patients and records
  - [x] Task 1: Create demo patient model and patient list page
  - [x] Task 2: Create patient profile detail page with demo data
  - [x] Task 3: Add patient record sections to patient detail page
  - [x] Task 4: Create patient create/edit form foundation
  - [x] Task 5: Add patient form validation and UX refinement
  - [x] Task 6: Define patient persistence plan and Supabase migration draft
  - [x] Task 7: Create initial Supabase migration for patient tables
  - [x] Task 8: Review patient migration manually
  - [x] Task 9: Run patient migration against local/development Supabase
  - [x] Task 10: Add patient RLS helper functions and policies
  - [x] Task 11: Create audit log schema and strategy before real patient writes
  - [x] Task 12: Configure Supabase client for frontend data access
  - [x] Task 13: Create patient service abstraction
  - [x] Task 14: Replace direct demo patient reads with service abstraction
  - [x] Task 15: Create local demo seed data
  - [x] Task 16: Create demo auth users and complete RLS role testing
  - [x] Task 17: Implement Supabase-backed patient reads behind patientService data-source boundary
  - [x] Task 18: Implement basic login/logout UI
  - [x] Task 19: Load current profile and replace demo role placeholder
  - [x] Task 20: Add protected route foundation after profile/session loading
  - [x] Task 21: Diagnose and fix Supabase-mode patient reads in browser flow
  - [x] Task 22: Define controlled audit insert strategy/RPC
  - [x] Task 23: Implement patient create/update service layer
  - [x] Task 24: Connect patient create/edit forms to service writes (submit behavior integration)
  - [x] Task 24A: Fix patient write service test credentials
  - [x] Task 24B: Fix patient important note field mapping (form/service/detail)
  - [x] Task 24C: Fix patient write audit verification (service plus test script)
  - [x] Task 25: Add fine-grained role-specific route guards (optional, later phase)
  - [x] Task 26: Patient medical record edit flow
  - [x] Task 27: Patient archive/restore flow
  - [x] Task 28: Clinical notes CRUD
  - [x] Task 29: Odontogram foundation
  - [x] Task 30: Treatment plan foundation
  - [x] Task 31: Dental workflow UX review and Patient Detail refactor plan
  - [x] Task 32: Patient Detail UX refactor Phase A - Patient Snapshot
  - [x] Task 33: Patient Detail UX refactor Phase B - Today Panel
  - [x] Task 34: Patient Detail UX refactor Phase C - Quick Actions
  - [x] Task 35: Patient Detail UX refactor Phase D - Full Record organization
  - [x] Task 37: Visit Completion prototype
  - [x] Task 38: Responsive App Shell and Workflow Navigation UX Pass
  - [x] Task 38B: Responsive Polish Pass for Patient Detail and Visit Completion
  - [x] Task 39: Visit Completion Data Model and Persistence Plan
  - [x] Task 40A: Visit Completion Migration and RLS
  - [x] Task 40B: Apply and Validate Visit Completion Migration + RLS Smoke Test
  - [x] Task 40C: Visit Completion service layer
  - [x] Task 40D: Connect Visit Completion UI to persistence
  - [x] Task 40E: Authenticated Browser Persistence Smoke Test and UX Polish
  - [x] Task 41: Visit History / Patient Timeline
  - [x] Task 42: Follow-up / Next Step Handling
  - [x] Task 43A: Appointments Data Model + RLS
  - [x] Task 43B: Appointments Service Layer
  - [x] Task 43C: Patient Appointment UI + Follow-up Bridge
  - [x] Task 44: Appointment to Visit Workflow Bridge
  - [x] Task 45: Visit Detail / Completed Visit Review
  - [x] Task 46: Visit Review Print/PDF Preparation
  - [x] Task 47: Basic Appointments List / Schedule View
  - [x] Task 48: Appointment Workflow Polish
  - [x] Task 48B: Mobile Workflow Usability Pass
  - [x] Task 49: Appointment Detail / Schedule Item Review
  - [x] Task 50: Lightweight Weekly Schedule View
  - [x] Task 51: Appointment Creation / Status Polish
  - [x] Task 52: Appointment Module QA & UX Notes
  - [x] Task 45: Patient Overview Clinical Summary Polish
  - [x] Task 46: Follow-up Scheduling Entry Point
  - [x] Task 47: Appointment Creation Flow Polish
  - [x] Task 48: Treatment Plan Read-only Foundation
  - [x] Task D1: Design System Icon & Action Pattern
  - [x] Task D2: Appointment Card Redesign
  - [x] Task D3: Appointment Type & 15-Min Duration Standardization
  - [x] Task D5: Patient Detail Mobile Navigation Redesign
  - [x] Task D6: Visit Completion Mobile Sticky Progress
  - [x] Task 53: Restore Appointment Lifecycle Secondary Actions
  - [x] Task 54: Appointment Lifecycle State Transition Hardening
  - [x] Task 55: Appointment Lifecycle Service/Test Cleanup
  - [x] Task 56: Treatment Plan Detail Read-only Polish
  - [x] Task 57: Treatment Plan Data/RLS Smoke Coverage Review
  - [x] Task 58: Provider Assignment Planning / Data Model Decision
  - [x] Task 59: Appointment Provider Assignment Schema/RLS Foundation
  - [x] Task 60: Appointment Provider Assignment Service/UI Wiring
  - [x] Task 61: Provider Assignment UX/Test Cleanup + Appointment Menu Label Polish
  - [x] Task 62: Appointment Provider Filter / Daily Schedule Polish
  - [x] Task 63: Appointment Schedule Filter UI Cleanup / Persistence Polish
  - [x] Task 64: Appointment Schedule Compact Density / Mobile Readability Pass
  - [x] Task 64B: Fix Appointments Responsive Overflow Regression
  - [x] Task 65: Responsive Overflow Smoke Guard
  - [x] Task 66: Appointment Card Dropdown Anchoring / Mobile Menu Fix
  - [x] Task 67: Appointment Operational State Planning / Data Model Decision
  - [x] Task 68: Appointment Operational State Schema/RLS Foundation
  - [x] Task 69: Appointment Operational State Service/UI Wiring
  - [x] Task 70: Appointment Operational State Context Visibility
  - [x] Task 71: Appointment Operational State Correction
- [ ] Phase 3: Odontogram and treatment plans
- [ ] Phase 4: Scheduling and visits
- [ ] Phase 5: Payments and patient ledger
- [ ] Phase 6: Doctor commissions
- [ ] Phase 7: Inventory and material requests
- [ ] Phase 8: Pilot testing and stabilization

---

## 10. Current Immediate Next Tasks

- [x] Add role-specific route guards
- [x] Implement patient medical record edit flow
- [x] Implement patient archive/restore flow
- [x] Continue treatment plan foundation
- [x] Patient Detail UX refactor Phase A - Snapshot
- [x] Patient Detail UX refactor Phase B - Today Panel
- [x] Patient Detail UX refactor Phase C - Quick Actions
- [x] Patient Detail UX refactor Phase D - Full Record organization
- [x] Visit Completion prototype
- [x] Responsive app shell and workflow navigation UX pass
- [x] Responsive polish pass for Patient Detail and Visit Completion
- [x] Visit Completion data model and persistence plan
- [x] Create reviewed Visit Completion migration
- [x] Apply and validate Visit Completion migration and RLS
- [x] Create Visit Completion service layer
- [x] Connect Visit Completion UI to draft persistence
- [x] Connect Visit Completion UI to completed state persistence
- [x] Add Visit Completion browser/RLS interaction test coverage
- [x] Task 41 - Visit History / Patient Timeline
- [x] Task 42 - Follow-up / Next Step Handling
- [x] Task 43A - Appointments Data Model + RLS
- [x] Task 43B - Appointments Service Layer
- [x] Task 43C - Patient Appointment UI + Follow-up Bridge
- [x] Task 44 - Appointment to Visit Workflow Bridge
- [x] Task 45 - Visit Detail / Completed Visit Review
- [x] Task 46 - Visit Review Print/PDF Preparation
- [x] Task 47 - Basic Appointments List / Schedule View
- [x] Task 48 - Appointment Workflow Polish
- [x] Task 48B - Mobile Workflow Usability Pass
- [x] Task 49 - Appointment Detail / Schedule Item Review
- [x] Task 50 - Lightweight Weekly Schedule View
- [x] Task 51 - Appointment Creation / Status Polish
- [x] Task 52 - Appointment Module QA & UX Notes
- [x] Task 45 - Patient Overview Clinical Summary Polish
- [x] Task 46 - Follow-up Scheduling Entry Point
- [x] Task 47 - Appointment Creation Flow Polish
- [x] Task 48 - Treatment Plan Read-only Foundation
- [x] Task D1 - Design System Icon & Action Pattern
- [x] Task D2 - Appointment Card Redesign
- [x] Task D3 - Appointment Type & 15-Min Duration Standardization
- [x] Task D5 - Patient Detail Mobile Navigation Redesign
- [x] Task D6 - Visit Completion Mobile Sticky Progress
- [x] Task 53 - Restore Appointment Lifecycle Secondary Actions
- [x] Task 54 - Appointment Lifecycle State Transition Hardening
- [x] Task 55 - Appointment Lifecycle Service/Test Cleanup
- [x] Task 56 - Treatment Plan Detail Read-only Polish
- [x] Task 57 - Treatment Plan Data/RLS Smoke Coverage Review
- [x] Task 58 - Provider Assignment Planning / Data Model Decision
- [x] Task 59 - Appointment Provider Assignment Schema/RLS Foundation
- [x] Task 60 - Appointment Provider Assignment Service/UI Wiring
- [x] Task 61 - Provider Assignment UX/Test Cleanup + Appointment Menu Label Polish
- [x] Task 62 - Appointment Provider Filter / Daily Schedule Polish
- [x] Task 63 - Appointment Schedule Filter UI Cleanup / Persistence Polish
- [x] Task 64 - Appointment Schedule Compact Density / Mobile Readability Pass
- [x] Task 64B - Fix Appointments Responsive Overflow Regression
- [x] Task 65 - Responsive Overflow Smoke Guard
- [x] Task 66 - Appointment Card Dropdown Anchoring / Mobile Menu Fix
- [x] Task 67 - Appointment Operational State Planning / Data Model Decision
- [x] Task 68 - Appointment Operational State Schema/RLS Foundation
- [x] Task 69 - Appointment Operational State Service/UI Wiring
- [x] Task 70 - Appointment Operational State Context Visibility
- [x] Task 71 - Appointment Operational State Correction
- [x] Checkpoint B - Product Roadmap Re-balance
- [x] Task 72 - Performed Services Foundation Planning
- [x] Task 73 - Service Catalog and Performed Services Schema/RLS
- [x] Task 74 - Performed Services Service Layer
- [x] Task 75 - Visit Completion Performed Services UI Slice Planning / Finalization Review
- [x] Task 76 - Performed Services Completion / Finalization Safety Foundation
- [x] Task 77 - Visit Completion Services & Charges Draft UI
- [x] Task 78 - Visit Completion Performed Services Finalization Wiring
- [x] Task 79 - Patient Ledger Foundation Planning / Data Model Decision
- [x] Task 80 - Patient Ledger Schema/RLS Foundation
- [x] Task 81 - Patient Ledger Service Layer / Idempotent Charge Posting from Finalized Performed Services
- [x] Task 82 - Visit Completion Ledger Posting Wiring / Post-completion Charge Posting Failure Handling
- [x] Task 83 - Completed Visit Financial Read-only Display / Posted Charge Visibility
- [x] Task 84 - Patient Account Read-only Ledger / Balance Summary Planning
- [x] Task 85 - Patient Posted Charges Read-only Section / Account Activity Visibility
- [x] Task 86 - Payment Recording Foundation Planning / Data Model Decision
- [x] Task 87 - Payment Schema/RLS Foundation
- [x] Task 87B - Browser Smoke Appointment Bridge Timeout Investigation / Narrow Fix
- [x] Task 88 - Payment Service Layer / Controlled Recording and Reversal Boundary
- [x] Task 89 - Patient Account Charges + Payments / Payment UI Integration and Balance Decision
- [x] Task 90 - Optional Internal Settlement Records / Privacy & Access Decision
- [x] Task 91 - Internal Settlement Feature Toggle / Access-Control and Existing Backend Review
- [x] Task 92 - Existing Financial Visibility and Automatic Posting Freeze/Gating
- [x] Task 93 - Internal Settlement Feature Toggle and Explicit Permission Schema/RLS Foundation
- [x] Task 94 - Internal Settlement Post-MVP Deferral / MVP Roadmap Refocus
- [x] Task 95 - Pilot Clinical Flow Audit and UI/UX Restyling Foundation Planning
- [x] Task 96 - Treatment Plan Creation/Edit Pilot Workflow Finalization
- [x] Task 97 - Treatment Plan Mutation Schema/RLS Hardening
- [x] Task 98 - Patient Treatment Plan Creation/Edit UI
- [x] Task 99 - Planner and Appointment Card Pilot UI/UX Restyling
- [x] Task 100 - Patient Detail Pilot Workflow Entry Restyling
- [x] Task 101 - Visit Completion and Completed Visit Pilot Usability Pass
- [x] Task 102 - In-Clinic Pilot Workflow Walkthrough / UI Consistency and Blocking Defect Audit
- [x] Task 103 - Patient Workspace Information Architecture & Compact Clinical Design System Plan
- [x] Task 104 - Compact Clinical UI Primitives / Action and Status System
- [x] Task 105 - Patient Workspace Overview and Section Navigation Restructure
- [ ] Task 106 - Treatment Plan and Timeline Compact Detailed Presentation
- [ ] Task 107 - Pilot Forms and Secondary Interaction Consistency Pass
- [ ] Task 108 - Pre-Pilot Visual Consistency Walkthrough
- [ ] Task 109 - Guided In-Clinic Pilot Session Checklist and Observation Log Setup
- [ ] Doctor commission planning
- [ ] Doctor commission workflow
- [ ] Refine treatment plan UX and filtering

### Completed Recommended Task

Task 41 - Visit History / Patient Timeline

Completed direction:

- display completed visits in patient context,
- create a basic chronological patient timeline,
- connect completed Visit Completion records to visible patient history.

### Completed Recommended Task

Task 42 - Follow-up / Next Step Handling

Completed direction:

- use recommendation / next step from completed visits,
- create a lightweight follow-up action model or UI,
- do not build full appointments/calendar yet unless needed.

### Completed Recommended Task

Task 43A - Appointments Data Model + RLS

Completed direction:

- create basic appointment data model,
- add appointment RLS policies,
- validate appointment RLS behavior.

### Completed Recommended Task

Task 43B - Appointments Service Layer

Completed direction:

- create typed appointment service functions,
- fetch patient appointments and upcoming appointments,
- keep UI and advanced calendar views out of scope.

### Completed Recommended Task

Task 43C - Patient Appointment UI + Follow-up Bridge

Completed direction:

- connect patient to scheduled visits in the patient context,
- create appointment UI entry points from patient/follow-up context,
- keep advanced calendar views out of scope.

### Completed Recommended Task

Task 44 - Appointment to Visit Workflow Bridge

Completed direction:

- allow a scheduled appointment to become the starting context for Visit Completion,
- keep the bridge focused and route-based,
- do not build a full calendar workflow yet.

### Completed Recommended Task

Task 45 - Visit Detail / Completed Visit Review

Completed direction:

- add a focused completed visit review view,
- make patient timeline visit cards easier to inspect,
- keep editing/deleting completed visits out of scope unless explicitly needed.

### Completed Recommended Task

Task 49 - Appointment Detail / Schedule Item Review

Completed direction:

- add a dedicated view for a single appointment (date, time, patient, status, notes),
- link schedule and patient appointment cards to appointment detail,
- keep external calendar sync and recurring appointment logic out of scope.

### Completed Recommended Task

Task 50 - Lightweight Weekly Schedule View

Completed direction:

- add a compact week-based schedule view,
- keep it list/grid-light rather than full calendar drag/drop,
- avoid provider/chair/resource scheduling until the appointment model needs it.

### Completed Recommended Task

Task 51 - Appointment Creation / Status Polish

Completed direction:

- tightened appointment creation validation and user-facing errors,
- prevented rapid double-submit from creating duplicate appointments,
- polished appointment detail status actions and Start visit eligibility,
- expanded browser smoke coverage for validation, status actions, and appointment detail behavior.

### Completed Recommended Task

Task 52 - Appointment Module QA & UX Notes

Completed direction:

- documented appointment QA checklist,
- documented UX notes by severity,
- documented known limitations and next improvement areas.

### Completed Recommended Task

Task 45 - Patient Overview Clinical Summary Polish

Completed direction:

- reorder the patient overview around identity, active workflow, latest
  completed visit, follow-up, quick actions, and timeline access,
- use current appointment and Visit Completion data only,
- make Today actions context-aware for Start visit, Continue visit, View
  completed visit, and View appointment,
- add latest clinical activity summary and stable smoke coverage,
- keep follow-up display-only and avoid unavailable future modules.

### Completed Recommended Task

Task 46 - Follow-up Scheduling Entry Point

Completed direction:

- confirmed appointment creation already exists in the patient appointment panel,
- route follow-up scheduling intent to the existing patient appointment form,
- prefill the appointment reason from follow-up recommendation/next step when
  available,
- require explicit user submit before appointment creation,
- avoid automatic appointment creation, reminders, tasks, new follow-up schema,
  and fake scheduled appointments.

### Completed Recommended Task

Task 47 - Appointment Creation Flow Polish

Completed direction:

- polish the existing patient appointment form as the target for follow-up
  scheduling,
- show follow-up prefill context clearly and keep the reason editable,
- avoid overwriting user-edited reason text,
- keep appointment creation manual,
- show success feedback and appointment detail access after creation,
- refresh existing patient appointment context.

### Completed Recommended Task

Task 48 - Treatment Plan Read-only Foundation

Completed direction:

- confirm treatment plan schema/service already exists,
- add a read-only treatment plan summary to the patient overview clinical area,
- show existing plan status/items or a clean empty state,
- link to the existing patient treatment plan section,
- keep Visit Completion separate from treatment plan mutation.

### Completed Recommended Task

Task D1 - Design System Icon & Action Pattern

Completed direction:

- added Lucide icon foundation,
- added reusable `IconButton`, `ActionMenu`, `StatusBadge`, and `TypeBadge`,
- moved appointment status actions into overflow menus where safe,
- documented action hierarchy rules.

### Completed Recommended Task

Task D2 - Appointment Card Redesign

Completed direction:

- make appointment time and patient identity the dominant scan targets,
- use status/type badges consistently,
- keep primary action and details visible,
- move secondary/status actions into overflow,
- improve card density without introducing a full calendar.

### Completed Recommended Task

Task D3 - Appointment Type & Duration Standardization

Completed direction:

- define appointment type constants,
- keep duration options standardized around 15-minute increments,
- prepare type labels/default durations for a future persistence model,
- avoid schema changes until the type model is agreed.

### Completed Recommended Task

Task D5 - Patient Detail Mobile Navigation Redesign

Completed direction:

- replace horizontal-scroll patient detail tabs on mobile with a clearer selector,
- keep desktop behavior stable,
- improve section discoverability without redesigning patient detail content.

### Completed Recommended Task

Task D6 - Visit Completion Mobile Sticky Progress

Completed direction:

- improve mobile orientation in Visit Completion,
- keep desktop workflow stepper stable,
- make progress and current step visible during mobile scrolling.

### Completed Recommended Task

Task 40E Follow-up - Authenticated Browser Persistence Smoke and UX Polish

Completed direction:

- expand the authenticated browser smoke so Visit Completion explicitly saves
  a draft, refreshes, reloads the draft, completes the visit, and verifies the
  completed visit in patient timeline/detail context,
- polish existing persistence-state feedback only,
- keep the route-based guided Visit Completion workflow,
- keep patient context above the stepper and preserve the existing mobile
  sticky progress/bottom action behavior,
- keep autosave, billing, materials, attachments, payment handling, and
  treatment-plan mutation out of scope.

### Completed Recommended Task

Task 41 - Appointments to Visit Completion Handoff Polish

Completed direction:

- clarify the Appointment Detail Start visit handoff,
- keep appointment context visible above Visit Completion progress/stepper,
- load appointment-scoped open drafts when Visit Completion starts from an
  appointment,
- keep Save Draft explicit and Complete Visit responsible for marking the
  linked appointment completed,
- add post-completion navigation to patient timeline, appointment detail, and
  daily schedule,
- preserve the route-based workflow and avoid schema expansion.

### Completed Recommended Task

Task 42 - Completed Visit Record and Timeline Clinical Polish

Completed direction:

- polish completed visit timeline cards as clinical records,
- polish completed visit detail sections for overview, procedures, note,
  recommendation, next step, appointment/source context, and metadata,
- improve loading/empty/error/no-procedure/no-note states,
- surface completed-by provider when readable,
- expand smoke coverage for the completed visit card and detail display,
- keep billing, payments, materials, attachments, and treatment-plan mutation
  out of scope.

### Completed Recommended Task

Task 43 - Appointment Lifecycle and Daily Schedule Polish

Completed direction:

- use existing appointment status plus linked visit records to show lifecycle
  state,
- distinguish ready-to-start, visit-in-progress, completed, cancelled, and
  no-show where supported by current data,
- make daily schedule cards context-aware with Start visit, Continue visit, and
  View visit actions,
- add Appointment Detail lifecycle messaging,
- document unsupported lifecycle gaps such as assigned provider, arrived,
  in-room, and richer clinical queue states,
- keep schema, billing, materials, attachments, payments, and treatment-plan
  mutation out of scope.

### Completed Recommended Task

Task 44 - Follow-up / Next Visit Recommendation Flow

Completed direction:

- use existing Visit Completion recommendation and next-step fields as a
  read-only follow-up signal,
- surface follow-up on completed visit timeline cards,
- add completed visit detail follow-up guidance,
- surface linked visit follow-up on completed appointment detail and completed
  daily schedule cards,
- keep the existing patient overview follow-up summary,
- avoid automatic appointment creation, treatment-plan mutation, reminders,
  billing, materials, payments, and attachments.

### Completed Recommended Task

Task 74 - Performed Services Service Layer

Completed direction:

- added typed catalog and performed-service service functions,
- added active service catalog reads,
- added visit-scoped performed-service reads,
- added performed-service draft creation,
- added narrow draft replacement and finalization methods,
- reused the existing assignable-provider read path for credited provider
  options,
- kept UI, Visit Completion integration, ledger, payment, commission, materials,
  and treatment-plan mutation out of scope.

### Next Recommended Task

Task 75 - Visit Completion Performed Services UI Slice Planning / Finalization Review

Completed direction:

- reviewed Task 73 schema/RLS, Task 74 service behavior, and current Visit
  Completion flow,
- confirmed the Task 74 service layer is usable for UI wiring,
- documented that clinical completion and performed-service finalization are
  not atomic and need explicit failure handling in the UI task,
- chose a separate `Services & Charges` step before Review,
- defined MVP fields as catalog service, quantity, unit price, credited
  provider, optional tooth/region, and calculated total,
- deferred discount, treatment-plan item linking, procedure linking, payment,
  ledger, commission, material, and completed-surface display,
- documented role behavior for owner/admin, doctor, specialist, reception,
  assistant, and inventory.

### Next Recommended Task

Task 76 - Performed Services Completion / Finalization Safety Foundation

Completed direction:

- added structured performed-service finalization state helpers,
- added retry-safe finalization for completed visits,
- preserved valid no-service completion behavior,
- made unresolved completed-visit draft rows explicit through
  `finalization_required`,
- kept already finalized rows idempotent on retry,
- extended performed-services RLS/data smoke coverage for finalization safety,
- kept UI, ledger, payments, commissions, treatment-plan mutation, and material
  usage out of scope.

### Next Recommended Task

Task 77 - Visit Completion Services & Charges Draft UI

Completed direction:

- added the `Services & Charges` step before Review,
- wired active service catalog options and credited provider options for
  authorized financial clinical roles,
- allowed draft performed-service rows with catalog snapshot, quantity,
  editable unit price, calculated line amount, credited provider, and optional
  tooth/region,
- saved performed-service drafts after clinical draft save and reloaded them
  when reopening an open Visit Completion flow,
- added a Review summary with draft service rows and draft total,
- preserved zero-service completion flow without fake rows,
- kept finalization, completed visit display, ledger, payments, invoices,
  commissions, materials, and treatment-plan mutation out of scope.

### Next Recommended Task

Task 78 - Visit Completion Performed Services Finalization Wiring

Completed direction:

- called retry-safe performed-service finalization after successful clinical
  Visit Completion,
- preserved the clinical completion success state when later services/charges
  finalization fails,
- surfaced finalized, no-services, retry-required, and blocked finalization
  states in the completed success screen,
- added a retry action that finalizes performed services without re-running
  clinical completion,
- kept no-service visits valid without fake performed-service rows,
- verified retry does not duplicate service rows,
- kept completed visit detail, patient timeline, patient overview, ledger,
  payments, invoices, commissions, materials, and treatment-plan mutation out of
  scope.

### Next Recommended Task

Task 79 - Patient Ledger Foundation Planning / Data Model Decision

Completed direction:

- audited the existing performed-services, completed-visit, treatment-plan,
  appointment, provider attribution, and RLS boundaries,
- confirmed no patient ledger, payment, invoice, receipt, refund, write-off, or
  balance schema/runtime exists yet,
- compared direct performed-service-as-ledger charges against a dedicated
  ledger transaction model,
- selected a separate patient-ledger layer as the future accounting source of
  truth,
- kept finalized `performed_services` as the visit-linked source for rendered
  chargeable work,
- recommended patient-scoped ledger entries first, deferring separate
  `patient_accounts` until family/shared-payer complexity is real,
- recommended idempotent charge posting from finalized performed services,
- documented payment, adjustment, reversal, balance, RLS, and future UI
  principles,
- made no runtime, schema, RLS, service, UI, browser smoke, or RLS test changes.

### Next Recommended Task

Task 80 - Patient Ledger Schema/RLS Foundation

Completed direction:

- added `patient_ledger_entries` as the first patient-scoped accounting entry
  table,
- used positive `amount` plus explicit `direction` where debit increases
  patient balance and credit reduces it,
- constrained future-ready entry types for charges, payments, discounts,
  write-offs, refunds, adjustments, and reversals,
- kept `performed_services` separate as the rendered-service source and allowed
  future charge entries to reference finalized performed services,
- added integrity validation for same-clinic patient, visit, appointment,
  performed-service, reversal reference, and recorded/created-by profile
  context,
- prevented duplicate posted charge entries for the same performed service,
- enabled conservative ledger RLS with same-clinic read access for
  `owner_admin`, `doctor`, `specialist`, and `reception_admin`,
- kept `assistant` and `inventory_responsible` blocked from ledger rows,
- added no authenticated direct insert/update/delete ledger policies,
- added focused patient-ledger RLS/data smoke coverage,
- kept posting, Visit Completion wiring, ledger UI, payments, balances,
  invoices/receipts, commissions, materials, and treatment-plan conversion out
  of scope.

### Next Recommended Task

Task 81 - Patient Ledger Service Layer / Idempotent Charge Posting from
Finalized Performed Services.

Completed direction:

- added controlled RPCs for checking and posting ledger charge entries from
  finalized performed services on completed visits,
- kept ledger mutation server-side and did not add authenticated direct
  insert/update/delete policies,
- posted one debit `charge` entry per eligible finalized performed service
  using trusted service snapshots,
- made posting retry-safe and partial-posting-safe,
- kept zero-service visits non-erroring with no fake ledger rows,
- limited posting to `owner_admin`, `doctor`, and `specialist`; kept
  `reception_admin`, `assistant`, and `inventory_responsible` from posting,
- added a typed frontend service wrapper without wiring Visit Completion UI,
- added focused posting/RLS smoke coverage.

### Next Recommended Task

Task 82 - Visit Completion Ledger Posting Wiring / Post-completion Charge
Posting Failure Handling

Completed direction:

- wire the Task 81 posting helper after performed-services finalization in Visit
  Completion,
- preserve clinical completion and performed-service finalization even if ledger
  posting later needs retry,
- add completed-state UI messaging for posted, no-services, posting-required,
  and blocked ledger posting states,
- keep finalization retry and charge-posting retry as separate actions,
- verify zero-service completion creates no fake ledger charge rows,
- verify forced ledger posting failure can be retried without duplicates,
- keep payments, balances, invoices/receipts, refunds/discounts/write-offs,
  commissions, materials, and treatment-plan conversion out of scope.

### Next Recommended Task

Task 83 - Completed Visit Financial Read-only Display / Posted Charge Visibility

Completed direction:

- show finalized performed-service and posted ledger-charge linkage on completed
  visit detail as read-only financial context,
- keep amounts as snapshots and avoid editable balance/payment behavior,
- surface whether charges are posted without adding patient-wide account UI yet,
- show posted charge total only for the completed visit, not patient balance,
- preserve blocked-role boundaries without breaking completed clinical detail,
- keep payments, invoices/receipts, refunds/discounts/write-offs, commissions,
  materials, and treatment-plan conversion out of scope.

### Next Recommended Task

Task 84 - Patient Account Read-only Ledger / Balance Summary Planning

Completed direction:

- confirmed that the schema can represent future payments and credits, but
  normal runtime behavior currently creates only posted `charge` debit entries,
- decided not to display patient `Balance`, `Amount due`, `Outstanding`, paid
  status, invoices, or receipts before payment/credit recording exists,
- selected a restrained patient Full Record `Charges` section as the first
  patient-level financial surface,
- defined the next MVP as read-only posted charge activity recorded in DentApp,
  with optional per-currency posted-charge totals that are not balance,
- preserved ledger read roles for `owner_admin`, `doctor`, `specialist`, and
  `reception_admin`, while blocked roles should not see the financial section,
- kept payment recording, invoices/receipts, refunds/discounts/write-offs,
  commissions, materials, and treatment-plan conversion out of scope.

### Next Recommended Task

Task 85 - Patient Posted Charges Read-only Section / Account Activity Visibility

Completed direction:

- added a patient Full Record `Charges` section for authorized financial
  readers,
- shows posted `charge` ledger entries for the patient as read-only activity,
- includes posted date, description snapshot, amount, currency, and completed
  visit navigation where the role can open completed visit detail,
- avoids patient balance, amount due, paid/unpaid, invoice, receipt, and payment
  terminology in the section,
- groups posted-charge totals by currency and labels them as posted charges,
- omits the section for roles that cannot read ledger financial rows,
- keeps posting retry, payments, corrections, and financial mutations out of
  scope.

### Next Recommended Task

Task 86 - Payment Recording Foundation Planning / Data Model Decision

Completed direction:

- selected a dedicated future `patient_payments` entity plus linked
  `patient_ledger_entries` payment credit rows,
- defined payment methods as an initial constrained set: `cash`, `card`,
  `bank_transfer`, and `other`,
- selected patient-scoped unallocated payments for MVP; charge/payment
  allocation remains deferred,
- defined reversal-based correction principles rather than destructive payment
  edits or ledger deletion,
- recommended `owner_admin` and `reception_admin` as initial payment-recording
  roles through a controlled pathway,
- kept patient balance, amount due, paid/unpaid status, receipts, invoices,
  refunds, discounts/write-offs, commissions, materials, and treatment-plan
  conversion out of scope.

### Next Recommended Task

Task 87 - Payment Schema/RLS Foundation

Completed direction:

- added the future `patient_payments` table,
- constrained positive amount, three-letter currency, payment method, status,
  same-clinic patient scope, and payment-recorder profiles,
- selected `cash`, `card`, `bank_transfer`, and `other` as the initial payment
  methods,
- added `posted` and `reversed` status foundation without adding reversal
  workflow,
- prepared `patient_ledger_entries.patient_payment_id` for future linked posted
  payment credit entries,
- added uniqueness to prevent duplicate posted payment credits for one payment,
- added conservative same-clinic read policies and no authenticated direct
  insert/update/delete policies,
- preserved existing ledger charge and posted-charges behavior,
- kept payment UI, balance, receipts, invoices, refunds, allocation,
  commissions, materials, and treatment-plan conversion out of scope.

### Next Recommended Task

Task 88 - Payment Service Layer / Controlled Recording and Reversal Boundary

Suggested direction:

- add a controlled payment-recording RPC/service pathway for `owner_admin` and
  `reception_admin`,
- create `patient_payments` rows and linked ledger `payment` credit rows using
  trusted server-side values,
- make payment recording idempotent and retry-safe,
- define the first safe reversal boundary or explicitly defer reversal workflow,
- keep payment UI, balance, invoices/receipts, refunds, allocation, commissions,
  materials, and treatment-plan conversion out of scope.

### Superseded Recommended Task

Task 90 - Patient Account Activity + Record Payment UI

Superseded by Task 90 - Optional Internal Settlement Records / Privacy & Access
Decision.

Corrected direction:

- do not expose patient account activity or payment UI as the next runtime task,
- treat any future settlement-record capability as optional per clinic and
  disabled by default,
- do not position DentApp as fiscalization, cash register, accounting,
  invoicing, receipt, tax-reporting, or official payment-processing software,
- use safer future terminology around internal settlement records, not account
  activity, record payment, balance, amount due, outstanding, or paid/unpaid,
- require explicit future capabilities such as
  `can_view_internal_settlement_records` and
  `can_manage_internal_settlement_records`,
- review existing ledger/payment schema, RLS, RPCs, services, naming, and role
  assumptions before any settlement-related UI is exposed.

### Next Recommended Task

Task 91 - Internal Settlement Feature Toggle / Access-Control and Existing
Backend Review

Suggested direction:

- define clinic-level optional module enablement and default-disabled behavior,
- define explicit internal settlement view/manage access capabilities,
- review existing ledger/payment schema, RLS, RPCs, and frontend service
  exposure against the new internal-settlement boundary,
- decide what must be hidden, renamed, wrapped, restricted, or left backend-only,
- keep runtime UI, payment forms, account activity displays, balance, invoice,
  receipt, refund, allocation, and fiscal integration out of scope.

### Next Recommended Task

Task 92 - Existing Financial Visibility and Automatic Posting Freeze/Gating

Suggested direction:

- freeze or gate existing Visit Completion ledger charge posting before it runs
  in ordinary workflows without clinic opt-in,
- hide or gate Completed Visit Detail `Services & charges` financial visibility,
- hide or gate Patient Full Record `Charges` / `Posted charges` visibility,
- preserve clinical completion, performed-services finalization, completed visit
  clinical detail, patient clinical records, appointments, and treatment-plan
  behavior,
- do not add payment/settlement forms, account activity, balance, invoice,
  receipt, refund, allocation, or fiscal integration,
- leave existing backend tables/RPCs in place unless a narrow safety fix is
  required.

### Completed Recommended Task

Task 92 - Existing Financial Visibility and Automatic Posting Freeze/Gating

Completed direction:

- removed ordinary Visit Completion `Services & Charges` exposure,
- stopped performed-service finalization and ledger charge posting from ordinary
  clinical completion,
- hid Completed Visit Detail and Patient Full Record financial sections,
- removed ordinary patient demo balance placeholders and Payments navigation,
- added an interim migration blocking ordinary authenticated access to
  `performed_services`, `patient_ledger_entries`, `patient_payments`, and the
  related ledger/payment RPCs,
- preserved existing backend objects and historical rows for future review.

### Next Recommended Task

Task 93 - Internal Settlement Feature Toggle and Explicit Permission
Schema/RLS Foundation

Suggested direction:

- add disabled-by-default clinic enablement for internal settlement records,
- add explicit view/manage capabilities that are separate from ordinary clinic
  roles,
- keep settlement UI, balance, payment forms, invoice/receipt behavior, and
  fiscal integration out of scope,
- preserve clinical-only runtime behavior until explicit access exists.

### Completed Recommended Task

Task 53 - Restore Appointment Lifecycle Secondary Actions

Completed direction:

- restored explicit `Cancel appointment` and `Mark no-show` labels for existing
  supported appointment status transitions,
- kept lifecycle changes in secondary action menus so they do not compete with
  `Start visit`, `Continue visit`, or `View visit`,
- hid destructive lifecycle actions once an appointment has an open or completed
  linked Visit Completion record,
- expanded browser smoke coverage for scheduled, in-progress, and completed
  lifecycle action visibility,
- kept schema, provider assignment, check-in/room states, autosave, billing,
  attachments, treatment-plan mutation, reminders, and tasks out of scope.

### Completed Recommended Task

Task 54 - Appointment Lifecycle State Transition Hardening

Completed direction:

- centralized secondary lifecycle eligibility around scheduled appointments with
  no linked open or completed Visit Completion record,
- guarded `updateAppointmentStatus` so direct appointment lifecycle writes only
  support `cancelled` and `no_show`,
- kept `completed` appointment status tied to linked Visit Completion
  completion,
- removed manual `Complete` from appointment status menus,
- kept cancel/no-show as secondary actions and verified they disappear after
  transition,
- expanded browser smoke coverage for cancel, no-show, linked draft, completed,
  and existing Visit Completion happy-path behavior,
- avoided schema changes, new lifecycle states, provider assignment, check-in
  states, autosave, billing, attachments, reminders, tasks, and broad redesign.

### Completed Recommended Task

Task 55 - Appointment Lifecycle Service/Test Cleanup

Completed direction:

- kept appointment lifecycle behavior unchanged,
- centralized lifecycle unavailable/success copy in the appointment service,
- kept `canUpdateAppointmentLifecycle` as the shared eligibility helper,
- reused shared lifecycle copy in Appointment Detail, Appointments page, and
  Patient Appointment Summary,
- cleaned browser smoke appointment card/menu helpers to reduce duplicated DOM
  selectors and repeated card-state assertions,
- preserved smoke coverage for scheduled, cancel, no-show, linked draft,
  completed, and Visit Completion happy-path behavior,
- avoided schema changes, new lifecycle states, provider assignment, check-in
  states, autosave, billing, attachments, reminders, tasks, and broad redesign.

### Completed Recommended Task

Task 56 - Treatment Plan Detail Read-only Polish

Completed direction:

- polish the patient full-record treatment plan section as a read-only clinical
  planning reference,
- show plan title, status, created date, planned item count, proposed total,
  planned items, item status, and item notes where available,
- align overview, quick action, and detail wording around `Treatment Plan` and
  `View treatment plan`,
- improve loading, empty, error, and no-items states,
- keep Visit Completion, billing, materials, attachments, reminders, provider
  assignment, and automatic treatment-plan mutation out of scope.

### Completed Recommended Task

Task 57 - Treatment Plan Data/RLS Smoke Coverage Review

Completed direction:

- review treatment plan schema and RLS read boundaries,
- harden treatment plan item RLS so item access must match the parent
  treatment plan clinic and patient,
- add focused treatment plan read RLS smoke coverage for in-clinic roles,
  inventory denial, out-of-clinic denial, and mismatched parent item denial,
- keep browser smoke treatment plan entry-point coverage and verify mutation
  controls are absent,
- keep treatment-plan mutation, Visit Completion conversion, billing, materials,
  attachments, reminders, provider assignment, fake treatment plans, and broad
  UI redesign out of scope.

### Completed Recommended Task

Task 95 - MVP UI/UX Restyling Foundation Planning

Completed direction:

- defined the first in-clinic pilot flow around scheduling, planner use,
  reception progression, clinical visit work, treatment-plan creation/use, and
  next-appointment scheduling;
- audited the current source and docs for appointment scheduling, schedule
  cards, appointment detail, patient workflow entry points, operational state,
  Visit Completion, completed visit review, treatment-plan surfaces, and routes;
- confirmed appointment scheduling, planner display, reception state, clinical
  Visit Completion, completed visit review, and rebooking have functional
  foundations;
- identified treatment-plan creation/editing UI as the main pilot-critical
  functional blocker because current patient treatment-plan surfaces are
  read-only and the top-level Treatment Plans route is a placeholder;
- classified work into `Pilot-critical`, `Pilot usability / restyling`, and
  `Post-pilot or deferred`;
- recommended Task 96 as treatment-plan create/edit pilot workflow before broad
  visual restyling;
- preserved the Task 92-94 settlement/payment/ledger deferral boundary.

### Completed Recommended Task

Task 96 - Treatment Plan Creation/Edit Pilot Workflow Finalization

Completed direction:

- inspected treatment-plan migrations, RLS policies, service methods, tests,
  Patient Detail surfaces, Visit Completion, completed visit review, route
  access, and prior treatment-plan design docs;
- confirmed treatment-plan tables, treatment-plan item tables, write service
  methods, audit calls, and CRUD/RLS test coverage already exist;
- confirmed the runtime treatment-plan UI remains read-only and the top-level
  Treatment Plans route is still a placeholder;
- identified a plan-level RLS hardening gap: treatment-plan insert/update checks
  clinic and role, but should also prove the referenced patient belongs to the
  same clinic before mutation UI is exposed;
- selected Patient Detail / Full Record treatment-plan section as the first
  pilot mutation UI location;
- required the pilot UI to hide/ignore `proposed_total`, `estimated_price`, and
  service-code fields so treatment plans remain clinical planning records;
- kept Visit Completion separate from treatment-plan mutation and preserved the
  settlement/payment/ledger deferral boundary.

### Next Recommended Task

Task 97 - Treatment Plan Mutation Schema/RLS Hardening

Completed direction:

- verified the Task 96 plan-level gap against actual migrations, RLS policies,
  service methods, CRUD/RLS snippets, and treatment-plan read-only docs;
- added `20260526100000_harden_treatment_plan_mutation_scope.sql`;
- hardened plan mutation so treatment plans must reference a non-deleted
  same-clinic patient;
- prevented treatment-plan `clinic_id` and `patient_id` reassignment;
- prevented further normal mutation after plan soft archive;
- added trigger-level item scope enforcement so items must remain aligned with a
  non-deleted parent plan and cannot reassign parent, clinic, or patient;
- preserved clinical writer mutation roles and assistant/reception read-only
  behavior;
- added `testTreatmentPlanMutationRls.mjs` for focused mutation and integrity
  coverage;
- added no Treatment Plan UI, prices, settlement, payment, ledger, Visit
  Completion conversion, materials, reminders, or reports.

### Completed Recommended Task

Task 98 - Patient Treatment Plan Creation/Edit UI

Completed direction:

- wired the existing treatment-plan service methods into Patient Detail /
  TreatmentPlansSection;
- exposed patient-scoped create/edit/archive controls to `owner_admin`,
  `doctor`, and `specialist`;
- kept assistant and reception treatment-plan access read-only;
- kept `inventory_responsible` blocked through existing treatment-plan RLS;
- hid legacy amount/service-code fields from the pilot UI;
- added browser smoke coverage for plan create, item create, reload
  persistence, plan edit, item edit, and finance-term absence;
- preserved settlement/payment/ledger deferral and kept Visit Completion
  mutation out of scope.

### Next Recommended Task

Task 99 - Planner and Appointment Card Pilot UI/UX Restyling

Suggested direction:

- improve daily/weekly schedule scanning, appointment-card hierarchy, provider
  and operational-state readability, and primary clinical actions;
- preserve existing scheduling, provider assignment, operational-state,
  appointment lifecycle, Visit Completion, and treatment-plan behavior;
- avoid broad Patient Detail or Visit Completion redesign in this specific
  planner/card pass.

### Completed Recommended Task

Task 99 - Planner and Appointment Card Pilot UI/UX Restyling

Completed direction:

- restyled the Appointments page as a clearer pilot Planner workspace;
- grouped view/date/provider/refresh controls into one planner toolbar while
  preserving provider URL persistence and filter semantics;
- restyled daily and weekly appointment cards around time, patient, provider,
  operational/lifecycle status, and next action hierarchy;
- kept reception progression visible and kept safe corrections plus
  cancel/no-show actions in the existing secondary menu;
- added browser smoke assertions for the planner toolbar and card semantic
  regions, and added 768 px tablet coverage to responsive overflow checks;
- verified build, lint, browser smoke, and the appointment/provider/visit/
  treatment-plan/internal-settlement RLS guard set.

### Next Recommended Task

Task 100 - Patient Detail Clinical Workflow Entry UI/UX Restyling

Suggested direction:

- improve the patient-context entry points into today's appointment, Visit
  Completion, treatment-plan work, timeline review, and rebooking;
- keep the work focused on patient workflow clarity, not a broad app redesign;
- keep settlement, payment, ledger, balance, invoice, receipt, and fiscal scope
  deferred.

### Completed Recommended Task

Task 94 - Internal Settlement Post-MVP Deferral / MVP Roadmap Refocus

Completed direction:

- confirmed internal settlement records are not an MVP feature,
- retained the Task 92/93 safe baseline as authoritative,
- kept the Task 93 setting/grant foundation inactive from product usage,
- deferred settlement record-model, RPC, UI, reporting, balance, payment,
  correction, export, invoice, receipt, and fiscal work until after MVP,
- redirected the active roadmap back to clinical MVP readiness and UI/UX
  restyling planning.

### Completed Recommended Task

Task 93 - Internal Settlement Feature Toggle and Explicit Permission Foundation

Completed direction:

- added clinic-level disabled-by-default internal settlement settings;
- added explicit same-clinic profile grants for future view/manage eligibility;
- limited settings and grant administration to active same-clinic
  `owner_admin` users;
- kept owner configuration authority separate from future record access;
- added helper functions for future eligibility evaluation only;
- kept frozen ledger/payment/performed-service access and posting/payment RPC
  access untouched;
- added focused RLS coverage and design documentation;
- added no settlement UI, routes, payment forms, balances, posting behavior,
  invoices, receipts, exports, or reports.

Task 58 - Provider Assignment Planning / Data Model Decision

Completed direction:

- reviewed current profile, appointment, visit, service, UI, and RLS surfaces
  for provider-related data,
- confirmed appointments do not currently have a provider/assignee field,
- confirmed `visits.completed_by` records actual completion identity and should
  remain separate from appointment assignment,
- recommended nullable `appointments.assigned_provider_id` as the next minimal
  schema field,
- recommended `public.profiles(id)` as the FK target with same-clinic, active
  doctor/specialist enforcement,
- documented provider-profile read-path, RLS, UI, and test requirements for the
  implementation task,
- kept schema changes, provider assignment behavior, check-in states, billing,
  materials, treatment-plan mutation, reminders, provider workload calendar,
  automatic assignment, fake provider data, and broad scheduling redesign out of
  scope.

### Completed Recommended Task

Task 59 - Appointment Provider Assignment Schema/RLS Foundation

Completed direction:

- added nullable `appointments.assigned_provider_id`,
- added FK to `public.profiles(id)` with `on delete set null`,
- added provider schedule index on clinic, assigned provider, and scheduled
  start,
- enforced provider assignment through both appointment RLS `with check` logic
  and a database trigger,
- allowed null assignment plus active same-clinic doctor/specialist profiles,
- blocked cross-clinic, inactive, suspended, and non-provider profile
  assignment,
- added focused provider-assignment RLS smoke coverage,
- verified changing appointment assignment does not change `visits.completed_by`,
- left provider assignment UI, provider display read path, automatic assignment,
  workload calendar, check-in states, billing, materials, treatment-plan
  mutation, reminders, and broad scheduling redesign out of scope.

### Completed Recommended Task

Task 60 - Appointment Provider Assignment Service/UI Wiring

Completed direction:

- added a narrow assignable-provider RPC instead of broad profile reads,
- wired `assigned_provider_id` into appointment service reads and writes,
- added assignable provider loading for appointment dropdowns,
- added optional provider selection to patient appointment creation,
- added provider-only assignment editing on Appointment Detail,
- displayed assigned provider in appointment cards, appointment detail, patient
  appointment summary, schedule views, and Visit Completion appointment context,
- kept assigned provider separate from completed visit `completed_by`,
- expanded provider RLS/read-path and browser smoke coverage,
- kept automatic assignment, provider workload calendar, availability conflict
  checking, check-in states, billing, materials, treatment-plan mutation,
  reminders, broad profile RLS opening, and broad scheduling redesign out of
  scope.

### Completed Recommended Task

Task 61 - Provider Assignment UX/Test Cleanup + Appointment Menu Label Polish

Completed direction:

- centralized assigned-provider display fallback copy,
- aligned appointment provider wording around `Assigned provider`, `Not
  assigned`, and `Provider unavailable`,
- kept completed visit metadata separate from assigned provider wording,
- shortened the appointment card secondary menu label from `Cancel appointment`
  to `Cancel`,
- kept fuller cancellation copy where space allows, including Appointment Detail
  and success feedback,
- updated browser smoke assertions for provider wording and card menu label,
- preserved provider dropdown, provider selection, appointment lifecycle,
  Visit Completion, follow-up, and treatment-plan smoke coverage,
- added no new provider functionality, schema, RLS, workload calendar,
  availability checks, automatic assignment, check-in states, billing,
  materials, treatment-plan mutation, reminders, or broad scheduling redesign.

### Completed Recommended Task

Task 62 - Appointment Provider Filter / Daily Schedule Polish

Completed direction:

- added an Appointments schedule `Assigned provider` filter with `All
  providers`, `Unassigned`, and active same-clinic assignable providers from
  the existing RPC,
- kept filtering client-side against the loaded appointment range,
- added clear empty states for filtered provider/unassigned schedules,
- preserved appointment lifecycle, Visit Completion behavior, and the
  separation between `appointments.assigned_provider_id` and
  `visits.completed_by`,
- expanded browser smoke coverage for provider filtering plus existing
  lifecycle actions,
- added no schema, migration, RLS, workload calendar, availability checking,
  automatic assignment, check-in state, billing/materials/payments,
  treatment-plan mutation, reminders, tasks, or broad redesign.

### Completed Recommended Task

Task 63 - Appointment Schedule Filter UI Cleanup / Persistence Polish

Completed direction:

- consolidated Appointments schedule controls into one responsive filter bar,
- kept provider filtering client-side against the loaded schedule,
- persisted provider filter state in the `provider` URL search param,
- restored valid provider filters from shared/opened URLs,
- safely rendered invalid provider params as `All providers`,
- updated browser smoke coverage for URL updates, deep-link restore, invalid
  fallback, visible list filtering, and existing lifecycle actions,
- added no schema, migrations, RLS, lifecycle behavior, Visit Completion
  behavior, workload calendar, availability logic, automatic assignment,
  check-in states, billing/materials/payments, treatment-plan mutation,
  reminders, tasks, or broad scheduling redesign.

### Completed Recommended Task

Task 64 - Appointment Schedule Compact Density / Mobile Readability Pass

Completed direction:

- tightened Appointments schedule filter bar spacing without changing controls,
- improved daily and weekly schedule spacing consistency,
- used compact appointment cards in weekly schedule sections,
- refined appointment card hierarchy around time, patient, status, assigned
  provider, reason/type, live state, and actions,
- preserved provider filtering, provider URL params, lifecycle actions, Visit
  Completion handoff, and appointment detail navigation,
- added no schema, migrations, RLS, lifecycle changes, availability logic,
  workload calendar, automatic assignment, check-in states,
  billing/materials/payments, treatment-plan mutation, reminders, tasks, or
  broad redesign.

### Completed Recommended Task

Task 64B - Fix Appointments Responsive Overflow Regression

Completed direction:

- fixed the Appointments mobile/tablet horizontal overflow regression found in
  visual QA after Task 64,
- added containment to the page wrapper, schedule card, filter bar, daily list,
  weekly list, weekly day sections, and appointment cards,
- allowed filter shortcut buttons and card status/action rows to wrap instead
  of forcing wide layout,
- bounded the appointment action menu width to the viewport,
- removed nowrap pressure from the assigned-provider card label,
- verified daily and weekly Appointments views at 390px, 430px, 912px, and
  desktop widths with no horizontal document/body overflow,
- preserved provider filtering, provider URL params, lifecycle actions, Visit
  Completion handoff, appointment detail navigation, schema, RLS, and
  scheduling business logic.

### Completed Recommended Task

Task 65 - Responsive Overflow Smoke Guard

Completed direction:

- added reusable browser-smoke helpers for responsive overflow checks,
- checked document/body horizontal overflow with a 2px tolerance,
- ran the guard at 390px, 430px, 912px, and 1440px widths,
- covered Appointments daily, Appointments weekly, Patient overview, Patient
  timeline, Appointment detail, Visit Completion, and completed visit detail,
- made failures report screen label, viewport width, document widths, body
  widths, and tolerance,
- reused the existing authenticated browser smoke session and fixtures,
- changed no product behavior, schema, migrations, RLS, provider workload,
  availability logic, or appointment states.

### Completed Recommended Task

Task 66 - Appointment Card Dropdown Anchoring / Mobile Menu Fix

Completed direction:

- made AppointmentCard menu triggers card-relative and fixed in the upper-right
  corner,
- reserved header/status space so time, patient, and badges do not overlap the
  fixed trigger,
- kept status badges and metadata wrapping independently from the trigger,
- kept the opened menu viewport-bounded on narrow screens,
- expanded responsive browser smoke coverage to open a scheduled appointment
  card menu at 390px, 430px, 500px, 912px, and 1440px,
- verified opening the menu does not create horizontal overflow and the menu
  remains inside the viewport,
- preserved Cancel / Mark no-show behavior, provider filtering, provider URL
  params, Visit Completion handoff, appointment detail navigation, schema, RLS,
  and lifecycle rules.

### Completed Recommended Task

Task 67 - Appointment Operational State Planning / Data Model Decision

Completed direction:

- documented that appointment lifecycle `status` should remain limited to
  `scheduled`, `completed`, `cancelled`, and `no_show`,
- recommended modeling day-of-visit clinic progression separately from
  appointment lifecycle status,
- recommended MVP operational states of `not_arrived`, `arrived`, and
  `ready_for_doctor`,
- recommended a future `appointments.operational_state` text field with a check
  constraint and dedicated service/RLS validation,
- documented transition rules, role/RLS implications, UI impact, smoke/RLS test
  plan, and phased implementation tasks,
- changed no runtime behavior.

### Completed Recommended Task

Task 68 - Appointment Operational State Schema/RLS Foundation

Completed direction:

- added `appointments.operational_state` with default `not_arrived`,
- constrained operational values to `not_arrived`, `arrived`, and
  `ready_for_doctor`,
- kept appointment lifecycle status, provider assignment, and Visit Completion
  attribution separate,
- enforced allowed operational transitions at the database boundary,
- prevented new appointment inserts from starting in a progressed operational
  state,
- blocked operational updates for cancelled, no-show, completed, and linked
  Visit Completion appointments,
- preserved existing appointment RLS role/clinic boundaries,
- added focused operational state RLS/data smoke coverage,
- added no visible UI controls or Start visit readiness requirement.

### Completed Recommended Task

Task 69 - Appointment Operational State Service/UI Wiring

Completed direction:

- hydrated `appointments.operational_state` in the appointment service,
- added a focused operational state update method for forward UI transitions,
- showed operational state badges on daily cards and Appointment Detail,
- added daily-card and detail actions for `Mark arrived` and
  `Ready for doctor`,
- hid operational actions for cancelled, no-show, completed, and linked Visit
  Completion appointments,
- preserved Start visit, Continue visit, View visit, Cancel, Mark no-show,
  provider assignment/filtering, Visit Completion persistence, and responsive
  menu/overflow behavior,
- expanded browser smoke coverage for the operational progression workflow.

### Completed Recommended Task

Task 70 - Appointment Operational State Context Visibility

Completed direction:

- reused the same operational labels across context surfaces,
- showed operational state in the patient appointment summary as display-only
  compact appointment card context,
- showed scheduled appointment operational state in the Patient Today / Active
  Workflow panel,
- showed linked scheduled appointment operational state in Visit Completion
  context,
- kept assigned provider separate from operational state and `visits.completed_by`,
- added no patient-summary, patient-overview, or Visit Completion operational
  mutation controls,
- preserved Start/Continue/View Visit and lifecycle behavior,
- expanded browser smoke coverage for the new display-only visibility.

### Completed Recommended Task

Task 71 - Appointment Operational State Correction

Completed direction:

- exposed a safe one-step correction path for eligible active appointments,
- kept correction secondary to the normal forward operational workflow,
- added `Undo arrival` for `arrived` appointments,
- added `Move back to arrived` for `ready_for_doctor` appointments,
- did not add patient-summary, Patient Today, or Visit Completion mutation
  controls,
- preserved lifecycle status, provider assignment, Visit Completion state, and
  `visits.completed_by` separation,
- added RLS/data smoke coverage for allowed corrections and blocked direct,
  terminal, Visit Completion-linked, inventory, and cross-clinic updates,
- added browser smoke coverage for correction flow, restored forward
  progression, hidden ineligible correction actions, and correction menu
  overflow stability.

### Later Appointment Direction

Task 43D - Calendar View Foundation

Suggested direction:

- create basic day/week calendar views,
- do not yet build advanced calendar views.

### Completed Recommended Task

Task 102 - In-Clinic Pilot Workflow Walkthrough / UI Consistency and Blocking Defect Audit

Completed direction:

- walked the current first in-clinic pilot path from scheduling through
  reception, Patient Detail, Visit Completion, treatment-plan mutation, and
  rebooking;
- confirmed the pilot-critical surfaces are coherent enough for guided in-clinic
  testing;
- confirmed no blocking workflow, responsive, permissions, persistence, or
  finance-freeze regression was found;
- kept Task 102 as an audit/documentation checkpoint without runtime changes.

### Next Recommended Task

Task 103 - Guided In-Clinic Pilot Session Checklist and Observation Log Setup

Suggested direction:

- prepare a short guided pilot checklist for staff and doctor use,
- prepare an observation log template for blockers, hesitation points, and
  wording issues,
- keep the next step focused on pilot execution readiness rather than new
  feature development.

### Completed Recommended Task

Task 103 - Patient Workspace Information Architecture & Compact Clinical Design System Plan

Completed direction:

- confirmed Task 102 functional readiness remains valid;
- recorded the product-owner decision to run one compact Patient Workspace and
  design-system refinement phase before the first serious guided doctor pilot;
- defined the target patient information architecture, action system,
  badge/status reduction, Treatment Plan structure, Timeline structure, shortcut
  reduction, and odontogram boundary;
- split the redesign into focused follow-up tasks rather than one broad refactor.

### Next Recommended Task

Task 104 - Compact Clinical UI Primitives / Action and Status System

Suggested direction:

- reduce button and badge density across shared primitives;
- introduce the compact back-navigation and overflow-action language;
- prepare the shared UI foundation required before Patient Workspace
  restructuring.










