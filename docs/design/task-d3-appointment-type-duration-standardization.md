# Task D3 - Appointment Type & 15-Min Duration Standardization

## Purpose

Appointment scheduling needs predictable, scan-friendly type and duration signals before richer schedule views are added. Task D3 adds frontend appointment type configuration and standardized duration options without changing the database schema.

## Added Frontend Config

`src/features/appointments/appointmentTypes.ts` defines:

- appointment type ids and labels,
- default duration per type,
- semantic badge variant,
- optional icon-name metadata for future UI use.

Current types:

- Consultation - 30 min
- Control - 30 min
- Filling - 45 min
- Extraction - 45 min
- Hygiene - 45 min
- Prosthetics - 60 min
- Emergency - 30 min
- Other - 30 min

## Duration Standard

Appointment creation now uses fixed 15-minute interval options:

- 15 min
- 30 min
- 45 min
- 60 min
- 75 min
- 90 min
- 120 min

Selecting a type updates duration to that type's default. Users can still choose a different allowed duration.

## Persistence Limitation

No database migration was added. The existing `appointments.reason` field remains the persistence target.

Current no-migration behavior:

- if custom reason/context is entered, it is stored as `reason`;
- if custom reason/context is empty, the selected type label is stored as `reason`;
- cards detect known appointment types from `reason` for display;
- unknown reason text is shown as the fallback type label.

This keeps persistence honest while improving UI clarity. A future task can add a first-class `appointment_type` column once the model is agreed.

## Follow-Up Bridge

Follow-up scheduling still copies recommendation context into the reason field. The frontend selects a likely type when possible, with `Control` as the simple fallback for follow-up scheduling context. Follow-up is not automatically marked handled.

## Next Recommended Task

Task D5 - Patient Detail Mobile Navigation Redesign
