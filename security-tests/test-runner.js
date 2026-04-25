// Security Test Runner - Runs all security tests
const SQLInjectionTest = require('./tests/sql-injection-test');
const XSSTest = require('./tests/xss-test');
const BruteForceTest = require('./tests/brute-force-test');
const SecurityHeadersTest = require('./tests/security-headers-test');
const ReverseEngineeringTest = require('./tests/reverse-engineering-test');

class SecurityTestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║                                                       ║');
    console.log('║        🛡️  KF NEXT SECURITY TEST SUITE 🛡️           ║');
    console.log('║                                                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log(`Target: ${require('./config').target.baseUrl}`);
    console.log(`Started: ${new Date().toLocaleString()}`);
    console.log('\n');

    // Run all tests
    await this.runTest('SQL Injection', SQLInjectionTest);
    await this.runTest('XSS Protection', XSSTest);
    await this.runTest('Brute Force Protection', BruteForceTest);
    await this.runTest('Security Headers', SecurityHeadersTest);
    await this.runTest('Reverse Engineering', ReverseEngineeringTest);

    // Generate final report
    this.generateFinalReport();
  }

  async runTest(name, TestClass) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${name}`);
    console.log('='.repeat(60));

    try {
      const tester = new TestClass();
      const result = await tester.runAllTests();
      this.results.push(result);
    } catch (error) {
      console.error(`\n❌ Error running ${name}: ${error.message}`);
      this.results.push({
        testName: name,
        error: error.message,
        secure: false,
      });
    }

    // Delay between tests
    await this.sleep(1000);
  }

  generateFinalReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║                                                       ║');
    console.log('║              📊 FINAL SECURITY REPORT 📊              ║');
    console.log('║                                                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('\n');

    // Summary table
    console.log('Test Results:');
    console.log('─'.repeat(60));

    let totalPassed = 0;
    let totalFailed = 0;

    this.results.forEach((result, index) => {
      const status = result.secure ? '✅ PASS' : '❌ FAIL';
      const emoji = result.secure ? '🟢' : '🔴';
      
      console.log(`${index + 1}. ${emoji} ${result.testName.padEnd(35)} ${status}`);

      if (result.passed !== undefined) {
        console.log(`   Tests: ${result.passed} passed, ${result.failed || 0} failed`);
      }

      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }

      if (result.secure) totalPassed++;
      else totalFailed++;
    });

    console.log('─'.repeat(60));

    // Overall score
    const totalTests = this.results.length;
    const percentage = Math.round((totalPassed / totalTests) * 100);
    
    console.log(`\nOverall Score: ${totalPassed}/${totalTests} (${percentage}%)`);
    console.log(`Duration: ${duration}s`);

    // Security grade
    let grade, status;
    if (percentage === 100) {
      grade = 'A+';
      status = '🏆 EXCELLENT';
    } else if (percentage >= 90) {
      grade = 'A';
      status = '✅ VERY GOOD';
    } else if (percentage >= 80) {
      grade = 'B';
      status = '👍 GOOD';
    } else if (percentage >= 70) {
      grade = 'C';
      status = '⚠️  FAIR';
    } else if (percentage >= 60) {
      grade = 'D';
      status = '⚠️  POOR';
    } else {
      grade = 'F';
      status = '❌ CRITICAL';
    }

    console.log(`\nSecurity Grade: ${grade}`);
    console.log(`Status: ${status}`);

    // Recommendations
    if (totalFailed > 0) {
      console.log('\n⚠️  CRITICAL ISSUES FOUND:');
      this.results.forEach(result => {
        if (!result.secure) {
          console.log(`   - ${result.testName}`);
          
          if (result.vulnerable && result.vulnerable.length > 0) {
            console.log(`     Vulnerabilities: ${result.vulnerable.length}`);
          }
        }
      });

      console.log('\n📋 RECOMMENDATIONS:');
      console.log('   1. Review and fix all failed tests immediately');
      console.log('   2. Implement missing security controls');
      console.log('   3. Re-run tests after fixes');
      console.log('   4. Consider professional security audit');
    } else {
      console.log('\n🎉 All security tests passed!');
      console.log('   - Continue monitoring for new vulnerabilities');
      console.log('   - Keep dependencies updated');
      console.log('   - Run tests regularly (weekly recommended)');
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`Completed: ${new Date().toLocaleString()}`);
    console.log('═'.repeat(60) + '\n');

    // Save report to file
    this.saveReport();

    // Exit with appropriate code
    process.exit(totalFailed === 0 ? 0 : 1);
  }

  saveReport() {
    const fs = require('fs');
    const report = {
      timestamp: new Date().toISOString(),
      target: require('./config').target.baseUrl,
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.secure).length,
        failed: this.results.filter(r => !r.secure).length,
      },
    };

    const filename = `security-report-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${filename}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new SecurityTestRunner();
  runner.runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = SecurityTestRunner;
