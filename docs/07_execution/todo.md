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
- [ ] Define key user workflows

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
- [ ] Define main user flows
- [x] Define design system direction
- [x] Define component inventory

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
  - [x] Task 26: Implement patient medical record edit flow
  - [x] Task 27: Implement patient archive/restore flow
  - [x] Task 28: Implement clinical notes CRUD
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
- [x] Implement clinical notes CRUD
- [ ] Implement odontogram foundation
- [ ] Implement treatment plan foundation
- [ ] Define visit workflow before visit-linked clinical notes
- [ ] Refine clinical note filtering and history behavior
- [ ] Refine archived patient filters/search behavior if pilot workflow needs more than the simple include-archived toggle










