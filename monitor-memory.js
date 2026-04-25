// Memory monitoring script for local testing
// Run this to monitor memory usage over time
// Usage: node monitor-memory.js

const http = require('http');
const fs = require('fs');

const HEALTH_URL = 'http://localhost:3000/api/health';
const CHECK_INTERVAL = 60000; // Check every 60 seconds
const LOG_FILE = 'memory-monitor.log';

let checkCount = 0;
let startTime = Date.now();
let firstMemoryPercent = null;
let lastMemoryPercent = null;

console.log('='.repeat(60));
console.log('Memory Monitor Started');
console.log('='.repeat(60));
console.log(`Monitoring: ${HEALTH_URL}`);
console.log(`Interval: ${CHECK_INTERVAL / 1000} seconds`);
console.log(`Log file: ${LOG_FILE}`);
console.log('Press Ctrl+C to stop\n');

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function formatPercent(percent) {
  if (percent >= 90) return `\x1b[31m${percent.toFixed(2)}%\x1b[0m`; // Red
  if (percent >= 80) return `\x1b[33m${percent.toFixed(2)}%\x1b[0m`; // Yellow
  return `\x1b[32m${percent.toFixed(2)}%\x1b[0m`; // Green
}

function checkHealth() {
  checkCount++;
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  
  http.get(HEALTH_URL, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        const timestamp = new Date().toISOString();
        const percentUsed = health.memory.percentUsed;
        
        // Track first and last memory for growth calculation
        if (firstMemoryPercent === null) {
          firstMemoryPercent = percentUsed;
        }
        lastMemoryPercent = percentUsed;
        
        // Calculate memory growth
        const memoryGrowth = firstMemoryPercent !== null 
          ? (percentUsed - firstMemoryPercent).toFixed(2) 
          : '0.00';
        
        // Console output
        console.log(`\n[Check #${checkCount}] ${timestamp}`);
        console.log(`Elapsed: ${elapsed}s | Uptime: ${health.uptime.toFixed(1)}s`);
        console.log(`Status: ${health.status}`);
        console.log(`Memory: ${formatBytes(health.memory.heapUsed)} / ${formatBytes(health.memory.heapTotal)}`);
        console.log(`Usage: ${formatPercent(percentUsed)} (Growth: ${memoryGrowth > 0 ? '+' : ''}${memoryGrowth}%)`);
        console.log(`RSS: ${formatBytes(health.memory.rss)}`);
        
        // Log to file
        const logEntry = {
          check: checkCount,
          timestamp,
          elapsed,
          status: health.status,
          uptime: health.uptime,
          memory: {
            heapUsed: health.memory.heapUsed,
            heapTotal: health.memory.heapTotal,
            percentUsed: health.memory.percentUsed,
            rss: health.memory.rss,
            growthFromStart: parseFloat(memoryGrowth)
          }
        };
        
        fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
        
        // Alert if memory high
        if (percentUsed > 90) {
          console.log('\x1b[31m⚠️  WARNING: Memory usage above 90%!\x1b[0m');
        } else if (percentUsed > 80) {
          console.log('\x1b[33m⚠️  CAUTION: Memory usage above 80%\x1b[0m');
        }
        
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
  console.log('\n\n' + '='.repeat(60));
  console.log('Memory Monitor Stopped');
  console.log('='.repeat(60));
  console.log(`Total checks: ${checkCount}`);
  console.log(`Total time: ${Math.floor((Date.now() - startTime) / 1000)}s (${Math.floor((Date.now() - startTime) / 60000)} minutes)`);
  
  if (firstMemoryPercent !== null && lastMemoryPercent !== null) {
    const totalGrowth = (lastMemoryPercent - firstMemoryPercent).toFixed(2);
    const timeMinutes = Math.floor((Date.now() - startTime) / 60000);
    const growthPerHour = timeMinutes > 0 ? ((totalGrowth / timeMinutes) * 60).toFixed(2) : '0.00';
    
    console.log(`\nMemory Analysis:`);
    console.log(`  Start: ${firstMemoryPercent.toFixed(2)}%`);
    console.log(`  End: ${lastMemoryPercent.toFixed(2)}%`);
    console.log(`  Growth: ${totalGrowth > 0 ? '+' : ''}${totalGrowth}%`);
    console.log(`  Growth rate: ~${growthPerHour}% per hour`);
    
    if (parseFloat(growthPerHour) > 30) {
      console.log(`\n⚠️  HIGH GROWTH RATE: Consider 2-3 hour restart interval`);
    } else if (parseFloat(growthPerHour) > 15) {
      console.log(`\n✓ MODERATE GROWTH: 4 hour restart interval recommended`);
    } else if (parseFloat(growthPerHour) > 5) {
      console.log(`\n✓ LOW GROWTH: 6-8 hour restart interval sufficient`);
    } else {
      console.log(`\n✓ STABLE: Memory leak not detected, investigate production difference`);
    }
  }
  
  console.log(`\nLog saved to: ${LOG_FILE}`);
  console.log('='.repeat(60));
  clearInterval(interval);
  process.exit(0);
});
