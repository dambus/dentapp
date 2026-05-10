# DentApp — Technical Architecture

## 1. Purpose

This document defines the initial technical architecture for DentApp.

The goal is to create a clear technical direction before implementation starts.

DentApp should be built as a serious healthcare-related business application, not as a simple demo project.

---

## 2. Architecture Goals

The architecture should support:

- fast MVP development,
- strong data structure,
- role-based access,
- future SaaS commercialization,
- multi-tenant readiness,
- secure handling of sensitive data,
- responsive web usage,
- future integrations,
- maintainable codebase,
- clear documentation for Codex/Cursor.

---

## 3. Initial Application Type

DentApp will initially be built as a responsive web application.

Primary supported devices:

- desktop computers,
- laptops,
- tablets,
- mobile phones.

Initial recommendation:

Build as a responsive web app first.

Future possibility:

- Progressive Web App,
- native mobile apps,
- patient portal,
- mobile doctor assistant app.

Native mobile apps are not part of MVP.

---

## 4. Initial Technology Stack

Initial stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Row Level Security
- React Hook Form
- Zod
- TanStack Query
- Recharts
- FullCalendar or equivalent calendar library

---

## 5. Frontend Architecture

Recommended frontend structure:

    src/
      app/
      assets/
      components/
      features/
      hooks/
      layouts/
      lib/
      pages/
      routes/
      services/
      styles/
      types/

### 5.1 app/

Application-level setup.

May include:

- app providers,
- query client,
- router setup,
- global error boundary,
- application shell.

### 5.2 components/

Reusable shared UI components.

Examples:

- Button,
- Input,
- Card,
- Modal,
- Table,
- Badge,
- EmptyState,
- PageHeader.

### 5.3 features/

Feature-specific modules.

Recommended feature folders:

    features/
      patients/
      appointments/
      treatment-plans/
      visits/
      payments/
      commissions/
      inventory/
      reports/
      auth/
      settings/

Each feature may include:

- components,
- hooks,
- types,
- services,
- pages if appropriate.

### 5.4 pages/

Top-level route pages.

Examples:

- DashboardPage,
- PatientsPage,
- PatientDetailPage,
- CalendarPage,
- InventoryPage,
- ReportsPage.

### 5.5 services/

Data access and API/Supabase interaction layer.

Do not scatter Supabase calls randomly across UI components.

### 5.6 types/

Shared TypeScript types.

Domain-specific types may live inside feature folders until they become shared.

---

## 6. Backend Architecture

Initial backend will use Supabase.

Supabase provides:

- PostgreSQL database,
- authentication,
- storage,
- row-level security,
- edge functions if needed,
- generated APIs.

For MVP, avoid creating a custom backend unless necessary.

Future custom backend may be considered if:

- business logic becomes too complex,
- integrations require it,
- audit/compliance needs grow,
- Supabase limitations appear.

---

## 7. Database Architecture

Database should be PostgreSQL-based.

Main principles:

- use UUID primary keys,
- include clinic_id on core business tables,
- include created_at and updated_at,
- use soft delete where appropriate,
- separate clinical, financial, inventory, and auth-related concepts,
- plan audit logging from the beginning,
- use migrations for all schema changes.

Core domains:

- clinics,
- users/profiles,
- roles,
- staff,
- patients,
- patient records,
- odontogram,
- treatment plans,
- appointments,
- visits,
- services,
- payments,
- commissions,
- inventory,
- material requests,
- documents,
- audit logs.

---

## 8. Multi-Tenant Readiness

Even though the pilot starts with one clinic, the architecture must be multi-tenant ready.

Most business tables should include:

- clinic_id.

This allows future SaaS support for multiple practices.

Important:

Do not hardcode a single clinic assumption into the application.

---

## 9. Authentication

Authentication will be handled through Supabase Auth.

Each authenticated user should have an application profile record.

Profile should connect the Supabase auth user to:

- clinic,
- staff member,
- role,
- permissions,
- active/inactive status.

---

## 10. Authorization

Authorization must be role-based.

Initial roles:

- owner/admin,
- doctor,
- specialist,
- assistant,
- reception/admin,
- inventory responsible person.

Important:

Frontend hiding is not enough.

Sensitive access must be enforced at database/security layer where possible.

---

## 11. Data Access Strategy

Frontend should use a service layer.

Example service files:

    services/
      patientsService.ts
      appointmentsService.ts
      treatmentPlansService.ts
      paymentsService.ts
      inventoryService.ts

Later, feature-specific services may live inside feature folders.

Recommended data-fetching:

- TanStack Query for queries and mutations,
- Supabase client inside services,
- Zod validation for forms and important data boundaries.

---

## 12. File Storage

Supabase Storage should be used for files.

File categories:

- patient documents,
- consent forms,
- X-rays,
- photos,
- generated PDFs,
- internal reports.

Storage must not be public by default.

Access should depend on:

- authenticated user,
- clinic,
- role,
- related patient,
- document visibility.

---

## 13. Audit Logging

DentApp should include audit logging for sensitive actions.

Audit log should track:

- user,
- clinic,
- action,
- entity type,
- entity ID,
- timestamp,
- old values where needed,
- new values where needed,
- metadata where appropriate.

Sensitive actions include:

- patient changes,
- clinical note changes,
- treatment plan changes,
- payment changes,
- commission rule changes,
- inventory corrections,
- role changes,
- document uploads/deletions.

---

## 14. Environment Strategy

Recommended environments:

### Development

Used locally.

Contains fake data only.

### Staging

Used for testing before production.

Should use fake or anonymized data.

### Production

Used by the real pilot clinic.

Contains real data.

Must have:

- restricted access,
- backup strategy,
- audit logs,
- secure storage,
- documented admin access.

---

## 15. Security Principles

Security principles:

- never commit secrets,
- never commit real patient data,
- use environment variables,
- use RLS for sensitive tables,
- restrict storage access,
- avoid public buckets for patient data,
- use least privilege access,
- log sensitive changes,
- restrict financial and commission data,
- restrict patient records by role.

---

## 16. Deployment Direction

Initial frontend deployment options:

- Netlify,
- Vercel.

Backend:

- Supabase project in EU region if possible.

Before production pilot:

- configure production environment variables,
- configure backups,
- test authentication,
- test RLS policies,
- test storage access,
- confirm no demo secrets are exposed.

---

## 17. PDF / Print Architecture

PDF/print support is required for:

- patient record summary,
- treatment plan,
- patient ledger,
- visit summary,
- doctor commission report,
- inventory report.

Possible approaches:

- browser print for simple documents,
- client-side PDF generation,
- server-side PDF generation,
- Supabase Edge Function,
- separate PDF generation service.

Initial recommendation:

Start with clean printable HTML views, then add PDF generation when document structure stabilizes.

---

## 18. Future Integration Points

Possible future integrations:

- Google Calendar,
- SMS/Viber/WhatsApp reminders,
- fiscalization/accounting,
- dental imaging systems,
- external laboratories,
- online booking,
- patient portal,
- payment gateways,
- analytics.

These are not part of MVP unless explicitly approved.

---

## 19. Technical Risks

### 19.1 RLS Complexity

Risk:

Permissions may become complex.

Mitigation:

Start with clear roles and simple policies, then expand carefully.

### 19.2 Overbuilding

Risk:

Building advanced architecture before product validation.

Mitigation:

Use Supabase and keep MVP focused.

### 19.3 Data Sensitivity

Risk:

Patient data exposure.

Mitigation:

Strict environment separation, RLS, storage rules, audit logs.

### 19.4 Poor Data Model

Risk:

Wrong schema could slow future development.

Mitigation:

Use domain documents before final schema and review relationships carefully.

---

## 20. Open Technical Questions

- What exact RLS policy structure should be used?
- Should permissions be role-only or role plus granular permission flags?
- Should audit log be implemented with triggers, app logic, or hybrid?
- Should PDF generation be client-side or server-side?
- Should patient documents be stored in one bucket or separate buckets?
- How should staging be handled before production pilot?
- Should Supabase local development be used from the beginning?
