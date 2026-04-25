/**
 * Tests for LRU Cache with TTL support
 * 
 * Run with: npx tsx src/lib/cache.test.ts
 */

import { LRUCache, categoryCache, settingsCache } from './cache';

// Simple test framework
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    testsPassed++;
    console.log(`✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (actual === expected) {
    testsPassed++;
    console.log(`✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ ${message}`);
    console.error(`  Expected: ${expected}`);
    console.error(`  Actual: ${actual}`);
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Suite
async function runTests(): Promise<void> {
  console.log('Running LRU Cache Tests...\n');

  // Test 1: Basic set and get
  console.log('Test 1: Basic set and get');
  const cache1 = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
  cache1.set('key1', 'value1');
  assertEquals(cache1.get('key1'), 'value1', 'Should retrieve stored value');
  assertEquals(cache1.get('nonexistent'), undefined, 'Should return undefined for missing key');

  // Test 2: TTL expiration
  console.log('\nTest 2: TTL expiration');
  const cache2 = new LRUCache<string>({ maxSize: 10, defaultTTL: 100 });
  cache2.set('key1', 'value1');
  assertEquals(cache2.get('key1'), 'value1', 'Should retrieve value before expiration');
  await sleep(150);
  assertEquals(cache2.get('key1'), undefined, 'Should return undefined after TTL expiration');

  // Test 3: Custom TTL
  console.log('\nTest 3: Custom TTL');
  const cache3 = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
  cache3.set('key1', 'value1', 100); // 100ms TTL
  assertEquals(cache3.get('key1'), 'value1', 'Should retrieve value before custom TTL');
  await sleep(150);
  assertEquals(cache3.get('key1'), undefined, 'Should expire after custom TTL');

  // Test 4: LRU eviction when size limit reached
  console.log('\nTest 4: LRU eviction when size limit reached');
  const cache4 = new LRUCache<number>({ maxSize: 3, defaultTTL: 10000 });
  cache4.set('key1', 1);
  cache4.set('key2', 2);
  cache4.set('key3', 3);
  
  // Access key1 to make it recently used
  cache4.get('key1');
  
  // Add key4, should evict key2 (least recently used)
  cache4.set('key4', 4);
  
  assertEquals(cache4.get('key1'), 1, 'Recently accessed key1 should remain');
  assertEquals(cache4.get('key2'), undefined, 'Least recently used key2 should be evicted');
  assertEquals(cache4.get('key3'), 3, 'key3 should remain');
  assertEquals(cache4.get('key4'), 4, 'Newly added key4 should exist');

  // Test 5: Cache metrics
  console.log('\nTest 5: Cache metrics');
  const cache5 = new LRUCache<string>({ maxSize: 10, defaultTTL: 10000 });
  cache5.set('key1', 'value1');
  cache5.get('key1'); // hit
  cache5.get('key2'); // miss
  cache5.get('key1'); // hit
  
  const metrics = cache5.getMetrics();
  assertEquals(metrics.hits, 2, 'Should track cache hits');
  assertEquals(metrics.misses, 1, 'Should track cache misses');
  assertEquals(metrics.size, 1, 'Should report correct size');
  assert(metrics.hitRate > 0, 'Should calculate hit rate');

  // Test 6: Delete operation
  console.log('\nTest 6: Delete operation');
  const cache6 = new LRUCache<string>({ maxSize: 10, defaultTTL: 10000 });
  cache6.set('key1', 'value1');
  assertEquals(cache6.has('key1'), true, 'Key should exist before delete');
  cache6.delete('key1');
  assertEquals(cache6.has('key1'), false, 'Key should not exist after delete');

  // Test 7: Clear operation
  console.log('\nTest 7: Clear operation');
  const cache7 = new LRUCache<string>({ maxSize: 10, defaultTTL: 10000 });
  cache7.set('key1', 'value1');
  cache7.set('key2', 'value2');
  assertEquals(cache7.size(), 2, 'Should have 2 entries before clear');
  cache7.clear();
  assertEquals(cache7.size(), 0, 'Should have 0 entries after clear');

  // Test 8: Invalidate pattern
  console.log('\nTest 8: Invalidate pattern');
  const cache8 = new LRUCache<string>({ maxSize: 10, defaultTTL: 10000 });
  cache8.set('user:1', 'John');
  cache8.set('user:2', 'Jane');
  cache8.set('product:1', 'Widget');
  
  const invalidated = cache8.invalidatePattern(/^user:/);
  assertEquals(invalidated, 2, 'Should invalidate 2 user entries');
  assertEquals(cache8.has('user:1'), false, 'user:1 should be invalidated');
  assertEquals(cache8.has('user:2'), false, 'user:2 should be invalidated');
  assertEquals(cache8.has('product:1'), true, 'product:1 should remain');

  // Test 9: Cleanup expired entries
  console.log('\nTest 9: Cleanup expired entries');
  const cache9 = new LRUCache<string>({ maxSize: 10, defaultTTL: 100 });
  cache9.set('key1', 'value1');
  cache9.set('key2', 'value2');
  cache9.set('key3', 'value3', 10000); // Long TTL
  
  await sleep(150);
  const cleaned = cache9.cleanup();
  
  assert(cleaned >= 2, 'Should clean up at least 2 expired entries');
  assertEquals(cache9.has('key1'), false, 'key1 should be cleaned up');
  assertEquals(cache9.has('key2'), false, 'key2 should be cleaned up');
  assertEquals(cache9.has('key3'), true, 'key3 with long TTL should remain');

  // Test 10: Update existing key
  console.log('\nTest 10: Update existing key');
  const cache10 = new LRUCache<string>({ maxSize: 3, defaultTTL: 10000 });
  cache10.set('key1', 'value1');
  assertEquals(cache10.size(), 1, 'Should have 1 entry');
  cache10.set('key1', 'value2'); // Update
  assertEquals(cache10.size(), 1, 'Should still have 1 entry after update');
  assertEquals(cache10.get('key1'), 'value2', 'Should have updated value');

  // Test 11: Metrics reset
  console.log('\nTest 11: Metrics reset');
  const cache11 = new LRUCache<string>({ maxSize: 10, defaultTTL: 10000 });
  cache11.set('key1', 'value1');
  cache11.get('key1');
  cache11.get('key2');
  
  let metrics11 = cache11.getMetrics();
  assert(metrics11.hits > 0, 'Should have hits before reset');
  
  cache11.resetMetrics();
  metrics11 = cache11.getMetrics();
  assertEquals(metrics11.hits, 0, 'Hits should be 0 after reset');
  assertEquals(metrics11.misses, 0, 'Misses should be 0 after reset');

  // Test 12: Keys method
  console.log('\nTest 12: Keys method');
  const cache12 = new LRUCache<string>({ maxSize: 10, defaultTTL: 10000 });
  cache12.set('key1', 'value1');
  cache12.set('key2', 'value2');
  
  const keys = cache12.keys();
  assertEquals(keys.length, 2, 'Should return 2 keys');
  assert(keys.includes('key1'), 'Should include key1');
  assert(keys.includes('key2'), 'Should include key2');

  // Test 13: Singleton instances exist
  console.log('\nTest 13: Singleton instances');
  assert(categoryCache !== undefined, 'categoryCache should be defined');
  assert(settingsCache !== undefined, 'settingsCache should be defined');
  
  // Test 14: Has method with expired entry
  console.log('\nTest 14: Has method with expired entry');
  const cache14 = new LRUCache<string>({ maxSize: 10, defaultTTL: 100 });
  cache14.set('key1', 'value1');
  assertEquals(cache14.has('key1'), true, 'Should return true before expiration');
  await sleep(150);
  assertEquals(cache14.has('key1'), false, 'Should return false after expiration');

  // Test 15: Eviction metrics
  console.log('\nTest 15: Eviction metrics');
  const cache15 = new LRUCache<string>({ maxSize: 2, defaultTTL: 10000 });
  cache15.set('key1', 'value1');
  cache15.set('key2', 'value2');
  cache15.set('key3', 'value3'); // Should trigger eviction
  
  const metrics15 = cache15.getMetrics();
  assertEquals(metrics15.evictions, 1, 'Should track evictions');

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log('='.repeat(50));

  if (testsFailed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
