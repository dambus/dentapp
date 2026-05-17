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
  - [x] Task D1: Design System Icon & Action Pattern
  - [x] Task D2: Appointment Card Redesign
  - [x] Task D3: Appointment Type & 15-Min Duration Standardization
  - [x] Task D5: Patient Detail Mobile Navigation Redesign
  - [x] Task D6: Visit Completion Mobile Sticky Progress
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
- [x] Task D1 - Design System Icon & Action Pattern
- [x] Task D2 - Appointment Card Redesign
- [x] Task D3 - Appointment Type & 15-Min Duration Standardization
- [x] Task D5 - Patient Detail Mobile Navigation Redesign
- [x] Task D6 - Visit Completion Mobile Sticky Progress
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

### Next Recommended Task

Checkpoint B - Product Roadmap Re-balance

Suggested direction:

- review the current product/design implementation phase,
- rebalance upcoming work after D1-D6,
- decide whether scheduling, patient detail IA, or visit workflow polish should come next.

### Later Appointment Direction

Task 43D - Calendar View Foundation

Suggested direction:

- create basic day/week calendar views,
- do not yet build advanced calendar views.










