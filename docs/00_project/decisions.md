# DentApp — Decisions Log

This document records important project decisions.

Each decision should include:

- date,
- decision,
- reason,
- impact,
- status.

Status examples:

- Proposed
- Accepted
- Rejected
- Revisit later

---

## Decision 001 — Project Working Name

Date: 2026-05-10

Decision:

Use `DentApp` as the working project name.

Reason:

The name is simple, clear, and suitable for internal planning.

Impact:

All documentation and initial project folders will use the DentApp name.

Status: Accepted

---

## Decision 002 — Initial Target Customer

Date: 2026-05-10

Decision:

The initial target customer is one dental practice with multiple doctors.

Reason:

This model is common in Serbia and regionally, and the founder has access to a real pilot practice with this structure.

Impact:

The MVP will focus on internal workflows for a multi-doctor practice, not solo practice only and not large multi-location clinics.

Status: Accepted

---

## Decision 003 — Pilot-First Approach

Date: 2026-05-10

Decision:

Build the first version as a pilot/custom solution for a real dental practice, while keeping architecture SaaS-ready.

Reason:

Real workflow validation is critical for this product. The pilot reduces product risk and helps discover real requirements.

Impact:

The first version will be tested in a real environment, but the product should avoid hardcoded pilot-specific logic.

Status: Accepted

---

## Decision 004 — Initial Use Is Internal Only

Date: 2026-05-10

Decision:

The first version will be for internal practice use only.

Reason:

The core workflow must be validated before adding patient-facing complexity.

Impact:

Patient portal, online booking, and automated patient communication are excluded from initial MVP.

Status: Accepted

---

## Decision 005 — Initial Stack

Date: 2026-05-10

Decision:

Use React + Vite + TypeScript + Supabase for the pilot.

Reason:

This stack allows fast development, good developer experience, and enough backend capability for an MVP through PostgreSQL, Auth, Storage, and RLS.

Impact:

The initial project was created as a Vite React TypeScript project.

Status: Accepted

---

## Decision 006 — Markdown as Primary Documentation Format

Date: 2026-05-10

Decision:

Use Markdown as the primary project documentation format.

Reason:

Markdown is easy for Codex/Cursor to read, easy to version-control, and easy to maintain in GitHub.

Impact:

Project documentation is stored under `docs/` as `.md` files.

Status: Accepted

---

## Decision 007 — Dedicated Codex Documentation Folder

Date: 2026-05-10

Decision:

Create a dedicated `docs/08_codex/` folder.

Reason:

Codex/Cursor need concise and clear project context, rules, templates, and instructions.

Impact:

The project includes dedicated Codex context, rules, task template, review checklist, and prompt library files.

Status: Accepted

---

## Decision 008 — Multi-Tenant Ready From Day One

Date: 2026-05-10

Decision:

Even though the pilot is for one practice, the architecture should be multi-tenant ready.

Reason:

The long-term goal is SaaS commercialization.

Impact:

Core data models should include `clinic_id` or equivalent ownership fields where appropriate.

Status: Accepted

---

## Decision 009 — No Real Patient Data in Repository

Date: 2026-05-10

Decision:

Real patient data must never be stored in GitHub, documentation, seed files, tests, or screenshots.

Reason:

DentApp handles sensitive health and financial data.

Impact:

Only fake, demo, or anonymized data may be used during development and documentation.

Status: Accepted

---

## Decision 010 — Coding Starts After Foundation Documentation

Date: 2026-05-10

Decision:

Do not start application feature coding until the initial foundation documentation is completed.

Reason:

The risk of building the wrong workflow is higher than the risk of slow initial coding.

Impact:

The current phase focuses on product vision, project charter, Codex rules, MVP scope, discovery, and architecture documents.

Status: Accepted

---

## Decision 011 — Tailwind CSS Vite Plugin Setup

Date: 2026-05-10

Decision:

Use Tailwind CSS through the official Vite plugin package, `@tailwindcss/vite`, with `@import "tailwindcss";` in the main CSS entry file.

Reason:

This matches the current Tailwind setup path for Vite projects and keeps styling configuration simple for the Phase 1 foundation.

Impact:

`vite.config.ts` includes the Tailwind plugin, and Tailwind utility classes are available throughout the React app.

Status: Accepted

---

## Decision 012 — React Router for MVP Routing

Date: 2026-05-10

Decision:

Use `react-router-dom` for DentApp MVP frontend routing.

Reason:

React Router is a standard routing option for React applications and fits the Phase 1 need for simple route-based placeholder pages before app shell, permissions, and data loading are introduced.

Impact:

Initial route paths are centralized in `src/routes/routePaths.ts`, route composition lives in `src/routes/AppRoutes.tsx`, and `src/App.tsx` renders the router through `BrowserRouter`.

Status: Accepted

---

## Decision 013 — Custom Phase 1 App Shell

Date: 2026-05-10

Decision:

Use a simple custom Tailwind-based app shell for Phase 1 before introducing any external UI component library.

Reason:

The current foundation only needs stable layout, navigation, and page structure. A custom shell avoids premature dependency and design system commitments while keeping the interface aligned with DentApp's healthcare/business UX direction.

Impact:

`AppShell`, `SidebarNav`, and `TopBar` live under `src/layouts/`, while reusable page layout primitives live under `src/components/layout/`. Main routes render inside the shell, and `/login` remains outside it until real authentication is implemented.

Status: Accepted

---

## Decision 014 — Custom Tailwind UI Components First

Date: 2026-05-10

Decision:

Use simple custom Tailwind-based shared UI components during Phase 1 before evaluating external UI libraries.

Reason:

DentApp currently needs only a small reusable foundation for buttons, cards, badges, and basic feedback states. Custom components keep the dependency surface small and allow the visual language to follow the product's healthcare/business direction before committing to a larger UI library.

Impact:

Initial shared UI components live under `src/components/ui/` and are exported from `src/components/ui/index.ts`. A small local `classNames` helper is used instead of adding a class name utility dependency.

Status: Accepted

---

## Decision 015 — Temporary Demo Role for Phase 1 Navigation

Date: 2026-05-10

Decision:

Use a hardcoded temporary demo role, `owner_admin`, for Phase 1 navigation filtering until real authentication and user profiles are implemented.

Reason:

The app shell needs to be prepared for role-aware navigation without introducing Supabase Auth, protected routes, or permission enforcement before their scoped implementation tasks.

Impact:

The demo role is centralized in `src/lib/demoAuth.ts`, navigation visibility rules live in `src/routes/navigationConfig.ts`, and `SidebarNav` filters items by the current demo role. This is frontend-only UX scaffolding and is not security enforcement.

Status: Accepted

---

## Decision 016 — Frontend Demo Patient Data Before Supabase Integration

Date: 2026-05-10

Decision:

Start Phase 2 Patients work with frontend-only fake demo patient data before connecting Supabase or creating real patient records.

Reason:

The patient list UI, search behavior, and app shell integration can be validated safely before database schema, RLS, authentication, and patient record permissions are implemented.

Impact:

Demo patient types and fake records live under `src/features/patients/`. These records must remain obviously fictional and must be replaced by Supabase-backed data only in a future scoped task.

Status: Accepted

---

## Decision 017 — Read-Only Demo Patient Profile First

Date: 2026-05-10

Decision:

Start patient profile work with a read-only demo detail page that uses the existing fake patient dataset.

Reason:

The profile overview structure can be validated before patient create/edit flows, medical record editing, permissions, Supabase queries, and audit behavior are implemented.

Impact:

`/patients/:patientId` renders a demo-only profile from local fake data. Unknown demo patient IDs are handled with a clear empty state. Real persistence, protected routes, and patient modification workflows remain future scoped tasks.

Status: Accepted

---

## Decision 018 — Read-Only Demo Patient Record Sections Before Editing

Date: 2026-05-10

Decision:

Add patient record sections as read-only demo profile cards before implementing editing, document upload, timeline logic, or Supabase persistence.

Reason:

The patient profile needs a stable information structure before introducing sensitive medical record editing, permission enforcement, audit logging, and database-backed workflows.

Impact:

The demo patient type includes frontend-only summary fields for clinical summary, warnings, anamnesis, dental history, treatment plan context, visit context, documents placeholder, and timeline placeholder. These fields remain fake/demo-only and must be replaced by permission-aware backend data in future scoped tasks.

Status: Accepted

---

## Decision 019 — Frontend-Only Patient Form Foundation Before Persistence

Date: 2026-05-10

Decision:

Start patient create/edit work with controlled frontend-only forms that do not persist data.

Reason:

DentApp needs to validate patient data-entry layout and workflow before adding validation libraries, Supabase persistence, permission enforcement, RLS, and audit behavior for sensitive patient changes.

Impact:

`/patients/new` and `/patients/:patientId/edit` render form foundations. Edit mode is prefilled from fake demo data. Submitting shows a demo-only message and does not mutate demo data, write to localStorage, or call a backend.

Status: Accepted

---

## Decision 020 — Custom Patient Form Validation During Demo Phase

Date: 2026-05-10

Decision:

Use simple custom TypeScript validation for the frontend-only PatientForm during the demo foundation phase.

Reason:

The current task only needs basic required-field, email, and date checks. Adding React Hook Form or Zod before real persistence, API/service contracts, and full validation rules are scoped would add unnecessary dependency and abstraction cost.

Impact:

Patient form validation lives in `src/features/patients/patientFormValidation.ts`. This can be replaced or expanded later when real persistence, server-side validation, and production validation requirements are implemented.

Status: Accepted

---

## Decision 021 — Plan Patient Persistence Before Supabase CRUD

Date: 2026-05-10

Decision:

Plan patient persistence, RLS assumptions, audit requirements, and migration structure before implementing Supabase CRUD for patients.

Reason:

Patient data is sensitive clinical and personal data. The project needs clear table boundaries, role assumptions, audit expectations, and field mapping before real persistence is introduced.

Impact:

`docs/05_technical/patient_persistence_plan.md` defines the proposed patient persistence direction. No Supabase client, SQL migration, RLS policies, or real saves are implemented until future scoped tasks.

Status: Accepted

---

## Decision 022 — Initial Patient Migration Foundation

Date: 2026-05-10

Decision:

Create the first patient migration with minimal `clinics` and `profiles` foundation tables, enable RLS on the new tables, defer detailed RLS policies to a dedicated migration, and keep future `clinical_notes` references as nullable UUID fields until related tables exist.

Reason:

Patient tables require `clinic_id` for multi-tenant scoping and profile references for future audit ownership. Creating the minimal foundation keeps the migration executable without introducing the full future schema. Deferring policies avoids unsafe broad access before auth/profile helper functions are finalized.

Impact:

The initial migration can create `patients`, `patient_medical_records`, and `clinical_notes` coherently. Future migrations must expand auth/profile behavior, add RLS helper functions and policies, and replace nullable future-reference UUIDs with foreign keys after visits and treatment plan tables are introduced.

Status: Accepted

---

## Decision 023 — Patient Migration Review Result

Date: 2026-05-10

Decision:

Approve the initial patient migration for local or development Supabase execution in a future scoped task, without adding RLS policies in the same migration.

Reason:

The migration order, foreign key dependencies, table constraints, timestamps, triggers, indexes, and RLS enablement were reviewed and found suitable for a clean Supabase project. Keeping detailed RLS policies separate preserves reviewability and avoids introducing broad access rules before helper functions and role behavior are finalized.

Impact:

The next database task can run the reviewed migration in a local or development Supabase environment. A dedicated follow-up migration is still required for RLS helper functions and patient access policies before frontend CRUD or real patient persistence is enabled.

Status: Accepted

---

## Decision 024 — Local Supabase Migration Validation

Date: 2026-05-10

Decision:

Use local Supabase with Docker Desktop and WSL2 support to validate database migrations before remote development or production use.

Reason:

Patient data tables, RLS enablement, and future policy changes should be verified in an isolated local environment before they are applied to shared or production Supabase projects.

Impact:

Database migrations should be checked locally with Supabase CLI flows such as `npx.cmd supabase start` and `npx.cmd supabase db reset` before remote use. The `supabase/seed.sql` warning is acceptable until seed data is intentionally created.

Status: Accepted

---

## Decision 025 — Initial Patient RLS Policy Scope

Date: 2026-05-10

Decision:

Use active-profile, clinic-scoped, role-based RLS policies for the first patient persistence foundation. For MVP simplicity, doctors and specialists may read patient-related records clinic-wide until assignment-based access relationships exist. Inventory responsible users have no patient access by default. Patient-related hard deletes are not allowed through RLS policies.

Reason:

The current schema has clinics, profiles, patients, patient medical records, and clinical notes, but it does not yet have appointments, visits, treatment plans, or assignment tables that can safely define relevant-patient access. A conservative clinic-and-role policy keeps patient data protected while avoiding premature assignment logic.

Impact:

Future migrations may narrow doctor and specialist access to assigned patients or cases after the required relationship tables exist. Patient removal should use archive or soft-delete workflows, not hard deletes. Inventory-related patient visibility must be explicitly designed later if material usage requires limited patient references.

Status: Accepted

---

## Decision 026 — Initial Audit Log Access And Write Strategy

Date: 2026-05-10

Decision:

Create `audit_logs` as an append-only table. Initially, only `owner_admin` users can read audit logs for their own clinic. Direct authenticated insert access is deferred until patient persistence has a controlled audit write path through the service layer, a validated security-definer function, narrowly scoped triggers, or a hybrid approach.

Reason:

Audit logs are high-sensitivity records and should be trustworthy. Allowing broad client-side insert, update, or delete access before the patient service layer exists could create misleading, incomplete, or mutable audit history.

Impact:

The initial audit migration creates the table, indexes, RLS, and owner/admin read policy only. Future patient persistence work must explicitly implement audit writes for patient create, update, archive/restore, medical record update, and clinical note actions before real patient mutations are enabled.

Status: Accepted

---

## Decision 027 — Centralized Frontend Supabase Client

Date: 2026-05-10

Decision:

Centralize the browser Supabase client in `src/lib/supabaseClient.ts` and use only frontend-safe Vite environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Reason:

Supabase access should be created once and reused through future service-layer code instead of scattering client construction through UI components. The frontend bundle can safely use the anon key with RLS, but must never include a service role key.

Impact:

Future data-access code should import the centralized `supabase` client from `src/lib/supabaseClient.ts`. Service role keys must remain server-side only and must not be added to `.env.example`, frontend code, or Vite variables.

Status: Accepted

---

## Decision 028 — Local Frontend Supabase Environment

Date: 2026-05-10

Decision:

Store local frontend Supabase configuration in `.env.local`, which is ignored by Git. The frontend uses only the local Supabase Project URL and browser-safe Publishable/anon key. Secret or service-role style keys must never be used in browser code or committed documentation.

Reason:

Local frontend connection testing needs real local Supabase values, but those values should stay outside version control. Browser access must rely on the public anon/publishable key plus RLS, not privileged credentials.

Impact:

Developers should create local env values in `.env.local` for local testing. `.env.example` remains limited to variable names only. Future connection tests and service-layer work must continue using the centralized frontend client and must not introduce service role keys into frontend code.

Status: Accepted

---

## Decision 029 — Patient Service Boundary Before Supabase Reads

Date: 2026-05-10

Decision:

Patient pages should access patient data through `src/features/patients/patientService.ts` before switching from demo data to Supabase-backed data.

Reason:

The Patients module needs a stable data-access boundary so UI pages are not coupled directly to raw demo data or future Supabase query details. This keeps the current demo behavior intact while making the later Supabase migration smaller and easier to review.

Impact:

`PatientsPage`, `PatientDetailPage`, and `PatientEditPage` should call patient service functions. The service remains demo-backed until a future scoped task replaces its internals with Supabase reads and later mutations.

Status: Accepted
