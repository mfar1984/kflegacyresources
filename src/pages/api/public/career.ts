import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { securePublicAPI } from '@/lib/api-security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware
  // Note: requireToken is false for public website access
  const security = await securePublicAPI(req, res, {
    requireToken: false,
    checkCORS: true,
    checkRateLimit: true,
    maxRequestsPerHour: 1000,
  });

  if (!security.allowed) {
    return; // Response already sent by middleware
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only fetch active postings with closing date in the future or null
    const postings = await query(
      `SELECT 
        id, title, department, location, 
        salary_min, salary_max, salary_notes,
        experience_min, experience_max, experience_level,
        job_type, employment_type, icon, icon_bg, icon_color, btn_color,
        overview, responsibilities, requirements, benefits,
        posted_date, closing_date
       FROM career_postings 
       WHERE status = 'active' 
       AND (closing_date IS NULL OR closing_date >= CURDATE())
       ORDER BY posted_date DESC`,
      []
    );

    res.status(200).json(postings);
  } catch (error) {
    console.error('Career API error:', error);
    res.status(500).json({ error: 'Failed to fetch career postings' });
  }
}

