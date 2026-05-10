# DentApp — Codex Task Template

Use this template when giving implementation tasks to Codex/Cursor.

The goal is to keep every development task focused, reviewable, and aligned with the DentApp product direction.

---

## Task Title

Short and clear task name.

Example:

`Create initial patient list page`

---

## Task Goal

Describe what this task should achieve.

Example:

Create the first version of the patient list page so authorized users can view demo patients in a clean responsive table layout.

---

## Background

Provide the context needed to understand why the task exists.

Include relevant product or workflow explanation.

Example:

DentApp needs a patient list as one of the first operational screens. The patient list will later connect to Supabase, but this task may start with mock/demo data if backend integration is not ready.

---

## Files to Read First

Before starting, read:

- `docs/08_codex/codex_project_context.md`
- `docs/08_codex/codex_rules.md`
- `docs/07_execution/todo.md`
- `docs/07_execution/progress.md`

Also read any task-specific files listed here:

- `docs/02_product/mvp_scope.md`
- `docs/02_product/user_roles.md`
- `docs/05_technical/technical_architecture.md`

Adjust this list depending on the task.

---

## Current Scope

Clearly define what is included.

Example:

This task includes:

- creating a patient list page,
- adding a route if routing already exists,
- creating a reusable table component if needed,
- using fake/demo data only,
- making the layout responsive.

---

## Out of Scope

Clearly define what must not be done.

Example:

This task does not include:

- Supabase integration,
- patient creation form,
- patient detail page,
- real patient data,
- authentication changes,
- database migrations.

---

## Expected Files to Create or Modify

List expected files.

Example:

- `src/pages/PatientsPage.tsx`
- `src/components/patients/PatientTable.tsx`
- `src/data/demoPatients.ts`
- `docs/07_execution/progress.md`

If the exact files are unknown, Codex should choose a clean structure and report what was changed.

---

## Functional Requirements

Describe what the feature must do.

Example:

- Show a list of demo patients.
- Display patient full name, phone number, age, next appointment, and status.
- Support responsive layout.
- Avoid showing sensitive real data.
- Keep the UI clean and professional.

---

## UX Requirements

Describe how it should feel and behave.

Example:

- The page should be readable on desktop, tablet, and mobile.
- Important information should be visible without visual clutter.
- Empty states should be handled gracefully.
- Labels should be clear and business-friendly.

---

## Technical Requirements

Describe technical expectations.

Example:

- Use React + TypeScript.
- Use Tailwind CSS.
- Use reusable components where reasonable.
- Do not introduce unnecessary dependencies.
- Keep code readable and maintainable.
- Do not hardcode pilot clinic-specific data.

---

## Security and Data Rules

Always include these when relevant:

- Do not use real patient data.
- Do not commit secrets.
- Do not bypass role/access assumptions.
- Do not store sensitive data in frontend-only structures in future production flows.
- Consider future Supabase RLS and `clinic_id`.

---

## Acceptance Criteria

The task is complete when:

- the requested functionality works,
- TypeScript has no obvious errors,
- UI is responsive,
- no real data is used,
- no out-of-scope feature was added,
- relevant documentation is updated,
- `docs/07_execution/progress.md` is updated,
- new follow-up tasks are added to `docs/07_execution/todo.md` if discovered.

---

## Testing Instructions

Define how to test.

Example:

1. Run `npm install` if dependencies changed.
2. Run `npm run dev`.
3. Open the app in browser.
4. Check desktop layout.
5. Check mobile responsive layout.
6. Confirm no console errors.
7. Confirm no real data is present.

---

## Documentation Updates Required

At minimum:

- update `docs/07_execution/progress.md`.

If new decisions are made:

- update `docs/00_project/decisions.md`.

If new open questions appear:

- update `docs/00_project/open_questions.md`.

If new tasks appear:

- update `docs/07_execution/todo.md`.

---

## Report Back Format

When finished, report:

1. Summary of work completed
2. Files created/modified
3. How to test
4. Decisions made
5. Open questions
6. Follow-up tasks
