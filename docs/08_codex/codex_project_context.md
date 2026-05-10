# DentApp — Codex Project Context

## 1. Project Summary

DentApp is a dental practice management application.

The initial goal is to build an internal operational system for one real dental practice with multiple doctors. The pilot practice will be used to validate workflows, test usability, and identify real-world requirements before commercializing the product as a SaaS platform.

DentApp is not intended to be only a calendar or patient database. Its main value should come from connecting the full daily workflow of a dental practice:

- patients,
- patient records,
- odontogram,
- treatment plans,
- appointments,
- performed services,
- payments,
- unpaid balances,
- doctor commission,
- inventory,
- material requests,
- audit logs.

The product should help the practice know at any moment:

- what was agreed with the patient,
- what was planned,
- what was performed,
- what was paid,
- what remains unpaid,
- who performed the work,
- what belongs to each doctor,
- what materials are available,
- what materials are missing,
- what needs to happen next.

---

## 2. Initial Target User

The initial target customer is:

A single dental practice in Serbia with multiple doctors, shared patients, shared materials, manual internal scheduling, and a need for better control over treatment plans, patient records, payments, doctor commissions, and inventory.

The application is initially for internal use only.

Patient portal, online booking, and automated patient communication are future features and are not part of the first MVP.

---

## 3. Initial Market

Primary market:

- Serbia

Secondary future market:

- Western Balkans region
- International market after validation

The product must be designed with Serbian/regional dental workflows in mind, especially:

- paper/digital patient records,
- treatment plans often kept informally,
- installment payments,
- unpaid balances,
- doctors working on percentage,
- shared responsibility for materials,
- need for practical printable documentation.

---

## 4. Technology Stack

Initial stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security
- React Hook Form
- Zod
- TanStack Query
- Recharts
- FullCalendar or equivalent calendar library

The stack may evolve later, but the pilot should stay focused and avoid unnecessary backend complexity.

---

## 5. Architecture Principle

The pilot serves one practice, but the system must be designed as multi-tenant ready from the beginning.

Most important business tables should include a `clinic_id` or equivalent ownership field.

Do not hardcode data specific to the pilot practice unless explicitly instructed.

Configurable items should include:

- doctors,
- users,
- roles,
- services,
- prices,
- commission rules,
- material categories,
- inventory items,
- appointment types,
- document templates,
- permissions.

---

## 6. Core MVP Modules

The initial MVP should include:

1. Authentication and user roles
2. Clinic/practice settings
3. Staff and doctors
4. Patients
5. Digital patient record
6. Anamnesis and important medical notes
7. Odontogram
8. Treatment plans
9. Services and price list
10. Appointments and internal scheduling
11. Visits and performed services
12. Patient ledger
13. Payments, debts, installments, and advances
14. Doctor commission rules
15. Doctor commission reporting
16. Inventory items
17. Inventory movements
18. Material requests
19. Basic reports
20. PDF/print export
21. Audit log

---

## 7. Out of Scope for Initial MVP

Do not implement the following unless explicitly approved:

- patient portal,
- online patient booking,
- SMS/Viber/WhatsApp automation,
- full accounting system,
- fiscalization integration,
- multi-location support,
- advanced marketing campaigns,
- dental laboratory portal,
- native mobile apps,
- AI diagnosis,
- clinical decision-making automation.

---

## 8. Security and Compliance Mindset

DentApp handles sensitive health and financial data.

From the beginning, the application must consider:

- authentication,
- role-based access control,
- row-level security,
- audit logs,
- secure file storage,
- export/print support,
- backup and recovery,
- protection of patient data,
- restricted access to financial data,
- restricted access to doctor commission data.

Never store real patient data in the repository.

Never use real patient data in seed files, examples, tests, screenshots, or documentation.

Use only fake/demo/anonymized data during development.

---

## 9. Development Principle

Build in small, controlled phases.

Before implementing a feature:

1. Read relevant documentation.
2. Confirm the current phase.
3. Check `docs/07_execution/todo.md`.
4. Check `docs/07_execution/progress.md`.
5. Implement only the requested scope.
6. Update documentation if behavior or structure changes.
7. Update progress after completing the task.

Avoid large unrequested refactors.

Avoid adding features that were not requested.

Avoid introducing dependencies without a clear reason.

---

## 10. UX Principle

Dental staff are busy. The app must reduce friction.

Every screen should be designed around real workflows.

Important UX goals:

- fast patient search,
- clear daily schedule,
- quick access to patient history,
- clear treatment plan status,
- visible unpaid balance,
- visible next step,
- easy recording of performed services,
- simple payment entry,
- simple material request workflow,
- responsive design for desktop, tablet, and mobile.

---

## 11. Product North Star

DentApp must help the practice answer quickly:

- Who is scheduled today?
- What is the next step for this patient?
- What treatment plan was agreed?
- What has already been performed?
- What remains to be done?
- How much does the patient owe?
- Which doctor performed which work?
- How much belongs to each doctor?
- Which materials are running low?
- Who requested or approved material purchase?
- What happened during the last visit?
