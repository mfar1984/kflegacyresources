# 🚀 Quick Start Guide - Security Testing

## 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
cd security-tests
npm install
```

### Step 2: Configure Target (30 seconds)

Edit `config.js`:
```javascript
target: {
  baseUrl: 'http://localhost:3000',  // Your target URL
}
```

### Step 3: Run Tests (3 minutes)

```bash
npm run test:all
```

## 📊 What Gets Tested

| Test | What It Checks | Time |
|------|---------------|------|
| SQL Injection | Database attack protection | ~30s |
| XSS | Script injection protection | ~20s |
| Brute Force | Login attack protection | ~15s |
| Security Headers | HTTP security headers | ~5s |
| Reverse Engineering | Information disclosure | ~40s |

**Total Time:** ~2 minutes

## ✅ Expected Results (Secure System)

```
╔═══════════════════════════════════════════════════════╗
║              📊 FINAL SECURITY REPORT 📊              ║
╚═══════════════════════════════════════════════════════╝

Test Results:
────────────────────────────────────────────────────────
1. 🟢 SQL Injection                      ✅ PASS
2. 🟢 XSS Protection                     ✅ PASS
3. 🟢 Brute Force Protection             ✅ PASS
4. 🟢 Security Headers                   ✅ PASS
5. 🟢 Reverse Engineering                ✅ PASS
────────────────────────────────────────────────────────

Overall Score: 5/5 (100%)
Security Grade: A+
Status: 🏆 EXCELLENT
```

## ❌ If Tests Fail

### SQL Injection Failed
```bash
# Check: Are you using parameterized queries?
# Fix: Use prepared statements, never concatenate SQL
```

### XSS Failed
```bash
# Check: Are you sanitizing user input?
# Fix: Escape HTML, use Content-Security-Policy
```

### Brute Force Failed
```bash
# Check: Is rate limiting enabled?
# Fix: Implement account lockout after 5 attempts
```

### Security Headers Failed
```bash
# Check: Are security headers set?
# Fix: Add headers in middleware/proxy
```

### Reverse Engineering Failed
```bash
# Check: Are sensitive files exposed?
# Fix: Add .env to .gitignore, disable directory listing
```

## 🎯 Quick Commands

```bash
# Test everything
npm run test:all

# Test specific vulnerability
npm run test:sql-injection
npm run test:xss
npm run test:brute-force
npm run test:headers
npm run test:reverse-engineer

# Test production site
TARGET_URL=https://www.kflegacyresources.com npm run test:all

# Test with custom config
node test-runner.js
```

## 📈 Interpreting Scores

| Score | Grade | Action |
|-------|-------|--------|
| 100% | A+ | 🏆 Perfect! Maintain security |
| 90-99% | A | ✅ Excellent, minor improvements |
| 80-89% | B | 👍 Good, address warnings |
| 70-79% | C | ⚠️  Fair, fix critical issues |
| 60-69% | D | ⚠️  Poor, urgent fixes needed |
| <60% | F | ❌ Critical, fix immediately |

## 🔥 Common Issues

### Issue: Connection Refused
```bash
# Solution: Make sure server is running
npm run dev  # In main project directory
```

### Issue: All Tests Timeout
```bash
# Solution: Increase timeout in config.js
timeout: 30000,  // 30 seconds
```

### Issue: Rate Limited During Tests
```bash
# Solution: This is GOOD! It means rate limiting works
# Wait 15 minutes and try again
```

## 📝 Next Steps

After running tests:

1. **Review Report** - Check `security-report-*.json`
2. **Fix Issues** - Address any failed tests
3. **Re-test** - Run tests again after fixes
4. **Schedule Regular Tests** - Weekly recommended
5. **Monitor Logs** - Watch for attack attempts

## 🎓 Learning Resources

- Read `README.md` for detailed documentation
- Check `SECURITY-RECOMMENDATIONS.md` in main project
- Review OWASP Top 10: https://owasp.org/www-project-top-ten/

## ⚡ Pro Tips

1. **Test Locally First** - Before testing production
2. **Run After Changes** - Test after code updates
3. **Automate** - Add to CI/CD pipeline
4. **Document** - Keep security reports
5. **Stay Updated** - Update test payloads regularly

## 🆘 Need Help?

1. Check test output for specific errors
2. Review `README.md` for troubleshooting
3. Check main project `SECURITY-RECOMMENDATIONS.md`
4. Consult OWASP documentation

---

**Ready to test?** Run `npm run test:all` now! 🚀
