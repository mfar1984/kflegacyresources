// Force garbage collection test
// Run with: node --expose-gc force-gc-test.js

if (!global.gc) {
  console.error('ERROR: Garbage collection not exposed!');
  console.log('Run with: node --expose-gc force-gc-test.js');
  process.exit(1);
}

console.log('='.repeat(60));
console.log('Force Garbage Collection Test');
console.log('='.repeat(60));
console.log('');

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function showMemory(label) {
  const mem = process.memoryUsage();
  const percent = (mem.heapUsed / mem.heapTotal * 100).toFixed(2);
  console.log(`${label}:`);
  console.log(`  Heap: ${formatMB(mem.heapUsed)} / ${formatMB(mem.heapTotal)} (${percent}%)`);
  console.log(`  RSS: ${formatMB(mem.rss)}`);
  console.log('');
}

// Before GC
showMemory('BEFORE GC');

// Force GC
console.log('Running garbage collection...');
global.gc();
console.log('');

// After GC
showMemory('AFTER GC');

// Calculate savings
const before = process.memoryUsage();
global.gc();
const after = process.memoryUsage();
const saved = before.heapUsed - after.heapUsed;
const savedPercent = (saved / before.heapUsed * 100).toFixed(2);

console.log('='.repeat(60));
console.log(`Memory freed: ${formatMB(saved)} (${savedPercent}%)`);
console.log('='.repeat(60));
