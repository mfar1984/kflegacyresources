// Production Memory Monitor
// Simple monitoring tool for production server
// Usage: node production-monitor.js

const https = require('https');
const fs = require('fs');

const HEALTH_URL = 'https://www.kflegacyresources.com/api/health';
const CHECK_INTERVAL = 60000; // 60 seconds
const LOG_FILE = 'production-monitor.log';

let checkCount = 0;
let startTime = Date.now();

console.log('='.repeat(80));
console.log('Production Memory Monitor');
console.log('='.repeat(80));
console.log(`Monitoring: ${HEALTH_URL}`);
console.log(`Interval: ${CHECK_INTERVAL / 1000} seconds`);
console.log(`Log file: ${LOG_FILE}`);
console.log('Press Ctrl+C to stop\n');

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function checkHealth() {
  checkCount++;
  const now = Date.now();
  const elapsed = Math.floor((now - startTime) / 1000);
  
  https.get(HEALTH_URL, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        const timestamp = new Date().toISOString();
        
        const heapLimit = health.memory.heapLimit || 536870912;
        const trueUsage = ((health.memory.heapUsed / heapLimit) * 100).toFixed(2);
        
        // Console output
        console.log(`\n${'='.repeat(80)}`);
        console.log(`[Check #${checkCount}] ${timestamp}`);
        console.log(`${'='.repeat(80)}`);
        console.log(`Elapsed: ${elapsed}s | Uptime: ${health.uptime.toFixed(1)}s`);
        console.log(`Status: ${health.status.toUpperCase()}`);
        console.log('');
        console.log('MEMORY:');
        console.log(`  Heap Used: ${formatBytes(health.memory.heapUsed)}`);
        console.log(`  Heap Total: ${formatBytes(health.memory.heapTotal)}`);
        console.log(`  Heap Limit: ${formatBytes(heapLimit)}`);
        console.log(`  Usage: ${health.memory.percentUsed.toFixed(2)}% of current heap`);
        console.log(`  True Usage: ${trueUsage}% of heap limit`);
        console.log(`  RSS: ${formatBytes(health.memory.rss)}`);
        console.log('');
        console.log('DATABASE:');
        console.log(`  Connected: ${health.database.connected ? 'Yes' : 'No'}`);
        console.log(`  Pool Active: ${health.database.pool.active}`);
        console.log(`  Pool Idle: ${health.database.pool.idle}`);
        console.log('');
        
        // Alerts
        if (health.memory.percentUsed > 95) {
          console.log('\x1b[31m⚠️  CRITICAL: Memory usage above 95%!\x1b[0m');
        } else if (health.memory.percentUsed > 90) {
          console.log('\x1b[33m⚠️  WARNING: Memory usage above 90%\x1b[0m');
        } else {
          console.log('\x1b[32m✓ HEALTHY: Memory usage normal\x1b[0m');
        }
        
        // Log to file
        const logEntry = {
          check: checkCount,
          timestamp,
          elapsed,
          status: health.status,
          memory: {
            heapUsed: health.memory.heapUsed,
            heapTotal: health.memory.heapTotal,
            heapLimit: heapLimit,
            percentUsed: health.memory.percentUsed,
            truePercentUsed: parseFloat(trueUsage),
            rss: health.memory.rss,
          },
          database: health.database,
          uptime: health.uptime,
        };
        
        fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
        
      } catch (error) {
        console.error('Error parsing health data:', error.message);
      }
    });
    
  }).on('error', (error) => {
    console.error(`\n[Check #${checkCount}] ERROR: ${error.message}`);
    console.log('Is the server running on http://localhost:3000?');
  });
}

// Initial check
checkHealth();

// Schedule periodic checks
const interval = setInterval(checkHealth, CHECK_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n' + '='.repeat(80));
  console.log('Production Monitor Stopped');
  console.log('='.repeat(80));
  console.log(`Total checks: ${checkCount}`);
  console.log(`Total time: ${Math.floor((Date.now() - startTime) / 1000)}s`);
  console.log(`Log saved to: ${LOG_FILE}`);
  console.log('='.repeat(80));
  clearInterval(interval);
  process.exit(0);
});
