# DentApp — Progress

This file tracks completed work and important project progress.

---

## 2026-05-10

### Completed

- Created initial Vite React TypeScript project.
- Created main project folder structure.
- Created documentation folder structure under `docs/`.
- Created export folders under `exports/`.
- Created Supabase migration folder under `supabase/migrations/`.
- Created `.env.example`.
- Created initial empty documentation files.
- Created `docs/08_codex/codex_project_context.md`.
- Created `docs/08_codex/codex_rules.md`.
- Created `docs/07_execution/todo.md`.
- Created `docs/07_execution/progress.md`.
- Created `docs/00_project/product_vision.md`.
- Created `docs/00_project/project_charter.md`.
- Created `docs/00_project/decisions.md`.
- Created `docs/00_project/open_questions.md`.
- Created `docs/08_codex/codex_task_template.md`.
- Created `docs/08_codex/codex_review_checklist.md`.
- Installed Tailwind CSS using `tailwindcss` and `@tailwindcss/vite`.
- Configured the Tailwind Vite plugin in `vite.config.ts`.
- Updated the main CSS entry file to import Tailwind with `@import "tailwindcss";`.
- Removed the default Vite starter screen, starter app CSS, and unused starter assets.
- Added a temporary DentApp-branded Tailwind verification screen for Phase 1.
- Confirmed the production build succeeds after Tailwind setup.
- Created the initial `src/` folder structure from the technical architecture: `app`, `assets`, `components`, `features`, `hooks`, `layouts`, `lib`, `pages`, `routes`, `services`, `styles`, and `types`.
- Added `.gitkeep` markers for empty source structure folders.
- Preserved the temporary DentApp Tailwind verification screen while preparing the app for future routing and layout work.
- Confirmed build and lint succeed after source folder setup.
- Installed `react-router-dom`.
- Configured initial React Router routing with `BrowserRouter`, `src/routes/AppRoutes.tsx`, and `src/routes/routePaths.ts`.
- Created placeholder route pages for login, dashboard, calendar, patients, treatment plans, payments, doctor commissions, inventory, reports, settings, and not found.
- Preserved Tailwind styling on all placeholder routes.
- Confirmed build, lint, and local route checks succeed after routing setup.
- Created the first custom app shell with `AppShell`, `SidebarNav`, and `TopBar`.
- Created shared layout components `Page` and `PageHeader` under `src/components/layout/`.
- Wrapped main application routes with `AppShell` while keeping `/login` outside the shell.
- Added sidebar navigation for Dashboard, Calendar, Patients, Treatment Plans, Payments, Commissions, Inventory, Reports, and Settings.
- Updated placeholder pages to use the shared `Page` and `PageHeader` layout foundation.
- Confirmed build, lint, and local route checks succeed after app shell setup.
- Created basic shared UI components under `src/components/ui/`: `Button`, `Card`, `Badge`, `EmptyState`, `LoadingState`, and `ErrorState`.
- Added `src/components/ui/index.ts` for shared UI exports.
- Added a tiny internal `classNames` helper under `src/lib/classNames.ts` to keep component variant classes readable without adding a dependency.
- Updated the placeholder page foundation to use the new shared `Card`, `Badge`, and `Button` components.
- Confirmed build, lint, and local route checks succeed after basic UI component setup.
- Created centralized navigation configuration in `src/routes/navigationConfig.ts`.
- Added typed navigation role support in `src/types/navigation.ts`.
- Added a clearly temporary centralized demo auth placeholder in `src/lib/demoAuth.ts` with `DEMO_ROLE` set to `owner_admin`.
- Updated `SidebarNav` to filter visible navigation items by the current demo role.
- Updated `TopBar` to read the demo role and temporary auth status from the centralized demo auth placeholder.
- Removed obsolete `.gitkeep` files from folders that now contain real source files.
- Confirmed build, lint, and local route checks succeed after role-aware navigation and final foundation cleanup.
- Created the first frontend-only demo patient type in `src/features/patients/types.ts`.
- Created clearly marked fake demo patient records in `src/features/patients/demoPatients.ts`.
- Replaced the Patients placeholder page with a searchable, filterable demo patient list using the shared Page, PageHeader, Card, Badge, Button, and EmptyState components.
- Kept the Patients module demo-only with no Supabase integration, no create/edit/detail flows, and no real patient data.
- Confirmed build and lint succeed after the first Patients module page.
- Added the `/patients/:patientId` route for read-only demo patient profiles.
- Created `PatientDetailPage` with patient identity, contact information, warning, appointment, treatment plan, demo balance, and future section placeholders.
- Updated the Patients list with links to open each demo patient profile.
- Added clear handling for unknown patient IDs using an empty/not-found state.
- Confirmed build and lint succeed after the first Patient Detail page.
- Extended the fake demo patient model with read-only record summary fields, including medical warnings, anamnesis summary, dental history summary, clinical note summary, treatment plan summary, next recommended step, recent visit summary, document count, and demo timeline events.
- Expanded `PatientDetailPage` with structured read-only sections for Clinical Summary, Medical Warnings, Anamnesis Summary, Dental History, Active Treatment Plan Summary, Visit Summary, Documents Placeholder, and Timeline Placeholder.
- Kept patient record sections frontend-only and demo-only with no editing, no file upload, no Supabase integration, and no real patient data.
- Confirmed build and lint succeed after adding patient record sections.
- Added frontend-only patient create and edit routes at `/patients/new` and `/patients/:patientId/edit`.
- Created the reusable `PatientForm` foundation under `src/features/patients/PatientForm.tsx` with controlled basic profile fields.
- Created `PatientCreatePage` and `PatientEditPage`, including edit prefill from fake demo patient data and invalid edit ID handling.
- Added a New patient action on the Patients page and an Edit patient action on the Patient Detail page.
- Kept save behavior explicitly demo-only and non-persistent with no runtime mutation, no localStorage, and no Supabase integration.
- Confirmed build and lint succeed after adding the patient form foundation.
- Added simple custom frontend validation for `PatientForm` without adding a form library.
- Added field-level validation messages for required first name, last name, phone, status, optional email format, and future date of birth.
- Improved PatientForm required field indicators, invalid field styling, and demo-only submit feedback.
- Preserved non-persistent submit behavior: valid submit shows a demo-only message, invalid submit shows validation errors and no success message.
- Confirmed build and lint succeed after patient form validation and UX refinement.
- Created `docs/05_technical/patient_persistence_plan.md`.
- Documented the proposed Supabase persistence plan for patients, patient medical records, and clinical notes.
- Documented frontend demo model to future database field mapping, including which demo fields belong to future appointments, visits, treatment plans, documents, and patient ledger tables.
- Documented initial patient validation assumptions, RLS considerations, audit requirements, soft delete/archive approach, and migration draft outline.
- Kept this as a planning-only task with no Supabase client setup, no SQL migration, no persistence, and no application behavior changes.
- Created the first Supabase migration draft at `supabase/migrations/20260510195423_create_patient_tables.sql`.
- Added minimal `clinics` and `profiles` foundation tables so patient tables have coherent clinic and profile references.
- Added initial `patients`, `patient_medical_records`, and `clinical_notes` tables with UUID primary keys, `clinic_id`, timestamps, relevant soft delete fields, constraints, comments, and indexes.
- Added a reusable `updated_at` trigger function and triggers for the new tables.
- Enabled RLS on `clinics`, `profiles`, `patients`, `patient_medical_records`, and `clinical_notes`.
- Deferred RLS policies to a dedicated future migration to avoid unsafe broad access policies before role/profile helper functions are finalized.
- Kept frontend behavior unchanged with no Supabase client setup, no patient service layer, and no real persistence.
- Reviewed `supabase/migrations/20260510195423_create_patient_tables.sql` for clean Supabase execution readiness, table order, foreign keys, constraints, timestamps, triggers, RLS posture, indexes, and scope safety.
- Confirmed no unsafe broad RLS policies, seed data, frontend behavior changes, Supabase client setup, or patient CRUD persistence were introduced.
- Found no blocking SQL issues during review and made no migration changes in the review task.
- Approved the migration for local/development Supabase execution in a future scoped task, with remaining risk around deferred RLS policy implementation and future expansion of auth/profile behavior.
- Attempted to run the reviewed patient migration against local Supabase before Docker was available.
- Confirmed the global `supabase` command is not installed, but `npx.cmd supabase --version` resolves Supabase CLI `2.98.2`.
- Confirmed the first local Supabase validation attempt was blocked because Docker Desktop/the Docker daemon was not available in the environment.
- Installed and started Docker Desktop with WSL2 support.
- Confirmed `docker info` works after Docker Desktop was installed and running.
- Started local Supabase successfully.
- Ran `npx.cmd supabase db reset` successfully against local Supabase.
- Applied the patient migration locally through the Supabase database reset flow.
- Verified Supabase Studio is accessible locally.
- Verified the expected tables exist locally: `clinics`, `profiles`, `patients`, `patient_medical_records`, and `clinical_notes`.
- Verified RLS is enabled on all five tables.
- Verified the policy safety query returned no unsafe policies.
- Confirmed the `supabase/seed.sql` warning is acceptable for now because seed data has not been created yet.
- Completed Phase 2 Task 9: local Supabase patient migration validation passed.
- Created the patient RLS helper and policy migration at `supabase/migrations/20260510210621_create_patient_rls_policies.sql`.
- Added RLS helper functions: `current_profile_id()`, `current_clinic_id()`, `current_user_role()`, `is_active_profile()`, and `has_role(text[])`.
- Added initial conservative authenticated policies for `clinics`, `profiles`, `patients`, `patient_medical_records`, and `clinical_notes`.
- Scoped policies by active profile, current clinic, and role instead of broad authenticated access.
- Allowed clinic-wide patient read access for `owner_admin`, `doctor`, `specialist`, `assistant`, and `reception_admin` as an MVP simplification.
- Allowed patient create/update for `owner_admin`, `doctor`, and `reception_admin`.
- Allowed patient medical record read access for `owner_admin`, `doctor`, `specialist`, and `assistant`, with write access limited to `owner_admin`, `doctor`, and `specialist`.
- Allowed clinical note read/write access for `owner_admin`, `doctor`, and `specialist`.
- Did not add hard delete policies for patient-related tables; soft delete/archive remains the required direction.
- Ran `npx.cmd supabase db reset` successfully after adding the RLS migration.
- Verified policies exist for all five protected tables and that RLS remains enabled on all five tables.
- Verified the unsafe-policy check returned no broad `true` policies and no delete policies.
- Ran `npx.cmd supabase db lint`; no schema errors were found.
- Completed Phase 2 Task 10: patient RLS helper functions and initial policies created and validated locally.
- Created the audit log migration at `supabase/migrations/20260510211215_create_audit_logs.sql`.
- Created the initial `audit_logs` table with clinic scope, actor profile/auth user references, action/entity fields, optional JSON old/new values, optional metadata, request context fields, and `created_at`.
- Kept `audit_logs` append-only by design with no `updated_at`, no `deleted_at`, no update policy, and no delete policy.
- Enabled RLS on `audit_logs`.
- Added an owner/admin-only read policy for active users within their own clinic.
- Deferred direct authenticated audit insert access until the patient persistence service or a controlled audit function is designed.
- Added indexes for clinic, clinic/time, entity, actor profile, action, and created-at audit queries.
- Updated `docs/06_compliance/audit_log_policy.md` with audit purpose, read access, append-only rules, no hard-delete principle, future write strategy, and patient-related audit events.
- Ran `npx.cmd supabase db reset` successfully after adding the audit log migration.
- Verified `audit_logs` exists locally, RLS is enabled, the owner/admin read policy exists, and no insert/update/delete or broad `true` audit policies exist.
- Ran `npx.cmd supabase db lint`; no schema errors were found after the audit migration.
- Completed Phase 2 Task 11: audit log schema and strategy created and validated locally.
- Installed `@supabase/supabase-js`.
- Created `src/lib/env.ts` with a small required public environment variable helper.
- Created the centralized Supabase browser client in `src/lib/supabaseClient.ts`.
- Configured the client to read only frontend-safe variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Confirmed `.env.example` already contains `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=` with no real values.
- Confirmed no service role key is used or referenced in the frontend.
- Kept the Supabase client unused by current patient pages so demo patient reads and frontend-only form behavior remain unchanged.
- Ran `npm run build`; build succeeds.
- Ran `npm run lint`; lint succeeds.
- Ran `npm run dev` and verified the Vite app responds locally with HTTP 200.
- Completed Phase 2 Task 12: Supabase client foundation configured.
- Confirmed `.env.local` is ignored by Git through `.gitignore`.
- Added explicit `.gitignore` entries for `.env`, `.env.local`, and `.env.*.local` while keeping `.env.example` trackable.
- Created local `.env.local` using the local Supabase Project URL and browser-safe Publishable key from local Supabase status.
- Confirmed the Supabase Secret key/service role style key is not used in frontend env or frontend code.
- Created `src/lib/testSupabaseConnection.ts` as a development-only Supabase connection test utility.
- Ran a safe local Supabase connection check outside the normal app flow; the client initialized and a read-only `clinics` query completed successfully.
- Confirmed the connection test utility is not imported by current patient pages or normal app flow.
- Ran `npm run lint`; lint succeeds.
- Ran `npm run build`; the first attempt hit a transient Vite/Rolldown Windows emitted `index.html` path error, and a direct rerun succeeded.
- Ran `npm run dev` and verified `/patients` responds locally with HTTP 200.
- Completed Phase 2 Task 13: local frontend Supabase env and safe connection test configured.
- Created `src/features/patients/patientService.ts` as the first Patients module service abstraction.
- Added demo-backed async patient service functions: `getPatients()`, `getPatientById(patientId)`, and `searchPatients(query)`.
- Updated `PatientsPage`, `PatientDetailPage`, and `PatientEditPage` to use patient service functions instead of importing raw demo patient data directly.
- Kept the patient service frontend-only and demo-backed; no Supabase patient reads or writes were added.
- Kept create/edit forms non-persistent with no localStorage mutation, no demo data mutation, and no database writes.
- Confirmed patient feature/page code does not import the Supabase client for patient data access.
- Ran `npm run build`; build succeeds.
- Ran `npm run lint`; lint succeeds.
- Ran `npm run dev` and verified `/patients`, a demo patient detail route, a demo patient edit route, an invalid patient route, and `/patients/new` respond locally with HTTP 200.
- Completed Phase 2 Task 14: patient service abstraction created while preserving demo behavior.
- Kept frontend behavior unchanged with no patient CRUD persistence, no seed data, and no real patient data.

### Current Project State

Phase 1 — App Foundation is complete. Phase 2 — Patients and records has started with frontend-only Patients list, Patient Detail, read-only patient record section, patient form foundation, basic form validation, patient persistence planning, initial patient migration draft, patient migration review, local Supabase migration validation, initial patient RLS policy, audit log foundation, Supabase client foundation, local frontend Supabase connection testing, and patient service abstraction tasks.

Tailwind CSS is configured and verified with a temporary DentApp screen. No business features have been implemented yet.

The required Phase 1 source folder structure now exists. Initial React Router routes, placeholder pages, app shell, role-aware sidebar navigation placeholder, top bar, shared page layout components, and basic shared UI components are configured.

The Patients page now renders fake demo patient data through a demo-backed patient service abstraction with local search and status filtering. Demo patient profiles can be opened through `/patients/:patientId` and show read-only overview and structured patient record sections from the same fake dataset. Frontend-only create/edit form routes exist for layout, workflow, and basic validation testing, but they do not persist data. A technical patient persistence plan exists. The initial patient table migration, first patient RLS helper/policy migration, and audit log foundation migration have been reviewed and validated locally with Docker Desktop and local Supabase. The Supabase frontend client is configured and can connect to local Supabase, but it is not yet used by patient UI. Protected routes, real authentication UI, document upload, audit log writes, Supabase-backed patient reads/writes, and real patient records have not been implemented yet.

### Current Stack Decision

Initial stack:

- React
- Vite
- TypeScript
- Tailwind CSS configured
- React Router configured
- Temporary demo role navigation configured
- Supabase client configured
- PostgreSQL planned
- Supabase Auth planned
- Supabase Storage planned

### Build Status

- `npm run build` succeeds.
- `npm run lint` succeeds.
- `npm run dev` serves the configured app shell, placeholder routes, demo Patients list, demo Patient Detail route, read-only demo patient record sections, and frontend-only patient create/edit form routes with basic validation locally.

### Key Product Decisions So Far

- Project working name: DentApp
- Initial market: Serbia
- Initial user type: one dental practice with multiple doctors
- Initial use: internal use only
- Pilot: real dental practice pilot
- Patient portal: later phase
- Online booking: later phase
- Core focus: treatment plans, patient records, payments, doctor commission, inventory
- Architecture should be multi-tenant ready from day one
- Real patient data must not be used in repository or documentation

### Next Recommended Work

1. Create fake/demo database seed data later for safe CRUD testing.
2. Test authenticated RLS behavior later with demo users and roles.
3. Implement Supabase-backed patient reads behind the existing service abstraction.
4. Replace demo patient reads later through the service abstraction.
5. Implement patient create/update with audit logging later.

---

## Notes

This project should remain structured and incremental.

Do not start coding application features until the core discovery and planning documents are sufficiently defined.









