# DentApp — Decisions Log

This document records important project decisions.

Each decision should include:

- date,
- decision,
- reason,
- impact,
- status.

Status examples:

- Proposed
- Accepted
- Rejected
- Revisit later

---

## Decision 001 — Project Working Name

Date: 2026-05-10

Decision:

Use `DentApp` as the working project name.

Reason:

The name is simple, clear, and suitable for internal planning.

Impact:

All documentation and initial project folders will use the DentApp name.

Status: Accepted

---

## Decision 002 — Initial Target Customer

Date: 2026-05-10

Decision:

The initial target customer is one dental practice with multiple doctors.

Reason:

This model is common in Serbia and regionally, and the founder has access to a real pilot practice with this structure.

Impact:

The MVP will focus on internal workflows for a multi-doctor practice, not solo practice only and not large multi-location clinics.

Status: Accepted

---

## Decision 003 — Pilot-First Approach

Date: 2026-05-10

Decision:

Build the first version as a pilot/custom solution for a real dental practice, while keeping architecture SaaS-ready.

Reason:

Real workflow validation is critical for this product. The pilot reduces product risk and helps discover real requirements.

Impact:

The first version will be tested in a real environment, but the product should avoid hardcoded pilot-specific logic.

Status: Accepted

---

## Decision 004 — Initial Use Is Internal Only

Date: 2026-05-10

Decision:

The first version will be for internal practice use only.

Reason:

The core workflow must be validated before adding patient-facing complexity.

Impact:

Patient portal, online booking, and automated patient communication are excluded from initial MVP.

Status: Accepted

---

## Decision 005 — Initial Stack

Date: 2026-05-10

Decision:

Use React + Vite + TypeScript + Supabase for the pilot.

Reason:

This stack allows fast development, good developer experience, and enough backend capability for an MVP through PostgreSQL, Auth, Storage, and RLS.

Impact:

The initial project was created as a Vite React TypeScript project.

Status: Accepted

---

## Decision 006 — Markdown as Primary Documentation Format

Date: 2026-05-10

Decision:

Use Markdown as the primary project documentation format.

Reason:

Markdown is easy for Codex/Cursor to read, easy to version-control, and easy to maintain in GitHub.

Impact:

Project documentation is stored under `docs/` as `.md` files.

Status: Accepted

---

## Decision 007 — Dedicated Codex Documentation Folder

Date: 2026-05-10

Decision:

Create a dedicated `docs/08_codex/` folder.

Reason:

Codex/Cursor need concise and clear project context, rules, templates, and instructions.

Impact:

The project includes dedicated Codex context, rules, task template, review checklist, and prompt library files.

Status: Accepted

---

## Decision 008 — Multi-Tenant Ready From Day One

Date: 2026-05-10

Decision:

Even though the pilot is for one practice, the architecture should be multi-tenant ready.

Reason:

The long-term goal is SaaS commercialization.

Impact:

Core data models should include `clinic_id` or equivalent ownership fields where appropriate.

Status: Accepted

---

## Decision 009 — No Real Patient Data in Repository

Date: 2026-05-10

Decision:

Real patient data must never be stored in GitHub, documentation, seed files, tests, or screenshots.

Reason:

DentApp handles sensitive health and financial data.

Impact:

Only fake, demo, or anonymized data may be used during development and documentation.

Status: Accepted

---

## Decision 010 — Coding Starts After Foundation Documentation

Date: 2026-05-10

Decision:

Do not start application feature coding until the initial foundation documentation is completed.

Reason:

The risk of building the wrong workflow is higher than the risk of slow initial coding.

Impact:

The current phase focuses on product vision, project charter, Codex rules, MVP scope, discovery, and architecture documents.

Status: Accepted

---

## Decision 011 — Tailwind CSS Vite Plugin Setup

Date: 2026-05-10

Decision:

Use Tailwind CSS through the official Vite plugin package, `@tailwindcss/vite`, with `@import "tailwindcss";` in the main CSS entry file.

Reason:

This matches the current Tailwind setup path for Vite projects and keeps styling configuration simple for the Phase 1 foundation.

Impact:

`vite.config.ts` includes the Tailwind plugin, and Tailwind utility classes are available throughout the React app.

Status: Accepted

---

## Decision 012 — React Router for MVP Routing

Date: 2026-05-10

Decision:

Use `react-router-dom` for DentApp MVP frontend routing.

Reason:

React Router is a standard routing option for React applications and fits the Phase 1 need for simple route-based placeholder pages before app shell, permissions, and data loading are introduced.

Impact:

Initial route paths are centralized in `src/routes/routePaths.ts`, route composition lives in `src/routes/AppRoutes.tsx`, and `src/App.tsx` renders the router through `BrowserRouter`.

Status: Accepted
