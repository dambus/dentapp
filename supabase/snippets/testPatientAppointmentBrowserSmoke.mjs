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
const CANCELLED_REASON = 'Task 51 cancelled appointment status check'
const NO_SHOW_REASON = 'Task 54 no-show appointment status check'
const BRIDGE_PROCEDURE = 'Task 44 bridge procedure'
const BRIDGE_NOTE = 'Task 44 bridge clinical note'
const BRIDGE_RECOMMENDATION = 'Task 44 follow-up recommendation'
const BRIDGE_NEXT_STEP = 'schedule_control_visit'
const BRIDGE_NEXT_STEP_LABEL = 'Schedule control visit'
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
  'Cancel appointment',
  'Mark no-show',
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

  await serviceClient.from('appointments').delete().eq('patient_id', PATIENT_ID)
  await serviceClient
    .from('appointments')
    .delete()
    .eq('patient_id', DEMO_SLUG_SUPABASE_PATIENT_ID)
    .eq('reason', MANUAL_CREATION_REASON)
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

async function createServiceAppointment(reason, daysFromToday = 0) {
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
      patient_id: PATIENT_ID,
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      status: 'scheduled',
      reason,
      notes: 'Created by browser smoke status polish check.',
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
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return input.value === ${JSON.stringify(value)};
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

    await waitFor(
      () => textIncludes(cdp, 'No upcoming appointment scheduled'),
      'empty appointment state',
    )
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'follow-up recommendation',
    )

    await waitFor(
      () => textIncludes(cdp, 'Full Record'),
      'patient full record',
    )
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
    await assertSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'consultation')
    await setSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'filling')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'filling')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-duration"]', '45')
    await setSelectValue(cdp, '[data-testid="patient-appointment-duration"]', '75')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-duration"]', '75')
    await setSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'consultation')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-type"]', 'consultation')
    await assertSelectValue(cdp, '[data-testid="patient-appointment-duration"]', '30')
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
        (await textIncludes(cdp, 'Appointment was created successfully.')) ||
        (await getManualCreatedAppointmentCount()) >
          manualAppointmentCountBeforeSubmit,
      'manual demo slug appointment create success',
    )
    unsubscribeManualNetworkCheck()

    if (manualAppointmentNetworkRequests === 0) {
      throw new Error('Manual appointment creation did not make an appointments network request.')
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
    await completeVisibleVisit(cdp, DEMO_ADHOC_PROCEDURE, DEMO_ADHOC_NOTE)
    unsubscribeDemoAdHocVisitNetworkCheck()

    if (demoAdHocVisitNetworkRequests === 0) {
      throw new Error('Demo slug ad hoc visit completion did not make a visits network request.')
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

    await navigate(cdp, `${APPOINTMENTS_URL}/${manualAppointmentId}`)
    await waitFor(
      () => textIncludes(cdp, 'Appointment Detail'),
      'manual appointment detail page',
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
    await completeVisibleVisit(cdp, DEMO_LINKED_PROCEDURE, DEMO_LINKED_NOTE)
    unsubscribeDemoLinkedVisitNetworkCheck()

    if (demoLinkedVisitNetworkRequests === 0) {
      throw new Error('Demo slug linked visit completion did not make a visits network request.')
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

    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'schedule after cancelled detail')
    await waitForAppointmentCardState(
      cdp,
      CANCELLED_REASON,
      {
        actionExcludes: ['Start visit', 'Cancel appointment', 'Mark no-show'],
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
        actionExcludes: ['Start visit', 'Cancel appointment', 'Mark no-show'],
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
    await navigate(cdp, APPOINTMENTS_URL)
    await waitFor(() => textIncludes(cdp, 'Daily schedule'), 'schedule after no-show detail')
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

    await clickByText(cdp, 'Today')
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'appointments today shortcut returns to scheduled appointment',
    )

    const scheduledCardButtonTexts = await getAppointmentCardButtonTexts(
      cdp,
      EXPECTED_PREFILL,
    )

    if (
      !scheduledCardButtonTexts?.includes('Start visit') ||
      scheduledCardButtonTexts.includes('Cancel appointment') ||
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
      !scheduledCardMenuTexts.includes('Cancel appointment') ||
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
              text.includes('Provider') &&
              text.includes(${JSON.stringify(EXPECTED_PREFILL)}) &&
              text.includes('marks the linked appointment completed');
          })()`,
        ),
      'appointment context details visible in Visit Completion',
    )
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
    await clickByText(cdp, 'Save Draft')
    await waitFor(
      () => textIncludes(cdp, 'Visit draft was saved successfully.'),
      'draft save success feedback',
    )
    await waitFor(
      () => textIncludes(cdp, 'Last saved'),
      'draft save timestamp feedback',
    )

    const visitCompletionUrl = await evaluate(cdp, 'location.href')
    await navigate(cdp, APPOINTMENTS_URL)
    await waitForAppointmentCardState(
      cdp,
      EXPECTED_PREFILL,
      {
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
    await waitFor(
      () => textIncludes(cdp, 'Print review'),
      'print review action visible on detail page',
    )
    await waitFor(
      () => textIncludes(cdp, 'Schedule follow-up'),
      'completed visit detail follow-up scheduling action',
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
            return location.search.includes('section=treatment-plans') &&
              text.includes('Treatment plans') &&
              (
                text.includes('No active treatment plans') ||
                text.includes('item') ||
                text.includes('Read')
              );
          })()`,
        ),
      'patient treatment plan read-only entry point',
    )
    await waitFor(
      () => textIncludes(cdp, 'No upcoming appointment scheduled'),
      'completed appointment removed from upcoming summary',
    )

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

    await navigate(cdp, APPOINTMENTS_URL)
    await waitForAppointmentCardState(
      cdp,
      EXPECTED_PREFILL,
      {
        actionExcludes: ['Start visit'],
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
      completedCardMenuTexts.includes('Cancel appointment') ||
      completedCardMenuTexts.includes('Mark no-show') ||
      completedCardMenuTexts.includes('Complete')
    ) {
      throw new Error('Completed appointment card should not expose lifecycle status actions.')
    }

    await navigate(cdp, `${PATIENT_URL}/visit-completion`)
    await waitFor(() => textIncludes(cdp, 'Visit Completion'), 'normal visit route')
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
          manualDemoSlugAppointmentNetworkRequestVerified: true,
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
          appointmentsEmptyDateVerified: true,
          startVisitFromAppointmentVerified: true,
          appointmentContextVerified: true,
          appointmentContextDetailsVerified: true,
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
          completedVisitDetailFollowUpVerified: true,
          dailyScheduleCompletedLifecycleVerified: true,
          patientOverviewClinicalSummaryVerified: true,
          patientOverviewFollowUpVerified: true,
          patientOverviewTreatmentPlanVerified: true,
          patientTreatmentPlanEntryPointVerified: true,
          followUpSchedulingActionVerified: true,
          followUpSchedulingPrefillVerified: true,
          printActionVerified: true,
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
