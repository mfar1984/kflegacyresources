import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling } from '@/lib/api-error-handler';
import { safeQuery } from '@/lib/db-safe-query';
import { withTimeout } from '@/lib/request-timeout';
import { withDefaultCompression } from '@/lib/compression';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Query params for pagination and filtering
  const { page, pageSize, search, status, from, to } = req.query;

  const currentPage = Math.max(parseInt(Array.isArray(page) ? page[0] : page || '1', 10) || 1, 1);
  const size = Math.min(
    Math.max(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize || '10', 10) || 10, 1),
    100
  );
  const offset = (currentPage - 1) * size;

  const normalizedSearch = (Array.isArray(search) ? search[0] : search || '').trim();
  const normalizedStatus = (Array.isArray(status) ? status[0] : status || '').trim();
  const fromDate = (Array.isArray(from) ? from[0] : from || '').trim();
  const toDate = (Array.isArray(to) ? to[0] : to || '').trim();

  // Build WHERE clause safely with parameters
  const whereParts: string[] = [];
  const whereParams: (string | number)[] = [];

  if (normalizedSearch) {
    whereParts.push(`(o.reference LIKE ? OR o.customer_first_name LIKE ? OR o.customer_last_name LIKE ? OR o.customer_email LIKE ?)`);
    const like = `%${normalizedSearch}%`;
    whereParams.push(like, like, like, like);
  }

  if (normalizedStatus) {
    whereParts.push(`o.status = ?`);
    whereParams.push(normalizedStatus);
  }

  if (fromDate) {
    whereParts.push(`o.created_at >= ?`);
    whereParams.push(`${fromDate} 00:00:00`);
  }

  if (toDate) {
    whereParts.push(`o.created_at <= ?`);
    whereParams.push(`${toDate} 23:59:59`);
  }

  const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

  // Total count for pagination - using safeQuery
  const totalRows = await safeQuery<Array<{ total: number }>>(
    `SELECT COUNT(*) AS total FROM orders o ${whereSql}`,
    whereParams.length > 0 ? whereParams : undefined
  );
  const total = totalRows?.[0]?.total ?? 0;

  // Fetch paginated orders with aggregated items - using safeQuery
  const baseParams = [...whereParams];
  const rows = await safeQuery<Array<Record<string, unknown>>>(
    `SELECT 
      o.*,
      COALESCE(JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'product_price', oi.product_price,
          'quantity', oi.quantity,
          'selected_options', oi.selected_options,
          'subtotal', oi.subtotal
        )
      ), JSON_ARRAY()) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${whereSql}
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?`,
    baseParams.length > 0 ? [...baseParams, size, offset] : [size, offset]
  );

  const ordersWithItems = rows.map((order) => ({
    ...order,
    items: typeof order.items === 'string'
      ? (order.items ? JSON.parse(order.items as string) : [])
      : (order.items || [])
  }));

  return res.status(200).json({
    success: true,
    orders: ordersWithItems,
    pagination: {
      page: currentPage,
      pageSize: size,
      total,
      totalPages: Math.ceil(total / size)
    }
  });
}

// Apply middleware: error handling, timeout, and compression
export default withDefaultCompression(withTimeout(withErrorHandling(handler)));

