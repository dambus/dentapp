# Task 91 - Internal Settlement Feature Toggle / Access-Control and Existing Backend Review

## Task Type

Task 91 is a documentation and architecture/security review task.

No runtime code, schema, migrations, RLS policies, RPCs, React UI, frontend
services, tests, payment forms, record displays, balance displays, fiscal
integration, invoice/receipt functionality, refunds, or user-triggered reversal
behavior were changed.

## Current State After Tasks 80-90

Tasks 80-88 introduced a technical financial foundation originally framed around
patient ledger and payment workflows:

- `patient_ledger_entries`,
- idempotent posting of finalized performed services into posted ledger
  `charge` debit rows,
- Visit Completion wiring that posts those charge rows after performed-services
  finalization,
- completed visit read-only `Services & charges` visibility,
- patient Full Record `Charges` / `Posted charges` visibility,
- `patient_payments`,
- payment-linked ledger `payment` credit rows,
- payment reversal ledger `reversal` debit rows,
- controlled RPCs:
  - `get_patient_ledger_charge_posting_state_for_visit(...)`,
  - `post_finalized_performed_services_to_patient_ledger(...)`,
  - `record_patient_payment(...)`,
  - `reverse_patient_payment(...)`,
- frontend helpers:
  - patient ledger posting and read helpers,
  - posted-charge summary helper,
  - `recordPatientPayment(...)`,
  - `reversePatientPayment(...)`.

Task 90 corrected the product boundary:

- future capability is optional internal settlement records only;
- disabled by default per clinic;
- not fiscalization, accounting, cash-register functionality, payment
  processing, invoicing, receipt issuance, tax reporting, or official proof of
  payment;
- no payment UI or patient account activity UI should be exposed;
- clinical roles do not automatically get access;
- existing backend naming/access assumptions require review.

## Key Risks Found

The review found existing runtime exposure and automatic backend behavior that
conflict with the Task 90 boundary.

### Existing Automatic Posting

`VisitCompletionFlow.tsx` calls
`postFinalizedPerformedServicesChargesForVisit(...)` after performed-services
finalization succeeds. That frontend helper invokes
`post_finalized_performed_services_to_patient_ledger(...)`, which inserts
posted ledger `charge` debit rows for finalized performed services.

There is currently no clinic-level optional module enablement check.

Risk:

- internal settlement/financial ledger rows can be created during ordinary Visit
  Completion without clinic opt-in.

### Existing Completed Visit Exposure

`PatientVisitDetailPage.tsx` calls `getCompletedVisitFinancialSummary(...)` and
renders a `Services & charges` card with:

- finalized service amounts,
- posted charge status,
- `Posted to patient account`,
- `Charge posting pending`,
- posted visit charge total.

Risk:

- internal settlement/financial information is exposed in Completed Visit
  Detail, a surface Task 90 explicitly excludes.

### Existing Patient Full Record Exposure

`PatientFullRecord.tsx` includes a `charges` section for roles with
`canViewPostedCharges`, and renders `PatientPostedChargesSection`.

`PatientPostedChargesSection` displays:

- `Posted charges`,
- posted charge descriptions,
- posted date/time,
- amounts and currencies,
- grouped posted-charge totals,
- completed visit links.

Risk:

- internal settlement/financial information is exposed in patient Full Record
  without clinic enablement and without explicit settlement-specific access.

### Existing RLS Assumptions

Current ledger and payment RLS read access includes:

- `owner_admin`,
- `doctor`,
- `specialist`,
- `reception_admin`.

Task 90 supersedes automatic access for doctors, specialists, and reception.

Risk:

- sensitive settlement/financial rows are readable through ordinary role-based
  access rather than explicit settlement capabilities.

### Existing Controlled RPC Assumptions

Current write RPCs allow:

- charge posting by `owner_admin`, `doctor`, `specialist`;
- payment recording/reversal by `owner_admin`, `reception_admin`.

Task 90 requires module enablement and explicit settlement capabilities before
any settlement-related write path is exposed or used.

Risk:

- RPCs can remain internally present, but their authorization boundary is not
  aligned with the corrected optional module model.

## Feature-toggle Decision

Future internal settlement records need a clinic-level enablement boundary.

Recommended MVP implementation:

- create a dedicated settings table rather than adding a bare column directly to
  `clinics`.

Conceptual table:

```text
clinic_internal_settlement_settings
```

Conceptual fields:

- `clinic_id` primary key references `clinics(id)`;
- `internal_settlement_records_enabled boolean not null default false`;
- `enabled_at`;
- `enabled_by`;
- `updated_at`;
- optional `review_acknowledged_at` / `review_acknowledged_by` if legal review
  acknowledgement is required before enabling.

Reasoning:

- current `clinics` is a minimal tenant table with only name/status/timestamps;
- a dedicated table keeps optional-module settings isolated;
- absence of a settings row can safely mean disabled;
- future audit metadata fits better than a single boolean on `clinics`;
- it avoids turning the tenant table into a general settings bag.

Future configuration authority:

- `owner_admin` may configure the module only after the explicit access model is
  implemented;
- exact UI/management flow remains future work;
- enabling should require clinic acknowledgement that DentApp is not a fiscal,
  accounting, cash-register, invoice, receipt, or payment-processing system.

Required behavior when disabled:

- no financial/internal settlement UI exposure;
- no financial empty states;
- no payment/settlement buttons;
- no patient overview or dashboard leakage;
- no routine navigation badges;
- no patient-level internal settlement record reads through UI;
- no creation/management actions;
- no automatic posting into an exposed workflow.

## Automatic Posting Assessment

Existing automatic charge posting in Visit Completion conflicts with the
disabled-by-default optional module boundary.

Even if ledger charge rows are technically useful as an internal source, the
current behavior creates posted ledger rows without clinic opt-in and then
surfaces the result in Visit Completion / completed visit / patient Full Record.

Decision:

- automatic ledger posting must be frozen or gated before any further
  settlement-related UI work;
- the next implementation should prevent internal settlement rows from being
  created or displayed in ordinary workflows unless the clinic has explicitly
  enabled the module and the actor has explicit access;
- performed-services finalization should remain independent and continue to
  represent rendered work.

## Explicit Access/Capability Decision

Future access should not be hardcoded to ordinary roles.

Compared approaches:

### Role-based Hardcoded Access

Rejected.

Benefits:

- simple to implement.

Risks:

- repeats the current mistake of giving doctors/specialists/reception access
  because of broad role category;
- difficult for clinics to opt in selectively;
- poor privacy fit.

### Profile-level Capability Columns

Not preferred.

Benefits:

- simple queries;
- easy to check in RLS.

Risks:

- grows `profiles` with optional-module columns;
- weak grant history unless paired with audit fields;
- less flexible if more restricted capabilities are added later.

### Dedicated Permission/Grant Table

Selected for MVP.

Conceptual table:

```text
profile_internal_settlement_permissions
```

Conceptual fields:

- `clinic_id`;
- `profile_id`;
- `can_view_internal_settlement_records boolean not null default false`;
- `can_manage_internal_settlement_records boolean not null default false`;
- `granted_by`;
- `granted_at`;
- `updated_by`;
- `updated_at`;
- optional `revoked_at` if historical grant tracking is needed in the first
  implementation.

Reasoning:

- explicit per-profile grant;
- works with existing profile/clinic model;
- avoids automatic access by role;
- supports audit metadata;
- can be enforced in RLS/helper functions;
- blocked roles can remain blocked by check constraints or grant validation.

### Clinic Membership Role Plus Feature-specific Grants

Selected in practice as the model shape:

- existing profile role remains the baseline clinic membership role;
- feature-specific settlement grants decide view/manage access.

Required boundary:

- `owner_admin` may be allowed to configure and grant access, but still should
  have explicit feature enablement/configuration behavior;
- `reception_admin` is not automatically entitled;
- `doctor` is not automatically entitled;
- `specialist` is not automatically entitled;
- `assistant` remains blocked;
- `inventory_responsible` remains blocked;
- enforcement must be in RLS or trusted server/RPC checks, not UI hiding.

## Existing Artifact Classification

| Artifact | Classification | Review Notes |
| --- | --- | --- |
| `performed_services` finalized rows | Safe to continue using independently of settlement module | These are rendered-work snapshots and should remain separate from settlement records. |
| `patient_ledger_entries` table | Retain as internal technical foundation; requires future access/RLS hardening; requires terminology/API review | Internal DB name can remain during development, but current RLS is too broad for Task 90. |
| Ledger `charge` entries from performed services | Retain but freeze from UI exposure; requires future access/RLS hardening | Existing rows can remain, but automatic creation and display must be gated. |
| `post_finalized_performed_services_to_patient_ledger(...)` | Retain but freeze from UI exposure/use; requires future authorization tightening | Currently callable by `owner_admin`, `doctor`, `specialist`; must require clinic enablement and settlement manage capability if kept. |
| `get_patient_ledger_charge_posting_state_for_visit(...)` | Retain but freeze from UI exposure/use; requires future authorization tightening | Current read roles include clinical roles and reception. Needs feature toggle and explicit view capability. |
| Visit Completion ledger posting integration | Requires immediate future gating/freeze | Current runtime posts ledger rows without clinic opt-in. This is the main reason next task should be Option B. |
| Completed Visit `Services & charges` financial block | Existing exposure requiring narrow follow-up removal/gating | Task 90 excludes Completed Visit Detail from settlement surfaces. |
| Patient Full Record `Charges` / `Posted charges` section | Existing exposure requiring narrow follow-up removal/gating | Task 90 requires hidden-by-default module behavior and explicit access. |
| `getCompletedVisitFinancialSummary(...)` | Retain but freeze from UI exposure/use; requires terminology/API review | Direct RLS-protected reads expose charge state and totals. |
| `getPatientPostedChargesSummary(...)` | Retain but freeze from UI exposure/use; requires terminology/API review | Current helper is charge/activity oriented and should not be exposed until gate/access review. |
| `patient_payments` table | Retain as internal technical foundation; requires future access/RLS hardening; requires terminology/API review | Contains payment method/reference/notes; Task 90 reopens whether payment-method semantics should be exposed. |
| `patient_payments.idempotency_key` | Retain as internal technical foundation | Useful if internal controlled record creation is retained; not user-facing. |
| Ledger `payment` credit entries | Retain as internal technical foundation; freeze from UI exposure | Current semantics and naming need product review before exposure. |
| Ledger `reversal` debit entries | Retain as internal technical foundation; freeze from UI exposure | Useful for traceability; user-triggered reversal UI remains prohibited. |
| `record_patient_payment(...)` | Retain but freeze from UI exposure; requires future authorization tightening and terminology/API review | Currently allows owner/reception with role check only. Future use must require module enabled + manage capability. |
| `reverse_patient_payment(...)` | Retain but freeze from UI exposure; requires future authorization tightening and terminology/API review | Backend correction path exists but no UI should expose it before review. |
| `recordPatientPayment(...)` / `reversePatientPayment(...)` frontend helpers | Retain but freeze from UI consumption; requires terminology/API review | No React consumers should be added until module/access gating exists. |
| Current ledger/payment read policies | Requires future access/RLS hardening | Current read access includes doctors, specialists, and reception automatically. |
| Current direct table mutation posture | Safe to continue using independently of settlement module | No broad authenticated direct insert/update/delete policies exist for ledger or payments. |

## Terminology and Schema Naming Boundary

Do not perform broad renaming immediately.

Development-stage decision:

- internal database names such as `patient_ledger_entries`,
  `patient_payments`, `charge`, `payment`, and `reversal` may temporarily remain
  as internal implementation terminology;
- they must not appear in user-facing clinic UI, routine navigation, exported
  patient-facing documents, or clinic-facing marketing/training language;
- any future UI/API surface exposed to clinics must use internal-settlement
  terminology reviewed against Task 90;
- if backend naming leaks into logs, exports, API docs, reports, or UI, it must
  be wrapped, renamed, or translated before production.

Possible replacement/translation terms:

- `Internal settlement records`,
- `Internal settlement entry`,
- `Recorded settlement`,
- `Recorded service amount`.

Payment-method naming is a special risk:

- `cash`, `card`, `bank_transfer`, and `other` are currently stored on
  `patient_payments`;
- this may be acceptable internally during development;
- it should not be exposed in the future MVP unless a legitimate operational
  need is approved.

## Auditability and Lawful-use Boundary

Future internal settlement records must follow these non-negotiable principles:

- records must be auditable;
- access to records should be logged where appropriate;
- deletion or silent removal must not be used to alter history;
- corrections should use traceable/reversible mechanisms;
- access must be minimal and explicit;
- access must be separated from ordinary clinical access;
- no workflow may be designed to conceal legally required records;
- no workflow may be designed to bypass fiscal recording, inspection, or legal
  obligations;
- production rollout requires legal/accounting review;
- production Serbian copy requires professional review.

## Required Future Remediation Sequence

### Step 1 - Freeze/Gate Existing Runtime Exposure

This must happen before adding new settlement feature UI.

Required work:

- stop or gate automatic ledger charge posting in Visit Completion;
- hide or gate completed visit financial/charge visibility;
- hide or gate patient Full Record posted-charge visibility;
- prevent ordinary role-based access from surfacing settlement/financial rows in
  UI;
- preserve clinical completion and performed-services finalization.

### Step 2 - Add Optional Module and Explicit Access Schema

After exposure is frozen/gated:

- add clinic-level optional enablement settings;
- add explicit per-profile settlement view/manage grants;
- add helper functions for enabled/access checks;
- update RLS/RPC authorization to use feature enablement and explicit grants.

### Step 3 - Review/Wrap Existing Backend APIs

Before UI:

- decide whether to keep, wrap, rename, or deprecate existing payment/ledger
  RPCs and frontend helpers;
- remove or hide payment-method semantics from future MVP exposure unless
  approved;
- align messages/descriptions with internal-settlement terminology.

### Step 4 - Only Then Consider Restricted UI

Any future UI must be:

- clinic-enabled;
- explicit-access-only;
- isolated in a restricted patient-level area;
- not visible in Visit Completion, completed visit detail, appointments,
  schedules, patient overview, dashboards, or routine navigation badges;
- clearly marked as internal organizational records only.

## Exact Next Recommended Implementation Task

Because current runtime already exposes posted-charge information and
automatically creates ledger charge rows during Visit Completion, Option A is
not safe as the immediate next implementation.

Next task:

> Task 92 - Existing Financial Visibility and Automatic Posting Freeze/Gating

Reason:

- existing Completed Visit Detail and Patient Full Record UI expose internal
  financial/settlement information;
- existing Visit Completion attempts automatic ledger charge posting;
- these behaviors exist before clinic opt-in and explicit access controls.

Task 92 should narrowly freeze or gate existing exposure/automatic posting while
preserving:

- clinical completion,
- performed-services finalization,
- completed visit clinical detail,
- patient clinical records,
- appointment behavior,
- existing backend tables/RPCs unless an immediate safety fix is required.

## Out-of-scope Boundaries

Task 91 does not add or modify:

- SQL migrations,
- schema,
- RLS,
- RPCs,
- React components,
- frontend services,
- test scripts,
- feature-toggle runtime logic,
- payment/settlement forms,
- record displays,
- balance displays,
- fiscal integration,
- invoice/receipt functionality,
- refunds,
- user-triggered reversals.

