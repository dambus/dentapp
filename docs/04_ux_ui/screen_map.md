# DentApp — Screen Map

## 1. Purpose

This document defines the initial screen map for DentApp MVP.

The goal is to identify the main screens before implementation starts.

This is not a final UI design. It is a planning document for product, UX, and development.

---

## 2. Screen Groups

Initial screen groups:

1. Auth screens
2. App shell and navigation
3. Dashboard
4. Calendar
5. Patients
6. Patient profile
7. Treatment plans
8. Visits and performed services
9. Payments
10. Doctor commissions
11. Inventory
12. Reports
13. Settings
14. Error and utility screens

---

## 3. Auth Screens

### 3.1 Login

Purpose:

Allow users to log in.

Key elements:

- email,
- password,
- login button,
- forgot password link,
- error state.

### 3.2 Forgot Password

Purpose:

Allow password reset.

### 3.3 Invite / Set Password

Purpose:

Allow invited users to complete account setup.

May be later phase.

---

## 4. App Shell

### 4.1 Main Layout

Includes:

- sidebar or top navigation,
- role-aware menu,
- user profile menu,
- main content area,
- responsive mobile navigation.

### 4.2 Permission Denied Screen

Shown when user tries to access restricted area.

### 4.3 Not Found Screen

Shown for missing routes.

---

## 5. Dashboard Screens

### 5.1 Owner Dashboard

Shows:

- today’s appointments,
- daily payments summary,
- unpaid balances,
- doctor workload,
- pending material requests,
- low stock,
- quick reports.

### 5.2 Doctor Dashboard

Shows:

- today’s assigned appointments,
- patients requiring follow-up,
- active treatment plans,
- own performed work if enabled.

### 5.3 Reception Dashboard

Shows:

- today’s schedule,
- arrivals,
- cancellations,
- no-shows,
- payment reminders if allowed.

### 5.4 Inventory Dashboard

Shows:

- low stock,
- open material requests,
- expiring materials,
- recent stock movements.

---

## 6. Calendar Screens

### 6.1 Calendar View

Shows:

- appointments,
- doctor filter,
- day/week view,
- appointment status,
- quick appointment creation.

### 6.2 Appointment Detail

Shows:

- patient,
- doctor,
- time,
- appointment type,
- status,
- notes,
- related treatment plan item,
- actions.

### 6.3 Appointment Form

Used to create or edit appointment.

Fields:

- patient,
- doctor,
- start time,
- end time,
- type,
- status,
- notes.

---

## 7. Patients Screens

### 7.1 Patient List

Shows:

- patient name,
- phone,
- status,
- next appointment,
- active plan indicator,
- unpaid balance if allowed,
- search and filters.

### 7.2 Patient Create/Edit Form

Fields:

- first name,
- last name,
- date of birth,
- phone,
- email,
- address,
- notes,
- status.

### 7.3 Patient Profile

Main patient screen.

Suggested sections:

- overview,
- record,
- odontogram,
- treatment plans,
- visits,
- payments,
- documents,
- timeline.

---

## 8. Patient Profile Screens

### 8.1 Patient Overview

Shows:

- patient identity,
- warnings,
- contact info,
- next appointment,
- last visit,
- active treatment plan,
- next step,
- unpaid balance if allowed,
- quick actions.

### 8.2 Patient Record

Shows:

- anamnesis,
- allergies,
- medical warnings,
- dental history,
- clinical notes.

### 8.3 Odontogram

Shows:

- tooth overview,
- tooth statuses,
- planned treatments,
- performed treatments,
- tooth/region notes.

### 8.4 Patient Timeline

Shows chronological activity:

- appointments,
- visits,
- notes,
- treatment plan changes,
- payments,
- documents.

---

## 9. Treatment Plan Screens

### 9.1 Treatment Plan List

Global list of active or relevant plans.

Filters:

- status,
- doctor,
- patient,
- priority.

### 9.2 Treatment Plan Detail

Shows:

- plan status,
- patient,
- responsible doctor,
- plan items,
- estimated value,
- accepted/completed/remaining items,
- next step.

### 9.3 Treatment Plan Item Form

Fields:

- tooth/region,
- diagnosis,
- service,
- estimated price,
- doctor,
- priority,
- status,
- notes.

### 9.4 Treatment Plan Print View

Printable treatment plan for patient or internal use.

---

## 10. Visit and Performed Service Screens

### 10.1 Visit Detail

Shows:

- patient,
- doctor,
- appointment,
- clinical summary,
- performed services,
- notes,
- next step.

### 10.2 Visit Form

Used to create or edit visit.

### 10.3 Performed Service Form

Fields:

- service,
- doctor,
- treatment plan item,
- price,
- discount if allowed,
- notes,
- status.

---

## 11. Payments Screens

Permission-controlled.

### 11.1 Patient Ledger

Shows:

- charges,
- payments,
- discounts,
- advances,
- corrections,
- unpaid balance.

### 11.2 Payment Form

Fields:

- patient,
- amount,
- method,
- date,
- note,
- allocation if supported.

### 11.3 Unpaid Balances Report

Shows:

- patient,
- amount,
- last visit,
- next appointment,
- note.

### 11.4 Daily Payments Report

Shows:

- payments by day,
- received by,
- method,
- total.

---

## 12. Doctor Commission Screens

Highly restricted.

### 12.1 Commission Rules

Owner/admin only.

Shows:

- doctor,
- service/category,
- percentage,
- basis,
- active status.

### 12.2 Doctor Commission Report

Shows:

- period,
- performed value,
- collected value,
- commission amount,
- payout status.

### 12.3 Doctor Own Work Report

Optional for doctors.

Shows only own work and commission if enabled.

### 12.4 Payout Screen

Owner/admin only.

Used to record payouts.

---

## 13. Inventory Screens

### 13.1 Inventory List

Shows:

- item name,
- category,
- quantity,
- minimum quantity,
- status,
- expiry indicator.

### 13.2 Inventory Item Detail

Shows:

- item data,
- stock movements,
- requests,
- supplier,
- notes.

### 13.3 Stock Movement Form

Used for:

- entry,
- consumption,
- correction,
- disposal.

### 13.4 Material Requests

Shows:

- open requests,
- status,
- priority,
- requester,
- approver.

### 13.5 Material Request Form

Fields:

- item,
- quantity,
- reason,
- priority,
- notes.

### 13.6 Low Stock Report

Shows items below minimum quantity.

---

## 14. Reports Screens

Initial reports:

- daily schedule,
- performed services,
- unpaid balances,
- doctor work,
- doctor commission,
- low stock,
- material requests.

Reports should be role-aware.

---

## 15. Settings Screens

Owner/admin mostly.

### 15.1 Clinic Settings

Clinic profile and preferences.

### 15.2 Users and Roles

Manage users, roles, status.

### 15.3 Staff

Manage doctors, assistants, reception, inventory users.

### 15.4 Services and Price List

Manage services and categories.

### 15.5 Commission Rules

Manage doctor commission rules.

### 15.6 Inventory Categories

Manage material categories and units.

### 15.7 Document Templates

Future or later MVP.

---

## 16. Error and Utility Screens

Needed screens:

- loading state,
- empty state,
- permission denied,
- not found,
- save error,
- offline/connection issue if PWA later.

---

## 17. MVP Screen Priority

### Phase 1 Screens

- login,
- app shell,
- dashboard placeholder,
- patients list placeholder,
- settings placeholder.

### Phase 2 Screens

- patient list,
- patient profile,
- patient record,
- patient create/edit.

### Phase 3 Screens

- odontogram,
- treatment plan list/detail,
- treatment plan item form.

### Phase 4 Screens

- calendar,
- appointment detail/form,
- visit detail/form,
- performed service form.

### Phase 5 Screens

- patient ledger,
- payment form,
- unpaid balances report.

### Phase 6 Screens

- commission rules,
- doctor commission report,
- payout screen.

### Phase 7 Screens

- inventory list,
- inventory item detail,
- stock movement form,
- material request list/form,
- low stock report.

---

## 18. Open Questions

- Should patient profile use tabs or sections?
- Should calendar be the first implemented main screen after patients?
- Should treatment plan be inside patient profile first, then global list later?
- Should payments be visible as a standalone module in MVP?
- Should dashboard be real in MVP or initially placeholder?
- Which screens must work well on mobile from day one?
