# DentApp — Backup and Recovery

## 1. Purpose

This document defines the initial backup and recovery strategy for DentApp.

DentApp will store sensitive and important operational data, including patient records, treatment plans, payments, inventory, documents, and audit logs.

Before real patient data is entered, backup and recovery must be planned.

---

## 2. Backup Goals

Backup strategy should protect against:

- accidental data deletion,
- application bugs,
- wrong migrations,
- user mistakes,
- storage loss,
- service outage,
- account compromise,
- hardware/cloud failure,
- corrupted data.

---

## 3. Data Types to Protect

DentApp must protect:

- PostgreSQL database data,
- Supabase Storage files,
- generated documents,
- uploaded patient documents,
- audit logs,
- configuration data,
- migration history,
- application source code.

---

## 4. Source Code Backup

Source code and documentation are backed up through GitHub.

Rules:

- commit regularly,
- do not commit secrets,
- do not commit real patient data,
- keep migrations in repository,
- keep documentation in repository,
- use branches for feature work.

---

## 5. Database Backup

Database backup must cover:

- clinics,
- users/profiles,
- staff,
- patients,
- patient records,
- appointments,
- treatment plans,
- services,
- payments,
- commissions,
- inventory,
- documents metadata,
- audit logs.

For production, rely on Supabase backup features where available and consider additional exports if required.

---

## 6. Storage Backup

Storage backup must cover:

- patient documents,
- consent forms,
- X-rays,
- photos,
- generated PDFs,
- clinic templates.

Storage backup approach must be confirmed before production pilot.

Important:

Database backup alone is not enough if files are stored separately.

---

## 7. Backup Frequency

Initial recommendation before production pilot:

### Development

- no real data,
- no formal backup required beyond Git.

### Staging

- backup useful but not critical if fake data is used.

### Production Pilot

Recommended:

- automated daily database backups,
- regular storage backup or verified Supabase recovery plan,
- manual export before risky migrations,
- backup before major schema changes.

---

## 8. Restore Testing

A backup is only useful if it can be restored.

Before production pilot:

- test database restore,
- test file restore,
- test migration rollback approach,
- document restore procedure.

Restore tests should be repeated periodically.

---

## 9. Recovery Time and Recovery Point

Define these before production:

### Recovery Time Objective

How quickly the practice must be operational again after incident.

Initial target:

- same business day for pilot, if possible.

### Recovery Point Objective

How much data loss is acceptable.

Initial target:

- less than 24 hours for pilot,
- better target later for commercial SaaS.

---

## 10. Migration Safety

Before running database migrations in production:

- review migration,
- backup database,
- test migration in staging,
- avoid destructive changes,
- document rollback if possible,
- run during low-usage period.

Destructive migrations require explicit approval.

---

## 11. Soft Delete Strategy

For sensitive records, prefer soft delete.

Soft delete means:

- record remains in database,
- deleted_at is set,
- normal app views hide the record,
- audit trail remains possible.

Examples where soft delete is preferred:

- patients,
- clinical notes,
- treatment plans,
- payments,
- documents,
- inventory records.

---

## 12. Audit Logs

Audit logs should be protected.

Audit logs help recover from:

- accidental changes,
- unauthorized changes,
- unclear responsibility,
- incorrect financial edits,
- inventory corrections.

Audit logs should not be casually editable or deletable.

---

## 13. Incident Types

Potential incidents:

- user deletes wrong patient,
- payment entered incorrectly,
- treatment plan overwritten,
- file deleted,
- storage access misconfigured,
- migration breaks table,
- RLS blocks valid users,
- RLS exposes wrong data,
- production environment variable misconfigured,
- account compromised.

Each major incident should have a documented response.

---

## 14. Recovery Procedure Draft

Initial recovery procedure:

1. Identify incident.
2. Stop affected operation if needed.
3. Determine affected data.
4. Check audit log.
5. Check whether soft restore is possible.
6. If database restore is needed, confirm backup point.
7. Restore to staging first if possible.
8. Validate restored data.
9. Restore production or apply corrective migration.
10. Document incident and resolution.

---

## 15. Access to Backups

Backup access must be restricted.

Only authorized technical/admin users should access backups.

Backups may contain sensitive health and financial data.

Backup exports must not be stored on personal devices casually.

---

## 16. Backup Storage Security

Backup files must be protected.

Rules:

- encrypt backups where possible,
- restrict access,
- avoid sharing through email,
- avoid storing on unprotected USB drives,
- avoid storing real data in GitHub,
- document who has access.

---

## 17. Production Pilot Requirements

Before production pilot:

- confirm Supabase backup plan,
- confirm storage recovery approach,
- create admin access list,
- document restore procedure,
- test restore process,
- define incident contact person,
- define backup frequency,
- define migration safety process.

---

## 18. Open Questions

- Which Supabase plan will be used for production pilot?
- What backup frequency is available on that plan?
- How will storage files be backed up?
- Who is responsible for restore?
- How often will restore be tested?
- Should encrypted external backups be created?
- What is acceptable downtime for the pilot practice?
- What is acceptable data loss window?
