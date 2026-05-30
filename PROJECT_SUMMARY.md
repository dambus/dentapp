# DentApp — Comprehensive Project Summary

## 1. Project Overview

**DentApp** is a dental practice management application. Current goal: validate a dental workflow management system as a pilot in a real dental clinic (Serbia), with the long-term objective of a multi-tenant SaaS product targeting dental practices in the region.

**Status:** Phases 1–3 in progress. Core clinical and scheduling features are implemented; financial settlement features are temporarily frozen behind a feature toggle.

---

## 2. Complete Folder / File Structure

```
dentapp/
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── eslint.config.js
├── vite.config.ts
├── .env.example
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── app/                         # App-level config
│   ├── assets/
│   ├── components/
│   │   └── ui/                      # Shared UI primitives
│   │       ├── Button.tsx / ButtonLink.tsx / IconButton.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx / TypeBadge.tsx / StatusBadge.tsx
│   │       ├── MetricTile.tsx
│   │       ├── InlineNotice.tsx
│   │       ├── EmptyState.tsx / ErrorState.tsx / LoadingState.tsx
│   │       ├── ActionMenu.tsx
│   │       ├── SectionTabs.tsx
│   │       ├── BackLink.tsx
│   │       └── FormControls.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── types.ts
│   │   │   ├── authService.ts
│   │   │   ├── profileService.ts
│   │   │   ├── demoAuth.ts
│   │   │   └── hooks/
│   │   │       ├── useAuthSession.ts
│   │   │       └── useCurrentProfile.ts
│   │   │
│   │   ├── patients/
│   │   │   ├── types.ts
│   │   │   ├── patientService.ts
│   │   │   ├── patientMedicalRecordService.ts
│   │   │   ├── clinicalNotesService.ts
│   │   │   ├── odontogramService.ts
│   │   │   ├── treatmentPlanService.ts
│   │   │   ├── demoPatients.ts
│   │   │   └── components/
│   │   │       ├── PatientForm.tsx
│   │   │       ├── PatientMedicalRecordForm.tsx
│   │   │       ├── PatientFullRecord.tsx
│   │   │       ├── PatientSnapshot.tsx
│   │   │       ├── PatientAppointmentSummary.tsx
│   │   │       ├── PatientLatestClinicalActivity.tsx
│   │   │       ├── PatientTodayPanel.tsx
│   │   │       ├── PatientVisitTimeline.tsx
│   │   │       ├── PatientFollowUpSummary.tsx
│   │   │       ├── PatientTreatmentPlanSummary.tsx
│   │   │       ├── PatientQuickActions.tsx
│   │   │       ├── OdontogramSection.tsx
│   │   │       ├── ClinicalNotesSection.tsx
│   │   │       └── TreatmentPlansSection.tsx
│   │   │
│   │   ├── appointments/
│   │   │   ├── appointmentService.ts
│   │   │   └── components/
│   │   │       └── AppointmentCard.tsx
│   │   │
│   │   ├── visits/
│   │   │   ├── visitCompletionService.ts
│   │   │   └── components/
│   │   │       ├── VisitCompletionFlow.tsx
│   │   │       └── VisitCompletionSummary.tsx
│   │   │
│   │   ├── performed-services/
│   │   │   ├── performedServicesService.ts
│   │   │   └── components/
│   │   │       └── PerformedServicesDraftEditor.tsx
│   │   │
│   │   ├── patient-ledger/
│   │   │   ├── patientLedgerService.ts
│   │   │   └── components/
│   │   │       └── PatientPostedChargesSection.tsx
│   │   │
│   │   └── patient-payments/
│   │       └── patientPaymentService.ts
│   │
│   ├── layouts/
│   │   ├── AppShell.tsx
│   │   ├── TopBar.tsx
│   │   └── SidebarNav.tsx
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── PatientDetailPage.tsx
│   │   ├── PatientCreatePage.tsx
│   │   ├── PatientEditPage.tsx
│   │   ├── PatientMedicalRecordEditPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── AppointmentDetailPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── TreatmentPlansPage.tsx
│   │   ├── VisitCompletionPage.tsx
│   │   ├── PatientVisitDetailPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── CommissionsPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── PermissionDeniedPage.tsx
│   │   ├── ProfileRequiredPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleGuard.tsx
│   │   ├── routePaths.ts
│   │   ├── routeAccessConfig.ts
│   │   └── navigationConfig.ts
│   │
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   ├── env.ts
│   │   └── testSupabaseConnection.ts
│   │
│   ├── hooks/
│   └── styles/
│
├── supabase/
│   ├── migrations/              # 26 SQL migration files
│   ├── snippets/
│   └── seed.sql
│
└── docs/
    ├── 00_project/              # Charter, vision, decisions, glossary
    ├── 01_discovery/            # Workflow maps, interview notes, feedback logs
    ├── 02_product/              # MVP scope, backlog, user roles, permissions
    ├── 03_domain/               # Dental models (odontogram, treatment, payments)
    ├── 04_ux_ui/                # Design system, screen maps, flows
    ├── 05_technical/            # Architecture, RLS, DB schema, storage strategy
    ├── 06_compliance/           # Legal (Serbia), data protection, consent templates
    ├── 07_execution/            # Phase checklists, changelog
    ├── 08_codex/                # AI prompt library, task templates, review rules
    └── design/                  # 60+ task-based implementation design docs
```

---

## 3. Tech Stack & Key Dependencies

### package.json

```json
{
  "name": "dentapp",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "2.105.4",
    "lucide-react": "1.16.0",
    "react": "19.2.5",
    "react-dom": "19.2.5",
    "react-router-dom": "7.15.0",
    "tailwindcss": "4.3.0"
  },
  "devDependencies": {
    "@eslint/js": "...",
    "@types/react": "...",
    "@types/react-dom": "...",
    "@vitejs/plugin-react": "...",
    "eslint": "...",
    "eslint-plugin-react-hooks": "...",
    "eslint-plugin-react-refresh": "...",
    "globals": "...",
    "typescript": "6.0.2",
    "typescript-eslint": "...",
    "vite": "8.0.10"
  }
}
```

### Stack Summary

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Icons | Lucide React |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Security | Row Level Security (RLS) |

---

## 4. Database Schema (All Migrations)

26 migrations, date range: 2026-05-10 → 2026-05-26

### Core Tables

#### `clinics`
Multi-tenant root. Every other table scoped to `clinic_id`.
```sql
id uuid PK
name text NOT NULL
slug text UNIQUE
is_active boolean DEFAULT true
created_at, updated_at timestamptz
```

#### `profiles`
Application users (linked to `auth.users`).
```sql
id uuid PK (references auth.users)
clinic_id uuid FK → clinics
full_name text
role text  -- owner_admin | doctor | specialist | assistant | reception_admin | inventory_responsible
is_active boolean DEFAULT true
created_at, updated_at timestamptz
```

#### `patients`
Patient master records.
```sql
id uuid PK
clinic_id uuid FK → clinics
first_name, last_name text NOT NULL
date_of_birth date
gender text  -- male | female | other
phone, email text
address text
created_by uuid FK → profiles
deleted_at timestamptz  -- soft delete
created_at, updated_at timestamptz
```

#### `patient_medical_records`
One-per-patient medical summary.
```sql
id uuid PK
patient_id uuid FK → patients UNIQUE
clinic_id uuid FK → clinics
allergies text
chronic_conditions text
current_medications text
notes text
updated_by uuid FK → profiles
created_at, updated_at timestamptz
```

#### `clinical_notes`
Dated clinical documentation entries.
```sql
id uuid PK
patient_id uuid FK → patients
clinic_id uuid FK → clinics
note_date date NOT NULL
content text NOT NULL
created_by uuid FK → profiles
created_at, updated_at timestamptz
```

#### `audit_logs`
Append-only audit trail. Insert-only via RLS.
```sql
id uuid PK
clinic_id uuid FK → clinics
performed_by uuid FK → profiles
action text NOT NULL
entity_type text NOT NULL
entity_id uuid
old_data jsonb
new_data jsonb
metadata jsonb
created_at timestamptz
```

### Dental Clinical Tables

#### `patient_tooth_statuses` (Odontogram)
FDI tooth numbering system.
```sql
id uuid PK
patient_id uuid FK → patients
clinic_id uuid FK → clinics
tooth_number integer NOT NULL  -- FDI notation
surface text  -- mesial | distal | occlusal | buccal | lingual | whole
status text   -- healthy | caries | filled | missing | crown | implant | ...
notes text
recorded_by uuid FK → profiles
recorded_at timestamptz
created_at, updated_at timestamptz
UNIQUE(patient_id, tooth_number, surface)
```

#### `treatment_plans`
Patient treatment planning header.
```sql
id uuid PK
patient_id uuid FK → patients
clinic_id uuid FK → clinics
title text NOT NULL
status text  -- draft | active | completed | cancelled
created_by uuid FK → profiles
deleted_at timestamptz
created_at, updated_at timestamptz
```

#### `treatment_plan_items`
Individual line items within a treatment plan.
```sql
id uuid PK
treatment_plan_id uuid FK → treatment_plans
clinic_id uuid FK → clinics
tooth_number integer
description text NOT NULL
status text  -- pending | in_progress | completed | skipped
sort_order integer
created_at, updated_at timestamptz
```

### Scheduling & Visit Workflow

#### `appointments`
```sql
id uuid PK
clinic_id uuid FK → clinics
patient_id uuid FK → patients
provider_id uuid FK → profiles  -- assigned doctor/specialist
appointment_date date NOT NULL
start_time time NOT NULL
end_time time
reason text
status text  -- scheduled | confirmed | completed | cancelled | no_show
operational_status text  -- waiting | in_chair | done (day-of tracking)
notes text
created_by uuid FK → profiles
deleted_at timestamptz
created_at, updated_at timestamptz
```

#### `visits`
Visit completion records (links appointment → clinical outcome).
```sql
id uuid PK
clinic_id uuid FK → clinics
patient_id uuid FK → patients
appointment_id uuid FK → appointments UNIQUE
visited_at timestamptz NOT NULL
provider_id uuid FK → profiles
notes text
completed_by uuid FK → profiles
created_at, updated_at timestamptz
```

#### `visit_procedures`
Clinical procedures performed during a visit.
```sql
id uuid PK
visit_id uuid FK → visits
clinic_id uuid FK → clinics
tooth_number integer
procedure_description text NOT NULL
created_at timestamptz
```

### Service Catalog & Billing

#### `service_categories`
```sql
id uuid PK
clinic_id uuid FK → clinics
name text NOT NULL
sort_order integer
is_active boolean DEFAULT true
created_at, updated_at timestamptz
```

#### `services`
Chargeable service catalog.
```sql
id uuid PK
clinic_id uuid FK → clinics
category_id uuid FK → service_categories
name text NOT NULL
default_price numeric(10,2)
is_active boolean DEFAULT true
deleted_at timestamptz
created_at, updated_at timestamptz
```

#### `performed_services`
Immutable service delivery records (billing snapshots).
```sql
id uuid PK
clinic_id uuid FK → clinics
patient_id uuid FK → patients
visit_id uuid FK → visits
service_id uuid FK → services
service_name_snapshot text NOT NULL   -- immutable snapshot
price_snapshot numeric(10,2) NOT NULL -- price at time of service
tooth_number integer
performed_by uuid FK → profiles
performed_at timestamptz NOT NULL
created_at timestamptz
```

### Financial Management

#### `patient_ledger_entries`
Append-only financial ledger.
```sql
id uuid PK
clinic_id uuid FK → clinics
patient_id uuid FK → patients
entry_type text   -- charge | payment | adjustment | write_off
amount numeric(10,2) NOT NULL
description text
reference_id uuid  -- FK to performed_services or payments
entry_date date NOT NULL
created_by uuid FK → profiles
created_at timestamptz
```

#### `patient_payments`
Payment records.
```sql
id uuid PK
clinic_id uuid FK → clinics
patient_id uuid FK → patients
amount numeric(10,2) NOT NULL
payment_method text  -- cash | card | transfer | other
payment_date date NOT NULL
notes text
received_by uuid FK → profiles
created_at, updated_at timestamptz
```

### RLS Helper Functions

```sql
current_profile_id()   → uuid     -- profiles.id for session user
current_clinic_id()    → uuid     -- clinic_id from current profile
current_user_role()    → text     -- role from current profile
is_active_profile()    → boolean  -- profile exists and is active
has_role(role text)    → boolean  -- role check helper
create_audit_log(...)             -- RPC for inserting audit entries
```

### RLS Policy Pattern

All tables enforce: `clinic_id = current_clinic_id()` and `is_active_profile()`.
Roles with write access vary per table (e.g., only `owner_admin`/`reception_admin` can create patients).

### Frozen Features (Migration 20260525103000)

The following are disabled until the internal settlement feature toggle is ready:
- `patient_ledger_entries` (writes)
- `patient_payments` (writes)
- `performed_services` (writes)
- Related RPC functions

---

## 5. Key TypeScript Types & Interfaces

### Auth Types (`src/features/auth/types.ts`)

```typescript
type AppRole =
  | 'owner_admin'
  | 'doctor'
  | 'specialist'
  | 'assistant'
  | 'reception_admin'
  | 'inventory_responsible';

interface AppProfile {
  id: string;
  clinic_id: string;
  full_name: string;
  role: AppRole;
  is_active: boolean;
}

interface AuthSessionResult {
  session: Session | null;
  profile: AppProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActionResult {
  success: boolean;
  error?: string;
}

interface ProfileLoadResult {
  profile: AppProfile | null;
  error?: string;
}

type AuthSessionListener = (result: AuthSessionResult) => void;
```

### Patient Types (`src/features/patients/types.ts`)

```typescript
type PatientStatus = 'active' | 'inactive' | 'archived';

interface DemoPatient {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  status: PatientStatus;
  // Nested context for demo
  appointments: DemoAppointment[];
  treatment_plans: DemoTreatmentPlan[];
  clinical_notes: DemoClinicalNote[];
  timeline: DemoTimelineEvent[];
}

interface DemoTimelineEvent {
  id: string;
  type: 'appointment' | 'visit' | 'note' | 'payment';
  date: string;
  description: string;
  metadata?: Record<string, unknown>;
}
```

---

## 6. Main Components List

### Shared UI (`src/components/ui/`)
- `Button`, `ButtonLink`, `IconButton`
- `Card`
- `Badge`, `TypeBadge`, `StatusBadge`
- `MetricTile`
- `InlineNotice`
- `EmptyState`, `ErrorState`, `LoadingState`
- `ActionMenu`
- `SectionTabs`
- `BackLink`
- `FormControls`

### Layout
- `AppShell` — main container with sidebar
- `TopBar` — header bar
- `SidebarNav` — navigation menu

### Pages
- `DashboardPage`
- `PatientsPage`, `PatientDetailPage`, `PatientCreatePage`, `PatientEditPage`, `PatientMedicalRecordEditPage`
- `AppointmentsPage`, `AppointmentDetailPage`, `CalendarPage`
- `TreatmentPlansPage`
- `VisitCompletionPage`, `PatientVisitDetailPage`
- `ReportsPage`, `CommissionsPage`, `InventoryPage`, `SettingsPage` (placeholder pages)
- `LoginPage`, `PermissionDeniedPage`, `ProfileRequiredPage`, `NotFoundPage`

### Feature Components

**Patients:**
- `PatientForm`, `PatientMedicalRecordForm`
- `PatientFullRecord`, `PatientSnapshot`
- `PatientAppointmentSummary`, `PatientLatestClinicalActivity`, `PatientTodayPanel`
- `PatientVisitTimeline`, `PatientFollowUpSummary`, `PatientTreatmentPlanSummary`
- `PatientQuickActions`
- `OdontogramSection`
- `ClinicalNotesSection`
- `TreatmentPlansSection`

**Visits:**
- `VisitCompletionFlow`, `VisitCompletionSummary`

**Appointments:**
- `AppointmentCard`

**Billing:**
- `PerformedServicesDraftEditor`
- `PatientPostedChargesSection`

### Route Guards
- `ProtectedRoute` — requires authenticated session
- `RoleGuard` — requires specific role(s)

---

## 7. AI / Agent Integration

**None currently.** No OpenAI, Anthropic, LangChain, or any LLM SDK is present in the source code or dependencies.

The project does maintain a documentation section (`docs/08_codex/`) containing AI prompt templates, task templates, and review checklists — these are developer-facing workflow aids used externally (i.e., prompts fed to Claude or ChatGPT manually), not in-app integrations.

---

## 8. Environment Variables

```env
VITE_SUPABASE_URL=          # Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Public anon key
VITE_PATIENT_DATA_SOURCE=demo  # "demo" skips DB; anything else uses real Supabase
```

---

## 9. Key Architectural Decisions

| Decision | Detail |
|---|---|
| Multi-tenant | All records scoped by `clinic_id` |
| Security model | Database-level RLS; 6-role RBAC |
| Soft deletes | `deleted_at` columns across main entities |
| Audit trail | Append-only `audit_logs`, insert-only via RLS |
| Billing immutability | `performed_services` stores name/price snapshots |
| Feature toggles | Financial writes frozen via migration until toggle is ready |
| Demo mode | Full UI and workflows work without a Supabase connection (`VITE_PATIENT_DATA_SOURCE=demo`) |
| Documentation-first | Extensive `docs/` structure; design docs precede implementation |

---

## 10. Development Phase Status

| Area | Status |
|---|---|
| Patient CRUD + medical records | Complete |
| Clinical notes | Complete |
| Odontogram | Complete |
| Treatment plans | Complete |
| Appointment scheduling | Complete |
| Visit completion workflow | Complete |
| Service catalog | Complete |
| Performed services recording | Complete (writes frozen) |
| Patient ledger | Complete (writes frozen) |
| Payment recording | Complete (writes frozen) |
| Doctor commissions | Infrastructure ready; UI deferred |
| Inventory | Placeholder page only |
| Reports | Placeholder page only |
| Print / export | Design phase |
| Multi-language | Future |
