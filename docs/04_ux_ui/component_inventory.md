# DentApp — Component Inventory

## 1. Purpose

This document defines the initial reusable component inventory for DentApp.

The goal is to avoid rebuilding the same UI patterns repeatedly and to help Codex/Cursor create consistent components.

This is a planning document. Components will be implemented gradually as needed.

---

## 2. Component Principles

Components should be:

- reusable,
- typed with TypeScript,
- accessible where possible,
- visually consistent,
- simple to use,
- responsive-friendly,
- suitable for business/healthcare workflows.

Avoid creating overly abstract components too early.

Build reusable components when a pattern appears more than once or is clearly central.

---

## 3. Layout Components

### AppShell

Purpose:

Main authenticated application layout.

Includes:

- sidebar,
- top bar,
- user menu,
- content area,
- responsive navigation.

### SidebarNav

Purpose:

Main role-aware navigation.

Items may include:

- Dashboard,
- Calendar,
- Patients,
- Treatment Plans,
- Payments,
- Commissions,
- Inventory,
- Reports,
- Settings.

### TopBar

Purpose:

Shows current context, search, user actions, and profile menu.

### Page

Purpose:

Standard page wrapper with spacing and max width.

### PageHeader

Purpose:

Standard page title area.

Includes:

- title,
- description,
- primary action,
- secondary actions.

### Section

Purpose:

Reusable content section.

### TwoColumnLayout

Purpose:

For patient summary + details, or settings layouts.

---

## 4. Basic UI Components

### Button

Variants:

- primary,
- secondary,
- ghost,
- danger,
- link.

Sizes:

- small,
- medium,
- large.

### Input

Standard text input.

### Textarea

For notes and longer text.

### Select

For controlled options.

### Checkbox

For boolean values.

### RadioGroup

For mutually exclusive choices.

### DatePicker

For date input.

### DateTimePicker

For appointment scheduling.

### Badge

For statuses and labels.

### Card

For grouped content.

### Modal

For focused actions and confirmations.

### Drawer

Useful for mobile or side details.

### Tabs

Useful for patient profile sections.

### Tooltip

For short explanations.

### DropdownMenu

For row and page actions.

---

## 5. Feedback Components

### Alert

For warnings, errors, and information.

Variants:

- info,
- success,
- warning,
- danger.

### Toast

For short feedback after actions.

Examples:

- Patient saved.
- Payment recorded.
- Material request created.

### EmptyState

For empty lists or missing content.

### LoadingState

For page or section loading.

### ErrorState

For failed loads or permission issues.

### PermissionDenied

For restricted screens.

### ConfirmDialog

For sensitive actions.

Examples:

- archive patient,
- delete document,
- cancel payment,
- approve correction.

---

## 6. Data Display Components

### DataTable

Reusable table component.

Needs:

- columns,
- sorting if needed,
- filters if needed,
- row actions,
- responsive behavior.

### InfoList

For label/value pairs.

Examples:

- patient contact data,
- appointment details,
- inventory item details.

### Timeline

For patient activity.

Shows:

- appointments,
- visits,
- notes,
- payments,
- documents,
- treatment plan changes.

### StatCard

For dashboard metrics.

Examples:

- appointments today,
- unpaid balances,
- low stock items,
- performed services.

### StatusBadge

For status display.

Examples:

- appointment status,
- treatment plan status,
- payment status,
- material request status.

---

## 7. Patient Components

### PatientSearch

Search by:

- name,
- phone,
- appointment,
- recent activity.

### PatientTable

Shows patient list.

Possible columns:

- name,
- phone,
- next appointment,
- active plan,
- unpaid balance if allowed,
- status.

### PatientHeader

Shows patient identity and important context.

Includes:

- name,
- age,
- phone,
- warnings,
- status,
- quick actions.

### PatientWarningBanner

Shows high-visibility medical or administrative warnings.

### PatientSummaryCard

Shows:

- next appointment,
- last visit,
- active plan,
- next step,
- unpaid balance if allowed.

### PatientTimeline

Chronological patient events.

---

## 8. Clinical Components

### AnamnesisForm

For structured anamnesis.

### ClinicalNoteEditor

For clinical notes.

### MedicalWarningsList

Displays allergies and warnings.

### OdontogramView

Displays teeth and status.

MVP may start as simple grid/list.

### ToothStatusSelector

Used to set tooth status.

### ToothDetailPanel

Shows tooth-specific information.

---

## 9. Treatment Plan Components

### TreatmentPlanList

Global or patient-specific list.

### TreatmentPlanCard

Summary of a plan.

### TreatmentPlanDetail

Full plan view.

### TreatmentPlanItemTable

List of plan items.

### TreatmentPlanItemForm

Create/edit treatment item.

### TreatmentPlanStatusBadge

Shows plan status.

### TreatmentPlanPrintView

Printable plan view.

---

## 10. Appointment Components

### CalendarView

Main scheduling calendar.

### AppointmentCard

Short appointment display.

### AppointmentDetailPanel

Shows appointment details.

### AppointmentForm

Create/edit appointment.

### AppointmentStatusBadge

Shows appointment status.

### DailyScheduleList

List view of daily appointments.

---

## 11. Visit Components

### VisitDetail

Shows visit summary and performed services.

### VisitForm

Create/edit visit.

### PerformedServiceTable

Shows performed services.

### PerformedServiceForm

Add/edit performed service.

### NextStepEditor

Defines patient next step.

---

## 12. Payment Components

Permission-controlled.

### PatientLedger

Shows charges, payments, discounts, and balance.

### LedgerEntryTable

Detailed ledger entries.

### PaymentForm

Record payment.

### PaymentSummaryCard

Shows paid/unpaid/advance summary.

### DebtBadge

Shows unpaid balance if allowed.

### FinancialNoteBox

Shows internal financial notes.

---

## 13. Commission Components

Highly restricted.

### CommissionRuleTable

Shows commission rules.

### CommissionRuleForm

Create/edit commission rule.

### DoctorCommissionReport

Shows doctor earnings.

### PayoutForm

Record payout.

### CommissionStatusBadge

Shows commission entry status.

---

## 14. Inventory Components

### InventoryTable

Shows inventory items.

### InventoryItemForm

Create/edit item.

### InventoryStatusBadge

Shows stock status.

### StockMovementTable

Shows movements.

### StockMovementForm

Record entry, consumption, correction.

### MaterialRequestTable

Shows requests.

### MaterialRequestForm

Create request.

### MaterialRequestStatusBadge

Shows request status.

### LowStockAlert

Shows low stock warning.

---

## 15. Report Components

### ReportFilters

Date range, doctor, status, category filters.

### ReportTable

Standard report table.

### ExportButton

For print/PDF/export.

### PrintView

Reusable print layout wrapper.

---

## 16. Settings Components

### UserTable

Manage users.

### UserForm

Create/invite/edit user.

### RoleBadge

Show user role.

### StaffTable

Manage staff.

### ServiceTable

Manage services.

### ServiceForm

Create/edit service.

### CategoryTable

Reusable category management.

---

## 17. Utility Components

### SearchInput

Reusable search.

### FilterBar

Reusable filter layout.

### ActionMenu

Reusable row actions.

### Pagination

For long lists.

### Breadcrumbs

For nested contexts.

### FileUpload

For documents.

### FileList

For patient documents.

### DocumentPreview

For PDF/image preview if supported.

---

## 18. Implementation Priority

### Phase 1 Components

- AppShell
- SidebarNav
- TopBar
- Page
- PageHeader
- Button
- Input
- Card
- Badge
- EmptyState
- LoadingState
- ErrorState

### Phase 2 Components

- PatientSearch
- PatientTable
- PatientHeader
- PatientSummaryCard
- Tabs
- InfoList

### Phase 3 Components

- OdontogramView
- TreatmentPlanList
- TreatmentPlanDetail
- TreatmentPlanItemTable
- TreatmentPlanItemForm
- StatusBadge variants

### Phase 4 Components

- CalendarView
- AppointmentForm
- VisitForm
- PerformedServiceForm

### Phase 5 Components

- PatientLedger
- PaymentForm
- PaymentSummaryCard

### Phase 6 Components

- CommissionRuleTable
- DoctorCommissionReport
- PayoutForm

### Phase 7 Components

- InventoryTable
- InventoryItemForm
- StockMovementForm
- MaterialRequestTable
- MaterialRequestForm
- LowStockAlert

---

## 19. Open Questions

- Should we use a UI component library or build custom components?
- Should shadcn/ui be introduced early?
- Which calendar library should be used?
- Should table component be custom or library-based?
- Should forms use React Hook Form from the beginning?
- Should status badges be centralized in one component?
- Should print views be normal React pages or separate templates?
