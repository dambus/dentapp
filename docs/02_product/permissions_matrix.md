# DentApp — Permissions Matrix

## 1. Purpose

This document defines the initial role-based permission matrix for DentApp.

This is a product-level permission model, not yet a final database implementation.

The final implementation must be enforced through both frontend behavior and backend/database access rules.

Frontend hiding is not enough for sensitive data.

---

## 2. Permission Levels

The matrix uses the following permission levels:

- None: user cannot access this area
- View: user can see data
- Create: user can create new records
- Edit: user can modify existing records
- Delete: user can delete or archive records
- Approve: user can approve/reject workflow items
- Own: user can access only their own records
- Assigned: user can access only assigned records
- Limited: user can access a restricted subset

---

## 3. Roles

Initial roles:

- Owner/Admin
- Doctor
- Specialist
- Assistant
- Reception/Admin
- Inventory Responsible

---

## 4. High-Level Permissions Matrix

| Area | Owner/Admin | Doctor | Specialist | Assistant | Reception/Admin | Inventory Responsible |
|---|---|---|---|---|---|---|
| Dashboard | View all | View own/relevant | View assigned | Limited | Limited | Inventory view |
| Users and roles | Full | None | None | None | None | None |
| Clinic settings | Full | None | None | None | None | None |
| Patients | Full | View/Edit relevant | View assigned | Limited | View/Create/Edit basic | None/Limited |
| Patient contact data | Full | View relevant | View assigned | Limited | Full | None |
| Patient medical record | Full | View/Edit relevant | View/Edit assigned | Limited | None/Limited | None |
| Odontogram | Full | View/Edit relevant | View/Edit assigned | Limited | None | None |
| Treatment plans | Full | View/Edit relevant | View/Edit assigned | Limited view | View limited | None |
| Appointments | Full | View/Edit own/relevant | View assigned | View relevant | Full | None |
| Visits | Full | Create/Edit relevant | Create/Edit assigned | Limited support | View limited | None |
| Services/price list | Full | View | View | View limited | View | None |
| Payments | Full | Limited/optional | Limited/optional | None | Create/View limited | None |
| Patient debt | Full | Limited/optional | Limited/optional | None | View/Edit if allowed | None |
| Doctor commission | Full | Own if enabled | Own if enabled | None | None | None |
| Inventory | Full | View limited | View limited | View/Create request | View limited | Full |
| Inventory movements | Full | Create request/limited | Create request/limited | Create request/limited | None/Limited | Full |
| Material requests | Full/Approve | Create | Create | Create | Create/View | Full/Approve |
| Reports | Full | Own/relevant | Own/relevant | Limited | Limited | Inventory reports |
| Audit log | Full | None/Limited | None | None | None | None |
| Documents/files | Full | View relevant | View assigned | Limited | View/print limited | None |

---

## 5. Detailed Permission Notes

### 5.1 Users and Roles

Owner/Admin:

- create users,
- deactivate users,
- assign roles,
- change permissions,
- view audit log for user changes.

Other roles:

- no access by default.

---

### 5.2 Patients

Owner/Admin:

- full access to all patients.

Doctor:

- access to patients they treat or are assigned to.
- can edit clinical information where appropriate.

Specialist:

- access only to assigned patients/cases.

Assistant:

- limited access, mainly for preparation and workflow.

Reception/Admin:

- can create patient profile,
- can update contact details,
- should not edit clinical notes by default.

Inventory Responsible:

- no patient access by default.

---

### 5.3 Patient Medical Record

Owner/Admin:

- full access.

Doctor:

- view/edit relevant patient clinical records.

Specialist:

- view/edit assigned patient clinical records.

Assistant:

- limited access to warnings, allergies, preparation notes, if required.

Reception/Admin:

- no clinical edit access by default.

Inventory Responsible:

- no access.

---

### 5.4 Treatment Plans

Owner/Admin:

- full access.

Doctor:

- create and edit treatment plans for relevant patients.

Specialist:

- create/edit assigned treatment plan items.

Assistant:

- limited view if needed for preparation.

Reception/Admin:

- limited view for scheduling and payment context.

Inventory Responsible:

- no access.

---

### 5.5 Payments and Patient Debt

Owner/Admin:

- full access.

Reception/Admin:

- can record payments if allowed.
- can view unpaid balance if allowed.

Doctor:

- may view limited payment/debt status if enabled by clinic policy.

Specialist:

- may view limited payment/debt status for assigned cases if enabled.

Assistant:

- no access by default.

Inventory Responsible:

- no access.

Important:

Financial visibility must be configurable because practices may differ.

---

### 5.6 Doctor Commission

Owner/Admin:

- full access to all commission rules and reports.

Doctor:

- may view own commission if enabled.

Specialist:

- may view own commission/payment calculation if enabled.

Reception/Admin:

- no access by default.

Assistant:

- no access.

Inventory Responsible:

- no access.

Important:

Doctor commission data is highly sensitive and must be protected.

---

### 5.7 Inventory

Owner/Admin:

- full access.

Inventory Responsible:

- full operational access.

Assistant:

- view relevant inventory,
- create material requests,
- optionally record consumption.

Doctor:

- create material requests,
- view limited material status if needed.

Specialist:

- create material requests if needed.

Reception/Admin:

- limited view only if needed.

---

### 5.8 Material Requests

All operational roles may create material requests, depending on practice policy.

Approval should be limited to:

- Owner/Admin,
- Inventory Responsible,
- optionally authorized manager.

Material request status changes should be auditable.

---

### 5.9 Reports

Owner/Admin:

- all reports.

Doctor:

- own work report,
- own commission report if enabled,
- relevant patient/treatment reports.

Specialist:

- assigned/own work report.

Reception/Admin:

- daily schedule,
- payment summary if allowed,
- appointment reports.

Inventory Responsible:

- inventory reports,
- low stock,
- open requests.

Assistant:

- limited operational reports only.

---

### 5.10 Audit Log

Owner/Admin:

- full audit log access.

Other roles:

- no access by default.

Future possibility:

Doctors may see audit history for records they changed, but this is not MVP priority.

---

## 6. Permission Implementation Principles

The implementation must follow these principles:

- permissions should be enforced server-side/database-side,
- frontend hiding is not sufficient,
- Supabase RLS should be used when Supabase integration starts,
- sensitive data access must be tested,
- role changes must be auditable,
- permission assumptions must be documented,
- future custom permissions should be possible.

---

## 7. Open Permission Questions

The following questions must be answered during discovery:

1. Should doctors see patient debt?
2. Should doctors see only their own commission or also performed unpaid services?
3. Should reception be allowed to record payments?
4. Should assistants see patient medical warnings?
5. Should assistants update material consumption?
6. Should specialists see full patient history or only assigned case data?
7. Who can approve material requests?
8. Who can change price list?
9. Who can apply discounts?
10. Who can edit already recorded payments?
11. Who can edit completed clinical notes?
12. Who can delete or archive patient records?

These should be resolved before final permission implementation.
