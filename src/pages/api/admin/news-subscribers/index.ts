import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify session
  const sessions = await query(
    'SELECT username FROM admin_sessions WHERE hash = ? AND expires_at > NOW()',
    [hash]
  );

  if (!Array.isArray(sessions) || sessions.length === 0) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  if (req.method === 'GET') {
    try {
      const subscribers = await query(
        `SELECT
          id,
          full_name,
          email,
          ip_address,
          user_agent,
          is_active,
          subscribed_at,
          unsubscribed_at
        FROM newsletter_subscribers
        ORDER BY subscribed_at DESC`
      );

      return res.status(200).json({ subscribers });
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      return res.status(500).json({ message: 'Failed to fetch subscribers' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

