# DentApp — Audit Log Policy

## 1. Purpose

DentApp handles sensitive clinical, personal, financial, and operational data.

Audit logs exist to record important changes and security-relevant actions so the practice can later answer:

- who changed sensitive data,
- what changed,
- when it changed,
- which clinic the action belonged to,
- which entity was affected,
- what context is needed for review.

Audit logs are not a replacement for backups, database constraints, or RLS. They are a traceability layer for sensitive activity.

---

## 2. Initial Audit Log Table

The initial database table is `public.audit_logs`.

Initial fields:

- `id`
- `clinic_id`
- `actor_profile_id`
- `actor_auth_user_id`
- `action`
- `entity_type`
- `entity_id`
- `old_values`
- `new_values`
- `metadata`
- `ip_address`
- `user_agent`
- `created_at`

The table intentionally does not include:

- `updated_at`,
- `deleted_at`.

Audit rows should be append-only.

---

## 3. Read Access

Initial audit log read access is restricted to:

- `owner_admin` users,
- with an active profile,
- within their own clinic only.

Other roles should not read audit logs by default:

- doctor,
- specialist,
- assistant,
- reception_admin,
- inventory_responsible.

Future limited audit views may be considered, but they must be explicitly scoped.

---

## 4. Write Strategy

Controlled insert now uses `public.create_audit_log(...)`.

Current strategy:

- keep `audit_logs` direct insert blocked by policy (no direct insert policy),
- keep RLS enabled,
- allow owner/admin read access only,
- allow authenticated callers to insert only through controlled RPC,
- derive clinic and actor from authenticated profile context (not from frontend payload).

Function behavior summary:

- requires authenticated session (`auth.uid()`),
- requires active profile,
- derives `clinic_id` from `public.current_clinic_id()`,
- derives `actor_profile_id` from `public.current_profile_id()`,
- derives `actor_auth_user_id` from `auth.uid()`,
- validates `action` and `entity_type` are non-empty,
- inserts append-only row and returns inserted audit log id.

Implementation note:

`public.create_audit_log(...)` is `security definer` with `set search_path = public`. This is used so direct table insert policy is not needed while still enforcing profile-context checks inside the function.

---

## 5. Append-Only Principle

Audit logs should not be edited or deleted through normal application flows.

Initial database policy:

- no direct insert policy,
- no update policy,
- no delete policy,
- no hard delete workflow.

If corrections are ever needed, they should be represented by a new audit row that explains the correction rather than modifying the original row.

---

## 6. Actions To Audit

Patient-related actions should include:

- `patient.created`,
- `patient.updated`,
- `patient.archived`,
- `patient.restored`,
- `patient_medical_record.updated`,
- `clinical_note.created`,
- `clinical_note.updated`,
- `clinical_note.archived`.

Future financial and operational actions should include:

- `payment.created`,
- `payment.updated`,
- `inventory.corrected`,
- `role.changed`,
- `document.uploaded`,
- `document.deleted`.

Action values are not enforced by a database enum yet. This keeps early development flexible while the domain model is still evolving.

---

## 7. Data Stored In Audit Logs

Audit rows may store:

- changed field names,
- selected old values,
- selected new values,
- related entity ids,
- non-sensitive workflow metadata.

Avoid storing unnecessary sensitive data in `old_values`, `new_values`, or `metadata`.

For patient records, store only what is needed to understand the change. Do not duplicate entire medical histories unless there is a clear compliance or recovery reason.

---

## 8. Patient Persistence Strategy

Before real patient CRUD is enabled, the patient service layer should define audit behavior for:

- patient profile creation,
- patient profile update,
- patient archive/restore,
- patient medical record update,
- clinical note creation,
- clinical note update/archive.

The service layer should set:

- action,
- entity type,
- entity id,
- before/after values where appropriate.

Clinic and actor identity are already derived in the controlled RPC and must not be caller-provided.

Database triggers can be added later for critical tables if service-layer audit logging is not sufficient.

---

## 9. Open Questions

- Which patient fields must always be captured in old/new values?
- Should clinical note edits create revisions instead of direct updates?
- Should document views/downloads be audited?
- How long should audit logs be retained?
- Should owner/admin exports of audit logs be supported?
- Should failed permission attempts be recorded?
