# Task 38 - Responsive App Shell and Workflow Navigation UX Pass

Status: Completed

## Goal

Improve responsive navigation and focused workflow usability before backend
visit persistence. This task does not change database schema, Supabase writes,
or Visit Completion persistence behavior.

## Current Navigation Problems

- Mobile navigation was rendered as a horizontal scrolling menu inside the
  sidebar area, which could feel partially visible and overflow-prone.
- Tablet portrait used the mobile/top horizontal nav until `lg`, then switched
  to a full sidebar at `lg`; this left an awkward middle range and made content
  less dominant.
- Visit Completion had a route-based focused workflow, but the stepper stacked
  vertically on mobile and consumed too much vertical space.
- Focused clinical workflows needed a clearer reusable shell pattern:
  compact context, progress status, one task at a time, confirmation, and local
  success state.

## Chosen Mobile Navigation Pattern

- Mobile uses a top-bar burger button.
- The burger opens a fullscreen menu overlay.
- The overlay includes the same role-filtered main navigation items as the
  sidebar.
- Items are large and touch-friendly.
- The current route is highlighted through `NavLink`.
- The menu closes on:
  - close button,
  - selecting a navigation item,
  - Escape key,
  - backdrop click.
- The mobile horizontal nav was removed.

## Chosen Tablet Sidebar / Icon Rail Pattern

- From the `md` breakpoint, the app shows a collapsed icon rail.
- The rail uses stable text markers because no icon dependency is currently
  installed.
- Labels are hidden on tablet portrait to preserve content width.
- Active route state remains visible through color and marker styling.
- The rail is sticky and scrolls its own navigation if needed.

## Chosen Desktop Sidebar Pattern

- From the `xl` breakpoint, the sidebar expands to show labels.
- Width remains fixed and moderate at `xl:w-72`.
- Content remains the dominant visual area.
- The same route highlighting and role-filtered navigation are preserved.

## Focused Workflow Header / Stepper Pattern

Visit Completion remains route-based at:

- `/patients/:patientId/visit-completion`

Mobile workflow behavior:

- compact sticky progress/status header,
- title: `Complete Visit`,
- current step label and title,
- `Step X/Y` badge,
- compact progress bar,
- no large vertical stepper.

Tablet and desktop workflow behavior:

- compact patient/visit context remains above the workflow,
- horizontal stepper appears from `sm` upward,
- one main task card remains visible at a time,
- Back / Next / Complete controls remain separate and touch-friendly.

## Responsive Breakpoints Used

- `< md`: mobile top bar plus fullscreen drawer.
- `md` to `< xl`: collapsed sidebar icon rail.
- `xl+`: expanded sidebar with labels.
- `< sm`: Visit Completion uses sticky compact workflow progress header.
- `sm+`: Visit Completion shows horizontal stepper.

These breakpoints match Tailwind defaults used by the existing project:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## What Changed

- Reworked `AppShell` to support mobile drawer state and close behavior.
- Replaced mobile horizontal nav with a fullscreen mobile menu overlay.
- Changed desktop/sidebar behavior to:
  - hidden sidebar on mobile,
  - collapsed rail at `md`,
  - expanded sidebar at `xl`.
- Added stable navigation markers for icon rail mode.
- Updated `TopBar` with a mobile menu button and less crowded mobile status
  display.
- Added a sticky mobile workflow progress header to Visit Completion.
- Hid the full stepper on mobile and kept it available from `sm` upward.
- Preserved existing routes, route guards, PatientQuickActions entry point,
  PatientTodayPanel entry point, local Visit Completion state, validation,
  confirmation, and success behavior.

## What Remains For Future Improvements

- Replace text navigation markers with a real icon set if the design system
  adopts one.
- Add optional user-controlled sidebar expand/collapse persistence.
- Add browser-based visual regression checks for mobile/tablet/desktop
  breakpoints.
- Apply the focused workflow shell to future clinical workflows beyond Visit
  Completion.
- Consider route-level draft warning/discard behavior once visit drafts are
  persisted.

## Verification

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- Local route check for Visit Completion returns HTTP 200.

Manual browser responsive checks are still recommended at 375px, 768px, 1024px,
and 1280px+ because no browser automation dependency is installed in the
workspace.
