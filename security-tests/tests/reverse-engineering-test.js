// Reverse Engineering & Information Disclosure Testing
const axios = require('axios');
const config = require('../config');

class ReverseEngineeringTest {
  constructor() {
    this.results = {
      exposedFiles: [],
      exposedEndpoints: [],
      informationLeaks: [],
      score: 0,
    };
  }

  async testCommonFiles() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 REVERSE ENGINEERING & INFO DISCLOSURE TEST');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🔍 Testing for exposed sensitive files...\n');

    const sensitiveFiles = [
      '/.env',
      '/.env.local',
      '/.env.production',
      '/.git/config',
      '/.git/HEAD',
      '/package.json',
      '/package-lock.json',
      '/.gitignore',
      '/composer.json',
      '/phpinfo.php',
      '/info.php',
      '/test.php',
      '/backup.sql',
      '/database.sql',
      '/dump.sql',
      '/.DS_Store',
      '/web.config',
      '/.htaccess',
      '/robots.txt',
      '/sitemap.xml',
      '/README.md',
      '/CHANGELOG.md',
      '/.npmrc',
      '/yarn.lock',
      '/.dockerignore',
      '/Dockerfile',
      '/.vscode/settings.json',
      '/.idea/workspace.xml',
    ];

    for (const file of sensitiveFiles) {
      try {
        const response = await axios.get(
          `${config.target.baseUrl}${file}`,
          { 
            timeout: 5000,
            validateStatus: () => true,
          }
        );

        if (response.status === 200) {
          const isSensitive = this.checkIfSensitive(file, response.data);
          
          if (isSensitive) {
            this.results.exposedFiles.push({
              file,
              status: response.status,
              size: response.data.length,
              contentType: response.headers['content-type'],
            });
            console.log(`❌ EXPOSED: ${file} (${response.status})`);
          } else {
            console.log(`⚠️  Accessible: ${file} (${response.status}) - Not sensitive`);
          }
        } else {
          console.log(`✅ Protected: ${file} (${response.status})`);
        }

        await this.sleep(50);
      } catch (error) {
        console.log(`✅ Protected: ${file} (blocked)`);
      }
    }
  }

  async testAPIEndpointDiscovery() {
    console.log('\n🔍 Testing API endpoint discovery...\n');

    const commonEndpoints = [
      '/api',
      '/api/v1',
      '/api/v2',
      '/api/admin',
      '/api/users',
      '/api/config',
      '/api/debug',
      '/api/test',
      '/api/health',
      '/api/status',
      '/api/version',
      '/api/docs',
      '/api/swagger',
      '/api/graphql',
      '/admin',
      '/admin/login',
      '/admin/dashboard',
      '/phpmyadmin',
      '/adminer',
      '/wp-admin',
      '/administrator',
    ];

    for (const endpoint of commonEndpoints) {
      try {
        const response = await axios.get(
          `${config.target.baseUrl}${endpoint}`,
          { 
            timeout: 5000,
            validateStatus: () => true,
          }
        );

        if (response.status === 200) {
          this.results.exposedEndpoints.push({
            endpoint,
            status: response.status,
            requiresAuth: this.checkIfRequiresAuth(response),
          });
          
          const authStatus = this.checkIfRequiresAuth(response) ? '🔒' : '⚠️ ';
          console.log(`${authStatus} Found: ${endpoint} (${response.status})`);
        }

        await this.sleep(50);
      } catch (error) {
        // Endpoint not found or blocked
      }
    }
  }

  async testInformationLeakage() {
    console.log('\n🔍 Testing for information leakage...\n');

    try {
      // Test error messages
      const response = await axios.post(
        `${config.target.baseUrl}${config.target.loginUrl}`,
        { invalid: 'data' },
        { 
          timeout: config.timeout,
          validateStatus: () => true,
        }
      );

      const responseText = JSON.stringify(response.data);

      // Check for stack traces
      if (responseText.includes('at ') && responseText.includes('.js:')) {
        this.results.informationLeaks.push({
          type: 'Stack Trace',
          description: 'Error response contains stack trace',
        });
        console.log('❌ Stack trace exposed in error response');
      }

      // Check for database errors
      if (responseText.match(/mysql|postgresql|mongodb|sql/i)) {
        this.results.informationLeaks.push({
          type: 'Database Error',
          description: 'Database information in error response',
        });
        console.log('❌ Database information exposed');
      }

      // Check for file paths
      if (responseText.match(/[A-Z]:\\|\/home\/|\/var\/|\/usr\//)) {
        this.results.informationLeaks.push({
          type: 'File Path',
          description: 'Server file paths exposed',
        });
        console.log('❌ Server file paths exposed');
      }

      if (this.results.informationLeaks.length === 0) {
        console.log('✅ No obvious information leakage detected');
      }

    } catch (error) {
      console.log('✅ Error handling appears secure');
    }
  }

  async testDirectoryListing() {
    console.log('\n🔍 Testing for directory listing...\n');

    const directories = [
      '/uploads/',
      '/images/',
      '/assets/',
      '/public/',
      '/static/',
      '/files/',
      '/documents/',
      '/backup/',
      '/temp/',
    ];

    for (const dir of directories) {
      try {
        const response = await axios.get(
          `${config.target.baseUrl}${dir}`,
          { 
            timeout: 5000,
            validateStatus: () => true,
          }
        );

        if (response.status === 200 && response.data.includes('Index of')) {
          console.log(`❌ Directory listing enabled: ${dir}`);
          this.results.exposedFiles.push({
            file: dir,
            type: 'Directory Listing',
          });
        } else {
          console.log(`✅ Directory listing disabled: ${dir}`);
        }

        await this.sleep(50);
      } catch (error) {
        console.log(`✅ Directory protected: ${dir}`);
      }
    }
  }

  async testSourceMapExposure() {
    console.log('\n🔍 Testing for source map exposure...\n');

    try {
      const response = await axios.get(config.target.baseUrl, {
        timeout: 5000,
      });

      const html = response.data;
      const scriptTags = html.match(/<script[^>]*src="([^"]+)"/g) || [];

      for (const tag of scriptTags.slice(0, 5)) {
        const match = tag.match(/src="([^"]+)"/);
        if (match) {
          const scriptUrl = match[1];
          const mapUrl = scriptUrl + '.map';

          try {
            const mapResponse = await axios.get(
              `${config.target.baseUrl}${mapUrl}`,
              { 
                timeout: 3000,
                validateStatus: () => true,
              }
            );

            if (mapResponse.status === 200) {
              console.log(`⚠️  Source map exposed: ${mapUrl}`);
              this.results.exposedFiles.push({
                file: mapUrl,
                type: 'Source Map',
              });
            }
          } catch (error) {
            // Source map not found (good)
          }

          await this.sleep(50);
        }
      }

      if (this.results.exposedFiles.filter(f => f.type === 'Source Map').length === 0) {
        console.log('✅ No source maps exposed');
      }

    } catch (error) {
      console.log('⚠️  Could not test source map exposure');
    }
  }

  checkIfSensitive(file, content) {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /api[_-]?key/i,
      /token/i,
      /private[_-]?key/i,
      /database/i,
      /connection[_-]?string/i,
    ];

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    return sensitivePatterns.some(pattern => pattern.test(contentStr));
  }

  checkIfRequiresAuth(response) {
    const indicators = [
      response.status === 401,
      response.status === 403,
      response.data?.message?.includes('auth'),
      response.data?.message?.includes('login'),
      response.headers['www-authenticate'],
    ];

    return indicators.some(i => i);
  }

  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 REVERSE ENGINEERING TEST REPORT');
    console.log('═══════════════════════════════════════════════════════');

    console.log(`\n📁 Exposed Files: ${this.results.exposedFiles.length}`);
    if (this.results.exposedFiles.length > 0) {
      this.results.exposedFiles.forEach(file => {
        console.log(`   - ${file.file} ${file.type ? `(${file.type})` : ''}`);
      });
    }

    console.log(`\n🔌 Exposed Endpoints: ${this.results.exposedEndpoints.length}`);
    if (this.results.exposedEndpoints.length > 0) {
      this.results.exposedEndpoints.forEach(ep => {
        const auth = ep.requiresAuth ? '🔒' : '⚠️ ';
        console.log(`   ${auth} ${ep.endpoint}`);
      });
    }

    console.log(`\n💧 Information Leaks: ${this.results.informationLeaks.length}`);
    if (this.results.informationLeaks.length > 0) {
      this.results.informationLeaks.forEach(leak => {
        console.log(`   - ${leak.type}: ${leak.description}`);
      });
    }

    const totalIssues = this.results.exposedFiles.length + 
                       this.results.informationLeaks.length;

    const secure = totalIssues === 0;

    console.log(`\n🔒 Security Status: ${secure ? 'SECURE ✓' : 'ISSUES FOUND ✗'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    return {
      testName: 'Reverse Engineering & Info Disclosure',
      exposedFiles: this.results.exposedFiles.length,
      exposedEndpoints: this.results.exposedEndpoints.length,
      informationLeaks: this.results.informationLeaks.length,
      totalIssues,
      secure,
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new ReverseEngineeringTest();
  Promise.resolve()
    .then(() => tester.testCommonFiles())
    .then(() => tester.testAPIEndpointDiscovery())
    .then(() => tester.testInformationLeakage())
    .then(() => tester.testDirectoryListing())
    .then(() => tester.testSourceMapExposure())
    .then(() => tester.generateReport())
    .then(report => {
      process.exit(report.secure ? 0 : 1);
    });
}

module.exports = ReverseEngineeringTest;
