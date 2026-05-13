# Task 36B - Visual Design Pass

## Why Task 36 Was Too Subtle

Task 36 created the right foundation: shared buttons, link buttons, form controls, notices, and metric tiles. The visible UI still felt close to a classic admin interface because most screen structure stayed unchanged. The Patients page still relied on a desktop table, patient detail cards were still visually flat, and action shortcuts had little visual weight.

The design system existed in code, but the main clinical screens did not yet express the agreed product direction strongly enough.

## What This Pass Improves

This pass makes the existing direction visible without changing workflows or persistence:

- Patients are shown as responsive patient cards instead of a plain desktop table.
- Patient identity, status, contact details, next appointment, plan, note, and balance have clearer hierarchy.
- Patient Snapshot now reads as the main clinical context dashboard, with a stronger safety-first zone and larger context tiles.
- Today / Next Step highlights the immediate clinical action and appointment context more clearly.
- Quick Actions are touch-friendly action tiles with visual markers and clearer enabled/disabled states.
- TopBar and placeholder screens now feel more intentional inside the app shell.

## What Remains For Later

- Add a real icon library such as `lucide-react` and replace text markers with consistent clinical icons.
- Add an accessible segmented tab primitive for Full Record and future Visit Completion sections.
- Improve mobile navigation with a drawer or bottom action model.
- Convert long medical forms to accordion-based progressive disclosure.
- Add modal or bottom-sheet primitives when Visit Completion requires focused task entry.

## Why Task 37 Should Start After This Pass

Visit Completion will combine clinical notes, performed work, materials, pricing, payments, and follow-up. Starting it before this visual pass would likely repeat the older dense admin patterns. With this pass complete, Task 37 can reuse clearer patient cards, metric tiles, notices, and action-tile patterns for a more clinical, mobile-friendly prototype.
