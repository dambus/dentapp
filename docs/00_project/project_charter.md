# DentApp — Project Charter

## 1. Project Name

Working name: DentApp

The name is temporary and can be changed before commercialization.

---

## 2. Project Purpose

The purpose of this project is to design, build, and validate a dental practice management application for internal use in a real dental practice with multiple doctors.

The pilot version should solve real daily problems before the product is commercialized as a SaaS solution.

---

## 3. Project Background

The founder has direct access to real dental practice workflows through a dental professional partner.

This gives the project a strong advantage because the product can be designed and tested in a real environment, with feedback from actual doctors and staff.

The project should use this advantage carefully by observing real workflows, documenting problems, validating assumptions, and building incrementally.

---

## 4. Initial Project Objective

The initial objective is to build a pilot application that helps one dental practice manage:

- patients,
- records,
- treatment plans,
- appointments,
- performed services,
- payments and debts,
- doctor commission,
- inventory,
- material requests,
- reports,
- documentation export.

---

## 5. Business Objective

The business objective is to create a product that can later be sold as a SaaS solution to dental practices in Serbia and the region.

The pilot should not become a one-off custom application that cannot be reused.

The application must be configurable and multi-tenant ready from the beginning.

---

## 6. Pilot Strategy

The first version will be tested in a real dental practice.

The pilot practice will be used to:

- validate workflows,
- identify missing features,
- test usability,
- discover edge cases,
- check terminology,
- improve data structure,
- validate reporting needs,
- understand adoption challenges.

The pilot should run in parallel with existing processes until the system is trusted.

---

## 7. Project Roles

### Founder / Product Owner

Responsible for:

- product direction,
- priorities,
- scope decisions,
- business decisions,
- approval of major functionality.

### Dental Domain Expert

Responsible for:

- explaining real clinical workflows,
- validating terminology,
- reviewing patient record structure,
- reviewing treatment plan logic,
- testing usability from a dental perspective.

### Product Manager Role

Responsible for:

- converting business needs into structured requirements,
- defining MVP,
- managing backlog,
- documenting decisions,
- preventing scope creep.

### UX/UI Role

Responsible for:

- workflow mapping,
- screen structure,
- usability,
- responsive behavior,
- interface clarity.

### Software Architect Role

Responsible for:

- technical architecture,
- database design,
- security model,
- Supabase structure,
- scalability decisions.

### Developer Role

Responsible for:

- implementation,
- code quality,
- migrations,
- testing,
- bug fixing.

### QA Role

Responsible for:

- testing real workflows,
- validating acceptance criteria,
- finding edge cases,
- checking regressions.

### Compliance Role

Responsible for:

- identifying legal/data risks,
- access control requirements,
- audit and retention needs,
- export/print requirements.

---

## 8. Initial Technology Direction

The initial technology direction is:

- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security

The stack is selected because it supports fast MVP development while still allowing a serious and structured application.

---

## 9. Project Principles

The project should follow these principles:

1. Document before coding.
2. Build incrementally.
3. Validate with real users.
4. Keep MVP focused.
5. Avoid over-customization.
6. Design for future SaaS use.
7. Protect sensitive data from day one.
8. Keep all core decisions documented.
9. Use fake/demo data during development.
10. Update progress and todo documents after each task.

---

## 10. Initial Success Criteria

The pilot MVP is successful if the practice can quickly answer:

- Who is scheduled today?
- What is the next step for this patient?
- What treatment plan was agreed?
- What has been performed?
- What remains to be done?
- How much does the patient owe?
- Which doctor performed which work?
- How much belongs to each doctor?
- Which materials are running low?
- Who requested or approved material purchase?
- What happened during the last visit?

---

## 11. Major Risks

### 11.1 Scope Creep

The application can easily become too broad.

Mitigation:

- define MVP clearly,
- keep future ideas in backlog,
- do not implement unapproved features.

### 11.2 Over-Customization

The pilot practice may influence the system too narrowly.

Mitigation:

- use configurable settings,
- avoid hardcoded practice-specific logic,
- document what is universal vs pilot-specific.

### 11.3 Compliance Risk

The product handles health and financial data.

Mitigation:

- legal research,
- access control,
- audit logs,
- backup strategy,
- export/print support.

### 11.4 Adoption Risk

Staff may reject the system if it slows them down.

Mitigation:

- observe real workflows,
- design simple screens,
- reduce data entry burden,
- test with real users.

### 11.5 Data Quality Risk

Reports will be poor if users do not enter data consistently.

Mitigation:

- guided workflows,
- required fields only where needed,
- smart defaults,
- clear ownership of data entry.

---

## 12. Current Phase

Current phase:

Project foundation and product discovery.

No application features should be implemented until the initial documentation package is sufficiently defined.

---

## 13. Next Milestones

1. Complete project foundation documents.
2. Complete Codex/Cursor instruction documents.
3. Prepare product discovery interview checklist.
4. Prepare clinic workflow observation template.
5. Define MVP scope in detail.
6. Define roles and permissions.
7. Define data model v1.
8. Define UX screen map.
9. Define technical architecture.
10. Start Phase 1 implementation.
