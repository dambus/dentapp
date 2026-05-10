# DentApp — Patient Record Model

## 1. Purpose

This document defines the initial patient record model for DentApp.

The patient record is one of the core objects in the application.

It must support clinical workflow, administrative workflow, documentation, reporting, and future legal/print/export requirements.

This is a product/domain model, not yet a final database schema.

---

## 2. Patient Record Goals

The patient record should help authorized users quickly understand:

- who the patient is,
- how to contact the patient,
- what medical risks exist,
- what dental history exists,
- what was previously done,
- what is currently planned,
- what remains to be done,
- what documents exist,
- what the financial status is if user has permission.

---

## 3. Patient Profile

Basic patient profile should include:

- patient ID,
- clinic ID,
- first name,
- last name,
- date of birth,
- age,
- gender if needed,
- phone number,
- email,
- address,
- emergency contact if needed,
- preferred contact method,
- patient status,
- created date,
- updated date.

Patient status examples:

- active,
- inactive,
- archived,
- deceased,
- blocked/do not schedule.

---

## 4. Important Patient Flags

DentApp should support high-visibility patient flags.

Examples:

- allergy,
- medical warning,
- unpaid balance,
- special communication note,
- anxious patient,
- requires premedication,
- VIP/internal note,
- do not call,
- minor patient.

Flags should be configurable later.

Medical flags should be visible only to authorized users.

---

## 5. Medical and Dental Anamnesis

Anamnesis should include structured fields and free-text notes.

Potential sections:

### 5.1 General Health

- current diseases,
- chronic conditions,
- previous surgeries,
- current medications,
- pregnancy status where applicable,
- smoking status,
- alcohol or substance risk where clinically relevant.

### 5.2 Allergies

- medication allergies,
- material allergies,
- latex allergy,
- anesthetic allergy,
- other allergies,
- reaction description.

### 5.3 Dental History

- previous dental treatments,
- previous complications,
- orthodontic history,
- implant history,
- prosthetic history,
- periodontal history,
- oral hygiene habits.

### 5.4 Risk Factors

- anticoagulant therapy,
- diabetes,
- heart disease,
- high blood pressure,
- epilepsy,
- immunosuppression,
- bleeding disorders,
- infectious disease risk if clinically relevant.

---

## 6. Clinical Notes

Clinical notes should support:

- date/time,
- author,
- note type,
- content,
- related visit,
- related tooth/region,
- related treatment plan item,
- visibility level,
- audit history.

Initial note types:

- examination note,
- diagnosis note,
- treatment note,
- complication note,
- follow-up note,
- internal note,
- patient instruction.

---

## 7. Patient Timeline

The patient profile should include a timeline.

Timeline may show:

- appointments,
- visits,
- clinical notes,
- performed services,
- treatment plan changes,
- payments,
- documents,
- consent forms,
- important administrative events.

Timeline helps users understand the patient history quickly.

---

## 8. Odontogram Connection

A patient may have an odontogram.

The odontogram should connect to:

- tooth status,
- diagnosis,
- treatment plan item,
- performed service,
- clinical notes,
- visit.

The patient record should show the latest odontogram state and history where needed.

---

## 9. Treatment Plan Connection

A patient may have multiple treatment plans.

Examples:

- active treatment plan,
- completed treatment plan,
- archived plan,
- rejected plan,
- alternative plan.

The patient profile should clearly show:

- active plan,
- next planned item,
- completed items,
- remaining items,
- total estimated value,
- payment status if allowed.

---

## 10. Appointment and Visit Connection

A patient record should connect to:

- past appointments,
- upcoming appointments,
- cancelled appointments,
- no-shows,
- visits,
- performed services.

Important patient profile summary should show:

- next appointment,
- last visit,
- next recommended step,
- open treatment plan item.

---

## 11. Financial Connection

Financial information must be permission-controlled.

If user has permission, patient profile may show:

- total value of performed services,
- total paid,
- unpaid balance,
- active installment agreement,
- advance balance,
- last payment,
- payment notes.

If user does not have permission, financial information should be hidden or limited.

---

## 12. Documents and Files

Patient record may include files such as:

- consent forms,
- scanned documents,
- X-rays,
- photos,
- treatment plan PDFs,
- visit summaries,
- referrals,
- external reports.

Each document should include:

- document ID,
- patient ID,
- clinic ID,
- document type,
- file path/storage reference,
- uploaded by,
- upload date,
- visibility,
- related visit or treatment plan if applicable.

Files should not be public by default.

---

## 13. Print and Export

Patient record should support print/export.

Initial outputs:

- patient record summary,
- anamnesis summary,
- treatment plan,
- visit summary,
- financial overview if allowed,
- consent forms.

Legal requirements must be researched separately.

---

## 14. Audit Requirements

Important patient record actions should be auditable:

- patient created,
- patient profile updated,
- anamnesis updated,
- medical warning added/removed,
- clinical note added/edited,
- document uploaded/deleted,
- treatment plan changed,
- payment added/edited,
- patient archived.

Audit should record:

- user,
- action,
- entity,
- timestamp,
- old value where needed,
- new value where needed.

---

## 15. Privacy and Access Rules

Patient records contain sensitive health data.

Rules:

- only authorized users may access patient records,
- financial data should be restricted,
- commission data should not be shown inside patient record except to authorized users,
- assistants and reception should have limited views,
- specialists should see assigned patients only unless policy allows otherwise,
- all access should be considered for future RLS policies.

---

## 16. Initial Patient Record Summary Screen

The patient profile summary should probably show:

- patient name,
- age/date of birth,
- phone number,
- important warnings,
- next appointment,
- last visit,
- active treatment plan,
- next step,
- unpaid balance if allowed,
- quick actions.

Quick actions may include:

- add appointment,
- add visit,
- add note,
- create treatment plan,
- record payment,
- upload document.

---

## 17. Open Questions

- What exact data is required by Serbian dental record regulations?
- Which parts must be printable?
- Should anamnesis be structured, free-text, or both?
- Who is allowed to edit clinical notes after saving?
- Should old clinical notes be locked after a period?
- Should deleted records be soft-deleted only?
- Should patient consent be required before storing digital records?
- Should patient photos/X-rays be handled differently from other files?
