# Local Memory Monitoring Guide

## Tujuan
Monitor memory usage secara local untuk:
1. Confirm memory leak pattern sebelum deploy ke cPanel
2. Validate cron restart frequency (4 jam cukup ke tidak?)
3. Understand memory growth rate

---

## Step 1: Start Local Development Server

Buka terminal pertama dan run:

```bash
npm run dev
```

Server akan start di `http://localhost:3000`

**PENTING**: Biarkan server running. Jangan close terminal ini.

---

## Step 2: Start Memory Monitor

Buka terminal KEDUA (baru) dan run:

```bash
node monitor-memory.js
```

Anda akan nampak output macam:

```
============================================================
Memory Monitor Started
============================================================
Monitoring: http://localhost:3000/api/health
Interval: 60 seconds
Log file: memory-monitor.log
Press Ctrl+C to stop

[Check #1] 2026-04-25T05:30:00.000Z
Elapsed: 0s | Uptime: 1.0s
Status: healthy
Memory: 238.12 MB / 353.84 MB
Usage: 67.30%
RSS: 546.93 MB
```

**Color Coding**:
- 🟢 Green (<80%): Healthy
- 🟡 Yellow (80-90%): Degraded
- 🔴 Red (>90%): Unhealthy

---

## Step 3: Simulate Normal Usage

Untuk simulate memory leak, buka browser dan:

1. Browse ke `http://localhost:3000`
2. Click around pages (products, cart, checkout)
3. Login ke admin dashboard
4. Browse admin pages (orders, products, customers)
5. Refresh pages multiple times
6. Open multiple tabs

**Biarkan running selama 1-2 jam** untuk observe memory pattern.

---

## Step 4: Monitor Output

Monitor akan check setiap 60 saat dan show:

```
[Check #5] 2026-04-25T05:34:00.000Z
Elapsed: 240s | Uptime: 241.0s
Status: healthy
Memory: 245.50 MB / 353.84 MB
Usage: 69.38%
RSS: 550.20 MB

[Check #10] 2026-04-25T05:39:00.000Z
Elapsed: 540s | Uptime: 541.0s
Status: degraded
Memory: 290.80 MB / 353.84 MB
Usage: 82.19%
RSS: 580.50 MB
⚠️  CAUTION: Memory usage above 80%

[Check #15] 2026-04-25T05:44:00.000Z
Elapsed: 840s | Uptime: 841.0s
Status: unhealthy
Memory: 330.20 MB / 353.84 MB
Usage: 93.32%
RSS: 610.30 MB
⚠️  WARNING: Memory usage above 90%!
```

---

## Step 5: Analyze Results

### Check Console Output
Monitor console untuk real-time status.

### Check Log File
Semua data disimpan dalam `memory-monitor.log`:

```bash
# View log file
cat memory-monitor.log

# View last 10 entries
tail -10 memory-monitor.log

# Count total checks
wc -l memory-monitor.log
```

### Calculate Memory Growth Rate

Example analysis:
```
Check #1 (0 min):   67.30% - Healthy
Check #10 (9 min):  82.19% - Degraded (+14.89%)
Check #20 (19 min): 93.32% - Unhealthy (+11.13%)
```

Growth rate: ~15% per 10 minutes = ~90% per hour

**Conclusion**: Memory akan penuh dalam 1-2 jam → Restart setiap 4 jam adalah selamat.

---

## Step 6: Stop Monitoring

Bila dah cukup data (1-2 jam), stop monitor:

1. Press `Ctrl+C` dalam terminal monitor
2. Anda akan nampak summary:

```
============================================================
Memory Monitor Stopped
============================================================
Total checks: 120
Total time: 7200s
Log saved to: memory-monitor.log
```

---

## Expected Results

### Scenario 1: Memory Leak Confirmed
```
0 min:  50% → Healthy
30 min: 70% → Healthy
60 min: 85% → Degraded
90 min: 95% → Unhealthy
```

**Action**: Deploy cron job dengan 4 jam interval (selamat)

### Scenario 2: Memory Stable
```
0 min:  50% → Healthy
30 min: 55% → Healthy
60 min: 58% → Healthy
90 min: 60% → Healthy
```

**Action**: Cron job mungkin tidak perlu, investigate production vs local difference

### Scenario 3: Memory Leak Aggressive
```
0 min:  50% → Healthy
15 min: 80% → Degraded
30 min: 95% → Unhealthy
```

**Action**: Deploy cron job dengan 2-3 jam interval (lebih aggressive)

---

## Comparing Local vs Production

### Local Environment:
- Node.js: v24.14.0
- Heap: 337MB
- External: 310MB (dev tools)
- Memory growth: Slower (dev mode)

### Production Environment (cPanel):
- Node.js: v20.20.0
- Heap: 77MB (VERY SMALL!)
- External: 4MB
- Memory growth: Faster (production mode)

**IMPORTANT**: Production heap hanya 77MB vs local 337MB!
- Production akan hit limit lebih cepat
- Cron job lebih critical untuk production

---

## Troubleshooting

### Issue: Monitor tidak connect

**Error**: `ERROR: connect ECONNREFUSED`

**Solution**: Ensure dev server running di terminal pertama:
```bash
npm run dev
```

### Issue: Memory tidak naik

**Possible reasons**:
1. Local environment lebih stable (dev mode)
2. Tidak cukup traffic/usage
3. Garbage collection lebih aggressive

**Action**: Simulate lebih banyak traffic (refresh pages, open tabs)

### Issue: Monitor crash

**Error**: `ENOENT: no such file or directory`

**Solution**: Ensure running dari root project directory:
```bash
cd ~/path/to/kf-next
node monitor-memory.js
```

---

## Analysis Tools

### View Memory Growth Over Time

```bash
# Extract percentUsed from log
grep -o '"percentUsed":[0-9.]*' memory-monitor.log

# Count healthy vs degraded vs unhealthy
grep '"status":"healthy"' memory-monitor.log | wc -l
grep '"status":"degraded"' memory-monitor.log | wc -l
grep '"status":"unhealthy"' memory-monitor.log | wc -l
```

### Calculate Average Memory Usage

```bash
# Extract all percentUsed values
grep -o '"percentUsed":[0-9.]*' memory-monitor.log | cut -d: -f2
```

---

## Next Steps After Monitoring

### If Memory Leak Confirmed:
1. ✅ Deploy `restart-app.sh` ke cPanel
2. ✅ Setup cron job (refer to `CRON-SETUP-GUIDE.md`)
3. ✅ Monitor production restart.log
4. ⏳ Investigate root cause (long-term fix)

### If Memory Stable:
1. ❓ Investigate why production berbeza dari local
2. ❓ Check production environment variables
3. ❓ Review production traffic patterns
4. ❓ Consider other causes (database connections, etc.)

---

## Important Notes

1. **Local vs Production**: Local environment mungkin tidak sama dengan production
2. **Heap Size**: Production heap hanya 77MB (sangat kecil!)
3. **Traffic**: Production traffic lebih tinggi dari local testing
4. **Cron Job**: Still recommended even if local stable

---

## Summary

**Goal**: Confirm memory leak pattern sebelum deploy cron job

**Method**: 
1. Run dev server
2. Run monitor script
3. Simulate usage
4. Analyze results

**Duration**: 1-2 jam minimum

**Output**: 
- Console: Real-time monitoring
- Log file: Historical data
- Analysis: Memory growth rate

**Decision**: Deploy cron job based on results

---

**Created**: April 25, 2026
**For**: KF Legacy Resources - Local Memory Testing
**Status**: Ready to Use

