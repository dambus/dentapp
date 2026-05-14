# Task 38B - Responsive Polish Pass

Status: Completed

## Scope

Focused responsive polish after Task 38 navigation changes. No database schema,
Supabase writes, Visit Completion persistence, or backend behavior changed.

## Inspected

Target widths:

- 375px mobile
- 768px tablet portrait
- 1024px tablet landscape
- 1280px+ desktop

Areas reviewed:

- AppShell
- TopBar
- mobile navigation overlay
- tablet sidebar rail
- Patient Detail layout surfaces
- PatientTodayPanel
- PatientQuickActions
- VisitCompletionPage
- VisitCompletionFlow

Inspection was code-level and route-render based in this workspace. Browser
automation is not installed, so manual responsive browser checks remain
recommended.

## Issues Found

- TopBar status/detail text could still appear on smaller screens and risk
  crowding the mobile header.
- The app shell did not explicitly contain horizontal overflow at the shell and
  main content boundaries.
- The mobile navigation overlay needed tighter truncation/overflow containment
  for the header labels.
- Visit Completion mobile sticky progress header was readable, but it could be
  slightly shorter to reduce the chance of obstructing workflow content.
- The rail markers are acceptable as a temporary design-system bridge, but they
  are not a substitute for a proper icon set.

## Fixes Made

- Added horizontal overflow containment to `AppShell`, content wrapper, and main
  region.
- Tightened `TopBar` mobile behavior:
  - title container now truncates safely,
  - auth/profile diagnostic messages are hidden until larger screens,
  - existing login/logout behavior is preserved.
- Tightened mobile navigation overlay:
  - overlay content prevents horizontal overflow,
  - brand/header text truncates safely,
  - touch-friendly item sizing remains.
- Refined Visit Completion mobile workflow shell:
  - reduced sticky progress header vertical padding,
  - reduced progress bar height,
  - reduced sticky bottom action padding,
  - preserved current step, progress, Back/Next/Complete, validation,
    confirmation, and local success behavior.
- Added `min-w-0` containment to key Visit Completion cards.

## Sidebar Markers / Icons

The current tablet rail uses text markers such as `D`, `P`, `TP`, and `$`.
These are acceptable for the current no-new-dependency pass because:

- they are consistent,
- active state is visually clear,
- each nav item still has a title label for hover/focus/browser tooltip,
- no icon library exists in the project.

Later design-system work should add a real icon dependency or internal icon set
so the rail is more immediately recognizable.

## Remaining Later Improvements

- Manual responsive browser verification at the target widths.
- Add real navigation icons as a design-system dependency or internal asset set.
- Consider optional user-controlled sidebar expand/collapse.
- Add automated visual checks when a browser test tool is introduced.
- Revisit mobile workflow sticky header once persisted visit drafts introduce
  discard/unsaved-change behavior.

## Readiness

The app shell and Visit Completion workflow are ready for Visit Completion
persistence planning from a responsive UX standpoint, with the caveat that
manual responsive browser inspection should still be performed before pilot use.

## Verification

- `npm.cmd run build` passes.
- `npm.cmd run lint` passes.
- Route checks return HTTP 200 for:
  - `/patients`
  - `/patients/demo-patient-001`
  - `/patients/demo-patient-001/visit-completion`
