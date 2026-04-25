import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import type { DbQueryResults } from '@/types/database';
import { categoryCache } from '@/lib/cache';
import { withDefaultTimeout } from '@/lib/request-timeout';

/**
 * Public API: Get Categories
 * Used by frontend /store page for category filter buttons
 * 
 * Caching: Categories are cached with 5 minute TTL (configured in cache.ts as 10 minutes default)
 * Cache is invalidated when categories are created, updated, or deleted
 * 
 * Timeout: 30 seconds (default), logs slow requests >5 seconds
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { status = 'active' } = req.query;
    const cacheKey = `categories:${status}`;

    // Try to get from cache
    const cached = categoryCache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        categories: cached,
        cached: true
      });
    }

    // Get all active categories with product count
    const categories = await query(
      `SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.icon,
        c.image,
        c.parent_id,
        c.sort_order,
        c.status,
        COUNT(DISTINCT pc.product_id) as product_count
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      LEFT JOIN products p ON pc.product_id = p.id AND p.status = 'active'
      WHERE c.status = ?
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC`,
      [status]
    ) as DbQueryResults;

    // Cache the result with 5 minute TTL
    categoryCache.set(cacheKey, categories, 5 * 60 * 1000);

    return res.status(200).json({
      success: true,
      categories,
      cached: false
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Export handler wrapped with timeout middleware
export default withDefaultTimeout(handler);
