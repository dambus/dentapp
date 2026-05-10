# DentApp — Information Architecture

## 1. Purpose

This document defines the initial information architecture for DentApp.

Information architecture describes how the application is organized, which main sections exist, and how users move through the product.

This is a planning document and may change after pilot feedback.

---

## 2. Main Navigation Areas

Initial main navigation areas:

1. Dashboard
2. Calendar
3. Patients
4. Treatment Plans
5. Payments
6. Doctor Commissions
7. Inventory
8. Reports
9. Settings

Not every role should see every area.

---

## 3. Dashboard

Dashboard is the operational overview.

Possible dashboard widgets:

- today’s appointments,
- patients currently expected,
- unpaid balances due today,
- open treatment plan follow-ups,
- no-shows,
- low stock materials,
- open material requests,
- doctor workload,
- quick actions.

Dashboard should be role-aware.

Owner dashboard is different from doctor dashboard.

---

## 4. Calendar

Calendar is used for internal scheduling.

Main objects:

- appointment,
- patient,
- doctor,
- chair/room,
- appointment type,
- appointment status.

Calendar views:

- day view,
- week view,
- doctor view,
- chair/room view,
- list view.

Initial MVP can start with day/week and doctor filter.

---

## 5. Patients

Patients section contains:

- patient list,
- search,
- filters,
- patient profile,
- patient record,
- treatment plans,
- visits,
- documents,
- payments if allowed.

Patient profile is one of the most important screens in the application.

---

## 6. Patient Profile Structure

Suggested patient profile tabs or sections:

1. Overview
2. Record
3. Odontogram
4. Treatment Plans
5. Visits
6. Payments
7. Documents
8. Timeline

Not all tabs are visible to every role.

### 6.1 Overview

Shows:

- patient identity,
- contact data,
- important warnings,
- next appointment,
- last visit,
- active treatment plan,
- next step,
- unpaid balance if allowed.

### 6.2 Record

Shows:

- anamnesis,
- allergies,
- medical warnings,
- dental history,
- clinical notes.

### 6.3 Odontogram

Shows:

- tooth status,
- planned treatment,
- completed treatment,
- notes by tooth or region.

### 6.4 Treatment Plans

Shows:

- active plans,
- plan items,
- statuses,
- estimated values,
- responsible doctors,
- next actions.

### 6.5 Visits

Shows:

- appointment/visit history,
- performed services,
- clinical notes,
- next steps.

### 6.6 Payments

Shows, if allowed:

- ledger,
- charges,
- payments,
- unpaid balance,
- advances,
- installments,
- financial notes.

### 6.7 Documents

Shows:

- uploaded documents,
- generated PDFs,
- consent forms,
- X-rays,
- photos.

### 6.8 Timeline

Shows chronological history:

- appointments,
- visits,
- notes,
- plan changes,
- payments,
- documents.

---

## 7. Treatment Plans

Treatment Plans section can exist both:

- inside patient profile,
- as a global list of active treatment plans.

Global treatment plan views may show:

- active plans,
- proposed plans,
- paused plans,
- plans waiting for patient decision,
- plans with no next appointment,
- completed plans.

This helps the practice follow up on unfinished work.

---

## 8. Payments

Payments section is permission-controlled.

Possible screens:

- patient ledger,
- daily payments,
- unpaid balances,
- payment entry,
- installment notes,
- discounts/corrections,
- financial reports.

This section may be visible only to:

- owner/admin,
- reception/admin if allowed,
- doctors in limited form if allowed.

---

## 9. Doctor Commissions

Doctor Commissions section is highly restricted.

Possible screens:

- commission rules,
- commission calculation,
- doctor work report,
- commission entries,
- payouts,
- period report.

Visible to:

- owner/admin,
- doctors only own view if enabled,
- specialists only own view if enabled.

Not visible to:

- assistant,
- reception by default,
- inventory responsible.

---

## 10. Inventory

Inventory section contains:

- inventory items,
- categories,
- suppliers,
- stock movements,
- low stock,
- material requests,
- expiring materials.

Inventory is mainly used by:

- owner/admin,
- inventory responsible person,
- assistants,
- doctors for requests.

---

## 11. Reports

Reports section may include:

- daily schedule report,
- performed services report,
- unpaid balances report,
- doctor work report,
- commission report,
- low stock report,
- material requests report.

Reports must be role-aware.

---

## 12. Settings

Settings section includes:

- clinic profile,
- users,
- roles,
- services,
- service categories,
- price list,
- commission rules,
- inventory categories,
- appointment types,
- document templates,
- general preferences.

Settings should be mostly owner/admin only.

---

## 13. Role-Based Navigation

### Owner/Admin

Sees:

- Dashboard
- Calendar
- Patients
- Treatment Plans
- Payments
- Doctor Commissions
- Inventory
- Reports
- Settings

### Doctor

Sees:

- Dashboard
- Calendar
- Patients
- Treatment Plans
- Visits
- Own reports if enabled

May see:

- own commission
- limited payment/debt info

### Specialist

Sees:

- Assigned Dashboard
- Assigned Calendar
- Assigned Patients
- Assigned Treatment Items
- Own reports if enabled

### Assistant

Sees:

- Dashboard
- Calendar
- limited Patients
- material requests
- limited Inventory

### Reception/Admin

Sees:

- Dashboard
- Calendar
- Patients
- Payments if allowed
- Documents/print if allowed
- limited Reports

### Inventory Responsible

Sees:

- Inventory
- Material Requests
- Low Stock
- Suppliers
- Inventory Reports

---

## 14. Global Search

DentApp should eventually support global search.

Initial search targets:

- patients,
- phone numbers,
- appointments,
- treatment plans,
- inventory items.

Search must respect permissions.

---

## 15. Quick Actions

Useful quick actions:

- add patient,
- create appointment,
- open patient,
- create treatment plan,
- add visit,
- record payment,
- create material request,
- upload document.

Quick actions should be role-aware.

---

## 16. Breadcrumbs and Context

For complex screens, the user should always know:

- which patient is open,
- which treatment plan is open,
- which visit is open,
- which doctor is assigned,
- whether they are viewing historical or active data.

Patient context should be persistent on patient-related screens.

---

## 17. Open Questions

- Should dashboard or calendar be the default landing screen?
- Should treatment plans have a global menu item in MVP?
- Should payments be a separate main section or only inside patient profile?
- Should commissions be visible as a main menu item only for owner/admin?
- Should inventory be visible to doctors or only request flow?
- Should reports be grouped by role?
- Should patient timeline be separate tab or part of overview?
