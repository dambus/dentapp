# Task 65 - Responsive Overflow Smoke Guard

This task adds browser-smoke coverage for horizontal viewport overflow on key clinical screens.

## Context

Task 64 build/lint and workflow smoke checks passed, but visual QA later found mobile/tablet horizontal overflow on the Appointments page. The Task 64B fix addressed the observed layout issue; Task 65 adds a guard so similar regressions fail browser smoke.

## Smoke Helper

`supabase/snippets/testPatientAppointmentBrowserSmoke.mjs` now includes:

- `setViewport()`;
- `assertNoHorizontalOverflow()`;
- `runResponsiveOverflowSmoke()`.

The assertion checks:

- `document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2`;
- `document.body.scrollWidth <= document.body.clientWidth + 2`.

Failures include:

- screen label;
- viewport width;
- document scroll/client widths;
- body scroll/client widths;
- tolerance.

## Viewports

The smoke guard runs at:

- 390px mobile;
- 430px mobile;
- 912px tablet portrait;
- 1440px desktop.

## Covered Screens

The guard reuses the existing authenticated browser smoke session and checks:

- Appointments daily schedule;
- Appointments weekly schedule;
- Patient overview;
- Patient timeline;
- Appointment detail;
- Visit Completion;
- Completed visit detail.

No product behavior, schema, migrations, RLS, provider workload, availability logic, or appointment states were changed.
