import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { performance } from 'perf_hooks';
import lifecycleManager from '@/lib/lifecycle-manager';

// Event loop lag measurement
let lastCheck = performance.now();
let eventLoopLag = 0;
let lagIntervalId: NodeJS.Timeout | null = null;

// MEMORY LEAK FIX: Register interval with lifecycle manager for proper cleanup
function initializeEventLoopMonitoring(): void {
  if (lifecycleManager.isInitialized('event-loop-monitor')) {
    return;
  }

  // Update lag measurement periodically
  lagIntervalId = setInterval(() => {
    const now = performance.now();
    const expected = 100; // Expected interval in ms
    const actual = now - lastCheck;
    eventLoopLag = Math.max(0, actual - expected);
    lastCheck = now;
  }, 100);

  // Register with lifecycle manager for proper cleanup
  lifecycleManager.registerInterval(lagIntervalId, 'event-loop-monitor');
  lifecycleManager.markInitialized('event-loop-monitor');
  
  console.log('[EventLoopMonitor] Initialized with lifecycle management');
}

// Initialize on module load
initializeEventLoopMonitoring();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Method check
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Authentication check
    const token = req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Verify token
    const [sessions] = await query(
      'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    ) as any[];

    if (!sessions) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }

    // Get admin user
    const [admin] = await query(
      'SELECT id, username, role FROM admin_users WHERE id = ?',
      [sessions.admin_id]
    ) as any[];

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin user not found' 
      });
    }

    // Collect monitoring metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Calculate memory percentage
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Get active handles and requests
    const activeHandles = (process as any)._getActiveHandles?.()?.length || 0;
    const activeRequests = (process as any)._getActiveRequests?.()?.length || 0;

    // Log warnings if thresholds exceeded
    if (memoryPercentage > 80) {
      console.warn(`[MONITORING WARNING] High memory usage: ${memoryPercentage.toFixed(2)}% (${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB)`);
    }

    if (eventLoopLag > 100) {
      console.warn(`[MONITORING WARNING] High event loop lag: ${eventLoopLag.toFixed(2)}ms`);
    }

    // Return monitoring data
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: heapUsedMB,
        heapTotal: heapTotalMB,
        rss: memoryUsage.rss / 1024 / 1024,
        external: memoryUsage.external / 1024 / 1024,
        arrayBuffers: memoryUsage.arrayBuffers / 1024 / 1024,
        percentUsed: memoryPercentage,
        unit: 'MB'
      },
      cpu: {
        user: cpuUsage.user / 1000, // Convert to milliseconds
        system: cpuUsage.system / 1000,
        unit: 'ms'
      },
      eventLoop: {
        lag: eventLoopLag,
        unit: 'ms'
      },
      process: {
        activeHandles,
        activeRequests,
        uptime: process.uptime(),
        pid: process.pid,
        nodeVersion: process.version
      },
      warnings: [
        ...(memoryPercentage > 80 ? [`High memory usage: ${memoryPercentage.toFixed(2)}%`] : []),
        ...(eventLoopLag > 100 ? [`High event loop lag: ${eventLoopLag.toFixed(2)}ms`] : [])
      ]
    });

  } catch (error) {
    console.error('Monitoring API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
