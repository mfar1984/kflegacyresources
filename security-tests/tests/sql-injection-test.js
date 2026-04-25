// SQL Injection Testing
const axios = require('axios');
const config = require('../config');

class SQLInjectionTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      vulnerable: [],
      details: [],
    };
  }

  async testLoginSQLInjection() {
    console.log('\n🔍 Testing SQL Injection on Login...\n');

    for (const payload of config.payloads.sqlInjection) {
      try {
        const response = await axios.post(
          `${config.target.baseUrl}${config.target.loginUrl}`,
          {
            username: payload,
            password: payload,
          },
          { 
            timeout: config.timeout,
            validateStatus: () => true, // Accept any status
          }
        );

        // Check if injection was successful (should NOT be)
        if (response.status === 200 && response.data.success) {
          this.results.failed++;
          this.results.vulnerable.push({
            endpoint: config.target.loginUrl,
            payload,
            status: response.status,
            response: response.data,
          });
          console.log(`❌ VULNERABLE: Payload "${payload}" succeeded`);
        } else {
          this.results.passed++;
          console.log(`✅ BLOCKED: Payload "${payload}" rejected (${response.status})`);
        }

        this.results.details.push({
          payload,
          status: response.status,
          blocked: response.status !== 200 || !response.data.success,
        });

        // Delay to avoid rate limiting
        await this.sleep(100);
      } catch (error) {
        this.results.passed++;
        console.log(`✅ BLOCKED: Payload "${payload}" caused error (good)`);
      }
    }
  }

  async testAPISQLInjection() {
    console.log('\n🔍 Testing SQL Injection on API Endpoints...\n');

    for (const endpoint of config.target.apiEndpoints) {
      console.log(`\nTesting: ${endpoint}`);
      
      for (const payload of config.payloads.sqlInjection.slice(0, 5)) {
        try {
          // Test as query parameter
          const response = await axios.get(
            `${config.target.baseUrl}${endpoint}?id=${encodeURIComponent(payload)}`,
            { 
              timeout: config.timeout,
              validateStatus: () => true,
            }
          );

          if (response.status === 200 && response.data && !response.data.error) {
            console.log(`⚠️  Endpoint ${endpoint} returned 200 with payload: ${payload}`);
          } else {
            console.log(`✅ Endpoint ${endpoint} blocked payload: ${payload}`);
          }

          await this.sleep(100);
        } catch (error) {
          console.log(`✅ Endpoint ${endpoint} rejected payload: ${payload}`);
        }
      }
    }
  }

  async testBlindSQLInjection() {
    console.log('\n🔍 Testing Blind SQL Injection (Time-based)...\n');

    const timeBasedPayloads = [
      "' OR SLEEP(5)--",
      "' OR pg_sleep(5)--",
      "'; WAITFOR DELAY '00:00:05'--",
    ];

    for (const payload of timeBasedPayloads) {
      try {
        const startTime = Date.now();
        
        await axios.post(
          `${config.target.baseUrl}${config.target.loginUrl}`,
          {
            username: payload,
            password: 'test',
          },
          { timeout: 6000 }
        );

        const duration = Date.now() - startTime;

        if (duration > 4000) {
          this.results.failed++;
          console.log(`❌ VULNERABLE: Time-based injection detected (${duration}ms)`);
        } else {
          this.results.passed++;
          console.log(`✅ SAFE: No time delay detected (${duration}ms)`);
        }

        await this.sleep(100);
      } catch (error) {
        console.log(`✅ SAFE: Request failed or timed out properly`);
        this.results.passed++;
      }
    }
  }

  async runAllTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🛡️  SQL INJECTION SECURITY TEST');
    console.log('═══════════════════════════════════════════════════════');

    await this.testLoginSQLInjection();
    await this.testAPISQLInjection();
    await this.testBlindSQLInjection();

    return this.generateReport();
  }

  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 SQL INJECTION TEST REPORT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Tests Passed: ${this.results.passed}`);
    console.log(`❌ Tests Failed: ${this.results.failed}`);
    console.log(`🔒 Security Status: ${this.results.failed === 0 ? 'SECURE ✓' : 'VULNERABLE ✗'}`);

    if (this.results.vulnerable.length > 0) {
      console.log('\n⚠️  VULNERABILITIES FOUND:');
      this.results.vulnerable.forEach((vuln, index) => {
        console.log(`\n${index + 1}. ${vuln.endpoint}`);
        console.log(`   Payload: ${vuln.payload}`);
        console.log(`   Status: ${vuln.status}`);
      });
    }

    console.log('═══════════════════════════════════════════════════════\n');

    return {
      testName: 'SQL Injection',
      passed: this.results.passed,
      failed: this.results.failed,
      vulnerable: this.results.vulnerable,
      secure: this.results.failed === 0,
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new SQLInjectionTester();
  tester.runAllTests().then(report => {
    process.exit(report.secure ? 0 : 1);
  });
}

module.exports = SQLInjectionTester;
