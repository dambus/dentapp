# DentApp — User Roles

## 1. Purpose

This document defines the initial user roles for DentApp.

Roles are used to understand what each user type needs, what they should be able to do, and what information should be restricted.

The final permission system may be more granular than these roles, but these roles are the initial product model.

---

## 2. Role Overview

Initial roles:

1. Owner / Admin
2. Doctor
3. Specialist / Visiting Doctor
4. Assistant
5. Reception / Administration
6. Inventory Responsible Person

Future roles may include:

- accountant,
- clinic manager,
- patient,
- external laboratory,
- system super admin.

Patient role is not part of the MVP.

---

## 3. Owner / Admin

### 3.1 Description

The owner/admin is responsible for overall practice management.

This user has the highest level of access in the practice.

### 3.2 Main Needs

- see daily practice overview,
- manage users and roles,
- see financial reports,
- see unpaid balances,
- see doctor performance,
- see doctor commission,
- manage services and prices,
- manage commission rules,
- manage inventory overview,
- approve sensitive changes,
- review reports,
- export/print data.

### 3.3 Typical Screens

- dashboard,
- patients,
- appointments,
- treatment plans,
- payments,
- reports,
- doctor commissions,
- inventory,
- material requests,
- settings,
- audit log.

### 3.4 Sensitive Access

Owner/admin may access:

- patient records,
- financial data,
- doctor commission data,
- inventory value,
- user permissions,
- audit logs.

---

## 4. Doctor

### 4.1 Description

The doctor performs examinations, creates treatment plans, performs services, and records clinical information.

### 4.2 Main Needs

- see assigned patients,
- review patient history,
- update clinical notes,
- use odontogram,
- create treatment plans,
- record performed services,
- see next steps,
- optionally see patient debt status,
- optionally see own work and commission.

### 4.3 Typical Screens

- daily schedule,
- patient profile,
- patient record,
- odontogram,
- treatment plan,
- visit screen,
- own work report.

### 4.4 Sensitive Access

Doctor should access clinical data for relevant patients.

Financial visibility should be configurable.

Doctor commission visibility should usually be limited to their own commission, if enabled.

---

## 5. Specialist / Visiting Doctor

### 5.1 Description

A specialist or visiting doctor works occasionally or only on specific cases.

### 5.2 Main Needs

- see assigned appointments,
- see assigned patient information,
- review relevant history,
- record performed specialist service,
- see own work report,
- see own commission/payment information if enabled.

### 5.3 Typical Screens

- assigned schedule,
- assigned patient profile,
- visit screen,
- own work report.

### 5.4 Sensitive Access

Access should be more limited than a regular doctor.

Specialist should not automatically see all patients.

Financial visibility should be restricted unless explicitly enabled.

---

## 6. Assistant

### 6.1 Description

Assistant supports doctors during treatments, prepares patients and materials, and may help with basic documentation.

### 6.2 Main Needs

- see daily schedule,
- see patient preparation notes,
- see important warnings/allergies if needed,
- help prepare materials,
- record or suggest material usage,
- create material requests,
- view basic patient status if allowed.

### 6.3 Typical Screens

- daily schedule,
- patient preparation view,
- material requests,
- inventory low stock view,
- limited patient information.

### 6.4 Sensitive Access

Assistant should not have full financial access by default.

Assistant should not see doctor commission data.

Clinical access should be limited to what is needed for patient care and workflow.

---

## 7. Reception / Administration

### 7.1 Description

Reception/admin handles scheduling, patient contact, basic payments, documents, and daily coordination.

### 7.2 Main Needs

- create and modify appointments,
- search patients,
- create basic patient profile,
- update contact information,
- record appointment status,
- record payments if allowed,
- see unpaid balance if allowed,
- print documents,
- handle daily schedule.

### 7.3 Typical Screens

- calendar,
- patient list,
- patient contact profile,
- payment entry,
- daily schedule,
- print/export documents.

### 7.4 Sensitive Access

Reception may need limited financial access.

Reception should not see doctor commission data.

Reception should not edit clinical notes unless explicitly allowed.

---

## 8. Inventory Responsible Person

### 8.1 Description

This user manages material tracking, stock levels, requests, and ordering support.

### 8.2 Main Needs

- view inventory,
- create inventory items,
- update quantities,
- record stock entries,
- record corrections,
- see low stock,
- manage material requests,
- mark items as ordered/received,
- view suppliers.

### 8.3 Typical Screens

- inventory list,
- inventory item detail,
- material requests,
- low stock report,
- suppliers,
- inventory movements.

### 8.4 Sensitive Access

Inventory responsible person does not need access to full patient records by default.

Financial access should be limited to inventory-related data only, if purchase prices are tracked.

Doctor commission data should not be visible.

---

## 9. Future Role: Patient

Patient-facing role is not part of MVP.

Future patient role may support:

- viewing appointments,
- online booking,
- viewing accepted treatment plans,
- signing consent forms,
- receiving documents,
- viewing payment status,
- receiving reminders.

---

## 10. Future Role: External Laboratory

External laboratory role is not part of MVP.

Future lab role may support:

- receiving lab work requests,
- updating status,
- uploading documents,
- communication with practice,
- invoice/lab cost tracking.

---

## 11. Future Role: Accountant

Accountant role is not part of MVP.

Future accountant role may support:

- viewing financial reports,
- exporting data,
- reconciling payments,
- limited non-clinical access.

---

## 12. Important Role Principles

- Users should only see what they need.
- Clinical data should be protected.
- Financial data should be restricted.
- Doctor commission data should be highly restricted.
- Inventory data can be broader but still controlled.
- Permissions should be configurable over time.
- Frontend visibility is not enough; database-level security is required.
- All sensitive actions should be auditable.
