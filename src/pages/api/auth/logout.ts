import { NextApiRequest, NextApiResponse } from 'next';

// Import the sessions map (in production, use shared storage)
// For now, we'll just return success as sessions are managed in login.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hash } = req.body;

    if (!hash) {
      return res.status(400).json({ message: 'Session hash is required' });
    }

    // In production, delete the session from database/Redis
    // For now, we'll just return success
    // The session will expire after 24 hours automatically

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

