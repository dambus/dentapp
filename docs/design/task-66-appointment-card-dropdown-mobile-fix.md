# Task 66 - Appointment Card Dropdown Anchoring / Mobile Menu Fix

This task fixes the AppointmentCard secondary action menu position on responsive schedule cards.

## Issue

Visual QA found that the appointment card menu trigger could move based on card content, status badge wrapping, and viewport width. On narrow screens, the opened menu could also risk viewport overflow.

## UI Fix

Updated `src/features/appointments/AppointmentCard.tsx`:

- the card root is now `relative`;
- the `Appointment actions` menu trigger is positioned in an absolute top-right card slot;
- the time/patient header reserves right-side space so text does not overlap the trigger;
- the status badge row no longer owns the trigger and can wrap independently;
- on wider screens, status badges reserve right-side space near the fixed trigger;
- the opened menu keeps the existing viewport-bounded width classes from the responsive overflow work.

This keeps the menu visually anchored while preserving card hierarchy:

- time and patient remain primary;
- status badges stay readable and wrap safely;
- assigned provider and reason/type metadata remain unchanged;
- primary actions and lifecycle menu behavior remain unchanged.

## Smoke Coverage

Updated `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`:

- added a scheduled fixture appointment for menu anchoring checks;
- added a coarse geometry check that verifies the menu trigger is in the card upper-right area;
- opens the appointment menu during responsive overflow smoke;
- verifies opening the menu does not create horizontal overflow;
- verifies the opened menu remains within the viewport.

The check runs through the existing responsive viewport set:

- 390px;
- 430px;
- 500px;
- 912px;
- 1440px.

## Boundaries

No appointment lifecycle logic, provider filtering, provider URL params, Visit Completion behavior, schema, migrations, RLS, provider workload calendar, availability logic, or new appointment states were changed.
