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

  const { page, pageSize, search, from, to } = req.query;

  const currentPage = Math.max(parseInt(Array.isArray(page) ? page[0] : page || '1', 10) || 1, 1);
  const size = Math.min(
    Math.max(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize || '10', 10) || 10, 1),
    100
  );
  const offset = (currentPage - 1) * size;

  const normalizedSearch = (Array.isArray(search) ? search[0] : search || '').trim();
  const fromDate = (Array.isArray(from) ? from[0] : from || '').trim();
  const toDate = (Array.isArray(to) ? to[0] : to || '').trim();

  const whereParts: string[] = [];
  const whereParams: (string | number)[] = [];

  if (normalizedSearch) {
    const like = `%${normalizedSearch}%`;
    whereParts.push(`(o.customer_first_name LIKE ? OR o.customer_last_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ? OR o.customer_city LIKE ?)`);
    whereParams.push(like, like, like, like, like);
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

  // Total unique customers (by email) - using safeQuery
  const totalRows = await safeQuery<Array<{ total: number }>>(
    `SELECT COUNT(DISTINCT o.customer_email) AS total FROM orders o ${whereSql}`,
    whereParams.length > 0 ? whereParams : undefined
  );
  const total = totalRows?.[0]?.total ?? 0;

  // Fetch grouped customers - using safeQuery
  const baseParams = [...whereParams];
  const rows = await safeQuery(
    `SELECT 
      o.customer_email AS email,
      MAX(o.customer_first_name) AS first_name,
      MAX(o.customer_last_name) AS last_name,
      MAX(o.customer_phone) AS phone,
      MAX(o.customer_city) AS city,
      MAX(o.customer_country) AS country,
      COUNT(*) AS total_orders,
      SUM(CASE WHEN o.status = 'paid' THEN 1 ELSE 0 END) AS paid_orders,
      COALESCE(SUM(CASE WHEN o.status = 'paid' THEN o.total_amount ELSE 0 END), 0) AS total_spent,
      MAX(o.created_at) AS last_order_created_at
    FROM orders o
    ${whereSql}
    GROUP BY o.customer_email
    ORDER BY last_order_created_at DESC
    LIMIT ? OFFSET ?`,
    baseParams.length > 0 ? [...baseParams, size, offset] : [size, offset]
  );

  return res.status(200).json({
    success: true,
    customers: rows,
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


