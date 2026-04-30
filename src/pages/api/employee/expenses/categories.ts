import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  if (new Date(sessions[0].expires_at) < new Date()) return null;
  if (sessions[0].user_type !== 'employee') return null;
  return sessions[0];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const session = await verifySession(req.query.hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const [categories] = await pool.query<RowDataPacket[]>(
      'SELECT id, code, name as category FROM expense_categories WHERE status = ? ORDER BY name',
      ['active']
    );
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
