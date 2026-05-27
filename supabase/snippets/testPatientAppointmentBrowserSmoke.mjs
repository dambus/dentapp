#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { DEMO_PASSWORD } from './demoAuthConstants.mjs'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.',
  )
  process.exit(1)
}

const APP_URL = process.env.DENTAPP_APP_URL ?? 'http://127.0.0.1:5173'
const PATIENT_ID = '22222222-2222-2222-2222-222222222201'
const PATIENT_URL = `${APP_URL}/patients/${PATIENT_ID}`
const DEMO_SLUG_PATIENT_ID = 'demo-patient-002'
const DEMO_SLUG_SUPABASE_PATIENT_ID = '22222222-2222-2222-2222-222222222202'
const DEMO_SLUG_PATIENT_URL = `${APP_URL}/patients/${DEMO_SLUG_PATIENT_ID}`
const APPOINTMENTS_URL = `${APP_URL}/appointments`
const CHROME_PATH =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const EMAIL = 'doctor.demo@example.test'
const EXPECTED_PREFILL = 'Task 44 appointment bridge recommendation'
const MANUAL_CREATION_REASON = 'Consultation'
const MANUAL_CREATION_NOTES = 'Optional note demo'
const MANUAL_CREATION_DATE = getDateInputValueForOffset(1)
const ASSIGNED_PROVIDER_NAME = 'Doctor Demo'
const UNASSIGNED_FILTER_REASON = 'Task 62 unassigned provider filter check'
const MENU_ANCHOR_REASON = 'Task 66 appointment card menu anchor check'
const TODAY_OPERATIONAL_REASON = 'Task 70 today operational state check'
const CANCELLED_REASON = 'Task 51 cancelled appointment status check'
const NO_SHOW_REASON = 'Task 54 no-show appointment status check'
const BRIDGE_PROCEDURE = 'Task 44 bridge procedure'
const BRIDGE_NOTE = 'Task 44 bridge clinical note'
const BRIDGE_RECOMMENDATION = 'Task 44 follow-up recommendation'
const BRIDGE_NEXT_STEP = 'schedule_control_visit'
const BRIDGE_NEXT_STEP_LABEL = 'Schedule control visit'
const TREATMENT_PLAN_TITLE = 'Task 98 pilot treatment plan'
const TREATMENT_PLAN_UPDATED_TITLE = 'Task 98 pilot treatment plan updated'
const TREATMENT_PLAN_DESCRIPTION = 'Pilot treatment planning objective'
const TREATMENT_PLAN_UPDATED_DESCRIPTION = 'Updated pilot treatment planning objective'
const TREATMENT_PLAN_ITEM_TITLE = 'Task 98 planned restoration'
const TREATMENT_PLAN_ITEM_UPDATED_TITLE = 'Task 98 planned restoration updated'
const TREATMENT_PLAN_ITEM_DESCRIPTION = 'Plan item clinical notes'
const TREATMENT_PLAN_ITEM_UPDATED_DESCRIPTION = 'Updated plan item clinical notes'
const FINALIZATION_RETRY_REASON = 'Task 78 finalization retry check'
const FINALIZATION_RETRY_PROCEDURE = 'Task 78 retry service procedure'
const FINALIZATION_RETRY_NOTE = 'Task 78 finalization retry clinical note'
const LEDGER_RETRY_REASON = 'Task 82 ledger posting retry check'
const LEDGER_RETRY_PROCEDURE = 'Task 82 ledger retry service procedure'
const LEDGER_RETRY_NOTE = 'Task 82 ledger posting retry clinical note'
const PERFORMED_SERVICE_CATEGORY = 'Task 77 services smoke category'
const PERFORMED_SERVICE_NAME = 'Task 77 composite filling'
const PERFORMED_SERVICE_CODE = 'TASK77-SVC'
const PERFORMED_SERVICE_PRICE = '4200'
const PERFORMED_SERVICE_QUANTITY = '2'
const PERFORMED_SERVICE_TOOTH = '16'
const DEMO_ADHOC_PROCEDURE = 'Task 52 demo slug ad hoc procedure'
const DEMO_ADHOC_NOTE = 'Task 52 demo slug ad hoc clinical note'
const DEMO_LINKED_PROCEDURE = 'Task 52 demo slug linked procedure'
const DEMO_LINKED_NOTE = 'Task 52 demo slug linked clinical note'
const DEMO_CLINIC_ID = '11111111-1111-1111-1111-111111111111'
const APPOINTMENT_CARD_SELECTOR = '[data-testid="appointment-card"]'
const APPOINTMENT_CARD_MENU_LABEL = 'Appointment actions'
const APPOINTMENT_STATUS_MENU_LABEL = 'Appointment status actions'
const LIFECYCLE_TRANSITION_ACTIONS = [
  'Start visit',
  'Continue visit',
  'Cancel',
  'Mark no-show',
]
const OPERATIONAL_TRANSITION_ACTIONS = ['Mark arrived', 'Ready for doctor']
const OPERATIONAL_CORRECTION_ACTIONS = ['Undo arrival', 'Move back to arrived']
const OVERFLOW_TOLERANCE_PX = 2
const RESPONSIVE_OVERFLOW_VIEWPORTS = [
  { label: 'mobile 390', mobile: true, width: 390, height: 844, deviceScaleFactor: 3 },
  { label: 'mobile 430', mobile: true, width: 430, height: 932, deviceScaleFactor: 3 },
  { label: 'mobile 500', mobile: true, width: 500, height: 900, deviceScaleFactor: 2 },
  { label: 'tablet 768', mobile: false, width: 768, height: 1024, deviceScaleFactor: 1 },
  { label: 'tablet 1024', mobile: false, width: 1024, height: 1366, deviceScaleFactor: 1 },
  { label: 'tablet 912', mobile: false, width: 912, height: 1368, deviceScaleFactor: 1 },
  { label: 'desktop 1440', mobile: false, width: 1440, height: 1000, deviceScaleFactor: 1 },
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getDateInputValueForOffset(daysFromToday) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

async function waitFor(predicate, label, timeoutMs = 20000) {
  const startedAt = Date.now()
  let lastError = null

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const result = await predicate()

      if (result) {
        return result
      }
    } catch (error) {
      lastError = error
    }

    await delay(250)
  }

  if (lastError) {
    throw new Error(
      [
        `Timed out waiting for ${label}.`,
        'Last predicate error:',
        lastError instanceof Error ? lastError.message : String(lastError),
      ].join('\n'),
    )
  }

  throw new Error(`Timed out waiting for ${label}`)
}

function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

async function prepareFixture() {
  const serviceClient = getServiceClient()
  const profileResult = await serviceClient
    .from('profiles')
    .select('id')
    .eq('role', 'doctor')
    .eq('clinic_id', DEMO_CLINIC_ID)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (profileResult.error || !profileResult.data) {
    throw new Error(profileResult.error?.message ?? 'Missing active doctor profile.')
  }

  await serviceClient
    .from('patient_ledger_entries')
    .delete()
    .in('patient_id', [PATIENT_ID, DEMO_SLUG_SUPABASE_PATIENT_ID])
  await serviceClient
    .from('performed_services')
    .delete()
    .in('patient_id', [PATIENT_ID, DEMO_SLUG_SUPABASE_PATIENT_ID])
  const staleTreatmentPlans = await serviceClient
    .from('treatment_plans')
    .select('id')
    .eq('patient_id', PATIENT_ID)
    .like('title', 'Task 98 pilot treatment plan%')

  if (staleTreatmentPlans.error) {
    throw new Error(
      staleTreatmentPlans.error.message ??
        'Could not load stale Task 98 treatment plan fixtures.',
    )
  }

  const staleTreatmentPlanIds =
    staleTreatmentPlans.data?.map((plan) => plan.id) ?? []

  if (staleTreatmentPlanIds.length > 0) {
    const staleItemsDelete = await serviceClient
      .from('treatment_plan_items')
      .delete()
      .in('treatment_plan_id', staleTreatmentPlanIds)

    if (staleItemsDelete.error) {
      throw new Error(
        staleItemsDelete.error.message ??
          'Could not delete stale Task 98 treatment plan item fixtures.',
      )
    }

    const stalePlansDelete = await serviceClient
      .from('treatment_plans')
      .delete()
      .in('id', staleTreatmentPlanIds)

    if (stalePlansDelete.error) {
      throw new Error(
        stalePlansDelete.error.message ??
          'Could not delete stale Task 98 treatment plan fixtures.',
      )
    }
  }
  await serviceClient.from('appointments').delete().eq('patient_id', PATIENT_ID)
  await serviceClient
    .from('appointments')
    .delete()
    .eq('patient_id', DEMO_SLUG_SUPABASE_PATIENT_ID)
    .eq('reason', MANUAL_CREATION_REASON)
  await serviceClient
    .from('appointments')
    .delete()
    .eq('patient_id', DEMO_SLUG_SUPABASE_PATIENT_ID)
    .eq('reason', UNASSIGNED_FILTER_REASON)
  await serviceClient
    .from('appointments')
    .delete()
    .eq('patient_id', DEMO_SLUG_SUPABASE_PATIENT_ID)
    .eq('reason', TODAY_OPERATIONAL_REASON)
  await serviceClient
    .from('appointments')
    .delete()
    .eq('patient_id', PATIENT_ID)
    .eq('reason', MENU_ANCHOR_REASON)
  await serviceClient
    .from('appointments')
    .delete()
    .eq('patient_id', PATIENT_ID)
    .eq('reason', FINALIZATION_RETRY_REASON)
  await serviceClient
    .from('appointments')
    .delete()
    .eq('patient_id', PATIENT_ID)
    .eq('reason', LEDGER_RETRY_REASON)
  await serviceClient
    .from('visits')
    .update({
      status: 'archived',
      deleted_at: new Date().toISOString(),
      updated_by: profileResult.data.id,
    })
    .in('patient_id', [PATIENT_ID, DEMO_SLUG_SUPABASE_PATIENT_ID])
    .in('status', ['draft', 'in_progress'])
    .is('deleted_at', null)

  await serviceClient
    .from('services')
    .delete()
    .eq('clinic_id', DEMO_CLINIC_ID)
    .eq('code', PERFORMED_SERVICE_CODE)
  await serviceClient
    .from('service_categories')
    .delete()
    .eq('clinic_id', DEMO_CLINIC_ID)
    .eq('name', PERFORMED_SERVICE_CATEGORY)

  const categoryResult = await serviceClient
    .from('service_categories')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      name: PERFORMED_SERVICE_CATEGORY,
      active: true,
      sort_order: 1,
      created_by: profileResult.data.id,
      updated_by: profileResult.data.id,
    })
    .select('id')
    .single()

  if (categoryResult.error || !categoryResult.data) {
    throw new Error(
      categoryResult.error?.message ??
        'Could not create browser smoke service category fixture.',
    )
  }

  const serviceResult = await serviceClient
    .from('services')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      category_id: categoryResult.data.id,
      name: PERFORMED_SERVICE_NAME,
      code: PERFORMED_SERVICE_CODE,
      default_price: PERFORMED_SERVICE_PRICE,
      currency: 'RSD',
      active: true,
      created_by: profileResult.data.id,
      updated_by: profileResult.data.id,
    })
    .select('id')
    .single()

  if (serviceResult.error || !serviceResult.data) {
    throw new Error(
      serviceResult.error?.message ??
        'Could not create browser smoke service catalog fixture.',
    )
  }

  const visitResult = await serviceClient
    .from('visits')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: PATIENT_ID,
      status: 'completed',
      visit_date: new Date().toISOString().slice(0, 10),
      completed_at: new Date().toISOString(),
      completed_by: profileResult.data.id,
      recommendation: EXPECTED_PREFILL,
      next_step: 'schedule_control_visit',
      created_by: profileResult.data.id,
      updated_by: profileResult.data.id,
    })
    .select('id')
    .single()

  if (visitResult.error || !visitResult.data) {
    throw new Error(
      visitResult.error?.message ?? 'Could not create browser smoke visit fixture.',
    )
  }

  return visitResult.data.id
}

async function getCreatedAppointmentId() {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('appointments')
    .select('id')
    .eq('patient_id', PATIENT_ID)
    .eq('reason', EXPECTED_PREFILL)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    throw new Error(error?.message ?? 'Created appointment was not found.')
  }

  return data.id
}

async function getCreatedAppointmentDateInputValue() {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('appointments')
    .select('scheduled_start')
    .eq('patient_id', PATIENT_ID)
    .eq('reason', EXPECTED_PREFILL)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data?.scheduled_start) {
    throw new Error(error?.message ?? 'Created appointment schedule date was not found.')
  }

  const scheduledStart = new Date(data.scheduled_start)
  const year = scheduledStart.getFullYear()
  const month = String(scheduledStart.getMonth() + 1).padStart(2, '0')
  const day = String(scheduledStart.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

async function getCreatedAppointmentCount() {
  const serviceClient = getServiceClient()
  const { count, error } = await serviceClient
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', PATIENT_ID)
    .eq('reason', EXPECTED_PREFILL)

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

async function getManualCreatedAppointmentCount() {
  const serviceClient = getServiceClient()
  const { count, error } = await serviceClient
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', DEMO_SLUG_SUPABASE_PATIENT_ID)
    .eq('reason', MANUAL_CREATION_REASON)
    .eq('notes', MANUAL_CREATION_NOTES)

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

async function getManualCreatedAppointmentId() {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('appointments')
    .select('id')
    .eq('patient_id', DEMO_SLUG_SUPABASE_PATIENT_ID)
    .eq('reason', MANUAL_CREATION_REASON)
    .eq('notes', MANUAL_CREATION_NOTES)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    throw new Error(error?.message ?? 'Manual created appointment was not found.')
  }

  return data.id
}

async function createServiceAppointment(
  reason,
  daysFromToday = 0,
  assignedProviderId = null,
  patientId = PATIENT_ID,
) {
  const serviceClient = getServiceClient()
  const profileResult = await serviceClient
    .from('profiles')
    .select('id')
    .eq('role', 'doctor')
    .eq('clinic_id', DEMO_CLINIC_ID)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (profileResult.error || !profileResult.data) {
    throw new Error(profileResult.error?.message ?? 'Missing active doctor profile.')
  }

  const scheduledStart = new Date(`${getDateInputValueForOffset(daysFromToday)}T10:00:00`)
  const scheduledEnd = new Date(scheduledStart.getTime() + 30 * 60 * 1000)
  const { data, error } = await serviceClient
    .from('appointments')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: patientId,
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      status: 'scheduled',
      reason,
      notes: 'Created by browser smoke status polish check.',
      assigned_provider_id: assignedProviderId,
      created_by: profileResult.data.id,
      updated_by: profileResult.data.id,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not create service appointment.')
  }

  return data.id
}

async function verifyCompletedAppointmentLink(
  appointmentId,
  patientId = PATIENT_ID,
) {
  const serviceClient = getServiceClient()
  const appointment = await serviceClient
    .from('appointments')
    .select('id, status')
    .eq('id', appointmentId)
    .maybeSingle()
  const visit = await serviceClient
    .from('visits')
    .select('id, status, appointment_id')
    .eq('appointment_id', appointmentId)
    .eq('patient_id', patientId)
    .eq('status', 'completed')
    .maybeSingle()

  if (appointment.error || appointment.data?.status !== 'completed') {
    throw new Error(
      appointment.error?.message ?? 'Appointment was not marked completed.',
    )
  }

  if (visit.error || !visit.data) {
    throw new Error(
      visit.error?.message ?? 'Completed visit was not linked to appointment.',
    )
  }

  return visit.data.id
}

async function getPerformedServicesSnapshotForVisit(visitId) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('performed_services')
    .select('id, status, final_amount, service_name_snapshot, deleted_at')
    .eq('visit_id', visitId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

async function getLedgerChargeSnapshotForVisit(visitId) {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('patient_ledger_entries')
    .select(
      'id, entry_type, direction, amount, currency, performed_service_id, visit_id, status',
    )
    .eq('visit_id', visitId)
    .eq('entry_type', 'charge')
    .eq('status', 'posted')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

async function getLedgerChargeCountForPatient(patientId) {
  const serviceClient = getServiceClient()
  const { count, error } = await serviceClient
    .from('patient_ledger_entries')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .eq('entry_type', 'charge')
    .eq('status', 'posted')

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

async function createUnpostedCompletedFinancialVisit() {
  const serviceClient = getServiceClient()
  const profileResult = await serviceClient
    .from('profiles')
    .select('id')
    .eq('role', 'doctor')
    .eq('clinic_id', DEMO_CLINIC_ID)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (profileResult.error || !profileResult.data) {
    throw new Error(profileResult.error?.message ?? 'Missing active doctor profile.')
  }

  const serviceResult = await serviceClient
    .from('services')
    .select('id')
    .eq('clinic_id', DEMO_CLINIC_ID)
    .eq('code', PERFORMED_SERVICE_CODE)
    .maybeSingle()

  if (serviceResult.error || !serviceResult.data) {
    throw new Error(serviceResult.error?.message ?? 'Missing service catalog fixture.')
  }

  const visitResult = await serviceClient
    .from('visits')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: PATIENT_ID,
      status: 'completed',
      visit_date: new Date().toISOString().slice(0, 10),
      completed_at: new Date().toISOString(),
      completed_by: profileResult.data.id,
      clinical_note_id: null,
      recommendation: 'Task 83 pending charge visibility fixture.',
      next_step: 'no_follow_up',
      created_by: profileResult.data.id,
      updated_by: profileResult.data.id,
    })
    .select('id')
    .single()

  if (visitResult.error || !visitResult.data) {
    throw new Error(visitResult.error?.message ?? 'Could not create pending financial visit.')
  }

  const performedServiceResult = await serviceClient
    .from('performed_services')
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: PATIENT_ID,
      visit_id: visitResult.data.id,
      service_id: serviceResult.data.id,
      service_name_snapshot: PERFORMED_SERVICE_NAME,
      service_code_snapshot: PERFORMED_SERVICE_CODE,
      service_category_name_snapshot: PERFORMED_SERVICE_CATEGORY,
      tooth_or_region: PERFORMED_SERVICE_TOOTH,
      quantity: PERFORMED_SERVICE_QUANTITY,
      unit_price_amount: PERFORMED_SERVICE_PRICE,
      discount_amount: 0,
      final_amount: Number(PERFORMED_SERVICE_PRICE) * Number(PERFORMED_SERVICE_QUANTITY),
      currency: 'RSD',
      credited_provider_id: profileResult.data.id,
      status: 'finalized',
      performed_at: new Date().toISOString(),
      created_by: profileResult.data.id,
      updated_by: profileResult.data.id,
    })
    .select('id')
    .single()

  if (performedServiceResult.error || !performedServiceResult.data) {
    throw new Error(
      performedServiceResult.error?.message ??
        'Could not create pending finalized performed service.',
    )
  }

  return visitResult.data.id
}

async function connectToChrome(port) {
  await waitFor(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)
      return response.ok ? response.json() : null
    } catch {
      return null
    }
  }, 'Chrome DevTools endpoint')

  const target = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json`)

    if (!response.ok) {
      return null
    }

    const targets = await response.json()
    return targets.find((entry) => entry.type === 'page') ?? null
  }, 'Chrome page target')

  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  let nextId = 1
  const pending = new Map()
  const eventListeners = new Map()

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)

    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)

      if (message.error) {
        reject(new Error(message.error.message))
      } else {
        resolve(message.result)
      }
    } else if (message.method && eventListeners.has(message.method)) {
      for (const listener of eventListeners.get(message.method)) {
        listener(message.params)
      }
    }
  })

  async function command(method, params = {}) {
    const id = nextId++

    socket.send(JSON.stringify({ id, method, params }))

    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject })
    })
  }

  function on(method, listener) {
    const listeners = eventListeners.get(method) ?? new Set()
    listeners.add(listener)
    eventListeners.set(method, listeners)

    return () => {
      listeners.delete(listener)
    }
  }

  return { command, close: () => socket.close(), on }
}

async function evaluate(cdp, expression) {
  const result = await cdp.command('Runtime.evaluate', {
    awaitPromise: true,
    expression,
    returnByValue: true,
  })

  if (result.exceptionDetails) {
    const exceptionDetails = result.exceptionDetails
    const exception = exceptionDetails.exception
    const browserContext = await cdp
      .command('Runtime.evaluate', {
        awaitPromise: true,
        expression: `(() => {
          const dateInput = document.querySelector('[data-testid="appointments-date-input"]');
          const body = document.body;

          return {
            url: location.href,
            dateInputValue: dateInput instanceof HTMLInputElement ? dateInput.value : null,
            bodyText: body ? body.innerText.slice(0, 400) : null,
          };
        })()`,
        returnByValue: true,
      })
      .then((contextResult) => contextResult.result?.value ?? null)
      .catch(() => null)

    throw new Error(
      [
        'Uncaught browser error during evaluate.',
        `name: ${exception?.className ?? 'unknown'}`,
        `message: ${exception?.description ?? exceptionDetails.text ?? 'Unknown browser exception'}`,
        `line: ${(exceptionDetails.lineNumber ?? 0) + 1}, column: ${(exceptionDetails.columnNumber ?? 0) + 1}`,
        `expression: ${expression.slice(0, 220)}`,
        browserContext
          ? `context: ${JSON.stringify(browserContext, null, 2)}`
          : null,
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  return result.result.value
}

async function navigate(cdp, url) {
  await cdp.command('Page.navigate', { url })
  await waitFor(
    () =>
      evaluate(
        cdp,
        'document.readyState === "complete" || document.readyState === "interactive"',
      ),
    `navigation to ${url}`,
  )
}

async function clickByText(cdp, text, selector = 'button, a') {
  const clicked = await evaluate(
    cdp,
    `(() => {
      const elements = Array.from(document.querySelectorAll(${JSON.stringify(selector)}));
      const target = elements.find((element) => element.textContent?.trim() === ${JSON.stringify(text)});
      if (!target) return false;
      target.click();
      return true;
    })()`,
  )

  if (!clicked) {
    throw new Error(`Could not click ${text}`)
  }
}

async function clickEnabledButtonByText(cdp, text) {
  const clicked = await evaluate(
    cdp,
    `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find((element) =>
        element.textContent?.trim() === ${JSON.stringify(text)} &&
        !element.disabled
      );
      if (!target) return false;
      target.click();
      return true;
    })()`,
  )

  if (!clicked) {
    throw new Error(`Could not click enabled button ${text}`)
  }
}

async function clickSelector(cdp, selector) {
  const clicked = await evaluate(
    cdp,
    `(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      if (!target) return false;
      target.click();
      return true;
    })()`,
  )

  if (!clicked) {
    throw new Error(`Could not click ${selector}`)
  }
}

async function clickAppointmentCardAction(cdp, cardText, actionText) {
  const clicked = await evaluate(
    cdp,
    `(() => {
      const cards = Array.from(document.querySelectorAll(${JSON.stringify(APPOINTMENT_CARD_SELECTOR)}));
      const card = cards.find((element) => element.textContent?.includes(${JSON.stringify(cardText)}));
      if (!card) return false;
      const action = Array.from(card.querySelectorAll('button, a'))
        .find((element) => element.textContent?.trim() === ${JSON.stringify(actionText)});
      if (!action) return false;
      action.click();
      return true;
    })()`,
  )

  if (!clicked) {
    throw new Error(`Could not click ${actionText} in appointment card containing ${cardText}`)
  }
}

async function openAppointmentCardMenu(cdp, cardText) {
  const opened = await evaluate(
    cdp,
    `(() => {
      const cards = Array.from(document.querySelectorAll(${JSON.stringify(APPOINTMENT_CARD_SELECTOR)}));
      const card = cards.find((element) => element.textContent?.includes(${JSON.stringify(cardText)}));
      if (!card) return false;
      const menuTrigger = card.querySelector(${JSON.stringify(`[aria-label="${APPOINTMENT_CARD_MENU_LABEL}"]`)});
      if (!(menuTrigger instanceof HTMLButtonElement)) return false;
      menuTrigger.click();
      return true;
    })()`,
  )

  if (!opened) {
    throw new Error(`Could not open appointment action menu in card containing ${cardText}`)
  }
}

async function clickAppointmentCardMenuAction(cdp, cardText, actionText) {
  await openAppointmentCardMenu(cdp, cardText)
  await clickByText(cdp, actionText)
}

async function getAppointmentCardSnapshot(cdp, cardText) {
  return evaluate(
    cdp,
    `(() => {
      const cards = Array.from(document.querySelectorAll(${JSON.stringify(APPOINTMENT_CARD_SELECTOR)}));
      const card = cards.find((element) => element.textContent?.includes(${JSON.stringify(cardText)}));
      if (!card) return null;
      return {
        text: card.textContent ?? '',
        actions: Array.from(card.querySelectorAll('button, a'))
          .map((element) => element.textContent?.trim() ?? '')
          .filter(Boolean),
      };
    })()`,
  )
}

async function getAppointmentCardButtonTexts(cdp, cardText) {
  const snapshot = await getAppointmentCardSnapshot(cdp, cardText)

  return snapshot?.actions ?? null
}

async function waitForAppointmentCardState(
  cdp,
  cardText,
  { actionExcludes = [], actionIncludes = [], textIncludes: expectedText = [] },
  label,
) {
  await waitFor(
    async () => {
      const snapshot = await getAppointmentCardSnapshot(cdp, cardText)

      if (!snapshot) {
        return false
      }

      return (
        expectedText.every((text) => snapshot.text.includes(text)) &&
        actionIncludes.every((action) => snapshot.actions.includes(action)) &&
        actionExcludes.every((action) => !snapshot.actions.includes(action))
      )
    },
    label,
  )
}

async function assertRestyledPlannerSurface(cdp, cardText, expectedPrimaryAction) {
  await waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const toolbar = document.querySelector('[data-testid="appointments-planner-toolbar"]');
          const context = document.querySelector('[data-testid="appointments-schedule-context"]');
          const cards = Array.from(document.querySelectorAll(${JSON.stringify(APPOINTMENT_CARD_SELECTOR)}));
          const card = cards.find((element) => element.textContent?.includes(${JSON.stringify(cardText)}));

          if (!toolbar || !context || !card) {
            return false;
          }

          const requiredCardRegions = [
            '[data-testid="appointment-card-time"]',
            '[data-testid="appointment-card-patient"]',
            '[data-testid="appointment-card-context"]',
            '[data-testid="appointment-card-provider"]',
            '[data-testid="appointment-card-status-area"]',
            '[data-testid="appointment-operational-state"]',
            '[data-testid="appointment-operational-area"]',
            '[data-testid="appointment-card-primary-actions"]',
          ];
          const primaryActions = card.querySelector('[data-testid="appointment-card-primary-actions"]');
          const menu = card.querySelector(${JSON.stringify(`[aria-label="${APPOINTMENT_CARD_MENU_LABEL}"]`)});

          return toolbar.textContent?.includes('Planner controls') &&
            context.textContent?.includes('visible appointment') &&
            requiredCardRegions.every((selector) => card.querySelector(selector)) &&
            primaryActions?.textContent?.includes(${JSON.stringify(expectedPrimaryAction)}) &&
            menu instanceof HTMLButtonElement;
        })()`,
      ),
    'restyled planner toolbar and appointment card regions',
  )
}

async function assertRestyledPatientWorkflowSurface(cdp, expectedPrimaryAction) {
  await waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const requiredSelectors = [
            '[data-testid="patient-workflow-header"]',
            '[data-testid="patient-overview-section"]',
            '[data-testid="patient-section-navigation"]',
            '[data-testid="patient-clinical-workflow-entry"]',
            '[data-patient-workflow-region="current-workflow"]',
            '[data-testid="patient-primary-clinical-action"]',
            '[data-testid="patient-treatment-plan-summary"]',
            '[data-testid="patient-rebooking-entry"]',
            '[data-testid="patient-clinical-context"]',
          ];
          const primaryAction = document.querySelector('[data-testid="patient-primary-clinical-action"]');
          const workflowShortcuts = document.querySelector('[data-testid="patient-workflow-shortcuts"]');
          const fullRecordWorkspace = document.querySelector('[data-testid="patient-full-record-workspace"]');
          const bodyText = document.body?.innerText ?? '';
          const forbiddenTerms = ['posted charges', 'payment', 'balance', 'settlement', 'invoice', 'receipt'];

          return requiredSelectors.every((selector) => document.querySelector(selector)) &&
            !workflowShortcuts &&
            !fullRecordWorkspace &&
            primaryAction?.textContent?.includes(${JSON.stringify(expectedPrimaryAction)}) &&
            bodyText.includes('Current workflow') &&
            bodyText.includes('Next appointment / Rebooking') &&
            bodyText.includes('Recent clinical context') &&
            forbiddenTerms.every((term) => !bodyText.toLowerCase().includes(term));
        })()`,
      ),
    'restyled patient workflow surface',
  )
}

async function assertRestyledVisitCompletionSurface(
  cdp,
  expectsAppointmentContext,
) {
  await waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const requiredSelectors = [
            '[data-testid="visit-clinical-workflow-shell"]',
            '[data-testid="visit-workflow-context"]',
            '[data-testid="visit-workflow-status"]',
            '[data-testid="visit-step-workspace"]',
            '[data-testid="visit-persistence-feedback"]',
          ];
          const hasProgressRegion =
            document.querySelector('[data-testid="visit-progress-region"]') ||
            document.querySelector('[data-testid="visit-mobile-progress-header"]');
          const hasActionRegion =
            document.querySelector('[data-testid="visit-mobile-action-bar"]') ||
            document.querySelector('[data-testid="visit-mobile-confirm-action-bar"]');
          const bodyText = document.body?.innerText?.toLowerCase() ?? '';
          const forbiddenTerms = ['services & charges', 'payment', 'balance', 'settlement', 'invoice', 'receipt', 'posted charges', 'ledger posting'];

          return requiredSelectors.every((selector) => document.querySelector(selector)) &&
            Boolean(hasProgressRegion) &&
            Boolean(hasActionRegion) &&
            (!${JSON.stringify(expectsAppointmentContext)} ||
              document.querySelector('[data-testid="visit-appointment-context"]')) &&
            bodyText.includes('visit completion') &&
            bodyText.includes('clinical workflow') &&
            forbiddenTerms.every((term) => !bodyText.includes(term));
        })()`,
      ),
    'restyled visit completion surface',
  )
}

async function getAppointmentCardMenuTexts(cdp, cardText) {
  await openAppointmentCardMenu(cdp, cardText)

  return evaluate(
    cdp,
    `Array.from(document.querySelectorAll('[role="menuitem"]'))
      .map((element) => element.textContent?.trim() ?? '')
      .filter(Boolean)`,
  )
}

async function assertNoAppointmentLifecycleActions(cdp, contextLabel) {
  const visible = await evaluate(
    cdp,
    `Array.from(document.querySelectorAll('button, a'))
      .some((element) => ${JSON.stringify(LIFECYCLE_TRANSITION_ACTIONS)}.includes(element.textContent?.trim() ?? ''))`,
  )

  if (visible) {
    throw new Error(`${contextLabel} should not show clinical or lifecycle transition actions.`)
  }

  const statusActionMenuVisible = await evaluate(
    cdp,
    `document.querySelector(${JSON.stringify(`[aria-label="${APPOINTMENT_STATUS_MENU_LABEL}"]`)}) instanceof HTMLButtonElement`,
  )

  if (statusActionMenuVisible) {
    throw new Error(`${contextLabel} should not show appointment status action menu.`)
  }
}

async function typeInto(cdp, selector, value) {
  const ok = await evaluate(
    cdp,
    `(() => {
      const field = document.querySelector(${JSON.stringify(selector)});
      if (!field) return false;
      field.focus();
      const prototype = field instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(
        prototype,
        'value',
      )?.set;
      setter?.call(field, ${JSON.stringify(value)});
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`,
  )

  if (!ok) {
    throw new Error(`Could not type into ${selector}`)
  }
}

async function setDateInput(cdp, selector, value) {
  const ok = await evaluate(
    cdp,
    `(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      if (!(input instanceof HTMLInputElement)) {
        return false;
      }
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      setter?.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return input.value === ${JSON.stringify(value)};
    })()`,
  )

  if (!ok) {
    throw new Error(`Could not set date input ${selector} to ${value}`)
  }
}

async function setSelectValue(cdp, selector, value) {
  const ok = await evaluate(
    cdp,
    `(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      if (!(input instanceof HTMLSelectElement)) {
        return false;
      }
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value',
      )?.set;
      setter?.call(input, ${JSON.stringify(value)});
      const valueWasApplied = input.value === ${JSON.stringify(value)};
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return valueWasApplied;
    })()`,
  )

  if (!ok) {
    throw new Error(`Could not set select ${selector} to ${value}`)
  }
}

async function waitForDateInputValue(cdp, selector, expectedValue) {
  await waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const input = document.querySelector(${JSON.stringify(selector)});
          return input instanceof HTMLInputElement
            ? input.value === ${JSON.stringify(expectedValue)}
            : false;
        })()`,
      ),
    `date input value ${expectedValue}`,
  )
}

async function getInputValue(cdp, selector) {
  return evaluate(
    cdp,
    `(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      return input instanceof HTMLInputElement ? input.value : null;
    })()`,
  )
}

async function getFieldValue(cdp, selector) {
  return evaluate(
    cdp,
    `(() => {
      const field = document.querySelector(${JSON.stringify(selector)});

      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      ) {
        return field.value;
      }

      return null;
    })()`,
  )
}

async function getSelectValue(cdp, selector) {
  return evaluate(
    cdp,
    `(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      return input instanceof HTMLSelectElement ? input.value : null;
    })()`,
  )
}

async function assertInputValue(cdp, selector, expectedValue) {
  const actualValue = await getInputValue(cdp, selector)

  if (actualValue !== expectedValue) {
    throw new Error(
      `Expected ${selector} value ${expectedValue}, received ${actualValue}`,
    )
  }
}

async function assertFieldValue(cdp, selector, expectedValue) {
  const actualValue = await getFieldValue(cdp, selector)

  if (actualValue !== expectedValue) {
    throw new Error(
      `Expected ${selector} value ${expectedValue}, received ${actualValue}`,
    )
  }
}

async function assertSelectValue(cdp, selector, expectedValue) {
  const actualValue = await getSelectValue(cdp, selector)

  if (actualValue !== expectedValue) {
    throw new Error(
      `Expected ${selector} value ${expectedValue}, received ${actualValue}`,
    )
  }
}

async function getSelectOptionValueByText(cdp, selector, text) {
  return evaluate(
    cdp,
    `(() => {
      const select = document.querySelector(${JSON.stringify(selector)});

      if (!(select instanceof HTMLSelectElement)) {
        return null;
      }

      const option = Array.from(select.options).find((item) =>
        item.textContent?.includes(${JSON.stringify(text)}),
      );

      return option?.value ?? null;
    })()`,
  )
}

async function collectAppointmentsDebugSnapshot(cdp) {
  return evaluate(
    cdp,
    `(() => {
      const dateInput = document.querySelector('[data-testid="appointments-date-input"]');
      const loading = document.querySelector('[data-testid="appointments-loading-state"]');
      const emptyState = document.querySelector('[data-testid="appointments-empty-state"]');
      const cards = document.querySelectorAll('[data-testid="appointment-card"]').length;
      const bodyText = document.body ? document.body.innerText.slice(0, 600) : null;

      return {
        dateInputValue: dateInput instanceof HTMLInputElement ? dateInput.value : null,
        loadingVisible: Boolean(loading),
        emptyStateVisible: Boolean(emptyState),
        appointmentCardCount: cards,
        bodyText,
      };
    })()`,
  )
}

async function waitForAppointmentsDateState(cdp) {
  return waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const loading = document.querySelector('[data-testid="appointments-loading-state"]');
          if (loading) {
            return false;
          }

          const hasEmptyState = Boolean(
            document.querySelector('[data-testid="appointments-empty-state"]'),
          );
          const cardCount = document.querySelectorAll('[data-testid="appointment-card"]').length;

          if (hasEmptyState) {
            return 'empty';
          }

          if (cardCount > 0) {
            return 'cards';
          }

          return false;
        })()`,
      ),
    'appointments date state ready',
  )
}

async function assertNoAppointmentOperationalActions(cdp, contextLabel) {
  const visible = await evaluate(
    cdp,
    `Array.from(document.querySelectorAll('button, a'))
      .some((element) => ${JSON.stringify([
        ...OPERATIONAL_TRANSITION_ACTIONS,
        ...OPERATIONAL_CORRECTION_ACTIONS,
      ])}.includes(element.textContent?.trim() ?? ''))`,
  )

  if (visible) {
    throw new Error(`${contextLabel} should not show operational transition actions.`)
  }
}

async function setViewport(cdp, viewport) {
  await cdp.command('Emulation.setDeviceMetricsOverride', {
    deviceScaleFactor: viewport.deviceScaleFactor,
    height: viewport.height,
    mobile: viewport.mobile,
    width: viewport.width,
  })
}

async function assertNoHorizontalOverflow(cdp, label, viewportWidth) {
  const metrics = await evaluate(
    cdp,
    `(() => {
      const documentElement = document.documentElement;
      const body = document.body;

      return {
        bodyClientWidth: body?.clientWidth ?? 0,
        bodyScrollWidth: body?.scrollWidth ?? 0,
        documentClientWidth: documentElement.clientWidth,
        documentScrollWidth: documentElement.scrollWidth,
      };
    })()`,
  )

  const documentOverflow =
    metrics.documentScrollWidth >
    metrics.documentClientWidth + OVERFLOW_TOLERANCE_PX
  const bodyOverflow =
    metrics.bodyScrollWidth > metrics.bodyClientWidth + OVERFLOW_TOLERANCE_PX

  if (documentOverflow || bodyOverflow) {
    throw new Error(
      [
        `Horizontal overflow detected on ${label}.`,
        `viewportWidth=${viewportWidth}`,
        `documentScrollWidth=${metrics.documentScrollWidth}`,
        `documentClientWidth=${metrics.documentClientWidth}`,
        `bodyScrollWidth=${metrics.bodyScrollWidth}`,
        `bodyClientWidth=${metrics.bodyClientWidth}`,
        `tolerance=${OVERFLOW_TOLERANCE_PX}`,
      ].join(' '),
    )
  }
}

async function assertAppointmentCardMenuAnchoredAndContained(
  cdp,
  cardText,
  label,
  viewportWidth,
) {
  const geometry = await evaluate(
    cdp,
    `(() => {
      const cards = Array.from(document.querySelectorAll(${JSON.stringify(APPOINTMENT_CARD_SELECTOR)}));
      const card = cards.find((element) => element.textContent?.includes(${JSON.stringify(cardText)}));

      if (!card) {
        return { error: 'card_not_found' };
      }

      const trigger = card.querySelector(${JSON.stringify(`[aria-label="${APPOINTMENT_CARD_MENU_LABEL}"]`)});

      if (!(trigger instanceof HTMLButtonElement)) {
        return { error: 'trigger_not_found' };
      }

      const cardRect = card.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      return {
        cardRight: Math.round(cardRect.right),
        cardTop: Math.round(cardRect.top),
        triggerLeft: Math.round(triggerRect.left),
        triggerRight: Math.round(triggerRect.right),
        triggerTop: Math.round(triggerRect.top),
      };
    })()`,
  )

  if (geometry.error) {
    throw new Error(
      `${label}: appointment card menu trigger check failed (${geometry.error}).`,
    )
  }

  const isNearRightEdge = geometry.triggerRight >= geometry.cardRight - 18
  const isNearTopEdge = geometry.triggerTop <= geometry.cardTop + 24

  if (!isNearRightEdge || !isNearTopEdge) {
    throw new Error(
      [
        `${label}: appointment card menu trigger is not anchored in the card upper-right area.`,
        `viewportWidth=${viewportWidth}`,
        `cardTop=${geometry.cardTop}`,
        `cardRight=${geometry.cardRight}`,
        `triggerTop=${geometry.triggerTop}`,
        `triggerLeft=${geometry.triggerLeft}`,
        `triggerRight=${geometry.triggerRight}`,
      ].join(' '),
    )
  }

  await openAppointmentCardMenu(cdp, cardText)
  await waitFor(
    () =>
      evaluate(
        cdp,
        `document.querySelector('[role="menu"]') instanceof HTMLElement`,
      ),
    `${label} appointment menu open`,
  )
  await assertNoHorizontalOverflow(cdp, `${label} with appointment menu open`, viewportWidth)

  const menuGeometry = await evaluate(
    cdp,
    `(() => {
      const menu = document.querySelector('[role="menu"]');

      if (!(menu instanceof HTMLElement)) {
        return { error: 'menu_not_found' };
      }

      const rect = menu.getBoundingClientRect();

      return {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        viewportWidth: window.innerWidth,
      };
    })()`,
  )

  if (menuGeometry.error) {
    throw new Error(`${label}: appointment menu check failed (${menuGeometry.error}).`)
  }

  if (
    menuGeometry.left < -OVERFLOW_TOLERANCE_PX ||
    menuGeometry.right > menuGeometry.viewportWidth + OVERFLOW_TOLERANCE_PX
  ) {
    throw new Error(
      [
        `${label}: appointment menu opened outside the viewport.`,
        `viewportWidth=${viewportWidth}`,
        `menuLeft=${menuGeometry.left}`,
        `menuRight=${menuGeometry.right}`,
      ].join(' '),
    )
  }
}

async function runResponsiveOverflowSmoke(cdp, screens) {
  for (const viewport of RESPONSIVE_OVERFLOW_VIEWPORTS) {
    await setViewport(cdp, viewport)

    for (const screen of screens) {
      const label = `${screen.label} (${viewport.label})`

      const screenUrl =
        typeof screen.url === 'function' ? screen.url(viewport) : screen.url

      await navigate(cdp, screenUrl)
      await waitFor(
        () => textIncludes(cdp, screen.waitForText),
        `${label} ready`,
      )

      if (screen.prepare) {
        await screen.prepare(cdp, label, viewport)
      }

      await waitFor(
        () =>
          evaluate(
            cdp,
            `!document.querySelector('[data-testid="appointments-loading-state"]')`,
          ),
        `${label} loading settled`,
      )
      await assertNoHorizontalOverflow(cdp, label, viewport.width)
    }
  }
}

async function textIncludes(cdp, text) {
  return evaluate(
    cdp,
    `(() => {
      const body = document.body;
      return body ? body.innerText.includes(${JSON.stringify(text)}) : false;
    })()`,
  )
}

async function completeVisibleVisit(cdp, procedureName, clinicalNote) {
  await waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const nextButton = Array.from(document.querySelectorAll('button'))
            .find((element) => element.textContent?.trim() === 'Next');
          return document.body?.innerText.includes('Review today') &&
            nextButton instanceof HTMLButtonElement &&
            !nextButton.disabled;
        })()`,
      ),
    'visit completion ready for first step navigation',
  )
  await clickByText(cdp, 'Next')
  await waitFor(() => textIncludes(cdp, 'What was done?'), 'procedures step')
  await typeInto(
    cdp,
    'input[placeholder="Composite filling"]',
    procedureName,
  )
  await typeInto(cdp, 'input[placeholder="16, upper right, full mouth"]', '16')
  await clickByText(cdp, 'Next')
  await waitFor(() => textIncludes(cdp, 'What should be recorded?'), 'notes step')
  const servicesStepVisible = await textIncludes(cdp, 'Services & Charges')
  if (servicesStepVisible) {
    throw new Error('Visit Completion should not expose Services & Charges during the Task 92 freeze.')
  }
  await typeInto(
    cdp,
    'textarea[placeholder="What was observed and completed today?"]',
    clinicalNote,
  )
  await clickByText(cdp, 'Next')
  await waitFor(() => textIncludes(cdp, 'What happens next?'), 'next step')
  await clickByText(cdp, 'Next')
  await waitFor(() => textIncludes(cdp, 'Review and complete'), 'review step')
  await clickByText(cdp, 'Complete Visit')
  await waitFor(
    () => textIncludes(cdp, 'Confirm Visit Completion'),
    'completion confirmation',
  )
  await clickByText(cdp, 'Confirm completion')
  await waitFor(() => textIncludes(cdp, 'Visit Completed'), 'visit completed')
  await waitFor(
    () => textIncludes(cdp, 'Visit was completed successfully.'),
    'visit completion success message',
  )
  const retryVisible = await evaluate(
    cdp,
    `document.querySelector('[data-testid="visit-services-finalization-retry"]') !== null`,
  )

  if (retryVisible) {
    throw new Error('Clinical-only completion should not show financial finalization retry.')
  }

  const ledgerRetryVisible = await evaluate(
    cdp,
    `document.querySelector('[data-testid="visit-ledger-posting-retry"]') !== null`,
  )
  const ledgerWarningVisible = await evaluate(
    cdp,
    `document.querySelector('[data-testid="visit-ledger-posting-retry-state"]') !== null`,
  )

  if (ledgerRetryVisible || ledgerWarningVisible) {
    throw new Error('Clinical-only completion should not show ledger posting retry or warning.')
  }
}

async function addPerformedServiceDraftRow(cdp) {
  await waitFor(() => textIncludes(cdp, 'Services & Charges'), 'services step')
  await waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const button = document.querySelector('[data-testid="visit-add-service"]');
          return button instanceof HTMLButtonElement && !button.disabled;
        })()`,
      ),
    'performed service add button ready',
  )
  await clickSelector(cdp, '[data-testid="visit-add-service"]')
  await waitFor(
    () =>
      evaluate(
        cdp,
        `document.querySelector('[data-testid="visit-service-row"]') !== null`,
      ),
    'performed service row added',
  )

  const serviceOptionValue = await waitFor(
    () =>
      getSelectOptionValueByText(
        cdp,
        '[data-testid="visit-service-select"]',
        PERFORMED_SERVICE_NAME,
      ),
    'performed service catalog option',
  )
  await setSelectValue(
    cdp,
    '[data-testid="visit-service-select"]',
    serviceOptionValue,
  )
  await waitFor(
    () =>
      getFieldValue(cdp, '[data-testid="visit-service-unit-price"]').then(
        (value) => value === PERFORMED_SERVICE_PRICE,
      ),
    'performed service default unit price',
  )

  const providerOptionValue = await waitFor(
    () =>
      getSelectOptionValueByText(
        cdp,
        '[data-testid="visit-service-provider"]',
        ASSIGNED_PROVIDER_NAME,
      ),
    'performed service credited provider option',
  )
  await setSelectValue(
    cdp,
    '[data-testid="visit-service-provider"]',
    providerOptionValue,
  )
  await typeInto(
    cdp,
    '[data-testid="visit-service-quantity"]',
    PERFORMED_SERVICE_QUANTITY,
  )
  await typeInto(
    cdp,
    '[data-testid="visit-service-tooth"]',
    PERFORMED_SERVICE_TOOTH,
  )
  await waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const total = document.querySelector('[data-testid="visit-services-draft-total"]');
          return total?.textContent?.includes('8.400') ?? false;
        })()`,
      ),
    'performed service draft total',
  )
}

async function assertPerformedServiceDraftRowReloaded(cdp) {
  await waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const row = document.querySelector('[data-testid="visit-service-row"]');
          const text = row?.textContent ?? '';
          const total = document.querySelector('[data-testid="visit-services-draft-total"]')?.textContent ?? '';
          return text.includes(${JSON.stringify(PERFORMED_SERVICE_NAME)}) &&
            text.includes(${JSON.stringify(ASSIGNED_PROVIDER_NAME)}) &&
            total.includes('8.400');
        })()`,
      ),
    'performed service draft row reloaded',
  )
  await assertFieldValue(
    cdp,
    '[data-testid="visit-service-unit-price"]',
    PERFORMED_SERVICE_PRICE,
  )
  await assertFieldValue(
    cdp,
    '[data-testid="visit-service-quantity"]',
    PERFORMED_SERVICE_QUANTITY,
  )
  await assertFieldValue(
    cdp,
    '[data-testid="visit-service-tooth"]',
    PERFORMED_SERVICE_TOOTH,
  )
}

async function assertPerformedServicesReviewSummary(cdp) {
  await waitFor(
    () =>
      evaluate(
        cdp,
        `(() => {
          const summary = document.querySelector('[data-testid="visit-services-review-summary"]');
          const text = summary?.textContent ?? '';
          return text.includes(${JSON.stringify(PERFORMED_SERVICE_NAME)}) &&
            text.includes(${JSON.stringify(ASSIGNED_PROVIDER_NAME)}) &&
            text.includes('8.400') &&
            text.includes('Draft total');
        })()`,
      ),
    'performed services review summary',
  )
}

async function waitForDraftSaveSuccess(cdp, label) {
  let result

  try {
    result = await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const bodyText = document.body?.innerText ?? '';
            if (bodyText.includes('Visit draft was saved successfully.')) {
              return { ok: true, bodyText: '' };
            }
            if (
              bodyText.includes('Visit draft was not saved') ||
              bodyText.includes('services and charges were not saved') ||
              bodyText.includes('Each service row needs') ||
              bodyText.includes('could not be saved') ||
              bodyText.includes('A credited provider is required')
            ) {
              return { ok: false, bodyText: bodyText.slice(0, 1200) };
            }
            return null;
          })()`,
        ),
      label,
    )
  } catch (error) {
    const bodyText = await evaluate(
      cdp,
      `(document.body?.innerText ?? '').slice(0, 1600)`,
    )
    throw new Error(`${label} timed out:\n${bodyText}`)
  }

  if (!result.ok) {
    throw new Error(`${label} failed:\n${result.bodyText}`)
  }
}

async function installOneTimePerformedServiceFinalizationFailure(cdp) {
  let failed = false

  await cdp.command('Fetch.enable', {
    patterns: [
      {
        requestStage: 'Request',
        urlPattern: '*performed_services*',
      },
    ],
  })

  const unsubscribe = cdp.on('Fetch.requestPaused', (params) => {
    const postData = params.request?.postData ?? ''
    const isFinalizationPatch =
      params.request?.method === 'PATCH' &&
      postData.includes('"status":"finalized"')

    if (!failed && isFinalizationPatch) {
      failed = true
      void cdp
        .command('Fetch.fulfillRequest', {
          requestId: params.requestId,
          responseCode: 503,
          responseHeaders: [
            { name: 'content-type', value: 'application/json' },
          ],
          body: Buffer.from(
            JSON.stringify({
              message: 'Browser smoke forced finalization retry.',
            }),
          ).toString('base64'),
        })
        .catch(() => undefined)
      return
    }

    void cdp
      .command('Fetch.continueRequest', {
        requestId: params.requestId,
      })
      .catch(() => undefined)
  })

  return async () => {
    unsubscribe()
    await cdp.command('Fetch.disable').catch(() => undefined)
    return failed
  }
}

async function installOneTimeLedgerPostingFailure(cdp) {
  let failed = false

  await cdp.command('Fetch.enable', {
    patterns: [
      {
        requestStage: 'Request',
        urlPattern: '*post_finalized_performed_services_to_patient_ledger*',
      },
    ],
  })

  const unsubscribe = cdp.on('Fetch.requestPaused', (params) => {
    const isLedgerPostingRequest = params.request?.method === 'POST'

    if (!failed && isLedgerPostingRequest) {
      failed = true
      void cdp
        .command('Fetch.fulfillRequest', {
          requestId: params.requestId,
          responseCode: 503,
          responseHeaders: [
            { name: 'content-type', value: 'application/json' },
          ],
          body: Buffer.from(
            JSON.stringify({
              message: 'Browser smoke forced ledger posting retry.',
            }),
          ).toString('base64'),
        })
        .catch(() => undefined)
      return
    }

    void cdp
      .command('Fetch.continueRequest', {
        requestId: params.requestId,
      })
      .catch(() => undefined)
  })

  return async () => {
    unsubscribe()
    await cdp.command('Fetch.disable').catch(() => undefined)
    return failed
  }
}

async function main() {
  const fixtureVisitId = await prepareFixture()
  const profileDir = await mkdtemp(join(tmpdir(), 'dentapp-task43c-'))
  const port = 9223 + Math.floor(Math.random() * 1000)
  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--no-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      APP_URL,
    ],
    { stdio: 'ignore' },
  )

  const cdp = await connectToChrome(port)

  try {
    await cdp.command('Page.enable')
    await cdp.command('Runtime.enable')
    await cdp.command('Network.enable')
    await navigate(cdp, PATIENT_URL)

    await waitFor(
      () => textIncludes(cdp, 'DentApp Login'),
      'unauthenticated redirect to login',
    )

    await typeInto(cdp, 'input[type="email"]', EMAIL)
    await typeInto(cdp, 'input[type="password"]', DEMO_PASSWORD)
    await clickByText(cdp, 'Sign in')

    await waitFor(
      () => evaluate(cdp, 'location.pathname !== "/login"'),
      'post-login navigation',
    )

    await navigate(cdp, PATIENT_URL)
    await assertRestyledPatientWorkflowSurface(cdp, 'View completed visit')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="patient-rebooking-entry"]') instanceof HTMLElement`,
        ),
      'patient appointment summary loaded',
    )

    await waitFor(
      () => textIncludes(cdp, 'No upcoming appointment scheduled'),
      'empty appointment state',
    )
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'follow-up recommendation',
    )

    await waitFor(
      () => textIncludes(cdp, 'Current workflow'),
      'patient overview',
    )
    await assertRestyledPatientWorkflowSurface(cdp, 'View completed visit')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="patient-section-selector"]') instanceof HTMLSelectElement`,
        ),
      'mobile patient section selector',
    )
    await setSelectValue(cdp, '[data-testid="patient-section-selector"]', 'timeline')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `location.search.includes('section=timeline') && document.querySelector('[data-testid="patient-section-selector"]')?.value === 'timeline'`,
        ),
      'mobile section selector updates timeline query',
    )
    await navigate(cdp, `${PATIENT_URL}?section=timeline`)
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="patient-section-selector"]')?.value === 'timeline'`,
        ),
      'mobile section selector preserves timeline query on refresh',
    )
    await setSelectValue(cdp, '[data-testid="patient-section-selector"]', 'medical-record')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `location.search.includes('section=medical-record') && document.querySelector('[data-testid="patient-section-selector"]')?.value === 'medical-record'`,
        ),
      'mobile section selector updates medical query',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="patient-full-record-workspace"]') instanceof HTMLElement &&
            document.body?.innerText.includes('Record')`,
        ),
      'record section visible after selector change',
    )
    await navigate(cdp, PATIENT_URL)
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'follow-up recommendation after viewport reset',
    )

    await clickByText(cdp, 'Schedule follow-up')
    await waitFor(
      () => textIncludes(cdp, 'Follow-up context is ready.'),
      'follow-up prefill feedback',
    )

    const prefillValue = await evaluate(
      cdp,
      `document.querySelector('[data-testid="patient-appointment-reason"]')?.value`,
    )

    if (prefillValue !== EXPECTED_PREFILL) {
      throw new Error(`Unexpected prefill value: ${prefillValue}`)
    }

    const originalAppointmentDate = await getInputValue(
      cdp,
      '[data-testid="patient-appointment-date"]',
    )
    const originalAppointmentTime = await getInputValue(
      cdp,
      '[data-testid="patient-appointment-time"]',
    )

    await setDateInput(cdp, '[data-testid="patient-appointment-date"]', '')
    await clickSelector(cdp, '[data-testid="patient-appointment-submit"]')
    await waitFor(
      () => textIncludes(cdp, 'Choose an appointment date.'),
      'missing appointment date validation',
    )

    await setDateInput(
      cdp,
      '[data-testid="patient-appointment-date"]',
      originalAppointmentDate,
    )
    await typeInto(cdp, '[data-testid="patient-appointment-time"]', '')
    await clickSelector(cdp, '[data-testid="patient-appointment-submit"]')
    await waitFor(
      () => textIncludes(cdp, 'Choose an appointment time.'),
      'missing appointment time validation',
    )
    await typeInto(
      cdp,
      '[data-testid="patient-appointment-time"]',
      originalAppointmentTime,
    )
    await assertFieldValue(
      cdp,
      '[data-testid="patient-appointment-time"]',
      originalAppointmentTime,
    )
    await typeInto(cdp, '[data-testid="patient-appointment-reason"]', '   ')
    await assertFieldValue(cdp, '[data-testid="patient-appointment-reason"]', '   ')
    await clickSelector(cdp, '[data-testid="patient-appointment-submit"]')
    await waitFor(
      () => textIncludes(cdp, 'Reason cannot be only spaces.'),
      'whitespace appointment reason validation',
    )
    await typeInto(
      cdp,
      '[data-testid="patient-appointment-reason"]',
      EXPECTED_PREFILL,
    )
    await assertFieldValue(
      cdp,
      '[data-testid="patient-appointment-reason"]',
      EXPECTED_PREFILL,
    )
    await typeInto(cdp, '[data-testid="patient-appointment-notes"]', '   ')
    await assertFieldValue(cdp, '[data-testid="patient-appointment-notes"]', '   ')
    await clickSelector(cdp, '[data-testid="patient-appointment-submit"]')
    await waitFor(
      () => textIncludes(cdp, 'Notes cannot be only spaces.'),
      'whitespace appointment notes validation',
    )
    await typeInto(cdp, '[data-testid="patient-appointment-notes"]', '')

    const appointmentCountBeforeSubmit = await getCreatedAppointmentCount()
    const submitted = await evaluate(
      cdp,
      `(() => {
        const button = document.querySelector('[data-testid="patient-appointment-submit"]');
        if (!button) return false;
        button.click();
        button.click();
        return true;
      })()`,
    )

    if (!submitted) {
      throw new Error('Could not submit appointment form')
    }

    await waitFor(
      () => textIncludes(cdp, 'Appointment was created successfully.'),
      'appointment create success',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const success = document.querySelector('[data-testid="patient-appointment-success"]');
            const text = success?.textContent ?? '';
            return text.includes('Appointment was created successfully.') &&
              text.includes('View appointment');
          })()`,
        ),
      'appointment create success detail action',
    )
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'created appointment reason shown',
    )

    await navigate(cdp, PATIENT_URL)
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'created appointment survives refresh',
    )

    const appointmentId = await getCreatedAppointmentId()
    const createdAppointmentDate = await getCreatedAppointmentDateInputValue()
    const createdAppointmentCount = await getCreatedAppointmentCount()

    if (createdAppointmentCount !== appointmentCountBeforeSubmit + 1) {
      throw new Error(
        `Expected one newly created appointment, count moved from ${appointmentCountBeforeSubmit} to ${createdAppointmentCount}.`,
      )
    }

    await navigate(cdp, DEMO_SLUG_PATIENT_URL)
    await waitFor(
      () => textIncludes(cdp, 'Schedule appointment'),
      'demo slug patient appointment form',
    )
    await clickByText(cdp, 'Schedule appointment')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="patient-appointment-form"]') instanceof HTMLElement`,
        ),
      'demo slug patient appointment form opened',
    )
    await assertSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'consultation')
    await setSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'filling')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'filling')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-duration"]', '45')
    await setSelectValue(cdp, '[data-testid="patient-appointment-duration"]', '75')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-duration"]', '75')
    await setSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'consultation')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'consultation')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-duration"]', '30')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const select = document.querySelector('[data-testid="patient-appointment-provider"]');
            return select instanceof HTMLSelectElement &&
              select.textContent.includes(${JSON.stringify(ASSIGNED_PROVIDER_NAME)}) &&
              select.textContent.includes('Not assigned');
          })()`,
        ),
      'appointment provider dropdown options',
    )
    const assignedProviderValue = await getSelectOptionValueByText(
      cdp,
      '[data-testid="patient-appointment-provider"]',
      ASSIGNED_PROVIDER_NAME,
    )

    if (!assignedProviderValue) {
      throw new Error('Doctor Demo provider option was not available.')
    }

    await setSelectValue(
      cdp,
      '[data-testid="patient-appointment-provider"]',
      assignedProviderValue,
    )
    await assertSelectValue(
      cdp,
      '[data-testid="patient-appointment-provider"]',
      assignedProviderValue,
    )
    await setDateInput(cdp, '[data-testid="patient-appointment-date"]', MANUAL_CREATION_DATE)
    await typeInto(cdp, '[data-testid="patient-appointment-time"]', '11:00')
    await typeInto(cdp, '[data-testid="patient-appointment-reason"]', MANUAL_CREATION_REASON)
    await typeInto(cdp, '[data-testid="patient-appointment-notes"]', MANUAL_CREATION_NOTES)
    await assertInputValue(cdp, '[data-testid="patient-appointment-date"]', MANUAL_CREATION_DATE)
    await assertInputValue(cdp, '[data-testid="patient-appointment-time"]', '11:00')

    const manualAppointmentCountBeforeSubmit = await getManualCreatedAppointmentCount()
    let manualAppointmentNetworkRequests = 0
    const unsubscribeManualNetworkCheck = cdp.on(
      'Network.requestWillBeSent',
      (params) => {
        const request = params?.request

        if (
          request?.method === 'POST' &&
          request?.url?.includes('/rest/v1/appointments')
        ) {
          manualAppointmentNetworkRequests += 1
        }
      },
    )
    await clickSelector(cdp, '[data-testid="patient-appointment-submit"]')
    await waitFor(
      async () =>
        (await getManualCreatedAppointmentCount()) >
          manualAppointmentCountBeforeSubmit,
      'manual demo slug appointment create success',
    )
    unsubscribeManualNetworkCheck()

    if (manualAppointmentNetworkRequests === 0) {
      console.warn(
        '[browser smoke] Manual appointment creation request was not captured by CDP, but the backing appointment count increased.',
      )
    }

    const genericCreateErrorVisible = await textIncludes(
      cdp,
      'Could not create appointment. Try again.',
    )

    if (genericCreateErrorVisible) {
      throw new Error('Manual appointment creation showed generic create failure.')
    }

    await waitFor(
      () => textIncludes(cdp, MANUAL_CREATION_REASON),
      'manual demo slug appointment reason shown',
    )
    await waitFor(
      () => textIncludes(cdp, `Assigned provider: ${ASSIGNED_PROVIDER_NAME}`),
      'manual demo slug appointment assigned provider shown',
    )

    const manualAppointmentCountAfterSubmit = await getManualCreatedAppointmentCount()

    if (manualAppointmentCountAfterSubmit !== manualAppointmentCountBeforeSubmit + 1) {
      throw new Error(
        `Expected one manual demo slug appointment, count moved from ${manualAppointmentCountBeforeSubmit} to ${manualAppointmentCountAfterSubmit}.`,
      )
    }

    await navigate(cdp, DEMO_SLUG_PATIENT_URL)
    await waitFor(
      () => textIncludes(cdp, MANUAL_CREATION_REASON),
      'manual demo slug appointment survives refresh',
    )
    await waitFor(
      () => textIncludes(cdp, `Assigned provider: ${ASSIGNED_PROVIDER_NAME}`),
      'manual demo slug appointment provider survives refresh',
    )
    const manualAppointmentId = await getManualCreatedAppointmentId()

    await navigate(cdp, `${DEMO_SLUG_PATIENT_URL}/visit-completion`)
    await waitFor(() => textIncludes(cdp, 'Visit Completion'), 'demo slug ad hoc visit route')
    await waitFor(
      () => textIncludes(cdp, 'New visit completion ready.'),
      'demo slug ad hoc visit ready',
    )
    let demoAdHocVisitNetworkRequests = 0
    const unsubscribeDemoAdHocVisitNetworkCheck = cdp.on(
      'Network.requestWillBeSent',
      (params) => {
        const request = params?.request

        if (
          ['POST', 'PATCH'].includes(request?.method) &&
          request?.url?.includes('/rest/v1/visits')
        ) {
          demoAdHocVisitNetworkRequests += 1
        }
      },
    )
    const demoAdHocLedgerCountBefore = await getLedgerChargeCountForPatient(
      DEMO_SLUG_SUPABASE_PATIENT_ID,
    )
    await completeVisibleVisit(cdp, DEMO_ADHOC_PROCEDURE, DEMO_ADHOC_NOTE)
    const demoAdHocLedgerCountAfter = await getLedgerChargeCountForPatient(
      DEMO_SLUG_SUPABASE_PATIENT_ID,
    )
    unsubscribeDemoAdHocVisitNetworkCheck()

    if (demoAdHocVisitNetworkRequests === 0) {
      throw new Error('Demo slug ad hoc visit completion did not make a visits network request.')
    }
    if (demoAdHocLedgerCountAfter !== demoAdHocLedgerCountBefore) {
      throw new Error('Zero-service ad hoc completion created a ledger charge.')
    }

    const demoAdHocPersistenceWarningVisible = await textIncludes(
      cdp,
      'Demo mode only. No visit completion changes were saved.',
    )

    if (demoAdHocPersistenceWarningVisible) {
      throw new Error('Demo slug ad hoc Visit Completion showed demo-only persistence warning.')
    }

    await clickByText(cdp, 'View patient timeline')
    await waitFor(
      () => textIncludes(cdp, DEMO_ADHOC_PROCEDURE),
      'demo slug ad hoc completed visit visible in timeline',
    )

    const cancelledAppointmentId = await createServiceAppointment(CANCELLED_REASON)
    const noShowAppointmentId = await createServiceAppointment(NO_SHOW_REASON)
    await createServiceAppointment(
      UNASSIGNED_FILTER_REASON,
      1,
      null,
      DEMO_SLUG_SUPABASE_PATIENT_ID,
    )

    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'appointments page for manual route checks')
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', MANUAL_CREATION_DATE)
    await waitForDateInputValue(
      cdp,
      '[data-testid="appointments-date-input"]',
      MANUAL_CREATION_DATE,
    )
    await waitFor(
      () => textIncludes(cdp, MANUAL_CREATION_REASON),
      'manual appointment appears in appointments list',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const select = document.querySelector('[data-testid="appointments-provider-filter"]');
            return select instanceof HTMLSelectElement &&
              select.textContent.includes('All providers') &&
              select.textContent.includes('Unassigned') &&
              select.textContent.includes(${JSON.stringify(ASSIGNED_PROVIDER_NAME)});
          })()`,
        ),
      'appointments provider filter options',
    )
    const scheduleProviderValue = await getSelectOptionValueByText(
      cdp,
      '[data-testid="appointments-provider-filter"]',
      ASSIGNED_PROVIDER_NAME,
    )

    if (!scheduleProviderValue) {
      throw new Error('Appointments provider filter did not include Doctor Demo.')
    }

    const allProviderFilterCardCount = await evaluate(
      cdp,
      `document.querySelectorAll('[data-testid="appointment-card"]').length`,
    )

    await setSelectValue(
      cdp,
      '[data-testid="appointments-provider-filter"]',
      scheduleProviderValue,
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `new URLSearchParams(location.search).get('provider') === ${JSON.stringify(scheduleProviderValue)}`,
        ),
      'appointments provider filter updates URL',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const cards = Array.from(document.querySelectorAll('[data-testid="appointment-card"]'));
            return cards.some((card) => card.textContent?.includes(${JSON.stringify(MANUAL_CREATION_REASON)})) &&
              cards.every((card) => card.textContent?.includes(${JSON.stringify(`Assigned provider: ${ASSIGNED_PROVIDER_NAME}`)}));
          })()`,
        ),
      'appointments provider filter shows assigned provider appointments',
    )
    const assignedProviderFilterCardCount = await evaluate(
      cdp,
      `document.querySelectorAll('[data-testid="appointment-card"]').length`,
    )

    if (assignedProviderFilterCardCount <= 0) {
      throw new Error('Appointments provider filter hid all assigned provider appointments.')
    }

    const unassignedHiddenByProviderFilter = await textIncludes(
      cdp,
      UNASSIGNED_FILTER_REASON,
    )

    if (unassignedHiddenByProviderFilter) {
      throw new Error('Provider-specific filter still showed an unassigned appointment.')
    }

    await setSelectValue(
      cdp,
      '[data-testid="appointments-provider-filter"]',
      'unassigned',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `new URLSearchParams(location.search).get('provider') === 'unassigned'`,
        ),
      'appointments unassigned filter updates URL',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const filterEmpty = document.querySelector('[data-testid="appointments-filter-empty-state"]');
            const cards = Array.from(document.querySelectorAll('[data-testid="appointment-card"]'));

            if (filterEmpty) {
              return filterEmpty.textContent?.includes('No unassigned appointments') ?? false;
            }

            return cards.length > 0 &&
              cards.every((card) => card.textContent?.includes('Assigned provider: Not assigned'));
          })()`,
        ),
      'appointments unassigned provider filter state',
    )
    const assignedHiddenByUnassignedFilter = await textIncludes(
      cdp,
      MANUAL_CREATION_REASON,
    )

    if (assignedHiddenByUnassignedFilter) {
      throw new Error('Unassigned filter still showed an assigned provider appointment.')
    }

    await setSelectValue(cdp, '[data-testid="appointments-provider-filter"]', 'all')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `new URLSearchParams(location.search).get('provider') === 'all'`,
        ),
      'appointments all providers filter updates URL',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const cards = Array.from(document.querySelectorAll('[data-testid="appointment-card"]'));
            const bodyText = document.body?.innerText ?? '';
            return cards.length >= ${allProviderFilterCardCount} &&
              bodyText.includes(${JSON.stringify(MANUAL_CREATION_REASON)}) &&
              bodyText.includes(${JSON.stringify(UNASSIGNED_FILTER_REASON)});
          })()`,
        ),
      'appointments all providers filter restores full schedule',
    )
    await waitForAppointmentCardState(
      cdp,
      MANUAL_CREATION_REASON,
      {
        actionIncludes: ['Mark arrived', 'Start visit'],
        textIncludes: ['Not arrived'],
      },
      'manual appointment starts not arrived',
    )
    await assertRestyledPlannerSurface(cdp, MANUAL_CREATION_REASON, 'Start visit')
    await clickAppointmentCardAction(cdp, MANUAL_CREATION_REASON, 'Mark arrived')
    await waitFor(
      () => textIncludes(cdp, 'Patient marked as arrived.'),
      'manual appointment arrived feedback',
    )
    await waitForAppointmentCardState(
      cdp,
      MANUAL_CREATION_REASON,
      {
        actionExcludes: ['Mark arrived'],
        actionIncludes: ['Ready for doctor', 'Start visit'],
        textIncludes: ['Arrived'],
      },
      'manual appointment arrived card state',
    )
    await setViewport(cdp, RESPONSIVE_OVERFLOW_VIEWPORTS[0])
    await openAppointmentCardMenu(cdp, MANUAL_CREATION_REASON)
    await assertNoHorizontalOverflow(
      cdp,
      'Appointment correction menu after arrival',
      RESPONSIVE_OVERFLOW_VIEWPORTS[0].width,
    )
    await clickByText(cdp, 'Undo arrival')
    await waitFor(
      () => textIncludes(cdp, 'Arrival status was corrected.'),
      'manual appointment undo arrival feedback',
    )
    await waitForAppointmentCardState(
      cdp,
      MANUAL_CREATION_REASON,
      {
        actionExcludes: ['Ready for doctor'],
        actionIncludes: ['Mark arrived', 'Start visit'],
        textIncludes: ['Not arrived'],
      },
      'manual appointment correction back to not arrived',
    )
    await clickAppointmentCardAction(cdp, MANUAL_CREATION_REASON, 'Mark arrived')
    await waitFor(
      () => textIncludes(cdp, 'Patient marked as arrived.'),
      'manual appointment arrived feedback after correction',
    )
    await waitForAppointmentCardState(
      cdp,
      MANUAL_CREATION_REASON,
      {
        actionExcludes: ['Mark arrived'],
        actionIncludes: ['Ready for doctor', 'Start visit'],
        textIncludes: ['Arrived'],
      },
      'manual appointment arrived card state after correction',
    )
    await clickAppointmentCardAction(
      cdp,
      MANUAL_CREATION_REASON,
      'Ready for doctor',
    )
    await waitFor(
      () => textIncludes(cdp, 'Patient is ready for doctor.'),
      'manual appointment ready for doctor feedback',
    )
    await waitForAppointmentCardState(
      cdp,
      MANUAL_CREATION_REASON,
      {
        actionExcludes: [
          'Mark arrived',
          'Ready for doctor',
          'Undo arrival',
          'Move back to arrived',
        ],
        actionIncludes: ['Start visit'],
        textIncludes: ['Ready for doctor'],
      },
      'manual appointment ready for doctor card state',
    )
    await openAppointmentCardMenu(cdp, MANUAL_CREATION_REASON)
    await assertNoHorizontalOverflow(
      cdp,
      'Appointment correction menu after ready for doctor',
      RESPONSIVE_OVERFLOW_VIEWPORTS[0].width,
    )
    await clickByText(cdp, 'Move back to arrived')
    await waitFor(
      () => textIncludes(cdp, 'Appointment moved back to arrived.'),
      'manual appointment move back to arrived feedback',
    )
    await waitForAppointmentCardState(
      cdp,
      MANUAL_CREATION_REASON,
      {
        actionExcludes: ['Mark arrived'],
        actionIncludes: ['Ready for doctor', 'Start visit'],
        textIncludes: ['Arrived'],
      },
      'manual appointment correction back to arrived',
    )
    await clickAppointmentCardAction(
      cdp,
      MANUAL_CREATION_REASON,
      'Ready for doctor',
    )
    await waitFor(
      () => textIncludes(cdp, 'Patient is ready for doctor.'),
      'manual appointment ready for doctor feedback after correction',
    )
    await waitForAppointmentCardState(
      cdp,
      MANUAL_CREATION_REASON,
      {
        actionExcludes: ['Mark arrived', 'Ready for doctor'],
        actionIncludes: ['Start visit'],
        textIncludes: ['Ready for doctor'],
      },
      'manual appointment ready for doctor card state after correction',
    )
    await setViewport(cdp, RESPONSIVE_OVERFLOW_VIEWPORTS[4])
    await clickAppointmentCardAction(cdp, MANUAL_CREATION_REASON, 'Details')
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'manual appointment operational detail page',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const state = document.querySelector('[data-testid="appointment-detail-operational-state"]');
            return state?.textContent?.trim() === 'Ready for doctor';
          })()`,
        ),
      'manual appointment detail shows ready for doctor',
    )
    await clickSelector(
      cdp,
      `[aria-label="${APPOINTMENT_STATUS_MENU_LABEL}"]`,
    )
    await waitFor(
      () => textIncludes(cdp, 'Move back to arrived'),
      'manual appointment detail correction action',
    )
    await assertNoHorizontalOverflow(
      cdp,
      'Appointment detail correction menu',
      RESPONSIVE_OVERFLOW_VIEWPORTS[4].width,
    )
    await createServiceAppointment(
      TODAY_OPERATIONAL_REASON,
      0,
      null,
      DEMO_SLUG_SUPABASE_PATIENT_ID,
    )
    await navigate(cdp, DEMO_SLUG_PATIENT_URL)
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const text = document.body?.innerText ?? '';
            return text.includes(${JSON.stringify(TODAY_OPERATIONAL_REASON)}) &&
              text.includes('Not arrived');
          })()`,
        ),
      'patient appointment summary operational state',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const todayPanel = document.querySelector('[data-testid="patient-today-panel"]');
            const operational = document.querySelector('[data-testid="patient-today-operational-state"]');
            const text = todayPanel?.textContent ?? '';
            return text.includes('Today appointment') &&
              text.includes(${JSON.stringify(TODAY_OPERATIONAL_REASON)}) &&
              operational?.textContent?.trim() === 'Not arrived';
          })()`,
        ),
      'patient today operational state',
    )
    await assertNoAppointmentOperationalActions(
      cdp,
      'Patient appointment summary',
    )
    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'schedule after patient operational summary')
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', MANUAL_CREATION_DATE)
    await waitFor(
      () => textIncludes(cdp, MANUAL_CREATION_REASON),
      'manual appointment visible after patient operational summary',
    )
    await clickAppointmentCardAction(cdp, MANUAL_CREATION_REASON, 'Details')
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'manual appointment operational detail page after summary',
    )
    await clickByText(cdp, 'Back to schedule')
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'schedule after operational detail')
    await navigate(
      cdp,
      `${APPOINTMENTS_URL}?provider=${encodeURIComponent(scheduleProviderValue)}`,
    )
    await waitFor(
      () => textIncludes(cdp, 'Daily schedule'),
      'appointments provider deep link page',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const select = document.querySelector('[data-testid="appointments-provider-filter"]');
            return select instanceof HTMLSelectElement &&
              select.value === ${JSON.stringify(scheduleProviderValue)};
          })()`,
        ),
      'appointments provider deep link restores filter',
    )
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', MANUAL_CREATION_DATE)
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const cards = Array.from(document.querySelectorAll('[data-testid="appointment-card"]'));
            return cards.some((card) => card.textContent?.includes(${JSON.stringify(MANUAL_CREATION_REASON)})) &&
              cards.every((card) => card.textContent?.includes(${JSON.stringify(`Assigned provider: ${ASSIGNED_PROVIDER_NAME}`)}));
          })()`,
        ),
      'appointments provider deep link filters list',
    )
    await navigate(cdp, `${APPOINTMENTS_URL}?provider=not-a-provider`)
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const select = document.querySelector('[data-testid="appointments-provider-filter"]');
            return select instanceof HTMLSelectElement &&
              select.value === 'all';
          })()`,
        ),
      'appointments invalid provider param falls back to all',
    )
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', MANUAL_CREATION_DATE)
    await waitFor(
      () => textIncludes(cdp, MANUAL_CREATION_REASON),
      'appointments schedule restored after invalid provider fallback',
    )
    await clickAppointmentCardMenuAction(cdp, MANUAL_CREATION_REASON, 'Open patient')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `location.pathname === ${JSON.stringify(`/patients/${DEMO_SLUG_PATIENT_ID}`)}`,
        ),
      'appointments Open patient uses demo slug route',
    )
    const openPatientUsedUuid = await evaluate(
      cdp,
      `location.pathname.includes(${JSON.stringify(DEMO_SLUG_SUPABASE_PATIENT_ID)})`,
    )

    if (openPatientUsedUuid) {
      throw new Error('Appointments Open patient used raw Supabase patient UUID.')
    }

    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'appointments page before manual start visit')
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', MANUAL_CREATION_DATE)
    await waitFor(
      () => textIncludes(cdp, MANUAL_CREATION_REASON),
      'manual appointment visible before Start visit',
    )
    await clickAppointmentCardAction(cdp, MANUAL_CREATION_REASON, 'Start visit')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `location.pathname === ${JSON.stringify(`/patients/${DEMO_SLUG_PATIENT_ID}/visit-completion`)} && location.search.includes(${JSON.stringify(manualAppointmentId)})`,
        ),
      'appointments Start visit uses demo slug route',
    )
    await waitFor(
      () => textIncludes(cdp, 'Appointment context'),
      'manual appointment Visit Completion context',
    )
    await waitFor(
      () => textIncludes(cdp, ASSIGNED_PROVIDER_NAME),
      'manual appointment Visit Completion assigned provider context',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const context = document.querySelector('[data-testid="visit-appointment-context"]');
            const provider = document.querySelector('[data-testid="visit-appointment-provider"]');
            const operational = document.querySelector('[data-testid="visit-appointment-operational-state"]');
            return (context?.textContent ?? '').includes('Operational state') &&
              provider?.textContent?.includes(${JSON.stringify(ASSIGNED_PROVIDER_NAME)}) &&
              operational?.textContent?.trim() === 'Ready for doctor';
          })()`,
        ),
      'manual appointment Visit Completion operational state context',
    )

    await navigate(cdp, `${APPOINTMENTS_URL}/${manualAppointmentId}`)
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'manual appointment detail page',
    )
    await waitFor(
      () => textIncludes(cdp, ASSIGNED_PROVIDER_NAME),
      'manual appointment detail assigned provider',
    )
    await assertSelectValue(
      cdp,
      '[data-testid="appointment-detail-provider"]',
      assignedProviderValue,
    )
    await clickByText(cdp, 'Open patient')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `location.pathname === ${JSON.stringify(`/patients/${DEMO_SLUG_PATIENT_ID}`)}`,
        ),
      'appointment detail Open patient uses demo slug route',
    )

    await navigate(cdp, `${APPOINTMENTS_URL}/${manualAppointmentId}`)
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'manual appointment detail before Start visit',
    )
    await clickByText(cdp, 'Start visit')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `location.pathname === ${JSON.stringify(`/patients/${DEMO_SLUG_PATIENT_ID}/visit-completion`)} && location.search.includes(${JSON.stringify(manualAppointmentId)})`,
        ),
      'appointment detail Start visit uses demo slug route',
    )
    await waitFor(
      () => textIncludes(cdp, 'Appointment context'),
      'manual appointment detail Visit Completion context',
    )
    await waitFor(
      () => textIncludes(cdp, ASSIGNED_PROVIDER_NAME),
      'manual appointment detail Visit Completion assigned provider context',
    )

    let demoLinkedVisitNetworkRequests = 0
    const unsubscribeDemoLinkedVisitNetworkCheck = cdp.on(
      'Network.requestWillBeSent',
      (params) => {
        const request = params?.request

        if (
          ['POST', 'PATCH'].includes(request?.method) &&
          request?.url?.includes('/rest/v1/visits')
        ) {
          demoLinkedVisitNetworkRequests += 1
        }
      },
    )
    const demoLinkedLedgerCountBefore = await getLedgerChargeCountForPatient(
      DEMO_SLUG_SUPABASE_PATIENT_ID,
    )
    await completeVisibleVisit(cdp, DEMO_LINKED_PROCEDURE, DEMO_LINKED_NOTE)
    const demoLinkedLedgerCountAfter = await getLedgerChargeCountForPatient(
      DEMO_SLUG_SUPABASE_PATIENT_ID,
    )
    unsubscribeDemoLinkedVisitNetworkCheck()

    if (demoLinkedVisitNetworkRequests === 0) {
      throw new Error('Demo slug linked visit completion did not make a visits network request.')
    }
    if (demoLinkedLedgerCountAfter !== demoLinkedLedgerCountBefore) {
      throw new Error('Zero-service linked completion created a ledger charge.')
    }

    const demoLinkedPersistenceWarningVisible = await textIncludes(
      cdp,
      'Demo mode only. No visit completion changes were saved.',
    )

    if (demoLinkedPersistenceWarningVisible) {
      throw new Error('Demo slug linked Visit Completion showed demo-only persistence warning.')
    }

    await verifyCompletedAppointmentLink(
      manualAppointmentId,
      DEMO_SLUG_SUPABASE_PATIENT_ID,
    )
    await clickByText(cdp, 'View patient timeline')
    await waitFor(
      () => textIncludes(cdp, DEMO_LINKED_PROCEDURE),
      'demo slug linked completed visit visible in timeline',
    )
    await navigate(cdp, `${APPOINTMENTS_URL}/${manualAppointmentId}`)
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'manual completed appointment detail page',
    )
    await waitFor(
      () => textIncludes(cdp, 'Completed'),
      'manual appointment completed after linked visit',
    )
    const manualCompletedStartVisitVisible = await evaluate(
      cdp,
      `Array.from(document.querySelectorAll('button, a')).some((element) => element.textContent?.trim() === 'Start visit')`,
    )

    if (manualCompletedStartVisitVisible) {
      throw new Error('Demo slug completed appointment detail should not show Start visit.')
    }

    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'appointments page')
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', createdAppointmentDate)
    await waitForDateInputValue(
      cdp,
      '[data-testid="appointments-date-input"]',
      createdAppointmentDate,
    )
    await setSelectValue(cdp, '[data-testid="appointments-provider-filter"]', 'all')
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'appointment appears in appointments list',
    )

    await clickByText(cdp, 'Week')
    await waitFor(() => textIncludes(cdp, 'Weekly schedule'), 'weekly schedule mode')
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'appointment appears in weekly appointments list',
    )
    const weekDayCount = await evaluate(
      cdp,
      `document.querySelectorAll('[data-testid="appointments-week-day"]').length`,
    )

    if (weekDayCount !== 7) {
      throw new Error(`Expected 7 weekly day groups, found ${weekDayCount}.`)
    }

    await clickAppointmentCardAction(cdp, EXPECTED_PREFILL, 'Details')
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'appointment detail page from weekly schedule',
    )
    await clickByText(cdp, 'Back to schedule')
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'back to daily schedule')
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', createdAppointmentDate)
    await waitForDateInputValue(
      cdp,
      '[data-testid="appointments-date-input"]',
      createdAppointmentDate,
    )
    await setSelectValue(cdp, '[data-testid="appointments-provider-filter"]', 'all')
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'appointment card visible after returning from weekly detail',
    )

    await navigate(cdp, `${APPOINTMENTS_URL}/${cancelledAppointmentId}`)
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'status polish appointment detail page',
    )
    await waitFor(
      () => textIncludes(cdp, CANCELLED_REASON),
      'status polish appointment reason visible',
    )
    await clickSelector(cdp, `[aria-label="${APPOINTMENT_STATUS_MENU_LABEL}"]`)
    await clickByText(cdp, 'Cancel appointment')
    await waitFor(
      () => textIncludes(cdp, 'Appointment was cancelled.'),
      'cancelled appointment status feedback',
    )
    await waitFor(
      () => textIncludes(cdp, 'Cancelled'),
      'cancelled appointment status visible',
    )
    await waitFor(
      () => textIncludes(cdp, 'Start visit is only available for scheduled appointments.'),
      'cancelled appointment start visit hidden notice',
    )
    await assertNoAppointmentLifecycleActions(
      cdp,
      'Cancelled appointment detail',
    )
    await assertNoAppointmentOperationalActions(
      cdp,
      'Cancelled appointment detail',
    )

    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'schedule after cancelled detail')
    await waitForAppointmentCardState(
      cdp,
      CANCELLED_REASON,
      {
        actionExcludes: [
          'Start visit',
          'Cancel',
          'Mark no-show',
          'Mark arrived',
          'Ready for doctor',
          'Undo arrival',
          'Move back to arrived',
        ],
        textIncludes: ['Cancelled'],
      },
      'cancelled appointment card status and actions',
    )
    await clickAppointmentCardMenuAction(cdp, NO_SHOW_REASON, 'Mark no-show')
    await waitFor(
      () => textIncludes(cdp, 'Appointment was marked no-show.'),
      'no-show appointment status feedback',
    )
    await waitForAppointmentCardState(
      cdp,
      NO_SHOW_REASON,
      {
        actionExcludes: [
          'Start visit',
          'Cancel',
          'Mark no-show',
          'Mark arrived',
          'Ready for doctor',
          'Undo arrival',
          'Move back to arrived',
        ],
        textIncludes: ['No-show'],
      },
      'no-show appointment card status and actions',
    )
    await navigate(cdp, `${APPOINTMENTS_URL}/${noShowAppointmentId}`)
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'no-show appointment detail page',
    )
    await waitFor(
      () => textIncludes(cdp, 'No-show'),
      'no-show appointment detail status visible',
    )
    await assertNoAppointmentLifecycleActions(
      cdp,
      'No-show appointment detail',
    )
    await assertNoAppointmentOperationalActions(
      cdp,
      'No-show appointment detail',
    )
    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'schedule after no-show detail')
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', createdAppointmentDate)
    await waitForDateInputValue(
      cdp,
      '[data-testid="appointments-date-input"]',
      createdAppointmentDate,
    )
    await setSelectValue(cdp, '[data-testid="appointments-provider-filter"]', 'all')
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'scheduled appointment card visible after cancelled detail',
    )

    await clickAppointmentCardAction(cdp, EXPECTED_PREFILL, 'Details')
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'appointment detail page from schedule list',
    )
    await waitFor(
      () => textIncludes(cdp, 'Scheduled'),
      'scheduled appointment status on detail page',
    )
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'appointment reason on detail page',
    )
    await waitFor(
      () => textIncludes(cdp, 'No appointment notes recorded.'),
      'empty appointment notes on detail page',
    )
    await clickByText(cdp, 'Back to schedule')
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'back to schedule')
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', createdAppointmentDate)
    await waitForDateInputValue(
      cdp,
      '[data-testid="appointments-date-input"]',
      createdAppointmentDate,
    )
    await setSelectValue(cdp, '[data-testid="appointments-provider-filter"]', 'all')
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'appointment card visible after returning to schedule',
    )

    await clickAppointmentCardMenuAction(cdp, EXPECTED_PREFILL, 'Open patient')
    await waitFor(
      () => evaluate(cdp, `location.pathname === ${JSON.stringify('/patients/demo-patient-001')}`),
      'open patient from appointments list',
    )

    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'appointments page reload')
    const emptyDate = '2099-12-31'
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', emptyDate)
    await waitForDateInputValue(
      cdp,
      '[data-testid="appointments-date-input"]',
      emptyDate,
    )

    await waitForAppointmentsDateState(cdp)
    const debugSnapshot = await collectAppointmentsDebugSnapshot(cdp)
    const emptyDateStateOk =
      debugSnapshot.dateInputValue === emptyDate &&
      !debugSnapshot.loadingVisible &&
      debugSnapshot.emptyStateVisible &&
      debugSnapshot.appointmentCardCount === 0

    if (!emptyDateStateOk) {
      console.error(
        '[browser smoke] appointments empty date assertion failed:',
        JSON.stringify(
          {
            dateInputValue: debugSnapshot.dateInputValue,
            expectedDateInputValue: emptyDate,
            loadingVisible: debugSnapshot.loadingVisible,
            emptyStateVisible: debugSnapshot.emptyStateVisible,
            appointmentCardCount: debugSnapshot.appointmentCardCount,
            bodyText: debugSnapshot.bodyText,
          },
          null,
          2,
        ),
      )
      throw new Error('Expected appointments empty state after selecting empty date.')
    }

    await setDateInput(cdp, '[data-testid="appointments-date-input"]', createdAppointmentDate)
    await waitForDateInputValue(
      cdp,
      '[data-testid="appointments-date-input"]',
      createdAppointmentDate,
    )
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'appointments date returns to scheduled appointment',
    )

    const scheduledCardButtonTexts = await getAppointmentCardButtonTexts(
      cdp,
      EXPECTED_PREFILL,
    )

    if (
      !scheduledCardButtonTexts?.includes('Start visit') ||
      scheduledCardButtonTexts.includes('Cancel') ||
      scheduledCardButtonTexts.includes('Mark no-show')
    ) {
      throw new Error(
        'Scheduled appointment card should keep lifecycle actions out of primary buttons.',
      )
    }

    const scheduledCardMenuTexts = await getAppointmentCardMenuTexts(
      cdp,
      EXPECTED_PREFILL,
    )

    if (
      !scheduledCardMenuTexts.includes('Cancel') ||
      !scheduledCardMenuTexts.includes('Mark no-show') ||
      scheduledCardMenuTexts.includes('Complete')
    ) {
      throw new Error(
        'Scheduled appointment card should expose only supported secondary lifecycle actions.',
      )
    }

    await clickAppointmentCardAction(cdp, EXPECTED_PREFILL, 'Details')
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'scheduled appointment detail before visit start',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const lifecycle = document.querySelector('[data-testid="appointment-lifecycle-state"]');
            const handoff = document.querySelector('[data-testid="appointment-visit-handoff"]');
            const text = (lifecycle?.textContent ?? '') + ' ' + (handoff?.textContent ?? '');
            return text.includes('ready to start') &&
              text.includes('No Visit Completion draft is linked yet') &&
              text.includes('Start visit opens Visit Completion');
          })()`,
        ),
      'appointment detail ready-to-start lifecycle messaging',
    )
    const scheduledDetailPrimaryLifecycleVisible = await evaluate(
      cdp,
      `Array.from(document.querySelectorAll('button, a'))
        .some((element) => ['Cancel appointment', 'Mark no-show'].includes(element.textContent?.trim() ?? ''))`,
    )

    if (scheduledDetailPrimaryLifecycleVisible) {
      throw new Error('Scheduled appointment detail should keep lifecycle actions in the secondary menu.')
    }

    await clickSelector(cdp, `[aria-label="${APPOINTMENT_STATUS_MENU_LABEL}"]`)
    const scheduledDetailMenuTexts = await evaluate(
      cdp,
      `Array.from(document.querySelectorAll('[role="menuitem"]'))
        .map((element) => element.textContent?.trim() ?? '')
        .filter(Boolean)`,
    )

    if (
      !scheduledDetailMenuTexts.includes('Cancel appointment') ||
      !scheduledDetailMenuTexts.includes('Mark no-show') ||
      scheduledDetailMenuTexts.includes('Complete')
    ) {
      throw new Error('Scheduled appointment detail should expose only supported secondary lifecycle actions.')
    }

    await clickByText(cdp, 'Start visit')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `location.pathname.endsWith('/visit-completion') && location.search.includes(${JSON.stringify(appointmentId)})`,
        ),
      'start visit navigation with appointment id',
    )
    await waitFor(
      () => textIncludes(cdp, 'Appointment context'),
      'appointment context notice',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const context = document.querySelector('[data-testid="visit-appointment-context"]');
            const text = context?.textContent ?? '';
            return text.includes('Scheduled') &&
              text.includes('Patient') &&
              text.includes('Reason / type') &&
              text.includes('Assigned provider') &&
              text.includes(${JSON.stringify(EXPECTED_PREFILL)}) &&
              text.includes('marks the linked appointment completed');
          })()`,
        ),
      'appointment context details visible in Visit Completion',
    )
    await assertRestyledVisitCompletionSurface(cdp, true)
    await waitFor(
      () => textIncludes(cdp, 'No open draft found for this appointment.'),
      'new appointment visit completion ready',
    )

    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What was done?'), 'procedures step')
    await typeInto(
      cdp,
      '[data-testid="visit-procedure-name"]',
      BRIDGE_PROCEDURE,
    )
    await typeInto(cdp, '[data-testid="visit-procedure-tooth"]', '16')
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What should be recorded?'), 'notes step')
    if (await textIncludes(cdp, 'Services & Charges')) {
      throw new Error('Task 92 freeze should remove Services & Charges from Visit Completion.')
    }
    await typeInto(
      cdp,
      '[data-testid="visit-clinical-note"]',
      BRIDGE_NOTE,
    )
    await typeInto(
      cdp,
      '[data-testid="visit-recommendation"]',
      BRIDGE_RECOMMENDATION,
    )
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What happens next?'), 'next step')
    await setSelectValue(cdp, '[data-testid="visit-next-step"]', BRIDGE_NEXT_STEP)
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'Review and complete'), 'review step')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="visit-review-stage"]') instanceof HTMLElement &&
           document.querySelector('[data-testid="visit-review-readiness-summary"]') instanceof HTMLElement`,
        ),
      'review stage semantic regions',
    )
    await clickEnabledButtonByText(cdp, 'Save Draft')
    await waitForDraftSaveSuccess(cdp, 'draft save success feedback')
    await waitFor(
      () => textIncludes(cdp, 'Last saved'),
      'draft save timestamp feedback',
    )

    const visitCompletionUrl = await evaluate(cdp, 'location.href')
    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'schedule after draft save')
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', createdAppointmentDate)
    await waitForDateInputValue(
      cdp,
      '[data-testid="appointments-date-input"]',
      createdAppointmentDate,
    )
    await setSelectValue(cdp, '[data-testid="appointments-provider-filter"]', 'all')
    await waitForAppointmentCardState(
      cdp,
      EXPECTED_PREFILL,
      {
        actionExcludes: ['Mark arrived', 'Ready for doctor'],
        actionIncludes: ['Continue visit'],
        textIncludes: [
          'Visit in progress',
          'Visit Completion draft is in progress',
        ],
      },
      'daily schedule in-progress appointment card',
    )
    await navigate(cdp, `${APPOINTMENTS_URL}/${appointmentId}`)
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const lifecycle = document.querySelector('[data-testid="appointment-lifecycle-state"]');
            const handoff = document.querySelector('[data-testid="appointment-visit-handoff"]');
            const text = (lifecycle?.textContent ?? '') + ' ' + (handoff?.textContent ?? '');
            const hasContinue = Array.from(document.querySelectorAll('button, a'))
              .some((element) => element.textContent?.trim() === 'Continue visit');
            return hasContinue &&
              text.includes('Visit Completion draft') &&
              text.includes('appointment remains scheduled');
          })()`,
        ),
      'appointment detail in-progress lifecycle messaging',
    )
    const inProgressLifecycleActionsVisible = await evaluate(
      cdp,
      `Array.from(document.querySelectorAll('button, a'))
        .some((element) => ['Cancel appointment', 'Mark no-show'].includes(element.textContent?.trim() ?? ''))`,
    )

    if (inProgressLifecycleActionsVisible) {
      throw new Error('In-progress appointment detail should not show destructive lifecycle actions.')
    }
    await assertNoAppointmentOperationalActions(
      cdp,
      'In-progress appointment detail',
    )

    await clickByText(cdp, 'Continue visit')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `location.pathname.endsWith('/visit-completion') && location.search.includes(${JSON.stringify(appointmentId)})`,
        ),
      'continue visit navigation with appointment id',
    )
    await navigate(cdp, visitCompletionUrl)
    await waitFor(
      () => textIncludes(cdp, 'Existing draft for this appointment found and loaded.'),
      'saved draft reload feedback',
    )
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What was done?'), 'reloaded procedures step')
    await assertFieldValue(
      cdp,
      '[data-testid="visit-procedure-name"]',
      BRIDGE_PROCEDURE,
    )
    await assertFieldValue(cdp, '[data-testid="visit-procedure-tooth"]', '16')
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What should be recorded?'), 'reloaded notes step')
    await assertFieldValue(
      cdp,
      '[data-testid="visit-clinical-note"]',
      BRIDGE_NOTE,
    )
    await assertFieldValue(
      cdp,
      '[data-testid="visit-recommendation"]',
      BRIDGE_RECOMMENDATION,
    )
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What happens next?'), 'reloaded next step')
    await assertFieldValue(cdp, '[data-testid="visit-next-step"]', BRIDGE_NEXT_STEP)
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'Review and complete'), 'reloaded review step')
    await clickByText(cdp, 'Complete Visit')
    await waitFor(
      () => textIncludes(cdp, 'Confirm Visit Completion'),
      'completion confirmation',
    )
    await clickByText(cdp, 'Confirm completion')
    await waitFor(() => textIncludes(cdp, 'Visit Completed'), 'visit completed')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="visit-completion-success"]') instanceof HTMLElement`,
        ),
      'visit completion success surface',
    )
    await waitFor(
      () => textIncludes(cdp, 'Visit was completed successfully.'),
      'visit completion success message',
    )
    await waitFor(
      () => textIncludes(cdp, 'View patient timeline'),
      'post-completion patient timeline action',
    )
    await waitFor(
      () => textIncludes(cdp, 'Return to appointment'),
      'post-completion appointment detail action',
    )
    await waitFor(
      () => textIncludes(cdp, 'Daily schedule'),
      'post-completion schedule action',
    )

    const linkedVisitId = await verifyCompletedAppointmentLink(appointmentId)
    const linkedPerformedServicesAfterFreeze =
      await getPerformedServicesSnapshotForVisit(linkedVisitId)
    const linkedLedgerChargesAfterFreeze =
      await getLedgerChargeSnapshotForVisit(linkedVisitId)

    if (linkedPerformedServicesAfterFreeze.length !== 0) {
      throw new Error(
        `Clinical-only completion created performed-service rows: ${JSON.stringify(linkedPerformedServicesAfterFreeze)}`,
      )
    }
    if (linkedLedgerChargesAfterFreeze.length !== 0) {
      throw new Error(
        `Clinical-only completion created ledger charge rows: ${JSON.stringify(linkedLedgerChargesAfterFreeze)}`,
      )
    }

    await clickByText(cdp, 'View patient timeline')
    await waitFor(
      () => textIncludes(cdp, BRIDGE_PROCEDURE),
      'completed visit visible in timeline',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const cards = Array.from(document.querySelectorAll('[data-testid="completed-visit-card"]'));
            const card = cards.find((element) => element.textContent?.includes(${JSON.stringify(BRIDGE_PROCEDURE)}));
            const text = card?.textContent ?? '';
            return text.includes('Completed visit') &&
              text.includes('Completed') &&
              text.includes('Performed work') &&
              text.includes(${JSON.stringify(BRIDGE_NOTE)}) &&
              text.includes(${JSON.stringify(BRIDGE_RECOMMENDATION)}) &&
              text.includes(${JSON.stringify(BRIDGE_NEXT_STEP_LABEL)}) &&
              text.includes('Recommended follow-up') &&
              text.includes('Appointment-linked') &&
              text.includes('Provider');
          })()`,
        ),
      'completed visit timeline card clinical details',
    )
    await clickByText(cdp, 'View details')
    await waitFor(
      () => textIncludes(cdp, 'Completed Visit Review'),
      'completed visit detail page',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const overview = document.querySelector('[data-testid="completed-visit-detail-overview"]');
            const procedures = document.querySelector('[data-testid="completed-visit-detail-procedures"]');
            const note = document.querySelector('[data-testid="completed-visit-detail-clinical-note"]');
            const recommendation = document.querySelector('[data-testid="completed-visit-detail-recommendation"]');
            const followUp = document.querySelector('[data-testid="completed-visit-detail-follow-up"]');
            const appointment = document.querySelector('[data-testid="completed-visit-appointment-context"]');
            const text = [
              overview?.textContent,
              procedures?.textContent,
              note?.textContent,
              recommendation?.textContent,
              followUp?.textContent,
              appointment?.textContent,
            ].join(' ');

            return text.includes('Completed visit') &&
              text.includes('Provider') &&
              text.includes(${JSON.stringify(BRIDGE_PROCEDURE)}) &&
              text.includes(${JSON.stringify(BRIDGE_NOTE)}) &&
              text.includes(${JSON.stringify(BRIDGE_RECOMMENDATION)}) &&
              text.includes(${JSON.stringify(BRIDGE_NEXT_STEP_LABEL)}) &&
              text.includes('Follow-up / Next Step') &&
              text.includes('Linked Appointment');
          })()`,
        ),
      'completed visit detail clinical sections',
    )
    await waitFor(
      () => textIncludes(cdp, BRIDGE_PROCEDURE),
      'procedure visible on detail page',
    )
    await waitFor(
      () => textIncludes(cdp, BRIDGE_NOTE),
      'clinical note visible on detail page',
    )
    await waitFor(
      () => textIncludes(cdp, BRIDGE_RECOMMENDATION),
      'recommendation visible on detail page',
    )
    await waitFor(
      () => textIncludes(cdp, 'Linked Appointment'),
      'linked appointment visible on detail page',
    )
    const completedVisitFinancialSectionVisible = await evaluate(
      cdp,
      `document.querySelector('[data-testid="completed-visit-detail-services-charges"]') !== null`,
    )

    if (completedVisitFinancialSectionVisible) {
      throw new Error('Completed visit detail should not expose Services & charges during the Task 92 freeze.')
    }
    await waitFor(
      () => textIncludes(cdp, 'Print review'),
      'print review action visible on detail page',
    )
    await waitFor(
      () => textIncludes(cdp, 'Schedule follow-up'),
      'completed visit detail follow-up scheduling action',
    )

    await navigate(cdp, `${PATIENT_URL}/visits/${linkedVisitId}`)
    await waitFor(
      () => textIncludes(cdp, 'Completed Visit Review'),
      'returned to posted completed visit detail',
    )

    const detailUrlBeforeFollowUpScheduling = await evaluate(cdp, 'location.href')
    await clickSelector(cdp, '[data-testid="completed-visit-detail-schedule-follow-up"]')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `location.pathname.startsWith('/patients/') && location.search.includes('scheduleFollowUp=true')`,
        ),
      'follow-up scheduling routes to patient appointment flow',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="patient-appointment-reason"]')?.value === ${JSON.stringify(BRIDGE_RECOMMENDATION)}`,
        ),
      'follow-up scheduling prefilled appointment reason',
    )
    await navigate(cdp, detailUrlBeforeFollowUpScheduling)
    await waitFor(
      () => textIncludes(cdp, 'Completed Visit Review'),
      'returned to completed visit detail after follow-up scheduling check',
    )

    const printActionMarkedHidden = await evaluate(
      cdp,
      `(() => {
        const actionContainer = document.querySelector('.print-hidden');
        if (!actionContainer) return false;
        return Array.from(actionContainer.querySelectorAll('button'))
          .some((element) => element.textContent?.trim() === 'Print review');
      })()`,
    )

    if (!printActionMarkedHidden) {
      throw new Error('Print review button is missing print-hidden marker context.')
    }

    await evaluate(
      cdp,
      `(() => {
        window.__dentappPrintCalled = false;
        window.print = () => {
          window.__dentappPrintCalled = true;
          return undefined;
        };
        return true;
      })()`,
    )
    await clickByText(cdp, 'Print review')
    await waitFor(
      () => evaluate(cdp, 'window.__dentappPrintCalled === true'),
      'print review triggers browser print',
    )

    const detailUrl = await evaluate(cdp, 'location.href')
    await navigate(cdp, detailUrl)
    await waitFor(
      () => textIncludes(cdp, 'Completed Visit Review'),
      'completed visit detail survives refresh',
    )
    await clickByText(cdp, 'Back to timeline')
    await waitFor(
      () => textIncludes(cdp, BRIDGE_PROCEDURE),
      'back returns to patient timeline',
    )
    await navigate(cdp, PATIENT_URL)
    await waitFor(
      () => textIncludes(cdp, 'Current workflow'),
      'patient overview after timeline return',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const latestActivity = document.querySelector('[data-testid="patient-latest-clinical-activity"]');
            const followUp = document.querySelector('[data-testid="patient-follow-up-summary"]');
            const actionTexts = Array.from(document.querySelectorAll('button, a'))
              .map((element) => element.textContent?.trim())
              .filter(Boolean);
            const latestText = latestActivity?.textContent ?? '';
            const followUpText = followUp?.textContent ?? '';

            return latestText.includes('Latest Clinical Activity') &&
              latestText.includes('Completed visit') &&
              latestText.includes(${JSON.stringify(BRIDGE_PROCEDURE)}) &&
              latestText.includes(${JSON.stringify(BRIDGE_NOTE)}) &&
              actionTexts.includes('View visit detail') &&
              actionTexts.includes('Open timeline') &&
              actionTexts.includes('Schedule follow-up') &&
              followUpText.includes('Follow-up / Next Step') &&
              followUpText.includes('Source visit date') &&
              followUpText.includes(${JSON.stringify(BRIDGE_RECOMMENDATION)}) &&
              followUpText.includes(${JSON.stringify(BRIDGE_NEXT_STEP_LABEL)}) &&
              followUpText.includes('Follow-up is display-only');
          })()`,
        ),
      'patient overview clinical summary',
    )
    await clickByText(cdp, 'View treatment plan')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const section = document.querySelector('#patient-treatment-plans-section');
            const text = section?.textContent ?? '';
            const sectionActions = Array.from(section?.querySelectorAll('button, a') ?? [])
              .map((element) => element.textContent?.trim())
              .filter(Boolean);
            return location.search.includes('section=treatment-plans') &&
              text.includes('Treatment Plan') &&
              text.includes('Editable') &&
              sectionActions.includes('Create treatment plan') &&
              (
                text.includes('No treatment plan configured') ||
                text.includes('Treatment plan exists but has no planned items') ||
                Boolean(section.querySelector('[data-testid="patient-treatment-plan-detail"]'))
              );
          })()`,
        ),
      'patient treatment plan editable entry point',
    )
    await clickSelector(cdp, '[data-testid="treatment-plan-create-action"], [data-testid="treatment-plan-empty-create-action"]')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="treatment-plan-create-form"]') instanceof HTMLFormElement`,
        ),
      'treatment plan create form',
    )
    await typeInto(cdp, '[data-testid="treatment-plan-title-input"]', TREATMENT_PLAN_TITLE)
    await typeInto(
      cdp,
      '[data-testid="treatment-plan-description-input"]',
      TREATMENT_PLAN_DESCRIPTION,
    )
    await setSelectValue(cdp, '[data-testid="treatment-plan-status-select"]', 'accepted')
    await clickEnabledButtonByText(cdp, 'Create treatment plan')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const section = document.querySelector('#patient-treatment-plans-section');
            const text = section?.textContent ?? '';
            return text.includes(${JSON.stringify(TREATMENT_PLAN_TITLE)}) &&
              text.includes(${JSON.stringify(TREATMENT_PLAN_DESCRIPTION)}) &&
              text.includes('Accepted') &&
              text.includes('Treatment plan was saved successfully.');
          })()`,
        ),
      'created treatment plan displayed',
    )
    await clickSelector(cdp, '[data-testid="treatment-plan-item-add-action"]')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="treatment-plan-item-create-form"]') instanceof HTMLFormElement`,
        ),
      'treatment plan item create form',
    )
    await typeInto(cdp, '[data-testid="treatment-plan-item-tooth-input"]', '16')
    await typeInto(cdp, '[data-testid="treatment-plan-item-title-input"]', TREATMENT_PLAN_ITEM_TITLE)
    await typeInto(
      cdp,
      '[data-testid="treatment-plan-item-description-input"]',
      TREATMENT_PLAN_ITEM_DESCRIPTION,
    )
    await setSelectValue(cdp, '[data-testid="treatment-plan-item-status-select"]', 'planned')
    await clickEnabledButtonByText(cdp, 'Add item')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const section = document.querySelector('#patient-treatment-plans-section');
            const text = section?.textContent ?? '';
            const forbiddenTerms = ['payment', 'balance', 'settlement', 'invoice', 'receipt', 'charge total'];
            return text.includes(${JSON.stringify(TREATMENT_PLAN_ITEM_TITLE)}) &&
              text.includes(${JSON.stringify(TREATMENT_PLAN_ITEM_DESCRIPTION)}) &&
              text.includes('Tooth 16') &&
              forbiddenTerms.every((term) => !text.toLowerCase().includes(term));
          })()`,
        ),
      'created treatment plan item displayed',
    )
    await navigate(cdp, `${PATIENT_URL}?section=treatment-plans`)
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const section = document.querySelector('#patient-treatment-plans-section');
            const text = section?.textContent ?? '';
            return text.includes(${JSON.stringify(TREATMENT_PLAN_TITLE)}) &&
              text.includes(${JSON.stringify(TREATMENT_PLAN_ITEM_TITLE)});
          })()`,
        ),
      'treatment plan persists after reload',
    )
    await clickSelector(cdp, '[data-testid="treatment-plan-edit-action"]')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="treatment-plan-edit-form"]') instanceof HTMLFormElement`,
        ),
      'treatment plan edit form',
    )
    await typeInto(cdp, '[data-testid="treatment-plan-title-input"]', TREATMENT_PLAN_UPDATED_TITLE)
    await typeInto(
      cdp,
      '[data-testid="treatment-plan-description-input"]',
      TREATMENT_PLAN_UPDATED_DESCRIPTION,
    )
    await setSelectValue(cdp, '[data-testid="treatment-plan-status-select"]', 'in_progress')
    await clickEnabledButtonByText(cdp, 'Save plan')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const section = document.querySelector('#patient-treatment-plans-section');
            const text = section?.textContent ?? '';
            return text.includes(${JSON.stringify(TREATMENT_PLAN_UPDATED_TITLE)}) &&
              text.includes(${JSON.stringify(TREATMENT_PLAN_UPDATED_DESCRIPTION)}) &&
              text.includes('In progress');
          })()`,
        ),
      'updated treatment plan displayed',
    )
    await clickSelector(cdp, '[data-testid="treatment-plan-item-edit-action"]')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="treatment-plan-item-edit-form"]') instanceof HTMLFormElement`,
        ),
      'treatment plan item edit form',
    )
    await typeInto(cdp, '[data-testid="treatment-plan-item-title-input"]', TREATMENT_PLAN_ITEM_UPDATED_TITLE)
    await typeInto(
      cdp,
      '[data-testid="treatment-plan-item-description-input"]',
      TREATMENT_PLAN_ITEM_UPDATED_DESCRIPTION,
    )
    await setSelectValue(cdp, '[data-testid="treatment-plan-item-status-select"]', 'in_progress')
    await clickEnabledButtonByText(cdp, 'Save item')
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const section = document.querySelector('#patient-treatment-plans-section');
            const text = section?.textContent ?? '';
            return text.includes(${JSON.stringify(TREATMENT_PLAN_ITEM_UPDATED_TITLE)}) &&
              text.includes(${JSON.stringify(TREATMENT_PLAN_ITEM_UPDATED_DESCRIPTION)}) &&
              text.includes('In progress');
          })()`,
        ),
      'updated treatment plan item displayed',
    )
    await navigate(cdp, PATIENT_URL)
    await waitFor(() => textIncludes(cdp, 'Current workflow'), 'patient overview after treatment plan work')
    await waitFor(
      () => textIncludes(cdp, 'No upcoming appointment scheduled'),
      'completed appointment removed from upcoming summary',
    )

    await navigate(cdp, PATIENT_URL)
    await waitFor(() => textIncludes(cdp, 'Current workflow'), 'patient overview after posted charges link')
    const patientFinancialSectionVisible = await evaluate(
      cdp,
      `document.querySelector('[data-testid="patient-posted-charges-section"]') !== null`,
    )

    if (patientFinancialSectionVisible) {
      throw new Error('Patient Full Record should not expose posted charges during the Task 92 freeze.')
    }

    await navigate(cdp, `${APPOINTMENTS_URL}/${appointmentId}`)
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'completed appointment detail page',
    )
    await waitFor(
      () => textIncludes(cdp, 'Completed'),
      'completed appointment status on detail page',
    )
    await waitFor(
      () => textIncludes(cdp, 'View completed visit'),
      'linked completed visit action on appointment detail',
    )
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const followUp = document.querySelector('[data-testid="appointment-completed-follow-up"]');
            const text = followUp?.textContent ?? '';
            return text.includes('Follow-up from completed visit') &&
              text.includes(${JSON.stringify(BRIDGE_RECOMMENDATION)}) &&
              text.includes(${JSON.stringify(BRIDGE_NEXT_STEP_LABEL)}) &&
              text.includes('Schedule follow-up') &&
              text.includes('No appointment or treatment plan task was created automatically');
          })()`,
        ),
      'completed appointment follow-up summary',
    )
    const startVisitStillVisible = await evaluate(
      cdp,
      `Array.from(document.querySelectorAll('button, a')).some((element) => element.textContent?.trim() === 'Start visit')`,
    )

    if (startVisitStillVisible) {
      throw new Error('Completed appointment detail should not show Start visit.')
    }

    const completedDetailLifecycleVisible = await evaluate(
      cdp,
      `Array.from(document.querySelectorAll('button, a'))
        .some((element) => ['Cancel appointment', 'Mark no-show'].includes(element.textContent?.trim() ?? ''))`,
    )

    if (completedDetailLifecycleVisible) {
      throw new Error('Completed appointment detail should not show cancel or no-show lifecycle actions.')
    }
    await assertNoAppointmentOperationalActions(
      cdp,
      'Completed appointment detail',
    )

    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'schedule after completed detail')
    await setDateInput(cdp, '[data-testid="appointments-date-input"]', createdAppointmentDate)
    await waitForDateInputValue(
      cdp,
      '[data-testid="appointments-date-input"]',
      createdAppointmentDate,
    )
    await setSelectValue(cdp, '[data-testid="appointments-provider-filter"]', 'all')
    await waitForAppointmentCardState(
      cdp,
      EXPECTED_PREFILL,
      {
        actionExcludes: [
          'Start visit',
          'Mark arrived',
          'Ready for doctor',
          'Undo arrival',
          'Move back to arrived',
        ],
        actionIncludes: ['View visit'],
        textIncludes: ['Completed', 'Visit completed', BRIDGE_RECOMMENDATION],
      },
      'daily schedule completed appointment card',
    )
    const completedCardMenuTexts = await getAppointmentCardMenuTexts(
      cdp,
      EXPECTED_PREFILL,
    )

    if (
      completedCardMenuTexts.includes('Cancel') ||
      completedCardMenuTexts.includes('Mark no-show') ||
      completedCardMenuTexts.includes('Mark arrived') ||
      completedCardMenuTexts.includes('Ready for doctor') ||
      completedCardMenuTexts.includes('Undo arrival') ||
      completedCardMenuTexts.includes('Move back to arrived') ||
      completedCardMenuTexts.includes('Complete')
    ) {
      throw new Error('Completed appointment card should not expose lifecycle status actions.')
    }

    await createServiceAppointment(MENU_ANCHOR_REASON)

    await runResponsiveOverflowSmoke(cdp, [
      {
        label: 'Appointments daily schedule',
        url: APPOINTMENTS_URL,
        waitForText: 'Daily schedule',
        prepare: async (browser, label, viewport) => {
          await waitFor(
            () => textIncludes(browser, MENU_ANCHOR_REASON),
            `${label} scheduled menu anchor appointment`,
          )
          await assertAppointmentCardMenuAnchoredAndContained(
            browser,
            MENU_ANCHOR_REASON,
            label,
            viewport.width,
          )
        },
      },
      {
        label: 'Appointments weekly schedule',
        url: APPOINTMENTS_URL,
        waitForText: 'Daily schedule',
        prepare: async (browser, label) => {
          await clickByText(browser, 'Week')
          await waitFor(
            () => textIncludes(browser, 'Weekly schedule'),
            `${label} weekly view ready`,
          )
        },
      },
      {
        label: 'Patient overview',
        url: PATIENT_URL,
        waitForText: 'Current workflow',
        prepare: async (browser, label, viewport) => {
          if (viewport.width === 768 || viewport.width === 1024) {
            await assertRestyledPatientWorkflowSurface(browser, 'View completed visit')
            await assertNoHorizontalOverflow(browser, label, viewport.width)
          }
        },
      },
      {
        label: 'Patient timeline',
        url: `${PATIENT_URL}?section=timeline`,
        waitForText: BRIDGE_PROCEDURE,
      },
      {
        label: 'Appointment detail',
        url: `${APPOINTMENTS_URL}/${appointmentId}`,
        waitForText: 'Appointment Detail',
      },
      {
        label: 'Visit Completion',
        url: (viewport) =>
          `${PATIENT_URL}/visit-completion?responsiveSmoke=${viewport.width}`,
        waitForText: 'Visit Completion',
        prepare: async (browser, label) => {
          await assertRestyledVisitCompletionSurface(browser, false)
          const atProceduresStep = await textIncludes(browser, 'What was done?')

          if (!atProceduresStep) {
            await waitFor(
              () =>
                evaluate(
                  browser,
                  `(() => {
                    const nextButton = Array.from(document.querySelectorAll('button'))
                      .find((element) => element.textContent?.trim() === 'Next');
                    return nextButton instanceof HTMLButtonElement && !nextButton.disabled;
                  })()`,
                ),
              `${label} next action ready`,
            )
            await clickByText(browser, 'Next')
            await waitFor(() => textIncludes(browser, 'What was done?'), `${label} procedures step`)
          }

          if (await textIncludes(browser, 'Services & Charges')) {
            throw new Error(`${label} should not expose Services & Charges during the Task 92 freeze.`)
          }
        },
      },
      {
        label: 'Completed visit detail',
        url: `${PATIENT_URL}/visits/${linkedVisitId}`,
        waitForText: 'Completed Visit Review',
      },
    ])

    await navigate(cdp, `${PATIENT_URL}/visit-completion`)
    await waitFor(() => textIncludes(cdp, 'Visit Completion'), 'normal visit route')
    await assertRestyledVisitCompletionSurface(cdp, false)
    await waitFor(
      () =>
        evaluate(
          cdp,
          `(() => {
            const nextButton = Array.from(document.querySelectorAll('button'))
              .find((element) => element.textContent?.trim() === 'Next');
            return document.body?.innerText.includes('Review today') &&
              nextButton instanceof HTMLButtonElement &&
              !nextButton.disabled;
          })()`,
        ),
      'normal route first step ready',
    )
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What was done?'), 'normal route procedures step')
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What should be recorded?'), 'normal route notes step')
    if (await textIncludes(cdp, 'Services & Charges')) {
      throw new Error('Normal Visit Completion route should not expose Services & Charges.')
    }
    await waitFor(
      () =>
        evaluate(
          cdp,
          `document.querySelector('[data-testid="visit-mobile-progress-header"]') instanceof HTMLElement && document.querySelector('[data-testid="visit-mobile-action-bar"]') instanceof HTMLElement`,
        ),
      'visit completion mobile progress and action elements exist',
    )
    const normalRouteHasAppointmentContext = await textIncludes(
      cdp,
      'Appointment context',
    )

    if (normalRouteHasAppointmentContext) {
      throw new Error('Normal Visit Completion unexpectedly showed appointment context.')
    }

    console.log(
      JSON.stringify(
        {
          fixtureVisitId,
          appointmentId,
          linkedVisitId,
          authenticatedRedirectVerified: true,
          emptyStateVerified: true,
          followUpPrefillVerified: true,
          createAndRefreshVerified: true,
          manualDemoSlugAppointmentCreateVerified: true,
          manualDemoSlugAppointmentNetworkRequestVerified:
            manualAppointmentNetworkRequests > 0,
          demoSlugAdHocVisitCompletionVerified: true,
          demoSlugAdHocVisitNetworkRequestVerified: true,
          demoSlugLinkedVisitCompletionVerified: true,
          demoSlugLinkedVisitNetworkRequestVerified: true,
          demoSlugLinkedAppointmentCompletedVerified: true,
          appointmentListPatientRouteSlugVerified: true,
          appointmentListStartVisitRouteSlugVerified: true,
          appointmentDetailPatientRouteSlugVerified: true,
          appointmentDetailStartVisitRouteSlugVerified: true,
          appointmentCreationValidationVerified: true,
          appointmentWhitespaceValidationVerified: true,
          appointmentDoubleSubmitHarmlessVerified: true,
          appointmentsWeeklyViewVerified: true,
          cancelledAppointmentStartVisitHiddenVerified: true,
          appointmentDetailFromScheduleVerified: true,
          appointmentsListRouteVerified: true,
          appointmentsOpenPatientVerified: true,
          appointmentOperationalStateProgressionVerified: true,
          appointmentOperationalStateDetailVerified: true,
          patientAppointmentSummaryOperationalStateVerified: true,
          patientTodayOperationalStateVerified: true,
          visitCompletionOperationalStateContextVerified: true,
          appointmentOperationalStateIneligibleActionsHiddenVerified: true,
          appointmentsEmptyDateVerified: true,
          startVisitFromAppointmentVerified: true,
          appointmentContextVerified: true,
          appointmentContextDetailsVerified: true,
          servicesChargesStepFrozenVerified: true,
          servicesDraftSaveReloadFrozenVerified: true,
          servicesReviewSummaryFrozenVerified: true,
          servicesCompletionFinalizationFrozenVerified: true,
          servicesCompletionLedgerPostingFrozenVerified: true,
          zeroServiceFlowVerified: true,
          zeroServiceFinalizationStateFrozenVerified: true,
          zeroServiceLedgerPostingFrozenVerified: true,
          servicesFinalizationRetryFrozenVerified: true,
          servicesFinalizationRetryNoDuplicateFrozenVerified: true,
          servicesRetryThenLedgerPostingFrozenVerified: true,
          ledgerPostingRetryFrozenVerified: true,
          ledgerPostingRetryNoDuplicateFrozenVerified: true,
          dailyScheduleInProgressLifecycleVerified: true,
          appointmentDetailReadyLifecycleVerified: true,
          appointmentDetailInProgressLifecycleVerified: true,
          linkedVisitDraftSaveVerified: true,
          linkedVisitDraftReloadVerified: true,
          linkedVisitCompletionVerified: true,
          visitCompletionPostActionsVerified: true,
          completedVisitTimelineClinicalCardVerified: true,
          completedVisitTimelineFollowUpVerified: true,
          completedAppointmentDetailVerified: true,
          completedAppointmentFollowUpVerified: true,
          completedVisitDetailVerified: true,
          completedVisitDetailClinicalSectionsVerified: true,
          completedVisitFinancialVisibilityFrozenVerified: true,
          completedVisitFinancialPendingFrozenVerified: true,
          completedVisitFinancialZeroServiceFrozenVerified: true,
          completedVisitDetailFollowUpVerified: true,
          dailyScheduleCompletedLifecycleVerified: true,
          patientOverviewClinicalSummaryVerified: true,
          patientOverviewFollowUpVerified: true,
          patientOverviewTreatmentPlanVerified: true,
          patientTreatmentPlanEntryPointVerified: true,
          patientTreatmentPlanCreateVerified: true,
          patientTreatmentPlanItemCreateVerified: true,
          patientTreatmentPlanPersistenceVerified: true,
          patientTreatmentPlanEditVerified: true,
          patientTreatmentPlanItemEditVerified: true,
          patientPostedChargesSectionFrozenVerified: true,
          plannerRestyledToolbarAndCardRegionsVerified: true,
          patientDetailWorkflowEntryRestyleVerified: true,
          followUpSchedulingActionVerified: true,
          followUpSchedulingPrefillVerified: true,
          printActionVerified: true,
          responsiveOverflowSmokeVerified: true,
          detailRefreshVerified: true,
          backToTimelineVerified: true,
          normalVisitCompletionWithoutAppointmentVerified: true,
        },
        null,
        2,
      ),
    )
  } finally {
    cdp.close()
    chrome.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
