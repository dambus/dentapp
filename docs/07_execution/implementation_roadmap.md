# DentApp — Implementation Roadmap

## 1. Purpose

This document defines the initial implementation roadmap for DentApp.

The roadmap is organized into controlled phases so the project can move from documentation to implementation without losing direction.

The goal is to build a serious MVP step by step, while keeping scope, architecture, UX, and security under control.

---

## 2. Roadmap Principles

Implementation should follow these principles:

- build foundation before features,
- keep phases small and reviewable,
- avoid scope creep,
- do not implement patient portal or online booking in MVP,
- keep multi-tenant readiness from the beginning,
- use fake/demo data until production pilot,
- update documentation after each phase,
- test each phase before moving forward,
- keep Codex/Cursor tasks specific and limited.

---

## 3. Phase Overview

Initial roadmap phases:

1. Phase 1 — App Foundation
2. Phase 2 — Patients and Patient Records
3. Phase 3 — Odontogram and Treatment Plans
4. Phase 4 — Calendar, Appointments, Visits, and Performed Services
5. Phase 5 — Payments and Patient Ledger
6. Phase 6 — Doctor Commissions
7. Phase 7 — Inventory and Material Requests
8. Phase 8 — Reports, Print, Audit, and Pilot Stabilization

---

## 4. Phase 1 — App Foundation

### Goal

Create the technical and UI foundation for the application.

### Main Work

- install and configure Tailwind CSS,
- set up base folder structure,
- create app shell,
- create layout components,
- create navigation,
- create placeholder pages,
- create basic routing,
- create initial UI components,
- create demo role/navigation structure,
- confirm build works.

### Main Screens

- login placeholder,
- dashboard placeholder,
- calendar placeholder,
- patients placeholder,
- treatment plans placeholder,
- payments placeholder,
- commissions placeholder,
- inventory placeholder,
- reports placeholder,
- settings placeholder.

### Acceptance Criteria

Phase 1 is complete when:

- app runs locally,
- Tailwind works,
- basic layout exists,
- navigation exists,
- placeholder pages exist,
- project folder structure is clean,
- no real data is used,
- progress documentation is updated.

---

## 5. Phase 2 — Patients and Patient Records

### Goal

Create the first real operational patient module.

### Main Work

- patient list,
- patient search,
- patient profile,
- patient overview,
- patient create/edit form,
- basic patient record sections,
- medical warnings,
- patient timeline placeholder,
- fake/demo data first,
- later Supabase integration.

### Main Screens

- patient list,
- patient profile,
- patient overview,
- patient record,
- patient create/edit form.

### Acceptance Criteria

Phase 2 is complete when:

- users can view demo patients,
- users can open patient profile,
- patient overview shows key information,
- patient record structure exists,
- UI is responsive,
- no real data is used.

---

## 6. Phase 3 — Odontogram and Treatment Plans

### Goal

Build the core clinical planning workflow.

### Main Work

- simple odontogram model and UI,
- tooth status display,
- treatment plan list,
- treatment plan detail,
- treatment plan items,
- treatment plan statuses,
- connection between patient and treatment plan,
- connection between treatment plan item and tooth/region.

### Main Screens

- patient odontogram,
- treatment plan list,
- treatment plan detail,
- treatment plan item form,
- printable treatment plan view later.

### Acceptance Criteria

Phase 3 is complete when:

- treatment plans can be viewed and structured,
- treatment plan items have status,
- items can connect to tooth/region,
- patient profile shows active treatment plan,
- simple odontogram is usable.

---

## 7. Phase 4 — Calendar, Appointments, Visits, and Performed Services

### Goal

Support the daily operational workflow of the practice.

### Main Work

- internal calendar,
- appointment list/calendar view,
- appointment create/edit form,
- appointment statuses,
- visit creation,
- performed services,
- connection to treatment plan items,
- next step note.

### Main Screens

- calendar,
- appointment detail,
- appointment form,
- visit detail,
- visit form,
- performed service form.

### Acceptance Criteria

Phase 4 is complete when:

- appointments can be viewed,
- appointments have statuses,
- visits can be recorded,
- performed services can be connected to patients/doctors,
- patient timeline reflects appointments/visits.

---

## 8. Phase 5 — Pilot Clinical Flow Readiness and UI/UX Restyling

### Goal

Prepare the first realistic in-clinic pilot workflow before adding more domain
surface area.

Task 94 confirms that optional internal settlement records are deferred until
after MVP. The active MVP roadmap should return to clinical product readiness
and structured UI/UX restyling.

Task 95 narrows the first testable milestone to appointment scheduling,
planner/schedule display, patient reception progression, clinical visit work,
treatment-plan creation/use, and next-appointment scheduling.

### Main Work

- implement the missing treatment-plan create/edit pilot workflow,
- harden treatment-plan write RLS before exposing mutation UI,
- restyle the pilot-critical planner, appointment card, reception action,
  patient detail, Visit Completion, completed visit, treatment-plan, and
  rebooking surfaces,
- align shared layout, navigation, spacing, list, card, form, and action
  patterns around the pilot flow,
- preserve existing clinical behavior while improving usability,
- keep settlement/payment/ledger work outside the MVP stream.

### Main Screens

- dashboard,
- appointments and schedule views,
- appointment detail,
- patient list and patient detail,
- Visit Completion,
- completed visit detail,
- treatment-plan patient surfaces.

### Acceptance Criteria

Phase 5 is complete when:

- treatment plans can be created/edited well enough for pilot use,
- pilot-critical screen priority is implemented or explicitly accepted as
  sufficient for first clinic testing,
- visual and interaction patterns are documented before implementation,
- existing clinical smoke coverage remains the regression guard,
- no settlement/payment/ledger UI or workflow is reintroduced.

---

## 9. Phase 6 — Doctor Commissions

### Goal

Support doctors and specialists working on percentage.

### Main Work

- commission rules,
- commission calculation model,
- performed-based commission,
- collected-based commission later if needed,
- doctor work report,
- owner commission report,
- payout tracking.

### Main Screens

- commission rules,
- doctor commission report,
- doctor own work report if enabled,
- payout screen.

### Acceptance Criteria

Phase 6 is complete when:

- doctor commission rules can be configured,
- commission entries can be calculated,
- owner can review doctor commissions,
- doctors can see own report if enabled,
- commission data is restricted.

---

## 10. Phase 7 — Inventory and Material Requests

### Goal

Improve inventory visibility and material responsibility.

### Main Work

- inventory list,
- inventory item detail,
- stock movement,
- stock correction,
- low stock indicators,
- material requests,
- approval flow,
- suppliers.

### Main Screens

- inventory list,
- inventory item detail,
- stock movement form,
- material request list,
- material request form,
- low stock report.

### Acceptance Criteria

Phase 7 is complete when:

- materials can be tracked,
- stock movements can be recorded,
- low stock is visible,
- users can create material requests,
- authorized users can approve/reject requests.

---

## 11. Phase 8 — Reports, Print, Audit, and Pilot Stabilization

### Goal

Prepare the MVP for pilot use.

### Main Work

- key reports,
- print views,
- initial audit log implementation,
- role review,
- RLS review,
- data cleanup,
- pilot feedback fixes,
- usability improvements,
- production pilot checklist.

### Main Screens

## Current Sequencing Note - Pilot Clinical Flow

Task 94 defers internal settlement records until after MVP. Task 93 remains only
an inactive authorization foundation for a possible future optional clinic
capability.

Task 95 refocuses the active stream on the first in-clinic pilot flow. The next
active tasks should be:

1. `Task 96 - Treatment Plan Creation/Edit Pilot Workflow Finalization`
2. `Task 97 - Treatment Plan Mutation Schema/RLS Hardening`
3. `Task 98 - Patient Treatment Plan Creation/Edit UI`
4. `Task 99 - Planner and Appointment Card Pilot UI/UX Restyling`
5. `Task 100 - Patient Detail Pilot Workflow Entry Restyling`
6. `Task 101 - Visit Completion and Completed Visit Pilot Usability Pass`
7. `Task 102 - Pilot Clinical Flow Validation Checkpoint`

Do not expose settlement UI or reconnect frozen ledger/payment/performed-service
flows in the MVP stream.

---

- reports,
- print views,
- audit log,
- admin review screens.

### Acceptance Criteria

Phase 8 is complete when:

- pilot users can test the main workflow,
- key reports exist,
- print/export basics exist,
- audit log covers sensitive actions,
- major UX issues are resolved,
- production pilot readiness is reviewed.

---

## 12. Implementation Order Within Each Phase

Each phase should follow this order:

1. Review relevant documentation.
2. Define exact scope.
3. Create Codex task.
4. Implement small slice.
5. Test locally.
6. Review against checklist.
7. Update progress.
8. Add follow-up tasks if needed.
9. Move to next slice.

---

## 13. Definition of Done

A task is done when:

- requested functionality works,
- app builds successfully,
- UI is responsive where applicable,
- no real patient data is used,
- scope was not expanded without approval,
- relevant documentation was updated,
- progress.md was updated,
- todo.md was updated if needed.

---

## 14. Current Status

Current status:

- Phase 1 app foundation is complete,
- Phase 2 patient and record foundations are deep into implementation,
- patient persistence, authentication, current profile loading, route guards,
  RLS helpers, audit log foundation, and patient CRUD are implemented,
- medical record, clinical notes, odontogram foundation, treatment-plan
  read-only foundation, patient timeline, and completed visit review exist,
- appointment scheduling, daily/weekly schedule, appointment detail, lifecycle
  hardening, provider assignment, provider filtering, and responsive smoke
  coverage exist,
- Visit Completion supports draft/completed persistence and appointment
  completion handoff,
- appointment operational state exists separately from lifecycle status with
  `not_arrived`, `arrived`, and `ready_for_doctor`,
- Task 98 implements the patient-scoped treatment-plan creation/editing UI, so
  treatment-plan mutation is no longer the main pilot-critical functional gap,
- Task 96 confirms treatment-plan tables, item tables, service write methods,
  and CRUD/RLS test coverage already exist, but plan-level write RLS needs
  same-clinic patient hardening before UI exposure,
- Task 97 hardens treatment-plan plan/item mutation scope before Patient Detail
  write UI exposure,
- Task 98 validates treatment-plan create/edit/item persistence through
  authenticated browser smoke coverage,
- Checkpoint B rebalanced the next roadmap around performed services before
  ledger and commissions.

Next step:

- Task 99 - Planner and Appointment Card Pilot UI/UX Restyling.

---

## 15. Open Implementation Questions

- Which pilot restyling task should run immediately after treatment-plan writes
  are validated?
- Is pilot commission performed-based, collected-based, or mixed?
- Should treatment-plan items be updated from performed services automatically
  or only by explicit user action?
