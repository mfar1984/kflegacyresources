# 🚀 KF-Next Production Deployment Guide (cPanel)

## Quick Start

### 1. Prepare Production Package (Local)

Run PowerShell script:
```powershell
.\prepare-production.ps1
```

This will:
- ✅ Set NODE_ENV=production
- ✅ Install dependencies (if needed)
- ✅ Build production (.next folder)
- ✅ Create zip file with everything (including node_modules)

Output: `kf-next-production-YYYYMMDD-HHMMSS.zip`

---

## 2. Upload to cPanel

### A. Upload Zip File

1. Login to cPanel
2. Go to **File Manager**
3. Navigate to your application root folder (e.g., `public_html/kf-next`)
4. Click **Upload**
5. Upload the `kf-next-production-*.zip` file
6. Wait for upload to complete (may take 5-10 minutes for large file)

### B. Extract Zip File

1. In File Manager, right-click the zip file
2. Click **Extract**
3. Extract to current directory
4. Delete the zip file after extraction

---

## 3. Create .env.local File

In cPanel File Manager, create new file `.env.local` with this content:

```env
# CRITICAL - Must be production
NODE_ENV=production

# Database Configuration (Production)
DB_HOST=localhost
DB_USER=kflegacy_kflegacyresources
DB_PASSWORD=L2iPxADRAjNMdXiMhO
DB_NAME=kflegacy_kflegacyresources
DB_PORT=3306

# Site URL Configuration
SITE_URL=https://kflegacyresources.com
NEXT_PUBLIC_SITE_URL=https://kflegacyresources.com

# CHIP Payment Gateway (PRODUCTION KEY)
CHIP_API_KEY=Goi7GdVZT3zkEvST6j8nf0m5FWJNooIzXn53h7QJ28oEwfouJMizTcKJOmehIpm5EE211HQyCmdHG7VAvAMLSA==
CHIP_BRAND_ID=c5f96f76-b79c-4963-8698-086d6ce28062

# Email Configuration (IMPORTANT: Use EMAIL_ not SMTP_)
EMAIL_HOST=indigo.herosite.pro
EMAIL_PORT=587
EMAIL_USER=enquiry@kflegacyresources.com
EMAIL_PASSWORD=F@iz@n!984
EMAIL_FROM=enquiry@kflegacyresources.com

# Admin Token (Generate secure random token)
ADMIN_TOKEN=your_secure_random_token_here
```

**⚠️ IMPORTANT**: 
- Use `EMAIL_*` variables, NOT `SMTP_*`
- Use PRODUCTION CHIP API key, not test key
- Generate secure ADMIN_TOKEN

---

## 4. Setup Node.js App in cPanel

1. Go to cPanel → **Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 20.x (latest LTS)
   - **Application mode**: Production
   - **Application root**: `public_html/kf-next` (your folder path)
   - **Application URL**: `kflegacyresources.com`
   - **Application startup file**: `server.js`
   - **Passenger log file**: Enable (recommended)

4. **Environment Variables** (Optional - for memory tuning):
   - Click **Add Variable**
   - Name: `NODE_OPTIONS`
   - Value: `--max-old-space-size=512`
   - (512 = 512MB, adjust based on your cPanel plan)

5. Click **Create**

---

## 5. Start Application

In cPanel "Setup Node.js App":
1. Find your application
2. Click **Start App** (or **Restart** if already running)
3. Wait for status to show "Running"

---

## 6. Verify Deployment

### A. Test Health Check

Open in browser or use curl:
```
https://kflegacyresources.com/api/health
```

**Expected Response** (HTTP 200):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 120,
  "database": {
    "connected": true,
    "pool": {
      "total": 20,
      "active": 2,
      "idle": 18,
      "queued": 0
    }
  },
  "memory": {
    "heapUsed": 45000000,
    "heapTotal": 80000000,
    "percentUsed": 56.25
  }
}
```

### B. Test Homepage

```
https://kflegacyresources.com
```

Should load without errors.

### C. Check Logs

Via cPanel:
- Go to "Setup Node.js App"
- Click "Open logs" button

Or via Terminal:
```bash
tail -f ~/public_html/kf-next/logs/app.log
```

---

## 7. Troubleshooting

### Issue: App Won't Start

**Check:**
1. `.env.local` file exists and has correct variables
2. `NODE_ENV=production` is set
3. Database credentials are correct
4. Check error logs in cPanel

**Solution:**
```bash
# Via Terminal
cd ~/public_html/kf-next
cat .env.local  # Verify environment variables
ls -la          # Check file permissions
```

### Issue: Database Connection Failed

**Check:**
1. Database user exists in cPanel MySQL
2. Database user has permissions
3. Database name is correct

**Solution:**
```sql
-- In cPanel phpMyAdmin
GRANT ALL PRIVILEGES ON kflegacy_kflegacyresources.* 
TO 'kflegacy_kflegacyresources'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: 500 Internal Server Error

**Check:**
1. Application logs: cPanel → "Setup Node.js App" → "Open logs"
2. Error logs: `~/public_html/kf-next/logs/error.log`
3. Health check: `https://kflegacyresources.com/api/health`

**Common Causes:**
- Missing `.env.local` file
- Wrong environment variable names (EMAIL_ vs SMTP_)
- Database connection issues
- Missing node_modules (shouldn't happen with zip method)

### Issue: Email Not Sending

**Check:**
1. Environment variables use `EMAIL_*` not `SMTP_*`
2. SMTP credentials are correct
3. SMTP port is correct (587 for TLS)

**Test:**
```bash
# Via Terminal
cd ~/public_html/kf-next
node -e "console.log(process.env.EMAIL_HOST)"
# Should output: indigo.herosite.pro
```

---

## 8. Post-Deployment Monitoring

### First 24 Hours

Monitor these metrics:

1. **Memory Usage**
   ```bash
   watch -n 300 'curl -s https://kflegacyresources.com/api/health | jq .memory.percentUsed'
   ```
   Should stay below 80%

2. **Application Logs**
   ```bash
   tail -f ~/public_html/kf-next/logs/app.log
   ```
   Check for errors or warnings

3. **Database Pool**
   ```bash
   curl -s https://kflegacyresources.com/api/health | jq .database.pool
   ```
   Check `queued` stays at 0 or low

### Success Criteria

✅ Health check returns "healthy"
✅ Memory usage stable (<80%)
✅ No 500 errors
✅ Database pool not exhausted
✅ Application runs 24+ hours without restart

---

## 9. Restart Procedure

If you need to restart:

### Via cPanel (Recommended)
1. Go to "Setup Node.js App"
2. Click "Restart"
3. Wait for status to show "Running"

### Via Terminal (If needed)
```bash
# Find process
ps aux | grep node

# Graceful restart (sends SIGTERM)
kill -TERM <PID>

# cPanel will auto-restart the app
```

---

## 10. Update Procedure

When you need to update code:

1. **Build new package locally**:
   ```powershell
   .\prepare-production.ps1
   ```

2. **Backup current production**:
   - In cPanel File Manager, compress current folder
   - Download backup

3. **Upload new package**:
   - Upload new zip file
   - Extract to temporary folder
   - Stop app in cPanel
   - Replace files (keep `.env.local`)
   - Start app in cPanel

4. **Verify**:
   - Test health check
   - Check logs
   - Test critical features

---

## Files Included in Package

```
✅ .next/                    # Production build
✅ src/                      # Source code
✅ public/                   # Static assets
✅ node_modules/             # All dependencies
✅ server.js                 # Custom server with graceful shutdown
✅ package.json              # Dependencies list
✅ package-lock.json         # Lock file
✅ next.config.mjs           # Next.js config
✅ tsconfig.json             # TypeScript config
✅ .env.production.example   # Environment variables template
```

---

## Important Notes

### ⚠️ Security

- Never commit `.env.local` to Git
- Use strong ADMIN_TOKEN (generate random string)
- Keep CHIP API keys secure
- Regularly update dependencies

### ⚠️ Performance

- Monitor memory usage daily
- Check health endpoint regularly
- Review logs for slow queries
- Optimize database queries if needed

### ⚠️ Backups

- Backup database regularly
- Keep backup of `.env.local`
- Test backup restoration procedure

---

## Support

If you encounter issues:

1. Check logs: `~/public_html/kf-next/logs/app.log`
2. Check health: `https://kflegacyresources.com/api/health`
3. Review this guide's troubleshooting section
4. Check cPanel error logs

---

**Last Updated**: January 2025
**Version**: 1.0
**For**: KF Legacy Resources Production Deployment
