# DentApp — MVP Scope

## 1. Purpose

This document defines the initial MVP scope for DentApp.

The MVP must be small enough to build and test, but complete enough to provide real operational value to the pilot dental practice.

The MVP is not the final product.

The MVP is the first usable internal version that helps validate the core DentApp workflow.

---

## 2. MVP Goal

The goal of the MVP is to allow one dental practice with multiple doctors to manage its core internal workflow:

- patients,
- patient records,
- treatment plans,
- appointments,
- visits,
- performed services,
- payments and unpaid balances,
- doctor commissions,
- inventory,
- material requests,
- basic reports,
- audit history,
- printable/exportable documents.

The MVP should reduce reliance on paper, memory, informal notes, and scattered tools.

---

## 3. MVP User Type

The MVP is designed for:

A single dental practice with multiple doctors, shared patients, shared materials, internal scheduling, and a need for better control over treatment plans, debts, doctor commissions, and inventory.

The MVP is not initially designed for:

- large dental chains,
- multi-location clinics,
- patient self-service,
- full accounting,
- fiscalization,
- native mobile apps.

---

## 4. MVP Product Principle

The MVP should answer the following questions quickly:

- Who is scheduled today?
- What is the next step for this patient?
- What treatment plan was agreed?
- What has already been performed?
- What remains to be done?
- How much does the patient owe?
- Which doctor performed which work?
- How much belongs to each doctor?
- Which materials are running low?
- Who requested or approved material purchase?
- What happened during the last visit?

---

## 5. MVP Modules

### 5.1 Authentication and User Roles

The app must support user login and basic role-based access.

Initial roles:

- owner/admin,
- doctor,
- specialist,
- assistant,
- reception/admin,
- inventory responsible person.

MVP requirements:

- users can log in,
- users have roles,
- access can be restricted by role,
- sensitive financial and medical data is not equally visible to all users.

---

### 5.2 Clinic / Practice Settings

The system must support one pilot practice, while remaining multi-tenant ready.

MVP requirements:

- clinic/practice profile,
- basic clinic settings,
- future-ready clinic_id concept,
- configurable services,
- configurable doctors,
- configurable commission rules.

---

### 5.3 Staff and Doctors

The app must support staff records.

MVP requirements:

- create staff member,
- assign role,
- mark staff as doctor if applicable,
- mark staff as specialist if applicable,
- define active/inactive status,
- link performed services to doctors.

---

### 5.4 Patients

The app must support patient records.

MVP requirements:

- patient list,
- patient search,
- patient profile,
- contact information,
- date of birth or age,
- patient status,
- important notes,
- medical warnings,
- patient timeline.

Sensitive data must be protected.

No real patient data should be used during development.

---

### 5.5 Digital Patient Record

The MVP must support basic clinical/dental records.

MVP requirements:

- anamnesis,
- allergies,
- important medical notes,
- risk notes,
- previous interventions,
- visit history,
- attachments reference,
- printable/exportable summary.

Legal replacement of paper records must be researched separately.

---

### 5.6 Odontogram

The MVP should include an initial odontogram model.

MVP requirements:

- FDI tooth numbering support,
- tooth status,
- planned treatment per tooth,
- performed treatment per tooth,
- notes per tooth or region,
- connection to treatment plan items.

The first version can be simple and may be improved after pilot feedback.

---

### 5.7 Treatment Plans

Treatment plans are a core MVP feature.

MVP requirements:

- create treatment plan for patient,
- add treatment plan items,
- connect items to tooth/region where applicable,
- connect items to services,
- assign responsible doctor,
- define estimated price,
- define status,
- define priority,
- track accepted/rejected/deferred items,
- track completed items,
- track remaining items,
- print/export treatment plan.

Initial treatment plan statuses:

- draft,
- proposed,
- accepted,
- partially accepted,
- in progress,
- completed,
- paused,
- rejected,
- archived.

---

### 5.8 Services and Price List

The app must support a configurable service catalog.

MVP requirements:

- service name,
- service category,
- default price,
- estimated duration,
- active/inactive status,
- optional default doctor commission rule,
- optional material relevance later.

---

### 5.9 Appointments and Internal Scheduling

The MVP must support internal scheduling.

MVP requirements:

- appointment calendar,
- doctor assignment,
- patient assignment,
- appointment type,
- duration,
- lifecycle status,
- day-of-visit operational state,
- notes,
- link to treatment plan when applicable.

Implemented lifecycle statuses:

- scheduled,
- completed,
- cancelled,
- no-show.

Implemented day-of-visit operational states:

- not arrived,
- arrived,
- ready for doctor.

Potential future scheduling states such as confirmed or rescheduled should be
modeled deliberately in a later task instead of being mixed into the current
lifecycle/operational split.

Patient self-booking is not part of MVP.

Google Calendar integration is not required in first MVP, but may be considered later.

---

### 5.10 Visits and Performed Services

The app must track what happened during a visit.

MVP requirements:

- create visit from appointment or directly,
- record performed services,
- link service to doctor,
- link service to patient,
- link service to treatment plan item when applicable,
- record clinical notes,
- record price,
- record whether service is completed or in progress,
- update patient timeline.

---

### 5.11 Patient Ledger, Payments, Debts, Installments

The MVP must include a patient financial ledger.

MVP requirements:

- show total performed value,
- show paid amount,
- show unpaid balance,
- record payment,
- record partial payment,
- record advance,
- record installment agreement note,
- record discount,
- show payment history,
- show open debt,
- restrict visibility by role.

The ledger is an internal operational record, not a full accounting or fiscal system.

---

### 5.12 Doctor Commission

The MVP must support doctors working on percentage.

MVP requirements:

- define commission rule per doctor,
- optionally define commission rule per service/category,
- calculate commission based on performed or collected amount,
- show doctor work report,
- show owner commission overview,
- track paid/unpaid commission,
- support visiting specialist use case.

Commission calculation details must be validated during discovery.

---

### 5.13 Inventory Items

The MVP must support basic inventory.

MVP requirements:

- material/item name,
- category,
- unit of measure,
- supplier,
- current quantity,
- minimum quantity,
- expiry date if needed,
- batch/lot if needed,
- active/inactive status.

---

### 5.14 Inventory Movements

The MVP must track stock changes.

MVP requirements:

- stock entry,
- stock consumption,
- stock correction,
- reason for movement,
- user who created movement,
- date/time,
- optional link to visit or service later.

---

### 5.15 Material Requests

The MVP must support material requests.

MVP requirements:

- create request,
- requested item,
- requested quantity,
- reason,
- priority,
- requested by,
- approved/rejected by,
- status,
- notes.

Initial statuses:

- draft,
- requested,
- approved,
- rejected,
- ordered,
- received,
- cancelled.

---

### 5.16 Basic Reports

The MVP should include basic reports.

Initial reports:

- daily appointments,
- performed services by day,
- unpaid balances,
- doctor work report,
- doctor commission report,
- low stock materials,
- open material requests.

Reports should start simple and become more advanced after pilot feedback.

---

### 5.17 PDF / Print Export

The MVP should support print/export for key documents.

Initial print/export documents:

- patient record summary,
- treatment plan,
- patient financial overview,
- visit summary,
- daily schedule,
- doctor commission report,
- inventory low stock report.

The exact legally required forms must be researched separately.

---

### 5.18 Audit Log

The MVP must include audit log planning and at least initial implementation for sensitive entities.

Important actions to audit:

- patient created/updated,
- patient record changed,
- treatment plan changed,
- payment recorded/updated,
- commission rule changed,
- inventory corrected,
- material request approved/rejected,
- user role changed.

---

## 6. Out of Scope for MVP

The following are not part of the MVP:

- patient portal,
- online patient booking,
- SMS/Viber/WhatsApp automation,
- full accounting system,
- fiscalization integration,
- multi-location support,
- dental laboratory portal,
- native iOS/Android apps,
- marketing automation,
- AI diagnosis,
- automated clinical decision-making,
- advanced CRM campaigns,
- complex insurance workflows.

These may be added to the future backlog.

---

## 7. MVP Acceptance Criteria

The MVP is acceptable when the pilot practice can use it to:

- create and find patients,
- view patient history,
- create treatment plans,
- record appointments,
- record visits and performed services,
- record payments and unpaid balances,
- calculate basic doctor commissions,
- track inventory,
- create material requests,
- print/export key documents,
- view basic reports,
- see audit history for important changes.

---

## 8. MVP Risks

### 8.1 Too Much Scope

Risk:

The MVP may become too large.

Mitigation:

Keep patient portal, automation, fiscalization, and advanced analytics out of MVP.

### 8.2 Too Little Clinical Usefulness

Risk:

The system may track admin data but fail to help doctors.

Mitigation:

Treatment plan, odontogram, and patient record must be useful from the first pilot.

### 8.3 Poor Adoption

Risk:

Staff may avoid using the app if it slows them down.

Mitigation:

Prioritize fast workflows, simple screens, and pilot feedback.

### 8.4 Legal Uncertainty

Risk:

Unclear whether the app can replace paper records.

Mitigation:

Provide print/export and position MVP as internal support until legal review is completed.

### 8.5 Financial Sensitivity

Risk:

Financial and commission data may be sensitive.

Mitigation:

Use strict permissions and role-based visibility.

---

## 9. Future After MVP

After MVP validation, consider:

- patient portal,
- online booking,
- automated reminders,
- Google Calendar sync,
- advanced analytics,
- digital consent forms,
- lab collaboration,
- multi-location support,
- SaaS billing,
- regional localization,
- mobile app if justified.
