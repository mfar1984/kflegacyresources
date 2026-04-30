import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { download_id, client_name, client_email } = req.body;

    if (!download_id || !client_name || !client_email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate unique download token
    const download_token = crypto.randomBytes(32).toString('hex');

    // Get client IP and user agent
    const ip_address = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
      req.socket.remoteAddress || 
      'unknown';
    const user_agent = req.headers['user-agent'] || 'unknown';

    // Insert download log with token
    await db.query(
      `INSERT INTO download_logs 
       (download_id, client_name, client_email, download_token, ip_address, user_agent, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [download_id, client_name, client_email, download_token, ip_address, user_agent]
    );

    res.status(200).json({ download_token });
  } catch (error) {
    console.error('Error generating download token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

