# DentApp — Deployment Strategy

## 1. Purpose

This document defines the initial deployment strategy for DentApp.

DentApp will be built as a responsive web application with Supabase as the backend platform.

Deployment must be simple enough for the MVP, but secure enough for future pilot use with sensitive data.

---

## 2. Initial Deployment Goals

Deployment should support:

- fast development,
- safe testing,
- clear environment separation,
- secure environment variables,
- stable production pilot,
- easy rollback where possible,
- future SaaS commercialization.

---

## 3. Environments

Recommended environments:

### 3.1 Development

Used locally by the developer/founder.

Contains:

- local code,
- fake/demo data,
- development Supabase project or local Supabase later.

Should not contain real patient data.

### 3.2 Staging

Used for testing before production.

Contains:

- test deployment,
- fake or anonymized data,
- staging Supabase project,
- pre-production configuration.

Purpose:

- test migrations,
- test RLS,
- test storage,
- test UI,
- test flows before production.

### 3.3 Production

Used by the real pilot clinic.

Contains:

- real users,
- real patient data,
- production Supabase project,
- production storage,
- restricted access,
- backups,
- monitoring.

---

## 4. Frontend Hosting

Initial frontend hosting options:

- Netlify,
- Vercel.

Either is acceptable for MVP.

Important:

- configure environment variables securely,
- do not expose service role keys,
- only use VITE_ variables that are safe for frontend,
- understand that VITE_ variables are included in client bundle,
- never put Supabase service role key in frontend.

---

## 5. Backend Hosting

Initial backend:

- Supabase.

Use Supabase for:

- PostgreSQL database,
- Auth,
- Storage,
- RLS,
- Edge Functions if needed later.

Production Supabase project should ideally be in an EU region where possible.

---

## 6. Environment Variables

Expected frontend variables:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Rules:

- .env must not be committed,
- .env.example may include variable names only,
- service role key must never be exposed in frontend,
- production variables must be configured in hosting provider dashboard,
- staging and production must use different Supabase projects or carefully separated environments.

---

## 7. Git Branching

Recommended simple branching model:

- main: production-ready code,
- staging: pre-production testing,
- feature/*: feature work,
- fix/*: bug fixes.

For early solo development, this may be simplified, but production deployment should not happen from random unreviewed work.

---

## 8. Deployment Flow

Recommended flow:

1. Develop locally.
2. Commit changes.
3. Push to GitHub.
4. Deploy to staging.
5. Test staging.
6. Run migrations on staging first.
7. Validate RLS and storage.
8. Approve production deployment.
9. Deploy frontend to production.
10. Run production migrations carefully.
11. Smoke test production.

---

## 9. Migration Deployment

Database migrations should be stored in:

    supabase/migrations/

Before production migration:

- test migration locally or in staging,
- create backup,
- review destructive changes,
- confirm rollback/correction path,
- run during low-usage period.

Never run untested destructive migrations on production.

---

## 10. Build and Test Commands

Common commands:

    npm install
    npm run dev
    npm run build
    npm run preview

Before deployment:

- run npm run build,
- check TypeScript/build errors,
- test main screens,
- confirm no real data is included in code.

---

## 11. Preview Deployments

Preview deployments are useful for:

- testing UI changes,
- reviewing features,
- showing pilot stakeholders,
- checking responsive behavior.

Preview deployments must not connect to production data unless carefully controlled.

---

## 12. Production Pilot Checklist

Before production pilot:

- production Supabase project created,
- production frontend deployment configured,
- environment variables configured,
- RLS enabled and tested,
- storage buckets private,
- backup strategy confirmed,
- admin user created,
- demo data removed,
- real users invited,
- audit log enabled for key actions,
- legal/compliance assumptions reviewed,
- support process defined.

---

## 13. Monitoring

Initial monitoring should include:

- build/deployment status,
- application errors,
- Supabase project health,
- database usage,
- storage usage,
- authentication issues.

Possible future tools:

- Sentry,
- PostHog,
- Better Stack,
- UptimeRobot.

Monitoring can be added gradually but should exist before commercial SaaS.

---

## 14. Rollback Strategy

Frontend rollback:

- use hosting provider deploy history if available.

Database rollback:

- more difficult,
- avoid destructive migrations,
- use backups,
- create corrective migrations.

Storage rollback:

- depends on backup/recovery approach.

---

## 15. Security Before Production

Before production:

- confirm no .env is committed,
- confirm no real patient data in GitHub,
- confirm no service role key in frontend,
- confirm storage buckets are not public,
- confirm RLS is enabled on sensitive tables,
- confirm test users cannot access unauthorized data,
- confirm backups are available,
- confirm owner/admin accounts are protected.

---

## 16. Commercial SaaS Future

For commercial SaaS, deployment may need:

- separate production/staging projects,
- stronger monitoring,
- formal incident response,
- automated backups,
- billing integration,
- regional hosting decisions,
- stronger legal/compliance review,
- uptime targets,
- support process,
- data processing agreements.

---

## 17. Open Questions

- Netlify or Vercel for production pilot?
- One Supabase project or separate dev/staging/prod projects?
- Should Supabase local development be used immediately?
- Which Supabase plan is needed for pilot?
- Who will have production admin access?
- What is the support process during pilot?
- How will production incidents be handled?
- When should monitoring tools be added?
