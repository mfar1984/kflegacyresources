import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ansar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, params?: (string | string[] | number | null | boolean)[]) {
  const [rows] = params && params.length > 0
    ? await pool.query(sql, params)
    : await pool.query(sql);
  return rows;
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export function getPoolMetrics() {
  // Return basic metrics - mysql2/promise doesn't expose internal pool state
  return {
    totalConnections: 10, // from connectionLimit config
    activeConnections: 0,
    idleConnections: 0,
    queuedRequests: 0,
  };
}

export default pool;


