// server.js - Simple cPanel/Passenger friendly Next.js server
const http = require('http');
const next = require('next');

// FORCE set Node.js memory limit to 1GB for testing
// This MUST be set before any other code runs
const memoryLimit = process.env.MAX_MEMORY || '1024';
if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('max-old-space-size')) {
  console.log(`⚠️  WARNING: NODE_OPTIONS not set, but memory limit in code won't affect current process`);
  console.log(`   Current heap limit: ${require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024} MB`);
  console.log(`   To set 1GB heap, run: $env:NODE_OPTIONS="--max-old-space-size=1024" (PowerShell)`);
  console.log(`   Or: set NODE_OPTIONS=--max-old-space-size=1024 (CMD)`);
}

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// Track server instance
let server = null;
let isShuttingDown = false;

// Basic graceful shutdown
async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  
  isShuttingDown = true;
  console.log(`\n${signal} received - Shutting down gracefully...`);

  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  }

  // Force exit after 30s
  setTimeout(() => {
    console.warn('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Basic error handlers
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Memory monitoring and cleanup
let lastMemoryCheck = Date.now();
const MEMORY_CHECK_INTERVAL = 60000; // Check every 60 seconds

function checkMemory() {
  const now = Date.now();
  if (now - lastMemoryCheck < MEMORY_CHECK_INTERVAL) return;
  
  lastMemoryCheck = now;
  const usage = process.memoryUsage();
  const percentUsed = (usage.heapUsed / usage.heapTotal) * 100;
  
  // Log memory usage
  console.log(`Memory: ${Math.round(percentUsed)}% (${Math.round(usage.heapUsed / 1024 / 1024)}MB / ${Math.round(usage.heapTotal / 1024 / 1024)}MB)`);
  
  // MEMORY LEAK FIX: Force garbage collection more aggressively
  if (percentUsed > 70 && global.gc) {
    console.log('Memory usage >70%, forcing garbage collection...');
    try {
      global.gc();
      const afterGC = process.memoryUsage();
      const afterPercent = (afterGC.heapUsed / afterGC.heapTotal) * 100;
      console.log(`After GC: ${Math.round(afterPercent)}% (${Math.round(afterGC.heapUsed / 1024 / 1024)}MB / ${Math.round(afterGC.heapTotal / 1024 / 1024)}MB)`);
    } catch (error) {
      console.error('GC failed:', error);
    }
  }
  
  // Warn if memory is critically high
  if (percentUsed > 90) {
    console.warn('WARNING: Memory usage is critically high!');
  }
}

// Check memory periodically
setInterval(checkMemory, MEMORY_CHECK_INTERVAL);

app.prepare().then(() => {
  const port = process.env.PORT || 3000;
  const environment = process.env.NODE_ENV || 'development';
  
  console.log('========================================');
  console.log('KF-Next Server Starting');
  console.log('========================================');
  console.log(`Environment: ${environment}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Port: ${port}`);
  console.log(`PID: ${process.pid}`);
  console.log('========================================');

  server = http.createServer((req, res) => {
    if (isShuttingDown) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Server shutting down' }));
      return;
    }
    handle(req, res);
  });

  server.listen(port, () => {
    console.log(`✓ Server ready on port ${port}`);
    console.log(`✓ Health check: /api/health`);
    console.log('========================================\n');
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

