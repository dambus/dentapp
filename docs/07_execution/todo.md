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
- [ ] Define product roadmap
- [ ] Define feature backlog
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
- [ ] Task 69 - Appointment Operational State Service Wiring
- [ ] Checkpoint B - Product Roadmap Re-balance
- [ ] Price/discount/debt workflow
- [ ] Doctor commission workflow
- [ ] Refine treatment plan UX and filtering
- [ ] Plan performed services foundation
- [ ] Plan payment/ledger foundation

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

### Next Recommended Task

Checkpoint B - Product Roadmap Re-balance

Suggested direction:

- review the current product/design implementation phase,
- rebalance upcoming work after D1-D6,
- decide whether scheduling, patient detail IA, or visit workflow polish should come next.

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

### Later Appointment Direction

Task 43D - Calendar View Foundation

Suggested direction:

- create basic day/week calendar views,
- do not yet build advanced calendar views.










