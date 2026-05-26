# Task 94 - Internal Settlement Post-MVP Deferral / MVP Roadmap Refocus

## Decision Summary

Internal settlement records / Interna evidencija izmirenja are not part of the DentApp MVP.

Tasks 90-93 resolved the immediate privacy, product-positioning, runtime, and RLS risks created by the earlier finance-like direction. The technical foundations retained after Tasks 92-93 stay present, but inactive from product usage.

No clinic-facing product copy, roadmap, workflow, report, or UI should imply that internal settlement records exist in the MVP.

## Safe Baseline Retained

The accepted Task 92-93 baseline remains authoritative:

- ordinary clinical UI shows no settlement, payment, charge, balance, account, ledger, or posting visibility;
- payment navigation and routes remain removed;
- Visit Completion has no Services & Charges financial step;
- clinical completion does not finalize financial performed-service drafts;
- clinical completion does not automatically post ledger charges;
- `performed_services`, `patient_ledger_entries`, `patient_payments`, and related posting/payment/reversal RPCs remain frozen from ordinary authenticated access;
- Task 93 clinic settings and explicit grants exist only as future authorization foundation;
- enabling the setting and granting access does not reopen frozen records or RPCs.

## Post-MVP Deferral Boundary

Internal settlement records remain a possible future optional clinic capability only.

They will not receive UI, workflow, reporting, service-path, record-model, migration, RPC, or frontend-service development in the active MVP stream. The MVP should focus on validated clinical workflows, operational scheduling, patient records, treatment-plan context, Visit Completion, and UI/UX quality.

## Work Explicitly Deferred

Deferred until after MVP:

- deciding whether retained ledger/payment tables should be reused;
- creating a new internal-settlement record model;
- controlled settlement read/write RPCs;
- settlement UI or settlement history;
- balances, installment summaries, payment methods, corrections, or reversals UI;
- audit UI for settlement actions;
- exports or reports for settlement records;
- fiscalization, invoice, receipt, cash-register, accounting, or tax-reporting integration.

## Reopen Criteria

The settlement stream may only reopen after an explicit product decision.

That future decision should first review:

- legal/accounting wording and intended use;
- whether clinics actually require the capability;
- the frozen backend artifacts retained from Tasks 80-88 and frozen in Task 92;
- final access and audit model;
- smallest viable isolated UI, if any UI is approved.

Task 94 does not design those future elements.

## MVP Roadmap Refocus

The active roadmap returns to MVP clinical/product readiness and UI quality.

Near-term work should avoid settlement, payment, balance, ledger, invoice, receipt, fiscal, or report implementation. The next useful checkpoint is a design/planning task that reviews the currently validated functional screens and defines a restrained restyling direction before broad UI changes begin.

## Recommended Next Task

`Task 95 - MVP UI/UX Restyling Foundation Planning`

Purpose:

- review validated functional screens and workflows;
- define the restyling scope, design-system direction, and screen priority order;
- keep implementation narrow until the visual plan is approved;
- preserve the Task 92-94 internal-settlement deferral boundary.
