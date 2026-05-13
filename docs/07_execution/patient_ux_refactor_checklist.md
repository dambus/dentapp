# DentApp - Patient UX Refactor Checklist

## 1. Refactor Goal

- [ ] Refactor Patient Detail into a workflow-first screen.
- [ ] Prioritize fast pre-treatment review.
- [ ] Prioritize fast post-treatment completion.
- [ ] Keep advanced modules available but visually secondary.
- [ ] Validate doctor-alone and assistant-supported workflows with the pilot clinic.

---

## 2. Preconditions

- [ ] Review `dental_workflow_model.md`.
- [ ] Review `patient_detail_refactor_plan.md`.
- [ ] Review `visit_completion_flow.md`.
- [ ] Confirm role visibility rules for clinical, financial, assistant, and reception workflows.
- [ ] Confirm no real patient data is used in design/testing fixtures.
- [ ] Confirm existing Patient Detail behavior before refactor.

---

## 3. Phase A - Patient Snapshot

- [ ] Create Patient Snapshot component.
- [ ] Show patient name and age/year of birth.
- [ ] Show patient status.
- [ ] Move warnings and allergies to top priority area.
- [ ] Move important note to top priority area.
- [ ] Show debt/prepayment state if user has permission.
- [ ] Show active treatment plan.
- [ ] Show next appointment.
- [ ] Show last visit or last clinical note.
- [ ] Ensure archived patient state remains visible.

---

## 4. Phase B - Today Panel

- [ ] Create Today Panel component.
- [ ] Show reason for visit when appointment data exists.
- [ ] Show planned treatment.
- [ ] Show active treatment plan item.
- [ ] Show tooth/region for today's work where known.
- [ ] Show next recommended step.
- [ ] Add quick Complete Visit entry point.
- [ ] Support no-appointment/ad hoc visit context.

---

## 5. Phase C - Quick Actions

- [ ] Add Quick Actions area.
- [ ] Add Complete Visit action.
- [ ] Add Add Clinical Note action.
- [ ] Add Update Odontogram action.
- [ ] Add Add Treatment Plan Item action.
- [ ] Add Add Payment action for allowed roles.
- [ ] Add Schedule Next Appointment action when scheduling exists.
- [ ] Make every quick action role-aware.
- [ ] Hide or disable actions for archived patients where appropriate.

---

## 6. Phase D - Full Record Organization

- [ ] Move Medical Record into Full Record.
- [ ] Collapse full medical record by default.
- [ ] Move Odontogram into prominent Full Record tab/card.
- [ ] Move Treatment Plans into Full Record with active plan summary first.
- [ ] Move Clinical Notes into Full Record with recent notes first.
- [ ] Add Payments section when ledger exists.
- [ ] Add Materials section when material usage exists.
- [ ] Keep Documents and Timeline secondary.
- [ ] Use tabs on desktop where appropriate.
- [ ] Use accordions on tablet/mobile where appropriate.

---

## 7. Phase E - Visit Completion Prototype

- [ ] Define minimal visit completion data contract.
- [ ] Create Complete Visit prototype flow.
- [ ] Support selecting performed work.
- [ ] Support linking to tooth/region.
- [ ] Support linking to treatment plan item.
- [ ] Generate editable clinical note draft.
- [ ] Confirm performed service and status.
- [ ] Save as draft if completion is incomplete.
- [ ] Validate flow under 60 to 90 seconds for common cases.

---

## 8. Phase F - Material Suggestions

- [ ] Define material suggestion rules.
- [ ] Create service-to-material template concept.
- [ ] Suggest materials from selected service.
- [ ] Allow material add/remove/edit.
- [ ] Allow quantity override.
- [ ] Support assistant-prepared material usage.
- [ ] Decide when material usage updates inventory.

---

## 9. Phase G - Price/Discount/Debt Workflow

- [ ] Connect service selection to price list.
- [ ] Support treatment plan accepted price.
- [ ] Support manual price override.
- [ ] Support discount.
- [ ] Support included in larger treatment.
- [ ] Support no-charge service.
- [ ] Track unpaid/debt state.
- [ ] Track advance/prepayment state.
- [ ] Plan installment note support.
- [ ] Restrict discount/override permissions by role.
- [ ] Audit sensitive financial changes.

---

## 10. Phase H - Doctor Commission Workflow

- [ ] Define commission calculation trigger point.
- [ ] Calculate commission from actual performed/charged work.
- [ ] Account for discount and override.
- [ ] Account for included/no-charge service.
- [ ] Support performed-based commission.
- [ ] Support collected-based commission later if pilot requires it.
- [ ] Restrict commission visibility by role.
- [ ] Audit commission adjustments and approvals.

---

## 11. Phase I - Usability Testing With Pilot Clinic

- [ ] Validate with doctor working alone.
- [ ] Validate with doctor plus assistant scenario.
- [ ] Validate treatment plan discussion flow.
- [ ] Validate dense schedule post-treatment flow.
- [ ] Measure time to complete a common visit.
- [ ] Observe which sections users ignore.
- [ ] Observe which warnings/context users need first.
- [ ] Update workflow and UI plan from pilot feedback.

---

## 12. Definition of Done

- [ ] Patient Detail first screen supports fast briefing.
- [ ] Critical warnings and next steps are visible without deep navigation.
- [ ] Quick Actions are usable and role-aware.
- [ ] Full Record remains accessible but secondary.
- [ ] Complete Visit supports common post-treatment entry quickly.
- [ ] Generated notes and suggestions are editable.
- [ ] Pricing supports override, discount, included services, debt, and future installments.
- [ ] Material usage is suggested but editable.
- [ ] Commission uses actual performed/charged work.
- [ ] Pilot feedback has been reviewed and documented.

---

## 13. Risks and Safeguards

- [ ] Risk: Patient Detail becomes too long again. Safeguard: keep Snapshot and Today Panel above Full Record.
- [ ] Risk: doctors skip data entry. Safeguard: make common visit completion under 60 to 90 seconds.
- [ ] Risk: assistants see too much data. Safeguard: enforce role-specific visibility and RLS.
- [ ] Risk: pricing overrides become uncontrolled. Safeguard: permission checks and audit.
- [ ] Risk: generated notes are trusted blindly. Safeguard: require manual review before final confirmation.
- [ ] Risk: material suggestions are inaccurate. Safeguard: make suggestions editable and validate templates with pilot clinic.
- [ ] Risk: commission is calculated from the wrong amount. Safeguard: calculate from actual performed/charged/collected rules defined by clinic.
