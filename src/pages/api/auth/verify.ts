import { NextApiRequest, NextApiResponse } from 'next';
import { verifySession, getSession } from './login';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hash } = req.query;

    if (!hash || typeof hash !== 'string') {
      return res.status(400).json({ valid: false, message: 'Session hash is required' });
    }

    // First check in-memory sessions
    let isValid = verifySession(hash);
    let session = getSession(hash);

    // Fallback to DB-backed session if available
    if (!isValid) {
      const rows = await query('SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1', [hash]) as Array<{username:string; expires_at: string}>;
      if (rows && rows.length > 0) {
        const expires = new Date(rows[0].expires_at);
        if (expires > new Date()) {
          isValid = true;
          session = { username: rows[0].username, createdAt: new Date() } as { username: string; createdAt: Date };
        }
      }
    }

    if (!isValid) {
      return res.status(401).json({ valid: false, message: 'Invalid or expired session' });
    }

    return res.status(200).json({
      valid: true,
      username: session?.username,
      createdAt: session?.createdAt,
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(500).json({ valid: false, message: 'Internal server error' });
  }
}

