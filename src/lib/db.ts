import mysql from 'mysql2/promise';

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';

// Pool configuration with production optimizations
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'kflr',
  waitForConnections: true,
  connectionLimit: isProduction ? 20 : 10,  // Higher limit for production
  queueLimit: 50,                            // Finite queue to prevent memory exhaustion
  connectTimeout: 10000,                     // 10 second connection timeout
  enableKeepAlive: true,                     // Keep connections alive
  keepAliveInitialDelay: 0,                  // Start keep-alive immediately
});

// Helper function for executing queries
export async function query(sql: string, params?: (string | string[] | number | null | boolean)[]) {
  // Use query() instead of execute() - execute() requires prepared statement support
  // which may not be properly configured in all MySQL setups
  const [rows] = params && params.length > 0 
    ? await pool.query(sql, params) 
    : await pool.query(sql);
  return rows;
}

// Pool metrics interface
export interface PoolMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  queuedRequests: number;
}

// Get current pool metrics for monitoring
export function getPoolMetrics(): PoolMetrics {
  const poolInfo = pool.pool as any; // Access internal pool state
  
  return {
    totalConnections: poolInfo._allConnections?.length || 0,
    activeConnections: poolInfo._acquiringConnections?.length || 0,
    idleConnections: poolInfo._freeConnections?.length || 0,
    queuedRequests: poolInfo._connectionQueue?.length || 0,
  };
}

// Test database connectivity for health checks
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Graceful pool shutdown
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
}

export default pool;

