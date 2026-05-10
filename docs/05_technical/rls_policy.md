# DentApp — RLS Policy

## 1. Purpose

This document defines the initial Row Level Security direction for DentApp.

DentApp will use Supabase and PostgreSQL. Because the application handles sensitive clinical, financial, and operational data, database-level security must be planned from the beginning.

This document is a planning document, not final SQL.

---

## 2. Why RLS Matters

Frontend protection is not enough.

Even if the UI hides a button or a page, users must not be able to access unauthorized data through direct API calls.

RLS should help enforce:

- clinic separation,
- role-based access,
- patient data protection,
- financial data protection,
- commission data protection,
- document metadata protection,
- audit log protection.

---

## 3. Core RLS Principle

Most business records should include:

    clinic_id

Most access rules should start with:

    user profile clinic_id must match record clinic_id

Conceptually:

    record.clinic_id = current_user_profile.clinic_id

---

## 4. Initial Security Model

The first RLS version should be practical and not overly complex.

Initial access should be based on:

- authenticated user,
- active profile,
- clinic_id,
- role,
- table sensitivity.

Avoid building too many fine-grained rules before the workflow is validated.

---

## 5. Required Profile Lookup

RLS policies will need a way to identify the current application profile.

Conceptually, each authenticated user has one profile:

- auth_user_id,
- clinic_id,
- role,
- status.

A helper function may be useful later, for example:

- current_profile_id
- current_clinic_id
- current_user_role

Exact SQL implementation will be defined during migration work.

---

## 6. User Status

Only active users should access application data.

Possible statuses:

- invited,
- active,
- inactive,
- suspended.

RLS should eventually prevent inactive or suspended users from accessing protected data.

MVP may start simpler but must not ignore this requirement.

---

## 7. Table Sensitivity Levels

Suggested sensitivity levels:

### 7.1 Low Sensitivity

Examples:

- service categories,
- services,
- appointment types,
- basic clinic settings.

Still restricted by clinic_id.

### 7.2 Medium Sensitivity

Examples:

- appointments,
- staff,
- inventory,
- material requests,
- reports.

Restricted by clinic and role.

### 7.3 High Sensitivity

Examples:

- patients,
- patient medical records,
- clinical notes,
- odontogram,
- treatment plans,
- documents.

Restricted by clinic, role, and possibly patient assignment.

### 7.4 Very High Sensitivity

Examples:

- payments,
- patient ledger,
- discounts,
- doctor commissions,
- payouts,
- audit logs.

Strictly restricted.

---

## 8. Clinic Data Access

General rule:

Users can only access records belonging to their clinic.

Applies to most tables:

- staff_members,
- patients,
- appointments,
- visits,
- treatment_plans,
- services,
- payments,
- inventory,
- material_requests,
- documents,
- audit_logs.

---

## 9. Owner/Admin Access

Owner/admin should have broad access within their clinic.

Allowed:

- view/manage users,
- view/manage patients,
- view/manage clinical records,
- view/manage payments,
- view/manage commissions,
- view/manage inventory,
- view reports,
- view audit logs,
- manage settings.

Owner/admin access should still be limited to own clinic.

---

## 10. Doctor Access

Doctor access should include:

- relevant patients,
- patient clinical records,
- odontogram,
- treatment plans,
- appointments,
- visits,
- performed services.

Open question:

Should doctors see all clinic patients or only assigned/relevant patients?

Initial MVP simplification:

Doctors may see clinic patients if the pilot practice accepts this model.

Later refinement:

Use patient assignment, appointment relation, treatment plan relation, or visit relation to restrict access.

---

## 11. Specialist Access

Specialist access should be more restricted than doctor access.

Possible access basis:

- assigned appointments,
- assigned patients,
- assigned treatment plan items,
- own performed services.

Initial MVP simplification:

Specialists may access assigned patients/cases only if assignment logic is implemented.

If assignment logic is not implemented yet, specialist role should be treated carefully and may initially have limited access.

---

## 12. Assistant Access

Assistant access should be limited.

Allowed examples:

- daily schedule,
- limited patient preparation information,
- medical warnings relevant to safe care,
- material requests,
- limited inventory.

Not allowed by default:

- full financial data,
- doctor commissions,
- full patient record editing,
- audit logs.

---

## 13. Reception/Admin Access

Reception/admin access should include:

- appointment management,
- patient search,
- basic patient profile,
- contact information,
- payment entry if allowed,
- limited document printing if allowed.

Not allowed by default:

- doctor commissions,
- clinical note editing,
- audit logs,
- advanced settings.

Financial visibility must be configurable.

---

## 14. Inventory Responsible Access

Inventory responsible user should access:

- inventory items,
- inventory movements,
- material requests,
- suppliers,
- low stock reports.

Not allowed by default:

- patient clinical records,
- payments,
- doctor commissions.

---

## 15. Financial Data RLS

Financial tables include:

- payments,
- patient_ledger_entries,
- payment_allocations,
- discounts if separated later.

Access should be limited to:

- owner_admin,
- reception_admin if allowed,
- doctor limited view if allowed,
- specialist limited own/assigned view if allowed.

MVP decision needed:

Should doctors see patient debt?

Until decided, financial access should be conservative.

---

## 16. Commission Data RLS

Commission tables include:

- doctor_commission_rules,
- doctor_commission_entries,
- doctor_payouts.

Access should be limited to:

- owner_admin: all within clinic,
- doctor: own entries only if enabled,
- specialist: own entries only if enabled.

No access by default:

- assistant,
- reception_admin,
- inventory_responsible.

---

## 17. Document RLS

Document metadata should be protected through database RLS.

Storage access should also be protected.

Document access depends on:

- clinic_id,
- role,
- document visibility,
- related patient if applicable.

Document visibility examples:

- clinical,
- administrative,
- financial,
- owner_only,
- inventory,
- template.

---

## 18. Audit Log RLS

Audit logs are sensitive.

Default access:

- owner_admin only.

Future possibility:

- limited audit visibility for users to see their own actions.

MVP recommendation:

Owner/admin only.

---

## 19. Insert and Update Rules

RLS must control not only reading but also:

- insert,
- update,
- delete.

Examples:

- assistants may create material requests but not approve them,
- reception may create appointments but not edit clinical notes,
- doctors may create clinical notes but not edit commission rules,
- owner/admin may manage settings and rules.

---

## 20. Soft Delete

Sensitive records should usually use soft delete.

Soft delete field:

- deleted_at

RLS and queries should generally hide deleted records by default.

Hard delete should be rare and restricted.

---

## 21. Storage RLS

Supabase Storage policies should align with document metadata rules.

Storage should not be public for patient documents.

Access should be based on:

- authenticated user,
- clinic relation,
- role,
- document metadata.

Exact implementation must be designed carefully when storage is implemented.

---

## 22. MVP RLS Strategy

Recommended MVP sequence:

1. Create profiles with clinic_id and role.
2. Add clinic_id to all main tables.
3. Enable RLS on sensitive tables.
4. Start with clinic-based policies.
5. Add role-based restrictions for financial, commission, and audit tables.
6. Add assignment-based restrictions later if required.
7. Test policies with multiple demo users and roles.

---

## 23. Testing RLS

RLS must be tested with demo users:

- owner/admin user,
- doctor user,
- specialist user,
- assistant user,
- reception user,
- inventory user.

Test scenarios:

- user cannot see other clinic data,
- assistant cannot see commissions,
- reception cannot see commissions,
- inventory user cannot see patient records,
- doctor cannot edit commission rules,
- inactive user cannot access data,
- unauthorized storage files cannot be accessed.

---

## 24. Open Questions

- Should doctors see all clinic patients?
- Should specialists see full patient history for assigned patients?
- Should reception see patient debt?
- Should doctors see patient debt?
- Should doctors see own commission?
- Should RLS include assignment-based logic in MVP?
- How should document visibility map to roles?
- Should audit logs track document views/downloads?
- Should inactive users be blocked fully by RLS from day one?
