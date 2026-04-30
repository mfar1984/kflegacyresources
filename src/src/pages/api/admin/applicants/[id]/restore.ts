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
  const { hash, id } = req.query;

  // Verify session
  const isValid = await verifySessionFromDB(hash as string);
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const applicantId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  if (!applicantId) {
    return res.status(400).json({ error: 'Invalid applicant ID' });
  }

  if (req.method === 'POST') {
    try {
      await query(
        'UPDATE career_applicants SET status = ?, archived_at = NULL WHERE id = ?',
        ['pending', applicantId]
      );

      res.status(200).json({ success: true, message: 'Applicant restored successfully' });
    } catch (error) {
      console.error('Restore applicant error:', error);
      res.status(500).json({ error: 'Failed to restore applicant' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

