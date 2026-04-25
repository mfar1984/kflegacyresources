// Analyze memory monitoring log
// Usage: node analyze-memory-log.js

const fs = require('fs');

const LOG_FILE = 'memory-monitor.log';

if (!fs.existsSync(LOG_FILE)) {
  console.error(`Error: ${LOG_FILE} not found`);
  console.log('Run monitor-memory.js first to generate log data');
  process.exit(1);
}

console.log('='.repeat(60));
console.log('Memory Log Analysis');
console.log('='.repeat(60));
console.log('');

// Read and parse log file
const logData = fs.readFileSync(LOG_FILE, 'utf8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

if (logData.length === 0) {
  console.error('Error: No data in log file');
  process.exit(1);
}

// Calculate statistics
const first = logData[0];
const last = logData[logData.length - 1];
const totalTime = last.elapsed;
const totalChecks = logData.length;

const memoryValues = logData.map(d => d.memory.percentUsed);
const minMemory = Math.min(...memoryValues);
const maxMemory = Math.max(...memoryValues);
const avgMemory = memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length;

const memoryGrowth = last.memory.percentUsed - first.memory.percentUsed;
const growthPerHour = (memoryGrowth / (totalTime / 3600));

// Count status
const statusCounts = {
  healthy: logData.filter(d => d.status === 'healthy').length,
  degraded: logData.filter(d => d.status === 'degraded').length,
  unhealthy: logData.filter(d => d.status === 'unhealthy').length
};

// Display results
console.log('SUMMARY:');
console.log(`  Total checks: ${totalChecks}`);
console.log(`  Duration: ${Math.floor(totalTime / 60)} minutes (${Math.floor(totalTime / 3600)} hours)`);
console.log('');

console.log('MEMORY USAGE:');
console.log(`  Start: ${first.memory.percentUsed.toFixed(2)}%`);
console.log(`  End: ${last.memory.percentUsed.toFixed(2)}%`);
console.log(`  Min: ${minMemory.toFixed(2)}%`);
console.log(`  Max: ${maxMemory.toFixed(2)}%`);
console.log(`  Average: ${avgMemory.toFixed(2)}%`);
console.log('');

console.log('MEMORY GROWTH:');
console.log(`  Total growth: ${memoryGrowth > 0 ? '+' : ''}${memoryGrowth.toFixed(2)}%`);
console.log(`  Growth rate: ~${growthPerHour.toFixed(2)}% per hour`);
console.log('');

console.log('STATUS DISTRIBUTION:');
console.log(`  Healthy: ${statusCounts.healthy} (${(statusCounts.healthy / totalChecks * 100).toFixed(1)}%)`);
console.log(`  Degraded: ${statusCounts.degraded} (${(statusCounts.degraded / totalChecks * 100).toFixed(1)}%)`);
console.log(`  Unhealthy: ${statusCounts.unhealthy} (${(statusCounts.unhealthy / totalChecks * 100).toFixed(1)}%)`);
console.log('');

// Recommendations
console.log('RECOMMENDATION:');
if (growthPerHour > 30) {
  console.log('  ⚠️  HIGH GROWTH RATE');
  console.log('  Action: Deploy cron job with 2-3 hour restart interval');
  console.log('  Reason: Memory growing >30% per hour - will hit limit quickly');
} else if (growthPerHour > 15) {
  console.log('  ✓ MODERATE GROWTH RATE');
  console.log('  Action: Deploy cron job with 4 hour restart interval (recommended)');
  console.log('  Reason: Memory growing 15-30% per hour - 4 hours is safe');
} else if (growthPerHour > 5) {
  console.log('  ✓ LOW GROWTH RATE');
  console.log('  Action: Deploy cron job with 6-8 hour restart interval');
  console.log('  Reason: Memory growing 5-15% per hour - longer interval sufficient');
} else if (growthPerHour > 0) {
  console.log('  ✓ VERY LOW GROWTH');
  console.log('  Action: Consider 12 hour restart interval or investigate production');
  console.log('  Reason: Memory growing <5% per hour - very stable');
} else {
  console.log('  ℹ️  NO GROWTH OR NEGATIVE GROWTH');
  console.log('  Action: Investigate why production differs from local');
  console.log('  Reason: Local environment stable, but production has issues');
}
console.log('');

// Timeline
console.log('TIMELINE (First 10 checks):');
logData.slice(0, 10).forEach(entry => {
  const minutes = Math.floor(entry.elapsed / 60);
  const status = entry.status === 'healthy' ? '🟢' : entry.status === 'degraded' ? '🟡' : '🔴';
  console.log(`  ${status} ${minutes}m: ${entry.memory.percentUsed.toFixed(2)}% (${entry.status})`);
});

if (logData.length > 10) {
  console.log('  ...');
  const last5 = logData.slice(-5);
  last5.forEach(entry => {
    const minutes = Math.floor(entry.elapsed / 60);
    const status = entry.status === 'healthy' ? '🟢' : entry.status === 'degraded' ? '🟡' : '🔴';
    console.log(`  ${status} ${minutes}m: ${entry.memory.percentUsed.toFixed(2)}% (${entry.status})`);
  });
}

console.log('');
console.log('='.repeat(60));
console.log('Analysis complete');
console.log('='.repeat(60));
