// Security Headers Testing
const axios = require('axios');
const config = require('../config');

class SecurityHeadersTest {
  constructor() {
    this.results = {
      headers: {},
      score: 0,
      maxScore: 0,
    };
  }

  async testSecurityHeaders() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🛡️  SECURITY HEADERS TEST');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🔍 Checking security headers...\n');

    try {
      const response = await axios.get(config.target.baseUrl, {
        timeout: config.timeout,
        validateStatus: () => true,
      });

      const headers = response.headers;

      // Check each security header
      for (const headerName of config.securityHeaders) {
        this.maxScore++;
        const headerValue = headers[headerName.toLowerCase()];

        if (headerValue) {
          this.results.score++;
          this.results.headers[headerName] = {
            present: true,
            value: headerValue,
            secure: this.validateHeaderValue(headerName, headerValue),
          };
          
          const status = this.results.headers[headerName].secure ? '✅' : '⚠️ ';
          console.log(`${status} ${headerName}: ${headerValue}`);
        } else {
          this.results.headers[headerName] = {
            present: false,
            secure: false,
          };
          console.log(`❌ ${headerName}: NOT SET`);
        }
      }

      // Check for dangerous headers
      this.checkDangerousHeaders(headers);

    } catch (error) {
      console.log(`❌ Error fetching headers: ${error.message}`);
    }

    return this.generateReport();
  }

  validateHeaderValue(headerName, value) {
    const validations = {
      'X-Frame-Options': (v) => ['DENY', 'SAMEORIGIN'].includes(v.toUpperCase()),
      'X-Content-Type-Options': (v) => v.toLowerCase() === 'nosniff',
      'X-XSS-Protection': (v) => v.includes('1') && v.includes('mode=block'),
      'Strict-Transport-Security': (v) => v.includes('max-age=') && parseInt(v.match(/max-age=(\d+)/)?.[1] || 0) >= 31536000,
      'Content-Security-Policy': (v) => v.length > 0 && v.includes("default-src"),
      'Referrer-Policy': (v) => ['no-referrer', 'strict-origin-when-cross-origin', 'same-origin'].some(p => v.includes(p)),
      'Permissions-Policy': (v) => v.length > 0,
    };

    const validator = validations[headerName];
    return validator ? validator(value) : true;
  }

  checkDangerousHeaders(headers) {
    console.log('\n🔍 Checking for dangerous headers...\n');

    const dangerousHeaders = {
      'server': 'Exposes server information',
      'x-powered-by': 'Exposes technology stack',
      'x-aspnet-version': 'Exposes ASP.NET version',
      'x-aspnetmvc-version': 'Exposes ASP.NET MVC version',
    };

    let foundDangerous = false;

    for (const [header, description] of Object.entries(dangerousHeaders)) {
      if (headers[header]) {
        console.log(`⚠️  ${header}: ${headers[header]}`);
        console.log(`   Risk: ${description}`);
        foundDangerous = true;
      }
    }

    if (!foundDangerous) {
      console.log('✅ No dangerous headers found');
    }
  }

  async testHTTPSRedirect() {
    console.log('\n🔍 Testing HTTPS redirect...\n');

    if (config.target.baseUrl.startsWith('https://')) {
      console.log('✅ Target is already HTTPS');
      return true;
    }

    try {
      const httpUrl = config.target.baseUrl.replace('https://', 'http://');
      const response = await axios.get(httpUrl, {
        maxRedirects: 0,
        validateStatus: () => true,
      });

      if (response.status === 301 || response.status === 308) {
        const location = response.headers.location;
        if (location && location.startsWith('https://')) {
          console.log('✅ HTTP redirects to HTTPS');
          return true;
        }
      }

      console.log('⚠️  No HTTPS redirect detected');
      return false;
    } catch (error) {
      console.log('⚠️  Could not test HTTPS redirect');
      return false;
    }
  }

  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 SECURITY HEADERS REPORT');
    console.log('═══════════════════════════════════════════════════════');

    const percentage = Math.round((this.results.score / this.maxScore) * 100);
    console.log(`Score: ${this.results.score}/${this.maxScore} (${percentage}%)`);

    let grade;
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    else grade = 'F';

    console.log(`Grade: ${grade}`);

    const secure = this.results.score >= Math.ceil(this.maxScore * 0.8);
    console.log(`\n🔒 Security Status: ${secure ? 'GOOD ✓' : 'NEEDS IMPROVEMENT ✗'}`);

    if (!secure) {
      console.log('\n⚠️  RECOMMENDATIONS:');
      for (const [header, result] of Object.entries(this.results.headers)) {
        if (!result.present) {
          console.log(`   - Add ${header} header`);
        } else if (!result.secure) {
          console.log(`   - Improve ${header} configuration`);
        }
      }
    }

    console.log('═══════════════════════════════════════════════════════\n');

    return {
      testName: 'Security Headers',
      score: this.results.score,
      maxScore: this.maxScore,
      percentage,
      grade,
      secure,
      headers: this.results.headers,
    };
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new SecurityHeadersTest();
  tester.testSecurityHeaders()
    .then(() => tester.testHTTPSRedirect())
    .then(() => {
      process.exit(0);
    });
}

module.exports = SecurityHeadersTest;
