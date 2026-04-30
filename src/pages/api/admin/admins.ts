import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0];
  if (new Date(s.expires_at) < new Date()) return null;
  return s;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { hash } = req.query as { hash?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  try {
    // Some deployments may not have a full_name column; return username and let UI fallback
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT id, username FROM admins ORDER BY username`);
    return res.status(200).json({ admins: rows });
  } catch (e) {
    console.error('Admins list error:', e);
    return res.status(500).json({ error: 'Failed to fetch admins' });
  }
}


