import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

async function verifySession(hash: string): Promise<boolean> {
  try {
    const [rows] = await db.query(
      'SELECT expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
      [hash]
    );
    
    if ((rows as any[]).length === 0) return false;
    
    const expires = new Date((rows as any[])[0].expires_at);
    return expires > new Date();
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isValid = await verifySession(hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  try {
    const [logs] = await db.query(
      `SELECT id, client_name, client_email, ip_address, user_agent, status, downloaded_at 
       FROM download_logs 
       WHERE download_id = ? 
       ORDER BY downloaded_at DESC`,
      [id]
    );

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching download logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

