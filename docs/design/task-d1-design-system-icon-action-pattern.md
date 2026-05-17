# Task D1 - Design System Icon & Action Pattern

## Purpose

DentApp is moving toward a modern clinical workspace with clearer visual hierarchy, less visible action clutter, and consistent icon orientation. Task D1 introduces the first reusable primitives for that direction without redesigning the whole app.

## Added Foundation

- `lucide-react` is the single icon pack for app UI icons.
- `IconButton` provides compact icon-only actions with required accessible labels and consistent touch target sizing.
- `ActionMenu` provides a lightweight overflow menu for secondary or less common actions.
- `StatusBadge` centralizes common status labels and semantic badge colors.
- `TypeBadge` provides a simple appointment/clinical type pill until type persistence exists.

## Action Hierarchy Rules

- Primary action remains visible as a labeled button.
- Secondary common action can remain visible when it supports the main workflow.
- Destructive, less common, or status-changing actions should move into `ActionMenu`.
- Icon-only buttons must include an accessible label and title.
- Avoid showing four or five equal-weight buttons on one card.
- Do not use icons beside every label by default; use them where they help recognition.

## Applied Scope

Applied lightly to appointment surfaces:

- `/appointments` appointment cards keep `Start visit`, `Details`, and `Open patient` visible, while status transitions move into an overflow action menu.
- Patient appointment summary keeps `Details` and `Start visit` visible, while status transitions move into an overflow action menu.
- Appointment detail keeps core navigation and `Start visit` visible, while status transitions move into an overflow action menu.

## Accessibility Notes

- `IconButton` requires `aria-label`.
- `ActionMenu` trigger exposes menu state with `aria-expanded` and `aria-haspopup`.
- Menu closes after item click, outside click, or Escape.
- Menu items are native buttons and support disabled state.
- Touch targets are at least 40px high for icon triggers.

## Next Recommended Task

Task D2 - Appointment Card Redesign
