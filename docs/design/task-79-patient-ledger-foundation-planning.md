# Task 79 - Patient Ledger Foundation Planning

## Current State After Task 78

DentApp now has a clinical Visit Completion flow and a performed-services /
charges foundation, but it does not yet have patient accounting.

Implemented boundaries:

- clinical visits persist through `visits` and `visit_procedures`;
- `visit_procedures` remains clinical-only;
- `service_categories`, `services`, and `performed_services` exist;
- `performed_services` is the current chargeable source of truth for work
  actually performed;
- performed services snapshot service name, service code, category, quantity,
  unit price, discount amount, final amount, currency, credited provider,
  patient, visit, optional appointment, optional treatment-plan item, and
  optional visit procedure;
- finalized performed-service rows require a completed visit and are protected
  from silent mutation by the database trigger;
- Visit Completion saves draft performed services before completion, then Task
  78 finalizes them after clinical completion succeeds;
- clinical completion remains valid even if performed-service finalization
  needs retry.

Not implemented:

- patient ledger entries;
- patient financial accounts;
- payments;
- payment allocation;
- invoices, receipts, or fiscalization;
- refunds, write-offs, financial adjustments, or reversals;
- patient balance calculation;
- commission calculation or payout;
- material/inventory valuation;
- treatment-plan mutation or automatic conversion to charges.

Task 78 finalizes performed services only. It does not post accounting ledger
charges.

## Repository And Schema Audit Findings

The repository was searched for ledger, payment, receipt, invoice, balance,
refund, adjustment, write-off, and commission structures across migrations,
runtime code, tests, and docs.

Findings:

- No Supabase migration currently creates patient ledger, payment, invoice,
  receipt, refund, write-off, or balance tables.
- Existing migrations include patients, clinical notes, audit logs,
  odontogram/tooth statuses, treatment plans, Visit Completion, appointments,
  appointment provider/operational state, and service catalog/performed
  services.
- `20260524190000_create_service_catalog_and_performed_services.sql` explicitly
  documents that performed services are separate from ledger entries and
  commission calculations.
- `performed_services` RLS allows performed-service reads for
  `owner_admin`, `doctor`, `specialist`, and `reception_admin`, while
  `assistant` and `inventory_responsible` do not read financial performed-service
  rows.
- Performed-service writes are limited to `owner_admin`, `doctor`, and
  `specialist` for draft/finalization workflow.
- Treatment plans remain planning records. `treatment_plan_items.estimated_price`
  is not a charge and does not affect balance.
- Appointments contain scheduling and workflow state, including assigned
  provider and operational state. They are not financial records.

The current financial boundary is therefore: finalized `performed_services`
represent rendered chargeable work, but no accounting ledger has been posted.

## Options Compared

### Option A - Treat `performed_services` Directly As Ledger Charge Rows

In this model, finalized performed services are queried directly as patient
charges. Payments and adjustments would live in separate tables, and balance
would be calculated by combining performed-service totals with those payment /
adjustment tables.

Benefits:

- smallest initial schema;
- simple charge display for completed visits;
- no extra charge-posting step;
- easy to trace a charge back to the clinical visit and service row.

Weaknesses:

- mixes clinical charge source with accounting events;
- corrections after finalization become awkward because the original service row
  should remain immutable;
- partial refunds, write-offs, payment reversals, and later invoice grouping
  need a second accounting model anyway;
- balance calculation would combine unlike sources: performed-service rows for
  debits and separate tables for credits/adjustments;
- reporting has to infer accounting state from clinical rows plus payment rows;
- duplicate or missed invoice/receipt grouping becomes harder to reason about;
- ledger audit history is less explicit because a performed service is not
  itself a financial posting event.

Option A is acceptable for a very small cash-only prototype, but it is too weak
for DentApp's planned debt, partial payment, refund, invoice, and commission
needs.

### Option B - Dedicated Ledger Transactions Derived From Finalized Services

In this model, finalized `performed_services` remain the clinical charge source.
A separate patient ledger records financial movements. Charge ledger entries
reference finalized performed services; payment, refund, discount, write-off,
adjustment, and reversal entries use the same ledger model or tightly related
payment records.

Benefits:

- separates "what was performed" from "what was posted financially";
- supports append-only accounting history;
- gives balance a single source: ledger movements;
- allows idempotent charge posting from performed services;
- supports retry/reconciliation when ledger posting fails after clinical
  completion;
- supports future invoice/receipt grouping without mutating clinical rows;
- makes refunds, payment reversals, write-offs, and corrections explicit;
- preserves performed-service snapshots while allowing financial adjustments to
  be auditable ledger events;
- gives reporting a clean debit/credit event stream.

Weaknesses:

- requires more schema and service code;
- requires idempotent posting logic to prevent duplicate charges;
- creates a new temporary state: finalized services may exist before ledger
  charges are posted;
- requires careful RLS because ledger visibility may be narrower than clinical
  visibility.

Option B is the recommended direction.

### Option C - Invoice-Centric Accounting First

A possible alternative is to make invoices the primary financial source and let
payments allocate against invoices.

This is not recommended as the first foundation. DentApp needs patient account
balance, partial payments, debt, adjustments, and future invoice/receipt output,
but invoice generation and fiscalization rules are product- and jurisdiction-
dependent. Starting with an immutable patient ledger keeps invoice grouping as a
future view/workflow rather than forcing invoice semantics into every charge
from day one.

## Chosen Model

Use a dedicated patient-ledger layer.

The target direction is:

- `performed_services` remains the finalized, visit-linked record of chargeable
  work actually performed;
- patient ledger entries become the accounting source of truth for financial
  movements;
- charge ledger entries reference finalized performed services;
- payments, refunds, discounts, write-offs, corrections, and reversals are
  represented as ledger/payment events, not by mutating finalized
  performed-service rows;
- patient balance is derived from posted ledger entries;
- duplicate charge creation is prevented by unique linkage and idempotent
  posting rules.

This separation fits DentApp because clinical completion must remain valid even
when downstream financial posting or payment collection needs retry. It also
protects the integrity of service snapshots used later for reporting,
commission basis, completed-visit review, and audit.

## Future Schema Recommendation

### Patient Financial Account Identity

Do not add `patient_accounts` in the first ledger MVP unless the implementation
needs account-level status metadata immediately.

Recommended MVP:

- ledger entries are scoped directly by `clinic_id` and `patient_id`;
- the implicit account is one clinic + one patient;
- patient balance is derived by summing patient-scoped entries.

Deferred account complexity:

- family/shared payer accounts;
- multiple patient accounts in one clinic;
- external insurer or corporate payer accounts;
- account-level credit limits or collections status.

If those requirements become real, `patient_accounts` can be introduced later
and existing patient-scoped ledger entries can migrate to account references.

### Ledger Entries

Recommended table concept: `patient_ledger_entries`.

Conceptual fields:

- `id`;
- `clinic_id`;
- `patient_id`;
- `entry_type`: `charge`, `payment`, `discount`, `write_off`, `refund`,
  `adjustment`, `reversal`;
- `direction`: `debit` or `credit`, or an equivalent signed amount convention;
- `amount`;
- `currency`;
- `performed_service_id`, nullable except for service-derived charges;
- `visit_id`, nullable but populated for service-derived charges;
- `appointment_id`, nullable context only;
- `payment_id`, nullable if payments use a separate parent table;
- `reverses_entry_id`, nullable reference to the entry being reversed;
- `correction_of_entry_id`, nullable if correction semantics differ from a
  full reversal;
- `status`: likely `posted`, `voided`, or `reversed`; avoid editable draft
  accounting entries in the first slice unless product need is clear;
- `description_snapshot`;
- `source_type`: for example `performed_service`, `manual_payment`,
  `manual_adjustment`, `system_reversal`;
- `source_id` or specific nullable FKs where useful;
- `posted_at`;
- `recorded_by` / `created_by` / `updated_by`;
- `created_at`, `updated_at`;
- optional metadata JSON for external references, import IDs, terminal
  references, or future invoice grouping.

Rules:

- ledger entries should be append-only after posting;
- destructive deletes should not be exposed to authenticated application roles;
- financial corrections should create reversal/adjustment entries;
- same-clinic and same-patient context must be enforced by constraints/triggers.

### Payments

Recommended future table concept: `patient_payments`.

Payments should be parent records for real-world receipt of money. A payment may
create one or more credit ledger entries, and later allocation can link credits
to charges if needed.

Minimal conceptual fields:

- `id`;
- `clinic_id`;
- `patient_id`;
- `amount`;
- `currency`;
- `payment_method`: cash, card, bank transfer, other;
- `paid_at`;
- `recorded_by`;
- `reference`;
- `note`;
- `status`: `posted`, `reversed`, maybe `voided`;
- `reversal_of_payment_id`, nullable;
- timestamps and audit profile references.

Partial payments are normal: a posted payment credit simply reduces patient
balance. Overpayments become account credit. Deleting a payment should not be
the correction path; use reversal entries/payments.

### Optional Allocations

Payment allocation should be deferred from the first ledger schema unless
required for receipts or commission rules.

Future table concept: `patient_payment_allocations`.

Conceptual fields:

- `payment_id`;
- `ledger_entry_id` for the payment credit;
- `charge_ledger_entry_id`;
- `amount`;
- timestamps and recorded-by profile.

The ledger can calculate patient balance without allocations. Allocations are
needed later for "which service was paid", receipt detail, invoice settlement,
and collection-based commission.

## Charges From Performed Services

Only finalized performed services should be posted as ledger charges.

Recommended posting behavior:

- Task 78 remains unchanged: it finalizes performed services only.
- A future service/RPC should post ledger charges from finalized performed
  services.
- Posting may eventually be called immediately after successful performed
  service finalization, but it should be a separate idempotent operation.
- Zero-service visits create no charge ledger entries.
- A unique constraint or equivalent idempotency rule should allow at most one
  active `charge` ledger entry per `performed_service_id`.
- If ledger posting fails after clinical completion and performed-service
  finalization, the completed visit remains completed and the finalized service
  remains finalized.
- The UI should later show a retry/reconciliation state such as "charges not
  posted to ledger" without implying the clinical visit is incomplete.

Suggested idempotency rule:

- unique active charge entry on `(clinic_id, performed_service_id)` where
  `entry_type = 'charge'` and status is not reversed/voided;
- posting service loads finalized performed services, inserts missing charge
  entries, and returns posted/already-posted/pending/error counts.

## Adjustments And Reversals

The future ledger should be append-only or reversal-based.

Recommended semantics:

- discount: either already included in `performed_services.discount_amount`
  before finalization, or posted later as a separate credit ledger adjustment if
  granted after posting;
- write-off: credit entry reducing patient balance, with reason and recorded-by;
- refund: debit entry or negative payment/reversal model that increases patient
  balance or records money returned, linked to the original payment when
  possible;
- charge correction: reverse the original charge entry and post a new corrected
  charge entry, usually tied to a corrected/voided performed-service workflow;
- payment reversal: reverse the payment credit rather than editing/deleting the
  original payment;
- void/cancelled financial action: mark the original event reversed/voided only
  through a controlled reversal record.

Historical financial rows should not be edited to make the balance "look
right". The correction history is part of the accounting record.

## Balance

Patient balance should be calculated from posted ledger entries.

Recommended convention:

- debit entries increase amount owed;
- credit entries reduce amount owed;
- balance is sum(debits) - sum(credits), or a signed equivalent.

Do not introduce an editable `patients.balance` field as the source of truth.

Later optimization may add cached summaries, materialized views, or denormalized
account summary rows. Those must be derived from ledger entries and rebuildable,
not hand-edited authoritative balances.

## Relationship To Existing Domains

### Performed Services

`performed_services` records service, amount, provider, and visit snapshots for
work actually completed. It must not become a generic payment/accounting table.

It is the source for charge posting, not the complete ledger.

### Completed Visits

Clinical completion remains valid independently of downstream ledger posting. A
future ledger posting failure must not roll back or invalidate a completed
visit.

### Treatment Plans

Treatment plans remain prospective/read-only in the current product. Planned
items and estimated prices are not charges. A planned item becomes financially
relevant only when work is actually performed, finalized as a performed service,
and later posted to ledger.

Treatment-plan conversion workflows remain deferred.

### Provider And Commissions

`performed_services.credited_provider_id` is a useful future commission basis,
but patient ledger is not the commission ledger.

Commission accounting should be separate and may reference performed services,
ledger charge entries, and/or payment allocation depending on clinic rules.

### Materials And Inventory

Materials consumption and inventory valuation remain separate from patient
charges. Inventory movements should not be inferred from patient ledger rows.

### Appointments

Appointments remain scheduling and workflow records. Appointment status,
operational state, and assigned provider are not financial source-of-truth
fields.

## Role And RLS Principles

Future ledger RLS should be conservative.

Principles:

- all ledger/payment rows must be same-clinic scoped;
- `owner_admin` should be able to read financial history and record/reverse
  financial actions;
- `reception_admin` likely needs read and payment-entry permissions, but this
  should be explicit in the ledger task because reception currently cannot
  mutate performed services;
- `doctor` and `specialist` may need limited read visibility for completed
  service charges or payment status, but full ledger/payment mutation should not
  be granted by default;
- `assistant` should remain conservative: no patient financial ledger access or
  payment mutation unless a later product decision authorizes assistant payment
  workflows;
- `inventory_responsible` should remain excluded from patient financial data;
- posted ledger rows should resist direct destructive edits;
- reversal/adjustment flows should go through controlled service/RPC paths with
  audit metadata;
- RLS must not be relaxed on performed services to make ledger UI easier.

Future RLS tests should verify same-clinic isolation, role-specific read/write
permissions, idempotent posting, blocked duplicate charge entries, blocked
direct destructive edits, and reversal-only corrections.

## Future UI Implications

Likely future surfaces:

- Patient Overview compact account summary: balance, unapplied credit, and
  latest financial activity for authorized roles;
- dedicated Patient Account / Ledger section with entries, filters, and
  balance;
- Completed Visit Detail read-only finalized services/charges display;
- ledger posting visibility for finalized services not yet posted;
- payment-entry workflow;
- payment reversal workflow;
- receipt/invoice workflow;
- unpaid/open balance indicators in patient and schedule contexts;
- reconciliation/retry state when finalized services have not posted to ledger.

Recommended first UI after schema/service foundation:

1. read-only completed visit services/charges display or ledger posting status;
2. patient account read-only ledger/balance summary;
3. payment entry after charge posting and ledger reads are stable.

Payment entry should not come before the ledger schema and idempotent charge
posting foundation.

## Recommended Implementation Sequence

Task 80 - Patient Ledger Schema/RLS Foundation

- Add `patient_ledger_entries`.
- Consider deferring `patient_accounts`.
- Add conservative RLS and constraints.
- Add unique/idempotent linkage for performed-service charge entries.
- Add focused RLS/data smoke coverage.
- No UI and no payments yet.

Task 81 - Patient Ledger Service Layer / Idempotent Charge Posting

- Add typed ledger read helpers.
- Add idempotent posting from finalized performed services.
- Return posted/already-posted/pending/error state.
- Do not collect payments.

Task 82 - Completed Visit Financial Read-only Display / Posting Visibility

- Show finalized performed services and ledger posting status on completed visit
  detail for authorized roles.
- Do not add payment entry.

Task 83 - Patient Account Read-only Ledger / Balance Summary

- Add patient account section and overview summary for authorized roles.
- Balance is derived from posted ledger entries.

Task 84 - Payment Recording Foundation

- Add payment parent records and payment credit ledger entries.
- Support partial payments and overpayments.
- Use reversal rather than destructive deletion.

Later tasks:

- payment allocation;
- receipts and invoices/fiscalization;
- discounts/write-offs/refunds UI;
- charge correction workflows;
- commission foundation;
- materials/inventory consumption;
- treatment-plan conversion.

## Explicitly Deferred Scope

Task 79 is documentation-only.

Deferred:

- migrations;
- RLS policy changes;
- runtime service code;
- React UI;
- browser smoke tests;
- RLS/data tests;
- payment entry;
- balance calculation implementation;
- invoices or receipts;
- refunds/write-offs/adjustments;
- commissions;
- materials/inventory;
- treatment-plan mutation;
- appointment lifecycle changes.
