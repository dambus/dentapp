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

## 2026-05-11

### Completed

- Created `supabase/seed.sql` for local development-only fake/demo data.
- Seeded one demo clinic: `DentApp Demo Clinic` with active status.
- Seeded five fake demo patients linked to the demo clinic, covering active, inactive, and archived statuses.
- Included both demo warning and no-warning patient examples.
- Seeded fake demo `patient_medical_records` rows for selected patients.
- Seeded fake demo `clinical_notes` rows for selected patients.
- Chose the safer seed approach for now: no `auth.users` or `profiles` inserts in `seed.sql`.
- Ran `npx.cmd supabase db reset` successfully with no seed warning.
- Verified seeded counts in local database:
	- `clinics`: 1
	- `patients`: 5
	- `patient_medical_records`: 3
	- `clinical_notes`: 3
- Verified demo-safety checks:
	- no non-demo patient emails outside `@example.test`
	- no patient/record/note text entries without `demo` marker
- Kept frontend behavior unchanged: no patient UI Supabase reads/writes were added.
- Created six local fake/demo Supabase Auth users for role-based RLS testing:
	- `owner.demo@example.test`
	- `doctor.demo@example.test`
	- `specialist.demo@example.test`
	- `assistant.demo@example.test`
	- `reception.demo@example.test`
	- `inventory.demo@example.test`
- Added six matching active `profiles` rows linked to the seeded demo clinic.
- Chose Option B for this task: create local auth users through local Supabase Auth admin API and map them to local application profiles.
- Added `supabase/snippets/testPatientRlsByRole.mjs` to run authenticated role-by-role RLS checks using local demo users.
- Seeded one demo `audit_logs` row (`demo.rls.seed`) to verify owner/admin-only audit visibility.
- Ran authenticated RLS tests for all required roles and verified policy behavior:
	- `owner_admin`: can view clinic, clinic profiles, patients, medical records, clinical notes, and audit logs; can insert/update patients and create clinical notes.
	- `doctor`: can view own profile, patients, medical records, and clinical notes; cannot read audit logs; can insert/update patients and create clinical notes.
	- `specialist`: can view own profile, patients, medical records, and clinical notes; cannot read audit logs; cannot create/update patients; can create clinical notes.
	- `assistant`: can view own profile, patients, and medical records; cannot read clinical notes or audit logs; cannot create clinical notes or patients.
	- `reception_admin`: can view own profile and patients; cannot read medical records, clinical notes, or audit logs; can insert/update patients; cannot create clinical notes.
	- `inventory_responsible`: can view own profile and clinic row only; cannot read patients, medical records, clinical notes, or audit logs; cannot create patients or clinical notes.
- Verified setup counts after provisioning:
	- demo auth users: 6
	- demo profiles: 6
	- demo audit rows for RLS checks: 1
- Noted local test artifacts from write-policy checks:
	- test-created patients: 3
	- test-created clinical notes: 3
- Limitation: there are intentionally no delete policies for patient and clinical note tables, so test-created rows are not removed by authenticated clients; local cleanup should use `npx.cmd supabase db reset`.
- Kept frontend behavior unchanged: no login UI, protected routes, or Supabase-backed patient page reads were added.
- Implemented a patient data source boundary in `src/features/patients/patientService.ts`.
- Added opt-in Supabase-backed patient read support behind `VITE_PATIENT_DATA_SOURCE`.
- Kept demo mode as the safe default when the flag is missing or not set to `supabase`.
- Added lazy Supabase client loading to avoid demo-mode runtime failures when Supabase env keys are not configured.
- Added Supabase-backed read functions in patient service:
	- `getPatients()` reads from `patients`, filters `deleted_at is null`, and orders by `last_name`, `first_name`.
	- `getPatientById(patientId)` reads one patient and also fetches related `patient_medical_records` and latest `clinical_notes` entry for detail placeholders.
	- `searchPatients(query)` in Supabase mode currently uses client-side filtering on fetched patient rows (first name, last name, phone, email) for local MVP simplicity.
- Added snake_case to camelCase row mapping from Supabase patient tables to the existing frontend `DemoPatient` shape.
- Added safe fallback behavior for Supabase mode:
	- if Supabase client/env is unavailable, fallback to demo data,
	- if no authenticated Supabase session exists, fallback to demo data,
	- if Supabase read errors occur, fallback to demo data.
- No patient writes were implemented.
- No login/auth UI was implemented.
- No service role key usage was introduced.
- Updated `.env.example` with `VITE_PATIENT_DATA_SOURCE=demo`.
- Verification commands completed after implementation:
	- `npm run build` passes,
	- `npm run lint` passes,
	- `npm run dev` route checks in default mode return HTTP 200 for `/patients`, patient detail, and patient edit routes,
	- `npm run dev` with `VITE_PATIENT_DATA_SOURCE=supabase` also starts successfully and route checks return HTTP 200.
- Runtime limitation remains expected: without login/auth UI and active browser auth session, Supabase mode falls back to demo data because RLS requires authenticated sessions.
- Kept UI behavior unchanged: patients list, search, detail loading, invalid patient handling, and edit prefill continue to work.
- Implemented basic Supabase Auth login UI in `src/pages/LoginPage.tsx`.
- Added email/password login form with loading state, clear error handling, and local/demo-only messaging.
- Added minimal auth helper foundation under `src/features/auth/`:
	- `authService.ts` for `signIn`, `signOut`, current session read, and auth state subscription.
	- `useAuthSession.ts` hook for session-aware UI state.
	- `types.ts` for auth helper typing.
- Implemented logout action and auth session display in `src/layouts/TopBar.tsx`.
- TopBar now shows signed-in user email when session exists, signed-out state when no session exists, and `Log out` / `Log in` controls accordingly.
- Preserved existing demo role placeholder (`src/lib/demoAuth.ts`) and did not implement profile-role replacement yet.
- Did not implement protected routes in this task.
- Did not implement signup, password reset, user management, or patient writes.
- Confirmed no service role key usage in frontend auth implementation.
- Updated runtime env example with patient data source flag retained (`VITE_PATIENT_DATA_SOURCE=demo`).
- Verification completed:
	- `npm run build` passes.
	- `npm run lint` passes.
	- `/login` loads and renders the new auth form.
	- Invalid credentials show a clear `Invalid login credentials` error.
	- Valid local demo user login works in browser.
	- TopBar shows signed-in email after login.
	- Logout works and TopBar returns to signed-out state.
	- App still loads when signed out.
	- Patient pages still work in demo mode.
- Optional Supabase patient mode check (`VITE_PATIENT_DATA_SOURCE=supabase`) was run with authenticated local demo user:
	- login succeeded,
	- `/patients` loaded,
	- current local result showed `0` patients returned in UI for that authenticated flow.
- Current observed limitation for follow-up: authenticated in-app patient read flow still needs profile/session alignment verification in browser context before replacing demo role with loaded profile role.
- Implemented Supabase profile loading in app auth foundation:
	- Added `src/features/auth/profileService.ts` to load current profile by `auth_user_id`.
	- Added `src/features/auth/useCurrentProfile.ts` to combine auth session state with profile-loading state.
	- Extended auth types with profile-related types in `src/features/auth/types.ts`.
- Replaced demo-role placeholder usage in app chrome with profile-first role source:
	- `TopBar` now shows profile role when available and retains demo fallback when profile/session is missing.
	- `SidebarNav` now filters visible navigation using loaded profile role, with demo fallback.
	- Hoisted profile loading to `AppShell` and passed it to chrome components to avoid duplicate profile fetches.
- Validated role-aware runtime behavior in browser:
	- `owner.demo@example.test` resolves to `owner_admin` and sees full navigation.
	- `inventory.demo@example.test` resolves to `inventory_responsible` and sees restricted navigation.
	- Sign-out returns to signed-out state with demo fallback role messaging.
- Final Supabase patient read diagnosis:
	- Authenticated owner flow in `VITE_PATIENT_DATA_SOURCE=supabase` resolves to seeded patient rows after profile/session context settles.
	- Observed temporary `Showing 0 of 0` before async profile and patient fetch completion on first render.
	- Local database includes additional test-created rows from prior RLS write checks; seeded-only counts require `npx.cmd supabase db reset`.
- Verification completed after Task 19 updates:
	- `npm run build` passes.
	- `npm run lint` passes.
	- Browser checks confirm profile role load, role-based nav filtering, and Supabase-backed patient list visibility for authenticated owner flow.
- Implemented protected route foundation to require auth session and active profile:
	- Created `src/routes/ProtectedRoute.tsx` to guard main app routes.
	- Signed-out users are redirected to `/login` when accessing protected routes.
	- Signed-in users without active profile see `ProfileRequiredPage` message.
	- Loading state shown while checking auth/profile status.
	- `/login` remains public.
- Enhanced LoginPage behavior:
	- Already signed-in users with active profile are redirected to dashboard.
	- Loading states shown while checking profile status.
	- Updated description to reflect protected routes.
- Wrapped main app routes with ProtectedRoute in `AppRoutes.tsx`.
- Created ProfileRequiredPage for signed-in users without active profile.
- Manual verification completed:
	- Signed-out: accessing `/` redirects to `/login`.
	- Signed-out: accessing `/patients` redirects to `/login`.
	- Login works with valid demo user credentials.
	- Signed-in with active profile: can access `/` and `/patients`.
	- Signed-in: TopBar shows profile role and email.
	- Signed-in: Sidebar filters navigation by profile role.
	- Signed-in: accessing `/login` redirects to dashboard.
	- Signed-in: logout works and redirects to `/login`.
	- Role-based navigation confirmed with inventory_responsible role (restricted nav).
- Verification completed:
	- `npm run build` passes.
	- `npm run lint` passes.
	- Protected routes block unsigned access.
	- Profile requirement enforced.
	- Role-based navigation works with protected routes.
- Diagnosed Supabase-mode browser patient read issue (Task 21B):
	- Root cause: `/patients` briefly rendered `Showing 0 of 0` while async patient fetch was still in flight.
	- In Supabase mode this looked like an access/data failure even though authenticated reads completed shortly after and returned rows.
	- Additional contributor: patient fetch was not explicitly gated on auth/profile readiness in page-level UI state.
- Implemented Task 21B fix in `PatientsPage`:
	- Added explicit patient loading state so list summary does not show misleading `0/0` before fetch completion.
	- In Supabase mode, patient fetch now waits for auth/profile loading to settle before reading.
	- Consolidated list/search behavior to avoid redundant async search fetches during initial load.
	- Added data mode badge text (`Demo mode` / `Supabase mode`) and mode-aware empty-state messaging.
- Runtime verification after Task 21B:
	- Supabase mode (`VITE_PATIENT_DATA_SOURCE=supabase`), owner session: `/patients` shows local Supabase rows (`17` at test time; includes local test artifacts).
	- Demo mode (default): `/patients` shows demo rows (`5` of `5`).
	- Logout still returns to `/login`; protected-route redirect still works when signed out.
	- Inventory user nav remains restricted (no Patients link in sidebar).
	- `node supabase/snippets/testPatientRlsByRole.mjs` still passes for all 6 roles.
	- `npm run build` passes.
	- `npm run lint` passes.
- Known data note remains:
	- Local patient counts may exceed seeded-only values because role test script intentionally creates test rows.
	- Run `npx.cmd supabase db reset` to return to seeded-only counts.
- Implemented controlled audit insert strategy / RPC (Task 22):
	- Created migration `supabase/migrations/20260511111000_create_audit_insert_function.sql`.
	- Added `public.create_audit_log(p_action text, p_entity_type text, p_entity_id uuid default null, p_old_values jsonb default null, p_new_values jsonb default null, p_metadata jsonb default null)`.
	- Function uses authenticated context only (`auth.uid()`, `current_profile_id()`, `current_clinic_id()`) and does not accept caller-provided clinic/actor ids.
	- Function validates non-empty `action` and `entity_type`, inserts append-only audit row, and returns inserted audit log id.
	- Function is `security definer` with `set search_path = public` and execute is granted only to `authenticated`.
	- No direct `audit_logs` write policies were added.
	- No `UPDATE` or `DELETE` policies were added.
- Task 22 verification completed:
	- Ran `npx.cmd supabase db reset`; all migrations applied successfully.
	- Verified function exists (`create_audit_log`).
	- Verified `audit_logs` policies remain read-only (`Owner admins can view clinic audit logs`).
	- Verified no `INSERT`/`UPDATE`/`DELETE` policies exist on `audit_logs`.
	- Added local script `supabase/snippets/testAuditInsert.mjs` for role-based RPC checks.
	- Verified owner and doctor can call `create_audit_log` successfully for own clinic context.
	- Verified doctor cannot read `audit_logs` (count `0` through RLS).
	- Verified unauthenticated RPC call fails with `Authenticated session is required for audit log creation.`
	- Re-ran `node supabase/snippets/testPatientRlsByRole.mjs`; role behavior remained valid.
- Implemented patient create/update service layer (Task 23):
	- Added `createPatient(input)` function to `src/features/patients/patientService.ts`.
	- Added `updatePatient(patientId, input)` function to `src/features/patients/patientService.ts`.
	- Both functions support Supabase-backed persistence with RLS enforcement (no service role key).
	- Both functions validate input (firstName, lastName, phone, status required).
	- Both functions enforce demo mode non-persistence (throw error for non-Supabase data source).
	- Both functions check authenticated profile context (return clear error if no active profile).
	- Both functions perform mutations through RLS-protected Supabase queries.
	- Both functions call `create_audit_log` RPC after successful mutations:
		- `createPatient` calls with action `patient.created`, entity_type `patient`, new_values set, old_values null.
		- `updatePatient` fetches old_values before mutation, calls with action `patient.updated`, old_values and new_values set.
	- Both functions return structured `PatientWriteResult` with `ok` flag, `patientId`, and error message.
	- Added helper functions for input validation, form-to-database row mapping, and audit log creation.
	- Added `supabase/snippets/testPatientWriteService.mjs` for role-based write and audit verification:
		- Tests owner_admin can create and update patients.
		- Tests doctor can create and update patients.
		- Tests reception_admin can create and update patients.
		- Tests specialist, assistant, inventory_responsible cannot create/update (RLS denied).
		- Verifies audit logs created for allowed writes.
		- Verifies owner can read audit logs, others cannot.
	- Build succeeds: `npm run build` → 111 modules, 286.87 kB (gzip 86.28 kB).
	- Lint succeeds: `npm run lint` → no errors.
	- Demo mode behavior confirmed: attempts to persist in demo mode return clear error message.
	- Supabase mode ready for service-layer usage before UI form integration.
### Current Project State

Phase 1 — App Foundation is complete.

Phase 2 foundation through Task 23 is complete and verified:

- local fake/demo seed data exists,
- local fake auth users and role-based RLS checks are in place,
- Supabase-backed patient reads are implemented behind patientService data-source boundary,
- basic login/logout UI is implemented,
- current profile loading and role-based chrome behavior are implemented,
- protected routes require authenticated session plus active profile,
- controlled audit insert RPC is implemented for append-only audit writes,
- patient create/update service functions are implemented with audit integration.

Current known limitation:

- Local row counts may differ from seeded-only counts after role test scripts create additional test rows.
- Use `npx.cmd supabase db reset` to return to seeded-only baseline.

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
- `npm run dev` serves login, protected routes, role-based chrome behavior, and current patient module flows.

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

1. Add fine-grained role-specific route guards.
2. Implement patient medical record edit flow.
3. Implement patient archive/restore flow.
4. Continue treatment plan foundation.

---

## 2026-05-12

### Completed

- Completed Phase 2 Task 24: connected patient create/edit form submit behavior to patient service writes.
- Updated `PatientForm` to keep existing validation while supporting page-level submit handling, loading state, submit label, and clear submit success/error messaging.
- Connected `PatientCreatePage` submit to `createPatient()` in Supabase mode.
- Connected `PatientEditPage` submit to `updatePatient()` in Supabase mode.
- Kept demo mode explicitly non-persistent for both create and edit submits.
- Demo submit behavior now shows: `Demo mode only. No data was saved.`
- Confirmed pages do not mutate `demoPatients`, do not use localStorage, and do not write directly to Supabase.
- Added user-friendly submit error handling in page layer (permission-required-fields-generic save failure mapping) without exposing raw SQL as primary UI text.
- Kept write and audit responsibility in patient service layer; pages only call patient service.
- Updated stale copy in patient pages to reflect current demo-vs-supabase behavior.

### Verification

- `npm run build` passes.
- `npm run lint` passes.
- `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes when local Supabase env vars are set.
- `node .\supabase\snippets\testAuditInsert.mjs` passes:
	- owner_admin audit insert/read works,
	- doctor audit insert works and audit read remains restricted,
	- unauthenticated audit insert is denied.
- `node .\supabase\snippets\testPatientRlsByRole.mjs` passes expected role behavior:
	- allowed patient writes: owner_admin, doctor, reception_admin,
	- denied patient writes: specialist, assistant, inventory_responsible.
- `node .\supabase\snippets\testPatientWriteService.mjs` currently fails sign-in because the script uses outdated demo passwords (`Demo@12345`) while provisioned demo users use `DemoPass!2026`.

### Notes

- Manual browser verification for demo mode and Supabase mode flows is still required for full UI acceptance confirmation.

### Completed (Task 24A)

- Added shared local demo auth password constant at `supabase/snippets/demoAuthConstants.mjs`.
- Updated local snippet scripts to use the same demo password constant:
	- `provisionDemoAuthUsers.mjs`
	- `testPatientWriteService.mjs`
	- `testAuditInsert.mjs`
	- `testPatientRlsByRole.mjs`
- Resolved local sign-in mismatch in patient write service script.
- Verified local sequence: db reset, provision script, patient write service script, audit insert script, RLS by role script, build, and lint.

### Completed (Task 24B)

- Fixed patient important note mapping inconsistency across form, pages, and service layer.
- Standardized frontend field naming to `importantNote` and mapped it to database column `patients.important_note`.
- Removed conflicting non-persistent "Notes or summary" form field that caused user confusion.
- Updated create and edit submit payload mapping to use `importantNote`.
- Updated patient read mapping from Supabase to populate `importantNote` for detail/edit flows.
- Updated patient detail and list views to show important note state clearly.
- Kept audit behavior inside patientService and ensured `important_note` remains part of update audit old/new values.
- Preserved demo mode non-persistent behavior with no demo dataset mutation on submit.

### Verification (Task 24B)

- `npm run build` passes.
- `npm run lint` passes.
- `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes with local Supabase env variables.
- Manual browser verification steps remain to be executed in local UI flow.

### Completed (Task 24C)

- Investigated missing audit verification in patient write test flow.
- Confirmed patient service create/update functions call `create_audit_log`, but audit failures were previously swallowed and did not affect service result.
- Fixed patient service audit handling so create/update no longer report full success when audit logging fails.
- Fixed `testPatientWriteService.mjs` verification logic:
	- added explicit `create_audit_log` RPC calls after successful patient create/update writes to mirror service behavior,
	- verified audit rows by `action`, `entity_type`, and `entity_id`,
	- validated owner audit read access and non-owner audit read restriction,
	- made script fail with non-zero exit when required checks fail.
- Confirmed no direct `audit_logs` insert policy was added and no RLS policy changes were required.

### Verification (Task 24C)

- `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes.
- `node .\supabase\snippets\testAuditInsert.mjs` passes.
- `node .\supabase\snippets\testPatientWriteService.mjs` passes with expected audit verification:
	- `patient.created` logs found for allowed roles,
	- `patient.updated` logs found for allowed roles,
	- owner can read audit logs,
	- doctor cannot read audit logs,
	- denied roles remain denied for patient writes.
- `node .\supabase\snippets\testPatientRlsByRole.mjs` passes expected role behavior.
- `npm run build` passes.
- `npm run lint` passes.

### Completed (Task 25)

- Added fine-grained role-specific route guards for protected app routes.
- Added centralized route permission map in `src/routes/routeAccessConfig.ts`.
- Added reusable `RoleGuard` in `src/routes/RoleGuard.tsx`.
- Updated `AppRoutes` so each protected page route is wrapped in role guard checks.
- Added `PermissionDeniedPage` to handle unauthorized route access without rendering restricted page content.
- Added explicit route-level guard coverage for patient write routes:
	- `/patients/new`
	- `/patients/:patientId/edit`
- Preserved existing protected-route behavior:
	- `/login` remains public,
	- signed-out users still redirect to `/login`,
	- signed-in users without active profile still see `ProfileRequiredPage`.
- Aligned sidebar role filtering with route-guard role rules by reusing centralized role map in `navigationConfig`.
- Kept route guards as UX-level enforcement while RLS remains the backend source of truth.

### Verification (Task 25)

- `npm run build` passes.
- `npm run lint` passes.
- `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes.
- `node .\supabase\snippets\testAuditInsert.mjs` passes.
- `node .\supabase\snippets\testPatientWriteService.mjs` passes.
- `node .\supabase\snippets\testPatientRlsByRole.mjs` passes.

### Completed (Task 26)

- Implemented the first patient medical record edit flow.
- Added a separate clinical edit route:
	- `/patients/:patientId/record/edit`
- Added route guard access for the medical record edit route:
	- allowed: `owner_admin`, `doctor`, `specialist`
	- denied: `assistant`, `reception_admin`, `inventory_responsible`
- Added `src/features/patients/patientMedicalRecordService.ts` with:
	- `getPatientMedicalRecord(patientId)`
	- `savePatientMedicalRecord(patientId, input)`
- Medical record save behavior:
	- Supabase mode fetches existing record by `patient_id`.
	- Missing record is inserted when the user is allowed and at least one field has content.
	- Existing record is updated when the user is allowed.
	- Writes go through authenticated Supabase client and RLS; no service role key is used in frontend code.
	- Audit RPC `create_audit_log` is called after successful insert/update.
	- Audit actions:
		- `patient_medical_record.created`
		- `patient_medical_record.updated`
	- Audit `entity_type`: `patient_medical_record`
	- Audit metadata includes `patient_id`.
- Added `PatientMedicalRecordForm` with controlled React state and textareas for:
	- anamnesis summary,
	- allergies,
	- current medications,
	- medical warnings,
	- dental history,
	- risk notes.
- Validation behavior:
	- all fields are optional for existing medical records,
	- creating a missing medical record requires at least one field with content.
- Added `PatientMedicalRecordEditPage` with clear loading, missing-patient, empty-record, success, error, and demo-mode states.
- Demo mode remains non-persistent:
	- no `demoPatients` mutation,
	- no localStorage,
	- submit shows `Demo mode only. No medical record changes were saved.`
- Updated `PatientDetailPage` medical record summary so it shows the latest supported medical record fields:
	- anamnesis summary,
	- allergies,
	- current medications,
	- medical warnings,
	- dental history,
	- risk notes.
- Added the "Edit medical record" action only for clinical edit roles when profile role is available.
- Added optional local verification script:
	- `supabase/snippets/testPatientMedicalRecordWrite.mjs`

### Verification (Task 26)

- `npm run build` passes.
- `npm run lint` passes.
- `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes.
- `node .\supabase\snippets\testAuditInsert.mjs` passes.
- `node .\supabase\snippets\testPatientRlsByRole.mjs` passes.
- `node .\supabase\snippets\testPatientWriteService.mjs` passes.
- `node .\supabase\snippets\testPatientMedicalRecordWrite.mjs` passes:
	- `owner_admin`, `doctor`, and `specialist` can insert/update patient medical records.
	- `assistant`, `reception_admin`, and `inventory_responsible` cannot write patient medical records.
	- allowed writes create `patient_medical_record.created` and `patient_medical_record.updated` audit rows.

### Notes (Task 26)

- Local test scripts create demo-only test rows; run `npx.cmd supabase db reset` to return to seeded-only data.
- Manual browser checks for the new route remain recommended for final UI acceptance.

### Completed (Task 27)

- Implemented patient archive/restore flow.
- Added patient lifecycle service functions in `src/features/patients/patientService.ts`:
	- `archivePatient(patientId)`
	- `restorePatient(patientId)`
- Archive behavior:
	- sets `patients.status = 'archived'`
	- sets `patients.deleted_at` to the archive timestamp
	- keeps data soft-deleted/hidden from normal list behavior
	- does not hard delete patient data
- Restore behavior:
	- sets `patients.status = 'active'`
	- clears `patients.deleted_at`
- Added controlled audit RPC integration for lifecycle changes:
	- `patient.archived`
	- `patient.restored`
	- `entity_type = patient`
	- `entity_id = patient id`
	- old/new values include safe patient subset with status and deleted_at changes
- Added migration `supabase/migrations/20260512120000_relax_patient_update_created_by_check.sql`.
	- Recreated the patient update policy so allowed clinic roles can update clinic patients without being blocked by another user's `created_by` value.
	- Kept `updated_by` constrained to the current profile when provided.
- Updated `PatientDetailPage`:
	- shows archived status clearly,
	- hides regular edit actions for archived patients,
	- shows Archive action for `owner_admin`, `doctor`, and `reception_admin` when patient is not archived,
	- shows Restore action for `owner_admin`, `doctor`, and `reception_admin` when patient is archived,
	- asks for confirmation before archive/restore,
	- keeps user on patient detail after archive/restore,
	- shows success/error states.
- Updated patient reads:
	- normal patient list hides archived patients by default,
	- patient detail can load archived patients by direct URL for restore,
	- Patients page includes a lightweight "Include archived patients" toggle.
- Demo mode remains non-persistent:
	- no `demoPatients` mutation,
	- no localStorage,
	- archive/restore shows `Demo mode only. No archive changes were saved.`
- Added local verification script:
	- `supabase/snippets/testPatientArchiveRestore.mjs`

### Verification (Task 27)

- `npm run build` passes.
- `npm run lint` passes.
- `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes.
- `node .\supabase\snippets\testAuditInsert.mjs` passes.
- `node .\supabase\snippets\testPatientRlsByRole.mjs` passes.
- `node .\supabase\snippets\testPatientWriteService.mjs` passes.
- `node .\supabase\snippets\testPatientMedicalRecordWrite.mjs` passes.
- `node .\supabase\snippets\testPatientArchiveRestore.mjs` passes:
	- `owner_admin`, `doctor`, and `reception_admin` can archive/restore.
	- `specialist`, `assistant`, and `inventory_responsible` cannot archive/restore.
	- allowed archive/restore writes create audit rows.
	- owner can read audit logs; doctor cannot.

### Notes (Task 27)

- Manual browser checks remain recommended for the archive/restore UI flow.
- Local test scripts create demo-only rows; run `npx.cmd supabase db reset` to return to seeded-only data.

---

## Notes

This project should remain structured and incremental.

Do not start coding application features until the core discovery and planning documents are sufficiently defined.









