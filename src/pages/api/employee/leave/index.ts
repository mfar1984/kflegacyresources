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

  const { hash, employee_id } = req.query;
  const session = await verifySession(hash as string);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (session.employee_id !== parseInt(employee_id as string)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const [applications] = await pool.query<RowDataPacket[]>(
      `SELECT 
        la.*,
        lt.name as leave_type,
        CONCAT(approver.full_name) as approved_by_name
      FROM leave_applications la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      LEFT JOIN employees approver ON la.reviewed_by = approver.id
      WHERE la.employee_id = ?
      ORDER BY la.created_at DESC`,
      [employee_id]
    );

    return res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching leave applications:', error);
    return res.status(500).json({ error: 'Failed to fetch leave applications' });
  }
}

