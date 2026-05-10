# DentApp — Auth and Roles

## 1. Purpose

This document defines the initial authentication and authorization strategy for DentApp.

DentApp handles sensitive clinical and financial data, so authentication and permissions must be designed carefully from the beginning.

This document should be read together with:

- docs/02_product/user_roles.md
- docs/02_product/permissions_matrix.md
- docs/05_technical/rls_policy.md when created
- docs/05_technical/database_schema.md

---

## 2. Authentication Provider

Initial authentication provider:

- Supabase Auth

Supabase Auth will manage:

- user identity,
- login,
- password reset,
- email identity,
- auth sessions.

The application database will manage:

- user profile,
- clinic association,
- staff member association,
- business role,
- status,
- permissions.

---

## 3. User Identity Model

Supabase Auth user should be linked to an application profile.

Conceptual relationship:

    auth.users
      -> profiles
          -> clinic
          -> staff_member
          -> role

The app should not rely only on Supabase auth metadata for business permissions.

Business permissions should be stored and controlled in application tables.

---

## 4. Main Identity Tables

### 4.1 auth.users

Managed by Supabase.

Used for:

- login identity,
- email,
- authentication session,
- password reset,
- authentication metadata.

Application code should not directly depend on auth.users for all business logic.

### 4.2 profiles

Application-level user profile.

Should include:

- auth_user_id,
- clinic_id,
- staff_member_id,
- full_name,
- email,
- role,
- status.

### 4.3 staff_members

Represents the actual person working in the practice.

A staff member may or may not have login access.

Example:

A doctor may exist as a staff member before being invited as a system user.

---

## 5. Initial Roles

Initial roles:

- owner_admin
- doctor
- specialist
- assistant
- reception_admin
- inventory_responsible

Future roles:

- accountant
- clinic_manager
- patient
- external_lab
- platform_admin

Patient and external roles are not part of MVP.

---

## 6. Role Descriptions

### 6.1 owner_admin

Full access inside a clinic.

Can manage:

- users,
- roles,
- patients,
- clinical records,
- payments,
- doctor commissions,
- inventory,
- reports,
- settings,
- audit logs.

### 6.2 doctor

Clinical user.

Can manage:

- relevant patients,
- clinical notes,
- odontogram,
- treatment plans,
- visits,
- performed services.

Financial and commission visibility should be configurable.

### 6.3 specialist

Limited clinical user, usually assigned to specific cases.

Can manage:

- assigned patients,
- assigned visits,
- assigned treatment items,
- own performed services.

Access should be narrower than regular doctor.

### 6.4 assistant

Operational support user.

Can view:

- daily schedule,
- relevant preparation notes,
- limited patient warnings,
- material needs.

Can create material requests if allowed.

No commission access.

No full financial access by default.

### 6.5 reception_admin

Administrative user.

Can manage:

- appointments,
- basic patient contact information,
- patient search,
- payment recording if allowed,
- printing/export if allowed.

No doctor commission access.

No clinical note editing by default.

### 6.6 inventory_responsible

Inventory management user.

Can manage:

- inventory items,
- stock movements,
- material requests,
- suppliers,
- low stock reports.

No patient clinical access by default.

No doctor commission access.

---

## 7. User Status

Users should have status.

Possible statuses:

- invited,
- active,
- inactive,
- suspended.

Rules:

- invited users have not completed setup yet,
- active users can access the application,
- inactive users should not access the application,
- suspended users should not access the application.

Inactive and suspended users should be blocked both in frontend and database/RLS logic where possible.

---

## 8. Permission Categories

Permissions should be grouped by domain.

Suggested permission categories:

- users_manage
- clinic_settings_manage
- patients_view
- patients_create
- patients_edit
- patient_records_view
- patient_records_edit
- clinical_notes_create
- clinical_notes_edit
- odontogram_view
- odontogram_edit
- treatment_plans_view
- treatment_plans_create
- treatment_plans_edit
- appointments_view
- appointments_manage
- visits_view
- visits_create
- visits_edit
- services_view
- services_manage
- payments_view
- payments_create
- payments_edit
- patient_debt_view
- commissions_view_all
- commissions_view_own
- commissions_manage
- inventory_view
- inventory_manage
- material_requests_create
- material_requests_approve
- reports_view
- audit_logs_view
- documents_view
- documents_upload
- documents_delete

MVP may start with role-based checks before implementing granular permission tables.

---

## 9. Authorization Layers

DentApp should use multiple authorization layers.

### 9.1 Frontend Layer

Used for:

- hiding/showing navigation,
- disabling buttons,
- adapting UI per role,
- improving user experience.

Frontend logic is not sufficient for security.

### 9.2 Service Layer

Used for:

- checking role before calling sensitive operations,
- structuring data access,
- preventing accidental misuse,
- keeping UI components clean.

Service-layer checks are useful but not sufficient alone.

### 9.3 Database / RLS Layer

Required for sensitive data.

Used for:

- enforcing clinic_id separation,
- restricting patient data,
- restricting financial data,
- restricting commission data,
- restricting storage access.

---

## 10. Row Level Security Direction

RLS should enforce:

- users can only access data for their clinic,
- users can only access data allowed by role,
- specialists may be limited to assigned patients,
- financial data is restricted,
- commission data is restricted,
- audit logs are restricted.

RLS policy design must be kept simple at first and expanded carefully.

Do not make the first RLS version so complex that development becomes blocked.

---

## 11. Multi-Tenant Access

Every profile belongs to a clinic.

Most business records belong to a clinic.

Access should generally require:

    record.clinic_id = current_user_profile.clinic_id

Future platform admin access must be designed separately and not mixed casually with clinic user access.

---

## 12. Financial Data Restrictions

Financial data includes:

- payments,
- patient ledger,
- discounts,
- unpaid balances,
- financial notes.

Default access:

- owner_admin: full access
- reception_admin: configurable access
- doctor: limited/configurable access
- specialist: limited/configurable access
- assistant: no access by default
- inventory_responsible: no access by default

Important:

Financial visibility must be decided with the pilot practice before final implementation.

---

## 13. Commission Data Restrictions

Commission data includes:

- commission rules,
- commission entries,
- payout records,
- doctor earnings reports.

Default access:

- owner_admin: full access
- doctor: own only if enabled
- specialist: own only if enabled
- reception_admin: no access
- assistant: no access
- inventory_responsible: no access

Doctor commission data is highly sensitive and must not be visible broadly.

---

## 14. Clinical Data Restrictions

Clinical data includes:

- patient medical record,
- clinical notes,
- odontogram,
- treatment plans,
- visits,
- documents.

Default access:

- owner_admin: full access
- doctor: relevant patients
- specialist: assigned patients
- assistant: limited access
- reception_admin: limited or no clinical edit access
- inventory_responsible: no clinical access

---

## 15. Specialist Access

Specialist access may need special logic.

Possible options:

1. Specialist sees only assigned appointments.
2. Specialist sees only assigned patients.
3. Specialist sees only assigned treatment plan items.
4. Specialist sees full history for assigned patients.
5. Specialist sees only relevant history.

This must be clarified during discovery.

Initial recommendation:

Start with assigned-patient access for specialists, then refine.

---

## 16. Doctor Access

Open question:

Should doctors see all patients in the clinic or only patients they treated/are assigned to?

Possible options:

1. All doctors see all clinical patients.
2. Doctors see only assigned/relevant patients.
3. Doctors see all patients but can edit only their own/relevant records.
4. Owner/admin configures this policy.

Initial recommendation:

For MVP, use simpler clinic-wide doctor access unless the pilot practice requires strict assignment-based access.

This should be revisited before production use.

---

## 17. Reception Access

Reception/admin likely needs access to:

- appointment schedule,
- patient contact data,
- basic patient profile,
- payment recording if allowed,
- document printing if allowed.

Reception/admin should not edit clinical notes by default.

Reception/admin should not see doctor commissions.

---

## 18. Assistant Access

Assistant likely needs access to:

- daily schedule,
- basic patient preparation notes,
- medical warnings relevant to safe care,
- material requests,
- limited inventory.

Assistant should not see:

- full financial data,
- doctor commission data,
- full clinical history unless allowed.

---

## 19. Inventory Access

Inventory responsible person needs access to:

- inventory items,
- inventory movements,
- material requests,
- suppliers,
- low stock reports.

Inventory responsible person does not need access to:

- full patient records,
- payments,
- doctor commissions.

Potential exception:

If material consumption is linked to visits, limited visit reference access may be needed later.

---

## 20. Role and Permission Implementation Options

### 20.1 Simple MVP Role Field

profiles.role stores one role.

Pros:

- simple,
- fast to implement,
- easy to understand.

Cons:

- less flexible,
- harder to support custom permissions.

### 20.2 Role Table

roles table plus profile role relation.

Pros:

- cleaner,
- supports future role configuration.

Cons:

- more setup.

### 20.3 Granular Permissions

Separate permissions table.

Pros:

- flexible,
- scalable.

Cons:

- more complex,
- may slow MVP.

Initial recommendation:

Start with simple role field or role table, but design code so granular permissions can be added later.

---

## 21. Audit Requirements

Audit user and role actions:

- user invited,
- user activated,
- user deactivated,
- user suspended,
- role changed,
- permission changed,
- failed sensitive operation if practical.

Role and permission changes should be visible to owner/admin.

---

## 22. MVP Simplification

For early MVP, use:

- Supabase Auth,
- profiles table,
- role field,
- clinic_id field,
- simple role checks,
- RLS for clinic separation and sensitive data where possible.

Granular permission tables can be added later if needed.

---

## 23. Open Questions

- Should doctors see all patients or only patients they treated?
- Should specialists be restricted to assigned cases only?
- Should reception see patient debt?
- Should doctors see patient debt?
- Should doctors see own commission?
- Who can apply discounts?
- Who can edit completed clinical notes?
- Who can edit previous payments?
- Should permission overrides exist per user?
- Should multi-factor authentication be required for owner/admin?
- Should role changes require owner approval?
- Should access to audit log be limited only to owner/admin?
