import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling } from '@/lib/api-error-handler';
import { safeQuery } from '@/lib/db-safe-query';
import { withTransaction, transactionQuery } from '@/lib/db-transaction';
import { withTimeout } from '@/lib/request-timeout';
import type { DbQueryResults } from '@/types/database';

/**
 * Admin API: Product Detail CRUD
 * GET: Get single product
 * PUT: Update product
 * DELETE: Delete product
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: Add authentication check here

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET: Get single product
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Use safeQuery for database queries
  const products = await safeQuery<DbQueryResults>(
    `SELECT 
      p.*,
      GROUP_CONCAT(DISTINCT c.id) as category_ids,
      GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as category_names
    FROM products p
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE p.id = ?
    GROUP BY p.id`,
    [id as string]
  );

  if (products.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const product = products[0];

  // Safe JSON parser
  const safeJsonParse = (value: unknown, fallback: unknown = null) => {
    if (!value || value === '') return fallback;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  // Parse JSON fields
  const parsedProduct = {
    ...product,
    images: safeJsonParse(product.images, []),
    tags: safeJsonParse(product.tags, []),
    specifications: safeJsonParse(product.specifications, null),
    features: safeJsonParse(product.features, null),
    gallery_images: safeJsonParse(product.gallery_images, []),
    key_highlights: safeJsonParse(product.key_highlights, []),
    included_items: safeJsonParse(product.included_items, []),
    category_ids: product.category_ids ? (product.category_ids as string).split(',').map((id: string) => parseInt(id)) : []
  };

  // Fetch variants
  const variants = await safeQuery<DbQueryResults>(
    `SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC`,
    [id as string]
  );

  return res.status(200).json({
    success: true,
    product: parsedProduct,
    variants: variants || []
  });
}

// PUT: Update product
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const {
    name,
    slug,
    description,
    short_description,
    price,
    compare_price,
    cost_price,
    currency,
    sku,
    barcode,
    stock_quantity,
    track_inventory,
    low_stock_threshold,
    weight,
    dimensions,
    vendor,
    brand,
    images,
    featured_image,
    tags,
    status,
    seo_title,
    seo_description,
    seo_keywords,
    specifications,
    features,
    notes,
    categories,
    // NEW EXTENDED FIELDS
    gallery_images,
    key_highlights,
    included_items,
    tab_overview,
    tab_specifications,
    tab_performance,
    tab_features,
    tab_support,
    variants
  } = req.body;

  // Check if product exists - using safeQuery
  const existing = await safeQuery<DbQueryResults>(
    `SELECT id FROM products WHERE id = ?`,
    [id as string]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if slug is taken by another product
  if (slug) {
    const slugCheck = await safeQuery<DbQueryResults>(
      `SELECT id FROM products WHERE slug = ? AND id != ?`,
      [slug, id]
    );

    if (slugCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Slug is already taken by another product'
      });
    }
  }

  // Use transaction for product update with categories and variants
  const result = await withTransaction(async (conn) => {
    // Update product
    await transactionQuery(
      conn,
      `UPDATE products SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        short_description = COALESCE(?, short_description),
        price = COALESCE(?, price),
        compare_price = ?,
        cost_price = ?,
        currency = COALESCE(?, currency),
        sku = ?,
        barcode = ?,
        stock_quantity = COALESCE(?, stock_quantity),
        track_inventory = COALESCE(?, track_inventory),
        low_stock_threshold = COALESCE(?, low_stock_threshold),
        weight = ?,
        dimensions = ?,
        vendor = ?,
        brand = ?,
        images = ?,
        featured_image = ?,
        tags = ?,
        status = COALESCE(?, status),
        seo_title = ?,
        seo_description = ?,
        seo_keywords = ?,
        specifications = ?,
        features = ?,
        notes = ?,
        gallery_images = ?,
        key_highlights = ?,
        included_items = ?,
        tab_overview = ?,
        tab_specifications = ?,
        tab_performance = ?,
        tab_features = ?,
        tab_support = ?
      WHERE id = ?`,
      [
        name, slug, description, short_description, price, compare_price, cost_price, currency,
        sku, barcode, stock_quantity, track_inventory, low_stock_threshold,
        weight, dimensions, vendor, brand,
        images ? JSON.stringify(images) : null,
        featured_image,
        tags ? JSON.stringify(tags) : null,
        status, seo_title, seo_description, seo_keywords,
        specifications ? JSON.stringify(specifications) : null,
        features ? JSON.stringify(features) : null,
        notes,
        // NEW EXTENDED FIELDS
        gallery_images ? JSON.stringify(gallery_images) : null,
        key_highlights ? JSON.stringify(key_highlights) : null,
        included_items ? JSON.stringify(included_items) : null,
        tab_overview,
        tab_specifications,
        tab_performance,
        tab_features,
        tab_support,
        id
      ]
    );

    // Update categories if provided
    if (categories !== undefined) {
      // Delete existing associations
      await transactionQuery(
        conn,
        `DELETE FROM product_categories WHERE product_id = ?`,
        [id as string]
      );

      // Insert new associations
      if (categories && categories.length > 0) {
        const categoryValues = categories.map((catId: number) => [id as string, catId]);
        await transactionQuery(
          conn,
          `INSERT INTO product_categories (product_id, category_id) VALUES ?`,
          [categoryValues]
        );
      }
    }

    // Update variants if provided
    if (variants !== undefined) {
      // Delete existing variants
      await transactionQuery(
        conn,
        `DELETE FROM product_variants WHERE product_id = ?`,
        [id as string]
      );

      // Insert new variants
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          await transactionQuery(
            conn,
            `INSERT INTO product_variants (
              product_id, option1_name, option1_value, option2_name, option2_value,
              option3_name, option3_value, sku, price, compare_price, stock_quantity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              variant.option1_name || null,
              variant.option1_value || null,
              variant.option2_name || null,
              variant.option2_value || null,
              variant.option3_name || null,
              variant.option3_value || null,
              variant.sku || null,
              variant.price || 0,
              variant.compare_price || null,
              variant.stock_quantity || 0,
            ]
          );
        }
      }
    }

    return true;
  });

  if (!result.success) {
    throw result.error;
  }

  return res.status(200).json({
    success: true,
    message: 'Product updated successfully'
  });
}

// DELETE: Delete product
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Check if product exists - using safeQuery
  const existing = await safeQuery<DbQueryResults>(
    `SELECT id FROM products WHERE id = ?`,
    [id as string]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Delete product (categories and variants will be deleted via CASCADE) - using safeQuery
  await safeQuery(
    `DELETE FROM products WHERE id = ?`,
    [id as string]
  );

  return res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
}

// Apply middleware: error handling and timeout
export default withTimeout(withErrorHandling(handler));

