import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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

    // Build WHERE clause - only orders with chip_payment_id
    const whereParts: string[] = ['o.chip_payment_id IS NOT NULL', 'o.chip_payment_id != ""'];
    const whereParams: (string | number)[] = [];

    if (normalizedSearch) {
      whereParts.push(`(o.chip_payment_id LIKE ? OR o.reference LIKE ? OR o.customer_email LIKE ?)`);
      const like = `%${normalizedSearch}%`;
      whereParams.push(like, like, like);
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

    // Get total count
    const totalRows = await query(
      `SELECT COUNT(*) AS total FROM orders o ${whereSql}`,
      whereParams
    ) as Array<{ total: number }>;
    const total = totalRows?.[0]?.total ?? 0;

    // Get transactions
    const baseParams = [...whereParams];
    const transactions = await query(
      `SELECT 
        o.id,
        o.reference,
        o.chip_payment_id AS transaction_id,
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
        o.status,
        o.total_amount,
        o.refund_amount,
        o.currency,
        o.payment_method,
        o.created_at,
        o.paid_at,
        o.updated_at,
        o.notes
      FROM orders o
      ${whereSql}
      ORDER BY o.created_at DESC
      LIMIT ${size} OFFSET ${offset}`,
      baseParams
    );

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page: currentPage,
        pageSize: size,
        total,
        totalPages: Math.ceil(total / size)
      }
    });

  } catch (error) {
    console.error('Failed to fetch CHIP transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

