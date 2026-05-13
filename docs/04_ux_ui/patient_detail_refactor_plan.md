# DentApp - Patient Detail Refactor Plan

## 1. Purpose

This document defines a future refactor direction for `PatientDetailPage`.

The goal is to make Patient Detail a workflow screen for real dental practice, not a long page where every module has equal visual weight.

This is a planning document only. No UI code or behavior is changed by this task.

---

## 2. Current Problem

The current Patient Detail foundation has grown correctly for Phase 2 implementation, but it now combines many concerns on one screen:

- patient identity,
- contact data,
- important note,
- unpaid balance placeholder,
- appointment summary,
- medical record summary,
- clinical notes,
- odontogram,
- treatment plans,
- documents placeholder,
- timeline placeholder,
- archive/restore,
- role-specific actions.

This proves the domain foundation, but it risks becoming too module-heavy for real chairside use. A doctor with limited time needs the most important patient context immediately, then a small set of high-value actions.

---

## 3. Proposed New Patient Detail Structure

Patient Detail should be organized into four priority areas:

1. Patient Snapshot
2. Today / Appointment Context
3. Quick Actions
4. Full Record

The first three areas support fast chairside workflow. Full Record remains available for deeper review and editing.

---

## 4. Patient Snapshot Area

Patient Snapshot should always be visible near the top.

Always visible:

- name,
- age or year of birth,
- patient status,
- warnings,
- allergy or important medical note,
- important administrative note,
- debt/prepayment if user has permission,
- active treatment plan,
- next appointment,
- last visit or last note.

The snapshot should let a doctor or assistant brief the case in seconds.

---

## 5. Today / Appointment Context Area

Today Panel should focus only on the current appointment or immediate next work.

Recommended content:

- reason for visit,
- planned treatment,
- active treatment plan item,
- tooth or region for today's work,
- assigned doctor,
- appointment status,
- next step,
- quick Complete Visit action.

If no appointment is linked, the area should still show the next recommended step and allow starting an ad hoc visit completion flow.

---

## 6. Quick Actions Area

Quick Actions should be role-aware and placed above the full record.

Suggested actions:

- Complete Visit,
- Add Clinical Note,
- Update Odontogram,
- Add Treatment Plan Item,
- Add Payment,
- Schedule Next Appointment.

Each quick action should open a focused task flow. It should not require the user to search through the whole patient record.

---

## 7. Full Record Area

Full Record is the secondary workspace for deeper information.

Suggested sections:

- Medical Record,
- Odontogram,
- Treatment Plans,
- Clinical Notes,
- Payments,
- Materials,
- Documents,
- Timeline.

Full Record should remain accessible, but it should not be the first thing a doctor must parse before treatment.

---

## 8. Recommended Layout Pattern

Recommended hierarchy:

1. Patient Snapshot fixed or visually persistent at top.
2. Today Panel directly below or beside snapshot.
3. Quick Actions in a compact action bar or card grid.
4. Full Record as tabs, accordions, or module cards below.

Avoid giving every module equal card weight on the first screen.

---

## 9. Desktop Layout Concept

Desktop can use a two-column workflow layout:

- left/main column: Today Panel, Quick Actions, selected Full Record tab,
- right/support column: Patient Snapshot, warnings, financial status if allowed, active plan summary.

Alternative:

- full-width Patient Snapshot,
- two-column content with Today Panel and Quick Actions above Full Record.

The desktop view should support scanning and repeated use during the working day.

---

## 10. Tablet/mobile Layout Concept

Tablet and mobile should use stacked priority:

1. compact Patient Snapshot,
2. warning/allergy/debt badges,
3. Today Panel,
4. Quick Actions,
5. Full Record tabs or accordions.

Long sections should be collapsed by default. The user should not need to scroll through full medical history to complete a visit.

---

## 11. Role-specific Visibility

Visibility should follow existing role principles:

- Owner/Admin: full view, including financial and commission-related context where relevant.
- Doctor: clinical context, odontogram, treatment plan, visit completion, own work/commission if enabled.
- Specialist: assigned clinical context and assigned treatment items.
- Assistant: preparation context, warnings if allowed, limited odontogram/treatment plan view, material support actions.
- Reception/Admin: contact, schedule, limited treatment/payment context if allowed, no clinical note editing by default.
- Inventory Responsible: no Patient Detail access by default unless a later material workflow requires limited patient reference.

Frontend visibility must remain secondary to database/RLS enforcement.

---

## 12. Section Priority

Highest priority:

- warnings,
- allergies,
- planned work today,
- active treatment plan item,
- last note,
- debt/prepayment if allowed,
- Complete Visit.

Medium priority:

- odontogram,
- recent clinical notes,
- treatment plan summary,
- next appointment,
- payment action if allowed.

Lower priority:

- full anamnesis,
- old notes,
- archived treatment plans,
- documents,
- timeline,
- material history,
- audit trail.

---

## 13. What Should Be Collapsed by Default

Collapsed by default:

- full medical record details,
- older clinical notes,
- archived treatment plans,
- documents,
- full timeline,
- material usage history,
- detailed payment ledger,
- commission details.

Expanded or visible by default:

- active warnings,
- allergy summary,
- today context,
- active plan summary,
- last note,
- quick actions.

---

## 14. What Should Become Tabs/Cards/Accordions

Recommended:

- Patient Snapshot: compact header or persistent summary card.
- Today Panel: dedicated workflow panel.
- Quick Actions: compact action bar or small cards.
- Full Record: tabs on desktop, accordions on tablet/mobile.
- Odontogram: prominent tab or quick-action surface because it is a primary clinical interaction surface.
- Treatment Plans: tab/card with active plan summary first and archived plans behind detail.
- Payments: permission-controlled tab/card.
- Documents and Timeline: secondary tabs or accordions.

---

## 15. Migration/refactor Phases

### Phase A - Patient Snapshot

Create the compact top-priority summary without removing existing modules.

### Phase B - Today Panel

Introduce appointment/current-work context. Use placeholders where scheduling and visits are not implemented yet.

### Phase C - Quick Actions

Add role-aware quick entry points, starting with Complete Visit as a prototype action.

### Phase D - Full Record Organization

Move current inline sections into a tab/accordion structure.

### Phase E - Visit Completion Prototype

Build the post-treatment completion flow as the primary action from Patient Detail.

### Phase F - Material, Price, Debt, and Commission Integration

Connect visit completion to service templates, material suggestions, ledger state, and doctor commission rules after those domain foundations are implemented.

---

## 16. Acceptance Criteria for Future Refactor

The refactor is acceptable when:

- Patient Detail first screen shows critical patient context without long scrolling,
- warning/allergy/important note/debt/active plan are high priority,
- Today Panel clearly shows planned work or next step,
- Complete Visit is available as a primary post-treatment action,
- Quick Actions are role-aware,
- Full Record sections are still accessible,
- advanced modules are not visually dominant,
- doctor-alone workflow can be completed quickly,
- assistant-supported workflow allows preparation and doctor confirmation,
- mobile/tablet layout does not bury critical warnings,
- no financial or commission data is exposed to unauthorized roles,
- pilot clinic users can find the next step in seconds.
