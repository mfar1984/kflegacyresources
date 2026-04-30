import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

async function verifyEmployeeSession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0];
  if (new Date(s.expires_at) < new Date()) return null;
  if (s.user_type !== 'employee') return null;
  return s;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { hash } = req.query as { hash?: string };
  const session = await verifyEmployeeSession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  // Disable employee submit (admin-driven review only)
  return res.status(403).json({ error: 'Employee submission is disabled. HR/admin will manage reviews.' });
}


