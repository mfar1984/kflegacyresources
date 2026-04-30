import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

async function verifySessionFromDB(hash: string): Promise<boolean> {
  try {
    const rows = await query(
      'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
      [hash]
    ) as { username: string; expires_at: string }[];
    
    if (rows && rows.length > 0) {
      const expires = new Date(rows[0].expires_at);
      return expires > new Date();
    }
    return false;
  } catch (err) {
    console.error('Session verification error:', err);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash, status } = req.query;

  // Verify session
  const isValid = await verifySessionFromDB(hash as string);
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      let sql = 'SELECT * FROM procurement_applications WHERE 1=1';
      const params: any[] = [];

      // Filter by status
      if (status && status !== 'all') {
        sql += ' AND status = ?';
        params.push(status);
      }

      sql += ' ORDER BY submitted_at DESC';

      const applications = await query(sql, params) as any[];
      return res.status(200).json(applications);
    } catch (error) {
      console.error('Error fetching procurement applications:', error);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

