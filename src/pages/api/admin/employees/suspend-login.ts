import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { employee_id, action } = req.body;

    if (!employee_id || !action || !['suspend', 'activate'].includes(action)) {
      return res.status(400).json({ error: 'Employee ID and valid action (suspend/activate) are required' });
    }

    // Check if employee has a login account
    const [admins] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, status FROM admins WHERE employee_id = ? AND user_type = "employee"',
      [employee_id]
    );

    if (!admins || admins.length === 0) {
      return res.status(404).json({ error: 'No login account found for this employee' });
    }

    const admin = admins[0];
    const newStatus = action === 'suspend' ? 'suspended' : 'active';

    // Update account status
    await pool.query<ResultSetHeader>(
      'UPDATE admins SET status = ? WHERE id = ?',
      [newStatus, admin.id]
    );

    // If suspending, delete all active sessions
    if (action === 'suspend') {
      await pool.query<ResultSetHeader>(
        'DELETE FROM admin_sessions WHERE username = ?',
        [admin.username]
      );
    }

    return res.status(200).json({ 
      message: action === 'suspend' 
        ? 'Login account suspended. All active sessions have been logged out.'
        : 'Login account activated successfully.',
      status: newStatus
    });
  } catch (error) {
    console.error('Suspend/Activate login error:', error);
    return res.status(500).json({ error: 'Failed to update login account status' });
  }
}

