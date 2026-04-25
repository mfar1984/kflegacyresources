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

  // Build WHERE clause - refunded AND pending refund orders
  const whereParts: string[] = ['(o.status = "refunded" OR o.status = "refund_pending")'];
  const whereParams: (string | number)[] = [];

  if (normalizedSearch) {
    whereParts.push(`(o.reference LIKE ? OR o.customer_first_name LIKE ? OR o.customer_last_name LIKE ? OR o.customer_email LIKE ?)`);
    const like = `%${normalizedSearch}%`;
    whereParams.push(like, like, like, like);
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

  // Get total count - using safeQuery
  const totalRows = await safeQuery<Array<{ total: number }>>(
    `SELECT COUNT(*) AS total FROM orders o ${whereSql}`,
    whereParams.length > 0 ? whereParams : undefined
  );
  const total = totalRows?.[0]?.total ?? 0;

  // Get refunds - using safeQuery
  const baseParams = [...whereParams];
  const refunds = await safeQuery(
    `SELECT 
      o.id,
      o.reference,
      o.chip_payment_id,
      o.customer_first_name,
      o.customer_last_name,
      o.customer_email,
      o.customer_phone,
      o.customer_address,
      o.customer_city,
      o.customer_state,
      o.customer_postcode,
      o.customer_country,
      o.customer_bank_account,
      o.customer_bank_code,
      o.customer_bank_holder_name,
      o.total_amount,
      o.refund_amount,
      o.currency,
      o.payment_method,
      o.status,
      o.created_at,
      o.paid_at,
      o.updated_at,
      o.notes
    FROM orders o
    ${whereSql}
    ORDER BY o.updated_at DESC
    LIMIT ? OFFSET ?`,
    baseParams.length > 0 ? [...baseParams, size, offset] : [size, offset]
  );

  return res.status(200).json({
    success: true,
    refunds,
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

