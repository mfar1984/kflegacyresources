# Advanced Memory Monitoring Guide

## Overview

This guide explains how to use the advanced monitoring tools to track memory usage, I/O operations, and identify memory leak patterns.

## Tools Available

### 1. Advanced Monitor (`advanced-monitor.js`)
**Most comprehensive monitoring tool**

Features:
- Fixed heap limit display (1GB constant, not dynamic)
- True memory usage percentage (against heap limit)
- Memory pattern analysis (increasing/decreasing/stable)
- I/O usage tracking (reads/writes, MB/s)
- CPU usage monitoring
- Process details (handles, requests)
- Database connection pool status
- Smart status logic (memory decreasing = healthy)

Usage:
```bash
npm run monitor
```

Or directly:
```bash
node advanced-monitor.js
```

### 2. Basic Monitor (`monitor-memory.js`)
**Simple memory tracking**

Features:
- Basic memory usage tracking
- Growth calculation from start
- Simpler output

Usage:
```bash
npm run monitor:basic
```

### 3. Stress Test (`stress-test.js`)
**Load testing tool**

Features:
- Simulates 100 concurrent requests
- Tests memory behavior under load

Usage:
```bash
npm run stress
```

## Quick Start

### Option 1: Manual (Recommended for Testing)

1. **Start production server with 1GB heap:**
```powershell
$env:NODE_ENV='production'
$env:NODE_OPTIONS='--expose-gc --max-old-space-size=1024'
node server.js
```

2. **In another terminal, start monitor:**
```bash
npm run monitor
```

3. **In another terminal, run stress test:**
```bash
npm run stress
```

### Option 2: Automated Script

Run the PowerShell script that does everything:
```powershell
.\test-production-memory.ps1
```

This will:
- Build production version (if needed)
- Start server with 1GB heap in new window
- Start advanced monitor in new window
- Show instructions for stress testing

## Understanding the Output

### Memory Section
```
MEMORY:
  Heap Used: 350.00 MB
  Heap Total: 400.00 MB (current allocation)
  Heap Limit: 1024.00 MB (FIXED)
  Usage: 87.50% of current heap
  True Usage: 34.18% of heap limit
  Change: +2.50% from last check
  RSS: 720.00 MB
```

**Key Metrics:**
- **Heap Used**: Actual memory used by JavaScript objects
- **Heap Total**: Current heap allocation (Node.js adjusts this dynamically)
- **Heap Limit**: Maximum heap size (1GB in our case) - THIS IS FIXED
- **Usage**: Percentage of current heap allocation
- **True Usage**: Percentage of heap limit (THIS IS THE REAL NUMBER)
- **Change**: Change from last check (negative = good!)
- **RSS**: Total memory including C++ objects, code, stack

### Status Logic

The monitor uses smart status logic:

- **HEALTHY**: Memory decreasing OR increasing slowly (<5% per minute)
- **WARNING**: Memory increasing moderately (5-10% per minute) OR usage >85%
- **DEGRADED**: Memory increasing fast (>10% per minute)
- **UNHEALTHY**: Memory usage >95%

### Memory Pattern

The monitor tracks the last 5-10 checks and determines:

- **decreasing (healthy)**: Memory is going down - GC is working!
- **stable**: Memory is staying roughly the same
- **increasing (warning)**: Memory is consistently going up - potential leak

### I/O Usage

```
I/O USAGE:
  Total Reads: 1234 operations
  Total Writes: 567 operations
  Data Read: 45.67 MB
  Data Written: 12.34 MB
  Read Rate: 0.15 MB/s (20 ops/s)
  Write Rate: 0.05 MB/s (8 ops/s)
```

**Note**: I/O tracking works best on Linux/Unix. On Windows, it tracks file operations but may not be as accurate.

### Summary Section

```
SUMMARY:
  Heap Limit: 1024.00 MB (FIXED - set via NODE_OPTIONS)
  True Memory Usage: 34.18% of 1024.00 MB
  Memory Pattern: stable
  Active Connections: 2 DB + 0 HTTP
  Resource Handles: 45 open
  Memory Range: 32.5% - 38.2% (avg: 35.1%)
```

This shows:
- Fixed heap limit (not dynamic!)
- True memory usage against the limit
- Current memory pattern
- Active connections and handles
- Memory range over time

## What to Look For

### Good Signs ✓
- Memory pattern: "decreasing (healthy)" or "stable"
- True usage stays below 50%
- Memory decreases after stress test
- GC working messages

### Warning Signs ⚠️
- Memory pattern: "increasing (warning)"
- True usage consistently above 70%
- Memory keeps growing after stress test ends
- No GC activity

### Critical Signs 🚨
- Memory pattern: "increasing" + usage >90%
- True usage reaches 95%+
- Memory never decreases
- Server becomes unresponsive

## Testing Procedure

1. **Start monitoring** (see Quick Start above)

2. **Baseline check** (2-3 minutes):
   - Let server run idle
   - Check memory pattern is stable
   - Note starting memory percentage

3. **Run stress test**:
   ```bash
   npm run stress
   ```
   - Memory will spike during test
   - This is normal

4. **Recovery check** (5-10 minutes):
   - After stress test completes, wait
   - Memory should decrease
   - GC should trigger
   - Pattern should show "decreasing (healthy)"

5. **Long-term stability** (30-60 minutes):
   - Let server run idle
   - Memory should stabilize
   - True usage should stay below 50%
   - Pattern should be "stable"

## Expected Behavior

### With Fixes Applied

**During stress test:**
- Memory spikes to 70-90%
- This is normal

**After stress test:**
- Memory decreases within 2-5 minutes
- GC triggers automatically
- Pattern shows "decreasing (healthy)"
- Memory stabilizes at lower level

**Long-term:**
- Memory stays stable
- True usage <50%
- No continuous growth

### Without Fixes (Memory Leak)

**During stress test:**
- Memory spikes to 90-95%

**After stress test:**
- Memory stays high
- No decrease
- Pattern shows "increasing (warning)"
- Continues growing slowly

**Long-term:**
- Memory keeps growing
- Eventually reaches 100%
- Server becomes unhealthy

## Production Deployment

Once testing confirms memory is stable:

1. **Update cPanel Node.js settings:**
   - Add to environment variables:
     ```
     NODE_OPTIONS=--expose-gc --max-old-space-size=512
     ```
   - Note: Use 512MB for cPanel (not 1GB) due to shared hosting limits

2. **Deploy fixes:**
   - All memory leak fixes are in the code
   - No additional configuration needed

3. **Monitor in production:**
   - Check `/api/health` endpoint
   - Memory should stay below 80%
   - Pattern should be stable

## Troubleshooting

### Monitor shows "insufficient data"
- Wait for 3+ checks (3 minutes)
- Pattern analysis needs history

### I/O shows "Not available"
- Normal on Windows
- Works on Linux/Unix production servers

### Memory keeps growing
- Check if fixes are applied:
  - `src/lib/email.ts` (transporter reuse)
  - `src/lib/rate-limit.ts` (reduced map size)
  - `src/lib/login-attempts.ts` (reduced map size)
  - `server.js` (GC at 70%)

### Server not responding
- Check if port 3000 is available
- Check if production build exists
- Run `npm run build:production` first

## Log Files

Both monitors create log files:

- `advanced-monitor.log` - JSON format, detailed metrics
- `memory-monitor.log` - JSON format, basic metrics

Use these for:
- Historical analysis
- Identifying patterns over time
- Debugging production issues

## Next Steps

After confirming memory is stable:

1. ✓ Memory leak fixed
2. ✓ GC working properly
3. ✓ Pattern is stable
4. → Deploy to production
5. → Monitor for 24 hours
6. → Confirm stability

---

**Last Updated**: April 25, 2026
**Related Files**: 
- `advanced-monitor.js`
- `monitor-memory.js`
- `stress-test.js`
- `test-production-memory.ps1`
- `MEMORY-LEAK-ANALYSIS.md`
