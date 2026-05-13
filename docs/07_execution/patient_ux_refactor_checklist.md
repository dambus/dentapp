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

- [x] Create Patient Snapshot component.
- [x] Show patient name and age/year of birth.
- [x] Show patient status.
- [x] Move warnings and allergies to top priority area.
- [x] Move important note to top priority area.
- [x] Show debt/prepayment state if user has permission.
- [x] Show active treatment plan.
- [x] Show next appointment.
- [x] Show last visit or last clinical note.
- [x] Ensure archived patient state remains visible.

---

## 4. Phase B - Today Panel

- [x] Create Today Panel component.
- [ ] Show reason for visit when appointment data exists.
- [x] Show planned treatment from the active treatment plan summary.
- [ ] Show active treatment plan item.
- [ ] Show tooth/region for today's work where known.
- [x] Show next recommended step.
- [x] Add disabled/planned Complete Visit placeholder.
- [x] Support no-appointment/ad hoc visit context with clear scheduling placeholder.

Phase B note: reason for visit, appointment-specific active plan item, and tooth/region remain pending until scheduling, visit, or richer treatment-plan-item context exists.

---

## 5. Phase C - Quick Actions

- [x] Add Quick Actions area.
- [x] Add disabled/planned Complete Visit action.
- [x] Add Add Clinical Note action for clinical write roles.
- [x] Add Update Odontogram action for clinical edit roles and read-only assistant context.
- [x] Add Add Treatment Plan Item entry point to the existing Treatment Plans section.
- [x] Add disabled/planned Add Payment action for allowed future payment roles.
- [ ] Add Schedule Next Appointment action when scheduling exists.
- [x] Add disabled/planned Schedule Next Appointment action for relevant future scheduling roles.
- [x] Make every quick action role-aware.
- [x] Hide or disable actions for archived patients where appropriate.

Phase C note: Quick Actions reuse existing sections and routes. Visit Completion, scheduling, payment, and ledger behavior remain disabled placeholders until their modules exist.

---

## 6. Phase D - Full Record Organization

- [x] Move Medical Record into Full Record.
- [x] Organize full medical record behind the default Full Record tab.
- [x] Move Odontogram into prominent Full Record tab/card.
- [x] Move Treatment Plans into Full Record tab/card.
- [x] Move Clinical Notes into Full Record tab/card.
- [ ] Add Payments section when ledger exists.
- [ ] Add Materials section when material usage exists.
- [x] Keep Documents and Timeline secondary.
- [x] Use tabs on desktop where appropriate.
- [ ] Use accordions on tablet/mobile where appropriate.

Phase D note: Full Record uses a simple responsive tab-button pattern for now. Payments, materials, and mobile-specific accordions remain pending until their modules or UX needs are clearer.

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
