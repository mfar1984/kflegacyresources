import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash, id } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Subscriber ID is required' });
  }

  // Verify session
  const sessions = await query(
    'SELECT username FROM admin_sessions WHERE hash = ? AND expires_at > NOW()',
    [hash]
  );

  if (!Array.isArray(sessions) || sessions.length === 0) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  if (req.method === 'DELETE') {
    try {
      await query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Subscriber deleted successfully' });
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      return res.status(500).json({ message: 'Failed to delete subscriber' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

