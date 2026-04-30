import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { securePublicAPI } from '@/lib/api-security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware
  const security = await securePublicAPI(req, res, {
    requireToken: false, // Public website access
    checkCORS: true,
    checkRateLimit: true,
    maxRequestsPerHour: 500,
  });

  if (!security.allowed) {
    return; // Response already sent by middleware
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Fetch all projects from database (public access, no auth required)
    const projects = await query(`
      SELECT 
        id,
        title,
        client,
        sector,
        category,
        year,
        location,
        value,
        status,
        created_at
      FROM projects
      ORDER BY year DESC, created_at DESC
    `) as Array<{
      id: number;
      title: string;
      client: string;
      sector: string;
      category: string;
      year: number;
      location: string;
      value: string;
      status: string;
      created_at: string;
    }>;

    return res.status(200).json({
      success: true,
      projects: projects || [],
      total: projects.length
    });

  } catch (error) {
    console.error('Public projects API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      projects: []
    });
  }
}

