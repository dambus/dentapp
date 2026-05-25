# Task 89 - Patient Account Charges + Payments / Payment UI Integration and Balance Decision

## Task Type

Task 89 is a docs-only product, UI-flow, and integration decision task.

No React runtime files, services, migrations, RPCs, RLS policies, tests,
payment actions, account summaries, or balance display were implemented.

## Current Financial/UI Boundary After Task 88

DentApp currently has a reliable financial event foundation, but the patient
UI still exposes only posted service charges.

Implemented today:

- `performed_services` stores finalized rendered-service snapshots.
- `patient_ledger_entries` stores posted financial movements.
- finalized performed services can be posted idempotently as ledger `charge`
  debit entries.
- Visit Completion runs a three-stage pipeline:
  - clinical completion,
  - performed-services finalization,
  - patient-ledger charge posting.
- completed visit detail shows read-only `Services & charges`:
  - finalized service snapshots,
  - posted charge state,
  - visit-scoped posted charge total,
  - no-services, pending, blocked-role, loading, and error states.
- patient Full Record includes a `Charges` section whose card is titled
  `Posted charges`.
- the patient `Posted charges` section shows posted ledger `charge` debit rows
  only, with grouped posted-charge totals by currency.
- `patient_payments` stores real-world patient payment records.
- `record_patient_payment(...)` records a payment and creates one linked ledger
  `payment` credit entry.
- `reverse_patient_payment(...)` preserves the original payment and credit,
  marks the payment `reversed`, and creates one compensating ledger `reversal`
  debit entry.
- frontend helpers exist:
  - `recordPatientPayment(...)`,
  - `reversePatientPayment(...)`.

Not implemented today:

- payment-entry UI,
- payment history in patient UI,
- payment reversal UI,
- account activity combining charges, payments, and reversals,
- patient balance,
- amount due,
- paid/unpaid state,
- invoice or receipt workflows,
- payment allocation to charges, visits, or invoices.

The important boundary remains:

> A backend payment-recording pathway exists, but DentApp does not yet expose a
> user-facing payment workflow or a complete account activity UI.

## Repository Audit Findings

The current patient-level financial surface is in `PatientFullRecord`.

Current structure:

- Full Record section key: `charges`.
- Desktop/mobile section label: `Charges`.
- Section card title: `Posted charges`.
- Section description: `Read-only service charges recorded in DentApp.`
- Component: `PatientPostedChargesSection`.
- Data helper: `getPatientPostedChargesSummary(patientId)`.
- Read roles:
  - `owner_admin`,
  - `doctor`,
  - `specialist`,
  - `reception_admin`.
- Blocked roles:
  - `assistant`,
  - `inventory_responsible`.

The section currently displays:

- posted ledger `charge` debit entries only,
- description snapshot,
- posted timestamp,
- amount and currency,
- grouped posted-charge totals by currency,
- completed visit navigation where the role may open completed visit detail.

It does not display:

- `patient_payments`,
- ledger `payment` credits,
- ledger `reversal` debits,
- payment method/reference/notes,
- record-payment actions,
- reverse-payment actions,
- balance or settlement state.

Completed visit detail remains a per-visit clinical/read-only surface. It is
not the right primary location for patient-scoped unallocated payment entry.

## Next UI Sequencing Options Compared

### Option A - Add Read-only Account Activity First

This option would evolve the current patient financial section so it can
display charges, payments, and reversals, but would not add payment-entry UI.

Benefits:

- lowest mutation risk,
- lets the combined ledger display be validated before exposing payment entry,
- keeps the next task read-only.

Risks:

- users still cannot record payments through DentApp,
- real clinics would continue seeing only charge activity until another task,
- payment rows would be visible only if created by tests or backend tooling,
- creates a partially dormant UI despite the controlled payment backend already
  existing.

### Option B - Add Payment-entry UI First

This option would add `Record payment` while leaving the patient financial view
as posted-charge-only.

Benefits:

- enables the real operational action quickly,
- small visible mutation surface if the form is isolated.

Risks:

- users could record a financial movement without seeing it in patient history,
- weak confirmation and audit experience,
- poor fit with the existing patient Full Record financial section,
- still no balance should be shown,
- creates a disjoint workflow: mutation in one place, charge-only history in
  another.

### Option C - Add Account Activity and Record Payment Together

This option evolves the current patient-level charge section into a restrained
`Account activity` surface and adds `Record payment` for authorized roles.

The same patient-level section would:

- display posted charge debits,
- display payment credits,
- display reversal debits read-only,
- let `owner_admin` and `reception_admin` record payments,
- refresh the activity list after successful recording,
- keep all entries patient-scoped and unallocated,
- avoid balance, amount-due, invoice, receipt, refund, and allocation semantics.

Benefits:

- operationally coherent,
- users can see the account entry immediately after recording a payment,
- makes the ledger interpretation visible before balance is introduced,
- aligns with the patient-scoped unallocated payment model,
- avoids exposing a mutation without a matching history surface.

Risks:

- broader than read-only display alone,
- requires careful role gating and browser smoke coverage,
- requires strict idempotency handling in the UI,
- reversal action needs a separate deliberate UI decision.

## Selected Next Runtime Direction

Select **Option C** for the next runtime slice.

The next implementation should be:

> Task 90 - Patient Account Activity + Record Payment UI

Task 90 should evolve the current patient Full Record `Charges` section into a
patient-level `Account activity` surface and add a narrow `Record payment`
workflow for authorized payment recorders.

This is preferable to Option A because the backend payment operation is already
available and leaving the UI read-only would not let clinics record real
payments. It is preferable to Option B because a payment-entry action without
visible account history would be an unsafe and confusing financial workflow.

Task 90 must remain tightly bounded:

- patient-level only,
- no balance,
- no amount due,
- no paid/unpaid status,
- no allocation,
- no invoice or receipt,
- no refund,
- no discount/write-off UI,
- no completed-visit payment action,
- no Visit Completion payment action,
- no reversal button in the first payment UI slice.

## Section Naming Decision

Once payments and reversals are visible with charges, `Posted charges` is too
narrow.

Recommended next section naming:

- Full Record section title: `Account activity`
- Supporting copy: `Read-only financial entries recorded in DentApp`

The existing navigation label may be changed from `Charges` to `Account` or
`Activity` only if it stays compact and consistent with the Full Record section
selector. If the existing `Charges` navigation label is retained temporarily,
the rendered section heading should still become `Account activity` once
payments are shown.

Avoid these terms in Task 90 runtime UI:

- `Balance`
- `Account balance`
- `Amount due`
- `Outstanding`
- `Paid`
- `Unpaid`
- `Payment status`
- `Invoice`
- `Receipt`
- `Billing`

## Payment-entry Placement Decision

Payment recording should be initiated from the patient-level Account activity
section.

Do not place first payment entry in:

- Completed Visit Detail,
- Visit Completion success state,
- Appointment Detail,
- appointment cards,
- schedule views.

Reasoning:

- MVP payments are patient-scoped and unallocated.
- Recording payment from a completed visit could imply that the visit is paid.
- Recording payment from Visit Completion would conflate clinical completion
  with money collection.
- The patient Full Record account context can show charges and payments
  together immediately after recording.

## Minimum Payment-entry Form Boundary

Allowed action for Task 90:

- `Record payment`

Visible only to:

- `owner_admin`,
- `reception_admin`.

Minimum form fields:

- amount,
- currency,
- payment method:
  - cash,
  - card,
  - bank transfer,
  - other,
- received date/time if supported cleanly by the Task 88 service contract,
- optional reference,
- optional notes.

The form must not include:

- charge allocation,
- visit selection,
- invoice selection,
- paid/unpaid toggle,
- balance override,
- refund action,
- discount/write-off action,
- receipt generation,
- payment reversal action.

After successful recording:

- show a restrained confirmation,
- refresh account activity,
- display the new ledger payment credit,
- do not claim the patient is paid,
- do not claim a visit has been settled.

## Mandatory UI Idempotency Behavior

Task 88 provides request-level duplicate protection only when an
`idempotency_key` is supplied. The future payment UI must therefore treat
idempotency as mandatory.

Task 90 requirements:

- generate a unique idempotency key for each new payment operation;
- include the key in every `recordPatientPayment(...)` call;
- reuse the same key for network retries of the same operation;
- reuse the same key when the user repeats submit after an uncertain in-flight
  result;
- disable submit while the request is in progress;
- treat `already_recorded` as a stable success state;
- refresh account activity after both `recorded` and `already_recorded`;
- never generate a second key merely because the network response was delayed
  or ambiguous.

Key lifecycle decision:

- generate a new key when the user starts a separate new payment after a
  successful payment;
- for client-side validation failures that do not reach the RPC, the UI may keep
  the same operation key while the user corrects fields;
- if the user materially changes the intended financial operation after an RPC
  call may have reached the server, the UI should require starting a new
  operation rather than silently reusing an ambiguous key;
- a corrected validation request that has not reached the server can use the
  current key safely.

Browser smoke for Task 90 must verify that repeated submit/retry does not create
duplicate `patient_payments` rows or duplicate linked ledger payment credits.

## Reversal UI Decision

Task 88 implemented controlled backend reversal, but user-triggered reversal UI
should be deferred.

Decision:

- Task 90 may display reversal ledger entries read-only if they exist.
- Task 90 should not add a `Reverse payment` action.
- Task 91 should add the restricted reversal action and confirmation flow.

Rationale:

- first payment UI should focus on accurate payment recording and account
  activity refresh;
- reversal UI adds confirmation, permissions, action placement, row state,
  mobile action-menu, copy, and smoke-test complexity;
- backend reversal capability remains available for controlled tests and future
  UI work.

Read-only reversal display should preserve accounting truth:

- original payment credit remains visible,
- compensating reversal debit remains visible,
- payment may show `Reversed` only if safely linked,
- reversal must not be described as a refund.

## Balance Decision

Keep balance deferred.

Even after Task 88, DentApp still lacks:

- payment-entry UI,
- verified combined account activity UI,
- refunds,
- discounts,
- write-offs,
- allocation,
- invoices,
- receipts,
- mature product wording for account completeness.

Task 90 must not show:

- `Balance`,
- `Amount due`,
- `Outstanding`,
- `Paid`,
- `Unpaid`,
- `Payment status`.

A future balance can be reconsidered only after:

- Account activity shows charge, payment, and reversal entries correctly;
- payment recording is tested with idempotency;
- mixed-currency display is settled;
- access boundaries are verified in UI and RLS;
- product wording honestly explains what DentApp records.

If later implemented, balance must be:

- derived from posted ledger entries,
- grouped by currency,
- never editable,
- not inferred from performed-service rows alone,
- not combined across currencies.

## Role and Access Behavior

Future Account activity read access should preserve the current financial read
boundary:

- `owner_admin`,
- `doctor`,
- `specialist`,
- `reception_admin`.

Future payment recording should be available only to:

- `owner_admin`,
- `reception_admin`.

Future payment reversal UI should use the same mutation boundary if and when it
is added:

- `owner_admin`,
- `reception_admin`.

Blocked roles:

- `assistant`,
- `inventory_responsible`.

UI behavior:

- doctors and specialists may view account activity but must not see enabled
  payment recording or reversal controls;
- reception admins may view and record payments but still must not gain
  clinical charge-posting authority;
- blocked roles should have the financial section omitted, not shown as a
  failed loading state;
- expected permission boundaries must not appear as generic application errors.

## Data and Service Implications for Task 90

Task 90 will likely need a broader patient financial read helper than the
current posted-charge-only helper.

Expected read model:

- posted ledger `charge` debit entries,
- posted ledger `payment` credit entries,
- posted ledger `reversal` debit entries,
- patient payment metadata only where authorized and useful,
- grouped totals by movement type and currency only if clearly labelled,
- completed visit reference for charge rows where available.

The current `PatientPostedChargesSection` can either be evolved or replaced by a
focused Account activity component. The next task should avoid a parallel
financial surface that leaves both `Posted charges` and `Account activity`
competing in the Full Record navigation.

No patient-wide balance helper should be added in Task 90.

## Browser Smoke and Fixture Reliability Requirements

Task 90 must include retry-safe and cleanup-aware browser smoke coverage.

Requirements:

- use unique or safely reusable payment idempotency keys;
- clean up deterministic payment fixtures created by interrupted tests;
- verify repeated submit/retry does not create duplicate payment rows;
- verify repeated submit/retry does not create duplicate ledger payment credits;
- avoid collisions with existing charge fixtures;
- avoid timezone-sensitive assertions for payment display timestamps unless the
  timestamp behavior is explicitly under test;
- verify Account activity refreshes after `recorded` and `already_recorded`;
- verify blocked roles do not see financial amounts or actions where practical;
- preserve existing browser smoke coverage for Visit Completion, posted
  charges, appointment lifecycle, operational state, provider assignment, and
  completed visit detail.

Recent fixture lessons remain relevant:

- Task 87B found a real local-date/UTC schedule boundary issue.
- Task 88 validation required clearing deterministic duplicate `TASK77-SVC`
  fixture rows from an interrupted smoke run.

Task 90 fixture setup should therefore be idempotent from the start.

## Recommended Task Sequence

### Task 90 - Patient Account Activity + Record Payment UI

Scope:

- evolve patient Full Record `Posted charges` into `Account activity`,
- display posted charge debits, payment credits, and reversal debits read-only,
- add `Record payment` for `owner_admin` and `reception_admin`,
- require UI-generated `idempotency_key`,
- refresh account activity after successful recording,
- handle `already_recorded` as success,
- no balance,
- no allocation,
- no invoice,
- no receipt,
- no refund,
- no reversal button.

### Task 91 - Payment Reversal UI / Account Activity Correction Flow

Scope:

- add restricted reversal action and confirmation,
- display reversal state clearly,
- preserve original entries,
- avoid refund semantics.

### Task 92 - Derived Per-currency Balance Decision / Read-only Summary

Scope:

- decide whether charge/payment/reversal history is mature enough to display a
  derived balance,
- only implement if terminology, access, and mixed-currency behavior are honest.

Later deferred work:

- receipts,
- invoices,
- refunds,
- discounts/write-offs,
- payment allocation,
- cash reporting,
- commissions,
- materials/inventory accounting,
- treatment-plan conversion.

## Explicitly Deferred Scope

Task 89 does not implement or authorize immediate implementation of:

- runtime UI changes,
- frontend service changes,
- database migrations,
- RPC changes,
- RLS changes,
- browser smoke changes,
- payment entry,
- payment reversal UI,
- patient balance,
- amount due,
- outstanding status,
- paid/unpaid state,
- invoices,
- receipts,
- refunds,
- discounts,
- write-offs,
- allocations,
- commissions,
- materials,
- treatment-plan conversion,
- appointment or Visit Completion behavior changes.

