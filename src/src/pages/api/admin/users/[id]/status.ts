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
  const { id } = req.query;
  const hash = req.query.hash || req.body?.hash;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const isValid = await verifySessionFromDB(hash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  const userId = parseInt(id as string, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    if (req.method === 'PATCH') {
      const { status } = req.body;

      if (!status || (status !== 'active' && status !== 'suspended')) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      await query(
        'UPDATE admins SET status = ? WHERE id = ?',
        [status, userId]
      );

      return res.status(200).json({ 
        success: true, 
        message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully` 
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Status update error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

