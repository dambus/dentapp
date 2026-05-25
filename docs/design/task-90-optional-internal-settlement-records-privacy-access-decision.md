# Task 90 - Optional Internal Settlement Records / Privacy & Access Decision

## Task Type

Task 90 is a docs-only corrective product, privacy, and access-boundary decision.

No React UI, services, schema, migrations, RLS policies, RPCs, tests, payment
forms, account activity displays, balance displays, fiscal integrations,
invoice/receipt behavior, or runtime behavior were changed.

## Why This Corrective Decision Exists

Task 89 selected a future runtime direction that would evolve `Posted charges`
into patient-level `Account activity` and add a `Record payment` UI.

That direction is now superseded.

DentApp must not be positioned as:

- a fiscalization system,
- a cash register,
- payment-processing software,
- accounting software,
- invoicing software,
- receipt issuance software,
- tax-reporting software,
- official proof-of-payment software.

In Serbia, legally required fiscal recording remains outside DentApp in the
clinic's fiscal system. DentApp will not integrate with the fiscal cash register
in this phase.

The only acceptable future purpose for this area is a narrowly scoped optional
internal organizational record for patient settlement situations, such as
installment arrangements or amounts settled later.

## Superseded Prior Direction

This document supersedes conflicting UI/access direction in:

- Task 84, where patient-level account/charge visibility was planned;
- Task 86, where payment-recording foundation was planned;
- Task 89, where `Account activity` and `Record payment` were selected as the
  next runtime slice.

Historical documents are left intact as records of prior decisions. The current
decision is:

- freeze the previously planned payment UI direction;
- do not proceed with `Patient Account Activity + Record Payment UI`;
- require a new review of clinic enablement, access control, schema, RLS,
  services, naming, and exposure before any settlement-related UI is built.

## Optional Module, Disabled By Default

Future internal settlement records must be an optional per-clinic module.

Default state:

- disabled.

When disabled, the clinic must not see:

- financial sections,
- financial empty states,
- payment or settlement buttons,
- outstanding indicators,
- account activity navigation,
- dashboard summaries,
- routine navigation badges,
- references to hidden financial functionality.

The rest of DentApp must work normally without this module.

This requirement means future implementation needs an explicit clinic-level
feature flag or equivalent configuration boundary before any UI is exposed.

## Not Fiscal, Accounting, Invoice, Receipt, or Payment Processing

The future capability must not be represented as:

- fiscalization,
- official payment processing,
- cash register functionality,
- accounting,
- invoicing,
- receipt issuance,
- tax reporting,
- official proof of payment.

Any real transaction requiring fiscal recording remains outside DentApp and must
be recorded through the applicable legal/fiscal process.

Future UI must contain clear internal-use wording, conceptually similar to:

> Internal organizational record only. This does not represent a fiscal receipt
> and does not replace legally required transaction recording.

This is not final legal copy. Serbian localization and final wording require
professional/legal review before production rollout.

## Terminology Correction

Previously proposed user-facing terms are no longer acceptable for the future
MVP:

- `Account activity`
- `Record payment`
- `Balance`
- `Posted charges`
- `Amount due`
- `Outstanding`
- `Paid`
- `Unpaid`

Safer future terminology should center on:

- `Internal settlement records`
- `Internal settlement entry`
- `Recorded settlement`
- `Recorded service amount`

Serbian product localization may use terms such as:

- `Interna evidencija izmirenja`
- `Evidentirano izmirenje`

Final Serbian copy must be reviewed before production use.

## Restricted Visibility and Explicit Access Capabilities

Internal settlement records must not automatically be visible to every clinical
user who can read a patient record.

The previous assumption that doctors and specialists may view all financial
activity because they can view posted charges is superseded.

Future access should be based on explicit capabilities, such as:

- `can_view_internal_settlement_records`
- `can_manage_internal_settlement_records`

Initial direction:

- `owner_admin`: can configure the optional module and grant access; exact
  access management model remains a future decision.
- `reception_admin`: not automatically entitled; may receive explicit access if
  the clinic chooses.
- `doctor`: no automatic access.
- `specialist`: no automatic access.
- `assistant`: blocked.
- `inventory_responsible`: blocked.

Visibility must be protected by database/RLS or trusted server-side access
checks, not UI hiding alone.

## UI Placement Boundary

Do not expose this capability in:

- Visit Completion,
- Completed Visit Detail,
- Appointment Detail,
- appointment cards,
- daily schedule,
- weekly schedule,
- patient overview,
- global dashboards,
- routine navigation badges.

A future UI, if approved, should be isolated inside a restricted patient-level
area visible only when:

1. the clinic has enabled the optional internal settlement module; and
2. the current user has explicit settlement-record access.

This restricted area should not dominate ordinary patient clinical workflows.

## Balance and Payment-method Correction

Continue to prohibit:

- balance,
- amount due,
- outstanding indicators,
- paid/unpaid states,
- invoice UI,
- receipt UI,
- refunds,
- allocations,
- user-triggered reversals,
- fiscal integration.

The earlier assumption that a future internal entry form should expose payment
method values (`cash`, `card`, `bank_transfer`, `other`) is reopened.

Because DentApp is not a payment-processing or fiscal system, payment method
should not be exposed in a future MVP unless a clear legitimate operational need
is approved and reviewed. The default future direction should be internal
settlement recording without payment-method semantics.

## Treatment of Existing Task 80-88 Implementation

Tasks 80-88 already added technical backend foundations:

- `patient_ledger_entries`,
- charge posting from finalized performed services,
- completed visit and patient-level posted charge visibility,
- `patient_payments`,
- controlled payment recording and reversal RPCs,
- frontend payment service helpers.

No payment UI is exposed yet.

Decision for now:

- do not remove or broadly refactor existing runtime/schema implementation in
  this docs-only task;
- freeze previously planned payment UI work;
- require future review of schema, RLS, RPCs, services, naming, role access, and
  user-facing exposure against the internal-settlement boundary;
- explicitly treat current read-role assumptions and payment terminology as
  candidates for revision;
- do not expose existing payment RPCs through UI until that review is complete.

## Compliance and Privacy Boundary

The optional module is intended only for legitimate internal operational
recordkeeping.

It must not be designed or described as a way to:

- conceal legally required records,
- bypass fiscal recording,
- bypass inspection obligations,
- replace accounting,
- replace official transaction records.

Before any production rollout:

- legal/accounting review is required;
- Serbian localized copy must be reviewed;
- access must be minimal and explicit;
- access must be auditable;
- access must remain separate from ordinary clinical access;
- retention and export expectations must be documented.

## Required Future Review Before Runtime Exposure

The next task must not build UI directly.

Required next review areas:

- clinic-level enablement flag/configuration;
- default disabled behavior;
- explicit access capability model;
- RLS and trusted server-side enforcement;
- whether current ledger/payment table naming remains acceptable internally;
- whether existing `patient_payments` and payment RPC naming should be
  wrapped, renamed, restricted, or deprecated before UI exposure;
- whether current role-based read access to posted charges/payments should be
  narrowed;
- whether payment method should be removed, hidden, or left backend-only;
- whether completed visit and patient Full Record posted-charge visibility
  should be hidden when the optional module is disabled;
- audit logging expectations for viewing and managing internal settlement
  records;
- legal/accounting review checklist.

## Corrected Recommended Next Task

Task 89's recommended runtime task is cancelled as the immediate next step.

The next recommended task is:

> Task 91 - Internal Settlement Feature Toggle / Access-Control and Existing
> Backend Review

Expected Task 91 scope:

- plan clinic-level optional enablement;
- define explicit settlement-record view/manage capabilities;
- review existing ledger/payment schema, RLS, RPCs, and frontend services;
- decide what must be hidden, renamed, wrapped, restricted, or left backend-only;
- define a safe migration/service plan if changes are required;
- keep runtime UI disabled until the review is complete.

## Explicitly Out of Scope

Task 90 does not add or modify:

- React UI,
- services,
- schema,
- migrations,
- RLS,
- RPCs,
- tests,
- payment forms,
- account activity displays,
- balance displays,
- fiscal integrations,
- invoice functionality,
- receipt functionality,
- refunds,
- allocations,
- appointment behavior,
- Visit Completion behavior.

