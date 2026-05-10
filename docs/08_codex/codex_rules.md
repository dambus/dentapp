# DentApp — Codex Rules

## 1. General Rules

These rules apply to all Codex/Cursor work on the DentApp project.

Codex must treat this project as a serious healthcare-related business application, not as a demo app.

The project must be built carefully, incrementally, and with strong attention to data structure, security, maintainability, and real-world workflow.

---

## 2. Scope Control

Do not implement features outside the current task.

Do not add patient portal, online booking, messaging automation, fiscalization, multi-location support, or AI clinical features unless explicitly instructed.

If a requested change affects architecture, database schema, security, or permissions, document the impact before implementing.

When in doubt, add the idea to `docs/02_product/feature_backlog.md` instead of implementing it immediately.

---

## 3. Documentation Rules

Before starting work, read:

- `docs/08_codex/codex_project_context.md`
- `docs/08_codex/codex_rules.md`
- `docs/07_execution/todo.md`
- `docs/07_execution/progress.md`

When a task is completed, update:

- `docs/07_execution/progress.md`

When new tasks are discovered, update:

- `docs/07_execution/todo.md`

When a product decision is made, update:

- `docs/00_project/decisions.md`

When an unresolved question appears, update:

- `docs/00_project/open_questions.md`

---

## 4. Data and Privacy Rules

Never commit real patient data.

Never use real patient names, phone numbers, addresses, medical notes, images, or financial information.

Use fake demo data only.

Do not store secrets in the repository.

Never commit `.env`.

Use `.env.example` only for variable names, not real values.

Sensitive data must be protected by database-level access rules, not only frontend logic.

---

## 5. Multi-Tenant Readiness

Even though the pilot starts with one dental practice, the system must be multi-tenant ready.

Most core tables should include `clinic_id`.

Do not hardcode pilot clinic data.

Do not build logic that assumes there will only ever be one clinic.

Practice-specific behavior should be handled by settings, configuration, or database records.

---

## 6. Authentication and Authorization Rules

Always consider user role and permissions.

Do not rely only on hidden frontend buttons to protect data.

Important role examples:

- owner/admin,
- doctor,
- specialist,
- assistant,
- reception,
- inventory responsible person.

Financial data and doctor commission data should not be visible to all users by default.

Patient medical records should be visible only to authorized users.

---

## 7. Database Rules

Use PostgreSQL-compatible design.

Prefer clear normalized structures for core business data.

Use migrations for database changes.

All schema changes should be added under:

`supabase/migrations/`

Avoid destructive migrations unless explicitly approved.

Use UUID primary keys unless there is a strong reason not to.

Use timestamps where appropriate:

- `created_at`
- `updated_at`
- `deleted_at` when soft delete is needed

Consider audit logging for sensitive changes.

---

## 8. Frontend Rules

Use React + TypeScript.

Use clear component structure.

Prefer reusable components.

Use form validation with Zod and React Hook Form when forms are implemented.

Use TanStack Query for server data fetching when Supabase integration starts.

Use responsive design from the beginning.

Do not build desktop-only screens.

Avoid unnecessary UI complexity.

---

## 9. Styling Rules

Use Tailwind CSS.

Keep UI clean, professional, and suitable for a healthcare/business application.

Prioritize:

- readability,
- contrast,
- spacing,
- clear hierarchy,
- fast workflows,
- accessible forms,
- responsive layouts.

Avoid overly playful styling.

Avoid generic template appearance.

---

## 10. Error Handling Rules

Forms must show useful validation messages.

Database/API errors should be handled gracefully.

Do not expose sensitive technical details to end users.

For developer-facing logs, provide enough detail to debug issues.

---

## 11. Audit Log Mindset

For sensitive entities, consider audit logging from the beginning.

Important actions may include:

- patient creation,
- patient record update,
- treatment plan update,
- payment creation/update,
- commission rule update,
- inventory correction,
- material request approval,
- document upload,
- permission change.

---

## 12. Testing and Review Rules

After implementation, verify:

- app builds successfully,
- TypeScript has no obvious errors,
- UI is responsive,
- forms validate correctly,
- permissions are respected,
- no real data is introduced,
- documentation is updated,
- task is marked in progress file.

---

## 13. Dependency Rules

Do not add new packages without a clear reason.

Before adding a dependency, consider:

- Is it necessary?
- Is it maintained?
- Does it solve a real problem?
- Can the same be done simply without it?
- Will it complicate deployment or security?

Document important dependency decisions in:

`docs/00_project/decisions.md`

---

## 14. Communication Rule

When reporting work done, be specific.

Include:

- files changed,
- features added,
- decisions made,
- migrations created,
- remaining tasks,
- risks or open questions.
