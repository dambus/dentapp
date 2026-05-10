# DentApp — Dental Terms

## 1. Purpose

This document defines important dental and operational terminology used in DentApp.

The goal is to keep product, development, UX, and domain language consistent.

This glossary will evolve during discovery and pilot testing.

---

## 2. General Dental Terms

### Patient

A person receiving dental care in the practice.

In DentApp, a patient may have:

- personal/contact information,
- medical warnings,
- anamnesis,
- dental record,
- odontogram,
- treatment plans,
- appointments,
- visits,
- performed services,
- payments,
- documents.

---

### Doctor

A dental professional performing examinations, creating treatment plans, and performing services.

In DentApp, a doctor may be:

- permanent staff,
- part-time,
- visiting specialist,
- owner-doctor.

---

### Specialist

A doctor who performs specific specialist procedures, often occasionally or by referral within the practice.

Examples:

- oral surgeon,
- orthodontist,
- implantologist,
- endodontist,
- prosthodontist.

---

### Assistant

A staff member supporting doctors during treatment, preparing materials, helping patients, and supporting daily workflow.

---

### Reception / Administration

A person or role responsible for:

- appointment scheduling,
- patient communication,
- basic patient data,
- payments if allowed,
- printing/exporting documents,
- daily coordination.

---

## 3. Patient Record Terms

### Patient Record

The complete structured record of a patient inside DentApp.

It may include:

- patient profile,
- anamnesis,
- allergies,
- medical warnings,
- dental history,
- visit history,
- odontogram,
- treatment plans,
- documents,
- consent forms,
- financial overview.

---

### Anamnesis

Medical and dental history collected from the patient.

May include:

- current diseases,
- previous diseases,
- medications,
- allergies,
- pregnancy status if applicable,
- bleeding disorders,
- heart conditions,
- diabetes,
- high blood pressure,
- other medical risks relevant for dental care.

---

### Medical Warning

A short high-visibility warning that should be visible to authorized users.

Examples:

- allergy to penicillin,
- anticoagulant therapy,
- diabetes,
- pregnancy,
- high blood pressure,
- cardiac risk,
- requires antibiotic prophylaxis.

---

### Clinical Note

A note written by a doctor or authorized clinical user.

Clinical notes may relate to:

- examination,
- diagnosis,
- treatment,
- complications,
- patient instructions,
- follow-up,
- changes in treatment plan.

---

### Visit

An actual patient encounter.

A visit may be connected to:

- appointment,
- doctor,
- assistant,
- treatment plan,
- performed services,
- clinical notes,
- payments,
- documents.

---

## 4. Odontogram Terms

### Odontogram

A graphical or structured representation of the patient’s teeth and dental status.

DentApp should initially support FDI tooth numbering.

---

### FDI Tooth Numbering

International two-digit tooth numbering system.

Examples:

- 11: upper right central incisor,
- 21: upper left central incisor,
- 36: lower left first molar,
- 46: lower right first molar.

Permanent teeth use quadrants 1, 2, 3, 4.

Primary teeth use quadrants 5, 6, 7, 8.

---

### Tooth Status

The condition or state of a tooth.

Examples:

- healthy,
- caries,
- filled,
- missing,
- extracted,
- root canal treated,
- crown,
- bridge abutment,
- implant,
- planned extraction,
- planned restoration.

---

### Tooth Surface

Part of the tooth affected by diagnosis or treatment.

Common surfaces:

- mesial,
- distal,
- occlusal,
- buccal,
- lingual,
- palatal,
- incisal.

---

## 5. Treatment Plan Terms

### Treatment Plan

A structured plan of proposed, accepted, active, or completed dental treatments for a patient.

A treatment plan may include:

- multiple items,
- affected tooth or region,
- diagnosis,
- proposed service,
- estimated price,
- responsible doctor,
- priority,
- status,
- payment information,
- completion information.

---

### Treatment Plan Item

One planned procedure or treatment step inside a treatment plan.

Example:

- tooth 36 composite filling,
- tooth 46 root canal treatment,
- upper jaw prosthetic work,
- extraction of tooth 18,
- implant placement region 24.

---

### Proposed Treatment

A treatment suggested by the doctor but not yet accepted by the patient.

---

### Accepted Treatment

A treatment accepted by the patient.

Accepted treatment may still be:

- not started,
- in progress,
- partially completed,
- completed.

---

### Deferred Treatment

A proposed treatment postponed by the patient or doctor.

---

### Rejected Treatment

A proposed treatment that the patient declined.

---

## 6. Financial Terms

### Patient Ledger

A financial overview of the patient inside DentApp.

It may include:

- performed services,
- planned services,
- prices,
- payments,
- unpaid balances,
- advances,
- installments,
- discounts,
- notes.

---

### Payment

Money received from the patient or payer.

Payment may be:

- full,
- partial,
- advance,
- installment,
- correction.

---

### Unpaid Balance

Amount that remains unpaid.

---

### Installment

A partial payment arrangement where the patient pays over time.

---

### Advance

Payment made before service completion or before a future treatment phase.

---

### Discount

A price reduction applied to a service, treatment plan, or patient.

Discount permissions must be controlled.

---

## 7. Doctor Commission Terms

### Commission

Amount or percentage owed to a doctor based on performed or collected work.

---

### Commission Rule

A configurable rule that defines how a doctor’s commission is calculated.

May depend on:

- doctor,
- service,
- service category,
- collected amount,
- performed amount,
- laboratory cost,
- special agreement.

---

### Collected-Based Commission

Commission calculated only after payment is collected.

---

### Performed-Based Commission

Commission calculated when the service is performed, regardless of payment status.

---

### Payout

Amount paid to the doctor for a specific period or set of services.

---

## 8. Inventory Terms

### Inventory Item

A material, consumable, tool, or equipment tracked by the practice.

Examples:

- composite,
- anesthetic,
- gloves,
- impression material,
- burs,
- needles,
- implant components,
- disinfectant.

---

### Stock Movement

A recorded change in inventory quantity.

Types:

- stock entry,
- consumption,
- correction,
- return,
- disposal.

---

### Material Request

A request created when material is needed.

May include:

- item,
- quantity,
- priority,
- requester,
- approver,
- status,
- notes.

---

### Minimum Stock

The lowest acceptable quantity before the system should warn users or trigger a request.

---

### Batch / Lot

Manufacturer batch or lot number, relevant for traceability.

---

### Expiry Date

Date after which the material should not be used.

---

## 9. Document Terms

### Consent Form

A document signed by the patient to confirm agreement or acknowledgment.

---

### Patient Record Summary

A printable/exportable summary of patient clinical information.

---

### Treatment Plan Export

A printable/exportable treatment plan that may be shared with the patient.

---

### Visit Summary

A record of what happened during a specific visit.

---

## 10. Terms to Validate During Discovery

The following terms must be validated with the pilot practice:

- exact local names for patient record sections,
- preferred Serbian dental terminology,
- treatment plan statuses,
- appointment types,
- service categories,
- doctor commission terms,
- inventory categories,
- material request terminology,
- required print document names.
