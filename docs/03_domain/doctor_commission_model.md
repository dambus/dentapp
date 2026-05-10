# DentApp — Doctor Commission Model

## 1. Purpose

This document defines the initial doctor commission model for DentApp.

Doctor commission is a key regional workflow because many doctors and specialists work on percentage-based compensation.

This is a product/domain model, not yet a final database schema.

---

## 2. Core Problem

Doctor earnings are often calculated manually or informally.

Common problems:

- percentage differs by doctor,
- percentage differs by service,
- commission may depend on collected payment,
- commission may depend on performed work,
- laboratory cost may affect calculation,
- unpaid patient balance complicates doctor payout,
- visiting specialists may have special rules,
- doctors may want transparency,
- owners need control and reporting.

DentApp should make commission calculation structured, configurable, and auditable.

---

## 3. Commission Basis

DentApp should support different commission bases.

### 3.1 Performed-Based Commission

Doctor commission is calculated when work is performed.

Example:

Doctor performs service worth 10,000 RSD and gets 40%, regardless of whether patient paid.

### 3.2 Collected-Based Commission

Doctor commission is calculated only when money is collected.

Example:

Service worth 10,000 RSD, patient pays 5,000 RSD now, doctor gets percentage only on collected 5,000 RSD.

### 3.3 Hybrid / Custom Rule

Some practices may use mixed logic.

Example:

Certain doctors are paid on performed work, others on collected work.

---

## 4. Commission Rule

A commission rule defines how commission is calculated.

Fields may include:

- rule ID,
- clinic ID,
- doctor ID,
- service ID optional,
- service category optional,
- percentage,
- fixed amount optional,
- basis,
- applies from date,
- applies to date,
- active status,
- notes.

Rule basis examples:

- performed amount,
- collected amount,
- collected amount after discount,
- amount after laboratory cost,
- custom.

---

## 5. Rule Priority

If multiple rules apply, priority must be clear.

Possible priority order:

1. specific doctor + specific service,
2. specific doctor + service category,
3. specific doctor default,
4. clinic default.

This must be validated before implementation.

---

## 6. Service Category Rules

Commission may differ by service category.

Examples:

- conservative dentistry,
- endodontics,
- prosthetics,
- surgery,
- implantology,
- orthodontics,
- hygiene,
- diagnostics.

Service categories must be configurable.

---

## 7. Laboratory Cost

Some dental services involve lab costs.

Especially relevant for:

- crowns,
- bridges,
- dentures,
- prosthetics,
- implant components.

Possible calculation options:

- commission calculated on full service price,
- lab cost deducted before commission,
- lab cost split separately,
- lab cost ignored for MVP.

This must be resolved during discovery.

---

## 8. Commission Entry

A commission entry records calculated commission for a specific event.

Fields may include:

- commission entry ID,
- clinic ID,
- doctor ID,
- patient ID,
- visit ID,
- performed service ID,
- payment ID if collected-based,
- base amount,
- percentage,
- calculated amount,
- status,
- calculation date,
- payout date,
- notes.

Statuses:

- pending,
- calculated,
- approved,
- paid,
- cancelled,
- adjusted.

---

## 9. Payment Connection

If commission is collected-based, commission entry may be created when payment is received.

A single payment may relate to multiple services.

Important question:

How should payment be allocated across services and doctors?

Options:

- manual allocation,
- oldest open balance first,
- proportional allocation,
- specific service allocation.

This must be defined before detailed implementation.

---

## 10. Doctor Work Report

Doctor should be able to view, if enabled:

- performed services,
- dates,
- patients if allowed,
- service value,
- collected amount,
- pending amount,
- commission percentage,
- commission amount,
- payout status.

Visibility depends on clinic policy.

---

## 11. Owner Commission Report

Owner/Admin should be able to view:

- doctor,
- period,
- performed value,
- collected value,
- unpaid value,
- commission amount,
- paid commission,
- pending commission,
- adjustments.

---

## 12. Adjustments

Commission adjustments may be needed.

Examples:

- correction of wrong service,
- payment refund,
- special agreement,
- lab cost correction,
- owner-approved bonus,
- cancellation.

Adjustments should be auditable and should not silently overwrite history.

---

## 13. Payout

A payout records money paid to doctor.

Fields may include:

- payout ID,
- clinic ID,
- doctor ID,
- period start,
- period end,
- amount,
- payout date,
- paid by,
- notes,
- linked commission entries.

---

## 14. Access Control

Commission data is highly sensitive.

Suggested access:

- Owner/Admin: all commission data
- Doctor: own commission if enabled
- Specialist: own commission if enabled
- Reception/Admin: no access
- Assistant: no access
- Inventory Responsible: no access

---

## 15. Audit Requirements

Audit important commission actions:

- rule created,
- rule changed,
- rule disabled,
- commission calculated,
- commission adjusted,
- commission approved,
- payout recorded,
- payout cancelled.

---

## 16. MVP Simplification

For MVP, start with:

- commission rule per doctor,
- optional rule per service category,
- performed-based or collected-based setting,
- simple commission report,
- payout status.

More advanced allocation and lab cost logic can be refined after discovery.

---

## 17. Open Questions

- Is commission usually based on performed or collected work in the pilot practice?
- Does percentage differ by service category?
- Are lab costs deducted before commission?
- How are visiting specialists paid?
- Who can see doctor commission?
- Should doctors approve/confirm their commission report?
- How are corrections handled?
- How are refunds handled?
- How should partial payments be allocated to doctors?
