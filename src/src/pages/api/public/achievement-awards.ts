import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { securePublicAPI } from '@/lib/api-security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware
  const security = await securePublicAPI(req, res, {
    requireToken: false, // Public website access
    checkCORS: true,
    checkRateLimit: true,
    maxRequestsPerHour: 300,
  });

  if (!security.allowed) {
    return; // Response already sent by middleware
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, award_name, category, issuer, file_type, file_size, description, view_hash FROM achievement_awards WHERE is_active = 1 ORDER BY created_at DESC'
    );
    res.status(200).json({ awards: rows });
  } catch (error) {
    console.error('Error fetching awards:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

