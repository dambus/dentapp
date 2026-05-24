# Task 84 - Patient Account Read-only Ledger / Balance Summary Planning

## Summary

Task 84 is a docs-only planning decision for patient-level financial visibility
after the completed-visit financial display added in Task 83.

Decision:

- do not show a patient `Balance`, `Amount due`, `Outstanding`, payment status,
  invoice state, or receipt state yet;
- the next implementation slice should add a restrained patient-level
  `Posted charges` read-only section inside the existing patient Full Record
  area;
- the section should show posted service-charge ledger activity recorded in
  DentApp, grouped by completed visit where useful;
- any total shown must be labeled as posted charges recorded in DentApp, grouped
  by currency, and not presented as a patient balance;
- payment recording, credits, discounts, write-offs, refunds, reversals,
  invoices, receipts, and account balance UI remain deferred.

## Current Financial Boundary After Task 83

The current product has three distinct financial-adjacent records:

- `performed_services`: rendered-work and service/price/provider snapshots for a
  visit;
- `patient_ledger_entries`: append-oriented financial movement foundation;
- completed visit detail financial summary: a read-only visit-scoped display of
  finalized services and posted charge status.

`patient_ledger_entries` supports the following entry types in schema:

- `charge`;
- `payment`;
- `discount`;
- `write_off`;
- `refund`;
- `adjustment`;
- `reversal`.

The implemented runtime flow currently creates only posted `charge` debit
entries in normal application behavior. Those charges are created by the Task 81
controlled posting RPC from finalized performed services, and Task 82 wires that
posting into Visit Completion after clinical completion and performed-service
finalization. The charge entries reference:

- the same clinic and patient;
- the completed visit;
- the finalized performed service;
- the posted amount and currency derived from the performed-service snapshot.

No runtime workflow currently records:

- payments;
- discounts;
- write-offs;
- refunds;
- reversals;
- adjustments;
- payment allocation;
- invoice or receipt state;
- patient-wide account balance.

The schema can represent future credits and corrections, but that is not the
same as implemented payment or account behavior.

## Repository Audit Findings

Task 80 established `patient_ledger_entries` with positive `amount` and explicit
`direction` semantics:

- `debit` increases the amount owed;
- `credit` reduces the amount owed.

Task 81 added:

- `get_patient_ledger_charge_posting_state_for_visit(...)`;
- `post_finalized_performed_services_to_patient_ledger(...)`;
- frontend wrappers in `src/features/patient-ledger/patientLedgerService.ts`.

Task 83 added:

- `getCompletedVisitFinancialSummary(patientId, visitId)`;
- a completed visit detail `Services & charges` section;
- direct RLS-protected reads for visit-scoped posted `charge` rows.

Current read access for ledger financial rows is:

- `owner_admin`;
- `doctor`;
- `specialist`;
- `reception_admin`.

`assistant` and `inventory_responsible` are blocked from ledger financial rows.
No authenticated direct insert, update, or delete policy exists for
`patient_ledger_entries`.

The patient detail experience currently has:

- an overview/snapshot area;
- patient today, latest clinical activity, follow-up, treatment plan, and
  appointment summary cards;
- a role-aware Quick Actions card;
- a tabbed Full Record area with sections for medical record, odontogram,
  treatment plans, clinical notes, documents, and timeline.

The overview and Full Record still contain demo-era financial placeholders such
as a `Financial placeholder` metric and `Treatment and balance` card. Those are
not backed by the ledger and should not be upgraded into real account/balance UI
without a deliberate patient-account implementation.

No current patient overview or Full Record section provides a real patient-wide
ledger, payment, invoice, receipt, or balance experience.

## Balance-before-payments Options

### Option A - Show Posted Charges and Derived Balance Now

This option would add a Patient Account section immediately and calculate a
patient balance from posted ledger entries.

Benefits:

- uses the ledger direction model designed in Task 80;
- gives a single patient-level number;
- creates an early foundation for later account UI.

Weaknesses:

- only charge posting exists today, so the number would usually mean "posted
  charges recorded in DentApp", not a trustworthy real-world balance;
- off-system payments cannot be represented;
- users may interpret the figure as actual amount owed;
- it creates expectations for payment collection, receipt, invoice, paid/unpaid
  status, refunds, and corrections that do not exist;
- clinical users could make decisions from incomplete financial information.

This is not recommended now.

### Option B - Show Read-only Posted Charges, Not Balance

This option adds a patient-level read-only section for posted charge activity.
It avoids balance language and clearly labels any total as recorded posted
charges.

Benefits:

- accurately reflects what DentApp currently records;
- extends Task 83 from visit-level visibility to patient-level visibility;
- avoids implying payment/account completeness;
- keeps the ledger source of truth visible without introducing mutation;
- remains compatible with future payment, credit, and balance work.

Weaknesses:

- users may still ask why no payment or balance is shown;
- wording must be strict so the section does not look like a full billing
  dashboard;
- pending posting state must be surfaced to avoid implying that charge history
  is complete.

This is the recommended direction.

### Option C - Defer Patient-level Financial UI Until Payments Exist

This option keeps Task 83 completed-visit visibility as the only financial UI
and moves next into payment planning/schema/service work.

Benefits:

- avoids any risk of users treating charge-only history as an account;
- lets the first patient account UI show both debits and credits.

Weaknesses:

- delays visibility into already-posted charges;
- makes it harder for authorized users to reconcile charge posting across a
  patient without opening visits one by one;
- loses continuity from the ledger posting foundation already implemented.

This is safe but too conservative for the next slice. A carefully labeled posted
charges view gives useful operational visibility without pretending payments
exist.

## Selected Product Decision

The next runtime task should implement a read-only patient-level `Posted charges`
section, not a `Balance` or full `Patient account` dashboard.

The section should communicate:

- these are posted service charges recorded in DentApp;
- no payment, credit, invoice, receipt, or balance state is represented;
- the list is read-only;
- pending/unposted completed-visit charges may exist separately.

Do not introduce `Balance`, `Amount due`, `Outstanding balance`, `Paid`,
`Payment status`, `Billing status`, `Invoice history`, or `Receipt` language
until payment/credit recording and the surrounding workflows exist.

## Recommended Patient-level Surface

Primary surface:

- add a new section inside the existing patient Full Record area.

Recommended label:

- section/tab label: `Charges`;
- section heading: `Posted charges`;
- supporting text: `Read-only service charges recorded in DentApp`.

Rationale:

- Full Record already hosts deeper patient modules and is less likely than the
  overview to look like a headline billing dashboard;
- the mobile section selector and desktop section buttons already provide a
  restrained navigation pattern;
- blocked roles can simply omit the section from available sections, preserving
  clinical access without a generic error;
- a later Patient Account surface can replace or expand this once payment and
  balance semantics are implemented.

Do not add a prominent Patient Overview balance tile yet. The existing demo
financial placeholder should be treated as legacy/demo context, not as a real
ledger-backed balance.

## Minimum Future Read-only MVP

Task 85 should show a narrow patient-level posted-charge activity view.

Include:

- posted `charge` ledger entries for the current patient;
- posted date/time;
- description snapshot;
- amount and currency;
- originating completed visit reference/date when available;
- performed-service linkage where available;
- optional grouping by completed visit/date if this remains compact;
- per-currency posted charge totals only if clearly labeled as `Posted charges
  recorded in DentApp`.

Do not include:

- patient balance;
- amount due/outstanding;
- paid/unpaid status;
- payment methods;
- payment allocations;
- payment entry;
- invoice or receipt state/actions;
- refunds, reversals, discounts, write-offs, or adjustment controls;
- editing or deletion of ledger entries;
- posting/retry mutation controls.

The MVP may show no total at all if the UI reads more honestly as a ledger list.
If totals are shown, they must be secondary and per currency.

## Pending and Incomplete Posting Visibility

The patient-level view should not imply that posted charge history is complete
when some completed visits have finalized services but incomplete ledger posting.

Recommended behavior:

- show a non-destructive notice when the service layer can determine that some
  completed-visit charges are not fully posted;
- wording: `Some completed-visit charges have not yet been posted.`;
- link or route users to the relevant completed visit detail where possible;
- keep retry/posting mutation out of the patient-level view for now.

Posting retry should remain in Visit Completion until a dedicated authorized
financial reconciliation workflow is designed. Task 85 may surface visibility of
pending state, but it should not add mutation.

If detecting patient-wide pending posting would require broad new RPC work,
Task 85 can begin with posted charge history only and document pending-posting
visibility as the next financial reconciliation slice.

## Role and RLS Behavior

Preserve existing ledger read boundaries:

- `owner_admin`: may view same-clinic posted charge activity;
- `doctor`: may view same-clinic posted charge activity;
- `specialist`: may view same-clinic posted charge activity;
- `reception_admin`: may view same-clinic posted charge activity;
- `assistant`: no ledger financial rows;
- `inventory_responsible`: no ledger financial rows.

For blocked roles:

- omit the `Charges` section/navigation entry from Full Record;
- keep all permitted clinical patient information available;
- avoid generic failure notices for expected permission boundaries.

`reception_admin` may read posted financial activity but still cannot post
charges through the Task 81 posting RPC. No payment-entry authority has been
decided or implemented.

## Data-read and Service-layer Principles

The future implementation should use a small patient-ledger service helper,
likely in `src/features/patient-ledger/patientLedgerService.ts`, rather than
placing ledger reads directly in patient UI components.

Preferred service concept:

- `getPatientPostedChargesSummary(patientId)` or similar.

The helper should:

- normalize route patient IDs through existing patient ID helpers;
- read only same-patient posted ledger `charge` rows permitted by RLS;
- avoid patient-wide balance mutation or cached totals;
- return explicit blocked/no-data/error states;
- keep payment, reversal, invoice, receipt, and posting mutations out of scope.

Direct RLS-protected reads are likely sufficient for the first posted-charge
list. A read-only RPC should be considered only if grouping by completed visits,
pending-posting detection, or cross-table enrichment becomes hard to do safely
with existing RLS. Do not broaden table RLS to make the UI easier.

## Currency and Totals

Ledger entries carry currency codes. The UI must not sum different currencies
into one number.

Rules:

- display each ledger row with its stored currency;
- if totals are included, group totals by currency;
- do not introduce exchange rates or currency conversion;
- do not label charge totals as balance or amount due;
- if multi-currency display becomes visually noisy, omit patient-level totals
  from the MVP and rely on row-level amounts.

## Recommended Sequence

Recommended sequence after Task 84:

1. Task 85 - Patient Posted Charges Read-only Section / Account Activity
   Visibility
2. Task 86 - Payment Recording Foundation Planning / Data Model Decision
3. Task 87 - Payment Schema/RLS Foundation
4. Task 88 - Payment Service Layer / Controlled Recording and Reversal Boundary
5. Task 89 - Patient Account Charges + Payments Read-only Summary / Balance
   Decision

This sequence gives authorized users patient-level visibility into existing
posted charges without overstating financial completeness. It also keeps true
balance display deferred until payment and credit movements exist.

## Deferred Scope

Task 84 and the recommended Task 85 do not implement:

- patient balance;
- amount due/outstanding labels;
- payment recording;
- payment allocations;
- payment methods;
- invoices;
- receipts;
- refunds;
- reversals;
- discounts;
- write-offs;
- adjustments;
- commissions;
- materials/inventory accounting;
- treatment-plan conversion;
- appointment lifecycle changes;
- Visit Completion changes;
- new schema, migrations, RLS, RPCs, or tests in this planning task.
