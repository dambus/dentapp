# DentApp — Inventory Model

## 1. Purpose

This document defines the initial inventory and material request model for DentApp.

Inventory is a core operational pain point for many dental practices because several people may use, notice, request, or order materials.

This is a product/domain model, not yet a final database schema.

---

## 2. Core Problem

Common inventory issues:

- nobody knows exact stock level,
- several people share responsibility,
- materials run out unexpectedly,
- someone assumes someone else ordered material,
- expiry dates are missed,
- high-value materials are not tracked,
- urgent buying causes stress,
- ordering process is informal,
- stock corrections are not documented.

DentApp should make inventory more visible and accountable.

---

## 3. Inventory Item

An inventory item represents material, consumable, tool, or equipment.

Fields may include:

- item ID,
- clinic ID,
- name,
- category,
- description,
- unit of measure,
- supplier,
- manufacturer,
- current quantity,
- minimum quantity,
- target quantity,
- storage location,
- expiry date if applicable,
- batch/lot number if applicable,
- purchase price if tracked,
- active status,
- notes.

---

## 4. Inventory Categories

Initial categories may include:

- anesthetics,
- composites,
- bonding agents,
- endodontic materials,
- impression materials,
- prosthetic materials,
- surgical materials,
- implant components,
- disposable items,
- protective equipment,
- sterilization materials,
- hygiene materials,
- office supplies,
- equipment,
- other.

Categories should be configurable.

---

## 5. Unit of Measure

Examples:

- piece,
- box,
- pack,
- bottle,
- syringe,
- cartridge,
- gram,
- milliliter,
- set,
- kit.

Unit of measure should be configurable.

---

## 6. Stock Movement

A stock movement records a change in quantity.

Movement types:

- stock entry,
- consumption,
- correction,
- disposal,
- return,
- transfer,
- opening balance.

Fields may include:

- movement ID,
- clinic ID,
- item ID,
- movement type,
- quantity,
- previous quantity,
- new quantity,
- reason,
- created by,
- created date,
- related visit optional,
- related material request optional,
- notes.

---

## 7. Stock Entry

Stock entry is used when new material is received.

May include:

- item,
- quantity,
- supplier,
- purchase date,
- received date,
- received by,
- expiry date,
- batch/lot number,
- purchase price,
- invoice/reference if needed.

---

## 8. Consumption

Consumption is used when material is used.

MVP options:

- manual consumption entry,
- consumption linked to visit,
- consumption linked to performed service,
- suggested consumption by service later.

Initial recommendation:

Start with manual or semi-manual consumption.

---

## 9. Stock Correction

Stock correction is used when actual stock differs from recorded stock.

Correction should require:

- reason,
- user,
- timestamp,
- previous quantity,
- new quantity.

Important corrections should be visible in reports or audit log.

---

## 10. Minimum Stock

Each item may have a minimum stock value.

When quantity is below minimum:

- item appears in low stock report,
- material request may be suggested,
- inventory responsible person may be notified later.

---

## 11. Expiry Date

Some materials have expiry dates.

DentApp should support expiry tracking where relevant.

Future reports:

- expired materials,
- materials expiring soon,
- high-risk expired materials.

---

## 12. Batch / Lot Tracking

Batch/lot tracking may be important for traceability.

MVP may not need full batch-level inventory, but the model should allow it later.

Possible approach:

- simple batch/lot field on stock entry,
- advanced batch table later.

---

## 13. Material Request

Material request represents a need to buy, restock, or prepare material.

Fields may include:

- request ID,
- clinic ID,
- item ID,
- requested quantity,
- reason,
- priority,
- requested by,
- requested date,
- approved by,
- approved date,
- status,
- supplier suggestion,
- notes.

Statuses:

- draft,
- requested,
- approved,
- rejected,
- ordered,
- received,
- cancelled.

---

## 14. Request Priority

Initial priorities:

- low,
- normal,
- high,
- urgent.

Urgent requests should be visible on dashboard or inventory view.

---

## 15. Request Approval

Approval should be limited to authorized users.

Possible approvers:

- Owner/Admin,
- Inventory Responsible Person,
- authorized manager.

Approval actions should be auditable.

---

## 16. Supplier

A supplier record may include:

- supplier ID,
- clinic ID,
- name,
- contact person,
- phone,
- email,
- website,
- notes,
- active status.

Supplier model can be simple in MVP.

---

## 17. Inventory Reports

Initial reports:

- current stock,
- low stock,
- open material requests,
- recent stock movements,
- expired materials,
- materials expiring soon,
- stock corrections.

---

## 18. Access Control

Suggested access:

Owner/Admin:

- full access.

Inventory Responsible:

- full operational access.

Assistant:

- view relevant stock,
- create material request,
- optionally record consumption.

Doctor:

- create material request,
- view limited material status.

Reception/Admin:

- limited or no access.

Specialist:

- create request if needed.

---

## 19. Audit Requirements

Audit important inventory actions:

- item created,
- item edited,
- stock entry created,
- stock correction created,
- material consumed,
- request created,
- request approved,
- request rejected,
- request marked ordered,
- request marked received.

---

## 20. MVP Simplification

For MVP, start with:

- inventory item list,
- current quantity,
- minimum quantity,
- manual movements,
- low stock report,
- material requests,
- request approval.

Advanced automatic consumption and batch-level tracking can come later.

---

## 21. Open Questions

- Which materials must be tracked first?
- Should purchase prices be tracked in MVP?
- Should batch/lot be required for any materials?
- Should expiry dates be mandatory for certain categories?
- Who can correct stock?
- Who approves material requests?
- Should doctors see low stock?
- Should material usage be linked to performed services in MVP?
- How often is physical stock counted?
