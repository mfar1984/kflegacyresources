import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const session = sessions[0];
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Check if employee has a login account
    const [admins] = await pool.query<RowDataPacket[]>(
      'SELECT username, status, last_login FROM admins WHERE employee_id = ? AND user_type = "employee"',
      [id]
    );

    if (!admins || admins.length === 0) {
      return res.status(200).json({ loginAccount: null });
    }

    return res.status(200).json({ 
      loginAccount: {
        username: admins[0].username,
        status: admins[0].status,
        last_login: admins[0].last_login
      }
    });
  } catch (error) {
    console.error('Fetch login status error:', error);
    return res.status(500).json({ error: 'Failed to fetch login status' });
  }
}

