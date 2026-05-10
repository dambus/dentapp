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

### Current Project State

Phase 1 — App Foundation is complete. Phase 2 — Patients and records has started with frontend-only Patients list, Patient Detail, read-only patient record section, and patient form foundation tasks.

Tailwind CSS is configured and verified with a temporary DentApp screen. No business features have been implemented yet.

The required Phase 1 source folder structure now exists. Initial React Router routes, placeholder pages, app shell, role-aware sidebar navigation placeholder, top bar, shared page layout components, and basic shared UI components are configured.

The Patients page now renders fake demo patient data with local search and status filtering. Demo patient profiles can be opened through `/patients/:patientId` and show read-only overview and structured patient record sections from the same fake dataset. Frontend-only create/edit form routes exist for layout and workflow validation, but they do not persist data. Protected routes, real authentication, Supabase integration, document upload, and real patient records have not been implemented yet.

### Current Stack Decision

Initial stack:

- React
- Vite
- TypeScript
- Tailwind CSS configured
- React Router configured
- Temporary demo role navigation configured
- Supabase planned
- PostgreSQL planned
- Supabase Auth planned
- Supabase Storage planned

### Build Status

- `npm run build` succeeds.
- `npm run lint` succeeds.
- `npm run dev` serves the configured app shell, placeholder routes, demo Patients list, demo Patient Detail route, read-only demo patient record sections, and frontend-only patient create/edit form routes locally.

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

1. Continue Phase 2 with the next scoped Patients module task.
2. Keep using fake/demo data until Supabase integration is explicitly scoped.
3. Define validation, permissions, and persistence before enabling real patient modifications.

---

## Notes

This project should remain structured and incremental.

Do not start coding application features until the core discovery and planning documents are sufficiently defined.









