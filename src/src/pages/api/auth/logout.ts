import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hash } = req.body as { hash?: string };

    if (!hash) {
      return res.status(400).json({ message: 'Session hash is required' });
    }

    // In production: delete from DB/Redis. Here, session will naturally expire (24h) as per login.ts
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


