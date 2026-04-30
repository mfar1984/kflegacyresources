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
    // Fetch only published news articles, ordered by published_date
    const articles = await query(
      `SELECT 
        id, title, slug, excerpt, author, category, 
        featured_image, read_time, published_date, created_at
      FROM news_articles 
      WHERE status = 'published'
      ORDER BY published_date DESC, created_at DESC`,
      []
    );

    res.status(200).json(articles);
  } catch (error) {
    console.error('News API error:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
}

