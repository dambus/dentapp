# DentApp — Design System Direction

## 1. Purpose

This document defines the initial design system direction for DentApp.

The design system should help keep the application visually consistent, professional, readable, and easy to use across desktop, tablet, and mobile.

This is not yet a final visual identity document. It is the starting direction for MVP UI design.

---

## 2. Design Goals

DentApp should feel:

- professional,
- clean,
- calm,
- trustworthy,
- modern,
- efficient,
- suitable for healthcare,
- suitable for business operations.

DentApp should not feel:

- playful,
- childish,
- cluttered,
- generic,
- template-like,
- visually noisy,
- overdesigned.

---

## 3. Product Context

DentApp will be used in a dental practice during real work.

Users may be:

- doctors,
- assistants,
- reception staff,
- owners,
- inventory responsible persons.

The design must support:

- quick reading,
- fast actions,
- low cognitive load,
- clear hierarchy,
- safe handling of sensitive information,
- role-based interfaces,
- responsive usage.

---

## 4. Visual Style Direction

Recommended visual direction:

- light interface by default,
- strong readability,
- calm neutral backgrounds,
- clear sections,
- restrained accent colors,
- professional healthcare feel,
- structured cards and tables,
- minimal decorative elements.

Avoid excessive rounded corners, heavy shadows, or flashy gradients.

The application should look like a serious operational tool, not like a marketing website.

---

## 5. Layout Principles

Use clear layout hierarchy:

- page title,
- short context/description,
- primary actions,
- filters/search,
- main content,
- secondary actions.

Important screens should avoid visual overload.

Use spacing to separate:

- patient identity,
- warnings,
- treatment plan status,
- payment status,
- actions.

---

## 6. Responsive Layout

DentApp must support:

- desktop,
- laptop,
- tablet,
- mobile.

Desktop:

- sidebar navigation,
- wider tables,
- multi-column layouts,
- reports.

Tablet:

- patient profile,
- odontogram,
- treatment plan,
- visit notes.

Mobile:

- quick schedule,
- patient search,
- basic patient info,
- quick actions,
- material request.

Mobile should not be treated as an afterthought.

---

## 7. Navigation Style

Initial recommendation:

Desktop:

- left sidebar navigation,
- top bar with user/profile/actions,
- main content area.

Mobile:

- collapsible navigation,
- bottom or drawer-style menu if needed,
- quick access to calendar and patients.

Navigation should be role-aware.

---

## 8. Typography

Typography should prioritize readability.

Recommended principles:

- clear sans-serif font,
- readable base size,
- strong headings,
- moderate line height,
- avoid tiny text,
- avoid overly decorative fonts.

Possible font direction:

- system font stack first for simplicity,
- later evaluate Inter, Geist, or similar professional UI font.

---

## 9. Color Direction

Initial color direction:

- neutral background,
- white or near-white cards,
- dark readable text,
- muted secondary text,
- one primary accent color,
- semantic colors for status.

Semantic color categories:

- success,
- warning,
- danger,
- info,
- neutral.

Do not rely only on color for meaning. Use labels and icons where helpful.

---

## 10. Status Labels

Statuses should be shown as clear badges or labels.

Examples:

Appointment:

- scheduled,
- confirmed,
- arrived,
- completed,
- cancelled,
- no-show.

Treatment plan:

- draft,
- proposed,
- accepted,
- in progress,
- completed,
- paused,
- rejected.

Payment:

- unpaid,
- partially paid,
- paid,
- advance.

Inventory:

- in stock,
- low stock,
- out of stock,
- expiring soon.

---

## 11. Cards

Cards should be used for grouped information.

Good uses:

- patient summary,
- warning box,
- treatment plan summary,
- payment summary,
- inventory status,
- dashboard widgets.

Cards should not be overused where tables are better.

---

## 12. Tables

Tables are important for:

- patients,
- appointments,
- services,
- payments,
- commissions,
- inventory,
- reports.

Table principles:

- readable columns,
- sticky or clear headers where useful,
- search/filter above table,
- row actions should be clear,
- avoid too many columns on mobile,
- use responsive card/list layout on small screens.

---

## 13. Forms

Forms should be simple and guided.

Form principles:

- group related fields,
- show required fields clearly,
- use validation messages,
- use sensible defaults,
- avoid long unstructured forms,
- save/cancel actions should be clear,
- sensitive changes may require confirmation.

---

## 14. Buttons and Actions

Use clear action hierarchy:

Primary action:

- main action on page.

Secondary action:

- useful but less important.

Danger action:

- delete, archive, cancel, sensitive correction.

Examples:

- Add patient
- Create appointment
- Add treatment item
- Record payment
- Create material request
- Approve request
- Archive plan

Avoid too many primary buttons on one screen.

---

## 15. Alerts and Warnings

Warnings must be highly visible.

Examples:

- allergy,
- medical warning,
- unpaid balance,
- patient blocked,
- low stock,
- expired material,
- permission denied.

Medical warnings should be visually distinct but not visually aggressive.

---

## 16. Empty States

Empty states should guide action.

Examples:

No patients found:

- explain that no patients match the search,
- offer clear reset or add patient action.

No treatment plan:

- explain that no treatment plan exists,
- show create treatment plan action if allowed.

No material requests:

- explain that there are no open requests,
- show create request action if allowed.

---

## 17. Icons

Icons may help scanning, but should not replace text.

Use icons for:

- patients,
- calendar,
- payments,
- inventory,
- reports,
- settings,
- warning,
- document,
- search,
- filter.

Icons should be consistent and minimal.

Possible library:

- lucide-react.

---

## 18. Accessibility

DentApp should follow accessibility basics:

- sufficient contrast,
- visible focus states,
- keyboard-friendly forms,
- labels for inputs,
- readable font sizes,
- meaningful error messages,
- not relying only on color.

---

## 19. Tailwind Direction

Tailwind CSS will be used.

Design should use consistent utility patterns for:

- spacing,
- typography,
- borders,
- cards,
- buttons,
- badges,
- forms,
- tables,
- responsive layout.

Later, reusable components should hide repeated Tailwind patterns.

---

## 20. Initial Design Tokens

Initial token categories to define later:

- colors,
- spacing,
- radius,
- shadows,
- typography,
- borders,
- status colors,
- layout widths.

MVP can begin with simple Tailwind defaults, then refine.

---

## 21. Open Questions

- Should DentApp use light mode only for MVP?
- Should dark mode be supported later?
- Which primary accent color best fits the brand?
- Should UI be in Serbian from the beginning?
- Should terminology be Latin script only or support Cyrillic later?
- Should doctors get a more clinical patient-focused layout?
- Should owner/admin get a more reporting-focused layout?
