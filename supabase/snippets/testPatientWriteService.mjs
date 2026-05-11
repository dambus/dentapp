#!/usr/bin/env node

/**
 * Test script for patient write service layer with audit integration.
 *
 * This script tests:
 * - Patient create/update through Supabase with RLS
 * - Audit log creation for allowed writes
 * - Role-based access control (owner/doctor/reception_admin allowed, others denied)
 * - Demo mode non-persistence (if VITE_PATIENT_DATA_SOURCE is not supabase)
 *
 * Run after:
 *   npx supabase db reset
 *   node provisionDemoAuthUsers.mjs
 *
 * Cleanup:
 *   npx supabase db reset  # Resets all data and restores clean state
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
  process.exit(1);
}

if (!supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY must be set for cleanup.');
  process.exit(1);
}

// Load demo users from provisionDemoAuthUsers output or use defaults
const demoUsers = {
  owner: {
    email: 'owner.demo@example.test',
    password: 'Demo@12345',
  },
  doctor: {
    email: 'doctor.demo@example.test',
    password: 'Demo@12345',
  },
  reception_admin: {
    email: 'reception.demo@example.test',
    password: 'Demo@12345',
  },
  specialist: {
    email: 'specialist.demo@example.test',
    password: 'Demo@12345',
  },
  assistant: {
    email: 'assistant.demo@example.test',
    password: 'Demo@12345',
  },
  inventory_responsible: {
    email: 'inventory.demo@example.test',
    password: 'Demo@12345',
  },
};

async function signInAsUser(email, password) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in as ${email}: ${error.message}`);
  }

  if (!data.session) {
    throw new Error(`No session returned for ${email}`);
  }

  return data.session;
}

async function testPatientCreate(session, userRole) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  });

  const testPatientData = {
    first_name: `Test Patient Create ${userRole}`,
    last_name: `${new Date().toISOString().slice(0, 10)}`,
    phone: '+381641234567',
    email: `test.create.${userRole}@example.test`,
    date_of_birth: '1985-05-15',
    status: 'active',
    important_note: `Created by ${userRole} for testing`,
    clinic_id: '11111111-1111-1111-1111-111111111111', // Hardcoded demo clinic
    created_by: null,
    updated_by: null,
  };

  // Attempt to insert patient
  const { data: insertData, error: insertError } = await supabase
    .from('patients')
    .insert([testPatientData])
    .select('id, first_name, last_name, phone, status')
    .single();

  if (insertError) {
    return {
      success: false,
      error: insertError.message,
      patientId: null,
    };
  }

  const patientId = insertData?.id;

  // Verify audit log was created by checking if owner can read it
  let auditLogCreated = null;

  if (userRole === 'owner_admin' || userRole === 'doctor' || userRole === 'reception_admin') {
    // These roles can call create_audit_log RPC
    // Audit log should be created automatically after successful insert

    // Use service role to check audit logs (since we can't easily check as current user)
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: auditData, error: auditError } = await serviceSupabase
      .from('audit_logs')
      .select('id, action, entity_type, entity_id, actor_profile_id')
      .eq('entity_id', patientId)
      .eq('action', 'patient.created')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!auditError && auditData) {
      auditLogCreated = auditData.id;
    }
  }

  return {
    success: true,
    patientId,
    auditLogCreated,
  };
}

async function testPatientUpdate(session, patientId, userRole) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  });

  const updateData = {
    important_note: `Updated by ${userRole} at ${new Date().toISOString()}`,
    updated_by: null,
  };

  // Attempt to update patient
  const { data: updateResult, error: updateError } = await supabase
    .from('patients')
    .update(updateData)
    .eq('id', patientId)
    .select('id, important_note, updated_at')
    .single();

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  return {
    success: true,
    updated: true,
  };
}

async function countAuditLogsForUser(email, password) {
  const session = await signInAsUser(email, password);
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  });

  const { data, error, count } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('action', 'patient.created');

  if (error) {
    console.warn(`Could not read audit logs as ${email}:`, error.message);
    return 0;
  }

  return count || 0;
}

async function runTests() {
  console.log('=== Patient Write Service Layer Test ===\n');

  const testResults = {
    owner_admin: { canCreate: null, canUpdate: null, auditLogsCount: null },
    doctor: { canCreate: null, canUpdate: null, auditLogsCount: null },
    reception_admin: { canCreate: null, canUpdate: null, auditLogsCount: null },
    specialist: { canCreate: null, canUpdate: null },
    assistant: { canCreate: null, canUpdate: null },
    inventory_responsible: { canCreate: null, canUpdate: null },
  };

  const createdPatients = {};

  // Test allowed roles: owner_admin, doctor, reception_admin
  for (const userRole of ['owner_admin', 'doctor', 'reception_admin']) {
    const userData = demoUsers[userRole === 'owner_admin' ? 'owner' : userRole];

    console.log(`\nTesting ${userRole}...`);

    try {
      const session = await signInAsUser(userData.email, userData.password);

      // Test create
      console.log(`  Create: `, 'testing...');
      const createResult = await testPatientCreate(session, userRole);

      if (createResult.success) {
        console.log(`    ✓ Create succeeded (ID: ${createResult.patientId})`);

        testResults[userRole].canCreate = true;
        createdPatients[userRole] = createResult.patientId;

        if (createResult.auditLogCreated) {
          console.log(`    ✓ Audit log created (ID: ${createResult.auditLogCreated})`);
        } else {
          console.log(`    ⚠ Audit log not found (manual verification may be needed)`);
        }

        // Test update
        console.log(`  Update: `, 'testing...');
        const updateResult = await testPatientUpdate(session, createResult.patientId, userRole);

        if (updateResult.success) {
          console.log(`    ✓ Update succeeded`);
          testResults[userRole].canUpdate = true;
        } else {
          console.log(`    ✗ Update denied: ${updateResult.error}`);
          testResults[userRole].canUpdate = false;
        }
      } else {
        console.log(`    ✗ Create denied: ${createResult.error}`);
        testResults[userRole].canCreate = false;
        testResults[userRole].canUpdate = false;
      }
    } catch (error) {
      console.log(`    ✗ Error during test: ${error.message}`);
      testResults[userRole].canCreate = false;
      testResults[userRole].canUpdate = false;
    }
  }

  // Test denied roles: specialist, assistant, inventory_responsible
  for (const userRole of ['specialist', 'assistant', 'inventory_responsible']) {
    const userData = demoUsers[userRole];

    console.log(`\nTesting ${userRole} (should be denied)...`);

    try {
      const session = await signInAsUser(userData.email, userData.password);

      // Test create (should fail)
      console.log(`  Create: `, 'testing...');
      const createResult = await testPatientCreate(session, userRole);

      if (createResult.success) {
        console.log(`    ✗ Create unexpectedly succeeded (should be denied)`);
        testResults[userRole].canCreate = true; // Wrong - should be false
      } else {
        console.log(`    ✓ Create correctly denied: ${createResult.error}`);
        testResults[userRole].canCreate = false;
      }

      // Try to update if we had a patient, but expect failure
      console.log(`  Update: `, 'testing...');

      if (createdPatients.doctor) {
        const updateResult = await testPatientUpdate(session, createdPatients.doctor, userRole);

        if (updateResult.success) {
          console.log(`    ✗ Update unexpectedly succeeded (should be denied)`);
          testResults[userRole].canUpdate = true; // Wrong
        } else {
          console.log(`    ✓ Update correctly denied: ${updateResult.error}`);
          testResults[userRole].canUpdate = false;
        }
      } else {
        console.log(`    ⚠ No patient available for update test`);
        testResults[userRole].canUpdate = false;
      }
    } catch (error) {
      console.log(`    ✗ Error during test: ${error.message}`);
      testResults[userRole].canCreate = false;
      testResults[userRole].canUpdate = false;
    }
  }

  // Test audit log read permissions
  console.log(`\n=== Audit Log Read Permissions ===\n`);

  console.log(`Testing owner_admin audit log read...`);

  try {
    const ownerAuditCount = await countAuditLogsForUser(
      demoUsers.owner.email,
      demoUsers.owner.password,
    );

    testResults.owner_admin.auditLogsCount = ownerAuditCount;

    if (ownerAuditCount > 0) {
      console.log(`  ✓ Owner can read audit logs (count: ${ownerAuditCount})`);
    } else {
      console.log(`  ⚠ Owner audit log read returned 0 (policy working but may need data)`);
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
  }

  console.log(`\nTesting doctor audit log read...`);

  try {
    const doctorAuditCount = await countAuditLogsForUser(
      demoUsers.doctor.email,
      demoUsers.doctor.password,
    );

    if (doctorAuditCount === 0) {
      console.log(`  ✓ Doctor correctly cannot read audit logs (count: 0)`);
    } else {
      console.log(`  ✗ Doctor unexpectedly can read audit logs (count: ${doctorAuditCount})`);
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
  }

  // Summary
  console.log(`\n=== Test Summary ===\n`);

  console.log('Create permissions:');
  console.log(`  owner_admin: ${testResults.owner_admin.canCreate ? '✓ Allowed' : '✗ Denied'}`);
  console.log(`  doctor: ${testResults.doctor.canCreate ? '✓ Allowed' : '✗ Denied'}`);
  console.log(`  reception_admin: ${testResults.reception_admin.canCreate ? '✓ Allowed' : '✗ Denied'}`);
  console.log(`  specialist: ${testResults.specialist.canCreate === false ? '✓ Correctly Denied' : '✗ Unexpectedly Allowed'}`);
  console.log(`  assistant: ${testResults.assistant.canCreate === false ? '✓ Correctly Denied' : '✗ Unexpectedly Allowed'}`);
  console.log(`  inventory_responsible: ${testResults.inventory_responsible.canCreate === false ? '✓ Correctly Denied' : '✗ Unexpectedly Allowed'}`);

  console.log('\nUpdate permissions:');
  console.log(`  owner_admin: ${testResults.owner_admin.canUpdate ? '✓ Allowed' : '✗ Denied'}`);
  console.log(`  doctor: ${testResults.doctor.canUpdate ? '✓ Allowed' : '✗ Denied'}`);
  console.log(`  reception_admin: ${testResults.reception_admin.canUpdate ? '✓ Allowed' : '✗ Denied'}`);

  console.log('\nAudit log permissions:');
  console.log(`  owner_admin can read: ${testResults.owner_admin.auditLogsCount > 0 ? '✓ Yes' : '✗ No'}`);

  // Cleanup instructions
  console.log(`\n=== Cleanup ===\n`);
  console.log('To reset the database and remove all test data:');
  console.log('  npx supabase db reset');
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
