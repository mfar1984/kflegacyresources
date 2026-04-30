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
  
  if (!session || session.employee_id !== parseInt(employee_id as string)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [claims] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, ct.name as claim_type, 
       CONCAT(approver.full_name) as approved_by_name,
       (SELECT COUNT(*) FROM claim_items WHERE claim_id = c.id) as items_count
       FROM claims c
       JOIN claim_types ct ON c.claim_type_id = ct.id
       LEFT JOIN employees approver ON c.reviewed_by = approver.id
       WHERE c.employee_id = ?
       ORDER BY c.created_at DESC`,
      [employee_id]
    );

    return res.status(200).json({ claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return res.status(500).json({ error: 'Failed to fetch claims' });
  }
}

