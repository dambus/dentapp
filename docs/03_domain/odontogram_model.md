# DentApp — Odontogram Model

## 1. Purpose

This document defines the initial odontogram model for DentApp.

The odontogram should help dental users record, review, and update the condition of teeth and related treatment plans.

This is a product/domain model, not yet a final database schema.

---

## 2. Goals

The odontogram should help users quickly understand:

- current tooth status,
- previous treatments,
- planned treatments,
- missing teeth,
- diagnoses by tooth or region,
- performed services by tooth,
- connection between clinical status and treatment plan.

---

## 3. Initial Numbering System

DentApp should initially support the FDI tooth numbering system.

Permanent teeth:

- Quadrant 1: upper right
- Quadrant 2: upper left
- Quadrant 3: lower left
- Quadrant 4: lower right

Primary teeth:

- Quadrant 5: upper right
- Quadrant 6: upper left
- Quadrant 7: lower left
- Quadrant 8: lower right

Examples:

- 11: upper right central incisor
- 21: upper left central incisor
- 36: lower left first molar
- 46: lower right first molar

---

## 4. Tooth Entity

Each tooth record should include:

- tooth ID,
- clinic ID,
- patient ID,
- tooth number,
- dentition type,
- current status,
- notes,
- created date,
- updated date.

Dentition type examples:

- permanent,
- primary,
- mixed.

---

## 5. Tooth Status

Initial tooth statuses:

- unknown,
- healthy,
- caries,
- filled,
- missing,
- extracted,
- planned extraction,
- root canal treated,
- crown,
- bridge abutment,
- implant,
- unerupted,
- impacted,
- fractured,
- mobility,
- periodontal issue,
- watch/monitor.

Statuses must be validated with the pilot practice.

---

## 6. Tooth Surfaces

DentApp may support tooth surfaces.

Initial surfaces:

- mesial,
- distal,
- occlusal,
- buccal,
- lingual,
- palatal,
- incisal.

Surface-level tracking may be optional in the first pilot if it makes the UI too complex.

---

## 7. Odontogram Entry

An odontogram entry represents a recorded condition, diagnosis, plan, or performed treatment connected to a tooth or region.

Fields may include:

- entry ID,
- clinic ID,
- patient ID,
- tooth number,
- surface if applicable,
- entry type,
- status,
- diagnosis,
- related treatment plan item,
- related performed service,
- related visit,
- notes,
- created by,
- created date,
- updated date.

Entry types:

- condition,
- diagnosis,
- planned treatment,
- performed treatment,
- note,
- warning.

---

## 8. Region-Based Entries

Not all dental work is tooth-specific.

The odontogram model should support regions:

- upper jaw,
- lower jaw,
- quadrant,
- full mouth,
- soft tissue,
- gingiva,
- periodontal region,
- implant region,
- prosthetic region.

This is important for:

- hygiene,
- prosthetics,
- surgery,
- periodontal treatment,
- orthodontic notes,
- full-mouth rehabilitation.

---

## 9. Treatment Plan Connection

Odontogram should connect to treatment plans.

A treatment plan item may reference:

- one tooth,
- multiple teeth,
- region,
- surface,
- no tooth/region if general service.

The odontogram UI should make it easy to see:

- planned treatments,
- accepted treatments,
- completed treatments,
- untreated problems.

---

## 10. Visit and Performed Service Connection

When a service is performed, the odontogram may be updated.

Example:

- treatment plan item for tooth 36 composite filling is completed,
- visit is recorded,
- performed service is created,
- odontogram status changes from caries to filled.

This should be possible in DentApp, but the first implementation may be manual or semi-automatic.

---

## 11. History

The odontogram should not only show current status.

It should also support history:

- previous status,
- status changes,
- performed treatments,
- date of change,
- doctor who changed it,
- related visit.

For MVP, the patient timeline and audit log may provide this history.

---

## 12. UI Requirements

Initial odontogram UI should support:

- visual or structured tooth overview,
- click/select tooth,
- view tooth status,
- add diagnosis or note,
- link to treatment plan item,
- show planned/completed treatments,
- show missing/extracted teeth clearly.

The first version may start simple and become more visual after pilot feedback.

---

## 13. MVP Simplification

To avoid overcomplication, the MVP may start with:

- FDI tooth list/grid,
- status per tooth,
- notes per tooth,
- link to treatment plan items,
- simple visual indicators.

Advanced graphical dental charting can be improved later.

---

## 14. Audit Requirements

Audit important odontogram actions:

- tooth status changed,
- diagnosis added,
- planned treatment added,
- performed treatment linked,
- tooth note edited,
- region note added.

---

## 15. Open Questions

- Should the first MVP include a graphical odontogram or structured tooth table?
- Which tooth statuses are required by the pilot doctors?
- Should surface-level tracking be included in MVP?
- Should odontogram changes be locked after visit completion?
- Should doctors be able to customize statuses?
- How should primary teeth and mixed dentition be handled?
- Should periodontal charting be a separate future module?
