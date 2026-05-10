# DentApp — Phase 1 Checklist

## 1. Phase Name

Phase 1 — App Foundation

---

## 2. Phase Goal

Create the initial application foundation before implementing business features.

Phase 1 should give the project:

- clean frontend structure,
- Tailwind CSS setup,
- app shell,
- navigation,
- placeholder pages,
- reusable basic components,
- routing,
- clear visual foundation,
- working local build.

No real business logic should be implemented in this phase.

---

## 3. Phase 1 Scope

Phase 1 includes:

- Tailwind CSS setup,
- folder structure under src,
- basic routing,
- app layout,
- sidebar navigation,
- top bar,
- placeholder pages,
- basic UI components,
- responsive shell,
- demo role-aware navigation placeholder,
- documentation updates.

---

## 4. Out of Scope

Phase 1 does not include:

- Supabase database schema,
- real authentication,
- real patient data,
- patient CRUD,
- treatment plans,
- odontogram,
- payments,
- commissions,
- inventory logic,
- RLS policies,
- production deployment,
- patient portal,
- online booking.

These belong to later phases.

---

## 5. Required Documentation to Read First

Before starting Phase 1 implementation, read:

- docs/08_codex/codex_project_context.md
- docs/08_codex/codex_rules.md
- docs/08_codex/codex_task_template.md
- docs/08_codex/codex_review_checklist.md
- docs/04_ux_ui/ux_principles.md
- docs/04_ux_ui/information_architecture.md
- docs/04_ux_ui/screen_map.md
- docs/04_ux_ui/design_system.md
- docs/04_ux_ui/component_inventory.md
- docs/05_technical/technical_architecture.md
- docs/07_execution/implementation_roadmap.md

---

## 6. Step 1 — Install and Configure Tailwind CSS

Tasks:

- install Tailwind CSS and required packages for Vite,
- configure Tailwind according to the current recommended setup,
- update CSS entry file,
- confirm Tailwind classes work,
- remove unnecessary default Vite styling.

Acceptance criteria:

- app runs with Tailwind styles,
- default Vite styling is cleaned,
- no unnecessary dependencies are added,
- npm run dev works,
- npm run build works.

---

## 7. Step 2 — Create Source Folder Structure

Create or organize folders:

    src/app
    src/assets
    src/components
    src/features
    src/hooks
    src/layouts
    src/lib
    src/pages
    src/routes
    src/services
    src/styles
    src/types

Acceptance criteria:

- folders exist,
- structure follows technical architecture,
- no business logic is added yet.

---

## 8. Step 3 — Create Basic Routing

Recommended:

- use React Router unless a better reason exists.

Initial routes:

- /login
- /
- /calendar
- /patients
- /treatment-plans
- /payments
- /commissions
- /inventory
- /reports
- /settings

Acceptance criteria:

- routes work,
- navigation can move between pages,
- unknown route shows Not Found placeholder,
- no protected route logic required yet unless simple placeholder is used.

---

## 9. Step 4 — Create App Shell

Create:

- main authenticated layout,
- sidebar navigation,
- top bar,
- main content area,
- responsive behavior.

Initial components:

- AppShell
- SidebarNav
- TopBar
- Page
- PageHeader

Acceptance criteria:

- app has stable layout,
- navigation is visible on desktop,
- layout does not break on mobile,
- content area is readable,
- visual style is clean and professional.

---

## 10. Step 5 — Create Placeholder Pages

Create placeholder pages:

- LoginPage
- DashboardPage
- CalendarPage
- PatientsPage
- TreatmentPlansPage
- PaymentsPage
- CommissionsPage
- InventoryPage
- ReportsPage
- SettingsPage
- NotFoundPage

Each placeholder should include:

- page title,
- short description,
- future module note,
- no fake sensitive data.

Acceptance criteria:

- every main route has a page,
- pages are visually consistent,
- placeholders make it clear that feature is not implemented yet.

---

## 11. Step 6 — Create Basic UI Components

Create initial components:

- Button
- Card
- Badge
- PageHeader
- EmptyState
- LoadingState
- ErrorState

Acceptance criteria:

- components are reusable,
- components use TypeScript,
- components use Tailwind,
- components are simple,
- components are not over-engineered.

---

## 12. Step 7 — Role-Aware Navigation Placeholder

Create a simple navigation model that can later be connected to real auth.

For Phase 1, it may use a temporary demo role value.

Navigation items should include role metadata or visibility logic.

Acceptance criteria:

- navigation structure is centralized,
- future role-based filtering is easy,
- no real auth logic required yet.

---

## 13. Step 8 — Clean Default Vite App

Remove:

- default Vite logo screen,
- unused CSS,
- unused assets,
- demo counter logic.

Keep:

- clean app entry,
- clean React structure,
- necessary Vite files.

Acceptance criteria:

- app no longer looks like default Vite app,
- no unused demo code remains.

---

## 14. Step 9 — Build Check

Run:

    npm run build

Acceptance criteria:

- build succeeds,
- no obvious TypeScript errors,
- no missing imports,
- no broken routes.

---

## 15. Step 10 — Documentation Update

After Phase 1 implementation or each Phase 1 task:

Update:

- docs/07_execution/progress.md
- docs/07_execution/todo.md if new tasks appear
- docs/00_project/decisions.md if a new decision is made
- docs/00_project/open_questions.md if unresolved questions appear

Acceptance criteria:

- progress reflects actual work,
- todo reflects remaining tasks,
- decisions are documented.

---

## 16. Recommended Phase 1 Task Order for Codex

Use these as separate tasks:

### Task 1

Install and configure Tailwind CSS.

### Task 2

Create folder structure and clean default Vite app.

### Task 3

Install and configure React Router.

### Task 4

Create AppShell, SidebarNav, TopBar, Page, and PageHeader.

### Task 5

Create placeholder pages and routes.

### Task 6

Create basic UI components.

### Task 7

Add role-aware navigation placeholder.

### Task 8

Run build and cleanup.

Do not combine all tasks into one large Codex task unless necessary.

---

## 17. Phase 1 Completion Criteria

Phase 1 is complete when:

- Tailwind is configured,
- src folder structure exists,
- routing works,
- app shell works,
- placeholder pages exist,
- basic UI components exist,
- default Vite UI is removed,
- build succeeds,
- documentation is updated.

---

## 18. Risks

### 18.1 Overbuilding UI Components

Risk:

Creating too many components too early.

Mitigation:

Build only what is needed for foundation.

### 18.2 Starting Business Logic Too Early

Risk:

Implementing patients, payments, or inventory before foundation is stable.

Mitigation:

Keep Phase 1 focused on layout and structure.

### 18.3 Bad Tailwind Setup

Risk:

Incorrect Tailwind configuration causes styling issues.

Mitigation:

Use current Vite/Tailwind recommended setup and test immediately.

### 18.4 Routing Rework

Risk:

Poor initial routing structure may require changes later.

Mitigation:

Keep route structure simple and aligned with screen map.

---

## 19. Open Phase 1 Questions

- Should shadcn/ui be introduced in Phase 1 or later?
- Should React Router be the confirmed routing library?
- Should login be only a placeholder in Phase 1?
- Should navigation use Serbian or English labels initially?
- Should Tailwind v4 or current latest recommended setup be used?
- Should we create a central route config file?
