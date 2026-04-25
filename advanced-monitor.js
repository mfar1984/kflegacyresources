// Advanced Memory & I/O Monitor
// Monitors memory, I/O, CPU, and process details
// Usage: node advanced-monitor.js

const http = require('http');
const fs = require('fs');
const { performance } = require('perf_hooks');

const HEALTH_URL = 'http://localhost:3000/api/health';
const CHECK_INTERVAL = 60000; // 60 seconds
const LOG_FILE = 'advanced-monitor.log';

let checkCount = 0;
let startTime = Date.now();
let previousMemory = null;
let previousIO = null;
let memoryHistory = []; // Track last 5 checks for pattern analysis

console.log('='.repeat(80));
console.log('Advanced Memory & I/O Monitor');
console.log('='.repeat(80));
console.log(`Monitoring: ${HEALTH_URL}`);
console.log(`Interval: ${CHECK_INTERVAL / 1000} seconds`);
console.log(`Log file: ${LOG_FILE}`);
console.log('Press Ctrl+C to stop\n');

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function formatPercent(percent, threshold = { warn: 80, critical: 90 }) {
  if (percent >= threshold.critical) return `\x1b[31m${percent.toFixed(2)}%\x1b[0m`; // Red
  if (percent >= threshold.warn) return `\x1b[33m${percent.toFixed(2)}%\x1b[0m`; // Yellow
  return `\x1b[32m${percent.toFixed(2)}%\x1b[0m`; // Green
}

// Track file system operations manually for Windows
let fsOperations = {
  reads: 0,
  writes: 0,
  readBytes: 0,
  writeBytes: 0,
  lastReset: Date.now(),
};

function getIOStats() {
  try {
    // Get process I/O stats (Linux/Unix)
    if (process.platform !== 'win32') {
      const io = fs.readFileSync(`/proc/${process.pid}/io`, 'utf8');
      const lines = io.split('\n');
      const stats = {};
      lines.forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) stats[key] = parseInt(value);
      });
      return {
        readBytes: stats.read_bytes || 0,
        writeBytes: stats.write_bytes || 0,
        reads: stats.syscr || 0,
        writes: stats.syscw || 0,
      };
    } else {
      // Windows - return tracked operations
      return {
        readBytes: fsOperations.readBytes,
        writeBytes: fsOperations.writeBytes,
        reads: fsOperations.reads,
        writes: fsOperations.writes,
      };
    }
  } catch (error) {
    // Error - return null
  }
  return null;
}

function getCPUUsage() {
  const usage = process.cpuUsage();
  return {
    user: (usage.user / 1000000).toFixed(2), // Convert to seconds
    system: (usage.system / 1000000).toFixed(2),
    total: ((usage.user + usage.system) / 1000000).toFixed(2),
  };
}

function getProcessInfo() {
  const handles = process._getActiveHandles ? process._getActiveHandles().length : 0;
  const requests = process._getActiveRequests ? process._getActiveRequests().length : 0;
  
  return {
    handles,
    requests,
    uptime: process.uptime(),
    pid: process.pid,
  };
}

function determineStatus(current, previous) {
  // Better status logic:
  // - If memory decreasing = healthy (even if high)
  // - If memory increasing slowly (<5% per minute) = healthy
  // - If memory increasing fast (>10% per minute) = degraded
  // - If memory >95% = unhealthy
  
  const percentUsed = current.memory.percentUsed;
  
  if (percentUsed > 95) return 'unhealthy';
  
  if (previous) {
    const memoryChange = percentUsed - previous.memory.percentUsed;
    const timeElapsed = (Date.now() - previous.timestamp) / 60000; // minutes
    const changePerMinute = memoryChange / timeElapsed;
    
    if (memoryChange < 0) return 'healthy'; // Decreasing = good!
    if (changePerMinute > 10) return 'degraded'; // Fast increase
    if (changePerMinute > 5) return 'warning'; // Moderate increase
  }
  
  if (percentUsed > 85) return 'warning';
  return 'healthy';
}

function analyzeMemoryPattern() {
  if (memoryHistory.length < 3) return 'insufficient data';
  
  // Look at last 3-5 checks
  const recent = memoryHistory.slice(-5);
  let increasing = 0;
  let decreasing = 0;
  
  for (let i = 1; i < recent.length; i++) {
    if (recent[i] > recent[i - 1]) increasing++;
    else if (recent[i] < recent[i - 1]) decreasing++;
  }
  
  if (decreasing > increasing) return 'decreasing (healthy)';
  if (increasing > decreasing * 2) return 'increasing (warning)';
  return 'stable';
}

function checkHealth() {
  checkCount++;
  const now = Date.now();
  const elapsed = Math.floor((now - startTime) / 1000);
  
  http.get(HEALTH_URL, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        const timestamp = new Date().toISOString();
        
        // Get additional metrics
        const ioStats = getIOStats();
        const cpuUsage = getCPUUsage();
        const processInfo = getProcessInfo();
        
        // Calculate I/O rate
        let ioRate = null;
        if (ioStats && previousIO) {
          const readDiff = ioStats.readBytes - previousIO.readBytes;
          const writeDiff = ioStats.writeBytes - previousIO.writeBytes;
          const readOpsDiff = (ioStats.reads || 0) - (previousIO.reads || 0);
          const writeOpsDiff = (ioStats.writes || 0) - (previousIO.writes || 0);
          const timeDiff = (now - previousIO.timestamp) / 1000; // seconds
          
          ioRate = {
            readMBps: (readDiff / timeDiff / 1024 / 1024).toFixed(2),
            writeMBps: (writeDiff / timeDiff / 1024 / 1024).toFixed(2),
            readOps: Math.round(readOpsDiff / timeDiff),
            writeOps: Math.round(writeOpsDiff / timeDiff),
          };
        }
        
        // Track memory history for pattern analysis
        memoryHistory.push(health.memory.percentUsed);
        if (memoryHistory.length > 10) memoryHistory.shift(); // Keep last 10 checks
        
        // Determine status with better logic
        const status = determineStatus(health, previousMemory);
        const memoryPattern = analyzeMemoryPattern();
        
        // Calculate memory change
        const memoryChange = previousMemory 
          ? (health.memory.percentUsed - previousMemory.memory.percentUsed).toFixed(2)
          : '0.00';
        
        // Console output
        console.log(`\n${'='.repeat(80)}`);
        console.log(`[Check #${checkCount}] ${timestamp}`);
        console.log(`${'='.repeat(80)}`);
        console.log(`Elapsed: ${elapsed}s | Uptime: ${health.uptime.toFixed(1)}s`);
        console.log(`Status: ${status.toUpperCase()} | Pattern: ${memoryPattern}`);
        console.log('');
        
        // Memory section
        const heapLimit = health.memory.heapLimit || require('v8').getHeapStatistics().heap_size_limit;
        console.log('MEMORY:');
        console.log(`  Heap Used: ${formatBytes(health.memory.heapUsed)}`);
        console.log(`  Heap Total: ${formatBytes(health.memory.heapTotal)} (current allocation)`);
        console.log(`  Heap Limit: ${formatBytes(heapLimit)} (SERVER)`);
        console.log(`  Usage: ${formatPercent(health.memory.percentUsed)} of current heap`);
        console.log(`  True Usage: ${formatPercent((health.memory.heapUsed / heapLimit) * 100)} of heap limit`);
        console.log(`  Change: ${memoryChange > 0 ? '+' : ''}${memoryChange}% from last check`);
        console.log(`  RSS: ${formatBytes(health.memory.rss)}`);
        console.log('');
        
        // I/O section
        if (ioStats) {
          console.log('I/O USAGE:');
          console.log(`  Total Reads: ${ioStats.reads || 'N/A'} operations`);
          console.log(`  Total Writes: ${ioStats.writes || 'N/A'} operations`);
          console.log(`  Data Read: ${formatBytes(ioStats.readBytes)}`);
          console.log(`  Data Written: ${formatBytes(ioStats.writeBytes)}`);
          if (ioRate) {
            console.log(`  Read Rate: ${ioRate.readMBps} MB/s (${ioRate.readOps || 0} ops/s)`);
            console.log(`  Write Rate: ${ioRate.writeMBps} MB/s (${ioRate.writeOps || 0} ops/s)`);
          }
          console.log('');
        } else {
          console.log('I/O USAGE:');
          console.log('  Not available on this platform');
          console.log('');
        }
        
        // CPU section
        console.log('CPU USAGE:');
        console.log(`  User: ${cpuUsage.user}s`);
        console.log(`  System: ${cpuUsage.system}s`);
        console.log(`  Total: ${cpuUsage.total}s`);
        console.log('');
        
        // Process section
        console.log('PROCESS:');
        console.log(`  PID: ${processInfo.pid}`);
        console.log(`  Active Handles: ${processInfo.handles}`);
        console.log(`  Active Requests: ${processInfo.requests}`);
        console.log(`  Uptime: ${Math.floor(processInfo.uptime / 60)}m ${Math.floor(processInfo.uptime % 60)}s`);
        console.log('');
        
        // Database section
        console.log('DATABASE:');
        console.log(`  Connected: ${health.database.connected ? 'Yes' : 'No'}`);
        console.log(`  Pool Total: ${health.database.pool.total}`);
        console.log(`  Pool Active: ${health.database.pool.active}`);
        console.log(`  Pool Idle: ${health.database.pool.idle}`);
        console.log(`  Pool Queued: ${health.database.pool.queued}`);
        console.log('');
        
        // Summary section - What's running and patterns
        console.log('SUMMARY:');
        const summaryHeapLimit = health.memory.heapLimit || require('v8').getHeapStatistics().heap_size_limit;
        const trueUsage = ((health.memory.heapUsed / summaryHeapLimit) * 100).toFixed(2);
        console.log(`  Heap Limit: ${formatBytes(summaryHeapLimit)} (SERVER - set via NODE_OPTIONS)`);
        console.log(`  True Memory Usage: ${trueUsage}% of ${formatBytes(summaryHeapLimit)}`);
        console.log(`  Memory Pattern: ${memoryPattern}`);
        console.log(`  Active Connections: ${health.database.pool.active} DB + ${processInfo.requests} HTTP`);
        console.log(`  Resource Handles: ${processInfo.handles} open`);
        
        if (memoryHistory.length >= 3) {
          const avgMemory = memoryHistory.reduce((a, b) => a + b, 0) / memoryHistory.length;
          const minMemory = Math.min(...memoryHistory);
          const maxMemory = Math.max(...memoryHistory);
          console.log(`  Memory Range: ${minMemory.toFixed(1)}% - ${maxMemory.toFixed(1)}% (avg: ${avgMemory.toFixed(1)}%)`);
        }
        
        // Log to file
        const logEntry = {
          check: checkCount,
          timestamp,
          elapsed,
          status,
          memoryPattern,
          memory: {
            heapUsed: health.memory.heapUsed,
            heapTotal: health.memory.heapTotal,
            heapLimit: summaryHeapLimit,
            percentUsed: health.memory.percentUsed,
            truePercentUsed: (health.memory.heapUsed / summaryHeapLimit) * 100,
            rss: health.memory.rss,
            change: parseFloat(memoryChange),
          },
          io: ioStats,
          ioRate,
          cpu: cpuUsage,
          process: processInfo,
          database: health.database,
          memoryHistory: [...memoryHistory],
        };
        
        fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
        
        // Store for next comparison
        previousMemory = { memory: health.memory, timestamp: now };
        if (ioStats) {
          previousIO = { ...ioStats, timestamp: now };
        }
        
        // Alerts
        console.log('');
        if (health.memory.percentUsed > 95) {
          console.log('\x1b[31m⚠️  CRITICAL: Memory usage above 95%!\x1b[0m');
        } else if (health.memory.percentUsed > 90) {
          console.log('\x1b[31m⚠️  WARNING: Memory usage above 90%!\x1b[0m');
        } else if (health.memory.percentUsed > 80) {
          console.log('\x1b[33m⚠️  CAUTION: Memory usage above 80%\x1b[0m');
        }
        
        if (memoryChange < 0) {
          console.log('\x1b[32m✓ GOOD: Memory decreased by ' + Math.abs(memoryChange) + '% (GC working!)\x1b[0m');
        } else if (parseFloat(memoryChange) > 10) {
          console.log('\x1b[33m⚠️  Memory increased by ' + memoryChange + '% - monitoring...\x1b[0m');
        }
        
        if (memoryPattern.includes('decreasing')) {
          console.log('\x1b[32m✓ HEALTHY: Memory pattern is decreasing\x1b[0m');
        } else if (memoryPattern.includes('increasing')) {
          console.log('\x1b[33m⚠️  WARNING: Memory pattern is increasing\x1b[0m');
        } else if (memoryPattern.includes('stable')) {
          console.log('\x1b[32m✓ STABLE: Memory pattern is stable\x1b[0m');
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
  console.log('\n\n' + '='.repeat(80));
  console.log('Advanced Monitor Stopped');
  console.log('='.repeat(80));
  console.log(`Total checks: ${checkCount}`);
  console.log(`Total time: ${Math.floor((Date.now() - startTime) / 1000)}s (${Math.floor((Date.now() - startTime) / 60000)} minutes)`);
  console.log(`Log saved to: ${LOG_FILE}`);
  console.log('='.repeat(80));
  clearInterval(interval);
  process.exit(0);
});
