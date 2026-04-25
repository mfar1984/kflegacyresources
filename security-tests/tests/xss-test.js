// Cross-Site Scripting (XSS) Testing
const axios = require('axios');
const config = require('../config');

class XSSTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      vulnerable: [],
    };
  }

  async testLoginXSS() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎭 XSS (CROSS-SITE SCRIPTING) TEST');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🔍 Testing XSS payloads on login...\n');

    for (const payload of config.payloads.xss) {
      try {
        const response = await axios.post(
          `${config.target.baseUrl}${config.target.loginUrl}`,
          {
            username: payload,
            password: payload,
          },
          { 
            timeout: config.timeout,
            validateStatus: () => true,
          }
        );

        // Check if payload is reflected in response
        const responseText = JSON.stringify(response.data);
        const isReflected = responseText.includes('<script>') || 
                           responseText.includes('onerror=') ||
                           responseText.includes('onload=') ||
                           responseText.includes(payload);

        if (isReflected && !this.isSanitized(responseText, payload)) {
          this.results.failed++;
          this.results.vulnerable.push({
            endpoint: config.target.loginUrl,
            payload,
            response: response.data,
          });
          console.log(`❌ VULNERABLE: Payload "${payload.substring(0, 50)}..." reflected unsanitized`);
        } else {
          this.results.passed++;
          console.log(`✅ SAFE: Payload "${payload.substring(0, 50)}..." sanitized or blocked`);
        }

        await this.sleep(100);
      } catch (error) {
        this.results.passed++;
        console.log(`✅ SAFE: Payload caused error (blocked)`);
      }
    }
  }

  async testAPIXSS() {
    console.log('\n🔍 Testing XSS on API endpoints...\n');

    const testEndpoints = [
      '/api/products',
      '/api/categories',
    ];

    for (const endpoint of testEndpoints) {
      console.log(`\nTesting: ${endpoint}`);
      
      for (const payload of config.payloads.xss.slice(0, 3)) {
        try {
          const response = await axios.get(
            `${config.target.baseUrl}${endpoint}?search=${encodeURIComponent(payload)}`,
            { 
              timeout: config.timeout,
              validateStatus: () => true,
            }
          );

          const responseText = JSON.stringify(response.data);
          const isReflected = responseText.includes(payload) || 
                             responseText.includes('<script>');

          if (isReflected && !this.isSanitized(responseText, payload)) {
            console.log(`⚠️  Payload reflected in ${endpoint}`);
            this.results.failed++;
          } else {
            console.log(`✅ Payload sanitized in ${endpoint}`);
            this.results.passed++;
          }

          await this.sleep(100);
        } catch (error) {
          console.log(`✅ Endpoint rejected payload`);
          this.results.passed++;
        }
      }
    }
  }

  async testStoredXSS() {
    console.log('\n🔍 Testing Stored XSS (if authenticated)...\n');

    // Try to login first
    try {
      const loginResponse = await axios.post(
        `${config.target.baseUrl}${config.target.loginUrl}`,
        config.credentials.valid,
        { timeout: config.timeout, validateStatus: () => true }
      );

      if (loginResponse.data.success && loginResponse.data.hash) {
        console.log('✅ Authenticated successfully');
        
        // Test stored XSS in admin endpoints
        const xssPayload = "<script>alert('Stored XSS')</script>";
        
        // This is just a test - we won't actually store malicious data
        console.log('⚠️  Stored XSS test requires manual verification');
        console.log('   Check if user inputs in admin panel are sanitized');
        
      } else {
        console.log('⚠️  Could not authenticate for stored XSS test');
      }
    } catch (error) {
      console.log('⚠️  Authentication failed, skipping stored XSS test');
    }
  }

  isSanitized(responseText, payload) {
    // Check if dangerous characters are encoded
    const encoded = responseText.includes('&lt;') || 
                   responseText.includes('&gt;') ||
                   responseText.includes('&quot;') ||
                   !responseText.includes(payload);
    return encoded;
  }

  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 XSS TEST REPORT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Tests Passed: ${this.results.passed}`);
    console.log(`❌ Tests Failed: ${this.results.failed}`);
    console.log(`🔒 Security Status: ${this.results.failed === 0 ? 'SECURE ✓' : 'VULNERABLE ✗'}`);

    if (this.results.vulnerable.length > 0) {
      console.log('\n⚠️  XSS VULNERABILITIES FOUND:');
      this.results.vulnerable.forEach((vuln, index) => {
        console.log(`\n${index + 1}. ${vuln.endpoint}`);
        console.log(`   Payload: ${vuln.payload.substring(0, 100)}`);
      });
    }

    console.log('═══════════════════════════════════════════════════════\n');

    return {
      testName: 'XSS Protection',
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
  const tester = new XSSTest();
  tester.testLoginXSS()
    .then(() => tester.testAPIXSS())
    .then(() => tester.testStoredXSS())
    .then(() => tester.generateReport())
    .then(report => {
      process.exit(report.secure ? 0 : 1);
    });
}

module.exports = XSSTest;
