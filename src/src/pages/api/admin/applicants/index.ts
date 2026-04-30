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
      let sql = `
        SELECT 
          a.*,
          c.title as job_title
        FROM career_applicants a
        LEFT JOIN career_postings c ON a.career_posting_id = c.id
        WHERE a.status != 'archived'
      `;

      const params: any[] = [];

      if (status && status !== 'all') {
        sql += ' AND a.status = ?';
        params.push(status);
      }

      sql += ' ORDER BY a.submitted_at DESC';

      const applicants = await query(sql, params) as any[];
      res.status(200).json(applicants);
    } catch (error) {
      console.error('Applicants API error:', error);
      res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

