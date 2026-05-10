# DentApp — UX Principles

## 1. Purpose

This document defines the initial UX principles for DentApp.

DentApp will be used in a real dental practice during a working day, often under time pressure. The user experience must therefore be fast, clear, and workflow-oriented.

The application should reduce cognitive load, not create additional administration.

---

## 2. Core UX Goal

DentApp should help users quickly answer:

- who is scheduled today,
- what the patient needs next,
- what was already done,
- what is planned,
- what is unpaid,
- who performed the work,
- what materials are missing,
- what requires attention.

The application should not feel like a generic admin panel.

---

## 3. Workflow First

Design screens around real dental workflows, not around database tables.

Important workflows:

- new patient workflow,
- existing patient workflow,
- daily schedule,
- examination,
- treatment plan creation,
- performed service recording,
- payment recording,
- doctor commission review,
- material request,
- inventory update,
- end-of-day review.

Every feature should answer:

Does this help someone complete a real task faster or more reliably?

---

## 4. Fast Patient Access

Patient search and patient profile access must be very fast.

Users should be able to quickly find a patient by:

- name,
- phone number,
- appointment,
- doctor,
- recent activity.

Patient profile should immediately show:

- important warnings,
- active treatment plan,
- next appointment,
- last visit,
- unpaid balance if allowed,
- next step.

---

## 5. Role-Aware Interface

Different roles need different interfaces.

Owner/Admin needs:

- overview,
- reports,
- financials,
- commissions,
- settings,
- audit.

Doctor needs:

- patient clinical context,
- odontogram,
- treatment plan,
- visits,
- own work.

Reception/Admin needs:

- calendar,
- patient contact data,
- payment entry if allowed,
- print/export.

Assistant needs:

- schedule,
- preparation notes,
- material requests.

Inventory responsible person needs:

- stock,
- low stock,
- requests,
- suppliers.

The UI should not show unnecessary complexity to each role.

---

## 6. Important Information First

Each screen should prioritize the most useful information.

Examples:

Patient screen should show:

- warnings,
- next step,
- active treatment plan,
- last visit,
- unpaid balance if allowed.

Treatment plan screen should show:

- plan status,
- accepted items,
- remaining items,
- next scheduled step,
- estimated value if allowed.

Inventory screen should show:

- low stock,
- urgent requests,
- expiring items,
- recent movements.

---

## 7. Minimize Data Entry

DentApp should avoid unnecessary typing.

Use:

- smart defaults,
- dropdowns,
- templates,
- reusable service catalog,
- status buttons,
- quick actions,
- prefilled fields,
- recent values,
- search/select components.

Free-text is useful, but too much free-text reduces reporting quality.

Balance structured fields with notes.

---

## 8. Clear Statuses

Statuses should be visible and understandable.

Examples:

Appointment statuses:

- scheduled,
- confirmed,
- arrived,
- completed,
- cancelled,
- no-show,
- rescheduled.

Treatment plan statuses:

- draft,
- proposed,
- accepted,
- partially accepted,
- in progress,
- completed,
- paused,
- rejected,
- archived.

Payment statuses:

- unpaid,
- partially paid,
- paid,
- advance,
- correction.

Material request statuses:

- requested,
- approved,
- rejected,
- ordered,
- received,
- cancelled.

Use visual labels, but do not rely only on color.

---

## 9. Reduce Memory Dependency

The application should reduce situations where information is kept only in someone’s head.

DentApp should clearly store:

- next patient step,
- unpaid balance,
- installment note,
- active treatment plan,
- material request,
- doctor responsible,
- pending work,
- important warnings.

---

## 10. Responsive by Default

DentApp must work on:

- desktop,
- laptop,
- tablet,
- mobile phone.

Expected usage:

Desktop/laptop:

- administration,
- reports,
- detailed records,
- inventory,
- settings.

Tablet:

- chairside patient review,
- treatment plan,
- odontogram,
- visit notes.

Mobile:

- quick schedule check,
- patient contact,
- quick status review,
- urgent material request.

MVP should be responsive web first, not native mobile.

---

## 11. Healthcare-Appropriate Visual Style

DentApp should look:

- professional,
- clean,
- trustworthy,
- calm,
- modern,
- readable.

Avoid:

- playful UI,
- clutter,
- excessive decoration,
- poor contrast,
- tiny text,
- generic template look.

Use whitespace, clear hierarchy, and strong readability.

---

## 12. Error Prevention

The UI should prevent mistakes where possible.

Important areas:

- payments,
- discounts,
- patient identity,
- clinical notes,
- treatment plan changes,
- commission rules,
- inventory corrections.

Use confirmation for sensitive actions.

Examples:

- deleting/archive patient,
- changing payment,
- applying discount,
- changing commission rule,
- correcting inventory,
- archiving treatment plan.

---

## 13. Audit Awareness

For sensitive actions, users should understand that changes may be logged.

This is especially important for:

- payments,
- clinical notes,
- treatment plan changes,
- inventory corrections,
- user role changes.

The UI should support accountability without feeling hostile.

---

## 14. Empty States

Empty states should be useful.

Examples:

No treatment plan:

- show explanation,
- provide button to create treatment plan.

No payments:

- show that no payments have been recorded,
- provide action if user has permission.

No inventory requests:

- show that there are no open requests,
- provide create request button.

---

## 15. Loading and Error States

The app should handle:

- loading,
- empty data,
- permission denied,
- validation errors,
- network errors,
- failed save,
- file upload failure.

Errors should be clear and non-technical for normal users.

---

## 16. Navigation Principle

Navigation should be simple.

Main areas should likely include:

- Dashboard,
- Calendar,
- Patients,
- Treatment Plans,
- Payments,
- Doctor Commissions,
- Inventory,
- Reports,
- Settings.

Some items should be hidden depending on role.

---

## 17. Pilot Feedback Principle

UX decisions must be validated in the pilot practice.

During pilot, observe:

- which screens are used often,
- which screens are ignored,
- where users hesitate,
- where data entry feels too slow,
- which information is missing,
- which labels are unclear.

---

## 18. Open UX Questions

- What is the most used device in the pilot practice?
- Should the first screen be dashboard or calendar?
- What should doctors see first when opening a patient?
- Should patient debt be visible on patient header?
- Should assistants see medical warnings?
- Should treatment plan and odontogram be on the same screen?
- How simple can the first odontogram UI be?
- What are the most important quick actions?
