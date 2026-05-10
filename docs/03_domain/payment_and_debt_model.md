# DentApp — Payment and Debt Model

## 1. Purpose

This document defines the initial payment and debt model for DentApp.

The goal is to help the dental practice clearly track patient financial status without becoming a full accounting or fiscalization system in the MVP.

This is a product/domain model, not yet a final database schema.

---

## 2. Core Problem

In many dental practices, financial agreements are often informal.

Common issues:

- patients pay partially,
- patients pay in installments,
- patients pay later,
- advances are received,
- discounts are agreed verbally,
- unpaid balances are remembered by staff or doctors,
- performed services and payments are not clearly connected,
- doctor commission depends on collected or performed value.

DentApp should make these items visible, structured, and permission-controlled.

---

## 3. Patient Ledger

The patient ledger is the central financial view for a patient.

It should show:

- performed services,
- planned services where relevant,
- prices,
- discounts,
- payments,
- advances,
- unpaid balance,
- installment notes,
- payment history,
- internal financial notes,
- related doctor,
- commission relevance.

---

## 4. Ledger Entry Types

Initial ledger entry types:

- performed service charge,
- payment,
- partial payment,
- advance,
- discount,
- correction,
- refund,
- write-off,
- installment note.

Not all types need to be implemented immediately, but the model should allow them later.

---

## 5. Performed Service Charge

A charge may be created when a service is performed.

Fields may include:

- charge ID,
- clinic ID,
- patient ID,
- visit ID,
- performed service ID,
- doctor ID,
- service ID,
- description,
- original price,
- final price,
- discount amount,
- status,
- created date.

Charge statuses:

- open,
- partially paid,
- paid,
- cancelled,
- written off.

---

## 6. Payment

A payment records money received.

Fields may include:

- payment ID,
- clinic ID,
- patient ID,
- amount,
- payment date,
- payment method,
- received by,
- note,
- linked charges,
- created date,
- updated date.

Payment methods may include:

- cash,
- card,
- bank transfer,
- other.

Payment method details should be configurable later.

---

## 7. Partial Payments

A payment may cover only part of the patient balance.

DentApp should support:

- payment applied to specific service,
- payment applied to oldest open balance,
- payment kept as general patient credit/advance.

The exact allocation strategy must be defined during product discovery.

---

## 8. Advance Payments

An advance is money paid before the relevant service is completed.

Advance should support:

- amount,
- date,
- received by,
- purpose/note,
- remaining advance balance,
- later allocation to service or treatment plan.

---

## 9. Installments

Installments may initially be represented as structured notes.

MVP should support:

- installment agreement note,
- expected payment date,
- expected amount,
- status,
- related treatment plan or balance.

Future versions may support a full installment schedule.

---

## 10. Discounts

Discounts must be controlled.

Discounts may apply to:

- single service,
- treatment plan item,
- whole treatment plan,
- patient balance.

Discount fields may include:

- amount,
- percentage,
- reason,
- approved by,
- created by,
- date.

Open question:

Who can apply discounts?

---

## 11. Corrections and Cancellations

Financial records should not be silently deleted.

Corrections should be auditable.

Examples:

- incorrect payment amount,
- wrong service price,
- duplicate payment,
- cancelled service,
- refund.

MVP principle:

Prefer correction entries over hard deletion.

---

## 12. Unpaid Balance

Unpaid balance may be calculated as:

total charges minus total applied payments minus discounts/corrections.

The patient profile should show unpaid balance only to users with permission.

---

## 13. Financial Notes

Internal financial notes may include:

- patient promised to pay next visit,
- family member will pay,
- discount agreed by owner,
- installment agreement,
- do not schedule until payment,
- payment dispute.

Financial notes are sensitive and should be permission-controlled.

---

## 14. Doctor Commission Connection

Payment and debt data may affect doctor commission.

Commission may be calculated based on:

- performed value,
- collected amount,
- collected amount after discount,
- collected amount after lab cost,
- special rule.

This must connect with the doctor commission model.

---

## 15. Reports

Initial payment/debt reports:

- unpaid balances report,
- daily payments report,
- patient ledger report,
- open debt by patient,
- payments by date,
- performed but unpaid services,
- doctor collected work report.

---

## 16. Access Control

Financial data must be restricted.

Possible access:

- Owner/Admin: full access
- Reception/Admin: record payments and view balance if allowed
- Doctor: limited view if allowed
- Specialist: limited own/assigned view if allowed
- Assistant: no access by default
- Inventory Responsible: no access

---

## 17. Audit Requirements

Audit important financial actions:

- payment added,
- payment edited,
- payment cancelled,
- discount applied,
- charge changed,
- correction created,
- write-off created,
- installment note changed.

Audit should include:

- user,
- timestamp,
- old value if relevant,
- new value if relevant,
- reason if required.

---

## 18. MVP Simplification

For MVP, DentApp can start with:

- performed service charge,
- payment,
- partial payment,
- advance,
- discount,
- unpaid balance,
- financial note.

More advanced accounting/fiscal features are out of scope.

---

## 19. Open Questions

- Should payments be allocated manually or automatically?
- Should doctors see patient debt?
- Should reception be able to edit payments?
- Who can apply discounts?
- Should payments be linked to fiscal receipts later?
- Should installments have structured schedules in MVP?
- Should family payments across multiple patients be supported?
- Should payment corrections require owner approval?
