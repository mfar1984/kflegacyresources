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

export default pool;


