# DentApp - Dental Workflow Model

## 1. Purpose

This document defines how DentApp should support real dental chairside workflow.

The goal is to shift DentApp from a module-heavy patient record into a workflow-driven clinic tool. The application should reduce memory burden, not add administrative burden. It should help doctors and staff quickly understand the patient, perform treatment, close the visit, and prepare the next step.

This is a product and UX planning document. It does not define final UI components or database schema.

---

## 2. Real-world Operating Assumptions

Dental appointments are often dense. Doctors may have limited time between patients, and detailed documentation is often completed after treatment rather than during active clinical work.

DentApp must assume:

- doctors may work alone,
- doctors may work with an assistant or dental technician,
- treatment time is clinically focused, not administration-focused,
- the app cannot require long forms during active treatment,
- the patient record must be useful in seconds,
- post-treatment entry must be fast enough to complete before the next patient,
- advanced data must remain available without dominating the main workflow.

Common actions should be possible quickly. Advanced modules should be available but not visually dominant.

---

## 3. Main User Roles in Chairside Workflow

### Doctor

The doctor needs fast access to patient context, medical warnings, the active treatment plan, odontogram state, last note, planned work, and post-treatment completion actions.

The doctor should confirm clinical decisions, performed work, pricing overrides where allowed, and next treatment steps.

### Specialist / Visiting Doctor

The specialist needs assigned-patient context, relevant history, tooth or region context, planned specialist work, and a fast way to record performed work.

### Assistant / Dental Technician

The assistant may prepare the patient, brief the doctor, record information under instruction, prepare materials, help with material usage tracking, and prepare payment or next-step information for doctor confirmation.

Assistant access should be limited to workflow needs. Financial and commission data should remain restricted unless explicitly allowed.

### Reception / Administration

Reception needs schedule, arrival, contact, payment, debt, and next appointment context. Reception should not edit clinical notes by default.

### Owner / Admin

Owner/admin needs all operational visibility, including financial state, commissions, audit, and workflow bottlenecks.

---

## 4. Scenario A - Doctor Alone

When the doctor works alone, DentApp must assume the doctor may not have time to use the app during treatment.

Recommended workflow:

1. Before treatment, the doctor opens the patient and reads a compact briefing.
2. During treatment, app interaction is optional and minimal.
3. If clinical entry is needed during treatment, the odontogram should be the fastest interaction surface.
4. After treatment, the doctor uses a short completion flow.
5. The app suggests clinical note text, services, prices, materials, and next step.
6. The doctor confirms or overrides instead of writing everything manually.

The doctor-alone flow should avoid forcing the doctor into multi-section patient record navigation.

---

## 5. Scenario B - Doctor With Assistant

When an assistant or dental technician is present, the workflow can distribute data entry.

The assistant may:

- open the patient before appointment,
- check warnings, allergies, planned treatment, debt/prepayment if allowed, and preparation notes,
- verbally brief the doctor,
- enter data during treatment under doctor instruction,
- prepare materials and material usage entries,
- prepare payment and next appointment information,
- leave critical clinical and financial confirmation to the doctor.

The UI should make it clear which actions are assistant-prepared and which require doctor confirmation.

---

## 6. Scenario C - Treatment Plan Discussion

Treatment plan discussion may happen during consultation, after examination, or between visits.

DentApp should make the following visible quickly:

- proposed work,
- tooth or region,
- alternatives,
- estimated price,
- accepted and rejected items,
- discounts or manual price overrides,
- included services,
- possible payment plan or installment note.

Treatment plans must support flexible pricing. Price list values are defaults, not absolute rules. Every automation must allow manual override.

Doctor override should be auditable where clinically or financially important.

---

## 7. Scenario D - Dense Schedule / Limited Time

When appointments are dense, post-treatment work must be extremely fast.

DentApp should support:

- quick performed work entry,
- linking to planned treatment item where possible,
- tooth or region selection,
- suggested materials,
- suggested prices,
- suggested clinical note,
- payment/debt state,
- next appointment or next recommended step.

For common cases, visit completion should be possible in under 60 to 90 seconds.

---

## 8. Pre-treatment Workflow

Pre-treatment briefing should answer the most important questions without scrolling through the whole record.

Immediately visible:

- patient name,
- age or year of birth,
- patient status,
- allergies,
- important medical warnings,
- important administrative note,
- debt or prepayment if user has permission,
- active treatment plan,
- what is planned today,
- last clinical note,
- last visit,
- next recommended step,
- quick access to history.

The pre-treatment screen should reduce memory dependency before the patient sits in the chair.

---

## 9. During-treatment Workflow

During treatment, DentApp should require minimal interaction.

Principles:

- long forms should not be required during active work,
- odontogram should be the primary clinical interaction surface,
- assistant entry should be supported if present,
- quick marking of tooth status or performed work should be possible,
- unfinished data should be allowed as draft/prepared state,
- clinical and financial confirmation should remain clear.

The app should not interrupt treatment flow with administrative requirements.

---

## 10. Post-treatment Workflow

Post-treatment workflow should guide the user through a short completion process.

The user selects what was done. DentApp then proposes:

- clinical note/protocol draft,
- performed services,
- service prices,
- material usage,
- doctor commission calculation,
- payment/debt state,
- next recommended step.

The user confirms or edits each item. Automation should speed up documentation but never remove manual control.

---

## 11. Quick Actions vs Advanced Actions

### Quick Actions

Quick actions belong near the top of the patient workflow:

- Complete Visit,
- Add Clinical Note,
- Update Odontogram,
- Add Treatment Plan Item,
- Add Payment,
- Schedule Next Appointment.

Quick actions should be role-aware and should open focused flows, not large generic modules.

### Advanced Actions

Advanced actions can be placed inside full record areas:

- full medical record editing,
- full clinical note history,
- full odontogram history,
- full treatment plan management,
- payment ledger,
- documents,
- timeline,
- audit-related history.

Advanced modules must remain available but should not dominate the working screen.

---

## 12. Data That Must Be Visible Immediately

The first patient view should prioritize:

- patient identity,
- age/year of birth,
- status,
- medical warnings,
- allergies,
- important note,
- active treatment plan,
- planned work today,
- next step,
- last clinical note,
- last visit,
- debt/prepayment if allowed,
- next appointment.

This information protects clinical safety, reduces mental load, and helps the doctor continue work without relying on memory.

---

## 13. Data That Can Be Hidden Behind Details

The following can be secondary:

- full anamnesis text,
- detailed dental history,
- older clinical notes,
- full treatment plan archive,
- documents,
- full payment ledger,
- material movement history,
- commission details,
- audit log,
- old appointments and timeline events.

These records matter, but they should not compete with immediate chairside context.

---

## 14. Workflow Risks

Key risks:

- the patient profile becomes too long and users stop reading it,
- doctors avoid the app if it slows treatment,
- assistants see too much sensitive data,
- pricing overrides are not controlled or auditable,
- material usage entry is skipped if it takes too long,
- commission rules are calculated from list price instead of actual performed/charged/collected work,
- post-treatment entry is delayed and details are forgotten,
- pilot clinic workflow differs from assumptions.

Mitigation:

- keep the first screen compact,
- prioritize quick actions,
- use role-specific visibility,
- generate drafts from structured selections,
- allow manual overrides,
- validate with pilot clinic observation.

---

## 15. UX Principles Derived From Workflow

- The app must reduce memory burden, not add administrative burden.
- Common actions must be possible quickly.
- Advanced modules must be available but not visually dominant.
- Doctors should not be forced to enter long forms during treatment.
- Odontogram should be a primary clinical interaction surface.
- The app should generate drafts and suggestions from user selections.
- Every automation must allow manual override.
- Pricing must support discounts, manual override, included services, debt, and installments.
- Material usage should be suggested from service templates but editable.
- Doctor commission must be calculated from actual performed/charged work and the clinic's real commission rules, not only list price.
- Pilot clinic feedback should shape the final workflow.

---

## 16. Open Questions for Pilot Clinic

1. Do doctors usually work alone, with assistants, or both depending on procedure?
2. What exact information does the doctor ask for before starting treatment?
3. Should doctors see patient debt or only payment warning/status?
4. Which services need the fastest post-treatment entry?
5. Which clinical note templates are repeated most often?
6. Which materials should be suggested automatically by service?
7. Who is allowed to apply a discount or override a price?
8. Are services sometimes included in a larger treatment package?
9. Are commissions based on performed work, charged work, collected payment, or mixed rules?
10. How should unpaid or partially paid work affect commission?
11. What information should an assistant be allowed to prepare but not confirm?
12. What must be printable or patient-facing after treatment plan discussion?
13. What is the maximum acceptable time for closing a common visit?
