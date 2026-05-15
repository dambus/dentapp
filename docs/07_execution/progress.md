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

### Completed (Task 28)

- Implemented first clinical notes CRUD flow.
- Added `src/features/patients/clinicalNotesService.ts` with service-layer functions:
	- `getClinicalNotes(patientId)`
	- `getClinicalNoteById(patientId, noteId)`
	- `createClinicalNote(patientId, input)`
	- `updateClinicalNote(patientId, noteId, input)`
	- `archiveClinicalNote(patientId, noteId)`
- Added inline Clinical Notes section on `PatientDetailPage`.
	- Shows active notes only (`deleted_at is null`).
	- Supports note type, optional tooth number, created date, and note content.
	- Provides create/edit/archive actions only to clinical roles.
	- Hides clinical notes entirely for non-clinical roles in the patient detail UI.
- Clinical note write access is clinical-role only in the frontend:
	- allowed: `owner_admin`, `doctor`, `specialist`
	- denied actions hidden for: `assistant`, `reception_admin`, `inventory_responsible`
- Clinical note archive uses soft archive behavior by setting `clinical_notes.deleted_at`.
- Controlled audit RPC integration added for:
	- `clinical_note.created`
	- `clinical_note.updated`
	- `clinical_note.archived`
	- `entity_type = clinical_note`
	- `entity_id = clinical note id`
	- metadata includes `patient_id`
- Demo mode remains non-persistent:
	- no `demoPatients` mutation,
	- no localStorage,
	- create/update/archive returns `Demo mode only. No clinical note changes were saved.`
- Added local verification script:
	- `supabase/snippets/testClinicalNotesCrud.mjs`

### Verification (Task 28)

- `npm run build` passes.
- `npm run lint` passes.
- `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes after loading local Supabase service-role environment from `supabase status -o env`.
- `node .\supabase\snippets\testAuditInsert.mjs` passes.
- `node .\supabase\snippets\testPatientRlsByRole.mjs` passes.
- `node .\supabase\snippets\testPatientWriteService.mjs` passes.
- `node .\supabase\snippets\testPatientMedicalRecordWrite.mjs` passes.
- `node .\supabase\snippets\testPatientArchiveRestore.mjs` passes.
- `node .\supabase\snippets\testClinicalNotesCrud.mjs` passes:
	- `owner_admin`, `doctor`, and `specialist` can create/update/archive clinical notes.
	- `assistant`, `reception_admin`, and `inventory_responsible` cannot create/update/archive clinical notes.
	- allowed clinical note writes create audit rows.
	- owner can read audit logs; doctor cannot.

### Notes (Task 28)

- Create/edit is implemented inline in the patient detail page rather than as separate note routes.
- Clinical note hard delete is intentionally not implemented.
- Visits, odontogram, treatment plans, rich text, and note attachments remain out of scope.

---

### Completed (Task 29)

- Implemented first odontogram foundation.
- Added migration `supabase/migrations/20260512130000_create_patient_tooth_statuses.sql`.
	- Creates `patient_tooth_statuses`.
	- Uses FDI permanent tooth numbers only.
	- Uses constrained MVP status values.
	- Adds one active row per patient/tooth through a partial unique index.
	- Adds `created_by`, `updated_by`, timestamps, and `deleted_at`.
	- Enables RLS.
	- Allows read for `owner_admin`, `doctor`, `specialist`, and `assistant`.
	- Allows writes for `owner_admin`, `doctor`, and `specialist`.
	- Does not add hard-delete policy.
- Added `src/features/patients/odontogramService.ts` with service-layer functions:
	- `getPatientOdontogram(patientId)`
	- `saveToothStatus(patientId, input)`
	- `clearToothStatus(patientId, toothNumber)`
- Clear behavior soft-deletes the active tooth status row by setting `deleted_at`.
- Added inline `OdontogramSection` on `PatientDetailPage`.
	- Shows 32 permanent teeth grouped by quadrant.
	- Shows status and note indicator per tooth.
	- Defaults missing rows to `unknown`.
	- Allows clinical roles to edit tooth status and optional note.
	- Shows assistant role as read-only.
	- Hides odontogram section from reception and inventory roles.
- Controlled audit RPC integration added for:
	- `odontogram.tooth_status.saved`
	- `odontogram.tooth_status.cleared`
	- `entity_type = patient_tooth_status`
	- `entity_id = tooth status row id`
	- metadata includes `patient_id` and `tooth_number`
- Demo mode remains non-persistent:
	- no `demoPatients` mutation,
	- no localStorage,
	- save/clear returns `Demo mode only. No odontogram changes were saved.`
- Added local verification script:
	- `supabase/snippets/testOdontogramCrud.mjs`

### Verification (Task 29)

- `npm run build` passes.
- `npm run lint` passes.
- First `npx.cmd supabase db reset` applied migrations and seed but failed at local storage container readiness.
- Second `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes after loading local Supabase service-role environment from `supabase status -o env`.
- Existing scripts passed in the combined run before the odontogram script:
	- `node .\supabase\snippets\testAuditInsert.mjs`
	- `node .\supabase\snippets\testPatientRlsByRole.mjs`
	- `node .\supabase\snippets\testPatientWriteService.mjs`
	- `node .\supabase\snippets\testPatientMedicalRecordWrite.mjs`
	- `node .\supabase\snippets\testPatientArchiveRestore.mjs`
	- `node .\supabase\snippets\testClinicalNotesCrud.mjs`
- `node .\supabase\snippets\testOdontogramCrud.mjs` passes after fixing the script fixture teeth:
	- `owner_admin`, `doctor`, and `specialist` can read/write/clear tooth statuses.
	- `assistant` can read but cannot write.
	- `reception_admin` and `inventory_responsible` cannot read/write.
	- allowed save/clear writes create audit rows.
	- clear preserves a soft-deleted row.
	- hard delete does not remove rows through RLS.
	- owner can read audit logs; doctor cannot.

### Notes (Task 29)

- The odontogram is intentionally non-graphical in this task.
- Tooth surfaces, primary teeth, procedures, treatment plan links, visits, and clinical note linking remain out of scope.
- Manual browser checks remain recommended for owner/doctor/specialist, assistant read-only, reception hidden, and demo-mode messaging.

---

### Completed (Task 30)

- Added treatment plan foundation tables and RLS in `20260512133000_create_treatment_plans.sql`.
- Added `treatmentPlanService` functions for patient treatment plan and item reads, create/update/archive writes, demo-mode handling, validation, Supabase mapping, and controlled audit RPC calls.
- Added inline Treatment Plans UI on patient detail with plan create/edit/archive and item create/edit/archive forms.
- Added treatment plan read/write role behavior in the UI:
	- owner_admin, doctor, specialist can create/update/archive,
	- assistant and reception_admin can read only,
	- inventory_responsible remains denied by patient route and RLS.
- Added `testTreatmentPlanCrud.mjs` to verify treatment plan/item RLS, soft archive behavior, hard-delete denial, and audit rows.
- Fixed the previously missing medical-record edit route guard registration so the existing route path is available to the router and role matrix.
- Kept demo mode non-persistent with `Demo mode only. No treatment plan changes were saved.`

### Verification (Task 30)

- `npm run build` passes.
- `npm run lint` passes.
- `npx.cmd supabase db reset` applied all migrations and seed; the command ended with a storage container health warning, but `npx.cmd supabase status` confirmed the local API and database were running.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes with local Supabase env variables.
- `node .\supabase\snippets\testAuditInsert.mjs` passes.
- `node .\supabase\snippets\testPatientRlsByRole.mjs` passes.
- `node .\supabase\snippets\testPatientWriteService.mjs` passes.
- `node .\supabase\snippets\testPatientMedicalRecordWrite.mjs` passes.
- `node .\supabase\snippets\testPatientArchiveRestore.mjs` passes after correcting a one-command local env typo.
- `node .\supabase\snippets\testClinicalNotesCrud.mjs` passes.
- `node .\supabase\snippets\testOdontogramCrud.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanCrud.mjs` passes:
	- owner_admin, doctor, specialist can read/write/archive treatment plans and items,
	- assistant and reception_admin can read but cannot write,
	- inventory_responsible cannot read/write,
	- audit rows are created for plan/item create, update, and archive,
	- hard delete remains unavailable and archive preserves rows.

---

## 2026-05-13

### Completed (Task 31)

- Created `docs/04_ux_ui/dental_workflow_model.md`.
- Documented real dental workflow assumptions for doctor-alone, assistant-supported, treatment plan discussion, and dense schedule scenarios.
- Defined pre-treatment, during-treatment, and post-treatment workflow expectations.
- Documented quick actions versus advanced actions and which patient data must be visible immediately.
- Created `docs/04_ux_ui/patient_detail_refactor_plan.md`.
- Planned a future Patient Detail refactor around Patient Snapshot, Today / Appointment Context, Quick Actions, and Full Record.
- Created `docs/04_ux_ui/visit_completion_flow.md`.
- Defined Visit Completion as the primary proposed post-treatment workflow, including performed work, teeth/regions, service selection, generated clinical note, materials, price/discount/override, payment/debt/prepayment, commission, and next step.
- Created `docs/07_execution/patient_ux_refactor_checklist.md`.
- Added a phased future execution checklist for Patient Snapshot, Today Panel, Quick Actions, Full Record organization, Visit Completion prototype, material suggestions, price/debt workflow, commission workflow, and pilot usability testing.
- Updated `docs/07_execution/todo.md` with Patient Detail UX refactor and related workflow tasks.
- Updated `docs/00_project/decisions.md` with workflow-first Patient Detail and Visit Completion product decisions.
- No React application code was changed.
- No database migrations, Supabase policies, or application behavior were changed.

### Notes (Task 31)

- This was a documentation and product/UX planning task only.
- Future implementation should start with Patient Detail UX refactor Phase A - Snapshot, then Phase B - Today Panel, before building the Visit Completion prototype.

---

### Completed (Task 32)

- Created reusable `src/features/patients/PatientSnapshot.tsx`.
- Refactored `PatientDetailPage` so Patient Snapshot appears near the top as the primary patient context block.
- Moved high-priority context into the snapshot:
	- patient identity,
	- age/date of birth,
	- patient status,
	- archived state,
	- allergies,
	- medical warnings,
	- important patient note,
	- active treatment plan summary,
	- last clinical note,
	- next recommended step,
	- last visit and recent visit summary,
	- demo/unpaid balance placeholder with role-aware visibility.
- Preserved existing Patient Detail modules below the snapshot:
	- patient identity/contact detail cards,
	- medical record summary sections,
	- clinical notes CRUD,
	- odontogram section,
	- treatment plans section,
	- documents and timeline placeholders.
- Preserved existing edit patient, edit medical record, archive, and restore behavior by moving those actions into the snapshot.
- Added a "View full record" snapshot action that scrolls to the existing detail sections without introducing a new business workflow.
- Did not add database migrations, database tables, RLS changes, Supabase policies, new dependencies, Visit Completion, Today Panel, payments, materials, or commissions.

### Verification (Task 32)

- `npm run build` passes.
- `npm run lint` passes.
- Supabase reset and RLS script suite were not run because this task only reorganized existing UI display and did not touch database, RLS, service, or persistence behavior.

---

### Completed (Task 33)

- Created reusable `src/features/patients/PatientTodayPanel.tsx`.
- Added the Today / Next Step panel directly below Patient Snapshot on `PatientDetailPage`.
- Displayed current encounter context from already available patient fields:
	- next recommended step,
	- active treatment plan and planned work summary,
	- last clinical note summary,
	- recent visit summary,
	- medical warning reminder,
	- appointment placeholder.
- Kept appointment and visit module data explicit as future placeholders.
- Added a disabled "Complete Visit planned" control to signal the future workflow without implementing Visit Completion.
- Preserved existing Patient Detail sections below the new panel, including medical record summary, clinical notes CRUD, odontogram, treatment plans, archive/restore, documents, and timeline placeholders.
- Did not add database migrations, database tables, RLS changes, Supabase policies, new service queries, new dependencies, scheduling, Visit Completion, payments, materials, or commissions.

### Verification (Task 33)

- `npm run build` passes.
- `npm run lint` passes.
- Supabase reset and RLS script suite were not run because this task only added a presentational UI panel and did not touch database, RLS, service, or persistence behavior.

---

### Completed (Task 34)

- Created reusable `src/features/patients/PatientQuickActions.tsx`.
- Added Quick Actions directly below Today / Next Step and above Full Record on `PatientDetailPage`.
- Added role-aware quick actions:
	- Complete Visit as a planned/disabled action,
	- Add Clinical Note for clinical write roles,
	- Update Odontogram for clinical edit roles,
	- View Odontogram context for assistant,
	- Add Treatment Plan Item entry point for clinical write roles,
	- Edit Medical Record for medical-record edit roles,
	- Add Payment as a planned/disabled action for owner/admin and reception,
	- Schedule Next Appointment as a planned/disabled action for relevant workflow roles.
- Connected working actions only to existing behavior:
	- Edit Medical Record navigates to the existing medical record edit route,
	- Clinical Notes, Odontogram, and Treatment Plans actions scroll to existing sections.
- Added stable Patient Detail section anchors for clinical notes, odontogram, and treatment plans.
- Added archived-patient behavior so modifying quick actions are disabled and the panel tells users to restore the patient first.
- Preserved existing Patient Snapshot, Today Panel, archive/restore, medical record summary, clinical notes CRUD, odontogram, treatment plans, documents, and timeline behavior.
- Did not add database migrations, database tables, RLS changes, Supabase policies, new service queries, new dependencies, Visit Completion, scheduling, payments, materials, or commissions.

### Verification (Task 34)

- `npm run build` passes.
- `npm run lint` passes.
- Supabase reset and RLS script suite were not run because this task only added UI hierarchy, existing-route navigation, and scroll anchors without touching database, RLS, service, or persistence behavior.

---

### Completed (Task 35)

- Created reusable `src/features/patients/PatientFullRecord.tsx`.
- Moved existing detailed Patient Detail modules under the Full Record area below Patient Snapshot, Today / Next Step, and Quick Actions.
- Organized Full Record with local tab-style navigation for:
	- Medical Record,
	- Odontogram,
	- Treatment Plans,
	- Clinical Notes,
	- Documents,
	- Timeline.
- Kept the Medical Record section as the default Full Record tab.
- Preserved existing module internals and behavior:
	- medical record edit route,
	- clinical notes CRUD,
	- odontogram save/clear,
	- treatment plan create/edit/archive,
	- documents placeholder,
	- timeline placeholder.
- Preserved role visibility by passing the existing Patient Detail role flags into `PatientFullRecord`.
- Updated Quick Actions section switching so existing quick actions select the matching Full Record tab before scrolling to the Full Record area.
- Did not add database migrations, database tables, RLS changes, Supabase policies, new service queries, new dependencies, Visit Completion, scheduling, payments, materials, or commissions.

### Verification (Task 35)

- `npm run build` passes.
- `npm run lint` passes.
- Supabase reset and RLS script suite were not run because this task only reorganized existing UI composition without touching database, RLS, service, or persistence behavior.

---

## 2026-05-14

### Completed (Task 37)

- Created `docs/design/task-37-visit-completion-prototype.md`.
- Inspected current appointment/visit model boundaries:
	- no implemented appointment service or appointment table in frontend flow,
	- no implemented visits table or visit service,
	- patient detail uses patient fields for next appointment, active plan, last note, last visit, and next step context,
	- clinical notes, odontogram statuses, and treatment plans already exist as patient-scoped modules.
- Added patient-scoped Visit Completion route:
	- `/patients/:patientId/visit-completion`
	- `getPatientVisitCompletionPath(patientId)`
- Created `VisitCompletionPage`, `VisitCompletionFlow`, and `VisitCompletionSummary`.
- Applied the focused workflow architecture decision:
	- route-based Visit Completion flow,
	- compact patient/visit context,
	- stepper navigation,
	- one main task visible at a time,
	- Back / Next controls,
	- Review & Complete step,
	- final confirmation,
	- local success state.
- Added prototype sections for:
	- patient context,
	- visit context,
	- performed procedures,
	- clinical notes,
	- next step,
	- attachments placeholder,
	- completion summary,
	- complete visit action,
	- validation,
	- confirmation and success state.
- Wired safe navigation from:
	- `PatientQuickActions`,
	- `PatientTodayPanel`.
- Kept completion data local/prototype-only:
	- no Supabase writes,
	- no localStorage writes,
	- no demo patient mutation,
	- no appointment, visit, payment, material, or file record creation.
- Added route access for `owner_admin`, `doctor`, `specialist`, and `assistant`.

### Verification (Task 37)

- `npm run build` passes.
- `npm run lint` passes.
- Visual browser inspection remains recommended for Patient Quick Actions, Today Panel, Visit Completion prototype, and mobile/tablet/desktop widths.
- Supabase reset and RLS script suite were not run because this task adds a local prototype workflow and does not change database schema, RLS, or service persistence.

### Follow-up (Task 37)

- Persist visit completion data.
- Connect performed procedures to treatment plan items.
- Connect follow-up workflow to appointments.
- Add attachments/photos.
- Add audit/history trail.

---

### Completed (Task 38)

- Created `docs/design/task-38-responsive-app-shell-and-workflow-navigation.md`.
- Added Decision 057 documenting the responsive app shell and focused workflow navigation pattern.
- Updated `AppShell` to support mobile navigation drawer state, route-change close behavior, and Escape-key close behavior.
- Reworked main navigation:
	- mobile uses a burger button and fullscreen menu overlay,
	- tablet portrait uses a collapsed icon rail from `md`,
	- desktop uses an expanded sidebar from `xl`,
	- active route highlighting is preserved.
- Updated `TopBar` to avoid crowded mobile status content and expose the mobile menu button.
- Updated Visit Completion workflow navigation:
	- mobile uses a compact sticky progress/status header,
	- mobile hides the large stepper,
	- `sm+` keeps a horizontal stepper,
	- route, local state, validation, confirmation, and success state are preserved.
- No backend persistence, Supabase writes, or database schema changes were added.

### Verification (Task 38)

- `npm run build` passes through `npm.cmd run build`.
- `npm run lint` passes through `npm.cmd run lint`.
- Visit Completion route returns HTTP 200 locally.
- Manual browser responsive checks remain recommended at 375px, 768px, 1024px, and 1280px+.

---

### Completed (Task 38B)

- Created `docs/design/task-38b-responsive-polish-pass.md`.
- Reviewed responsive risks after Task 38 app shell changes.
- Added horizontal overflow containment to the app shell and main content area.
- Tightened mobile TopBar text behavior so diagnostic/status text does not crowd small screens.
- Tightened mobile navigation overlay header truncation and overflow containment.
- Refined Visit Completion mobile workflow header and sticky action spacing:
	- shorter sticky progress header,
	- smaller progress bar,
	- reduced bottom action padding,
	- preserved current step visibility and Back / Next / Complete behavior.
- Documented the current tablet rail text markers as acceptable for now and noted future icon dependency/design-system follow-up.
- No backend persistence, Supabase writes, or database schema changes were added.

### Verification (Task 38B)

- `npm run build` passes through `npm.cmd run build`.
- `npm run lint` passes through `npm.cmd run lint`.
- Route checks return HTTP 200 for `/patients`, `/patients/demo-patient-001`, and `/patients/demo-patient-001/visit-completion`.

---

### Completed (Task 39)

- Created `docs/design/task-39-visit-completion-data-model-and-persistence-plan.md`.
- Inspected existing Supabase migrations, seed data, patient service, clinical notes service, treatment plan service, Visit Completion UI state, PatientTodayPanel, PatientQuickActions, and current routing.
- Confirmed existing schema has patient, medical record, clinical note, odontogram, treatment plan, treatment plan item, audit log, and RLS foundations.
- Confirmed there are no implemented appointment or visit tables yet.
- Documented the appointment vs visit relationship:
	- appointment = scheduled event,
	- visit = clinical record of what happened,
	- a visit may originate from an appointment,
	- completion should not be only an appointment status change.
- Documented current Visit Completion local state fields.
- Proposed minimal persistence model:
	- `visits`,
	- `visit_procedures`,
	- reuse `clinical_notes.visit_id` after `visits` exists.
- Defined draft/completed behavior and future reopen/amend considerations.
- Documented RLS/security expectations using current clinic/profile/role helper pattern.
- Proposed TypeScript service-layer shape for Task 40.
- Prepared recommended Task 40 implementation plan.
- No Supabase writes, database reset, migration application, or production-impacting schema changes were added.

### Verification (Task 39)

- `npm run build` passes through `npm.cmd run build`.
- `npm run lint` passes through `npm.cmd run lint`.

---

### Completed (Task 40A)

- Created `supabase/migrations/20260514190000_create_visit_completion_tables.sql`.
- Added proposed database foundation for Visit Completion:
	- `visits`,
	- `visit_procedures`,
	- foreign key from `clinical_notes.visit_id` to `visits(id)`.
- Added table and column comments following existing migration conventions.
- Added practical indexes for clinic, patient, status, visit date, visit procedure lookup, sort order, and soft archive markers.
- Added `updated_at` triggers using existing `public.update_updated_at_column()`.
- Enabled RLS on `visits` and `visit_procedures`.
- Added clinic-scoped, active-profile-scoped, role-based select/insert/update policies for clinical workflow roles:
	- `owner_admin`,
	- `doctor`,
	- `specialist`,
	- `assistant`.
- Preserved existing `clinical_notes` RLS and documented assistant-role clinical note nuance for the service integration task.
- Created `docs/design/task-40a-visit-completion-migration-and-rls.md`.
- No frontend persistence, VisitCompletionFlow changes, Supabase frontend writes, billing, payment, material, attachment, odontogram, treatment plan mutation, follow-up appointment creation, or audit triggers were added.
- The migration was created only; no `db reset` was run.

### Verification (Task 40A)

- `npm run build` passes through `npm.cmd run build`.
- `npm run lint` passes through `npm.cmd run lint`.
- SQL was reviewed against existing migration conventions, but the migration was not applied locally in this task.

---

### Completed (Task 40B)

- Applied the Visit Completion migration locally with `npx.cmd supabase db reset`.
- Confirmed local reset applied `20260514190000_create_visit_completion_tables.sql`.
- Re-provisioned local demo auth users and profiles with `supabase/snippets/provisionDemoAuthUsers.mjs`.
- Created `supabase/snippets/testVisitCompletionRls.mjs`.
- Smoke test verified:
	- `visits` table is reachable,
	- `visit_procedures` table is reachable,
	- clinical workflow roles can insert/select/update visits,
	- clinical workflow roles can insert/select/update visit procedures,
	- reception and inventory roles cannot read/create visit records,
	- hard delete does not remove visit/procedure rows through RLS,
	- `clinical_notes.visit_id` accepts valid visit IDs for clinical note roles,
	- invalid `clinical_notes.visit_id` is rejected by FK for clinical note roles,
	- assistants can write visits/procedures but remain blocked from clinical note writes.
- Ran `npx.cmd supabase db lint`; no schema errors were found.
- Created `docs/design/task-40b-visit-completion-migration-validation.md`.
- No frontend persistence, VisitCompletionFlow changes, visitCompletionService, billing, payment, materials, attachments, treatment plan mutation, appointment creation, odontogram mutation, or clinical_notes RLS expansion was added.

### Verification (Task 40B)

- `npx.cmd supabase db reset` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `npx.cmd supabase db lint` passes.
- `npm run build` passes through `npm.cmd run build`.
- `npm run lint` passes through `npm.cmd run lint`.

---

### Completed (Task 40C)

- Created `src/features/visits/visitCompletionService.ts`.
- Added Visit Completion service-level types for visit status, next step, procedure input, draft input, normalized draft records, warnings, and write results.
- Implemented `fetchLatestOpenVisitCompletion(patientId)` for loading the latest open Supabase visit draft with procedure rows and linked clinical note when available.
- Implemented `saveVisitCompletionDraft(input)` for creating/updating open visit drafts, saving recommendation and next step, replacing procedure rows, saving permitted clinical note content, linking `visits.clinical_note_id`, and writing visit draft audit events.
- Implemented `replaceVisitProcedures(visitId, patientId, procedures)` using soft-delete replacement semantics for `visit_procedures`.
- Implemented `completeVisit(input)` with the minimum completion rule, draft save-before-complete behavior, `completed_at`, `completed_by`, and visit completion audit logging.
- Kept assistant clinical-note behavior explicit:
	- assistants can persist visits and procedure rows,
	- assistants cannot persist `clinical_notes`,
	- assistant-entered clinical note text returns a structured `clinical_note_permission_denied` warning instead of failing silently.
- Kept demo mode non-persistent with no demo data mutation and no localStorage persistence.
- Did not connect the service to `VisitCompletionFlow`, add autosave, change schema, add frontend Supabase writes from the UI, or add billing/payment/material/attachment/treatment-plan/appointment/odontogram mutation.
- Created `docs/design/task-40c-visit-completion-service-layer.md`.

### Verification (Task 40C)

- `npm run build` passes through `npm.cmd run build`.
- `npm run lint` passes through `npm.cmd run lint`.

---

### Completed (Task 40D)

- Connected the route-based Visit Completion workflow UI to `visitCompletionService`.
- Added open draft loading on `/patients/:patientId/visit-completion` through `fetchLatestOpenVisitCompletion(patientId)`.
- Populated local workflow state from loaded drafts:
	- `visitId`,
	- performed procedure rows,
	- clinical note,
	- recommendation,
	- selected next step,
	- service warnings.
- Added explicit `Save Draft` action with no autosave.
- Wired Save Draft to `saveVisitCompletionDraft`, including returned `visitId`, normalized draft state, saved timestamp, service messages, warnings, and errors.
- Updated final confirmation to call `completeVisit`.
- Kept success state dependent on service success rather than local-only simulation.
- Added loading, saving, and completing UI states.
- Surfaced structured service warnings in the workflow:
	- assistant clinical-note permission limitation,
	- demo mode non-persistent behavior,
	- clinical note unavailable,
	- audit log failure.
- Kept assistant clinical-note limitation visible without changing `clinical_notes` RLS:
	- assistant note-only completion fails,
	- assistant procedure/next-step completion can succeed while warning that note text was not persisted.
- Converted Visit Completion next-step values to the persisted `VisitNextStep` enum values used by the service.
- Preserved focused workflow UX, route, stepper, sticky mobile progress header, confirmation pattern, and local form state.
- Did not add autosave, schema changes, billing/payment/material/attachment persistence, treatment-plan mutation, appointment mutation, follow-up creation, or odontogram mutation.
- Created `docs/design/task-40d-connect-visit-completion-ui-to-persistence.md`.

### Verification (Task 40D)

- `npm run build` passes through `npm.cmd run build`.
- `npm run lint` passes through `npm.cmd run lint`.
- Manual role-based browser verification remains recommended for doctor/specialist/assistant Supabase sessions.

---

### Completed (Task 40E)

- Polished Visit Completion draft lifecycle feedback:
	- loading existing open draft,
	- open draft loaded,
	- no open draft found,
	- successful draft save,
	- persisted Last saved timestamp from `updated_at`,
	- user-friendly save/load/complete error notices.
- Strengthened busy-state handling:
	- Save Draft, Complete Visit, confirmation, step navigation, and editable fields are disabled while loading/saving/completing,
	- save and completion handlers use guarded execution and `try/finally` cleanup,
	- accidental double-submit is blocked by UI disabled states and handler guards.
- Added incomplete procedure-row feedback:
	- rows missing a procedure name are shown as incomplete,
	- incomplete rows are not counted as performed work,
	- users are prompted to add the procedure name or remove the row before completion.
- Updated completion success behavior:
	- completed state no longer returns to an editable review for the completed visit,
	- success state routes back to the patient record,
	- refresh after completion does not reload the completed visit as an open editable draft.
- Confirmed existing auth architecture remains in place:
	- Visit Completion stays behind `ProtectedRoute`,
	- route role access remains limited to owner/admin, doctor, specialist, and assistant clinical workflow roles.
- Preserved focused route-based workflow UX and did not add autosave, billing, payments, materials, attachments, treatment-plan mutation, appointment mutation, odontogram mutation, or new modules.
- Created `docs/design/task-40e-authenticated-browser-persistence-smoke-test-and-ux-polish.md`.

### Verification (Task 40E)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes with local Supabase env values.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- Authenticated headless Chrome browser smoke passed with `doctor.demo@example.test`:
	- authenticated session opened,
	- protected Visit Completion route opened,
	- draft saved with success feedback,
	- saved draft reloaded after browser refresh,
	- edited draft saved and reloaded,
	- visit completed with success state,
	- completed visit did not reload as open editable draft after refresh,
	- browser session persisted during the flow.

### Known Limitations (Task 40E)

- No autosave.
- No draft conflict handling.
- No completed visit amend/reopen workflow.
- Completed visits are persisted but not yet visible in a dedicated patient visit history/timeline.
- Assistant clinical-note persistence remains limited by existing `clinical_notes` RLS.
- Billing, payments, materials, attachments, treatment-plan mutation, appointment mutation, follow-up creation, and odontogram mutation remain intentionally out of scope.

---

### Completed (Task 41)

- Added completed visit history data access through `fetchCompletedVisitsForPatient(patientId)`.
- The completed visit query:
	- loads `completed` visits for the selected patient,
	- orders newest first,
	- hydrates visit procedures,
	- loads linked clinical note content when the current role can read it,
	- respects existing Supabase auth and RLS,
	- returns an empty list in demo mode.
- Created `PatientVisitTimeline` and wired it into the existing Patient Full Record `Timeline` tab.
- Timeline cards show:
	- visit date and completed timestamp,
	- completed status,
	- procedure count,
	- procedure summary and per-procedure details,
	- clinical note,
	- recommendation,
	- next step,
	- clinical note availability warnings when applicable.
- Added timeline UX states:
	- loading,
	- empty,
	- error with retry,
	- long-note and multi-procedure wrapping inside cards.
- Linked Visit Completion success to patient history:
	- success action now reads `View visit history`,
	- completion routes to `/patients/:patientId?section=timeline`,
	- Patient Detail opens the Timeline tab from the `section=timeline` query parameter.
- Refreshed stale Today Panel copy so Visit Completion is no longer described as unimplemented or non-persistent.
- No schema or RLS change was needed.
- Did not add appointments, follow-up scheduling, billing, payments, materials, attachments, treatment-plan mutation, visit editing/deletion, filtering, analytics, or calendar integration.
- Created `docs/design/task-41-visit-history-patient-timeline.md`.

### Verification (Task 41)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- Authenticated headless Chrome smoke passed with `doctor.demo@example.test`:
	- completed a new visit,
	- returned through `View visit history`,
	- confirmed the completed visit appeared in the patient Timeline,
	- confirmed procedure, clinical note, recommendation, and next step were visible,
	- refreshed the patient record and confirmed the timeline persisted,
	- opened another patient with no completed visits and confirmed the empty state.

### Known Limitations (Task 41)

- Timeline is display-only.
- No visit edit, amend, reopen, or delete workflow.
- No filtering/search.
- No appointment or follow-up creation from next step yet.
- No real-time subscriptions.
- Demo mode shows an empty completed-visit timeline because completed visits are stored in Supabase only.
- Assistant users may see clinical-note unavailable warnings where existing `clinical_notes` RLS prevents note reads.

---

### Completed (Task 42)

- Chose the lightweight UI-only follow-up approach.
- No migration, schema change, RLS change, appointment table, task table, or persistent handled/dismissed status was added.
- Added `PatientFollowUpSummary` below the Today / Next Step panel.
- Follow-up summary derives pending follow-up context from completed visits loaded through `fetchCompletedVisitsForPatient(patientId)`.
- A completed visit is treated as follow-up-relevant when it has:
	- a non-empty recommendation, or
	- a `next_step` other than `no_follow_up`.
- The summary shows:
	- latest relevant source visit date,
	- next step label,
	- recommendation text,
	- procedure count,
	- loading state,
	- empty/no pending state,
	- error state with retry.
- Added `View source visit` from the follow-up summary.
- Patient Detail now supports source-visit timeline navigation through:
	- `?section=timeline&visitId=:visitId`.
- Updated `PatientVisitTimeline`:
	- follow-up-relevant visits show a compact warning badge,
	- visits without recommendation/next step stay visually quiet,
	- timeline cards can be highlighted and scrolled into view by `visitId`.
- Preserved Visit Completion and Patient Timeline persistence behavior.
- Did not add full appointment scheduling, calendar integration, reminders, billing, payments, materials, attachments, treatment-plan mutation, recurring reminders, staff assignment, analytics, or advanced filtering/search.
- Created `docs/design/task-42-follow-up-next-step-handling.md`.

### Verification (Task 42)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- Authenticated headless Chrome smoke passed with `doctor.demo@example.test`:
	- empty follow-up state shown,
	- completed visit without recommendation/next step kept the empty follow-up summary,
	- first follow-up visit appeared in the summary and timeline,
	- second follow-up visit superseded the earlier one in the compact summary,
	- both follow-up visits remained visible in the timeline,
	- `View source visit` opened the timeline context,
	- follow-up information remained visible after refresh.

### Known Limitations (Task 42)

- Follow-up state is display-only.
- No persistent handled/dismissed status.
- No appointment or staff task creation.
- No reminders or notifications.
- Compact summary shows only the latest relevant follow-up.
- Older follow-up recommendations remain visible only in the timeline.
- Demo mode does not synthesize follow-up history outside Supabase-backed completed visits.

---

### Completed (Task 43A)

- Created `supabase/migrations/20260515100000_create_appointments.sql`.
- Added `public.appointments` as the appointments foundation table.
- Appointment fields include:
	- `id`,
	- `clinic_id`,
	- `patient_id`,
	- `scheduled_start`,
	- `scheduled_end`,
	- `status`,
	- `reason`,
	- `notes`,
	- `created_by`,
	- `updated_by`,
	- `created_at`,
	- `updated_at`.
- Added appointment status constraint for:
	- `scheduled`,
	- `completed`,
	- `cancelled`,
	- `no_show`.
- Added `scheduled_end > scheduled_start` constraint when `scheduled_end` is present.
- Added indexes for clinic, patient, scheduled start, status, clinic/status, patient/scheduled start, and clinic/scheduled start lookups.
- Added `update_appointments_updated_at` trigger using the existing `update_updated_at_column()` pattern.
- Enabled RLS on `appointments`.
- Added clinic-scoped, active-profile-scoped RLS policies:
	- owner/admin, doctor, specialist, assistant, and reception can view appointments,
	- owner/admin, doctor, specialist, assistant, and reception can create/update appointments,
	- inventory cannot read/create/update appointments,
	- unauthenticated access is blocked,
	- appointment patient must belong to the same clinic as the appointment record.
- No hard delete policy was added.
- Created `supabase/snippets/testAppointmentsRls.mjs`.
- Did not add appointment UI, service layer, calendar, reminders, external calendar sync, billing, or Visit Completion bridge.
- Created `docs/design/task-43a-appointments-data-model-rls.md`.

### Verification (Task 43A)

- Applied migrations locally with `npx.cmd supabase db reset`.
- Re-provisioned local demo users with `node .\supabase\snippets\provisionDemoAuthUsers.mjs`.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes:
	- unauthenticated access is blocked,
	- allowed roles can select/insert/update,
	- inventory role cannot select/insert/update,
	- patient context is checked,
	- invalid status is rejected,
	- invalid end time is rejected,
	- invalid patient context is rejected,
	- hard delete remains unavailable through RLS,
	- `updated_at` changes on update.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` still passes.
- `npx.cmd supabase db lint` passes with no schema errors.
- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.

### Known Limitations (Task 43A)

- No appointment UI.
- No appointment service layer.
- No calendar view.
- No reminder or notification model.
- No external calendar sync.
- No appointment-to-visit linkage yet.
- No Visit Completion bridge.

---

### Completed (Task 43B)

- Created `src/features/appointments/appointmentService.ts`.
- Added appointment service types:
	- `AppointmentStatus`,
	- `Appointment`,
	- `CreateAppointmentInput`,
	- `UpdateAppointmentStatusInput`,
	- `AppointmentWriteResult`.
- Implemented `fetchAppointmentsForPatient(patientId)`:
	- returns all appointments for a patient,
	- orders by `scheduled_start` descending,
	- returns an empty array in demo mode.
- Implemented `fetchUpcomingAppointmentsForPatient(patientId)`:
	- returns future `scheduled` appointments,
	- orders by `scheduled_start` ascending,
	- returns an empty array in demo mode.
- Implemented `createAppointment(input)`:
	- validates patient and schedule input,
	- creates a `scheduled` appointment,
	- derives `clinic_id`, `created_by`, and `updated_by` from the active profile,
	- respects existing appointment RLS,
	- returns a non-persistent demo-mode result outside Supabase mode.
- Implemented `updateAppointmentStatus(input)`:
	- validates appointment id and status,
	- updates only appointment `status` plus `updated_by`,
	- respects existing appointment RLS.
- Created `supabase/snippets/testAppointmentService.mjs`.
- Did not add appointment UI, calendar, reminders, appointment-to-visit bridge, follow-up bridge, billing, or treatment plan mutation.
- Created `docs/design/task-43b-appointment-service-layer.md`.

### Verification (Task 43B)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes.
- `node .\supabase\snippets\testAppointmentService.mjs` passes:
	- authenticated doctor can create an appointment,
	- patient appointment fetch returns the created appointment,
	- upcoming appointment fetch returns the created scheduled future appointment,
	- status update changes the appointment to `completed`.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` still passes.
- `npx.cmd supabase db lint` passes with no schema errors.

### Known Limitations (Task 43B)

- No appointment UI.
- No calendar view.
- No reminder or notification model.
- No appointment-to-visit bridge.
- No follow-up bridge.
- No recurrence, provider, chair, or resource assignment.

---

### Completed (Task 43C)

- Created `src/features/patients/PatientAppointmentSummary.tsx`.
- Added a compact patient appointment section to the patient record:
	- next upcoming appointment,
	- date/time,
	- reason,
	- notes,
	- status badge,
	- loading state,
	- empty state,
	- error state with retry.
- Added appointment creation in patient context:
	- date,
	- time,
	- duration,
	- reason,
	- notes,
	- `scheduled` default status,
	- success and friendly error feedback,
	- summary refresh after create.
- Added basic status actions for the next upcoming appointment:
	- Complete,
	- Cancel,
	- No-show.
- Extended `PatientFollowUpSummary` with a `Schedule appointment` action:
	- scrolls/focuses the appointment form,
	- prefills appointment reason from recommendation or next-step label,
	- does not mark the UI-only follow-up as handled.
- Mounted the appointment summary in `PatientDetailPage` below the follow-up summary.
- Updated appointment fetch services so Supabase query/client errors surface to UI error states instead of being silently treated as empty results.
- Created `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`.
- Created `docs/design/task-43c-patient-appointment-ui-follow-up-bridge.md`.

### Verification (Task 43C)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes:
	- unauthenticated patient route redirects to login,
	- patient with no appointments shows an empty appointment state,
	- follow-up recommendation opens/prefills the appointment form,
	- appointment creation succeeds,
	- refresh keeps the appointment visible,
	- status update succeeds and removes completed appointment from upcoming summary.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` still passes.

### Known Limitations (Task 43C)

- No full calendar view.
- No provider, chair, or resource scheduling.
- No recurring appointments.
- No reminders or notification workflow.
- No external calendar sync.
- No automatic appointment-to-visit conversion.
- Follow-up bridge only prefills appointment reason; it does not persist a handled follow-up state.

---

### Completed (Task 44)

- Added `supabase/migrations/20260515103000_link_visits_to_appointments.sql`.
- Formalized the existing `visits.appointment_id` placeholder:
	- added foreign key to `appointments(id)`,
	- added `on delete set null`,
	- added `visits_appointment_id_idx`,
	- updated column comment.
- Added `fetchAppointmentForPatient(patientId, appointmentId)` to the appointment service.
- Added `Start visit` action to `PatientAppointmentSummary`.
- Kept Visit Completion on the existing patient route and passed appointment context through `?appointmentId=...`.
- Updated `VisitCompletionPage` to read optional appointment context for the current patient.
- Updated `VisitCompletionFlow` to show a compact appointment context notice:
	- scheduled date/time,
	- reason,
	- status.
- Threaded linked `appointmentId` through draft save and completion.
- Updated `completeVisit(input)` so completing a linked visit marks the appointment `completed`.
- Added warning behavior for partial success:
	- if visit completion succeeds but appointment status update fails, the completed visit is preserved and a warning is returned.
- Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to cover the appointment-to-visit bridge.
- Created `docs/design/task-44-appointment-to-visit-workflow-bridge.md`.

### Verification (Task 44)

- `npx.cmd supabase db reset` passes and applies the appointment bridge migration.
- `npx.cmd supabase db lint` passes with no schema errors.
- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\provisionDemoAuthUsers.mjs` passes after reset.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes:
	- unauthenticated route redirects to login,
	- appointment can be created from the patient record,
	- `Start visit` opens Visit Completion with appointment context,
	- visit completes from the linked appointment,
	- completed visit is linked to the appointment,
	- appointment status becomes `completed`,
	- appointment no longer appears as upcoming,
	- completed visit appears in the patient timeline,
	- normal Visit Completion still opens without appointment context.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` still passes.

### Known Limitations (Task 44)

- No full calendar view.
- No provider, chair, or resource scheduling.
- No recurring appointments.
- No reminders or external calendar sync.
- No appointment conflict detection.
- No automatic visit creation before the user starts Visit Completion.
- No completed visit detail/review screen yet.
- No automatic follow-up handled state.

---

### Completed (Task 45)

- Added read-only completed visit review route:
	- `/patients/:patientId/visits/:visitId`.
- Added route access using the existing patient-read role set.
- Created `src/pages/PatientVisitDetailPage.tsx`.
- Added `fetchCompletedVisitById(patientId, visitId)` to `visitCompletionService`.
- Added linked appointment detail loading for completed visit review.
- Updated `PatientVisitTimeline.tsx`:
	- each completed visit card now has a `View details` action.
- Completed visit detail shows:
	- patient context,
	- visit date/status,
	- read-only state,
	- linked appointment context when present,
	- procedure list/details,
	- clinical note,
	- recommendation,
	- next step,
	- back link to patient timeline.
- Handled loading, error, not found, not completed, no-procedure, long-note, and many-procedure states.
- Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to verify completed visit detail review.
- Created `docs/design/task-45-visit-detail-completed-visit-review.md`.

### Verification (Task 45)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes:
	- appointment-to-visit completion still works,
	- completed visit appears in patient timeline,
	- `View details` opens completed visit review,
	- procedure, note, recommendation, and linked appointment context are visible,
	- detail route survives refresh,
	- `Back to timeline` returns to the patient timeline,
	- normal Visit Completion still opens without appointment context.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` still passes.

### Known Limitations (Task 45)

- No print/PDF export yet.
- No visit editing or deletion.
- No audit UI.
- No billing, materials, or attachments.
- No treatment plan mutation.
- Linked appointment context is read-only summary only.

---

### Completed (Task 46)

- Updated `PatientVisitDetailPage.tsx` for print-ready output.
- Added a clear `Print review` action in completed visit review.
- Wired `Print review` to browser print with `window.print()`.
- Ensured visit review print content includes:
	- app/clinic heading,
	- patient context,
	- visit date and completed status,
	- linked appointment context when present,
	- procedures,
	- clinical note,
	- recommendation,
	- next step,
	- generated timestamp.
- Added print utility classes and print-specific layout hooks:
	- hide app shell chrome (sidebar/topbar/mobile drawer),
	- hide page/action controls in print,
	- keep white print background,
	- remove card shadows/background emphasis,
	- improve print section breaks for cards and procedure blocks.
- Updated shell/layout components to support targeted print hiding:
	- `AppShell.tsx`,
	- `TopBar.tsx`,
	- `SidebarNav.tsx`,
	- `PageHeader.tsx`.
- Added print CSS in `src/index.css`.
- Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to verify:
	- `Print review` is visible on completed visit detail,
	- print action is in print-hidden action context,
	- clicking `Print review` triggers print behavior.
- Created `docs/design/task-46-visit-review-print-pdf-preparation.md`.

### Verification (Task 46)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- Follow-up fix: `Print review` now has an explicit `.print-hidden` wrapper in `PatientVisitDetailPage.tsx`, and shell-level `.print-hidden` markers were removed where dedicated print selectors already exist to avoid smoke selector ambiguity.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` is blocked in this environment due to missing `VITE_SUPABASE_URL/SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`.
- `node .\supabase\snippets\testAppointmentService.mjs` is blocked in this environment due to missing Supabase env keys (`VITE_SUPABASE_URL/SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- `node .\supabase\snippets\testAppointmentsRls.mjs` is blocked in this environment due to missing Supabase env keys (`VITE_SUPABASE_URL/SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- `node .\supabase\snippets\testVisitCompletionRls.mjs` is blocked in this environment due to missing Supabase env keys (`VITE_SUPABASE_URL/SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

### Known Limitations (Task 46)

- Browser print/PDF-prep is implemented, but no real PDF file export is implemented.
- No server-side PDF generation.
- No jsPDF/html2canvas download flow.
- No visit edit/delete behavior.
- No email/export distribution workflow.

---

### Completed (Task 47)

- Added new protected route:
	- `/appointments`.
- Added `AppointmentsPage` with a basic operational schedule list view.
- Added `fetchAppointmentsForRange(startDate, endDate)` in `appointmentService`.
- Range fetch behavior:
	- loads appointments in the provided date range,
	- orders by `scheduled_start` ascending,
	- loads patient summary per appointment (`id`, `fullName`) via patient lookup,
	- returns empty list for invalid range input,
	- preserves existing Supabase/demo/error handling patterns.
- Added appointments route access config using existing scheduling role set.
- Added appointments navigation entry for desktop/mobile shell navigation.
- Added appointments sidebar marker (`A`).
- Added appointments page behavior:
	- today by default,
	- date picker plus `Today` and `Tomorrow` controls,
	- loading, error, and empty-date states,
	- card rows with time, patient name, reason fallback, and status badge,
	- `Open patient` action,
	- `Start visit` action for `scheduled` appointments,
	- status actions for `scheduled` appointments (`completed`, `cancelled`, `no_show`).
- Updated browser smoke script to cover basic appointments list workflow checks:
	- `/appointments` loads,
	- appointment appears in list,
	- open patient from list works,
	- empty state appears for far-future date,
	- `Today` returns to populated list,
	- start visit from appointments list continues appointment-to-visit flow.
- Hardened browser smoke robustness for appointments date/empty-state checks:
	- added stable appointments test selectors for date input, loading, empty state, list, and cards,
	- replaced brittle date typing with a dedicated native date setter helper,
	- added date input value synchronization wait before empty-state assertion,
	- switched empty-date assertion to explicit state validation (`dateInputValue`, loading hidden, empty-state visible, zero cards),
	- improved evaluate/wait diagnostics to surface real browser exception details and retry transient page-state errors.
- Created `docs/design/task-47-basic-appointments-list-schedule-view.md`.

### Verification (Task 47)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

### Known Limitations (Task 47)

- This is a list-based schedule view only; no calendar grid/month view.
- No drag/drop scheduling.
- No provider/chair/resource scheduling.
- No recurring appointments.
- No reminders or external calendar sync.
- No billing/analytics expansion.

---

## 2026-05-15

### Completed (Task 48)

- Created `docs/design/task-48-appointment-workflow-polish.md`.
- Added shared appointment display helpers in `src/features/appointments/appointmentDisplay.ts` for status labels, badge variants, and time-range formatting.
- Updated `AppointmentsPage` to use the shared appointment display helper and improve responsive/loading/empty-state polish.
- Updated `PatientAppointmentSummary` to use shared appointment labels/badges and friendlier busy/error handling.
- Updated `VisitCompletionFlow` to use shared appointment labels and wrap-safe appointment context copy.
- Updated `VisitCompletionPage` to gracefully drop stale non-scheduled appointment context and continue visit completion without linking.
- Updated `PatientVisitDetailPage` to use the shared appointment labels for linked appointment context.
- Kept the change focused on presentation consistency and workflow resilience; no new scheduling model or persistence behavior was added.

### Verification (Task 48)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `get_errors` returned no remaining errors for the touched Task 48 files.

### Known Limitations (Task 48)

- No calendar grid or drag/drop scheduling.
- No provider/chair/resource scheduling.
- No reminders, recurring appointments, or external calendar sync.
- No new appointment persistence behavior beyond the existing service layer.

---

## 2026-05-15 (continued)

### Completed (Task 48B — Mobile Workflow Usability Pass)

- `PatientFullRecord`: tab/section navigation changed to a horizontal scroll strip on mobile (`overflow-x-auto flex-nowrap shrink-0`), reverting to wrapped layout on `sm:`.
- `AppointmentsPage`: page description shortened; date controls made non-wrapping with horizontal scroll on mobile; redundant "Starts …" time duplicate line removed from appointment cards.
- `PatientFollowUpSummary`: CardHeader action buttons moved to an inline `flex flex-wrap gap-2 pt-1` row below title/description; footer notice shortened; metric tile grid breakpoint lowered to `sm:`; `break-words` → `wrap-break-word`.
- `PatientAppointmentSummary`: Date/Time/Duration form row breakpoint lowered from `md:grid-cols-3` → `sm:grid-cols-3`; helper text shortened; notes `Textarea` reduced from `min-h-24` → `min-h-16`.
- `VisitCompletionFlow`: step-prompt side box hidden on mobile (`hidden sm:block`); planned-today description text hidden on mobile (`hidden sm:block`).
- `PatientVisitTimeline`: MetricTile grid breakpoint lowered from `md:grid-cols-2` → `sm:grid-cols-2`; procedure list padding tightened; `break-words` → `wrap-break-word` in clinical note and recommendation paragraphs.
- `PatientVisitDetailPage`: visit-header MetricTile grid changed from `md:grid-cols-3` → `sm:grid-cols-2 md:grid-cols-3`.

### Verification (Task 48B)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes (including `break-words` → `wrap-break-word` fixes).
- `get_errors` returned no errors for all touched files.

### Known Limitations (Task 48B)

- No new features or structural redesigns — pure mobile density and readability pass.
- Tablet/desktop layouts unchanged.
- No smoke tests (env vars unavailable in current environment).

---

## 2026-05-15 (continued)

### Completed (Task 49)

- Added read-only appointment detail route:
	- `/appointments/:appointmentId`.
- Created `src/pages/AppointmentDetailPage.tsx`.
- Added route access for existing scheduling roles.
- Added `fetchAppointmentById(appointmentId)` to `appointmentService`.
- Appointment detail service loads:
	- appointment id,
	- patient summary,
	- scheduled start/end,
	- status,
	- reason,
	- notes,
	- created/updated timestamps,
	- latest linked completed visit when present.
- Appointment detail page shows:
	- patient name/context,
	- date/time,
	- status badge,
	- reason,
	- notes,
	- linked completed visit summary.
- Added appointment detail actions:
	- Back to schedule,
	- Open patient,
	- Start visit only for `scheduled` appointments,
	- View completed visit when linked visit exists.
- Added `Details` action to `/appointments` schedule cards.
- Added `Details` action to patient appointment summary.
- Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to verify appointment detail from schedule list and completed appointment detail after visit completion.
- Created `docs/design/task-49-appointment-detail-schedule-item-review.md`.

### Verification (Task 49)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes:
	- appointment detail opens from schedule list,
	- appointment patient/date/status/reason/empty notes are visible,
	- Start visit works from appointment detail,
	- completed appointment detail shows completed status,
	- linked completed visit action appears,
	- completed appointment detail does not show Start visit.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` still passes.

### Known Limitations (Task 49)

- No appointment editing.
- No calendar grid or weekly view.
- No conflict detection.
- No provider/chair/resource scheduling.
- No recurring appointments.
- No reminders or external calendar sync.
- No billing/payment integration.

---

## 2026-05-15 (continued)

### Completed (Task 50)

- Extended `/appointments` with a lightweight schedule view mode switch:
	- Day,
	- Week.
- Kept Day as the default mode.
- Week mode uses existing `fetchAppointmentsForRange(startDate, endDate)`.
- Added Monday-to-Sunday week range calculation.
- Added week range label.
- Added Week navigation:
	- Previous week,
	- This week,
	- Next week,
	- Refresh.
- Preserved Day navigation:
	- date input,
	- Today,
	- Tomorrow,
	- Refresh.
- Refactored `AppointmentsPage` to share the appointment card renderer between Day and Week modes.
- Week mode groups appointments by day and shows compact empty-day states.
- Weekly appointment cards show:
	- time,
	- patient,
	- reason,
	- status badge,
	- Details,
	- Open patient,
	- Start visit only for scheduled appointments,
	- existing status actions for scheduled appointments.
- Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to verify Week mode.
- Created `docs/design/task-50-lightweight-weekly-schedule-view.md`.

### Verification (Task 50)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes:
	- Week mode opens,
	- weekly schedule label appears,
	- created appointment appears in Week mode,
	- seven day groups render,
	- appointment detail opens from a weekly appointment card,
	- existing appointment-to-visit and completed visit detail smoke coverage still passes.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` still passes.

### Known Limitations (Task 50)

- No calendar grid.
- No month view.
- No appointment creation from the schedule page.
- No drag/drop scheduling.
- No provider/chair/resource scheduling.
- No recurring appointments.
- No reminders or external calendar sync.
- No conflict detection.

---

## 2026-05-15 (continued)

### Completed (Task 51)

- Polished appointment creation validation in the service layer and patient appointment form.
- Added short user-facing validation for:
	- missing date,
	- missing time,
	- invalid duration/end time,
	- appointment end before start,
	- overlong reason,
	- overlong notes.
- Added shared appointment reason and notes length constants.
- Trimmed reason and notes before service validation.
- Kept follow-up-to-appointment prefill behavior working.
- Added a synchronous double-submit guard to patient appointment creation so rapid clicks create only one appointment.
- Added stable appointment form test selectors for browser smoke coverage.
- Polished status action handling on appointment detail:
	- Complete,
	- Cancel,
	- No-show.
- Appointment detail status actions now disable while an update is running and show success/failure feedback.
- Added a stale-state guard so Start visit is blocked if an appointment is no longer scheduled.
- Preserved status rules:
	- only scheduled appointments can start a visit,
	- cancelled/completed/no-show appointments do not show Start visit,
	- patient upcoming summary only shows future scheduled appointments,
	- completed linked appointments can still open the completed visit.
- Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to cover:
	- missing date validation,
	- missing time validation,
	- double-submit prevention,
	- cancelled appointment Start visit hiding,
	- existing appointment detail, appointment-to-visit, linked visit, print, and weekly schedule coverage.
- Created `docs/design/task-51-appointment-creation-status-polish.md`.

### Verification (Task 51)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes:
	- appointment creation validation verified,
	- double-submit is harmless,
	- status action feedback verified,
	- cancelled appointment does not show Start visit,
	- scheduled appointment can still start Visit Completion,
	- completed linked appointment does not show Start visit,
	- appointment detail still works.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` still passes.

### Known Limitations (Task 51)

- No appointment editing.
- No appointment deletion.
- No conflict detection.
- No provider/chair/resource scheduling.
- No recurring appointments.
- No reminders or external calendar sync.
- No schedule-page appointment creation.

---

## Notes

This project should remain structured and incremental.

Do not start coding application features until the core discovery and planning documents are sufficiently defined.









