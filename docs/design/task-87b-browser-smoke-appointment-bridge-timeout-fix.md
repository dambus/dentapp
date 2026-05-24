# Task 87B - Browser Smoke Appointment Bridge Timeout Fix

## Reproduced Failure

The authenticated browser smoke was reproduced with output captured to
`tmp-browser-smoke-task87b.log`.

Failure:

```text
Error: Timed out waiting for appointment appears in appointments list
    at waitFor (.../supabase/snippets/testPatientAppointmentBrowserSmoke.mjs:125:9)
    at async main (.../supabase/snippets/testPatientAppointmentBrowserSmoke.mjs:2649:5)
```

The failing assertion occurs after the smoke flow creates the Task 44 follow-up
appointment and later navigates back to `/appointments`, expecting the
`Task 44 appointment bridge recommendation` appointment to appear in the daily
schedule.

## Data Finding

The backing appointment row existed at failure time:

- patient: `22222222-2222-2222-2222-222222222201`
- clinic: `11111111-1111-1111-1111-111111111111`
- status: `scheduled`
- operational state: `not_arrived`
- reason: `Task 44 appointment bridge recommendation`
- scheduled start: `2026-05-23T22:00:00+00:00`

That timestamp is midnight on `2026-05-24` in the local Belgrade timezone.

## Root Cause

Appointment creation records the selected date/time as a local-time instant.
The appointments list range query treated date-only selected days as UTC
boundaries:

- start: `YYYY-MM-DDT00:00:00.000Z`
- end: `YYYY-MM-DDT23:59:59.999Z`

For positive-offset timezones, a local midnight appointment is stored on the
previous UTC day and was therefore excluded from the selected local day query.
The smoke assertion timed out because the UI had correctly created the row, but
the appointment-list query did not include it for the intended local date.

## Fix

Updated the appointment range boundary helper to interpret date-only selected
days as local day boundaries before converting to ISO for the Supabase query.

This keeps the UI contract aligned with how date inputs and appointment
creation already work: a selected appointment-list date represents the local
clinic/user day, not a UTC calendar day.

## Scope

This was a narrow runtime appointment-list fix.

No payment service work, payment UI, balance, invoice, receipt, refund,
reversal, ledger schema, payment schema, or RLS behavior was added or changed.

## Validation

Task 87B validation reran the existing build, lint, browser smoke, appointment
RLS, Visit Completion, ledger, payment, performed-services, and treatment-plan
checks. Task 88 remains the next recommended task after this validation fix.
