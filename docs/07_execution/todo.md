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
  - [ ] Task 15: Test patient CRUD with fake/demo database data
  - [ ] Task 16: Implement audit logging for patient create/update/archive flows
  - [x] Task 17: Configure local `.env.local` values for local Supabase connection testing
  - [ ] Task 18: Create fake/demo database seed data for safe local CRUD testing
  - [ ] Task 19: Test authenticated RLS behavior with demo users and roles
  - [ ] Task 20: Implement Supabase-backed patient reads behind the patient service
  - [ ] Task 21: Implement patient create/update with audit logging
- [ ] Phase 3: Odontogram and treatment plans
- [ ] Phase 4: Scheduling and visits
- [ ] Phase 5: Payments and patient ledger
- [ ] Phase 6: Doctor commissions
- [ ] Phase 7: Inventory and material requests
- [ ] Phase 8: Pilot testing and stabilization

---

## 10. Current Immediate Next Tasks

- [x] Fill `docs/00_project/product_vision.md`
- [x] Fill `docs/00_project/project_charter.md`
- [x] Fill `docs/00_project/decisions.md`
- [x] Fill `docs/00_project/open_questions.md`
- [x] Fill `docs/08_codex/codex_task_template.md`
- [x] Fill `docs/08_codex/codex_review_checklist.md`
- [x] Add patient RLS helper functions and policies
- [x] Create audit log schema and strategy
- [x] Configure Supabase client
- [x] Configure local `.env.local` values for local Supabase
- [x] Create patient service abstraction
- [x] Test Supabase connection safely without real patient data
- [ ] Create fake/demo database seed data for safe local CRUD testing
- [ ] Test authenticated RLS behavior with demo users and roles
- [ ] Implement Supabase-backed patient reads behind the patient service
- [ ] Implement audit logging for patient create/update/archive flows later
- [ ] Test patient CRUD with fake/demo database data later










