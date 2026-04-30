import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { application_id, employee_id } = req.body;

  if (session.employee_id !== parseInt(employee_id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Check if application belongs to employee and is pending
    const [apps] = await pool.query<RowDataPacket[]>(
      'SELECT status FROM leave_applications WHERE id = ? AND employee_id = ?',
      [application_id, employee_id]
    );

    if (!apps || apps.length === 0) {
      return res.status(404).json({ error: 'Leave application not found' });
    }

    if (apps[0].status !== 'pending') {
      return res.status(400).json({ error: 'Only pending applications can be cancelled' });
    }

    // Update status to cancelled
    await pool.query<ResultSetHeader>(
      'UPDATE leave_applications SET status = ? WHERE id = ?',
      ['cancelled', application_id]
    );

    return res.status(200).json({ message: 'Leave application cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling leave:', error);
    return res.status(500).json({ error: 'Failed to cancel leave application' });
  }
}

