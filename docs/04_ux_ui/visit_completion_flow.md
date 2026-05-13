# DentApp - Visit Completion Flow

## 1. Purpose

This document defines the proposed workflow for closing a dental visit.

Visit Completion should become the main post-treatment workflow in DentApp. It should convert what happened in the chair into clinical notes, performed services, material usage, payment/debt state, doctor commission inputs, and next steps.

This is a planning document only.

---

## 2. Why Visit Completion Matters

In real clinics, the time after treatment is short. If DentApp requires long manual entry, users will delay documentation or skip details.

Visit Completion should:

- reduce memory burden,
- turn structured selections into useful drafts,
- keep clinical and financial records connected,
- support payment and debt tracking,
- prepare commission calculation,
- update the patient timeline and next step.

The common case should be possible in under 60 to 90 seconds.

---

## 3. Entry Points

Possible entry points:

- Patient Detail Quick Action: Complete Visit,
- Today Panel current appointment action,
- Calendar appointment action,
- Treatment plan item action: Mark performed / Complete,
- Odontogram tooth action: Record work,
- Visit list action for unfinished visits.

The primary entry point should be Patient Detail and current appointment context.

---

## 4. Step 1 - What Was Done

The user selects performed work.

Input options:

- choose from planned treatment plan item,
- choose from service catalog,
- choose recent/common service,
- create quick custom service label if allowed,
- mark as completed, partially completed, or started/in progress.

The flow should prefer structured selection over free text because it supports pricing, material suggestions, reporting, and commission.

---

## 5. Step 2 - Teeth/Regions Involved

The user links the work to:

- one tooth,
- multiple teeth,
- quadrant,
- jaw,
- full mouth,
- non-tooth-specific service.

The odontogram should be available as the fastest clinical selection surface. Tooth or region should be optional for general services such as consultation or hygiene if not clinically needed.

---

## 6. Step 3 - Service Selection

The user confirms the service or services.

Service selection should support:

- price list defaults,
- service category,
- responsible doctor,
- link to treatment plan item,
- completion status,
- multiple services in one visit.

The app should suggest services based on selected treatment plan item, tooth status, and common workflows.

---

## 7. Step 4 - Generated Clinical Note

DentApp should generate a clinical note draft from structured selections.

The draft may include:

- performed service,
- tooth or region,
- diagnosis/status if known,
- materials or anesthetic if selected,
- complications if entered,
- patient instructions,
- next step.

The doctor must be able to edit the generated note before final confirmation. Automation should draft documentation, not make unreviewed clinical decisions.

---

## 8. Step 5 - Materials Used

The app should suggest materials based on service templates.

Examples:

- composite restoration suggests composite, bonding agent, etch, matrix/wedge where applicable,
- endodontic treatment suggests files, irrigants, sealer, gutta-percha,
- crown preparation suggests impression/scanning materials and provisional materials,
- surgery suggests anesthetic, sutures, sterile consumables.

Material suggestions must be editable:

- add material,
- remove material,
- change quantity,
- mark usage unknown,
- defer inventory update if needed.

Material usage should support assistant entry and doctor confirmation where clinic policy requires it.

---

## 9. Step 6 - Price and Discount/Override

The app should propose price from the current price list or accepted treatment plan.

The workflow must support:

- default service price,
- treatment plan accepted price,
- manual price override,
- discount,
- included in larger treatment,
- no-charge service,
- split price across services if needed,
- permission control for who can override price or discount.

Price changes should be auditable when they affect ledger, reporting, or commission.

---

## 10. Step 7 - Payment/Debt/Prepayment

The user records or confirms financial state.

Supported states:

- paid now,
- partially paid,
- unpaid/debt,
- covered by advance/prepayment,
- advance received for future treatment,
- installment note,
- payment to be handled by reception.

Payment visibility and edit access must follow role permissions. Doctors may need limited debt/prepayment status, but full ledger access should remain configurable.

---

## 11. Step 8 - Doctor Commission

The app should prepare commission input from actual performed and charged work.

Commission calculation should consider:

- responsible doctor,
- performed service,
- service category,
- actual charged amount,
- discount or override,
- included/no-charge service,
- collected amount if commission is collection-based,
- lab cost if the clinic uses that rule later.

Doctor commission must be calculated from actual performed/charged work and real clinic rules, not only list price.

Final commission posting or approval may be immediate or deferred depending on clinic policy.

---

## 12. Step 9 - Next Step / Next Appointment

The flow should end by defining what happens next.

Options:

- schedule next appointment,
- set next recommended step,
- mark treatment plan item complete,
- select next treatment plan item,
- create follow-up reminder,
- no next step needed.

This prevents the next action from remaining only in the doctor's memory.

---

## 13. Final Confirmation

Final confirmation should show a compact summary:

- performed work,
- tooth/region,
- generated clinical note,
- services and prices,
- discount/override/included state,
- payment/debt/prepayment state,
- material usage,
- responsible doctor,
- commission basis/status,
- next step.

The user confirms, edits, or saves as draft if incomplete.

---

## 14. What Should Be Automated

DentApp should automate or suggest:

- service from treatment plan item,
- tooth/region from treatment plan or odontogram action,
- clinical note draft,
- material usage templates,
- default price,
- treatment plan item status update,
- ledger charge,
- debt state,
- commission calculation input,
- next step from active plan.

Automation must always be reviewable and editable.

---

## 15. What Must Remain Manually Editable

Manually editable:

- performed work description,
- tooth/region,
- note text,
- service selection,
- price,
- discount,
- included/no-charge status,
- payment amount and method,
- material quantity,
- responsible doctor,
- commission exception if authorized,
- next step.

Manual override is required because dental treatment and pricing often change in the chair.

---

## 16. Doctor-alone Workflow

Doctor-alone mode should be short:

1. Select performed work or treatment plan item.
2. Confirm tooth/region.
3. Review generated note.
4. Confirm price/payment state.
5. Confirm next step.

Advanced material and payment details can be marked for later completion if the doctor cannot finish everything before the next patient.

---

## 17. Assistant-supported Workflow

Assistant-supported mode can split responsibility:

1. Assistant opens patient and prepares today's context.
2. Assistant enters performed work, materials, and draft payment/next appointment details under instruction.
3. Doctor reviews clinical note, performed work, treatment plan status, and critical price decisions.
4. Reception or owner/admin completes payment details if needed.

The UI should distinguish prepared data from confirmed data.

---

## 18. Future AI Assistance Opportunities

Future AI support may help with:

- drafting clinical notes from structured selections,
- suggesting likely materials from service and tooth/region,
- identifying missing next steps,
- summarizing last visit before treatment,
- suggesting patient-facing explanations for treatment plan alternatives.

AI must not make autonomous clinical decisions. Doctor review and manual override remain required.

---

## 19. Data Model Implications

Future implementation likely needs:

- visits,
- performed services,
- service catalog and price list,
- treatment plan item links,
- tooth/region links,
- generated clinical note linkage,
- material usage entries,
- patient ledger entries,
- payment allocation,
- discount/override tracking,
- included/no-charge flag,
- commission calculation entries,
- next-step field,
- audit records for sensitive changes.

This flow should be implemented after the relevant domain model and permission decisions are ready.

---

## 20. Open Questions

1. Which services should be available as one-tap common actions?
2. Which clinical note templates are needed first?
3. Who can override price or apply discount?
4. How should "included in larger treatment" affect ledger and commission?
5. Should unpaid work create commission immediately or only after payment?
6. How should partial payments be allocated across services and doctors?
7. Which material templates are useful enough for MVP?
8. Can assistants confirm material usage, or only prepare it?
9. Should visits be closable as draft?
10. What exact visit summary should be printable?
