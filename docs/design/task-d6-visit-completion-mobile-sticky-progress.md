# Task D6 - Visit Completion Mobile Sticky Progress

## Purpose

Visit Completion is a multi-step clinical workflow. On mobile, users need persistent orientation and reachable actions while scrolling through procedure, note, next-step, and review content. Task D6 improves mobile orientation without changing the visit persistence flow.

## Implemented Pattern

- Added a mobile-only sticky progress header in `VisitCompletionFlow`.
- Header shows:
  - `Visit Completion`,
  - current step position,
  - current step label and title,
  - compact progress bar with accessible progress semantics.
- Added a mobile-first bottom action bar for editing state:
  - Back,
  - Save Draft,
  - Next,
  - Complete Visit on the final step.
- Added a sticky confirmation action bar for confirmation state:
  - Confirm completion,
  - Continue review.
- Desktop/tablet keeps the existing stepper and static workflow action area.

## Behavior Preserved

- Draft loading still uses existing service behavior.
- Save Draft still uses the same handler.
- Complete Visit still uses the same validation and confirmation path.
- Appointment-linked completion remains unchanged.
- Demo-route persistence behavior remains unchanged.
- Error, success, and warning feedback remains unchanged.

## Accessibility

- Progress header includes readable text and `role="progressbar"`.
- Buttons remain labeled text buttons.
- Disabled/loading states reuse existing button behavior.
- No icon-only controls were added.

## Next Recommended Task

Checkpoint B - Product Roadmap Re-balance
