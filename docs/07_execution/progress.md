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

### Fix (Task 51 — Manual Appointment Creation)

- Fixed manual appointment creation from the legacy demo patient route `/patients/demo-patient-002`.
- Root cause: the appointment service was still tied to `VITE_PATIENT_DATA_SOURCE`; when the patient page used demo patient IDs, appointment creation could return before opening the Supabase client, so no network request was made and the UI showed a generic failure.
- Added a small demo-patient-to-seeded-Supabase-ID resolver for appointment persistence so demo patient routes can create appointments against the local seeded patient UUIDs while RLS/session checks still happen in Supabase.
- Removed the patient-data-source gate from appointment fetch/create/status service calls.
- Tightened appointment form timestamp creation to use canonical native input values only:
	- date must be `YYYY-MM-DD`,
	- time must be `HH:mm`,
	- timestamps are built as `${date}T${time}:00`.
- Added development-only appointment-create diagnostics for validation failures and caught exceptions.
- Updated browser smoke coverage to create an appointment through `/patients/demo-patient-002` with:
	- Date: `2026-05-18`,
	- Time: `11:00`,
	- Duration: `30 min`,
	- Reason: `Consultation`,
	- Notes: `Optional note demo`,
	and assert an appointment network request is made, the appointment persists after refresh, and the generic create failure is not shown.

### Verification (Task 51 Fix)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

---

### Follow-up Fix (Task 51 — Appointment Patient Routes)

- Fixed appointment actions that used raw Supabase patient UUIDs in patient routes.
- Root cause: appointment rows correctly store `patient_id` as a Supabase UUID, but the current demo patient routes expect demo slugs such as `demo-patient-002`.
- Centralized patient id conversion in `patientService.ts`:
	- `getPatientPersistenceId(...)` maps demo slugs to seeded Supabase UUIDs for appointment reads/writes,
	- `getPatientRouteId(...)` maps seeded Supabase UUIDs back to demo slugs for app navigation.
- Extended appointment patient summaries with `routeId`.
- Updated `/appointments` list actions:
	- `Open patient`,
	- `Start visit`.
- Updated `/appointments/:appointmentId` detail actions:
	- `Open patient`,
	- `Start visit`,
	- linked completed visit navigation.
- Kept appointment database writes and joins on Supabase UUIDs.
- Updated browser smoke coverage to assert appointment list/detail navigation for demo patient 002 uses `/patients/demo-patient-002`, including Visit Completion routes, and rejects raw UUID patient routes.

### Verification (Task 51 Route Fix)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

---

### Completed (Task 52)

- Created `docs/design/task-52-appointment-module-qa-ux-notes.md`.
- Reviewed appointment module workflows in code and against existing browser smoke coverage:
	- patient appointment summary,
	- appointment creation form,
	- follow-up-to-appointment bridge,
	- `/appointments` Day and Week schedule list,
	- appointment detail page,
	- status actions,
	- start visit from appointment,
	- completed appointment linked to visit,
	- completed visit detail linked appointment context,
	- demo patient persistence/route id behavior.
- Documented a functional QA checklist covering creation, validation, persistence, schedule visibility, detail visibility, status transitions, visit bridge, refresh behavior, and route-id correctness.
- Documented UX notes by severity:
	- no must-fix blockers before broader testing,
	- should-fix-soon items around action density, status confidence, feedback placement, mobile scroll length, schedule readability, detail hierarchy, and wording consistency,
	- nice-to-have later improvements around status history, counters, filtering, navigation, empty-state routing, and mobile action grouping.
- Documented known appointment module limitations:
	- no full calendar,
	- no calendar grid,
	- no provider/chair scheduling,
	- no conflict detection,
	- no reminders,
	- no recurring appointments,
	- no edit/delete,
	- no automatic follow-up handled state,
	- no status history UI.
- No new code fixes were made for Task 52; the review found no small obvious blocker that was safer to patch than document.

### Verification (Task 52)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes after retrying transient Chrome startup/crash failures.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

---

### Completed (Task 52 Visit Completion Demo Route Fix)

- Fixed Visit Completion persistence for seeded demo patient routes such as `/patients/demo-patient-002`.
- Root cause: visit completion service functions still treated route-facing demo slugs as non-persistent IDs and gated writes before resolving them to seeded Supabase patient UUIDs.
- Updated visit completion service boundaries to resolve patient route IDs through `getPatientPersistenceId(...)` before fetching open drafts, saving drafts, replacing procedures, completing visits, marking linked appointments completed, and loading completed visit history/detail.
- Kept patient route slugs for navigation/display while using Supabase UUIDs for visit persistence.
- Updated browser smoke coverage to complete both an ad-hoc demo-slug visit and an appointment-linked demo-slug visit, assert `/rest/v1/visits` requests are made, reject the demo-only persistence warning, and verify the linked appointment becomes completed.

### Verification (Task 52 Visit Completion Demo Route Fix)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

---

### Completed (Task D1 - Design System Icon & Action Pattern)

- Added `lucide-react` as the single icon pack for DentApp UI work.
- Added shared UI primitives:
	- `IconButton`,
	- `ActionMenu`,
	- `StatusBadge`,
	- `TypeBadge`.
- Documented the action hierarchy pattern in `docs/design/task-d1-design-system-icon-action-pattern.md`:
	- primary actions stay visible as labeled buttons,
	- common secondary actions may remain visible,
	- less common/destructive/status actions move into overflow,
	- icon-only buttons require accessible labels,
	- appointment cards should not expose four or five equal-weight buttons.
- Applied the pattern lightly to appointment surfaces:
	- `/appointments` cards keep `Start visit`, `Details`, and `Open patient` visible while status actions move into `ActionMenu`,
	- patient appointment summary keeps `Details` and `Start visit` visible while status actions move into `ActionMenu`,
	- appointment detail keeps navigation and `Start visit` visible while status actions move into `ActionMenu`.
- Updated browser smoke coverage for the status action menu path.

### Verification (Task D1)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes with `CHROME_PATH` pointed at Edge Chromium after local Chrome target-startup crashes.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

### Next Recommended Task

- Task D2 - Appointment Card Redesign.

---

### Completed (Task D2 - Appointment Card Redesign)

- Added reusable `AppointmentCard` for scan-focused appointment surfaces.
- Improved appointment card hierarchy:
	- time range is now the strongest visual element,
	- patient name is more prominent and can open the patient record,
	- reason is shown as a compact `TypeBadge`,
	- status uses `StatusBadge`,
	- provider placeholder is present without changing the data model,
	- primary action remains visible.
- Applied the redesigned card to:
	- `/appointments` daily/weekly appointment lists,
	- patient appointment summary.
- Kept appointment status actions in `ActionMenu`.
- Kept `Start visit` visible only for scheduled appointments.
- Kept `Details` visible as the common secondary action.
- Updated browser smoke helpers for overflow-menu patient navigation.

### Verification (Task D2)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

---

### Completed (Task D3 - Appointment Type & 15-Min Duration Standardization)

- Added frontend appointment type configuration in `src/features/appointments/appointmentTypes.ts`.
- Added standardized 15-minute duration options:
	- 15,
	- 30,
	- 45,
	- 60,
	- 75,
	- 90,
	- 120 minutes.
- Updated patient appointment creation form:
	- added appointment type select,
	- selecting type updates duration to the type default,
	- duration select now uses the standardized options,
	- reason/context remains optional free text.
- Kept persistence in the existing `appointments.reason` field:
	- custom reason/context is stored when provided,
	- selected type label is stored when reason/context is empty.
- Updated appointment card type display to detect known types from reason text and use configured `TypeBadge` variants.
- Kept follow-up scheduling behavior predictable:
	- copied recommendation context still populates reason/context,
	- likely type is inferred with `Control` as the fallback,
	- follow-up is not marked handled.
- Documented the no-migration limitation in `docs/design/task-d3-appointment-type-duration-standardization.md`.
- Updated browser smoke coverage for type selection and duration default behavior.

### Verification (Task D3)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes with `CHROME_PATH` pointed at Edge Chromium after local Chrome DevTools startup failed.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

### Next Recommended Task

- Task D5 - Patient Detail Mobile Navigation Redesign.

---

### Completed (Task D5 - Patient Detail Mobile Navigation Redesign)

- Replaced the mobile horizontal Full Record section strip with a labeled native section selector.
- Kept desktop/tablet section tabs intact from `sm` upward.
- Kept existing patient detail section state and `?section=` query behavior:
	- mobile selector updates the same section state,
	- direct links such as `?section=timeline` still initialize the section,
	- non-timeline section changes still clear `visitId`.
- Used actual available Full Record sections only:
	- Medical,
	- Odontogram,
	- Plans,
	- Notes,
	- Documents,
	- Timeline.
- Added smoke coverage for the mobile selector at a mobile viewport width.
- Documented the pattern in `docs/design/task-d5-patient-detail-mobile-navigation-redesign.md`.

### Verification (Task D5)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes with `CHROME_PATH` pointed at Edge Chromium after local Chrome target-startup crashes.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

### Next Recommended Task

- Task D6 - Visit Completion Mobile Sticky Progress.

---

### Completed (Task D6 - Visit Completion Mobile Sticky Progress)

- Improved Visit Completion mobile orientation without changing persistence logic.
- Added a mobile-only sticky workflow header showing:
	- Visit Completion,
	- current step count,
	- current step label/title,
	- compact accessible progress bar.
- Added a mobile-first bottom action bar for editing state:
	- Back,
	- Save Draft,
	- Next,
	- Complete Visit on the final step.
- Added a sticky confirmation action bar for confirmation state:
	- Confirm completion,
	- Continue review.
- Kept desktop/tablet workflow layout stable with the existing stepper and static actions.
- Preserved existing handlers for draft save, completion, appointment-linked completion, warnings, errors, and completion success.
- Updated browser smoke coverage to assert the Visit Completion progress/action elements render.
- Documented the pattern in `docs/design/task-d6-visit-completion-mobile-sticky-progress.md`.

### Verification (Task D6)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes with `CHROME_PATH` pointed at Edge Chromium.
- `node .\supabase\snippets\testAppointmentService.mjs` passes.
- `node .\supabase\snippets\testAppointmentsRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 40E Follow-up - Authenticated Browser Persistence Smoke and UX Polish)

- Tightened Visit Completion persistence feedback for:
	- draft loaded vs no draft found,
	- Save Draft pending and saved states,
	- saved timestamp clarity,
	- Complete Visit pending state,
	- clinical-note permission warning recovery.
- Added stable Visit Completion selectors for the persistence smoke path.
- Expanded the authenticated browser smoke to verify:
	- login as the demo doctor,
	- appointment detail Start visit route,
	- procedure and clinical note entry,
	- explicit Save Draft,
	- saved/draft timestamp feedback,
	- route refresh,
	- draft reload with persisted values,
	- Complete Visit,
	- completed visit visibility in the patient timeline and detail view.
- Preserved the route-based guided workflow and existing mobile/tablet/desktop app shell behavior.
- Kept patient context above the stepper; mobile sticky progress remains below that context in document order.
- No autosave, billing, payments, material consumption, attachments, treatment-plan mutation, odontogram mutation, or schema changes were added.
- Updated `docs/design/task-40e-authenticated-browser-persistence-smoke-test-and-ux-polish.md`.

### Verification (Task 40E Follow-up)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase URL, anon key, and service key loaded in the shell.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 41 - Appointments to Visit Completion Handoff Polish)

- Reviewed the existing Appointment Detail `Start visit` path and kept the route-based handoff.
- Added a concise appointment handoff notice on Appointment Detail:
	- Start visit opens Visit Completion with appointment context,
	- Save Draft keeps the appointment scheduled,
	- Complete Visit marks the linked appointment completed.
- Improved Visit Completion appointment context above the stepper/mobile sticky progress:
	- scheduled date/time,
	- patient,
	- reason/type,
	- appointment status,
	- provider availability note.
- Confirmed the current appointment model has lifecycle status support but no assigned-provider field.
- Changed open-draft loading so appointment-started Visit Completion looks for an open draft tied to the appointment ID.
- Added clearer appointment-specific draft loaded / ready-to-start feedback.
- Added post-completion actions:
	- View patient timeline,
	- Return to appointment,
	- Daily schedule.
- Expanded the authenticated browser smoke for appointment context details and post-completion actions.
- No autosave, billing, payments, materials, attachments, treatment-plan mutation, appointment schema changes, or admin CRUD conversion were added.
- Documented the task in `docs/design/task-41-appointments-visit-completion-handoff-polish.md`.

### Verification (Task 41)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase URL, anon key, and service key loaded in the shell.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 42 - Completed Visit Record and Timeline Clinical Polish)

- Polished completed visit timeline cards so they read as clinical records:
	- completed visit title/date,
	- completed status,
	- appointment-linked source badge,
	- provider/completed-by label when readable,
	- performed work summary,
	- procedure list,
	- clinical note,
	- recommendation,
	- next step,
	- warning notices.
- Polished completed visit detail view:
	- overview with patient, visit date, next step, provider, completed status,
	- linked appointment context,
	- readable procedure section,
	- clinical note and recommendation sections,
	- warning states.
- Improved timeline empty/error/no-procedure/no-note copy so it reads as user-facing clinical state.
- Added completed-by profile lookup in the Visit Completion service; falls back cleanly when not readable.
- Expanded the authenticated browser smoke with stable completed-visit card/detail checks.
- No autosave, billing, payments, materials, attachments, treatment-plan mutation, schema changes, or patient-record architecture rewrite were added.
- Documented the task in `docs/design/task-42-completed-visit-record-timeline-clinical-polish.md`.

### Verification (Task 42)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase URL, anon key, and service key loaded in the shell.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 43 - Appointment Lifecycle and Daily Schedule Polish)

- Reviewed existing lifecycle data:
	- appointment statuses: scheduled, completed, cancelled, no_show,
	- appointment date/time, patient, reason/notes,
	- appointment-linked visits through `visits.appointment_id`,
	- open Visit Completion states: draft, in_progress,
	- completed Visit Completion state: completed.
- Added appointment service read summaries for appointment-linked open and completed visits.
- Polished daily/weekly schedule appointment cards:
	- ready-to-start state for scheduled appointments without linked visits,
	- visit-in-progress state for linked draft/in-progress visits,
	- Continue visit primary action for linked open drafts,
	- completed linked visit state with View visit action,
	- no primary clinical action for cancelled/no-show appointments.
- Polished Appointment Detail lifecycle messaging:
	- lifecycle panel,
	- ready-to-start message,
	- in-progress draft message,
	- completed linked visit state,
	- Continue visit action when a linked draft exists.
- Expanded the authenticated browser smoke for ready/in-progress/completed lifecycle states in Appointment Detail and daily schedule.
- No autosave, billing, payments, materials, attachments, treatment-plan mutation, schema changes, or broad appointments redesign were added.
- Documented the task in `docs/design/task-43-appointment-lifecycle-daily-schedule-polish.md`.

### Verification (Task 43)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase URL, anon key, and service key loaded in the shell.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 48 - Treatment Plan Read-only Foundation)

- Confirmed treatment plan data/schema already exists:
	- `treatment_plans`,
	- `treatment_plan_items`,
	- `treatmentPlanService`,
	- existing patient full record `TreatmentPlansSection`.
- Added read-only `PatientTreatmentPlanSummary` to the patient overview clinical
  area:
	- primary treatment plan title/status,
	- planned item count,
	- proposed total when available,
	- created date,
	- compact planned item list,
	- empty state when no plan exists,
	- link to the existing full treatment plan section.
- Updated patient quick actions:
	- treatment plan shortcut now reads `Treatment Plan`,
	- available to treatment-plan read roles,
	- button label is `View treatment plan`,
	- copy no longer implies creation from the overview.
- Expanded browser smoke coverage to verify the patient overview treatment plan
  summary and treatment plan entry point.
- No treatment-plan mutation, automatic conversion from completed visits,
  billing, payments, materials, attachments, reminders/tasks, provider assignment
  schema, broad patient redesign, or new schema was added.
- Documented the task in
  `docs/design/task-48-treatment-plan-read-only-foundation.md`.

### Verification (Task 48 - Treatment Plan Read-only Foundation)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase URL, anon key, and service key loaded in the shell.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 47 - Appointment Creation Flow Polish)

- Polished the existing patient-level appointment creation form in
  `PatientAppointmentSummary`:
	- clearer `Create appointment` section title,
	- follow-up context badge and notice when launched from follow-up guidance,
	- date/time/type/duration controls kept prominent,
	- editable reason/context and notes fields,
	- mobile-friendly spacing and action sizing,
	- `Cancel` action to reset local form state.
- Improved follow-up prefill behavior:
	- reason is prefilled from follow-up guidance,
	- user can edit the reason,
	- a new prefill request does not overwrite an already edited reason,
	- URL/search-param based prefill remains supported through `PatientDetailPage`.
- Improved post-create behavior:
	- success feedback is clear,
	- created appointment is stored in component state,
	- `View appointment` opens the appointment detail page,
	- patient upcoming appointments refresh after create.
- Updated browser smoke coverage to verify follow-up prefill, manual appointment
  creation, post-create success feedback, appointment detail access, and existing
  patient/schedule visibility.
- No autosave, billing, payments, materials, attachments, treatment-plan
  mutation, automatic appointment creation, reminders/tasks, new follow-up
  schema, provider assignment schema, broad scheduling redesign, or global
  calendar redesign was added.
- Documented the task in
  `docs/design/task-47-appointment-creation-flow-polish.md`.

### Verification (Task 47 - Appointment Creation Flow Polish)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase URL, anon key, and service key loaded in the shell.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 46 - Follow-up Scheduling Entry Point)

- Confirmed appointment creation already exists in the patient detail appointment
  panel through `PatientAppointmentSummary` and `appointmentService.createAppointment`.
- Added `getPatientFollowUpSchedulingPath(patientId, reason)` to route follow-up
  scheduling intent back to the existing patient appointment form.
- Updated `PatientDetailPage` to read `scheduleFollowUp=true` and optional
  `reason` query params, scroll to the appointment panel, and prefill the
  existing appointment reason field.
- Added consistent `Schedule follow-up` actions to:
	- patient overview `PatientFollowUpSummary`,
	- completed visit detail Follow-up Guidance,
	- completed visit timeline follow-up cards,
	- completed appointment detail follow-up section.
- Kept the action non-automatic:
	- it only navigates/prefills,
	- the user must still choose appointment details and submit the existing
	  appointment form,
	- no appointment is created by clicking `Schedule follow-up`.
- Expanded `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to verify
  follow-up scheduling action visibility and prefill routing into the existing
  patient appointment creation flow.
- No autosave, billing, payments, materials, attachments, treatment-plan
  mutation, automatic appointment creation, reminders/tasks, new follow-up
  schema, fake scheduled appointments, broad appointment redesign, or broad
  patient redesign was added.
- Documented the task in
  `docs/design/task-46-follow-up-scheduling-entry-point.md`.

### Verification (Task 46 - Follow-up Scheduling Entry Point)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase URL, anon key, and service key loaded in the shell.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 45 - Patient Overview Clinical Summary Polish)

- Polished the patient detail overview hierarchy:
	- patient snapshot remains first,
	- Today / Active Workflow is directly below identity,
	- latest clinical activity now follows active workflow,
	- follow-up / next step remains close to current clinical context,
	- appointment, quick action, and full timeline/deeper record access stay lower
	  on the page.
- Updated `PatientTodayPanel`:
	- loads today's patient appointment when safely available,
	- loads latest open Visit Completion draft/in-progress visit,
	- detects completed-today visit state from completed Visit Completion records,
	- switches primary action between Start visit, Continue visit, and View
	  completed visit,
	- includes View appointment when today's appointment exists.
- Added `PatientLatestClinicalActivity`:
	- latest completed visit date/status,
	- procedure count and procedure summary,
	- clinical note excerpt,
	- links to completed visit detail and patient timeline.
- Polished `PatientFollowUpSummary`:
	- hides empty no-follow-up placeholder,
	- clarifies source visit date,
	- avoids noisy recommendation fallback copy,
	- keeps follow-up display-only and non-mutating.
- Updated `PatientQuickActions`:
	- removed unavailable payment placeholder,
	- replaced scheduling placeholder with the existing appointment panel action,
	- added timeline access,
	- kept current role-aware clinical shortcuts.
- Expanded `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` with stable
  patient overview checks for latest clinical activity, follow-up/next step,
  source visit date, visit detail access, and timeline access.
- No autosave, billing, payments, materials, attachments, treatment-plan
  mutation, automatic appointment creation, reminders/tasks, new follow-up
  schema, or broad patient module redesign was added.
- Documented the task in
  `docs/design/task-45-patient-overview-clinical-summary-polish.md`.

### Verification (Task 45 - Patient Overview Clinical Summary Polish)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  after rerunning a transient manual appointment create wait timeout.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase URL, anon key, and service key loaded in the shell.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 55 - Appointment Lifecycle Service/Test Cleanup)

- Kept appointment lifecycle behavior unchanged.
- Cleaned lifecycle service helpers:
	- kept `canUpdateAppointmentLifecycle` as the shared eligibility helper,
	- added `APPOINTMENT_LIFECYCLE_UNAVAILABLE_MESSAGE`,
	- added `getAppointmentLifecycleSuccessMessage`.
- Reused shared lifecycle copy in:
	- Appointment Detail,
	- daily/weekly Appointments page,
	- Patient Appointment Summary.
- Preserved the Task 54 `updateAppointmentStatus` guard behavior:
	- direct status updates only support `cancelled` and `no_show`,
	- manual `completed` status remains blocked,
	- clinic scoping remains intact,
	- linked open/completed Visit Completion checks remain intact.
- Cleaned browser smoke structure:
	- centralized appointment card/action selectors,
	- extracted appointment card snapshots,
	- extracted appointment card menu opening,
	- extracted reusable appointment card-state waits.
- Preserved smoke coverage for scheduled secondary actions, cancel/no-show
  transitions, linked draft hiding, completed appointment behavior, and the
  existing Visit Completion happy path.
- No schema changes, new lifecycle states, provider assignment, check-in/in-room
  states, autosave, billing/payments/materials/attachments, treatment-plan
  mutation, reminders, tasks, broad UI redesign, or smoke coverage removal were
  added.
- Documented the task in
  `docs/design/task-55-appointment-lifecycle-service-test-cleanup.md`.

### Verification (Task 55)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 56 - Treatment Plan Detail Read-only Polish)

- Confirmed the treatment plan foundation already existed:
	- `treatment_plans`,
	- `treatment_plan_items`,
	- `treatmentPlanService`,
	- patient full-record `TreatmentPlansSection`,
	- overview `PatientTreatmentPlanSummary`.
- Polished the patient full-record treatment plan section as a read-only
  clinical planning reference:
	- plan title/status,
	- created date,
	- planned item count,
	- proposed total when available,
	- planned item list,
	- item status,
	- item notes/description when available.
- Updated treatment plan reads to use existing demo treatment-plan context for
  non-UUID demo patient IDs instead of attempting a Supabase UUID query.
- Removed patient-detail treatment plan mutation controls from this surface:
	- create/edit/archive plan,
	- add/edit/archive item.
- Aligned summary/detail/quick-action wording:
	- `Treatment Plan`,
	- `View treatment plan`,
	- `Read-only`.
- Improved treatment-plan section states:
	- loading treatment plans,
	- no treatment plan configured,
	- failed to load treatment plans,
	- treatment plan exists but has no planned items.
- Updated browser smoke coverage for summary-to-detail navigation and stable
  read-only treatment-plan detail/empty/no-items display.
- No treatment-plan mutation, automatic conversion from completed visits,
  billing, payments, materials, attachments, reminders/tasks, provider
  assignment, fake treatment plans, broad patient redesign, or schema changes
  were added.
- Documented the task in
  `docs/design/task-56-treatment-plan-detail-read-only-polish.md`.

### Verification (Task 56)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local Supabase env from `npx supabase status -o env` and
  `DENTAPP_APP_URL=http://localhost:5173`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase env from `npx supabase status -o env`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 57 - Treatment Plan Data/RLS Smoke Coverage Review)

- Reviewed existing treatment plan schema/RLS:
	- `treatment_plans` is scoped by `clinic_id`, `patient_id`, status, totals,
	  timestamps, and `deleted_at`,
	- `treatment_plan_items` is scoped by `clinic_id`, `patient_id`,
	  `treatment_plan_id`, tooth/service context, status, price, ordering,
	  timestamps, and `deleted_at`,
	- treatment plan read roles are `owner_admin`, `doctor`, `specialist`,
	  `assistant`, and `reception_admin`,
	- `inventory_responsible` has no treatment plan read policy.
- Found a narrow RLS integrity gap: treatment plan item policies were
  clinic/role scoped but did not explicitly require the item row to match its
  parent treatment plan by plan, clinic, and patient.
- Added minimal RLS hardening migration:
  `20260521130000_harden_treatment_plan_item_rls_parent_scope.sql`.
	- item select/insert/update now require a matching non-archived parent
	  `treatment_plans` row with the same `treatment_plan_id`, `clinic_id`, and
	  `patient_id`.
- Reviewed `treatmentPlanService`:
	- real Supabase UUID patient reads use RLS-protected Supabase queries,
	- treatment plan reads are patient scoped and exclude `deleted_at`,
	- item reads are limited to returned treatment plan IDs and exclude
	  `deleted_at`,
	- non-UUID demo slug fallback only uses existing demo context and does not
	  bypass Supabase authorization for real UUID patients,
	- read-only patient UI no longer exposes treatment plan mutation controls.
- Added focused read RLS smoke:
  `supabase/snippets/testTreatmentPlanReadRls.mjs`.
	- verifies owner_admin, doctor, assistant, and reception can read in-clinic
	  treatment plans/items,
	- verifies inventory cannot read treatment plans/items,
	- verifies out-of-clinic treatment plans/items are hidden,
	- verifies mismatched parent-plan items are hidden.
- Updated browser smoke treatment-plan check to verify the read-only section
  has no `Create treatment plan`, `Edit plan`, or `Add item` controls.
- No treatment-plan mutation UI, automatic conversion from completed visits,
  billing, payments, materials, attachments, reminders/tasks, provider
  assignment, fake treatment plans for product data, broad patient redesign, or
  broad schema changes were added.
- Documented the task in
  `docs/design/task-57-treatment-plan-data-rls-smoke-coverage-review.md`.

### Verification (Task 57)

- `npx supabase migration up` applied
  `20260521130000_harden_treatment_plan_item_rls_parent_scope.sql` locally.
- `npm.cmd run build` passes with the existing Vite chunk-size warning and a
  Tailwind plugin timing warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  Supabase env from `npx supabase status -o env`.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local Supabase env from `npx supabase status -o env` and
  `DENTAPP_APP_URL=http://localhost:5173`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase env from `npx supabase status -o env`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 58 - Provider Assignment Planning / Data Model Decision)

- Reviewed provider-related schema and code surfaces:
	- `profiles` already represents clinic users with role and status,
	- appointment rows are clinic/patient/schedule scoped but have no provider,
	  assignee, doctor, owner, or resource field,
	- visits already track actual completion identity through `completed_by`,
	- appointment services and UI currently have no provider assignment data,
	- Treatment Plan read-only surfaces are not provider-aware and do not need
	  changes for the minimal appointment assignment model.
- Confirmed current provider-related UI is placeholder/context-only:
	- Appointment cards show `Provider TBD`,
	- Visit Completion appointment context shows `Not assigned in appointment
	  record`,
	- completed visit timeline/detail show completed-by context when profile
	  metadata is readable.
- Recommended the next implementation use nullable
  `appointments.assigned_provider_id`.
	- FK target: `public.profiles(id)`.
	- Delete behavior: `on delete set null`.
	- Allowed assignment target for new writes: active same-clinic `doctor` or
	  `specialist` profile.
	- Recommended index:
	  `appointments(clinic_id, assigned_provider_id, scheduled_start)`.
- Documented why `assigned_provider_id` is preferred over `provider_id` and
  `doctor_id`:
	- it clearly describes planned appointment assignment,
	- it stays distinct from `visits.completed_by`,
	- it supports specialists without narrowing the model to doctors only.
- Identified an important RLS/read-path consideration:
	- current profile RLS lets users read their own profile and owner/admins read
	  clinic profiles,
	- provider-name display for doctors, specialists, assistants, and reception
	  users will need either a limited same-clinic provider-profile read policy
	  or a secure view/RPC.
- Documented implementation impact for appointment creation, appointment
  service types/selects, appointment cards, appointment detail, patient
  appointment summary, Visit Completion appointment context, and smoke fixtures.
- Documented the testing plan for provider assignment implementation:
	- same-clinic doctor/specialist assignment,
	- optional null provider,
	- cross-clinic denial,
	- inactive/wrong-role provider denial,
	- role behavior across scheduling roles,
	- appointment display and Visit Completion context checks,
	- preservation of existing appointment lifecycle and Visit Completion smoke.
- No schema migration, RLS policy, provider assignment behavior, check-in/in-room
  state, billing/payments/materials/attachments, treatment-plan mutation,
  reminders/tasks, provider workload calendar, automatic assignment, fake
  provider data, or broad scheduling redesign was added.
- Documented the task in
  `docs/design/task-58-provider-assignment-planning-data-model-decision.md`.

### Verification (Task 58)

- `npm.cmd run build` passes with the existing Vite chunk-size warning and a
  Tailwind plugin timing warning.
- `npm.cmd run lint` passes.

### Next Recommended Task

- Provider Assignment implementation for appointments, using the Task 58 data
  model and RLS decision.

---

### Completed (Task 59 - Appointment Provider Assignment Schema/RLS Foundation)

- Added migration
  `supabase/migrations/20260521143000_add_appointment_assigned_provider.sql`.
- Added nullable `appointments.assigned_provider_id`.
	- FK target: `public.profiles(id)`.
	- Delete behavior: `on delete set null`.
	- No existing appointments were backfilled.
- Added provider scheduling lookup index:
  `appointments_clinic_provider_scheduled_start_idx` on
  `(clinic_id, assigned_provider_id, scheduled_start)`.
- Added `public.is_valid_appointment_assigned_provider(uuid, uuid)`:
	- allows null assignment,
	- allows active same-clinic `doctor` profiles,
	- allows active same-clinic `specialist` profiles,
	- rejects cross-clinic profiles,
	- rejects inactive/suspended profiles,
	- rejects assistant, reception, inventory, and other non-provider roles.
- Added trigger function `public.enforce_appointment_assigned_provider()` and
  trigger `enforce_appointment_assigned_provider`.
	- The trigger enforces provider validity before appointment insert and before
	  updates to `clinic_id` or `assigned_provider_id`.
	- This protects the invariant even for privileged writes that bypass RLS.
- Recreated appointment insert/update RLS policies with the existing role,
  clinic, patient, created-by, and updated-by checks plus the new provider
  validation helper in `with check`.
- Added focused smoke coverage:
  `supabase/snippets/testAppointmentProviderAssignmentRls.mjs`.
	- owner/admin can create/update with active same-clinic doctor provider,
	- owner/admin can create/update with active same-clinic specialist provider,
	- null provider assignment is allowed,
	- cross-clinic doctor assignment is blocked,
	- inactive doctor assignment is blocked,
	- suspended specialist assignment is blocked,
	- assistant/reception/inventory assignment is blocked,
	- inventory cannot update assignment through existing appointment RLS,
	- changing appointment assignment does not change `visits.completed_by`.
- Documented that Task 60/provider UI work still needs a safe provider display
  read path:
	- limited same-clinic provider profile read policy, or
	- secure provider display view/RPC.
- No provider assignment UI, appointment form provider dropdown, provider
  display wiring, automatic provider assignment, provider workload calendar,
  check-in/in-room/ready-for-doctor state, billing/payments/materials/
  attachments, treatment-plan mutation, reminders/tasks, fake provider data, or
  broad profile RLS opening was added.
- Documented the task in
  `docs/design/task-59-appointment-provider-assignment-schema-rls-foundation.md`.

### Verification (Task 59)

- `npx.cmd supabase migration up` applied
  `20260521143000_add_appointment_assigned_provider.sql` locally.
- `npm.cmd run build` passes with the existing Vite chunk-size warning and a
  Tailwind plugin timing warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local Supabase env from `npx supabase status -o env`.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local Supabase env from `npx supabase status -o env` and
  `DENTAPP_APP_URL=http://localhost:5173`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase env from `npx supabase status -o env`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  Supabase env from `npx supabase status -o env`.

### Next Recommended Task

- Provider assignment service/read-path and UI wiring, including a safe provider
  display profile policy or secure view/RPC.

---

### Completed (Task 60 - Appointment Provider Assignment Service/UI Wiring)

- Added migration
  `supabase/migrations/20260521150000_create_assignable_appointment_providers_rpc.sql`.
- Added safe provider display/options read path:
	- `public.get_assignable_appointment_providers()`,
	- returns only `id`, `full_name`, and `role`,
	- returns active same-clinic `doctor` and `specialist` profiles,
	- available only to active appointment scheduling/read roles,
	- does not broaden general `profiles` table read access.
- Updated `appointmentService`:
	- appointment reads include `assigned_provider_id`,
	- appointment mappers expose `assignedProvider`,
	- added `AppointmentProviderSummary`,
	- added `fetchAssignableAppointmentProviders()`,
	- added provider display hydration for patient, schedule, and detail reads,
	- added optional `assignedProviderId` to appointment creation,
	- added `updateAppointmentAssignedProvider()` for provider-only edits,
	- added provider-assignment friendly error wording.
- Updated patient appointment creation:
	- optional `Assigned provider` dropdown,
	- `Not assigned` option,
	- active same-clinic doctor/specialist options,
	- selected provider is submitted as `assigned_provider_id`,
	- existing follow-up prefill and date/time/type/duration/reason/notes
	  validation are preserved.
- Updated appointment display:
	- appointment cards show `Provider: {name}` or `Provider: Not assigned`,
	- Appointment Detail shows an `Assigned provider` metric,
	- Appointment Detail includes a provider-only edit selector and save action,
	- Appointments page/daily and weekly schedule inherit the shared card display,
	- Patient Appointment Summary inherits the shared card display.
- Updated Visit Completion appointment context:
	- shows `Assigned provider`,
	- displays assigned provider name when available,
	- falls back to `Not assigned` or `Provider unavailable`,
	- remains context only and does not change Visit Completion persistence.
- Preserved completed-by separation:
	- `appointments.assigned_provider_id` is planned appointment context,
	- `visits.completed_by` remains the actual completing profile,
	- completed visit timeline/detail behavior was not changed.
- Updated `supabase/snippets/testAppointmentProviderAssignmentRls.mjs`:
	- verifies provider RPC returns active same-clinic doctor/specialist,
	- verifies assistant/reception/inventory/inactive/suspended/cross-clinic
	  profiles are not returned,
	- verifies inventory receives no assignable provider rows,
	- keeps existing provider assignment validation and completed-by separation
	  coverage.
- Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`:
	- verifies the provider dropdown exists,
	- selects `Doctor Demo`,
	- verifies created appointment provider display,
	- verifies provider display survives refresh,
	- verifies Appointment Detail provider display and prefilled selector,
	- verifies Visit Completion appointment context displays assigned provider.
- No automatic provider assignment, provider workload calendar, provider
  availability conflict checking, check-in/in-room/ready-for-doctor state,
  billing/payments/materials/attachments, treatment-plan mutation,
  reminders/tasks, broad profile RLS opening, fake provider data, or broad
  scheduling redesign was added.
- Documented the task in
  `docs/design/task-60-appointment-provider-assignment-service-ui-wiring.md`.

### Verification (Task 60)

- `npx.cmd supabase migration up` applied
  `20260521150000_create_assignable_appointment_providers_rpc.sql` locally.
- `npm.cmd run build` passes with the existing Vite chunk-size warning and a
  Tailwind plugin timing warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local Supabase env from `npx supabase status -o env`.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local Supabase env from `npx supabase status -o env` and
  `DENTAPP_APP_URL=http://localhost:5173`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase env from `npx supabase status -o env`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  Supabase env from `npx supabase status -o env`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or focused provider availability
  planning if scheduling workload becomes the next priority.

---

### Completed (Task 61 - Provider Assignment UX/Test Cleanup + Appointment Menu Label Polish)

- Reviewed provider wording across appointment-related surfaces:
	- AppointmentCard,
	- PatientAppointmentSummary,
	- AppointmentDetailPage,
	- Appointments page cards,
	- VisitCompletionFlow appointment context.
- Centralized assigned-provider display fallback copy with
  `getAssignedProviderDisplayName()`:
	- unassigned appointment: `Not assigned`,
	- unreadable/no-longer-returned assigned profile: `Provider unavailable`,
	- readable assigned profile: provider full name.
- Aligned appointment card provider display to `Assigned provider: {name}`.
- Kept completed visit metadata separate from assigned-provider context:
	- `appointments.assigned_provider_id` remains planned assignment,
	- `visits.completed_by` remains actual completion identity.
- Polished appointment card secondary action menu label:
	- changed card menu label from `Cancel appointment` to `Cancel`,
	- kept `Mark no-show`,
	- kept full cancellation copy where there is space, including Appointment
	  Detail menu and `Appointment was cancelled.` success feedback.
- Updated browser smoke coverage:
	- provider card assertions now expect `Assigned provider: Doctor Demo`,
	- lifecycle action constants now expect appointment card menu `Cancel`,
	- existing detail/lifecycle assertions remain in place,
	- provider dropdown, provider selection, appointment provider display, Visit
	  Completion provider context, appointment lifecycle, Visit Completion,
	  follow-up, and treatment-plan checks remain covered.
- No provider workload calendar, availability conflict checking, automatic
  provider assignment, check-in/in-room/ready-for-doctor state, schema, RLS,
  billing/payments/materials/attachments, treatment-plan mutation,
  reminders/tasks, broad scheduling redesign, or appointment lifecycle behavior
  change was added.
- Documented the task in
  `docs/design/task-61-provider-assignment-ux-test-cleanup.md`.

### Verification (Task 61)

- `npm.cmd run build` passes with the existing Vite chunk-size warning and a
  Tailwind plugin timing warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local Supabase env from `npx supabase status -o env`.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local Supabase env from `npx supabase status -o env` and
  `DENTAPP_APP_URL=http://localhost:5173`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase env from `npx supabase status -o env`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  Supabase env from `npx supabase status -o env`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or provider availability planning
  if schedule capacity becomes the next priority.

---

### Completed (Task 62 - Appointment Provider Filter / Daily Schedule Polish)

- Added an Appointments schedule provider filter using the existing provider
  assignment foundation:
	- `All providers`,
	- `Unassigned`,
	- active same-clinic assignable providers from
	  `get_assignable_appointment_providers()`.
- Kept filtering client-side against the currently loaded schedule range.
- Added clear filtered empty states, including `No unassigned appointments`.
- Kept provider wording aligned with Task 61:
	- `Assigned provider`,
	- `Not assigned`,
	- `Provider unavailable`.
- Preserved the separation between planned appointment provider assignment and
  completed visit identity:
	- `appointments.assigned_provider_id` remains planned provider context,
	- `visits.completed_by` remains actual completed-by context.
- Expanded browser smoke coverage for:
	- provider filter visibility/options,
	- specific provider filtering,
	- unassigned filtering,
	- returning to `All providers`,
	- existing appointment lifecycle actions.
- No schema, migration, RLS, appointment lifecycle behavior, Visit Completion
  behavior, provider workload calendar, availability checking, automatic
  assignment, check-in/in-room/ready-for-doctor state, billing/payments/
  materials/attachments, treatment-plan mutation, reminders/tasks, or broad
  scheduling redesign was added.
- Documented the task in
  `docs/design/task-62-appointment-provider-filter.md`.

### Verification (Task 62)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or provider availability planning
  if schedule capacity becomes the next priority.

---

### Completed (Task 63 - Appointment Schedule Filter UI Cleanup / Persistence Polish)

- Consolidated Appointments schedule controls into one filter bar inside the
  schedule card:
	- view mode,
	- date/week selector,
	- assigned provider filter,
	- date/week shortcuts,
	- refresh.
- Kept the Task 62 provider filtering behavior:
	- `All providers`,
	- `Unassigned`,
	- active same-clinic assignable providers.
- Added lightweight provider filter persistence through the `provider` URL
  search param:
	- `?provider=all`,
	- `?provider=unassigned`,
	- `?provider=<providerId>`.
- Opening Appointments with a valid provider param restores the selected filter.
- Invalid provider params safely render as `All providers`.
- Changing the provider select updates the URL without a page reload.
- Expanded browser smoke coverage for visible-list filtering, URL updates,
  provider deep-link restore, invalid-param fallback, and existing lifecycle
  actions after filter changes.
- No appointment lifecycle behavior, Visit Completion behavior, schema,
  migration, RLS, provider workload calendar, availability/conflict checking,
  automatic assignment, check-in/in-room/ready-for-doctor state,
  billing/payments/materials/attachments, treatment-plan mutation,
  reminders/tasks, or broad scheduling redesign was added.
- Documented the task in
  `docs/design/task-63-appointment-schedule-filter-polish.md`.

### Verification (Task 63)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or provider availability planning
  if schedule capacity becomes the next priority.

---

### Completed (Task 64 - Appointment Schedule Compact Density / Mobile Readability Pass)

- Reviewed the Appointments schedule UI after Task 63 provider filter and URL
  persistence work.
- Tightened the schedule filter bar without changing behavior:
	- reduced filter bar padding,
	- kept controls touch-friendly,
	- stacked controls naturally through tablet widths,
	- avoided horizontal overflow.
- Improved daily and weekly schedule density:
	- reduced list spacing,
	- kept weekly day sections compact,
	- used compact appointment cards in weekly view.
- Refined `AppointmentCard` hierarchy:
	- time/duration first,
	- patient name directly under time,
	- lifecycle status and secondary menu aligned to the right on wider screens,
	- assigned provider and reason/type grouped into a metadata row,
	- live Visit Completion state notices use less vertical padding,
	- primary/detail actions remain touch-friendly.
- Preserved all existing behavior:
	- provider filtering,
	- provider URL params,
	- invalid provider fallback,
	- lifecycle actions,
	- Visit Completion handoff,
	- appointment detail navigation.
- No schema, migration, RLS, lifecycle rule, Visit Completion behavior,
  availability/conflict checking, workload calendar, automatic assignment,
  check-in/in-room/ready-for-doctor state, billing/payments/materials/
  attachments, treatment-plan mutation, reminders/tasks, or broad scheduling
  redesign was added.
- Documented the task in
  `docs/design/task-64-appointment-schedule-density-mobile-polish.md`.

### Verification (Task 64)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or provider availability planning
  if schedule capacity becomes the next priority.

---

### Completed (Task 64B - Fix Appointments Responsive Overflow Regression)

- Fixed the responsive horizontal overflow regression found by visual QA after
  Task 64.
- Added explicit responsive containment:
	- page wrapper now has `min-w-0` and `overflow-x-hidden`,
	- Appointments schedule card, filter bar, daily list, weekly list, and
	  weekly day sections use `min-w-0` / `max-w-full`,
	- appointment cards use `min-w-0` / `max-w-full`.
- Corrected filter bar wrapping:
	- grid tracks no longer require fixed minimum widths on tablet,
	- Today / Tomorrow / Refresh and weekly shortcut buttons can wrap.
- Corrected card overflow pressure:
	- status/menu row can wrap,
	- assigned provider text truncates safely without nowrap,
	- action menu width is bounded to the viewport.
- Verified in a headless browser that daily and weekly Appointments views have
  no horizontal document/body overflow and no off-viewport elements at:
	- 390px mobile,
	- 430px mobile,
	- 912px tablet,
	- 1440px desktop.
- Preserved all existing behavior:
	- provider filtering,
	- provider URL params,
	- invalid provider fallback,
	- lifecycle actions,
	- Visit Completion handoff,
	- appointment detail navigation.
- No schema, migration, RLS, lifecycle rule, Visit Completion behavior,
  availability/conflict checking, workload calendar, automatic assignment,
  check-in/in-room/ready-for-doctor state, billing/payments/materials/
  attachments, treatment-plan mutation, reminders/tasks, or broad scheduling
  redesign was added.
- Updated
  `docs/design/task-64-appointment-schedule-density-mobile-polish.md` with the
  responsive overflow fix notes.

### Verification (Task 64B)

- Browser responsive overflow check passes for daily and weekly Appointments
  views at 390px, 430px, 912px, and 1440px.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or provider availability planning
  if schedule capacity becomes the next priority.

---

### Completed (Task 65 - Responsive Overflow Smoke Guard)

- Added reusable responsive overflow helpers to
  `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`:
	- `setViewport()`,
	- `assertNoHorizontalOverflow()`,
	- `runResponsiveOverflowSmoke()`.
- The guard checks document and body horizontal overflow with a 2px tolerance:
	- `document.documentElement.scrollWidth`,
	- `document.documentElement.clientWidth`,
	- `document.body.scrollWidth`,
	- `document.body.clientWidth`.
- Failure messages include:
	- screen label,
	- viewport width,
	- document scroll/client widths,
	- body scroll/client widths,
	- tolerance.
- The guard runs at:
	- 390px mobile,
	- 430px mobile,
	- 912px tablet portrait,
	- 1440px desktop.
- Covered screens:
	- Appointments daily schedule,
	- Appointments weekly schedule,
	- Patient overview,
	- Patient timeline,
	- Appointment detail,
	- Visit Completion,
	- completed visit detail.
- Reused the existing authenticated browser smoke session and fixtures to avoid
  a separate slow setup path.
- No product behavior, schema, migrations, RLS, provider workload,
  availability logic, or appointment states were changed.
- Documented the task in
  `docs/design/task-65-responsive-overflow-smoke-guard.md`.

### Verification (Task 65)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or provider availability planning
  if schedule capacity becomes the next priority.

---

### Completed (Task 66 - Appointment Card Dropdown Anchoring / Mobile Menu Fix)

- Fixed AppointmentCard secondary action menu trigger positioning:
	- card root is now `relative`,
	- menu trigger is in an absolute upper-right card slot,
	- time/patient header reserves right-side space,
	- status badges wrap independently from the trigger,
	- wider-screen status rows reserve space near the fixed trigger.
- Kept the opened menu inside the viewport:
	- retained bounded menu width,
	- kept menu alignment opening toward the card interior,
	- avoided clipping the dropdown with overflow hiding.
- Expanded browser smoke coverage:
	- added a scheduled fixture appointment for menu-anchor checks,
	- added a coarse trigger upper-right geometry check,
	- opened the menu during responsive overflow smoke,
	- asserted no horizontal overflow after menu open,
	- asserted opened menu bounds stay within the viewport.
- The responsive menu check runs at:
	- 390px,
	- 430px,
	- 500px,
	- 912px,
	- 1440px.
- Preserved all existing behavior:
	- Cancel / Mark no-show visibility and eligibility,
	- provider filtering,
	- provider URL params,
	- Visit Completion handoff,
	- appointment detail navigation.
- No schema, migration, RLS, lifecycle rule, provider workload calendar,
  availability logic, or new appointment states were added.
- Documented the task in
  `docs/design/task-66-appointment-card-dropdown-mobile-fix.md`.

### Verification (Task 66)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or provider availability planning
  if schedule capacity becomes the next priority.

---

### Completed (Task 67 - Appointment Operational State Planning / Data Model Decision)

- Reviewed the current appointment lifecycle/status implementation across:
	- appointments schema and RLS migrations,
	- appointment service hydration and lifecycle guards,
	- Appointments page daily/weekly actions,
	- Appointment Detail actions,
	- Patient Appointment Summary actions,
	- AppointmentCard hierarchy and lifecycle menu,
	- Visit Completion appointment context and completion service,
	- appointment/provider/lifecycle RLS and browser smoke coverage.
- Confirmed the current `appointments.status` model remains lifecycle-focused:
	- `scheduled`,
	- `completed`,
	- `cancelled`,
	- `no_show`.
- Confirmed direct appointment status updates are limited to cancel/no-show,
  while linked Visit Completion completion marks appointments completed.
- Recommended keeping day-of-visit operational progression separate from
  appointment lifecycle status.
- Recommended the MVP operational state set:
	- `not_arrived`,
	- `arrived`,
	- `ready_for_doctor`.
- Recommended adding a future `appointments.operational_state` text column with
  a check constraint, rather than expanding `appointments.status` or creating an
  event table for MVP.
- Documented allowed transitions, role/RLS implications, UI impact, test plan,
  and phased implementation tasks.
- Preserved all runtime behavior. No schema, migration, RLS, service, UI, or
  smoke test code was changed.
- Documented the decision in
  `docs/design/task-67-appointment-operational-state-planning.md`.

### Verification (Task 67)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.

### Next Recommended Task

- Task 68 - Appointment Operational State Schema/RLS Foundation, or Checkpoint B
  - Product Roadmap Re-balance if planning should be refreshed first.

---

### Completed (Task 68 - Appointment Operational State Schema/RLS Foundation)

- Added appointment operational state schema foundation:
	- `appointments.operational_state`,
	- default `not_arrived`,
	- allowed values `not_arrived`, `arrived`, and `ready_for_doctor`,
	- clinic/state/scheduled-start index for future schedule reads.
- Kept `appointments.status` lifecycle-only:
	- `scheduled`,
	- `cancelled`,
	- `no_show`,
	- `completed` through linked Visit Completion behavior.
- Added database transition enforcement for operational state changes:
	- `not_arrived` -> `arrived`,
	- `arrived` -> `ready_for_doctor`,
	- `arrived` -> `not_arrived`,
	- `ready_for_doctor` -> `arrived`.
- Blocked operational state updates when:
	- a new appointment insert attempts to start in a progressed operational
	  state,
	- appointment lifecycle status is terminal/non-scheduled,
	- a linked draft, in-progress, or completed Visit Completion exists,
	- the requested transition is outside the allowed set.
- Preserved existing appointment update RLS boundaries for same-clinic active
  scheduling/clinical roles and kept `inventory_responsible` blocked.
- Added focused RLS/data smoke coverage in
  `supabase/snippets/testAppointmentOperationalStateRls.mjs`.
- Verified the new operational update path does not mutate:
	- appointment lifecycle `status`,
	- `assigned_provider_id`,
	- `visits.completed_by`.
- No visible UI controls, appointment cards, appointment detail controls,
  patient appointment summary display, Visit Completion UI, operational filters,
  Start visit gating, room/chair assignment, waiting queue, analytics, provider
  workload, availability logic, billing, materials, payments, treatment-plan
  mutation, reminders, or tasks were added.
- Documented the task in
  `docs/design/task-68-appointment-operational-state-schema-rls-foundation.md`.

### Verification (Task 68)

- `npx.cmd supabase migration up` applies the Task 68 operational state
  migrations.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Task 69 - Appointment Operational State Service Wiring, followed by a small
  UI task for daily schedule controls.

---

### Completed (Task 69 - Appointment Operational State Service/UI Wiring)

- Wired appointment operational state through the service layer:
	- added `AppointmentOperationalState`,
	- included `operational_state` in appointment select/mapping,
	- added labels for `Not arrived`, `Arrived`, and `Ready for doctor`,
	- added focused `updateAppointmentOperationalState()`,
	- kept DB/RLS enforcement from Task 68 as the final guard.
- Added daily schedule card operational display/actions:
	- operational state badge,
	- `Mark arrived` for eligible `not_arrived` appointments,
	- `Ready for doctor` for eligible `arrived` appointments,
	- no operational action after `ready_for_doctor`,
	- no operational action on compact weekly/patient-summary cards.
- Added Appointment Detail operational display/actions:
	- operational state badge,
	- next eligible operational action beside existing primary actions,
	- page state update after successful transition.
- Preserved separation from:
	- appointment lifecycle `status`,
	- provider assignment,
	- `visits.completed_by`,
	- Visit Completion draft/in-progress/completed persistence.
- Preserved existing behavior:
	- Start visit is still allowed before arrival/readiness,
	- Continue visit and View visit remain unchanged,
	- Cancel and Mark no-show remain in the secondary lifecycle menu,
	- provider filtering and URL params remain unchanged.
- Expanded browser smoke coverage for:
	- `Not arrived` initial display,
	- `Mark arrived` transition,
	- `Ready for doctor` transition,
	- Appointment Detail operational state display,
	- hidden operational actions for cancelled/no-show/completed/linked visit
	  appointments,
	- existing responsive overflow and menu geometry coverage.
- Documented the task in
  `docs/design/task-69-appointment-operational-state-ui-wiring.md`.

### Verification (Task 69)

- `npx.cmd supabase migration up` reports the local database is up to date.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Task 70 - Appointment Operational State UX Polish / Daily Workflow QA, or
  Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 70 - Appointment Operational State Context Visibility)

- Completed display-only operational state visibility across active appointment
  context surfaces:
	- patient appointment summary,
	- Patient Today / Active Workflow panel,
	- Visit Completion appointment context.
- Reused the Task 69 operational display copy:
	- `Not arrived`,
	- `Arrived`,
	- `Ready for doctor`.
- Kept operational mutations limited to the daily schedule card and Appointment
  Detail actions implemented in Task 69.
- Patient appointment summary now shows operational state through the compact
  shared `AppointmentCard` without exposing operational actions.
- Patient Today / Active Workflow now shows a scheduled appointment's
  operational state as concise display-only context.
- Visit Completion appointment context now shows:
	- assigned provider as planned provider context,
	- operational state as separate day-of-visit context.
- Preserved existing behavior:
	- no Start visit readiness gate,
	- no Visit Completion persistence changes,
	- no lifecycle status changes,
	- no provider assignment or `visits.completed_by` changes.
- Expanded browser smoke coverage for:
	- patient appointment summary operational visibility,
	- Patient Today operational visibility,
	- Visit Completion operational context,
	- existing operational progression and hidden-action checks,
	- responsive overflow and menu geometry coverage.
- Documented the task in
  `docs/design/task-70-appointment-operational-state-context-visibility.md`.

### Verification (Task 70)

- `npx.cmd supabase migration up` reports the local database is up to date.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or Task 71 - Appointment
  Operational State UX QA if a focused visual pass is preferred first.

---

### Completed (Task 71 - Appointment Operational State Correction)

- Added a narrow correction workflow for active eligible appointment
  operational state:
	- `Arrived` -> `Not arrived` through `Undo arrival`,
	- `Ready for doctor` -> `Arrived` through `Move back to arrived`.
- Confirmed the existing Task 68 database foundation already allowed only the
  required one-step reverse transitions, so no migration was added.
- Kept correction actions secondary:
	- daily appointment card correction lives in the appointment action menu,
	- Appointment Detail correction lives in the appointment action menu,
	- the main day-of-visit progression button remains forward-only.
- Preserved behavior separation:
	- no appointment lifecycle status changes,
	- no provider assignment changes,
	- no Visit Completion persistence or `visits.completed_by` changes,
	- no Start visit readiness gate.
- Kept Patient Today, patient appointment summary, and Visit Completion
  operational state display-only.
- Expanded operational-state RLS/data smoke coverage for:
	- allowed one-step corrections,
	- blocked `ready_for_doctor` -> `not_arrived` direct correction,
	- blocked correction for cancelled, no-show, completed, and linked Visit
	  Completion appointments,
	- inventory/cross-clinic denial and data-separation checks.
- Expanded browser smoke coverage for:
	- card correction from arrived back to not arrived,
	- card correction from ready for doctor back to arrived,
	- restored forward progression after each correction,
	- correction menu horizontal overflow checks at a narrow viewport,
	- hidden correction actions on ineligible appointments.
- Documented the task in
  `docs/design/task-71-appointment-operational-state-correction.md`.

### Verification (Task 71)

- `npx.cmd supabase migration up` reports the local database is up to date.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance, or Task 72 - Appointment
  operational workflow visual QA if a dedicated pass is needed.

---

### Completed (Checkpoint B - Product Roadmap Re-balance)

- Rebalanced the next product direction after Tasks 66-71 completed the
  appointment card/mobile overflow, provider assignment, lifecycle, and
  operational-state foundations.
- Confirmed the current strongest implemented workflow runs from patient
  context through appointment scheduling, provider assignment, operational
  state, Visit Completion, completed visit review, and patient timeline.
- Decided the next major foundation should be performed services because it
  connects clinical completion to:
	- service catalog and prices,
	- patient ledger charges,
	- doctor commission calculation,
	- optional treatment-plan item progress,
	- future material usage.
- Decided patient ledger work should follow performed services, rather than be
  written directly from free-text Visit Completion notes.
- Decided doctor commission work should follow performed services and ledger
  rules because commission basis, discounts, lab costs, and visibility remain
  sensitive pilot decisions.
- Deferred deeper scheduling features for now:
	- room/chair scheduling,
	- availability/conflict enforcement,
	- provider workload calendar,
	- waiting-time analytics,
	- operational event history.
- Created `docs/design/checkpoint-b-product-roadmap-rebalance.md`.
- Filled `docs/02_product/roadmap.md` with the rebalanced roadmap.
- Filled `docs/02_product/feature_backlog.md` with the near-term backlog.
- Updated `docs/02_product/mvp_scope.md` so appointment lifecycle status and
  day-of-visit operational state match the implemented split.
- Aligned the roadmap/backlog sequence with Task 72's service-layer step between
  performed-services schema/RLS and Visit Completion UI wiring.
- Updated `docs/07_execution/implementation_roadmap.md` current status and
  open implementation questions.
- Updated `docs/07_execution/todo.md` to mark Checkpoint B complete and add the
  next performed-services and ledger task sequence.
- No runtime behavior, schema, migration, RLS policy, service code, UI, or smoke
  tests were changed.

### Verification (Checkpoint B)

- Documentation-only change; no build, lint, migration, RLS, or browser smoke
  suite was required.

### Next Recommended Task

- Task 72 - Performed Services Foundation Planning.

---

### Completed (Task 72 - Performed Services Foundation Planning)

- Reviewed current Visit Completion schema, service layer, UI, completed visit
  detail, patient timeline, treatment-plan schema/service, visit/treatment-plan
  RLS smoke coverage, and Checkpoint B roadmap docs.
- Confirmed current completed visit persistence includes:
	- `visits`,
	- `visit_procedures`,
	- linked `clinical_notes`,
	- recommendation and next-step fields.
- Confirmed current `visit_procedures` stores clinical procedure name,
  tooth/region, free-text quantity/duration, note, and sort order only.
- Confirmed no implemented service catalog, performed-service, patient ledger,
  payment, or commission tables exist yet.
- Confirmed current Visit Completion UI does not collect price, discount,
  numeric quantity, material usage, payment, treatment-plan item link, or
  credited doctor per procedure.
- Evaluated both modeling options:
	- extending `visit_procedures`,
	- introducing separate `performed_services`.
- Chose separate `performed_services` for MVP so clinical documentation remains
  separate from chargeable/financial source-of-truth rows.
- Recommended a minimal future data model:
	- `service_categories`,
	- `services`,
	- `performed_services`.
- Recommended `performed_services` include clinic/patient/visit scope, optional
  procedure and treatment-plan-item links, service/catalog snapshots, numeric
  quantity, unit price, discount amount, final amount, currency, credited
  provider, status, correction link, and metadata.
- Decided draft performed services should be recordable during Visit Completion
  and finalized when the visit is completed.
- Decided completed/finalized performed services should not be silently edited;
  later corrections should use explicit correction/void behavior.
- Decided treatment-plan links should be optional and treatment-plan mutation
  should remain out of the first performed-services implementation stream.
- Documented future ledger handoff:
	- finalized performed services later create/support immutable ledger charge
	  postings,
	- balances should come from ledger entries,
	- edits after posting require adjustment/reversal records.
- Documented future commission handoff:
	- capture `credited_provider_id` per performed service now,
	- keep it separate from `appointments.assigned_provider_id` and
	  `visits.completed_by`,
	- defer commission rules and entries.
- Documented role/RLS implications, UI impact map, future test plan, and phased
  follow-up tasks.
- Created
  `docs/design/task-72-performed-services-foundation-planning.md`.
- Updated `docs/07_execution/todo.md` to mark Task 72 complete and make Task 73
  the next recommended task.
- Updated Checkpoint B roadmap/backlog task numbering to include a dedicated
  performed-services service-layer task before Visit Completion UI wiring.
- No runtime behavior, schema, migration, RLS policy, service code, UI, or smoke
  tests were changed.

### Verification (Task 72)

- `git diff --check` passes with only expected line-ending normalization
  warnings from Git on existing Markdown files.

### Next Recommended Task

- Task 73 - Service Catalog and Performed Services Schema/RLS.

---

### Completed (Task 73 - Service Catalog and Performed Services Schema/RLS Foundation)

- Added the minimal clinic-scoped service catalog foundation:
	- `service_categories`,
	- `services`.
- Added `performed_services` as the chargeable/commercial source of truth for
  rendered services while preserving `visit_procedures` as clinical-only
  documentation.
- Added service catalog safeguards:
	- service categories are clinic scoped,
	- services are clinic scoped,
	- services may reference only same-clinic categories.
- Added performed-service safeguards:
	- performed service clinic/patient must match the linked visit,
	- draft performed services require draft/in-progress visits,
	- finalized/corrected/voided performed services require completed visits,
	- optional visit procedure links must match the same visit/clinic/patient,
	- optional treatment-plan item links must match the same clinic/patient and a
	  non-archived parent plan,
	- optional service catalog links must point to active non-archived same-clinic
	  services when newly selected,
	- optional appointment links must match same clinic/patient and not conflict
	  with the linked visit appointment,
	- credited provider must be an active same-clinic doctor/specialist,
	- finalized/corrected/voided rows cannot be silently updated through ordinary
	  update paths.
- Kept service catalog price as a mutable default only; performed services store
  immutable service and price snapshots.
- Added conservative RLS:
	- catalog read for owner/admin, doctor, specialist, assistant, and reception,
	- catalog writes for owner/admin only,
	- performed-service read for owner/admin, doctor, specialist, and reception,
	- performed-service writes for owner/admin, doctor, and specialist,
	- assistant and inventory are denied performed-service financial rows by
	  default.
- Added focused RLS/data smoke coverage in
  `supabase/snippets/testPerformedServicesRls.mjs`.
- Confirmed the new foundation does not modify:
	- appointment lifecycle status,
	- appointment operational state,
	- appointment assigned provider,
	- `visits.completed_by`,
	- existing clinical `visit_procedures`.
- Documented the implementation in
  `docs/design/task-73-service-catalog-performed-services-schema-rls.md`.
- No UI, Visit Completion service-layer wiring, patient ledger, payments,
  commission calculation, material usage, inventory deduction, or treatment-plan
  mutation was added.

### Verification (Task 73)

- `npx.cmd supabase migration up` applies
  `20260524190000_create_service_catalog_and_performed_services.sql`.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node supabase/snippets/testPerformedServicesRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testAppointmentProviderAssignmentRls.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testVisitCompletionRls.mjs` passes with local `.env`
  loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from `SUPABASE_SERVICE_KEY`.
  A parallel first run returned a transient owner/admin visit-create upstream
  response error; the isolated rerun passed.
- `node supabase/snippets/testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `git diff --check` passes with only expected line-ending normalization
  warnings from Git on existing Markdown files.

### Next Recommended Task

- Task 74 - Performed Services Service Layer.

---

### Completed (Task 74 - Performed Services Service Layer)

- Added `src/features/performed-services/performedServicesService.ts` as the
  typed application boundary for the Task 73 schema/RLS foundation.
- Added typed service catalog options for future selectable service entry.
- Added typed performed-service records for future read-only display and Visit
  Completion integration.
- Added active service catalog reads that return only active, non-archived
  services and preserve category display context where available.
- Added visit-scoped performed-service reads that rely on RLS and use stored
  service/price snapshots as the display truth.
- Added `createPerformedService` for one draft chargeable performed-service row
  with explicit snapshots, quantity, pricing, currency, and credited provider
  attribution.
- Added a narrow draft replacement method that only archives/replaces draft
  performed-service rows for an open visit.
- Added a narrow finalization method that moves draft rows to `finalized` after
  the linked visit has been completed.
- Reused the existing assignable appointment provider RPC helper for credited
  provider options, keeping provider attribution separate from appointment
  assignment and `visits.completed_by`.
- Added `docs/design/task-74-performed-services-service-layer.md`.
- Kept Visit Completion UI, completed visit detail, patient timeline, patient
  overview, treatment-plan UI, ledger, payments, commission calculation,
  material usage, inventory deduction, and treatment-plan mutation out of scope.

### Verification (Task 74)

- `npx.cmd supabase migration up` reports the local database is up to date.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node supabase/snippets/testPerformedServicesRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testAppointmentProviderAssignmentRls.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testVisitCompletionRls.mjs` passes with local `.env`
  loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `git diff --check` passes with only expected line-ending normalization
  warnings from Git on existing Markdown files.

### Next Recommended Task

- Task 75 - Visit Completion Performed Services UI Slice.

---

### Completed (Task 75 - Visit Completion Performed Services UI Slice Planning / Finalization Review)

- Reviewed the performed-services planning/schema/service foundation from Tasks
  72-74.
- Reviewed the Task 73 migration and performed-services RLS smoke coverage.
- Reviewed the current Visit Completion UI and persistence service.
- Reviewed completed visit detail, patient timeline, and browser smoke coverage
  structure.
- Confirmed the Task 74 service layer is usable for UI integration and found no
  concrete service-layer defect requiring a runtime patch before UI work.
- Documented the Task 74 draft/finalization semantics:
	- draft rows are created by explicit service calls,
	- Save Draft should persist rows after a visit draft exists,
	- reload should fetch rows by visit,
	- draft replacement only archives/replaces non-archived draft rows,
	- finalization should happen after clinical completion,
	- finalized rows are protected from silent mutation.
- Documented the main sequencing risk:
	- clinical completion and performed-service finalization are separate client
	  calls,
	- the next UI task must explicitly handle finalization failure after
	  clinical completion and provide a retry path.
- Chose a separate `Services & Charges` Visit Completion step before Review to
  avoid mixing clinical procedure documentation with chargeable service rows.
- Defined the MVP entry fields:
	- active catalog service selection,
	- quantity,
	- unit price,
	- credited provider,
	- optional tooth/region,
	- calculated total.
- Deferred discount entry, treatment-plan item linking, explicit
  visit-procedure linking, payment, ledger, commission, materials, and
  treatment-plan mutation.
- Decided completion should remain allowed with no performed services.
- Documented role behavior:
	- owner/admin, doctor, and specialist can enter/finalize according to RLS,
	- reception remains read-only/no Visit Completion entry controls,
	- assistant sees no financial rows/prices and continues clinical workflow,
	- inventory has no performed-services access.
- Recommended deferring completed visit detail, patient timeline, and patient
  overview performed-service display to a follow-up read-only display task.
- Created
  `docs/design/task-75-visit-completion-performed-services-ui-slice-planning.md`.

### Verification (Task 75)

- `git diff --check` passes with only expected line-ending normalization
  warnings from Git on existing Markdown files.

### Next Recommended Task

- Task 76 - Visit Completion Performed Services UI Wiring.

---

### Completed (Task 76 - Performed Services Completion / Finalization Safety Foundation)

- Added structured finalization state types and helpers to
  `src/features/performed-services/performedServicesService.ts`.
- Added `getPerformedServicesFinalizationStateForVisit` to make these states
  explicit for future UI messaging:
	- open visit with draft performed services,
	- completed visit with finalized performed services,
	- completed visit with draft rows requiring retry,
	- completed visit with no performed services.
- Added `finalizePerformedServicesForCompletedVisit` as a retry-safe wrapper:
	- treats no performed services as valid,
	- treats already finalized rows as idempotent success,
	- refuses finalization before clinical visit completion,
	- finalizes remaining draft rows after clinical completion,
	- reloads state and returns structured retry information if drafts remain.
- Preserved existing draft replacement boundaries so finalized rows are not
  silently replaced or archived by draft-save paths.
- Extended `supabase/snippets/testPerformedServicesRls.mjs` with
  finalization-safety coverage for:
	- valid no-service completed visits,
	- rejected draft rows on already completed visits,
	- rejected finalization while a visit is still open,
	- successful draft-to-finalized transition after visit completion,
	- idempotent finalization retry with no duplicate rows,
	- blocked assistant finalization leaving draft rows unchanged,
	- finalized rows not being touched by draft replacement filters,
	- snapshot preservation after catalog changes,
	- no mutation of appointment lifecycle status, appointment operational
	  state, appointment assigned provider, or `visits.completed_by`.
- Documented the task in
  `docs/design/task-76-performed-services-finalization-safety.md`.
- Added no React UI, service catalog UI, completed visit financial display,
  ledger, payments, invoices, commissions, materials, inventory deduction, or
  treatment-plan mutation.

### Verification (Task 76)

- `npx.cmd supabase migration up` reports the local database is up to date.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node supabase/snippets/testPerformedServicesRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testAppointmentProviderAssignmentRls.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testVisitCompletionRls.mjs` passes with local `.env`
  loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `git diff --check` passes with only expected line-ending normalization
  warnings from Git on existing Markdown/test files.

### Next Recommended Task

- Task 77 - Visit Completion Services & Charges Draft UI.

---

### Completed (Task 77 - Visit Completion Services & Charges Draft UI)

- Added a separate `Services & Charges` step before `Review` in the existing
  Visit Completion workflow.
- Added a contained performed-services draft editor for authorized financial
  clinical roles:
	- active service catalog selection,
	- derived service name/code/category snapshots,
	- quantity,
	- editable unit price snapshot,
	- calculated line amount and draft total,
	- credited provider,
	- optional tooth/region context.
- Kept blocked roles from loading service catalog pricing or credited-provider
  options through the editor; they can continue clinical Visit Completion with
  a permission notice.
- Integrated performed-service draft persistence with the existing Save Draft
  path:
	- saves the clinical draft first to obtain the visit ID,
	- replaces only eligible open-visit draft performed-service rows,
	- reloads saved draft charge rows when reopening an open Visit Completion
	  flow,
	- preserves zero-service visits without creating fake rows.
- Added a Review summary for draft services/charges with service snapshot,
  quantity, credited provider, line amount, and draft total.
- Corrected the performed-services service-layer UUID validator to accept the
  full Postgres UUID text shape used by existing deterministic demo fixtures,
  while leaving database/RLS integrity as the authority.
- Preserved the boundary that this is not a payment, ledger, invoice, balance,
  commission, treatment-plan mutation, or completed-visit display feature.
- Did not finalize performed services from `Complete Visit`; finalization
  remains deferred to Task 78. The flow only saves the latest draft charge rows
  before completion when rows exist, because draft replacement is intentionally
  blocked after completion.
- Expanded `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to seed a
  deterministic catalog service and verify the authorized service-entry draft
  flow, Save Draft reload, Review summary, zero-service path, and responsive
  overflow coverage for the new step.
- Documented the task in
  `docs/design/task-77-visit-completion-services-charges-draft-ui.md`.

### Verification (Task 77)

- `npx.cmd supabase migration up` reports the local database is up to date.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node supabase/snippets/testPerformedServicesRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testAppointmentProviderAssignmentRls.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` passes with
  local `.env` loaded, `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`, and `DENTAPP_APP_URL=http://127.0.0.1:5174` against a
  fresh Vite dev server.
- `node supabase/snippets/testVisitCompletionRls.mjs` passes with local `.env`
  loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from `SUPABASE_SERVICE_KEY`.
- `node supabase/snippets/testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `git diff --check` passes with only expected line-ending normalization
  warnings from Git on existing files.

### Next Recommended Task

- Task 78 - Visit Completion Performed Services Finalization Wiring.

---

### Completed (Task 78 - Visit Completion Performed Services Finalization Wiring)

- Wired `finalizePerformedServicesForCompletedVisit(...)` into the Visit
  Completion confirmation path after `completeVisit(...)` succeeds.
- Preserved the clinical completion success boundary:
	- clinical completion failure still returns to editable Review,
	- performed-service finalization failure after clinical completion keeps the
	  visit in the completed success state,
	- the UI does not attempt to roll back a completed visit.
- Added completed-state services/charges finalization feedback:
	- finalized services show a concise success notice,
	- no-service visits show a neutral no-services notice,
	- retry-required states show a warning and `Retry finalization`,
	- blocked states show a warning without unsafe mutation.
- Added retry from the completed success screen. Retry calls the existing
  retry-safe finalization helper and does not repeat clinical completion.
- Preserved zero-services completion without fake performed-service rows.
- Expanded authenticated browser smoke coverage for:
	- performed-service finalization success after Visit Completion,
	- zero-service completion without retry UI,
	- forced finalization failure after clinical completion,
	- retry success without duplicate performed-service rows.
- No schema, RLS, ledger, payment, invoice, receipt, balance, commission,
  material, treatment-plan, provider assignment, or appointment lifecycle
  changes were added.
- Documented the task in
  `docs/design/task-78-visit-completion-performed-services-finalization-wiring.md`.

### Verification (Task 78)

- `npx.cmd supabase migration up` reports the local database is up to date.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- Initial RLS script attempts without shell Supabase env vars failed with the
  expected missing-env message; the scripts passed after loading local `.env`
  and mapping `SUPABASE_SERVICE_KEY` to `SUPABASE_SERVICE_ROLE_KEY`.
- `node .\supabase\snippets\testPerformedServicesRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` was run
  against `http://127.0.0.1:5173`; it reached existing appointment workflow
  coverage but timed out waiting for `Task 44 appointment bridge
  recommendation` on the appointments list after the backing appointment had
  been created. Direct authenticated appointment insertion for the same demo
  role/patient still succeeds, so this was left as an existing browser-smoke
  fixture/navigation issue rather than a Task 87 payment-schema regression.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.
- `git diff --check` passes with only expected line-ending normalization
  warnings from Git on edited files.

### Next Recommended Task

- Task 79 - Patient Ledger Foundation Planning / Data Model Decision.

---

### Completed (Task 79 - Patient Ledger Foundation Planning / Data Model Decision)

- Completed a documentation-only architecture decision for the future Patient
  Ledger / Patient Account foundation.
- Audited current schema, service, Visit Completion, performed-services,
  treatment-plan, appointment/provider, docs, and RLS/test context relevant to
  financial boundaries.
- Confirmed the current state after Task 78:
	- finalized `performed_services` represent rendered chargeable work,
	- Visit Completion finalizes performed services after clinical completion,
	- no ledger posting, payment, invoice, receipt, refund, write-off,
	  adjustment, balance, or commission model exists yet.
- Compared model options:
	- querying finalized `performed_services` directly as charge rows,
	- creating dedicated patient-ledger transactions derived from finalized
	  performed services,
	- invoice-centric accounting as a later, non-MVP option.
- Chose a dedicated patient-ledger layer as the future accounting source of
  truth:
	- `performed_services` remains the visit-linked source for rendered
	  chargeable work,
	- ledger charge entries reference finalized performed services,
	- payments/refunds/discounts/write-offs/reversals are ledger/payment events,
	- balance is derived from ledger entries, not an editable patient field,
	- duplicate charge posting is prevented through unique linkage and
	  idempotent posting rules.
- Recommended patient-scoped `patient_ledger_entries` as the first schema
  foundation and deferred separate `patient_accounts` until family/shared payer
  complexity is needed.
- Defined future posting, retry/reconciliation, payment, adjustment, reversal,
  RLS, role access, and UI principles.
- Recommended the next implementation task as Task 80 - Patient Ledger
  Schema/RLS Foundation.
- Made no runtime, schema, RLS, service, UI, browser smoke, or RLS test changes.
- Documented the task in
  `docs/design/task-79-patient-ledger-foundation-planning.md`.

### Verification (Task 79)

- Docs-only task. Build, lint, migrations, browser smoke, and RLS tests were not
  run.
- `git diff --check` passes with only expected line-ending normalization
  warnings from Git on edited/pre-existing uncommitted files.
- `git diff --name-only` was reviewed. Runtime/test changes in
  `src/features/visits/VisitCompletionFlow.tsx` and
  `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`, plus the Task 78
  design doc, were pre-existing Task 78 work and were not modified for Task 79.

### Next Recommended Task

- Task 80 - Patient Ledger Schema/RLS Foundation.

---

### Completed (Task 80 - Patient Ledger Schema/RLS Foundation)

- Added `patient_ledger_entries` as the first patient-scoped accounting entry
  table.
- Kept `performed_services` separate as the source for finalized rendered
  services; no Visit Completion posting or runtime ledger wiring was added.
- Chose positive `amount` plus explicit `direction` semantics:
	- `debit` increases patient amount owed,
	- `credit` reduces patient amount owed.
- Added constrained entry types for future `charge`, `payment`, `discount`,
  `write_off`, `refund`, `adjustment`, and `reversal` movements.
- Added foundational fields for performed-service, visit, appointment, reversal,
  source, metadata, posted timestamp, recorded-by profile, and created-by
  profile context.
- Added integrity enforcement through
  `enforce_patient_ledger_entry_context()`:
	- patient must match the ledger clinic,
	- visit and appointment links must match clinic/patient context,
	- service charges require finalized same-clinic/same-patient performed
	  services,
	- service-charge amount/currency must match the finalized performed service,
	- reversal references must stay within the same clinic and patient,
	- recorded/created profiles must be active same-clinic profiles.
- Added duplicate-charge prevention with a unique partial index allowing only
  one posted charge ledger entry per performed service.
- Enabled conservative RLS:
	- same-clinic read access for `owner_admin`, `doctor`, `specialist`, and
	  `reception_admin`,
	- `assistant` and `inventory_responsible` blocked,
	- no authenticated insert/update/delete table policies.
- Added focused RLS/data smoke coverage in
  `supabase/snippets/testPatientLedgerRls.mjs`.
- Documented the task in
  `docs/design/task-80-patient-ledger-schema-rls-foundation.md`.
- No runtime React/service changes, payments, balance UI, invoices/receipts,
  commissions, materials, treatment-plan conversion, or appointment lifecycle
  changes were added.

### Verification (Task 80)

- `npx.cmd supabase migration up` applies
  `20260524210000_create_patient_ledger_foundation.sql`; a later rerun reports
  the local database is up to date.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientLedgerRls.mjs` passes with local `.env`
  loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testPerformedServicesRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes with
  local `.env` loaded after clearing deterministic leftover smoke fixtures from
  earlier failed browser-smoke attempts.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded.
- `git diff --check` passes with only expected line-ending normalization
  warnings from Git on edited/pre-existing uncommitted files.

### Next Recommended Task

- Task 81 - Patient Ledger Service Layer / Idempotent Charge Posting from
  Finalized Performed Services.

---

### Completed (Task 81 - Patient Ledger Service Layer / Idempotent Charge Posting)

- Added controlled patient-ledger charge posting RPCs:
  - `get_patient_ledger_charge_posting_state_for_visit(...)`,
  - `post_finalized_performed_services_to_patient_ledger(...)`.
- Kept ledger mutation behind the RPC boundary; no broad authenticated direct
  insert/update/delete table policies were added.
- Posted charges only from trusted finalized `performed_services` source values:
  clinic, patient, visit, appointment, amount, currency, service snapshot, and
  performed-service reference are derived server-side.
- Created one posted debit `charge` ledger entry per eligible finalized
  performed service on a completed visit.
- Preserved idempotency:
  - repeated posting returns `already_posted` and creates no duplicates,
  - partial prior posting creates only missing charge entries,
  - Task 80's unique posted-charge-per-performed-service index remains the final
    duplicate guard.
- Added explicit posting/check states for `posting_required`, `posted`,
  `already_posted`, `no_services`, `blocked`, and frontend `error` fallback.
- Chose the posting role boundary:
  - `owner_admin`, `doctor`, and `specialist` can post same-clinic eligible
    charges,
  - `reception_admin` can read/check state but cannot post,
  - `assistant` and `inventory_responsible` remain blocked.
- Added `src/features/patient-ledger/patientLedgerService.ts` with typed helpers
  for future UI wiring.
- Added focused posting/RLS coverage in
  `supabase/snippets/testPatientLedgerPostingRls.mjs`.
- Preserved the boundary that ledger posting does not mutate clinical
  completion, performed-service finalization snapshots, appointment lifecycle,
  appointment operational state, assigned provider, follow-up/next-step,
  treatment plans, payments, balances, invoices, receipts, commissions, or
  materials.
- Did not wire ledger posting into Visit Completion UI.
- Documented the task in
  `docs/design/task-81-patient-ledger-service-idempotent-charge-posting.md`.

### Verification (Task 81)

- `npx.cmd supabase migration up` applies
  `20260524213000_add_patient_ledger_charge_posting_rpc.sql`.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientLedgerPostingRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testPatientLedgerRls.mjs` passes with local `.env`
  loaded.
- `node .\supabase\snippets\testPerformedServicesRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `http://127.0.0.1:5173` after clearing deterministic leftover
  browser-smoke fixtures from an earlier failed run.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded.

### Next Recommended Task

- Task 82 - Visit Completion Ledger Posting Wiring / Post-completion Charge
  Posting Failure Handling.

---

### Completed (Task 82 - Visit Completion Ledger Posting Wiring)

- Wired Task 81 ledger charge posting into the completed Visit Completion flow
  after performed-services finalization succeeds.
- Preserved the three-stage completion boundary:
  - clinical `completeVisit(...)` remains authoritative,
  - performed-services finalization remains the first downstream operation,
  - ledger charge posting runs only after services are finalized.
- Added completed-state ledger posting feedback:
  - posted/already-posted charges show `Charges posted to patient account.`,
  - zero-service completions keep the existing no-services success state and do
    not show ledger warnings,
  - recoverable posting failures show a charge-posting warning and
    `Retry charge posting`,
  - permission-blocked posting shows a manual follow-up warning without
    broadening RLS or pretending retry will solve authorization.
- Kept performed-services finalization retry separate from ledger retry:
  - `Retry finalization` does not repeat clinical completion,
  - successful finalization retry proceeds into ledger posting,
  - `Retry charge posting` retries only the Task 81 posting helper.
- Preserved idempotent behavior through the existing Task 76 finalization helper
  and Task 81 ledger posting RPC; no duplicate performed-service or ledger rows
  are created by retries.
- Extended browser smoke coverage for successful posting, zero-service posting
  skip, forced ledger posting failure/retry, finalization-failure precedence, and
  posted-charge row counts.
- Made the Visit Completion responsive smoke setup idempotent across repeated
  viewport runs.
- Added no patient balance, payment, invoice, receipt, refund, write-off,
  discount, reversal, commission, materials, treatment-plan mutation, schema,
  migration, or RLS changes.
- Documented the task in
  `docs/design/task-82-visit-completion-ledger-posting-wiring.md`.

### Verification (Task 82)

- `npx.cmd supabase migration up` reports the local database is up to date; no
  Task 82 migration was added.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientLedgerRls.mjs` passes with local `.env`
  loaded.
- `node .\supabase\snippets\testPatientLedgerPostingRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testPerformedServicesRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `http://127.0.0.1:5173`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded.

### Next Recommended Task

- Task 83 - Completed Visit Financial Read-only Display / Posted Charge
  Visibility.

---

### Completed (Task 83 - Completed Visit Financial Read-only Display)

- Added a read-only `Services & charges` section to completed visit detail.
- Shows finalized performed-service snapshots for authorized financial readers:
  service name, quantity, unit price, finalized line amount, currency, credited
  provider, and tooth/region when recorded.
- Shows visit-scoped posted ledger charge visibility:
  - `Posted to patient account` when every finalized service has a posted charge,
  - `Charge posting pending` when finalized services exist but posted charges are
    incomplete,
  - no fake total or pending state for visits with no performed services.
- Shows a compact posted `Charge total` derived only from posted visit charge
  ledger entries, not from patient balance, invoices, payments, or credits.
- Added `getCompletedVisitFinancialSummary(patientId, visitId)` in
  `patientLedgerService.ts` using existing RLS-protected table reads; no new RPC,
  migration, or RLS change was required.
- Preserved role boundaries:
  - `owner_admin`, `doctor`, `specialist`, and `reception_admin` can see
    read-only same-clinic financial visibility,
  - blocked roles receive a neutral unavailable message without breaking the
    completed clinical visit.
- Kept completed visit detail read-only with no posting, payment, edit, invoice,
  receipt, refund, balance, commission, materials, or treatment-plan actions.
- Extended browser smoke coverage for posted, pending, and zero-service
  completed visit financial states.
- Documented the task in
  `docs/design/task-83-completed-visit-financial-read-only-display.md`.

### Verification (Task 83)

- `npx.cmd supabase migration up` reports the local database is up to date; no
  Task 83 migration was required.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientLedgerRls.mjs` passes with local `.env`
  loaded.
- `node .\supabase\snippets\testPatientLedgerPostingRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testPerformedServicesRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `http://127.0.0.1:5173`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded.
- `git diff --check` passes.

### Next Recommended Task

- Task 84 - Patient Account Read-only Ledger / Balance Summary Planning.

---

### Completed (Task 84 - Patient Account Read-only Ledger / Balance Summary Planning)

- Completed a docs-only planning decision for patient-level financial visibility
  after Task 83.
- Confirmed the current financial boundary:
  - `patient_ledger_entries` supports charge, payment, discount, write-off,
    refund, adjustment, and reversal entry types,
  - normal runtime behavior currently creates only posted `charge` debit entries
    from finalized performed services,
  - no payment, credit, refund, reversal, discount, write-off, adjustment,
    invoice, receipt, allocation, or patient balance workflow exists.
- Compared showing balance now, showing read-only posted charge activity without
  balance, and deferring patient-level financial UI until payments exist.
- Selected the conservative product direction:
  - do not show patient `Balance`, `Amount due`, `Outstanding`, paid status,
    invoice state, or receipt state yet,
  - add a patient-level read-only `Charges` / `Posted charges` surface first,
  - label any totals as posted charges recorded in DentApp and group them by
    currency.
- Recommended placing the first patient-level financial surface inside the
  existing patient Full Record area, not as a prominent Patient Overview balance
  metric.
- Preserved the existing financial read role boundary:
  - `owner_admin`, `doctor`, `specialist`, and `reception_admin` may read
    same-clinic posted charge activity,
  - `assistant` and `inventory_responsible` should not see the financial
    section.
- Documented pending/unposted charge visibility as read-only context; posting
  retry remains outside the patient-level view for now.
- Made no runtime, service, schema, migration, RPC, RLS, browser smoke, or RLS
  test changes.
- Documented the task in
  `docs/design/task-84-patient-account-read-only-ledger-balance-summary-planning.md`.

### Verification (Task 84)

- `git diff --name-only` reviewed.
- `git diff --check` passes.
- Only Task 84 documentation files were changed by this task; pre-existing
  Task 83 runtime/test changes were left untouched.

### Next Recommended Task

- Task 85 - Patient Posted Charges Read-only Section / Account Activity
  Visibility.

---

### Completed (Task 85 - Patient Posted Charges Read-only Section)

- Added a patient Full Record `Charges` section for authorized financial
  readers.
- Added `getPatientPostedChargesSummary(patientId)` in
  `patientLedgerService.ts` using existing RLS-protected
  `patient_ledger_entries` reads.
- Shows posted patient ledger `charge` debit rows only:
  - description snapshot,
  - posted date/time,
  - amount and currency,
  - posted-charge status,
  - completed visit navigation for roles that can open completed visit detail.
- Shows grouped posted-charge totals by currency and labels them as posted
  charges, not patient balance.
- Omits the section for roles blocked from ledger financial rows.
- Keeps the patient-level view read-only with no posting retry, payment,
  balance, invoice, receipt, refund, reversal, discount, write-off, commission,
  materials, or treatment-plan conversion behavior.
- Added browser smoke coverage for the new section, terminology guard, posted
  amount/currency visibility, grouped total visibility, and completed visit
  navigation.
- No migration, RPC, RLS, or schema change was required.
- Documented the task in
  `docs/design/task-85-patient-posted-charges-read-only-section.md`.

### Verification (Task 85)

- `npx.cmd supabase migration up` passes.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientLedgerRls.mjs` passes with local `.env`
  loaded.
- `node .\supabase\snippets\testPatientLedgerPostingRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testPerformedServicesRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `http://127.0.0.1:5173`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded.
- `git diff --check` passes.

### Next Recommended Task

- Task 86 - Payment Recording Foundation Planning / Data Model Decision.

---

### Completed (Task 86 - Payment Recording Foundation Planning)

- Completed a docs-only payment recording architecture decision.
- Confirmed the current payment boundary after Task 85:
  - posted service charges are recorded as `patient_ledger_entries` debit rows,
  - the patient Full Record `Charges` section displays read-only posted charge
    activity,
  - no payment table, payment service, payment UI, payment method, payment
    allocation, reversal, refund, invoice, receipt, or balance workflow exists.
- Compared payment model options:
  - payment as only a ledger credit row,
  - dedicated payment record plus linked ledger credit entry,
  - invoice-first / receivable-first accounting.
- Selected a dedicated future `patient_payments` entity plus a linked posted
  ledger `payment` credit entry.
- Defined initial payment method values: `cash`, `card`, `bank_transfer`, and
  `other`.
- Selected patient-scoped unallocated payments for the MVP; allocation to
  charges, visits, receipts, or invoices remains deferred.
- Defined correction as reversal-based:
  - preserve the original payment,
  - create a compensating debit reversal movement,
  - avoid destructive edits/deletes of posted financial rows.
- Recommended payment recording authority for `owner_admin` and
  `reception_admin` through a controlled pathway; doctors/specialists remain
  financial readers and clinical service-charge posters, not payment recorders
  by default.
- Reconfirmed no patient balance, amount due, outstanding, paid/unpaid,
  invoice, or receipt display should be added merely because payment schema is
  planned.
- Made no runtime, service, schema, migration, RPC, RLS, browser smoke, or RLS
  test changes.
- Documented the task in
  `docs/design/task-86-payment-recording-foundation-planning.md`.

### Verification (Task 86)

- `git diff --name-only` reviewed.
- `git diff --check` passes.
- Only Task 86 documentation files were changed by this task; pre-existing
  Task 83/84/85 runtime/test/doc changes were left untouched.

### Next Recommended Task

- Task 87 - Payment Schema/RLS Foundation.

---

### Completed (Task 87 - Payment Schema/RLS Foundation)

- Added `patient_payments` as the dedicated patient payment record table.
- Added payment constraints:
  - positive `amount`,
  - three-letter uppercase `currency`,
  - `payment_method` in `cash`, `card`, `bank_transfer`, `other`,
  - `status` in `posted`, `reversed`,
  - same-clinic patient scope.
- Added payment-recorder integrity:
  - `recorded_by`, `created_by`, and `reversed_by` where present must be active
    same-clinic `owner_admin` or `reception_admin` profiles.
- Added future ledger linkage:
  - `patient_ledger_entries.patient_payment_id`,
  - validation that linked payment ledger rows are posted `payment` credit rows
    matching the payment clinic, patient, amount, and currency,
  - uniqueness so one posted payment credit can exist per payment.
- Added conservative payment RLS:
  - same-clinic read access for `owner_admin`, `doctor`, `specialist`, and
    `reception_admin`,
  - `assistant` and `inventory_responsible` remain blocked,
  - no authenticated direct insert/update/delete policies.
- Added focused payment schema/RLS coverage in
  `supabase/snippets/testPatientPaymentsRls.mjs`.
- Preserved existing ledger charge posting, completed visit financial display,
  and patient posted-charges behavior.
- No runtime React, frontend service, payment UI, payment recording RPC,
  balance, invoice, receipt, refund, allocation, commission, materials, or
  treatment-plan conversion behavior was added.
- Documented the task in
  `docs/design/task-87-payment-schema-rls-foundation.md`.

### Verification (Task 87)

- `npx.cmd supabase migration up` applies
  `20260524220000_create_patient_payments_foundation.sql`.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientPaymentsRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testPatientLedgerRls.mjs` passes with local `.env`
  loaded.
- `node .\supabase\snippets\testPatientLedgerPostingRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testPerformedServicesRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes with
  local `.env` loaded.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes
  with local `.env` loaded.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `http://127.0.0.1:5173`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes with local
  `.env` loaded.
- `git diff --check` passes.

### Next Recommended Task

- Task 88 - Payment Service Layer / Controlled Recording and Reversal Boundary.

---

### Completed (Task 87B - Browser Smoke Appointment Bridge Timeout Investigation / Narrow Fix)

- Reproduced the authenticated browser smoke timeout and captured output in
  `tmp-browser-smoke-task87b.log`.
- Confirmed the failing assertion was the Task 44 appointment bridge check in
  `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`, waiting for
  `Task 44 appointment bridge recommendation` on the appointments list.
- Verified the backing appointment row existed at failure time as a scheduled,
  not-arrived appointment for the expected patient and clinic.
- Identified the root cause as an appointment-list date range mismatch:
  appointment creation uses local date/time values, while the list query treated
  date-only range boundaries as UTC calendar days.
- Updated `src/features/appointments/appointmentService.ts` so date-only
  appointment range queries use local day start/end boundaries before converting
  to ISO for Supabase.
- Documented the investigation and fix in
  `docs/design/task-87b-browser-smoke-appointment-bridge-timeout-fix.md`.
- No Task 88 payment service, payment UI, balance, invoice, receipt, refund,
  reversal, payment schema, ledger schema, or RLS changes were made.

### Verification (Task 87B)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  twice against `http://127.0.0.1:5173`, including the previously failing
  Task 44 appointment bridge schedule-list assertion.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testPatientLedgerRls.mjs` passes.
- `node .\supabase\snippets\testPatientLedgerPostingRls.mjs` passes.
- `node .\supabase\snippets\testPatientPaymentsRls.mjs` passes.
- `node .\supabase\snippets\testPerformedServicesRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.

### Next Recommended Task

- Task 88 - Payment Service Layer / Controlled Recording and Reversal Boundary.

---

### Completed (Task 88 - Payment Service Layer / Controlled Recording and Reversal Boundary)

- Added controlled payment recording RPCs:
  - `record_patient_payment(...)`,
  - `reverse_patient_payment(...)`.
- Added request-level payment idempotency:
  - `patient_payments.idempotency_key`,
  - unique clinic-scoped idempotency key constraint.
- Recording a payment now creates one trusted `patient_payments` row and one
  linked posted ledger `payment` credit row in the same RPC transaction.
- Ledger payment credits derive clinic, patient, amount, currency, source,
  recorder, and description values server-side.
- Payment recording and reversal are limited to active same-clinic
  `owner_admin` and `reception_admin` profiles.
- Doctors, specialists, assistants, and inventory users are blocked from
  recording/reversing payments.
- Implemented narrow reversal:
  - preserves the original payment and payment credit,
  - marks the payment as `reversed`,
  - creates one compensating posted ledger `reversal` debit entry,
  - repeated reversal returns `already_reversed` without duplicate ledger rows.
- Added typed frontend helpers in
  `src/features/patient-payments/patientPaymentService.ts` without adding any
  React consumer.
- Added focused operation coverage in
  `supabase/snippets/testPatientPaymentRecordingRls.mjs`.
- Added a narrow currency hardening migration so the RPC rejects lowercase
  currency input instead of silently normalizing it.
- Preserved Task 87B appointment date behavior; no appointment code was changed
  in Task 88.
- No payment UI, patient account summary, balance, amount due, invoice, receipt,
  refund, allocation, commission, materials, treatment-plan conversion, Visit
  Completion, or appointment behavior was added.
- Documented the task in
  `docs/design/task-88-payment-service-controlled-recording-reversal-boundary.md`.

### Verification (Task 88)

- `npx.cmd supabase migration up` applied:
  - `20260525100000_add_patient_payment_recording_rpc.sql`,
  - `20260525101000_harden_patient_payment_recording_currency.sql`.
- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientPaymentsRls.mjs` passes.
- `node .\supabase\snippets\testPatientPaymentRecordingRls.mjs` passes.
- `node .\supabase\snippets\testPatientLedgerRls.mjs` passes.
- `node .\supabase\snippets\testPatientLedgerPostingRls.mjs` passes.
- `node .\supabase\snippets\testPerformedServicesRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `http://127.0.0.1:5173` after clearing deterministic duplicate
  `TASK77-SVC` smoke fixture rows left by an earlier interrupted run.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.

### Next Recommended Task

- Task 89 - Patient Account Charges + Payments Read-only Summary / Balance
  Decision.

---

### Completed (Task 89 - Patient Account Charges + Payments / Payment UI Integration and Balance Decision)

- Completed a docs-only product/UI-flow decision after Task 88.
- Confirmed the current UI/payment boundary:
  - completed visit detail shows read-only `Services & charges`,
  - patient Full Record shows a `Charges` section with posted ledger `charge`
    debit rows only,
  - Task 88 backend/service work can record payments and reversals but no
    payment UI or account activity UI consumes it yet.
- Compared next implementation options:
  - read-only account activity first,
  - payment-entry UI first while retaining charge-only history,
  - a tightly scoped Account activity surface with Record payment.
- Selected the next runtime direction as a combined patient-level Account
  activity and Record payment slice.
- Recommended evolving `Posted charges` into `Account activity` with supporting
  copy such as `Read-only financial entries recorded in DentApp`.
- Selected Patient Full Record / Account activity as the payment-entry
  placement, not completed visit detail, appointment detail, or Visit
  Completion.
- Defined the first payment-entry UI boundary for `owner_admin` and
  `reception_admin`:
  - amount,
  - currency,
  - payment method,
  - optional received timestamp,
  - optional reference,
  - optional notes.
- Made UI-generated payment idempotency keys mandatory for the future payment
  form and documented retry/repeated-submit behavior.
- Deferred user-triggered reversal UI to a later narrow task while allowing
  read-only reversal entries to appear in Account activity.
- Kept patient balance, amount due, outstanding, paid/unpaid, invoice, receipt,
  refund, allocation, commission, materials, and treatment-plan conversion out
  of the next runtime slice.
- Made no runtime, service, schema, migration, RPC, RLS, browser smoke, or RLS
  test changes.
- Documented the task in
  `docs/design/task-89-patient-account-payments-ui-balance-decision.md`.

### Verification (Task 89)

- `git diff --name-only` reviewed.
- `git diff --check` passes.
- Only Task 89 documentation files were changed by this task; pre-existing
  Task 88 uncommitted files were left untouched.

### Next Recommended Task

- Task 90 - Patient Account Activity + Record Payment UI.

---

### Completed (Task 90 - Optional Internal Settlement Records / Privacy & Access Decision)

- Completed a docs-only corrective product/privacy decision before exposing any
  payment or financial UI.
- Superseded the Task 89 runtime recommendation for `Patient Account Activity +
  Record Payment UI`.
- Reframed the future capability as an optional internal settlement-record
  module, disabled by default per clinic.
- Documented that DentApp must not be positioned as fiscalization, official
  payment processing, cash register functionality, accounting, invoicing,
  receipt issuance, tax reporting, or official proof of payment.
- Required future internal-use wording indicating that any settlement record is
  internal only and does not replace legally required transaction recording,
  with final legal/Serbian copy to be reviewed professionally before production.
- Corrected terminology away from `Account activity`, `Record payment`,
  `Balance`, `Posted charges`, `Amount due`, `Outstanding`, and `Paid/Unpaid`.
- Selected safer future terminology around:
  - `Internal settlement records`,
  - `Internal settlement entry`,
  - `Recorded settlement`,
  - `Recorded service amount`,
  - Serbian localization candidates `Interna evidencija izmirenja` and
    `Evidentirano izmirenje`.
- Corrected access assumptions:
  - no automatic access for doctors or specialists,
  - no automatic reception access,
  - future access should use explicit capabilities such as
    `can_view_internal_settlement_records` and
    `can_manage_internal_settlement_records`.
- Documented that future visibility must be enforced through RLS or trusted
  server-side checks, not UI hiding alone.
- Prohibited exposing the capability in Visit Completion, completed visit
  detail, appointments, patient overview, schedules, global dashboards, or
  routine navigation badges.
- Reopened the earlier payment-method assumption; payment method should not be
  exposed in a future MVP unless a legitimate operational need is approved.
- Acknowledged that Tasks 80-88 added backend ledger/payment foundations, but no
  payment UI is exposed yet and existing schema/RLS/service naming/access must
  be reviewed before any settlement UI is built.
- Made no runtime, service, schema, migration, RPC, RLS, browser smoke, or RLS
  test changes.
- Documented the task in
  `docs/design/task-90-optional-internal-settlement-records-privacy-access-decision.md`.

### Verification (Task 90)

- `git diff --name-only` reviewed.
- `git diff --check` passes.
- `git status --short` reviewed.
- Only documentation files were changed by this task.

### Next Recommended Task

- Task 91 - Internal Settlement Feature Toggle / Access-Control and Existing
  Backend Review.

---

### Completed (Task 91 - Internal Settlement Feature Toggle / Access-Control and Existing Backend Review)

- Completed a docs-only architecture/security review of the Tasks 80-88 backend
  against the corrected Task 90 internal-settlement boundary.
- Confirmed existing runtime exposure that must be remediated before any new
  settlement UI:
  - Visit Completion currently posts ledger charge rows after performed-services
    finalization,
  - Completed Visit Detail currently shows `Services & charges`, posted charge
    state, and visit-scoped charge totals,
  - Patient Full Record currently exposes `Charges` / `Posted charges`.
- Confirmed existing read access is too broad for the corrected model:
  - ledger/payment read policies include `doctor`, `specialist`, and
    `reception_admin` automatically,
  - future internal settlement access must use explicit capabilities instead of
    ordinary clinical role access.
- Selected a future dedicated clinic internal-settlement settings table instead
  of a bare `clinics` column, with absence/default treated as disabled.
- Selected a future explicit per-profile grant model for capabilities such as
  `can_view_internal_settlement_records` and
  `can_manage_internal_settlement_records`.
- Classified existing ledger/payment artifacts:
  - finalized performed services remain safe independently,
  - ledger/payment tables and RPCs may remain as internal technical foundation,
    but require future access/RLS hardening and terminology/API review,
  - current UI exposure and automatic posting require immediate freeze/gating.
- Decided internal DB names may remain temporarily during development if not
  user-visible, while UI/export/clinic-facing language must move to internal
  settlement terminology.
- Documented auditability and lawful-use requirements:
  - minimal explicit access,
  - traceable corrections,
  - no silent deletion,
  - no design for bypassing legal/fiscal obligations,
  - legal/accounting review before production rollout.
- Recommended the next implementation as
  `Task 92 - Existing Financial Visibility and Automatic Posting Freeze/Gating`.
- Made no runtime, service, schema, migration, RPC, RLS, browser smoke, or RLS
  test changes.
- Documented the task in
  `docs/design/task-91-internal-settlement-feature-toggle-access-control-backend-review.md`.

### Verification (Task 91)

- `git diff --name-only` reviewed.
- `git diff --check` passes.
- `git status --short` reviewed.
- Only documentation files were changed by this task.

### Next Recommended Task

- Task 92 - Existing Financial Visibility and Automatic Posting Freeze/Gating.

---

### Completed (Task 92 - Existing Financial Visibility and Automatic Posting Freeze/Gating)

- Restored ordinary runtime to a clinical-only baseline while the future
  optional internal-settlement module remains unimplemented and disabled.
- Removed or disabled ordinary financial exposure:
  - Visit Completion no longer shows `Services & Charges`,
  - Completed Visit Detail no longer shows `Services & charges`, charge totals,
    posting state, or financial retry actions,
  - Patient Full Record no longer shows `Charges` / `Posted charges`,
  - patient overview/list demo balance placeholders were removed,
  - the `Payments` navigation/route exposure was removed from ordinary routing.
- Stopped automatic financial record creation from Visit Completion:
  - clinical visit completion still succeeds,
  - performed-service financial draft save/finalization is not invoked from the
    ordinary UI,
  - ledger charge posting and retry handling are not invoked.
- Added interim access-block migration
  `20260525103000_freeze_internal_settlement_visibility_and_access.sql`:
  - removed ordinary authenticated read policies from `patient_ledger_entries`
    and `patient_payments`,
  - removed ordinary authenticated read/write policies from
    `performed_services`,
  - revoked authenticated table access to those frozen artifacts,
  - revoked authenticated execution of ledger posting, payment recording, and
    payment reversal RPCs.
- Preserved existing backend objects and stored rows; no financial table,
  column, RPC, or historical record was deleted or renamed.
- Kept `visit_procedures` as the clinical procedure record while freezing
  `performed_services` because it is the chargeable financial snapshot table.
- Updated browser smoke coverage to assert the frozen UI baseline and clinical
  completion behavior.
- Added `supabase/snippets/testInternalSettlementFreezeRls.mjs` for interim
  blocked-state RLS/RPC coverage.
- Documented the task in
  `docs/design/task-92-existing-financial-visibility-automatic-posting-freeze-gating.md`.

### Verification (Task 92)

- `npx.cmd supabase migration up` passes.
- `npm.cmd run build` passes with the existing Vite large chunk warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes with
  local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes on
  rerun after one transient local upstream response failure.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.

### Next Recommended Task

- Task 93 - Internal Settlement Feature Toggle and Explicit Permission
  Schema/RLS Foundation.

---

### Completed (Task 54 - Appointment Lifecycle State Transition Hardening)

- Confirmed the supported lifecycle behavior:
	- `scheduled` -> `cancelled`,
	- `scheduled` -> `no_show`,
	- scheduled appointment -> `Start visit`,
	- linked draft/in-progress visit -> `Continue visit`,
	- linked completed visit -> `View visit`,
	- cancelled/no-show appointments have no primary Visit Completion action.
- Centralized secondary lifecycle eligibility with
  `canUpdateAppointmentLifecycle`:
	- status must be `scheduled`,
	- no linked open Visit Completion may exist,
	- no linked completed Visit Completion may exist.
- Hardened `appointmentService.updateAppointmentStatus`:
	- accepts only `cancelled` and `no_show` for direct appointment status
	  updates,
	- rejects direct manual `completed` updates,
	- checks current appointment status and linked visits before writing,
	- scopes the write by clinic and current `scheduled` status.
- Removed manual `Complete` from appointment status menus. Appointment
  completion remains handled by completing linked Visit Completion.
- Aligned Appointment Detail, daily/weekly cards, and patient appointment
  summary card behavior around the same guard.
- Improved success copy:
	- `Appointment was cancelled.`,
	- `Appointment was marked no-show.`
- Expanded `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to verify:
	- scheduled secondary cancel/no-show actions,
	- no manual `Complete` lifecycle menu action,
	- cancel transition status/action cleanup,
	- no-show transition status/action cleanup,
	- linked draft and completed appointment lifecycle hiding,
	- existing Visit Completion happy path.
- No schema changes, new lifecycle states, provider assignment, check-in/in-room
  states, autosave, billing/payments/materials/attachments, treatment-plan
  mutation, reminders, tasks, or broad redesign were added.
- Documented the task in
  `docs/design/task-54-appointment-lifecycle-state-transition-hardening.md`.

### Verification (Task 54)

- `npm.cmd run build` passes with the existing Vite chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 93 - Internal Settlement Feature Toggle and Explicit Permission Foundation)

- Added a disabled-by-default clinic setting table for the future internal
  settlement records capability.
- Added explicit same-clinic per-profile access grants with active-profile
  validation and no empty false/false grants.
- Added future-only helper functions for enabled/view/manage eligibility without
  attaching them to any ledger, payment, performed-service, posting, payment, or
  reversal access path.
- Added RLS so only active same-clinic `owner_admin` users can administer the
  setting and grants.
- Added focused RLS coverage in
  `supabase/snippets/testInternalSettlementFeatureAccessRls.mjs`.
- Documented the feature-toggle foundation, disabled semantics, grant semantics,
  audit expectations, frozen-access boundary, and deferred decisions in
  `docs/design/task-93-internal-settlement-feature-toggle-explicit-permission-foundation.md`.
- No React UI, routes, patient settlement display, payment forms, balance
  indicators, automatic posting, RPC thawing, invoices, receipts, exports, or
  reports were added.

### Verification (Task 93)

- `npx.cmd supabase migration up` passes and applies
  `20260525110000_add_internal_settlement_feature_toggle_and_access_grants.sql`.
- `npm.cmd run build` passes with the existing Vite large chunk-size warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs`
  passes after provisioning demo auth users and loading local Supabase env
  values.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `DENTAPP_APP_URL=http://localhost:5173`.
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `git diff --check` passes with existing line-ending warnings on edited docs.

### Next Recommended Task

- Task 94 - Internal Settlement Record Model / Controlled Access Path Decision.

---

### Completed (Task 94 - Internal Settlement Post-MVP Deferral / MVP Roadmap Refocus)

- Documented that internal settlement records / Interna evidencija izmirenja are
  outside the MVP.
- Confirmed the Task 92/93 safe baseline remains unchanged: no ordinary
  settlement/payment/charge/balance visibility, no payment route, no Visit
  Completion financial step, no automatic ledger posting, frozen backend access,
  and inactive future-only setting/grant foundation.
- Deferred settlement record-model decisions, controlled RPCs, settlement UI,
  histories, balances, payment methods, corrections/reversals UI, audit UI,
  exports, reports, fiscalization, invoices, and receipts until after MVP.
- Updated the roadmap/todo direction so the next active stream returns to MVP
  clinical/product readiness and UI/UX restyling planning.
- Recommended `Task 95 - MVP UI/UX Restyling Foundation Planning` as the next
  active task.
- Added
  `docs/design/task-94-internal-settlement-post-mvp-deferral-roadmap-refocus.md`.
- No runtime code, schema, migrations, RLS, RPCs, services, tests, UI
  components, or routes were changed for Task 94.

### Verification (Task 94)

- `git diff --name-only` reviewed; Task 94 changes are documentation-only.
- `git diff --check` passes with standard line-ending warnings on edited docs.
- `git status --short` reviewed.

### Next Recommended Task

- Task 95 - MVP UI/UX Restyling Foundation Planning.

---

### Completed (Task 95 - Pilot Clinical Flow Audit and UI/UX Restyling Foundation Planning)

- Defined the first in-clinic pilot as the focused clinical workflow:
  appointment scheduling, planner/schedule display, patient reception
  progression, clinical visit work, treatment-plan creation/use, and optional
  next-appointment scheduling.
- Audited the current appointment, planner, appointment detail, patient detail,
  reception operational-state, Visit Completion, completed visit review,
  treatment-plan, route, and navigation surfaces.
- Confirmed appointment scheduling, daily/weekly planner display, provider
  assignment/filtering, reception operational progression, clinical-only Visit
  Completion, completed visit review, and rebooking already have functional
  foundations.
- Confirmed current treatment-plan patient surfaces are read-only and the
  top-level Treatment Plans route remains a placeholder, while the service layer
  already contains write functions.
- Classified treatment-plan creation/editing UI as the main pilot-critical
  functional blocker.
- Added a priority layer over the existing roadmap:
  - `Pilot-critical`,
  - `Pilot usability / restyling`,
  - `Post-pilot or deferred`.
- Prioritized planner/card/reception/patient-detail/Visit Completion restyling
  around the pilot flow instead of broad generic MVP redesign.
- Kept internal settlement, payments, ledger, balances, fiscalization, invoices,
  receipts, commissions, advanced reports, advanced reminders, external
  calendar sync, online booking, patient portal, and broad inventory work out of
  the active pilot stream.
- Added
  `docs/design/task-95-pilot-clinical-flow-ui-ux-restyling-foundation-planning.md`.
- No runtime code, schema, migrations, RLS, RPCs, services, tests, routes, UI
  components, or styling were changed for Task 95.

### Verification (Task 95)

- `git diff --name-only` reviewed; Task 95 changes are documentation-only.
- `git diff --check` passes with standard line-ending warnings on edited docs.
- `git status --short` reviewed.

### Next Recommended Task

- Task 96 - Treatment Plan Creation/Edit Pilot Workflow Finalization.

---

### Completed (Task 96 - Treatment Plan Creation/Edit Pilot Workflow Finalization)

- Inspected actual treatment-plan schema, RLS, service, UI, route, browser
  smoke, and design-document baselines.
- Confirmed `treatment_plans` and `treatment_plan_items` already exist with
  patient scope, clinic scope, statuses, soft archive fields, timestamps,
  created/updated profile references, indexes, triggers, and RLS.
- Confirmed treatment-plan service methods already exist for plan and item
  create/update/archive, including validation and audit-log calls.
- Confirmed existing RLS/read coverage includes
  `testTreatmentPlanReadRls.mjs`, `testTreatmentPlanCrud.mjs`, and browser
  smoke read-only assertions.
- Confirmed the current runtime treatment-plan UI is still read-only:
  `PatientTreatmentPlanSummary`, `TreatmentPlansSection`, and
  `PatientQuickActions` expose view-only patient context, while
  `TreatmentPlansPage` remains a placeholder.
- Identified the main implementation gap as patient-scoped treatment-plan
  mutation UI, not missing storage or missing service methods.
- Identified a required hardening gap before UI exposure: plan-level
  insert/update RLS should prove the referenced `patient_id` belongs to the same
  clinic, matching the stronger appointment and treatment-plan-item patterns.
- Decided the first pilot mutation UI should live in Patient Detail / Full
  Record treatment-plan section rather than in Visit Completion or a broad
  global planning workspace.
- Decided pilot treatment-plan UI must hide/ignore legacy amount fields such as
  `proposed_total`, `estimated_price`, and service-code style inputs.
- Preserved the boundary between treatment plan items as intended future work
  and `visit_procedures` as actual completed clinical work.
- Added
  `docs/design/task-96-treatment-plan-creation-edit-pilot-workflow-finalization.md`.
- No runtime code, services, schema, migrations, RLS, RPCs, tests, routes,
  styles, or design mockups were changed for Task 96.

### Verification (Task 96)

- `git diff --name-only` reviewed; Task 96 changes are documentation-only.
- `git diff --check` passes with standard line-ending warnings on edited docs.
- `git status --short` reviewed.

### Next Recommended Task

- Task 97 - Treatment Plan Mutation Schema/RLS Hardening.

---

### Completed (Task 97 - Treatment Plan Mutation Schema/RLS Hardening)

- Rechecked actual treatment-plan migrations, item parent-scope hardening,
  patient/profile helper functions, treatment-plan service write methods,
  audit-log RPC behavior, read RLS tests, CRUD/RLS tests, and read-only browser
  smoke assertions before editing.
- Added
  `supabase/migrations/20260526100000_harden_treatment_plan_mutation_scope.sql`.
- Added treatment-plan trigger enforcement so plan mutation requires a
  non-deleted same-clinic patient, blocks `clinic_id` reassignment, blocks
  `patient_id` reassignment, and blocks further mutation after soft archive.
- Recreated treatment-plan insert/update policies with explicit same-clinic
  patient existence checks.
- Added treatment-plan-item trigger enforcement so items must remain aligned
  with a non-deleted same-clinic parent plan and cannot reassign parent, clinic,
  or patient after creation.
- Preserved existing mutation authority for `owner_admin`, `doctor`, and
  `specialist`.
- Preserved read-only treatment-plan access for `assistant` and
  `reception_admin`.
- Preserved no treatment-plan access for `inventory_responsible`.
- Added
  `supabase/snippets/testTreatmentPlanMutationRls.mjs` to cover allowed doctor
  mutations, denied non-clinical writes, cross-clinic patient blocking,
  clinic/patient reassignment blocking, archived-plan blocking, and item-parent
  mismatch blocking.
- Added
  `docs/design/task-97-treatment-plan-mutation-schema-rls-hardening.md`.
- Added no Patient Detail mutation UI, React forms, route changes, service
  redesign, prices, settlement/payment/ledger behavior, Visit Completion
  conversion, materials, reminders, reports, invoices, or receipts.

### Verification (Task 97)

- `npx.cmd supabase migration up` passes and applies
  `20260526100000_harden_treatment_plan_mutation_scope.sql`.
- `node .\supabase\snippets\testTreatmentPlanMutationRls.mjs` passes with local
  Supabase env loaded from `npx.cmd supabase status -o env` plus `.env.local`.
- `npm.cmd run build` passes with the existing Vite large chunk warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes after updating
  the mismatched-item assertion to accept trigger-level blocking.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `DENTAPP_APP_URL=http://localhost:5173` after restarting the local
  Vite dev server.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs` passes.
- `git diff --check` passes with standard line-ending warnings on edited docs
  and snippets.

### Next Recommended Task

- Task 98 - Patient Treatment Plan Creation/Edit UI.

---

### Completed (Task 98 - Patient Detail Treatment Plan Creation/Edit UI)

- Reused the existing Patient Detail / Full Record treatment-plan section as
  the patient-scoped mutation surface.
- Added create/edit controls for treatment plans and planned treatment items for
  authorized clinical roles:
  - `owner_admin`,
  - `doctor`,
  - `specialist`.
- Preserved read-only treatment-plan visibility for `assistant` and
  `reception_admin`, with no mutation controls.
- Preserved blocked treatment-plan access for `inventory_responsible` through
  existing RLS/read behavior.
- Reused the existing treatment-plan service methods for plan and item
  create/update/archive plus focused reload/read behavior.
- Exposed only clinical planning fields:
  - plan title,
  - plan notes/objective,
  - plan status,
  - item tooth/region,
  - item title,
  - item notes,
  - item status.
- Kept legacy amount/service-code fields hidden and submitted empty values for
  them from the pilot UI.
- Added secondary confirmation-based soft archive actions for plans and items,
  using the existing approved archive service model.
- Fixed the treatment-plan read helper to accept the deterministic UUID-shaped
  local seed IDs used by the project, so saved plans persist correctly after a
  page reload.
- Updated authenticated browser smoke coverage for treatment-plan create,
  item create, reload persistence, plan edit, item edit, and finance-term
  absence.
- Stabilized existing appointment-list smoke assertions by restoring the
  created appointment's actual local schedule date before schedule-card checks.
- Added
  `docs/design/task-98-patient-detail-treatment-plan-creation-edit-ui.md`.
- Added no settlement/payment/ledger UI, prices, charges, balances, invoices,
  receipts, fiscal behavior, performed-service reconnection, appointment
  conversion, Visit Completion conversion, materials, reports, reminders, or
  broad Patient Detail redesign.

### Verification (Task 98)

- `npx.cmd supabase migration up` passes; local database is up to date.
- `npm.cmd run build` passes with the existing Vite large chunk warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testTreatmentPlanMutationRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against a fresh local Vite server on `http://127.0.0.1:5176`.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs`
  passes.

### Next Recommended Task

- Task 99 - Planner and Appointment Card Pilot UI/UX Restyling.

---

### Completed (Task 99 - Planner and Appointment Card Pilot UI/UX Restyling)

- Restyled the Appointments page as the pilot `Planner` workspace, with clearer
  operational page copy, selected day/week context, visible appointment count,
  and one grouped `Planner controls` toolbar.
- Preserved daily/weekly view switching, date/week navigation, provider filter
  semantics, provider URL persistence, invalid provider fallback, refresh,
  lifecycle actions, operational-state progression/correction, and
  Start/Continue/View visit behavior.
- Restyled appointment cards around a dedicated time anchor, patient identity,
  appointment type/reason, assigned provider, operational/lifecycle status, and
  separated reception versus clinical action zones.
- Kept cancel/no-show and operational correction actions in the existing
  secondary appointment menu where current eligibility rules allow them.
- Reduced mobile card clutter by hiding low-priority notes on the narrowest
  cards while keeping notes visible on tablet/desktop.
- Expanded browser smoke coverage with stable semantic assertions for the
  planner toolbar, key appointment card regions, operational indicator, primary
  visit action area, and secondary action menu reachability.
- Expanded the responsive overflow smoke viewport set to include 768 px tablet
  portrait.
- Performed screenshot-based visual inspection at 390 px, 768 px, and 1280 px
  for daily schedule, weekly schedule, provider toolbar state, scheduled,
  cancelled, no-show, completed, ready/completed linked-visit states, and empty
  schedule layout.
- Added
  `docs/design/task-99-planner-appointment-card-pilot-ui-ux-restyling.md`.
- Added no schema, migration, RLS, RPC, service write, appointment lifecycle,
  operational-state model, provider assignment, Visit Completion,
  treatment-plan, settlement, payment, ledger, invoice, receipt, fiscal, report,
  or broad Patient Detail behavior changes.

### Verification (Task 99)

- `npm.cmd run build` passes with the existing Vite large chunk warning and the
  existing Tailwind/Vite timing warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `DENTAPP_APP_URL=http://127.0.0.1:5173`.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanMutationRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs`
  passes.

### Next Recommended Task

- Task 100 - Patient Detail Clinical Workflow Entry UI/UX Restyling.

---

### Completed (Task 100 - Patient Detail Clinical Workflow Entry UI/UX Restyling)

- Reviewed the interrupted uncommitted Task 100 diff before extending it and
  confirmed the retained UI changes were largely usable:
  `PatientSnapshot`, `PatientTodayPanel`, `PatientQuickActions`,
  `PatientAppointmentSummary`, `PatientFullRecord`, `PatientDetailPage`, and
  `testPatientAppointmentBrowserSmoke.mjs`.
- Confirmed Task 99 was already present as the baseline and no unrelated
  tracked implementation files were added to the Task 100 diff.
- Kept the interrupted patient-detail restyle because it already fit the
  intended Task 100 hierarchy:
  - patient identity and safety in `PatientSnapshot`,
  - current workflow and primary action in `PatientTodayPanel`,
  - treatment-plan and rebooking entry directly under workflow context,
  - recent activity/follow-up as supporting clinical context,
  - role-aware shortcuts as secondary paths,
  - deeper Full Record access as the `Clinical Record` workspace.
- Confirmed Task 98 Treatment Plan behavior remains intact:
  create, edit, archive, role restrictions, and archived-patient mutation
  limits remain on the existing treatment-plan section.
- Confirmed no payment, balance, ledger, invoice, receipt, settlement, or
  internal-finance UI returned on Patient Detail.
- Added
  `docs/design/task-100-patient-detail-clinical-workflow-entry-ui-ux-restyling.md`
  to document the interrupted implementation, retained recovery result, manual
  responsive inspection, and final validation outcome.
- Final validation required one narrow smoke-test stabilization inside
  `testPatientAppointmentBrowserSmoke.mjs`:
  - wait for the restyled patient workflow surface before asserting the empty
    appointment state,
  - wait for the normal Visit Completion route first-step `Next` action to be
    enabled before advancing.
- No runtime Patient Detail behavior, schema, RLS, RPC, finance, settlement, or
  Visit Completion product scope was expanded during validation finalization.

### Verification (Task 100)

- `npm.cmd run build` passes with the existing Vite large chunk warning and the
  existing Tailwind/Vite timing warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `DENTAPP_APP_URL=http://127.0.0.1:5173`.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanMutationRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs`
  passes.
- `git diff --check` passes with only standard LF/CRLF warnings.
- Manual responsive inspection was already completed at approximately:
  - 390 px mobile,
  - 768 px tablet,
  - 1280 px desktop.
- Manual inspection confirmed:
  - patient identity/workflow/action hierarchy is clear,
  - treatment-plan access and authorized mutation controls remain reachable,
  - Full Record remains readable and intentionally denser than the top workflow
    section,
  - no finance or settlement UI was visible.

### Next Recommended Task

- Task 101 - Visit Completion Clinical Flow Pilot UI/UX Restyling.

---

### Completed (Task 101 - Visit Completion Clinical Flow Pilot UI/UX Restyling)

- Reviewed the current Visit Completion runtime, route shell, child summary
  surface, patient-detail entry points, completed-visit detail/timeline
  surfaces, prior mobile sticky workflow decisions, and existing browser smoke
  coverage before editing.
- Confirmed the current Visit Completion step sequence remains clinical-only:
  `Plan`, `Done`, `Notes`, `Next`, `Review`.
- Confirmed `Services & Charges` remains absent from the runtime workflow and
  kept settlement/payment/ledger/posting UI frozen out of ordinary usage.
- Restyled `VisitCompletionFlow` as a clearer clinical workspace while
  preserving behavior:
  - patient context remains first,
  - workflow status and draft confidence moved into a separate context panel,
  - progress presentation is calmer on tablet/desktop and still compact on
    mobile,
  - step content cards are less cluttered,
  - review now summarizes procedures, note, recommendation, and next step more
    clearly,
  - success state now gives clearer existing next-navigation options.
- Restyled `VisitCompletionSummary` so review readiness reads as a focused
  clinical checkpoint rather than a generic metric strip.
- Preserved all existing draft-save, reload, completion, appointment-linked,
  completed-visit, provider-context, and warning/error behavior.
- Extended `testPatientAppointmentBrowserSmoke.mjs` with stable Visit
  Completion semantic assertions:
  - restyled workflow shell,
  - workflow context/status regions,
  - progress region,
  - review-stage semantic regions,
  - success-state semantic region,
  - continued absence of financial/settlement terminology.
- Added
  `docs/design/task-101-visit-completion-clinical-flow-pilot-ui-ux-restyling.md`.

### Verification (Task 101)

- `npm.cmd run build` passes with the existing Vite large chunk warning.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  against `DENTAPP_APP_URL=http://127.0.0.1:5173`.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanMutationRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs`
  passes.
- `git diff --check` passes with only standard LF/CRLF warnings.
- Manual screenshot inspection was completed at approximately:
  - 390 px mobile,
  - 768 px tablet,
  - 1280 px desktop.
- Manual inspection covered:
  - initial Visit Completion step,
  - populated procedures step,
  - review stage,
  - draft save confirmation,
  - confirmation/completion stage,
  - success state,
  - populated content readability,
  - mobile sticky progress/action behavior,
  - absence of financial or settlement UI.

### Next Recommended Task

- Task 102 - In-Clinic Pilot Workflow Walkthrough / UI Consistency and Blocking Defect Audit.

---

### Completed (Task 53 - Restore Appointment Lifecycle Secondary Actions)

- Root cause found: the status transitions still existed, but recent action
  hierarchy/card polish moved them into compact overflow menus with shortened
  labels (`Cancel`, `No-show`), making the supported appointment lifecycle
  actions hard to discover.
- Restored explicit secondary lifecycle labels:
	- `Cancel appointment` for the existing `cancelled` status update,
	- `Mark no-show` for the existing `no_show` status update.
- Kept primary clinical actions context-aware:
	- scheduled: `Start visit`,
	- open draft / in progress: `Continue visit`,
	- completed: `View completed visit` / `View visit`,
	- cancelled/no-show: no primary Visit Completion action.
- Kept lifecycle actions in secondary `ActionMenu` controls on Appointment
  Detail and daily/weekly appointment cards.
- Hid destructive lifecycle actions when a linked open or completed Visit
  Completion record exists.
- Expanded `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` to verify
  scheduled lifecycle menu visibility, primary action separation, in-progress
  lifecycle hiding, completed appointment card/detail behavior, and the existing
  Visit Completion flow.
- No schema changes, new lifecycle states, provider assignment, check-in/in-room
  flow, autosave, billing/payments/materials/attachments, treatment-plan
  mutation, reminders, or tasks were added.
- Documented the task in
  `docs/design/task-53-restore-appointment-lifecycle-secondary-actions.md`.

### Verification (Task 53)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes
  with local `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  `.env` loaded and `SUPABASE_SERVICE_ROLE_KEY` mapped from
  `SUPABASE_SERVICE_KEY`.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

### Completed (Task 102 - In-Clinic Pilot Workflow Walkthrough / UI Consistency and Blocking Defect Audit)

- Reviewed the current pilot-critical implementation surfaces across Planner,
  Patient Detail, Visit Completion, Treatment Plan, completed visit history,
  and the existing patient-context rebooking path.
- Confirmed the active pilot workflow can be walked through from scheduling to
  reception progression, Patient Detail entry, Visit Completion, treatment-plan
  access, and follow-up / next appointment creation without a blocking
  transition.
- Confirmed the three recent pilot surfaces remain visually coherent enough for
  guided in-clinic testing:
  - Planner emphasizes schedule scan clarity and reception progression,
  - Patient Detail emphasizes identity, current workflow, treatment plan, and
    rebooking,
  - Visit Completion remains a focused clinical-only guided flow.
- Confirmed Treatment Plan creation/editing remains reachable and supported by
  the existing Task 98 and Task 97 write/RLS behavior.
- Confirmed the rebooking / next-appointment entry point remains sufficiently
  clear through the existing `Appointments / Rebooking` patient-context card.
- Confirmed no finance, settlement, payment, charge, balance, invoice, or
  receipt UI reappeared in the pilot path.
- Identified no runtime blocking defect requiring a Task 102 code fix.
- Decided the committed `tmp/task101-*.png` files should be removed later in a
  normal repository-hygiene cleanup commit rather than treated as product
  assets.
- Documented the audit in
  `docs/design/task-102-in-clinic-pilot-workflow-walkthrough-ui-consistency-blocking-defect-audit.md`.

### Verification (Task 102)

- `npm.cmd run build` passes with the existing Vite large chunk warning only.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes with
  local `.env.local` loaded and `DENTAPP_APP_URL=http://127.0.0.1:5173`.
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs` passes.
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanMutationRls.mjs` passes.
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs` passes.
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs` passes.
- `git diff --check` passes.
- Manual responsive inspection was completed at approximately `390 px`,
  `768 px`, and `1280 px` across Planner, Patient Detail, and Visit
  Completion, including the patient-context rebooking entry.
- One browser-smoke timeout occurred during an earlier run on the Patient
  Detail semantic wait, but a rerun passed cleanly without changes; it was
  treated as transient rather than a product blocker.

### Next Recommended Task

- Task 103 - Guided In-Clinic Pilot Session Checklist and Observation Log Setup.

---

### Completed (Task 44 - Follow-up and Next Visit Recommendation Flow)

- Polished follow-up display using existing Visit Completion `recommendation` and `next_step` fields.
- Added completed visit timeline follow-up section:
	- recommended follow-up,
	- next-step badge,
	- recommendation text,
	- explicit display-only note.
- Added completed visit detail `Follow-up Guidance` section:
	- source visit/date,
	- suggested next step,
	- recommendation,
	- non-mutating reminder.
- Surfaced linked completed visit follow-up in Appointment Detail.
- Surfaced compact follow-up signal on completed daily schedule appointment cards.
- Kept the existing patient overview `Follow-up / Next Step` summary and added stable smoke coverage.
- Expanded appointment linked visit summaries to include recommendation and next step.
- Expanded browser smoke coverage for recommendation/next-step entry, draft reload, and follow-up surfaces.
- No autosave, billing, payments, materials, attachments, treatment-plan mutation, automatic appointment creation, or new follow-up schema was added.
- Documented the task in `docs/design/task-44-follow-up-next-visit-recommendation-flow.md`.

### Verification (Task 44)

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs` passes.
- `node .\supabase\snippets\testVisitCompletionRls.mjs` passes with local
  Supabase URL, anon key, and service key loaded in the shell.

### Next Recommended Task

- Checkpoint B - Product Roadmap Re-balance.

---

## Notes

This project should remain structured and incremental.

Do not start coding application features until the core discovery and planning documents are sufficiently defined.









