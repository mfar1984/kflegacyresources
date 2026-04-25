# Auto-Restart Cron Job Setup Guide

## Problem
Application memory leak menyebabkan web down selepas 1-2 jam. Perlu restart manual untuk recover.

## Solution
Setup cron job untuk auto-restart setiap 4 jam (sebelum memory penuh).

---

## Step 1: Upload restart-app.sh ke Server

1. Upload `restart-app.sh` ke folder aplikasi (e.g., `/home/kflegacy/public_html/v9/`)
2. Set executable permission via cPanel Terminal:

```bash
cd ~/public_html/v9
chmod +x restart-app.sh
```

---

## Step 2: Test Script Manually

Test script untuk pastikan ia berfungsi:

```bash
cd ~/public_html/v9
./restart-app.sh
```

Check log file:
```bash
cat logs/restart.log
```

Sepatutnya ada output macam:
```
[2026-04-25 08:00:00] Starting application restart...
[2026-04-25 08:00:05] Restart completed
[2026-04-25 08:00:10] Application is running
```

---

## Step 3: Setup Cron Job dalam cPanel

### Via cPanel UI:

1. Login ke cPanel
2. Pergi ke **Cron Jobs**
3. Dalam "Add New Cron Job" section:

**Common Settings**: Select "Every 4 Hours" (atau custom)

**Or Manual Settings**:
- Minute: `0`
- Hour: `*/4` (every 4 hours)
- Day: `*`
- Month: `*`
- Weekday: `*`

**Command**:
```bash
/home/kflegacy/public_html/v9/restart-app.sh
```

4. Click **Add New Cron Job**

---

## Step 4: Verify Cron Job

### Check Cron List:
```bash
crontab -l
```

Sepatutnya ada line macam:
```
0 */4 * * * /home/kflegacy/public_html/v9/restart-app.sh
```

### Monitor Restart Log:
```bash
tail -f ~/public_html/v9/logs/restart.log
```

---

## Cron Schedule Options

### Every 4 Hours (Recommended):
```
0 */4 * * * /home/kflegacy/public_html/v9/restart-app.sh
```
Restart at: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00

### Every 6 Hours:
```
0 */6 * * * /home/kflegacy/public_html/v9/restart-app.sh
```
Restart at: 00:00, 06:00, 12:00, 18:00

### Every 3 Hours (Aggressive):
```
0 */3 * * * /home/kflegacy/public_html/v9/restart-app.sh
```
Restart at: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00

### Specific Times (e.g., 2AM, 8AM, 2PM, 8PM):
```
0 2,8,14,20 * * * /home/kflegacy/public_html/v9/restart-app.sh
```

---

## Alternative: Via cPanel Terminal

Jika anda prefer command line:

```bash
# Edit crontab
crontab -e

# Add this line (every 4 hours):
0 */4 * * * /home/kflegacy/public_html/v9/restart-app.sh

# Save and exit (Ctrl+X, then Y, then Enter)
```

---

## Monitoring

### Check Restart History:
```bash
cat ~/public_html/v9/logs/restart.log
```

### Check Application Status:
```bash
ps aux | grep node
```

### Check Memory Usage:
```bash
curl https://kflegacyresources.com/api/health | grep percentUsed
```

---

## Troubleshooting

### Issue: Script tidak berfungsi

**Check permissions**:
```bash
ls -la ~/public_html/v9/restart-app.sh
```
Sepatutnya: `-rwxr-xr-x` (executable)

**Fix**:
```bash
chmod +x ~/public_html/v9/restart-app.sh
```

### Issue: Cron tidak run

**Check cron service**:
```bash
crontab -l
```

**Check cron logs** (if available):
```bash
grep CRON /var/log/syslog
```

### Issue: Application tidak restart

**Check if Passenger is managing the app**:
```bash
passenger-status
```

**Manual restart via cPanel**:
1. Go to "Setup Node.js App"
2. Click "Restart"

---

## Expected Behavior

### Before Cron Job:
- Memory: 50% → 96% dalam 1-2 jam
- Status: Healthy → Degraded → Unhealthy → DOWN
- Action: Manual restart required

### After Cron Job:
- Memory: Auto-reset setiap 4 jam
- Status: Healthy → Degraded → **AUTO RESTART** → Healthy
- Action: No manual intervention needed

---

## Important Notes

1. **Downtime**: Restart takes 2-5 seconds. Users may see brief loading.
2. **Active Sessions**: Users akan logout bila restart (session lost).
3. **Best Time**: Schedule restart during low-traffic hours (e.g., 2AM, 4AM).
4. **Monitoring**: Check restart.log regularly untuk ensure cron berfungsi.

---

## Next Steps

1. ✅ Upload restart-app.sh
2. ✅ Set executable permission
3. ✅ Test manually
4. ✅ Setup cron job
5. ✅ Monitor for 24 hours
6. ⏳ Investigate memory leak (long-term fix)

---

## Long-Term Solution

Cron job adalah **temporary workaround**. Untuk permanent fix:

1. Investigate memory leak sources
2. Fix code yang cause memory leak
3. Implement proper memory management
4. Consider Cloudflare untuk reduce server load

---

**Created**: April 25, 2026
**For**: KF Legacy Resources - Auto-Restart Solution
**Status**: Production Ready
