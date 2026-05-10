# DentApp — Codex Review Checklist

Use this checklist after Codex/Cursor completes a task.

The goal is to prevent uncontrolled scope expansion, security mistakes, poor UX, and undocumented changes.

---

## 1. Scope Review

- [ ] Did the implementation match the requested task?
- [ ] Did Codex avoid adding unrequested features?
- [ ] Did Codex avoid changing unrelated files?
- [ ] Did Codex avoid large unapproved refactors?
- [ ] Are any added features clearly justified?
- [ ] Were future ideas added to backlog instead of implemented immediately?

---

## 2. Product Alignment

- [ ] Does the change support DentApp’s core workflow?
- [ ] Does it help with patient records, treatment plans, appointments, payments, commissions, or inventory?
- [ ] Is it suitable for a dental practice with multiple doctors?
- [ ] Does it avoid being too specific to only one pilot practice?
- [ ] Does it preserve future SaaS potential?

---

## 3. UX Review

- [ ] Is the screen or feature easy to understand?
- [ ] Is the layout clean and professional?
- [ ] Is the hierarchy clear?
- [ ] Are labels understandable for non-technical users?
- [ ] Is the UI responsive?
- [ ] Does it work reasonably on desktop?
- [ ] Does it work reasonably on tablet?
- [ ] Does it work reasonably on mobile?
- [ ] Are empty states handled?
- [ ] Are loading states handled where needed?
- [ ] Are error states handled where needed?

---

## 4. Data and Privacy Review

- [ ] No real patient data was added.
- [ ] No real phone numbers, addresses, medical notes, images, or financial data were added.
- [ ] No secrets were committed.
- [ ] .env was not committed.
- [ ] .env.example contains only variable names, not real values.
- [ ] Demo data is clearly fake.
- [ ] Sensitive data is not exposed unnecessarily in the UI.

---

## 5. Architecture Review

- [ ] The implementation fits the existing project structure.
- [ ] Components are placed logically.
- [ ] Code is reasonably modular.
- [ ] Reusable code was extracted where useful.
- [ ] The implementation avoids unnecessary complexity.
- [ ] The implementation avoids hardcoded clinic-specific assumptions.
- [ ] Future clinic_id / multi-tenant needs were considered where relevant.

---

## 6. TypeScript and Code Quality

- [ ] TypeScript types are clear.
- [ ] There are no obvious any shortcuts without reason.
- [ ] Component names are clear.
- [ ] Function names are clear.
- [ ] Code is readable.
- [ ] No dead code was left behind.
- [ ] No large commented-out code blocks were left behind.
- [ ] Imports are clean.
- [ ] Files are named consistently.

---

## 7. Dependency Review

- [ ] No unnecessary package was added.
- [ ] Any new dependency has a clear purpose.
- [ ] Any new dependency is appropriate for production use.
- [ ] Package changes are reflected in package.json.
- [ ] The app still installs correctly.

---

## 8. Supabase and Database Review

Use this section when the task touches Supabase or database design.

- [ ] Database changes are made through migration files.
- [ ] Migration files are under supabase/migrations/.
- [ ] Tables are named clearly.
- [ ] Sensitive tables consider RLS.
- [ ] Core business tables consider clinic_id.
- [ ] UUID primary keys are used unless there is a reason not to.
- [ ] Timestamps are included where appropriate.
- [ ] Destructive migrations were avoided unless approved.
- [ ] Audit log impact was considered.

---

## 9. Authentication and Permission Review

Use this section when the task touches users, roles, or protected data.

- [ ] Role assumptions are documented.
- [ ] Financial data is not exposed to unauthorized roles.
- [ ] Doctor commission data is not exposed to unauthorized roles.
- [ ] Patient records are not exposed without access assumptions.
- [ ] Frontend visibility is not treated as the only security layer.
- [ ] Future RLS policies are considered.

---

## 10. Forms and Validation Review

Use this section when forms are implemented.

- [ ] Required fields are reasonable.
- [ ] Validation messages are clear.
- [ ] Zod is used where appropriate.
- [ ] React Hook Form is used where appropriate.
- [ ] Errors are shown near relevant fields.
- [ ] The form avoids unnecessary friction.
- [ ] The form handles submit/loading states.
- [ ] The form handles cancel/back behavior where needed.

---

## 11. Testing Review

- [ ] npm run dev works.
- [ ] The feature can be opened in the browser.
- [ ] The feature was checked on desktop width.
- [ ] The feature was checked on mobile width.
- [ ] Console errors were checked.
- [ ] Basic user interaction was tested.
- [ ] Edge cases were considered.
- [ ] No obvious regression was introduced.

---

## 12. Documentation Review

- [ ] docs/07_execution/progress.md was updated.
- [ ] docs/07_execution/todo.md was updated if new tasks were found.
- [ ] docs/00_project/decisions.md was updated if a decision was made.
- [ ] docs/00_project/open_questions.md was updated if a question remains.
- [ ] Relevant technical docs were updated if architecture changed.
- [ ] Relevant product docs were updated if scope changed.

---

## 13. Final Acceptance

A task should be accepted only if:

- [ ] It satisfies the task goal.
- [ ] It does not violate scope.
- [ ] It does not introduce sensitive data.
- [ ] It does not introduce obvious security issues.
- [ ] It does not create unnecessary complexity.
- [ ] It is documented.
- [ ] It can be tested locally.

---

## 14. Review Notes Template

Review date:

Task reviewed:

Accepted:
Yes / No / Accepted with comments

Main issues:

- 

Required fixes:

- 

Follow-up tasks:

- 

Notes:

- 
