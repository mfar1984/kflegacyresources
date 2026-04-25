import type { NextApiRequest, NextApiResponse } from 'next';
import { testConnection, getPoolMetrics } from '@/lib/db';
import { getRateLimiterMetrics } from '@/lib/rate-limit';
import { getLoginTrackerMetrics } from '@/lib/login-attempts';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  
  database: {
    connected: boolean;
    pool: {
      total: number;
      active: number;
      idle: number;
      queued: number;
    };
  };
  
  memory: {
    heapUsed: number;
    heapTotal: number;
    heapLimit: number;
    rss: number;
    external: number;
    percentUsed: number;
  };
  
  rateLimiter: {
    entries: number;
    maxSize: number;
  };
  
  loginTracker: {
    entries: number;
    lockedAccounts: number;
  };
  
  process: {
    pid: number;
    uptime: number;
    nodeVersion: string;
  };
}

// Cache for health check results (5 second TTL to prevent DoS)
let cachedResponse: HealthCheckResponse | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 seconds

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const now = Date.now();
  
  // Return cached response if still valid
  if (cachedResponse && (now - cacheTimestamp) < CACHE_TTL) {
    const status = cachedResponse.status === 'unhealthy' ? 503 : 200;
    res.status(status).json(cachedResponse);
    return;
  }
  
  try {
    // Test database connectivity
    const dbConnected = await testConnection();
    
    // Get database pool metrics
    const poolMetrics = getPoolMetrics();
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    const v8 = require('v8');
    const heapStats = v8.getHeapStatistics();
    const percentUsed = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    // Get rate limiter metrics
    const rateLimiterMetrics = getRateLimiterMetrics();
    
    // Get login tracker metrics
    const loginTrackerMetrics = getLoginTrackerMetrics();
    
    // Determine health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    // Critical issues - unhealthy
    if (!dbConnected) {
      status = 'unhealthy';
    } else if (percentUsed > 95) {
      status = 'unhealthy';
    } else if (poolMetrics.queuedRequests > 40) {
      status = 'unhealthy';
    }
    // Warning issues - degraded
    else if (percentUsed > 85) {
      status = 'degraded';
    } else if (poolMetrics.queuedRequests > 20) {
      status = 'degraded';
    } else if (poolMetrics.idleConnections === 0 && poolMetrics.activeConnections === poolMetrics.totalConnections) {
      status = 'degraded';
    }
    
    // Build response
    const response: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      
      database: {
        connected: dbConnected,
        pool: {
          total: poolMetrics.totalConnections,
          active: poolMetrics.activeConnections,
          idle: poolMetrics.idleConnections,
          queued: poolMetrics.queuedRequests,
        },
      },
      
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        heapLimit: heapStats.heap_size_limit,
        rss: memUsage.rss,
        external: memUsage.external,
        percentUsed: Math.round(percentUsed * 100) / 100,
      },
      
      rateLimiter: {
        entries: rateLimiterMetrics.mapSize,
        maxSize: rateLimiterMetrics.maxSize,
      },
      
      loginTracker: {
        entries: loginTrackerMetrics.mapSize,
        lockedAccounts: loginTrackerMetrics.lockedAccounts,
      },
      
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        nodeVersion: process.version,
      },
    };
    
    // Cache the response
    cachedResponse = response;
    cacheTimestamp = now;
    
    // Return appropriate HTTP status
    const httpStatus = status === 'unhealthy' ? 503 : 200;
    res.status(httpStatus).json(response);
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    // Return unhealthy status on error
    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: false,
        pool: { total: 0, active: 0, idle: 0, queued: 0 },
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        heapLimit: 0,
        rss: 0,
        external: 0,
        percentUsed: 0,
      },
      rateLimiter: {
        entries: 0,
        maxSize: 0,
      },
      loginTracker: {
        entries: 0,
        lockedAccounts: 0,
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        nodeVersion: process.version,
      },
    };
    
    res.status(503).json(errorResponse);
  }
}


