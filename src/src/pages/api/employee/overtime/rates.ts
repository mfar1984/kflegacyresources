import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const session = sessions[0];
  if (new Date(session.expires_at) < new Date()) return null;
  if (session.user_type !== 'employee') return null;
  return session;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [rates] = await pool.query<RowDataPacket[]>(
      'SELECT id, code, name as overtime_type, rate_multiplier FROM overtime_rates WHERE status = ? ORDER BY rate_multiplier',
      ['active']
    );

    return res.status(200).json({ rates });
  } catch (error) {
    console.error('Error fetching overtime rates:', error);
    return res.status(500).json({ error: 'Failed to fetch overtime rates' });
  }
}

