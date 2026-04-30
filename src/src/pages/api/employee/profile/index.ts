import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ?', [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  if (new Date(sessions[0].expires_at) < new Date()) return null;
  if (sessions[0].user_type !== 'employee') return null;
  return sessions[0];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { hash, employee_id } = req.query;
  const session = await verifySession(hash as string);
  if (!session || session.employee_id !== parseInt(employee_id as string)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const [employees] = await pool.query<RowDataPacket[]>(
      `SELECT e.*, d.department_name 
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ?`,
      [employee_id]
    );
    if (employees.length === 0) return res.status(404).json({ error: 'Employee not found' });
    return res.status(200).json({ profile: employees[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}
