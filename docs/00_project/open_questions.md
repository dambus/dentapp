# DentApp — Open Questions

This document tracks questions that must be answered during product discovery, legal research, technical planning, or pilot testing.

Status examples:

- Open
- In research
- Answered
- Deferred

---

## 1. Legal and Compliance Questions

### Q001 — Can DentApp fully replace paper dental records in Serbia?

Status: Open

Notes:

Research is needed on Serbian healthcare documentation requirements, dental records, electronic records, required retention period, and print/export requirements.

---

### Q002 — What exact dental record structure is legally or professionally expected?

Status: Open

Notes:

Need to collect official or commonly used dental record examples, including patient data, anamnesis, odontogram, diagnosis, treatment, consent, and visit history.

---

### Q003 — Which documents must be printable?

Status: Open

Potential documents:

- patient record summary,
- treatment plan,
- consent forms,
- performed services report,
- payment/debt overview,
- daily report,
- doctor commission report,
- inventory report.

---

### Q004 — What is the required retention period for dental records?

Status: Open

Notes:

Initial assumption is that some medical/dental records may require long-term or permanent retention. Must verify.

---

## 2. Product Questions

### Q005 — What is the exact workflow for a new patient?

Status: Open

Need to observe:

- first contact,
- appointment,
- registration,
- anamnesis,
- examination,
- treatment plan,
- payment agreement,
- next appointment.

---

### Q006 — What is the exact workflow for an existing patient?

Status: Open

Need to observe:

- patient lookup,
- previous history review,
- appointment reason,
- treatment continuation,
- payment update,
- next step.

---

### Q007 — How are treatment plans currently created and communicated?

Status: Open

Need to understand:

- written vs verbal plans,
- who creates them,
- how prices are discussed,
- how changes are tracked,
- how accepted/rejected items are handled.

---

### Q008 — How are installment payments and unpaid balances currently tracked?

Status: Open

Need to document:

- partial payments,
- advances,
- patient debt,
- family payments,
- discounts,
- payment promises,
- payment reminders.

---

### Q009 — How are doctor percentages calculated?

Status: Open

Need to understand:

- percentage by doctor,
- percentage by service,
- calculated on performed work or collected payment,
- laboratory costs,
- specialist rules,
- payout period.

---

### Q010 — Who should see financial and commission data?

Status: Open

Need to define visibility for:

- owner,
- doctor,
- specialist,
- reception,
- assistant,
- inventory responsible person.

---

## 3. Inventory Questions

### Q011 — What materials are currently tracked?

Status: Open

Need to collect:

- material categories,
- high-value materials,
- frequently missing materials,
- expiry-sensitive materials,
- supplier list,
- current reorder method.

---

### Q012 — Who is responsible for material requests and approvals?

Status: Open

Need to define:

- who notices missing material,
- who creates request,
- who approves,
- who purchases,
- who confirms receipt.

---

### Q013 — Should material consumption be linked to performed services in MVP?

Status: Open

Options:

- not in MVP,
- manual consumption entry,
- suggested consumption by service,
- automatic consumption.

Initial preference:

Start with manual or semi-manual inventory tracking.

---

## 4. UX Questions

### Q014 — Which device is most important during daily work?

Status: Open

Potential devices:

- desktop computer,
- laptop,
- tablet,
- mobile phone.

Need to know which workflows happen on which device.

---

### Q015 — What must be visible on the patient profile immediately?

Status: Open

Possible items:

- unpaid balance,
- next appointment,
- active treatment plan,
- medical warnings,
- allergies,
- last visit,
- next step,
- important notes.

---

### Q016 — What should the daily dashboard show?

Status: Open

Possible items:

- today’s appointments,
- unpaid balances due today,
- no-shows,
- pending treatment plans,
- low stock materials,
- pending material requests,
- doctor workload.

---

## 5. Technical Questions

### Q017 — Should Supabase be used for production pilot or only development first?

Status: Open

Need to decide after reviewing:

- data sensitivity,
- RLS complexity,
- backup requirements,
- cost,
- EU region availability,
- operational responsibility.

---

### Q018 — Should the app start as PWA?

Status: Open

Initial assumption:

Yes, responsive web/PWA first. Native mobile apps later only if justified.

---

### Q019 — Which PDF generation approach should be used?

Status: Open

Options:

- client-side PDF generation,
- server-side generation,
- Supabase Edge Function,
- external PDF service.

Need to decide based on document complexity and privacy.

---

### Q020 — How should audit logging be implemented?

Status: Open

Need to decide:

- database triggers,
- application-level logging,
- hybrid approach,
- which entities require full audit history.

---

## 6. Business Questions

### Q021 — What pricing model should be used after pilot?

Status: Deferred

Potential models:

- per practice,
- per doctor,
- per active user,
- tiered plans,
- setup fee + subscription.

---

### Q022 — What should be the first commercial package?

Status: Deferred

Potential packages:

- Solo
- Practice
- Clinic
- Enterprise

---

### Q023 — What is the minimum feature set needed before charging?

Status: Deferred

Need to validate during pilot.
