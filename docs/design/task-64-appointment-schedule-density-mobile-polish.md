# Task 64 - Appointment Schedule Compact Density / Mobile Readability Pass

This task refines the Appointments schedule UI after the provider filter and URL persistence work.

## UI Scope

Updated:

- `src/pages/AppointmentsPage.tsx`
- `src/features/appointments/AppointmentCard.tsx`

The changes are visual and layout-only. Appointment loading, provider filtering, URL provider params, lifecycle actions, Visit Completion handoff, and detail navigation remain unchanged.

## Schedule Layout

The schedule filter bar was tightened so it takes less vertical space while keeping touch-friendly controls:

- reduced filter bar padding;
- moved the filter grid breakpoint to desktop width so tablet/mobile controls stack naturally;
- reduced daily and weekly list gaps;
- kept weekly day sections compact and consistent with daily spacing.

## Appointment Cards

Appointment cards now use a clearer hierarchy:

- time/duration first;
- patient name directly under time;
- lifecycle status and secondary menu aligned to the right on wider screens;
- assigned provider and reason/type grouped into one metadata row;
- live Visit Completion state messages use less vertical padding;
- primary/detail actions stay touch-friendly and separated from content.

Weekly schedule cards use the existing compact card variant to improve scan density without changing visible workflow copy or selectors.

## Boundaries

No schema, migration, RLS, appointment lifecycle rule, Visit Completion behavior, provider workload calendar, availability/conflict checking, automatic assignment, check-in/in-room/ready-for-doctor state, billing/materials/attachments/payments, treatment-plan mutation, reminders/tasks, or broad scheduling redesign was added.

## Testing

No selector or workflow text changes were required. Existing browser smoke coverage continues to validate provider filter visibility, URL behavior, invalid fallback, lifecycle actions, Visit Completion, and treatment-plan read-only coverage.

## Task 64B Responsive Overflow Fix

Visual QA found a responsive overflow regression after the density pass:

- iPhone-width Appointments content could appear clipped or shifted;
- tablet widths around the collapsed navigation rail did not fit cleanly;
- filter controls and appointment card metadata could force wider-than-viewport layout.

The fix added explicit containment and wrapping:

- app page wrapper now has `min-w-0` and `overflow-x-hidden`;
- Appointments schedule card, filter bar, daily list, weekly list, and weekly day sections now use `min-w-0` / `max-w-full`;
- filter bar grid avoids fixed minimum tracks on tablet and lets shortcut buttons wrap;
- appointment cards now have `min-w-0` / `max-w-full`;
- status/menu rows can wrap instead of widening the card;
- provider text truncates safely without `whitespace-nowrap`;
- action menu width is bounded to the viewport.

Responsive browser checks were run for daily and weekly Appointments views at:

- 390px mobile;
- 430px mobile;
- 912px tablet;
- 1440px desktop.

All checked viewports reported no horizontal document/body overflow and no off-viewport elements.
