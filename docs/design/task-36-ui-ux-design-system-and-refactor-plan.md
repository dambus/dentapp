# Task 36 - UI/UX Design System and Interaction Refactor Plan

## Goal

Create a practical DentApp UI foundation that supports the already agreed workflow direction: modern clinical productivity, clear patient context, low cognitive load, fast actions, and responsive use across phone, tablet, and desktop.

This task is intentionally incremental. It does not redesign the application or replace working screens. It identifies the current UI shape, documents refactor priorities, and starts a small shared component layer that later Visit Completion work can reuse.

## Current UI Structure

### App Shell and Navigation

- `src/layouts/AppShell.tsx` provides a sidebar/topbar shell with a light neutral background.
- `src/layouts/SidebarNav.tsx` uses role-aware route configuration and horizontal overflow on small screens.
- `src/layouts/TopBar.tsx` shows auth/profile status and sign-in/out actions.
- `src/routes/AppRoutes.tsx`, `src/routes/navigationConfig.ts`, and related route files define the page structure.

The shell is functional and clear, but navigation is still text-only and feels closer to a basic admin scaffold than a polished clinical app. Mobile navigation is usable through horizontal scrolling, but important actions are not yet optimized for one-handed mobile workflows.

### Pages

- `PatientsPage` is the most complete list screen. It has search, status filtering, archived toggle, desktop table, and mobile cards.
- `PatientDetailPage` is the main clinical workspace. It composes Patient Snapshot, Today Panel, Quick Actions, and Full Record.
- `PatientCreatePage`, `PatientEditPage`, and `PatientMedicalRecordEditPage` use structured forms.
- Dashboard, calendar, payments, reports, commissions, inventory, settings, and treatment plans are still placeholder-led or early phase pages.

The patient detail page reflects the previous UX tasks well. The broader app still needs shared visual patterns before new workflow-heavy screens are added.

### Shared Components

Existing reusable components:

- `Button`
- `Badge`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `Page`
- `PageHeader`

These are a useful base. The largest missing pieces are form fields, inline notices, icon-ready actions, compact metric/context tiles, link buttons, tabs/segmented controls, and modal/bottom-sheet primitives.

### Styling Approach

- Tailwind CSS v4 is used directly in component class names.
- There is no separate Tailwind config or token file yet.
- Global CSS is minimal in `src/index.css`.
- Colors are mostly slate, teal, cyan, amber, emerald, and red.
- Spacing is generally consistent, but repeated utility strings exist across pages.

This approach is acceptable for the MVP, but repeated class strings should move into shared primitives as patterns stabilize.

## Repeated Patterns Found

### Buttons and Links

- `Button` exists for native buttons.
- Links that visually behave like buttons are hand-coded in `TopBar`, `PatientsPage`, and patient cards.
- Primary actions are mostly teal; secondary actions are white/slate.

Refactor direction: add a `ButtonLink` component that shares button variants and sizes with `Button`.

### Forms

- Text inputs, selects, and textareas repeat the same Tailwind classes in `PatientsPage`, `PatientForm`, and `PatientMedicalRecordForm`.
- Required markers and field errors are local to patient forms.

Refactor direction: add shared `TextInput`, `Textarea`, `Select`, `FieldLabel`, `FieldError`, and `RequiredMark` primitives. Adopt gradually in forms.

### Notices and Alerts

- Success, error, warning, info, and placeholder notices are repeated as custom `p` or `div` blocks.
- Medical safety context needs stronger consistency than generic dashboard alerts.

Refactor direction: add an `InlineNotice` component with semantic variants.

### Metric and Context Tiles

- `PatientSnapshot` and `PatientTodayPanel` both define almost identical compact metric/context tiles.
- These tiles are important for clinical scanning and should be consistent before Visit Completion adds summary cards.

Refactor direction: add a reusable `MetricTile`.

### Tabs and Segmented Navigation

- `PatientFullRecord` uses small buttons as section tabs.
- This is workable, but it should eventually become an accessible tab/segmented-control primitive with `aria-selected`, keyboard support, and overflow behavior.

Refactor direction: defer full tab primitive until another screen needs it, then standardize both patient record and visit completion sections.

### Cards

- Cards are consistent, but nested cards are appearing in the Full Record section.
- Card padding is usually `p-6`; compact operational tiles use `p-4`.

Refactor direction: keep cards for major sections and repeated records. Use compact tiles inside cards only when they represent scannable clinical facts, not decorative nesting.

## Inconsistencies and Weak Points

### Spacing and Density

- Patient detail is generally comfortable, but Full Record can become dense because each section is detailed and some sections are card-heavy.
- Patients desktop table has many columns and is appropriate for desktop only; the mobile card fallback is better for clinical scanning.
- Placeholder pages are minimal and do not yet reflect the final app personality.

### Typography

- Page headers are consistent.
- Small uppercase labels are repeated with ad hoc classes.
- Card titles are clear, but some compact card content can read similarly to labels.

Refactor direction: centralize compact label/value presentation through `MetricTile` and future detail-list primitives.

### Icons

- The app currently has no icon library.
- UX direction calls for large, meaningful icons, especially for quick actions and navigation.

Refactor direction: add `lucide-react` in a later visual pass, then introduce icons first in Sidebar navigation, Quick Actions, Empty States, and Visit Completion actions.

### Mobile and Tablet

- Sidebar becomes horizontal navigation on mobile, which works but is not ideal for frequent clinical use.
- Large patient detail sections stack cleanly, but Full Record remains long.
- Tables are hidden on mobile for patients, which is correct.
- Forms are responsive but long textareas make medical record editing feel heavy on small screens.

Refactor direction: future mobile work should prioritize bottom-sheet actions, sticky patient context, and accordion sections for long clinical forms.

### Clinical Workflow Density

Screens that may become difficult clinically:

- `PatientFullRecord`: comprehensive but long; needs accordion/tabs refinement as modules grow.
- `PatientMedicalRecordForm`: complete but textarea-heavy; needs grouped accordions and clinical warning priority.
- Future Visit Completion screen: high risk for density because it will combine procedure, notes, materials, pricing, payment, commission, and follow-up actions.

## Initial Design System Decisions

### Visual Language

- Keep a light UI with slate neutrals and teal primary actions.
- Use cyan/info sparingly for context panels.
- Use amber for clinical caution and archived/blocked states.
- Use red only for destructive or failed states.
- Prefer 8px or smaller radii for cards and controls.
- Avoid marketing-style hero sections and decorative backgrounds.

### Layout Rules

- Use `Page` and `PageHeader` for primary routes.
- One primary page action per page when possible.
- Use cards for major workflow sections.
- Use compact tiles for repeated facts inside a section.
- On mobile, prefer card lists and stacked action groups over tables.

### Interaction Rules

- Use modals/bottom sheets for focused task completion, not for broad record browsing.
- Use tabs/segmented controls for stable sibling modules.
- Use accordions for long optional clinical sections.
- Use inline notices for contextual feedback, permission limits, and demo-mode limitations.
- Keep patient safety context visible before routine administrative details.

## Implementation Plan

### Completed in This Task

- Added this Task 36 design/refactor plan.
- Added reusable UI primitives:
  - `ButtonLink`
  - shared form controls
  - `InlineNotice`
  - `MetricTile`
- Began replacing duplicated patterns in low-risk patient UI areas.

### Safe Next Refactors

1. Replace remaining hand-coded link buttons with `ButtonLink`.
2. Convert patient create/edit and medical record forms to shared field primitives.
3. Replace repeated success/error/warning blocks with `InlineNotice`.
4. Replace patient detail metric/context local components with `MetricTile`.
5. Add a small `SectionHeader` or `CardToolbar` pattern for card titles with badges and actions.
6. Add a segmented tab primitive and migrate Full Record tabs.
7. Add icon dependency and update navigation/quick actions with consistent iconography.

### Defer Because Risk Is Higher

- Reworking mobile navigation into bottom nav or drawer.
- Redesigning the entire Full Record module.
- Replacing tables globally.
- Introducing a modal/bottom-sheet system before Visit Completion requirements are known.
- Adding a full token system or Tailwind config before more UI surfaces stabilize.

## Visit Completion Prototype Guidance

Task 37 should reuse the new primitives instead of creating fresh visual patterns.

Recommended Visit Completion structure:

- Keep patient safety context first.
- Use a compact summary area for appointment, tooth/area, provider, and plan.
- Use tabs or accordions for performed work, clinical note, materials, charges/payment, and follow-up.
- Keep "Complete visit" as the single primary final action.
- Use `InlineNotice` for draft/demo limitations and permission states.
- Use `MetricTile` for scannable totals and clinical context.
- Avoid a dense enterprise dashboard layout.

## Acceptance Criteria for Future UI Work

- New screens use shared primitives before adding local utility-heavy markup.
- Mobile layout is considered at implementation time, not after.
- Clinical warnings and patient context stay visually prominent.
- Primary actions are limited and obvious.
- Tables are not used as the only mobile representation.
- Empty/loading/error states are present for async clinical workflows.
- Permission limits are visible without breaking layout.
