import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import type { DbQueryResults } from '@/types/database';
import { categoryCache } from '@/lib/cache';

/**
 * Admin API: Categories CRUD
 * GET: List all categories
 * POST: Create new category
 * PUT: Update category
 * DELETE: Delete category
 * 
 * Cache invalidation: All write operations (POST, PUT, DELETE) invalidate the category cache
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: Add authentication check here

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET: List categories
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const categories = await query(
      `SELECT 
        c.*,
        COUNT(DISTINCT pc.product_id) as product_count
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      LEFT JOIN products p ON pc.product_id = p.id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC`
    ) as DbQueryResults;

    return res.status(200).json({
      success: true,
      categories
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

// POST: Create category
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      name,
      slug,
      description,
      icon,
      image,
      parent_id,
      sort_order = 0,
      status = 'active',
      seo_title,
      seo_description
    } = req.body;

    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    // Check if slug already exists
    const existing = await query(
      `SELECT id FROM categories WHERE slug = ?`,
      [slug]
    ) as DbQueryResults;

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists'
      });
    }

    // Insert category
    const result = await query(
      `INSERT INTO categories (
        name, slug, description, icon, image, parent_id, sort_order, status, seo_title, seo_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, icon, image, parent_id, sort_order, status, seo_title, seo_description]
    ) as DbQueryResults & { insertId?: number };

    // Invalidate category cache
    categoryCache.invalidatePattern(/^categories:/);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      categoryId: result.insertId
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// PUT: Update category
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      id,
      name,
      slug,
      description,
      icon,
      image,
      parent_id,
      sort_order,
      status,
      seo_title,
      seo_description
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    // Check if category exists
    const existing = await query(
      `SELECT id FROM categories WHERE id = ?`,
      [id]
    ) as DbQueryResults;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if slug is taken by another category
    if (slug) {
      const slugCheck = await query(
        `SELECT id FROM categories WHERE slug = ? AND id != ?`,
        [slug, id]
      ) as DbQueryResults;

      if (slugCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Slug is already taken by another category'
        });
      }
    }

    // Update category
    await query(
      `UPDATE categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = ?,
        icon = ?,
        image = ?,
        parent_id = ?,
        sort_order = COALESCE(?, sort_order),
        status = COALESCE(?, status),
        seo_title = ?,
        seo_description = ?
      WHERE id = ?`,
      [name, slug, description, icon, image, parent_id, sort_order, status, seo_title, seo_description, id]
    );

    // Invalidate category cache
    categoryCache.invalidatePattern(/^categories:/);

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// DELETE: Delete category
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    // Check if category exists
    const existing = await query(
      `SELECT id FROM categories WHERE id = ?`,
      [id]
    ) as DbQueryResults;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const products = await query(
      `SELECT COUNT(*) as count FROM product_categories WHERE category_id = ?`,
      [id]
    ) as DbQueryResults;

    if (products[0] && (products[0].count as number) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated products. Please reassign or delete the products first.'
      });
    }

    // Delete category
    await query(
      `DELETE FROM categories WHERE id = ?`,
      [id]
    );

    // Invalidate category cache
    categoryCache.invalidatePattern(/^categories:/);

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

