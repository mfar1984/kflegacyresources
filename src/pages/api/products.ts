import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import type { DbQueryResults } from '@/types/database';

/**
 * Public API: Get Products
 * Used by frontend /store page to fetch products
 * 
 * Query params:
 * - category: Filter by category slug (optional)
 * - search: Search in product name/description (optional)
 * - status: Filter by status (default: 'active')
 * - sort: Sort order (newest, price_asc, price_desc, name_asc, name_desc)
 * - limit: Products per page (default: 12)
 * - offset: Pagination offset (default: 0)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      category,
      search,
      status = 'active',
      sort = 'newest',
      limit = '12',
      offset = '0'
    } = req.query;

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    // Base query
    let sql = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.price,
        p.compare_price,
        p.currency,
        p.sku,
        p.stock_quantity,
        p.track_inventory,
        p.images,
        p.featured_image,
        p.tags,
        p.status,
        p.brand,
        p.vendor,
        p.created_at,
        GROUP_CONCAT(c.name SEPARATOR ', ') as category_names,
        GROUP_CONCAT(c.slug SEPARATOR ',') as category_slugs
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.status = ?
    `;

    const params: (string | number)[] = [status as string];

    // Filter by category if provided
    if (category && category !== 'all') {
      sql += ` AND c.slug = ?`;
      params.push(category as string);
    }

    // Search filter
    if (search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Group by product
    sql += ` GROUP BY p.id`;

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY p.price DESC`;
        break;
      case 'name_asc':
        sql += ` ORDER BY p.name ASC`;
        break;
      case 'name_desc':
        sql += ` ORDER BY p.name DESC`;
        break;
      case 'newest':
      default:
        sql += ` ORDER BY p.created_at DESC`;
        break;
    }

    // Pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offsetNum);

    // Execute query
    const products = await query(sql, params) as DbQueryResults;

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.status = ?
    `;

    const countParams: (string | number)[] = [status as string];

    if (category && category !== 'all') {
      countSql += ` AND c.slug = ?`;
      countParams.push(category as string);
    }

    if (search) {
      countSql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const countResult = await query(countSql, countParams) as DbQueryResults;
    const total = (countResult[0]?.total as number) || 0;

    // Parse JSON fields with error handling
    const parsedProducts = products.map(product => {
      let images = [];
      let tags = [];
      
      // Parse images
      try {
        images = product.images ? JSON.parse(product.images as string) : [];
      } catch (e) {
        console.error(`Invalid JSON in images for product ${product.id}:`, product.images);
        images = [];
      }
      
      // Parse tags
      try {
        tags = product.tags ? JSON.parse(product.tags as string) : [];
      } catch (e) {
        console.error(`Invalid JSON in tags for product ${product.id}:`, product.tags);
        // If it's comma-separated text, convert to array
        if (typeof product.tags === 'string' && product.tags.trim()) {
          tags = product.tags.split(',').map(t => t.trim()).filter(t => t);
        } else {
          tags = [];
        }
      }
      
      return {
        ...product,
        images,
        tags,
        category_slugs: product.category_slugs ? (product.category_slugs as string).split(',') : []
      };
    });

    return res.status(200).json({
      success: true,
      products: parsedProducts,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(total / limitNum),
        currentPage: Math.floor(offsetNum / limitNum) + 1
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

