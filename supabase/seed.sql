-- DentApp local development seed data.
-- Fake/demo records only. Never store real patient data in this file.

begin;

-- Demo clinic for local development and RLS testing preparation.
insert into public.clinics (id, name, status)
values
  ('11111111-1111-1111-1111-111111111111', 'DentApp Demo Clinic', 'active');

-- Demo patients linked to the demo clinic.
insert into public.patients (
  id,
  clinic_id,
  first_name,
  last_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  emergency_contact_name,
  emergency_contact_phone,
  preferred_contact_method,
  status,
  important_note
)
values
  (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111111',
    'Ana',
    'Demo',
    '1988-04-12',
    'female',
    '+381 60 000 0001',
    'ana.demo@example.test',
    'Demo Address 1, Belgrade',
    'Marko Demo',
    '+381 60 000 0101',
    'phone',
    'active',
    'Demo warning marker for local testing only. No real patient data.'
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111111',
    'Marko',
    'Test',
    '1979-11-02',
    'male',
    '+381 60 000 0002',
    'marko.test@example.test',
    'Demo Address 2, Novi Sad',
    'Jelena Demo',
    '+381 60 000 0102',
    'email',
    'active',
    null
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '11111111-1111-1111-1111-111111111111',
    'Jelena',
    'Primer',
    '1992-07-18',
    'female',
    '+381 60 000 0003',
    'jelena.primer@example.test',
    'Demo Address 3, Nis',
    'Nikola Demo',
    '+381 60 000 0103',
    'phone',
    'inactive',
    'Demo medical warning for local testing only.'
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    '11111111-1111-1111-1111-111111111111',
    'Nikola',
    'Uzorak',
    '1984-01-30',
    'male',
    '+381 60 000 0004',
    'nikola.uzorak@example.test',
    'Demo Address 4, Kragujevac',
    'Ana Demo',
    '+381 60 000 0104',
    'phone',
    'archived',
    null
  ),
  (
    '22222222-2222-2222-2222-222222222205',
    '11111111-1111-1111-1111-111111111111',
    'Milica',
    'Fiktivna',
    '1995-09-05',
    'female',
    '+381 60 000 0005',
    'milica.fiktivna@example.test',
    'Demo Address 5, Subotica',
    'Marko Test',
    '+381 60 000 0105',
    'email',
    'active',
    null
  );

-- One-row-per-patient medical summaries for selected demo patients.
insert into public.patient_medical_records (
  id,
  clinic_id,
  patient_id,
  anamnesis_summary,
  allergies,
  current_medications,
  medical_warnings,
  dental_history,
  risk_notes
)
values
  (
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222201',
    'Demo anamnesis summary.',
    'Demo allergy warning.',
    'Demo medication entry for local testing.',
    'Demo medical warning for local testing only.',
    'Demo dental history summary.',
    'Demo risk note for UI and RLS testing only.'
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222203',
    'Demo anamnesis summary.',
    null,
    null,
    'Demo warning flag for inactive profile testing.',
    'Demo dental history summary for inactive patient.',
    'Demo follow-up risk note.'
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222205',
    'Demo anamnesis summary.',
    null,
    null,
    null,
    'Demo dental history summary.',
    null
  );

-- Demo clinical notes for selected patients.
insert into public.clinical_notes (
  id,
  clinic_id,
  patient_id,
  note_type,
  content,
  tooth_number
)
values
  (
    '44444444-4444-4444-4444-444444444401',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222201',
    'progress',
    'Demo clinical note for UI and RLS testing only.',
    '26'
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222202',
    'consultation',
    'Demo consultation note. No real clinical data.',
    null
  ),
  (
    '44444444-4444-4444-4444-444444444403',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222205',
    'follow_up',
    'Demo follow-up clinical note for local development only.',
    '11'
  );

commit;
