# Task 48B — Mobile Workflow Usability Pass

**Status:** Completed 2026-05-15
**Scope:** Practical mobile usability improvements for patient, appointment, visit, and timeline workflows. No new features, no structural redesign.

---

## Goals

- Reduce visual density on small screens.
- Make tab/section navigation scrollable on mobile.
- Simplify action-button layout so it stacks cleanly.
- Improve form usability on mobile (earlier grid breakpoints, shorter helper text, thinner textareas).
- Hide verbose contextual text that is not needed on small screens.
- Keep tablet (`sm:`) and desktop (`md:`/`lg:`) layouts unchanged.

---

## Changes

### PatientFullRecord — section tab navigation
- Changed from `flex flex-wrap gap-2` to a horizontal scroll strip:
  ```
  -mx-4 sm:mx-0
    flex gap-1.5 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0
  ```
- Each tab button gets `shrink-0` so it never wraps and never shrinks to illegibility.
- Reverts to wrapped layout at `sm:` for tablets/desktops.

### AppointmentsPage — date controls + card density
- Page description shortened: `"Daily operational schedule."`
- Date controls container: `flex flex-nowrap items-end gap-2 overflow-x-auto pb-0.5` — avoids wrapping on narrow screens.
- Removed redundant `<p>Starts {time range}</p>` duplicate inside each appointment card (time range already shown at card top).

### PatientFollowUpSummary — action button layout + density
- Removed outer `flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between` wrapper from `CardHeader`.
- Badges and title now sit in a single `flex flex-wrap items-center gap-2` row.
- Buttons (`View source visit`, `Schedule appointment`) moved to a `flex flex-wrap gap-2 pt-1` row below the description.
- MetricTile grid breakpoint lowered: `sm:grid-cols-3` (was `md:grid-cols-3`).
- Footer notice shortened.
- `break-words` → `wrap-break-word` (Tailwind v4 canonical form).

### PatientAppointmentSummary — form usability
- Date/Time/Duration field row: `sm:grid-cols-3` (was `md:grid-cols-3`). 3-column layout now kicks in at 640px instead of 768px.
- Helper text shortened: `"Creates a scheduled appointment linked to this patient. No visit, reminder, or calendar event is created."`
- Notes `Textarea`: `min-h-16` (was `min-h-24`). Reduces form length on mobile.

### VisitCompletionFlow — contextual text density
- Step-prompt side box: `hidden sm:block` — hidden on mobile, visible on tablets/desktops.
- Planned-today description paragraph inside `CompactVisitContext`: `hidden sm:block` — hides verbose context on smallest screens.

### PatientVisitTimeline — metric tile density + procedure list
- MetricTile grid: `sm:grid-cols-2` (was `md:grid-cols-2`).
- Procedures box padding tightened: `p-3` / `space-y-2` (was `p-4` / `space-y-3`).
- `break-words` → `wrap-break-word` in clinical note and recommendation paragraphs.

### PatientVisitDetailPage — visit header grid
- MetricTile grid in visit header Card: `sm:grid-cols-2 md:grid-cols-3` (was `md:grid-cols-3`). Two-column layout starts at 640px; three columns at 768px.

---

## Verification

- `npm run build` — passes.
- `npm run lint` — passes.
- `get_errors` — no errors in all touched files.

---

## Out of Scope

- No new features.
- No changes to desktop or tablet layouts.
- No responsive changes to odontogram, treatment plans, payments, or commissions screens.
- No smoke tests run (env vars unavailable).
