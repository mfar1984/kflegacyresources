// Stress test script to simulate traffic and trigger memory leak
// Run this while monitor-memory.js is running

const http = require('http');

const ENDPOINTS = [
  '/api/health',
  '/api/products',
  '/',
];

let requestCount = 0;
let errorCount = 0;

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        requestCount++;
        if (requestCount % 10 === 0) {
          console.log(`✓ Completed ${requestCount} requests (${errorCount} errors)`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      errorCount++;
      console.error(`✗ Request failed: ${error.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      req.destroy();
      errorCount++;
      resolve();
    });
  });
}

async function runStressTest() {
  console.log('='.repeat(60));
  console.log('Stress Test Started');
  console.log('='.repeat(60));
  console.log('This will make 100 requests to simulate traffic');
  console.log('Run monitor-memory.js in another terminal to see memory usage\n');

  const startTime = Date.now();

  // Make 100 requests (mix of endpoints)
  for (let i = 0; i < 100; i++) {
    const endpoint = ENDPOINTS[i % ENDPOINTS.length];
    await makeRequest(endpoint);
    
    // Small delay between requests (50ms)
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('Stress Test Completed');
  console.log('='.repeat(60));
  console.log(`Total requests: ${requestCount}`);
  console.log(`Failed requests: ${errorCount}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Requests/sec: ${(requestCount / duration).toFixed(2)}`);
  console.log('\nCheck monitor-memory.js output for memory usage');
  console.log('='.repeat(60));
}

runStressTest().catch(console.error);
