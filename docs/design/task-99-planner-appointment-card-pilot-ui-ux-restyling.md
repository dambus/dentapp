# Task 99 - Planner and Appointment Card Pilot UI/UX Restyling

## Why This Surface

The planner is the first repeated operational screen for the in-clinic pilot.
After Task 98 removed the treatment-plan write UI blocker, the main pilot risk
shifted from missing capability to whether reception and clinical staff can scan
the daily schedule quickly and choose the right next action.

## Files Changed

- `src/pages/AppointmentsPage.tsx`
- `src/features/appointments/AppointmentCard.tsx`
- `supabase/snippets/testPatientAppointmentBrowserSmoke.mjs`

No service, schema, migration, RLS, RPC, provider-assignment write, appointment
lifecycle write, operational-state write, Visit Completion, Patient Detail, or
treatment-plan runtime behavior was changed.

## Visual Hierarchy Decisions

The Appointments page now presents itself as the pilot `Planner` workspace:

- page copy explains the operational schedule purpose;
- the schedule card has a compact context header with current day/week and
  visible appointment count;
- view/date/provider/refresh controls are grouped into one `Planner controls`
  toolbar;
- content states remain below the toolbar, so loading, error, empty, filtered
  empty, daily, and weekly schedules keep the same behavioral order.

Appointment cards now emphasize:

1. time in a dedicated anchor block;
2. patient name as the main text target;
3. appointment type/reason and assigned provider as metadata chips;
4. operational and lifecycle badges in one status area;
5. reception action and clinical visit action in separate action zones.

Notes remain visible on tablet/desktop but are hidden on the narrowest mobile
cards to reduce clutter. The underlying appointment notes are not removed.

## Operational And Clinical Action Decisions

The existing operational-state helpers still decide eligibility. The visual
change is that daily cards show a dedicated reception row:

- `Reception state: Not arrived` with `Mark arrived`;
- `Reception state: Arrived` with `Ready for doctor`;
- `Ready for doctor` has no forward action;
- correction actions remain in the existing secondary appointment menu.

Clinical actions remain separate:

- `Start visit` is the primary action for eligible scheduled appointments;
- `Continue visit` remains primary when an open linked visit exists;
- `View visit` remains available for linked completed visits;
- terminal or ineligible cards do not show misleading disabled primary actions.

Cancel and no-show remain secondary menu actions only where the existing
lifecycle rules allow them.

## Responsive Behavior Checked

Manual screenshot inspection was performed against the local Vite app at:

- 390 px mobile;
- 768 px tablet portrait;
- 1280 px desktop/laptop.

Inspected states:

- daily schedule with multiple scheduled, cancelled, no-show, and completed
  appointment cards;
- weekly schedule with populated and open days;
- provider-filter toolbar state;
- scheduled cards with operational actions;
- ready/completed card states visible in weekly schedule fixtures;
- empty weekly schedule state after moving to a far-future week;
- secondary action menu reachability remains covered by browser smoke.

Observed result: no horizontal viewport overflow, toolbar controls wrap
intentionally, action buttons remain reachable, status/time/patient areas remain
visible, and weekly cards remain readable on tablet and mobile.

## Behavior Preserved

Preserved:

- daily and weekly view switching;
- date/week navigation;
- provider filter values and URL persistence;
- invalid provider URL fallback;
- refresh behavior;
- lifecycle actions and restrictions;
- operational forward progression and one-step corrections;
- Start/Continue/View visit routing and eligibility;
- completed/cancelled/no-show restrictions;
- treatment-plan pilot flow;
- internal settlement UI absence.

## Validation

Passed:

- `npm.cmd run build`
- `npm.cmd run lint`
- `node .\supabase\snippets\testPatientAppointmentBrowserSmoke.mjs`
- `node .\supabase\snippets\testAppointmentOperationalStateRls.mjs`
- `node .\supabase\snippets\testAppointmentProviderAssignmentRls.mjs`
- `node .\supabase\snippets\testVisitCompletionRls.mjs`
- `node .\supabase\snippets\testTreatmentPlanMutationRls.mjs`
- `node .\supabase\snippets\testTreatmentPlanReadRls.mjs`
- `node .\supabase\snippets\testInternalSettlementFreezeRls.mjs`
- `node .\supabase\snippets\testInternalSettlementFeatureAccessRls.mjs`

Existing build warnings remained limited to the Vite large chunk-size warning
and the known Tailwind/Vite timing warning.

## Deferred Improvements

Deferred intentionally:

- drag-and-drop calendar behavior;
- resource/chair/provider workload calendar;
- appointment conflict detection;
- operational filtering or waiting-room dashboard;
- broad Patient Detail restyling;
- Visit Completion redesign;
- settlement/payment/ledger/balance/invoice/receipt work.

The daily card still carries several pieces of operational context because the
pilot requires lifecycle, operational, provider, and visit-link visibility on
one surface. Further reduction should wait for real clinic feedback.

## Next Recommended Task

Task 100 - Patient Detail Clinical Workflow Entry UI/UX Restyling.

That slice should improve how staff move from patient context into today's
appointment, Visit Completion, treatment-plan context, and timeline review
without redesigning the full application shell or adding financial scope.
