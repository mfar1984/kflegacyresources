// Brute Force Attack Testing
const axios = require('axios');
const config = require('../config');

class BruteForceTest {
  constructor() {
    this.results = {
      attempts: [],
      lockedOut: false,
      lockoutAttempt: null,
      rateLimited: false,
    };
  }

  async testLoginBruteForce() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔨 BRUTE FORCE ATTACK TEST');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🔍 Attempting multiple failed logins...\n');

    for (let i = 1; i <= config.bruteForceTest.attempts; i++) {
      try {
        const startTime = Date.now();
        
        const response = await axios.post(
          `${config.target.baseUrl}${config.target.loginUrl}`,
          {
            username: config.credentials.valid.username,
            password: `wrong_password_${i}`,
          },
          { 
            timeout: config.timeout,
            validateStatus: () => true,
          }
        );

        const duration = Date.now() - startTime;

        this.results.attempts.push({
          attempt: i,
          status: response.status,
          duration,
          message: response.data.message,
          remainingAttempts: response.data.remainingAttempts,
          lockedUntil: response.data.lockedUntil,
        });

        console.log(`Attempt ${i}/${config.bruteForceTest.attempts}:`);
        console.log(`  Status: ${response.status}`);
        console.log(`  Message: ${response.data.message}`);
        
        if (response.data.remainingAttempts !== undefined) {
          console.log(`  Remaining: ${response.data.remainingAttempts} attempts`);
        }

        // Check if account is locked
        if (response.status === 429 || response.data.message?.includes('locked')) {
          this.results.lockedOut = true;
          this.results.lockoutAttempt = i;
          console.log(`\n🔒 ACCOUNT LOCKED after ${i} attempts!`);
          
          if (response.data.lockedUntil) {
            const lockDuration = Math.ceil((response.data.lockedUntil - Date.now()) / 60000);
            console.log(`   Locked for: ${lockDuration} minutes`);
          }
          break;
        }

        // Check for rate limiting
        if (response.status === 429 && response.data.message?.includes('Too many requests')) {
          this.results.rateLimited = true;
          console.log(`\n⏱️  RATE LIMITED after ${i} attempts!`);
          break;
        }

        // Delay between attempts
        await this.sleep(500);

      } catch (error) {
        console.log(`Attempt ${i}: Error - ${error.message}`);
        this.results.attempts.push({
          attempt: i,
          error: error.message,
        });
      }
    }

    return this.generateReport();
  }

  async testRapidFireAttack() {
    console.log('\n🔍 Testing Rapid-Fire Attack (No Delay)...\n');

    const promises = [];
    const rapidAttempts = 20;

    for (let i = 1; i <= rapidAttempts; i++) {
      promises.push(
        axios.post(
          `${config.target.baseUrl}${config.target.loginUrl}`,
          {
            username: 'attacker@test.com',
            password: `attempt_${i}`,
          },
          { 
            timeout: config.timeout,
            validateStatus: () => true,
          }
        ).catch(err => ({ error: err.message }))
      );
    }

    const results = await Promise.all(promises);
    
    const rateLimited = results.filter(r => r.status === 429).length;
    const successful = results.filter(r => r.status === 200).length;

    console.log(`Total Requests: ${rapidAttempts}`);
    console.log(`Rate Limited: ${rateLimited}`);
    console.log(`Successful: ${successful}`);

    if (rateLimited > 0) {
      console.log(`✅ Rate limiting is working (${rateLimited}/${rapidAttempts} blocked)`);
    } else {
      console.log(`❌ No rate limiting detected!`);
    }
  }

  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 BRUTE FORCE TEST REPORT');
    console.log('═══════════════════════════════════════════════════════');

    const totalAttempts = this.results.attempts.length;
    console.log(`Total Attempts: ${totalAttempts}`);

    if (this.results.lockedOut) {
      console.log(`✅ Account Lockout: ACTIVE (locked after ${this.results.lockoutAttempt} attempts)`);
      console.log(`   Expected: ${config.bruteForceTest.expectedLockout} attempts`);
      
      if (this.results.lockoutAttempt <= config.bruteForceTest.expectedLockout) {
        console.log(`   Status: ✓ SECURE (locked within expected range)`);
      } else {
        console.log(`   Status: ⚠️  WARNING (took more attempts than expected)`);
      }
    } else {
      console.log(`❌ Account Lockout: NOT DETECTED`);
      console.log(`   Status: ✗ VULNERABLE (no lockout after ${totalAttempts} attempts)`);
    }

    if (this.results.rateLimited) {
      console.log(`✅ Rate Limiting: ACTIVE`);
    } else {
      console.log(`⚠️  Rate Limiting: NOT DETECTED in sequential attempts`);
    }

    const secure = this.results.lockedOut && 
                   this.results.lockoutAttempt <= config.bruteForceTest.expectedLockout;

    console.log(`\n🔒 Overall Security: ${secure ? 'SECURE ✓' : 'VULNERABLE ✗'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    return {
      testName: 'Brute Force Protection',
      totalAttempts,
      lockedOut: this.results.lockedOut,
      lockoutAttempt: this.results.lockoutAttempt,
      rateLimited: this.results.rateLimited,
      secure,
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new BruteForceTest();
  tester.testLoginBruteForce()
    .then(() => tester.testRapidFireAttack())
    .then(report => {
      process.exit(report.secure ? 0 : 1);
    });
}

module.exports = BruteForceTest;
