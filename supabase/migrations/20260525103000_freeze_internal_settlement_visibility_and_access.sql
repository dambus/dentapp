-- Interim freeze for finance-like/internal-settlement artifacts.
-- Task 92 removes ordinary product access until a clinic feature toggle and
-- explicit settlement capabilities are designed and implemented.

drop policy if exists "Financial workflow roles can view clinic patient ledger entries"
on public.patient_ledger_entries;

revoke select, insert, update, delete on public.patient_ledger_entries from authenticated;

drop policy if exists "Financial workflow roles can view clinic patient payments"
on public.patient_payments;

revoke select, insert, update, delete on public.patient_payments from authenticated;

drop policy if exists "Performed service workflow roles can view clinic performed services"
on public.performed_services;

drop policy if exists "Clinical provider roles can create performed services"
on public.performed_services;

drop policy if exists "Clinical provider roles can update draft performed services"
on public.performed_services;

revoke select, insert, update, delete on public.performed_services from authenticated;

revoke execute on function public.get_patient_ledger_charge_posting_state_for_visit(uuid)
from authenticated;

revoke execute on function public.post_finalized_performed_services_to_patient_ledger(uuid)
from authenticated;

revoke execute on function public.record_patient_payment(
  uuid,
  numeric,
  text,
  text,
  timestamptz,
  text,
  text,
  text
) from authenticated;

revoke execute on function public.reverse_patient_payment(uuid, text)
from authenticated;

comment on table public.patient_ledger_entries is
  'Internal technical ledger foundation retained but frozen from ordinary authenticated access until optional internal settlement feature controls exist.';

comment on table public.patient_payments is
  'Internal technical payment foundation retained but frozen from ordinary authenticated access until optional internal settlement feature controls exist.';

comment on table public.performed_services is
  'Rendered-service financial snapshot foundation retained but frozen from ordinary authenticated access until optional internal settlement feature controls exist.';
