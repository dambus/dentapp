select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'clinics',
    'profiles',
    'patients',
    'patient_medical_records',
    'clinical_notes'
  )
order by tablename, policyname;