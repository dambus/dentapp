# DentApp — Database Schema v1

## 1. Purpose

This document defines the initial database schema direction for DentApp.

This is not yet the final SQL migration.

The goal is to define core tables, relationships, and design principles before implementation.

---

## 2. Database Principles

Use PostgreSQL through Supabase.

General rules:

- use UUID primary keys,
- include clinic_id on core business tables,
- include created_at and updated_at,
- use deleted_at where soft delete is needed,
- avoid hard deletes for sensitive records,
- use clear table names,
- keep clinical, financial, inventory, and configuration concepts structured,
- support audit logging,
- design for future SaaS multi-tenancy.

---

## 3. Core Table Groups

Initial core table groups:

1. Clinics and users
2. Staff and roles
3. Patients and records
4. Odontogram
5. Treatment plans
6. Appointments and visits
7. Services and price list
8. Payments and ledger
9. Doctor commissions
10. Inventory and material requests
11. Documents and files
12. Audit logs

---

## 4. Clinics

### clinics

Represents a dental practice.

Possible fields:

- id
- name
- legal_name
- tax_id
- address
- phone
- email
- website
- country
- city
- timezone
- status
- created_at
- updated_at

Notes:

The pilot will use one clinic, but the schema should support more.

---

## 5. Users and Profiles

### profiles

Application profile connected to Supabase Auth user.

Possible fields:

- id
- auth_user_id
- clinic_id
- staff_member_id
- full_name
- email
- phone
- role
- status
- created_at
- updated_at

Notes:

Supabase Auth manages authentication.

The application profile manages business identity and role.

---

## 6. Staff

### staff_members

Represents people working in the practice.

Possible fields:

- id
- clinic_id
- first_name
- last_name
- display_name
- email
- phone
- staff_type
- role
- is_doctor
- is_specialist
- active
- notes
- created_at
- updated_at
- deleted_at

staff_type examples:

- owner
- doctor
- specialist
- assistant
- reception
- inventory
- admin

---

## 7. Patients

### patients

Represents patient profile.

Possible fields:

- id
- clinic_id
- first_name
- last_name
- date_of_birth
- gender
- phone
- email
- address
- emergency_contact_name
- emergency_contact_phone
- preferred_contact_method
- status
- important_note
- created_at
- updated_at
- deleted_at

Status examples:

- active
- inactive
- archived
- blocked

---

## 8. Patient Medical Records

### patient_medical_records

Stores structured medical and dental information.

Possible fields:

- id
- clinic_id
- patient_id
- anamnesis_summary
- allergies
- current_medications
- medical_warnings
- dental_history
- risk_notes
- created_at
- updated_at

Notes:

For MVP, JSONB fields may be useful for flexible anamnesis sections.

Later, some fields may be normalized if needed.

---

## 9. Clinical Notes

### clinical_notes

Stores clinical notes.

Possible fields:

- id
- clinic_id
- patient_id
- visit_id
- treatment_plan_id
- treatment_plan_item_id
- tooth_number
- note_type
- content
- created_by
- created_at
- updated_at
- deleted_at

Note type examples:

- examination
- diagnosis
- treatment
- complication
- follow_up
- internal
- patient_instruction

---

## 10. Odontogram

### odontogram_entries

Stores tooth or region status, diagnosis, planned treatment, and performed treatment information.

Possible fields:

- id
- clinic_id
- patient_id
- tooth_number
- region
- surface
- entry_type
- tooth_status
- diagnosis
- related_treatment_plan_item_id
- related_performed_service_id
- related_visit_id
- notes
- created_by
- created_at
- updated_at
- deleted_at

Entry type examples:

- condition
- diagnosis
- planned_treatment
- performed_treatment
- note
- warning

### patient_tooth_statuses (MVP foundation)

The first implemented odontogram table is intentionally simpler than the
future `odontogram_entries` direction.

Fields:

- id,
- clinic_id,
- patient_id,
- tooth_number,
- status,
- note,
- created_by,
- updated_by,
- created_at,
- updated_at,
- deleted_at.

MVP constraints:

- FDI permanent teeth only,
- one active row per patient/tooth,
- status limited to the initial MVP status list,
- clear uses `deleted_at`,
- hard delete is not exposed through application policies.

Future work may replace or extend this with richer odontogram entries for
surfaces, procedures, diagnosis, treatment plan links, performed services, and
history views.

---

## 11. Treatment Plans

### treatment_plans

Possible fields:

- id
- clinic_id
- patient_id
- title
- description
- status
- responsible_doctor_id
- created_by
- proposed_at
- accepted_at
- completed_at
- archived_at
- created_at
- updated_at
- deleted_at

Status examples:

- draft
- proposed
- accepted
- partially_accepted
- in_progress
- completed
- paused
- rejected
- archived

### treatment_plan_items

Possible fields:

- id
- clinic_id
- treatment_plan_id
- patient_id
- tooth_number
- region
- diagnosis
- service_id
- service_name_snapshot
- responsible_doctor_id
- estimated_price
- estimated_duration_minutes
- priority
- status
- planned_date
- completed_at
- notes
- created_at
- updated_at
- deleted_at

Notes:

service_name_snapshot is useful because service names can change later.

Item status examples:

- proposed
- accepted
- rejected
- deferred
- planned
- scheduled
- in_progress
- completed
- cancelled
- archived

---

## 12. Services and Price List

### service_categories

Possible fields:

- id
- clinic_id
- name
- description
- active
- created_at
- updated_at

### services

Possible fields:

- id
- clinic_id
- category_id
- name
- description
- default_price
- default_duration_minutes
- active
- created_at
- updated_at
- deleted_at

Notes:

Services must be configurable per clinic.

---

## 13. Appointments

### appointments

Possible fields:

- id
- clinic_id
- patient_id
- doctor_id
- chair_or_room
- appointment_type
- status
- start_time
- end_time
- treatment_plan_id
- treatment_plan_item_id
- notes
- created_by
- created_at
- updated_at
- deleted_at

Status examples:

- scheduled
- confirmed
- arrived
- completed
- cancelled
- no_show
- rescheduled

---

## 14. Visits and Performed Services

### visits

Possible fields:

- id
- clinic_id
- patient_id
- appointment_id
- doctor_id
- assistant_id
- visit_date
- status
- clinical_summary
- next_step
- created_by
- created_at
- updated_at
- deleted_at

### performed_services

Possible fields:

- id
- clinic_id
- patient_id
- visit_id
- doctor_id
- service_id
- treatment_plan_item_id
- service_name_snapshot
- price
- discount_amount
- final_price
- status
- notes
- performed_at
- created_at
- updated_at
- deleted_at

Status examples:

- planned
- in_progress
- completed
- cancelled

Notes:

performed_services connects clinical workflow, patient ledger, and doctor commission.

---

## 15. Payments and Ledger

### patient_ledger_entries

Possible fields:

- id
- clinic_id
- patient_id
- entry_type
- amount
- direction
- description
- related_performed_service_id
- related_payment_id
- created_by
- created_at
- updated_at

entry_type examples:

- charge
- payment
- advance
- discount
- correction
- refund
- write_off

direction examples:

- debit
- credit

### payments

Possible fields:

- id
- clinic_id
- patient_id
- amount
- payment_method
- payment_date
- received_by
- note
- created_at
- updated_at
- deleted_at

### payment_allocations

Possible fields:

- id
- clinic_id
- payment_id
- ledger_entry_id
- amount
- created_at

Notes:

Payment allocation may be simplified in early MVP.

---

## 16. Doctor Commissions

### doctor_commission_rules

Possible fields:

- id
- clinic_id
- doctor_id
- service_id
- service_category_id
- percentage
- fixed_amount
- basis
- priority
- active
- applies_from
- applies_to
- notes
- created_at
- updated_at
- deleted_at

basis examples:

- performed_amount
- collected_amount
- collected_after_discount
- after_lab_cost

### doctor_commission_entries

Possible fields:

- id
- clinic_id
- doctor_id
- patient_id
- visit_id
- performed_service_id
- payment_id
- base_amount
- percentage
- calculated_amount
- status
- calculation_date
- approved_by
- paid_at
- notes
- created_at
- updated_at

Status examples:

- pending
- calculated
- approved
- paid
- cancelled
- adjusted

### doctor_payouts

Possible fields:

- id
- clinic_id
- doctor_id
- period_start
- period_end
- amount
- payout_date
- paid_by
- notes
- created_at
- updated_at

---

## 17. Inventory

### inventory_categories

Possible fields:

- id
- clinic_id
- name
- description
- active
- created_at
- updated_at

### suppliers

Possible fields:

- id
- clinic_id
- name
- contact_person
- phone
- email
- website
- notes
- active
- created_at
- updated_at

### inventory_items

Possible fields:

- id
- clinic_id
- category_id
- supplier_id
- name
- description
- unit_of_measure
- current_quantity
- minimum_quantity
- target_quantity
- storage_location
- expiry_date
- batch_lot
- purchase_price
- active
- notes
- created_at
- updated_at
- deleted_at

### inventory_movements

Possible fields:

- id
- clinic_id
- item_id
- movement_type
- quantity
- previous_quantity
- new_quantity
- reason
- related_visit_id
- related_material_request_id
- created_by
- created_at

movement_type examples:

- entry
- consumption
- correction
- disposal
- return
- opening_balance

---

## 18. Material Requests

### material_requests

Possible fields:

- id
- clinic_id
- item_id
- requested_quantity
- reason
- priority
- status
- requested_by
- requested_at
- approved_by
- approved_at
- supplier_id
- notes
- created_at
- updated_at
- deleted_at

Status examples:

- draft
- requested
- approved
- rejected
- ordered
- received
- cancelled

Priority examples:

- low
- normal
- high
- urgent

---

## 19. Documents

### documents

Possible fields:

- id
- clinic_id
- patient_id
- related_visit_id
- related_treatment_plan_id
- document_type
- title
- storage_bucket
- storage_path
- file_name
- mime_type
- file_size
- uploaded_by
- visibility
- created_at
- updated_at
- deleted_at

document_type examples:

- consent_form
- xray
- photo
- treatment_plan_pdf
- patient_record_summary
- visit_summary
- external_report

visibility examples:

- clinical
- administrative
- financial
- owner_only
- inventory
- template

---

## 20. Audit Logs

### audit_logs

Possible fields:

- id
- clinic_id
- actor_user_id
- actor_profile_id
- action
- entity_type
- entity_id
- old_values
- new_values
- metadata
- ip_address
- user_agent
- created_at

Notes:

old_values and new_values may use JSONB.

Audit log should not be casually editable from the application UI.

---

## 21. Important Relationships

Important relationships:

- clinic has many users, staff, patients, services, inventory items.
- patient has one or many medical record sections.
- patient has many appointments.
- patient has many visits.
- patient has many treatment plans.
- treatment plan has many treatment plan items.
- treatment plan item may link to service.
- visit has many performed services.
- performed service may link to treatment plan item.
- performed service may create ledger charge.
- payment may be allocated to ledger entries.
- performed service may create commission entry.
- inventory movement may link to visit or request.
- document may link to patient, visit, or treatment plan.

---

## 22. Schema Design Questions Before Migration

Open questions before SQL migration:

- Which fields should be JSONB vs normalized?
- Which entities require soft delete?
- How strict should treatment plan versioning be?
- Should clinical notes be editable after creation?
- Should payment edits create corrections instead of updates?
- Should inventory current_quantity be stored or calculated from movements?
- Should commission entries be generated immediately or calculated on report?
- How should payment allocations work in MVP?
- Should doctors see all patients or only assigned/relevant patients?
- How detailed should RLS be in the first version?
