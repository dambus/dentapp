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
const CHROME_PATH =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const EMAIL = 'doctor.demo@example.test'
const EXPECTED_PREFILL = 'Task 44 appointment bridge recommendation'
const BRIDGE_PROCEDURE = 'Task 44 bridge procedure'
const BRIDGE_NOTE = 'Task 44 bridge clinical note'
const DEMO_CLINIC_ID = '11111111-1111-1111-1111-111111111111'

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitFor(predicate, label, timeoutMs = 20000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const result = await predicate()

    if (result) {
      return result
    }

    await delay(250)
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
    .from('visits')
    .update({
      status: 'archived',
      deleted_at: new Date().toISOString(),
      updated_by: profileResult.data.id,
    })
    .eq('patient_id', PATIENT_ID)
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

async function verifyCompletedAppointmentLink(appointmentId) {
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
    .eq('patient_id', PATIENT_ID)
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
    }
  })

  async function command(method, params = {}) {
    const id = nextId++

    socket.send(JSON.stringify({ id, method, params }))

    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject })
    })
  }

  return { command, close: () => socket.close() }
}

async function evaluate(cdp, expression) {
  const result = await cdp.command('Runtime.evaluate', {
    awaitPromise: true,
    expression,
    returnByValue: true,
  })

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text)
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

async function textIncludes(cdp, text) {
  return evaluate(
    cdp,
    `document.body.innerText.includes(${JSON.stringify(text)})`,
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
      () => textIncludes(cdp, 'No upcoming appointment is scheduled for this patient.'),
      'empty appointment state',
    )
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'follow-up recommendation',
    )

    await clickByText(cdp, 'Schedule appointment')
    await waitFor(
      () => textIncludes(cdp, 'Follow-up context copied into appointment reason.'),
      'follow-up prefill feedback',
    )

    const prefillValue = await evaluate(
      cdp,
      `document.querySelector('#patient-appointment-form input[placeholder="Control visit, follow-up, consultation"]')?.value`,
    )

    if (prefillValue !== EXPECTED_PREFILL) {
      throw new Error(`Unexpected prefill value: ${prefillValue}`)
    }

    const submitted = await evaluate(
      cdp,
      `(() => {
        const button = Array.from(document.querySelectorAll('#patient-appointment-form button'))
          .find((element) => element.textContent?.trim() === 'Schedule appointment');
        if (!button) return false;
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
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'created appointment reason shown',
    )

    await navigate(cdp, PATIENT_URL)
    await waitFor(
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'created appointment survives refresh',
    )

    const appointmentId = await getCreatedAppointmentId()

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
      () => textIncludes(cdp, 'New visit completion ready.'),
      'new visit completion ready',
    )

    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What was done?'), 'procedures step')
    await typeInto(
      cdp,
      'input[placeholder="Composite filling"]',
      BRIDGE_PROCEDURE,
    )
    await typeInto(cdp, 'input[placeholder="16, upper right, full mouth"]', '16')
    await clickByText(cdp, 'Next')
    await waitFor(() => textIncludes(cdp, 'What should be recorded?'), 'notes step')
    await typeInto(
      cdp,
      'textarea[placeholder="What was observed and completed today?"]',
      BRIDGE_NOTE,
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

    const linkedVisitId = await verifyCompletedAppointmentLink(appointmentId)

    await clickByText(cdp, 'View visit history')
    await waitFor(
      () => textIncludes(cdp, BRIDGE_PROCEDURE),
      'completed visit visible in timeline',
    )
    await clickByText(cdp, 'View details')
    await waitFor(
      () => textIncludes(cdp, 'Completed Visit Review'),
      'completed visit detail page',
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
      () => textIncludes(cdp, EXPECTED_PREFILL),
      'recommendation visible on detail page',
    )
    await waitFor(
      () => textIncludes(cdp, 'Linked Appointment'),
      'linked appointment visible on detail page',
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
      () => textIncludes(cdp, 'No upcoming appointment is scheduled for this patient.'),
      'completed appointment removed from upcoming summary',
    )

    await navigate(cdp, `${PATIENT_URL}/visit-completion`)
    await waitFor(() => textIncludes(cdp, 'Visit Completion'), 'normal visit route')
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
          startVisitFromAppointmentVerified: true,
          appointmentContextVerified: true,
          linkedVisitCompletionVerified: true,
          completedVisitDetailVerified: true,
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
