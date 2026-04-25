/**
 * Manual verification script for db-safe-query
 * Run with: npx tsx src/lib/db-safe-query-verify.ts
 */

import { safeQuery, safeQueryResult } from './db-safe-query';

async function runVerification() {
  console.log('=== Database Safe Query Verification ===\n');

  // Test 1: Valid parameterized query
  console.log('Test 1: Valid parameterized query');
  try {
    const result = await safeQueryResult('SELECT * FROM users WHERE id = ?', [1]);
    console.log('✓ Query executed successfully');
    console.log('Result:', result);
  } catch (error) {
    console.log('✗ Unexpected error:', (error as Error).message);
  }

  // Test 2: Query without parameters
  console.log('\nTest 2: Query without parameters');
  try {
    const result = await safeQueryResult('SELECT COUNT(*) as count FROM users');
    console.log('✓ Query executed successfully');
    console.log('Result:', result);
  } catch (error) {
    console.log('✗ Unexpected error:', (error as Error).message);
  }

  // Test 3: SQL injection detection - template literal
  console.log('\nTest 3: SQL injection detection - template literal');
  try {
    await safeQuery('SELECT * FROM users WHERE name = ${name}');
    console.log('✗ Should have thrown error');
  } catch (error) {
    console.log('✓ Correctly detected SQL injection:', (error as Error).message);
  }

  // Test 4: SQL injection detection - string concatenation
  console.log('\nTest 4: SQL injection detection - string concatenation');
  try {
    await safeQuery('SELECT * FROM users WHERE name = "test" + variable');
    console.log('✗ Should have thrown error');
  } catch (error) {
    console.log('✓ Correctly detected SQL injection:', (error as Error).message);
  }

  // Test 5: Parameter count mismatch
  console.log('\nTest 5: Parameter count mismatch');
  try {
    await safeQuery('SELECT * FROM users WHERE id = ? AND name = ?', [1]);
    console.log('✗ Should have thrown error');
  } catch (error) {
    console.log('✓ Correctly detected parameter mismatch:', (error as Error).message);
  }

  // Test 6: Multiple parameters
  console.log('\nTest 6: Multiple parameters with correct count');
  try {
    const result = await safeQueryResult(
      'SELECT * FROM users WHERE age > ? AND age < ? AND active = ?',
      [18, 65, true]
    );
    console.log('✓ Query with multiple parameters executed successfully');
    console.log('Result:', result);
  } catch (error) {
    console.log('✗ Unexpected error:', (error as Error).message);
  }

  console.log('\n=== Verification Complete ===');
}

// Only run if executed directly
if (require.main === module) {
  runVerification().catch(console.error);
}
