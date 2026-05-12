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

---

## Decision 030 — Local Seed Data Must Be Fake-Only

Date: 2026-05-11

Decision:

Use fake/demo-only records in `supabase/seed.sql` for local database development and RLS testing preparation. Do not include real patient data.

Reason:

DentApp is healthcare-related and must avoid any real personal or medical data in local development fixtures, repository history, and documentation.

Impact:

Local database reset seeds only fictional clinic and patient-domain records. Auth/profile seeding tied to `auth.users` remains a separate future task for authenticated RLS flow testing.

Status: Accepted

---

## Decision 031 — Local RLS Testing Uses Fake Auth Users And Profiles

Date: 2026-05-11

Decision:

For local RLS validation, use fake local Supabase Auth users and matching `profiles` records linked to the demo clinic, then run authenticated role-based checks through the local Supabase API.

Reason:

RLS logic depends on `auth.uid()` and profile role/clinic lookup. Authenticated API checks with fake users provide reliable role behavior verification without introducing real identities or production data.

Impact:

Local testing uses fake users such as `owner.demo@example.test` and other role equivalents. This validates current patient and audit visibility policies before connecting frontend patient reads to Supabase. Frontend auth UI remains out of scope.

Status: Accepted

---

## Decision 032 — Patient Data Source Defaults To Demo With Opt-In Supabase Reads

Date: 2026-05-11

Decision:

Use a patient data source boundary in `patientService` with `VITE_PATIENT_DATA_SOURCE=demo|supabase`. Default to `demo` when unset, and enable Supabase-backed reads only when explicitly set to `supabase`.

Reason:

Current app scope does not include login/auth UI yet, while patient table access is protected by RLS and authenticated session requirements. Demo default avoids breaking current pages and keeps safe local workflow continuity.

Impact:

Patient list/detail/edit pages continue to work in demo mode by default. Supabase read paths are implemented and can be tested in controlled local environments. When Supabase mode is enabled but no authenticated browser session exists, patientService safely falls back to demo data.

Status: Accepted

---

## Decision 033 — Basic Login/Logout Before Protected Routes

Date: 2026-05-11

Decision:

Implement basic Supabase Auth login/logout UI before introducing protected routes and full profile/role-based route guards.

Reason:

The team needs a simple browser-authenticated session flow first so local RLS-backed reads can be tested safely with fake demo users. This reduces integration risk by validating session handling before route protection complexity is introduced.

Impact:

`/login` now supports `signInWithPassword` for local demo users and app chrome can show signed-in/signed-out session state with logout. Protected routes remain deferred, and profile/role loading from `profiles` is a follow-up task.

Status: Accepted

---

## Decision 034 — Profile Role Is Primary Chrome Role Source

Date: 2026-05-11

Decision:

Use the authenticated Supabase `profiles.role` as the primary role source for app chrome behavior (top bar role display and sidebar navigation filtering), with temporary fallback to the demo role when session/profile is unavailable.

Reason:

Role-aware navigation should reflect authenticated profile permissions as early as possible, but the app still needs safe behavior during signed-out state, initial auth/profile loading, and local setup gaps.

Impact:

Profile loading is centralized through a shared hook used by `AppShell` and passed to chrome components. This avoids duplicate profile requests and keeps role behavior consistent across top bar and sidebar while protected routes remain a later task.

Status: Accepted

---

## Decision 035 — Protected Routes Require Auth Session And Active Profile

Date: 2026-05-11

Decision:

Main application routes require both an authenticated Supabase session and an active DentApp profile. Signed-out users are redirected to `/login`. Signed-in users without an active profile see a clear ProfileRequiredPage instead of accessing app features.

Reason:

The pilot application is for internal use only and all features require a valid profile/role context. Protecting both auth and profile ensures users cannot access incomplete states or features without proper setup.

Impact:

A ProtectedRoute wrapper guards all routes inside the app shell. Loading states show while checking auth/profile. Login page redirects already-signed-in users to dashboard for better UX. Fine-grained role-specific route guards are deferred to a later phase.

Status: Accepted

---

## Decision 036 — Resolve Browser Supabase Read Gap Before Patient Writes

Date: 2026-05-11

Decision:

Before implementing patient create/update writes, first diagnose and fix the browser Supabase-mode patient read gap where owner session shows `0` patients in UI despite authenticated RLS script reads succeeding.

Reason:

Patient writes should be built on a verified end-to-end authenticated read baseline. Resolving this mismatch first reduces risk and avoids compounding service/write diagnostics with unresolved read-path behavior.

Impact:

Near-term execution order is: (1) read-path diagnosis/fix, (2) controlled audit insert strategy/RPC, (3) patient write service implementation, and (4) form-to-write integration. Fine-grained role-specific route guards remain a later, optional hardening step.

Status: Accepted

---

## Decision 037 — Supabase Patient Reads Wait For Auth/Profile Readiness In UI

Date: 2026-05-11

Decision:

In browser Supabase mode, patient list UI should wait for auth/profile readiness before executing and presenting patient read results, and should show an explicit loading state instead of a temporary `0/0` summary.

Reason:

The previous behavior could briefly show `Showing 0 of 0` while async reads were still in flight, which looked like a real read/RLS failure despite successful row fetch shortly after.

Impact:

`PatientsPage` now gates Supabase-mode fetch timing on auth/profile readiness and displays clear loading feedback. This improves perceived correctness and reduces false-positive read issue reports while preserving existing RLS/data-source behavior.

Status: Accepted

---

## Decision 038 — Audit Logs Use Controlled RPC Inserts

Date: 2026-05-11

Decision:

Audit log writes must go through `public.create_audit_log(...)` instead of direct `audit_logs` insert policies.

Reason:

Audit rows must be trustworthy and clinic-scoped. Direct client insert policies would make it easier to spoof actor/clinic fields or submit inconsistent audit payloads.

Impact:

`create_audit_log` derives actor and clinic from authenticated profile context (`auth.uid()`, `current_profile_id()`, `current_clinic_id()`), keeps append-only behavior, and returns inserted audit id. `audit_logs` remains without direct insert/update/delete policies, and owner/admin read restriction remains unchanged.

Status: Accepted

---

## Decision 039 — Patient Writes Through Service Layer With Audit RPC

Date: 2026-05-11

Decision:

Patient create and update operations must go through the patient service layer (`patientService.ts`), respect RLS through authenticated session/RLC context (no service role key), and call `create_audit_log` RPC after successful mutations.

Reason:

Patient data is sensitive and audit logging must be reliable. Using the service layer for all mutations ensures consistent RLS enforcement, centralized error handling, and mandatory audit trail creation. RPC-based audit logging ensures clinic and actor context cannot be spoofed by frontend code.

Impact:

Added `createPatient(input)` and `updatePatient(patientId, input)` functions to `src/features/patients/patientService.ts`. Both functions:
- Validate input (firstName, lastName, phone, status required)
- Enforce demo mode non-persistence (throw error if `VITE_PATIENT_DATA_SOURCE !== 'supabase'`)
- Check authenticated profile context (returns clear error if no active profile)
- Perform inserts/updates through RLS-protected Supabase queries (anon key only, no service role)
- Call `create_audit_log` RPC with appropriate action and old/new values for audit trail
- Return structured result with success flag, patient ID, and error messages

Demo mode remains non-persistent. UI form integration is deferred to a follow-up task.

Status: Accepted

---

## Decision 040 — Patient Form Pages Use Service-Only Writes And Keep Demo Non-Persistent

Date: 2026-05-12

Decision:

Patient create/edit pages must submit through `patientService` write functions only (`createPatient`, `updatePatient`) and must not write to Supabase directly from page components. Demo mode (`VITE_PATIENT_DATA_SOURCE` missing, invalid, or `demo`) remains explicitly non-persistent for patient create/edit submits.

Reason:

Keeping writes behind service-layer boundaries preserves consistent RLS behavior, centralized audit handling, and stable error handling. Preserving non-persistent demo mode avoids accidental local data mutation while still allowing realistic UI flow testing.

Impact:

`PatientCreatePage` and `PatientEditPage` call patient service writes only in Supabase mode. In demo mode, submit shows `Demo mode only. No data was saved.` and does not mutate `demoPatients`, use localStorage, or call Supabase writes. Audit behavior remains controlled by service-layer logic.

Status: Accepted

---

## Decision 041 — Patient-Level Important Note Uses importantNote -> important_note Mapping

Date: 2026-05-12

Decision:

Use one consistent patient-level note concept in frontend as `importantNote`, mapped to `patients.important_note` in Supabase.

Reason:

The previous create/edit form contained conflicting note-like fields (`importantWarning` and `summary`), causing a mismatch where user-entered note text was not reliably persisted, reloaded, and displayed.

Impact:

Patients create/edit flows now send and load `importantNote` consistently. Service create/update mapping targets `patients.important_note`. Patient detail and list views show important note state clearly. Audit remains service-layer controlled.

Status: Accepted

---

## Decision 042 — Patient Write Success Requires Audit Verification

Date: 2026-05-12

Decision:

Patient create/update service writes must not silently ignore audit insert failures. Audit verification scripts must validate patient audit rows by `action`, `entity_type`, and `entity_id`.

Reason:

Previous local verification reported successful patient writes while audit checks were incomplete because the test script did not mirror the controlled audit path and service audit failures were swallowed.

Impact:

`patientService` now returns a non-success result when audit logging fails after create/update writes. `testPatientWriteService.mjs` now verifies `patient.created` and `patient.updated` rows using exact audit dimensions and fails with non-zero exit when required audit checks fail.

Status: Accepted

