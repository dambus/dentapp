# Task 80 - Patient Ledger Schema / RLS Foundation

## Schema Introduced

Task 80 adds the first patient ledger foundation:

- migration:
  `supabase/migrations/20260524210000_create_patient_ledger_foundation.sql`
- table: `patient_ledger_entries`
- focused RLS/data smoke:
  `supabase/snippets/testPatientLedgerRls.mjs`

No Visit Completion runtime code, posting service, payment flow, ledger UI, or
balance calculation was added.

## Ledger Model

The schema follows the Task 79 decision:

- `performed_services` remains the visit-linked source of finalized rendered
  services and charge snapshots;
- `patient_ledger_entries` is the future accounting movement table;
- balance will later be derived from posted ledger entries, not from an editable
  patient balance field.

### Amount Semantics

Ledger entries use:

- positive `amount`;
- explicit `direction`:
  - `debit` increases patient amount owed,
  - `credit` reduces patient amount owed;
- three-letter uppercase `currency`, defaulting to `RSD`;
- no currency conversion.

This avoids signed-amount ambiguity and makes future balance calculation
straightforward.

### Entry Types

The constrained `entry_type` set is:

- `charge`;
- `payment`;
- `discount`;
- `write_off`;
- `refund`;
- `adjustment`;
- `reversal`.

Initial direction constraints encode the intended accounting meaning:

- `charge` is debit;
- `payment`, `discount`, and `write_off` are credit;
- `refund` is debit;
- `adjustment` and `reversal` may be debit or credit because they depend on the
  entry being corrected.

Workflows for these entry types are deferred.

## Key Fields

`patient_ledger_entries` includes:

- `clinic_id`;
- `patient_id`;
- `entry_type`;
- `direction`;
- `amount`;
- `currency`;
- `description_snapshot`;
- `performed_service_id`;
- `visit_id`;
- `appointment_id`;
- `reverses_entry_id`;
- `status`;
- `source_type`;
- `source_id`;
- `metadata`;
- `posted_at`;
- `recorded_by`;
- `created_by`;
- `created_at`.

The table intentionally has no mutable patient-balance field.

## Performed Services Separation

`performed_services` was not repurposed into a ledger.

The new ledger table may reference finalized performed services for future
service-charge posting, but it does not mutate performed-service history.
Finalized performed services continue to preserve service, price, provider,
visit, and patient snapshots for rendered work.

## Charge Linkage And Duplicate Prevention

For service-charge entries:

- `entry_type = 'charge'` requires `performed_service_id`;
- `performed_service_id` is only allowed for `charge` entries;
- the referenced performed service must:
  - belong to the same clinic and patient,
  - have `status = 'finalized'`,
  - not be soft-deleted,
  - match the ledger `visit_id`;
- charge amount and currency must match the finalized performed-service
  `final_amount` and `currency`.

Duplicate charge posting is prevented by:

```sql
patient_ledger_entries_one_posted_charge_per_service_idx
```

This unique partial index allows only one posted charge entry per finalized
performed service. Reversal/adjustment entries use `reverses_entry_id` instead
of reusing `performed_service_id`, so the foundation is ready for Task 81
idempotent posting.

## Integrity Validation

The migration adds `enforce_patient_ledger_entry_context()`.

It validates:

- patient exists and belongs to the ledger clinic;
- visit, when supplied, belongs to the same clinic and patient;
- appointment, when supplied, belongs to the same clinic and patient;
- performed-service linkage is finalized and context-consistent;
- reversal references belong to the same clinic and patient;
- `recorded_by` and `created_by`, when supplied, are active same-clinic
  profiles.

Provider credit remains separate: `performed_services.credited_provider_id`
does not mean the same thing as ledger `recorded_by`.

## RLS Boundary

RLS is enabled on `patient_ledger_entries`.

Read access:

- allowed for same-clinic `owner_admin`, `doctor`, `specialist`, and
  `reception_admin`;
- blocked for `assistant`;
- blocked for `inventory_responsible`;
- always scoped to the current active profile's clinic.

Mutation access:

- no authenticated role receives direct insert, update, or delete table policy;
- no ordinary client can directly create, mutate, or delete historical ledger
  entries;
- Task 81 should add a controlled posting service/RPC or equivalent pathway for
  service-charge posting.

This intentionally mirrors the conservative financial boundary chosen in Task
79 and does not broaden performed-services RLS.

## Test Coverage

`testPatientLedgerRls.mjs` verifies:

- schema readability through service role;
- valid same-clinic ledger charge fixture creation through controlled setup;
- cross-clinic patient mismatch rejection;
- draft/open performed-service charge rejection;
- finalized same-clinic/same-patient performed-service charge acceptance;
- performed-service patient/clinic mismatch rejection;
- inconsistent visit/performed-service linkage rejection;
- duplicate posted charge rejection;
- reversal reference patient/clinic mismatch rejection;
- role read visibility for owner, doctor, specialist, reception, assistant, and
  inventory;
- ordinary authenticated direct insert/update/delete attempts do not mutate
  ledger history.

## Deferred Work

Still unimplemented:

- posting service/RPC from finalized performed services;
- Visit Completion ledger posting wiring;
- ledger retry/reconciliation UI;
- patient account or balance summary UI;
- completed visit financial display;
- payment recording;
- refunds, discounts, write-offs, and reversal workflows;
- invoices and receipts;
- commissions;
- materials/inventory accounting;
- treatment-plan conversion.

## Next Step

Recommended next task:

Task 81 - Patient Ledger Service Layer / Idempotent Charge Posting from
Finalized Performed Services.
