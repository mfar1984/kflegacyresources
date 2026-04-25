# 🛡️ KF Next Security Testing Suite

Comprehensive security testing toolkit for penetration testing and vulnerability assessment.

## 📋 Features

### Automated Security Tests:
1. **SQL Injection Testing** - Tests for SQL injection vulnerabilities
2. **XSS Testing** - Cross-site scripting attack detection
3. **Brute Force Testing** - Login protection and rate limiting
4. **Security Headers** - HTTP security header validation
5. **Reverse Engineering** - Information disclosure and file exposure

## 🚀 Quick Start

### Installation

```bash
cd security-tests
npm install
```

### Configuration

Edit `config.js` to set your target:

```javascript
target: {
  baseUrl: 'http://localhost:3000',  // Change to your target URL
}
```

### Run All Tests

```bash
npm run test:all
```

### Run Individual Tests

```bash
# SQL Injection
npm run test:sql-injection

# XSS Protection
npm run test:xss

# Brute Force Protection
npm run test:brute-force

# Rate Limiting
npm run test:rate-limit

# Security Headers
npm run test:headers

# Reverse Engineering
npm run test:reverse-engineer
```

## 📊 Test Details

### 1. SQL Injection Test
Tests for SQL injection vulnerabilities using:
- Classic SQL injection payloads
- Union-based injection
- Time-based blind injection
- Boolean-based blind injection

**Payloads tested:** 15+ common SQL injection patterns

### 2. XSS Test
Tests for cross-site scripting vulnerabilities:
- Reflected XSS
- Stored XSS (if authenticated)
- DOM-based XSS
- Various encoding bypasses

**Payloads tested:** 15+ XSS attack vectors

### 3. Brute Force Test
Tests login protection mechanisms:
- Sequential failed login attempts
- Account lockout detection
- Rate limiting validation
- Rapid-fire attack simulation

**Expected behavior:**
- Account locks after 5 failed attempts
- 15-minute lockout duration
- Rate limiting active

### 4. Security Headers Test
Validates HTTP security headers:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security
- Content-Security-Policy
- Referrer-Policy
- Permissions-Policy

**Grading:**
- A: 90-100% headers present
- B: 80-89%
- C: 70-79%
- D: 60-69%
- F: <60%

### 5. Reverse Engineering Test
Tests for information disclosure:
- Exposed sensitive files (.env, .git, etc.)
- Directory listing
- Source map exposure
- API endpoint discovery
- Stack trace leakage
- Database error exposure

## 📈 Understanding Results

### Test Output

```
✅ PASS - Test passed, no vulnerabilities found
❌ FAIL - Vulnerability detected
⚠️  WARNING - Potential issue, needs review
```

### Security Grades

- **A+** (100%): Perfect security
- **A** (90-99%): Excellent security
- **B** (80-89%): Good security
- **C** (70-79%): Fair security, needs improvement
- **D** (60-69%): Poor security, critical issues
- **F** (<60%): Critical security failures

## 🎯 Testing Scenarios

### Scenario 1: Pre-Deployment Testing

```bash
# Test local development
TARGET_URL=http://localhost:3000 npm run test:all

# Test staging
TARGET_URL=https://staging.example.com npm run test:all

# Test production (read-only tests)
TARGET_URL=https://www.example.com npm run test:all
```

### Scenario 2: Continuous Security Testing

Add to CI/CD pipeline:

```yaml
# .github/workflows/security-test.yml
name: Security Tests
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Security Tests
        run: |
          cd security-tests
          npm install
          npm run test:all
```

### Scenario 3: Regular Security Audits

```bash
# Weekly security scan
0 0 * * 0 cd /path/to/security-tests && npm run test:all
```

## 🔧 Advanced Usage

### Custom Payloads

Edit `config.js` to add custom attack payloads:

```javascript
payloads: {
  sqlInjection: [
    "' OR '1'='1",
    // Add your custom payloads
  ],
}
```

### Custom Endpoints

Test specific endpoints:

```javascript
target: {
  apiEndpoints: [
    '/api/custom-endpoint',
    '/api/another-endpoint',
  ],
}
```

### Timeout Configuration

Adjust timeouts for slow servers:

```javascript
timeout: 30000, // 30 seconds
```

## 📝 Report Generation

Tests automatically generate JSON reports:

```bash
security-report-1234567890.json
```

Report includes:
- Timestamp
- Target URL
- All test results
- Vulnerability details
- Summary statistics

## ⚠️ Important Notes

### Legal & Ethical

- **Only test systems you own or have permission to test**
- Unauthorized testing is illegal
- These tools are for security assessment only
- Not for malicious purposes

### Production Testing

- Some tests may trigger security alerts
- Brute force tests will attempt multiple logins
- Rate limiting tests generate high traffic
- Inform your team before testing production

### False Positives

- Review all findings manually
- Some "vulnerabilities" may be false positives
- Context matters - not all exposed files are sensitive

## 🛠️ Troubleshooting

### Connection Errors

```bash
# Check if target is accessible
curl http://localhost:3000

# Check firewall rules
# Check if server is running
```

### Rate Limiting Issues

```bash
# Increase delays in config.js
rateLimitTest: {
  timeWindow: 5000, // Increase from 1000ms
}
```

### Timeout Errors

```bash
# Increase timeout in config.js
timeout: 30000, // Increase from 10000ms
```

## 📚 Additional Resources

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### Tools
- [Burp Suite](https://portswigger.net/burp)
- [OWASP ZAP](https://www.zaproxy.org/)
- [Nikto](https://cirt.net/Nikto2)
- [SQLMap](http://sqlmap.org/)

## 🤝 Contributing

To add new tests:

1. Create test file in `tests/` directory
2. Extend base test class
3. Implement `runAllTests()` method
4. Add to `test-runner.js`
5. Update this README

## 📄 License

For internal security testing only.

## 🆘 Support

For issues or questions:
1. Check troubleshooting section
2. Review test output carefully
3. Consult security documentation
4. Contact security team

---

**Remember:** Security testing is an ongoing process. Run these tests regularly and after any code changes.

🔒 Stay Secure!
