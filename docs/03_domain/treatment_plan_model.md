# DentApp — Treatment Plan Model

## 1. Purpose

This document defines the initial treatment plan model for DentApp.

The treatment plan is one of the most important domain objects in the application.

It should connect clinical, operational, and financial workflows.

This is a product/domain model, not yet a final database schema.

---

## 2. Why Treatment Plans Matter

In many dental practices, treatment plans are often:

- discussed verbally,
- written partially on paper,
- remembered by the doctor,
- changed over time,
- not clearly linked to payment,
- not clearly linked to performed work,
- hard for other doctors to continue.

DentApp should make treatment plans structured, visible, trackable, and connected to daily work.

---

## 3. Treatment Plan Goals

A treatment plan should show:

- what was proposed,
- what was accepted,
- what was rejected,
- what was postponed,
- what is in progress,
- what is completed,
- what remains,
- estimated price,
- payment status,
- responsible doctor,
- next step.

---

## 4. Treatment Plan Entity

A treatment plan should include:

- treatment plan ID,
- clinic ID,
- patient ID,
- title,
- description,
- status,
- created by,
- responsible doctor,
- created date,
- updated date,
- accepted date if applicable,
- completed date if applicable,
- archived date if applicable,
- notes.

Example titles:

- Initial treatment plan,
- Prosthetic rehabilitation plan,
- Implant therapy plan,
- Emergency treatment plan,
- Alternative treatment plan.

---

## 5. Treatment Plan Statuses

Initial statuses:

- draft,
- proposed,
- accepted,
- partially accepted,
- in progress,
- completed,
- paused,
- rejected,
- archived.

### Draft

Plan is being prepared and is not yet presented to the patient.

### Proposed

Plan was proposed to the patient but not accepted yet.

### Accepted

Patient accepted the plan.

### Partially Accepted

Patient accepted some plan items and rejected/deferred others.

### In Progress

At least one accepted item has started or been performed.

### Completed

All accepted items are completed.

### Paused

Plan is temporarily paused.

### Rejected

Patient rejected the plan.

### Archived

Plan is no longer active but remains in history.

---

## 6. Treatment Plan Item Entity

A treatment plan item represents one planned procedure, stage, or service.

It should include:

- item ID,
- treatment plan ID,
- clinic ID,
- patient ID,
- tooth or region,
- diagnosis,
- proposed service,
- service category,
- responsible doctor,
- estimated price,
- estimated duration,
- priority,
- status,
- planned date if known,
- completed date if completed,
- linked appointment,
- linked visit,
- linked performed service,
- notes.

---

## 7. Treatment Plan Item Statuses

Initial item statuses:

- proposed,
- accepted,
- rejected,
- deferred,
- planned,
- scheduled,
- in progress,
- completed,
- cancelled,
- archived.

### Proposed

Item is suggested but not accepted.

### Accepted

Patient accepted the item.

### Rejected

Patient rejected the item.

### Deferred

Patient or doctor postponed the item.

### Planned

Item is planned internally but not yet scheduled.

### Scheduled

Item is connected to a future appointment.

### In Progress

Item has started but is not completed.

### Completed

Item was performed and completed.

### Cancelled

Item was cancelled.

### Archived

Item is no longer active but remains in history.

---

## 8. Tooth and Region Connection

Treatment plan item may relate to:

- one tooth,
- multiple teeth,
- tooth surface,
- jaw,
- quadrant,
- region,
- full mouth,
- non-tooth-specific service.

Examples:

- tooth 36,
- teeth 11 to 13,
- upper jaw,
- lower jaw,
- quadrant 1,
- full mouth,
- general hygiene appointment.

---

## 9. Service Connection

Each treatment plan item may connect to a service from the price list.

Service connection helps with:

- default name,
- default price,
- estimated duration,
- category,
- commission rule,
- reporting,
- later material usage.

The doctor should be able to adjust price or description when needed, if permission allows.

---

## 10. Financial Connection

Treatment plan should support financial visibility.

Possible values:

- estimated total,
- accepted total,
- completed value,
- paid amount,
- unpaid amount,
- discount,
- advance,
- installment note.

Financial visibility must depend on user role.

Doctors may or may not see full financial data depending on clinic policy.

---

## 11. Visit and Performed Service Connection

When treatment is performed:

- visit is created,
- performed service is recorded,
- performed service can link to treatment plan item,
- item status can be updated,
- financial ledger can be updated,
- doctor commission can be calculated,
- patient timeline can be updated.

A treatment plan item may be completed in one visit or multiple visits.

---

## 12. Priority

Treatment plan item should support priority.

Initial priorities:

- urgent,
- high,
- normal,
- low,
- optional.

Priority helps identify what should be done next.

---

## 13. Treatment Plan Changes

Treatment plans change often.

DentApp should support:

- adding new items,
- changing item status,
- changing price,
- changing responsible doctor,
- changing priority,
- cancelling items,
- archiving old plans,
- keeping history.

Important changes should be auditable.

---

## 14. Patient Communication

MVP is internal, but treatment plans should be printable/exportable.

Future versions may allow:

- patient portal view,
- digital acceptance,
- digital signature,
- patient comments,
- online approval.

For MVP, print/export is enough.

---

## 15. Treatment Plan Screen Requirements

A useful treatment plan screen should show:

- patient information,
- plan status,
- plan items grouped by status or region,
- tooth/region,
- service,
- doctor,
- estimated price,
- payment status if allowed,
- next step,
- notes,
- quick actions.

Possible quick actions:

- add item,
- mark as accepted,
- mark as rejected,
- schedule item,
- record performed service,
- print/export plan.

---

## 16. Audit Requirements

Audit important actions:

- treatment plan created,
- treatment plan status changed,
- item added,
- item edited,
- item accepted/rejected,
- price changed,
- responsible doctor changed,
- item completed,
- item cancelled,
- plan archived.

---

## 17. Open Questions

- How detailed should the treatment plan be in the first pilot?
- Should treatment plans have versions?
- Should old prices be locked after patient acceptance?
- Who can change an accepted treatment plan?
- Who can apply discount?
- Should patient signature be supported in MVP?
- Should plan items support phases?
- Should laboratory cost be attached to treatment items?
- Should treatment plan export be patient-friendly or internal-only?
